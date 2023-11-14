<?php
/**
 * Endpoints: Parse.ly `/analytics/post/detail` API proxy endpoint class
 *
 * @package Parsely
 * @since   3.6.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints;

use stdClass;
use WP_REST_Request;
use WP_Error;

/**
 * Configures the `/stats/post/detail` REST API endpoint.
 */
final class Analytics_Post_Detail_API_Proxy extends Base_API_Proxy {

	/**
	 * Registers the endpoint's WP REST route.
	 */
	public function run(): void {
		$this->register_endpoint( '/stats/post/detail' );
	}

	/**
	 * Cached "proxy" to the Parse.ly `/analytics/post/detail` API endpoint.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error object on failure.
	 */
	public function get_items( WP_REST_Request $request ) {
		return $this->get_data( $request );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @param array<stdClass> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	protected function generate_data( $response ): array {
		return $this->generate_post_data( $response );
	}
}
