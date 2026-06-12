<?php
/**
 * Sync progress tracking for bulk ingestion operations.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

/**
 * Tracks progress of bulk sync operations using a wp_option as cursor-based state.
 *
 * The CLI `sync` command initiates a bulk sync by writing initial progress state.
 * The cron job picks up active bulk syncs and processes them in batches using
 * a cursor (last_post_id) to paginate through posts efficiently.
 */
class Ingestion_Sync_Progress {
	/**
	 * Option name for storing sync progress.
	 */
	public const OPTION_NAME = 'vip_agentforce_sync_progress';

	/**
	 * Cache group for live sync progress snapshots.
	 */
	public const LIVE_PROGRESS_CACHE_GROUP = 'vip-agentforce';

	/**
	 * Maximum age, in seconds, for a live snapshot to override stored progress.
	 */
	public const LIVE_PROGRESS_MAX_AGE = 30;

	/**
	 * Sync status constants.
	 */
	public const STATUS_IDLE      = 'idle';
	public const STATUS_RUNNING   = 'running';
	public const STATUS_COMPLETED = 'completed';
	public const STATUS_FAILED    = 'failed';

	/**
	 * Start a new bulk sync operation.
	 *
	 * @param int                $total      Total number of posts to process.
	 * @param array<int, string> $post_types Post types being synced.
	 * @return bool True if started, false if a sync is already running.
	 */
	public static function start( int $total, array $post_types = [] ): bool {
		if ( self::is_running() ) {
			return false;
		}

		self::clear_live_progress();

		$progress = [
			'status'       => self::STATUS_RUNNING,
			'total'        => $total,
			'processed'    => 0,
			'synced'       => 0,
			'skipped'      => 0,
			'failed'       => 0,
			'deleted'      => 0,
			'last_post_id' => 0,
			'post_types'   => $post_types,
			'sync_id'      => wp_generate_uuid4(),
			'started_at'   => time(),
			'updated_at'   => time(),
			'completed_at' => null,
		];

		update_option( self::OPTION_NAME, $progress, false );

		return true;
	}

	/**
	 * Update progress after processing a batch.
	 *
	 * @param array{synced: int, skipped: int, failed: int, deleted: int} $batch_results Results from the batch.
	 * @param int                                                         $last_post_id  The last post ID processed (cursor).
	 */
	public static function update( array $batch_results, int $last_post_id ): void {
		$progress = self::get();
		if ( null === $progress || self::STATUS_RUNNING !== $progress['status'] ) {
			return;
		}

		$processed = ( $batch_results['synced'] ?? 0 )
			+ ( $batch_results['skipped'] ?? 0 )
			+ ( $batch_results['failed'] ?? 0 )
			+ ( $batch_results['deleted'] ?? 0 );

		$progress['processed']   += $processed;
		$progress['synced']      += $batch_results['synced'] ?? 0;
		$progress['skipped']     += $batch_results['skipped'] ?? 0;
		$progress['failed']      += $batch_results['failed'] ?? 0;
		$progress['deleted']     += $batch_results['deleted'] ?? 0;
		$progress['last_post_id'] = $last_post_id;
		$progress['updated_at']   = time();

		update_option( self::OPTION_NAME, $progress, false );
	}

	/**
	 * Mark the sync as completed.
	 */
	public static function complete(): void {
		$progress = self::get();
		if ( null === $progress || self::STATUS_RUNNING !== $progress['status'] ) {
			return;
		}

		$progress['status']       = self::STATUS_COMPLETED;
		$progress['completed_at'] = time();
		$progress['updated_at']   = time();

		update_option( self::OPTION_NAME, $progress, false );
		self::clear_live_progress();
	}

	/**
	 * Mark the sync as failed.
	 *
	 * @param string      $reason     Raw, developer-facing reason for failure.
	 * @param string|null $error_code Stable customer-facing error code (see Ingestion_Error).
	 */
	public static function fail( string $reason = '', ?string $error_code = null ): void {
		$progress = self::get();
		if ( null === $progress || self::STATUS_RUNNING !== $progress['status'] ) {
			return;
		}

		$progress['status']       = self::STATUS_FAILED;
		$progress['error']        = $reason;
		$progress['error_code']   = $error_code ?? Ingestion_Error::SYNC_FAILED;
		$progress['completed_at'] = time();
		$progress['updated_at']   = time();

		update_option( self::OPTION_NAME, $progress, false );
		self::clear_live_progress();
	}

