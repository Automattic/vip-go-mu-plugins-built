<?php
/**
 * Ingestion cron module - handles scheduled processing of the queue.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Logger;

/**
 * Handles cron-based processing of the ingestion queue.
 *
 * Salesforce API calls are primarily processed via this cron job to
 * avoid making them during the request lifecycle, but calls may still
 * occur synchronously when async ingestion is disabled or when falling
 * back from queue capacity limits.
 *
 * Also processes bulk sync operations initiated via CLI,
 * using a cursor-based approach to paginate through all posts.
 */
class Ingestion_Cron {
	/**
	 * Cron hook name for processing the queue.
	 */
	public const CRON_HOOK = 'vip_agentforce_process_ingestion_queue';

	/**
	 * Default batch size for processing.
	 */
	public const DEFAULT_BATCH_SIZE = 100;

	/**
	 * Default cron interval in seconds (1 minute).
	 */
	public const DEFAULT_CRON_INTERVAL = 60;

	/**
	 * Initialize the cron hooks.
	 */
	public static function init(): void {
		add_action( self::CRON_HOOK, [ __CLASS__, 'handle_cron' ] );
		// phpcs:ignore WordPress.WP.CronInterval.ChangeDetected -- interval is dynamic via get_cron_interval() with a 60s minimum.
		add_filter( 'cron_schedules', [ __CLASS__, 'add_cron_schedule' ] );

		// Schedule on init if there are queued items.
		add_action( 'init', [ __CLASS__, 'maybe_schedule_on_init' ], 999 );
	}

	/**
	 * Add custom cron schedule for frequent processing.
	 *
	 * @param array<string, array{interval: int, display: string}> $schedules Existing schedules.
	 * @return array<string, array{interval: int, display: string}> Modified schedules.
	 */
	public static function add_cron_schedule( array $schedules ): array {
		$schedules['vip_agentforce_ingestion'] = [
			'interval' => self::get_cron_interval(),
			'display'  => __( 'VIP Agentforce Ingestion', 'vip-agentforce' ),
		];

		return $schedules;
	}

	/**
	 * Get the cron interval in seconds.
	 *
	 * @return int Interval in seconds (minimum 60 seconds).
	 */
	public static function get_cron_interval(): int {
		/**
		 * Filter the cron interval for queue processing.
		 *
		 * @since 1.0.0
		 *
		 * @param int $interval Interval in seconds. Default 60 (1 minute).
		 */
		$interval = (int) apply_filters( 'vip_agentforce_cron_interval', self::DEFAULT_CRON_INTERVAL );

		// Minimum 1 minute to avoid excessive scheduling.
		return max( MINUTE_IN_SECONDS, $interval );
	}

	/**
	 * Maybe schedule the cron on init if there are pending items.
	 *
	 * Also detects stale cron schedules (e.g., interval changed from 15min to 1min)
	 * and reschedules with the correct interval.
	 */
	public static function maybe_schedule_on_init(): void {
		// Reschedule if the stored interval doesn't match the current one.
		self::maybe_reschedule_stale_interval();

		$has_work = Ingestion_Queue::has_queued_items() || Ingestion_Sync_Progress::is_running();

		if ( $has_work && ! self::is_scheduled() ) {
			self::schedule_processing();
		}
	}

	/**
	 * Detect and fix stale cron timestamps.
	 *
	 * WordPress stores the recurrence schedule name with the event, but the
	 * next-run timestamp may be set far in the future if the event was
	 * originally scheduled with a longer interval (e.g., 15 min → 1 min).
	 * This detects the mismatch and reschedules with the correct timing.
	 */
	private static function maybe_reschedule_stale_interval(): void {
		$timestamp = wp_next_scheduled( self::CRON_HOOK );
		if ( ! $timestamp ) {
			return;
		}

		$expected_interval = self::get_cron_interval();

		// Stale if: next run is more than 2× the interval in the future,
		// or overdue by more than 2× the interval (e.g., scheduled with old 15-min interval).
		// Use 2× to avoid unnecessary rescheduling from minor clock drift.
		$time_until_next = $timestamp - time();
		if ( $time_until_next > ( $expected_interval * 2 ) || $time_until_next < -( $expected_interval * 2 ) ) {
			Logger::info(
				'ingestion-cron',
				'Rescheduling cron: next run too far in the future',
				[
					'time_until_next'   => $time_until_next,
					'expected_interval' => $expected_interval,
				]
			);

			self::unschedule_processing();
			self::schedule_processing();
		}
	}

