<?php
/**
 * HTTP Client service for making external requests
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Auth\VIP_Safe_Auth;
use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * HTTP Client Class.
 *
 * Provides a centralized service for making HTTP requests with authentication
 * handling and error management.
 */
final class HTTP_Client {

	/**
	 * Makes an HTTP request. $action is sent as X-Safe-Publish-Action and
	 * signed into the HMAC payload by VIP_Safe_Auth::get_auth_params().
	 *
	 * @param string $url              Request URL.
	 * @param string $action           Declared request action (see Request_Actions).
	 * @param array  $auth_credentials Optional. Authentication credentials. Default empty array.
	 * @param array  $additional_args  Optional. Additional request arguments. Default empty array.
	 * @return array|WP_Error Response or error.
	 */
	public function make_request(
		string $url,
		string $action,
		array $auth_credentials = array(),
		array $additional_args = array()
	): array|WP_Error {
		// Default request timeout in seconds (filterable).
		$timeout = apply_filters( 'safe_publish_request_timeout', 10 );

		// Determine SSL verification based on environment.
		$sslverify = $this->should_verify_ssl( $url );

		$request_args = array_merge(
			array(
				'timeout'     => $timeout,
				'user-agent'  => $this->get_user_agent(),
				'sslverify'   => $sslverify,
				'redirection' => 0, // Prevent redirects for security.
			),
			$additional_args
		);

		// Apply HMAC auth headers; Basic Auth layers on top when configured.
		$body        = $request_args['body'] ?? '';
		$auth_params = VIP_Safe_Auth::get_auth_params(
			$url,
			$action,
			$auth_credentials,
			'GET',
			$body
		);

		// Add authentication headers if available.
		if ( ! empty( $auth_params['headers'] ) ) {
			$request_args['headers'] = array_merge(
				$request_args['headers'] ?? array(),
				$auth_params['headers']
			);
		}

		// Add query parameters for authentication if needed.
		if ( ! empty( $auth_params['query_args'] ) ) {
			$url = add_query_arg( $auth_params['query_args'], $url );
		}

		/**
		 * Filters request arguments.
		 *
		 * @param array  $request_args Request arguments.
		 * @param string $url          Request URL.
		 */
		$request_args = apply_filters( 'safe_publish_request_args', $request_args, $url );

		$response = $this->safe_remote_get( $url, $request_args );

		if ( is_wp_error( $response ) ) {
			return new WP_Error(
				'request_failed',
				__( 'Failed to fetch data from source site.', 'safe-publish' ) . ' ' . $response->get_error_message()
			);
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $response_code ) {
			return new WP_Error(
				'http_error',
				sprintf(
					/* translators: %d: HTTP response code */
					__( 'Source site returned HTTP error %d.', 'safe-publish' ),
					$response_code
				)
			);
		}

		return $response;
	}

	/**
	 * Gets user agent string.
	 *
	 * @return string User agent string.
	 */
	public function get_user_agent(): string {
		$plugin_version = defined( 'SAFE_PUBLISH_VERSION' ) ? SAFE_PUBLISH_VERSION : '0.0.1';
		$site_url       = get_bloginfo( 'url' );

		return sprintf(
			'Safe Publish/%s; %s',
			$plugin_version,
			$site_url
		);
	}

	/**
	 * Makes a safe remote GET request.
	 *
	 * Non-VIP environments are routed through `wp_safe_remote_get` so the
	 * core `http_request_host_is_external` chain rejects loopback,
	 * link-local, and unique-local addresses unless an integration
	 * explicitly opts in.
	 *
	 * @param string $url  Request URL.
	 * @param array  $args Optional. Request arguments. Default empty array.
	 * @return array|WP_Error Response or error.
	 */
	public function safe_remote_get( string $url, array $args = array() ): array|WP_Error {
		// Use VIP-optimized function when available, fallback to core function.
		if ( function_exists( 'vip_safe_wp_remote_get' ) ) {
			return vip_safe_wp_remote_get( $url, '', 3, 5, 20, $args );
		}

		return wp_safe_remote_get( $url, $args );
	}

	/**
	 * Determines whether to verify SSL certificates based on environment and URL.
	 *
	 * @param string $url URL being requested.
	 * @return bool Whether to verify SSL certificates.
	 */
	public function should_verify_ssl( string $url ): bool {
		// Always verify SSL in VIP production environments.
		if ( defined( 'WPCOM_IS_VIP_ENV' ) && constant( 'WPCOM_IS_VIP_ENV' ) ) {
			return true;
		}

		// Parse URL to check for development indicators.
		$parsed_url = wp_parse_url( $url );
		$host       = $parsed_url['host'] ?? '';

		// Development domains where SSL verification can be disabled.
		$dev_domains = array(
			'.test',
			'.local',
			'.dev',
			'localhost',
			'127.0.0.1',
			'::1',
		);

		// Check if this is a development domain.
		foreach ( $dev_domains as $dev_domain ) {
			if ( $host === $dev_domain ||
				( function_exists( 'str_ends_with' ) && str_ends_with( $host, $dev_domain ) ) ||
				( ! function_exists( 'str_ends_with' ) && substr( $host, -strlen( $dev_domain ) ) === $dev_domain ) ) {
				// Allow filtering for specific development needs.
				return apply_filters( 'safe_publish_dev_ssl_verify', false, $url );
			}
		}

		// For production domains, always verify SSL.
		return true;
	}

	/**
	 * Cleans up a temporary file.
	 *
	 * @param string $temp_file Path to temporary file.
	 */
	public function cleanup_temp_file( string $temp_file ): void {
		if ( empty( $temp_file ) || is_wp_error( $temp_file ) ) {
			return;
		}

		// Only attempt cleanup if file exists and is a temp file.
		if ( file_exists( $temp_file ) && strpos( $temp_file, '/tmp/' ) !== false ) {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.file_ops_unlink -- Temp file cleanup after media import, file is in /tmp/ directory
			unlink( $temp_file );
		}
	}

	/**
	 * Downloads a file using the WordPress core function.
	 *
	 * @param string $url File URL.
	 * @return string|WP_Error Path to downloaded file on success, WP_Error on failure.
	 */
	public function download_file( string $url ): string|WP_Error {
		// Use download_url for proper file handling - WordPress core function.
		return download_url( $url );
	}
}