	/**
	 * Get the current sync progress.
	 *
	 * @return array<string, mixed>|null Progress data or null if no sync has been initiated.
	 */
	public static function get(): ?array {
		$progress = get_option( self::OPTION_NAME, null );

		if ( ! is_array( $progress ) ) {
			return null;
		}

		return $progress;
	}

	/**
	 * Build the cache key for live progress in the current blog context.
	 *
	 * @return string Cache key.
	 */
	public static function get_live_progress_cache_key(): string {
		return self::OPTION_NAME . '_live_' . get_current_blog_id();
	}

	/**
	 * Store a live progress snapshot for the current in-flight batch.
	 *
	 * The stored option remains the durable source of truth. This cache only
	 * exposes diagnostic progress between batch-level option writes.
	 *
	 * @param array<string, mixed>                                      $stored_progress Stored progress at the start of the current batch.
	 * @param array{synced: int, skipped: int, failed: int, deleted: int} $batch_results   Results accumulated so far in the current batch.
	 * @param int                                                       $last_post_id     The last post ID processed.
	 */
	public static function update_live_progress( array $stored_progress, array $batch_results, int $last_post_id ): void {
		if ( self::STATUS_RUNNING !== ( $stored_progress['status'] ?? null ) ) {
			return;
		}

		$current_progress    = self::get();
		$current_is_running  = null !== $current_progress && self::STATUS_RUNNING === ( $current_progress['status'] ?? null );
		$current_is_same_run = $current_is_running && self::is_same_sync( $stored_progress, $current_progress );

		if ( ! $current_is_same_run ) {
			return;
		}

		$processed = ( $batch_results['synced'] ?? 0 )
			+ ( $batch_results['skipped'] ?? 0 )
			+ ( $batch_results['failed'] ?? 0 )
			+ ( $batch_results['deleted'] ?? 0 );

		$live_progress = $stored_progress;

		$live_progress['processed']    = (int) ( $stored_progress['processed'] ?? 0 ) + $processed;
		$live_progress['synced']       = (int) ( $stored_progress['synced'] ?? 0 ) + ( $batch_results['synced'] ?? 0 );
		$live_progress['skipped']      = (int) ( $stored_progress['skipped'] ?? 0 ) + ( $batch_results['skipped'] ?? 0 );
		$live_progress['failed']       = (int) ( $stored_progress['failed'] ?? 0 ) + ( $batch_results['failed'] ?? 0 );
		$live_progress['deleted']      = (int) ( $stored_progress['deleted'] ?? 0 ) + ( $batch_results['deleted'] ?? 0 );
		$live_progress['last_post_id'] = $last_post_id;
		$live_progress['updated_at']   = time();
		$live_progress['blog_id']      = get_current_blog_id();

		wp_cache_set(
			self::get_live_progress_cache_key(),
			$live_progress,
			self::LIVE_PROGRESS_CACHE_GROUP,
			600
		);
	}

	/**
	 * Clear live progress for the current blog context.
	 */
	public static function clear_live_progress(): void {
		wp_cache_delete( self::get_live_progress_cache_key(), self::LIVE_PROGRESS_CACHE_GROUP );
	}

	/**
	 * Build stored/cache/effective progress details for debugging.
	 *
	 * @param array<string, mixed> $stored_progress Stored progress.
	 * @return array<string, array<string, mixed>> Debug progress source data.
	 */
	public static function get_progress_sources( array $stored_progress ): array {
		$stored_source = self::format_progress_source( $stored_progress );
		$cache_source  = self::get_live_progress_source( $stored_progress );

		$effective_source = $stored_source;
		$effective_reason = $cache_source['reason'];
		$source           = 'stored';

		if ( $cache_source['valid'] && self::STATUS_RUNNING === ( $stored_progress['status'] ?? null ) ) {
			if ( $cache_source['processed'] > $stored_source['processed'] ) {
				$effective_source = $cache_source;
				$effective_reason = 'cache_ahead_of_stored';
				$source           = 'cache';
			} else {
				$effective_reason = 'cache_not_ahead_of_stored';
			}
		}

		return [
			'stored'    => $stored_source,
			'cache'     => $cache_source,
			'effective' => [
				'source'       => $source,
				'reason'       => $effective_reason,
				'processed'    => $effective_source['processed'],
				'percentage'   => $effective_source['percentage'],
				'synced'       => $effective_source['synced'],
				'skipped'      => $effective_source['skipped'],
				'failed'       => $effective_source['failed'],
				'deleted'      => $effective_source['deleted'],
				'last_post_id' => $effective_source['last_post_id'],
				'updated_at'   => $effective_source['updated_at'],
			],
		];
	}

