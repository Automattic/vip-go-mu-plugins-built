<?php
/**
 * Test Events Store's Cron Filters
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

use Automattic\WP\Cron_Control\Events_Store_Cron_Filters;

/**
 * Events Store Cron Filter Tests
 */
class Events_Store_Cron_Filter_Tests extends \WP_UnitTestCase {
	/**
	 * Prepare test environment
	 */
	function setUp() {
		parent::setUp();

		// make sure the schedule is clear.
		_set_cron_array( array() );
	}

	/**
	 * Clean up after our tests
	 */
	function tearDown() {
		// make sure the schedule is clear.
		_set_cron_array( array() );

		parent::tearDown();
	}

	/**
	 * Check that we handle pre_schedule_event correctly
	 */
	function test_pre_schedule_event_filter() {
		$event = (object) array(
			'timestamp' => time(),
			'hook'      => 'a8c_cron_control_test_event_' . rand(),
			'schedule'  => false,
			'args'      => array(),
		);

		$return_value = Events_Store_Cron_Filters::instance()->filter_pre_schedule_event( null, $event );

		// Needs to return true to match wp_schedule_single_event().
		$this->assertEquals( true, $return_value );

		// It should have been scheduled as expected.
		$scheduled_ts = wp_next_scheduled( $event->hook, $event->args );

		$this->assertEquals( $event->timestamp, $scheduled_ts );
	}

	/**
	 * Check that we handle pre_reschedule_event correctly
	 */
	function test_pre_reschedule_event_filter() {
		$event = Utils::create_test_event();

		// Ensure previous step actually scheduled it.
		$scheduled_ts = wp_next_scheduled( $event['action'], $event['args'] );

		$this->assertEquals( $event['timestamp'], $scheduled_ts );

		// Reschedule it.
		$event['schedule'] = 'daily';
		$event['hook']     = $event['action']; // What's in a name, anyway?

		$return_value = Events_Store_Cron_Filters::instance()->filter_pre_reschedule_event( null, (object) $event );

		// Needs to return true to match wp_reschedule_hook().
		$this->assertEquals( true, $return_value );

		// Unschedule the first, so we can more easily check the rescheduled one.
		wp_unschedule_event( $event['timestamp'], $event['action'], $event['args'] );

		// Now should have 1 scheduled.
		$scheduled_ts = wp_next_scheduled( $event['action'], $event['args'] );

		// And it should be 1 day after the previous one.
		$expected_ts = $event['timestamp'] + \DAY_IN_SECONDS;

		$this->assertEquals( $expected_ts, $scheduled_ts );
	}

	/**
	 * Check that we handle pre_unschedule_event correctly
	 */
	function test_pre_unschedule_event_filter() {
		$event = Utils::create_test_event();

		// Ensure previous step actually scheduled it.
		$scheduled_ts = wp_next_scheduled( $event['action'], $event['args'] );

		$this->assertEquals( $event['timestamp'], $scheduled_ts );

		// Now unschedule.
		$return_value = Events_Store_Cron_Filters::instance()->filter_pre_unschedule_event( null, $event['timestamp'], $event['action'], $event['args'] );

		// Needs to return true to match wp_unschedule_hook().
		$this->assertEquals( true, $return_value );

		$scheduled_ts = wp_next_scheduled( $event['action'], $event['args'] );

		$this->assertFalse( $scheduled_ts );
	}

	/**
	 * Check that we handle pre_clear_scheduled_hook correctly
	 */
	function test_pre_clear_scheduled_hook_filter() {
		$event = Utils::create_test_event();

		// Schedule a second with same info but 10s later (can't use util for this).
		wp_schedule_single_event( $event['timestamp'] + 10, $event['action'], $event['args'] );

		// Clear this hook.
		$return_value = Events_Store_Cron_Filters::instance()->filter_pre_clear_scheduled_hook( null, $event['action'], $event['args'] );

		// Needs to return the count of unscheduled hooks, to match wp_clear_scheduled_hook().
		$this->assertEquals( 2, $return_value );

		$scheduled_ts = wp_next_scheduled( $event['action'], $event['args'] );

		$this->assertFalse( $scheduled_ts );
	}

	/**
	 * Check that we handle pre_unschedule_hook correctly
	 */
	function test_pre_unschedule_hook_filter() {
		$event = Utils::create_test_event();

		// Schedule a second but 10s later and with different args (can't use util for this).
		wp_schedule_single_event( $event['timestamp'] + 10, $event['action'], array( 'random' => rand( 0, 100 ) ) );

		// Clear this hook.
		$return_value = Events_Store_Cron_Filters::instance()->filter_pre_unschedule_hook( null, $event['action'] );

		// Needs to return the count of unscheduled hooks, to match wp_unscheduled_hook().
		$this->assertEquals( 2, $return_value );

		$scheduled_ts = wp_next_scheduled( $event['action'] );

		$this->assertFalse( $scheduled_ts );
	}

	/**
	 * Check that we handle pre_get_scheduled_event correctly
	 */
	function test_pre_get_scheduled_event_filter() {
		$event = Utils::create_test_event();

		// Grab the scheduled event.
		$scheduled_event = Events_Store_Cron_Filters::instance()->filter_pre_get_scheduled_event( null, $event['action'], $event['args'], $event['timestamp'] );

		$this->assertEquals( $event['action'], $scheduled_event->hook );
		$this->assertEquals( $event['timestamp'], $scheduled_event->timestamp );
		$this->assertEquals( $event['args'], $scheduled_event->args );
	}
}
