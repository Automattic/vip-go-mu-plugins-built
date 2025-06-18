<?php
/**
 * API Endpoint: Check Auth
 * Parse.ly Content Helper `/check-auth` API endpoint class
 *
 * @package Parsely
 * @since   3.19.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Content_Helper;

use Parsely\REST_API\Base_Endpoint;
use Parsely\Services\Suggestions_API\Suggestions_API_Service;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The Check Auth API.
 *
 * Provides an endpoint for checking a Site ID's authorization to use the
 * Suggestions API and its features.
 *
 * @since 3.19.0
 */
class Endpoint_Check_Auth extends Base_Endpoint {
	/**
	 * The Suggestions API service.
	 *
	 * @since 3.19.0
	 *
	 * @var Suggestions_API_Service $suggestions_api
	 */
	protected $suggestions_api;

	/**
	 * Initializes the class.
	 *
	 * @since 3.19.0
	 *
	 * @param Content_Helper_Controller $controller The content helper controller.
	 */
	public function __construct( Content_Helper_Controller $controller ) {
		parent::__construct( $controller );
		$this->suggestions_api = $controller->get_parsely()->get_suggestions_api();
	}

	/**
	 * Returns the name of the endpoint.
	 *
	 * @since 3.19.0
	 *
	 * @return string The endpoint's name.
	 */
	public static function get_endpoint_name(): string {
		return 'check-auth';
	}

	/**
	 * Returns the name of the feature associated with the current endpoint.
	 *
	 * @since 3.19.0
	 *
	 * @return string
	 */
	public function get_pch_feature_name(): string {
		return 'check_auth';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * @since 3.19.0
	 */
	public function register_routes(): void {
		/**
		 * POST /check-auth
		 * Returns whether the Site ID has the authorization to use the
		 * Suggestions API or Suggestions API feature.
		 */
		$this->register_rest_route(
			'/',
			array( 'POST' ),
			array( $this, 'get_check_auth' ),
			array(
				'auth_scope' => array(
					'description' => __( 'The scope for which to authorize.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => true,
				),
			)
		);
	}

	/**
	 * API Endpoint: POST /check-auth
	 *
	 * Returns whether the Site ID has the authorization to use the Suggestions
	 * API or Suggestions API feature.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object or a WP_Error object on failure.
	 */
	public function get_check_auth( WP_REST_Request $request ) {
		$auth_scope = $request->get_param( 'auth_scope' );

		$response = $this->suggestions_api->get_check_auth(
			array( 'auth_scope' => $auth_scope )
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return new WP_REST_Response( array( 'data' => $response ), 200 );
	}
}
