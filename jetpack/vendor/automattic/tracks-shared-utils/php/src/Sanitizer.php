<?php

namespace Automattic\TracksSharedUtils;

/**
 * Implements the algorithm in SPEC.md. The JS port must stay in lockstep, so
 * this deliberately works on raw strings rather than parse_url() / parse_str(),
 * which normalize differently from the browser's URL APIs.
 *
 * @internal Use sanitize_url() instead.
 */
final class Sanitizer {
	/** The start of a URL with an authority: `scheme://` or protocol-relative `//`. */
	private const AUTHORITY_START = '#^(?:[A-Za-z][A-Za-z0-9+.-]*:)?//#';

	/**
	 * An `@`, or a percent-encoded `@` (`%40`, `%2540`, …) left by double
	 * encoding, written backwards. Matched against the reversed authority to
	 * find the last one without backtracking, which JS's `/^[\s\S]*(?:@|…)/`
	 * would need and which fails past PCRE's backtrack limit on long input.
	 */
	private const REVERSED_USERINFO_END = '/@|04(?:52)*%/';

	/** A `?` percent-encoded one or more times (`%3F`, `%253F`, …). */
	private const ENCODED_QUESTION_MARK = '/%(?:25)*3F/i';

	/** @var array<string, true>|null Lowercased exact names. */
	private static $exact_names = null;

	/** @var string[] Lowercased prefixes. */
	private static $prefixes = array();

	/** @var int */
	private static $max_depth = 0;

	/** @var int */
	private static $max_decodes = 0;

	public static function sanitize_url( string $url ): string {
		self::init();
		return self::sanitize_at_depth( $url, 0 );
	}

	private static function init(): void {
		if ( null !== self::$exact_names ) {
			return;
		}
		$config            = Config::get();
		self::$exact_names = array_fill_keys(
			array_map( array( self::class, 'ascii_lowercase' ), $config['allowedParams']['exact'] ),
			true
		);
		self::$prefixes    = array_map( array( self::class, 'ascii_lowercase' ), $config['allowedParams']['prefixes'] );
		self::$max_depth   = (int) $config['limits']['maxDepth'];
		self::$max_decodes = (int) $config['limits']['maxDecodes'];
	}

	/**
	 * strtolower() is locale-dependent before PHP 8.2.
	 */
	private static function ascii_lowercase( string $s ): string {
		return strtr( $s, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz' );
	}

	/**
	 * Form-urlencoded decode. Returns null on a malformed `%` or invalid UTF-8,
	 * matching JS decodeURIComponent() throwing.
	 *
	 * @return string|null
	 */
	private static function decode( string $s ) {
		if ( preg_match( '/%(?![0-9A-Fa-f]{2})/', $s ) ) {
			return null;
		}
		$decoded = urldecode( $s );
		return 1 === preg_match( '//u', $decoded ) ? $decoded : null;
	}

	private static function is_url_shaped( string $s ): bool {
		return 1 === preg_match( self::AUTHORITY_START, $s )
			|| false !== strpos( $s, '?' );
	}

	/**
	 * Removes `userinfo@` from the authority of a URL's base (the part before any `?`).
	 */
	private static function strip_userinfo( string $base ): string {
		if ( 1 !== preg_match( self::AUTHORITY_START, $base, $match ) ) {
			return $base;
		}
		$start     = strlen( $match[0] );
		$slash     = strpos( $base, '/', $start );
		$authority = false === $slash ? (string) substr( $base, $start ) : substr( $base, $start, $slash - $start );
		if ( 1 !== preg_match( self::REVERSED_USERINFO_END, strrev( $authority ), $end, PREG_OFFSET_CAPTURE ) ) {
			return $base;
		}
		// The userinfo runs up to and including the last delimiter.
		$userinfo_length = strlen( $authority ) - $end[0][1];
		return substr( $base, 0, $start ) . substr( $base, $start + $userinfo_length );
	}

	private static function is_allowed_name( string $raw_name ): bool {
		$decoded = self::decode( $raw_name );
		$name    = self::ascii_lowercase( null === $decoded ? $raw_name : $decoded );
		if ( isset( self::$exact_names[ $name ] ) ) {
			return true;
		}
		foreach ( self::$prefixes as $prefix ) {
			if ( 0 === strpos( $name, $prefix ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param int $min_k The first layer that may be treated as a URL. Rechecks
	 *                   pass 2 to skip the layer they already sanitized.
	 * @return string|null The value to output, or null to drop the param.
	 */
	private static function sanitize_value( string $raw_value, int $depth, int $min_k = 1 ) {
		// Decode one layer at a time. $next is the value after $k decodes.
		$layer = $raw_value;
		for ( $k = 1; ; $k++ ) {
			$next = self::decode( $layer );
			if ( null === $next ) {
				// Decoding stopped early, so a query may be hidden in what's left.
				return self::is_url_shaped( $layer ) || preg_match( self::ENCODED_QUESTION_MARK, $layer ) ? null : $raw_value;
			}
			if ( $k > self::$max_decodes ) {
				// Still changing after the decode cap: too deeply encoded to reason about.
				return $next === $layer ? $raw_value : null;
			}
			if ( $k >= $min_k && self::is_url_shaped( $next ) ) {
				if ( $depth + $k > self::$max_depth ) {
					return null;
				}
				$sanitized = self::sanitize_at_depth( $next, $depth + $k );
				// With no `?` left, a query may still be hidden under more encoding
				// (`a%3Fextra%3D1`, `https://a.com/%3Fextra%3D1`). Check the layers below.
				$recheck = false === strpos( $sanitized, '?' )
					&& ( ! self::is_url_shaped( $sanitized ) || preg_match( self::ENCODED_QUESTION_MARK, $sanitized ) );
				return $recheck
					? self::sanitize_value( rawurlencode( $sanitized ), $depth + $k - 1, 2 )
					: rawurlencode( $sanitized );
			}
			if ( $next === $layer ) {
				return $raw_value;
			}
			$layer = $next;
		}
	}

	private static function sanitize_at_depth( string $url, int $depth ): string {
		$hash             = strpos( $url, '#' );
		$without_fragment = false === $hash ? $url : substr( $url, 0, $hash );

		$q = strpos( $without_fragment, '?' );
		if ( false === $q ) {
			return self::strip_userinfo( $without_fragment );
		}
		$base = self::strip_userinfo( substr( $without_fragment, 0, $q ) );

		$kept = array();
		foreach ( explode( '&', (string) substr( $without_fragment, $q + 1 ) ) as $segment ) {
			if ( '' === $segment ) {
				continue;
			}

			$eq       = strpos( $segment, '=' );
			$raw_name = false === $eq ? $segment : substr( $segment, 0, $eq );
			if ( ! self::is_allowed_name( $raw_name ) ) {
				continue;
			}

			$raw_value = false === $eq ? '' : (string) substr( $segment, $eq + 1 );
			if ( '' === $raw_value ) {
				$kept[] = $segment;
				continue;
			}

			$value = self::sanitize_value( $raw_value, $depth );
			if ( null !== $value ) {
				$kept[] = $raw_name . '=' . $value;
			}
		}

		return $kept ? $base . '?' . implode( '&', $kept ) : $base;
	}
}
