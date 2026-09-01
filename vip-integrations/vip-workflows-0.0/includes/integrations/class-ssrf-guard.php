<?php
/**
 * SSRF Guard - URL validation against egress allowlist + private-IP block list.
 *
 * Used by paths that fetch attacker-influenced URLs (currently the AI image
 * upload path). Validation is two-step to defeat DNS rebinding: hostname must
 * be in the allowlist, AND every IP it resolves to must be a public unicast
 * address.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use WP_Error;

/**
 * URL validator for outbound fetches.
 */
class SsrfGuard {

	/**
	 * Approved egress hostnames for AI-image fetches.
	 *
	 * Limited to AI provider endpoints that can serve user-generated images
	 * (OpenAI hosts for DALL-E / gpt-image). Adding a new domain is a
	 * security-review change.
	 */
	public const DEFAULT_ALLOWED_HOSTS = array(
		'oaidalleapiprodscus.blob.core.windows.net',
		'cdn.openai.com',
		'files.openai.com',
	);

	/**
	 * Validate a URL for outbound fetch.
	 *
	 * @param string        $url           URL to validate.
	 * @param array<string> $allowed_hosts Allowed hostnames (case-insensitive,
	 *                                     exact match or subdomain of). Empty
	 *                                     array uses DEFAULT_ALLOWED_HOSTS.
	 * @return true|WP_Error True if the URL is safe to fetch; WP_Error otherwise.
	 */
	public static function validate( string $url, array $allowed_hosts = array() ) {
		if ( '' === trim( $url ) ) {
			return new WP_Error( 'ssrf_empty_url', 'URL is empty.' );
		}

		$parts = wp_parse_url( $url );
		if ( false === $parts || empty( $parts['scheme'] ) ) {
			return new WP_Error( 'ssrf_invalid_url', 'URL is malformed.' );
		}

		$scheme = strtolower( $parts['scheme'] );
		if ( 'http' !== $scheme && 'https' !== $scheme ) {
			return new WP_Error( 'ssrf_bad_scheme', sprintf( 'Scheme %s is not allowed.', $scheme ) );
		}

		if ( empty( $parts['host'] ) ) {
			return new WP_Error( 'ssrf_invalid_url', 'URL is missing host.' );
		}

		$host = strtolower( $parts['host'] );
		// parse_url keeps IPv6 brackets in the host — strip for consistent matching.
		if ( '' !== $host && '[' === $host[0] && ']' === substr( $host, -1 ) ) {
			$host = substr( $host, 1, -1 );
		}

		$allowed = empty( $allowed_hosts ) ? self::DEFAULT_ALLOWED_HOSTS : $allowed_hosts;
		if ( ! self::host_is_allowed( $host, $allowed ) ) {
			return new WP_Error( 'ssrf_host_not_allowed', sprintf( 'Host %s is not in the egress allowlist.', $host ) );
		}

		$ips = self::resolve_host( $host );
		if ( empty( $ips ) ) {
			return new WP_Error( 'ssrf_unresolvable', sprintf( 'Host %s did not resolve to any IP.', $host ) );
		}

		foreach ( $ips as $ip ) {
			if ( ! self::ip_is_public_unicast( $ip ) ) {
				return new WP_Error(
					'ssrf_private_ip',
					sprintf( 'Host %s resolves to a non-public address (%s).', $host, $ip )
				);
			}
		}

		return true;
	}

	/**
	 * Validate a URL for open-internet fetches (no allowlist required).
	 *
	 * Suitable for user-supplied URLs that can reach any public host, such as
	 * the URL-metadata and content-extract paths. Unlike validate(), does not
	 * check the host against an allowlist. Still rejects:
	 *  - non-http/https schemes
	 *  - hosts that resolve to private / reserved IP ranges (RFC 1918, loopback,
	 *    link-local, multicast, etc.) — defeating DNS-rebinding attacks
	 *
	 * @param string $url URL to validate.
	 * @return true|WP_Error True if safe to fetch; WP_Error otherwise.
	 */
	public static function validate_open_internet( string $url ) {
		if ( '' === trim( $url ) ) {
			return new WP_Error( 'ssrf_empty_url', 'URL is empty.' );
		}

		$parts = wp_parse_url( $url );
		if ( false === $parts || empty( $parts['scheme'] ) ) {
			return new WP_Error( 'ssrf_invalid_url', 'URL is malformed.' );
		}

		$scheme = strtolower( $parts['scheme'] );
		if ( 'http' !== $scheme && 'https' !== $scheme ) {
			return new WP_Error( 'ssrf_bad_scheme', sprintf( 'Scheme %s is not allowed.', $scheme ) );
		}

		if ( empty( $parts['host'] ) ) {
			return new WP_Error( 'ssrf_invalid_url', 'URL is missing host.' );
		}

		$host = strtolower( $parts['host'] );
		if ( '' !== $host && '[' === $host[0] && ']' === substr( $host, -1 ) ) {
			$host = substr( $host, 1, -1 );
		}

		$ips = self::resolve_host( $host );
		if ( empty( $ips ) ) {
			return new WP_Error( 'ssrf_unresolvable', sprintf( 'Host %s did not resolve to any IP.', $host ) );
		}

		foreach ( $ips as $ip ) {
			if ( ! self::ip_is_public_unicast( $ip ) ) {
				return new WP_Error(
					'ssrf_private_ip',
					sprintf( 'Host %s resolves to a non-public address (%s).', $host, $ip )
				);
			}
		}

		return true;
	}

