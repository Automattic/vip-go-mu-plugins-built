<?php
/**
 * Ingestion Failure class.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

/**
 * Data class representing a failed post ingestion attempt.
 *
 * This class encapsulates information about why an ingestion failed,
 * including the original post and error details.
 */
class Ingestion_Failure {
	/**
	 * Failure code: Post transformation failed.
	 */
	public const CODE_TRANSFORM_FAILED = 'transform_failed';

	/**
	 * Failure code: API call failed.
	 */
	public const CODE_API_ERROR = 'api_error';

	/**
	 * The failure code indicating what went wrong.
	 *
	 * @var string One of the CODE_* constants.
	 */
	public $failure_code;

	/**
	 * The original WordPress post.
	 *
	 * @var \WP_Post
	 */
	public $post;

	/**
	 * Error object with details about the failure.
	 *
	 * @var \WP_Error
	 */
	public $error;

	/**
	 * Constructor.
	 *
	 * @param array{
	 *     failure_code: string,
	 *     post: \WP_Post,
	 *     error: \WP_Error
	 * } $data Failure data.
	 */
	public function __construct( array $data ) {
		$this->failure_code = $data['failure_code'];
		$this->post         = $data['post'];
		$this->error        = $data['error'];
	}

	/**
	 * Check if the failure was due to transformation.
	 *
	 * @return bool True if transform failed, false otherwise.
	 */
	public function is_transform_failure(): bool {
		return self::CODE_TRANSFORM_FAILED === $this->failure_code;
	}

	/**
	 * Check if the failure was due to an API error.
	 *
	 * @return bool True if API error, false otherwise.
	 */
	public function is_api_error(): bool {
		return self::CODE_API_ERROR === $this->failure_code;
	}

	/**
	 * Convert the failure to an array for logging/debugging.
	 *
	 * @return array{
	 *     failure_code: string,
	 *     post_id: int,
	 *     error_code: string,
	 *     error_message: string
	 * } The failure as an associative array.
	 */
	public function to_array(): array {
		return [
			'failure_code'  => $this->failure_code,
			'post_id'       => $this->post->ID,
			'error_code'    => $this->error->get_error_code(),
			'error_message' => $this->error->get_error_message(),
		];
	}
}
