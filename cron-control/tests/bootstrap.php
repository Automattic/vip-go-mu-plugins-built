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

	define(
		'CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS',
		array(
			array(
				'schedule' => 'hourly',
				'action'   => 'cron_control_additional_internal_event',
				'callback' => '__return_true',
			),
		)
	);

	// Nonsense values to test constraints and aid testing.
	define( 'CRON_CONTROL_CACHE_BUCKET_SIZE', 0 );
	define( 'CRON_CONTROL_MAX_CACHE_BUCKETS', PHP_INT_MAX / 2 );

	require dirname( dirname( __FILE__ ) ) . '/cron-control.php';

	// Plugin loads after `wp_install()` is called, so we compensate.
	\Automattic\WP\Cron_Control\Events_Store::instance()->prepare_table();

	// Need to re-add the filters since they would have been skipped over in wp-adapter.php the first time around.
	add_filter( 'pre_schedule_event', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_schedule_event', 10, 2 );
	add_filter( 'pre_reschedule_event', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_reschedule_event', 10, 2 );
	add_filter( 'pre_unschedule_event', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_unschedule_event', 10, 4 );
	add_filter( 'pre_clear_scheduled_hook', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_clear_scheduled_hook', 10, 3 );
	add_filter( 'pre_unschedule_hook', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_unschedule_hook', 10, 2 );
	add_filter( 'pre_get_scheduled_event', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_get_scheduled_event', 10, 4 );
	add_filter( 'pre_get_ready_cron_jobs', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_get_ready_cron_jobs', 10, 1 );
	add_filter( 'pre_option_cron', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_get_cron_option', 10 );
	add_filter( 'pre_update_option_cron', __NAMESPACE__ . '\Automattic\WP\Cron_Control\pre_update_cron_option', 10, 2 );
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Utilities.
require_once __DIR__ . '/includes/class-utils.php';

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';
