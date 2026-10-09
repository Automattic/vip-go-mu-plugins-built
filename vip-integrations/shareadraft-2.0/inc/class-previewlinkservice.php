<?php

namespace Automattic\ShareADraft;

/**
 * Application service: the one entry point the WordPress adapters call.
 *
 * The REST endpoint calls {@see PreviewLinkService::mint()} to issue a link; the
 * request-time gate calls {@see PreviewLinkService::authorize()} to decide
 * whether a visitor may see a draft, and {@see PreviewLinkService::claim_slot()}
 * to spend one of its viewer slots. All the collaborators are injected, so the
 * service is exercised in unit tests against an in-memory repository and a frozen
 * clock, with no WordPress and no database.
 */
final class PreviewLinkService {
	/**
	 * How many times to re-read and retry a slot claim that lost a write race.
	 * Each attempt only loses to a *different* visitor genuinely claiming a slot,
	 * so a handful is ample; the cap stops a pathological loop.
	 */
	private const CLAIM_ATTEMPTS = 5;

	/** Links fetched per page when walking the site-wide listing. */
	private const LISTING_PAGE_SIZE = 100;

	private TokenRepository $repository;
	private AccessPolicy $policy;
	private Clock $clock;

	public function __construct(
		TokenRepository $repository,
		AccessPolicy $policy,
		Clock $clock
	) {
		$this->repository = $repository;
		$this->policy     = $policy;
		$this->clock      = $clock;
	}

	/**
	 * Issue a preview link for a post and return the plaintext token.
	 *
	 * The returned token is the only moment the secret exists outside the URL;
	 * the persisted record keeps only its hash. The caller (the REST adapter)
	 * builds the shareable URL from the post ID and this token.
	 *
	 * @param int          $post_id     Post to preview.
	 * @param int          $ttl_seconds How long the link stays valid, in seconds.
	 * @param int|null     $max_uses    Maximum distinct viewers, or null for unlimited.
	 * @param int          $created_by  ID of the user issuing the link.
	 * @param list<string> $allowed_ips CIDR ranges to restrict the link to, or
	 *                                  empty for no per-link restriction.
	 * @param list<string> $recipients  Lowercased emails of named reviewers to
	 *                                  bind the link to, or empty for a bearer
	 *                                  link anyone holding the URL may use.
	 * @throws \RuntimeException When the link could not be stored, so a caller
	 *                           never hands out a URL that will not open.
	 */
	public function mint( int $post_id, int $ttl_seconds, ?int $max_uses, int $created_by, array $allowed_ips = [], array $recipients = [] ): Token {
		$token = Token::generate();
		$now   = $this->clock->now();

		$saved = $this->repository->save(
			PreviewLink::issue(
				$post_id,
				$token,
				$now + $ttl_seconds,
				$max_uses,
				$created_by,
				$now,
				$allowed_ips,
				$recipients
			)
		);

		if ( ! $saved ) {
			throw new \RuntimeException( 'The preview link could not be saved.' );
		}

		return $token;
	}

	/**
	 * Every link issued for a post, for listing in the editor.
	 *
	 * @return list<PreviewLink>
	 */
	public function list_for_post( int $post_id ): array {
		return $this->repository->all_for_post( $post_id );
	}

	/**
	 * Revoke a link by its token hash. Returns false if no live link matched,
	 * or the revocation could not be written, so the caller never reports a
	 * link as revoked while it still works.
	 */
	public function revoke( int $post_id, string $token_hash ): bool {
		$link = $this->repository->find_by_hash( $post_id, $token_hash );

		if ( null === $link || $link->is_revoked() ) {
			return false;
		}

		return $this->repository->revoke( $link, $this->clock->now() );
	}

	/**
	 * Revoke every not-yet-revoked link on a post, returning how many were
	 * revoked. One per-post step of the site-wide break-glass sweep.
	 */
	public function revoke_all_for_post( int $post_id ): int {
		return $this->repository->revoke_all_for_post( $post_id, $this->clock->now() );
	}

