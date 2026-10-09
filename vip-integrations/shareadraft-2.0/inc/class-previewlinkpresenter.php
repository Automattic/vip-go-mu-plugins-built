<?php

namespace Automattic\ShareADraft;

/**
 * Turns issued links into the client-facing shape used when listing a post's
 * preview links. Shared by the REST endpoint and the list-preview-links ability
 * so both surfaces present the same fields — and never the token itself, only its
 * hash and a short hint (the plaintext is not stored, so it cannot be shown).
 */
final class PreviewLinkPresenter {
	/**
	 * The live links for a post, as plain arrays. Expired and revoked links are
	 * dropped: they are dead clutter, not something a reviewer can still use.
	 *
	 * @param list<PreviewLink> $links Every link issued for the post.
	 * @param int               $now   Current Unix timestamp, for the expiry test.
	 * @return list<array{id: string, token_hint: string, created_at: int, expires_at: int, max_uses: int|null, use_count: int, exhausted: bool, allowed_ips: list<string>, recipients: list<string>}>
	 */
	public static function present_live_links( array $links, int $now ): array {
		$presented = [];

		foreach ( $links as $link ) {
			if ( $link->is_expired( $now ) || $link->is_revoked() ) {
				continue;
			}

			$presented[] = [
				'id'          => $link->token_hash(),
				'token_hint'  => $link->token_hint(),
				'created_at'  => $link->created_at(),
				'expires_at'  => $link->expires_at(),
				'max_uses'    => $link->max_uses(),
				'use_count'   => $link->use_count(),
				'exhausted'   => $link->is_exhausted(),
				'allowed_ips' => $link->allowed_ips(),
				'recipients'  => $link->recipients(),
			];
		}

		return $presented;
	}
}
