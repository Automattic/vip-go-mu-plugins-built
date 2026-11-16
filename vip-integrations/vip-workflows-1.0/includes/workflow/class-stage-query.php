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
use VIPWorkflows\Sequences\StrandCheckFailedException;

/**
 * Builds WP_Query arguments that select posts by their workflow stage.
 */
class StageQuery {

	/**
	 * Object cache group for held_post_counts().
	 */
	public const CACHE_GROUP = 'vip_workflows_stage_counts';

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
		$args = self::apply( array( 'meta_query' => $existing ), $sequence, array( $stage ) ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- a post's workflow sequence and stage are stored in post meta (_vip_workflows_sequence_id, _vip_workflows_current_stage_key), so filtering by stage has to use meta_query.
		$query->set( 'meta_query', $args['meta_query'] );
	}

	/**
	 * The author scope to pass to counts_by_stage() for the current user.
	 *
	 * A user who can edit others' posts gets the site-wide aggregate (null); any
	 * other user is scoped to their own posts, so the per-stage counts never
	 * reveal how many of another author's unpublished posts sit at each stage.
	 * Callers reachable below edit_others_posts pass this so the three of them
	 * share one rule.
	 *
	 * @return int|null Current user id when they cannot edit others' posts, else null.
	 */
	public static function author_scope_for_current_user(): ?int {
		return current_user_can( 'edit_others_posts' ) ? null : get_current_user_id();
	}