	/**
	 * Build a status response when no bulk sync has been initiated.
	 *
	 * @return array<string, mixed> Idle status response data.
	 */
	public static function get_idle_status_response(): array {
		return [
			'status'        => self::STATUS_IDLE,
			'message'       => 'No sync has been initiated.',
			'retry_backoff' => Ingestion_API_Client::get_retry_status(),
		];
	}

	/**
	 * Build a status response using cache-backed effective progress when safe.
	 *
	 * @param array<string, mixed> $progress Stored progress.
	 * @return array<string, mixed> Progress response data.
	 */
	public static function get_status_response( array $progress ): array {
		$progress_sources = self::get_progress_sources( $progress );
		$effective        = $progress_sources['effective'];
		$response         = $progress;

		if ( 'cache' === $effective['source'] ) {
			$response['processed']    = $effective['processed'];
			$response['synced']       = $effective['synced'];
			$response['skipped']      = $effective['skipped'];
			$response['failed']       = $effective['failed'];
			$response['deleted']      = $effective['deleted'];
			$response['last_post_id'] = $effective['last_post_id'];
			$response['updated_at']   = $effective['updated_at'];
		}

		$response['percentage']       = $effective['percentage'];
		$response['progress_sources'] = $progress_sources;
		$response['retry_backoff']    = Ingestion_API_Client::get_retry_status();

		if ( ! empty( $response['error_code'] ) ) {
			// Dashboard reads stable error codes, while Support still gets the
			// raw stored error. Add display copy only when a code exists.
			$response['error_message'] = Ingestion_Error::message( $response['error_code'] );
		}

		return $response;
	}

	/**
	 * Read and validate the live progress cache.
	 *
	 * @param array<string, mixed> $stored_progress Stored progress.
	 * @return array<string, mixed> Cache source data.
	 */
	private static function get_live_progress_source( array $stored_progress ): array {
		$found           = false;
		$cached_progress = wp_cache_get(
			self::get_live_progress_cache_key(),
			self::LIVE_PROGRESS_CACHE_GROUP,
			false,
			$found
		);

		if ( ! $found ) {
			return [
				'available' => false,
				'valid'     => false,
				'reason'    => 'cache_missing',
			] + self::empty_progress_source();
		}

		if ( ! is_array( $cached_progress ) ) {
			return [
				'available' => true,
				'valid'     => false,
				'reason'    => 'cache_malformed',
			] + self::empty_progress_source();
		}

		$cache_source = self::format_progress_source( $cached_progress );
		$reason       = self::validate_live_progress( $stored_progress, $cached_progress );

		return [
			'available' => true,
			'valid'     => null === $reason,
			'reason'    => $reason ?? 'cache_valid',
		] + $cache_source;
	}

	/**
	 * Validate that cached progress describes the same running sync.
	 *
	 * @param array<string, mixed> $stored_progress Stored progress.
	 * @param array<string, mixed> $cached_progress Cached progress.
	 * @return string|null Invalid reason, or null when valid.
	 */
	private static function validate_live_progress( array $stored_progress, array $cached_progress ): ?string {
		if ( self::STATUS_RUNNING !== ( $stored_progress['status'] ?? null ) ) {
			return 'stored_not_running';
		}

		if ( self::STATUS_RUNNING !== ( $cached_progress['status'] ?? null ) ) {
			return 'cache_not_running';
		}

		if ( (int) ( $cached_progress['blog_id'] ?? 0 ) !== get_current_blog_id() ) {
			return 'cache_blog_mismatch';
		}

		if ( (int) ( $cached_progress['total'] ?? -1 ) !== (int) ( $stored_progress['total'] ?? -2 ) ) {
			return 'cache_total_mismatch';
		}

		if ( ! self::is_same_sync( $stored_progress, $cached_progress ) ) {
			return 'cache_sync_mismatch';
		}

		foreach ( [ 'processed', 'synced', 'skipped', 'failed', 'deleted', 'last_post_id', 'updated_at' ] as $key ) {
			if ( ! isset( $cached_progress[ $key ] ) || ! is_numeric( $cached_progress[ $key ] ) ) {
				return 'cache_malformed';
			}
		}

		if ( (int) $cached_progress['updated_at'] < (int) ( $stored_progress['updated_at'] ?? 0 ) ) {
			return 'cache_older_than_stored';
		}

		if ( time() - (int) $cached_progress['updated_at'] > self::LIVE_PROGRESS_MAX_AGE ) {
			return 'cache_stale';
		}

		if ( (int) $cached_progress['processed'] > (int) $stored_progress['total'] ) {
			return 'cache_processed_exceeds_total';
		}

		$cache_counter_total = (int) $cached_progress['synced']
			+ (int) $cached_progress['skipped']
			+ (int) $cached_progress['failed']
			+ (int) $cached_progress['deleted'];

		if ( (int) $cached_progress['processed'] !== $cache_counter_total ) {
			return 'cache_counter_mismatch';
		}

		foreach ( [ 'processed', 'synced', 'skipped', 'failed', 'deleted', 'last_post_id' ] as $key ) {
			if ( (int) $cached_progress[ $key ] < (int) ( $stored_progress[ $key ] ?? 0 ) ) {
				return 'cache_behind_stored';
			}
		}

		return null;
	}

