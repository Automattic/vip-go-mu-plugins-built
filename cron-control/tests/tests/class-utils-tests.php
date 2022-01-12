<?php
/**
 * Test plugin's utility functions
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;
use Automattic\WP\Cron_Control;

/**
 * Class Utils_Tests
 */
class Utils_Tests extends \WP_UnitTestCase {
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
	 * Test functions that manipulate Core's cron format
	 */
	function test_events_array_collapse_and_inflate() {
		$event_one = array(
			'timestamp' => strtotime( '+15 minutes' ),
			'action'    => 'test_event_1',
			'args'      => array(
				'test' => true,
			),
		);
		wp_schedule_single_event( $event_one['timestamp'], $event_one['action'], $event_one['args'] );

		$event_two = array(
			'timestamp' => $event_one['timestamp'],
			'action'    => 'test_event_2',
			'args'      => array(
				'fake_event' => 1,
				'fake_args'  => array(
					'thing' => 12,
				),
			),
		);
		wp_schedule_single_event( $event_two['timestamp'], $event_two['action'], $event_two['args'] );

		$event_three = array(
			'timestamp' => strtotime( '+30 minutes' ),
			'action'    => 'test_event_3',
			'args'      => array(
				'post_id' => 1234,
			),
		);
		wp_schedule_single_event( $event_three['timestamp'], $event_three['action'], $event_three['args'] );

		$cron = get_option( 'cron' );

		$collapsed = Cron_Control\collapse_events_array( $cron );

		$this->assertEquals( 3, count( $collapsed ) );

		$inflated = Cron_Control\inflate_collapsed_events_array( $collapsed );

		$this->assertEquals( $cron, $inflated );

		_set_cron_array( $inflated );

		$this->assertEquals( $event_one['timestamp'], wp_next_scheduled( $event_one['action'], $event_one['args'] ) );
		$this->assertEquals( $event_two['timestamp'], wp_next_scheduled( $event_two['action'], $event_two['args'] ) );
		$this->assertEquals( $event_three['timestamp'], wp_next_scheduled( $event_three['action'], $event_three['args'] ) );
	}
}
