<?php

namespace Automattic\ShareADraft;

/**
 * CIDR validation and matching for the preview-link IP allowlist.
 *
 * Pure static helpers, so both the access policy and the input surfaces share
 * one definition of "valid range" and "matches". A range is an IPv4 or IPv6
 * address with an optional /prefix; a bare address means the full-length prefix
 * (a single host).
 *
 * Matching is done on `inet_pton()` binary representations, so IPv4 and IPv6
 * are handled uniformly and an address never matches a range of the other
 * family. Every address is validated with `filter_var()` before `inet_pton()`
 * is called, so malformed input can never raise a warning.
 */
final class IpAllowlist {
	/**
	 * Whether a string is a usable range: a valid IPv4/IPv6 address, optionally
	 * followed by a slash and an in-range prefix length.
	 */
	public static function is_valid_range( string $range ): bool {
		$parts = explode( '/', $range );

		if ( count( $parts ) > 2 ) {
			return false;
		}

		if ( false === filter_var( $parts[0], FILTER_VALIDATE_IP ) ) {
			return false;
		}

		if ( ! isset( $parts[1] ) ) {
			return true;
		}

		if ( '' === $parts[1] || ! ctype_digit( $parts[1] ) ) {
			return false;
		}

		$max_bits = str_contains( $parts[0], ':' ) ? 128 : 32;

		return (int) $parts[1] <= $max_bits;
	}

	/**
	 * Whether the client address falls inside any of the given ranges.
	 *
	 * An unparseable address or an empty range list never matches: the caller
	 * decides what an empty list means (no restriction), this only answers the
	 * membership question.
	 *
	 * @param list<string> $ranges Valid ranges, per {@see self::is_valid_range()}.
	 */
	public static function matches( string $ip, array $ranges ): bool {
		if ( false === filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			return false;
		}

		$packed_ip = inet_pton( $ip );

		if ( false === $packed_ip ) {
			return false;
		}

		foreach ( $ranges as $range ) {
			if ( self::range_contains( $range, $packed_ip ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * The usable ranges in an untrusted value, e.g. the optional `ip_allowlist`
	 * key of the VIP-injected config constant.
	 *
	 * Tolerates the shapes a Dashboard-edited value could arrive in — a list of
	 * strings, or a single comma/newline-separated string — and silently drops
	 * anything unusable (non-strings, malformed ranges) rather than fataling or
	 * half-applying, consistent with the Config hardening.
	 *
	 * @param mixed $raw
	 * @return list<string>
	 */
	public static function sanitize( $raw ): array {
		return array_values( array_filter( self::entries( $raw ), [ self::class, 'is_valid_range' ] ) );
	}

	/**
	 * The entries in an untrusted value that {@see self::sanitize()} drops as
	 * malformed, so a screen can say which ones are being ignored rather than
	 * leave a typo to silently lift the restriction.
	 *
	 * @param mixed $raw
	 * @return list<string>
	 */
	public static function rejected( $raw ): array {
		return array_values(
			array_filter( self::entries( $raw ), static fn ( string $entry ): bool => ! self::is_valid_range( $entry ) )
		);
	}

	/**
	 * The distinct, non-empty, trimmed string entries in an untrusted value,
	 * valid or not. Anything that is not a string is dropped here: a text
	 * field cannot produce one, so there is nothing useful to report about it.
	 *
	 * @param mixed $raw
	 * @return list<string>
	 */
	private static function entries( $raw ): array {
		if ( is_string( $raw ) ) {
			$raw = preg_split( '/[\s,]+/', $raw );
		}

		if ( ! is_array( $raw ) ) {
			return [];
		}

		$entries = [];

		/** @var mixed $entry */
		foreach ( $raw as $entry ) {
			if ( ! is_string( $entry ) ) {
				continue;
			}

			$entry = trim( $entry );

			if ( '' !== $entry && ! in_array( $entry, $entries, true ) ) {
				$entries[] = $entry;
			}
		}

		return $entries;
	}

	/**
	 * Whether a packed address falls inside one range, by comparing the first
	 * `prefix` bits of the binary representations.
	 */
	private static function range_contains( string $range, string $packed_ip ): bool {
		$parts = explode( '/', $range );

		if ( false === filter_var( $parts[0], FILTER_VALIDATE_IP ) ) {
			return false;
		}

		$packed_net = inet_pton( $parts[0] );

		// Different lengths means different address families: never a match.
		if ( false === $packed_net || strlen( $packed_net ) !== strlen( $packed_ip ) ) {
			return false;
		}

		$max_bits = strlen( $packed_net ) * 8;
		$prefix   = isset( $parts[1] ) ? min( (int) $parts[1], $max_bits ) : $max_bits;

		$whole_bytes = intdiv( $prefix, 8 );
		$spare_bits  = $prefix % 8;

		if ( $whole_bytes > 0 && 0 !== substr_compare( $packed_ip, $packed_net, 0, $whole_bytes ) ) {
			return false;
		}

		if ( 0 === $spare_bits ) {
			return true;
		}

		$mask = 0xFF & ( 0xFF << ( 8 - $spare_bits ) );

		return ( ord( $packed_ip[ $whole_bytes ] ) & $mask ) === ( ord( $packed_net[ $whole_bytes ] ) & $mask );
	}
}
