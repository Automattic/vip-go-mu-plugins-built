<?php

namespace Automattic\WP\Cron_Control\CLI;

/**
 * Run one-time fixers for Cron Control
 */
class One_Time_Fixers extends \WP_CLI_Command {
	/**
	 * Remove corrupt Cron Control data resulting from initial plugin deployment
	 *
	 * eg.: `wp --allow-root cron-control-fixers remove-all-plugin-data --batch-size=15 --dry-run=true`
	 *
	 * @subcommand remove-all-plugin-data
	 */
	public function purge( $args, $assoc_args ) {
		global $wpdb;

		// Are we actually destroying any data?
		$dry_run = true;

		if ( isset( $assoc_args['dry-run'] ) && 'false' === $assoc_args['dry-run'] ) {
			$dry_run = false;
		}

		// Provide some idea of what's going on
		\WP_CLI::line( __( 'CRON CONTROL', 'automattic-cron-control' ) . "\n" );

		$count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(ID) FROM {$wpdb->posts} WHERE post_type = %s;", 'a8c_cron_ctrl_event' ) );

		if ( is_numeric( $count ) ) {
			$count = (int) $count;
			\WP_CLI::line( sprintf( __( 'Found %s total items', 'automattic-cron-control' ), number_format_i18n( $count ) ) . "\n\n" );
			\WP_CLI::confirm( __( 'Proceed?', 'automattic-cron-control' ) );
		} else {
			\WP_CLI::error( __( 'Something went wrong...aborting!', 'automattic-cron-control' ) );
		}

		// Should we really destroy all this data?
		if ( ! $dry_run ) {
			\WP_CLI::line( __( 'This process will remove all CPT data for the Cron Control plugin', 'automattic-cron-control' ) );
			\WP_CLI::confirm( __( 'Proceed?', 'automattic-cron-control' ) );
			\WP_CLI::line( "\n" . __( 'Starting...', 'automattic-cron-control' ) . "\n" );
		}

		// Determine how many batches this will take
		if ( isset( $assoc_args['batch-size'] ) ) {
			$page_size = max( 1, min( absint( $assoc_args['batch-size'] ), 500 ) );
		} else {
			$page_size = 250;
		}
		\WP_CLI::line( sprintf( __( 'Processing in batches of %s', 'automattic-cron-control' ), number_format_i18n( $page_size ) ) . "\n\n" );

		$pages     = 1;
		$page      = 1;

		if ( $count > $page_size ) {
			$pages = ceil( $count / $page_size );
		}

		// Let's get on with it
		do {
			\WP_CLI::line( "\n\n" . sprintf( __( 'Processing page %s of %s', 'automattic-cron-control' ), number_format_i18n( $page ), number_format_i18n( $pages ) ) . "\n" );

			$items = $wpdb->get_results( $wpdb->prepare( "SELECT ID, post_title FROM {$wpdb->posts} WHERE post_type = %s LIMIT %d,%d", 'a8c_cron_ctrl_event', absint( ( $page - 1 ) * $page_size ),$page_size ) );

			// Nothing more to do
			if ( ! is_array( $items ) || empty( $items ) ) {
				\WP_CLI::line( __( 'No more items found!', 'automattic-cron-control' ) );
				break;
			}

			\WP_CLI::line( sprintf( __( 'Found %s items in this batch' ), number_format_i18n( count( $items ) ) ) );

			foreach ( $items as $item ) {
				\WP_CLI::line( "{$item->ID}, `{$item->post_title}`" );

				if ( ! $dry_run ) {
					wp_delete_post( $item->ID, true );
				}
			}

			// Some cleanup
			unset( $items );
			stop_the_insanity();

			// Prepare for the next batch
			$page++;

			if ( $page > $pages ) {
				break;
			}

			// Don't rush into the next batch, unless we haven't done anything
			if ( ! $dry_run ) {
				sleep( 5 );
			}
		} while( true );

		// Remove the now-stale cache when actively run
		if ( ! $dry_run ) {
			wp_cache_delete( 'a8c_cron_ctrl_option' );
			\WP_CLI::line( "\n" . sprintf( __( 'Cleared the %s cache', 'automattic-cron-control' ), 'Cron Control' ) );
		}

		// Fin
		\WP_CLI::success( __( 'All done.', 'automattic-cron-control' ) );
	}
}

\WP_CLI::add_command( 'cron-control-fixers', 'Automattic\WP\Cron_Control\CLI\One_Time_Fixers' );
