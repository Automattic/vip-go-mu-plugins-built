<?php
/**
 * Base class for all Gist API endpoints requests.
 *
 * @package GistAnswers
 */

namespace GistAnswers\API;

use WP_Error;

use InvalidArgumentException;

use GistAnswers\Admin\MenuItems\ToolsOptions;
use GistAnswers\API\Credentials;
use GistAnswers\API\Get\PublisherGroups;
use GistAnswers\Plugin\GistURLs;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Base class for all Gist API endpoints requests.
 */
class Endpoint {

	/**
	 * Regular expression alternatives for the words that mark a field or query parameter name as a credential, whose
	 * value is redacted from logged responses (see redact_secrets()).
	 *
	 * @var string
	 */
	private const SECRET_NAME_PATTERN = 'ticket|token|secret|password|passwd|api_?key|authorization|credential|signature';

	/**
	 * The total number of seconds a front-end page may spend waiting on API requests; once it is used up, further
	 * requests on that page fail straight away rather than hold up rendering (see the
	 * `gist_answers_front_end_request_budget` filter).
	 *
	 * @var int
	 */
	private const FRONT_END_REQUEST_BUDGET = 3;

	/**
	 * The HTTP method for the endpoint request.
	 *
	 * @var string
	 */
	private string $method = '';

	/**
	 * The name(s) of the associated endpoints.
	 *
	 * @var array<string>
	 */
	private array $names = array();

	/**
	 * Parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	private array $params = array();

	/**
	 * Required parameters for the endpoint request (meant to be overridden in derived classes).
	 *
	 * @var array<mixed>
	 */
	protected array $required_params = array();

	/**
	 * Optional parameters for the endpoint request (meant to be overridden in derived classes).
	 *
	 * @var array<mixed>
	 */
	protected array $optional_params = array();

	/**
	 * The largest response body (in bytes) accepted from the endpoint; a larger one is treated as a failed request
	 * (meant to be overridden in derived classes whose responses are known to be smaller or larger).
	 *
	 * @var int
	 */
	protected int $max_response_bytes = MB_IN_BYTES;

	/**
	 * Valid parameters for the endpoint request.
	 *
	 * @var array<mixed>
	 */
	private array $valid_params = array();

	/**
	 * Timestamp for the endpoint request.
	 *
	 * @var int
	 */
	private int $request_timestamp = 0;

	/**
	 * The HTTP response code from the endpoint request.
	 *
	 * @var int
	 */
	private int $response_code = 0;

	/**
	 * The response content from the endpoint request.
	 *
	 * @var mixed
	 */
	private mixed $response_body = null;

	/**
	 * How many seconds the API asked to wait before trying again (from a `Retry-After` header), or 0.
	 *
	 * @var int
	 */
	private int $retry_after = 0;

	/**
	 * Optional API token for validation.
	 *
	 * @var string
	 */
	private string $token_to_validate = '';

	/**
	 * Number of API calls made during this render.
	 *
	 * @var int
	 */
	private static int $api_call_count = 0;

	/**
	 * Seconds spent waiting on API requests while rendering this front-end page (see FRONT_END_REQUEST_BUDGET).
	 *
	 * @var float
	 */
	private static float $front_end_seconds_spent = 0.0;

	/**
	 * Stored copy of the last response.
	 *
	 * @var object|null
	 */
	private static ?object $last_response = null;

	/**
	 * Class constructor.
	 *
	 * @param string        $method            The HTTP method for the endpoint request.
	 * @param string|string $name_or_names     The name(s) of the endpoint(s).
	 * @param array<mixed>  $params            Parameters for the endpoint request.
	 * @param string        $token_to_validate Optional API token for validation.
	 *
	 * @return void
	 */
	public function __construct( string $method, string|array $name_or_names, array $params, string $token_to_validate = '' ) {

		$method = $this->validate_method( $method );

		$names = is_array( $name_or_names ) ? $name_or_names : array( $name_or_names );

		$names = array_map( 'trim', $names );
		$names = array_map( 'strtolower', $names );

		$this->method            = $method;
		$this->names             = $names;
		$this->params            = $params;
		$this->token_to_validate = $token_to_validate;

		$this->valid_params = array_merge(
			$this->required_params,
			$this->optional_params,
		);

		$this->validate_params();

		$this->call();
	}

