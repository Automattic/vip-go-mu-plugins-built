<?php

$_tests_dir = getenv( 'WP_TESTS_DIR' );
if ( ! $_tests_dir ) {
	$_tests_dir = '/tmp/wordpress-tests-lib';
}

require_once $_tests_dir . '/includes/functions.php';

define( 'JETPACK_DEV_DEBUG', true );

function _manually_load_plugin() {
	require '/tmp/jetpack/jetpack/jetpack.php';
	require dirname( __FILE__ ) . '/../vip-jetpack.php';
}
tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

require $_tests_dir . '/includes/bootstrap.php';

