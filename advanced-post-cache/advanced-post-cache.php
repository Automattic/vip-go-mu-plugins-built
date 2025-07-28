<?php

/*
Plugin Name: Advanced Post Caching
Description: Cache post queries. [DISABLED - functionality moved to WordPress core]
Version: 0.3.0
Requires at least: 6.1
Author: Automattic
Author URI: http://automattic.com/

Note: This plugin has been disabled as its functionality is now handled by WordPress core.
The class structure is preserved for backwards compatibility with existing integrations.
*/

class Advanced_Post_Cache {
	var $CACHE_GROUP_PREFIX = 'advanced_post_cache_';

	// Flag for temp (within one page load) turning invalidations on and off
	// @see dont_clear_advanced_post_cache()
	// @see do_clear_advanced_post_cache()
	// Used to prevent invalidation during new comment
	var $do_flush_cache = false;

	// Flag for preventing multiple invalidations in a row: clean_post_cache() calls itself recursively for post children.
	var $need_to_flush_cache = true; // Currently disabled

/* Per cache-clear data */
	var $cache_incr = 0; // Increments the cache group (advanced_post_cache_0, advanced_post_cache_1, ...)
	var $cache_group = ''; // CACHE_GROUP_PREFIX . $cache_incr

/* Per query data */
	var $cache_key = ''; // md5 of current SQL query
	var $all_post_ids = false; // IDs of all posts current SQL query returns
	var $cached_post_ids = array(); // subset of $all_post_ids whose posts are currently in cache
	var $cached_posts = array();
	var $found_posts = false; // The result of the FOUND_ROWS() query
	var $cache_func = 'wp_cache_add'; // Turns to set if there seems to be inconsistencies

	// This has been no-opped in 0.3.0
	function __construct() {
	}

	function setup_for_blog( $new_blog_id = false, $previous_blog_id = false ) {
	}

/* Advanced Post Cache API */

	/**
	 * Flushes the cache by incrementing the cache group
	 * NOTE: Kept functional for backwards compatibility with external integrations
	 */
	function flush_cache() {

	}


/* Cache Reading/Priming Functions - DISABLED (no-op methods for compatibility) */

	/**
	 * DISABLED: Returns query unchanged (no caching)
	 */
	function posts_request( $sql, $query ) {
		// No-op: functionality moved to WordPress core
		return $sql;
	}

	/**
	 * DISABLED: Returns posts unchanged (no caching)
	 */
	function posts_results( $posts, $query ) {
		// No-op: functionality moved to WordPress core
		return $posts;
	}

	/**
	 * DISABLED: Returns limits unchanged (no caching)
	 */
	function post_limits_request( $limits, $query ) {
		// No-op: functionality moved to WordPress core
		return $limits;
	}

	/**
	 * DISABLED: Returns query unchanged (no caching)
	 */
	function found_posts_query( $sql, $query ) {
		// No-op: functionality moved to WordPress core
		return $sql;
	}

	/**
	 * DISABLED: Returns found_posts unchanged (no caching)
	 */
	function found_posts( $found_posts, $query ) {
		// No-op: functionality moved to WordPress core
		return $found_posts;
	}
}

global $advanced_post_cache_object;
$advanced_post_cache_object = new Advanced_Post_Cache;

/**
 * API functions kept for backwards compatibility
 */
function clear_advanced_post_cache() {
	__doing_it_wrong( __FUNCTION__, 'Advanced Post Cache has been disabled. Please see official core documentation: https://developer.wordpress.org/reference/classes/wp_query/#caching-parameters', '0.3.0' );
}

function do_clear_advanced_post_cache() {
	__doing_it_wrong( __FUNCTION__, 'Advanced Post Cache has been disabled. Please see official core documentation: https://developer.wordpress.org/reference/classes/wp_query/#caching-parameters', '0.3.0' );
}

function dont_clear_advanced_post_cache() {
	__doing_it_wrong( __FUNCTION__, 'Advanced Post Cache has been disabled. Please see official core documentation: https://developer.wordpress.org/reference/classes/wp_query/#caching-parameters', '0.3.0' );
}