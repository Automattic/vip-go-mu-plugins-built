<?php
/**
 * Remote API: Base class for remote API endpoints
 *
 * @package Parsely
 * @since   3.2.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use Parsely\Endpoints\Base_Endpoint;
use Parsely\Parsely;
use UnexpectedValueException;
use WP_Error;

use function Parsely\Utils\convert_to_associative_array;

/**
 * Base class for remote API endpoints.
 *
 * Child classes must add protected ENDPOINT, API_BASE_URL and QUERY_FILTER
 * constants.
 *
 * @since 3.2.0 Introduced as Remote_API_Base.
 * @since 3.11.0 Renamed to Base_Endpoint_Remote and moved some members into Base_Endpoint.
 *
 * @phpstan-type Remote_API_Error array{
 *   code: int,
 *   message: string,
 *   htmlMessage: string,
 * }
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
abstract class Base_Endpoint_Remote extends Base_Endpoint implements Remote_API_Interface {
	protected const API_BASE_URL = '';
	protected const QUERY_FILTER = '';

	/**
	 * Gets Parse.ly API endpoint.
	 *
	 * @since 3.6.2
	 *
	 * @return string
	 */
	public function get_endpoint(): string {
		return static::ENDPOINT;
	}

	/**
	 * Gets the URL for a particular Parse.ly API endpoint.
	 *
	 * @since 3.2.0
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @throws UnexpectedValueException If the endpoint constant is not defined.
	 * @throws UnexpectedValueException If the query filter constant is not defined.
	 * @return string
	 */
	public function get_api_url( array $query ): string {
		if ( static::ENDPOINT === '' ) {
			throw new UnexpectedValueException( 'ENDPOINT constant must be defined in child class.' );
		}
		if ( static::QUERY_FILTER === '' ) {
			throw new UnexpectedValueException( 'QUERY_FILTER constant must be defined in child class.' );
		}

		$query['apikey'] = $this->parsely->get_site_id();
		if ( $this->parsely->api_secret_is_set() ) {
			$query['secret'] = $this->parsely->get_api_secret();
		}
		$query = array_filter( $query );

		// Sort by key so the query args are in alphabetical order.
		ksort( $query );

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Hook names are defined in child classes.
		$query = apply_filters( static::QUERY_FILTER, $query );
		return add_query_arg( $query, static::API_BASE_URL . static::ENDPOINT );
	}

	/**
	 * Gets items from the specified endpoint.
	 *
	 * @since 3.2.0
	 * @since 3.7.0 Added $associative param.
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @param bool                 $associative When TRUE, returned objects will be converted into associative arrays.
	 * @return array<string, mixed>|object|WP_Error
	 */
	public function get_items( array $query, bool $associative = false ) {
		$full_api_url = $this->get_api_url( $query );

		/**
		 * GET request options.
		 *
		 * @var WP_HTTP_Request_Args $options
		 */
		$options  = $this->get_request_options();
		$response = wp_safe_remote_get( $full_api_url, $options );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body    = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body );

		if ( ! is_object( $decoded ) ) {
			return new WP_Error( 400, __( 'Unable to decode upstream API response', 'wp-parsely' ) );
		}

		if ( ! property_exists( $decoded, 'data' ) ) {
			return new WP_Error( $decoded->code ?? 400, $decoded->message ?? __( 'Unable to read data from upstream API', 'wp-parsely' ) );
		}

		if ( ! is_array( $decoded->data ) ) {
			return new WP_Error( 400, __( 'Unable to parse data from upstream API', 'wp-parsely' ) );
		}

		$data = $decoded->data;

		return $associative ? convert_to_associative_array( $data ) : $data;
	}

	/**
	 * Returns the request's options for the remote API call.
	 *
	 * @since 3.9.0
	 *
	 * @return array<string, mixed> The array of options.
	 */
	protected function get_request_options(): array {
		return array();
	}
}
