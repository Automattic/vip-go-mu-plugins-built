<?php
/**
 * Parse.ly Suggestions API Endpoint: Check Auth
 *
 * @package Parsely
 * @since   3.19.0
 */

declare(strict_types=1);

namespace Parsely\Services\Suggestions_API\Endpoints;

use WP_Error;
use Parsely\Services\Base_Service_Endpoint;

/**
 * The endpoint for the /check-auth API request.
 *
 * @since 3.19.0
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Base_Service_Endpoint
 * @phpstan-import-type WP_HTTP_Response from Base_Service_Endpoint
 */
class Endpoint_Check_Auth extends Suggestions_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.19.0
	 *
	 * @return string The endpoint for the API request.
	 */
	public function get_endpoint(): string {
		return '/check-auth';
	}

	/**
	 * Returns whether the Site ID has the authorization to use the Suggestions
	 * API or Suggestions API feature.
	 *
	 * @since 3.19.0
	 *
	 * @param array<mixed> $options The options to pass to the API request.
	 * @return array<mixed>|WP_Error The response from the remote API, or a WP_Error
	 *                         object if the response is an error.
	 */
	public function get_check_auth_result( array $options ) {
		/** @var array<mixed>|WP_Error $response */
		$response = $this->request( 'GET', $options );

		return $response;
	}

	/**
	 * Returns the request options for the remote API request.
	 *
	 * @since 3.24.3
	 *
	 * @param string $method The HTTP method to use for the request.
	 * @return WP_HTTP_Request_Args The request options for the remote API request.
	 */
	protected function get_request_options( string $method ): array {
		$options = parent::get_request_options( $method );

		// Set the body to an empty array, as leaving it to '{}' causes errors.
		$options['body'] = array();

		return $options;
	}

	/**
	 * Processes the response from the remote API.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_HTTP_Response|WP_Error $response The response from the remote API.
	 * @return array<mixed>|WP_Error The processed response.
	 */
	protected function process_response( $response ) {
		if ( is_wp_error( $response ) ) {
			/** @var WP_Error $response */
			return $response;
		}

		return $response['response'];
	}

	/**
	 * Executes the API request.
	 *
	 * @since 3.19.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return WP_Error|array<mixed> The response from the API.
	 */
	public function call( array $args = array() ) {
		return $this->get_check_auth_result( $args );
	}
}
