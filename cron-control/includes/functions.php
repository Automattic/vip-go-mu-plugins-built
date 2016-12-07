<?php

namespace Automattic\WP\Cron_Control;

/**
 * Check if an event is an internal one that the plugin will always run
 */
function is_internal_event( $action ) {
	return Internal_Events::instance()->is_internal_event( $action );
}

/**
 * Check if the current request is to one of the plugin's REST endpoints
 *
 * @param string $type list|run
 *
 * @return bool
 */
function is_rest_endpoint_request( $type = 'list' ) {
	// Which endpoint are we checking
	$endpoint = null;
	switch ( $type ) {
		case 'list' :
			$endpoint = REST_API::ENDPOINT_LIST;
			break;

		case 'run' :
			$endpoint = REST_API::ENDPOINT_RUN;
			break;
	}

	// No endpoint to check
	if ( is_null( $endpoint ) ) {
		return false;
	}

	// Build the full endpoint and check against the current request
	$run_endpoint = sprintf( '%s/%s/%s', rest_get_url_prefix(), REST_API::API_NAMESPACE, $endpoint );

	return in_array( $run_endpoint, parse_request() );
}

/**
 * Flush plugin's internal caches
 *
 * FOR INTERNAL USE ONLY - see WP-CLI; all other cache clearance should happen through the `Cron_Options_CPT` class
 */
function _flush_internal_caches() {
	return wp_cache_delete( Cron_Options_CPT::CACHE_KEY );
}
