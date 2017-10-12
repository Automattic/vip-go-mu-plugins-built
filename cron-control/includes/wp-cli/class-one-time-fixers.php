<?php
/**
 * Clean up plugin data via WP-CLI
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\CLI;

/**
 * Run one-time fixers for Cron Control
 */
class One_Time_Fixers extends \WP_CLI_Command {
	/**
	 * Remove all data stored in the plugin's table
	 *
	 * @subcommand remove-all-plugin-data
	 * @synopsis [--dry-run=<dry-run>]
	 * @param array $args Array of positional arguments.
	 * @param array $assoc_args Array of flags.
	 */
	public function purge( $args, $assoc_args ) {
		global $wpdb;

		// Are we actually destroying any data?
		$dry_run = true;

		if ( isset( $assoc_args['dry-run'] ) && 'false' === $assoc_args['dry-run'] ) {
			$dry_run = false;
		}

		// Provide some idea of what's going on.
		\WP_CLI::log( __( 'CRON CONTROL', 'automattic-cron-control' ) . "\n" );

		$table_name = \Automattic\WP\Cron_Control\Events_Store::instance()->get_table_name();
		$count = (int) $wpdb->get_var( "SELECT COUNT(ID) FROM {$table_name}" ); // Cannot prepare table name. @codingStandardsIgnoreLine

		if ( $count > 1 ) {
			/* translators: 1: Event count */
			\WP_CLI::log( sprintf( __( 'Found %s total items', 'automattic-cron-control' ), number_format_i18n( $count ) ) . "\n\n" );

			if ( $dry_run ) {
				\WP_CLI::error( __( 'Stopping as this is a dry run!', 'automattic-cron-control' ) );
			}
		} else {
			\WP_CLI::error( __( 'No entries found...aborting!', 'automattic-cron-control' ) );
		}

		// Should we really destroy all this data?
		if ( ! $dry_run ) {
			\WP_CLI::log( __( 'This process will remove all data for the Cron Control plugin', 'automattic-cron-control' ) );
			\WP_CLI::confirm( __( 'Proceed?', 'automattic-cron-control' ) );
			\WP_CLI::log( "\n" . __( 'Starting...', 'automattic-cron-control' ) . "\n" );
		}

		// Don't create new events while deleting events.
		\Automattic\WP\Cron_Control\_suspend_event_creation();

		// Don't truncate as it requires DROP and resets auto-increment value.
		if ( ! $dry_run ) {
			$wpdb->query( "DELETE FROM {$table_name}" ); // Cannot prepare table name. @codingStandardsIgnoreLine
		}

		// Remove the now-stale cache when actively run.
		if ( ! $dry_run ) {
			\Automattic\WP\Cron_Control\_flush_internal_caches();
			/* translators: 1: Plugin name */
			\WP_CLI::log( "\n" . sprintf( __( 'Cleared the %s cache', 'automattic-cron-control' ), 'Cron Control' ) );
		}

		// Let event creation resume.
		\Automattic\WP\Cron_Control\_resume_event_creation();

		// Fin.
		\WP_CLI::success( __( 'All done.', 'automattic-cron-control' ) );
	}

	/**
	 * Remove Cron Control data previously stored in a CPT
	 *
	 * @subcommand purge-legacy-cpt-entries
	 * @synopsis [--batch-size=<batch-size>] [--dry-run=<dry-run>]
	 * @param array $args Array of positional arguments.
	 * @param array $assoc_args Array of flags.
	 */
	public function purge_cpt( $args, $assoc_args ) {
		global $wpdb;

		// Are we actually destroying any data?
		$dry_run = true;

		if ( isset( $assoc_args['dry-run'] ) && 'false' === $assoc_args['dry-run'] ) {
			$dry_run = false;
		}

		// Provide some idea of what's going on.
		\WP_CLI::log( __( 'CRON CONTROL', 'automattic-cron-control' ) . "\n" );

		$count = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(ID) FROM {$wpdb->posts} WHERE post_type = %s;", 'a8c_cron_ctrl_event' ) );

		if ( $count > 0 ) {
			/* translators: 1: Event count */
			\WP_CLI::log( sprintf( _n( 'Found %s item', 'Found %s total items', $count, 'automattic-cron-control' ), number_format_i18n( $count ) ) . "\n\n" );
			\WP_CLI::confirm( __( 'Proceed?', 'automattic-cron-control' ) );
		} else {
			\WP_CLI::error( __( 'No entries found...aborting!', 'automattic-cron-control' ) );
		}

		// Should we really destroy all this data?
		if ( ! $dry_run ) {
			\WP_CLI::log( __( 'This process will remove all CPT data for the Cron Control plugin', 'automattic-cron-control' ) );
			\WP_CLI::confirm( __( 'Proceed?', 'automattic-cron-control' ) );
			\WP_CLI::log( "\n" . __( 'Starting...', 'automattic-cron-control' ) . "\n" );
		}

		// Determine how many batches this will take.
		if ( isset( $assoc_args['batch-size'] ) ) {
			$page_size = max( 1, min( absint( $assoc_args['batch-size'] ), 500 ) );
		} else {
			$page_size = 250;
		}

		/* translators: 1: Batch size */
		\WP_CLI::log( sprintf( __( 'Processing in batches of %s', 'automattic-cron-control' ), number_format_i18n( $page_size ) ) . "\n\n" );

		$pages     = 1;
		$page      = 1;

		if ( $count > $page_size ) {
			$pages = ceil( $count / $page_size );
		}

		// Let's get on with it.
		do {
			/* translators: 1: Current page, 2: total pages */
			\WP_CLI::log( "\n\n" . sprintf( __( 'Processing page %1$s of %2$s', 'automattic-cron-control' ), number_format_i18n( $page ), number_format_i18n( $pages ) ) . "\n" );

			$items = $wpdb->get_results( $wpdb->prepare( "SELECT ID, post_title FROM {$wpdb->posts} WHERE post_type = %s LIMIT %d,%d", 'a8c_cron_ctrl_event', absint( ( $page - 1 ) * $page_size ),$page_size ) );

			// Nothing more to do.
			if ( ! is_array( $items ) || empty( $items ) ) {
				\WP_CLI::log( __( 'No more items found!', 'automattic-cron-control' ) );
				break;
			}

			/* translators: 1: Event count for this batch */
			\WP_CLI::log( sprintf( __( 'Found %s items in this batch', 'automattic-cron-control' ), number_format_i18n( count( $items ) ) ) );

			foreach ( $items as $item ) {
				\WP_CLI::log( "{$item->ID}, `{$item->post_title}`" );

				if ( ! $dry_run ) {
					wp_delete_post( $item->ID, true );
				}
			}

			// Some cleanup.
			unset( $items );
			stop_the_insanity();

			// Prepare for the next batch.
			$page++;

			if ( $page > $pages ) {
				break;
			}

			// Don't rush into the next batch, unless we haven't done anything.
			if ( ! $dry_run ) {
				sleep( 5 );
			}
		} while ( true );

		// Fin.
		\WP_CLI::success( __( 'All done.', 'automattic-cron-control' ) );
	}
}

\WP_CLI::add_command( 'cron-control-fixers', 'Automattic\WP\Cron_Control\CLI\One_Time_Fixers' );
