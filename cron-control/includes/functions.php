<?php
/**
 * Common functions, often wrappers for various classes
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control;

/**
 * Check if an event is an internal one that the plugin will always run
 *
 * @param string $action Action name.
 * @return bool
 */
function is_internal_event( $action ) {
	return Internal_Events::instance()->is_internal_event( $action );
}

/**
 * Check which of the plugin's REST endpoints the current request is for, if any
 *
 * @return string|bool
 */
function get_endpoint_type() {
	// Request won't change, so hold for the duration.
	static $endpoint_slug = null;
	if ( ! is_null( $endpoint_slug ) ) {
		return $endpoint_slug;
	}

	// Determine request URL according to how Core does.
	$request = parse_request();

	// Search by our URL "prefix".
	$namespace = sprintf( '%s/%s', rest_get_url_prefix(), REST_API::API_NAMESPACE );

	// Check if any parts of the parse request are in our namespace.
	$endpoint_slug = false;

	foreach ( $request as $req ) {
		if ( 0 === stripos( $req, $namespace ) ) {
			$req_parts = explode( '/', $req );
			$endpoint_slug = array_pop( $req_parts );
			break;
		}
	}

	return $endpoint_slug;
}

/**
 * Check if the current request is to one of the plugin's REST endpoints
 *
 * @param string $type Endpoint Constant from REST_API class to compare against.
 * @return bool
 */
function is_rest_endpoint_request( $type ) {
	return get_endpoint_type() === $type;
}

/**
 * Schedule an event directly, bypassing the plugin's filtering to capture Core's scheduling functions
 *
 * @param int      $timestamp Time event should run.
 * @param string   $action    Hook to fire.
 * @param array    $args      Array of arguments, such as recurrence and parameters to pass to hook callback.
 * @param int|null $job_id    Optional. Job ID to update.
 */
function schedule_event( $timestamp, $action, $args, $job_id = null ) {
	Events_Store::instance()->create_or_update_job( $timestamp, $action, $args, $job_id );
}

/**
 * Execute a specific event
 *
 * @param int    $timestamp      Unix timestamp.
 * @param string $action_hashed  md5 hash of the action used when the event is registered.
 * @param string $instance       md5 hash of the event's arguments array, which Core uses to index the `cron` option.
 * @param bool   $force          Run event regardless of timestamp or lock status? eg, when executing jobs via wp-cli.
 * @return array|\WP_Error
 */
function run_event( $timestamp, $action_hashed, $instance, $force = false ) {
	return Events::instance()->run_event( $timestamp, $action_hashed, $instance, $force );
}

/**
 * Delete an event entry directly, bypassing the plugin's filtering to capture same
 *
 * @param int    $timestamp Time event should run.
 * @param string $action    Hook to fire.
 * @param string $instance  Hashed version of event's arguments.
 */
function delete_event( $timestamp, $action, $instance ) {
	Events_Store::instance()->mark_job_completed( $timestamp, $action, $instance );
}

/**
 * Delete an event by its ID
 *
 * @param int  $id Event ID.
 * @param bool $flush_cache Flush internal caches.
 * @return bool
 */
function delete_event_by_id( $id, $flush_cache = false ) {
	return Events_Store::instance()->mark_job_record_completed( $id, $flush_cache );
}

/**
 * Retrieve jobs given a set of parameters
 *
 * @param array $args Event arguments to filter by.
 * @return array
 */
function get_events( $args ) {
	return Events_Store::instance()->get_jobs( $args );
}

/**
 * Retrieve a single event by ID, or by a combination of its timestamp, instance identifier, and either action or the action's hashed representation
 *
 * @param  array $attributes Array of event attributes to query by.
 * @return object|false
 */
function get_event_by_attributes( $attributes ) {
	return Events_Store::instance()->get_job_by_attributes( $attributes );
}

/**
 * Retrieve a single event by its ID
 *
 * @param  int $jid Job ID.
 * @return object|false
 */
function get_event_by_id( $jid ) {
	return Events_Store::instance()->get_job_by_id( $jid );
}

/**
 * Count events with a given status
 *
 * @param string $status Status to count.
 * @return int|false
 */
function count_events_by_status( $status ) {
	return Events_Store::instance()->count_events_by_status( $status );
}

/**
 * Flush plugin's internal caches
 *
 * FOR INTERNAL USE ONLY - see WP-CLI; all other cache clearance should happen automatically through the `Events_Store` class
 */
function _flush_internal_caches() {
	return Events_Store::instance()->flush_internal_caches();
}

/**
 * Prevent event store from creating new entries
 *
 * Should be used sparingly, and followed by a call to resume_event_creation(), during bulk operations
 */
function _suspend_event_creation() {
	Events_Store::instance()->suspend_event_creation();
}

/**
 * Stop discarding events, once again storing them in the table
 */
function _resume_event_creation() {
	Events_Store::instance()->resume_event_creation();
}
