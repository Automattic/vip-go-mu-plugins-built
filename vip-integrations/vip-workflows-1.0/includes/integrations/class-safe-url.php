<?php
/**
 * Safe URL - scheme allowlist for URLs that arrive in a provider payload.
 *
 * A URL in a research agent's cards, or in the story prompt an editor selects,
 * is stored and later rendered as a link or image target. The scheme is the
 * part that decides what activating that link does, so it is checked here,
 * before the value is stored, against the only two schemes such a URL has a
 * reason to carry.
 *
 * This is one of two layers. The admin screens check the scheme again when
 * they render (`src/common/safe-url.js`), against a wider list: `mailto:`,
 * `tel:` and relative URLs pass there. That guard also serves links this class
 * never sees — the ones in a discovery provider's `recommend` and `search`
 * answers, and the ones stored before this check existed.
 *
 * A source an editor adds by its URL comes through here too, before its
 * identity is derived or its address fetched, so an address that is refused
 * for a card is refused for a manual source, and one that is accepted gives
 * both the same identity.
 *
 * An address that WordPress itself made for a card — the file of a generated
 * image, a post in the archive — is the one kind that can be valid without a
 * scheme or a host, on a site that is set up that way. `site_http_or_null()`
 * completes it from the address of the site, and then applies the same check.
 *
 * Hand-written rather than `esc_url_raw()`, which keeps a relative URL and
 * rewrites the ones it accepts. A card's stored identity is derived from its
 * URL, so a rewritten URL would give a card that is already stored a second
 * row.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

/**
 * Scheme allowlist for stored URLs.
 */
class SafeUrl {

	/**
	 * Reduce a value to a web address, or to nothing.
	 *
	 * Only a value that starts with `http://` or `https://` and names a host is
	 * returned, so a value in any other scheme is refused however it is written:
	 * there is no list of bad schemes for a variant spelling to get past. An
	 * address with an empty or malformed authority (`https://`, `http://?x=1`)
	 * is refused as well: it would be stored as a link that cannot resolve.
	 *
	 * What the normalization decides is which web addresses are accepted. Before
	 * it reads the scheme, a browser discards C0 control characters and spaces
	 * from both ends of a URL, and tabs and newlines from anywhere in it, so
	 * `" https://example.com"` and `"ht\ntps://example.com"` are web addresses to
	 * a browser. The same is done here first, and the normalized form is what is
	 * returned: the value that was checked is the value that is stored, and a
	 * browser reads it as it read the original.
	 *
	 * Returns null rather than an empty string for a rejected value: the caller
	 * stores the result as a field, and a field that holds nothing is null.
	 *
	 * @param mixed $value Candidate URL. A payload is decoded JSON, so any type can arrive.
	 * @return string|null The address when it is absolute `http` or `https` with a host, null otherwise.
	 */
	public static function http_or_null( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$url = self::as_a_browser_reads_it( $value );

		if ( 1 !== preg_match( '#^https?://#i', $url ) ) {
			return null;
		}

		return self::has_a_host( $url ) ? $url : null;
	}

	/**
	 * Reduce an address that this site made to a web address, or to nothing.
	 *
	 * WordPress makes the address of an attachment or of a post from the site's
	 * own settings, and a site can be set up so that the address has no scheme
	 * (`//cdn.example.com/a.png`) or no host (`/wp-content/uploads/a.png`). A
	 * browser completes such an address from the page that shows it. A stored
	 * card has no page, and http_or_null() refuses an address that is not
	 * absolute, so the address is completed here first, from the address of the
	 * site: its scheme for the first form, its scheme and host for the second.
	 *
	 * Only for an address that WordPress made. In a provider's payload a
	 * relative address is a path on the provider's site, and completed from this
	 * site's address it would become a link into this site.
	 *
	 * A path with no leading slash is not completed: it is relative to a page,
	 * and there is none. A site address that is not absolute `http` or `https`
	 * completes nothing, and the value is then checked as it is.
	 *
	 * @param mixed  $value    Address from WordPress. `false` is how WordPress says there is none.
	 * @param string $site_url Address of the site, as `site_url()` or `home_url()` returns it.
	 * @return string|null The address when it is, or was made, absolute `http` or `https`; null otherwise.
	 */
	public static function site_http_or_null( $value, string $site_url ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$url = self::as_a_browser_reads_it( $value );

		if ( 1 === preg_match( '#^(https?:)//[^/?\#]+#i', self::as_a_browser_reads_it( $site_url ), $site ) ) {
			if ( str_starts_with( $url, '//' ) ) {
				$url = $site[1] . $url;
			} elseif ( str_starts_with( $url, '/' ) ) {
				$url = $site[0] . $url;
			}
		}

		return self::http_or_null( $url );
	}

	/**
	 * Whether a web address names a host that a link can reach.
	 *
	 * The scheme alone does not make an address: `https://`, `https:///`,
	 * `http://?x=1` and `https://:80` start the right way and name no host, so
	 * they are stored as links that lead nowhere. `wp_parse_url()` returns false
	 * for an authority it cannot read, and no host for one that is empty.
	 *
	 * A host that parses is then checked for the characters that cannot appear
	 * in one (the forbidden host code points of the URL standard): a space, a
	 * control character, or a delimiter such as `<` or `|` means the value is
	 * not an address. An IPv6 literal is bracketed, and is checked as one.
	 * Characters outside ASCII pass, so an internationalized host is kept.
	 *
	 * @param string $url Address that starts with `http://` or `https://`.
	 * @return bool
	 */
	private static function has_a_host( string $url ): bool {
		$parts = wp_parse_url( $url );

		if ( ! is_array( $parts ) || empty( $parts['scheme'] ) || ! isset( $parts['host'] ) ) {
			return false;
		}

		if ( ! in_array( strtolower( $parts['scheme'] ), array( 'http', 'https' ), true ) ) {
			return false;
		}

		$host = (string) $parts['host'];

		if ( str_starts_with( $host, '[' ) ) {
			return 1 === preg_match( '#^\[[0-9a-f:.]+\]$#i', $host );
		}

		return 1 === preg_match( '#^[^\x00-\x20\x7f\#%/:<>?@\[\\\\\]^|"\'`{}]+$#', $host );
	}

	/**
	 * A URL without the characters a browser discards before it parses one.
	 *
	 * @param string $value URL as written.
	 * @return string
	 */
	private static function as_a_browser_reads_it( string $value ): string {
		$url = trim( $value, "\x00..\x20" );

		return str_replace( array( "\t", "\n", "\r" ), '', $url );
	}
}
