<?php
/**
 * Plugin utilities
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control;

/**
 * Produce a simplified version of the cron events array
 *
 * Also removes superfluous, non-event data that Core stores in the option
 *
 * @param array $events Core's cron events array.
 * @param int   $timestamp Optional. Return only events with this timestamp.
 * @return array
 */
function collapse_events_array( $events, $timestamp = null ) {
	$collapsed_events = array();

	// Ensure an event is always returned.
	if ( ! is_array( $events ) ) {
		return $collapsed_events;
	}

	// Allow filtering to only events with a given timestamp.
	if ( is_numeric( $timestamp ) ) {
		if ( isset( $events[ $timestamp ] ) ) {
			$_events = $events[ $timestamp ];
			$events  = array(
				$timestamp => $_events,
			);
			unset( $_events );
		} else {
			return $collapsed_events;
		}
	}

	// Collapse whatever events we have into an easier format to deal with.
	foreach ( $events as $timestamp => $timestamp_events ) {
		// Skip non-event data that Core includes in the option.
		if ( ! is_numeric( $timestamp ) ) {
			continue;
		}

		foreach ( $timestamp_events as $action => $action_instances ) {
			foreach ( $action_instances as $instance => $instance_args ) {
				$collapsed_events[] = array(
					'timestamp' => $timestamp,
					'action'    => $action,
					'instance'  => $instance,
					'args'      => $instance_args,
				);
			}
		}
	}

	return $collapsed_events;
}

/**
 * Convert simplified representation of cron events array to the format WordPress expects
 *
 * @param array $events Flattened event list.
 * @return array
 */
function inflate_collapsed_events_array( $events ) {
	$inflated = array(
		'version' => 2, // Core versions the cron array; without this, Core will attempt to "upgrade" the value.
	);

	if ( empty( $events ) ) {
		return $inflated;
	}

	foreach ( $events as $event ) {
		// Object for convenience.
		$event = (object) $event;

		// Set up where this event belongs in the overall structure.
		if ( ! isset( $inflated[ $event->timestamp ] ) ) {
			$inflated[ $event->timestamp ] = array();
		}

		if ( ! isset( $inflated[ $event->timestamp ][ $event->action ] ) ) {
			$inflated[ $event->timestamp ][ $event->action ] = array();
		}

		// Store this event.
		$inflated[ $event->timestamp ][ $event->action ][ $event->instance ] = $event->args;
	}

	return $inflated;
}

/**
 * Parse request using Core's logic
 *
 * We have occasion to check the request before Core has done so, such as when preparing the environment to run a cron job
 */
function parse_request() {
	// Hold onto this as it won't change during the request.
	static $parsed_request = null;
	if ( is_array( $parsed_request ) ) {
		return $parsed_request;
	}

	// Starting somewhere.
	$rewrite_index = 'index.php';

	/**
	 * Start what's borrowed from Core
	 *
	 * References to $wp_rewrite->index were replaced with $rewrite_index, and whitespace updated, but otherwise, this is directly from WP::parse_request()
	 */
	// Borrowed from Core. @codingStandardsIgnoreStart
	$pathinfo = isset( $_SERVER['PATH_INFO'] ) ? $_SERVER['PATH_INFO'] : '';
	list( $pathinfo ) = explode( '?', $pathinfo );
	$pathinfo = str_replace( "%", "%25", $pathinfo );

	list( $req_uri ) = explode( '?', $_SERVER['REQUEST_URI'] );
	$self = $_SERVER['PHP_SELF'];
	$home_path = trim( parse_url( home_url(), PHP_URL_PATH ), '/' );
	$home_path_regex = sprintf( '|^%s|i', preg_quote( $home_path, '|' ) );

	// Trim path info from the end and the leading home path from the
	// front. For path info requests, this leaves us with the requesting
	// filename, if any. For 404 requests, this leaves us with the
	// requested permalink.
	$req_uri = str_replace( $pathinfo, '', $req_uri );
	$req_uri = trim( $req_uri, '/' );
	$req_uri = preg_replace( $home_path_regex, '', $req_uri );
	$req_uri = trim( $req_uri, '/' );
	$pathinfo = trim( $pathinfo, '/' );
	$pathinfo = preg_replace( $home_path_regex, '', $pathinfo );
	$pathinfo = trim( $pathinfo, '/' );
	$self = trim( $self, '/' );
	$self = preg_replace( $home_path_regex, '', $self );
	$self = trim( $self, '/' );

	// The requested permalink is in $pathinfo for path info requests and
	//  $req_uri for other requests.
	if ( ! empty( $pathinfo ) && !preg_match( '|^.*' . $rewrite_index . '$|', $pathinfo ) ) {
		$requested_path = $pathinfo;
	} else {
		// If the request uri is the index, blank it out so that we don't try to match it against a rule.
		if ( $req_uri == $rewrite_index ) {
			$req_uri = '';
		}

		$requested_path = $req_uri;
	}

	$requested_file = $req_uri;
	// Borrowed from Core. @codingStandardsIgnoreEnd
	/**
	 * End what's borrowed from Core
	 */

	// Return array of data about the request.
	$parsed_request = compact( 'requested_path', 'requested_file', 'self' );

	return $parsed_request;
}

/**
 * Consistently set flag Core uses to indicate cron execution is ongoing
 */
function set_doing_cron() {
	if ( ! defined( 'DOING_CRON' ) ) {
		define( 'DOING_CRON', true );
	}

	// WP 4.8 introduced the `wp_doing_cron()` function and filter.
	// These can be used to override the `DOING_CRON` constant, which may cause problems for plugin's requests.
	add_filter( 'wp_doing_cron', '__return_true', 99999 );
}
