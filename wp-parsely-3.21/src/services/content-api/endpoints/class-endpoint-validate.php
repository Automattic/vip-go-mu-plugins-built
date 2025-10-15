<?php
/**
 * Parse.ly Content API Endpoint: Validate
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Content_API\Endpoints;

use Parsely\Services\Base_Service_Endpoint;
use WP_Error;

/**
 * The endpoint for credentials validation.
 *
 * @since 3.17.0
 *
 * @phpstan-import-type WP_HTTP_Response from Base_Service_Endpoint
 */
class Endpoint_Validate extends Content_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public function get_endpoint(): string {
		return '/validate/secret';
	}

	/**
	 * Returns the query arguments for the API request.
	 *
	 * We want to validate the API key and secret, so we don't need to send any
	 * query arguments.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args The query arguments to send to the remote API.
	 * @return array<mixed> The query arguments for the API request.
	 */
	public function get_query_args( array $args = array() ): array {
		return $args;
	}

	/**
	 * Queries the Parse.ly API credentials validation endpoint.
	 *
	 * The API will return a 200 response if the credentials are valid and a 403
	 * response if they are not.
	 *
	 * @since 3.17.0
	 *
	 * @param string $api_key The API key to validate.
	 * @param string $secret_key The secret key to validate.
	 * @return array<mixed>|WP_Error The response from the remote API, or a WP_Error object if the response is an error.
	 */
	private function api_validate_credentials( string $api_key, string $secret_key ) {
		$query = array(
			'apikey' => $api_key,
			'secret' => $secret_key,
		);

		$response = $this->request( 'GET', $query );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( false === $response['success'] ) {
			return new WP_Error(
				$response['code'] ?? 403,
				$response['message'] ?? __( 'Unable to validate the API credentials', 'wp-parsely' )
			);
		}

		return $response;
	}

	/**
	 * Processes the response from the remote API.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_HTTP_Response|WP_Error $response The response from the remote API.
	 * @return array<mixed>|WP_Error The processed response.
	 */
	protected function process_response( $response ) {
		return Base_Service_Endpoint::process_response( $response );
	}

	/**
	 * Executes the API request.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return WP_Error|array<mixed> The response from the API request.
	 */
	public function call( array $args = array() ) {
		/** @var string $api_key */
		$api_key = $args['apikey'];
		/** @var string $secret */
		$secret = $args['secret'];

		return $this->api_validate_credentials( $api_key, $secret );
	}
}
