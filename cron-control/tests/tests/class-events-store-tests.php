<?php
/**
 * Test Events Store, which uses a custom table
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

use Automattic\WP\Cron_Control\Events_Store;
use Automattic\WP\Cron_Control\Event;

/**
 * Events Store Tests
 */
class Events_Store_Tests extends \WP_UnitTestCase {
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
	 * Custom table exists
	 */
	function test_table_exists() {
		global $wpdb;

		$table_name = Utils::get_table_name();

		$this->assertEquals( count( $wpdb->get_col( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) ), 1 );
	}

	/**
	 * Check that an event is stored properly in table
	 */
	function test_events_exist() {
		global $wpdb;

		$event      = Utils::create_test_event();
		$table_name = Utils::get_table_name();

		$entry = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_name} WHERE timestamp = %d AND action = %s AND instance = %s AND status = %s LIMIT 1", $event['timestamp'], $event['action'], md5( maybe_serialize( $event['args'] ) ), \Automattic\WP\Cron_Control\Events_Store::STATUS_PENDING ) ); // Cannot prepare table name. @codingStandardsIgnoreLine

		$this->assertEquals( count( $entry ), 1 );

		$entry = array_shift( $entry );

		$this->assertEquals( $event['action'], $entry->action );
		$this->assertEquals( md5( maybe_serialize( $event['args'] ) ), $entry->instance );
		Utils::compare_arrays( $event['args'], maybe_unserialize( $entry->args ), $this );
	}

	/**
	 * Check format of filtered array returned from table
	 */
	function test_filter_cron_option_get() {
		$event = Utils::create_test_event();

		$cron = get_option( 'cron' );

		// Core versions the cron option (see `_upgrade_cron_array()`).
		// Without this in the filtered result, all events continually requeue as Core tries to "upgrade" the option.
		$this->assertArrayHasKey( 'version', $cron );
		$this->assertEquals( $cron['version'], 2 );

		// Validate the remaining structure.
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
		$first_event  = Utils::create_test_event();
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
	 * Test that events are unscheduled correctly by checking the table
	 */
	function test_event_unscheduling_against_event_store() {
		// Schedule two events and prepare their data a bit for further testing.
		$first_event             = Utils::create_test_event();
		$first_event['instance'] = md5( maybe_serialize( $first_event['args'] ) );
		$first_event_args        = $first_event['args'];
		unset( $first_event['args'] );

		sleep( 2 ); // More-thorough to test with events that don't have matching timestamps.

		$second_event             = Utils::create_test_event( true );
		$second_event['instance'] = md5( maybe_serialize( $second_event['args'] ) );
		$second_event_args        = $second_event['args'];
		unset( $second_event['args'] );

		// First, check that posts were created for the two events.
		Utils::compare_arrays( array( $first_event, $second_event ), Utils::get_events_from_store(), $this );

		// Second, unschedule an event and confirm that the post is removed.
		wp_unschedule_event( $first_event['timestamp'], $first_event['action'], $first_event_args );

		Utils::compare_arrays( array( $second_event ), Utils::get_events_from_store(), $this );

		// Finally, unschedule the second event and confirm its post is also deleted.
		wp_unschedule_event( $second_event['timestamp'], $second_event['action'], $second_event_args );

		$this->assertEmpty( Utils::get_events_from_store() );
	}

	/*
	|--------------------------------------------------------------------------
	| New event's store methods. The above may be deprecated in the future.
	|--------------------------------------------------------------------------
	| These are pretty extensively covered in the Event() testing already.
	*/

	function test_event_creation() {
		$store = Events_Store::instance();

		// We don't validate fields here, so not much to test other than return values.
		$result = $store->_create_event( [
			'status'        => Events_Store::STATUS_PENDING,
			'action'        => 'test_raw_event',
			'action_hashed' => md5( 'test_raw_event' ),
			'timestamp'     => 1637447873,
			'args'          => serialize( [] ),
			'instance'      => Event::create_instance_hash( [] ),
		] );
		$this->assertTrue( is_int( $result ) && $result > 0, 'event was inserted' );

		$empty_result = $store->_create_event( [] );
		$this->assertTrue( 0 === $empty_result, 'empty event was not inserted' );
	}

	function test_event_updates() {
		$store = Events_Store::instance();

		// Make a valid event.
		$event = new Event();
		$event->set_action( 'test_get_action' );
		$event->set_timestamp( 1637447875 );
		$event->save();

		$result = $store->_update_event( $event->get_id(), [ 'timestamp' => 1637447875 + 100 ] );
		$this->assertTrue( $result, 'event was updated' );

		// Spot check the updated property.
		$raw_event = $store->_get_event_raw( $event->get_id() );
		$this->assertEquals( 1637447875 + 100, $raw_event->timestamp );

		$failed_result = $store->_update_event( $event->get_id(), [] );
		$this->assertFalse( $failed_result, 'event was not updated due to invalid args' );
	}

	function test_get_raw_event() {
		$store = Events_Store::instance();

		$result = $store->_get_event_raw( -1 );
		$this->assertNull( $result, 'returns null when given invalid ID' );

		$result = $store->_get_event_raw( PHP_INT_MAX );
		$this->assertNull( $result, 'returns null when given an non-existant ID' );

		// Event w/ all defaults.
		$this->run_get_raw_event_test( [
			'creation_args' => [
				'action'    => 'test_event',
				'timestamp' => 1637447873,
			],
			'expected_data' => [
				'status'    => Events_Store::STATUS_PENDING,
				'action'    => 'test_event',
				'args'      => [],
				'schedule'  => null,
				'interval'  => 0,
				'timestamp' => 1637447873,
			],
		] );

		// Event w/ all non-defaults.
		$this->run_get_raw_event_test( [
			'creation_args' => [
				'status'    => Events_Store::STATUS_COMPLETED,
				'action'    => 'test_event',
				'args'      => [ 'some' => 'data' ],
				'schedule'  => 'hourly',
				'interval'  => HOUR_IN_SECONDS,
				'timestamp' => 1637447873,
			],
			'expected_data' => [
				'status'    => Events_Store::STATUS_COMPLETED,
				'action'    => 'test_event',
				'args'      => [ 'some' => 'data' ],
				'schedule'  => 'hourly',
				'interval'  => HOUR_IN_SECONDS,
				'timestamp' => 1637447873,
			],
		] );
	}

	private function run_get_raw_event_test( array $event_data ) {
		// Create test event.
		$test_event = new Event();
		Utils::apply_event_props( $test_event, $event_data['creation_args'] );
		$save_result = $test_event->save();

		// Check if we got expected values from the DB.
		$raw_event = Events_Store::instance()->_get_event_raw( $test_event->get_id() );
		$expected_data = $event_data['expected_data'];
		$expected_data['id'] = $test_event->get_id();
		Utils::assert_event_raw_data_equals( $raw_event, $expected_data, $this );
	}

	public function test_query_raw_events() {
		$store = Events_Store::instance();

		$args = [
			'status'    => Events_Store::STATUS_PENDING,
			'action'    => 'test_query_raw_events',
			'args'      => [ 'some' => 'data' ],
			'schedule'  => 'hourly',
			'interval'  => HOUR_IN_SECONDS,
		];

		$event_one   = $this->create_test_event( array_merge( $args, [ 'timestamp' => 1 ] ) );
		$event_two   = $this->create_test_event( array_merge( $args, [ 'timestamp' => 2 ] ) );
		$event_three = $this->create_test_event( array_merge( $args, [ 'timestamp' => 3 ] ) );
		$event_four  = $this->create_test_event( array_merge( $args, [ 'timestamp' => 4 ] ) );

		// Should give us just the first event that has the oldest timestamp.
		$result = $store->_query_events_raw( [
			'status'   => [ Events_Store::STATUS_PENDING ],
			'action'   => 'test_query_raw_events',
			'args'     => [ 'some' => 'data' ],
			'schedule' => 'hourly',
			'limit'    => 1,
		] );

		$this->assertEquals( 1, count( $result ), 'returns one event w/ oldest timestamp' );
		$this->assertEquals( $event_one->get_timestamp(), $result[0]->timestamp, 'found the right event' );

		// Should give two events now, in desc order
		$result = $store->_query_events_raw( [
			'status'   => [ Events_Store::STATUS_PENDING ],
			'action'   => 'test_query_raw_events',
			'args'     => [ 'some' => 'data' ],
			'schedule' => 'hourly',
			'limit'    => 2,
			'order'    => 'desc',
		] );

		$this->assertEquals( 2, count( $result ), 'returned 2 events' );
		$this->assertEquals( $event_four->get_timestamp(), $result[0]->timestamp, 'found the right event' );
		$this->assertEquals( $event_three->get_timestamp(), $result[1]->timestamp, 'found the right event' );

		// Should find just the middle two events that match the timeframe.
		$result = $store->_query_events_raw( [
			'status'    => [ Events_Store::STATUS_PENDING ],
			'action'    => 'test_query_raw_events',
			'args'      => [ 'some' => 'data' ],
			'schedule'  => 'hourly',
			'limit'     => 100,
			'timestamp' => [ 'from' => 2, 'to' => 3 ],
		] );

		$this->assertEquals( 2, count( $result ), 'returned middle events that match the timeframe' );
		$this->assertEquals( $event_two->get_timestamp(), $result[0]->timestamp, 'found the right event' );
		$this->assertEquals( $event_three->get_timestamp(), $result[1]->timestamp, 'found the right event' );

		$event_five = $this->create_test_event( array_merge( $args, [ 'timestamp' => time() + 5 ] ) );

		// Should find all but the last event that is not due yet.
		$result = $store->_query_events_raw( [
			'status'    => [ Events_Store::STATUS_PENDING ],
			'action'    => 'test_query_raw_events',
			'args'      => [ 'some' => 'data' ],
			'schedule'  => 'hourly',
			'limit'     => 100,
			'timestamp' => 'due_now',
		] );

		$this->assertEquals( 4, count( $result ), 'returned all due now events' );
		$this->assertEquals( $event_one->get_timestamp(), $result[0]->timestamp, 'found the right event' );
		$this->assertEquals( $event_four->get_timestamp(), $result[3]->timestamp, 'found the right event' );

		// Grab the second page.
		$result = $store->_query_events_raw( [
			'status'   => [ Events_Store::STATUS_PENDING ],
			'action'   => 'test_query_raw_events',
			'args'     => [ 'some' => 'data' ],
			'schedule' => 'hourly',
			'limit'    => 1,
			'page'     => 2,
		] );

		$this->assertEquals( 1, count( $result ), 'returned event from second page' );
		$this->assertEquals( $event_two->get_timestamp(), $result[0]->timestamp, 'found the right event' );
	}

	private function create_test_event( $props ) {
		$event = new Event();
		Utils::apply_event_props( $event, $props );
		$event->save();
		return $event;
	}
}
