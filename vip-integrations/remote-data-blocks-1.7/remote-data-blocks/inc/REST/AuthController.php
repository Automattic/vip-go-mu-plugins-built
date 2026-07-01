<?php declare(strict_types = 1);

namespace RemoteDataBlocks\REST;

use RemoteDataBlocks\Integrations\Google\Auth\GoogleAuth;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined( 'ABSPATH' ) || exit();

/**
 * Auth REST API controller.
 *
 * Authentication related endpoints for services which require multiple steps before the final
 * access token is obtained like OAuth2.
 */
class AuthController extends WP_REST_Controller {
	public function __construct() {
		$this->namespace = REMOTE_DATA_BLOCKS__REST_NAMESPACE;
		$this->rest_base = 'auth';
	}

	public function register_routes(): void {
		/**
		 * API to get Google Access Token using a Credentials/Keys JSON file.
		 * Currently only supports service account keys.
		 * Could be extended to support OAuth2.0 Client Keys in the future.
		 */
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/google/token',
			[
				'methods' => 'POST',
				'callback' => [ $this, 'get_google_auth_token' ],
				'permission_callback' => [ $this, 'permissions_check' ],
			]
		);
	}

	public function get_google_auth_token( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$params = $request->get_json_params();
		$credentials = $params['credentials'] ?? null;
		$scopes = $params['scopes'] ?? [];
		$type = $params['type'] ?? null;

		if ( ! $credentials || ! $type || ! $scopes ) {
			return new \WP_Error(
				'missing_parameters',
				__( 'Credentials, type and scopes are required.', 'remote-data-blocks' ),
				array( 'status' => 400 )
			);
		}

		if ( 'service_account' === $type ) {
			$token = GoogleAuth::generate_token_from_service_account_key( $credentials, $scopes, true );
			if ( is_wp_error( $token ) ) {
				return rest_ensure_response( $token );
			}
			return rest_ensure_response( [ 'token' => $token ] );
		}

		return new \WP_Error(
			'invalid_type',
			__( 'Invalid type. Supported types: service_account', 'remote-data-blocks' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * These all require manage_options for now, but we can adjust as needed.
	 * Taken from /inc/REST/DataSourceController.php
	 */
	public function permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}
}
