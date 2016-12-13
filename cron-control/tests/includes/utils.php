<?php

namespace Automattic\WP\Cron_Control\Tests;

class Utils {
	/**
	 * Build a test event
	 */
	static function create_test_event( $allow_multiple = false ) {
		$event = array(
			'timestamp' => time(),
			'action'    => 'a8c_cron_control_test_event',
			'args'      => array(),
		);

		// Plugin skips events with no callbacks
		add_action( 'a8c_cron_control_test_event', '__return_true' );

		if ( $allow_multiple ) {
			$event['action'] .= '_' . rand( 10, 100 );
		}

		$next = wp_next_scheduled( $event['action'], $event['args'] );

		if ( $next ) {
			$event['timestamp'] = $next;
		} else {
			wp_schedule_single_event( $event[ 'timestamp' ], $event[ 'action' ], $event[ 'args' ] );
		}

		return $event;
	}

	/**
	 * Retrieve some events' post objects for use in testing
	 */
	static function get_events_from_post_objects() {
		$events = get_posts( array(
			'post_type'        => \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_TYPE,
			'post_status'      => \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_STATUS_PENDING,
			'posts_per_page'   => 10,
			'orderby'          => 'date',
			'order'            => 'ASC',
			'suppress_filters' => false,
		) );

		$parsed_events = array();

		foreach ( $events as $event ) {
			$event_args = explode( '|', $event->post_title );
			$parsed_events[] = array(
				'timestamp' => (int) $event_args[0],
				'action'    => trim( $event_args[1] ),
				'instance'  => trim( $event_args[2] ),
			);
		}

		return $parsed_events;
	}

	/**
	 * Check that two arrays are equal
	 */
	static function compare_arrays( $expected, $test, $context ) {
		$tested_data = array();
		foreach( $expected as $key => $value ) {
			if ( isset( $test[ $key ] ) ) {
				$tested_data[ $key ] = $test[ $key ];
			} else {
				$tested_data[ $key ] = null;
			}
		}

		if ( is_object( $context ) ) {
			$context->assertEquals( $expected, $tested_data );
		} else {
			return $tested_data;
		}
	}
}
