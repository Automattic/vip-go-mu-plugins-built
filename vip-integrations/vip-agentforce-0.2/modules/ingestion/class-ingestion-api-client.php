<?php
/**
 * Ingestion API Client.
 *
 * Handles single-attempt API calls to the Salesforce Data Cloud Ingestion API
 * and maintains a shared retry cache block that coordinates back-off across
 * workers. Retry of transient failures is owned by `Ingestion_Cron`,
 * which keeps queued items in place across cron ticks until they succeed
 * or the retry cap is exhausted.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;
use Automattic\VIP\Salesforce\Agentforce\Utils\Ingestion_Metrics;
use Automattic\VIP\Salesforce\Agentforce\Utils\Logger;

/**
 * Client for making API calls to the Salesforce Data Cloud Ingestion API.
 *
 * Responsibilities are deliberately narrow:
 *
 * - Make exactly one HTTP request per call. The caller (cron) decides whether
 *   to retry based on `Ingestion_API_Result::is_retryable()`.
 * - Maintain a shared retry cache block:
 *   - Reactive: a 429 response stores the Retry-After window so other workers
 *     and other queue items defer the same way until it expires.
 *   - Preemptive: a successful 202 with `X-RateLimit-Remaining: 1` parks the
 *     next call until `X-RateLimit-Reset` instead of waiting for an actual 429.
 * - Skip the HTTP call entirely when the cache block is active — there's no
 *   point firing a request we already know SF will reject. The result is
 *   marked retryable so cron picks it up after the block expires.
 */
class Ingestion_API_Client {
	/**
	 * Cache key for rate limit block timestamp.
	 */
	private const CACHE_KEY_RATE_LIMIT_BLOCK = 'vip_agentforce_rate_limit_blocked_until';

	/**
	 * Cache key for retry diagnostics.
	 */
	private const CACHE_KEY_RETRY_STATE = 'vip_agentforce_ingestion_api_retry_state';

	/**
	 * Cache group for rate limiting.
	 */
	private const CACHE_GROUP = 'vip_agentforce';

	/**
	 * Default exponential retry backoff floor, in seconds.
	 */
	private const DEFAULT_RETRY_BACKOFF_SECONDS = 5;

	/**
	 * Maximum exponential retry backoff, in seconds.
	 */
	private const MAX_RETRY_BACKOFF_SECONDS = 300;

	/**
	 * Default request timeout in seconds.
	 *
	 * The effective timeout is `vip_agentforce_api_timeout` (filterable);
	 * the default is bumped to 15s under WP-CLI to suit bulk sync runs and
	 * stays at 3s for normal request-response paths to keep latency tight.
	 */
	private const DEFAULT_TIMEOUT_CLI    = 15;
	private const DEFAULT_TIMEOUT_NORMAL = 3;

	/**
	 * Get current shared retry status for diagnostics and CLI output.
	 *
	 * @return array{
	 *     active: bool,
	 *     blocked_until: float|null,
	 *     seconds_remaining: float,
	 *     next_retry_at: string|null,
	 *     consecutive_failures: int,
	 *     reason: string|null,
	 *     status_code: int|null,
	 *     last_error_at: string|null,
	 *     last_error_message: string|null
	 * }
	 */
	public static function get_retry_status(): array {
		$state         = self::get_retry_state();
		$blocked_until = wp_cache_get( self::CACHE_KEY_RATE_LIMIT_BLOCK, self::CACHE_GROUP );

		if ( false === $blocked_until ) {
			$blocked_until = $state['blocked_until'] ?? null;
		}

		$blocked_until_float = null !== $blocked_until ? (float) $blocked_until : null;
		$seconds_remaining   = null !== $blocked_until_float ? max( 0, $blocked_until_float - microtime( true ) ) : 0;

		return [
			'active'               => $seconds_remaining > 0,
			'blocked_until'        => $blocked_until_float,
			'seconds_remaining'    => $seconds_remaining,
			'next_retry_at'        => null !== $blocked_until_float ? gmdate( 'c', (int) ceil( $blocked_until_float ) ) : null,
			'consecutive_failures' => (int) ( $state['consecutive_failures'] ?? 0 ),
			'reason'               => isset( $state['reason'] ) ? (string) $state['reason'] : null,
			'status_code'          => isset( $state['status_code'] ) ? (int) $state['status_code'] : null,
			'last_error_at'        => isset( $state['last_error_at'] ) ? (string) $state['last_error_at'] : null,
			'last_error_message'   => isset( $state['last_error_message'] ) ? (string) $state['last_error_message'] : null,
		];
	}

