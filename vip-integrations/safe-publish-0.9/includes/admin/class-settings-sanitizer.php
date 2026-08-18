<?php
/**
 * Settings Sanitizer class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Options;
use Safe_Publish\Validators\URL_Validator;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Provides stateless sanitization callbacks for plugin settings.
 */
class Settings_Sanitizer {

	/**
	 * Sanitizes the connected site URL setting.
	 *
	 * @param mixed $url URL to sanitize.
	 * @return string Sanitized URL or empty string on failure.
	 */
	public function sanitize_url( mixed $url ): string {
		// preserve the existing value when the URL is omitted from POST.
		if ( null === $url ) {
			return get_option( Options::OPTION_CONNECTED_SITE_URL, '' );
		}

		$url = esc_url_raw( $url );

		if ( empty( $url ) ) {
			return '';
		}

		if ( ! URL_Validator::is_valid_external_url( $url ) ) {
			add_settings_error(
				Options::OPTION_CONNECTED_SITE_URL,
				'invalid_url',
				__( 'Please enter a valid connected site URL.', 'safe-publish' )
			);
			return get_option( Options::OPTION_CONNECTED_SITE_URL, '' );
		}

		return $url;
	}

	/**
	 * Sanitizes a checkbox setting value.
	 *
	 * @param mixed $value Value to sanitize.
	 * @return bool Sanitized checkbox value.
	 */
	public function sanitize_checkbox( mixed $value ): bool {
		return (bool) $value;
	}

	/**
	 * Sanitizes the username for Basic authentication.
	 *
	 * @param mixed $value Value to sanitize.
	 * @return string Sanitized username.
	 */
	public function sanitize_username( mixed $value ): string {
		// preserve the existing value when sync mode is export-only.
		if ( null === $value ) {
			return (string) get_option( Options::OPTION_BASIC_AUTH_USERNAME, '' );
		}

		return sanitize_text_field( $value );
	}

	/**
	 * Sanitizes the password for Basic authentication.
	 *
	 * @param mixed $value Value to sanitize.
	 * @return string Sanitized password.
	 */
	public function sanitize_password( mixed $value ): string {
		// preserve the existing value when sync mode is export-only.
		if ( null === $value ) {
			return (string) get_option( Options::OPTION_BASIC_AUTH_PASSWORD, '' );
		}

		// Don't sanitize passwords beyond trimming whitespace.
		return trim( $value );
	}

	/**
	 * Sanitizes the sync mode setting.
	 *
	 * @param mixed $value Value to sanitize.
	 * @return string One of 'export', 'import', 'bidirectional', or '' on invalid input.
	 */
	public function sanitize_sync_mode( mixed $value ): string {
		$allowed = array(
			Options::SYNC_MODE_EXPORT,
			Options::SYNC_MODE_IMPORT,
			Options::SYNC_MODE_BIDIRECTIONAL,
		);

		if ( '' === $value || null === $value ) {
			return '';
		}

		if ( ! in_array( $value, $allowed, true ) ) {
			add_settings_error(
				Options::OPTION_SYNC_MODE,
				'invalid_sync_mode',
				__( 'Please select a valid Sync Mode.', 'safe-publish' )
			);

			return get_option( Options::OPTION_SYNC_MODE, '' );
		}

		return $value;
	}
}
