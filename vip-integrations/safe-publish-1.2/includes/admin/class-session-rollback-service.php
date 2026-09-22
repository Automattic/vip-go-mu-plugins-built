<?php
/**
 * Session Rollback Service class for handling import rollback operations
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Content\Shortcode_ID_Rewriter;
use Safe_Publish\Utils\Options;
use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Session Rollback Service Class.
 *
 * Handles rollback operations for individual import items.
 */
final class Session_Rollback_Service {

	/**
	 * Posts read per page when scanning content for media references.
	 */
	private const SCAN_PAGE_SIZE = 500;

	/**
	 * History repository instance.
	 *
	 * @var History_Repository
	 */
	private History_Repository $repository;

	/**
	 * Constructor.
	 *
	 * @param History_Repository $repository History repository instance.
	 */
	public function __construct( History_Repository $repository ) {
		$this->repository = $repository;
	}

	/**
	 * Rolls back a single import item.
	 *
	 * @param int $item_id Item ID to roll back.
	 * @return array{action: string, post_id: int, post_title: string, omissions: array}|WP_Error Rollback result or error.
	 */
	public function rollback_item( int $item_id ): array|WP_Error {
		$item = $this->repository->get_item( $item_id );

		if ( ! $item ) {
			return new WP_Error(
				'item_not_found',
				__( 'Import item not found', 'safe-publish' )
			);
		}

		// Replaying would write this row's snapshot over newer content.
		if ( 1 === (int) $item['rolled_back'] ) {
			return new WP_Error(
				'item_already_rolled_back',
				__(
					'This import was already rolled back. Reload the list.',
					'safe-publish'
				)
			);
		}

		$result = $this->rollback_item_row( $item );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// A failed flag write leaves the revert unrecorded; don't claim success.
		if ( ! $this->repository->mark_item_rolled_back( $item_id, $result['omissions'] ) ) {
			return new WP_Error(
				'rollback_not_recorded',
				__(
					'The rollback was applied, but it could not be recorded. Reload the list before rolling back again.',
					'safe-publish'
				)
			);
		}

		return $result;
	}

	/**
	 * Rolls back a single item row (internal helper).
	 *
	 * @param array $item Item row.
	 * @return array{action: string, post_id: int, post_title: string, omissions: array}|WP_Error Rollback result or error.
	 */
	private function rollback_item_row( array $item ): array|WP_Error {
		$post_id = isset( $item['post_id'] ) ? (int) $item['post_id'] : 0;
		$status  = (string) $item['status'];
		$changes = History_Repository::decode_item_changes(
			$item['content_changes']
		);

		if ( $post_id <= 0 ) {
			return new WP_Error(
				'no_post_id',
				__( 'No post ID found for this item', 'safe-publish' )
			);
		}

		$post = get_post( $post_id );
		if ( ! $post ) {
			return new WP_Error(
				'post_not_found',
				__( 'The post no longer exists', 'safe-publish' )
			);
		}

		if ( 'success' === $status ) {
			return $this->delete_new_post( $post_id, $post->post_title );
		}

		if ( 'updated' === $status && is_array( $changes ) && isset( $changes['previous_content'] ) ) {
			return $this->restore_previous_version( $post_id, $post->post_title, $changes );
		}

		if ( 'updated' === $status ) {
			// No previous content stored: Just delete the post.
			return $this->delete_new_post( $post_id, $post->post_title );
		}

		return new WP_Error(
			'unsupported_status',
			__(
				'Cannot roll back this item because it was not imported successfully',
				'safe-publish'
			)
		);
	}

