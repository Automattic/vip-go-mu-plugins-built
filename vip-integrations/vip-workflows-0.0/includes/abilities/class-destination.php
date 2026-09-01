<?php
/**
 * Where an unmet requirement can be satisfied.
 *
 * A tagged value rather than an optional URL string, because all three kinds
 * genuinely occur: a credential entered on an admin screen, a setting entered in
 * the agent's own card, and a requirement with no UI at all (a `wp-config.php`
 * constant, or a third-party provider that never registered a destination).
 * Handing callers a bare URL guarantees at least one dead or misleading link.
 *
 * @package VIPWorkflows\Abilities
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * A tagged destination for an unmet requirement.
 */
final class Destination {

	/**
	 * Satisfied on a WordPress admin screen.
	 */
	public const KIND_ADMIN_URL = 'admin_url';

	/**
	 * Satisfied by the settings fields rendered in the agent's own card.
	 */
	public const KIND_IN_CARD = 'in_card';

	/**
	 * No UI destination exists; the hint names what to set instead.
	 */
	public const KIND_NONE = 'none';

	/**
	 * Destination kind (one of the KIND_* constants).
	 *
	 * @var string
	 */
	private string $kind;

	/**
	 * Absolute URL. Empty for every kind but KIND_ADMIN_URL.
	 *
	 * @var string
	 */
	private string $url;

	/**
	 * Human-readable link label. Empty when there is no URL.
	 *
	 * @var string
	 */
	private string $label;

	/**
	 * Instruction shown when there is nowhere to link.
	 *
	 * @var string
	 */
	private string $hint;

	/**
	 * External URL where the credentials this requirement wants can be obtained.
	 *
	 * @var string
	 */
	private string $credentials_url;

	/**
	 * Use the named constructors instead.
	 *
	 * @param string $kind            Destination kind.
	 * @param string $url             Absolute URL, or ''.
	 * @param string $label           Link label, or ''.
	 * @param string $hint            Instruction text, or ''.
	 * @param string $credentials_url External sign-up URL, or ''.
	 */
	private function __construct( string $kind, string $url, string $label, string $hint, string $credentials_url = '' ) {
		$this->kind            = $kind;
		$this->url             = $url;
		$this->label           = $label;
		$this->hint            = $hint;
		$this->credentials_url = $credentials_url;
	}

	/**
	 * Protocol-filter a URL on its way into a destination.
	 *
	 * Requirement authoring is a documented third-party surface and every URL a
	 * destination carries ends up in a React `href`, so a `javascript:` or `data:`
	 * value would be a stored-XSS vector reachable from an extension.
	 * `esc_url_raw()` returns '' for any protocol outside WordPress's whitelist,
	 * and the renderer already requires a truthy URL before it emits a `Link` — so
	 * a rejected URL degrades to the no-anchor path with no new branch.
	 *
	 * `esc_url_raw()` rather than `esc_url()`: both apply the same protocol
	 * whitelist, but `esc_url()` also entity-encodes `&` for HTML output, which
	 * would corrupt a multi-parameter URL on its way through JSON into a React
	 * `href`.
	 *
	 * The caller names itself so the notice points at the public named constructor
	 * the author actually called rather than at this private helper.
	 *
	 * @param  string $url    Candidate URL.
	 * @param  string $method Calling method, for the diagnostic.
	 * @return string The URL, or '' when its protocol is not allowed.
	 */
	private static function filter_url( string $url, string $method ): string {
		$safe_url = esc_url_raw( $url );

		if ( '' !== $url && '' === $safe_url ) {
			_doing_it_wrong(
				// Always a `__METHOD__` from this class, but `_doing_it_wrong()`
				// echoes it, so escape rather than exempt the sniff.
				esc_html( $method ),
				sprintf(
					'A requirement destination supplied the URL "%s", whose protocol is not allowed. It has been dropped; the requirement will render its hint instead of a link.',
					esc_html( $url )
				),
				'1.0.0'
			);
		}

		return $safe_url;
	}

