<?php

namespace Automattic\WP\Cron_Control;

/**
 * Produce a simplified version of the cron events array
 *
 * Also removes superfluous, non-event data that Core stores in the option
 */
function collapse_events_array( $events, $timestamp = null ) {
	$collapsed_events = array();

	// Ensure an event is always returned
	if ( ! is_array( $events ) ) {
		return $collapsed_events;
	}

	// Allow filtering to only events with a given timestamp
	if ( is_numeric( $timestamp ) ) {
		if ( isset( $events[ $timestamp ] ) ) {
			$_events = $events[ $timestamp ];
			$events  = array( $timestamp => $_events, );
			unset( $_events );
		} else {
			return $collapsed_events;
		}
	}

	// Collapse whatever events we have into an easier format to deal with
	foreach ( $events as $timestamp => $timestamp_events ) {
		// Skip non-event data that Core includes in the option
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
