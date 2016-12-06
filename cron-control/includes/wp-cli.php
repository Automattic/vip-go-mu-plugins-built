<?php

namespace Automattic\WP\Cron_Control\CLI;

if ( ! defined( '\WP_CLI' ) || ! \WP_CLI ) {
	return;
}

/**
 * Consistent time format across commands
 */
const TIME_FORMAT = 'Y-m-d H:i:s';

/**
 *  Clear all of the caches for memory management
 */
function stop_the_insanity() {
	global $wpdb, $wp_object_cache;

	$wpdb->queries = array(); // or define( 'WP_IMPORTING', true );

	if ( ! is_object( $wp_object_cache ) )
		return;

	$wp_object_cache->group_ops      = array();
	$wp_object_cache->stats          = array();
	$wp_object_cache->memcache_debug = array();
	$wp_object_cache->cache          = array();

	if ( is_callable( $wp_object_cache, '__remoteset' ) ) {
		$wp_object_cache->__remoteset(); // important
	}
}

/**
 * Load commands
 */
require __DIR__ . '/wp-cli/class-cache.php';
require __DIR__ . '/wp-cli/class-events.php';
require __DIR__ . '/wp-cli/class-one-time-fixers.php';
