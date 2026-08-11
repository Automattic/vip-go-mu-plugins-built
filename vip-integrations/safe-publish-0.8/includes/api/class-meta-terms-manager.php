<?php
/**
 * Meta Terms Manager class
 *
 * Handles updating post metadata and taxonomies/terms.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Utils\Options;
use WP_Error;
use WP_Term;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Meta_Terms_Manager Class.
 *
 * Responsible for managing post meta and taxonomy term assignments.
 */
final class Meta_Terms_Manager {

	/**
	 * Destination term IDs resolved by source identity, keyed by source site
	 * URL plus taxonomy, then by source term ID. A 0 records a confirmed miss
	 * so the run does not re-query it.
	 *
	 * One instance serves a whole import run, and a bulk batch imports every
	 * post in a single request, so a term shared across posts resolves once.
	 *
	 * @var array<string, array<int, int>>
	 */
	private array $source_term_ids = array();

	/**
	 * Updates post meta based on provided input.
	 *
	 * Accepts array or object; keys are meta keys, values are meta values.
	 *
	 * Returns true on success, or a WP_Error listing any keys that could not
	 * be written due to a database error.
	 *
	 * @param int          $post_id Post ID to update meta for.
	 * @param array|object $meta    Meta to set.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	public function update_meta( int $post_id, array|object $meta ): true|WP_Error {
		// Update meta if provided (accept object or array).
		$meta_array = (array) $meta;
		if ( array() !== $meta_array ) {
			$failed_keys = array();

			foreach ( $meta_array as $meta_key => $meta_value ) {
				$key    = sanitize_text_field( (string) $meta_key );
				$result = update_post_meta( $post_id, $key, $meta_value );

				if ( false === $result ) {
					// update_post_meta() returns false both on failure and
					// on a no-op re-import of an unchanged value. WordPress
					// stores scalars as strings, so compare stringwise; and
					// since an absent key also reads back as "", require the
					// key to exist to tell a failed falsy write from a no-op.
					$stored  = get_post_meta( $post_id, $key, true );
					$matches = is_array( $meta_value ) || is_object( $meta_value )
						? $stored == $meta_value // phpcs:ignore WordPress.PHP.StrictComparisons.LooseComparison
						: (string) $stored === (string) $meta_value;

					if ( ! metadata_exists( 'post', $post_id, $key ) || ! $matches ) {
						$failed_keys[] = $key;
					}
				}
			}

			if ( array() !== $failed_keys ) {
				return new WP_Error(
					'meta_update_failed',
					sprintf(
						/* translators: %s: comma-separated list of meta keys */
						__( 'Failed to update post meta key(s): %s.', 'safe-publish' ),
						implode( ', ', $failed_keys )
					)
				);
			}
		}

		return true;
	}

	/**
	 * Updates post terms (taxonomies) based on provided input.
	 *
	 * Accepts array or object keyed by taxonomy; each item may be a term ID,
	 * slug, name, or a record carrying source_term_id, slug, name, parent (a
	 * source ID), description, and assigned. Per taxonomy the records are
	 * ordered parent-first, resolved to destination terms (reusing a match or
	 * creating one with the mapped parent and description), and the assigned
	 * terms are set on the post; ancestors are created but not attached. A
	 * taxonomy sent as an empty list is cleared on the post, so a removal on
	 * the source propagates. When `$source_site_url` is non-empty and an item
	 * carries a source_term_id, the source ID and URL are recorded on the
	 * resolved term so later imports can remap by source identity.
	 *
	 * A taxonomy the destination does not register is skipped rather than
	 * failing the post: Only a site admin registering it can fix that, so the
	 * caller records it as a degradation and imports the rest.
	 *
	 * @param int          $post_id         Post ID to update terms for.
	 * @param array|object $terms           Terms to set, keyed by taxonomy.
	 * @param string       $source_site_url Source site URL paired with any
	 *                                      source_term_id meta written. Empty
	 *                                      string disables source-meta writes.
	 * @return array<string, string[]>|WP_Error Skipped taxonomy slugs mapped to
	 *                                          the term names left unattached,
	 *                                          or WP_Error when a term cannot be
	 *                                          created or assigned.
	 */
	public function update_terms(
		int $post_id,
		array|object $terms,
		string $source_site_url = ''
	): array|WP_Error {
		$skipped = array();

		foreach ( (array) $terms as $raw_tax => $term_items ) {
			$tax   = sanitize_key( (string) $raw_tax );
			$items = is_array( $term_items ) ? $term_items : (array) $term_items;

			// An empty key identifies no taxonomy, so there is nothing to report.
			if ( '' === $tax ) {
				continue;
			}

			if ( ! taxonomy_exists( $tax ) ) {
				$skipped[ $tax ] = $this->term_names( $items );
				continue;
			}

			$result = $this->assign_taxonomy_terms(
				$post_id,
				$tax,
				$items,
				$source_site_url
			);

			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		return $skipped;
	}

	/**
	 * Lists the display names of raw term items, for reporting terms that could
	 * not be attached.
	 *
	 * @param array $items Raw term items for one taxonomy.
	 * @return string[] Term names, skipping items that carry none.
	 */
	private function term_names( array $items ): array {
		$names = array();

		foreach ( $items as $item ) {
			$record = $this->normalize_term_record( $item );
			$name   = '' !== $record['name'] ? $record['name'] : $record['slug'];

			if ( '' !== $name ) {
				$names[] = $name;
			}
		}

		return $names;
	}

	/**
	 * Resolves one taxonomy's items parent-first, mapping each source term ID
	 * to its destination ID so a child's parent resolves before the child, then
	 * sets the assigned terms on the post. Ancestors are created but not
	 * attached.
	 *
	 * @param int    $post_id         Post ID to assign terms to.
	 * @param string $tax             Taxonomy slug (already validated).
	 * @param array  $items           Raw term items for the taxonomy.
	 * @param string $source_site_url Source site URL for paired meta writes.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	private function assign_taxonomy_terms(
		int $post_id,
		string $tax,
		array $items,
		string $source_site_url
	): true|WP_Error {
		// Gated on the raw items: A resolution failure also ends with no
		// assigned IDs, and must keep the existing terms.
		if ( array() === $items ) {
			$result = wp_set_post_terms( $post_id, array(), $tax, false );

			return is_wp_error( $result ) ? $result : true;
		}

		$records = array();
		foreach ( $items as $item ) {
			$records[] = $this->normalize_term_record( $item );
		}

		$this->prime_source_term_ids( $records, $tax, $source_site_url );

		$source_to_dest = array();
		$assigned_ids   = array();

		foreach ( $this->order_parent_first( $records ) as $record ) {
			$dest_parent_id = $record['parent'] > 0
				? ( $source_to_dest[ $record['parent'] ] ?? 0 )
				: 0;

			$dest_id = $this->resolve_term(
				$record,
				$tax,
				$dest_parent_id,
				$source_site_url
			);

			if ( is_wp_error( $dest_id ) ) {
				return $dest_id;
			}

			if ( 0 === $dest_id ) {
				continue;
			}

			if ( $record['source_term_id'] > 0 ) {
				$source_to_dest[ $record['source_term_id'] ] = $dest_id;
				$this->remember_source_term(
					$record['source_term_id'],
					$dest_id,
					$tax,
					$source_site_url
				);
			}

			if ( $record['assigned'] ) {
				$assigned_ids[] = $dest_id;
			}
		}

		if ( array() !== $assigned_ids ) {
			$result = wp_set_post_terms(
				$post_id,
				array_values( array_unique( $assigned_ids ) ),
				$tax,
				false
			);

			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		return true;
	}

	/**
	 * Normalizes a raw term item to a working record. A numeric or id/term_id
	 * item is a caller-supplied destination ID (dest_id); every other field
	 * describes a source term to reuse or create.
	 *
	 * @param mixed $item Raw item: int, string, array, or object.
	 * @return array{source_term_id:int, parent:int, name:string, slug:string, description:string, assigned:bool, dest_id:int}
	 */
	private function normalize_term_record( mixed $item ): array {
		$record = array(
			'source_term_id' => 0,
			'parent'         => 0,
			'name'           => '',
			'slug'           => '',
			'description'    => '',
			'assigned'       => true,
			'dest_id'        => 0,
		);

		if ( is_numeric( $item ) ) {
			$record['dest_id'] = (int) $item;
			return $record;
		}

		if ( is_string( $item ) ) {
			$record['name'] = trim( wp_strip_all_tags( $item ) );
			$record['slug'] = sanitize_title( $record['name'] );
			return $record;
		}

		if ( ! is_array( $item ) && ! is_object( $item ) ) {
			return $record;
		}

		$it                       = (array) $item;
		$record['source_term_id'] = isset( $it['source_term_id'] )
			? absint( $it['source_term_id'] )
			: 0;
		$record['parent']         = isset( $it['parent'] ) ? absint( $it['parent'] ) : 0;
		$record['description']    = isset( $it['description'] )
			? (string) $it['description']
			: '';
		$record['assigned']       = array_key_exists( 'assigned', $it )
			? (bool) $it['assigned']
			: true;

		if ( isset( $it['term_id'] ) ) {
			$record['dest_id'] = (int) $it['term_id'];
		} elseif ( isset( $it['id'] ) ) {
			$record['dest_id'] = (int) $it['id'];
		}

		if ( 0 === $record['dest_id'] ) {
			$record['slug'] = isset( $it['slug'] )
				? sanitize_title( (string) $it['slug'] )
				: '';
			$record['name'] = isset( $it['name'] )
				? trim( wp_strip_all_tags( (string) $it['name'] ) )
				: $record['slug'];
			if ( '' === $record['slug'] && '' !== $record['name'] ) {
				$record['slug'] = sanitize_title( $record['name'] );
			}
		}

		return $record;
	}

	/**
	 * Orders records so each term's source parent precedes it (roots first).
	 * Walks up each parent chain iteratively rather than recursing, so a deep
	 * chain from an untrusted source can't overflow the stack. A missing parent
	 * or a cycle leaves the term to resolve as a root.
	 *
	 * @param list<array{source_term_id:int, parent:int, name:string, slug:string, description:string, assigned:bool, dest_id:int}> $records Working records.
	 * @return list<array{source_term_id:int, parent:int, name:string, slug:string, description:string, assigned:bool, dest_id:int}>
	 */
	private function order_parent_first( array $records ): array {
		$index_by_source_id = array();
		foreach ( $records as $index => $record ) {
			if (
				$record['source_term_id'] > 0
				&& ! isset( $index_by_source_id[ $record['source_term_id'] ] )
			) {
				$index_by_source_id[ $record['source_term_id'] ] = $index;
			}
		}

		$ordered = array();
		$done    = array();

		foreach ( array_keys( $records ) as $start ) {
			if ( isset( $done[ $start ] ) ) {
				continue;
			}

			// Walk up the parent chain, stopping at a root, an ordered
			// ancestor, or a cycle.
			$chain    = array();
			$on_chain = array();
			$index    = $start;
			while ( ! isset( $done[ $index ] ) && ! isset( $on_chain[ $index ] ) ) {
				$on_chain[ $index ] = true;
				$chain[]            = $index;

				$parent = $records[ $index ]['parent'];
				if ( $parent <= 0 || ! isset( $index_by_source_id[ $parent ] ) ) {
					break;
				}
				$index = $index_by_source_id[ $parent ];
			}

			// Unwind so each ancestor is emitted before its child.
			for ( $i = count( $chain ) - 1; $i >= 0; $i-- ) {
				$done[ $chain[ $i ] ] = true;
				$ordered[]            = $records[ $chain[ $i ] ];
			}
		}

		return $ordered;
	}

	/**
	 * Resolves one record to a destination term ID: A trusted destination ID,
	 * an existing match, or a newly created term. Writes source-term metadata
	 * on the resolved term when a source ID and site URL are known.
	 *
	 * @param array{source_term_id:int, parent:int, name:string, slug:string, description:string, assigned:bool, dest_id:int} $record Working record.
	 * @param string                                                                                                          $tax             Taxonomy slug (already validated).
	 * @param int                                                                                                             $dest_parent_id  Resolved destination parent term ID, or 0.
	 * @param string                                                                                                          $source_site_url Source site URL for paired meta writes.
	 * @return int|WP_Error Destination term ID (0 when unresolvable), or WP_Error
	 *                      on insert failure.
	 */
	private function resolve_term(
		array $record,
		string $tax,
		int $dest_parent_id,
		string $source_site_url
	): int|WP_Error {
		$term_id = 0;

		if ( $record['dest_id'] > 0 ) {
			// Trust a caller-supplied ID only if it resolves in this taxonomy;
			// skip a foreign or stale one rather than assigning the wrong term.
			$dest_term = get_term( $record['dest_id'], $tax );
			if ( ! ( $dest_term instanceof WP_Term ) ) {
				return 0;
			}
			$term_id = (int) $dest_term->term_id;
		}

		if ( 0 === $term_id ) {
			$term_id = $this->find_existing_term(
				$record,
				$tax,
				$dest_parent_id,
				$source_site_url
			);
		}

		if ( 0 === $term_id && '' !== $record['name'] ) {
			$created = $this->create_term( $record, $tax, $dest_parent_id );
			if ( is_wp_error( $created ) ) {
				return $created;
			}
			$term_id = $created;
		}

		if ( $term_id > 0 ) {
			$this->write_source_term_meta(
				$term_id,
				$record['source_term_id'],
				$source_site_url
			);
		}

		return $term_id;
	}

	/**
	 * Finds an existing destination term for a record, in priority: Source-term
	 * identity (source ID + URL meta), slug, then name under the resolved
	 * destination parent. The name match is parent-scoped so same-named
	 * siblings under different parents stay distinct.
	 *
	 * @param array{source_term_id:int, parent:int, name:string, slug:string, description:string, assigned:bool, dest_id:int} $record Working record.
	 * @param string                                                                                                          $tax             Taxonomy slug.
	 * @param int                                                                                                             $dest_parent_id  Resolved destination parent term ID.
	 * @param string                                                                                                          $source_site_url Source site URL scoping the identity match.
	 * @return int Destination term ID, or 0 when no match.
	 */
	private function find_existing_term(
		array $record,
		string $tax,
		int $dest_parent_id,
		string $source_site_url
	): int {
		if ( $record['source_term_id'] > 0 && '' !== $source_site_url ) {
			$by_source = $this->find_term_by_source_identity(
				$record['source_term_id'],
				$tax,
				$source_site_url
			);

			if ( $by_source > 0 ) {
				return $by_source;
			}
		}

		if ( '' !== $record['slug'] ) {
			$by_slug = get_term_by( 'slug', $record['slug'], $tax );
			if ( $by_slug instanceof WP_Term ) {
				return (int) $by_slug->term_id;
			}
		}

		if ( '' !== $record['name'] ) {
			$by_name = get_terms(
				array(
					'taxonomy'   => $tax,
					'name'       => $record['name'],
					'parent'     => $dest_parent_id,
					'hide_empty' => false,
					'number'     => 1,
					'fields'     => 'ids',
				)
			);

			if ( is_array( $by_name ) && array() !== $by_name ) {
				return (int) $by_name[0];
			}
		}

		return 0;
	}

	/**
	 * Builds the memo key. Scoped by taxonomy too, so a source term ID cannot
	 * resolve to a term of another taxonomy.
	 *
	 * @param string $tax             Taxonomy slug.
	 * @param string $source_site_url Source site URL.
	 * @return string Memo key.
	 */
	private function source_term_key(
		string $tax,
		string $source_site_url
	): string {
		return $source_site_url . '|' . $tax;
	}

	/**
	 * Memoizes a resolved identity so later posts in the run skip the lookup.
	 * write_source_term_meta() has already put the identity on the term.
	 *
	 * @param int    $source_term_id  Source term ID.
	 * @param int    $term_id         Destination term ID it resolved to.
	 * @param string $tax             Taxonomy slug.
	 * @param string $source_site_url Source site URL; '' skips the memo.
	 */
	private function remember_source_term(
		int $source_term_id,
		int $term_id,
		string $tax,
		string $source_site_url
	): void {
		if ( '' === $source_site_url ) {
			return;
		}

		$key = $this->source_term_key( $tax, $source_site_url );

		$this->source_term_ids[ $key ][ $source_term_id ] = $term_id;
	}

	/**
	 * Resolves in one query every source identity the records will look up.
	 * Records carrying a destination ID are skipped: They never reach the
	 * identity lookup.
	 *
	 * @param list<array{source_term_id:int, parent:int, name:string, slug:string, description:string, assigned:bool, dest_id:int}> $records Working records.
	 * @param string                                                                                                                $tax             Taxonomy slug.
	 * @param string                                                                                                                $source_site_url Source site URL scoping the identity match.
	 */
	private function prime_source_term_ids(
		array $records,
		string $tax,
		string $source_site_url
	): void {
		if ( '' === $source_site_url ) {
			return;
		}

		$key    = $this->source_term_key( $tax, $source_site_url );
		$known  = $this->source_term_ids[ $key ] ?? array();
		$wanted = array();

		foreach ( $records as $record ) {
			if ( 0 !== $record['dest_id'] || 0 === $record['source_term_id'] ) {
				continue;
			}

			if ( ! isset( $known[ $record['source_term_id'] ] ) ) {
				$wanted[ $record['source_term_id'] ] = true;
			}
		}

		if ( array() === $wanted ) {
			return;
		}

		$this->query_source_term_ids(
			array_keys( $wanted ),
			$tax,
			$source_site_url
		);
	}

	/**
	 * Returns the destination term carrying a source identity, or 0 when none
	 * does. Queries only for an identity the run has not resolved yet.
	 *
	 * @param int    $source_term_id  Source term ID.
	 * @param string $tax             Taxonomy slug.
	 * @param string $source_site_url Source site URL scoping the match.
	 * @return int Destination term ID, or 0 when no match.
	 */
	private function find_term_by_source_identity(
		int $source_term_id,
		string $tax,
		string $source_site_url
	): int {
		$key    = $this->source_term_key( $tax, $source_site_url );
		$memoed = $this->source_term_ids[ $key ][ $source_term_id ] ?? null;

		// Confirm a memoized term still resolves: A stale hit would assign a
		// term that no longer exists instead of falling through to slug/name.
		// The term cache is already primed for it, so this rarely queries.
		if (
			null !== $memoed
			&& ( 0 === $memoed || get_term( $memoed, $tax ) instanceof WP_Term )
		) {
			return $memoed;
		}

		$this->query_source_term_ids(
			array( $source_term_id ),
			$tax,
			$source_site_url
		);

		return $this->source_term_ids[ $key ][ $source_term_id ] ?? 0;
	}

	/**
	 * Looks up destination terms by source identity and memoizes each outcome,
	 * a hit as the term ID and a miss as 0. Uncapped: A cap could drop a
	 * source ID when another one matches several terms.
	 *
	 * @param int[]  $source_ids      Source term IDs to look up.
	 * @param string $tax             Taxonomy slug.
	 * @param string $source_site_url Source site URL scoping the match.
	 */
	private function query_source_term_ids(
		array $source_ids,
		string $tax,
		string $source_site_url
	): void {
		if ( array() === $source_ids ) {
			return;
		}

		$matches = get_terms(
			array(
				'taxonomy'   => $tax,
				'hide_empty' => false,
				'fields'     => 'ids',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query' => array(
					'relation' => 'AND',
					array(
						'key'     => Options::META_SOURCE_TERM_ID,
						'value'   => $source_ids,
						'compare' => 'IN',
					),
					array(
						'key'   => Options::META_SOURCE_TERM_URL,
						'value' => $source_site_url,
					),
				),
			)
		);

		if ( ! is_array( $matches ) ) {
			// A failed lookup must not memoize a miss; leave the identities
			// unresolved so the next attempt retries.
			return;
		}

		$resolved = array();

		if ( array() !== $matches ) {
			$term_ids = array_map( 'intval', $matches );

			// One read for all matches; the map-back below and the later meta
			// compare then hit cache.
			update_termmeta_cache( $term_ids );

			foreach ( $term_ids as $term_id ) {
				$source_id = absint(
					get_term_meta(
						$term_id,
						Options::META_SOURCE_TERM_ID,
						true
					)
				);

				// Ordered by name, so first-wins picks the same term the
				// per-record lookup returned.
				if ( $source_id > 0 && ! isset( $resolved[ $source_id ] ) ) {
					$resolved[ $source_id ] = $term_id;
				}
			}
		}

		$key = $this->source_term_key( $tax, $source_site_url );

		foreach ( $source_ids as $source_id ) {
			$this->source_term_ids[ $key ][ $source_id ] =
				$resolved[ $source_id ] ?? 0;
		}
	}

	/**
	 * Creates a term under the resolved destination parent with the source
	 * description, recovering the existing ID when a concurrent insert wins the
	 * term_exists race.
	 *
	 * @param array{source_term_id:int, parent:int, name:string, slug:string, description:string, assigned:bool, dest_id:int} $record Working record.
	 * @param string                                                                                                          $tax            Taxonomy slug.
	 * @param int                                                                                                             $dest_parent_id Resolved destination parent term ID, or 0.
	 * @return int|WP_Error Destination term ID, or WP_Error on insert failure.
	 */
	private function create_term(
		array $record,
		string $tax,
		int $dest_parent_id
	): int|WP_Error {
		$args = array();
		if ( '' !== $record['slug'] ) {
			$args['slug'] = $record['slug'];
		}
		if ( $dest_parent_id > 0 ) {
			$args['parent'] = $dest_parent_id;
		}
		if ( '' !== $record['description'] ) {
			$args['description'] = wp_kses_post( $record['description'] );
		}

		$inserted = wp_insert_term( $record['name'], $tax, $args );

		if ( is_wp_error( $inserted ) ) {
			// A concurrent insert can win the race with term_exists; recover
			// the existing ID from its error data. Other codes are real
			// failures.
			if ( 'term_exists' === $inserted->get_error_code() ) {
				$existing_id = absint( $inserted->get_error_data( 'term_exists' ) );
				if ( $existing_id > 0 ) {
					return $existing_id;
				}
			}
			return $inserted;
		}

		return (int) $inserted['term_id'];
	}

	/**
	 * Records the source term ID and site URL on a resolved term so later
	 * imports can remap it by source identity. Last import wins on multi-source
	 * destinations, acceptable for the block-ID remap the meta supports.
	 *
	 * @param int    $term_id         Destination term ID.
	 * @param int    $source_term_id  Source term ID; 0 skips the write.
	 * @param string $source_site_url Source site URL; empty string skips the write.
	 */
	private function write_source_term_meta(
		int $term_id,
		int $source_term_id,
		string $source_site_url
	): void {
		if ( 0 === $source_term_id || '' === $source_site_url ) {
			return;
		}

		$this->update_term_meta_if_changed(
			$term_id,
			Options::META_SOURCE_TERM_ID,
			$source_term_id
		);
		$this->update_term_meta_if_changed(
			$term_id,
			Options::META_SOURCE_TERM_URL,
			$source_site_url
		);
	}

	/**
	 * Writes term meta only when the stored value differs, mirroring core's own
	 * no-op guard. Core compares strictly, so an int value never matches the
	 * string it reads back and re-writes on every import.
	 *
	 * @param int        $term_id  Destination term ID.
	 * @param string     $meta_key Meta key to write.
	 * @param int|string $value    Value to store.
	 */
	private function update_term_meta_if_changed(
		int $term_id,
		string $meta_key,
		int|string $value
	): void {
		$stored = get_term_meta( $term_id, $meta_key, false );

		if (
			is_array( $stored )
			&& 1 === count( $stored )
			&& is_scalar( $stored[0] )
			&& (string) $stored[0] === (string) $value
		) {
			return;
		}

		update_term_meta( $term_id, $meta_key, $value );
	}
}
