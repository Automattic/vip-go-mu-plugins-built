<?php
/**
 * Parse.ly Content API Endpoint: Related
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Content_API\Endpoints;

use Parsely\Services\Base_Service_Endpoint;
use WP_Error;

/**
 * The endpoint for the /related API request.
 *
 * @since 3.17.0
 *
 * @link https://docs.parse.ly/content-recommendations/#h-get-related
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Base_Service_Endpoint
 */
class Endpoint_Related extends Content_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public function get_endpoint(): string {
		return '/related';
	}

	/**
	 * Returns the request options for the remote API request.
	 *
	 * This request also serves site visitors, through the Recommendations
	 * Block, so it uses a short timeout.
	 *
	 * @since 3.24.2
	 *
	 * @param string $method The HTTP method to use for the request.
	 * @return WP_HTTP_Request_Args The request options for the remote API request.
	 */
	protected function get_request_options( string $method ): array {
		$options            = parent::get_request_options( $method );
		$options['timeout'] = 5; // phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout

		return $options;
	}

	/**
	 * Returns the common query arguments to send to the remote API.
	 *
	 * Omits the API Secret, which /related doesn't need.
	 *
	 * @since 3.24.2
	 *
	 * @param array<mixed> $args Additional query arguments to send to the remote API.
	 * @return array<mixed> The query arguments to send to the remote API.
	 */
	protected function get_query_args( array $args = array() ): array {
		$query_args = parent::get_query_args( $args );
		unset( $query_args['secret'] );

		return $query_args;
	}

	/**
	 * Executes the API request.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return WP_Error|array<mixed> The response from the API request.
	 */
	public function call( array $args = array() ) {
		// Filter out the empty values.
		$args = array_filter( $args );

		// When the URL is provided, the UUID cannot be provided.
		if ( isset( $args['uuid'] ) && isset( $args['url'] ) ) {
			unset( $args['uuid'] );
		}

		return $this->request( 'GET', $args );
	}
}
