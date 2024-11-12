<?php
/**
 * Parse.ly Suggestions API endpoint base class.
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Suggestions_API\Endpoints;

use Parsely\Services\Base_Service_Endpoint;
use WP_Error;

/**
 * The base class for the suggestions API endpoints.
 *
 * @since 3.17.0
 *
 * @link https://content-suggestions-api.parsely.net/prod/docs
 *
 * @phpstan-import-type WP_HTTP_Response from Base_Service_Endpoint
 * @phpstan-import-type WP_HTTP_Request_Args from Base_Service_Endpoint
 */
abstract class Suggestions_API_Base_Endpoint extends Base_Service_Endpoint {
	/**
	 * Flag to truncate the content of the request body.
	 *
	 * By setting it to true, the content of the request body will be truncated to a maximum length.
	 *
	 * @since 3.17.0
	 *
	 * @var bool
	 */
	protected const TRUNCATE_CONTENT = true;

	/**
	 * Returns the request options for the remote API request.
	 *
	 * @since 3.17.0
	 *
	 * @param string $method The HTTP method to use for the request.
	 * @return WP_HTTP_Request_Args The request options for the remote API request.
	 */
	protected function get_request_options( string $method ): array {
		$options = array(
			'method'      => $method,
			'headers'     => array( 'Content-Type' => 'application/json; charset=utf-8' ),
			'data_format' => 'body',
			'timeout'     => 60, //phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout
			'body'        => '{}',
		);

		// Add API key to request headers.
		if ( $this->get_parsely()->api_secret_is_set() ) {
			$options['headers']['X-APIKEY-SECRET'] = $this->get_parsely()->get_api_secret();
		}

		return $options;
	}

	/**
	 * Returns the common query arguments to send to the remote API.
	 *
	 * This method appends the API key and secret to the query arguments.
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
		if ( is_wp_error( $response ) ) {
			/** @var WP_Error $response */
			return $response;
		}

		// Handle any errors returned by the API.
		if ( 200 !== $response['response']['code'] ) {
			$error = json_decode( wp_remote_retrieve_body( $response ), true );

			if ( ! is_array( $error ) ) {
				return new WP_Error(
					400,
					__( 'Unable to decode upstream API error', 'wp-parsely' )
				);
			}

			return new WP_Error( $error['error'], $error['detail'] );
		}

		$body    = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body, true );

		if ( ! is_array( $decoded ) ) {
			return new WP_Error( 400, __( 'Unable to decode upstream API response', 'wp-parsely' ) );
		}

		if ( ! is_array( $decoded['result'] ) ) {
			return new WP_Error( 400, __( 'Unable to parse data from upstream API', 'wp-parsely' ) );
		}

		return $decoded['result'];
	}
}