	/**
	 * Clear the shared retry block and diagnostics.
	 */
	public static function clear_retry_status(): void {
		wp_cache_delete( self::CACHE_KEY_RATE_LIMIT_BLOCK, self::CACHE_GROUP );
		wp_cache_delete( self::CACHE_KEY_RETRY_STATE, self::CACHE_GROUP );
	}

	/**
	 * Send a record to the Salesforce Data Cloud Ingestion API.
	 *
	 * @param Ingestion_Post_Record $record The record to send.
	 * @return Ingestion_API_Result The API result.
	 */
	public function send( Ingestion_Post_Record $record ): Ingestion_API_Result {
		$record_id = $record->to_array()['site_id_blog_id_post_id'];

		return $this->make_request(
			'POST',
			wp_json_encode( [ 'data' => [ $record->to_array() ] ] ),
			$record_id
		);
	}

	/**
	 * Delete a record from the Salesforce Data Cloud Ingestion API.
	 *
	 * @param string $record_id The record ID to delete.
	 * @return Ingestion_API_Result The API result.
	 */
	public function delete( string $record_id ): Ingestion_API_Result {
		return $this->make_request(
			'DELETE',
			wp_json_encode( [ 'ids' => [ $record_id ] ] ),
			$record_id
		);
	}

	/**
	 * Make a single API request, honoring the shared retry block and
	 * returning a result that the cron can act on (retry or give up).
	 *
	 * @param string $method    HTTP method ('POST' or 'DELETE').
	 * @param string $body      JSON-encoded request body.
	 * @param string $record_id The record ID for the result.
	 * @return Ingestion_API_Result The API result.
	 */
	private function make_request( string $method, string $body, string $record_id ): Ingestion_API_Result {
		$preflight_failure = self::get_request_preflight_failure();
		if ( null !== $preflight_failure ) {
			// Config/token failures are deterministic. Retrying would only
			// hide the real setup problem behind the shared backoff flow.
			Ingestion_Metrics::record_api_error( $preflight_failure['error_class'] );
			return Ingestion_API_Result::failure(
				$preflight_failure['message'],
				null,
				$record_id,
				$preflight_failure['error_class']
			);
		}

		// If another worker already hit a retryable API failure, defer this
		// request without touching Salesforce. This keeps all workers aligned
		// to the same next retry window and avoids burning attempt counters.
		$block_remaining = $this->get_rate_limit_block_remaining();
		if ( $block_remaining > 0 ) {
			$retry_status = self::get_retry_status();
			$error_class  = match ( $retry_status['reason'] ) {
				'rate_limited', 'rate_limit_budget_low' => 'rate_limit',
				'transient_server_error' => 'server',
				'http_error' => 'network',
				default => 'unexpected',
			};

			Ingestion_Metrics::record_api_error( $error_class );
			return Ingestion_API_Result::deferred(
				sprintf(
					'Ingestion API retry backoff active for %.1fs; deferring request (%s)',
					$block_remaining,
					$retry_status['reason'] ?? 'unknown'
				),
				$record_id,
				$error_class
			);
		}

		$response = $this->execute_request( $method, $body );

		if ( is_wp_error( $response ) ) {
			// A transport failure means Salesforce was not reached at all. Arm
			// backoff so the next worker does not immediately repeat it.
			$this->set_exponential_backoff( 'http_error', null, $response->get_error_message() );
			Ingestion_Metrics::record_api_request( $method, 'none', 'network_error' );
			Ingestion_Metrics::record_api_error( 'network' );

			if ( Logger::is_verbose_ingestion_logging() ) {
				Logger::warning(
					'ingestion-api',
					'HTTP error contacting Salesforce',
					[
						'record_id' => $record_id,
						'error'     => $response->get_error_message(),
					]
				);
			}
			return Ingestion_API_Result::failure( $response->get_error_message(), $response, $record_id, 'network' );
		}

		$status_code = (int) wp_remote_retrieve_response_code( $response );

		// Success.
		if ( 202 === $status_code ) {
			// One accepted request proves the shared incident has cleared.
			// Reset both the active block and its diagnostic state.
			self::clear_retry_status();
			Ingestion_Metrics::record_api_request( $method, (string) $status_code, 'success' );
			$this->process_rate_limit_headers( $response );
			return Ingestion_API_Result::success( $record_id, $response );
		}

		// Rate limited: store the block for other workers, return failure.
		// The cron caller will see is_retryable() === true and keep the
		// queue item in place for the next tick.
		if ( 429 === $status_code ) {
			$this->handle_rate_limit_response( $response );
			Ingestion_Metrics::record_api_request( $method, (string) $status_code, 'rate_limit' );
			Ingestion_Metrics::record_api_error( 'rate_limit' );

			if ( Logger::is_verbose_ingestion_logging() ) {
				Logger::warning(
					'ingestion-api',
					'Rate limited by Salesforce',
					[
						'record_id'     => $record_id,
						'status_code'   => $status_code,
						'response_body' => wp_remote_retrieve_body( $response ),
					]
				);
			}

			return Ingestion_API_Result::failure(
				'Rate limited by Salesforce',
				$response,
				$record_id,
				'rate_limit'
			);
		}

		// Server-side / transient errors. 503 occasionally includes
		// Retry-After; honor it the same way we honor 429 so the next
		// cron tick observes the block.
		if ( 408 === $status_code || $status_code >= 500 ) {
			$this->handle_retryable_error_response( $response, 'transient_server_error', 'Server error (' . $status_code . ')' );
			Ingestion_Metrics::record_api_request( $method, (string) $status_code, 'server_error' );
			Ingestion_Metrics::record_api_error( 'server' );

			if ( Logger::is_verbose_ingestion_logging() ) {
				Logger::warning(
					'ingestion-api',
					'Transient server error from Salesforce',
					[
						'record_id'     => $record_id,
						'status_code'   => $status_code,
						'response_body' => wp_remote_retrieve_body( $response ),
					]
				);
			}

			return Ingestion_API_Result::failure(
				'Server error (' . $status_code . ')',
				$response,
				$record_id,
				'server'
			);
		}

		// Permanent error (4xx other than 408/429). Cron will see
		// is_retryable() === false and surface a failure event.
		$error_class = in_array( $status_code, [ 401, 403 ], true ) ? 'auth' : 'client';
		$outcome     = 'auth' === $error_class ? 'auth_error' : 'client_error';
		if ( $status_code < 400 ) {
			// The Ingestion API success contract is 202. Other 2xx/3xx
			// responses are not retryable, but they also should not be counted
			// as client mistakes.
			$error_class = 'unexpected';
			$outcome     = 'unexpected';
		}

		Ingestion_Metrics::record_api_request( $method, (string) $status_code, $outcome );
		Ingestion_Metrics::record_api_error( $error_class );

		if ( Logger::is_verbose_ingestion_logging() ) {
			Logger::error(
				'ingestion-api',
				'Permanent error from Salesforce',
				[
					'record_id'     => $record_id,
					'status_code'   => $status_code,
					'response_body' => wp_remote_retrieve_body( $response ),
				]
			);
		}

		// A permanent response means waiting longer will not fix this request.
		// Clear any old shared retry state so future runs report their own
		// current failure instead of a stale backoff window.
		self::clear_retry_status();
		return Ingestion_API_Result::failure(
			'Unexpected response code: ' . $status_code,
			$response,
			$record_id,
			$error_class
		);
	}

