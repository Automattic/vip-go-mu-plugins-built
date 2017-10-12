<?php
/**
 * PHPUnit bootstrap file
 *
 * @package a8c_Cron_Control
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
	define( 'WP_CRON_CONTROL_SECRET', 'testtesttest' );

	define( 'CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS', array(
		array(
			'schedule' => 'hourly',
			'action'   => 'cron_control_additional_internal_event',
			'callback' => '__return_true',
		),
	) );

	// Nonsense values to test constraints and aid testing.
	define( 'CRON_CONTROL_CACHE_BUCKET_SIZE', 0 );
	define( 'CRON_CONTROL_MAX_CACHE_BUCKETS', PHP_INT_MAX / 2 );

	require dirname( dirname( __FILE__ ) ) . '/cron-control.php';

	// Plugin loads after `wp_install()` is called, so we compensate.
	// See the `class_init()` method in Events_Store for the logic behind this.
	\Automattic\WP\Cron_Control\Events_Store::instance()->prepare_table();
	remove_filter( 'schedule_event', '__return_false' );
	add_filter( 'pre_option_cron', array( \Automattic\WP\Cron_Control\Events_Store::instance(), 'get_option' ) );
	add_filter( 'pre_update_option_cron', array( \Automattic\WP\Cron_Control\Events_Store::instance(), 'update_option' ), 10, 2 );
	add_filter( 'schedule_event', array( \Automattic\WP\Cron_Control\Events_Store::instance(), 'block_creation_if_job_exists' ) );
	\Automattic\WP\Cron_Control\_resume_event_creation();
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Utilities.
require_once __DIR__ . '/includes/class-utils.php';

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';
