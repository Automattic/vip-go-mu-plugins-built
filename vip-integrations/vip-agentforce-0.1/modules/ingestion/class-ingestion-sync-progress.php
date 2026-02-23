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
	}

	/**
	 * Mark the sync as failed.
	 *
	 * @param string $reason Reason for failure.
	 */
	public static function fail( string $reason = '' ): void {
		$progress = self::get();
		if ( null === $progress || self::STATUS_RUNNING !== $progress['status'] ) {
			return;
		}

		$progress['status']       = self::STATUS_FAILED;
		$progress['error']        = $reason;
		$progress['completed_at'] = time();
		$progress['updated_at']   = time();

		update_option( self::OPTION_NAME, $progress, false );
	}

	/**
	 * Get the current sync progress.
	 *
	 * @return array{status: string, total: int, processed: int, synced: int, skipped: int, failed: int, deleted: int, last_post_id: int, post_types: array<int, string>, started_at: int|null, updated_at: int|null, completed_at: int|null, error?: string}|null Progress data or null if no sync has been initiated.
	 */
	public static function get(): ?array {
		$progress = get_option( self::OPTION_NAME, null );

		if ( ! is_array( $progress ) ) {
			return null;
		}

		return $progress;
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