	/**
	 * Validate and fetch an open-internet URL with HTTP redirects disabled.
	 *
	 * Designed for the URL-metadata and content-extract paths where any public
	 * URL must be reachable but private networks must be blocked. Wraps
	 * wp_safe_remote_get() with two invariants:
	 * 1. validate_open_internet() passes (scheme + DNS/IP range check, no allowlist).
	 * 2. redirection => 0 is forced via a scoped http_request_args filter so
	 *    a server cannot 30x to a private-IP target after passing validation —
	 *    defeating DNS-rebinding via redirect chains.
	 *
	 * Rejections are logged; the URL is omitted from the log to avoid leaking
	 * attacker-controlled payloads.
	 *
	 * @param string $url         URL to fetch.
	 * @param array  $args        Extra args merged into wp_safe_remote_get().
	 * @param string $log_context Caller label included in the rejection log line.
	 * @return array|WP_Error WP HTTP response array or WP_Error.
	 */
	public static function remote_get_validated( string $url, array $args = array(), string $log_context = '' ) {
		$validation = self::validate_open_internet( $url );
		if ( is_wp_error( $validation ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- SSRF rejection audit logging.
			error_log(
				sprintf(
					'[vip-workflows]%s URL rejected by SSRF guard: %s (%s)',
					'' === $log_context ? '' : ' ' . $log_context,
					$validation->get_error_code(),
					$validation->get_error_message()
				)
			);
			return $validation;
		}

		// Force redirection=0 for every request in this scoped try/finally block.
		// No URL-equality check — the filter is already scoped by add/remove_filter
		// around a single wp_safe_remote_get call, so it can safely apply globally.
		// A URL-string comparison would silently fail if WP normalises the URL before
		// firing http_request_args, leaving redirect-chain SSRF protection disabled.
		$filter = static function ( $request_args ) {
			$request_args['redirection'] = 0;
			return $request_args;
		};

		add_filter( 'http_request_args', $filter, PHP_INT_MAX, 2 );
		try {
			return wp_safe_remote_get( $url, $args );
		} finally {
			remove_filter( 'http_request_args', $filter, PHP_INT_MAX );
		}
	}

	/**
	 * Validate and fetch an allowlisted URL with HTTP redirects disabled.
	 *
	 * Use this for URLs that must point at a known provider host, including URLs
	 * returned by that provider's API before a follow-up fetch.
	 *
	 * @param string        $url           URL to fetch.
	 * @param array         $args          Extra args merged into wp_safe_remote_get().
	 * @param string        $log_context   Caller label included in the rejection log line.
	 * @param array<string> $allowed_hosts Allowed hostnames for this callsite.
	 * @return array|WP_Error WP HTTP response array or WP_Error.
	 */
	public static function remote_get_allowlisted( string $url, array $args = array(), string $log_context = '', array $allowed_hosts = array() ) {
		return self::remote_request_allowlisted( 'GET', $url, $args, $log_context, $allowed_hosts );
	}

	/**
	 * Validate and post to an allowlisted URL with HTTP redirects disabled.
	 *
	 * Use this for administrator-configured webhook destinations that should
	 * only ever target a known provider host.
	 *
	 * @param string        $url           URL to post to.
	 * @param array         $args          Extra args merged into wp_safe_remote_post().
	 * @param string        $log_context   Caller label included in the rejection log line.
	 * @param array<string> $allowed_hosts Allowed hostnames for this callsite.
	 * @return array|WP_Error WP HTTP response array or WP_Error.
	 */
	public static function remote_post_allowlisted( string $url, array $args = array(), string $log_context = '', array $allowed_hosts = array() ) {
		return self::remote_request_allowlisted( 'POST', $url, $args, $log_context, $allowed_hosts );
	}

	/**
	 * Validate and download a URL with HTTP redirects disabled.
	 *
	 * Safe entry point for the AI image fetch path. Two invariants:
	 * 1. The URL passes validate() (allowlist + post-resolve IP block list).
	 * 2. `redirection => 0` is forced on the HTTP request via an
	 *    `http_request_args` filter scoped by the surrounding add/remove_filter
	 *    block (not by URL matching), so an allowlisted host cannot 30x to a
	 *    private target — a redirect response surfaces as an error instead
	 *    of being followed.
	 *
	 * Rejections from validate() are logged via error_log; the URL itself is
	 * omitted to avoid leaking attacker payloads. Download failures (network,
	 * 30x, etc.) are returned as WP_Error without logging.
	 *
	 * @param string        $url           URL to fetch.
	 * @param int           $timeout       Request timeout in seconds.
	 * @param string        $log_context   Caller label included in the rejection log line.
	 * @param array<string> $allowed_hosts Override allowlist (empty uses DEFAULT_ALLOWED_HOSTS).
	 * @return string|WP_Error Path to the downloaded temp file, or WP_Error.
	 */
	public static function download_validated_no_redirects( string $url, int $timeout = 300, string $log_context = '', array $allowed_hosts = array() ) {
		$validation = self::validate( $url, $allowed_hosts );
		if ( is_wp_error( $validation ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- SSRF rejection audit logging.
			error_log(
				sprintf(
					'[vip-workflows]%s URL rejected by SSRF guard: %s (%s)',
					'' === $log_context ? '' : ' ' . $log_context,
					$validation->get_error_code(),
					$validation->get_error_message()
				)
			);
			return $validation;
		}

		if ( ! function_exists( 'download_url' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		// Force redirection=0 for every request in this scoped try/finally block.
		// No URL-equality check — the filter is already scoped by add/remove_filter
		// around a single download_url call, so it can safely apply globally. A
		// URL-string comparison would silently fail if WP normalises the URL before
		// firing http_request_args, leaving redirect-chain SSRF protection disabled.
		$filter = static function ( $request_args ) {
			$request_args['redirection'] = 0;
			return $request_args;
		};

		add_filter( 'http_request_args', $filter, PHP_INT_MAX, 2 );
		try {
			return \download_url( $url, $timeout );
		} finally {
			remove_filter( 'http_request_args', $filter, PHP_INT_MAX );
		}
	}

	/**
	 * Check whether $host matches any allowlist entry.
	 *
	 * Match is exact-host or subdomain-of (e.g. "files.openai.com" matches
	 * "openai.com"). Hostnames are compared case-insensitively.
	 *
	 * @param string        $host    Lowercased hostname under test.
	 * @param array<string> $allowed Allowlist of bare hostnames.
	 */
	private static function host_is_allowed( string $host, array $allowed ): bool {
		foreach ( $allowed as $entry ) {
			$entry = strtolower( trim( $entry ) );
			if ( '' === $entry ) {
				continue;
			}
			if ( $host === $entry ) {
				return true;
			}
			$suffix = '.' . $entry;
			if ( substr( $host, -strlen( $suffix ) ) === $suffix ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Validate and perform a scoped no-redirect allowlisted HTTP request.
	 *
	 * @param string        $method        HTTP method.
	 * @param string        $url           URL to request.
	 * @param array         $args          Request args.
	 * @param string        $log_context   Caller label for rejection logging.
	 * @param array<string> $allowed_hosts Allowed hostnames for this callsite.
	 * @return array|WP_Error WP HTTP response array or WP_Error.
	 */
	private static function remote_request_allowlisted( string $method, string $url, array $args, string $log_context, array $allowed_hosts ) {
		$normalized_method = strtoupper( $method );
		if ( 'GET' !== $normalized_method && 'POST' !== $normalized_method ) {
			return new WP_Error( 'ssrf_unsupported_method', 'Allowlisted requests support only GET and POST.' );
		}

		if ( empty( $allowed_hosts ) ) {
			return new WP_Error( 'ssrf_no_allowlist', 'Allowlisted requests require at least one allowed host.' );
		}

		$validation = self::validate( $url, $allowed_hosts );
		if ( is_wp_error( $validation ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- SSRF rejection audit logging.
			error_log(
				sprintf(
					'[vip-workflows]%s URL rejected by SSRF guard: %s (%s)',
					'' === $log_context ? '' : ' ' . $log_context,
					$validation->get_error_code(),
					$validation->get_error_message()
				)
			);
			return $validation;
		}

		$filter = static function ( $request_args ) {
			$request_args['redirection'] = 0;
			return $request_args;
		};

		add_filter( 'http_request_args', $filter, PHP_INT_MAX, 2 );
		try {
			if ( 'POST' === $normalized_method ) {
				return wp_safe_remote_post( $url, $args );
			}

			return wp_safe_remote_get( $url, $args );
		} finally {
			remove_filter( 'http_request_args', $filter, PHP_INT_MAX );
		}
	}

	/**
	 * Resolve a hostname to all A/AAAA addresses.
	 *
	 * If $host is already an IP literal, returns it as-is. Otherwise uses
	 * dns_get_record (preferred over gethostbyname so we see every record,
	 * not just the first one — important against DNS-rebinding).
	 *
	 * @param string $host Host name.
	 * @return array<string> List of IP literals (may be empty on failure).
	 */
	private static function resolve_host( string $host ): array {
		if ( filter_var( $host, FILTER_VALIDATE_IP ) ) {
			return array( $host );
		}

		$ips = array();
		if ( function_exists( 'dns_get_record' ) ) {
			$a    = @dns_get_record( $host, DNS_A );
			$aaaa = @dns_get_record( $host, DNS_AAAA );
			foreach ( (array) $a as $row ) {
				if ( ! empty( $row['ip'] ) ) {
					$ips[] = $row['ip'];
				}
			}
			foreach ( (array) $aaaa as $row ) {
				if ( ! empty( $row['ipv6'] ) ) {
					$ips[] = $row['ipv6'];
				}
			}
		}

		if ( empty( $ips ) ) {
			$resolved = @gethostbynamel( $host );
			if ( is_array( $resolved ) ) {
				$ips = $resolved;
			}
		}

		return array_values( array_unique( $ips ) );
	}

	/**
	 * Determine whether $ip is a public unicast address.
	 *
	 * Rejects: RFC1918 private (10/8, 172.16/12, 192.168/16), loopback
	 * (127/8, ::1), link-local (169.254/16, fe80::/10), multicast,
	 * 0.0.0.0/8, broadcast, IPv4-mapped/compatible IPv6, IPv6 ULA (fc00::/7),
	 * and "reserved" ranges flagged by PHP's filter.
	 *
	 * @param string $ip IP address.
	 */
	private static function ip_is_public_unicast( string $ip ): bool {
		if ( ! filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			return false;
		}

		$public = filter_var(
			$ip,
			FILTER_VALIDATE_IP,
			FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
		);
		if ( false === $public ) {
			return false;
		}

		if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 ) ) {
			$packed = inet_pton( $ip );
			if ( false === $packed ) {
				return false;
			}
			$first = ord( $packed[0] );
			// 0.0.0.0/8 and 224.0.0.0/4 (multicast) and 240.0.0.0/4 (reserved).
			if ( 0 === $first || $first >= 224 ) {
				return false;
			}
			if ( '255.255.255.255' === $ip ) {
				return false;
			}
			return true;
		}

		if ( filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6 ) ) {
			$packed = inet_pton( $ip );
			if ( false === $packed || strlen( $packed ) !== 16 ) {
				return false;
			}
			$first = ord( $packed[0] );
			// Multicast: ff00::/8.
			if ( 0xff === $first ) {
				return false;
			}
			// Unique local: fc00::/7 (first byte 0xfc or 0xfd).
			if ( 0xfc === $first || 0xfd === $first ) {
				return false;
			}
			// Link-local: fe80::/10 (first byte 0xfe, top two bits of byte[1] = 10).
			if ( 0xfe === $first && ( ord( $packed[1] ) & 0xc0 ) === 0x80 ) {
				return false;
			}
			// ::1 (loopback) and :: (unspecified) — covered by NO_RES_RANGE on
			// most PHP builds, but enforce explicitly.
			if ( '::1' === inet_ntop( $packed ) || '::' === inet_ntop( $packed ) ) {
				return false;
			}
			// IPv4-mapped (::ffff:0:0/96) and IPv4-compatible (::/96) — refuse
			// to resolve embedded IPv4 here; if you want IPv4, send IPv4.
			$zero_prefix = str_repeat( "\0", 10 );
			if ( substr( $packed, 0, 10 ) === $zero_prefix ) {
				return false;
			}
			// NAT64 well-known prefix 64:ff9b::/96 embeds IPv4 addresses — an
			// attacker can encode a private IPv4 (e.g. 169.254.169.254) in an
			// IPv6 literal that would otherwise pass all IPv6 range checks.
			// PHP does not flag this range as private, so we check explicitly.
			if ( substr( $packed, 0, 4 ) === "\x00\x64\xff\x9b" && substr( $packed, 4, 8 ) === "\x00\x00\x00\x00\x00\x00\x00\x00" ) {
				return false;
			}
			return true;
		}

		return false;
	}
}
