<?php

namespace Automattic\ShareADraft;

/**
 * Persistence boundary for issued preview links.
 *
 * The concrete implementation ships as postmeta ({@see PostMetaTokenRepository}),
 * but nothing outside this interface knows that: a custom table or external store
 * can be swapped in later without touching the domain or its tests.
 *
 * Lookups are scoped by post ID because the preview URL always carries it (it
 * reuses WordPress's own preview URL, e.g. `?p=13&preview=true`). That sidesteps
 * any need for a global token -> post reverse index.
 */
interface TokenRepository {
	/**
	 * Persist a newly issued link. Returns whether it was stored in full; false
	 * means nothing was kept, and the link must not be handed out.
	 */
	public function save( PreviewLink $link ): bool;

	/**
	 * Find the link on record for this post that the presented token unlocks, or
	 * null if none matches. Implementations must compare against the stored hash
	 * in constant time (see {@see PreviewLink::matches()}).
	 */
	public function find( int $post_id, Token $candidate ): ?PreviewLink;

	/**
	 * Every link issued for a post, for listing in the editor.
	 *
	 * @return list<PreviewLink>
	 */
	public function all_for_post( int $post_id ): array;

	/**
	 * Spend one slot on an existing link, atomically.
	 *
	 * The passed link is the state the caller read; implementations must persist
	 * its {@see PreviewLink::with_use()} count *only if* the stored count is
	 * still the same, and return false otherwise. That compare-and-swap is what
	 * stops two concurrent visitors both claiming the last slot: the loser is
	 * told so and re-reads rather than silently overwriting.
	 *
	 * The count must be stored apart from the link's other state, so a claim
	 * never races a revoke.
	 */
	public function add_use( PreviewLink $link ): bool;

	/**
	 * The link on this post whose token hash matches, or null. Unlike {@see find()}
	 * this takes the hash directly, so the editor can address a link it never sees
	 * the secret for.
	 */
	public function find_by_hash( int $post_id, string $token_hash ): ?PreviewLink;

	/**
	 * Persist the revocation of an existing link. The passed link is the
	 * pre-revocation state; implementations store its {@see
	 * PreviewLink::with_revoked()} form. Returns whether the stored link is now
	 * revoked; false means it could not be, and must not be reported as revoked.
	 */
	public function revoke( PreviewLink $link, int $revoked_at ): bool;

	/**
	 * Persist a link with one named reviewer forgotten. The passed link is the
	 * pre-erasure state; implementations store its {@see
	 * PreviewLink::without_recipient()} form. Returns whether the stored link no
	 * longer names the address; false means it could not be written.
	 */
	public function remove_recipient( PreviewLink $link, string $email, int $now ): bool;

	/**
	 * Revoke every not-yet-revoked link on a post, returning how many were
	 * revoked. The per-post building block the bulk-revoke sweep drives; each row
	 * keeps its own `revoked_at` so it stays the source of truth and the gate can
	 * still explain "this link was revoked".
	 */
	public function revoke_all_for_post( int $post_id, int $revoked_at ): int;

	/**
	 * Revoke every not-yet-revoked link on a post that the given user created,
	 * returning how many were revoked. Backs offboarding: when a user is removed,
	 * the links they issued stop working.
	 */
	public function revoke_by_creator_for_post( int $post_id, int $created_by, int $revoked_at ): int;

	/**
	 * Delete every link for a post, live or not. Used when a post is published or
	 * trashed and its preview links become meaningless.
	 */
	public function delete_all_for_post( int $post_id ): void;

	/**
	 * Delete this post's links that stopped being usable before the cutoff,
	 * returning how many were removed.
	 *
	 * Dead links are kept for a grace period so the gate can still tell a visitor
	 * "this link expired" rather than 404; past that they are only clutter.
	 */
	public function delete_dead_for_post( int $post_id, int $dead_before, int $now ): int;

	/**
	 * A batch of post IDs that still carry links, for the garbage collector to
	 * walk. Ordered by post ID ascending and starting after the given cursor, so
	 * a long site can be swept across several cron runs without re-reading work
	 * it has already done.
	 *
	 * @return list<int>
	 */
	public function post_ids_with_links( int $after_post_id, int $limit ): array;

	/**
	 * A page of post IDs carrying at least one link bound to this reviewer, for
	 * the personal-data exporter and eraser. Ordered by post ID ascending.
	 *
	 * A cross-post read like {@see page_of_links()}, so it runs only from the
	 * admin privacy tools, never from the gate.
	 *
	 * @param string $email  Reviewer address; matched case-insensitively.
	 * @param int    $offset Posts to skip.
	 * @param int    $limit  Maximum posts to return.
	 * @return list<int>
	 */
	public function post_ids_with_recipient( string $email, int $offset, int $limit ): array;

	/**
	 * A page of issued links across every post, newest first, for the site-wide
	 * admin table.
	 *
	 * Unlike {@see all_for_post()} this is a cross-post read, so implementations
	 * run it only off the request path (an editor-gated admin screen) and never
	 * from the gate.
	 *
	 * @param int      $offset     Rows to skip.
	 * @param int      $limit      Maximum rows to return.
	 * @param int|null $created_by Only links created by this user, or null for all.
	 * @return list<PreviewLink>
	 */
	public function page_of_links( int $offset, int $limit, ?int $created_by = null ): array;

	/**
	 * How many links are issued across every post, for paginating
	 * {@see page_of_links()}.
	 *
	 * @param int|null $created_by Only links created by this user, or null for all.
	 */
	public function count_links( ?int $created_by = null ): int;
}
