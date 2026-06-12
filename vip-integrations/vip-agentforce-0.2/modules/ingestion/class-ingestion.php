<?php
/**
 * Ingestion module.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Ingestion_Metrics;

/**
 * Handles ingestion filtering for posts to be sent to Salesforce.
 */
class Ingestion {
	/**
	 * The API client instance.
	 *
	 * @var Ingestion_API_Client|null
	 */
	private static ?Ingestion_API_Client $api_client = null;

	/**
	 * Get the API client instance.
	 *
	 * @return Ingestion_API_Client The API client.
	 */
	protected static function get_api_client(): Ingestion_API_Client {
		if ( null === self::$api_client ) {
			self::$api_client = new Ingestion_API_Client();
		}
		return self::$api_client;
	}

	/**
	 * Set the API client instance (for testing).
	 *
	 * @param Ingestion_API_Client|null $client The API client to use, or null to reset.
	 */
	public static function set_api_client( ?Ingestion_API_Client $client ): void {
		self::$api_client = $client;
	}

	/**
	 * Post meta key to track ingestion attempts.
	 *
	 * This meta is set when we attempt to ingest a post (after passing should_ingest_post filter).
	 * It allows us to track which posts were sent to Salesforce even if the filter changes later.
	 */
	public const META_KEY_INGESTION_ATTEMPTED = 'vip_agentforce_ingestion_attempted';

	/**
	 * Initialize the module.
	 *
	 * Note: Hook registration is now handled by Ingestion_Queue, which supports
	 * both async (cron) and sync (immediate) modes via the
	 * `vip_agentforce_use_async_ingestion` filter.
	 *
	 * - Async mode (default): Posts are queued, processed by Ingestion_Cron
	 * - Sync mode: Posts are processed immediately via sync_post()
	 */
	public static function init(): void {
		// Hook registration is handled by Ingestion_Queue::init().
		// This method is kept for backwards compatibility and future extensibility.
	}

	/**
	 * Sync a single post to Salesforce - ingest or delete as appropriate.
	 *
	 * This is the core sync logic used by both handle_save_post and CLI sync.
	 * - If the post passes the filter, it will be ingested.
	 * - If it doesn't pass but was previously ingested, it will be deleted.
	 * - If it doesn't pass and wasn't ingested, it will be skipped.
	 *
	 * @param \WP_Post $post                    The post to sync.
	 * @param bool     $defer_retryable_events  When true, the failure events
	 *                                          (`vip_agentforce_post_ingestion_failed`,
	 *                                          `vip_agentforce_post_deletion_failed`)
	 *                                          are NOT fired for retryable
	 *                                          API failures. The caller is
	 *                                          expected to fire them later
	 *                                          if the retry cap is hit.
	 *                                          Cron uses this; sync-mode
	 *                                          callers leave it false because
	 *                                          they have no retry path.
	 * @return Sync_Result The result of the sync operation.
	 */
	public static function sync_post( \WP_Post $post, bool $defer_retryable_events = false ): Sync_Result {
		$should_ingest = self::should_ingest_post( $post );

		if ( ! $should_ingest ) {
			// If this post was previously ingested, delete it from Salesforce.
			if ( self::was_post_ingested( $post ) ) {
				// Only delete if we have ingestion filters registered.
				// If no filters exist, setup is incomplete - don't delete.
				if ( ! has_filter( 'vip_agentforce_should_ingest_post' ) ) {
					return new Sync_Result( Sync_Result::SKIPPED, $post );
				}

				$delete_result = self::delete_post_from_salesforce( $post );

				if ( $delete_result->success ) {
					return new Sync_Result( Sync_Result::DELETED, $post );
				}

				$is_retryable = $delete_result->is_retryable();

				// Fire the deletion failure event unless the caller asked
				// to defer retryable events (cron-only).
				if ( ! $is_retryable || ! $defer_retryable_events ) {
					self::fire_deletion_failure(
						$post->ID,
						self::build_record_id( $post ),
						Deletion_Failure::CODE_DELETE_API_ERROR,
						[ 'result' => $delete_result ]
					);
				}

				return new Sync_Result(
					$is_retryable ? Sync_Result::FAILED_API_RETRYABLE : Sync_Result::FAILED_API,
					$post,
					$delete_result->error_message,
					$delete_result->get_error_class()
				);
			}
			return new Sync_Result( Sync_Result::SKIPPED, $post );
		}

		// Mark that we're attempting to ingest this post.
		// This allows us to track posts for deletion even if:
		// - the filter changes later.
		// - an ingestion succeeded despite the API returning an error
		// - if we mark it after a successful ingestion, the marking step might have failed, and we wouldn't know it was actually ingested.
		update_post_meta( $post->ID, self::META_KEY_INGESTION_ATTEMPTED, time() );

		$record = self::transform_post( $post );
		if ( null === $record ) {
			self::fire_ingestion_failure( $post->ID, Ingestion_Failure::CODE_TRANSFORM_FAILED );
			return new Sync_Result( Sync_Result::FAILED_TRANSFORM, $post );
		}

		$result = static::send_to_api( $record );

		if ( ! $result->success ) {
			$is_retryable = $result->is_retryable();

			// Fire the ingestion failure event unless the caller asked to
			// defer retryable events (cron defers and re-fires only after
			// the retry cap is exhausted).
			if ( ! $is_retryable || ! $defer_retryable_events ) {
				self::fire_ingestion_failure( $post->ID, Ingestion_Failure::CODE_API_ERROR, [ 'result' => $result ] );
			}

			return new Sync_Result(
				$is_retryable ? Sync_Result::FAILED_API_RETRYABLE : Sync_Result::FAILED_API,
				$post,
				$result->error_message,
				$result->get_error_class()
			);
		}

		return new Sync_Result( Sync_Result::INGESTED, $post );
	}