	/**
	 * Revoke every active link on a post, returning how many were revoked.
	 *
	 * Dead links (already revoked or expired) are left alone: there is nothing
	 * usable to kill, and keeping their state untouched preserves what the gate
	 * tells a returning visitor. Shared by `wp shareadraft revoke --all` and
	 * the revoke-preview-link ability.
	 */
	public function revoke_active_links_for_post( int $post_id ): int {
		$now     = $this->clock->now();
		$revoked = 0;

		foreach ( $this->repository->all_for_post( $post_id ) as $link ) {
			if ( $link->is_dead( $now ) ) {
				continue;
			}

			if ( $this->revoke( $post_id, $link->token_hash() ) ) {
				++$revoked;
			}
		}

		return $revoked;
	}

	/**
	 * The not-yet-revoked links matching a token hint or full token hash.
	 *
	 * A hint is only a few characters, so two links can share one; every match
	 * is returned and the caller decides what ambiguity means. Pure, so the
	 * resolution rules are pinned by a unit test without WordPress. Shared by
	 * `wp shareadraft revoke` and the revoke-preview-link ability.
	 *
	 * @param list<PreviewLink> $links      Every link issued for the post.
	 * @param string            $identifier A token hint or a full token hash.
	 * @return list<PreviewLink>
	 */
	public static function matching_links( array $links, string $identifier ): array {
		$matches = [];

		foreach ( $links as $link ) {
			if ( ! $link->is_revoked() && $link->is_identified_by( $identifier ) ) {
				$matches[] = $link;
			}
		}

		return $matches;
	}

	/**
	 * Revoke every not-yet-revoked link on a post that the given user created,
	 * returning how many were revoked. One per-post step of the offboarding sweep.
	 */
	public function revoke_for_post_by_creator( int $post_id, int $created_by ): int {
		return $this->repository->revoke_by_creator_for_post( $post_id, $created_by, $this->clock->now() );
	}

	/**
	 * Forget every link for a post. Called when a post is published or trashed
	 * and its preview links no longer mean anything.
	 */
	public function discard_all( int $post_id ): void {
		$this->repository->delete_all_for_post( $post_id );
	}

	/**
	 * Decide whether a token may view a post.
	 *
	 * Pure query: it never mutates the link. Spending a slot is the distinct
	 * {@see PreviewLinkService::claim_slot()} command, run once per request by the
	 * gate, so a single page load that fires several queries cannot exhaust its
	 * own link mid-render.
	 *
	 * @param bool        $holds_slot Whether this visitor presented a slot the
	 *                                server issued for this link. The gate checks
	 *                                its signature, so a made-up value is false.
	 * @param string|null $client_ip The visitor's true client IP, or null when it
	 *                               could not be resolved (which fails closed if
	 *                               the link or platform carries an allowlist).
	 * @param string|null $verified_email The email this visitor has proved control
	 *                               of, or null if unverified. Only consulted when
	 *                               the link is bound to recipients.
	 */
	public function authorize( int $post_id, Token $candidate, bool $holds_slot = false, ?string $client_ip = null, ?string $verified_email = null ): AccessDecision {
		$link = $this->repository->find( $post_id, $candidate );

		return $this->policy->decide( $link, $this->clock->now(), $holds_slot, $client_ip, $verified_email );
	}

	/**
	 * Spend one of the link's viewer slots, returning whether one was spent. The
	 * caller then hands the visitor proof of the slot (the gate's signed cookie).
	 *
	 * The whole policy is re-evaluated here rather than trusting the gate's
	 * earlier decision, and the write is a compare-and-swap: between reading the
	 * link and writing it back, another visitor may have taken the last slot, or
	 * the author may have revoked the link entirely. A caller that loses the race
	 * on a capped link gets false and must deny, which is what closes the
	 * check-then-act window.
	 */
	public function claim_slot( int $post_id, Token $candidate, ?string $client_ip = null, ?string $verified_email = null ): bool {
		$link = null;

		for ( $attempt = 0; $attempt < self::CLAIM_ATTEMPTS; $attempt++ ) {
			$link = $this->repository->find( $post_id, $candidate );

			if ( null === $link ) {
				return false;
			}

			// Not a returning slot holder: this is a brand-new slot, so the
			// exhaustion rule must apply in full. The client IP and verified email
			// are re-checked too, since this is the write that actually spends a slot.
			if ( ! $this->policy->decide( $link, $this->clock->now(), false, $client_ip, $verified_email )->is_allowed() ) {
				return false;
			}

			if ( $this->repository->add_use( $link ) ) {
				return true;
			}

			// Lost the write race to a concurrent visitor: re-read and re-decide.
		}

		// An uncapped link has no last slot to fight over, so a burst of new
		// visitors is no reason to turn this one away; the count just misses them.
		return null !== $link && null === $link->max_uses();
	}

