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
 * Handles rollback operations for import sessions and individual items.
 */
final class Session_Rollback_Service {

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
	 * Rolls back an entire import session.
	 *
	 * @param int $session_id Session ID to roll back.
	 * @return array{deleted_count: int, restored_count: int, failed_count: int}|WP_Error Rollback results or error.
	 */
	public function rollback_session( int $session_id ): array|WP_Error {
		$session = $this->repository->get_session( $session_id );

		if ( ! $session ) {
			return new WP_Error(
				'session_not_found',
				__( 'Session not found', 'safe-publish' )
			);
		}

		$items = $this->repository->get_session_items_by_status(
			$session_id,
			array( 'success', 'updated' )
		);

		$deleted_count  = 0;
		$restored_count = 0;
		$failed_count   = 0;

		foreach ( $items as $item ) {
			if ( 1 === (int) $item['rolled_back'] ) {
				continue;
			}

			$result = $this->rollback_item_row( $item );

			if ( is_wp_error( $result ) ) {
				++$failed_count;
				continue;
			}

			if ( 'deleted' === $result['action'] ) {
				++$deleted_count;
			} elseif ( 'restored' === $result['action'] ) {
				++$restored_count;
			}
		}

		if ( 0 === $failed_count ) {
			$this->repository->mark_session_rolled_back( $session_id );
		}

		return array(
			'deleted_count'  => $deleted_count,
			'restored_count' => $restored_count,
			'failed_count'   => $failed_count,
		);
	}

	/**
	 * Rolls back a single import item.
	 *
	 * @param int $item_id Item ID to roll back.
	 * @return array{action: string, post_id: int, post_title: string}|WP_Error Rollback result or error.
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
		if ( ! $this->repository->mark_item_rolled_back( $item_id ) ) {
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
	 * @return array{action: string, post_id: int, post_title: string}|WP_Error Rollback result or error.
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
	 * @return array{action: string, post_id: int, post_title: string}|WP_Error Result or error.
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

		foreach ( $imported_media_ids as $attachment_id ) {
			// A surviving post may still show media parented here, since import
			// deduplicates by source URL; skip those and delete only what this
			// post solely owns.
			if ( $this->attachment_used_by_other_post( $attachment_id ) ) {
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
	 * Reports whether a surviving post still shows the attachment, across the
	 * three ways an import can make a post reference one: Inline in content,
	 * as a featured image, or by ID in a gallery or playlist shortcode.
	 *
	 * @param int $attachment_id Attachment considered for deletion.
	 * @return bool True when another post references it.
	 */
	private function attachment_used_by_other_post( int $attachment_id ): bool {
		return $this->used_as_featured_image( $attachment_id )
			|| $this->used_in_post_content( $attachment_id )
			|| $this->used_in_media_shortcode( $attachment_id );
	}

	/**
	 * Reports whether any post uses the attachment as its featured image.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool True when a post's thumbnail points at it.
	 */
	private function used_as_featured_image( int $attachment_id ): bool {
		$posts = get_posts(
			array(
				'post_type'        => 'any',
				'post_status'      => 'any',
				'posts_per_page'   => 1,
				'fields'           => 'ids',
				'suppress_filters' => false,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'       => array(
					array(
						'key'   => '_thumbnail_id',
						'value' => (string) $attachment_id,
					),
				),
			)
		);

		return array() !== $posts;
	}

	/**
	 * Reports whether any post's content references the attachment's file,
	 * sized variants included, by matching the upload-relative path stem.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool True when a post's content contains the file URL.
	 */
	private function used_in_post_content( int $attachment_id ): bool {
		$file = get_post_meta( $attachment_id, '_wp_attached_file', true );

		if ( ! is_string( $file ) || '' === $file ) {
			return false;
		}

		// Drop the extension so sized variants (image-300x200.jpg) match too.
		$stem = preg_replace( '/\.[^.\/]+$/', '', $file );

		if ( ! is_string( $stem ) || '' === $stem ) {
			return false;
		}

		global $wpdb;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$match = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts}
				 WHERE post_content LIKE %s
					 AND post_status NOT IN ( 'auto-draft', 'trash', 'inherit' )
				 LIMIT 1",
				'%' . $wpdb->esc_like( $stem ) . '%'
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return null !== $match;
	}

	/**
	 * Reports whether any post's gallery or playlist shortcode lists the
	 * attachment by ID.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool True when a shortcode references it.
	 */
	private function used_in_media_shortcode( int $attachment_id ): bool {
		global $wpdb;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$contents = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT post_content FROM {$wpdb->posts}
				 WHERE post_status NOT IN ( 'auto-draft', 'trash', 'inherit' )
					 AND ( post_content LIKE %s OR post_content LIKE %s )",
				'%' . $wpdb->esc_like( '[gallery' ) . '%',
				'%' . $wpdb->esc_like( '[playlist' ) . '%'
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( array() === $contents ) {
			return false;
		}

		$rewriter = new Shortcode_ID_Rewriter();

		foreach ( $contents as $content ) {
			$ids = $rewriter->collect_shortcode_attachment_ids( (string) $content );

			if ( in_array( $attachment_id, $ids, true ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Restores a post to its previous version.
	 *
	 * @param int    $post_id    Post ID to restore.
	 * @param string $post_title Post title for response.
	 * @param array  $changes    Previous content/metadata.
	 * @return array{action: string, post_id: int, post_title: string}|WP_Error Result or error.
	 */
	private function restore_previous_version(
		int $post_id,
		string $post_title,
		array $changes
	): array|WP_Error {
		$restore_data = array( 'ID' => $post_id );

		if ( isset( $changes['previous_content'] ) ) {
			$restore_data['post_content'] = $changes['previous_content'];
		}

		if ( isset( $changes['previous_title'] ) ) {
			$restore_data['post_title'] = $changes['previous_title'];
		}

		if ( isset( $changes['previous_excerpt'] ) ) {
			$restore_data['post_excerpt'] = $changes['previous_excerpt'];
		}

		if ( isset( $changes['previous_slug'] ) ) {
			$restore_data['post_name'] = $changes['previous_slug'];
		}

		if ( isset( $changes['previous_comment_status'] ) ) {
			$restore_data['comment_status'] = $changes['previous_comment_status'];
		}

		if ( isset( $changes['previous_ping_status'] ) ) {
			$restore_data['ping_status'] = $changes['previous_ping_status'];
		}

		if ( isset( $changes['previous_menu_order'] ) ) {
			$restore_data['menu_order'] = $changes['previous_menu_order'];
		}

		if ( isset( $changes['previous_password'] ) ) {
			$restore_data['post_password'] = $changes['previous_password'];
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

		$this->restore_post_metadata( $post_id, $changes );
		$this->restore_featured_image( $post_id, $changes );

		return array(
			'action'     => 'restored',
			'post_id'    => $post_id,
			'post_title' => $post_title,
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