	/**
	 * Validate the HTTP method for the endpoint request.
	 *
	 * @param string $method The HTTP method to validate.
	 *
	 * @return string The validated HTTP method.
	 *
	 * @throws InvalidArgumentException If the HTTP method is invalid.
	 */
	private function validate_method( string $method ): string {

		$valid_methods = array(
			'DELETE',
			'GET',
			'PATCH',
			'POST',
			'PUT',
		);

		$method = trim( $method );
		$method = strtoupper( $method );

		if ( ! in_array( $method, $valid_methods, true ) ) {
			throw new InvalidArgumentException( sprintf( 'Invalid HTTP method: %s', esc_html( $method ) ) );
		}

		return $method;
	}

	/**
	 * Validate the parameters for the endpoint request.
	 *
	 * @return void
	 *
	 * @throws InvalidArgumentException If any required parameter is missing or an invalid parameter is provided.
	 */
	private function validate_params(): void {

		foreach ( $this->required_params as $required_param ) {
			if ( ! array_key_exists( $required_param, $this->params ) ) {
				throw new InvalidArgumentException( sprintf( 'Missing required parameter: %s', esc_html( $required_param ) ) );
			}
		}

		foreach ( $this->params as $param => $value ) {
			if ( ! in_array( $param, $this->valid_params, true ) ) {
				throw new InvalidArgumentException( sprintf( 'Invalid parameter provided: %s', esc_html( $param ) ) );
			}
		}

		foreach ( $this->params as $param => $value ) {
			if ( in_array( $param, $this->required_params, true ) && empty( $value ) ) {
				throw new InvalidArgumentException( sprintf( 'Required parameter cannot be empty: %s', esc_html( $param ) ) );
			}
		}
	}

	/**
	 * Make the API request to the endpoint.
	 *
	 * @return void
	 */
	private function call(): void {

		$api_token = $this->token_to_validate ? $this->token_to_validate : Credentials::get_api_token();

		// Without a token the Gist API can only reject the request, so it isn't sent, and that rejection is recorded instead.
		if ( '' === trim( $api_token ) ) {

			$this->request_timestamp = time();

			$this->process_response(
				array(
					'response' => array(
						'code'    => 401,
						'message' => 'Unauthorized',
					),
					'body'     => wp_json_encode( array( 'error' => 'No Gist Answers API token is configured.' ) ),
				)
			);

			return;
		}

		$endpoint_url = $this->extract_params_into_url();

		// Every request carries the API token, so redirects are never followed (a redirect to another origin would
		// receive the token too), and unsafe destinations (e.g., private addresses or unusual ports) are refused. The
		// response size is capped one byte above the limit, so that an oversized response can be told apart.
		$args = array(
			'headers'             => array(
				'X-API-Token'  => $api_token,
				'X-CMS-Origin' => get_home_url(),
			),
			'redirection'         => 0,
			'reject_unsafe_urls'  => true,
			'limit_response_size' => $this->max_response_bytes + 1,
		);

		switch ( $this->method ) {

			case 'GET':
				$endpoint_url = add_query_arg( $this->params, $endpoint_url );
				break;

			case 'DELETE':
			case 'PATCH':
			case 'POST':
			case 'PUT':
				$args['method']                  = $this->method;
				$args['body']                    = wp_json_encode( $this->params );
				$args['headers']['Content-Type'] = 'application/json';
				break;
		}

		$is_front_end = self::is_front_end_request();

		/**
		 * Filter the timeout (in seconds) for requests to the Gist Answers API.
		 *
		 * @param int  $timeout      The timeout: 2 seconds on the front end, where requests block page rendering, and
		 *                           3 seconds elsewhere.
		 * @param bool $is_front_end Whether the request is being made while rendering a front-end page.
		 */
		$args['timeout'] = intval( apply_filters( 'gist_answers_api_timeout', $is_front_end ? 2 : 3, $is_front_end ) );

		$this->request_timestamp = time();

		if ( $is_front_end ) {

			/**
			 * Filter the total number of seconds a front-end page may spend waiting on Gist Answers API requests.
			 *
			 * Once the budget is used up, further requests on that page fail straight away (and the widgets that need
			 * them are left out), rather than hold up rendering.
			 *
			 * @param int $budget The budget in seconds. Defaults to 3.
			 */
			$budget = floatval( apply_filters( 'gist_answers_front_end_request_budget', self::FRONT_END_REQUEST_BUDGET ) );

			if ( self::$front_end_seconds_spent >= $budget ) {
				$this->process_response( new WP_Error( 'gist_answers_api_budget_exhausted', 'The time allowed for Gist Answers API requests on this page has been used up.' ) );
				return;
			}

			// A request may not wait longer than the budget that is left.
			$args['timeout'] = max( 1, min( $args['timeout'], intval( ceil( $budget - self::$front_end_seconds_spent ) ) ) );
		}

		$started = microtime( true );

		// On WordPress VIP, front-end requests use the safe request helper, which backs off after repeated failures.
		if ( $is_front_end && function_exists( 'vip_safe_wp_remote_request' ) ) {
			$response = vip_safe_wp_remote_request( $endpoint_url, new WP_Error( 'gist_answers_api_unavailable', 'The Gist Answers API is temporarily unavailable.' ), 3, $args['timeout'], 20, $args );
		} else {
			$response = wp_remote_request( $endpoint_url, $args );
		}

		if ( $is_front_end ) {
			self::$front_end_seconds_spent += microtime( true ) - $started;
		}

		$this->process_response( $response );

		++self::$api_call_count;
	}

