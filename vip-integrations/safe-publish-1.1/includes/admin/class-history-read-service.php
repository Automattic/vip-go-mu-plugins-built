<?php
/**
 * Reads stored import sessions and items.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Import_Items_Table;
use Safe_Publish\Utils\Imports_Table;
use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads history rows without changing their stored values or payloads.
 *
 * Callers own authorization. These storage reads do not expose an endpoint or
 * implicitly select a connected source. Source-scoped reads use the supplied
 * identity. Failed single-row queries retain the historical missing-row
 * semantics.
 */
final class History_Read_Service {

	/**
	 * Retrieves a single session by ID with item counts projected from the
	 * items table.
	 *
	 * @param array{session_id: int} $input Session ID, including zero; no coercion.
	 * @return array|WP_Error Session row with total_items, successful, updated
	 *                        and failed counts, or invalid/missing ID error.
	 */
	public function get_session( array $input ): array|WP_Error {
		$session_id = $input['session_id'] ?? null;

		if ( ! is_int( $session_id ) ) {
			return new WP_Error(
				'invalid_session_id',
				__( 'Invalid import session ID', 'safe-publish' )
			);
		}

		global $wpdb;

		$imports = Imports_Table::table_name();
		$items   = Import_Items_Table::table_name();

		$counts = 'COUNT(it.id) AS total_items,'
			. " COALESCE(SUM(it.status IN ('success', 'updated')), 0)"
			. ' AS successful,'
			. " COALESCE(SUM(it.status = 'updated'), 0) AS updated,"
			. " COALESCE(SUM(it.status = 'error'), 0) AS failed";

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT i.*, {$counts} FROM `{$imports}` i"
					. " LEFT JOIN `{$items}` it ON it.session_id = i.id"
					. ' WHERE i.id = %d GROUP BY i.id',
				$session_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return is_array( $row ) ? $row : new WP_Error(
			'session_not_found',
			__( 'Import session not found', 'safe-publish' )
		);
	}

