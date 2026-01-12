<?php
/**
 * Related Posts Trait, providing the related posts functionality
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Stats;

use Parsely\Parsely;
use Parsely\Services\Content_API\Content_API_Service;
use stdClass;
use WP_Error;
use WP_REST_Request;

/**
 * Related Posts Trait, providing the related posts functionality.
 *
 * @since 3.17.0
 */
trait Related_Posts_Trait {
	/**
	 * The itm_source of for the post URL.
	 *
	 * @since 3.17.0
	 *
	 * @var string $itm_source The source of the item.
	 */
	abstract protected function get_itm_source_param_args(): array;

	/**
	 * Sets the itm_source value from the WP_REST_Request object.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request object.
	 */
	abstract protected function set_itm_source_from_request( WP_REST_Request $request );

	/**
	 * Returns the API arguments for the related posts endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return array<string, mixed>
	 */
	private function get_related_posts_param_args(): array {
		return array_merge(
			array(
				'sort'           => array(
					'description' => __( 'The sort order.', 'wp-parsely' ),
					'type'        => 'string',
					'enum'        => array( '_score', 'pub_date' ),
					'required'    => false,
					'default'     => '_score',
				),
				'limit'          => array(
					'description' => __( 'The number of related posts to return.', 'wp-parsely' ),
					'type'        => 'integer',
					'required'    => false,
					'default'     => 10,
				),
				'pub_date_start' => array(
					'description' => __( 'The start of the publication date.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
				),
				'pub_date_end'   => array(
					'description' => __( 'The end of the publication date.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
				),
				'page'           => array(
					'description' => __( 'The page number.', 'wp-parsely' ),
					'type'        => 'integer',
					'required'    => false,
					'default'     => 1,
				),
				'section'        => array(
					'description' => __( 'The section of the post.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
				),
				'tag'            => array(
					'description' => __( 'The tag of the post.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
				),
				'author'         => array(
					'description' => __( 'The author of the post.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
				),
			),
			$this->get_itm_source_param_args()
		);
	}

	/**
	 * Get related posts for a given URL.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @param string          $url The URL to get related posts for.
	 * @return array<mixed>|WP_Error
	 */
	public function get_related_posts_of_url( WP_REST_Request $request, string $url ) {
		// Set the itm_source parameter.
		$this->set_itm_source_from_request( $request );

		/**
		 * The raw related posts data, received by the API.
		 *
		 * @var array<array<string, string>>|WP_Error $related_posts_request
		 */
		$related_posts_request = $this->content_api->get_related_posts_with_url(
			$url,
			array(
				'url'            => $url,
				'sort'           => $request->get_param( 'sort' ),
				'limit'          => $request->get_param( 'limit' ),
				'pub_date_start' => $request->get_param( 'pub_date_start' ),
				'pub_date_end'   => $request->get_param( 'pub_date_end' ),
				'page'           => $request->get_param( 'page' ),
				'section'        => $request->get_param( 'section' ),
				'tag'            => $request->get_param( 'tag' ),
				'author'         => $request->get_param( 'author' ),
			)
		);

		if ( is_wp_error( $related_posts_request ) ) {
			return $related_posts_request;
		}

		$itm_source = $this->itm_source;

		$related_posts = array_map(
			static function ( array $item ) use ( $itm_source ) {
				return array(
					'image_url'        => $item['image_url'],
					'thumb_url_medium' => $item['thumb_url_medium'],
					'title'            => $item['title'],
					'url'              => Parsely::get_url_with_itm_source( $item['url'], $itm_source ),
				);
			},
			$related_posts_request
		);

		return $related_posts;
	}
}
