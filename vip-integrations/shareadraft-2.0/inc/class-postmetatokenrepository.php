<?php

namespace Automattic\ShareADraft;

/**
 * Postmeta-backed {@see TokenRepository}.
 *
 * Each issued link is one hidden postmeta row on its post, so a post can carry
 * several live links at once (mirroring how the editor lets an author generate
 * more than one). Lookups load a single post's meta (already cached by WordPress)
 * and match by hash, so there is no cross-post query on the request path.
 *
 * This is the only class that knows links live in postmeta. Swapping in a custom
 * table later means writing one more TokenRepository and changing a single line
 * in the composition root; the domain and its tests do not move.
 */
final class PostMetaTokenRepository implements TokenRepository {
	/**
	 * Hidden meta key (leading underscore) so links never show in the Custom
	 * Fields UI.
	 */
	public const META_KEY = '_shareadraft_token';

	/**
	 * Hidden meta key for each link's use count: one row per link, beside its
	 * {@see META_KEY} row and matched to it by token hash.
	 *
	 * The count is the only thing a viewer writes, so it lives apart from the
	 * rest of the link. A claim then never changes the bytes a revoke compares
	 * against, and the link's own row is written only when it is issued,
	 * revoked, or has a reviewer's address erased.
	 */
	public const USES_META_KEY = '_shareadraft_uses';

	/**
	 * How many times a revoke or erasure re-reads and retries after losing a
	 * write race. Viewers do not write a link's own row, beyond the first claim
	 * on a pre-release row (see {@see replace_row()}), so a retry only ever
	 * faces another revoke or erasure landing first, or that one-off move.
	 */
	private const REWRITE_ATTEMPTS = 10;

	/**
	 * Storage schema version of the {@see META_KEY} row.
	 *
	 * 1: a `use_count` integer.
	 * 2: a `viewers` list of opaque slot IDs instead.
	 * 3: the use count moved to its own {@see USES_META_KEY} row. The row may
	 *    carry an optional `allowed_ips` list of CIDR strings and an optional
	 *    `recipients` list of lowercased emails, each omitted entirely when
	 *    empty (see {@see PostMetaTokenRepository::to_array()}).
	 *
	 * Versions 1 and 2 only shipped in pre-release builds. They are read with
	 * their inline count, and the first write to one moves that count to its
	 * own row (see {@see replace_row()}).
	 *
	 * ponytail: the inline-count reader can go once no pre-release row can
	 * still be live: a week after 2.0 on sites using the default lifetimes,
	 * plus the garbage collector's grace period.
	 */
	private const VERSION = 3;

	/**
	 * The stored row each link was read from, so a write matches the exact
	 * bytes on record even when they are in an older shape than
	 * {@see to_array()} writes.
	 *
	 * @var \WeakMap<PreviewLink, array<string, mixed>>
	 */
	private \WeakMap $read_rows;

	public function __construct() {
		$this->read_rows = new \WeakMap();
	}

	public function save( PreviewLink $link ): bool {
		$token_mid = add_post_meta( $link->post_id(), self::META_KEY, $this->to_array( $link ) );

		if ( false === $token_mid ) {
			return false;
		}

		if ( false !== add_post_meta( $link->post_id(), self::USES_META_KEY, $this->uses_row( $link ) ) ) {
			return true;
		}

		// Without its uses row a capped link could never be claimed, so take the
		// link's own row back out by ID rather than leave a half-written link.
		// Should that delete fail too, the row is one nobody holds a URL for,
		// and the garbage collector reaps it once it expires.
		delete_metadata_by_mid( 'post', $token_mid );

		return false;
	}

	public function find( int $post_id, Token $candidate ): ?PreviewLink {
		foreach ( $this->all_for_post( $post_id ) as $link ) {
			if ( $link->matches( $candidate ) ) {
				return $link;
			}
		}

		return null;
	}

	public function all_for_post( int $post_id ): array {
		$links = [];

		$rows = get_post_meta( $post_id, self::META_KEY, false );

		if ( ! is_array( $rows ) ) {
			return [];
		}

		$uses = $this->uses_for_post( $post_id );

		foreach ( $rows as $row ) {
			if ( is_array( $row ) ) {
				/** @var array<string, mixed> $row */
				$links[] = $this->from_array( $post_id, $row, $uses );
			}
		}

		return $links;
	}

