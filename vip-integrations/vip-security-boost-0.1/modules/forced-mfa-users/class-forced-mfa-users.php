<?php
namespace Automattic\VIP\Security\MFAUsers;

use Automattic\VIP\Security\Utils\Configs;

class Forced_MFA_Users {
	const MFA_SKIP_USER_IDS_OPTION_KEY = 'vip_security_mfa_skip_user_ids';

	/**
	 * The roles that should have MFA enforced.
	 *
	 * @var string|array The role slug or an array of role slugs.
	 */
	private static $roles;

	public static function init() {
		$forced_mfa_configs = Configs::get_module_configs( 'forced-mfa-users' );

		self::$roles = $forced_mfa_configs['roles'] ?? [];
		add_action( 'set_current_user', [ __CLASS__, 'maybe_enforce_two_factor' ] );
	}

	/**
	 * Require 2FA based on roles set in config
	 */
	public static function maybe_enforce_two_factor() {
		if ( ! is_user_logged_in() ) {
			return;
		}
		// don't enforce 2FA if the user is already excluded by VIP mu-plugins logic
		if ( function_exists( 'wpcom_vip_should_force_two_factor' ) && ! wpcom_vip_should_force_two_factor() ) {
			return;
		}

		$required_roles = self::$roles;

		if ( empty( $required_roles ) ) {
			return;
		}

		if ( is_string( $required_roles ) ) {
			$required_roles = [ $required_roles ];
		}

		$user_has_two_factor_enforced = false;

		$user = wp_get_current_user();
		if ( is_array( $required_roles ) && $user ) {
			foreach ( $required_roles as $role ) {
				if ( is_string( $role ) && ! empty( $role ) && in_array( $role, (array) $user->roles, true ) ) {
					$user_has_two_factor_enforced = true;
					break;
				}
			}

			if ( $user_has_two_factor_enforced ) {
				add_filter( 'wpcom_vip_is_two_factor_forced', function () {
					return true;
				}, PHP_INT_MAX );
			}
		}
	}
}

Forced_MFA_Users::init();