	/**
	 * Execute the actual HTTP request.
	 *
	 * @param string $method HTTP method.
	 * @param string $body   Request body.
	 * @return array<string, mixed>|\WP_Error The response or error.
	 */
	private function execute_request( string $method, string $body ) {
		$config = Configs::get_config();
		$token  = $config['ingestion_api_token'] ?? '';
		$url    = $this->build_api_url();

		return wp_remote_request(
			$url,
			[
				'method'  => $method,
				'headers' => [
					'Content-Type'  => 'application/json',
					'Authorization' => 'Bearer ' . $token,
				],
				'body'    => $body,
				'timeout' => $this->get_request_timeout(),
			]
		);
	}

	/**
	 * Get the API request timeout in seconds.
	 *
	 * Uses a longer default in WP-CLI context (bulk sync runs) and a tight
	 * default everywhere else. Filterable via `vip_agentforce_api_timeout`
	 * so deployments can override either path.
	 *
	 * @return int Timeout in seconds.
	 */
	protected function get_request_timeout(): int {
		$default = ( defined( 'WP_CLI' ) && WP_CLI )
			? self::DEFAULT_TIMEOUT_CLI
			: self::DEFAULT_TIMEOUT_NORMAL;

		return (int) apply_filters( 'vip_agentforce_api_timeout', $default );
	}