	/**
	 * Compare-and-swap the incremented count onto the link's uses row.
	 *
	 * Passing the pre-read count as `$prev_value` makes WordPress emit
	 * `UPDATE ... WHERE meta_value = <old>`, which MySQL evaluates under a row
	 * lock. A concurrent request that already spent a slot will have changed
	 * `meta_value`, so this update matches nothing and returns false — telling the
	 * caller to re-read rather than clobbering the winner's write.
	 */
	public function add_use( PreviewLink $link ): bool {
		if ( $this->carries_inline_count( $this->stored_row( $link ) ) ) {
			return $this->replace_row( $link, $link->with_use() );
		}

		// update_post_meta() falls back to *adding* a row when the key has none
		// left, so a claim racing publish or trash cleanup could leave a count
		// behind for a link that is gone, or duplicate one a first write is
		// about to add. Re-reading first closes most of that window; a
		// row-keyed conditional UPDATE would close it completely, which is the
		// case for moving this store to its own table.
		if ( ! isset( $this->uses_for_post( $link->post_id() )[ $link->token_hash() ] ) ) {
			return false;
		}

		return $this->compare_and_swap(
			$link->post_id(),
			self::USES_META_KEY,
			$this->uses_row( $link->with_use() ),
			$this->uses_row( $link )
		);
	}

	public function find_by_hash( int $post_id, string $token_hash ): ?PreviewLink {
		foreach ( $this->all_for_post( $post_id ) as $link ) {
			if ( hash_equals( $link->token_hash(), $token_hash ) ) {
				return $link;
			}
		}

		return null;
	}

	public function revoke( PreviewLink $link, int $revoked_at ): bool {
		return $this->stamp_revoked( $link, $revoked_at );
	}

	public function revoke_all_for_post( int $post_id, int $revoked_at ): int {
		return $this->revoke_matching( $post_id, null, $revoked_at );
	}

	public function revoke_by_creator_for_post( int $post_id, int $created_by, int $revoked_at ): int {
		return $this->revoke_matching( $post_id, $created_by, $revoked_at );
	}

	/**
	 * Stamp `revoked_at` on this post's not-yet-revoked links, optionally only
	 * those a given user created.
	 */
	private function revoke_matching( int $post_id, ?int $created_by, int $revoked_at ): int {
		$revoked = 0;

		foreach ( $this->all_for_post( $post_id ) as $link ) {
			if ( $link->is_revoked() ) {
				continue;
			}

			if ( null !== $created_by && $link->created_by() !== $created_by ) {
				continue;
			}

			if ( $this->stamp_revoked( $link, $revoked_at ) ) {
				++$revoked;
			}
		}

		return $revoked;
	}

	/**
	 * Compare-and-swap `revoked_at` onto a link's row (see {@see rewrite()}).
	 *
	 * Returns whether the stored link is now revoked. False means the link is
	 * gone, and the caller must not report it as revoked.
	 */
	private function stamp_revoked( PreviewLink $link, int $revoked_at ): bool {
		return $this->rewrite(
			$link,
			static fn ( PreviewLink $current ): ?PreviewLink => $current->is_revoked() ? null : $current->with_revoked( $revoked_at )
		);
	}

	public function remove_recipient( PreviewLink $link, string $email, int $now ): bool {
		return $this->rewrite(
			$link,
			static fn ( PreviewLink $current ): ?PreviewLink => $current->is_recipient( $email ) ? $current->without_recipient( $email, $now ) : null
		);
	}

	/**
	 * Compare-and-swap a change onto a link's row, re-reading and retrying when
	 * the row changed underneath. Each write is conditional on the pre-read row
	 * (see {@see add_use()}), so a concurrent write is re-read rather than
	 * clobbered.
	 *
	 * @param callable(PreviewLink): ?PreviewLink $change The link to store, or
	 *                                                    null when the current
	 *                                                    state already holds.
	 * @return bool Whether the stored link now reflects the change. False means
	 *              the link is gone, or every attempt lost the race.
	 */
	private function rewrite( PreviewLink $link, callable $change ): bool {
		for ( $attempt = 0; $attempt < self::REWRITE_ATTEMPTS; $attempt++ ) {
			$changed = $change( $link );

			if ( null === $changed ) {
				return true;
			}

			if ( $this->replace_row( $link, $changed ) ) {
				return true;
			}

			$link = $this->find_by_hash( $link->post_id(), $link->token_hash() );

			if ( null === $link ) {
				return false;
			}
		}

		return false;
	}