	/**
	 * Fire the ingestion failure action.
	 *
	 * @param int                  $post_id      The post ID that failed ingestion.
	 * @param string               $failure_code One of the Ingestion_Failure::CODE_* constants.
	 * @param array<string, mixed> $details      Optional additional details about the failure.
	 */
	public static function fire_ingestion_failure( int $post_id, string $failure_code, array $details = [] ): void {
		$post = get_post( $post_id );

		$error_codes = [
			Ingestion_Failure::CODE_TRANSFORM_FAILED => 'vip_agentforce_transform_failed',
			Ingestion_Failure::CODE_API_ERROR        => 'vip_agentforce_api_error',
		];

		$error_messages = [
			Ingestion_Failure::CODE_TRANSFORM_FAILED => 'Post transformation failed',
			Ingestion_Failure::CODE_API_ERROR        => 'API call failed',
		];

		$error_data = array_merge( [ 'post_id' => $post_id ], $details );

		$failure = new Ingestion_Failure(
			[
				'failure_code' => $failure_code,
				'post'         => $post,
				'error'        => new \WP_Error(
					$error_codes[ $failure_code ] ?? 'vip_agentforce_ingestion_failed',
					$error_messages[ $failure_code ] ?? 'Ingestion failed',
					$error_data
				),
			]
		);

		/**
		 * Fires when a post ingestion fails.
		 *
		 * This action only fires on actual failures (transform or API errors),
		 * not when ingestion is skipped by filters.
		 *
		 * @since 1.0.0
		 *
		 * @param Ingestion_Failure $failure The failure object containing:
		 *                                   - failure_code: One of the Ingestion_Failure::CODE_* constants
		 *                                   - post: The original WP_Post object
		 *                                   - error: WP_Error with failure details
		 */
		do_action( 'vip_agentforce_post_ingestion_failed', $failure );
	}

	/**
	 * Send record to Salesforce Data Cloud Ingestion API.
	 *
	 * @param Ingestion_Post_Record $record The record to send.
	 * @return Ingestion_API_Result The API result.
	 */
	public static function send_to_api( Ingestion_Post_Record $record ): Ingestion_API_Result {
		return static::get_api_client()->send( $record );
	}

