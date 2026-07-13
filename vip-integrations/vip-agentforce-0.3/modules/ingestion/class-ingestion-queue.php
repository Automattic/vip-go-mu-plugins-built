<?php
/**
 * Ingestion queue module - manages async processing of posts via cron.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Logger;
use Automattic\VIP\Salesforce\Agentforce\Utils\Ingestion_Metrics;

/**
 * Handles queueing of posts for async Salesforce ingestion.
 *
 * Instead of making API calls synchronously on save_post hooks,
 * this class queues posts for processing by the cron job.
 *
 * Use the `vip_agentforce_use_async_ingestion` filter to toggle between:
 * - true (default): Queue posts for async processing via cron
 * - false: Process posts synchronously (legacy behavior)
 */
class Ingestion_Queue {
	/**
	 * Post meta key for tracking posts queued for ingestion.
	 */
	public const META_KEY_QUEUED_FOR_SYNC = 'vip_agentforce_queued_for_sync';

	/**
	 * Post meta key for tracking how many times the cron tried (and got a
	 * retryable failure on) a queued sync.
	 */
	public const META_KEY_SYNC_ATTEMPTS = 'vip_agentforce_sync_attempts';

	/**
	 * Maximum number of cron attempts for a single queued sync or delete
	 * before we give up and fire a permanent failure event.
	 *
	 * 60 attempts × 60s cron interval = 1 hour, which lines up with SF's
	 * typical rate-limit window — by the time we hit the cap, if we're
	 * still failing, it's almost certainly not rate limiting anymore
	 * (auth, sustained outage, config) and silent retry would just hide it.
	 */
	public const MAX_RETRYABLE_ATTEMPTS = 60;

	/**
	 * Option name for storing the delete queue.
	 *
	 * We use an option instead of post meta because wp_delete_post() removes
	 * all post meta, which would lose the queue entry before cron processes it.
	 */
	public const OPTION_DELETE_QUEUE = 'vip_agentforce_delete_queue';

	/**
	 * Maximum number of items to store in the delete queue.
	 *
	 * If the queue exceeds this limit, deletions are processed synchronously
	 * to prevent unbounded option growth during bulk delete operations.
	 */
	public const DELETE_QUEUE_MAX_SIZE = 500;

	/**
	 * Queue action type constants.
	 */
	public const ACTION_SYNC   = 'sync';
	public const ACTION_DELETE = 'delete';

	/**
	 * Initialize the queue hooks.
	 */
	public static function init(): void {
		add_action( 'save_post', [ __CLASS__, 'handle_save_post' ], 10, 2 );
		add_action( 'before_delete_post', [ __CLASS__, 'handle_before_delete_post' ], 10, 2 );
	}

	/**
	 * Check if async ingestion is enabled.
	 *
	 * @return bool True if async (cron) mode is enabled, false for sync (immediate) mode.
	 */
	public static function is_async_enabled(): bool {
		/**
		 * Filter to control async vs sync ingestion mode.
		 *
		 * When true (default), posts are queued for async processing via cron.
		 * When false, posts are processed synchronously during the request (legacy behavior).
		 *
		 * @since 1.0.0
		 *
		 * @param bool $use_async Whether to use async ingestion. Default true.
		 */
		return (bool) apply_filters( 'vip_agentforce_use_async_ingestion', true );
	}

	/**
	 * Handle post save - queue for sync or process immediately.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 */
	public static function handle_save_post( int $post_id, \WP_Post $post ): void {
		// Skip revisions and autosaves.
		if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
			return;
		}

		// Skip posts that don't need ingestion and were never previously ingested.
		// Previously ingested posts must still be queued so sync_post() can detect
		// status changes (e.g., un-publish) and delete them from Salesforce.
		if ( ! Ingestion::should_ingest_post( $post ) && ! Ingestion::was_post_ingested( $post ) ) {
			return;
		}