	/**
	 * A destination the user reaches on an admin screen.
	 *
	 * @since 0.0.1
	 *
	 * The hint restates the destination as a sentence, for surfaces that render
	 * flat text instead of a link. A surface that renders the link should not also
	 * render the hint — that says the same thing twice.
	 *
	 * The URL is protocol-filtered on the way in — see `filter_url()` for why.
	 *
	 * @param  string $url   Absolute admin URL.
	 * @param  string $label Link label (e.g. "Settings → Connectors").
	 * @param  string $hint  Same instruction as a sentence, for flat-text consumers.
	 * @return self
	 */
	public static function admin_url( string $url, string $label, string $hint = '' ): self {
		return new self( self::KIND_ADMIN_URL, self::filter_url( $url, __METHOD__ ), $label, $hint );
	}

	/**
	 * A destination satisfied by the agent card's own settings fields.
	 *
	 * @since 0.0.1
	 *
	 * The optional credentials URL says where to *obtain* the values the card's
	 * fields want, which is a different question from where to enter them. It is a
	 * second, optional argument rather than a fourth destination kind because the
	 * two answers coexist: the fields are still the place to type, so the kind must
	 * stay `in_card` and the sign-up link is an extra affordance beside it, not a
	 * replacement destination. A general external-URL kind would also overlap
	 * `admin_url` and invite arbitrary links, where "where to obtain credentials"
	 * is the one semantic worth carrying.
	 *
	 * The field borrows its name from core's connector API
	 * (`wp-includes/connectors.php`), which pairs `method: 'api_key'` with a
	 * `credentials_url`. A service authenticating with anything core does not model
	 * — Foresight News signs in with email and password — cannot be a connector and
	 * so lands here instead, and naming the field identically means the two shapes
	 * converge if core ever grows a username/password method.
	 *
	 * Protocol-filtered like every other destination URL; see `filter_url()`.
	 *
	 * @param  string $hint            Instruction pointing at the fields.
	 * @param  string $credentials_url External URL where the credentials can be obtained.
	 * @return self
	 */
	public static function in_card( string $hint, string $credentials_url = '' ): self {
		return new self( self::KIND_IN_CARD, '', '', $hint, self::filter_url( $credentials_url, __METHOD__ ) );
	}

	/**
	 * No UI destination — the hint names what to set instead.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $hint Instruction (e.g. naming a wp-config.php constant).
	 * @return self
	 */
	public static function none( string $hint = '' ): self {
		return new self( self::KIND_NONE, '', '', $hint );
	}

	/**
	 * Get the destination kind.
	 *
	 * @since 0.0.1
	 *
	 * @return string One of the KIND_* constants.
	 */
	public function get_kind(): string {
		return $this->kind;
	}

	/**
	 * Get the absolute URL.
	 *
	 * @since 0.0.1
	 *
	 * @return string Empty unless the kind is KIND_ADMIN_URL.
	 */
	public function get_url(): string {
		return $this->url;
	}

	/**
	 * Get the link label.
	 *
	 * @since 0.0.1
	 *
	 * @return string Empty when there is no URL.
	 */
	public function get_label(): string {
		return $this->label;
	}

	/**
	 * Get the instruction text.
	 *
	 * @since 0.0.1
	 *
	 * @return string Empty when the destination is a link.
	 */
	public function get_hint(): string {
		return $this->hint;
	}

	/**
	 * Get the external URL where the credentials can be obtained.
	 *
	 * @since 0.0.1
	 *
	 * @return string Empty when no sign-up URL was supplied.
	 */
	public function get_credentials_url(): string {
		return $this->credentials_url;
	}

	/**
	 * Serialize for an API response.
	 *
	 * Only ever reached through the admin message register — the user register
	 * omits destinations entirely so no admin URL can leak to a reader who
	 * cannot act on it. The credentials URL rides inside this shape for the same
	 * reason it belongs to the destination and not to the requirement: obtaining
	 * credentials is an administrator's job, so it must inherit that one gate
	 * rather than needing a second rule of its own.
	 *
	 * @since 0.0.1
	 *
	 * @return array<string, string>
	 */
	public function to_array(): array {
		return array(
			'kind'            => $this->kind,
			'url'             => $this->url,
			'label'           => $this->label,
			'hint'            => $this->hint,
			'credentials_url' => $this->credentials_url,
		);
	}
}
