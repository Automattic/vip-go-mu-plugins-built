<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Api;

defined( 'ABSPATH' ) || exit();

use VIPRealTimeCollaboration\Auth\WebSocketAuth;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * REST API controller for WebSocket authentication.
 */
final class AuthApiController extends WP_REST_Controller {
	public function __construct() {
		$this->namespace = RestApi::NAMESPACE;
		$this->rest_base = '/websocket/auth';
		$this->schema = [];
	}

	/**
	 * Register REST API routes.
	 */
	#[\Override]
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			$this->rest_base,
			[
				'methods' => 'POST',
				'callback' => [ $this, 'get_auth_token' ],
				'permission_callback' => [ $this, 'get_auth_token_permissions_check' ],
				'args' => [
					'syncObjectType' => [
						'description' => __(
							'The sync object type for synchronization (e.g., postType/post, root/base)',
							'vip-real-time-collaboration'
						),
						'type' => 'string',
						'required' => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
					'syncObjectId' => [
						'description' => __(
							'The sync object ID for synchronization',
							'vip-real-time-collaboration'
						),
						'type' => 'string',
						'required' => true,
						'sanitize_callback' => 'sanitize_text_field',
					],
					'wpClientId' => [
						'description' => __(
							'The client ID to track reconnections',
							'vip-real-time-collaboration'
						),
						'type' => 'string',
						'required' => false,
						'sanitize_callback' => 'sanitize_text_field',
					],
					'connectionId' => [
						'description' => __(
							'(Deprecated) The client ID to track reconnections. Use wpClientId instead.',
							'vip-real-time-collaboration'
						),
						'type' => 'string',
						'required' => false,
						'sanitize_callback' => 'sanitize_text_field',
					],
				],
			]
		);
	}

	/**
	 * Get a WebSocket authentication token.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function get_auth_token( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$sync_object_type = $request->get_param( 'syncObjectType' );
		$sync_object_id = $request->get_param( 'syncObjectId' );
		/** @psalm-suppress MixedAssignment */
		$wp_client_id = $request->get_param( 'wpClientId' );
		/** @psalm-suppress MixedAssignment */
		$connection_id = $request->get_param( 'connectionId' );

		// Fallback to connectionId if wpClientId is not provided (for backwards compatibility)
		if ( ! is_string( $wp_client_id ) && is_string( $connection_id ) ) {
			$wp_client_id = $connection_id;
		}

		// Validate parameter types
		if ( ! is_string( $sync_object_type ) || ! is_string( $sync_object_id ) || ! is_string( $wp_client_id ) ) {
			return new WP_Error(
				'invalid_parameters',
				__( 'syncObjectType, syncObjectId, and wpClientId (or connectionId) must be strings.', 'vip-real-time-collaboration' ),
				[ 'status' => 400 ]
			);
		}

		// Generate a short-lived token with sync object information
		$token = WebSocketAuth::generate_token( $sync_object_type, $sync_object_id, $wp_client_id );

		if ( is_wp_error( $token ) ) {
			// Log error for debugging
			/** @psalm-suppress TypeDoesNotContainType */
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( 'VIP RTC: WebSocket auth token generation failed: ' . $token->get_error_message() );
			}

			// Map error codes to appropriate HTTP status codes
			$error_code = $token->get_error_code();

			$status = match ( $error_code ) {
				'permission_denied' => 403,
				default => 500,
			};

			return new WP_REST_Response(
				[
					'code' => $token->get_error_code(),
					'message' => $token->get_error_message(),
				],
				$status
			);
		}

		return rest_ensure_response(
			[
				'token' => $token,
				'expires_in' => WebSocketAuth::get_token_expire_seconds(),
			]
		);
	}

	/**
	 * Check if the current user has permission to get an auth token.
	 *
	 * @param WP_REST_Request $_request Full details about the request.
	 * @return bool|WP_Error True if the request has access, WP_Error object otherwise.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function get_auth_token_permissions_check( WP_REST_Request $_request ): bool|WP_Error {
		/**
		 * Basic check. Additional permissions checks are handled in the generate_token method.
		 */
		if ( ! is_user_logged_in() ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You must be logged in to access this endpoint.', 'vip-real-time-collaboration' )
			);
		}

		return true;
	}
}