	/**
	 * Count posts per stage for a sequence.
	 *
	 * Owns the one raw-SQL GROUP BY aggregation that a "return WP_Query args"
	 * helper cannot express, so even that swaps in a single place.
	 *
	 * @param  Sequence $sequence     Sequence.
	 * @param  int|null $author_scope Restrict the count to this author's posts, or null to count every author's posts.
	 * @return array<string, int> Map of stage key => count (every defined stage present, 0 if none).
	 */
	public static function counts_by_stage( Sequence $sequence, ?int $author_scope = null ): array {
		global $wpdb;

		$post_types = $sequence->get_post_types();
		$counts     = array_fill_keys( array_column( $sequence->get_statuses(), 'key' ), 0 );

		if ( empty( $post_types ) ) {
			return $counts;
		}

		$type_placeholders = implode( ',', array_fill( 0, count( $post_types ), '%s' ) );

		// Callers reached by a user who cannot edit others' posts pass that user's
		// id here, so the aggregate is scoped to their own posts — matching how
		// core scopes the edit.php per-status counts for such a user. A null scope
		// (the default) counts every author's posts, for trusted/admin callers.
		$author_clause = null === $author_scope ? '' : ' AND p.post_author = %d';

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- aggregate stage counts; the placeholders are $type_placeholders (a %s list built via array_fill) and the optional $author_clause (a fixed %d clause), with matching values spread in at runtime, so PHPCS cannot count them.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT stage.meta_value AS stage_key, COUNT(*) AS cnt
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} bp ON bp.post_id = p.ID AND bp.meta_key = %s AND bp.meta_value = %s
				INNER JOIN {$wpdb->postmeta} stage ON stage.post_id = p.ID AND stage.meta_key = %s
				WHERE p.post_type IN ({$type_placeholders})
				AND p.post_status NOT IN ( 'trash', 'auto-draft', 'inherit' ){$author_clause}
				GROUP BY stage.meta_value",
				...array_merge(
					array( StatusManager::SEQUENCE_META_KEY, (string) $sequence->id, StatusManager::STAGE_META_KEY ),
					$post_types,
					null === $author_scope ? array() : array( $author_scope )
				)
			)
		);
		// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber

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
	 * Every post that holds a sequence, optionally narrowed to some of its stages.
	 *
	 * This answers "would this sequence write strand anybody?", so it is
	 * deliberately wider than every other query here:
	 *
	 * - No post type filter. A post whose type was later dropped from the
	 *   sequence, or whose type is no longer registered at all, still carries
	 *   the meta and would still be stranded.
	 * - Every status except `inherit`. Trash counts, because a restored post
	 *   comes back carrying its meta. Auto-drafts count, because the
	 *   workflow-required modal seats a brand-new post in a sequence before its
	 *   first save. Only revisions are excluded, and they never carry this meta.
	 *
	 * That is why this is raw SQL rather than a WP_Query builder: WP_Query's
	 * `'any'` post type and status both silently skip anything registered with
	 * `exclude_from_search`, and an unregistered type cannot be named at all.
	 *
	 * @param  int      $sequence_id Sequence ID.
	 * @param  string[] $stage_keys  Stage keys to narrow to; empty for every stage.
	 * @param  int      $limit       How many posts to list (the total is always exact).
	 * @return array{total: int, posts: array<int, array{id: int, title: string, status: string, stage: string}>, stages: array<string, int>}
	 *               `stages` maps each occupied requested stage key to its post
	 *               count; it is empty when no stage keys were given.
	 * @throws StrandCheckFailedException When a query fails. The caller is guarding a
	 *                           write, so an unreadable answer must not pass as
	 *                           "nobody is affected".
	 */
	public static function posts_holding_sequence( int $sequence_id, array $stage_keys = array(), int $limit = 20 ): array {
		global $wpdb;

		$stage_keys   = array_values( array_unique( array_map( 'strval', $stage_keys ) ) );
		$stage_clause = '';
		// The sequence id is compared as a string: meta_value is text, and a
		// numeric comparison can't use the meta_value index.
		$params = array( StatusManager::SEQUENCE_META_KEY, (string) $sequence_id, StatusManager::STAGE_META_KEY );

		if ( ! empty( $stage_keys ) ) {
			$stage_clause = ' AND stage.meta_value IN (' . implode( ',', array_fill( 0, count( $stage_keys ), '%s' ) ) . ')';
			$params       = array_merge( $params, $stage_keys );
		}

		// A post with the sequence meta but no stage meta is still held by the
		// sequence (deleting it would strand the post), so the stage join is a
		// LEFT JOIN unless the caller narrowed to stages.
		$stage_join = empty( $stage_keys ) ? 'LEFT JOIN' : 'INNER JOIN';

		$from = self::held_posts_from( $stage_join ) . $stage_clause;

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- write guard; must read live rows. $from holds only table names and a %s placeholder list built via array_fill, with matching values spread in from $params.
		$total = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(DISTINCT p.ID) {$from}", ...$params ) );

		// Checked through last_error, not the return value: on an SQL error
		// get_var() answers null and get_results() answers an empty array, both
		// of which also mean "nothing found".
		if ( '' !== (string) $wpdb->last_error ) {
			throw new StrandCheckFailedException(
				esc_html( sprintf( 'Could not check which posts hold sequence %d: %s', $sequence_id, $wpdb->last_error ) )
			);
		}

		$total = (int) $total;
		$posts = array();

		if ( $total > 0 && $limit > 0 ) {
			$rows = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT p.ID AS id, p.post_title AS title, p.post_status AS status, MAX(stage.meta_value) AS stage {$from} GROUP BY p.ID ORDER BY p.ID ASC LIMIT %d",
					...array_merge( $params, array( $limit ) )
				)
			);

			if ( null === $rows || '' !== (string) $wpdb->last_error ) {
				throw new StrandCheckFailedException(
					esc_html( sprintf( 'Could not list the posts holding sequence %d: %s', $sequence_id, $wpdb->last_error ) )
				);
			}

			foreach ( $rows as $row ) {
				$posts[] = array(
					'id'     => (int) $row->id,
					'title'  => (string) $row->title,
					'status' => (string) $row->status,
					'stage'  => (string) ( $row->stage ?? '' ),
				);
			}
		}

		// Which of the requested stages are occupied, counted over every post, not
		// just the capped list: a refusal that names only the stages in the first N
		// posts sends the admin round again for the stage it left out.
		$stages = array();

		if ( $total > 0 && ! empty( $stage_keys ) ) {
			$stage_rows = $wpdb->get_results(
				$wpdb->prepare( "SELECT stage.meta_value AS stage, COUNT(DISTINCT p.ID) AS cnt {$from} GROUP BY stage.meta_value", ...$params )
			);

			if ( null === $stage_rows || '' !== (string) $wpdb->last_error ) {
				throw new StrandCheckFailedException(
					esc_html( sprintf( 'Could not count the stages holding sequence %d: %s', $sequence_id, $wpdb->last_error ) )
				);
			}

			foreach ( $stage_rows as $row ) {
				$stages[ (string) $row->stage ] = (int) $row->cnt;
			}
		}
		// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

		return array(
			'total'  => $total,
			'posts'  => $posts,
			'stages' => $stages,
		);
	}

	/**
	 * The FROM and WHERE that define "the posts holding a sequence", shared by
	 * the write guard (posts_holding_sequence()) and the display counts
	 * (held_post_counts()), so the editor's locks and the refusals they
	 * predict can't drift apart.
	 *
	 * Placeholders, in order: the sequence meta key, the sequence id (as a
	 * string; meta_value is text, and a numeric comparison can't use its
	 * index), and the stage meta key.
	 *
	 * @param  string $stage_join `LEFT JOIN` to keep posts with no stage meta, or `INNER JOIN`.
	 * @return string
	 */
	private static function held_posts_from( string $stage_join ): string {
		global $wpdb;

		return "FROM {$wpdb->posts} p
			INNER JOIN {$wpdb->postmeta} seq ON seq.post_id = p.ID AND seq.meta_key = %s AND seq.meta_value = %s
			{$stage_join} {$wpdb->postmeta} stage ON stage.post_id = p.ID AND stage.meta_key = %s
			WHERE p.post_status <> 'inherit'";
	}

	/**
	 * How many posts hold a sequence, in all and at each stage, for display.
	 *
	 * The read-side counterpart of posts_holding_sequence(), over the same set
	 * of posts (every type, every status but `inherit`, with or without a stage
	 * meta row), in one query, cached until any post or post meta changes.
	 * Each post counts once, at its stage. Only for showing the numbers: the
	 * write guards call posts_holding_sequence(), which always reads live rows.
	 *
	 * @param  int $sequence_id Sequence ID.
	 * @return array{total: int, stages: array<string, int>}|null Null when the query fails.
	 */
	public static function held_post_counts( int $sequence_id ): ?array {
		global $wpdb;

		$cache_key = 'held_post_counts:' . $sequence_id . ':' . wp_cache_get_last_changed( 'posts' );
		$cached    = wp_cache_get( $cache_key, self::CACHE_GROUP );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- one aggregate, cached below against the posts last_changed key, which WordPress bumps on every post and post meta write. held_posts_from() holds only table names and placeholders.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT held.stage AS stage, COUNT(*) AS cnt FROM (SELECT p.ID, MAX(stage.meta_value) AS stage '
					. self::held_posts_from( 'LEFT JOIN' )
					. ' GROUP BY p.ID) held GROUP BY held.stage',
				StatusManager::SEQUENCE_META_KEY,
				(string) $sequence_id,
				StatusManager::STAGE_META_KEY
			)
		);
		// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

		if ( null === $rows || '' !== (string) $wpdb->last_error ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post counts for sequence %d could not be read: %s', $sequence_id, $wpdb->last_error ) );
			return null;
		}

		$counts = array(
			'total'  => 0,
			'stages' => array(),
		);
		foreach ( $rows as $row ) {
			$counts['total'] += (int) $row->cnt;
			if ( null !== $row->stage ) {
				$counts['stages'][ (string) $row->stage ] = (int) $row->cnt;
			}
		}

		wp_cache_set( $cache_key, $counts, self::CACHE_GROUP );

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
			$args['meta_query'] = array_merge( array( 'relation' => 'AND' ), $new_clauses ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- a post's workflow sequence and stage are stored in post meta (_vip_workflows_sequence_id, _vip_workflows_current_stage_key), so filtering by stage has to use meta_query, here by adding the sequence and stage clauses.
			return $args;
		}

		// Preserve the caller's meta_query verbatim as a nested sub-clause under a
		// top-level AND — this keeps any OR/nested relation intact instead of
		// flattening it (which would silently narrow the caller's results).
		$args['meta_query'] = array_merge( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- a post's workflow sequence and stage are stored in post meta (_vip_workflows_sequence_id, _vip_workflows_current_stage_key), so filtering by stage has to use meta_query, here with the caller's own meta_query nested under the sequence and stage clauses.
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