	/**
	 * Check whether two progress records describe the same sync run.
	 *
	 * @param array<string, mixed> $stored_progress Stored progress.
	 * @param array<string, mixed> $candidate       Candidate progress.
	 * @return bool True when records share the same sync identity.
	 */
	private static function is_same_sync( array $stored_progress, array $candidate ): bool {
		$stored_sync_id    = $stored_progress['sync_id'] ?? null;
		$candidate_sync_id = $candidate['sync_id'] ?? null;

		return is_string( $stored_sync_id )
			&& '' !== $stored_sync_id
			&& $stored_sync_id === $candidate_sync_id;
	}

	/**
	 * Format progress data for source debugging.
	 *
	 * @param array<string, mixed> $progress Progress data.
	 * @return array<string, int|float>
	 */
	private static function format_progress_source( array $progress ): array {
		$total = (int) ( $progress['total'] ?? 0 );

		return [
			'processed'    => (int) ( $progress['processed'] ?? 0 ),
			'percentage'   => $total > 0
				? (float) round( ( (int) ( $progress['processed'] ?? 0 ) / $total ) * 100, 1 )
				: 0.0,
			'synced'       => (int) ( $progress['synced'] ?? 0 ),
			'skipped'      => (int) ( $progress['skipped'] ?? 0 ),
			'failed'       => (int) ( $progress['failed'] ?? 0 ),
			'deleted'      => (int) ( $progress['deleted'] ?? 0 ),
			'last_post_id' => (int) ( $progress['last_post_id'] ?? 0 ),
			'updated_at'   => (int) ( $progress['updated_at'] ?? 0 ),
		];
	}

	/**
	 * Empty progress source used when no usable cache data is present.
	 *
	 * @return array<string, int|float>
	 */
	private static function empty_progress_source(): array {
		return [
			'processed'    => 0,
			'percentage'   => 0.0,
			'synced'       => 0,
			'skipped'      => 0,
			'failed'       => 0,
			'deleted'      => 0,
			'last_post_id' => 0,
			'updated_at'   => 0,
		];
	}

	/**
	 * Check if a bulk sync is currently running.
	 *
	 * @return bool True if a sync is in progress.
	 */
	public static function is_running(): bool {
		$progress = self::get();

		return null !== $progress && self::STATUS_RUNNING === $progress['status'];
	}

	/**
	 * Reset the sync progress (clear the option).
	 */
	public static function reset(): void {
		delete_option( self::OPTION_NAME );
		self::clear_live_progress();
	}

	/**
	 * Get a human-readable summary of the current progress.
	 *
	 * @return string Summary string.
	 */
	public static function get_summary(): string {
		$progress = self::get();

		if ( null === $progress ) {
			return 'No sync has been initiated.';
		}

		switch ( $progress['status'] ) {
			case self::STATUS_RUNNING:
				$percent = $progress['total'] > 0
					? round( ( $progress['processed'] / $progress['total'] ) * 100, 1 )
					: 0;

				return sprintf(
					'Sync in progress: %d/%d posts processed (%.1f%%) — %d synced, %d skipped, %d failed, %d deleted.',
					$progress['processed'],
					$progress['total'],
					$percent,
					$progress['synced'],
					$progress['skipped'],
					$progress['failed'],
					$progress['deleted']
				);

			case self::STATUS_COMPLETED:
				$duration = $progress['completed_at'] - $progress['started_at'];

				return sprintf(
					'Sync completed in %s — %d synced, %d skipped, %d failed, %d deleted out of %d total.',
					human_time_diff( 0, $duration ),
					$progress['synced'],
					$progress['skipped'],
					$progress['failed'],
					$progress['deleted'],
					$progress['total']
				);

			case self::STATUS_FAILED:
				return sprintf(
					'Sync failed after processing %d/%d posts. Reason: %s',
					$progress['processed'],
					$progress['total'],
					$progress['error'] ?? 'Unknown'
				);

			default:
				return 'No sync in progress.';
		}
	}
}