	/**
	 * Process the response to this request.
	 *
	 * @param mixed $response The response from wp_remote_request().
	 *
	 * @return void
	 */
	private function process_response( mixed $response ): void {

		if ( is_wp_error( $response ) ) {
			$this->response_body = $response->get_error_message();
			$this->response_code = 0;
		} else {
			$this->response_body = wp_remote_retrieve_body( $response );
			$this->response_code = wp_remote_retrieve_response_code( $response );
			$this->retry_after   = self::parse_retry_after( wp_remote_retrieve_header( $response, 'retry-after' ) );
		}

		$this->response_code = intval( $this->response_code );

		// The response was cut off at the size limit (see call()), so it can't be used.
		if ( 0 !== $this->response_code && strlen( strval( $this->response_body ) ) > $this->max_response_bytes ) {
			$this->response_code = 0;
			$this->response_body = sprintf( 'The Gist Answers API response was larger than %d bytes.', $this->max_response_bytes );
		}

		if ( 0 === $this->response_code ) {
			$this->response_code = 999;
			$this->response_body = wp_json_encode(
				array(
					'error' => wp_strip_all_tags( $this->response_body ),
				)
			);
		}

		if ( in_array( $this->response_code, array( 401, 403 ), true ) ) {
			Credentials::delete_primary_transient();
		}

		self::$last_response = $this->response();

		$this->maybe_log_response();
	}

	/**
	 * Parse a `Retry-After` header, which gives either a number of seconds or an HTTP date.
	 *
	 * @param string|array $header The header value (an array if it was sent more than once).
	 *
	 * @return int The number of seconds to wait (no more than a day), or 0 if there's no valid header.
	 */
	private static function parse_retry_after( string|array $header ): int {

		$header = trim( strval( is_array( $header ) ? reset( $header ) : $header ) );

		if ( '' === $header ) {
			return 0;
		}

		$seconds = ctype_digit( $header ) ? intval( $header ) : intval( strtotime( $header ) ) - time();

		return max( 0, min( $seconds, DAY_IN_SECONDS ) );
	}

	/**
	 * Conditionally log the API response.
	 *
	 * @return void
	 */
	private function maybe_log_response(): void {
		if ( ToolsOptions::should_log_api_responses() ) {
			gist_answers_error_log(
				sprintf(
					'Gist Answers API response: %s (%d) %s: %s',
					wp_date( 'Y-m-d H:i:s', $this->request_timestamp ),
					$this->response_code,
					get_class( $this ),
					self::redact_secrets( str_replace( array( "\r", "\n" ), '', $this->response_body ) ),
				),
			);
		}
	}

	/**
	 * Redact credentials (e.g., CMS embed tickets and tokens) from an API response body before it is logged.
	 *
	 * Replaces the value of every JSON field whose name contains a credential-like word (e.g., `ticket`,
	 * `embed_ticket`, `access_token`, or `api_key`), including values with escaped quotes, and of every such URL query
	 * parameter (e.g., the `?embed=` ticket in a CMS iframe URL).
	 *
	 * @param string $response_body The API response body.
	 *
	 * @return string The response body with the values of credential-like fields replaced.
	 */
	private static function redact_secrets( string $response_body ): string {

		$response_body = strval(
			preg_replace(
				'/("[a-z0-9_\-]*(?:' . self::SECRET_NAME_PATTERN . ')[a-z0-9_\-]*"\s*:\s*)"(?:[^"\\\\]|\\\\.)*"/i',
				'$1"[redacted]"',
				$response_body
			)
		);

		return strval(
			preg_replace(
				'/((?:[?&]|\\\\u0026)(?:embed|[a-z0-9_\-]*(?:' . self::SECRET_NAME_PATTERN . ')[a-z0-9_\-]*)=)[^&"\s\\\\]+/i',
				'$1[redacted]',
				$response_body
			)
		);
	}

