<?php
/**
 * Test support user
 */

namespace Automattic\VIP\Support_User\Tests;
use Automattic\VIP\Support_User\User;
use WP_UnitTestCase;

/**
 * @group vip_support_user
 */
class VIPSupportUserTest extends WP_UnitTestCase {

	function test_is_a8c_email() {

		$a8c_emails = array(
			'vip@matticspace.com',
			'v.ip@matticspace.com',
			'vip+test@matticspace.com',
			'v.ip+test@matticspace.com',
			'some.user@automattic.com',
			'someuser@automattic.com',
			'some.user+test@automattic.com',
			'someuser+test@automattic.com',
			'some.user@a8c.com',
			'someuser@a8c.com',
			'some.user+test@a8c.com',
			'someuser+test@a8c.com',
		);

		foreach ( $a8c_emails as $a8c_email ) {
			$this->assertTrue( User::init()->is_a8c_email( $a8c_email ) );
		}

		$non_a8c_emails = array(
			'someone@example.com',
			'someone.else@example.com',
			'automattic.com@example.invalid',
			'someone@automattic',
			'matticspace.com@example.com',
			'a8c.com@example.com',
			'automattic@bbc.co.uk',
			'a8c@bbc.co.uk',
		);

		foreach ( $non_a8c_emails as $non_a8c_email ) {
			$this->assertFalse( User::init()->is_a8c_email( $non_a8c_email ) );
		}

	}

	/**
	 * Test that cron callback is registered properly
	 */
	function test_cron_cleanup_has_callback() {
		$this->assertEquals( 10, has_action( User::CRON_ACTION ) );
	}
}
