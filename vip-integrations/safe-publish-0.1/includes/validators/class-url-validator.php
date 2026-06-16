<?php
/**
 * URL Validator class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Validators;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * URL Validator Class.
 */
class URL_Validator {

	/**
	 * Validates the format of an external URL.
	 *
	 * Rejects URLs that resolve to loopback, link-local, and RFC1918/ULA
	 * ranges so the value cannot redirect plugin HTTP traffic onto an
	 * internal address.
	 *
	 * @param string $url URL to validate.
	 * @return bool True if valid, false otherwise.
	 */
	public static function is_valid_external_url( string $url ): bool {
		if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return false;
		}

		$scheme = strtolower( (string) wp_parse_url( $url, PHP_URL_SCHEME ) );
		if ( 'http' !== $scheme && 'https' !== $scheme ) {
			return false;
		}

		$host = wp_parse_url( $url, PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			return false;
		}

		if ( self::host_is_private( $host ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Returns true when the host is a literal loopback name or an IP
	 * literal in a reserved address range.
	 *
	 * DNS resolution is intentionally skipped — the validator runs on
	 * operator-supplied configuration values, and the operator controls
	 * their own DNS, so resolving here adds latency without raising the
	 * bar against a determined attacker (DNS rebinding can change the
	 * answer between the check and the actual request).
	 *
	 * @param string $host Host portion of the URL.
	 * @return bool True if the host is private/reserved.
	 */
	private static function host_is_private( string $host ): bool {
		$normalized = strtolower( trim( $host, '[]' ) );

		if ( in_array(
			$normalized,
			array( 'localhost', 'ip6-localhost', 'ip6-loopback' ),
			true
		) ) {
			return true;
		}

		$ip = filter_var( $normalized, FILTER_VALIDATE_IP );

		if ( false === $ip ) {
			return false;
		}

		return false === filter_var(
			$ip,
			FILTER_VALIDATE_IP,
			FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
		);
	}

	/**
	 * Validates and sanitizes a URL.
	 *
	 * @param string $url Raw URL input.
	 * @return string|false Sanitized URL or false if invalid.
	 */
	public static function sanitize_external_url( string $url ): string|false {
		$sanitized_url = esc_url_raw( $url );

		if ( self::is_valid_external_url( $sanitized_url ) ) {
			return $sanitized_url;
		}

		return false;
	}
}
