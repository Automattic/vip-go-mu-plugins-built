<?php
/**
 * Ingestion queue module - manages async processing of posts via cron.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Logger;

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
			Ingestion::sync_post( $post );
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

		Logger::info(
			'ingestion-queue',
			'Post queued for sync',
			[
				'post_id' => $post_id,
			]
		);
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

		Logger::info(
			'ingestion-queue',
			'Post queued for deletion',
			[
				'post_id'   => $post_id,
				'record_id' => $record_id,
			]
		);
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
	 * @param int $post_id Post ID.
	 */
	public static function dequeue_sync( int $post_id ): void {
		delete_post_meta( $post_id, self::META_KEY_QUEUED_FOR_SYNC );
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
}
