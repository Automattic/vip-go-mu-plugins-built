<?php
/**
 * AJAX request verification trait
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
 * Centralizes the guards shared by all plugin AJAX handlers.
 *
 * Each handler still calls `check_ajax_referer()` inline so that PHPCS can
 * trace nonce verification to `$_POST` accesses. This trait provides the
 * capability guard and the session-expired response that follow.
 */
trait Verifies_Ajax_Request {

	/**
	 * Verifies that the current user has the required capability.
	 *
	 * Sends a 403 JSON error response and halts execution when the check fails.
	 *
	 * @param string $capability Required capability. Default 'manage_options'.
	 */
	private function verify_ajax_capability(
		string $capability = 'manage_options'
	): void {
		if ( ! current_user_can( $capability ) ) {
			wp_send_json_error(
				__( 'Forbidden', 'safe-publish' ),
				403
			);
		}
	}

	/**
	 * Sends a session-expired JSON error response and halts execution.
	 *
	 * Handlers route a failed nonce here so the frontend receives a structured
	 * code to surface as a clear reload prompt instead of the bare -1 that
	 * check_ajax_referer emits by default.
	 */
	private function send_session_expired_error(): void {
		wp_send_json_error(
			array(
				'code'    => 'safe_publish_nonce_expired',
				'message' => __(
					'Your session has expired. Reload the page.',
					'safe-publish'
				),
			),
			403
		);
	}
}
