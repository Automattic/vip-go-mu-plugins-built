<?php

namespace Automattic\VIP\Security\Utils;

function load_integration_configs() {
    $endpoint  = sprintf( '%s/integration?slug=security-boost&level=site&site_id=%s&is_vip=true', constant( 'VIP_CONFIG_API_URL' ), constant( 'VIP_GO_APP_ID' ) );
    $api_error = new \WP_Error( 'config-api-error', 'There was an error while fetching the integration configuration from the API.' );
    $response  = vip_safe_wp_remote_get( $endpoint, $api_error, 5, 5, 5, array() );

    if ( is_wp_error( $response ) ) {
        error_log( 'Error: ' . $response->get_error_message() );
        return;
    }

    $status_code = wp_remote_retrieve_response_code( $response );
    $body_raw    = wp_remote_retrieve_body( $response );
    $body        = json_decode( $body_raw, true );

    if ( $status_code !== 200 || ! is_array( $body ) || ! isset( $body['data'] ) ) {
        error_log( 'Error: ' . $body_raw );
        return;
    }

    if ( ! defined( 'VIP_SECURITY_BOOST_CONFIGS' ) ) {
        define( 'VIP_SECURITY_BOOST_CONFIGS', $body['data']['config'] );
    }
}