	/**
	 * Deletes a newly created post.
	 *
	 * @param int    $post_id    Post ID to delete.
	 * @param string $post_title Post title for response.
	 * @return array{action: string, post_id: int, post_title: string, omissions: array}|WP_Error Result or error.
	 */
	private function delete_new_post( int $post_id, string $post_title ): array|WP_Error {
		// Capture the media this post owns before the delete unlinks it.
		$imported_media_ids = $this->imported_media_ids_for_parent( $post_id );

		if ( ! wp_delete_post( $post_id, true ) ) {
			return new WP_Error(
				'delete_failed',
				__( 'Failed to delete the post.', 'safe-publish' )
			);
		}

		$omissions  = array();
		$referenced = $this->referenced_attachment_ids( $imported_media_ids );

		foreach ( $imported_media_ids as $attachment_id ) {
			// A check that could not answer withholds every deletion, since one
			// failed scan covered the whole batch.
			if ( null === $referenced ) {
				$omissions[] = array(
					'field'         => 'media',
					'reason'        => 'usage_check_failed',
					'attachment_id' => $attachment_id,
				);
				continue;
			}

			// A surviving post may still show media parented here, since import
			// deduplicates by source URL; skip those and delete only what this
			// post solely owns.
			if ( in_array( $attachment_id, $referenced, true ) ) {
				continue;
			}

			// Defer to the site's MEDIA_TRASH setting rather than forcing, so
			// a wrong deletion stays recoverable where media trash is on.
			wp_delete_attachment( $attachment_id, false );
		}

		return array(
			'action'     => 'deleted',
			'post_id'    => $post_id,
			'post_title' => $post_title,
			'omissions'  => $omissions,
		);
	}

	/**
	 * Returns the plugin-imported attachments a post owns.
	 *
	 * Ownership follows the parent regardless of the sideloading session; the
	 * import-origin meta guard spares a user's own attachments parented here.
	 *
	 * @param int $post_id Post being rolled back.
	 * @return int[] Owned, import-created attachment IDs.
	 */
	private function imported_media_ids_for_parent( int $post_id ): array {
		$ids = get_posts(
			array(
				'post_type'        => 'attachment',
				'post_status'      => 'any',
				'post_parent'      => $post_id,
				// TODO: Paginate without leaving owned attachments behind.
				// phpcs:ignore WordPressVIPMinimum.Performance.NoPaging
				'posts_per_page'   => -1,
				'fields'           => 'ids',
				'suppress_filters' => false,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'       => array(
					'relation' => 'OR',
					array(
						'key'     => Options::META_ORIGINAL_URL,
						'compare' => 'EXISTS',
					),
					array(
						'key'     => Options::META_IMPORTED_FROM,
						'compare' => 'EXISTS',
					),
				),
			)
		);

