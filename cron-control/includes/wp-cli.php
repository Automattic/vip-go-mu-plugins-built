<?php
/**
 * Plugin's WP-CLI integration
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\CLI;

if ( ! defined( '\WP_CLI' ) || ! \WP_CLI ) {
	return;
}

/**
 * Prepare environment
 */
function prepare_environment() {
	// Only interfere with `cron-control` commands.
	$cmd = \WP_CLI::get_runner()->arguments;
	if ( ! is_array( $cmd ) || ! isset( $cmd['0'] ) ) {
		return;
	}

	if ( false === strpos( $cmd[0], 'cron-control' ) ) {
		return;
	}

	// Create table and die, to ensure command runs with proper state.
	if ( ! \Automattic\WP\Cron_Control\Events_Store::is_installed() ) {
		\Automattic\WP\Cron_Control\Events_Store::instance()->cli_create_tables();

		\WP_CLI::error( __( 'Cron Control installation completed. Please try again.', 'automattic-cron-control' ) );
	}

	// Set DOING_CRON when appropriate.
	if ( isset( $cmd[1] ) && 'orchestrate' === $cmd[1] ) {
		@ini_set( 'display_errors', '0' ); // Error output breaks JSON used by runner. @codingStandardsIgnoreLine
		\Automattic\WP\Cron_Control\set_doing_cron();
	}
}
prepare_environment();

/**
 * Consistent time format across commands
 *
 * Defined here for backwards compatibility, as it was here before it was in the primary namespace
 */
const TIME_FORMAT = \Automattic\WP\Cron_Control\TIME_FORMAT;

/**
 *  Clear all of the caches for memory management
 */
function stop_the_insanity() {
	global $wpdb, $wp_object_cache;

	$wpdb->queries = array();

	if ( ! is_object( $wp_object_cache ) ) {
		return;
	}

	$wp_object_cache->group_ops      = array();
	$wp_object_cache->stats          = array();
	$wp_object_cache->memcache_debug = array();
	$wp_object_cache->cache          = array();

	if ( is_callable( $wp_object_cache, '__remoteset' ) ) {
		$wp_object_cache->__remoteset(); // important!
	}
}

/**
 * Load commands
 */
require __DIR__ . '/wp-cli/class-main.php';
require __DIR__ . '/wp-cli/class-cache.php';
require __DIR__ . '/wp-cli/class-events.php';
require __DIR__ . '/wp-cli/class-lock.php';
require __DIR__ . '/wp-cli/class-one-time-fixers.php';
require __DIR__ . '/wp-cli/class-orchestrate.php';
require __DIR__ . '/wp-cli/class-orchestrate-runner.php';
require __DIR__ . '/wp-cli/class-rest-api.php';