		if ( self::is_async_enabled() ) {
			self::queue_for_sync( $post_id );
		} else {
			// Sync mode: process immediately.
			$sync_result = Ingestion::sync_post( $post );
			self::record_sync_mode_result( $sync_result );
		}
	}

	/**
	 * Handle post deletion - queue for deletion or process immediately.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post    Post object.
	 */
	public static function handle_before_delete_post( int $post_id, \WP_Post $post ): void {
		// Only act if the post was previously ingested.
		// Note: We intentionally do NOT check post_status here. A post may have
		// been trashed (status = 'trash') before being permanently deleted. If it
		// was previously ingested into Salesforce, we need to queue the deletion
		// regardless of its current status.
		if ( ! Ingestion::was_post_ingested( $post ) ) {
			return;
		}

		if ( self::is_async_enabled() ) {
			self::queue_for_delete( $post_id );
		} else {
			// Sync mode: delete immediately.
			Ingestion::handle_before_delete_post( $post_id, $post );
		}
	}

	/**
	 * Queue a post for sync.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function queue_for_sync( int $post_id ): void {
		// If already queued for delete, remove it (sync takes precedence on save).
		self::dequeue_delete( $post_id );

		// Set the queue timestamp.
		update_post_meta( $post_id, self::META_KEY_QUEUED_FOR_SYNC, time() );

		// Ensure the cron is scheduled.
		Ingestion_Cron::schedule_processing();

		if ( Logger::is_verbose_ingestion_logging() ) {
			Logger::info(
				'ingestion-queue',
				'Post queued for sync',
				[
					'post_id' => $post_id,
				]
			);
		}
	}

	/**
	 * Queue a post for deletion from Salesforce.
	 *
	 * Uses a WordPress option instead of post meta because wp_delete_post()
	 * removes all post meta, which would lose the queue entry before cron runs.
	 *
	 * If the queue exceeds DELETE_QUEUE_MAX_SIZE, falls back to synchronous
	 * deletion to prevent unbounded option growth during bulk operations.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function queue_for_delete( int $post_id ): void {
		// Remove any pending sync - deletion supersedes.
		delete_post_meta( $post_id, self::META_KEY_QUEUED_FOR_SYNC );

		// Build the record_id since the post might be deleted by the time cron runs.
		$site_id   = defined( 'VIP_GO_APP_ID' ) ? (string) VIP_GO_APP_ID : '0';
		$blog_id   = (string) get_current_blog_id();
		$record_id = $site_id . '_' . $blog_id . '_' . $post_id;

		// Get current delete queue from option.
		$queue = get_option( self::OPTION_DELETE_QUEUE, [] );
		if ( ! is_array( $queue ) ) {
			$queue = [];
		}

		// If queue is at capacity, process this delete synchronously to prevent unbounded growth.
		if ( count( $queue ) >= self::DELETE_QUEUE_MAX_SIZE ) {
			Logger::info(
				'ingestion-queue',
				'Delete queue at capacity, processing synchronously',
				[
					'post_id'    => $post_id,
					'record_id'  => $record_id,
					'queue_size' => count( $queue ),
					'max_size'   => self::DELETE_QUEUE_MAX_SIZE,
				]
			);

			// Process synchronously - don't block on failure, but log if it fails.
			$api_result = Ingestion::delete_record_id_from_api( $record_id );
			if ( ! $api_result->success ) {
				Logger::error(
					'ingestion-queue',
					'Failed to delete record synchronously when delete queue at capacity',
					[
						'post_id'       => $post_id,
						'record_id'     => $record_id,
						'queue_size'    => count( $queue ),
						'max_size'      => self::DELETE_QUEUE_MAX_SIZE,
						'error_message' => $api_result->error_message,
					]
				);
			}
			return;
		}

		// Add to queue (keyed by record_id to prevent duplicates).
		$queue[ $record_id ] = [
			'post_id'   => $post_id,
			'record_id' => $record_id,
			'queued_at' => time(),
		];

		update_option( self::OPTION_DELETE_QUEUE, $queue, false );

		// Ensure the cron is scheduled.
		Ingestion_Cron::schedule_processing();

		if ( Logger::is_verbose_ingestion_logging() ) {
			Logger::info(
				'ingestion-queue',
				'Post queued for deletion',
				[
					'post_id'   => $post_id,
					'record_id' => $record_id,
				]
			);
		}
	}

	/**
	 * Get posts queued for sync.
	 *
	 * @param int $limit Maximum number of posts to return.
	 * @return array<int, int> Array of post IDs.
	 */
	public static function get_queued_for_sync( int $limit = 100 ): array {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$results = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT post_id FROM {$wpdb->postmeta}
				WHERE meta_key = %s
				ORDER BY meta_value ASC
				LIMIT %d",
				self::META_KEY_QUEUED_FOR_SYNC,
				$limit
			)
		);

		return array_map( 'intval', $results );
	}

	/**
	 * Get posts queued for deletion.
	 *
	 * @param int $limit Maximum number of items to return.
	 * @return array<int, array{post_id: int, record_id: string}> Array of queued deletions.
	 */
	public static function get_queued_for_delete( int $limit = 100 ): array {
		$queue = get_option( self::OPTION_DELETE_QUEUE, [] );
		if ( ! is_array( $queue ) ) {
			return [];
		}

		// Sort by queued_at and limit.
		uasort(
			$queue,
			function ( $a, $b ) {
				return ( $a['queued_at'] ?? 0 ) <=> ( $b['queued_at'] ?? 0 );
			}
		);

		return array_slice( array_values( $queue ), 0, $limit );
	}

	/**
	 * Remove a post from the sync queue.
	 *
	 * Also clears the retry attempt counter so a future re-queue starts
	 * from attempt 0.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function dequeue_sync( int $post_id ): void {
		delete_post_meta( $post_id, self::META_KEY_QUEUED_FOR_SYNC );
		delete_post_meta( $post_id, self::META_KEY_SYNC_ATTEMPTS );
	}

	/**
	 * Get the current retry attempt count for a queued sync.
	 *
	 * @param int $post_id Post ID.
	 * @return int Attempt count (0 if not yet attempted).
	 */
	public static function get_sync_attempts( int $post_id ): int {
		return (int) get_post_meta( $post_id, self::META_KEY_SYNC_ATTEMPTS, true );
	}

	/**
	 * Increment and persist the retry attempt count for a queued sync.
	 *
	 * @param int $post_id Post ID.
	 * @return int The new attempt count after increment.
	 */
	public static function increment_sync_attempts( int $post_id ): int {
		$attempts = self::get_sync_attempts( $post_id ) + 1;
		update_post_meta( $post_id, self::META_KEY_SYNC_ATTEMPTS, $attempts );
		return $attempts;
	}

	/**
	 * Get the current retry attempt count for a queued delete.
	 *
	 * @param int $post_id Post ID.
	 * @return int Attempt count (0 if not yet attempted).
	 */
	public static function get_delete_attempts( int $post_id ): int {
		$queue = get_option( self::OPTION_DELETE_QUEUE, [] );
		if ( ! is_array( $queue ) ) {
			return 0;
		}

		$record_id = self::build_record_id_for_post( $post_id );

		return (int) ( $queue[ $record_id ]['attempts'] ?? 0 );
	}

	/**
	 * Increment and persist the retry attempt count for a queued delete.
	 *
	 * @param int $post_id Post ID.
	 * @return int The new attempt count after increment.
	 */
	public static function increment_delete_attempts( int $post_id ): int {
		$queue = get_option( self::OPTION_DELETE_QUEUE, [] );
		if ( ! is_array( $queue ) ) {
			$queue = [];
		}

		$record_id = self::build_record_id_for_post( $post_id );

		if ( ! isset( $queue[ $record_id ] ) ) {
			// Item already dequeued or never queued — nothing to track.
			return 0;
		}

		$attempts                        = (int) ( $queue[ $record_id ]['attempts'] ?? 0 ) + 1;
		$queue[ $record_id ]['attempts'] = $attempts;
		update_option( self::OPTION_DELETE_QUEUE, $queue, false );

		return $attempts;
	}

	/**
	 * Build the record_id (`{site}_{blog}_{post}`) for a post — used by the
	 * delete queue, which keys entries on record_id rather than post_id so
	 * the queue still has a handle after `wp_delete_post()` removes the post.
	 *
	 * @param int $post_id Post ID.
	 * @return string The record_id.
	 */
	private static function build_record_id_for_post( int $post_id ): string {
		$site_id = defined( 'VIP_GO_APP_ID' ) ? (string) VIP_GO_APP_ID : '0';
		$blog_id = (string) get_current_blog_id();
		return $site_id . '_' . $blog_id . '_' . $post_id;
	}

	/**
	 * Remove a post from the delete queue.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function dequeue_delete( int $post_id ): void {
		$queue = get_option( self::OPTION_DELETE_QUEUE, [] );
		if ( ! is_array( $queue ) ) {
			return;
		}

		// Build record_id to find the entry.
		$site_id   = defined( 'VIP_GO_APP_ID' ) ? (string) VIP_GO_APP_ID : '0';
		$blog_id   = (string) get_current_blog_id();
		$record_id = $site_id . '_' . $blog_id . '_' . $post_id;

		if ( isset( $queue[ $record_id ] ) ) {
			unset( $queue[ $record_id ] );
			update_option( self::OPTION_DELETE_QUEUE, $queue, false );
		}
	}

	/**
	 * Check if there are items in the queue.
	 *
	 * @return bool True if there are queued items.
	 */
	public static function has_queued_items(): bool {
		global $wpdb;

		// Check sync queue (post meta).
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sync_count = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = %s",
				self::META_KEY_QUEUED_FOR_SYNC
			)
		);

		if ( $sync_count > 0 ) {
			return true;
		}

		// Check delete queue (option).
		$delete_queue = get_option( self::OPTION_DELETE_QUEUE, [] );
		return is_array( $delete_queue ) && count( $delete_queue ) > 0;
	}

	/**
	 * Get the count of queued items.
	 *
	 * @return array{sync: int, delete: int} Counts by action type.
	 */
	public static function get_queue_counts(): array {
		global $wpdb;

		// Sync count from post meta.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sync_count = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = %s",
				self::META_KEY_QUEUED_FOR_SYNC
			)
		);

		// Delete count from option.
		$delete_queue = get_option( self::OPTION_DELETE_QUEUE, [] );
		$delete_count = is_array( $delete_queue ) ? count( $delete_queue ) : 0;

		return [
			'sync'   => $sync_count,
			'delete' => $delete_count,
		];
	}

	private static function record_sync_mode_result( Sync_Result $sync_result ): void {
		switch ( $sync_result->status ) {
			case Sync_Result::INGESTED:
				Ingestion_Metrics::record_post_result( 'ingested', 'sync' );
				break;

			case Sync_Result::DELETED:
				Ingestion_Metrics::record_post_result( 'deleted', 'sync' );
				break;

			case Sync_Result::SKIPPED:
				Ingestion_Metrics::record_post_result( 'skipped', 'sync' );
				break;

			case Sync_Result::FAILED_TRANSFORM:
			case Sync_Result::FAILED_API:
			case Sync_Result::FAILED_API_RETRYABLE:
				// Sync mode has no cron-owned retry queue. Count retryable
				// failures as failed here so operators see the immediate result.
				Ingestion_Metrics::record_post_result( 'failed', 'sync' );
				Logger::warning(
					'ingestion-queue',
					'Sync mode ingestion failed',
					[
						'post_id'       => $sync_result->post->ID,
						'status'        => $sync_result->status,
						'error_class'   => $sync_result->error_class,
						'error_message' => $sync_result->error_message,
					]
				);
				break;
		}
	}
}
