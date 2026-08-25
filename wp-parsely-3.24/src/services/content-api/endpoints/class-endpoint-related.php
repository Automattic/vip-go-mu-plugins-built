<?php
/**
 * Parse.ly Content API Endpoint: Related
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Content_API\Endpoints;

use WP_Error;

/**
 * The endpoint for the /related API request.
 *
 * @since 3.17.0
 *
 * @link https://docs.parse.ly/content-recommendations/#h-get-related
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