	/**
	 * Get a preflight failure before attempting an API request.
	 *
	 * @return array{message: string, error_class: string, error_code: string}|null Failure details, or null if the request can proceed.
	 */
	public static function get_request_preflight_failure(): ?array {
		$config        = Configs::get_config();
		$token_failure = Configs::get_ingestion_token_failure();

		if ( null !== $token_failure ) {
			// Token failures have more precise customer-facing codes than the
			// generic missing-field check below, so preserve that detail.
			return $token_failure;
		}

		$fields_to_check = [
			'ingestion_api_instance_url',
			'ingestion_api_source_name',
			'ingestion_api_object_name',
		];

		$empty_fields = [];
		foreach ( $fields_to_check as $field ) {
			if ( empty( $config[ $field ] ) ) {
				// Collect all missing fields so Support sees the full setup gap
				// from a single status/preflight response.
				$empty_fields[] = $field;
			}
		}

		if ( ! empty( $empty_fields ) ) {
			return [
				'message'     => 'Missing required API configuration: ' . implode( ', ', $empty_fields ),
				'error_class' => 'config',
				'error_code'  => Ingestion_Error::MISSING_API_CONFIG,
			];
		}

		return null;
	}

	/**
	 * Build the Ingestion API URL.
	 *
	 * @return string The full API URL.
	 */
	private function build_api_url(): string {
		$config = Configs::get_config();

		$base_url    = $config['ingestion_api_instance_url'] ?? '';
		$source_name = $config['ingestion_api_source_name'] ?? '';
		$object_name = $config['ingestion_api_object_name'] ?? '';

		return rtrim( $base_url, '/' ) . '/api/v1/ingest/sources/' . rawurlencode( $source_name ) . '/' . rawurlencode( $object_name );
	}

	/**
	 * Get the remaining seconds until the rate limit block expires.
	 *
	 * @return float Seconds remaining, or 0 if not blocked.
	 */
	private function get_rate_limit_block_remaining(): float {
		return self::get_retry_status()['seconds_remaining'];
	}

	/**
	 * Set a retry block in cache.
	 *
	 * @param float    $duration_seconds     How long to block in seconds.
	 * @param string   $reason               Machine-readable retry reason.
	 * @param int|null $status_code          HTTP status code, if known.
	 * @param string   $error_message        Operator-facing error summary.
	 * @param int      $consecutive_failures Consecutive retryable failure count.
	 */
	private function set_retry_block( float $duration_seconds, string $reason, ?int $status_code, string $error_message, int $consecutive_failures ): void {
		$blocked_until = microtime( true ) + $duration_seconds;
		$cache_ttl     = (int) ceil( $duration_seconds ) + 1; // Add 1 second buffer.

		// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined -- Retry blocks intentionally mirror the computed retry window. Forcing >=300s would make short Retry-After windows too slow.
		wp_cache_set( self::CACHE_KEY_RATE_LIMIT_BLOCK, $blocked_until, self::CACHE_GROUP, $cache_ttl );

		wp_cache_set(
			self::CACHE_KEY_RETRY_STATE,
			[
				'blocked_until'        => $blocked_until,
				'backoff_seconds'      => $duration_seconds,
				'consecutive_failures' => $consecutive_failures,
				'reason'               => $reason,
				'status_code'          => $status_code,
				'last_error_at'        => gmdate( 'c' ),
				'last_error_message'   => $error_message,
			],
			self::CACHE_GROUP,
			DAY_IN_SECONDS
		);
	}

	/**
	 * Get retry diagnostics from cache.
	 *
	 * @return array<string, mixed>
	 */
	private static function get_retry_state(): array {
		$state = wp_cache_get( self::CACHE_KEY_RETRY_STATE, self::CACHE_GROUP );

		return is_array( $state ) ? $state : [];
	}

	/**
	 * Set exponential backoff for a retryable failure with no explicit delay.
	 *
	 * @param string   $reason        Machine-readable retry reason.
	 * @param int|null $status_code   HTTP status code, if known.
	 * @param string   $error_message Operator-facing error summary.
	 */
	private function set_exponential_backoff( string $reason, ?int $status_code, string $error_message ): void {
		$state                = self::get_retry_state();
		$consecutive_failures = (int) ( $state['consecutive_failures'] ?? 0 ) + 1;
		$base_seconds         = max(
			1,
			(int) apply_filters( 'vip_agentforce_api_retry_backoff_base_seconds', self::DEFAULT_RETRY_BACKOFF_SECONDS )
		);
		$max_seconds          = max(
			$base_seconds,
			(int) apply_filters( 'vip_agentforce_api_retry_backoff_max_seconds', self::MAX_RETRY_BACKOFF_SECONDS )
		);
		$exponent             = min( $consecutive_failures - 1, 10 );
		$duration_seconds     = min( $max_seconds, $base_seconds * ( 2 ** $exponent ) );

		$this->set_retry_block( (float) $duration_seconds, $reason, $status_code, $error_message, $consecutive_failures );
	}

