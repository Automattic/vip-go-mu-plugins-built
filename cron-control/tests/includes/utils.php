<?php

namespace Automattic\WP\Cron_Control\Tests;

class Utils {
	/**
	 * Provide easy access to the plugin's table
	 */
	static function get_table_name() {
		return \Automattic\WP\Cron_Control\Events_Store::instance()->get_table_name();
	}

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
			wp_schedule_single_event( $event['timestamp'], $event['action'], $event['args'] );
		}

		return $event;
	}

	/**
	 * Retrieve some events' post objects for use in testing
	 */
	static function get_events_from_store() {
		global $wpdb;

		$table_name = self::get_table_name();
		$events     = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_name} WHERE status = %s ORDER BY `timestamp` ASC LIMIT 10;", \Automattic\WP\Cron_Control\Events_Store::STATUS_PENDING ), 'OBJECT' );

		$parsed_events = array();

		foreach ( $events as $event ) {
			$parsed_events[] = array(
				'timestamp' => (int) $event->timestamp,
				'action'    => $event->action,
				'instance'  => $event->instance,
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
