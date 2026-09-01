<?php
/**
 * StageQuery — the single, storage-agnostic seam for querying posts by workflow stage.
 *
 * The workflow stage is stored in post meta (see StatusManager). To keep
 * that choice swappable for a taxonomy or custom status later, every stage-based
 * query is expressed here in stage-domain terms (in_stage, in_any_workflow,
 * counts_by_stage) and never by hand-built meta_query in the consumers. A future
 * storage change touches this class plus the StatusManager read/write methods —
 * not the ~13 query consumers. The return values are opaque WP_Query contributions:
 * callers merge them, they do not inspect them.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

use VIPWorkflows\Sequences\Sequence;

/**
 * Builds WP_Query arguments that select posts by their workflow stage.
 */
class StageQuery {

	/**
	 * WP_Query args selecting posts currently at a single stage of a sequence.
	 *
	 * @param  Sequence $sequence Sequence.
	 * @param  string   $stage     Stage key.
	 * @param  array    $args      Optional base WP_Query args to merge into.
	 * @return array WP_Query args.
	 */
	public static function in_stage( Sequence $sequence, string $stage, array $args = array() ): array {
		return self::apply( $args, $sequence, array( $stage ) );
	}

	/**
	 * WP_Query args selecting posts at any of the given stages of a sequence.
	 *
	 * @param  Sequence $sequence Sequence.
	 * @param  string[] $stages    Stage keys.
	 * @param  array    $args      Optional base WP_Query args to merge into.
	 * @return array WP_Query args.
	 */
	public static function in_stages( Sequence $sequence, array $stages, array $args = array() ): array {
		return self::apply( $args, $sequence, array_values( $stages ) );
	}

	/**
	 * WP_Query args selecting posts managed by a workflow, optionally scoped to a sequence.
	 *
	 * @param  Sequence|null $sequence Sequence to scope to, or null for any workflow.
	 * @param  array         $args      Optional base WP_Query args to merge into.
	 * @return array WP_Query args.
	 */
	public static function in_any_workflow( ?Sequence $sequence = null, array $args = array() ): array {
		if ( null === $sequence ) {
			$exists_clause = array(
				'key'     => StatusManager::SEQUENCE_META_KEY,
				'compare' => 'EXISTS',
			);
			return self::ensure_post_status( self::merge_meta( $args, array( $exists_clause ) ) );
		}

		$args = self::merge_meta( $args, array( self::sequence_clause( $sequence ) ) );
		$args = self::ensure_post_type( $args, $sequence );
		return self::ensure_post_status( $args );
	}

	/**
	 * WP_Query args selecting posts NOT managed by any workflow.
	 *
	 * The inverse of the unscoped in_any_workflow(): merges a NOT EXISTS clause on
	 * the sequence meta key so workflow-managed posts are excluded at the query
	 * level (before LIMIT), not filtered per-row in PHP afterwards. The caller's
	 * post_type / post_status / author / other meta are preserved. There is no
	 * sequence, so post_type is NOT defaulted (ensure_post_type is not called).
	 *
	 * @param  array $args Base WP_Query args to merge into.
	 * @return array WP_Query args.
	 */
	public static function not_in_any_workflow( array $args = array() ): array {
		$not_exists_clause = array(
			'key'     => StatusManager::SEQUENCE_META_KEY,
			'compare' => 'NOT EXISTS',
		);
		return self::ensure_post_status( self::merge_meta( $args, array( $not_exists_clause ) ) );
	}

	/**
	 * WP_Query args selecting posts at a stage keyed $stage in ANY workflow.
	 *
	 * Cross-sequence (unlike in_stage, which scopes to one sequence) — used by
	 * the AI tools, which query by human-readable stage key across all workflows.
	 * Merges into the caller's args (post_type / post_status / other meta stay).
	 *
	 * @param  string $stage Stage key.
	 * @param  array  $args  Base WP_Query args to merge into.
	 * @return array
	 */
	public static function by_stage_key( string $stage, array $args = array() ): array {
		$stage_clause = array(
			'key'   => StatusManager::STAGE_META_KEY,
			'value' => $stage,
		);
		return self::ensure_post_status( self::merge_meta( $args, array( $stage_clause ) ) );
	}

