<?php

namespace Automattic\VIP\Security\Utils;

function load_integration_configs_from_url() {
	if ( defined( 'WP_CLI' ) && constant( 'WP_CLI' ) ) {
		return;
	}

	$config_api_url = vip_get_env_var( 'VIP_CONFIG_API_URL', getenv( 'VIP_CONFIG_API_URL' ) );

	if ( ! $config_api_url ) {
		return;
	}

	$endpoint  = sprintf( '%s/integration?slug=security-boost&level=site&site_id=%s&is_vip=true', $config_api_url, constant( 'VIP_GO_APP_ID' ) );
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

	if ( ! defined( 'VIP_SECURITY_BOOST_CONFIGS' ) ) {
		define( 'VIP_SECURITY_BOOST_CONFIGS', $body['data']['config'] );
	}
}

function load_integration_configs_from_headers() {
	// Check if the header exists before using it.
	if ( ! isset( $_SERVER['HTTP_X_INTEGRATION_TEST_CONFIGS'] ) ) {
		return;
	}
	// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	$configs_raw = $_SERVER['HTTP_X_INTEGRATION_TEST_CONFIGS'];
	// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
	$configs = json_decode( base64_decode( $configs_raw ), true );

	if ( ! defined( 'VIP_SECURITY_BOOST_CONFIGS' ) ) {
		define( 'VIP_SECURITY_BOOST_CONFIGS', $configs );
	}
}