	/**
	 * Compare-and-swap a link's row from the state it was read in to a new one.
	 *
	 * A pre-release row carries its use count inline. Writing it in the current
	 * shape drops that count, so the write that replaces it also gives the count
	 * its own row. Only one write can replace a given stored row, so only one
	 * uses row is ever added.
	 */
	private function replace_row( PreviewLink $read, PreviewLink $replacement ): bool {
		$stored = $this->stored_row( $read );

		if ( ! $this->compare_and_swap( $read->post_id(), self::META_KEY, $this->to_array( $replacement ), $stored ) ) {
			return false;
		}

		if ( $this->carries_inline_count( $stored ) ) {
			add_post_meta( $read->post_id(), self::USES_META_KEY, $this->uses_row( $replacement ) );
		}

		return true;
	}

	/**
	 * Write `$value` over the row holding `$prev_value`, returning whether one matched.
	 *
	 * WordPress only clears the post's meta cache after a write that changed a
	 * row, so a lost race would leave this request holding the stale value and
	 * every re-read would lose again. Clearing it here makes the caller's
	 * re-read see the write that won.
	 *
	 * @param array<string, mixed> $value
	 * @param array<string, mixed> $prev_value
	 */
	private function compare_and_swap( int $post_id, string $meta_key, array $value, array $prev_value ): bool {
		if ( false !== update_post_meta( $post_id, $meta_key, $value, $prev_value ) ) {
			return true;
		}

		wp_cache_delete( (string) $post_id, 'post_meta' );

		return false;
	}

	public function delete_all_for_post( int $post_id ): void {
		delete_post_meta( $post_id, self::META_KEY );
		delete_post_meta( $post_id, self::USES_META_KEY );
	}

	public function delete_dead_for_post( int $post_id, int $dead_before, int $now ): int {
		$deleted = 0;

		foreach ( $this->all_for_post( $post_id ) as $link ) {
			$dead_since = $link->dead_since( $now );

			if ( null === $dead_since || $dead_since >= $dead_before ) {
				continue;
			}

			if ( delete_post_meta( $post_id, self::META_KEY, $this->stored_row( $link ) ) ) {
				// A link this long dead admits nobody, so its count cannot have
				// moved since it was read.
				delete_post_meta( $post_id, self::USES_META_KEY, $this->uses_row( $link ) );
				++$deleted;
			}
		}

		return $deleted;
	}

