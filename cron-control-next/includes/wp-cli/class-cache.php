<?php
/**
 * Cache commands for WP-CLI
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\CLI;

/**
 * Manage Cron Control's internal caches
 */
class Cache extends \WP_CLI_Command {
	/**
	 * Flush the cache
	 *
	 * @subcommand flush
	 * @param array $args Array of positional arguments.
	 * @param array $assoc_args Array of flags.
	 */
	public function flush_internal_caches( $args, $assoc_args ) {
		$flushed = \Automattic\WP\Cron_Control\_flush_internal_caches();

		if ( $flushed ) {
			\WP_CLI::success( __( 'Internal caches cleared', 'automattic-cron-control' ) );
		} else {
			\WP_CLI::warning( __( 'No caches to clear', 'automattic-cron-control' ) );
		}
	}
}

\WP_CLI::add_command( 'cron-control cache', 'Automattic\WP\Cron_Control\CLI\Cache' );
