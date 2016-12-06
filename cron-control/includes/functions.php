<?php

namespace Automattic\WP\Cron_Control;

/**
 * Check if an event is an internal one that the plugin will always run
 */
function is_internal_event( $action ) {
	return Internal_Events::instance()->is_internal_event( $action );
}

/**
 * Flush plugin's internal caches
 *
 * FOR INTERNAL USE ONLY - see WP-CLI; all other cache clearance should happen through the `Cron_Options_CPT` class
 */
function _flush_internal_caches() {
	return wp_cache_delete( Cron_Options_CPT::CACHE_KEY );
}
