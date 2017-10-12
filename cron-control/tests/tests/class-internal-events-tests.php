<?php
/**
 * Test plugin's Internal Events
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;
use Automattic\WP\Cron_Control;
use Automattic\WP\Cron_Control\Internal_Events;
use WP_UnitTestCase;

/**
 * Internal Events tests
 */
class Internal_Events_Tests extends WP_UnitTestCase {
	/**
	 * Prepare test environment
	 */
	function setUp() {
		parent::setUp();

		// make sure the schedule is clear.
		_set_cron_array( array() );

		Internal_Events::instance()->schedule_internal_events();
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
	 * Internal events should be scheduled
	 */
	function test_events_scheduled() {
		$events = Cron_Control\collapse_events_array( get_option( 'cron' ) );

		$expected = 4; // Number of events created by the Internal_Events::prepare_internal_events() method, which is private.
		$expected += count( \CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS );

		$this->assertEquals( count( $events ), $expected, 'Incorrect number of Internal Events registered' );
	}

	/**
	 * Test that all scheduled events are from the Internal Events class
	 */
	function test_events_are_internal() {
		$events = Cron_Control\collapse_events_array( get_option( 'cron' ) );

		foreach ( $events as $event ) {
			$this->assertTrue( Cron_Control\is_internal_event( $event['action'] ), sprintf( 'Action `%s` is not an Internal Event', $event['action'] ) );
		}
	}

	/**
	 * Test that additional Internal Events can be added
	 */
	function test_add_events() {
		$additional = \CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS;

		foreach ( $additional as $added ) {
			$next = wp_next_scheduled( $added['action'], array() );

			$this->assertInternalType( 'int', $next, sprintf( 'Additional Internal Event `%s` not scheduled', $added['action'] ) );
		}
	}
}
