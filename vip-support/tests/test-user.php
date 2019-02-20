<?php
/**
 * Test support user
 */

namespace Automattic\VIP\Support_User\Tests;
use Automattic\VIP\Support_User\User;
use Automattic\VIP\Support_User\Role;
use WP_UnitTestCase;

/**
 * @group vip_support_user
 */
class VIPSupportUserTest extends WP_UnitTestCase {
	public function setUp() {
		parent::setUp();

		$this->vip_support_user = User::add( array(
			'user_email' => 'vip-support@example.test',
			'user_login' => 'vip-support',
			'user_pass' => 'password',
		) );
	}

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
	 * The values in `test_is_vip_support_email_alias_*()` pressumes the value of
	 * `User::VIP_SUPPORT_EMAIL_ADDRESS`. If that constants value changes the values in these
	 * tests must also change as well. This test attempts to make that more clear.
	 */
	function test_vip_support_email_constant_for_tests() {
		$this->assertEquals(
			'vip-support@automattic.com',
			User::VIP_SUPPORT_EMAIL_ADDRESS,
			"`VIP_SUPPORT_EMAIL_ADDRESS` has changed. The data providers for the two `test_is_vip_support_email_alias_*()` tests, and this test need to be changed as well to reflect this new email address."
		);
	}

	/**
	 * The emails used in `test_is_vip_support_email_alias_*()` tests pressume the values of
	 * `User::VIP_SUPPORT_EMAIL_ADDRESS` and `Users::VIP_SUPPORT_EMAIL_ADDRESS_PATTERN`.
	 * If either of those constants changes the values in tests must also change as well.
	 * This test attempts to make that more clear.
	 */
	function test_vip_support_email_pattern_constant_for_tests() {
		$this->assertEquals(
			'/vip-support\+[^@]+@automattic\.com/i',
			User::VIP_SUPPORT_EMAIL_ADDRESS_PATTERN,
			"`VIP_SUPPORT_EMAIL_ADDRESS_PATTERN` has changed. The data providers for the two `test_is_vip_support_email_alias_*()` tests, and this test need to be changed as well to reflect the new email address."
		);
	}

	/**
	 * @dataProvider provider_valid_vip_support_email_aliases
	 */
	function test_is_vip_support_email_alias_valid( $valid_email_aliases  ) {
		foreach ( $valid_email_aliases as $valid_email_alias ) {
			$this->assertTrue( User::init()->is_vip_support_email_alias( $valid_email_alias ) );
		}
	}

	function provider_valid_vip_support_email_aliases() {
		return [ [ [
			'vip-support+test@automattic.com',
			'vip-support+some_username@automattic.com',
			'vip-support+areallylongusernameusedhere123@automattic.com',
		] ] ];
	}

	/**
	 * @dataProvider provider_invalid_vip_support_email_aliases
	 */
	function test_is_vip_support_email_alias_invalid( $invalid_email_aliases ) {
		foreach ( $invalid_email_aliases as $invalid_email_alias ) {
			$this->assertFalse( User::init()->is_vip_support_email_alias( $invalid_email_alias ) );
		}
	}

	function provider_invalid_vip_support_email_aliases() {
		return [ [ [
			'someone@example.com',
			'someone@automattic',
			'someone@automattic.com',
			'vip+test@example.com',
			'vip-support+test@example.com',
			'vip-support@example.com',
		] ] ];
	}

	/**
	 * Test that cron callback is registered properly
	 */
	function test_cron_cleanup_has_callback() {
		$this->assertEquals( 10, has_action( User::CRON_ACTION ) );
	}

	function test__has_vip_support_meta__yep() {
		$is_vip_support_user = User::has_vip_support_meta( $this->vip_support_user );
		$this->assertTrue( $is_vip_support_user );
	}

	function test__has_vip_support_meta__nope() {
		$user = $this->factory->user->create( array( 'user_login' => 'not-vip-support' ) );

		$is_vip_support_user = User::has_vip_support_meta( $user );
		$this->assertFalse( $is_vip_support_user );
	}
}
