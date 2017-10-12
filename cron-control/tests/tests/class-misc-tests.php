<?php
/**
 * Miscellaneous tests
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

/**
 * Misc tests
 */
class Misc_Tests extends \WP_UnitTestCase {
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
	 * Expected values for certain Core constants
	 */
	function test_core_constants() {
		$this->assertTrue( defined( 'DISABLE_WP_CRON' ) );
		$this->assertTrue( defined( 'ALTERNATE_WP_CRON' ) );

		$this->assertTrue( constant( 'DISABLE_WP_CRON' ) );
		$this->assertFalse( constant( 'ALTERNATE_WP_CRON' ) );
	}

	/**
	 * Confirm that constants are properly constrained
	 */
	function test_event_cache_constants() {
		$this->assertEquals( 256 * \KB_IN_BYTES, \Automattic\WP\Cron_Control\CACHE_BUCKET_SIZE );
		$this->assertEquals( 250,                \Automattic\WP\Cron_Control\MAX_CACHE_BUCKETS );
	}
}
