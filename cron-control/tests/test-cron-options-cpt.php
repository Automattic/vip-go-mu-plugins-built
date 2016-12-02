<?php
/**
 * Class Cron_Options_CPT_Tests
 *
 * @package Automattic_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

/**
 * Sample test case.
 */
class Cron_Options_CPT_Tests extends \WP_UnitTestCase {

	/**
	 * Custom post type exists
	 */
	function test_cpt_exists() {
		$this->assertTrue( post_type_exists( \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_TYPE ) );
	}

	/**
	 * Check that an event is stored properly in a CPT entry
	 */
	function test_events_exist() {
		global $wpdb;

		$event     = \Automattic\WP\Cron_Control\Tests\Utils::create_test_event();
		$post_name = sprintf( '%s-%s-%s', $event['timestamp'], md5( $event['action'] ), md5( maybe_serialize( $event['args'] ) ) );

		$entry = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $wpdb->posts WHERE post_type = %s AND post_status = %s AND post_name = %s LIMIT 1", \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_TYPE, \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_STATUS_PENDING, $post_name ) );

		$this->assertEquals( count( $entry ), 1 );

		$entry    = array_shift( $entry );
		$instance = maybe_unserialize( $entry->post_content_filtered );

		$this->assertEquals( $event['action'], $instance['action'] );
		$this->assertEquals( md5( maybe_serialize( $event['args'] ) ), $instance['instance'] );
		Utils::compare_arrays( $event['args'], $instance['args'], $this );
	}

	/**
	 * Check format of filtered array returned from CPT
	 */
	function test_filter_cron_option_get() {
		$event = Utils::create_test_event();

		$cron = get_option( 'cron' );

		// Core versions the cron option (see `_upgrade_cron_array()`)
		// Without this in the filtered result, all events continually requeue as Core tries to "upgrade" the option
		$this->assertArrayHasKey( 'version', $cron );
		$this->assertEquals( $cron['version'], 2 );

		// Validate the remaining structure
		$cron = \Automattic\WP\Cron_Control\collapse_events_array( $cron );

		foreach ( $cron as $single_cron ) {
			$this->assertEquals( $single_cron['timestamp'], $event['timestamp'] );
			$this->assertEquals( $single_cron['action'], $event['action'] );
			$this->assertArrayHasKey( 'args', $single_cron );
			$this->assertArrayHasKey( 'schedule', $single_cron['args'] );
			$this->assertArrayHasKey( 'args', $single_cron['args'] );
			$this->assertEquals( $single_cron['args']['args'], $event['args'] );
		}
	}

	/**
	 * Test that events are unscheduled correctly using Core functions
	 */
	function test_event_unscheduling_using_core_functions() {
		$first_event = Utils::create_test_event();
		$second_event = Utils::create_test_event( true );

		$first_event_ts = wp_next_scheduled( $first_event['action'], $first_event['args'] );

		$this->assertEquals( $first_event_ts, $first_event['timestamp'] );

		wp_unschedule_event( $first_event_ts, $first_event['action'], $first_event['args'] );

		$first_event_ts  = wp_next_scheduled( $first_event['action'], $first_event['args'] );
		$second_event_ts = wp_next_scheduled( $second_event['action'], $second_event['args'] );

		$this->assertFalse( $first_event_ts );
		$this->assertEquals( $second_event_ts, $second_event['timestamp'] );

		wp_unschedule_event( $second_event_ts, $second_event['action'], $second_event['args'] );

		$second_event_ts = wp_next_scheduled( $second_event['action'], $second_event['args'] );

		$this->assertFalse( $second_event_ts );
	}

	/**
	 * Test that events are unscheduled correctly by checking the CPT
	 */
	function test_event_unscheduling_against_cpt() {
		// Schedule two events and prepare their data a bit for further testing
		$first_event = Utils::create_test_event();
		$first_event['instance'] = md5( maybe_serialize( $first_event['args'] ) );
		$first_event_args = $first_event['args'];
		unset( $first_event['args'] );

		sleep( 2 ); // More-thorough to test with events that don't have matching timestamps

		$second_event = Utils::create_test_event( true );
		$second_event['instance'] = md5( maybe_serialize( $second_event['args'] ) );
		$second_event_args = $second_event['args'];
		unset( $second_event['args'] );

		// First, check that posts were created for the two events
		Utils::compare_arrays( array( $first_event, $second_event ), Utils::get_events_from_post_objects(), $this );

		// Second, unschedule an event and confirm that the post is removed
		wp_unschedule_event( $first_event['timestamp'], $first_event['action'], $first_event_args );

		Utils::compare_arrays( array( $second_event ), Utils::get_events_from_post_objects(), $this );

		// Finally, unschedule the second event and confirm its post is also deleted
		wp_unschedule_event( $second_event['timestamp'], $second_event['action'], $second_event_args );

		$this->assertEmpty( Utils::get_events_from_post_objects() );
	}
}
