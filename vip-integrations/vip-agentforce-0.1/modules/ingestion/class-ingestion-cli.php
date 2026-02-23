<?php
/**
 * WP-CLI commands for ingestion module.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Logger;
use WP_CLI;
use WP_CLI_Command;

/**
 * Manages Salesforce ingestion operations via WP-CLI.
 */
class Ingestion_CLI extends WP_CLI_Command {

	/**
	 * Sync all eligible published posts to Salesforce.
	 *
	 * Queues a bulk sync for async processing via cron. The command returns
	 * immediately after counting posts and writing initial progress. Use
	 * `wp vip-agentforce ingestion sync-status` to monitor progress.
	 *
	 * ## OPTIONS
	 *
	 * [--status]
	 * : Show the current sync progress instead of starting a new sync.
	 *
	 * [--reset]
	 * : Reset a stuck or completed sync so a new one can be started.
	 *
	 * [--format=<format>]
	 * : Output format. Use 'json' for machine-readable output.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - json
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     # Start async sync of all eligible posts
	 *     wp vip-agentforce ingestion sync
	 *
	 *     # Check sync progress
	 *     wp vip-agentforce ingestion sync --status
	 *
	 *     # Check sync progress as JSON (for programmatic consumption)
	 *     wp vip-agentforce ingestion sync --status --format=json
	 *
	 *     # Reset a completed/stuck sync
	 *     wp vip-agentforce ingestion sync --reset
	 *
	 * @subcommand sync
	 *
	 * @param array<int, string>    $args       Positional arguments.
	 * @param array<string, string> $assoc_args Associative arguments.
	 */
	public function sync( array $args, array $assoc_args ): void {
		// Handle --status flag.
		if ( isset( $assoc_args['status'] ) ) {
			$this->show_sync_status( $assoc_args );
			return;
		}

		// Handle --reset flag.
		if ( isset( $assoc_args['reset'] ) ) {
			$this->reset_sync();
			return;
		}

		$this->start_sync( $assoc_args );
	}

	/**
	 * Show the current sync progress.
	 *
	 * ## OPTIONS
	 *
	 * [--format=<format>]
	 * : Output format. Use 'json' for machine-readable output.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - json
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     wp vip-agentforce ingestion sync-status
	 *     wp vip-agentforce ingestion sync-status --format=json
	 *
	 * @subcommand sync-status
	 *
	 * @param array<int, string>    $args       Positional arguments.
	 * @param array<string, string> $assoc_args Associative arguments.
	 */
	public function sync_status( array $args = [], array $assoc_args = [] ): void {
		$this->show_sync_status( $assoc_args );
	}

	/**
	 * Start a new bulk sync.
	 *
	 * @param array<string, string> $assoc_args Associative arguments.
	 */
	private function start_sync( array $assoc_args = [] ): void {
		$format = $assoc_args['format'] ?? 'table';

		// Check that filters are registered.
		if ( ! has_filter( 'vip_agentforce_should_ingest_post' ) ) {
			$message = 'No vip_agentforce_should_ingest_post filter registered. Cannot determine which posts to sync.';
			if ( 'json' === $format ) {
				echo wp_json_encode( [
					'success' => false,
					'message' => $message,
					'status'  => Ingestion_Sync_Progress::STATUS_IDLE,
				] );
				return;
			}

			WP_CLI::error( $message, false );
			return;
		}

		// Block if already running.
		if ( Ingestion_Sync_Progress::is_running() ) {
			$message = 'A sync is already in progress. Use --status to check progress or --reset to clear a stuck sync.';
			if ( 'json' === $format ) {
				echo wp_json_encode( [
					'success' => false,
					'message' => $message,
					'status'  => Ingestion_Sync_Progress::STATUS_RUNNING,
				] );
				return;
			}

			WP_CLI::error( $message, false );
			return;
		}

		// Count eligible posts.
		$post_types = get_post_types( [ 'public' => true ] );

		$query = new \WP_Query(
			[
				'post_type'      => $post_types,
				'post_status'    => 'publish',
				'posts_per_page' => 1,
				'no_found_rows'  => false,
				'fields'         => 'ids',
			]
		);

		$total = $query->found_posts;

		if ( 0 === $total ) {
			$message = 'No published posts found to sync.';
			if ( 'json' === $format ) {
				echo wp_json_encode( [
					'success' => false,
					'message' => $message,
					'status'  => Ingestion_Sync_Progress::STATUS_IDLE,
				] );
				return;
			}

			WP_CLI::warning( $message );
			return;
		}

		// Start the sync progress tracker.
		$started = Ingestion_Sync_Progress::start( $total, array_values( $post_types ) );

		if ( ! $started ) {
			$message = 'Failed to start sync. A sync may already be in progress.';
			if ( 'json' === $format ) {
				echo wp_json_encode( [
					'success' => false,
					'message' => $message,
					'status'  => Ingestion_Sync_Progress::STATUS_FAILED,
				] );
				return;
			}

			WP_CLI::error( $message, false );
			return;
		}

		// Ensure cron is scheduled to pick up the bulk sync.
		Ingestion_Cron::schedule_processing();

		$message = sprintf(
			'Bulk sync queued: %s posts will be processed by cron. Use `wp vip-agentforce ingestion sync --status` to monitor progress.',
			number_format_i18n( $total )
		);

		if ( 'json' === $format ) {
			echo wp_json_encode( [
				'success'    => true,
				'message'    => $message,
				'status'     => Ingestion_Sync_Progress::STATUS_RUNNING,
				'total'      => $total,
				'post_types' => array_values( $post_types ),
			] );
		} else {
			WP_CLI::success( $message );
		}

		Logger::info(
			'ingestion-cli',
			'Bulk sync initiated via CLI',
			[
				'total'      => $total,
				'post_types' => array_values( $post_types ),
			]
		);
	}

