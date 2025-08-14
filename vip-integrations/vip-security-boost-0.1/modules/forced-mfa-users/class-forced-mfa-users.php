<?php
namespace Automattic\VIP\Security\MFAUsers;

use Automattic\VIP\Security\Utils\Configs;
use Automattic\VIP\Security\Utils\Capability_Utils;

class Forced_MFA_Users {
	public const ADDITIONAL_CAPABILITIES_FILTER_NAME = 'wpcom_vip_wsc_forced_mfa_users_additional_capabilities';
	public const ADDITIONAL_ROLES_FILTER_NAME        = 'wpcom_vip_wsc_forced_mfa_users_additional_roles';
	/**
	 * The roles that should have MFA enforced.
	 *
	 * @var array An array of role slugs.
	 */
	private static $roles;

	/**
	 * The capabilities that should have MFA enforced.
	 *
	 * @var array An array of capability slugs.
	 */
	private static $capabilities;

	public static function init() {
		$forced_mfa_configs = Configs::get_module_configs( 'forced-mfa-users' );

		if ( empty( $forced_mfa_configs ) ) {
			return;
		}

		// Normalize capabilities and roles configuration
		self::$capabilities = Capability_Utils::normalize_capabilities_input( $forced_mfa_configs['capabilities'] ?? [] );
		self::$roles        = Capability_Utils::normalize_roles_input( $forced_mfa_configs['roles'] ?? [] );

		// Ensure we have either capabilities or roles configured
		if ( empty( self::$capabilities ) && empty( self::$roles ) ) {
			return;
		}

		add_action( 'set_current_user', [ __CLASS__, 'maybe_enforce_two_factor' ], 10 );
		add_filter( 'vip_site_details_index_security_boost_data', [ __CLASS__, 'add_custom_enforced_capabilities_to_sds' ] );
	}

	public static function add_custom_enforced_capabilities_to_sds( $data ) {
		$has_custom_capabilities_filter = has_filter( self::ADDITIONAL_CAPABILITIES_FILTER_NAME ) !== false;
		$data['custom_capabilities']    = $has_custom_capabilities_filter ? implode( ',', self::get_custom_enforced_capabilities() ) : 'false';
		$has_custom_roles_filter        = has_filter( self::ADDITIONAL_ROLES_FILTER_NAME ) !== false;
		$data['custom_roles']           = $has_custom_roles_filter ? implode( ',', self::get_custom_enforced_roles() ) : 'false';
		return $data;
	}

	public static function get_custom_enforced_capabilities() {
		return Capability_Utils::normalize_capabilities_input( apply_filters( self::ADDITIONAL_CAPABILITIES_FILTER_NAME, [] ) );
	}

	public static function get_custom_enforced_roles() {
		return Capability_Utils::normalize_roles_input( apply_filters( self::ADDITIONAL_ROLES_FILTER_NAME, [] ) );
	}

	/**
	 * Returns the merged array of capabilities from the config and the custom enforced capabilities
	 *
	 * @return array
	 */
	public static function get_capabilities() {
		return array_unique( array_merge( self::$capabilities, self::get_custom_enforced_capabilities() ) );
	}

	/**
	 * Returns the merged array of roles from the config and the custom enforced roles
	 *
	 * @return array
	 */
	public static function get_roles() {
		return array_unique( array_merge( self::$roles, self::get_custom_enforced_roles() ) );
	}

	/**
	 * Require 2FA based on capabilities or roles set in config
	 */
	public static function maybe_enforce_two_factor() {
		if ( ! is_user_logged_in() ) {
			return;
		}
		// don't enforce 2FA if the user is already excluded by VIP mu-plugins logic
		if ( function_exists( 'wpcom_vip_should_force_two_factor' ) && ! wpcom_vip_should_force_two_factor() ) {
			return;
		}

		$user = wp_get_current_user();
		if ( ! $user->exists() ) {
			return;
		}
		// Check if user has elevated permissions based on capabilities or roles
		$user_has_two_factor_enforced = Capability_Utils::user_has_elevated_permissions(
			$user,
			self::get_capabilities(), // we're using the merged array of capabilities
			self::get_roles() // we're using the merged array of roles
		);

		// we're intentionally applying the is_two_factor_forced filter with a default of "true" to check if someone is overriding the value and returning false.
		$is_forced_to_false_via_filter = apply_filters( 'wpcom_vip_is_two_factor_forced', true ) === false;
		if ( $is_forced_to_false_via_filter ) {
			// honor the filter and don't enforce 2FA
			return;
		}

		add_filter( 'wpcom_vip_internal_is_two_factor_forced', function ( $limited ) use ( $user_has_two_factor_enforced ) {
			// we're honoring the $limited value in case it's stricter than ours.
			return $limited || $user_has_two_factor_enforced;
		}, PHP_INT_MAX, 1 );
	}
}

Forced_MFA_Users::init();
