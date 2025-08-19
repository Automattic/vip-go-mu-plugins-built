<?php

namespace Automattic\VIP\Security\SessionControl;

use Automattic\VIP\Security\Utils\Logger;
use Automattic\VIP\Security\Utils\Configs;

/**
 * Session Control module for VIP Security Boost
 *
 * This module allows controlling the WordPress session time length.
 * Options:
 * - "default": WordPress default behavior (module not active)
 * - 1-13: Number of days the session should last. WordPress default is 14 days, so we're allowing users to choose a number below it.
 */
class Session_Control {
	const LOG_FEATURE_NAME     = 'sb_session_control';
	public const DEFAULT_VALUE = 'default';

	/**
	 * Initialize the module
	 */
	public static function init() {
		$expiration_days_value = self::get_expiration_days_from_config();

		// Only apply if a valid expiration time is set
		if ( ! self::is_default_wordpress_expiration_days( $expiration_days_value ) ) {
			// Add filters to modify session expiration time
			add_filter( 'auth_cookie_expiration', array( __CLASS__, 'set_auth_cookie_expiration' ), 99, 3 );
		}
	}

	public static function is_expiration_days_within_range( string $expiration_days_value ): bool {
		if ( ! is_numeric( $expiration_days_value ) ) {
			return false;
		}
		$expiration_days = intval( $expiration_days_value );
		return $expiration_days >= 1 && $expiration_days <= 13;
	}

	public static function get_expiration_days_from_config(): string {
		$session_configs       = Configs::get_module_configs( 'session-control' );
		$expiration_days_value = $session_configs['expiration_days'] ?? self::DEFAULT_VALUE;
		return $expiration_days_value;
	}

	public static function is_default_wordpress_expiration_days( string $expiration_days_value ): bool {
		return self::DEFAULT_VALUE === $expiration_days_value;
	}

	/**
	 * Set the authentication cookie expiration time
	 *
	 * @param int $expiration The current expiration timestamp.
	 * @param int $user_id User ID.
	 * @param bool $remember Whether to remember the user login.
	 *
	 * @return int Modified expiration timestamp
	 */
	public static function set_auth_cookie_expiration( int $expiration, int $user_id, bool $remember ): int {
		$expiration_days_value = self::get_expiration_days_from_config();

		if ( self::is_default_wordpress_expiration_days( $expiration_days_value ) ) {
			return $expiration;
		}

		if ( ! self::is_expiration_days_within_range( $expiration_days_value ) ) {
			Logger::warning( self::LOG_FEATURE_NAME, 'Invalid session expiration days. Reverting to default.', [
				'expiration_days' => $expiration_days_value,
			] );
			return $expiration;
		}

		// Only apply custom expiration if "Remember Me" is checked
		if ( $remember ) {
			$expiration_days = intval( $expiration_days_value );
			// Convert days to seconds
			$days_in_seconds = $expiration_days * DAY_IN_SECONDS;
			// Set the expiration time based on our configuration
			return $days_in_seconds;
		}

		// Return the default expiration if "Remember Me" is not checked
		return $expiration;
	}
}

Session_Control::init();