	/**
	 * Display the current sync status.
	 *
	 * @param array<string, string> $assoc_args Associative arguments (supports 'format').
	 */
	private function show_sync_status( array $assoc_args = [] ): void {
		$progress = Ingestion_Sync_Progress::get();
		$format   = $assoc_args['format'] ?? 'table';

		if ( 'json' === $format ) {
			$this->show_sync_status_json( $progress );
			return;
		}

		if ( null === $progress ) {
			WP_CLI::log( 'No sync has been initiated.' );
			return;
		}

		WP_CLI::log( '=== Bulk Sync Status ===' );
		WP_CLI::log( sprintf( 'Status: %s', strtoupper( $progress['status'] ) ) );
		WP_CLI::log( sprintf( 'Progress: %d / %d posts', $progress['processed'], $progress['total'] ) );

		if ( $progress['total'] > 0 ) {
			$percent = round( ( $progress['processed'] / $progress['total'] ) * 100, 1 );
			WP_CLI::log( sprintf( 'Percentage: %.1f%%', $percent ) );
		}

		WP_CLI::log( '' );
		WP_CLI::log( sprintf( 'Synced:  %d', $progress['synced'] ) );
		WP_CLI::log( sprintf( 'Skipped: %d', $progress['skipped'] ) );
		WP_CLI::log( sprintf( 'Failed:  %d', $progress['failed'] ) );
		WP_CLI::log( sprintf( 'Deleted: %d', $progress['deleted'] ) );
		WP_CLI::log( '' );
		WP_CLI::log( sprintf( 'Cursor (last_post_id): %d', $progress['last_post_id'] ) );

		if ( ! empty( $progress['post_types'] ) ) {
			WP_CLI::log( sprintf( 'Post types: %s', implode( ', ', $progress['post_types'] ) ) );
		}

		if ( ! empty( $progress['started_at'] ) ) {
			WP_CLI::log( sprintf( 'Started: %s ago', human_time_diff( $progress['started_at'] ) ) );
		}

		if ( ! empty( $progress['completed_at'] ) ) {
			$duration = $progress['completed_at'] - $progress['started_at'];
			WP_CLI::log( sprintf( 'Duration: %s', human_time_diff( 0, $duration ) ) );
		}

		if ( ! empty( $progress['error'] ) ) {
			WP_CLI::warning( sprintf( 'Error: %s', $progress['error'] ) );
		}
	}

