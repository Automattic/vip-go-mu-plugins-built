<?php
/**
 * Test Events Store, which uses a custom table
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

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

		$event = Utils::create_test_event();
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
	 * Test that events are unscheduled correctly by checking the table
	 */
	function test_event_unscheduling_against_event_store() {
		// Schedule two events and prepare their data a bit for further testing.
		$first_event = Utils::create_test_event();
		$first_event['instance'] = md5( maybe_serialize( $first_event['args'] ) );
		$first_event_args = $first_event['args'];
		unset( $first_event['args'] );

		sleep( 2 ); // More-thorough to test with events that don't have matching timestamps.

		$second_event = Utils::create_test_event( true );
		$second_event['instance'] = md5( maybe_serialize( $second_event['args'] ) );
		$second_event_args = $second_event['args'];
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

	/**
	 * Test event-cache splitting
	 */
	function test_excessive_event_creation() {
		$timestamp_base = time() + ( 1 * \HOUR_IN_SECONDS );

		$dummy_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam enim ante, maximus nec nisi ut, finibus ultrices orci. Maecenas suscipit, est eu suscipit sagittis, enim massa dignissim augue, sagittis gravida dolor nulla ut mi. Phasellus venenatis bibendum cursus. Aliquam a erat purus. Nulla elit nunc, egestas eget eros iaculis, interdum tincidunt elit. Vivamus vel blandit nisl. Proin in ornare dolor, convallis porta sem. Mauris rutrum nibh et ornare egestas. Mauris ultricies diam at nunc tristique rutrum. Aliquam varius non leo vel luctus. Vestibulum sagittis scelerisque ante, non faucibus nibh accumsan sed.';
		$args       = array_fill( 0, 15, $dummy_text );

		for ( $i = 1; $i <= 100; $i++ ) {
			$timestamp = $timestamp_base + $i;
			$action    = 'excessive_test_event_' . $i;
			wp_schedule_single_event( $timestamp, $action, $args );
		}

		get_option( 'cron' );

		$cached = wp_cache_get( \Automattic\WP\Cron_Control\Events_Store::CACHE_KEY );

		$this->assertArrayHasKey( 'incrementer', $cached );
		$this->assertArrayHasKey( 'buckets',     $cached );
		$this->assertArrayHasKey( 'event_count', $cached );

		$this->assertEquals( 4,   $cached['buckets'] );
		$this->assertEquals( 100, $cached['event_count'] );
	}
}
