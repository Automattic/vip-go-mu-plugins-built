<?php
/**
 * Export Logger class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Utils\Log_Events;
use Safe_Publish\Utils\Logger;

/**
 * Logger for Safe Publish content export events.
 *
 * Records when content is served to a destination site via the REST API,
 * providing an audit trail on the source side.
 */
class Export_Logger extends Logger {

	/**
	 * Constructs the Export_Logger instance.
	 */
	public function __construct() {
		$this->channel = 'export';
	}

	/**
	 * Logs a successful content export served to a destination site.
	 *
	 * @param string $rest_base            Resource base segment (e.g. 'posts').
	 * @param string $destination_site_url URL of the destination that fetched.
	 * @param int[]  $post_ids             IDs of the posts included in the response.
	 */
	public function content_exported(
		string $rest_base,
		string $destination_site_url,
		array $post_ids
	): void {
		$this->log_event(
			Log_Events::CONTENT_EXPORTED,
			array(
				'rest_base'            => $rest_base,
				'destination_site_url' => $destination_site_url,
				'post_ids'             => $post_ids,
				'post_count'           => count( $post_ids ),
			)
		);
	}

	/**
	 * Logs an export request that returned a WP_Error before dispatch
	 * completed.
	 *
	 * @param string $route                REST route the destination requested.
	 * @param string $destination_site_url URL of the destination that fetched.
	 * @param string $error_code           WP_Error code.
	 * @param string $error_message        WP_Error message.
	 */
	public function export_request_error(
		string $route,
		string $destination_site_url,
		string $error_code,
		string $error_message
	): void {
		$this->log_error(
			Log_Events::EXPORT_REQUEST_ERROR,
			array(
				'route'                => $route,
				'destination_site_url' => $destination_site_url,
				'error_code'           => $error_code,
				'error_message'        => $error_message,
			)
		);
	}

	/**
	 * Logs an export request whose response returned a non-200 status.
	 *
	 * @param string $route                REST route the destination requested.
	 * @param string $destination_site_url URL of the destination that fetched.
	 * @param int    $status               HTTP status code returned.
	 */
	public function export_response_bad_status(
		string $route,
		string $destination_site_url,
		int $status
	): void {
		$this->log_error(
			Log_Events::EXPORT_RESPONSE_BAD_STATUS,
			array(
				'route'                => $route,
				'destination_site_url' => $destination_site_url,
				'status'               => $status,
			)
		);
	}
}