		return array_map( 'intval', $ids );
	}

	/**
	 * Returns which of the attachments a surviving post still shows, across the
	 * three ways an import can make a post reference one: Inline in content,
	 * as a featured image, or by ID in a gallery or playlist shortcode.
	 *
	 * Checks span trashed and hidden holders. Each runs once for the whole
	 * batch, since per-attachment queries would scan the posts table once per
	 * attachment. One that cannot answer withholds every deletion.
	 *
	 * @param int[] $attachment_ids Attachments considered for deletion.
	 * @return int[]|null Referenced attachment IDs, null when a check could not
	 *                    answer.
	 */
	private function referenced_attachment_ids( array $attachment_ids ): ?array {
		if ( array() === $attachment_ids ) {
			return array();
		}

		$featured = $this->featured_image_attachment_ids( $attachment_ids );
		$inlined  = $this->inlined_attachment_ids( $attachment_ids );
		$listed   = $this->shortcode_attachment_ids();

		if ( null === $featured || null === $inlined || null === $listed ) {
			return null;
		}

		return array_values(
			array_unique(
				array_merge(
					$featured,
					$inlined,
					array_intersect( $listed, $attachment_ids )
				)
			)
		);
	}

	/**
	 * Returns which of the attachments a post uses as its featured image.
	 *
	 * Direct query: WP_Query's 'any' drops exclude_from_search types and
	 * statuses, and a posts_where filter narrowing the result would read as
	 * unreferenced. Auto-drafts are excluded as abandoned editor sessions.
	 *
	 * @param int[] $attachment_ids Attachment IDs.
	 * @return int[]|null Attachment IDs a post's thumbnail points at, null when
	 *                    the query failed.
	 */
	private function featured_image_attachment_ids( array $attachment_ids ): ?array {
		global $wpdb;

		$placeholders = implode( ', ', array_fill( 0, count( $attachment_ids ), '%s' ) );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare
		$values = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT meta.meta_value FROM {$wpdb->postmeta} AS meta
				 INNER JOIN {$wpdb->posts} AS posts ON posts.ID = meta.post_id
				 WHERE meta.meta_key = '_thumbnail_id'
					 AND meta.meta_value IN ( {$placeholders} )
					 AND posts.post_status <> 'auto-draft'",
				array_map( 'strval', $attachment_ids )
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

		if ( '' !== $wpdb->last_error ) {
			return null;
		}

		return array_map( 'intval', $values );
	}

	/**
	 * Returns which of the attachments a post's content references by file,
	 * sized variants included, by matching the upload-relative path stem.
	 *
	 * @param int[] $attachment_ids Attachment IDs.
	 * @return int[]|null Attachment IDs a post's content contains, null when the
	 *                    query failed.
	 */
	private function inlined_attachment_ids( array $attachment_ids ): ?array {
		$stems = array();

		foreach ( $attachment_ids as $attachment_id ) {
			$file = get_post_meta( $attachment_id, '_wp_attached_file', true );

			if ( ! is_string( $file ) || '' === $file ) {
				continue;
			}

			// Drop the extension so sized variants (image-300x200.jpg) match too.
			$stem = preg_replace( '/\.[^.\/]+$/', '', $file );

			if ( is_string( $stem ) && '' !== $stem ) {
				$stems[ $attachment_id ] = $stem;
			}
		}

		if ( array() === $stems ) {
			return array();
		}

		global $wpdb;

		// Matched on the upload directory rather than the full stem: the
		// predicate count drives the scan cost, and a stem cannot appear
		// without its directory. The exact stems are matched in PHP below.
		$prefixes = array();

		foreach ( $stems as $stem ) {
			$slash               = strrpos( $stem, '/' );
			$prefix              = false === $slash ? $stem : substr( $stem, 0, $slash + 1 );
			$prefixes[ $prefix ] = true;
		}

		$clauses = array_fill( 0, count( $prefixes ), 'post_content LIKE %s' );
		$likes   = array_map(
			static fn ( string $prefix ): string => '%' . $wpdb->esc_like( $prefix ) . '%',
			array_keys( $prefixes )
		);

		$used = array();

		$completed = $this->scan_post_contents(
			implode( ' OR ', $clauses ),
			$likes,
			static function ( string $content ) use ( $stems, &$used ): void {
				foreach ( $stems as $attachment_id => $stem ) {
					if ( str_contains( $content, $stem ) ) {
						$used[ $attachment_id ] = true;
					}
				}
			}
		);

		return $completed ? array_keys( $used ) : null;
	}

	/**
	 * Returns every attachment ID a gallery or playlist shortcode lists.
	 *
	 * @return int[]|null Listed attachment IDs, null when the query failed.
	 */
	private function shortcode_attachment_ids(): ?array {
		global $wpdb;

		$rewriter = new Shortcode_ID_Rewriter();
		$ids      = array();

		$completed = $this->scan_post_contents(
			'post_content LIKE %s OR post_content LIKE %s',
			array(
				'%' . $wpdb->esc_like( '[gallery' ) . '%',
				'%' . $wpdb->esc_like( '[playlist' ) . '%',
			),
			static function ( string $content ) use ( $rewriter, &$ids ): void {
				foreach ( $rewriter->collect_shortcode_attachment_ids( $content ) as $id ) {
					$ids[ $id ] = true;
				}
			}
		);

		return $completed ? array_keys( $ids ) : null;
	}

	/**
	 * Passes each matching post's content to a callback, a page at a time.
	 *
	 * Paged by ascending ID rather than by offset, which would rescan the
	 * matched set for every page. Holding the whole set instead costs upwards
	 * of a gigabyte on a site with many long shortcode-bearing posts.
	 *
	 * @param string   $where   Content clause, already carrying placeholders.
	 * @param string[] $args    Placeholder values for the clause.
	 * @param callable $collect Receives each matching post_content.
	 * @return bool True when the scan finished, false when a query failed.
	 */
	private function scan_post_contents(
		string $where,
		array $args,
		callable $collect
	): bool {
		global $wpdb;

		$last = 0;

		do {
			// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber
			$rows = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT ID, post_content FROM {$wpdb->posts}
					 WHERE post_status NOT IN ( 'auto-draft', 'inherit' )
						 AND ( " . $where . ' )
						 AND ID > %d
					 ORDER BY ID
					 LIMIT %d',
					array_merge( $args, array( $last, self::SCAN_PAGE_SIZE ) )
				)
			);
			// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber

			// get_results() answers null for a query prepare() rejected.
			if ( '' !== $wpdb->last_error || ! is_array( $rows ) ) {
				return false;
			}

			foreach ( $rows as $row ) {
				$last = (int) $row->ID;
				$collect( (string) $row->post_content );
			}

			$page_count = count( $rows );
			unset( $rows );
		} while ( self::SCAN_PAGE_SIZE === $page_count );

		return true;
	}

	/**
	 * Restores a post to its previous version.
	 *
	 * @param int    $post_id    Post ID to restore.
	 * @param string $post_title Post title for response.
	 * @param array  $changes    Previous content/metadata.
	 * @return array{action: string, post_id: int, post_title: string, omissions: array}|WP_Error Result or error.
	 */
	private function restore_previous_version(
		int $post_id,
		string $post_title,
		array $changes
	): array|WP_Error {
		$prepared = $this->prepare_previous_version( $changes );
		if ( is_wp_error( $prepared ) ) {
			return $prepared;
		}
		$changes   = $prepared['changes'];
		$omissions = $prepared['omissions'];

		$restore_data = array( 'ID' => $post_id );
		$post_fields  = array(
			'previous_content'        => 'post_content',
			'previous_title'          => 'post_title',
			'previous_excerpt'        => 'post_excerpt',
			'previous_slug'           => 'post_name',
			'previous_comment_status' => 'comment_status',
			'previous_ping_status'    => 'ping_status',
			'previous_menu_order'     => 'menu_order',
			'previous_password'       => 'post_password',
			'previous_author'         => 'post_author',
			'previous_parent'         => 'post_parent',
			'previous_post_type'      => 'post_type',
		);

		foreach ( $post_fields as $previous_field => $post_field ) {
			if ( isset( $changes[ $previous_field ] ) ) {
				$restore_data[ $post_field ] = $changes[ $previous_field ];
			}
		}

		// The history record holds raw database reads, so it needs re-slashing
		// on the way back in.
		$updated = wp_update_post( wp_slash( $restore_data ), true );

		if ( is_wp_error( $updated ) ) {
			return new WP_Error(
				'restore_failed',
				sprintf(
					/* translators: %s: error message */
					__( 'Failed to restore post: %s', 'safe-publish' ),
					$updated->get_error_message()
				)
			);
		}

		$content_error = Post_Content_Integrity::verify(
			$post_id,
			$restore_data,
			Post_Content_Integrity::OPERATION_ROLLBACK
		);

		if ( null !== $content_error ) {
			return $content_error;
		}

		$terms_error = null;

		if ( isset( $changes['previous_terms'] ) && is_array( $changes['previous_terms'] ) ) {
			$terms_restored = Term_Assignment_State::restore(
				$post_id,
				$changes['previous_terms']
			);

			if ( is_wp_error( $terms_restored ) ) {
				$terms_error = new WP_Error(
					'terms_restore_failed',
					sprintf(
						/* translators: %s: error message */
						__( 'Failed to restore terms: %s', 'safe-publish' ),
						$terms_restored->get_error_message()
					)
				);
			}
		}

		$this->restore_post_metadata( $post_id, $changes );
		$this->restore_featured_image( $post_id, $changes );

		if ( null !== $terms_error ) {
			return $terms_error;
		}

		return array(
			'action'     => 'restored',
			'post_id'    => $post_id,
			'post_title' => $post_title,
			'omissions'  => $omissions,
		);
	}

	/**
	 * Validates a snapshot and omits references that are no longer available.
	 *
	 * @param array $changes Previous post state.
	 * @return array{changes: array, omissions: array}|WP_Error Prepared state or error.
	 */
	private function prepare_previous_version( array $changes ): array|WP_Error {
		if ( array_key_exists( 'previous_terms', $changes ) ) {
			if ( ! is_array( $changes['previous_terms'] ) ) {
				return $this->invalid_snapshot_error();
			}

			$valid_terms = Term_Assignment_State::validate( $changes['previous_terms'] );
			if ( is_wp_error( $valid_terms ) ) {
				return $valid_terms;
			}
		}

		foreach ( array( 'previous_author', 'previous_parent' ) as $key ) {
			if (
				array_key_exists( $key, $changes )
				&& ( ! is_int( $changes[ $key ] ) || $changes[ $key ] < 0 )
			) {
				return $this->invalid_snapshot_error();
			}
		}

		if (
			array_key_exists( 'previous_post_type', $changes )
			&& ! is_string( $changes['previous_post_type'] )
		) {
			return $this->invalid_snapshot_error();
		}

		if ( array_key_exists( 'previous_featured_image', $changes ) ) {
			$thumbnail_id = $changes['previous_featured_image'];
			if (
				false !== $thumbnail_id
				&& ( ! is_int( $thumbnail_id ) || $thumbnail_id < 0 )
			) {
				return $this->invalid_snapshot_error();
			}
		}

		$omissions = array();

		if ( isset( $changes['previous_terms'] ) ) {
			foreach ( $changes['previous_terms'] as $taxonomy_key => $term_ids ) {
				$taxonomy = (string) $taxonomy_key;
				$reason   = Term_Assignment_State::unavailable_reason(
					$taxonomy,
					$term_ids
				);

				if ( null !== $reason ) {
					$omissions[] = array(
						'field'    => 'term_assignments',
						'reason'   => $reason,
						'taxonomy' => $taxonomy,
						'term_ids' => $term_ids,
					);
					unset( $changes['previous_terms'][ $taxonomy_key ] );
				}
			}
		}

		$references = array(
			'previous_author'         => array( 'author', 'id' ),
			'previous_parent'         => array( 'parent', 'id' ),
			'previous_post_type'      => array( 'post_type', 'slug' ),
			'previous_featured_image' => array( 'featured_image', 'id' ),
		);

		foreach ( $references as $snapshot_key => [ $field, $value_key ] ) {
			if ( ! isset( $changes[ $snapshot_key ] ) ) {
				continue;
			}

			$value     = $changes[ $snapshot_key ];
			$available = match ( $snapshot_key ) {
				'previous_author' => 0 === $value || false !== get_user_by( 'id', $value ),
				'previous_parent' => 0 === $value || null !== get_post( $value ),
				'previous_post_type' => post_type_exists( $value ),
				'previous_featured_image' => false === $value || 0 === $value
					|| '' !== wp_get_attachment_image( $value, 'thumbnail' ),
			};

			if ( $available ) {
				continue;
			}

			$omissions[] = array(
				'field'    => $field,
				'reason'   => 'reference_unavailable',
				$value_key => $value,
			);
			unset( $changes[ $snapshot_key ] );
		}

		return compact( 'changes', 'omissions' );
	}

	/**
	 * Returns the shared malformed-snapshot error.
	 *
	 * @return WP_Error Invalid snapshot error.
	 */
	private function invalid_snapshot_error(): WP_Error {
		return new WP_Error(
			'invalid_rollback_snapshot',
			__( 'The saved rollback data is invalid.', 'safe-publish' )
		);
	}

	/**
	 * Restores post metadata.
	 *
	 * @param int   $post_id Post ID.
	 * @param array $changes Previous metadata.
	 */
	private function restore_post_metadata( int $post_id, array $changes ): void {
		if ( ! isset( $changes['previous_meta'] ) || ! is_array( $changes['previous_meta'] ) ) {
			return;
		}

		foreach ( $changes['previous_meta'] as $meta_key => $meta_value ) {
			update_post_meta( $post_id, $meta_key, wp_slash( $meta_value ) );
		}
	}

	/**
	 * Restores featured image.
	 *
	 * @param int   $post_id Post ID.
	 * @param array $changes Previous featured image data.
	 */
	private function restore_featured_image( int $post_id, array $changes ): void {
		if ( ! isset( $changes['previous_featured_image'] ) ) {
			return;
		}

		if ( $changes['previous_featured_image'] ) {
			set_post_thumbnail( $post_id, $changes['previous_featured_image'] );
		} else {
			delete_post_thumbnail( $post_id );
		}
	}
}
