<?php

/*
Plugin Name: Advanced Post Caching
Description: Cache post queries.
Version: 0.2
Author: Automattic
Author URI: http://automattic.com/
*/

class Advanced_Post_Cache {
	var $CACHE_GROUP_PREFIX = 'advanced_post_cache_';

	// Flag for temp (within one page load) turning invalidations on and off
	// @see dont_clear_advanced_post_cache()
	// @see do_clear_advanced_post_cache()
	// Used to prevent invalidation during new comment
	var $do_flush_cache = true;

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

	function __construct() {
		// Specific to certain Memcached Object Cache plugins
		if ( function_exists( 'wp_cache_add_group_prefix_map' ) ) {
			wp_cache_add_group_prefix_map( $this->CACHE_GROUP_PREFIX, 'advanced_post_cache' );
		}

		$this->setup_for_blog();

		add_action( 'switch_blog', array( $this, 'setup_for_blog' ), 10, 2 );

		add_filter( 'posts_request', array( &$this, 'posts_request' ) ); // Short circuits if cached
		add_filter( 'posts_results', array( &$this, 'posts_results' ) ); // Collates if cached, primes cache if not

		add_filter( 'post_limits_request', array( &$this, 'post_limits_request' ), 999, 2 ); // Checks to see if we need to worry about found_posts

		add_filter( 'found_posts_query', array( &$this, 'found_posts_query' ) ); // Short circuits if cached
		add_filter( 'found_posts', array( &$this, 'found_posts' ) ); // Reads from cache if cached, primes cache if not
	}

	function setup_for_blog( $new_blog_id = false, $previous_blog_id = false ) {
		if ( $new_blog_id && $new_blog_id == $previous_blog_id ) {
			return;
		}

		$this->cache_incr = wp_cache_get( 'advanced_post_cache', 'cache_incrementors' ); // Get and construct current cache group name
		if ( !is_numeric( $this->cache_incr ) ) {
			$now = time();
			wp_cache_set( 'advanced_post_cache', $now, 'cache_incrementors' );
			$this->cache_incr = $now;
		}
		$this->cache_group = $this->CACHE_GROUP_PREFIX . $this->cache_incr;
	}

/* Advanced Post Cache API */

	/**
	 * Flushes the cache by incrementing the cache group
	 */
	function flush_cache() {
		// Cache flushes have been disabled
		if ( !$this->do_flush_cache )
			return;

		// Bail on post preview
		if ( is_admin() && isset( $_POST['wp-preview'] ) && 'dopreview' == $_POST['wp-preview'] )
			return;

		// Bail on autosave
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
			return;

		// We already flushed once this page load, and have not put anything into the cache since.
		// OTHER processes may have put something into the cache!  In theory, this could cause stale caches.
		// We do this since clean_post_cache() (which fires the action this method attaches to) is called RECURSIVELY for all descendants.
//		if ( !$this->need_to_flush_cache )
//			return;

		$this->cache_incr = wp_cache_incr( 'advanced_post_cache', 1, 'cache_incrementors' );
		if ( 10 < strlen( $this->cache_incr ) ) {
			wp_cache_set( 'advanced_post_cache', 0, 'cache_incrementors' );
			$this->cache_incr = 0;
		}
		$this->cache_group = $this->CACHE_GROUP_PREFIX . $this->cache_incr;
		$this->need_to_flush_cache = false;
	}


/* Cache Reading/Priming Functions */

