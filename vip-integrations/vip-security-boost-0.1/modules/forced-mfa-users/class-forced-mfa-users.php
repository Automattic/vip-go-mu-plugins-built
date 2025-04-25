<?php
namespace Automattic\VIP\Security\MFAUsers;

use function Automattic\VIP\Security\Utils\get_module_configs;

class Forced_MFA_Users {
	const MFA_SKIP_USER_IDS_OPTION_KEY = 'vip_security_mfa_skip_user_ids';

	/**
	 * The capability or capabilities required to force MFA.
	 *
	 * @var string|array The capability slug or an array of slugs.
	 */
	private static $capabilities;

	public static function init() {
		$forced_mfa_configs = get_module_configs( 'forced-mfa-users' );

		self::$capabilities = $forced_mfa_configs['capabilities'] ?? [];
		add_action( 'set_current_user', [ __CLASS__, 'maybe_enforce_two_factor' ] );
	}

	/**
	* Require 2FA based on capabilities set in config
	*/
	public static function maybe_enforce_two_factor() {
		if ( ! is_user_logged_in() ) {
			return;
		}

		// Exclude User ID 1
		if ( 1 === get_current_user_id() ) {
			return;
		}

		$required_capabilities = self::$capabilities;

		if ( empty( $required_capabilities ) ) {
			return;
		}

		if ( is_string( $required_capabilities ) ) {
			$required_capabilities = [ $required_capabilities ];
		}

		$user_has_two_factor_enforced = false;

		if ( is_array( $required_capabilities ) ) {
			foreach ( $required_capabilities as $cap ) {
				// phpcs:ignore WordPress.WP.Capabilities.Undetermined
				if ( is_string( $cap ) && ! empty( $cap ) && current_user_can( $cap ) ) {
					$user_has_two_factor_enforced = true;
					break;
				}
			}
		}

		if ( $user_has_two_factor_enforced ) {
			add_filter( 'wpcom_vip_is_two_factor_forced', function () {
				return true;
			}, PHP_INT_MAX );
		}
	}
}
Forced_MFA_Users::init();
