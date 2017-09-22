<?php
/*
Plugin Name: Force Jetpack 2FA
Plugin URI: http://automattic.com
Description: Force admins to use two factor authentiation.
Author: Brandon Kraft, Josh Betz, Automattic
Version: 0.1
Author URI: http://automattic.com
*/

class Jetpack_Force_2FA {

	private $role;

	function __construct() {
		add_action( 'after_setup_theme', array( $this, 'plugins_loaded' ) );
	}

	function plugins_loaded() {
		$this->role = apply_filters( 'jetpack_force_2fa_cap', 'manage_options' );
		
		// Bail if Jetpack SSO is not active
		if ( ! class_exists( 'Jetpack' ) || ! Jetpack::is_active() || ! Jetpack::is_module_active( 'sso' ) ) {
			add_action( 'admin_notices', array( $this, 'admin_notice' ) );
			return;
		}

		$this->force_2fa();
	}

	function admin_notice() {
		if ( apply_filters( 'jetpack_force_2fa_dependency_notice', true ) && current_user_can( $this->role ) ) {
			printf( '<div class="%1$s"><p>%2$s</p></div>', 'notice notice-warning', 'Jetpack Force 2FA requires Jetpack and the Jetpack SSO module.' );
		}
	}

	function force_2fa() {
		// Allows WP.com login to a local account if it matches the local account.
		add_filter( 'jetpack_sso_match_by_email', '__return_true', 9999 );

		// multisite
		if ( is_multisite() ) {

			// Hide the login form
			add_filter( 'jetpack_remove_login_form', '__return_true', 9999 );
			add_filter( 'jetpack_sso_bypass_login_forward_wpcom', '__return_true', 9999 );
			add_filter( 'jetpack_sso_display_disclaimer', '__return_false', 9999 );

			add_filter( 'wp_authenticate_user', function() {
				return new WP_Error( 'wpcom-required', $this->get_login_error_message() );
			}, 9999 );

			add_filter( 'jetpack_sso_require_two_step', '__return_true' );

			add_filter( 'allow_password_reset', '__return_false' );
		}

		// not multisite
		else {
			// Completely disable the standard login form for admins.
			add_filter( 'wp_authenticate_user', function( $user ) {
				if ( is_wp_error( $user ) ) {
					return $user;
				}
				if ( $user->has_cap( $this->role ) ) {
					return new WP_Error( 'wpcom-required', $this->get_login_error_message(), $user->user_login );
				}
				return $user;
			}, 9999);

			add_filter( 'allow_password_reset', function( $allow, $user_id ) {
				if ( user_can( $user_id, $this->role ) ) {
					return false;
				}
				return $allow;
			}, 9999, 2 );

			add_action( 'jetpack_sso_pre_handle_login', array( $this, 'jetpack_set_two_step_for_admins' ) );
		}
	}

	function jetpack_set_two_step_for_admins( $user_data ) {
		$user = Jetpack_SSO::get_user_by_wpcom_id( $user_data->ID );

		// Borrowed from Jetpack. Ignores the match_by_email setting.
		if ( empty( $user ) ) {
			$user = get_user_by( 'email', $user_data->email );
		}

		if ( $user && $user->has_cap( $this->role ) ){
			add_filter('jetpack_sso_require_two_step', '__return_true');
		}
	}

	private function get_login_error_message() {
		return apply_filters(
			'jetpack_force_2fa_login_error_message',
			sprintf( 'For added security, please log in using your WordPress.com account.<br /><br />Note: Your account must have <a href="%1$s" target="_blank">Two Step Authentication</a> enabled, which can be configured from <a href="%2$s" target="_blank">Security Settings</a>.', 'https://support.wordpress.com/security/two-step-authentication/', 'https://wordpress.com/me/security/two-step' )
		);
	}
}

new Jetpack_Force_2FA;