	/**
	 * Handle a 429 rate limit response.
	 *
	 * Parses Retry-After header and sets the rate limit block.
	 *
	 * @param array<string, mixed> $response The HTTP response.
	 */
	private function handle_rate_limit_response( array $response ): void {
		$this->handle_retryable_error_response( $response, 'rate_limited', 'Rate limited by Salesforce' );
	}

	/**
	 * Handle a retryable HTTP response.
	 *
	 * Uses Retry-After when Salesforce supplies it; otherwise falls back to
	 * exponential backoff.
	 *
	 * @param array<string, mixed> $response      The HTTP response.
	 * @param string               $reason        Machine-readable retry reason.
	 * @param string               $error_message Operator-facing error summary.
	 */
	private function handle_retryable_error_response( array $response, string $reason, string $error_message ): void {
		$retry_after = $this->parse_retry_after_header( $response );
		$status_code = (int) wp_remote_retrieve_response_code( $response );

		if ( $retry_after > 0 ) {
			// Salesforce gave an explicit retry window. Use it as the source of
			// truth, but keep the failure count so diagnostics still show trend.
			$state                = self::get_retry_state();
			$consecutive_failures = (int) ( $state['consecutive_failures'] ?? 0 ) + 1;
			$this->set_retry_block( $retry_after, $reason, $status_code, $error_message, $consecutive_failures );
		} else {
			// No Retry-After means we own the pacing. Use bounded exponential
			// backoff so repeated incidents slow down without stalling forever.
			$this->set_exponential_backoff( $reason, $status_code, $error_message );
		}
	}

	/**
	 * Process rate limit headers from a successful response.
	 *
	 * Sets preemptive block if remaining requests are low.
	 *
	 * @param array<string, mixed> $response The HTTP response.
	 */
	private function process_rate_limit_headers( array $response ): void {
		$headers   = wp_remote_retrieve_headers( $response );
		$remaining = $this->get_header_value( $headers, 'x-ratelimit-remaining' );
		$reset     = $this->get_header_value( $headers, 'x-ratelimit-reset' );

		// If the next request would likely hit the rate limit, pause until the
		// reset timestamp so concurrent workers do not spend the last slot.
		if ( null !== $remaining && null !== $reset && (int) $remaining <= 1 ) {
			$reset_time = (int) $reset;
			$now        = time();

			if ( $reset_time > $now ) {
				// Ignore stale reset timestamps; they would create a confusing
				// zero-length block instead of useful Support diagnostics.
				$this->set_retry_block(
					(float) ( $reset_time - $now ),
					'rate_limit_budget_low',
					null,
					'Rate limit budget is low',
					0
				);
			}
		}
	}

	/**
	 * Parse the Retry-After header value.
	 *
	 * Supports both seconds and HTTP-date formats.
	 *
	 * @param array<string, mixed> $response The HTTP response.
	 * @return float The retry delay in seconds, or 0 if not present.
	 */
	private function parse_retry_after_header( array $response ): float {
		$headers     = wp_remote_retrieve_headers( $response );
		$retry_after = $this->get_header_value( $headers, 'retry-after' );

		if ( null === $retry_after ) {
			return 0;
		}

		// Check if it's a number (seconds).
		if ( is_numeric( $retry_after ) ) {
			return (float) $retry_after;
		}

		// Try to parse as HTTP-date.
		$timestamp = strtotime( $retry_after );
		if ( false !== $timestamp ) {
			return max( 0, (float) ( $timestamp - time() ) );
		}

		return 0;
	}

	/**
	 * Get a header value case-insensitively.
	 *
	 * @param \WpOrg\Requests\Utility\CaseInsensitiveDictionary|array<string, string> $headers The headers.
	 * @param string                                                                  $name    The header name (lowercase).
	 * @return string|null The header value or null if not found.
	 */
	private function get_header_value( $headers, string $name ): ?string {
		if ( $headers instanceof \WpOrg\Requests\Utility\CaseInsensitiveDictionary ) {
			$value = $headers[ $name ] ?? null;
			return null !== $value ? (string) $value : null;
		}

		if ( ! is_array( $headers ) ) {
			return null;
		}

		$lower_name = strtolower( $name );
		$value      = $headers[ $name ] ?? $headers[ $lower_name ] ?? null;

		return null !== $value ? (string) $value : null;
	}
}
