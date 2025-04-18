<?php
namespace Automattic\VIP\Security\MFAUsers;

use function Automattic\VIP\Security\Utils\get_module_configs;

class Forced_MFA_Users {
	const MFA_SKIP_USER_IDS_OPTION_KEY = 'vip_security_mfa_skip_user_ids';

	/**
	 * The capability required to force MFA.
	 *
	 * @var string|array The capability slug or an array of slugs.
	 */
	private static $capability;

	public static function init() {
		$forced_mfa_configs = get_module_configs( 'forced-mfa-users' );

		self::$capability = $forced_mfa_configs['capability'] ?? [];
		add_action( 'set_current_user', [ __CLASS__, 'maybe_enforce_two_factor' ] );
	}

	/**
	* Require 2FA based on capabilities set in config
	*/
	public static function maybe_enforce_two_factor() {
		if ( ! is_user_logged_in() ) {
			return;
		}

		$required_capability_or_caps = self::$capability;

		if ( empty( $required_capability_or_caps ) ) {
			return;
		}

		if ( is_string( $required_capability_or_caps ) ) {
			$required_capability_or_caps = [ $required_capability_or_caps ];
		}

		$user_has_two_factor_enforced = false;

		if ( is_array( $required_capability_or_caps ) ) {
			foreach ( $required_capability_or_caps as $cap ) {
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