	/**
	 * Whether this address is a named reviewer on the live link the token
	 * unlocks. The gate asks before emailing a verification code, so codes only
	 * ever go to addresses an author actually listed — a stranger probing the
	 * form generates no mail at all. Dead links say no: there is nothing left
	 * to verify for.
	 */
	public function is_recipient( int $post_id, Token $candidate, string $email ): bool {
		$link = $this->repository->find( $post_id, $candidate );

		return null !== $link
			&& ! $link->is_dead( $this->clock->now() )
			&& $link->is_recipient( $email );
	}

	/**
	 * Delete this post's links that died before the cutoff, returning how many
	 * went. Dead links are deliberately kept for a while so the gate can explain
	 * itself; this is what stops them accumulating forever.
	 */
	public function prune_dead( int $post_id, int $grace_seconds ): int {
		$now = $this->clock->now();

		return $this->repository->delete_dead_for_post( $post_id, $now - $grace_seconds, $now );
	}

	/**
	 * A batch of post IDs still carrying links, for the garbage collector.
	 *
	 * @return list<int>
	 */
	public function post_ids_with_links( int $after_post_id, int $limit ): array {
		return $this->repository->post_ids_with_links( $after_post_id, $limit );
	}

	/**
	 * A page of post IDs carrying links bound to this reviewer, for the
	 * personal-data exporter and eraser.
	 *
	 * @return list<int>
	 */
	public function post_ids_with_recipient( string $email, int $offset, int $limit ): array {
		return $this->repository->post_ids_with_recipient( $email, $offset, $limit );
	}

	/**
	 * Forget a reviewer on every link of a post that names them, revoking any
	 * link left with no reviewers (see {@see PreviewLink::without_recipient()}).
	 *
	 * @return array{removed: int, failed: int} Links rewritten, and links that
	 *                                          could not be.
	 */
	public function forget_recipient( int $post_id, string $email ): array {
		$now    = $this->clock->now();
		$result = [
			'removed' => 0,
			'failed'  => 0,
		];

		foreach ( $this->repository->all_for_post( $post_id ) as $link ) {
			if ( ! $link->is_recipient( $email ) ) {
				continue;
			}

			if ( $this->repository->remove_recipient( $link, $email, $now ) ) {
				++$result['removed'];
			} else {
				++$result['failed'];
			}
		}

		return $result;
	}

	/**
	 * A page of every issued link across the site, newest first, for the admin
	 * table — optionally only the links a given user created.
	 *
	 * @return list<PreviewLink>
	 */
	public function page_of_links( int $offset, int $limit, ?int $created_by = null ): array {
		return $this->repository->page_of_links( $offset, $limit, $created_by );
	}

	/**
	 * How many links exist across the site (or by one creator), for paginating
	 * the admin table.
	 */
	public function count_links( ?int $created_by = null ): int {
		return $this->repository->count_links( $created_by );
	}

	/**
	 * Every link on the site, newest first, walked page by page so an unbounded
	 * listing never turns into one unbounded query — optionally only the links
	 * a given user created, mirroring the admin table's creator filter. Shared
	 * by `wp shareadraft list` and the list-preview-links ability.
	 *
	 * @return list<PreviewLink>
	 */
	public function all_links( ?int $created_by = null ): array {
		$links  = [];
		$offset = 0;

		do {
			$page       = $this->page_of_links( $offset, self::LISTING_PAGE_SIZE, $created_by );
			$page_count = count( $page );
			$links      = [ ...$links, ...$page ];
			$offset    += self::LISTING_PAGE_SIZE;
		} while ( self::LISTING_PAGE_SIZE === $page_count );

		return $links;
	}
}
