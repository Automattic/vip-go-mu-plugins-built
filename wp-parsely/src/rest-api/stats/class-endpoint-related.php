<?php
/**
 * Stats API Endpoint: Related Posts
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Stats;

use Parsely\REST_API\Base_Endpoint;
use Parsely\Services\Content_API\Content_API_Service;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The Stats API Related Posts endpoint.
 *
 * Provides an endpoint for retrieving related posts to a given URL.
 *
 * @since 3.17.0
 */
class Endpoint_Related extends Base_Endpoint {
	use Post_Data_Trait;
	use Related_Posts_Trait;

	/**
	 * The Parse.ly Content API service.
	 *
	 * @since 3.17.0
	 *
	 * @var Content_API_Service $content_api
	 */
	public $content_api;

	/**
	 * Constructor.
	 *
	 * @since 3.17.0
	 *
	 * @param Stats_Controller $controller The controller.
	 */
	public function __construct( Stats_Controller $controller ) {
		parent::__construct( $controller );
		$this->content_api = $this->parsely->get_content_api();
	}

	/**
	 * Returns the endpoint name.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public static function get_endpoint_name(): string {
		return 'related';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * @since 3.17.0
	 */
	public function register_routes(): void {
		/**
		 * GET /related
		 * Gets related posts.
		 */
		$this->register_rest_route(
			'/',
			array( 'GET' ),
			array( $this, 'get_related_posts' ),
			array(
				'url' => array(
					'description' => __( 'The URL of the post.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => true,
				),
				$this->get_related_posts_param_args(),
			)
		);
	}

	/**
	 * API Endpoint: GET /stats/related
	 *
	 * Gets related posts for a given URL.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_related_posts( WP_REST_Request $request ) {
		$url = $request->get_param( 'url' );

		$related_posts = $this->get_related_posts_of_url( $request, $url );

		if ( is_wp_error( $related_posts ) ) {
			return $related_posts;
		}

		return new WP_REST_Response( array( 'data' => $related_posts ), 200 );
	}

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool|WP_Error
	 */
	public function is_available_to_current_user( ?WP_REST_Request $request = null ) {
		return $this->validate_site_id_and_secret( false );
	}
}
