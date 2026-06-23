<?php
/**
 * Mock Ingestion API - logs to terminal instead of calling Salesforce.
 *
 * Add to env.php:
 *
 * define( 'VIP_AGENTFORCE_MOCK_INGESTION_API', true );
 *
 * Optional local scenarios can be selected through:
 * - bearer token: `mock:401`, `mock:429`, `mock:500`, `mock:network`, `mock:rotate-recover`
 * - request/query/body param: `vip_agentforce_mock_scenario=401`
 * - WP option: `vip_agentforce_mock_ingestion_scenario`
 *
 * Omitted or unknown scenarios return 202 Accepted.
 */

if ( ! function_exists( 'vip_agentforce_mock_ingestion_api_handle_request' ) ) {
	/**
	 * Intercept local Salesforce Ingestion API calls.
	 *
	 * @param false|array<string, mixed>|\WP_Error $preempt     Preemptive response.
	 * @param array<string, mixed>                 $parsed_args Request args.
	 * @param string                               $url         Request URL.
	 * @return false|array<string, mixed>|\WP_Error Mock response or original preempt value.
	 */
	function vip_agentforce_mock_ingestion_api_handle_request( $preempt, array $parsed_args, string $url ) {
		if ( false === strpos( $url, '/api/v1/ingest/sources/' ) ) {
			return $preempt;
		}

		$method   = isset( $parsed_args['method'] ) ? (string) $parsed_args['method'] : 'UNKNOWN';
		$body     = isset( $parsed_args['body'] ) ? (string) $parsed_args['body'] : '';
		$token    = vip_agentforce_mock_ingestion_api_get_bearer_token( $parsed_args );
		$scenario = vip_agentforce_mock_ingestion_api_get_scenario( $parsed_args, $url, $token );
		$response = vip_agentforce_mock_ingestion_api_get_response( $scenario, $parsed_args, $url, $method, $token );

		vip_agentforce_mock_ingestion_api_record_request( $scenario, $response, $method, $url, $token );
		vip_agentforce_mock_ingestion_api_log_request( $scenario, $response, $method, $url, $body );

		return $response;
	}

	/**
	 * Resolve the local mock scenario from request params, token, path, or option.
	 *
	 * @param array<string, mixed> $parsed_args Request args.
	 * @param string               $url         Request URL.
	 * @param string               $token       Bearer token.
	 */
	function vip_agentforce_mock_ingestion_api_get_scenario( array $parsed_args, string $url, string $token ): string {
		$candidates = [
			vip_agentforce_mock_ingestion_api_get_url_param( $url, 'vip_agentforce_mock_scenario' ),
			vip_agentforce_mock_ingestion_api_get_url_param( $url, 'mock_scenario' ),
			vip_agentforce_mock_ingestion_api_get_body_param( $parsed_args, 'vip_agentforce_mock_scenario' ),
			vip_agentforce_mock_ingestion_api_get_body_param( $parsed_args, 'mock_scenario' ),
			$token,
			vip_agentforce_mock_ingestion_api_get_path_scenario( $url ),
			get_option( 'vip_agentforce_mock_ingestion_scenario', '' ),
		];

		foreach ( $candidates as $candidate ) {
			$scenario = vip_agentforce_mock_ingestion_api_normalize_scenario( $candidate );
			if ( '' !== $scenario ) {
				return $scenario;
			}
		}

		return '202';
	}

	/**
	 * Build a mock response for a scenario.
	 *
	 * @param string               $scenario    Normalized scenario.
	 * @param array<string, mixed> $parsed_args Request args.
	 * @param string               $url         Request URL.
	 * @param string               $method      HTTP method.
	 * @param string               $token       Bearer token.
	 * @return array<string, mixed>|\WP_Error Mock response.
	 */
	function vip_agentforce_mock_ingestion_api_get_response( string $scenario, array $parsed_args, string $url, string $method, string $token ) {
		if ( 'rotate-recover' === $scenario ) {
			if ( 'mock:rotate-recover' === $token ) {
				update_option( 'vip_agentforce_mock_ingestion_token', 'mock:202', false );
			}

			$scenario = '401';
		}

		if ( 'network' === $scenario ) {
			return new \WP_Error( 'vip_agentforce_mock_network_error', 'Mock network error from local ingestion API.' );
		}

		$status_code = (int) $scenario;
		$message     = vip_agentforce_mock_ingestion_api_status_message( $status_code );
		$headers     = [ 'content-type' => 'application/json' ];

		if ( in_array( $status_code, [ 429, 503 ], true ) ) {
			$headers['retry-after'] = (string) vip_agentforce_mock_ingestion_api_get_retry_after( $parsed_args, $url );
		}

		return [
			'headers'  => $headers,
			'body'     => wp_json_encode(
				[
					'local_mock'  => true,
					'scenario'    => $scenario,
					'method'      => $method,
					'status_code' => $status_code,
				]
			),
			'response' => [
				'code'    => $status_code,
				'message' => $message,
			],
			'cookies'  => [],
			'filename' => null,
		];
	}

	/**
	 * Extract the bearer token from request args.
	 *
	 * @param array<string, mixed> $parsed_args Request args.
	 */
	function vip_agentforce_mock_ingestion_api_get_bearer_token( array $parsed_args ): string {
		$headers       = isset( $parsed_args['headers'] ) && is_array( $parsed_args['headers'] ) ? $parsed_args['headers'] : [];
		$authorization = $headers['Authorization'] ?? $headers['authorization'] ?? '';
		$authorization = is_string( $authorization ) ? $authorization : '';
		$token         = preg_replace( '/^Bearer\s+/i', '', $authorization );

		return is_string( $token ) ? $token : '';
	}

	/**
	 * Normalize mock scenario aliases.
	 *
	 * @param mixed $candidate Raw scenario value.
	 */
	function vip_agentforce_mock_ingestion_api_normalize_scenario( $candidate ): string {
		if ( ! is_scalar( $candidate ) ) {
			return '';
		}

		$scenario = strtolower( trim( (string) $candidate ) );
		if ( '' === $scenario ) {
			return '';
		}

		foreach ( [ 'vip-agentforce-mock:', 'mock:', 'mock-' ] as $prefix ) {
			if ( 0 === strpos( $scenario, $prefix ) ) {
				$scenario = substr( $scenario, strlen( $prefix ) );
				break;
			}
		}

		$scenario = str_replace( '_', '-', $scenario );

		$aliases = [
			'accepted'            => '202',
			'ok'                  => '202',
			'pass'                => '202',
			'success'             => '202',
			'auth'                => '401',
			'auth-broken'         => '401',
			'auth-failure'        => '401',
			'unauthorized'        => '401',
			'forbidden'           => '403',
			'bad-request'         => '400',
			'not-found'           => '404',
			'timeout'             => '408',
			'rate-limit'          => '429',
			'rate-limited'        => '429',
			'server-error'        => '500',
			'service-unavailable' => '503',
			'network-error'       => 'network',
			'wp-error'            => 'network',
			'rotate'              => 'rotate-recover',
			'rotated-token'       => 'rotate-recover',
		];

		if ( isset( $aliases[ $scenario ] ) ) {
			return $aliases[ $scenario ];
		}

		if ( in_array( $scenario, [ '202', '400', '401', '403', '404', '408', '429', '500', '503', 'network', 'rotate-recover' ], true ) ) {
			return $scenario;
		}

		return '';
	}

	/**
	 * Get a scenario from a URL query string.
	 */
	function vip_agentforce_mock_ingestion_api_get_url_param( string $url, string $key ): string {
		$query = (string) wp_parse_url( $url, PHP_URL_QUERY );
		if ( '' === $query ) {
			return '';
		}

		parse_str( $query, $params );
		$value = $params[ $key ] ?? '';

		return is_scalar( $value ) ? (string) $value : '';
	}

	/**
	 * Get a scenario from a JSON request body.
	 *
	 * @param array<string, mixed> $parsed_args Request args.
	 */
	function vip_agentforce_mock_ingestion_api_get_body_param( array $parsed_args, string $key ): string {
		$body = $parsed_args['body'] ?? '';
		if ( ! is_string( $body ) || '' === $body ) {
			return '';
		}

		$data = json_decode( $body, true );
		if ( ! is_array( $data ) ) {
			return '';
		}

		$value = $data[ $key ] ?? $data['data'][0][ $key ] ?? '';

		return is_scalar( $value ) ? (string) $value : '';
	}

	/**
	 * Get a scenario from source/object path segments.
	 */
	function vip_agentforce_mock_ingestion_api_get_path_scenario( string $url ): string {
		$path = (string) wp_parse_url( $url, PHP_URL_PATH );
		if ( '' === $path ) {
			return '';
		}

		$segments = array_map( 'rawurldecode', explode( '/', trim( $path, '/' ) ) );
		$index    = array_search( 'sources', $segments, true );
		if ( false === $index ) {
			return '';
		}

		$source = $segments[ $index + 1 ] ?? '';
		$object = $segments[ $index + 2 ] ?? '';

		foreach ( [ $source, $object ] as $segment ) {
			$scenario = vip_agentforce_mock_ingestion_api_normalize_scenario( $segment );
			if ( '' !== $scenario ) {
				return $scenario;
			}
		}

		return '';
	}

	/**
	 * Resolve Retry-After for retryable mock statuses.
	 *
	 * @param array<string, mixed> $parsed_args Request args.
	 */
	function vip_agentforce_mock_ingestion_api_get_retry_after( array $parsed_args, string $url ): int {
		$value = vip_agentforce_mock_ingestion_api_get_url_param( $url, 'vip_agentforce_mock_retry_after' );
		if ( '' === $value ) {
			$value = vip_agentforce_mock_ingestion_api_get_body_param( $parsed_args, 'vip_agentforce_mock_retry_after' );
		}
		if ( '' === $value ) {
			$value = get_option( 'vip_agentforce_mock_ingestion_retry_after', 3 );
		}

		return max( 1, (int) $value );
	}

	/**
	 * Get the reason phrase for a mock status code.
	 */
	function vip_agentforce_mock_ingestion_api_status_message( int $status_code ): string {
		$messages = [
			202 => 'Accepted',
			400 => 'Bad Request',
			401 => 'Unauthorized',
			403 => 'Forbidden',
			404 => 'Not Found',
			408 => 'Request Timeout',
			429 => 'Too Many Requests',
			500 => 'Internal Server Error',
			503 => 'Service Unavailable',
		];

		return $messages[ $status_code ] ?? 'Accepted';
	}

	/**
	 * Record mock requests for local inspection.
	 *
	 * @param array<string, mixed>|\WP_Error $response Mock response.
	 */
	function vip_agentforce_mock_ingestion_api_record_request( string $scenario, $response, string $method, string $url, string $token ): void {
		$requests = get_option( 'vip_agentforce_mock_ingestion_requests', [] );
		$requests = is_array( $requests ) ? $requests : [];

		$status_code = is_wp_error( $response ) ? 'WP_Error' : (string) ( $response['response']['code'] ?? 'unknown' );
		$token_label = 0 === strpos( $token, 'mock' ) ? $token : ( '' === $token ? '' : 'non-mock-token' );

		$requests[] = [
			'time'     => gmdate( 'c' ),
			'method'   => $method,
			'scenario' => $scenario,
			'status'   => $status_code,
			'token'    => $token_label,
			'url'      => $url,
		];

		update_option( 'vip_agentforce_mock_ingestion_requests', $requests, false );
	}

	/**
	 * Log a readable mock request summary for WP-CLI.
	 *
	 * @param array<string, mixed>|\WP_Error $response Mock response.
	 */
	function vip_agentforce_mock_ingestion_api_log_request( string $scenario, $response, string $method, string $url, string $body ): void {
		if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
			return;
		}

		$status = is_wp_error( $response )
			? 'WP_Error ' . $response->get_error_code()
			: (string) ( $response['response']['code'] ?? 'unknown' ) . ' ' . (string) ( $response['response']['message'] ?? '' );

		\WP_CLI::log( '' );
		\WP_CLI::log( '{{cyan}}┌────────────────────────────────────────────────────{{reset}}' );
		\WP_CLI::log( "{{cyan}}│ [MOCK API] $method request intercepted{{reset}}" );
		\WP_CLI::log( "{{cyan}}│{{reset}} Scenario: $scenario" );
		\WP_CLI::log( "{{cyan}}│{{reset}} URL: $url" );

		if ( 'POST' === $method ) {
			$data = json_decode( $body, true );
			if ( isset( $data['data'][0] ) && is_array( $data['data'][0] ) ) {
				$record         = $data['data'][0];
				$record_id      = $record['site_id_blog_id_post_id'] ?? 'unknown';
				$title          = $record['title'] ?? $record['post_title'] ?? 'unknown';
				$publish_status = $record['published'] ?? 'unknown';
				\WP_CLI::log( "{{cyan}}│{{reset}} Record ID: $record_id" );
				\WP_CLI::log( "{{cyan}}│{{reset}} Title: $title" );
				\WP_CLI::log( "{{cyan}}│{{reset}} Published: $publish_status" );
			}
		} elseif ( 'DELETE' === $method ) {
			$data = json_decode( $body, true );
			if ( isset( $data['ids'][0] ) ) {
				\WP_CLI::log( '{{cyan}}│{{reset}} Deleting ID: ' . $data['ids'][0] );
			}
		}

		\WP_CLI::log( "{{cyan}}│{{reset}} Status: {{green}}$status (MOCKED){{reset}}" );
		\WP_CLI::log( '{{cyan}}└────────────────────────────────────────────────────{{reset}}' );
	}
}

add_filter( 'pre_http_request', 'vip_agentforce_mock_ingestion_api_handle_request', 10, 3 );
