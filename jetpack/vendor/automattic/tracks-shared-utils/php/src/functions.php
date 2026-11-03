<?php
/**
 * Public API. Loaded by Composer's `files` autoload.
 *
 * Each function is guarded because several plugins on one WordPress site may
 * each bundle their own copy of this package.
 */

namespace Automattic\TracksSharedUtils;

if ( ! function_exists( __NAMESPACE__ . '\sanitize_url' ) ) {
	/**
	 * Removes query params that aren't allowlisted, recursively sanitizes URLs
	 * nested in param values, and strips userinfo and fragments.
	 *
	 * @param string $url An absolute URL.
	 * @return string The sanitized URL.
	 */
	function sanitize_url( string $url ): string {
		return Sanitizer::sanitize_url( $url );
	}
}

if ( ! function_exists( __NAMESPACE__ . '\allowed_params' ) ) {
	/**
	 * Query param names that are kept. Both lists are matched case-insensitively.
	 *
	 * @return array{exact: string[], prefixes: string[]}
	 */
	function allowed_params(): array {
		return Config::get()['allowedParams'];
	}
}

if ( ! function_exists( __NAMESPACE__ . '\url_props' ) ) {
	/**
	 * Tracks props whose values are URLs and should be passed through sanitize_url().
	 *
	 * @return string[]
	 */
	function url_props(): array {
		return Config::get()['urlProps'];
	}
}