	/**
	 * Transform a post into an Ingestion_Post_Record.
	 *
	 * @param \WP_Post $post The post to transform.
	 * @return Ingestion_Post_Record|null The transformed record, or null if transformation failed.
	 */
	public static function transform_post( \WP_Post $post ): ?Ingestion_Post_Record {
		/**
		 * Filter to transform a WP_Post into an Ingestion_Post_Record for Salesforce.
		 *
		 * NOTE: The first transformer is the Default_Transformer, which provides a basic mapping.
		 *
		 * @param Ingestion_Post_Record|null $record The transformed record (null if not yet transformed by Default_Transformer).
		 * @param \WP_Post                   $post   The post being transformed.
		 * @return Ingestion_Post_Record|null The transformed record, or null to skip ingestion.
		 */
		$record = apply_filters( 'vip_agentforce_transform_post', null, $post );

		if ( ! $record instanceof Ingestion_Post_Record ) {
			return null;
		}

		return $record;
	}

	/**
	 * Determine if a post should be ingested.
	 *
	 * Returns false by default unless a filter explicitly opts in.
	 * This prevents accidental mass ingestion on sites with millions of posts.
	 *
	 * @param \WP_Post $post The post to evaluate.
	 * @return bool Whether the post should be ingested.
	 */
	public static function should_ingest_post( \WP_Post $post ): bool {
		// Safety: No filters = no ingestion.
		if ( ! has_filter( 'vip_agentforce_should_ingest_post' ) ) {
			return false;
		}

		// Only 'publish' status allowed.
		if ( 'publish' !== $post->post_status ) {
			return false;
		}

		/**
		 * Filter whether a post should be ingested into Salesforce.
		 *
		 * @param bool|null $should_ingest Default null indicates no filter has decided yet.
		 *                                 Filters can check for null to see if a prior filter
		 *                                 already made a decision, useful for conditional overrides.
		 * @param \WP_Post  $post          The post being evaluated.
		 * @return bool Whether to ingest the post.
		 */
		return (bool) apply_filters( 'vip_agentforce_should_ingest_post', null, $post );
	}

	/**
	 * Handle permanent post deletion.
	 *
	 * When a published post is permanently deleted, we delete it from Salesforce
	 * if it was previously ingested.
	 *
	 * Called by:
	 * - Ingestion_Cron (async mode) via cron processing
	 * - Ingestion_Queue (sync mode) directly on before_delete_post hook
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 */
	public static function handle_before_delete_post( int $post_id, \WP_Post $post ): void {
		// Only act if the post was published (otherwise it wouldn't be in Salesforce).
		if ( 'publish' !== $post->post_status ) {
			return;
		}

		// Check if the post was previously ingested (has tracking meta).
		if ( ! self::was_post_ingested( $post ) ) {
			return;
		}

		$result = self::delete_post_from_salesforce( $post );

		Ingestion_Metrics::record_post_result( $result->success ? 'deleted' : 'failed', 'sync' );

		// This path is the WP `before_delete_post` hook running in sync mode —
		// there's no cron to retry on, so any failure (retryable or not)
		// surfaces as a deletion failure event right away.
		if ( ! $result->success ) {
			self::fire_deletion_failure(
				$post_id,
				self::build_record_id( $post ),
				Deletion_Failure::CODE_DELETE_API_ERROR,
				[ 'result' => $result ]
			);
		}
	}

	/**
	 * Check if a post was previously ingested (or ingestion was attempted).
	 *
	 * This checks for the ingestion meta first - if it exists, we know we attempted
	 * to ingest this post. This is more reliable than checking the filter, as filters
	 * can change over time.
	 *
	 * Post revisions and autosaves are never considered ingested, even if they have the meta.
	 *
	 * @param \WP_Post $post The post to check.
	 * @return bool Whether the post was previously ingested.
	 */
	public static function was_post_ingested( \WP_Post $post ): bool {
		if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
			return false;
		}

		// Check if we have a record of attempting to ingest this post.
		$ingestion_attempted = get_post_meta( $post->ID, self::META_KEY_INGESTION_ATTEMPTED, true );

