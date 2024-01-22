<?php
/**
 * Class for Validate API (`/validate`)
 *
 * @package Parsely
 * @since   3.11.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use Parsely\Parsely;
use WP_Error;

use function Parsely\Utils\convert_to_associative_array;

/**
 * Class for credentials validation API (`/validate`).
 *
 * @since 3.11.0
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
class Validate_API extends Base_Endpoint_Remote {
	protected const API_BASE_URL = Parsely::PUBLIC_API_BASE_URL;
	protected const ENDPOINT     = '/validate/secret';
	protected const QUERY_FILTER = 'wp_parsely_validate_secret_endpoint_args';

	/**
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.11.0
	 *
	 * @var bool
	 */
	protected $is_public_endpoint = false;

	/**
	 * Gets the URL for the Parse.ly API credentials validation endpoint.
	 *
	 * @since 3.11.0
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @return string
	 */
	public function get_api_url( array $query ): string {
		$query = array(
			'apikey' => $query['apikey'],
			'secret' => $query['secret'],
		);

		return add_query_arg( $query, static::API_BASE_URL . static::ENDPOINT );
	}

	/**
	 * Queries the Parse.ly API credentials validation endpoint.
	 * The API will return a 200 response if the credentials are valid and a 401 response if they are not.
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @return object|WP_Error The response from the remote API, or a WP_Error object if the response is an error.
	 */
	private function api_validate_credentials( array $query ) {
		/**
		 * GET request options.
		 *
		 * @var WP_HTTP_Request_Args $options
		 */
		$options  = $this->get_request_options();
		$response = wp_safe_remote_get( $this->get_api_url( $query ), $options );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body    = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body );

		if ( ! is_object( $decoded ) ) {
			return new WP_Error(
				400,
				__(
					'Unable to decode upstream API response',
					'wp-parsely'
				)
			);
		}

		if ( ! property_exists( $decoded, 'success' ) || false === $decoded->success ) {
			return new WP_Error(
				$decoded->code ?? 400,
				$decoded->message ?? __( 'Unable to read data from upstream API', 'wp-parsely' )
			);
		}

		return $decoded;
	}

	/**
	 * Returns the response from the Parse.ly API credentials validation endpoint.
	 *
	 * @since 3.11.0
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @param bool                 $associative (optional) When TRUE, returned objects will be converted into
	 *                             associative arrays.
	 * @return array<string, mixed>|object|WP_Error
	 */
	public function get_items( array $query, bool $associative = false ) {
		$api_request = $this->api_validate_credentials( $query );
		return $associative ? convert_to_associative_array( $api_request ) : $api_request;
	}
}
