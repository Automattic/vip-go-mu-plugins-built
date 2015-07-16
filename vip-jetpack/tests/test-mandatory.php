<?php

/**
 * @group vip_support_user
 */
class JetpackMandatoryTest extends WP_UnitTestCase {

	function test_default_modules_include_mandatory_modules() {

		// Arrange
		$jpm = WPCOM_VIP_Jetpack_Mandatory::init();

		// Act
		$default_modules = Jetpack::get_default_modules();

		// Assert
		foreach ( $jpm->get_mandatory_modules()  as $mandatory_module ) {
			$this->assertTrue( in_array( $mandatory_module, $default_modules ) );
		}

	}

}
