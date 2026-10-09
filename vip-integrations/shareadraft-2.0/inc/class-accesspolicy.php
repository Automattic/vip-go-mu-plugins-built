<?php

namespace Automattic\ShareADraft;

/**
 * Decides whether a presented token may view a post, given the link on record
 * and the current time.
 *
 * This is the extensibility seam for the whole feature. Each milestone plugs a
 * new rule in here (expiry, viewer cap, revocation), and every rule is a pure
 * branch that can be exhaustively unit-tested. The class has no side effects:
 * spending a slot is a separate command, run once per request by the caller,
 * not here, so that a page whose render fires several queries cannot burn its
 * own link mid-load.
 *
 * Order matters. The IP check comes first: a visitor outside the allowlist must
 * learn nothing, not even that the link once existed or has expired, so it is
 * checked before the reasons the gate is willing to explain. Revocation and
 * expiry are absolute and come next, so holding a slot never resurrects a link
 * the author killed or one that simply ran out of time. The recipient check
 * follows them, so a visitor is only invited to verify their email for a link
 * that is still alive. Only the viewer cap is relaxed for an existing
 * slot-holder.
 */
final class AccessPolicy {
	/**
	 * @var list<string> Central CIDR ranges from the VIP Dashboard config that
	 *                   apply to every link, unioned with each link's own ranges.
	 */
	private array $central_ip_ranges;

	/**
	 * @param list<string> $central_ip_ranges Central CIDR ranges applying to
	 *                                        every link. Empty when the platform
	 *                                        config carries none.
	 */
	public function __construct( array $central_ip_ranges = [] ) {
		$this->central_ip_ranges = $central_ip_ranges;
	}

	/**
	 * @param PreviewLink|null $link             The link on record for the post,
	 *                                           or null if no link matched the
	 *                                           presented token.
	 * @param int              $now              Current Unix timestamp.
	 * @param bool             $viewer_holds_slot Whether this visitor presented a
	 *                                           slot the server issued for this
	 *                                           link. Such a viewer already
	 *                                           occupies a slot, so the
	 *                                           exhaustion cap does not lock them
	 *                                           out on a revisit. Callers must
	 *                                           verify the slot's signature
	 *                                           before passing true — see
	 *                                           {@see PreviewGate}.
	 * @param string|null      $client_ip        The visitor's true client IP, or
	 *                                           null if it could not be resolved.
	 *                                           Only consulted when the combined
	 *                                           allowlist is non-empty; an
	 *                                           unresolvable IP then fails closed.
	 * @param string|null      $verified_email   The email this visitor has proved
	 *                                           control of, or null if unverified.
	 *                                           Callers must only pass an address
	 *                                           backed by a completed verification
	 *                                           — see
	 *                                           {@see RecipientVerifier::verified_email()}.
	 *                                           Only consulted when the link is
	 *                                           bound to recipients.
	 */
	public function decide( ?PreviewLink $link, int $now, bool $viewer_holds_slot = false, ?string $client_ip = null, ?string $verified_email = null ): AccessDecision {
		if ( null === $link ) {
			return AccessDecision::deny( AccessDecision::REASON_NOT_FOUND );
		}

		// Union of the central baseline and the link's own ranges; either side
		// may be empty. No ranges at all means no IP restriction.
		$ranges = [ ...$this->central_ip_ranges, ...$link->allowed_ips() ];

		if ( [] !== $ranges && ( null === $client_ip || ! IpAllowlist::matches( $client_ip, $ranges ) ) ) {
			return AccessDecision::deny( AccessDecision::REASON_IP_BLOCKED );
		}

		if ( $link->is_revoked() ) {
			return AccessDecision::deny( AccessDecision::REASON_REVOKED );
		}

		if ( $link->is_expired( $now ) ) {
			return AccessDecision::deny( AccessDecision::REASON_EXPIRED );
		}

		if ( [] !== $link->recipients() && ( null === $verified_email || ! $link->is_recipient( $verified_email ) ) ) {
			return AccessDecision::deny( AccessDecision::REASON_EMAIL_UNVERIFIED );
		}

		if ( $link->is_exhausted() && ! $viewer_holds_slot ) {
			return AccessDecision::deny( AccessDecision::REASON_EXHAUSTED );
		}

		return AccessDecision::allow();
	}
}
