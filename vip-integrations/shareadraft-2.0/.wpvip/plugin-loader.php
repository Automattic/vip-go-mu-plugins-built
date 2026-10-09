<?php

defined( 'ABSPATH' ) || die();

if ( ! defined( 'WP_TESTS_DOMAIN' ) && function_exists( 'wpcom_vip_load_plugin' ) ) {
	if ( ! defined( 'VIP_SHAREADRAFT_CONFIG' ) ) {
		// Mirror the VIP platform: runtime config is defined before the plugin loads.
		// A git-ignored fixtures/config-local.php overrides the committed fixture —
		// handy for local secrets and experiments (see fixtures/README.md).
		$vip_shareadraft_fixtures = WP_CONTENT_DIR . '/plugins/shareadraft/fixtures';
		define(
			'VIP_SHAREADRAFT_CONFIG',
			file_exists( $vip_shareadraft_fixtures . '/config-local.php' )
				? require $vip_shareadraft_fixtures . '/config-local.php'
				: require $vip_shareadraft_fixtures . '/config-valid.php'
		);
		unset( $vip_shareadraft_fixtures );
	}

	wpcom_vip_load_plugin( 'shareadraft/shareadraft.php' );
}
