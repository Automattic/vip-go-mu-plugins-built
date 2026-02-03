<?php
/**
 * Deletion Failure class.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

/**
 * Data class representing a failed post deletion attempt from Salesforce.
 *
 * This class encapsulates information about why a deletion failed,
 * including the original post, record ID, and error details.
 */
class Deletion_Failure {
	/**
	 * Failure code: Delete API call failed.
	 */
	public const CODE_DELETE_API_ERROR = 'delete_api_error';

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
	 * The Salesforce record ID that failed to delete.
	 *
	 * @var string
	 */
	public $record_id;

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
	 *     record_id: string,
	 *     error: \WP_Error
	 * } $data Failure data.
	 */
	public function __construct( array $data ) {
		$this->failure_code = $data['failure_code'];
		$this->post         = $data['post'];
		$this->record_id    = $data['record_id'];
		$this->error        = $data['error'];
	}

	/**
	 * Check if the failure was due to a delete API error.
	 *
	 * @return bool True if delete API error, false otherwise.
	 */
	public function is_delete_api_error(): bool {
		return self::CODE_DELETE_API_ERROR === $this->failure_code;
	}

	/**
	 * Convert the failure to an array for logging/debugging.
	 *
	 * @return array{
	 *     failure_code: string,
	 *     post_id: int,
	 *     record_id: string,
	 *     error_code: string,
	 *     error_message: string
	 * } The failure as an associative array.
	 */
	public function to_array(): array {
		return [
			'failure_code'  => $this->failure_code,
			'post_id'       => $this->post->ID,
			'record_id'     => $this->record_id,
			'error_code'    => $this->error->get_error_code(),
			'error_message' => $this->error->get_error_message(),
		];
	}
}
