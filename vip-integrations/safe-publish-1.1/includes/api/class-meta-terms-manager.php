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
use Safe_Publish\Utils\Term_Conflict;
use Safe_Publish\Utils\Term_Reconcile_Report;
use WP_Error;
use WP_Term;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Meta_Terms_Manager Class.
 *
 * Responsible for managing post meta and taxonomy terms.
 */
final class Meta_Terms_Manager {

	/**
	 * Stands in for a parent an import would create. Only plan_terms() passes
	 * it; the write path resolves parents first, so it always has a real ID.
	 */
	private const PARENT_PENDING = -1;

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
	 * Field conflicts recorded per reconciled term, keyed by source site URL
	 * plus taxonomy, then by destination term ID. A term shared across posts is
	 * reconciled once and its conflicts replayed, so every affected post
	 * reports.
	 *
	 * @var array<string, array<int, list<Term_Conflict>>>
	 */
	private array $reconciled_terms = array();

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
				$key = sanitize_text_field( (string) $meta_key );
				// Slashed only for the write: The compare below reads the
				// stored value back unslashed.
				$result = update_post_meta(
					$post_id,
					$key,
					wp_slash( $meta_value )
				);

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
	 * ordered parent-first, resolved to destination terms (reconciling a match
	 * this plugin created, or creating one), and the assigned terms are set on
	 * the post; ancestors are created but not attached. A taxonomy sent as an
	 * empty list is cleared on the post, so a removal on the source propagates.
	 * When `$source_site_url` is non-empty and an item carries a
	 * source_term_id, the source ID and URL are recorded on the resolved term
	 * so later imports can remap by source identity.
	 *
	 * A taxonomy the destination does not register is skipped rather than
	 * failing the post: Only a site admin registering it can fix that, so the
	 * caller records it as a degradation and imports the rest. A term field
	 * that cannot be reconciled degrades the same way. A taxonomy sent empty
	 * carries nothing to attach, so it is skipped without a degradation.
	 *
	 * @param int                   $post_id         Post ID to update terms for.
	 * @param array|object          $terms           Terms to set, keyed by taxonomy.
	 * @param string                $source_site_url Source site URL paired with any
	 *                                               source_term_id meta written. Empty
	 *                                               string disables source-meta writes.
	 * @param Term_Reconcile_Report $report          Collects what the reconcile could
	 *                                               not write and the terms it brought
	 *                                               current.
	 * @return array<string, string[]>|WP_Error Skipped taxonomy slugs mapped to
	 *                                          the term names left unattached,
	 *                                          or WP_Error when a term cannot be
	 *                                          created or assigned.
	 */
	public function update_terms(
		int $post_id,
		array|object $terms,
		string $source_site_url = '',
		Term_Reconcile_Report $report = new Term_Reconcile_Report()
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
				// An empty list leaves nothing unattached, so there is no loss.
				if ( array() !== $items ) {
					$skipped[ $tax ] = $this->term_names( $items );
				}
				continue;
			}

