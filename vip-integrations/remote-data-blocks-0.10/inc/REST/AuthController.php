<?php declare(strict_types = 1);

namespace RemoteDataBlocks\REST;

use RemoteDataBlocks\Integrations\Google\Auth\GoogleAuth;
use RemoteDataBlocks\Integrations\SalesforceD2C\Auth\SalesforceD2CAuth;
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

		/**
		 * API to get Salesforce D2C Stores using the client_credentials grant type
		 * This is also meant to test the credentials provided by the user.
		 */
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/salesforce-d2c/stores',
			[
				'methods' => 'POST',
				'callback' => [ $this, 'get_salesforce_d2c_stores' ],
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

	public function get_salesforce_d2c_stores( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$params = $request->get_json_params();
		$client_id = $params['clientId'] ?? null;
		$client_secret = $params['clientSecret'] ?? null;
		$domain = $params['domain'] ?? null;

		if ( ! $client_id || ! $client_secret || ! $domain ) {
			return new \WP_Error(
				'missing_parameters',
				__( 'Client ID, client secret and domain are required.', 'remote-data-blocks' ),
				array( 'status' => 400 )
			);
		}

		$endpoint = 'https://' . $domain . '.my.salesforce.com';

		$token = SalesforceD2CAuth::generate_token( $endpoint, $client_id, $client_secret );
		if ( is_wp_error( $token ) ) {
			return new \WP_Error(
				'failed-to-generate-token',
				__( 'Failed to generate token', 'remote-data-blocks' ),
				array( 'status' => 400 )
			);
		}

		$webstores = SalesforceD2CAuth::get_webstores( $endpoint, $token );
		if ( is_wp_error( $webstores ) ) {
			return new \WP_Error(
				'failed-to-retrieve-webstores',
				__( 'Failed to retrieve webstores', 'remote-data-blocks' ),
				array( 'status' => 400 )
			);
		}

		return rest_ensure_response(
			[
				'webstores' => $webstores,
			]
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