		if ( ! empty( $ingestion_attempted ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Delete a post from Salesforce.
	 *
	 * Returns the raw API result so the caller can decide whether the
	 * failure is retryable (cron should keep trying on the next tick) or
	 * permanent (fire the deletion failure event and give up). The hook
	 * handler `handle_before_delete_post` and the queued sync path both
	 * route through here; each fires `vip_agentforce_post_deletion_failed`
	 * on its own terms.
	 *
	 * @param \WP_Post $post The post to delete.
	 * @return Ingestion_API_Result The API result.
	 */
	private static function delete_post_from_salesforce( \WP_Post $post ): Ingestion_API_Result {
		$result = static::delete_from_api( $post );

		if ( $result->success ) {
			// Clear the ingestion tracking meta since the post is no longer in Salesforce.
			delete_post_meta( $post->ID, self::META_KEY_INGESTION_ATTEMPTED );
		}

		return $result;
	}

	/**
	 * Delete a post record from Salesforce API.
	 *
	 * @param \WP_Post $post The post to delete.
	 * @return Ingestion_API_Result The API result.
	 */
	public static function delete_from_api( \WP_Post $post ): Ingestion_API_Result {
		$record_id = self::build_record_id( $post );

		return self::delete_record_id_from_api( $record_id );
	}

	/**
	 * Delete a record from Salesforce API by record ID.
	 *
	 * This method allows deletion by record_id directly, useful for CLI commands
	 * where the post may not exist in WordPress.
	 *
	 * @param string $record_id The record ID in format site_id_blog_id_post_id.
	 * @return Ingestion_API_Result The API result.
	 */
	public static function delete_record_id_from_api( string $record_id ): Ingestion_API_Result {
		return static::get_api_client()->delete( $record_id );
	}

	/**
	 * Build the record ID for a post (site_id_blog_id_post_id format).
	 *
	 * @param \WP_Post $post The post.
	 * @return string The record ID.
	 */
	private static function build_record_id( \WP_Post $post ): string {
		$site_id = defined( 'VIP_GO_APP_ID' ) ? (string) VIP_GO_APP_ID : '0';
		$blog_id = (string) get_current_blog_id();
		$post_id = (string) $post->ID;

		return $site_id . '_' . $blog_id . '_' . $post_id;
	}

	/**
	 * Fire the deletion failure action.
	 *
	 * @param int                  $post_id      The post ID that failed deletion.
	 * @param string               $record_id    The Salesforce record ID.
	 * @param string               $failure_code One of the Deletion_Failure::CODE_* constants.
	 * @param array<string, mixed> $details      Optional additional details about the failure.
	 */
	public static function fire_deletion_failure( int $post_id, string $record_id, string $failure_code, array $details = [] ): void {
		$post = get_post( $post_id );

		$error_codes = [
			Deletion_Failure::CODE_DELETE_API_ERROR => 'vip_agentforce_delete_api_error',
		];

		$error_messages = [
			Deletion_Failure::CODE_DELETE_API_ERROR => 'Delete API call failed',
		];

		$error_data = array_merge(
			[
				'post_id'   => $post_id,
				'record_id' => $record_id,
			],
			$details
		);

		$failure = new Deletion_Failure(
			[
				'failure_code' => $failure_code,
				'post'         => $post,
				'record_id'    => $record_id,
				'error'        => new \WP_Error(
					$error_codes[ $failure_code ] ?? 'vip_agentforce_deletion_failed',
					$error_messages[ $failure_code ] ?? 'Deletion failed',
					$error_data
				),
			]
		);

		/**
		 * Fires when a post deletion from Salesforce fails.
		 *
		 * This action fires when we attempt to delete a post from Salesforce
		 * but the API call fails.
		 *
		 * @since 1.0.0
		 *
		 * @param Deletion_Failure $failure The failure object containing:
		 *                                  - failure_code: One of the Deletion_Failure::CODE_* constants
		 *                                  - post: The original WP_Post object
		 *                                  - record_id: The Salesforce record ID that failed to delete
		 *                                  - error: WP_Error with failure details
		 */
		do_action( 'vip_agentforce_post_deletion_failed', $failure );
	}
}

// Note: Ingestion::init() is no longer called here.
// Initialization is now handled by Ingestion_Queue and Ingestion_Cron.