	/**
	 * Retrieves all items for a session, excluding the content_changes LONGTEXT
	 * column.
	 *
	 * The has_previous_content flag is read directly so callers can decide
	 * whether to lazily fetch the full payload.
	 *
	 * @param array{session_id: int} $input Session ID, including zero; no coercion.
	 * @return array[]|WP_Error Item rows in ID order, or invalid ID error.
	 *                        Unknown sessions and failed queries return [].
	 */
	public function get_session_items( array $input ): array|WP_Error {
		$session_id = $input['session_id'] ?? null;

		if ( ! is_int( $session_id ) ) {
			return new WP_Error(
				'invalid_session_id',
				__( 'Invalid import session ID', 'safe-publish' )
			);
		}

		global $wpdb;

		$table = Import_Items_Table::table_name();
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT id, session_id, title, source_post_id, status, post_id,'
					. ' error_message, has_previous_content, rolled_back,'
					. " import_date_gmt FROM `{$table}` WHERE session_id = %d"
					. ' ORDER BY id ASC',
				$session_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Retrieves a single item by ID.
	 *
	 * @param array{item_id: int} $input Item ID; no coercion.
	 * @return array|WP_Error Full item row, or invalid/missing ID error.
	 */
	public function get_item( array $input ): array|WP_Error {
		$item_id = $input['item_id'] ?? null;

		if ( ! is_int( $item_id ) ) {
			return new WP_Error(
				'invalid_item_id',
				__( 'Invalid import item ID', 'safe-publish' )
			);
		}

		global $wpdb;

		$table = Import_Items_Table::table_name();
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM `{$table}` WHERE id = %d",
				$item_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return is_array( $row ) ? $row : new WP_Error(
			'item_not_found',
			__( 'Import item not found', 'safe-publish' )
		);
	}

	/**
	 * Looks up the most recent active item row for a given imported post.
	 *
	 * Rolled-back rows are excluded so the result reflects the post's
	 * current content.
	 *
	 * @param array $input Read parameters.
	 * @psalm-param array{post_id: int} $input
	 * @return array|WP_Error Item row or missing/invalid input error.
	 */
	public function get_item_for_post( array $input ): array|WP_Error {
		$post_id = $input['post_id'] ?? null;

		if ( ! is_int( $post_id ) ) {
			return new WP_Error(
				'invalid_history_query',
				__( 'Invalid import history query', 'safe-publish' )
			);
		}
		global $wpdb;

		$table = Import_Items_Table::table_name();
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM `{$table}` WHERE post_id = %d"
					. ' AND rolled_back = 0'
					. ' ORDER BY id DESC LIMIT 1',
				$post_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return is_array( $row ) ? $row : new WP_Error(
			'item_not_found',
			__( 'Import item not found', 'safe-publish' )
		);
	}

	/**
	 * Looks up active items for a page of source post IDs in one query. Backed
	 * by the (source_post_id, import_date_gmt) index.
	 *
	 * The dedup subquery is restricted to the same source too, so another
	 * source's newer success can't hide this source's active row. An empty
	 * $source_site_url matches only sessions recorded without one.
	 *
	 * @param array $input Read parameters.
	 * @psalm-param array{source_site_url: string, source_ids: int[]} $input
	 * @return array<int, array>|WP_Error Map of source_post_id → latest active row.
	 */
	public function get_active_items_by_source_ids( array $input ): array|WP_Error {
		$source_site_url = $input['source_site_url'] ?? null;
		$source_ids      = $input['source_ids'] ?? null;

		if ( ! is_string( $source_site_url ) || ! is_array( $source_ids ) ) {
			return new WP_Error(
				'invalid_history_query',
				__( 'Invalid import history query', 'safe-publish' )
			);
		}
		if ( 0 === count( $source_ids ) ) {
			return array();
		}

		global $wpdb;

		$table        = Import_Items_Table::table_name();
		$imports      = Imports_Table::table_name();
		$placeholders = implode( ', ', array_fill( 0, count( $source_ids ), '%d' ) );
		$values       = array_values( $source_ids );
		$values[]     = $source_site_url;

		// NOT EXISTS picks the latest active row per source (ties broken by id);
		// a rolled-back row or newer error can't mask it. Served by
		// source_post_id_import_date.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT t1.* FROM `{$table}` t1"
					. " INNER JOIN `{$imports}` s1 ON s1.id = t1.session_id"
					. " WHERE t1.source_post_id IN ({$placeholders})"
					. " AND t1.status IN ( 'success', 'updated' )"
					. ' AND t1.rolled_back = 0'
					. ' AND s1.source_site_url = %s'
					. " AND NOT EXISTS ( SELECT 1 FROM `{$table}` t2"
					. " INNER JOIN `{$imports}` s2 ON s2.id = t2.session_id"
					. ' WHERE t2.source_post_id = t1.source_post_id'
					. " AND t2.status IN ( 'success', 'updated' )"
					. ' AND t2.rolled_back = 0'
					. ' AND s2.source_site_url = s1.source_site_url'
					. ' AND ( t2.import_date_gmt > t1.import_date_gmt'
					. ' OR ( t2.import_date_gmt = t1.import_date_gmt'
					. ' AND t2.id > t1.id ) ) )',
				...$values
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		$by_source = array();
		foreach ( is_array( $rows ) ? $rows : array() as $row ) {
			$by_source[ (int) $row['source_post_id'] ] = $row;
		}

		return $by_source;
	}

	/**
	 * Lists existing imported source rows, including one lookahead row.
	 *
	 * The nested args array accepts the following filters:
	 *
	 *     string   $search          Title substring to match.
	 *     string   $name            Exact wp_posts.post_name (slug) to match.
	 *     string[] $post_types      wp_posts.post_type values to include.
	 *     string   $imported_after  Lower bound on import_date_gmt.
	 *     string   $imported_before Upper bound on import_date_gmt.
	 *     string   $freshness       'any' (default), 'up-to-date',
	 *                                     or 'outdated' and filters by
	 *                                     source_modified_gmt vs import_date_gmt.
	 *     string   $orderby         'import_date' (default) or 'title'.
	 *     string   $order           'asc' or 'desc' (default).
	 *
	 * @param array $input Source identity, paging and nested args filters.
	 * @psalm-param array{source_site_url: string, page?: int, per_page?: int, args?: array} $input
	 * @return array[]|WP_Error Active rows or an invalid input error.
	 */
	public function list_imported_source_rows( array $input ): array|WP_Error {
		$source_site_url = $input['source_site_url'] ?? null;
		$page            = $input['page'] ?? 1;
		$per_page        = $input['per_page'] ?? 20;
		$args            = $input['args'] ?? array();

		if ( ! is_string( $source_site_url ) || ! is_int( $page )
			|| ! is_int( $per_page ) || ! is_array( $args ) ) {
			return new WP_Error(
				'invalid_history_query',
				__( 'Invalid import history query', 'safe-publish' )
			);
		}
		global $wpdb;

		$items_table   = Import_Items_Table::table_name();
		$imports_table = Imports_Table::table_name();
		$posts_table   = $wpdb->posts;
		$offset        = max( 0, ( $page - 1 ) * $per_page );
		$limit         = $per_page + 1;

		$search          = isset( $args['search'] ) ? (string) $args['search'] : '';
		$name            = isset( $args['name'] ) ? (string) $args['name'] : '';
		$post_types      = isset( $args['post_types'] ) ? (array) $args['post_types'] : array();
		$imported_after  = isset( $args['imported_after'] ) ? (string) $args['imported_after'] : '';
		$imported_before = isset( $args['imported_before'] ) ? (string) $args['imported_before'] : '';
		$freshness       = isset( $args['freshness'] ) ? (string) $args['freshness'] : 'any';
		$orderby         = ( isset( $args['orderby'] ) && 'title' === $args['orderby'] )
			? 't1.title'
			: 't1.import_date_gmt';
		$order           = ( isset( $args['order'] ) && 'asc' === strtolower( (string) $args['order'] ) )
			? 'ASC'
			: 'DESC';

		$where  = array(
			't1.source_post_id IS NOT NULL',
			"t1.status IN ( 'success', 'updated' )",
			't1.rolled_back = 0',
			't1.post_id IS NOT NULL',
			"p.post_status != 'trash'",
			's1.source_site_url = %s',
		);
		$params = array( $source_site_url );

		if ( '' !== $search ) {
			$where[]  = 't1.title LIKE %s';
			$params[] = '%' . $wpdb->esc_like( $search ) . '%';
		}

		if ( '' !== $name ) {
			$where[]  = 'p.post_name = %s';
			$params[] = $name;
		}

		if ( '' !== $imported_after ) {
			$where[]  = 't1.import_date_gmt >= %s';
			$params[] = $imported_after;
		}

		if ( '' !== $imported_before ) {
			$where[]  = 't1.import_date_gmt <= %s';
			$params[] = $imported_before;
		}

		if ( count( $post_types ) > 0 ) {
			$placeholders = implode( ', ', array_fill( 0, count( $post_types ), '%s' ) );
			$where[]      = "p.post_type IN ({$placeholders})";
			array_push( $params, ...array_map( 'strval', $post_types ) );
		}

		if ( 'outdated' === $freshness ) {
			$where[] = 't1.source_modified_gmt IS NOT NULL';
			$where[] = 't1.source_modified_gmt > t1.import_date_gmt';
		} elseif ( 'up-to-date' === $freshness ) {
			$where[] = '( t1.source_modified_gmt IS NULL'
				. ' OR t1.source_modified_gmt <= t1.import_date_gmt )';
		}

		$where_sql = implode( ' AND ', $where );
		$params[]  = $limit;
		$params[]  = $offset;
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT t1.*, p.post_type AS wp_post_type,'
					. ' p.post_status AS wp_post_status'
					. " FROM `{$items_table}` t1"
					. " INNER JOIN `{$posts_table}` p ON p.ID = t1.post_id"
					. " INNER JOIN `{$imports_table}` s1 ON s1.id = t1.session_id"
					. " WHERE {$where_sql}"
					. " AND NOT EXISTS ( SELECT 1 FROM `{$items_table}` t2"
					. " INNER JOIN `{$imports_table}` s2 ON s2.id = t2.session_id"
					. ' WHERE t2.source_post_id = t1.source_post_id'
					. " AND t2.status IN ( 'success', 'updated' )"
					. ' AND t2.rolled_back = 0'
					. ' AND s2.source_site_url = s1.source_site_url'
					. ' AND ( t2.import_date_gmt > t1.import_date_gmt'
					. ' OR ( t2.import_date_gmt = t1.import_date_gmt AND t2.id > t1.id ) ) )'
					. " ORDER BY {$orderby} {$order}, t1.id DESC"
					. ' LIMIT %d OFFSET %d',
				...$params
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Lists one source's failure rows for the Needs attention inbox. Orphans
	 * are listed individually; source-linked errors are deduped to the latest
	 * attempt. An empty $source_site_url matches only sessions recorded
	 * without one.
	 *
	 * @param array $input Read parameters.
	 * @psalm-param array{source_site_url: string, offset: int, limit: int, ignored?: bool} $input
	 * @return array[]|WP_Error Failure rows including source_site_url.
	 */
	public function list_failures( array $input ): array|WP_Error {
		$source_site_url = $input['source_site_url'] ?? null;
		$offset          = $input['offset'] ?? null;
		$limit           = $input['limit'] ?? null;
		$ignored         = $input['ignored'] ?? false;

		if ( ! is_string( $source_site_url ) || ! is_int( $offset )
			|| ! is_int( $limit ) || ! is_bool( $ignored ) ) {
			return new WP_Error(
				'invalid_history_query',
				__( 'Invalid import history query', 'safe-publish' )
			);
		}
		if ( $limit < 1 ) {
			return array();
		}

		global $wpdb;

		$items_table   = Import_Items_Table::table_name();
		$imports_table = Imports_Table::table_name();
		$where_sql     = $this->failures_where_sql( $ignored );
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT it.id, it.session_id, it.title, it.source_post_id,'
					. ' it.error_message, it.import_date_gmt, s.source_site_url'
					. " FROM `{$items_table}` it"
					. " INNER JOIN `{$imports_table}` s ON s.id = it.session_id"
					. " WHERE {$where_sql}"
					. ' ORDER BY it.import_date_gmt DESC, it.id DESC'
					. ' LIMIT %d OFFSET %d',
				$source_site_url,
				$limit,
				max( 0, $offset )
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Counts the failure rows the inbox lists for one source. Joins the
	 * sessions table so the count matches list_failures exactly (an item with
	 * no session row can't appear in either).
	 *
	 * @param array $input Read parameters.
	 * @psalm-param array{source_site_url: string, ignored?: bool} $input
	 * @return array{count: int}|WP_Error Failure count or invalid input error.
	 */
	public function count_failures( array $input ): array|WP_Error {
		$source_site_url = $input['source_site_url'] ?? null;
		$ignored         = $input['ignored'] ?? false;

		if ( ! is_string( $source_site_url ) || ! is_bool( $ignored ) ) {
			return new WP_Error(
				'invalid_history_query',
				__( 'Invalid import history query', 'safe-publish' )
			);
		}
		global $wpdb;

		$items_table   = Import_Items_Table::table_name();
		$imports_table = Imports_Table::table_name();
		$where_sql     = $this->failures_where_sql( $ignored );
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM `{$items_table}` it"
					. " INNER JOIN `{$imports_table}` s ON s.id = it.session_id"
					. " WHERE {$where_sql}",
				$source_site_url
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return array( 'count' => null === $count ? 0 : (int) $count );
	}

	/**
	 * Bulk variant of get_item_for_post(): Returns the most recent active item
	 * row for each provided post ID, keyed by post_id.
	 *
	 * Drives the Manage listing with one query for the whole page
	 * instead of N. Relies on the (post_id, import_date_gmt) composite
	 * index for the inner aggregation. Rolled-back rows are excluded so the
	 * result reflects each post's current content. Ties on import_date_gmt
	 * resolve to the highest id.
	 *
	 * @param array $input Read parameters.
	 * @psalm-param array{post_ids: int[]} $input
	 * @return array<int, array>|WP_Error Map of post_id → most recent item row.
	 */
	public function get_items_for_posts( array $input ): array|WP_Error {
		$post_ids = $input['post_ids'] ?? null;

		if ( ! is_array( $post_ids ) ) {
			return new WP_Error(
				'invalid_history_query',
				__( 'Invalid import history query', 'safe-publish' )
			);
		}
		if ( 0 === count( $post_ids ) ) {
			return array();
		}

		global $wpdb;

		$table        = Import_Items_Table::table_name();
		$placeholders = implode( ', ', array_fill( 0, count( $post_ids ), '%d' ) );
		$values       = array_values( $post_ids );
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT t1.* FROM `{$table}` t1"
					. ' INNER JOIN ( SELECT post_id, MAX(import_date_gmt) AS max_date'
					. " FROM `{$table}` WHERE post_id IN ({$placeholders})"
					. ' AND rolled_back = 0 GROUP BY post_id ) t2'
					. ' ON t1.post_id = t2.post_id'
					. ' AND t1.import_date_gmt = t2.max_date'
					. ' WHERE t1.rolled_back = 0'
					. ' ORDER BY t1.id DESC',
				...$values
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( ! is_array( $rows ) ) {
			return array();
		}

		$by_post_id = array();
		foreach ( $rows as $row ) {
			$post_id = (int) $row['post_id'];
			if ( ! isset( $by_post_id[ $post_id ] ) ) {
				$by_post_id[ $post_id ] = $row;
			}
		}

		return $by_post_id;
	}

	/**
	 * WHERE fragment (alias it) selecting the inbox's failure rows: Any error
	 * with no later row for the same source post on the same source site.
	 * Orphans (no source_post_id) always qualify.
	 *
	 * The ignored_gmt column is NULL for an open failure and set once ignored;
	 * $ignored=true selects the ignored set instead of the open one.
	 *
	 * Carries one %s placeholder: Callers join the imports table as alias s and
	 * pass $source_site_url first to prepare().
	 *
	 * @param bool $ignored Select ignored rows instead of open ones.
	 * @return string WHERE fragment.
	 */
	private function failures_where_sql( bool $ignored ): string {
		$items_table   = Import_Items_Table::table_name();
		$imports_table = Imports_Table::table_name();
		$ignore_sql    = $ignored
			? 'it.ignored_gmt IS NOT NULL'
			: 'it.ignored_gmt IS NULL';

		return "it.status = 'error' AND {$ignore_sql}"
			. ' AND s.source_site_url = %s'
			. ' AND ( it.source_post_id IS NULL'
			. " OR NOT EXISTS ( SELECT 1 FROM `{$items_table}` t2"
			. " INNER JOIN `{$imports_table}` s2 ON s2.id = t2.session_id"
			. ' WHERE t2.source_post_id = it.source_post_id'
			. ' AND s2.source_site_url = s.source_site_url'
			. ' AND ( t2.import_date_gmt > it.import_date_gmt'
			. ' OR ( t2.import_date_gmt = it.import_date_gmt'
			. ' AND t2.id > it.id ) ) ) )';
	}
}