	/**
	 * Extract the endpoint parameters into the URL.
	 *
	 * @return string URL of the endpoint with parameters extracted.
	 */
	private function extract_params_into_url(): string {

		$matched_name = $this->extract_matched_name();

		foreach ( $this->params as $key => $value ) {

			$needle = '{' . $key . '}';

			$needle_count = substr_count( $matched_name, $needle );

			if ( $needle_count > 0 ) {

				$matched_name = str_replace( $needle, $value, $matched_name );

				unset( $this->params[ $key ] );
			}
		}

		$endpoint_url = trailingslashit( GistURLs::get_api_base_url() ) . $matched_name;
		$endpoint_url = esc_url_raw( $endpoint_url );

		return $endpoint_url;
	}

	/**
	 * Extract the endpoint name that best matches the call parameters.
	 *
	 * @return string The matched endpoint name.
	 */
	private function extract_matched_name(): string {

		$search_keys = array_map( fn( $name ) => '{' . $name . '}', array_keys( $this->params ) );

		$matched_names = array_fill_keys(
			array_values( $this->names ),
			0,
		);

		foreach ( $search_keys as $search_key ) {
			foreach ( $matched_names as $name => $count ) {
				if ( str_contains( $name, $search_key ) ) {
					++$matched_names[ $name ];
				}
			}
		}

		$max_matched_count = max( $matched_names );

		$matched_names = array_filter( $matched_names, fn( $count ) => $count === $max_matched_count );
		$matched_names = array_keys( $matched_names );

		return array_shift( $matched_names );
	}

	/**
	 * Get the response from the endpoint request.
	 *
	 * @return object The response from the endpoint request.
	 */
	public function response(): object {
		return (object) array(
			'time'        => $this->request_timestamp,
			'code'        => $this->response_code,
			'text'        => $this->response_body,
			'data'        => json_decode( $this->response_body ),
			'retry_after' => $this->retry_after,
		);
	}

	/**
	 * Determine whether the current request is rendering a front-end page, where API requests block rendering.
	 *
	 * @return bool True on the front end, false in the admin, AJAX, WP-Cron, and REST requests.
	 */
	public static function is_front_end_request(): bool {
		return ! is_admin() && ! wp_doing_ajax() && ! wp_doing_cron() && ! wp_is_serving_rest_request();
	}

	/**
	 * Validate an API token using the Gist.ai service.
	 *
	 * @param string $api_token The API token to validate.
	 *
	 * @return bool True if the API token is valid, false otherwise.
	 */
	public static function validate_api_token( string $api_token ): bool {

		$test_api_call = new PublisherGroups( null, $api_token );

		$maybe_id = $test_api_call->response()->data->id ?? null;

		return boolval( $maybe_id );
	}

	/**
	 * Output the number of API calls made during this render.
	 */
	public static function output_api_call_count(): void {

		?>
			<script>
				console.log( 'Gist API requests: <?php echo esc_html( self::$api_call_count ); ?>' );
			</script>
		<?php

		do_action( 'gist_answers_api_call_count', self::$api_call_count );
	}

	/**
	 * Get the stored last response.
	 *
	 * @return object The stored last response.
	 */
	public static function get_last_response(): object {
		return is_object( self::$last_response ) ? self::$last_response : (object) array(
			'time' => 0,
			'code' => 0,
			'text' => '',
			'data' => null,
		);
	}

	/**
	 * Reset the stored last response.
	 *
	 * @return void
	 */
	public static function reset_last_response(): void {
		self::$last_response = null;
	}

	/**
	 * Reset the time spent on API requests while rendering this front-end page (see FRONT_END_REQUEST_BUDGET).
	 *
	 * @return void
	 */
	public static function reset_front_end_request_budget(): void {
		self::$front_end_seconds_spent = 0.0;
	}

	/**
	 * Reset the last response, but only if it was successful.
	 *
	 * @return void
	 */
	public static function reset_last_response_if_valid(): void {
		if ( is_object( self::$last_response ) && 200 === ( self::$last_response->code ?? 0 ) ) {
			self::$last_response = null;
		}
	}
}
