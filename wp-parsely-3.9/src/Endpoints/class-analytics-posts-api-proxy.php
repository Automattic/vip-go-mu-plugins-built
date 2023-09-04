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
		$data        = array();

		foreach ( $response as $item ) {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
			$post_id       = url_to_postid( $item->url ); // 0 if the post cannot be found.
			$thumbnail_url = get_the_post_thumbnail_url( $post_id, 'thumbnail' );

			// Fall back to the Parse.ly thumbnail if needed.
			if ( false === $thumbnail_url ) {
				$thumbnail_url = $item->thumb_url_medium;
			}

			$data [] = (object) array(
				'author'       => $item->author,
				'dashUrl'      => Parsely::get_dash_url( $site_id, $item->url ),
				'date'         => $item->pub_date ? wp_date( $date_format, strtotime( $item->pub_date ) ) : null,
				// Unique ID (can be replaced by Parse.ly API ID if it becomes available).
				'id'           => Parsely::get_url_with_itm_source( $item->url, null ),
				'postId'       => $post_id, // Might not be unique.
				'thumbnailUrl' => $thumbnail_url,
				'title'        => $item->title,
				'url'          => Parsely::get_url_with_itm_source( $item->url, $this->itm_source ),
				'views'        => $item->metrics->views,
			);
		}

		return $data;
	}
}
