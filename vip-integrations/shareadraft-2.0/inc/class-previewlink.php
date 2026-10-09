<?php

namespace Automattic\ShareADraft;

/**
 * An issued preview link: the record that lets an unauthenticated visitor view a
 * single non-public post, subject to expiry, a cap on the number of distinct
 * viewers, and revocation.
 *
 * Holds only the token *hash*, never the plaintext. All the questions the access
 * rules need to ask are pure methods here, so {@see AccessPolicy} can be tested
 * without WordPress or a database.
 *
 * The viewer cap is a plain count of the slots spent. Telling a returning viewer
 * from a new one is the gate's job: it hands each viewer a slot cookie signed by
 * the server (see {@see PreviewGate}), so a visitor cannot mint a slot of their
 * own, and the link only has to remember how many it has given out.
 */
final class PreviewLink {
	private int $post_id;
	private string $token_hash;
	private int $expires_at;

	/** @var int|null Maximum distinct viewers, or null for unlimited. */
	private ?int $max_uses;

	private int $created_by;
	private int $created_at;

	/** How many distinct viewers have spent a slot on this link. */
	private int $use_count;

	/** @var int|null Unix timestamp of revocation, or null if still live. */
	private ?int $revoked_at;

	/** @var string Last few characters of the token, to identify a link in the UI. */
	private string $token_hint;

	/**
	 * @var list<string> CIDR ranges this link is restricted to, on top of any
	 *                   central ranges. Empty means no per-link restriction.
	 */
	private array $allowed_ips;

	/**
	 * @var list<string> Lowercased email addresses of the named reviewers this
	 *                   link is bound to. Empty means a plain bearer link.
	 */
	private array $recipients;

	/**
	 * @param list<string> $allowed_ips CIDR ranges this link is restricted to.
	 * @param list<string> $recipients  Lowercased recipient emails, or empty for
	 *                                  a bearer link.
	 */
	public function __construct(
		int $post_id,
		string $token_hash,
		int $expires_at,
		?int $max_uses,
		int $created_by,
		int $created_at,
		int $use_count = 0,
		?int $revoked_at = null,
		string $token_hint = '',
		array $allowed_ips = [],
		array $recipients = []
	) {
		$this->post_id     = $post_id;
		$this->token_hash  = $token_hash;
		$this->expires_at  = $expires_at;
		$this->max_uses    = $max_uses;
		$this->created_by  = $created_by;
		$this->created_at  = $created_at;
		$this->use_count   = $use_count;
		$this->revoked_at  = $revoked_at;
		$this->token_hint  = $token_hint;
		$this->allowed_ips = $allowed_ips;
		$this->recipients  = $recipients;
	}

	/**
	 * Issue a brand-new link for a freshly generated token.
	 *
	 * @param int|null     $max_uses    Maximum distinct viewers, or null for unlimited.
	 * @param list<string> $allowed_ips CIDR ranges to restrict the link to, or empty
	 *                                  for no per-link restriction.
	 * @param list<string> $recipients  Lowercased emails of the named reviewers to
	 *                                  bind the link to, or empty for a bearer link.
	 */
	public static function issue(
		int $post_id,
		Token $token,
		int $expires_at,
		?int $max_uses,
		int $created_by,
		int $created_at,
		array $allowed_ips = [],
		array $recipients = []
	): self {
		return new self(
			$post_id,
			$token->hash(),
			$expires_at,
			$max_uses,
			$created_by,
			$created_at,
			0,
			null,
			substr( $token->value(), -4 ),
			$allowed_ips,
			$recipients
		);
	}

	public function post_id(): int {
		return $this->post_id;
	}

	public function token_hash(): string {
		return $this->token_hash;
	}

	public function expires_at(): int {
		return $this->expires_at;
	}

	public function max_uses(): ?int {
		return $this->max_uses;
	}

	public function created_by(): int {
		return $this->created_by;
	}

	/**
	 * Whether a user was recorded as creating this link. False for links
	 * minted without an authenticated user (e.g. WP-CLI without --user).
	 */
	public function has_known_creator(): bool {
		return 0 !== $this->created_by;
	}

	public function created_at(): int {
		return $this->created_at;
	}

	/**
	 * How many distinct viewers have spent a slot on this link.
	 */
	public function use_count(): int {
		return $this->use_count;
	}

	public function revoked_at(): ?int {
		return $this->revoked_at;
	}

	/**
	 * The last few characters of the token, safe to show in the editor so an
	 * author can tell one link from another and match it to a URL they shared.
	 */
	public function token_hint(): string {
		return $this->token_hint;
	}

