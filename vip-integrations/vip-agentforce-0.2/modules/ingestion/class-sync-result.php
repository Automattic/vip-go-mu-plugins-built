<?php
/**
 * Sync result class.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

/**
 * Represents the result of a sync operation for a single post.
 */
class Sync_Result {
	/**
	 * Post was successfully ingested to Salesforce.
	 */
	public const INGESTED = 'ingested';

	/**
	 * Post was deleted from Salesforce (was previously ingested but no longer matches filter).
	 */
	public const DELETED = 'deleted';

	/**
	 * Post was skipped (doesn't match filter and wasn't previously ingested).
	 */
	public const SKIPPED = 'skipped';

	/**
	 * Post transform failed.
	 */
	public const FAILED_TRANSFORM = 'failed_transform';

	/**
	 * API call failed permanently — caller should NOT retry.
	 *
	 * Used for non-retryable HTTP errors (4xx other than 408/429), config
	 * problems, or after the cron retry cap is exhausted.
	 */
	public const FAILED_API = 'failed_api';

	/**
	 * API call failed but is retryable on the next cron tick.
	 *
	 * Used for transient server-side failures: 429 (rate limited), 408
	 * (request timeout), and 5xx. The cron handler will keep the item in
	 * the queue, increment its attempt counter, and only escalate to
	 * FAILED_API once the cap is hit.
	 */
	public const FAILED_API_RETRYABLE = 'failed_api_retryable';

	/**
	 * The result status.
	 *
	 * @var string One of the class constants.
	 */
	public string $status;

	/**
	 * The post that was synced.
	 *
	 * @var \WP_Post
	 */
	public \WP_Post $post;

	/**
	 * Error message if the sync failed.
	 *
	 * @var string|null
	 */
	public ?string $error_message;

	/**
	 * Low-cardinality error class when the failure came from the API.
	 *
	 * @var string|null
	 */
	public ?string $error_class;

	/**
	 * Constructor.
	 *
	 * @param string      $status        One of the class constants.
	 * @param \WP_Post    $post          The post that was synced.
	 * @param string|null $error_message Error message if applicable.
	 * @param string|null $error_class   Low-cardinality error class if applicable.
	 */
	public function __construct( string $status, \WP_Post $post, ?string $error_message = null, ?string $error_class = null ) {
		$this->status        = $status;
		$this->post          = $post;
		$this->error_message = $error_message;
		$this->error_class   = $error_class;
	}

	/**
	 * Check if the sync was successful (ingested or deleted).
	 *
	 * @return bool
	 */
	public function is_success(): bool {
		return in_array( $this->status, [ self::INGESTED, self::DELETED ], true );
	}

	/**
	 * Check if the sync failed (any failure mode, retryable or not).
	 *
	 * @return bool
	 */
	public function is_failure(): bool {
		return in_array(
			$this->status,
			[ self::FAILED_TRANSFORM, self::FAILED_API, self::FAILED_API_RETRYABLE ],
			true
		);
	}

	/**
	 * Check if the failure is transient and the cron should retry it.
	 *
	 * @return bool
	 */
	public function is_retryable(): bool {
		return self::FAILED_API_RETRYABLE === $this->status;
	}

	/**
	 * Check if the post was skipped.
	 *
	 * @return bool
	 */
	public function is_skipped(): bool {
		return self::SKIPPED === $this->status;
	}
}
