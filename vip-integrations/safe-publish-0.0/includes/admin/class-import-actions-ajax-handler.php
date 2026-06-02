<?php
/**
 * Import Actions AJAX Handler class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers AJAX endpoints consumed by row actions on the Imports → Posts tab:
 * rollback (single + bulk) and post diff. Kept out of Admin_Ajax_Controller to
 * isolate the rollback service / diff renderer dependencies and to keep the
 * central controller focused on import flow.
 */
final class Import_Actions_Ajax_Handler {

	use Verifies_Ajax_Request;

	/**
	 * History repository instance.
	 *
	 * @var History_Repository
	 */
	private History_Repository $repository;

	/**
	 * Rollback service instance.
	 *
	 * @var Session_Rollback_Service
	 */
	private Session_Rollback_Service $rollback_service;

	/**
	 * Diff renderer instance.
	 *
	 * @var Diff_Renderer
	 */
	private Diff_Renderer $diff_renderer;

	/**
	 * Constructs the handler.
	 *
	 * @param History_Repository       $repository       History repository.
	 * @param Session_Rollback_Service $rollback_service Rollback service.
	 * @param Diff_Renderer            $diff_renderer    Diff renderer.
	 */
	public function __construct(
		History_Repository $repository,
		Session_Rollback_Service $rollback_service,
		Diff_Renderer $diff_renderer
	) {
		$this->repository       = $repository;
		$this->rollback_service = $rollback_service;
		$this->diff_renderer    = $diff_renderer;
	}

	/**
	 * Registers the AJAX action hooks.
	 */
	public function init(): void {
		add_action( 'wp_ajax_safe_publish_rollback_session', array( $this, 'ajax_rollback_session' ) );
		add_action( 'wp_ajax_safe_publish_rollback_item', array( $this, 'ajax_rollback_item' ) );
		add_action( 'wp_ajax_safe_publish_get_post_diff', array( $this, 'ajax_get_post_diff' ) );
	}

	/**
	 * Rolls back every successful/updated item in a session.
	 */
	public function ajax_rollback_session(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		$session_id = absint( $_POST['session_id'] ?? 0 );

		if ( ! $session_id ) {
			wp_send_json_error( __( 'Invalid session ID', 'safe-publish' ) );
		}

		$result = $this->rollback_service->rollback_session( $session_id );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		wp_send_json_success(
			array(
				'deleted_count'  => $result['deleted_count'],
				'restored_count' => $result['restored_count'],
				'failed_count'   => $result['failed_count'],
			)
		);
	}

	/**
	 * Rolls back a single item by id.
	 */
	public function ajax_rollback_item(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		$item_id = absint( $_POST['item_id'] ?? 0 );

		if ( ! $item_id ) {
			wp_send_json_error( __( 'Invalid item ID', 'safe-publish' ) );
		}

		$result = $this->rollback_service->rollback_item( $item_id );

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		$messages = array(
			'deleted'  => __( 'Post successfully deleted', 'safe-publish' ),
			'restored' => __( 'Post successfully restored to previous version', 'safe-publish' ),
		);

		$result['message'] = $messages[ $result['action'] ] ?? $result['action'];

		wp_send_json_success( $result );
	}

	/**
	 * Returns the comprehensive HTML diff between the post's pre-import state
	 * and its current state.
	 */
	public function ajax_get_post_diff(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		$post_id = absint( $_POST['post_id'] ?? 0 );

		if ( ! $post_id ) {
			wp_send_json_error( __( 'Invalid post ID', 'safe-publish' ) );
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			wp_send_json_error( __( 'Post not found', 'safe-publish' ) );
		}

		if ( ! current_user_can( 'read_post', $post_id ) ) {
			wp_send_json_error( __( 'Forbidden', 'safe-publish' ), 403 );
		}

		$item = $this->repository->get_item_for_post( $post_id );

		if ( null === $item ) {
			wp_send_json_error( __( 'No import history found for this post', 'safe-publish' ) );
		}

		$changes = History_Repository::decode_item_changes(
			$item['content_changes']
		) ?? array();

		$old_content = (string) ( $changes['previous_content'] ?? '' );
		$old_title   = (string) ( $changes['previous_title'] ?? '' );
		$old_excerpt = (string) ( $changes['previous_excerpt'] ?? '' );

		$new_content = $post->post_content;
		$new_title   = $post->post_title;
		$new_excerpt = $post->post_excerpt;

		if ( '' === $old_content && '' === $old_title && '' === $old_excerpt ) {
			$diff_html = $this->diff_renderer->generate_no_diff_message(
				$new_title,
				$new_excerpt,
				$new_content
			);
		} else {
			$diff_html = $this->diff_renderer->generate_comprehensive_diff_html(
				$old_title,
				$new_title,
				$old_excerpt,
				$new_excerpt,
				$old_content,
				$new_content
			);
		}

		wp_send_json_success(
			array(
				'diff_html' => $diff_html,
			)
		);
	}
}
