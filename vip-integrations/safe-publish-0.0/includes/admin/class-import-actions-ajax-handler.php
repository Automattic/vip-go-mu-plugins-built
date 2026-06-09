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
 * rollback (single + bulk). Kept out of Admin_Ajax_Controller to isolate the
 * rollback service dependency and to keep the central controller focused on
 * import flow.
 */
final class Import_Actions_Ajax_Handler {

	use Verifies_Ajax_Request;

	/**
	 * Rollback service instance.
	 *
	 * @var Session_Rollback_Service
	 */
	private Session_Rollback_Service $rollback_service;

	/**
	 * Constructs the handler.
	 *
	 * @param Session_Rollback_Service $rollback_service Rollback service.
	 */
	public function __construct( Session_Rollback_Service $rollback_service ) {
		$this->rollback_service = $rollback_service;
	}

	/**
	 * Registers the AJAX action hooks.
	 */
	public function init(): void {
		add_action( 'wp_ajax_safe_publish_rollback_session', array( $this, 'ajax_rollback_session' ) );
		add_action( 'wp_ajax_safe_publish_rollback_item', array( $this, 'ajax_rollback_item' ) );
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
}
