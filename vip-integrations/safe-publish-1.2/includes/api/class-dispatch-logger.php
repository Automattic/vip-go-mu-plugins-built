<?php
/**
 * Dispatch Logger class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Utils\Log_Events;
use Safe_Publish\Utils\Logger;

/**
 * Logger for non-export REST dispatch outcomes.
 *
 * Captures failures on authenticated calls whose action isn't a real
 * export (list, preview, probe), plus faults that degrade an otherwise
 * successful response. Clean successes are not recorded here — the auth
 * channel's REQUEST_AUTHENTICATED already covers that.
 */
class Dispatch_Logger extends Logger {

	/**
	 * Constructs the Dispatch_Logger instance.
	 */
	public function __construct() {
		$this->channel = 'dispatch';
	}

	/**
	 * Logs a non-export dispatch that returned a WP_Error.
	 *
	 * @param string $route                REST route the destination requested.
	 * @param string $action               Declared action value of the request.
	 * @param string $destination_site_url URL of the destination that called.
	 * @param string $error_code           WP_Error code.
	 * @param string $error_message        WP_Error message.
	 */
	public function dispatch_request_error(
		string $route,
		string $action,
		string $destination_site_url,
		string $error_code,
		string $error_message
	): void {
		$this->log_failure(
			Log_Events::DISPATCH_REQUEST_ERROR,
			array(
				'route'                => $route,
				'action'               => $action,
				'destination_site_url' => $destination_site_url,
				'error_code'           => $error_code,
				'error_message'        => $error_message,
			)
		);
	}

	/**
	 * Logs a non-export dispatch whose response returned a non-200 status.
	 *
	 * @param string $route                REST route the destination requested.
	 * @param string $action               Declared action value of the request.
	 * @param string $destination_site_url URL of the destination that called.
	 * @param int    $status               HTTP status code returned.
	 */
	public function dispatch_response_bad_status(
		string $route,
		string $action,
		string $destination_site_url,
		int $status
	): void {
		$this->log_failure(
			Log_Events::DISPATCH_RESPONSE_BAD_STATUS,
			array(
				'route'                => $route,
				'action'               => $action,
				'destination_site_url' => $destination_site_url,
				'status'               => $status,
			)
		);
	}

	/**
	 * Logs a post type left out of the catalog because its REST controller
	 * threw.
	 *
	 * Leads with the post type and error class: the Audit Log previews only
	 * the first payload entries before expansion.
	 *
	 * @param string $post_type            Slug of the omitted post type.
	 * @param string $error_code           Class name of the thrown error.
	 * @param string $error_message        Message of the thrown error.
	 * @param string $route                REST route the destination requested.
	 * @param string $action               Declared action value of the request.
	 * @param string $destination_site_url URL of the destination that called.
	 */
	public function catalog_post_type_skipped(
		string $post_type,
		string $error_code,
		string $error_message,
		string $route,
		string $action,
		string $destination_site_url
	): void {
		$this->log_error(
			Log_Events::CATALOG_POST_TYPE_SKIPPED,
			array(
				'post_type'            => $post_type,
				'error_code'           => $error_code,
				'error_message'        => $error_message,
				'route'                => $route,
				'action'               => $action,
				'destination_site_url' => $destination_site_url,
			)
		);
	}
}
