<?php
/**
 * External Service API endpoint base class.
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services;

use Parsely\Parsely;
use WP_Error;

/**
 * Base class for API service endpoints.
 *
 * @since 3.17.0
 *
 * @phpstan-type WP_HTTP_Response array{
 *      headers: array<string, string>,
 *      body: string,
 *      response: array{
 *       code: int|false,
 *       message: string|false,
 *      },
 *      cookies: array<string, string>,
 *      http_response: \WP_HTTP_Requests_Response|null,
 *  }
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
abstract class Base_Service_Endpoint {
	/**
	 * The API service that this endpoint belongs to.
	 *
	 * @since 3.17.0
	 *
	 * @var Base_API_Service
	 */
	protected $api_service;

	/**
	 * Flag to truncate the content of the request body.
	 *
	 * If set to true, the content of the request body will be truncated to a maximum length.
	 *
	 * @since 3.14.1
	 * @since 3.17.0 Moved to the Base_Service_Endpoint class.
	 *
	 * @var bool
	 */
	protected const TRUNCATE_CONTENT = false;

	/**
	 * The maximum length of the content of the request body.
	 *
	 * @since 3.14.1
	 * @since 3.17.0 Moved to the Base_Service_Endpoint class.
	 *
	 * @var int
	 */
	protected const TRUNCATE_CONTENT_LENGTH = 25000;

	/**
	 * The query arguments removed from relayed messages.
	 *
	 * The Site ID isn't listed, as it's public and aids diagnosis.
	 *
	 * @since 3.24.2
	 *
	 * @var array<string>
	 */
	private const CREDENTIAL_QUERY_ARGS = array( 'secret' );

	/**
	 * Initializes the class.
	 *
	 * @since 3.17.0
	 *
	 * @param Base_API_Service $api_service The API service that this endpoint belongs to.
	 */
	public function __construct( Base_API_Service $api_service ) {
		$this->api_service = $api_service;
	}

	/**
	 * Returns the headers to send with the request.
	 *
	 * @since 3.17.0
	 *
	 * @return array<string, string> The headers to send with the request.
	 */
	protected function get_headers(): array {
		return array(
			'Content-Type' => 'application/json',
		);
	}

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
			'headers' => $this->get_headers(),
			'method'  => $method,
			'timeout' => 60, // phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout
		);

		return $options;
	}

	/**
	 * Returns the common query arguments to send to the remote API.
	 *
	 * This can be used for setting common query arguments that are shared
	 * across multiple endpoints, such as the API key.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args Additional query arguments to send to the remote API.
	 * @return array<mixed> The query arguments to send to the remote API.
	 */
	protected function get_query_args( array $args = array() ): array {
		return $args;
	}

	/**
	 * Executes the API request.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return WP_Error|array<mixed> The response from the API.
	 */
	abstract public function call( array $args = array() );

	/**
	 * Returns the endpoint for the API request.
	 *
	 * This should be the path to the endpoint, not the full URL.
	 * Override this method in the child class to return the endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return string The endpoint for the API request.
	 */
	abstract public function get_endpoint(): string;

	/**
	 * Returns the full URL for the API request, including the endpoint and query arguments.
	 *
	 * @since 3.17.0
	 * @since 3.24.2 Encodes the query argument values.
	 *
	 * @param array<mixed> $query_args The query arguments to send to the remote API.
	 * @return string The full URL for the API request.
	 */
	public function get_endpoint_url( array $query_args = array() ): string {
		// Get the base URL from the API service.
		$base_url = $this->api_service->get_api_url();

		// Append the endpoint to the base URL.
		$base_url .= $this->get_endpoint();

		$query_args = $this->get_query_args( $query_args );

		// add_query_arg() doesn't encode values, so `&` or `#` in one would alter the query.
		// Decoding first keeps already-encoded values, like non-Latin permalinks, from being encoded twice.
		foreach ( $query_args as $key => $value ) {
			if ( is_string( $value ) ) {
				$query_args[ $key ] = rawurlencode( rawurldecode( $value ) );
			}
		}

		// Append any necessary query arguments.
		$endpoint = add_query_arg( $query_args, $base_url );

		return $endpoint;
	}

	/**
	 * Sends a request to the remote API.
	 *
	 * Any error returned has its credentials stripped. Endpoints customize the
	 * request through the methods called here, rather than by overriding it.
	 *
	 * @since 3.17.0
	 * @since 3.24.3 Made final.
	 *
	 * @param string       $method The HTTP method to use for the request.
	 * @param array<mixed> $query_args The query arguments to send to the remote API.
	 * @param array<mixed> $data The data to send in the request body.
	 * @return WP_Error|array<mixed> The response from the remote API.
	 */
	final protected function request( string $method, array $query_args = array(), array $data = array() ) {
		// Get the URL to send the request to.
		$request_url = $this->get_endpoint_url( $query_args );

		// Build the request options.
		$request_options = $this->get_request_options( $method );

		if ( count( $data ) > 0 ) {
			if ( true === static::TRUNCATE_CONTENT ) {
				$data = $this->truncate_array_content( $data );
			}

			$request_options['body'] = wp_json_encode( $data );
			if ( false === $request_options['body'] ) {
				return new WP_Error( 400, __( 'Unable to encode request body', 'wp-parsely' ) );
			}
		}

		/** @var WP_HTTP_Response|WP_Error $response */
		$response = wp_safe_remote_request( $request_url, $request_options );

		if ( is_wp_error( $response ) ) {
			return $this->get_relayable_transport_error( $response );
		}

		$result = $this->process_response( $response );

		return is_wp_error( $result ) ? $this->strip_credentials_from_error( $result ) : $result;
	}

	/**
	 * Returns a transport error reduced to its code and first message, without
	 * the credentials.
	 *
	 * Its other messages and data are dropped, as `pre_http_request` and other
	 * filters can attach anything to it, including the request headers.
	 *
	 * @since 3.24.2
	 * @since 3.24.3 Made final.
	 *
	 * @param WP_Error $error The transport error.
	 * @return WP_Error The error to relay to the caller.
	 */
	final protected function get_relayable_transport_error( WP_Error $error ): WP_Error {
		return $this->strip_credentials_from_error(
			new WP_Error(
				$error->get_error_code(),
				$error->get_error_message(),
				array( 'status' => 500 )
			)
		);
	}

	/**
	 * Processes the response from the remote API.
	 *
	 * @since 3.17.0
	 * @since 3.24.2 Added the upstream status code check.
	 *
	 * @param WP_HTTP_Response|WP_Error $response The response from the remote API.
	 * @return array<mixed>|WP_Error The processed response.
	 */
	protected function process_response( $response ) {
		if ( is_wp_error( $response ) ) {
			/** @var WP_Error $response */
			return $response;
		}

		$body    = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body, true );

		// A parseable body does not mean the request succeeded.
		$status_code = (int) wp_remote_retrieve_response_code( $response );
		if ( 0 !== $status_code && ( $status_code < 200 || $status_code >= 300 ) ) {
			// The upstream message is kept, as request() strips the credentials.
			$message = is_array( $decoded ) && isset( $decoded['message'] ) && is_string( $decoded['message'] ) && '' !== $decoded['message']
				? $decoded['message']
				: __( 'The upstream API returned an unsuccessful response', 'wp-parsely' );

			return new WP_Error( $status_code, $message, array( 'status' => $status_code ) );
		}

		if ( ! is_array( $decoded ) ) {
			return new WP_Error( 400, __( 'Unable to decode upstream API response', 'wp-parsely' ) );
		}

		return $decoded;
	}

	/**
	 * Removes the credentials from a message relayed to the caller.
	 *
	 * Arguments are dropped by name rather than by value, so values altered by
	 * the URL builder are covered too.
	 *
	 * @since 3.24.2
	 * @since 3.24.3 Made final.
	 *
	 * @param string $message The message to strip.
	 * @return string The message, without the credentials.
	 */
	final protected function strip_credentials( string $message ): string {
		if ( '' === $message ) {
			return $message;
		}

		foreach ( self::CREDENTIAL_QUERY_ARGS as $arg ) {
			$arg = preg_quote( $arg, '/' );

			// Keeps the separator when arguments follow, drops it when trailing.
			$message = (string) preg_replace(
				array( '/([?&])' . $arg . '=[^&\s]*&/i', '/[?&]' . $arg . '=[^&\s]*/i' ),
				array( '$1', '' ),
				$message
			);
		}

		// Also catches the secret outside a query string.
		$secret = $this->get_parsely()->get_api_secret();
		if ( '' !== $secret ) {
			$message = str_replace( $secret, '', $message );
		}

		// An encoded copy, such as a URL encoded by a filter, can't be stripped in place.
		if ( $this->has_encoded_credentials( $message, $secret ) ) {
			return __( 'The upstream API request failed.', 'wp-parsely' );
		}

		return $message;
	}

	/**
	 * Returns whether the URL-decoded or JSON-unescaped forms of a message
	 * still contain a credential.
	 *
	 * @since 3.24.2
	 *
	 * @param string $message The message, already stripped of its plain credentials.
	 * @param string $secret  The API Secret.
	 * @return bool Whether the message holds an encoded credential.
	 */
	private function has_encoded_credentials( string $message, string $secret ): bool {
		$decoded = $message;

		// Up to triple encoding, as each layer of code relaying a URL can encode it again.
		for ( $i = 0; $i < 3; $i++ ) {
			$decoded = str_replace( '\\/', '/', rawurldecode( $decoded ) );

			if ( '' !== $secret && false !== strpos( $decoded, $secret ) ) {
				return true;
			}

			foreach ( self::CREDENTIAL_QUERY_ARGS as $arg ) {
				if ( 1 === preg_match( '/[?&]' . preg_quote( $arg, '/' ) . '=/i', $decoded ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Removes the credentials from every message held by an error.
	 *
	 * @since 3.24.2
	 * @since 3.24.3 Made final.
	 *
	 * @param WP_Error $error The error to strip.
	 * @return WP_Error The error, without the credentials.
	 */
	final protected function strip_credentials_from_error( WP_Error $error ): WP_Error {
		$codes = $error->get_error_codes();

		if ( 0 === count( $codes ) ) {
			return $error;
		}

		$stripped = new WP_Error();

		foreach ( $codes as $code ) {
			foreach ( $error->get_error_messages( $code ) as $message ) {
				$stripped->add(
					$code,
					$this->strip_credentials( $message ),
					$error->get_error_data( $code )
				);
			}
		}

		return $stripped;
	}

	/**
	 * Returns the Parsely instance.
	 *
	 * @since 3.17.0
	 *
	 * @return Parsely The Parsely instance.
	 */
	public function get_parsely(): Parsely {
		return $this->api_service->get_parsely();
	}

	/**
	 * Truncates the content of an array to a maximum length.
	 *
	 * @since 3.14.1
	 * @since 3.17.0 Moved to the Base_Service_Endpoint class.
	 *
	 * @param string|array|mixed $content The content to truncate.
	 * @return string|array|mixed The truncated content.
	 */
	private function truncate_array_content( $content ) {
		if ( is_array( $content ) ) {
			// If the content is an array, iterate over its elements.
			foreach ( $content as $key => $value ) {
				// Recursively process/truncate each element of the array.
				$content[ $key ] = $this->truncate_array_content( $value );
			}
			return $content;
		} elseif ( is_string( $content ) ) {
			// Check if the string length exceeds the maximum and truncate if necessary.
			if ( mb_strlen( $content ) > self::TRUNCATE_CONTENT_LENGTH ) {
				return mb_substr( $content, 0, self::TRUNCATE_CONTENT_LENGTH );
			}
			return $content;
		}
		return $content;
	}
}
