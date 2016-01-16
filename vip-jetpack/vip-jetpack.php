<?php

/*
 * Plugin Name: Jetpack: VIP Specific Changes
 * Plugin URI: https://github.com/Automattic/vipv2-mu-plugins/blob/master/jetpack-mandatory.php
 * Description: VIP-specific customisations to Jetpack.
 * Author: Automattic
 * Version: 1.0
 * License: GPL2+
 */

require_once( __DIR__ . '/jetpack-mandatory.php' );

/**
 * On VIP Go, we always want to use the Go Photon service, instead of WordPress.com's
 */
add_filter( 'jetpack_photon_domain', function( $domain, $image_url ) {
	return home_url();
}, 2, 9999 );

/**
 * Front-end SSL is support on VIP Go and in our file service,
 * and Jetpack's Photon module should respect that.
 */
add_filter( 'jetpack_photon_reject_https', '__return_false' );
