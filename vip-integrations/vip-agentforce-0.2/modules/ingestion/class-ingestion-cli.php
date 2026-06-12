<?php
/**
 * WP-CLI commands for ingestion module.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;
use Automattic\VIP\Salesforce\Agentforce\Utils\Ingestion_Metrics;
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
	 * [--preflight-check]
	 * : Check if the site is ready for sync (config propagated, filters registered). Returns JSON with readiness status.
	 *
	 * For multisite, use `--url=<site-url>` so WP-CLI boots in the target site's context before running sync, status, reset, or preflight checks.
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

		// Handle --preflight-check flag.
		if ( isset( $assoc_args['preflight-check'] ) ) {
			$this->preflight_check( $assoc_args );
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
			$detail = 'No vip_agentforce_should_ingest_post filter registered. Cannot determine which posts to sync.';
			if ( 'json' === $format ) {
				$this->output_json_error( Ingestion_Error::FILTER_NOT_REGISTERED, $detail, Ingestion_Sync_Progress::STATUS_IDLE );
				return;
			}

			WP_CLI::error( $detail, false );
			return;
		}

		// Block if already running.
		if ( Ingestion_Sync_Progress::is_running() ) {
			$detail = 'A sync is already in progress. Use --status to check progress or --reset to clear a stuck sync.';
			if ( 'json' === $format ) {
				$this->output_json_error( Ingestion_Error::SYNC_IN_PROGRESS, $detail, Ingestion_Sync_Progress::STATUS_RUNNING );
				return;
			}

			WP_CLI::error( $detail, false );
			return;
		}

		$preflight_failure = Ingestion_API_Client::get_request_preflight_failure();
		if ( null !== $preflight_failure ) {
			// Do not start a bulk sync when setup/auth is already known bad.
			// JSON keeps Dashboard on stable error codes; text keeps WP-CLI direct.
			$detail = $preflight_failure['message'];
			Ingestion_Metrics::record_api_error( $preflight_failure['error_class'] );
			if ( 'json' === $format ) {
				$this->output_json_error(
					$preflight_failure['error_code'],
					$detail,
					Ingestion_Sync_Progress::STATUS_IDLE,
					[ 'error_class' => $preflight_failure['error_class'] ]
				);
				return;
			}

			WP_CLI::error( $detail, false );
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
			$detail = 'No published posts found to sync.';
			if ( 'json' === $format ) {
				$this->output_json_error( Ingestion_Error::NO_PUBLISHED_POSTS, $detail, Ingestion_Sync_Progress::STATUS_IDLE );
				return;
			}

			WP_CLI::warning( $detail );
			return;
		}

		// Start the sync progress tracker.
		$started = Ingestion_Sync_Progress::start( $total, array_values( $post_types ) );

		if ( ! $started ) {
			$detail = 'Failed to start sync. A sync may already be in progress.';
			if ( 'json' === $format ) {
				$this->output_json_error( Ingestion_Error::SYNC_START_FAILED, $detail, Ingestion_Sync_Progress::STATUS_FAILED );
				return;
			}

			WP_CLI::error( $detail, false );
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
	 * Emit a structured JSON failure the wizard can render as an on-design notice.
	 *
	 * `message` is the customer-friendly copy; `detail` preserves the raw,
	 * developer-facing text for CLI/dev users.
	 *
	 * @param string               $error_code Stable error code (see Ingestion_Error).
	 * @param string               $detail     Raw developer-facing message.
	 * @param string               $status     Sync status to report.
	 * @param array<string, mixed> $extra      Additional fields to merge into the payload.
	 */
	private function output_json_error( string $error_code, string $detail, string $status, array $extra = [] ): void {
		echo wp_json_encode(
			array_merge(
				[
					'success'    => false,
					'error_code' => $error_code,
					'message'    => Ingestion_Error::message( $error_code ),
					'detail'     => $detail,
					'status'     => $status,
				],
				$extra
			)
		);
	}

	/**
	 * Check if the site is ready for a sync operation.
	 *
	 * Verifies that the configuration has propagated to the WordPress runtime
	 * by checking for registered filters and required API configuration.
	 *
	 * @param array<string, string> $assoc_args Associative arguments (supports 'format').
	 */
	private function preflight_check( array $assoc_args = [] ): void {
		$format = $assoc_args['format'] ?? 'json';

		$config = Configs::get_config();

		$has_filter       = (bool) has_filter( 'vip_agentforce_should_ingest_post' );
		$sync_all_posts   = Configs::should_sync_all_posts();
		$categories       = Configs::get_ingestion_categories();
		$has_api_url      = ! empty( $config['ingestion_api_instance_url'] );
		$token_failure    = Configs::get_ingestion_token_failure();
		$has_api_token    = ! empty( $config['ingestion_api_token'] );
		$has_valid_token  = Configs::has_valid_ingestion_token();
		$has_api_source   = ! empty( $config['ingestion_api_source_name'] );
		$has_api_object   = ! empty( $config['ingestion_api_object_name'] );
		$has_required_api = $has_api_url && $has_valid_token && $has_api_source && $has_api_object;

		// Ready if filter is registered AND all required API config is present.
		$ready = $has_filter && $has_required_api;

		$result = [
			'ready'                     => $ready,
			'filter_registered'         => $has_filter,
			'sync_all_posts'            => $sync_all_posts,
			'categories'                => $categories,
			'categories_count'          => count( $categories ),
			'has_api_url'               => $has_api_url,
			'has_api_token'             => $has_api_token,
			'has_valid_ingestion_token' => $has_valid_token,
			'token_error_class'         => $token_failure['error_class'] ?? null,
			'token_error_code'          => $token_failure['error_code'] ?? null,
			'token_error'               => $token_failure['message'] ?? null,
			'token_error_message'       => isset( $token_failure['error_code'] ) ? Ingestion_Error::message( $token_failure['error_code'] ) : null,
			'has_api_source'            => $has_api_source,
			'has_api_object'            => $has_api_object,
		];

		if ( 'json' === $format ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode -- CLI output.
			echo json_encode( $result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
		} else {
			WP_CLI::log( '=== Preflight Check ===' );
			WP_CLI::log( sprintf( 'Ready: %s', $ready ? 'Yes' : 'No' ) );
			WP_CLI::log( sprintf( 'Filter registered: %s', $has_filter ? 'Yes' : 'No' ) );
			WP_CLI::log( sprintf( 'Sync all posts: %s', $sync_all_posts ? 'Yes' : 'No' ) );
			WP_CLI::log( sprintf( 'Categories configured: %d', count( $categories ) ) );
			WP_CLI::log( sprintf( 'API URL: %s', $has_api_url ? 'Set' : 'Missing' ) );
			WP_CLI::log( sprintf( 'API token: %s', $has_api_token ? 'Set' : 'Missing' ) );
			WP_CLI::log( sprintf( 'API token valid: %s', $has_valid_token ? 'Yes' : 'No' ) );
			WP_CLI::log( sprintf( 'API source: %s', $has_api_source ? 'Set' : 'Missing' ) );
			WP_CLI::log( sprintf( 'API object: %s', $has_api_object ? 'Set' : 'Missing' ) );
		}
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
			$this->log_retry_status();
			return;
		}

		$progress = Ingestion_Sync_Progress::get_status_response( $progress );

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

		$this->log_retry_status();
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
			$output = Ingestion_Sync_Progress::get_idle_status_response();
		} else {
			$output = Ingestion_Sync_Progress::get_status_response( $progress );
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
	 * For multisite, use `--url=<site-url>` so WP-CLI boots in the target site's context before deleting.
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
		$this->log_retry_status();

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

			$retry_status = Ingestion_API_Client::get_retry_status();
			if ( $retry_status['active'] ) {
				// `--all` must stop at the shared backoff boundary. Looping here
				// would turn one deferred item into many wasted attempts.
				WP_CLI::warning(
					sprintf(
						'Ingestion API retry backoff is active; stopping before the next batch. Next retry: in %s.',
						human_time_diff( time(), (int) ceil( $retry_status['blocked_until'] ?? time() ) )
					)
				);
				break;
			}

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
		$this->log_retry_status();

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

	/**
	 * Clear the shared Ingestion API retry backoff.
	 *
	 * ## EXAMPLES
	 *
	 *     wp vip-agentforce ingestion clear-retry-backoff
	 *
	 * @subcommand clear-retry-backoff
	 */
	public function clear_retry_backoff(): void {
		Ingestion_API_Client::clear_retry_status();
		WP_CLI::success( 'Ingestion API retry backoff cleared.' );
	}

	/**
	 * Log shared retry status for Support diagnostics.
	 */
	private function log_retry_status(): void {
		$status = Ingestion_API_Client::get_retry_status();

		if ( ! $status['active'] && 0 === $status['consecutive_failures'] ) {
			// Keep normal status output compact. Once an incident has happened,
			// even an expired state is useful enough to show for Support.
			return;
		}

		WP_CLI::log( '' );
		WP_CLI::log( '=== Ingestion API Retry Backoff ===' );
		WP_CLI::log( sprintf( 'Active: %s', $status['active'] ? 'Yes' : 'No' ) );
		WP_CLI::log( sprintf( 'Consecutive retryable failures: %d', $status['consecutive_failures'] ) );

		if ( $status['active'] && null !== $status['blocked_until'] ) {
			// Only active states get an ETA; expired diagnostic state should not
			// imply that cron is still waiting.
			WP_CLI::log(
				sprintf(
					'Next retry: in %s (%s UTC)',
					human_time_diff( time(), (int) ceil( $status['blocked_until'] ) ),
					gmdate( 'Y-m-d H:i:s', (int) ceil( $status['blocked_until'] ) )
				)
			);
		}

		if ( null !== $status['reason'] ) {
			WP_CLI::log( sprintf( 'Reason: %s', $status['reason'] ) );
		}

		if ( null !== $status['status_code'] ) {
			WP_CLI::log( sprintf( 'Last status code: %d', $status['status_code'] ) );
		}

		if ( null !== $status['last_error_message'] ) {
			WP_CLI::log( sprintf( 'Last error: %s', $status['last_error_message'] ) );
		}

		WP_CLI::log( 'Clear with: wp vip-agentforce ingestion clear-retry-backoff' );
	}
}

WP_CLI::add_command( 'vip-agentforce ingestion', Ingestion_CLI::class );
