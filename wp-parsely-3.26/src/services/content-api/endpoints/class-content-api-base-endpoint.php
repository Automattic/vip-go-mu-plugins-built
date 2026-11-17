<?php
/**
 * Parse.ly Content API Base Endpoint
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Content_API\Endpoints;

use Parsely\Services\Base_Service_Endpoint;
use WP_Error;

/**
 * The base class for the Content API service endpoints.
 *
 * @since 3.17.0
 *
 * @phpstan-type Content_API_Valid_Response array{
 *     data: array<mixed>,
 * }
 *
 * @phpstan-type Content_API_Error_Response array{
 *    code?: int,
 *    message?: string,
 * }
 *
 * @phpstan-type Content_API_Response = Content_API_Valid_Response|Content_API_Error_Response
 *
 * @phpstan-import-type WP_HTTP_Response from Base_Service_Endpoint
 */
abstract class Content_API_Base_Endpoint extends Base_Service_Endpoint {
	/**
	 * Returns the common query arguments to send to the remote API.
	 *
	 * This method append the API key and secret to the query arguments.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args Additional query arguments to send to the remote API.
	 * @return array<mixed> The query arguments to send to the remote API.
	 */
	protected function get_query_args( array $args = array() ): array {
		$query_args = parent::get_query_args( $args );

		// Set up the API key and secret.
		$query_args['apikey'] = $this->get_parsely()->get_site_id();
		if ( $this->get_parsely()->api_secret_is_set() ) {
			$query_args['secret'] = $this->get_parsely()->get_api_secret();
		}

		return $query_args;
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
		$response = parent::process_response( $response );

		if ( is_wp_error( $response ) ) {
			/** @var WP_Error $response */
			return $response;
		}

		if ( ! isset( $response['data'] ) ) {
			/** @var Content_API_Error_Response $response */
			return new WP_Error(
				$response['code'] ?? 400,
				$response['message'] ?? __( 'Unable to read data from upstream API', 'wp-parsely' ),
				array( 'status' => $response['code'] ?? 400 )
			);
		}

		if ( ! is_array( $response['data'] ) ) {
			return new WP_Error( 400, __( 'Unable to parse data from upstream API', 'wp-parsely' ) );
		}

		/** @var Content_API_Valid_Response $response */
		return $response['data'];
	}
}
