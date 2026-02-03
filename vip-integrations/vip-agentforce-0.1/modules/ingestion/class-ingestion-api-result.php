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
	public static function failure( string $error_message, $response = null, ?string $record_id = null ): self {
		$result                = new self();
		$result->success       = false;
		$result->record_id     = $record_id;
		$result->error_message = $error_message;
		$result->response      = $response;
		$result->timestamp     = gmdate( 'c' );

		return $result;
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