	/**
	 * Output sync status as JSON.
	 *
	 * Outputs a JSON object matching the REST API response shape, with an
	 * additional 'percentage' field for convenience.
	 *
	 * @param array<string, mixed>|null $progress Progress data from Ingestion_Sync_Progress::get().
	 */
	private function show_sync_status_json( ?array $progress ): void {
		if ( null === $progress ) {
			$output = [
				'status'  => Ingestion_Sync_Progress::STATUS_IDLE,
				'message' => 'No sync has been initiated.',
			];
		} else {
			$output               = $progress;
			$output['percentage'] = $progress['total'] > 0
				? (float) round( ( $progress['processed'] / $progress['total'] ) * 100, 1 )
				: 0.0;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode -- CLI output, not database storage.
		echo json_encode( $output, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION );
	}

	/**
	 * Reset sync progress to allow a new sync.
	 */
	private function reset_sync(): void {
		$progress = Ingestion_Sync_Progress::get();

		if ( null === $progress ) {
			WP_CLI::log( 'No sync progress to reset.' );
			return;
		}

		if ( Ingestion_Sync_Progress::STATUS_RUNNING === $progress['status'] ) {
			WP_CLI::warning(
				sprintf(
					'Resetting a running sync (%d/%d posts processed). The in-flight batch will complete but no further batches will run.',
					$progress['processed'],
					$progress['total']
				)
			);
		}

		Ingestion_Sync_Progress::reset();
		WP_CLI::success( 'Sync progress has been reset.' );
	}

	/**
	 * Force delete posts from Salesforce by record ID.
	 *
	 * This command bypasses normal checks - it will attempt to delete even if:
	 * - The post doesn't exist in WordPress
	 * - The post was never ingested (no tracking meta)
	 *
	 * For multisite, use the --url flag to target a specific site. This ensures
	 * the site's theme and plugins are loaded, allowing site-specific hooks to fire.
	 *
	 * ## OPTIONS
	 *
	 * <post_id>...
	 * : One or more post IDs to delete from Salesforce.
	 *
	 * [--blog-id=<blog_id>]
	 * : Blog ID for multisite. Doesn't require the blog to exist - useful for deleting
	 *   records from deleted blogs. Defaults to current blog. If used in conjunction
	 *   with --url to load site context, the blog ID should match the site loaded by --url.
	 *
	 * ## EXAMPLES
	 *
	 *     # Delete a single post
	 *     wp vip-agentforce ingestion delete 123
	 *
	 *     # Delete multiple posts
	 *     wp vip-agentforce ingestion delete 123 456 789
	 *
	 *     # Delete on a specific site (multisite) - use --url to load site context
	 *     wp vip-agentforce ingestion delete 123 --blog-id=2 --url=https://subsite.example.com
	 *
	 * @subcommand delete
	 *
	 * @param array<int, string> $args       Positional arguments (post IDs).
	 * @param array<string, string> $assoc_args Associative arguments.
	 */
	public function delete( array $args, array $assoc_args ): void {
		$blog_id = $assoc_args['blog-id'] ?? (string) get_current_blog_id();
		$site_id = defined( 'VIP_GO_APP_ID' ) ? (string) VIP_GO_APP_ID : '0';

		$success_count = 0;
		$failure_count = 0;

		foreach ( $args as $post_id ) {
			$record_id = $site_id . '_' . $blog_id . '_' . $post_id;

			Logger::info(
				'ingestion-cli',
				'Attempting to force delete record from Salesforce',
				[
					'post_id'   => $post_id,
					'blog_id'   => $blog_id,
					'record_id' => $record_id,
				]
			);

			$result = Ingestion::delete_record_id_from_api( $record_id );

			if ( $result->success ) {
				WP_CLI::success( sprintf( 'Deleted record %s from Salesforce.', $record_id ) );
				++$success_count;

				Logger::info(
					'ingestion-cli',
					'Record deleted from Salesforce successfully',
					[
						'post_id'   => $post_id,
						'record_id' => $record_id,
					]
				);
			} else {
				WP_CLI::warning( sprintf( 'Failed to delete record %s: %s', $record_id, $result->error_message ?? 'Unknown error' ) );
				++$failure_count;

				Logger::info(
					'ingestion-cli',
					'Failed to delete record from Salesforce',
					[
						'post_id'   => $post_id,
						'record_id' => $record_id,
						'result'    => $result,
					]
				);
			}
		}

		if ( $failure_count > 0 ) {
			WP_CLI::error( sprintf( 'Completed with %d success(es) and %d failure(s).', $success_count, $failure_count ), false );
		} else {
			WP_CLI::success( sprintf( 'All %d record(s) deleted successfully.', $success_count ) );
		}
	}

	/**
	 * Process the ingestion queue.
	 *
	 * This command immediately processes all queued posts, making API calls
	 * to Salesforce. Useful for testing or when cron is not available.
	 *
	 * ## OPTIONS
	 *
	 * [--batch-size=<batch_size>]
	 * : Number of items to process per run. Defaults to 50.
	 *
	 * [--all]
	 * : Process all queued items (multiple batches until queue is empty).
	 *
	 * ## EXAMPLES
	 *
	 *     # Process the queue with default batch size
	 *     wp vip-agentforce ingestion process-queue
	 *
	 *     # Process with custom batch size
	 *     wp vip-agentforce ingestion process-queue --batch-size=100
	 *
	 *     # Process all queued items
	 *     wp vip-agentforce ingestion process-queue --all
	 *
	 * @subcommand process-queue
	 *
	 * @param array<int, string>    $args       Positional arguments.
	 * @param array<string, string> $assoc_args Associative arguments.
	 */
	public function process_queue( array $args, array $assoc_args ): void {
		$batch_size  = isset( $assoc_args['batch-size'] ) ? (int) $assoc_args['batch-size'] : null;
		$process_all = isset( $assoc_args['all'] );

		// Show current queue status.
		$counts = Ingestion_Queue::get_queue_counts();
		WP_CLI::log( sprintf( 'Queue status: %d syncs, %d deletions pending.', $counts['sync'], $counts['delete'] ) );

		$bulk_sync_running = Ingestion_Sync_Progress::is_running();

		if ( 0 === $counts['sync'] && 0 === $counts['delete'] && ! $bulk_sync_running ) {
			WP_CLI::success( 'Queue is empty, nothing to process.' );
			return;
		}

		$total_synced  = 0;
		$total_deleted = 0;
		$total_failed  = 0;
		$total_skipped = 0;
		$iterations    = 0;

		do {
			++$iterations;
			WP_CLI::log( sprintf( 'Processing batch %d...', $iterations ) );

			$results = Ingestion_Cron::run_now( $batch_size );

			$total_synced  += $results['synced'];
			$total_deleted += $results['deleted'];
			$total_failed  += $results['failed'];
			$total_skipped += $results['skipped'];

			WP_CLI::log(
				sprintf(
					'Batch %d: synced=%d, deleted=%d, failed=%d, skipped=%d',
					$iterations,
					$results['synced'],
					$results['deleted'],
					$results['failed'],
					$results['skipped']
				)
			);

			// Check if there are more items (queue or active bulk sync).
			$has_more = Ingestion_Queue::has_queued_items() || Ingestion_Sync_Progress::is_running();
		} while ( $process_all && $has_more );

		// Summary.
		WP_CLI::log( '' );
		WP_CLI::log( '=== Queue Processing Summary ===' );
		WP_CLI::log( sprintf( 'Total batches: %d', $iterations ) );
		WP_CLI::log( sprintf( 'Synced: %d', $total_synced ) );
		WP_CLI::log( sprintf( 'Deleted: %d', $total_deleted ) );
		WP_CLI::log( sprintf( 'Failed: %d', $total_failed ) );
		WP_CLI::log( sprintf( 'Skipped: %d', $total_skipped ) );

		// Show remaining items if any.
		$remaining = Ingestion_Queue::get_queue_counts();
		if ( $remaining['sync'] > 0 || $remaining['delete'] > 0 ) {
			WP_CLI::log( sprintf( 'Remaining in queue: %d syncs, %d deletions', $remaining['sync'], $remaining['delete'] ) );
		}

		if ( $total_failed > 0 ) {
			WP_CLI::warning( sprintf( 'Processing completed with %d failure(s).', $total_failed ) );
		} else {
			WP_CLI::success( 'Queue processing completed successfully.' );
		}
	}

	/**
	 * Show the current queue status.
	 *
	 * ## EXAMPLES
	 *
	 *     # Show queue status
	 *     wp vip-agentforce ingestion queue-status
	 *
	 * @subcommand queue-status
	 */
	public function queue_status(): void {
		$counts = Ingestion_Queue::get_queue_counts();

		WP_CLI::log( '=== Ingestion Queue Status ===' );
		WP_CLI::log( sprintf( 'Posts queued for sync: %d', $counts['sync'] ) );
		WP_CLI::log( sprintf( 'Posts queued for deletion: %d', $counts['delete'] ) );
		WP_CLI::log( sprintf( 'Total queued: %d', $counts['sync'] + $counts['delete'] ) );

		// Check cron status.
		$is_scheduled = Ingestion_Cron::is_scheduled();
		WP_CLI::log( '' );
		WP_CLI::log( sprintf( 'Cron scheduled: %s', $is_scheduled ? 'Yes' : 'No' ) );

		if ( $is_scheduled ) {
			$next = wp_next_scheduled( Ingestion_Cron::CRON_HOOK );
			if ( $next ) {
				if ( $next <= time() ) {
					$overdue = human_time_diff( $next, time() );
					WP_CLI::log( sprintf( 'Next scheduled run: overdue by %s (will run on next cron trigger)', $overdue ) );
				} else {
					$next_run = human_time_diff( time(), $next );
					WP_CLI::log( sprintf( 'Next scheduled run: in %s', $next_run ) );
				}
			}
		}

		// Show bulk sync status if active.
		if ( Ingestion_Sync_Progress::is_running() ) {
			WP_CLI::log( '' );
			WP_CLI::log( Ingestion_Sync_Progress::get_summary() );
		}
	}
}

WP_CLI::add_command( 'vip-agentforce ingestion', Ingestion_CLI::class );