			$result = $this->assign_taxonomy_terms(
				$post_id,
				$tax,
				$items,
				$source_site_url,
				$report
			);

			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}

		return $skipped;
	}

	/**
	 * Reports what update_terms() would do to each term, writing nothing.
	 *
	 * Runs the same pairing ladder as the import — normalize, order
	 * parent-first, match by source identity, slug, then name under the
	 * resolved parent — so a caller previewing an import classifies the terms
	 * the way the import will. A taxonomy the destination does not register is
	 * omitted, as nothing would be resolved for it.
	 *
	 * @param array|object $terms           Terms to plan, keyed by taxonomy.
	 * @param string       $source_site_url Source site URL scoping identity
	 *                                      matches and the origin gate.
	 * @return array<string, list<array{record:array, term:WP_Term|null, eligible:bool, changes:string[], blocked:array<string, string>}>>
	 *         Per taxonomy, one parent-first entry per record.
	 */
	public function plan_terms(
		array|object $terms,
		string $source_site_url
	): array {
		$plans = array();

		foreach ( (array) $terms as $raw_tax => $term_items ) {
			$tax = sanitize_key( (string) $raw_tax );

			if ( '' === $tax || ! taxonomy_exists( $tax ) ) {
				continue;
			}

			$plans[ $tax ] = $this->plan_taxonomy_terms(
				is_array( $term_items ) ? $term_items : (array) $term_items,
				$tax,
				$source_site_url
			);
		}

		return $plans;
	}

	/**
	 * Plans one taxonomy's items, mapping each source term ID to the
	 * destination term it pairs with, or to PARENT_PENDING when the import
	 * would create it, so a child's parent is known before the child.
	 *
	 * @param array  $items           Raw term items for the taxonomy.
	 * @param string $tax             Taxonomy slug (already validated).
	 * @param string $source_site_url Source site URL.
	 * @return list<array{record:array, term:WP_Term|null, eligible:bool, changes:string[], blocked:array<string, string>}>
	 */
	private function plan_taxonomy_terms(
		array $items,
		string $tax,
		string $source_site_url
	): array {
		$records = array();
		foreach ( $items as $item ) {
			$records[] = $this->normalize_term_record( $item );
		}

		$this->prime_source_term_ids( $records, $tax, $source_site_url );

		$source_to_dest = array();
		$plans          = array();

		foreach ( $this->order_parent_first( $records ) as $record ) {
			$source_parent  = $record['parent'] ?? 0;
			$dest_parent_id = $source_parent > 0
				? ( $source_to_dest[ $source_parent ] ?? 0 )
				: 0;

			$plan = $this->plan_term(
				$record,
				$tax,
				$dest_parent_id,
				$source_site_url
			);

			$plans[] = $plan;

			if ( $record['source_term_id'] > 0 ) {
				$source_to_dest[ $record['source_term_id'] ] =
					$plan['term'] instanceof WP_Term
						? (int) $plan['term']->term_id
						: self::PARENT_PENDING;
			}
		}

		return $plans;
	}

	/**
	 * Plans one record: The destination term it pairs with, whether the origin
	 * gate lets the import reconcile it, and which fields would be written or
	 * blocked. A record with no pair would be created with the source's fields;
	 * one naming a destination term is assigned as is, never reconciled.
	 *
	 * @param array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int} $record Working record.
	 * @param string                                                                                                            $tax             Taxonomy slug.
	 * @param int                                                                                                               $dest_parent_id  Resolved destination parent term ID, 0, or PARENT_PENDING.
	 * @param string                                                                                                            $source_site_url Source site URL.
	 * @return array{record:array, term:WP_Term|null, eligible:bool, changes:string[], blocked:array<string, string>}
	 */
	private function plan_term(
		array $record,
		string $tax,
		int $dest_parent_id,
		string $source_site_url
	): array {
		$plan = array(
			'record'   => $record,
			'term'     => null,
			'eligible' => false,
			'changes'  => array(),
			'blocked'  => array(),
		);

		$supplied = $record['dest_id'] > 0;
		$term_id  = $supplied
			? $record['dest_id']
			: $this->find_existing_term(
				$record,
				$tax,
				$dest_parent_id,
				$source_site_url
			);

		if ( 0 === $term_id ) {
			return $plan;
		}

		$term = get_term( $term_id, $tax );

		if ( ! ( $term instanceof WP_Term ) ) {
			return $plan;
		}

		$plan['term'] = $term;

		if ( $supplied || '' === $source_site_url ) {
			return $plan;
		}

		$origin = get_term_meta( $term_id, Options::META_TERM_ORIGIN_URL, true );

		if ( (string) $origin !== $source_site_url ) {
			return $plan;
		}

		$plan['eligible'] = true;

		$report          = new Term_Reconcile_Report();
		$plan['changes'] = array_keys(
			$this->term_field_changes( $term, $record, $dest_parent_id, $report )
		);

		foreach ( $report->conflicts() as $conflict ) {
			$plan['blocked'][ $conflict->field ] = $conflict->reason;
		}

		return $plan;
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
	 * @param int                   $post_id         Post ID to assign terms to.
	 * @param string                $tax             Taxonomy slug (already validated).
	 * @param array                 $items           Raw term items for the taxonomy.
	 * @param string                $source_site_url Source site URL for paired meta writes.
	 * @param Term_Reconcile_Report $report          Collects the reconcile outcome.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	private function assign_taxonomy_terms(
		int $post_id,
		string $tax,
		array $items,
		string $source_site_url,
		Term_Reconcile_Report $report
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
			$source_parent  = $record['parent'] ?? 0;
			$dest_parent_id = $source_parent > 0
				? ( $source_to_dest[ $source_parent ] ?? 0 )
				: 0;

			$dest_id = $this->resolve_term(
				$record,
				$tax,
				$dest_parent_id,
				$source_site_url,
				$report
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
	 * describes a source term to reuse or create. An absent parent or
	 * description stays null, distinct from the root and the empty string a
	 * current source sends.
	 *
	 * @param mixed $item Raw item: int, string, array, or object.
	 * @return array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int}
	 */
	private function normalize_term_record( mixed $item ): array {
		$record = array(
			'source_term_id' => 0,
			'parent'         => null,
			'name'           => '',
			'slug'           => '',
			'description'    => null,
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
		$record['parent']         = isset( $it['parent'] )
			? absint( $it['parent'] )
			: null;
		$record['description']    = isset( $it['description'] )
			? (string) $it['description']
			: null;
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
	 * @param list<array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int}> $records Working records.
	 * @return list<array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int}>
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

				$parent = $records[ $index ]['parent'] ?? 0;
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
	 * an existing match, or a newly created term. A match this plugin created
	 * for the same source is reconciled to the record's fields. Writes
	 * source-term metadata on the resolved term when a source ID and site URL
	 * are known.
	 *
	 * @param array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int} $record Working record.
	 * @param string                                                                                                            $tax             Taxonomy slug (already validated).
	 * @param int                                                                                                               $dest_parent_id  Resolved destination parent term ID, or 0.
	 * @param string                                                                                                            $source_site_url Source site URL for paired meta writes.
	 * @param Term_Reconcile_Report                                                                                             $report          Collects the reconcile outcome.
	 * @return int|WP_Error Destination term ID (0 when unresolvable), or WP_Error
	 *                      on insert failure.
	 */
	private function resolve_term(
		array $record,
		string $tax,
		int $dest_parent_id,
		string $source_site_url,
		Term_Reconcile_Report $report
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

			if ( $term_id > 0 ) {
				$this->reconcile_term_fields(
					$term_id,
					$record,
					$tax,
					$dest_parent_id,
					$source_site_url,
					$report
				);
			}
		}

		if ( 0 === $term_id && '' !== $record['name'] ) {
			$created = $this->create_term(
				$record,
				$tax,
				$dest_parent_id,
				$source_site_url
			);
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
	 * @param array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int} $record Working record.
	 * @param string                                                                                                            $tax             Taxonomy slug.
	 * @param int                                                                                                               $dest_parent_id  Resolved destination parent term ID.
	 * @param string                                                                                                            $source_site_url Source site URL scoping the identity match.
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

		// A term cannot already sit under a parent that does not exist, so a
		// pending parent skips the lookup rather than querying for one.
		if ( '' !== $record['name'] && self::PARENT_PENDING !== $dest_parent_id ) {
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
	 * Updates a matched term's name, description, and parent to the record's.
	 *
	 * Gated on the origin marker, so only a term this plugin created for this
	 * same source is touched; every other one is reused unchanged, including
	 * the authoring site's own in a two-way setup. The slug is never
	 * reconciled, keeping destination URLs stable and leaving the dedup
	 * fallback intact.
	 *
	 * A field the record omits is left alone, since a source running an older
	 * plugin version sends neither description nor parent. A field it sends
	 * empty is applied: A cleared description clears, and a source root
	 * flattens the term, so an inverted hierarchy converges rather than
	 * deadlocking on the loop guard.
	 *
	 * A field that cannot be written is collected as a conflict and skipped, so
	 * the post still imports. The write is deliberately independent of the
	 * post's rollback: Other posts already share the term, so undoing it is not
	 * safe.
	 *
	 * @param int                                                                                                               $term_id Matched destination term ID.
	 * @param array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int} $record          Working record.
	 * @param string                                                                                                            $tax             Taxonomy slug.
	 * @param int                                                                                                               $dest_parent_id  Resolved destination parent term ID, or 0.
	 * @param string                                                                                                            $source_site_url Source site URL scoping the origin gate.
	 * @param Term_Reconcile_Report                                                                                             $report          Collects the reconcile outcome.
	 */
	private function reconcile_term_fields(
		int $term_id,
		array $record,
		string $tax,
		int $dest_parent_id,
		string $source_site_url,
		Term_Reconcile_Report $report
	): void {
		if ( '' === $source_site_url ) {
			return;
		}

		$key = $this->source_term_key( $tax, $source_site_url );

		// Reconcile once per run: Later posts only replay the conflicts.
		if ( isset( $this->reconciled_terms[ $key ][ $term_id ] ) ) {
			$report->add_conflicts( $this->reconciled_terms[ $key ][ $term_id ] );
			return;
		}

		$this->reconciled_terms[ $key ][ $term_id ] = array();

		$origin = get_term_meta(
			$term_id,
			Options::META_TERM_ORIGIN_URL,
			true
		);
		$term   = get_term( $term_id, $tax );

		if (
			(string) $origin !== $source_site_url
			|| ! ( $term instanceof WP_Term )
		) {
			return;
		}

		$term_report = new Term_Reconcile_Report();
		$changes     = $this->term_field_changes(
			$term,
			$record,
			$dest_parent_id,
			$term_report
		);

		if ( array() !== $changes ) {
			// Core unslashes as it saves, so an unslashed backslash would be
			// dropped and the compare would never converge.
			$updated = wp_update_term( $term_id, $tax, wp_slash( $changes ) );

			if ( is_wp_error( $updated ) ) {
				$term_report->add_conflict(
					Term_Conflict::update_failed(
						$term,
						$record['source_term_id'],
						implode( ', ', array_keys( $changes ) )
					)
				);
			}
		}

		$conflicts = $term_report->conflicts();

		$this->reconciled_terms[ $key ][ $term_id ] = $conflicts;

		if ( array() === $conflicts ) {
			// The term now matches the source, so another post's conflict for
			// it is stale. Only a source ID keys those rows.
			if ( $record['source_term_id'] > 0 ) {
				$report->mark_resolved( $record['source_term_id'] );
			}
			return;
		}

		$report->add_conflicts( $conflicts );
	}

	/**
	 * Collects the term fields the record changes, resolving the parent first
	 * so the name is checked against the siblings the term will end up among.
	 *
	 * @param WP_Term                                                                                                           $term Term being reconciled.
	 * @param array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int} $record         Working record.
	 * @param int                                                                                                               $dest_parent_id Resolved destination parent term ID, or 0.
	 * @param Term_Reconcile_Report                                                                                             $report         Collects the fields left unwritten.
	 * @return array<string, string|int> wp_update_term() arguments; empty when
	 *                                   nothing changed.
	 */
	private function term_field_changes(
		WP_Term $term,
		array $record,
		int $dest_parent_id,
		Term_Reconcile_Report $report
	): array {
		$changes = array();

		$parent = $this->reconciled_parent(
			$term,
			$record,
			$dest_parent_id,
			$report
		);

		if ( null !== $parent ) {
			$changes['parent'] = $parent;
		}

		if ( '' !== $record['name'] && $record['name'] !== $term->name ) {
			$taken = $this->name_is_taken(
				$record['name'],
				$term,
				$parent ?? (int) $term->parent
			);

			if ( $taken ) {
				$report->add_conflict(
					Term_Conflict::name_taken(
						$term,
						$record['source_term_id']
					)
				);
			} else {
				$changes['name'] = $record['name'];
			}
		}

		if ( null !== $record['description'] ) {
			$description = wp_kses_post( $record['description'] );

			$narrowed = self::narrow_description( $record['description'] );

			// Core narrows a term description as it saves, so compare that
			// form too; richer markup would rewrite on every import.
			if (
				$description !== $term->description
				&& $narrowed !== $term->description
			) {
				$changes['description'] = $description;
			}
		}

		return $changes;
	}

	/**
	 * Narrows a source description to the form core stores on a term.
	 *
	 * @param string $description Source term description.
	 * @return string Narrowed description.
	 */
	public static function narrow_description( string $description ): string {
		return wp_kses(
			wp_kses_post( $description ),
			'pre_term_description'
		);
	}

	/**
	 * Resolves the parent to re-parent the term to, or null to leave it as is.
	 *
	 * A source root flattens the term, while a parent the record omits leaves
	 * the destination hierarchy alone. A parent that cannot be mapped degrades
	 * rather than dropping the term to the root.
	 *
	 * @param WP_Term                                                                                                           $term Term being reconciled.
	 * @param array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int} $record         Working record.
	 * @param int                                                                                                               $dest_parent_id Resolved destination parent term ID, 0, or PARENT_PENDING.
	 * @param Term_Reconcile_Report                                                                                             $report         Collects an unresolvable or looping parent.
	 * @return int|null New parent term ID, PARENT_PENDING, or null when the parent stands.
	 */
	private function reconciled_parent(
		WP_Term $term,
		array $record,
		int $dest_parent_id,
		Term_Reconcile_Report $report
	): ?int {
		$tax = (string) $term->taxonomy;

		if ( null === $record['parent'] || ! is_taxonomy_hierarchical( $tax ) ) {
			return null;
		}

		if ( 0 === $record['parent'] ) {
			// A term already at the top level needs no write.
			return 0 !== (int) $term->parent ? 0 : null;
		}

		// The import creates the parent before it reaches this term, so the
		// move resolves; only a plan sees it unresolved.
		if ( self::PARENT_PENDING === $dest_parent_id ) {
			return self::PARENT_PENDING;
		}

		if ( 0 === $dest_parent_id ) {
			$report->add_conflict(
				Term_Conflict::parent_unresolved(
					$term,
					$record['source_term_id']
				)
			);
			return null;
		}

		if ( $dest_parent_id === (int) $term->parent ) {
			return null;
		}

		// Core's loop guard silently re-roots the term instead of failing, so
		// reject a parent that is the term itself or one of its descendants.
		$ancestors = array_map(
			'intval',
			get_ancestors( $dest_parent_id, $tax, 'taxonomy' )
		);

		if (
			$dest_parent_id === (int) $term->term_id
			|| in_array( (int) $term->term_id, $ancestors, true )
		) {
			$report->add_conflict(
				Term_Conflict::parent_loop(
					$term,
					$record['source_term_id']
				)
			);
			return null;
		}

		return $dest_parent_id;
	}

	/**
	 * Reports whether another term already holds the name: Per taxonomy when
	 * flat, per parent when hierarchical.
	 *
	 * Deliberately stricter than wp_update_term(), whose only uniqueness gate
	 * is a slug check the reconcile never trips. Same-named siblings are legal,
	 * but they would leave the name fallback in find_existing_term() picking
	 * between them arbitrarily, so the rename degrades instead.
	 *
	 * @param string  $name      Name the term would take.
	 * @param WP_Term $term      Term being reconciled.
	 * @param int     $parent_id Parent the term will sit under.
	 * @return bool True when another term already uses the name.
	 */
	private function name_is_taken(
		string $name,
		WP_Term $term,
		int $parent_id
	): bool {
		// Nothing sits under a parent that does not exist yet.
		if ( self::PARENT_PENDING === $parent_id ) {
			return false;
		}

		$tax  = (string) $term->taxonomy;
		$args = array(
			'taxonomy'   => $tax,
			'name'       => $name,
			'hide_empty' => false,
			// Two, since the term itself matches a rename that only changes
			// case: The name comparison is case-insensitive in the database.
			'number'     => 2,
			'fields'     => 'ids',
		);

		if ( is_taxonomy_hierarchical( $tax ) ) {
			$args['parent'] = $parent_id;
		}

		$matches = get_terms( $args );

		if ( ! is_array( $matches ) ) {
			return false;
		}

		foreach ( $matches as $match ) {
			if ( (int) $match !== (int) $term->term_id ) {
				return true;
			}
		}

		return false;
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
	 * @param list<array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int}> $records Working records.
	 * @param string                                                                                                                  $tax             Taxonomy slug.
	 * @param string                                                                                                                  $source_site_url Source site URL scoping the identity match.
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
	 * description, marking it with its origin, and recovering the existing ID
	 * when a concurrent insert wins the term_exists race.
	 *
	 * Only a term core reports as created is marked: Its second recovery path
	 * returns an older duplicate as a success, and deliberately skips the
	 * created_term action, so the marker cannot land on a term this plugin did
	 * not create.
	 *
	 * @param array{source_term_id:int, parent:?int, name:string, slug:string, description:?string, assigned:bool, dest_id:int} $record Working record.
	 * @param string                                                                                                            $tax             Taxonomy slug.
	 * @param int                                                                                                               $dest_parent_id  Resolved destination parent term ID, or 0.
	 * @param string                                                                                                            $source_site_url Source site URL recorded as the term's origin.
	 * @return int|WP_Error Destination term ID, or WP_Error on insert failure.
	 */
	private function create_term(
		array $record,
		string $tax,
		int $dest_parent_id,
		string $source_site_url
	): int|WP_Error {
		$args        = array();
		$description = $record['description'] ?? '';
		if ( '' !== $record['slug'] ) {
			$args['slug'] = $record['slug'];
		}
		if ( $dest_parent_id > 0 ) {
			$args['parent'] = $dest_parent_id;
		}
		if ( '' !== $description ) {
			$args['description'] = wp_kses_post( $description );
		}

		$created_ids = array();
		$capture     = static function ( int $created_id ) use ( &$created_ids ): void {
			$created_ids[] = $created_id;
		};

		add_action( 'created_term', $capture );
		$inserted = wp_insert_term(
			wp_slash( $record['name'] ),
			$tax,
			wp_slash( $args )
		);
		remove_action( 'created_term', $capture );

		if ( is_wp_error( $inserted ) ) {
			// A concurrent insert can win the race with term_exists; recover
			// the existing ID from its error data. Other codes are real
			// failures.
			if ( 'term_exists' === $inserted->get_error_code() ) {
				$existing_id = absint( $inserted->get_error_data( 'term_exists' ) );
				if ( $existing_id > 0 ) {
					// Recovered, not created: Leave it unmarked so reconcile
					// never overwrites a term this plugin does not own.
					return $existing_id;
				}
			}
			return $inserted;
		}

		$term_id = (int) $inserted['term_id'];

		if ( in_array( $term_id, $created_ids, true ) ) {
			$this->mark_term_origin( $term_id, $source_site_url );
		}

		return $term_id;
	}

	/**
	 * Records the source a term was created from, once. A term already carrying
	 * an origin keeps it, so the first importer stays its owner.
	 *
	 * @param int    $term_id         Destination term ID.
	 * @param string $source_site_url Source site URL; empty string skips the write.
	 */
	private function mark_term_origin(
		int $term_id,
		string $source_site_url
	): void {
		if ( '' === $source_site_url ) {
			return;
		}

		$stored = get_term_meta(
			$term_id,
			Options::META_TERM_ORIGIN_URL,
			true
		);

		if ( '' !== (string) $stored ) {
			return;
		}

		update_term_meta(
			$term_id,
			Options::META_TERM_ORIGIN_URL,
			wp_slash( $source_site_url )
		);
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

		// Slashed for the write only: The compare above reads back unslashed.
		update_term_meta( $term_id, $meta_key, wp_slash( $value ) );
	}
}