	/**
	 * WP_Query args selecting posts in an ACTIVE (non-terminal) stage of any of the
	 * given sequences — sequence-scoped, so a stage key that is active in one
	 * sequence but terminal in another is only matched for the sequence where it
	 * is active. Builds an OR of per-sequence (sequence AND stage-IN-active) groups.
	 *
	 * @param  Sequence[] $sequences Sequences to include.
	 * @param  array      $args       Base WP_Query args to merge into.
	 * @return array
	 */
	public static function active_across( array $sequences, array $args = array() ): array {
		$or = array( 'relation' => 'OR' );

		foreach ( $sequences as $sequence ) {
			$active = $sequence->get_active_stage_keys();
			if ( empty( $active ) ) {
				continue;
			}
			$or[] = array(
				'relation' => 'AND',
				self::sequence_clause( $sequence ),
				array(
					'key'     => StatusManager::STAGE_META_KEY,
					'value'   => array_values( $active ),
					'compare' => 'IN',
				),
			);
		}

		// No sequence has an active stage — match nothing rather than everything.
		if ( 1 === count( $or ) ) {
			$args['post__in'] = array( 0 );
			return self::ensure_post_status( $args );
		}

		return self::ensure_post_status( self::merge_meta( $args, array( $or ) ) );
	}

	/**
	 * Narrow a WP_Query (e.g. in pre_get_posts) to a single stage of a sequence.
	 *
	 * @param  \WP_Query $query     Query to mutate.
	 * @param  Sequence  $sequence Sequence.
	 * @param  string    $stage     Stage key.
	 * @return void
	 */
	public static function apply_to_admin_query( \WP_Query $query, Sequence $sequence, string $stage ): void {
		$existing = $query->get( 'meta_query' );
		if ( ! is_array( $existing ) ) {
			$existing = array();
		}
		$args = self::apply( array( 'meta_query' => $existing ), $sequence, array( $stage ) );
		$query->set( 'meta_query', $args['meta_query'] );
	}

