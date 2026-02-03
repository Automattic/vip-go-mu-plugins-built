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
	 * API call failed.
	 */
	public const FAILED_API = 'failed_api';

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
	 * Constructor.
	 *
	 * @param string      $status        One of the class constants.
	 * @param \WP_Post    $post          The post that was synced.
	 * @param string|null $error_message Error message if applicable.
	 */
	public function __construct( string $status, \WP_Post $post, ?string $error_message = null ) {
		$this->status        = $status;
		$this->post          = $post;
		$this->error_message = $error_message;
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
	 * Check if the sync failed.
	 *
	 * @return bool
	 */
	public function is_failure(): bool {
		return in_array( $this->status, [ self::FAILED_TRANSFORM, self::FAILED_API ], true );
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
