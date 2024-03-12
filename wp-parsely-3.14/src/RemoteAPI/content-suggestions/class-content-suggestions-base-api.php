<?php
/**
 * Remote API: Base class for all Parse.ly Content Suggestion API endpoints
 *
 * @package Parsely
 * @since   3.12.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI\ContentSuggestions;

use Parsely\Endpoints\Base_Endpoint;
use Parsely\Parsely;
use Parsely\RemoteAPI\Base_Endpoint_Remote;
use UnexpectedValueException;
use WP_Error;

/**
 * Base API for all Parse.ly Content Suggestion API endpoints.
 *
 * @since 3.12.0
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
abstract class Content_Suggestions_Base_API extends Base_Endpoint_Remote {
	protected const API_BASE_URL = Parsely::PUBLIC_SUGGESTIONS_API_BASE_URL;

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0
	 *
	 * @return bool
	 */
	public function is_available_to_current_user(): bool {
		return current_user_can(
			// phpcs:ignore WordPress.WP.Capabilities.Undetermined
			$this->apply_capability_filters(
				Base_Endpoint::DEFAULT_ACCESS_CAPABILITY
			)
		);
	}

	/**
	 * Returns the request's options for the remote API call.
	 *
	 * @since 3.12.0
	 *
	 * @return array<string, mixed> The array of options.
	 */
	public function get_request_options(): array {
		$options = array(
			'headers'     => array( 'Content-Type' => 'application/json; charset=utf-8' ),
			'data_format' => 'body',
			'timeout'     => 60, //phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout
			'body'        => '{}',
		);

		// Add API key to request headers.
		if ( $this->parsely->api_secret_is_set() ) {
			$options['headers']['X-APIKEY-SECRET'] = $this->parsely->get_api_secret();
		}

		return $options;
	}

	/**
	 * Gets the URL for a particular Parse.ly API Content Suggestion endpoint.
	 *
	 * @since 3.14.0
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @throws UnexpectedValueException If the endpoint constant is not defined.
	 * @throws UnexpectedValueException If the query filter constant is not defined.
	 * @return string
	 */
	public function get_api_url( array $query = array() ): string {
		$this->validate_required_constraints();

		$query['apikey'] = $this->parsely->get_site_id();

		// Remove empty entries and sort by key so the query args are in
		// alphabetical order.
		$query = array_filter( $query );
		ksort( $query );

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Hook names are defined in child classes.
		$query = apply_filters( static::QUERY_FILTER, $query );
		return add_query_arg( $query, static::API_BASE_URL . static::ENDPOINT );
	}

	/**
	 * Sends a POST request to the Parse.ly Content Suggestion API.
	 *
	 * This method sends a POST request to the Parse.ly Content Suggestion API and returns the
	 * response. The response is either a WP_Error object in case of an error, or a decoded JSON
	 * object in case of a successful request.
	 *
	 * @since 3.13.0
	 *
	 * @param array<string|int|bool>              $query An associative array containing the query
	 *                                                   parameters for the API request.
	 * @param array<string|int|bool|array<mixed>> $body An associative array containing the body
	 *                                                  parameters for the API request.
	 * @return WP_Error|object Returns a WP_Error object in case of an error, or a decoded JSON
	 *                         object in case of a successful request.
	 */
	protected function post_request( array $query = array(), array $body = array() ) {
		$full_api_url = $this->get_api_url( $query );

		/**
		 * GET request options.
		 *
		 * @var WP_HTTP_Request_Args $options
		 */
		$options = $this->get_request_options();
		if ( count( $body ) > 0 ) {
			$options['body'] = wp_json_encode( $body );
			if ( false === $options['body'] ) {
				return new WP_Error( 400, __( 'Unable to encode request body', 'wp-parsely' ) );
			}
		}

		$response = wp_safe_remote_post( $full_api_url, $options );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( 200 !== $response['response']['code'] ) {
			$error = $response['response'];
			return new WP_Error( $error['code'], $error['message'] );
		}

		$body    = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body );

		if ( ! is_object( $decoded ) ) {
			return new WP_Error( 400, __( 'Unable to decode upstream API response', 'wp-parsely' ) );
		}

		return $decoded;
	}
}
