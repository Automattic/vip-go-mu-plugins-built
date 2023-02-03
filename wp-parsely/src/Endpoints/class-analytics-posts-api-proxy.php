<?php
/**
 * Endpoints: Parse.ly `/analytics/posts` API proxy endpoint class
 *
 * @package Parsely
 * @since   3.4.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints;

use stdClass;
use WP_REST_Request;
use Parsely\Parsely;

/**
 * Configures the `/stats/posts` REST API endpoint.
 */
final class Analytics_Posts_API_Proxy extends Base_API_Proxy {

	/**
	 * Registers the endpoint's WP REST route.
	 */
	public function run(): void {
		$this->register_endpoint( '/stats/posts' );
	}

	/**
	 * Cached "proxy" to the Parse.ly `/analytics/posts` API endpoint.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WPError stdClass containing the data or a WP_Error
	 *                          object on failure.
	 */
	public function get_items( WP_REST_Request $request ) {
		return $this->get_data( $request );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @param array<string, mixed> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	protected function generate_data( array $response ): array {
		$date_format    = get_option( 'date_format' );
		$stats_base_url = trailingslashit( Parsely::DASHBOARD_BASE_URL . '/' . $this->parsely->get_api_key() ) . 'find';

		$result = array_map(
			static function( stdClass $item ) use ( $date_format, $stats_base_url ) {
				return (object) array(
					'author'   => $item->author,
					'date'     => wp_date( $date_format, strtotime( $item->pub_date ) ),
					'id'       => $item->url,
					'statsUrl' => $stats_base_url . '?url=' . rawurlencode( $item->url ),
					'title'    => $item->title,
					'url'      => $item->url,
					'views'    => $item->metrics->views,
				);
			},
			$response
		);

		return $result;
	}

	/**
	 * Determines if there are enough permissions to call the endpoint.
	 *
	 * @return bool
	 */
	public function permission_callback(): bool {
		// Unauthenticated.
		return true;
	}
}