	public function post_ids_with_links( int $after_post_id, int $limit ): array {
		/** @var \wpdb $wpdb */
		global $wpdb;

		/**
		 * Indexed on `meta_key` and never run on a page request — only from the
		 * garbage-collection cron, in bounded batches, walking a `post_id` cursor.
		 * Caching the result would be pointless (it changes as we delete) and
		 * harmful (it is a large, single-use list).
		 */
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Batched cron sweep over an indexed meta_key; see above.
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT DISTINCT post_id FROM %i WHERE meta_key = %s AND post_id > %d ORDER BY post_id ASC LIMIT %d',
				$wpdb->postmeta,
				self::META_KEY,
				$after_post_id,
				$limit
			)
		);

		return array_map( 'intval', $ids );
	}

	public function post_ids_with_recipient( string $email, int $offset, int $limit ): array {
		/** @var \wpdb $wpdb */
		global $wpdb;

		/**
		 * Recipients live inside the serialised row, so this matches the quoted
		 * address as {@see to_array()} writes it (`"bob@example.com"`), the same
		 * stopgap {@see created_by_clause()} uses. Quoted, it cannot match a
		 * token hash, hint, or CIDR range; a false positive would only cost a
		 * wasted read, since callers re-check {@see PreviewLink::is_recipient()}.
		 * Run only from the admin privacy tools, and not cached for the same
		 * reason as {@see post_ids_with_links()}.
		 */
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Admin privacy tools over an indexed meta_key; see above.
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				'SELECT DISTINCT post_id FROM %i WHERE meta_key = %s AND meta_value LIKE %s ORDER BY post_id ASC LIMIT %d OFFSET %d',
				$wpdb->postmeta,
				self::META_KEY,
				'%' . $wpdb->esc_like( '"' . strtolower( $email ) . '"' ) . '%',
				$limit,
				$offset
			)
		);

		return array_map( 'intval', $ids );
	}

	public function page_of_links( int $offset, int $limit, ?int $created_by = null ): array {
		/** @var \wpdb $wpdb */
		global $wpdb;

		/**
		 * Indexed on `meta_key` and run only from the editor-gated admin table,
		 * never on a page request. Not cached: it must reflect a revocation made
		 * moments earlier on the same screen, and each page is a large single-use
		 * read.
		 */
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Admin audit table over an indexed meta_key; see above.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- created_by_clause() returns a fragment prepared with its own placeholder.
				"SELECT post_id, meta_value FROM %i WHERE meta_key = %s{$this->created_by_clause( $created_by )} ORDER BY meta_id DESC LIMIT %d OFFSET %d", // @phpstan-ignore argument.type (The interpolated fragment is prepared with its own placeholder.)
				$wpdb->postmeta,
				self::META_KEY,
				$limit,
				$offset
			),
			ARRAY_A
		);

		if ( ! is_array( $rows ) ) {
			return [];
		}

		$post_ids = array_map(
			static fn ( $row ): int => isset( $row['post_id'] ) && is_scalar( $row['post_id'] ) ? (int) $row['post_id'] : 0,
			$rows
		);

		// One query for every post's use counts, and one for the posts every
		// caller loads per row (capability check, title), rather than one each
		// per row. The meta call stays: priming the posts skips the meta of any
		// post that was already cached.
		update_meta_cache( 'post', array_unique( $post_ids ) );
		_prime_post_caches( array_unique( $post_ids ), false, false );

		$links = [];

		foreach ( $rows as $index => $row ) {
			$post_id = $post_ids[ $index ];
			$raw     = isset( $row['meta_value'] ) && is_string( $row['meta_value'] ) ? $row['meta_value'] : '';

			$stored = maybe_unserialize( $raw );

			if ( is_array( $stored ) ) {
				/** @var array<string, mixed> $stored */
				$links[] = $this->from_array( $post_id, $stored, $this->uses_for_post( $post_id ) );
			}
		}

		return $links;
	}

	public function count_links( ?int $created_by = null ): int {
		/** @var \wpdb $wpdb */
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Admin audit table over an indexed meta_key; see page_of_links().
		$count = $wpdb->get_var(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- created_by_clause() returns a fragment prepared with its own placeholder.
				"SELECT COUNT(*) FROM %i WHERE meta_key = %s{$this->created_by_clause( $created_by )}", // @phpstan-ignore argument.type (The interpolated fragment is prepared with its own placeholder.)
				$wpdb->postmeta,
				self::META_KEY
			)
		);

		return (int) $count;
	}

	/**
	 * A prepared `AND meta_value LIKE ...` fragment matching links a given user
	 * created, or an empty string for no filter.
	 *
	 * `created_by` lives inside the serialised row, so this matches its exact
	 * serialised form (`"created_by";i:<id>;`) — a substring this class alone
	 * writes, via {@see to_array()}, always as an int. It is a stopgap the admin
	 * screen alone pays for; an indexed `created_by` column is the custom-table
	 * upgrade when scale demands it.
	 */
	private function created_by_clause( ?int $created_by ): string {
		if ( null === $created_by ) {
			return '';
		}

		/** @var \wpdb $wpdb */
		global $wpdb;

		return (string) $wpdb->prepare(
			' AND meta_value LIKE %s',
			'%' . $wpdb->esc_like( '"created_by";i:' . $created_by . ';' ) . '%'
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private function to_array( PreviewLink $link ): array {
		$row = [
			'version'    => self::VERSION,
			'token_hash' => $link->token_hash(),
			'expires_at' => $link->expires_at(),
			'max_uses'   => $link->max_uses(),
			'created_by' => $link->created_by(),
			'created_at' => $link->created_at(),
			'revoked_at' => $link->revoked_at(),
			'token_hint' => $link->token_hint(),
		];

		// Omitted (not stored as []) when empty, deliberately: the
		// compare-and-swap write in revoke() matches on this exact serialised
		// array, so rows written before the key existed must keep
		// round-tripping byte-for-byte or they become unrevokable.
		if ( $link->has_ip_restriction() ) {
			$row['allowed_ips'] = $link->allowed_ips();
		}

		// Same omit-when-empty rule as allowed_ips, for the same CAS reason.
		if ( [] !== $link->recipients() ) {
			$row['recipients'] = $link->recipients();
		}

		return $row;
	}

	/**
	 * The uses row for a link: its token hash, to pair it with the link's own
	 * row, and how many slots it has spent.
	 *
	 * @return array{token_hash: string, uses: int}
	 */
	private function uses_row( PreviewLink $link ): array {
		return [
			'token_hash' => $link->token_hash(),
			'uses'       => $link->use_count(),
		];
	}

	/**
	 * Every link's use count on a post, keyed by token hash. Junk rows are
	 * skipped, so their link reads as unused rather than fatal.
	 *
	 * @return array<string, int>
	 */
	private function uses_for_post( int $post_id ): array {
		$rows = get_post_meta( $post_id, self::USES_META_KEY, false );
		$uses = [];

		foreach ( is_array( $rows ) ? $rows : [] as $row ) {
			if ( is_array( $row ) && isset( $row['token_hash'], $row['uses'] ) && is_string( $row['token_hash'] ) && is_int( $row['uses'] ) ) {
				$uses[ $row['token_hash'] ] = $row['uses'];
			}
		}

		return $uses;
	}

	/**
	 * Rebuild a link from stored data, tolerating missing or malformed keys: a
	 * corrupt row must degrade to an unusable (expired-looking) link, never fatal.
	 *
	 * @param array<string, mixed> $row
	 * @param array<string, int>   $uses Use counts on the post, keyed by token hash.
	 */
	private function from_array( int $post_id, array $row, array $uses ): PreviewLink {
		$token_hash = isset( $row['token_hash'] ) && is_string( $row['token_hash'] ) ? $row['token_hash'] : '';

		$link = new PreviewLink(
			$post_id,
			$token_hash,
			isset( $row['expires_at'] ) && is_numeric( $row['expires_at'] ) ? (int) $row['expires_at'] : 0,
			isset( $row['max_uses'] ) && is_numeric( $row['max_uses'] ) ? (int) $row['max_uses'] : null,
			isset( $row['created_by'] ) && is_numeric( $row['created_by'] ) ? (int) $row['created_by'] : 0,
			isset( $row['created_at'] ) && is_numeric( $row['created_at'] ) ? (int) $row['created_at'] : 0,
			$uses[ $token_hash ] ?? $this->inline_count( $row ),
			isset( $row['revoked_at'] ) && is_numeric( $row['revoked_at'] ) ? (int) $row['revoked_at'] : null,
			isset( $row['token_hint'] ) && is_string( $row['token_hint'] ) ? $row['token_hint'] : '',
			IpAllowlist::sanitize( $row['allowed_ips'] ?? [] ),
			$this->recipients_from_row( $row )
		);

		$this->read_rows[ $link ] = $row;

		return $link;
	}

	/**
	 * The row a link was read from, or its current shape for a link that was
	 * never read (such as one built in a test).
	 *
	 * @return array<string, mixed>
	 */
	private function stored_row( PreviewLink $link ): array {
		return $this->read_rows[ $link ] ?? $this->to_array( $link );
	}

	/**
	 * Whether a stored row is a pre-release shape that keeps its use count
	 * inline rather than in its own row.
	 *
	 * @param array<string, mixed> $row
	 */
	private function carries_inline_count( array $row ): bool {
		return array_key_exists( 'viewers', $row ) || array_key_exists( 'use_count', $row );
	}

	/**
	 * The use count a pre-release row keeps inline: its `viewers` list
	 * (version 2) or its `use_count` (version 1). Zero for a current row.
	 *
	 * @param array<string, mixed> $row
	 */
	private function inline_count( array $row ): int {
		if ( isset( $row['viewers'] ) && is_array( $row['viewers'] ) ) {
			return count( $row['viewers'] );
		}

		return isset( $row['use_count'] ) && is_numeric( $row['use_count'] ) ? max( 0, (int) $row['use_count'] ) : 0;
	}

	/**
	 * The recipient emails on a stored link, tolerating junk: anything that is
	 * not a non-empty string is dropped, and casing is normalised so the
	 * case-insensitive match in {@see PreviewLink::is_recipient()} holds even
	 * for a row edited by hand.
	 *
	 * @param array<string, mixed> $row
	 * @return list<string>
	 */
	private function recipients_from_row( array $row ): array {
		if ( ! isset( $row['recipients'] ) || ! is_array( $row['recipients'] ) ) {
			return [];
		}

		$recipients = [];

		foreach ( $row['recipients'] as $recipient ) {
			if ( is_string( $recipient ) && '' !== $recipient ) {
				$recipients[] = strtolower( $recipient );
			}
		}

		return $recipients;
	}
}
