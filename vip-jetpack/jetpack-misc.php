<?php

/**
 * Various miscellaneous pieces of functionality
 * relating to Jetpack
 */


/**
 * Remove certain modules from the list of those that can be activated
 * Blocks access to certain functionality that isn't compatible with the platform.
 */
add_filter( 'jetpack_get_available_modules', function( $modules ) {
	unset( $modules['sitemaps'] ); // Duplicates msm-sitemaps and doesn't scale for our client's needs (https://github.com/Automattic/jetpack/issues/3314)
	unset( $modules['photon'] );
	unset( $modules['site-icon'] );
	unset( $modules['protect'] );

	return $modules;
}, 999 );
