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
use WP_Error;
use Parsely\Parsely;

use function Parsely\Utils\get_date_format;

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
		$date_format = get_date_format();
		$site_id     = $this->parsely->get_site_id();

		return array_map(
			static function( stdClass $item ) use ( $date_format, $site_id ) {
				return (object) array(
					'author'         => $item->author,
					'dashUrl'        => Parsely::get_dash_url( $site_id, $item->url ),
					'date'           => $item->pub_date ? wp_date( $date_format, strtotime( $item->pub_date ) ) : '',
					// Unique ID (can be replaced by Parse.ly API ID if it becomes available).
					'id'             => $item->url,
					// WordPress Post ID (0 if the post cannot be found, might not be unique).
					'postId'         => url_to_postid( $item->url ), // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
					'thumbUrlMedium' => $item->thumb_url_medium,
					'title'          => $item->title,
					'url'            => $item->url,
					'views'          => $item->metrics->views,
				);
			},
			$response
		);
	}
}
