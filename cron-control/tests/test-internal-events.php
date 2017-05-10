<?php
/**
 * Class Internal_Events_Tests
 *
 * @package Automattic_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

/**
 * Sample test case.
 */
class Internal_Events_Tests extends \WP_UnitTestCase {
	/**
	 * Prepare test environment
	 */
	function setUp() {
		parent::setUp();

		// make sure the schedule is clear
		_set_cron_array( array() );
	}

	/**
	 * Clean up after our tests
	 */
	function tearDown() {
		// make sure the schedule is clear
		_set_cron_array( array() );

		parent::tearDown();
	}

	/**
	 * Internal events should be scheduled
	 */
	function test_events() {
		\Automattic\WP\Cron_Control\Internal_Events::instance()->schedule_internal_events();

		$events = \Automattic\WP\Cron_Control\collapse_events_array( get_option( 'cron' ) );

		// Check that the plugin scheduled the expected number of events
		$this->assertEquals( count( $events ), 4 );

		// Confirm that the scheduled jobs came from the Internal Events class
		foreach ( $events as $event ) {
			$this->assertTrue( \Automattic\WP\Cron_Control\is_internal_event( $event['action'] ) );
		}
	}
}
