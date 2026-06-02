<?php
/**
 * Session Rollback Service class for handling import rollback operations
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

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

		$result = $this->rollback_item_row( $item );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$this->repository->mark_item_rolled_back( $item_id );

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
			// No previous content stored: just delete the post.
			return $this->delete_new_post( $post_id, $post->post_title );
		}

		return new WP_Error(
			'unsupported_status',
			__( 'Cannot rollback this item: unsupported status', 'safe-publish' )
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
		if ( ! wp_delete_post( $post_id, true ) ) {
			return new WP_Error(
				'delete_failed',
				__( 'Failed to delete the post', 'safe-publish' )
			);
		}

		return array(
			'action'     => 'deleted',
			'post_id'    => $post_id,
			'post_title' => $post_title,
		);
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

		$updated = wp_update_post( $restore_data, true );

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
			update_post_meta( $post_id, $meta_key, $meta_value );
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
