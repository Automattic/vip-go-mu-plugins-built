<?php
/**
 * Utility Controller - Shared REST API endpoints for common functionality.
 *
 * Provides generic utility endpoints that can be used across features:
 * - URL metadata extraction
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Integrations\UrlMetaExtractor;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Response;
use WP_Error;

/**
 * Utility REST controller.
 */
class UtilityController extends WP_REST_Controller {


	/**
	 * Namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'vip-workflows/v1';

	/**
	 * Constructor.
	 */
	public function __construct() {
		// No specific rest_base - this controller handles multiple utility endpoints.
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		// URL metadata extraction.
		register_rest_route(
			$this->namespace,
			'/url-meta',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_url_meta' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => array(
						'url' => array(
							'description'       => __( 'URL to fetch metadata from.', 'vip-workflows' ),
							'type'              => 'string',
							'required'          => true,
							'validate_callback' => function ( $value ) {
								return filter_var( $value, FILTER_VALIDATE_URL ) !== false;
							},
						),
					),
				),
			)
		);
	}

	/**
	 * Check if user has permission to use utility endpoints.
	 *
	 * @return bool|WP_Error
	 */
	public function permissions_check() {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to access this endpoint.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}
		return true;
	}

	/**
	 * Get metadata from a URL.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_url_meta( $request ): WP_REST_Response {
		$url    = $request->get_param( 'url' );
		$result = UrlMetaExtractor::fetch( $url );

		if ( is_wp_error( $result ) ) {
			// Strip SSRF guard error messages before returning to the client.
			// They contain the resolved IP address which leaks internal topology.
			$client_message = str_starts_with( $result->get_error_code(), 'ssrf_' )
				? __( 'URL could not be fetched.', 'vip-workflows' )
				: $result->get_error_message();

			return new WP_REST_Response(
				array(
					'title'       => '',
					'description' => '',
					'image'       => '',
					'error'       => $client_message,
				)
			);
		}

		return new WP_REST_Response( $result );
	}
}