	/**
	 * Count posts per stage for a sequence.
	 *
	 * Owns the one raw-SQL GROUP BY aggregation that a "return WP_Query args"
	 * helper cannot express, so even that swaps in a single place.
	 *
	 * @param  Sequence $sequence Sequence.
	 * @return array<string, int> Map of stage key => count (every defined stage present, 0 if none).
	 */
	public static function counts_by_stage( Sequence $sequence ): array {
		global $wpdb;

		$post_types = $sequence->get_post_types();
		$counts     = array_fill_keys( array_column( $sequence->get_statuses(), 'key' ), 0 );

		if ( empty( $post_types ) ) {
			return $counts;
		}

		$type_placeholders = implode( ',', array_fill( 0, count( $post_types ), '%s' ) );

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- aggregate stage counts; the only interpolation is a %s placeholder list built via array_fill.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT stage.meta_value AS stage_key, COUNT(*) AS cnt
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} bp ON bp.post_id = p.ID AND bp.meta_key = %s AND bp.meta_value = %d
				INNER JOIN {$wpdb->postmeta} stage ON stage.post_id = p.ID AND stage.meta_key = %s
				WHERE p.post_type IN ({$type_placeholders})
				AND p.post_status NOT IN ( 'trash', 'auto-draft', 'inherit' )
				GROUP BY stage.meta_value",
				...array_merge(
					array( StatusManager::SEQUENCE_META_KEY, $sequence->id, StatusManager::STAGE_META_KEY ),
					$post_types
				)
			)
		);
		// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		// get_results() answers null on a query error and an empty array when the
		// query simply matched nothing. Falling through on null returned the
		// all-zero map built above — a board or a summary reading "0 everywhere",
		// indistinguishable from a genuinely empty workflow, with nothing in the
		// log. A caller cannot tell those apart from the return value either, so
		// the failure is at least recorded here.
		if ( null === $rows ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Stage counts for sequence %d could not be read: %s', $sequence->id, $wpdb->last_error ) );
			return $counts;
		}

		foreach ( $rows as $row ) {
			$stage_key = $row->stage_key ?? null;
			if ( null !== $stage_key && array_key_exists( $stage_key, $counts ) ) {
				$counts[ $stage_key ] = (int) ( $row->cnt ?? 0 );
			}
		}

		return $counts;
	}

	/**
	 * Merge stage + sequence meta selection into a set of WP_Query args.
	 *
	 * @param  array    $args      Base args.
	 * @param  Sequence $sequence Sequence.
	 * @param  string[] $stages    Stage keys.
	 * @return array
	 */
	private static function apply( array $args, Sequence $sequence, array $stages ): array {
		$args = self::merge_meta( $args, self::stage_clauses( $sequence, $stages ) );
		$args = self::ensure_post_type( $args, $sequence );
		return self::ensure_post_status( $args );
	}

	/**
	 * Meta clauses selecting the sequence and one-or-more stages.
	 *
	 * @param  Sequence $sequence Sequence.
	 * @param  string[] $stages    Stage keys.
	 * @return array[] Meta clauses.
	 */
	private static function stage_clauses( Sequence $sequence, array $stages ): array {
		$stage_clause = 1 === count( $stages )
			? array(
				'key'   => StatusManager::STAGE_META_KEY,
				'value' => reset( $stages ),
			)
			: array(
				'key'     => StatusManager::STAGE_META_KEY,
				'value'   => array_values( $stages ),
				'compare' => 'IN',
			);

		return array( self::sequence_clause( $sequence ), $stage_clause );
	}

	/**
	 * Meta clause selecting one sequence.
	 *
	 * @param  Sequence $sequence Sequence.
	 * @return array
	 */
	private static function sequence_clause( Sequence $sequence ): array {
		return array(
			'key'   => StatusManager::SEQUENCE_META_KEY,
			'value' => $sequence->id,
		);
	}

	/**
	 * Combine new meta clauses with any existing meta_query under an AND relation.
	 *
	 * @param  array $args        WP_Query args (may contain 'meta_query').
	 * @param  array $new_clauses Meta clauses to add.
	 * @return array
	 */
	private static function merge_meta( array $args, array $new_clauses ): array {
		$existing = $args['meta_query'] ?? array();

		if ( empty( $existing ) ) {
			$args['meta_query'] = array_merge( array( 'relation' => 'AND' ), $new_clauses );
			return $args;
		}

		// Preserve the caller's meta_query verbatim as a nested sub-clause under a
		// top-level AND — this keeps any OR/nested relation intact instead of
		// flattening it (which would silently narrow the caller's results).
		$args['meta_query'] = array_merge(
			array(
				'relation' => 'AND',
				$existing,
			),
			$new_clauses
		);
		return $args;
	}

	/**
	 * Default post_type to the sequence's post types when the caller didn't set one.
	 *
	 * @param  array    $args      WP_Query args.
	 * @param  Sequence $sequence Sequence.
	 * @return array
	 */
	private static function ensure_post_type( array $args, Sequence $sequence ): array {
		if ( empty( $args['post_type'] ) ) {
			$args['post_type'] = $sequence->get_post_types();
		}
		return $args;
	}

	/**
	 * Default post_status to 'any' when the caller didn't set one.
	 *
	 * The workflow stage is decoupled from visibility, so a stage query must find
	 * posts regardless of post_status — otherwise WP_Query's non-admin default
	 * ('publish') would hide every pre-publish (draft) stage row. 'any' spans
	 * draft/pending/publish/private and excludes trash/auto-draft.
	 *
	 * @param  array $args WP_Query args.
	 * @return array
	 */
	private static function ensure_post_status( array $args ): array {
		if ( empty( $args['post_status'] ) ) {
			$args['post_status'] = 'any';
		}
		return $args;
	}
}
