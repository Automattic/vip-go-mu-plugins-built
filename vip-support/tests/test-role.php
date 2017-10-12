<?php
/**
 * Test our custom role
 */

namespace Automattic\VIP\Support_User\Tests;
use Automattic\VIP\Support_User\Role;
use WP_UnitTestCase;

/**
 * @group vip_support_role
 */
class VIPSupportRoleTest extends WP_UnitTestCase {

	function test_role_existence() {
		$roles = get_editable_roles();

		$this->assertArrayHasKey( Role::VIP_SUPPORT_ROLE, $roles );
		$this->assertArrayHasKey( Role::VIP_SUPPORT_INACTIVE_ROLE, $roles );
	}

	function test_role_order() {

		// Arrange
		// Trigger the update method call on admin_init,
		// this sets up the role
		Role::init()->action_admin_init();

		// Act
		$roles = get_editable_roles();
		$role_names = array_keys( $roles );

		// Assert
		// To show up last, the VIP Support Inactive role will be
		// the first index in the array
		$first_role = array_shift( $role_names );
		$this->assertTrue( Role::VIP_SUPPORT_INACTIVE_ROLE === $first_role );
	}
}
