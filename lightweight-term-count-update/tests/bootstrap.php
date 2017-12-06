<?php
/**
 * PHPUnit bootstrap file
 *
 * @package Lightweight_Term_Count_Update
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
	require dirname( dirname( __FILE__ ) ) . '/lightweight-term-count-update.php';

	// If we're intending to test with an external object cache and we aren't using
	// one, alert the user to the configuration error and exit.
	if ( getenv( 'WP_TEST_OBJECT_CACHE' ) ) {
		if ( ! wp_using_ext_object_cache() ) {
			echo "CONFIGURATION ERROR!\nWP_TEST_OBJECT_CACHE is set, but WordPress is not using an external object cache\n";
			exit( 1 );
		} else {
			echo "Running tests with an external object cache...\n";
		}
	}
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';
