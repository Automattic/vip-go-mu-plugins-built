<?php
/**
 * Ingestion API Result class.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

/**
 * Data class representing the result of an Ingestion API call.
 *
 * This class encapsulates the response from both ingestion (POST) and
 * deletion (DELETE) API calls to Salesforce Data Cloud.
 */
class Ingestion_API_Result {
	/**
	 * Whether the API call was successful.
	 *
	 * @var bool
	 */
	public bool $success;

	/**
	 * The record ID that was sent or deleted.
	 *
	 * @var string|null
	 */
	public ?string $record_id;

	/**
	 * Error message if the call failed.
	 *
	 * @var string|null
	 */
	public ?string $error_message;

	/**
	 * Low-cardinality error class for logs and metrics.
	 *
	 * @var string|null
	 */
	public ?string $error_class = null;

	/**
	 * The raw HTTP response from wp_remote_request.
	 *
	 * @var array<string, mixed>|\WP_Error|null
	 */
	public $response;

	/**
	 * Timestamp of the API call.
	 *
	 * @var string
	 */
	public string $timestamp;

	/**
	 * Optional override for `is_retryable()`.
	 *
	 * Used when the failure didn't reach SF at all and we need to assert
	 * retryability without an HTTP response to inspect. Example: a request
	 * we deliberately deferred because the shared rate-limit cache block
	 * was active. `null` means "infer from response code".
	 *
	 * @var bool|null
	 */
	public ?bool $retryable_override = null;

	/**
	 * Create a successful result.
	 *
	 * @param string                              $record_id The record ID.
	 * @param array<string, mixed>|\WP_Error|null $response  The raw HTTP response.
	 * @return self
	 */
	public static function success( string $record_id, $response = null ): self {
		$result                = new self();
		$result->success       = true;
		$result->record_id     = $record_id;
		$result->error_message = null;
		$result->response      = $response;
		$result->timestamp     = gmdate( 'c' );

		return $result;
	}

	/**
	 * Create a failed result.
	 *
	 * @param string                              $error_message The error message.
	 * @param array<string, mixed>|\WP_Error|null $response      The raw HTTP response.
	 * @param string|null                         $record_id     Optional record ID.
	 * @return self
	 */
	public static function failure( string $error_message, $response = null, ?string $record_id = null, ?string $error_class = null ): self {
		$result                = new self();
		$result->success       = false;
		$result->record_id     = $record_id;
		$result->error_message = $error_message;
		$result->response      = $response;
		$result->timestamp     = gmdate( 'c' );
		$result->error_class   = $error_class;

		return $result;
	}

	/**
	 * Create a failure result for a request that was deferred because a
	 * shared retry block was active — the call never reached SF. Marked
	 * retryable explicitly so cron picks it up on the next tick once the
	 * block expires.
	 *
	 * @param string      $error_message Why we deferred.
	 * @param string|null $record_id     Optional record ID.
	 * @param string      $error_class   Low-cardinality error class.
	 * @return self
	 */
	public static function deferred( string $error_message, ?string $record_id = null, string $error_class = 'rate_limit' ): self {
		$result                     = self::failure( $error_message, null, $record_id, $error_class );
		$result->retryable_override = true;
		return $result;
	}

	/**
	 * Get the low-cardinality error class for this result.
	 */
	public function get_error_class(): string {
		if ( null !== $this->error_class ) {
			return $this->error_class;
		}

		if ( $this->success ) {
			return 'unexpected';
		}

		if ( is_wp_error( $this->response ) ) {
			return 'network';
		}

		if ( ! is_array( $this->response ) ) {
			return 'unexpected';
		}

		$status_code = (int) wp_remote_retrieve_response_code( $this->response );

		if ( in_array( $status_code, [ 401, 403 ], true ) ) {
			return 'auth';
		}

		if ( 429 === $status_code ) {
			return 'rate_limit';
		}

		if ( 408 === $status_code || $status_code >= 500 ) {
			return 'server';
		}

		if ( $status_code >= 400 ) {
			return 'client';
		}

		return 'unexpected';
	}

	/**
	 * Get the metric outcome for this request result.
	 */
	public function get_request_outcome(): string {
		if ( $this->success ) {
			return 'success';
		}

		$class_to_outcome = [
			'auth'       => 'auth_error',
			'rate_limit' => 'rate_limit',
			'server'     => 'server_error',
			'network'    => 'network_error',
			'client'     => 'client_error',
		];

		return $class_to_outcome[ $this->get_error_class() ] ?? 'unexpected';
	}

	/**
	 * Whether this failure is retryable on the next cron tick.
	 *
	 * Retryable failures are server-side / transient: rate limiting (429),
	 * request timeout (408), and 5xx responses. Anything else is treated as
	 * permanent — the caller (cron) shouldn't retry.
	 *
	 * Successful results return false: there's nothing to retry.
	 *
	 * @return bool
	 */
	public function is_retryable(): bool {
		if ( $this->success ) {
			return false;
		}

		// Explicit override (e.g. deferred() factory) takes precedence —
		// used when there's no HTTP response to inspect.
		if ( null !== $this->retryable_override ) {
			return $this->retryable_override;
		}

		// WP_Error from wp_remote_request — typically a network-level
		// connection failure (DNS, timeout before HTTP). Retry next tick.
		if ( is_wp_error( $this->response ) ) {
			return true;
		}

		// No response and no explicit override → treat as permanent.
		// Covers config validation failures (`failure( ..., null, ... )`).
		if ( ! is_array( $this->response ) ) {
			return false;
		}

		$status_code = (int) wp_remote_retrieve_response_code( $this->response );

		return 408 === $status_code || 429 === $status_code || $status_code >= 500;
	}

	/**
	 * Convert the result to an array for backwards compatibility.
	 *
	 * @return array{
	 *     success: bool,
	 *     record_id?: string,
	 *     timestamp: string,
	 *     error_message?: string,
	 *     response_body?: string
	 * }
	 */
	public function to_array(): array {
		$result = [
			'success'   => $this->success,
			'timestamp' => $this->timestamp,
		];

		if ( null !== $this->record_id ) {
			$result['record_id'] = $this->record_id;
		}

		if ( null !== $this->error_message ) {
			$result['error_message'] = $this->error_message;
		}

		if ( ! $this->success && is_array( $this->response ) ) {
			$result['response_body'] = wp_remote_retrieve_body( $this->response );
		}

		return $result;
	}
}
