<?php
namespace Automattic\VIP\Security\Utils;

/**
 * Get the module configs for a given module name.
 *
 * Attempts to retrieve configuration for a specific security module.
 * Configuration is expected to be stored within the VIP_SECURITY_BOOST_CONFIGS constant.
 * Handles cases where the configuration might be stored as a JSON string.
 *
 * @param string $module_name The name of the module to get the configs for.
 * @return array The module configs. Returns an empty array if configs are not found,
 * not defined, or if JSON parsing fails.
 */
function get_module_configs( $module_name, $configs = false ) {
	if ( false === $configs ) {
		$configs = get_all_module_configs();
	}

	$module_configs = parse_module_configs( $configs );

	$current_module_config = [];

	if ( is_array( $module_configs ) && isset( $module_configs[ $module_name ] ) ) {
		$current_module_config = $module_configs[ $module_name ];
	}

	if ( ! is_array( $current_module_config ) ) {
		return [];
	}

	return $current_module_config;
}

function parse_module_configs( $configs ): array {
	if ( ! isset( $configs['module_configs'] ) ) {
		return [];
	}

	$module_configs = $configs['module_configs'];

	if ( is_string( $module_configs ) ) {
		$module_configs = json_decode( $module_configs, true );

		if ( is_null( $module_configs ) && json_last_error() !== JSON_ERROR_NONE ) {
			return [];
		}
	}

	return $module_configs;
}

function get_all_module_configs() {
	if ( ! defined( 'VIP_SECURITY_BOOST_CONFIGS' ) ) {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
		trigger_error( '[WordPress Security Controls] VIP_SECURITY_BOOST_CONFIGS is not defined.', E_USER_WARNING );
		return [];
	}

	$configs = constant( 'VIP_SECURITY_BOOST_CONFIGS' );

	if ( ! is_array( $configs ) ) {
		return [];
	}

	return $configs;
}
