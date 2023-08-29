<?php
/**
 * Endpoints: Parse.ly `/analytics/post/detail` API proxy endpoint class
 *
 * @package Parsely
 * @since   3.6.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints;

use Parsely\Parsely;
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
	 *
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
		$site_id = $this->parsely->get_site_id();

		return array_map(
			static function( stdClass $item ) use ( $site_id ) {
				return (object) array(
					'avgEngaged' => self::get_duration( (float) $item->avg_engaged ),
					'dashUrl'    => Parsely::get_dash_url( $site_id, $item->url ),
					'url'        => $item->url,
					'views'      => number_format_i18n( $item->metrics->views ),
					'visitors'   => number_format_i18n( $item->metrics->visitors ),
				);
			},
			$response
		);
	}

	/**
	 * Returns the passed float as a time duration in m:ss format.
	 *
	 * Examples:
	 *   - $time of 1.005 yields '1:00'.
	 *   - $time of 1.5 yields '1:30'.
	 *   - $time of 1.999 yields '2:00'.
	 *
	 * @since 3.6.0
	 *
	 * @param float $time The time as a float number.
	 * @return string The resulting formatted time duration.
	 */
	private static function get_duration( float $time ): string {
		$minutes = absint( $time );
		$seconds = absint( round( fmod( $time, 1 ) * 60 ) );

		if ( 60 === $seconds ) {
			$minutes++;
			$seconds = 0;
		}

		return sprintf( '%2d:%02d', $minutes, $seconds );
	}
}
