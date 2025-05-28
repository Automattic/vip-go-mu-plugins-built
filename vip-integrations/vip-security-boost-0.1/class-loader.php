<?php
namespace Automattic\VIP\Security;

class Loader {
	public static function init() {
		if ( ! defined( 'VIP_SECURITY_BOOST_CONFIGS' ) ) {
			throw new \Exception( 'VIP_SECURITY_BOOST_CONFIGS is not defined.' );
		}

		$configs         = constant( 'VIP_SECURITY_BOOST_CONFIGS' );
		$enabled_modules = $configs['enabled_modules'] ?? [];

		// If enabled_modules is a string, convert it to an array
		// I noticed the integrations-config can output a string so we need to handle that
		if ( is_string( $enabled_modules ) ) {
			$enabled_modules = explode( ',', $enabled_modules );
		}

		foreach ( $enabled_modules as $module ) {
			// Sanitize module name to prevent path traversal
			$module    = basename( $module );
			$load_path = __DIR__ . '/modules/' . $module . '/class-' . $module . '.php';

			if ( file_exists( $load_path ) ) {
				// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
				require_once $load_path;
			} else {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
				trigger_error( 'Module not found: ' . esc_html( $module ), E_USER_WARNING );
			}
		}
	}
}

Loader::init();
