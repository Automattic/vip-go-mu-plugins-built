<?php
/**
 * Ingestion cron module - handles scheduled processing of the queue.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Ingestion_Metrics;
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

		$retry_status = Ingestion_API_Client::get_retry_status();
		if ( $retry_status['active'] ) {
			// The shared block applies to every API call. Skip the whole queue
			// until it expires so this cron tick does not burn retry attempts.
			Logger::info(
				'ingestion-cron',
				'Ingestion API retry backoff active, skipping queue processing',
				[
					'seconds_remaining' => $retry_status['seconds_remaining'],
					'next_retry_at'     => $retry_status['next_retry_at'],
					'reason'            => $retry_status['reason'],
				]
			);

			self::unschedule_if_idle();
			return $results;
		}

		// Process deletions first (they may free up space in Salesforce).
		$retry_backoff_started = false;
		$results               = self::process_deletions( $results, $batch_size, $retry_backoff_started );
		if ( $retry_backoff_started ) {
			// Stop before syncs/bulk work: the same shared API block would
			// defer those items too and could consume their attempt counters.
			self::unschedule_if_idle();
			return $results;
		}

		// Process syncs with remaining batch capacity.
		$remaining_batch = $batch_size - $results['deleted'] - $results['failed'] - $results['skipped'];
		if ( $remaining_batch > 0 ) {
			$retry_backoff_started = false;
			$results               = self::process_syncs( $results, $remaining_batch, $retry_backoff_started );
			if ( $retry_backoff_started ) {
				// Do not enter bulk sync under a newly armed backoff. Bulk sync
				// uses a cursor, so processing while blocked risks skipping work.
				self::unschedule_if_idle();
				return $results;
			}
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

		self::unschedule_if_idle();

		return $results;
	}

	/**
	 * Unschedule processing when no queued work or bulk sync remains.
	 */
	private static function unschedule_if_idle(): void {
		if ( ! Ingestion_Queue::has_queued_items() && ! Ingestion_Sync_Progress::is_running() ) {
			self::unschedule_processing();
		}
	}

	/**
	 * Process queued deletions.
	 *
	 * @param array{synced: int, deleted: int, failed: int, skipped: int} $results                 Current results.
	 * @param int                                                          $limit                   Max items to process.
	 * @param bool                                                         $retry_backoff_started   Whether a retry block started.
	 * @return array{synced: int, deleted: int, failed: int, skipped: int} Updated results.
	 */
	private static function process_deletions( array $results, int $limit, bool &$retry_backoff_started = false ): array {
		$queued_deletions = Ingestion_Queue::get_queued_for_delete( $limit );

		foreach ( $queued_deletions as $item ) {
			$post_id   = $item['post_id'];
			$record_id = $item['record_id'];

			$api_result = Ingestion::delete_record_id_from_api( $record_id );

			if ( $api_result->success ) {
				++$results['deleted'];
				Ingestion_Metrics::record_post_result( 'deleted', 'queue' );

				if ( Logger::is_verbose_ingestion_logging() ) {
					Logger::info(
						'ingestion-cron',
						'Successfully deleted record from Salesforce',
						[
							'post_id'   => $post_id,
							'record_id' => $record_id,
						]
					);
				}

				Ingestion_Queue::dequeue_delete( $post_id );
				continue;
			}

			// Retryable delete failure: leave the item in the queue and
			// bump its attempt counter. Same retry-or-cap semantics as
			// the sync path.
			if ( $api_result->is_retryable() ) {
				$attempts = Ingestion_Queue::increment_delete_attempts( $post_id );

				if ( $attempts >= Ingestion_Queue::MAX_RETRYABLE_ATTEMPTS ) {
					++$results['failed'];
					Ingestion_Metrics::record_post_result( 'failed', 'queue' );

					Logger::error(
						'ingestion-cron',
						'Delete exhausted retryable attempts, giving up',
						[
							'post_id'       => $post_id,
							'record_id'     => $record_id,
							'attempts'      => $attempts,
							'error_message' => $api_result->error_message,
						]
					);

					Ingestion::fire_deletion_failure(
						$post_id,
						$record_id,
						Deletion_Failure::CODE_DELETE_API_ERROR,
						[ 'result' => $api_result ]
					);

					Ingestion_Queue::dequeue_delete( $post_id );
					$retry_backoff_started = true;
					break;
				} else {
					++$results['skipped'];

					if ( Logger::is_verbose_ingestion_logging() ) {
						Logger::info(
							'ingestion-cron',
							'Delete deferred to next cron tick (retryable failure)',
							[
								'post_id'       => $post_id,
								'record_id'     => $record_id,
								'attempts'      => $attempts,
								'max_attempts'  => Ingestion_Queue::MAX_RETRYABLE_ATTEMPTS,
								'error_message' => $api_result->error_message,
							]
						);
					}

					$retry_backoff_started = true;
					break;
				}
			}

			// Permanent delete failure (4xx other than 408/429, config issues).
			// Fire the failure event and dequeue.
			++$results['failed'];
			Ingestion_Metrics::record_post_result( 'failed', 'queue' );

			Logger::warning(
				'ingestion-cron',
				'Failed to delete record from Salesforce (permanent)',
				[
					'post_id'       => $post_id,
					'record_id'     => $record_id,
					'error_message' => $api_result->error_message,
				]
			);

			Ingestion::fire_deletion_failure(
				$post_id,
				$record_id,
				Deletion_Failure::CODE_DELETE_API_ERROR,
				[ 'result' => $api_result ]
			);

			Ingestion_Queue::dequeue_delete( $post_id );
		}

		return $results;
	}

	/**
	 * Process queued syncs.
	 *
	 * @param array{synced: int, deleted: int, failed: int, skipped: int} $results                 Current results.
	 * @param int                                                          $limit                   Max items to process.
	 * @param bool                                                         $retry_backoff_started   Whether a retry block started.
	 * @return array{synced: int, deleted: int, failed: int, skipped: int} Updated results.
	 */
	private static function process_syncs( array $results, int $limit, bool &$retry_backoff_started = false ): array {
		$queued_post_ids = Ingestion_Queue::get_queued_for_sync( $limit );

		foreach ( $queued_post_ids as $post_id ) {
			$post = get_post( $post_id );

			// Post was deleted before cron ran.
			if ( ! $post ) {
				Ingestion_Queue::dequeue_sync( $post_id );
				++$results['skipped'];
				Ingestion_Metrics::record_post_result( 'skipped', 'queue' );
				continue;
			}

			// Use the core sync logic. Pass `defer_retryable_events = true`
			// so we own the failure-event firing for retryable cases — we
			// only want to fire when the retry cap is exhausted, not on
			// every transient failure.
			$sync_result = Ingestion::sync_post( $post, true );

			// Retryable failure (rate limited, 5xx, timeout): leave the
			// item in the queue so the next cron tick picks it up. The
			// shared rate-limit cache block means we won't actually hit
			// SF again until the block expires. We bump an attempt
			// counter and only escalate to a permanent failure when the
			// cap is exhausted.
			if ( Sync_Result::FAILED_API_RETRYABLE === $sync_result->status ) {
				$attempts = Ingestion_Queue::increment_sync_attempts( $post_id );

				if ( $attempts >= Ingestion_Queue::MAX_RETRYABLE_ATTEMPTS ) {
					++$results['failed'];
					Ingestion_Metrics::record_post_result( 'failed', 'queue' );

					Logger::error(
						'ingestion-cron',
						'Sync exhausted retryable attempts, giving up',
						[
							'post_id'       => $post_id,
							'attempts'      => $attempts,
							'error_message' => $sync_result->error_message,
						]
					);

					// Surface the permanent failure event now that we've
					// stopped retrying. `sync_post` deferred firing it
					// while the failure was retryable.
					Ingestion::fire_ingestion_failure(
						$post_id,
						Ingestion_Failure::CODE_API_ERROR,
						[ 'sync_result' => $sync_result ]
					);

					Ingestion_Queue::dequeue_sync( $post_id );
					$retry_backoff_started = true;
					break;
				} else {
					++$results['skipped'];

					if ( Logger::is_verbose_ingestion_logging() ) {
						Logger::info(
							'ingestion-cron',
							'Sync deferred to next cron tick (retryable failure)',
							[
								'post_id'       => $post_id,
								'attempts'      => $attempts,
								'max_attempts'  => Ingestion_Queue::MAX_RETRYABLE_ATTEMPTS,
								'error_message' => $sync_result->error_message,
							]
						);
					}

					$retry_backoff_started = true;
					break;
				}
			}

			switch ( $sync_result->status ) {
				case Sync_Result::INGESTED:
					++$results['synced'];
					Ingestion_Metrics::record_post_result( 'ingested', 'queue' );

					if ( Logger::is_verbose_ingestion_logging() ) {
						Logger::info(
							'ingestion-cron',
							'Successfully synced post to Salesforce',
							[ 'post_id' => $post_id ]
						);
					}
					break;

				case Sync_Result::DELETED:
					++$results['deleted'];
					Ingestion_Metrics::record_post_result( 'deleted', 'queue' );

					if ( Logger::is_verbose_ingestion_logging() ) {
						Logger::info(
							'ingestion-cron',
							'Deleted post from Salesforce (no longer matches filter)',
							[ 'post_id' => $post_id ]
						);
					}
					break;

				case Sync_Result::SKIPPED:
					++$results['skipped'];
					Ingestion_Metrics::record_post_result( 'skipped', 'queue' );
					break;

				case Sync_Result::FAILED_TRANSFORM:
				case Sync_Result::FAILED_API:
					++$results['failed'];
					Ingestion_Metrics::record_post_result( 'failed', 'queue' );

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

			// Dequeue terminal results (success / skipped / permanent failure).
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
		$sync_id      = isset( $progress['sync_id'] ) && is_string( $progress['sync_id'] ) ? $progress['sync_id'] : null;

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
			Ingestion_Sync_Progress::complete( $sync_id );

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

		$new_last_post_id      = $last_post_id;
		$failure_summary       = self::create_bulk_failure_summary();
		$fast_fail_reason      = null;
		$fast_fail_code        = null;
		$retry_backoff_started = false;

		$preflight_failure = Ingestion_API_Client::get_request_preflight_failure();
		if ( null !== $preflight_failure ) {
			// Preflight failures are site-wide setup/auth problems. Fail the
			// batch once instead of making every post repeat the same failure.
			$first_post       = reset( $posts );
			$first_post       = $first_post instanceof \WP_Post ? $first_post : null;
			$preflight_result = null !== $first_post
				? new Sync_Result(
					Sync_Result::FAILED_API,
					$first_post,
					$preflight_failure['message'],
					$preflight_failure['error_class']
				)
				: null;
			// Config failures can be reported directly; auth/API failures use
			// the normal bulk wording so Dashboard sees the same failure shape.
			$fast_fail_reason = 'config' === $preflight_failure['error_class'] || null === $preflight_result
				? $preflight_failure['message']
				: self::get_bulk_fast_fail_reason( $preflight_result );
			$fast_fail_code   = $preflight_failure['error_code'];

			Ingestion_Metrics::record_api_error( $preflight_failure['error_class'] );
			++$results['failed'];
			++$batch_results['failed'];
			Ingestion_Metrics::record_post_result( 'failed', 'bulk' );

			if ( null !== $first_post && null !== $preflight_result ) {
				$failure_summary = self::record_bulk_failure(
					$failure_summary,
					$first_post,
					$preflight_result,
					$last_post_id,
					$limit
				);
			}
		}

		if ( null === $fast_fail_reason ) {
			// Only walk posts when there is no known site-wide failure. Once a
			// global failure appears, the rest of the batch would fail the same way.
			foreach ( $posts as $post ) {
				$sync_result = Ingestion::sync_post( $post );

				switch ( $sync_result->status ) {
					case Sync_Result::INGESTED:
						++$results['synced'];
						++$batch_results['synced'];
						Ingestion_Metrics::record_post_result( 'ingested', 'bulk' );
						break;

					case Sync_Result::DELETED:
						++$results['deleted'];
						++$batch_results['deleted'];
						Ingestion_Metrics::record_post_result( 'deleted', 'bulk' );
						break;

					case Sync_Result::SKIPPED:
						++$results['skipped'];
						++$batch_results['skipped'];
						Ingestion_Metrics::record_post_result( 'skipped', 'bulk' );
						break;

					case Sync_Result::FAILED_TRANSFORM:
					case Sync_Result::FAILED_API:
					case Sync_Result::FAILED_API_RETRYABLE:
						if ( Sync_Result::FAILED_API_RETRYABLE === $sync_result->status ) {
							// Retryable bulk failures are deferred, not processed.
							// Keep the cursor behind this post so the next run
							// retries it after the shared backoff clears.
							if ( 'auth' !== $sync_result->error_class ) {
								$failure_summary = self::record_bulk_failure( $failure_summary, $post, $sync_result, $last_post_id, $limit );
							}
							$retry_backoff_started = true;
							break;
						}

						++$results['failed'];
						++$batch_results['failed'];
						Ingestion_Metrics::record_post_result( 'failed', 'bulk' );

						$failure_summary = self::record_bulk_failure( $failure_summary, $post, $sync_result, $last_post_id, $limit );
						if ( self::is_global_bulk_failure( $sync_result ) ) {
							// These classes are not post-specific. Stop the batch
							// so progress records one clear global failure.
							$fast_fail_reason = self::get_bulk_fast_fail_reason( $sync_result );
							$fast_fail_code   = Ingestion_Error::code_for_error_class( $sync_result->error_class );
						}
						break;
				}

				if ( $retry_backoff_started || null !== $fast_fail_reason ) {
					// Cursor/progress advance only after a post reaches a final
					// state. Deferred retry and global failure both stop before that.
					break;
				}

				$new_last_post_id = $post->ID;
				Ingestion_Sync_Progress::update_live_progress( $progress, $batch_results, $new_last_post_id );
			}
		}

		// Update the cursor and progress counters.
		Ingestion_Sync_Progress::update( $batch_results, $new_last_post_id, $sync_id );

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

		if ( $failure_summary['failed'] > 0 ) {
			Logger::warning(
				'ingestion-cron',
				'Bulk sync batch completed with failures',
				[
					'batch_synced'      => $batch_results['synced'],
					'batch_skipped'     => $batch_results['skipped'],
					'batch_failed'      => $failure_summary['failed'],
					'batch_deleted'     => $batch_results['deleted'],
					'by_status'         => $failure_summary['by_status'],
					'by_error_class'    => $failure_summary['by_error_class'],
					'sample_post_ids'   => $failure_summary['sample_post_ids'],
					'last_post_id'      => $new_last_post_id,
					'sample_size_limit' => 5,
				]
			);
		}

		if ( null !== $fast_fail_reason ) {
			// Store a terminal sync status for deterministic site-wide failures
			// so Dashboard can stop polling as "running".
			Ingestion_Sync_Progress::fail( $fast_fail_reason, $fast_fail_code, $sync_id );
			return $results;
		}

		// If fewer posts returned than requested, we've processed everything.
		// Do not complete while retry backoff is active: the current post has
		// intentionally been left behind the cursor for the next run.
		if ( ! $retry_backoff_started && count( $posts ) < $limit ) {
			Ingestion_Sync_Progress::complete( $sync_id );

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
	 * Whether a bulk failure means the rest of the current run is doomed.
	 */
	private static function is_global_bulk_failure( Sync_Result $result ): bool {
		// These classes describe shared setup/API state rather than malformed
		// individual posts, so continuing would only duplicate the same failure.
		return in_array( $result->error_class, [ 'config', 'auth', 'rate_limit', 'server', 'network' ], true );
	}

	/**
	 * Build the stored sync failure reason for a global bulk failure.
	 */
	private static function get_bulk_fast_fail_reason( Sync_Result $result ): string {
		$error_class = $result->error_class ?? 'unexpected';
		$message     = $result->error_message ?? 'Unknown bulk sync failure';

		return sprintf( 'Bulk sync fast-failed after global %s error: %s', $error_class, $message );
	}

	/**
	 * Create a fresh bulk failure summary.
	 *
	 * @return array{failed: int, by_status: array<string, int>, by_error_class: array<string, int>, sample_post_ids: array<int, int>, first_failure_logged: bool}
	 */
	private static function create_bulk_failure_summary(): array {
		return [
			'failed'               => 0,
			'by_status'            => [],
			'by_error_class'       => [],
			'sample_post_ids'      => [],
			'first_failure_logged' => false,
		];
	}

	/**
	 * Record one bulk sync failure and log the first failure immediately.
	 *
	 * @param array{failed: int, by_status: array<string, int>, by_error_class: array<string, int>, sample_post_ids: array<int, int>, first_failure_logged: bool} $summary Current summary.
	 * @param \WP_Post                                                                                                                             $post    Failed post.
	 * @param Sync_Result                                                                                                                          $result  Sync result.
	 * @param int                                                                                                                                  $last_post_id Cursor before this batch.
	 * @param int                                                                                                                                  $batch_limit  Maximum batch size.
	 * @return array{failed: int, by_status: array<string, int>, by_error_class: array<string, int>, sample_post_ids: array<int, int>, first_failure_logged: bool}
	 */
	private static function record_bulk_failure( array $summary, \WP_Post $post, Sync_Result $result, int $last_post_id, int $batch_limit ): array {
		$error_class = $result->error_class ?? 'unexpected';

		++$summary['failed'];
		$summary['by_status'][ $result->status ]   = ( $summary['by_status'][ $result->status ] ?? 0 ) + 1;
		$summary['by_error_class'][ $error_class ] = ( $summary['by_error_class'][ $error_class ] ?? 0 ) + 1;
		if ( count( $summary['sample_post_ids'] ) < 5 ) {
			$summary['sample_post_ids'][] = $post->ID;
		}

		if ( ! $summary['first_failure_logged'] ) {
			Logger::warning(
				'ingestion-cron',
				'Bulk sync encountered first failure',
				[
					'post_id'       => $post->ID,
					'status'        => $result->status,
					'error_class'   => $error_class,
					'error_message' => $result->error_message,
					'last_post_id'  => $last_post_id,
					'batch_limit'   => $batch_limit,
				]
			);

			$summary['first_failure_logged'] = true;
		}

		return $summary;
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
