<?php
/**
 * Endpoints: Parse.ly `/related` API proxy endpoint class
 *
 * @package Parsely
 * @since   3.2.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints;

use Parsely\Parsely;
use stdClass;
use WP_REST_Request;
use WP_Error;

/**
 * Configures the `/related` REST API endpoint.
 */
final class Related_API_Proxy extends Base_API_Proxy {

	/**
	 * Registers the endpoint's WP REST route.
	 */
	public function run(): void {
		$this->register_endpoint( '/related' );
	}

	/**
	 * Cached "proxy" to the Parse.ly `/related` API endpoint.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error object on failure.
	 */
	public function get_items( WP_REST_Request $request ) {
		return $this->get_data( $request, false, 'query' );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @param array<stdClass> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	protected function generate_data( $response ): array {
		$itm_source = $this->itm_source;

		return array_map(
			static function ( stdClass $item ) use ( $itm_source ) {
				return (object) array(
					'image_url'        => $item->image_url,
					'thumb_url_medium' => $item->thumb_url_medium,
					'title'            => $item->title,
					'url'              => Parsely::get_url_with_itm_source( $item->url, $itm_source ),
				);
			},
			$response
		);
	}
}
