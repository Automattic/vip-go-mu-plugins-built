<?php

namespace Automattic\WP\Cron_Control\CLI;

/**
 * Manage Cron Control's internal locks
 */
class Lock extends \WP_CLI_Command {
	/**
	 * Manage the lock that limits concurrent job executions
	 *
	 * @subcommand manage-run-lock
	 * @synopsis [--reset]
	 */
	public function manage_run_lock( $args, $assoc_args ) {
		$lock_name        = \Automattic\WP\Cron_Control\Events::LOCK;
		$lock_limit       = \Automattic\WP\Cron_Control\JOB_CONCURRENCY_LIMIT;
		$lock_description = __( 'This lock limits the number of events run concurrently.', 'automattic-cron-control' );

		$this->get_reset_lock( $args, $assoc_args, $lock_name, $lock_limit, $lock_description );
	}

	/**
	 * Manage the lock that limits concurrent job creation
	 *
	 * @subcommand manage-create-lock
	 * @synopsis [--reset]
	 */
	public function manage_create_lock( $args, $assoc_args ) {
		$lock_name        = \Automattic\WP\Cron_Control\Cron_Options_CPT::LOCK;
		$lock_limit       = \Automattic\WP\Cron_Control\JOB_CREATION_CONCURRENCY_LIMIT;
		$lock_description = __( 'This lock limits the number of events created concurrently.', 'automattic-cron-control' );

		$this->get_reset_lock( $args, $assoc_args, $lock_name, $lock_limit, $lock_description );
	}

	/**
	 * Retrieve a lock's current value, or reset it
	 */
	private function get_reset_lock( $args, $assoc_args, $lock_name, $lock_limit, $lock_description ) {
		// Output information about the lock
		\WP_CLI::line( $lock_description . "\n" );

		\WP_CLI::line( sprintf( __( 'Maximum: %s', 'automattic-cron-control' ), number_format_i18n( $lock_limit ) ) . "\n" );

		// Reset requested
		if ( isset( $assoc_args['reset'] ) ) {
			\WP_CLI::warning( __( 'Resetting lock...', 'automattic-cron-control' ) . "\n" );

			$lock      = \Automattic\WP\Cron_Control\Lock::get_lock_value( $lock_name );
			$timestamp = \Automattic\WP\Cron_Control\Lock::get_lock_timestamp( $lock_name );

			\WP_CLI::line( sprintf( __( 'Previous value: %s', 'automattic-cron-control' ), number_format_i18n( $lock ) ) );
			\WP_CLI::line( sprintf( __( 'Previously modified: %s GMT', 'automattic-cron-control' ), date( TIME_FORMAT, $timestamp ) ) . "\n" );

			\WP_CLI::confirm( sprintf( __( 'Are you sure you want to reset this lock?', 'automattic-cron-control' ) ) );
			\WP_CLI::line( '' );

			\Automattic\WP\Cron_Control\Lock::reset_lock( $lock_name );
			\WP_CLI::success( __( 'Lock reset', 'automattic-cron-control' ) . "\n" );
			\WP_CLI::line( __( 'New lock values:', 'automattic-cron-control' ) );
		}

		// Output lock state
		$lock      = \Automattic\WP\Cron_Control\Lock::get_lock_value( $lock_name );
		$timestamp = \Automattic\WP\Cron_Control\Lock::get_lock_timestamp( $lock_name );

		\WP_CLI::line( sprintf( __( 'Current value: %s', 'automattic-cron-control' ), number_format_i18n( $lock ) ) );
		\WP_CLI::line( sprintf( __( 'Last modified: %s GMT', 'automattic-cron-control' ), date( TIME_FORMAT, $timestamp ) ) );
	}
}

\WP_CLI::add_command( 'cron-control locks', 'Automattic\WP\Cron_Control\CLI\Lock' );
