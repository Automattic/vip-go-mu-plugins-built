<?php
/**
 * Class Misc_Tests
 *
 * @package Automattic_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

/**
 * Sample test case.
 */
class Misc_Tests extends \WP_UnitTestCase {

	/**
	 * Expected values for certain constants
	 */
	function test_constants() {
		$this->assertTrue( defined( 'DISABLE_WP_CRON' ) );
		$this->assertTrue( defined( 'ALTERNATE_WP_CRON' ) );

		$this->assertTrue( constant( 'DISABLE_WP_CRON' ) );
		$this->assertFalse( constant( 'ALTERNATE_WP_CRON' ) );
	}
}
