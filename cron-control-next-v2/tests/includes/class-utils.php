<?php
/**
 * Utility functions for tests
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

/**
 * Utilities
 */
class Utils {
	/**
	 * Provide easy access to the plugin's table
	 */
	static function get_table_name() {
		return \Automattic\WP\Cron_Control\Events_Store::instance()->get_table_name();
	}

	/**
	 * Build a test event
	 *
	 * @param bool $allow_multiple Whether or not to create multiple of the same event.
	 * @return array
	 */
	static function create_test_event( $allow_multiple = false ) {
		$event = array(
			'timestamp' => time(),
			'action'    => 'a8c_cron_control_test_event',
			'args'      => array(),
		);

		// Plugin skips events with no callbacks.
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
	 *
	 * @return array
	 */
	static function get_events_from_store() {
		global $wpdb;

		$table_name = self::get_table_name();
		$events     = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_name} WHERE status = %s ORDER BY `timestamp` ASC LIMIT 10;", \Automattic\WP\Cron_Control\Events_Store::STATUS_PENDING ), 'OBJECT' ); // Cannot prepare table name. @codingStandardsIgnoreLine

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
	 *
	 * @param array $expected Array of expected values.
	 * @param array $test Array of values to test against $expected.
	 * @param mixed $context Is this a test itself, or used within a test.
	 * @return mixed
	 */
	static function compare_arrays( $expected, $test, $context ) {
		$tested_data = array();
		foreach ( $expected as $key => $value ) {
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

	static function apply_event_props( $event, $props ) {
		$props_to_set = array_keys( $props );

		if ( in_array( 'status', $props_to_set, true ) ) {
			$event->set_status( $props['status'] );
		}

		if ( in_array( 'action', $props_to_set, true ) ) {
			$event->set_action( $props['action'] );
		}

		if ( in_array( 'args', $props_to_set, true ) ) {
			$event->set_args( $props['args'] );
		}

		if ( in_array( 'schedule', $props_to_set, true ) ) {
			$event->set_schedule( $props['schedule'], $props['interval'] );
		}

		if ( in_array( 'timestamp', $props_to_set, true ) ) {
			$event->set_timestamp( $props['timestamp'] );
		}
	}

	static function assert_event_raw_data_equals( object $raw_event, array $expected_data, $context ) {
		$context->assertEquals( $raw_event->ID, $expected_data['id'], 'id matches' );
		$context->assertEquals( $raw_event->status, $expected_data['status'], 'status matches' );
		$context->assertEquals( $raw_event->action, $expected_data['action'], 'action matches' );
		$context->assertEquals( $raw_event->action_hashed, md5( $expected_data['action'] ), 'action_hash matches' );
		$context->assertEquals( $raw_event->args, serialize( $expected_data['args'] ), 'args match' );
		$context->assertEquals( $raw_event->instance, md5( serialize( $expected_data['args'] ) ), 'instance matches' );
		$context->assertEquals( $raw_event->schedule, $expected_data['schedule'], 'schedule matches' );
		$context->assertEquals( $raw_event->interval, $expected_data['interval'], 'interval matches' );
		$context->assertEquals( $raw_event->timestamp, $expected_data['timestamp'], 'timestamp matches' );
	}
}
