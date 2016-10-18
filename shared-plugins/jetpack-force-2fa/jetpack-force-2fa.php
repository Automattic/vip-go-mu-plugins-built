<?php
/*
Plugin Name: Force Jetpack 2FA
Plugin URI: http://automattic.com
Description: Force admins to use two factor authentiation.
Author: Brandon Kraft, Josh Betz, Automattic
Version: 0.1
Author URI: http://automattic.com
*/

// Bail if Jetpack SSO is not active
if ( ! class_exists( 'Jetpack' ) || ! Jetpack::is_module_active( 'sso' ) ) {
	add_action( 'plugins_loaded', function() {
		if ( apply_filters( 'jetpack_force_2fa_dependency_notice', true ) && current_user_can( 'manage_options' ) ) {
			add_action( 'admin_notices', function() {
				printf( '<div class="%1$s"><p>%2$s</p></div>', 'notice-warning', 'Jetpack Force 2FA requires Jetpack and the Jetpack SSO module.' );
			});
		}
	});
	
	return;
}

// Allows WP.com login to a local account if it matches the local account.
add_filter( 'jetpack_sso_match_by_email', '__return_true', 9999 );

if ( is_multisite() ) { // Temporary for multisites until admin-only option developed.

	// Hide the login form
	add_filter( 'jetpack_remove_login_form', '__return_true', 9999 );
	add_filter( 'jetpack_sso_bypass_login_forward_wpcom', '__return_true', 9999 );
	add_filter( 'jetpack_sso_display_disclaimer', '__return_false', 9999 );

	add_filter( 'wp_authenticate_user', function() {
		return new WP_Error( 'wpcom-required', "Local login disabled for this site." );
	}, 9999 );

	add_filter( 'jetpack_sso_require_two_step', '__return_true' );

	add_filter( 'allow_password_reset', '__return_false' );

} // end if multisite

else { // not multisite
	// Completely disable the standard login form for admins.
	add_filter( 'wp_authenticate_user', function( $user ) {
		if ( $user->has_cap('manage_options') ) {
			return new WP_Error( 'wpcom-required', "Local login disabled for this account.", $user->user_login );
		}
		return $user;
	}, 9999);

	add_filter( 'allow_password_reset', function( $allow, $user_id ) {
		if ( user_can( $user_id, 'manage_options' ) ) {
			return false;
		}
		return $allow;
	}, 9999, 2 );

	add_action( 'jetpack_sso_pre_handle_login', 'jetpack_set_two_step_for_admins' );
} // end multisite else

function jetpack_set_two_step_for_admins( $user_data ){
	$user = Jetpack_SSO::get_user_by_wpcom_id( $user_data->ID );

	// Borrowed from Jetpack. Ignores the match_by_email setting.
	if ( empty( $user ) ) {
		$user = get_user_by( 'email', $user_data->email );
	}

	if ( $user && $user->has_cap('manage_options') ){
		add_filter('jetpack_sso_require_two_step', '__return_true');
	}
}