	/**
	 * Schedule the cron job if not already scheduled.
	 */
	public static function schedule_processing(): void {
		if ( self::is_scheduled() ) {
			return;
		}

		$scheduled = wp_schedule_event( time(), 'vip_agentforce_ingestion', self::CRON_HOOK );

		if ( false !== $scheduled ) {
			Logger::info(
				'ingestion-cron',
				'Scheduled ingestion queue processing cron',
				[ 'interval' => self::get_cron_interval() ]
			);
		}
	}

	/**
	 * Unschedule the cron job.
	 */
	public static function unschedule_processing(): void {
		$timestamp = wp_next_scheduled( self::CRON_HOOK );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, self::CRON_HOOK );

			Logger::info(
				'ingestion-cron',
				'Unscheduled ingestion queue processing cron'
			);
		}
	}

	/**
	 * Check if the cron is scheduled.
	 *
	 * @return bool True if scheduled.
	 */
	public static function is_scheduled(): bool {
		return false !== wp_next_scheduled( self::CRON_HOOK );
	}

	/**
	 * Cron action callback - wrapper for process_queue that returns void.
	 *
	 * WordPress action callbacks should not return values.
	 */
	public static function handle_cron(): void {
		self::process_queue();
	}

	/**
	 * Process the ingestion queue.
	 *
	 * This method can be called directly (e.g., from CLI) to get results.
	 * It handles three types of work:
	 * 1. Queued deletions (highest priority)
	 * 2. Queued syncs (individual post saves)
	 * 3. Bulk sync batches (cursor-based, from CLI sync command)
	 *
	 * @param int|null $batch_size Optional batch size override.
	 * @return array{synced: int, deleted: int, failed: int, skipped: int} Processing results.
	 */
	public static function process_queue( ?int $batch_size = null ): array {
		$batch_size = ( null !== $batch_size ) ? max( 1, $batch_size ) : self::get_batch_size();

		$results = [
			'synced'  => 0,
			'deleted' => 0,
			'failed'  => 0,
			'skipped' => 0,
		];

		Logger::info(
			'ingestion-cron',
			'Starting queue processing',
			[ 'batch_size' => $batch_size ]
		);

		// Process deletions first (they may free up space in Salesforce).
		$results = self::process_deletions( $results, $batch_size );

		// Process syncs with remaining batch capacity.
		$remaining_batch = $batch_size - $results['deleted'] - $results['failed'];
		if ( $remaining_batch > 0 ) {
			$results = self::process_syncs( $results, $remaining_batch );
		}

		// Process bulk sync with remaining batch capacity.
		$remaining_batch = $batch_size - $results['deleted'] - $results['failed'] - $results['synced'] - $results['skipped'];
		if ( $remaining_batch > 0 && Ingestion_Sync_Progress::is_running() ) {
			$results = self::process_bulk_sync( $results, $remaining_batch );
		}

		Logger::info(
			'ingestion-cron',
			'Queue processing complete',
			$results
		);

		// Unschedule if queue is empty AND no bulk sync is running.
		if ( ! Ingestion_Queue::has_queued_items() && ! Ingestion_Sync_Progress::is_running() ) {
			self::unschedule_processing();
		}

		return $results;
	}

	/**
	 * Process queued deletions.
	 *
	 * @param array{synced: int, deleted: int, failed: int, skipped: int} $results Current results.
	 * @param int                                                          $limit   Max items to process.
	 * @return array{synced: int, deleted: int, failed: int, skipped: int} Updated results.
	 */
	private static function process_deletions( array $results, int $limit ): array {
		$queued_deletions = Ingestion_Queue::get_queued_for_delete( $limit );

		foreach ( $queued_deletions as $item ) {
			$post_id   = $item['post_id'];
			$record_id = $item['record_id'];

			$api_result = Ingestion::delete_record_id_from_api( $record_id );

			if ( $api_result->success ) {
				++$results['deleted'];

				Logger::info(
					'ingestion-cron',
					'Successfully deleted record from Salesforce',
					[
						'post_id'   => $post_id,
						'record_id' => $record_id,
					]
				);
			} else {
				++$results['failed'];

				Logger::warning(
					'ingestion-cron',
					'Failed to delete record from Salesforce',
					[
						'post_id'       => $post_id,
						'record_id'     => $record_id,
						'error_message' => $api_result->error_message,
					]
				);
			}

			// Always dequeue to avoid infinite retry loops.
			// Failed deletions can be retried via CLI if needed.
			Ingestion_Queue::dequeue_delete( $post_id );
		}

		return $results;
	}

	/**
	 * Process queued syncs.
	 *
	 * @param array{synced: int, deleted: int, failed: int, skipped: int} $results Current results.
	 * @param int                                                          $limit   Max items to process.
	 * @return array{synced: int, deleted: int, failed: int, skipped: int} Updated results.
	 */
	private static function process_syncs( array $results, int $limit ): array {
		$queued_post_ids = Ingestion_Queue::get_queued_for_sync( $limit );

		foreach ( $queued_post_ids as $post_id ) {
			$post = get_post( $post_id );

			// Post was deleted before cron ran.
			if ( ! $post ) {
				Ingestion_Queue::dequeue_sync( $post_id );
				++$results['skipped'];
				continue;
			}

			// Use the core sync logic.
			$sync_result = Ingestion::sync_post( $post );

			switch ( $sync_result->status ) {
				case Sync_Result::INGESTED:
					++$results['synced'];

					Logger::info(
						'ingestion-cron',
						'Successfully synced post to Salesforce',
						[ 'post_id' => $post_id ]
					);
					break;

				case Sync_Result::DELETED:
					++$results['deleted'];

					Logger::info(
						'ingestion-cron',
						'Deleted post from Salesforce (no longer matches filter)',
						[ 'post_id' => $post_id ]
					);
					break;

				case Sync_Result::SKIPPED:
					++$results['skipped'];
					break;

				case Sync_Result::FAILED_TRANSFORM:
				case Sync_Result::FAILED_API:
					++$results['failed'];

					Logger::warning(
						'ingestion-cron',
						'Failed to sync post to Salesforce',
						[
							'post_id'       => $post_id,
							'status'        => $sync_result->status,
							'error_message' => $sync_result->error_message,
						]
					);
					break;
			}

			// Dequeue regardless of result to avoid infinite loops.
			Ingestion_Queue::dequeue_sync( $post_id );
		}

		return $results;
	}

	/**
	 * Process a batch of the bulk sync using a cursor.
	 *
	 * Queries posts with ID > last_post_id, processes them, then updates the cursor.
	 * When no more posts are found, marks the bulk sync as completed.
	 *
	 * @param array{synced: int, deleted: int, failed: int, skipped: int} $results Current results.
	 * @param int                                                          $limit   Max items to process.
	 * @return array{synced: int, deleted: int, failed: int, skipped: int} Updated results.
	 */
	private static function process_bulk_sync( array $results, int $limit ): array {
		$progress = Ingestion_Sync_Progress::get();
		if ( null === $progress || Ingestion_Sync_Progress::STATUS_RUNNING !== $progress['status'] ) {
			return $results;
		}

		$last_post_id = $progress['last_post_id'] ?? 0;
		$post_types   = ! empty( $progress['post_types'] ) ? $progress['post_types'] : get_post_types( [ 'public' => true ] );

		// Use posts_where filter to apply cursor (WHERE ID > last_post_id) efficiently.
		$cursor_filter = function ( $where ) use ( $last_post_id ) {
			global $wpdb;
			$where .= $wpdb->prepare( " AND {$wpdb->posts}.ID > %d", $last_post_id );
			return $where;
		};

		add_filter( 'posts_where', $cursor_filter );
		$query = new \WP_Query(
			[
				'post_type'              => $post_types,
				'post_status'            => 'publish',
				'posts_per_page'         => $limit,
				'orderby'                => 'ID',
				'order'                  => 'ASC',
				'no_found_rows'          => true,
				'suppress_filters'       => false,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			]
		);
		remove_filter( 'posts_where', $cursor_filter );

		$posts = $query->posts;

		// No more posts — bulk sync is done.
		if ( empty( $posts ) ) {
			Ingestion_Sync_Progress::complete();

			Logger::info(
				'ingestion-cron',
				'Bulk sync completed',
				[
					'total_processed' => $progress['processed'],
					'total'           => $progress['total'],
				]
			);

			return $results;
		}

		$batch_results = [
			'synced'  => 0,
			'skipped' => 0,
			'failed'  => 0,
			'deleted' => 0,
		];

		$new_last_post_id = $last_post_id;

		foreach ( $posts as $post ) {
			$sync_result = Ingestion::sync_post( $post );

			switch ( $sync_result->status ) {
				case Sync_Result::INGESTED:
					++$results['synced'];
					++$batch_results['synced'];
					break;

				case Sync_Result::DELETED:
					++$results['deleted'];
					++$batch_results['deleted'];
					break;

				case Sync_Result::SKIPPED:
					++$results['skipped'];
					++$batch_results['skipped'];
					break;

				case Sync_Result::FAILED_TRANSFORM:
				case Sync_Result::FAILED_API:
					++$results['failed'];
					++$batch_results['failed'];

					Logger::warning(
						'ingestion-cron',
						'Bulk sync: failed to sync post',
						[
							'post_id'       => $post->ID,
							'status'        => $sync_result->status,
							'error_message' => $sync_result->error_message,
						]
					);
					break;
			}

			$new_last_post_id = $post->ID;
		}

		// Update the cursor and progress counters.
		Ingestion_Sync_Progress::update( $batch_results, $new_last_post_id );

		Logger::info(
			'ingestion-cron',
			'Bulk sync batch processed',
			[
				'batch_synced'  => $batch_results['synced'],
				'batch_skipped' => $batch_results['skipped'],
				'batch_failed'  => $batch_results['failed'],
				'batch_deleted' => $batch_results['deleted'],
				'last_post_id'  => $new_last_post_id,
			]
		);

		// If fewer posts returned than requested, we've processed everything.
		if ( count( $posts ) < $limit ) {
			Ingestion_Sync_Progress::complete();

			Logger::info(
				'ingestion-cron',
				'Bulk sync completed',
				[
					'total_processed' => $progress['processed'] + count( $posts ),
					'total'           => $progress['total'],
				]
			);
		}

		return $results;
	}

	/**
	 * Get the batch size for processing.
	 *
	 * @return int Batch size.
	 */
	private static function get_batch_size(): int {
		/**
		 * Filter the batch size for queue processing.
		 *
		 * @param int $batch_size Default batch size.
		 */
		return max( 1, (int) apply_filters( 'vip_agentforce_cron_batch_size', self::DEFAULT_BATCH_SIZE ) );
	}

	/**
	 * Run the queue processing immediately (for CLI use).
	 *
	 * @param int|null $batch_size Optional batch size.
	 * @return array{synced: int, deleted: int, failed: int, skipped: int} Processing results.
	 */
	public static function run_now( ?int $batch_size = null ): array {
		return self::process_queue( $batch_size );
	}
}
