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
 * Centralizes the capability check shared by all plugin AJAX handlers.
 *
 * Each handler still calls `check_ajax_referer()` inline so that PHPCS can
 * trace nonce verification to `$_POST` accesses. This trait only provides the
 * capability guard that follows.
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
}