	/**
	 * Determines (by hash of SQL) if query is cached.
	 * If cached: Return query of needed post IDs.
	 * Otherwise: Returns query unchanged.
	 */
	function posts_request( $sql ) {
		global $wpdb;

		$this->cache_key = md5( $sql ); // init
		$this->all_post_ids = wp_cache_get( $this->cache_key, $this->cache_group );
		if ( 'NA' !== $this->found_posts )
			$this->found_posts = wp_cache_get( "{$this->cache_key}_found", $this->cache_group );

		if ( $this->all_post_ids xor $this->found_posts )
			$this->cache_func = 'wp_cache_set';
		else
			$this->cache_func = 'wp_cache_add';

		$this->cached_post_ids = array(); // re-init
		$this->cached_posts = array(); // re-init

		// Query is cached
		if ( $this->found_posts && is_array( $this->all_post_ids ) ) {
			if ( function_exists( 'wp_cache_get_multi' ) ) {
				$this->cached_posts = wp_cache_get_multi( array( 'posts' => $this->all_post_ids ) );
			} else {
				$this->cached_posts = array();
				foreach ( $this->all_post_ids as $pid ) {
					$this->cached_posts[] = wp_cache_get( $pid, 'posts' );
				}
			}

			$this->cached_posts = array_filter( $this->cached_posts );

			foreach ( $this->cached_posts as $post ) {
				if ( !empty( $post ) )
					$this->cached_post_ids[] = $post->ID;
			}
			$uncached_post_ids = array_diff( $this->all_post_ids, $this->cached_post_ids );

			if ( $uncached_post_ids )
				return "SELECT * FROM $wpdb->posts WHERE ID IN(" . join( ',', array_map( 'absint', $uncached_post_ids ) ) . ")";
			return '';
		}

		return $sql;
	}

	/**
	 * If cached: Collates posts returned by SQL query with posts that are already cached.  Orders correctly.
	 * Otherwise: Primes cache with data for current posts WP_Query.
	 */
	function posts_results( $posts ) {
		if ( $this->found_posts && is_array( $this->all_post_ids ) ) { // is cached
			$collated_posts = array();
			foreach ( $this->cached_posts as $post )
				$posts[] = $post;

			foreach ( $posts as $post ) {
				$loc = array_search( $post->ID, $this->all_post_ids );
				if ( is_numeric( $loc ) && -1 < $loc )
					$collated_posts[$loc] = $post;
			}
			ksort( $collated_posts );
			return array_map( 'get_post', array_values( $collated_posts ) );
		}

		$post_ids = array();
		foreach ( (array) $posts as $post )
			$post_ids[] = $post->ID;

		if ( !$post_ids )
			return array();

		call_user_func( $this->cache_func, $this->cache_key, $post_ids, $this->cache_group );
		$this->need_to_flush_cache = true;

		return array_map( 'get_post', $posts );
	}

	/**
	 * If $limits is empty, WP_Query never calls the found_rows stuff, so we set $this->found_rows to 'NA'
	 */
	function post_limits_request( $limits, &$query ) {
		if ( empty( $limits ) || ( isset( $query->query_vars['no_found_rows'] ) && $query->query_vars['no_found_rows'] ) )
			$this->found_posts = 'NA';
		else
			$this->found_posts = false; // re-init
		return $limits;
	}

	/**
	 * If cached: Blanks SELECT FOUND_ROWS() query.  This data is already stored in cache.
	 * Otherwise: Returns query unchanged.
	 */
	function found_posts_query( $sql ) {
		if ( $this->found_posts && is_array( $this->all_post_ids ) ) // is cached
			return '';
		return $sql;
	}

	/**
	 * If cached: Returns cached result of FOUND_ROWS() query.
	 * Otherwise: Returs result unchanged
	 */
	function found_posts( $found_posts ) {
		if ( $this->found_posts && is_array( $this->all_post_ids ) ) // is cached
			return (int) $this->found_posts;

		call_user_func( $this->cache_func, "{$this->cache_key}_found", (int) $found_posts, $this->cache_group );
		$this->need_to_flush_cache = true;

		return $found_posts;
	}
}

global $advanced_post_cache_object;
$advanced_post_cache_object = new Advanced_Post_Cache;

function clear_advanced_post_cache() {
	global $advanced_post_cache_object;
	$advanced_post_cache_object->flush_cache();
}

function do_clear_advanced_post_cache() {
	$GLOBALS['advanced_post_cache_object']->do_flush_cache = true;
}

function dont_clear_advanced_post_cache() {
	$GLOBALS['advanced_post_cache_object']->do_flush_cache = false;
}

add_action( 'clean_term_cache', 'clear_advanced_post_cache' );
add_action( 'clean_post_cache', 'clear_advanced_post_cache' );

// Don't clear Advanced Post Cache for a new comment - temp core hack
// http://core.trac.wordpress.org/ticket/15565
add_action( 'wp_updating_comment_count', 'dont_clear_advanced_post_cache' );
add_action( 'wp_update_comment_count'  , 'do_clear_advanced_post_cache'   );
