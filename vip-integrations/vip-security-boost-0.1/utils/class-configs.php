<?php

namespace Automattic\VIP\Security\Utils;

use function Automattic\VIP\Security\Utils\{ get_all_module_configs, parse_module_configs };

class Configs {
	private static $cached_module_configs = null;

	/**
	 * Get the module configs for a given module name.
	 *
	 * Attempts to retrieve configuration for a specific security module.
	 *
	 * @param string $module_name The name of the module to get the configs for.
	 * @return array The module configs. Returns an empty array if configs are not found,
	 * not defined, or if JSON parsing fails.
	 */
	public static function get_module_configs( $module_name ): array {
		if ( null === self::$cached_module_configs ) {
			self::init();
		}

		$current_module_config = [];

		if ( isset( self::$cached_module_configs[ $module_name ] ) ) {
			$current_module_config = self::$cached_module_configs[ $module_name ];
		}

		if ( ! is_array( $current_module_config ) ) {
			return [];
		}

		return $current_module_config;
	}

	private static function init(): void {
		$configs        = get_all_module_configs();
		$module_configs = parse_module_configs( $configs );

		if ( ! is_array( $module_configs ) ) {
			self::$cached_module_configs = [];
		} else {
			self::$cached_module_configs = $module_configs;
		}
	}
}
