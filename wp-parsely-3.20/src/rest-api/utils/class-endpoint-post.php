<?php
/**
 * Utils API Endpoint: Post
 *
 * @package Parsely
 * @since   3.20.5
 */

declare(strict_types=1);

namespace Parsely\REST_API\Utils;

use Parsely\REST_API\Base_Endpoint;
use Parsely\REST_API\Use_Post_ID_Parameter_Trait;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The Utils API Post endpoint.
 *
 * Provides an endpoint for utility functions related to Posts.
 *
 * @since 3.20.5
 */
class Endpoint_Post extends Base_Endpoint {
	use Use_Post_ID_Parameter_Trait;

	/**
	 * Returns the endpoint's name.
	 *
	 * @since 3.20.5
	 *
	 * @return string The endpoint's name.
	 */
	public static function get_endpoint_name(): string {
		return 'post';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * @since 3.20.5
	 */
	public function register_routes(): void {
		/**
		 * GET /utils/post/{post_id}/rest-route
		 * Returns the REST route of a Post.
		 */
		$this->register_rest_route_with_post_id(
			'/rest-route',
			array( 'GET' ),
			array( $this, 'get_rest_route' )
		);
	}

	/**
	 * API Endpoint: GET /utils/post/{post_id}/rest-route
	 *
	 * Returns the REST route of a post.
	 *
	 * @since 3.20.5
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function get_rest_route( WP_REST_Request $request ) {
		$post_id         = $request->get_param( 'post_id' );
		$post_rest_route = rest_get_route_for_post( $post_id );

		return new WP_REST_Response( array( 'data' => $post_rest_route ), 200 );
	}
}
