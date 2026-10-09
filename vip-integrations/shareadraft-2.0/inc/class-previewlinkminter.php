<?php

namespace Automattic\ShareADraft;

use WP_Error;
use WP_Post;

/**
 * Mints a preview link and packages it for a client: the shared orchestration
 * behind every way a link is created.
 *
 * Both the REST endpoint and the create-preview-link ability call {@see mint()},
 * so a link an editor mints in the block editor and one an agent mints over MCP
 * pass through exactly the same post check, URL construction, and telemetry. The
 * two adapters cannot drift: adding a rule here changes every channel at once.
 */
final class PreviewLinkMinter {
	private PreviewLinkService $service;

	public function __construct( PreviewLinkService $service ) {
		$this->service = $service;
	}

	/**
	 * Issue a link for a post and return its shareable URL and expiry.
	 *
	 * @param int          $post_id     Post to preview.
	 * @param int          $expiration  How long the link stays valid, in seconds.
	 * @param int|null     $max_uses    Maximum distinct viewers, or null for the
	 *                                  site's ceiling ({@see PreviewRestController::max_uses_limit()}),
	 *                                  which is unlimited only when there is none.
	 * @param string       $channel     How the link was requested (`rest`, `ability`).
	 *                                  Recorded as telemetry so agent-driven previews
	 *                                  are distinguishable from editor ones.
	 * @param list<string> $allowed_ips CIDR ranges to restrict the link to, or empty
	 *                                  for no per-link restriction. Validated here —
	 *                                  not silently filtered — so an author who
	 *                                  mistypes a range is told, rather than left
	 *                                  believing a restriction is in place.
	 * @param list<string> $recipients  Emails of named reviewers to bind the link
	 *                                  to, or empty for a bearer link. Validated
	 *                                  here for the same reason as the ranges.
	 * @return array{url: string, expires_at: int}|WP_Error A WP_Error when the
	 *                                  post does not exist, its type has no
	 *                                  front-end view, it is published, private,
	 *                                  or trashed, the viewer cap is out of
	 *                                  range, a range or address is invalid,
	 *                                  the restriction is disabled on
	 *                                  this site, or the link could not be saved.
	 */
	public function mint( int $post_id, int $expiration, ?int $max_uses, string $channel, array $allowed_ips = [], array $recipients = [] ) {
		$post = get_post( $post_id );

		if ( ! $post instanceof WP_Post ) {
			return new WP_Error(
				'shareadraft_invalid_post',
				__( 'The post could not be found.', 'shareadraft' ),
				[ 'status' => 404 ]
			);
		}

		// A type with no front-end view has nothing to preview: the link would
		// only ever 404. `is_post_type_viewable` is itself filterable, so a site
		// that wants a different rule changes it there, not here.
		if ( ! is_post_type_viewable( $post->post_type ) ) {
			return new WP_Error(
				'shareadraft_post_type_not_viewable',
				__( 'Preview links are only available for content that can be viewed on the site.', 'shareadraft' ),
				[ 'status' => 400 ]
			);
		}

		// A published post needs no link, and a private or trashed one must not
		// get one: the gate would refuse it anyway, so say so up front.
		if ( PublishCleanup::is_terminal( $post->post_status ) ) {
			return new WP_Error(
				'shareadraft_post_not_shareable',
				__( 'Preview links are not available for published, private, or trashed content.', 'shareadraft' ),
				[ 'status' => 400 ]
			);
		}

		// Every channel funnels through here, so the site's ceiling is
		// enforced once, whatever the caller's own schema said.
		$max_uses_limit = PreviewRestController::max_uses_limit();
		$max_uses     ??= $max_uses_limit;

		if ( null !== $max_uses && ( $max_uses < 1 || ( null !== $max_uses_limit && $max_uses > $max_uses_limit ) ) ) {
			return new WP_Error(
				'shareadraft_invalid_max_uses',
				null === $max_uses_limit
					? __( 'Maximum uses must be at least 1.', 'shareadraft' )
					: sprintf(
						/* translators: %d: the most viewers a link may allow, e.g. 1000. */
						__( 'Maximum uses must be between 1 and %d.', 'shareadraft' ),
						$max_uses_limit
					),
				[ 'status' => 400 ]
			);
		}

		$allowed_ips = array_values( array_unique( array_map( 'trim', $allowed_ips ) ) );
		$recipients  = array_values( array_unique( array_map( 'strtolower', array_map( 'trim', $recipients ) ) ) );

		// Every channel funnels through here, so a feature a site has switched
		// off is refused in one place — a caller that somehow still offers the
		// field is told no, rather than minting a restriction the UI cannot show.
		if ( [] !== $allowed_ips && ! Features::ip_allowlist_enabled() ) {
			return new WP_Error(
				'shareadraft_ip_allowlist_disabled',
				__( 'Per-link IP allowlists are disabled on this site.', 'shareadraft' ),
				[ 'status' => 400 ]
			);
		}

		if ( [] !== $recipients && ! Features::recipients_enabled() ) {
			return new WP_Error(
				'shareadraft_recipients_disabled',
				__( 'Recipient-bound preview links are disabled on this site.', 'shareadraft' ),
				[ 'status' => 400 ]
			);
		}

		foreach ( $allowed_ips as $range ) {
			if ( ! IpAllowlist::is_valid_range( $range ) ) {
				return new WP_Error(
					'shareadraft_invalid_ip_range',
					sprintf(
						/* translators: %s: the rejected input, e.g. "203.0.113.0/33" */
						__( '"%s" is not a valid IP address or CIDR range.', 'shareadraft' ),
						$range
					),
					[ 'status' => 400 ]
				);
			}
		}

		foreach ( $recipients as $recipient ) {
			if ( false === is_email( $recipient ) ) {
				return new WP_Error(
					'shareadraft_invalid_recipient',
					sprintf(
						/* translators: %s: the rejected input. */
						__( '"%s" is not a valid email address.', 'shareadraft' ),
						$recipient
					),
					[ 'status' => 400 ]
				);
			}
		}

		try {
			$token = $this->service->mint( $post_id, $expiration, $max_uses, get_current_user_id(), $allowed_ips, $recipients );
		} catch ( \RuntimeException ) {
			return new WP_Error(
				'shareadraft_link_not_saved',
				__( 'The preview link could not be saved; try again.', 'shareadraft' ),
				[ 'status' => 500 ]
			);
		}

		// Reuse WordPress's own preview URL (adds preview=true) and carry the
		// token on it, so the gate can unlock the draft for a logged-out visitor.
		$url = get_preview_post_link( $post_id, [ PreviewGate::TOKEN_QUERY_VAR => $token->value() ] );

		// Usage metadata only — never the token, content, or PII.
		// Prefixed to `shareadraft_link_created` by the Telemetry client.
		// `is_capped` keeps `max_uses` a clean integer: an uncapped link reports
		// is_capped=false with max_uses=0 rather than a null that Tracks would
		// coerce to the string "null".
		Telemetry::get_instance()->record_event(
			'link_created',
			[
				'expiration'       => $expiration,
				'is_capped'        => null !== $max_uses,
				'max_uses'         => (int) $max_uses,
				'channel'          => $channel,
				// Whether, not which: the ranges themselves stay out of Tracks.
				'has_ip_allowlist' => [] !== $allowed_ips,
				// How many, never who: addresses are PII and stay out of Tracks.
				'has_recipients'   => [] !== $recipients,
				'recipient_count'  => count( $recipients ),
			]
		);

		return [
			'url'        => (string) $url,
			'expires_at' => time() + $expiration,
		];
	}
}
