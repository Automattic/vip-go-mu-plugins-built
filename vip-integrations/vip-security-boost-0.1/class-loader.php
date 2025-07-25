<?php
namespace Automattic\VIP\Security;

use Automattic\VIP\Security\Constants;
use Automattic\VIP\Security\Utils\Logger;

class Loader {
	const LOG_FEATURE_NAME = 'sb_module_loader';

	public static function init() {
		if ( ! defined( 'VIP_SECURITY_BOOST_CONFIGS' ) ) {
			Logger::warning_log_if_user_logged_in(
				self::LOG_FEATURE_NAME,
				'VIP_SECURITY_BOOST_CONFIGS is not defined.'
			);
			return;
		}

		$configs         = constant( 'VIP_SECURITY_BOOST_CONFIGS' );
		$enabled_modules = $configs['enabled_modules'] ?? [];

		// return if there are no enabled modules (empty array or string)
		if ( empty( $enabled_modules ) ) {
			return;
		}

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
				Logger::warning_log_if_user_logged_in(
					self::LOG_FEATURE_NAME,
					'Module not found: ' . $module
				);
			}
		}
	}
}

Loader::init();
