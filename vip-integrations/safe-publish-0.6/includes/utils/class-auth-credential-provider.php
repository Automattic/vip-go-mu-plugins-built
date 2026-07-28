<?php
/**
 * Auth Credential Provider utility
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single source of truth for reading authentication credentials from plugin
 * settings.
 *
 * Always returns the shared secret when configured (required). Optionally
 * includes Basic Auth credentials when a username and password are saved.
 */
class Auth_Credential_Provider {

	/**
	 * Returns authentication credentials from plugin settings.
	 *
	 * Shared Secret is resolved via get_shared_secret() (constant or
	 * environment variable) and included when set. Basic Auth credentials are
	 * included when configured.
	 *
	 * @return array Authentication credentials array with appropriate keys.
	 */
	public static function get_credentials(): array {
		$credentials = array();

		$shared_secret = self::get_shared_secret();
		if ( '' !== $shared_secret ) {
			$credentials['shared_secret'] = $shared_secret;
		}

		// Basic auth is optional and can be layered on top of shared secret auth.
		$username = Options::get_value( Options::OPTION_BASIC_AUTH_USERNAME, '' );
		$password = Options::get_value( Options::OPTION_BASIC_AUTH_PASSWORD, '' );

		if ( ! empty( $username ) && ! empty( $password ) ) {
			$credentials['username'] = $username;
			$credentials['password'] = $password;
		}

		return $credentials;
	}

	/**
	 * Resolves the shared secret from the SAFE_PUBLISH_SHARED_SECRET constant
	 * or the matching environment variable, with the constant taking
	 * precedence.
	 *
	 * @return string Shared secret, or empty string if not configured.
	 */
	public static function get_shared_secret(): string {
		if ( defined( 'SAFE_PUBLISH_SHARED_SECRET' ) ) {
			$constant_secret = (string) constant( 'SAFE_PUBLISH_SHARED_SECRET' );
			if ( '' !== $constant_secret ) {
				return $constant_secret;
			}
		}

		$env_secret = getenv( 'SAFE_PUBLISH_SHARED_SECRET' );
		if ( is_string( $env_secret ) && '' !== $env_secret ) {
			return $env_secret;
		}

		return '';
	}
}