	/**
	 * The CIDR ranges this link is restricted to. Empty means the link adds no
	 * IP restriction of its own (any central ranges still apply).
	 *
	 * @return list<string>
	 */
	public function allowed_ips(): array {
		return $this->allowed_ips;
	}

	/**
	 * Whether this link carries IP ranges of its own. Says nothing about the
	 * central baseline, which restricts every link and lives with the policy.
	 */
	public function has_ip_restriction(): bool {
		return [] !== $this->allowed_ips;
	}

	/**
	 * Whether a caller-supplied identifier names this link: either its full
	 * token hash, or the short token hint shown wherever links are listed.
	 *
	 * A hint is only a few characters, so it may name several links at once;
	 * the caller decides what ambiguity means. An empty identifier never
	 * matches.
	 */
	public function is_identified_by( string $identifier ): bool {
		if ( '' === $identifier ) {
			return false;
		}

		return hash_equals( $this->token_hash, $identifier ) || $this->token_hint === $identifier;
	}

	/**
	 * The lowercased emails of the named reviewers this link is bound to.
	 * Empty means a plain bearer link: anyone holding the URL may view.
	 *
	 * @return list<string>
	 */
	public function recipients(): array {
		return $this->recipients;
	}

	/**
	 * Whether this address is one of the link's named reviewers. Comparison is
	 * case-insensitive, matching how mailboxes treat addresses in practice; an
	 * empty address never matches.
	 */
	public function is_recipient( string $email ): bool {
		return '' !== $email && in_array( strtolower( $email ), $this->recipients, true );
	}

	/**
	 * Whether a token presented by a visitor is the one this link was issued for.
	 * Constant-time to avoid leaking the hash a character at a time.
	 */
	public function matches( Token $candidate ): bool {
		return hash_equals( $this->token_hash, $candidate->hash() );
	}

	public function is_expired( int $now ): bool {
		return $now >= $this->expires_at;
	}

	public function is_revoked(): bool {
		return null !== $this->revoked_at;
	}

	/**
	 * Whether this link is finished with: expired, revoked, or both. Used by the
	 * garbage collector to decide what is safe to forget.
	 */
	public function is_dead( int $now ): bool {
		return $this->is_revoked() || $this->is_expired( $now );
	}

	/**
	 * The moment this link stopped being usable, or null if it is still live.
	 */
	public function dead_since( int $now ): ?int {
		if ( $this->is_revoked() ) {
			return $this->is_expired( $now )
				? min( (int) $this->revoked_at, $this->expires_at )
				: $this->revoked_at;
		}

		return $this->is_expired( $now ) ? $this->expires_at : null;
	}

	/**
	 * Whether every allowed viewer slot has been spent. Always false for an
	 * unlimited link.
	 */
	public function is_exhausted(): bool {
		return null !== $this->max_uses && $this->use_count() >= $this->max_uses;
	}

	/**
	 * A copy of this link with one more slot spent. Immutable: the caller
	 * persists the returned instance.
	 */
	public function with_use(): self {
		return new self(
			$this->post_id,
			$this->token_hash,
			$this->expires_at,
			$this->max_uses,
			$this->created_by,
			$this->created_at,
			$this->use_count + 1,
			$this->revoked_at,
			$this->token_hint,
			$this->allowed_ips,
			$this->recipients
		);
	}

	/**
	 * A copy of this link revoked at the given moment. Immutable: the caller
	 * persists the returned instance.
	 */
	public function with_revoked( int $revoked_at ): self {
		return new self(
			$this->post_id,
			$this->token_hash,
			$this->expires_at,
			$this->max_uses,
			$this->created_by,
			$this->created_at,
			$this->use_count,
			$revoked_at,
			$this->token_hint,
			$this->allowed_ips,
			$this->recipients
		);
	}

	/**
	 * A copy of this link with one named reviewer forgotten, for personal-data
	 * erasure. Immutable: the caller persists the returned instance.
	 *
	 * An empty recipient list means "anyone holding the URL", so removing the
	 * last reviewer would quietly turn a bound link into a bearer link. Erasure
	 * must never widen access, so that case revokes the link as well.
	 */
	public function without_recipient( string $email, int $now ): self {
		if ( ! $this->is_recipient( $email ) ) {
			return $this;
		}

		$recipients = array_values( array_diff( $this->recipients, [ strtolower( $email ) ] ) );
		$revoked_at = [] === $recipients ? ( $this->revoked_at ?? $now ) : $this->revoked_at;

		return new self(
			$this->post_id,
			$this->token_hash,
			$this->expires_at,
			$this->max_uses,
			$this->created_by,
			$this->created_at,
			$this->use_count,
			$revoked_at,
			$this->token_hint,
			$this->allowed_ips,
			$recipients
		);
	}
}
