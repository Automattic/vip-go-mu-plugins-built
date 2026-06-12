<?php

namespace Automattic\VIP\Salesforce\Agentforce\Utils;

use Automattic\VIP\Salesforce\Agentforce\Utils\Logger;

function load_integration_configs_from_url(): void {
	// vip_get_env_var() is provided by VIP mu-plugins; fall back to getenv() if not available.
	$config_api_url = function_exists( 'vip_get_env_var' )
		? vip_get_env_var( 'VIP_CONFIG_API_URL', getenv( 'VIP_CONFIG_API_URL' ) )
		: getenv( 'VIP_CONFIG_API_URL' );

	if ( ! $config_api_url ) {
		Logger::info(
			'sb_dev_env',
			'VIP_CONFIG_API_URL is not set, skipping loading integration configs from URL.'
		);
		// Define default empty configuration for local development
		if ( ! defined( 'VIP_AGENTFORCE_CONFIGS' ) ) {
			define( 'VIP_AGENTFORCE_CONFIGS', [
				'salesforce_instance_url' => '',
			] );
		}
		return;
	}

	$endpoint  = sprintf( '%s/integration?slug=agentforce&level=site&site_id=%s', $config_api_url, constant( 'VIP_GO_APP_ID' ) );
	$api_error = new \WP_Error( 'config-api-error', 'There was an error while fetching the integration configuration from the API.' );
	$response  = vip_safe_wp_remote_get( $endpoint, $api_error, 5, 5, 5, array() );

	if ( is_wp_error( $response ) ) {
		return;
	}

	$status_code = wp_remote_retrieve_response_code( $response );
	$body_raw    = wp_remote_retrieve_body( $response );
	$body        = json_decode( $body_raw, true );

	if ( 200 !== $status_code || ! is_array( $body ) || ! isset( $body['data'] ) ) {
		return;
	}

	if ( ! defined( 'VIP_AGENTFORCE_CONFIGS' ) ) {
		define( 'VIP_AGENTFORCE_CONFIGS', $body['data']['config'] );
	}
}

function load_integration_configs_from_headers(): void {
	// Check if the header exists before using it.
	if ( ! isset( $_SERVER['HTTP_X_INTEGRATION_TEST_CONFIGS'] ) ) {
		return;
	}
	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	$configs_raw = $_SERVER['HTTP_X_INTEGRATION_TEST_CONFIGS'];
	// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
	$configs = json_decode( base64_decode( $configs_raw ), true );

	if ( ! defined( 'VIP_AGENTFORCE_CONFIGS' ) ) {
		define( 'VIP_AGENTFORCE_CONFIGS', $configs );
	}
}
