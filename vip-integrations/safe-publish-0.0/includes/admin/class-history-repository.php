<?php
/**
 * History Repository class for import session data storage and retrieval
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
 * History Repository Class.
 *
 * Handles all data storage and retrieval operations for import sessions and
 * items, backed by the {$wpdb->prefix}safe_publish_imports and
 * {$wpdb->prefix}safe_publish_import_items tables.
 */
final class History_Repository {

	/**
	 * Import logger instance.
	 *
	 * @var Import_Logger
	 */
	private Import_Logger $logger;

	/**
	 * Constructs the History_Repository instance.
	 */
	public function __construct() {
		$this->logger = new Import_Logger();
	}

	/**
	 * Creates a new import session.
	 *
	 * @param string $source_site_url Source site URL.
	 * @param string $session_type    Type of import (single, bulk).
	 * @return int|WP_Error Session ID or error.
	 */
	public function create_session(
		string $source_site_url,
		string $session_type = 'bulk'
	): int|WP_Error {
		global $wpdb;

		$user_id = get_current_user_id();
		$user    = get_userdata( $user_id );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$inserted = $wpdb->insert(
			Imports_Table::table_name(),
			array(
				'user_id'           => $user_id,
				'user_display_name' => $user
					? $user->display_name
					: __( 'Unknown user', 'safe-publish' ),
				'source_site_url'   => $source_site_url,
				'session_type'      => $session_type,
				'status'            => 'in_progress',
				'ended_at_gmt'      => null,
				'created_at_gmt'    => current_time( 'mysql', true ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%s', '%s' )
		);

		if ( false === $inserted ) {
			return new WP_Error(
				'session_insert_failed',
				__( 'Failed to create import session.', 'safe-publish' )
			);
		}

		return (int) $wpdb->insert_id;
	}

	/**
	 * Logs an import action.
	 *
	 * @param int         $session_id       Session ID.
	 * @param int|null    $source_post_id   Source post ID, or null if not provided.
	 * @param string      $title            Post title.
	 * @param string      $status           Import status (success, error, updated).
	 * @param int|null    $post_id          WordPress post ID; null for error status.
	 * @param string|null $error            Error message; null for success/updated.
	 * @param array       $changes          Changes made during import.
	 * @param array       $warnings         Non-fatal warnings raised during import.
	 * @return int|WP_Error Item ID or error.
	 */
	public function log_import_action(
		int $session_id,
		?int $source_post_id,
		string $title,
		string $status,
		?int $post_id = null,
		?string $error = null,
		array $changes = array(),
		array $warnings = array()
	): int|WP_Error {
		global $wpdb;

		$encoded_changes      = null;
		$has_previous_content = 0;

		if ( count( $changes ) > 0 ) {
			$json = wp_json_encode( $changes );

			if ( false !== $json ) {
				$encoded_changes = $json;
			}

			if ( '' !== ( $changes['previous_content'] ?? '' ) ) {
				$has_previous_content = 1;
			}
		}

		$encoded_warnings = null;

		if ( count( $warnings ) > 0 ) {
			$json = wp_json_encode( $warnings );

			if ( false !== $json ) {
				$encoded_warnings = $json;
			}
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$inserted = $wpdb->insert(
			Import_Items_Table::table_name(),
			array(
				'session_id'           => $session_id,
				'title'                => $title,
				'source_post_id'       => $source_post_id,
				'status'               => $status,
				'post_id'              => $post_id,
				'error_message'        => $error,
				'content_changes'      => $encoded_changes,
				'warnings'             => $encoded_warnings,
				'has_previous_content' => $has_previous_content,
				'rolled_back'          => 0,
				'import_date_gmt'      => current_time( 'mysql', true ),
			),
			array( '%d', '%s', '%d', '%s', '%d', '%s', '%s', '%s', '%d', '%d', '%s' )
		);

		if ( false === $inserted ) {
			return new WP_Error(
				'item_insert_failed',
				__( 'Failed to create import item.', 'safe-publish' )
			);
		}

		return (int) $wpdb->insert_id;
	}

	/**
	 * Completes a session.
	 *
	 * @param int $session_id Session ID.
	 */
	public function complete_session( int $session_id ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			Imports_Table::table_name(),
			array(
				'status'       => 'completed',
				'ended_at_gmt' => current_time( 'mysql', true ),
			),
			array( 'id' => $session_id ),
			array( '%s', '%s' ),
			array( '%d' )
		);
	}

	/**
	 * Retrieves import sessions in reverse-chronological order with item
	 * counts projected from the items table.
	 *
	 * @param int $limit Maximum number of sessions to retrieve.
	 * @return array[] Array of session rows including total_items, successful,
	 *                 updated, and failed counts.
	 */
	public function get_sessions( int $limit = 50 ): array {
		global $wpdb;

		// phpcs:disable WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				$this->build_session_select_sql(
					'GROUP BY i.id ORDER BY i.created_at_gmt DESC, i.id DESC LIMIT %d'
				),
				$limit
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return $rows ? $rows : array();
	}

	/**
	 * Retrieves a single session by ID with item counts projected from the
	 * items table.
	 *
	 * @param int $session_id Session ID.
	 * @return array|null Session row including total_items, successful,
	 *                   updated, and failed counts, or null if not found.
	 */
	public function get_session( int $session_id ): ?array {
		global $wpdb;

		// phpcs:disable WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare(
				$this->build_session_select_sql(
					'WHERE i.id = %d GROUP BY i.id'
				),
				$session_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return $row ? $row : null;
	}

	/**
	 * Builds a session SELECT statement that projects per-session item counts
	 * by joining the items table.
	 *
	 * @param string $tail_clause WHERE/GROUP BY/ORDER BY/LIMIT tail.
	 * @return string Composed SQL statement.
	 */
	private function build_session_select_sql( string $tail_clause ): string {
		$imports = Imports_Table::table_name();
		$items   = Import_Items_Table::table_name();

		$counts = 'COUNT(it.id) AS total_items,'
			. " COALESCE(SUM(it.status IN ('success', 'updated')), 0)"
			. ' AS successful,'
			. " COALESCE(SUM(it.status = 'updated'), 0) AS updated,"
			. " COALESCE(SUM(it.status = 'error'), 0) AS failed";

		return "SELECT i.*, {$counts} FROM `{$imports}` i"
			. " LEFT JOIN `{$items}` it ON it.session_id = i.id"
			. " {$tail_clause}";
	}

	/**
	 * Retrieves all items for a session, excluding the content_changes LONGTEXT
	 * column.
	 *
	 * The has_previous_content flag is read directly so callers can decide
	 * whether to lazily fetch the full payload.
	 *
	 * @param int $session_id Session ID.
	 * @return array[] Array of item rows.
	 */
	public function get_session_items( int $session_id ): array {
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

		return $rows ? $rows : array();
	}

	/**
	 * Retrieves items with specific statuses for a session.
	 *
	 * @param int   $session_id Session ID.
	 * @param array $statuses   Array of statuses to filter by.
	 * @return array[] Array of item rows.
	 */
	public function get_session_items_by_status(
		int $session_id,
		array $statuses
	): array {
		global $wpdb;

		if ( 0 === count( $statuses ) ) {
			return array();
		}

		$table        = Import_Items_Table::table_name();
		$count        = count( $statuses );
		$placeholders = implode( ', ', array_fill( 0, $count, '%s' ) );
		$values       = array_values( $statuses );
		array_unshift( $values, $session_id );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM `{$table}` WHERE session_id = %d"
					. " AND status IN ({$placeholders}) ORDER BY id ASC",
				...$values
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return $rows ? $rows : array();
	}

	/**
	 * Retrieves a single item by ID.
	 *
	 * @param int $item_id Item ID.
	 * @return array|null Item row or null if not found.
	 */
	public function get_item( int $item_id ): ?array {
		global $wpdb;

		$table = Import_Items_Table::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM `{$table}` WHERE id = %d", $item_id ),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return $row ? $row : null;
	}

	/**
	 * Looks up the most recent item row for a given imported post.
	 *
	 * @param int $post_id WordPress post ID.
	 * @return array|null Item row or null if no matching item exists.
	 */
	public function get_item_for_post( int $post_id ): ?array {
		global $wpdb;

		$table = Import_Items_Table::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM `{$table}` WHERE post_id = %d ORDER BY id DESC LIMIT 1",
				$post_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return $row ? $row : null;
	}

	/**
	 * Returns a page of imported post IDs for the Imports → Posts tab listing,
	 * with search/filter/sort applied across the full dataset.
	 *
	 * Aggregates the items table to one row per post (the most recent import
	 * event) and joins wp_posts so post-level search/filters/sort act on every
	 * imported post, not just the current page. The inner join also drops items
	 * whose post no longer exists, so the page never carries IDs that hydration
	 * would discard. Returns up to per_page+1 IDs so the caller can derive
	 * has_more without a separate count query.
	 *
	 * @param int   $page     1-indexed page number.
	 * @param int   $per_page Items per page.
	 * @param array $args     {
	 *     Optional. Search/filter/sort criteria.
	 *
	 *     @type string   $search     Title substring to match.
	 *     @type string[] $statuses   post_status values to include.
	 *     @type string[] $post_types post_type values to include.
	 *     @type int      $session_id Most-recent-item session to match, or 0.
	 *     @type string   $orderby    'import_date' (default) or 'title'.
	 *     @type string   $order      'asc' or 'desc' (default).
	 * }
	 * @return int[] Post IDs in display order.
	 */
	public function list_imported_post_ids(
		int $page = 1,
		int $per_page = 20,
		array $args = array()
	): array {
		global $wpdb;

		$items_table = Import_Items_Table::table_name();
		$posts_table = $wpdb->posts;
		$offset      = max( 0, ( $page - 1 ) * $per_page );
		$limit       = $per_page + 1;

		$search     = isset( $args['search'] ) ? (string) $args['search'] : '';
		$statuses   = isset( $args['statuses'] ) ? (array) $args['statuses'] : array();
		$post_types = isset( $args['post_types'] ) ? (array) $args['post_types'] : array();
		$session_id = isset( $args['session_id'] ) ? (int) $args['session_id'] : 0;
		$orderby    = ( isset( $args['orderby'] ) && 'title' === $args['orderby'] )
			? 'p.post_title'
			: 'agg.max_date';
		$order      = ( isset( $args['order'] ) && 'asc' === strtolower( (string) $args['order'] ) )
			? 'ASC'
			: 'DESC';

		// Only %s/%d placeholders and allowlisted identifiers are interpolated
		// below; every user value is bound through $wpdb->prepare().
		$where  = array( 'agg.post_id IS NOT NULL' );
		$params = array();

		if ( '' !== $search ) {
			$where[]  = 'p.post_title LIKE %s';
			$params[] = '%' . $wpdb->esc_like( $search ) . '%';
		}

		if ( count( $statuses ) > 0 ) {
			$placeholders = implode( ', ', array_fill( 0, count( $statuses ), '%s' ) );
			$where[]      = "p.post_status IN ({$placeholders})";
			array_push( $params, ...array_map( 'strval', $statuses ) );
		} else {
			// Mirror the get_posts( 'post_status' => 'any' ) hydration: exclude
			// statuses hidden from search (trash, auto-draft, inherit) so the
			// page count matches the rows that actually render.
			$hidden = array_keys(
				get_post_stati( array( 'exclude_from_search' => true ) )
			);
			if ( count( $hidden ) > 0 ) {
				$placeholders = implode( ', ', array_fill( 0, count( $hidden ), '%s' ) );
				$where[]      = "p.post_status NOT IN ({$placeholders})";
				array_push( $params, ...array_map( 'strval', $hidden ) );
			}
		}

		if ( count( $post_types ) > 0 ) {
			$placeholders = implode( ', ', array_fill( 0, count( $post_types ), '%s' ) );
			$where[]      = "p.post_type IN ({$placeholders})";
			array_push( $params, ...array_map( 'strval', $post_types ) );
		}

		if ( $session_id > 0 ) {
			$where[]  = "EXISTS ( SELECT 1 FROM `{$items_table}` mr"
				. ' WHERE mr.post_id = agg.post_id'
				. ' AND mr.import_date_gmt = agg.max_date'
				. ' AND mr.session_id = %d )';
			$params[] = $session_id;
		}

		$where_sql = implode( ' AND ', $where );
		$params[]  = $limit;
		$params[]  = $offset;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT agg.post_id FROM ('
					. "SELECT post_id, MAX(import_date_gmt) AS max_date FROM `{$items_table}`"
					. ' WHERE post_id IS NOT NULL GROUP BY post_id'
					. ") agg INNER JOIN `{$posts_table}` p ON p.ID = agg.post_id"
					. " WHERE {$where_sql}"
					. " ORDER BY {$orderby} {$order}, agg.post_id DESC"
					. ' LIMIT %d OFFSET %d',
				...$params
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( ! is_array( $rows ) ) {
			return array();
		}

		return array_map(
			static fn( array $row ): int => (int) $row['post_id'],
			$rows
		);
	}

	/**
	 * Bulk variant of get_item_for_post(): returns the most recent item row
	 * for each provided post ID, keyed by post_id.
	 *
	 * Drives the Imports → Posts tab listing — one query for the whole page
	 * instead of N. Relies on the (post_id, import_date_gmt) composite
	 * index for the inner aggregation. Ties on import_date_gmt resolve to
	 * the highest id.
	 *
	 * @param int[] $post_ids Post IDs to look up.
	 * @return array<int, array> Map of post_id → most recent item row.
	 */
	public function get_items_for_posts( array $post_ids ): array {
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
					. ' GROUP BY post_id ) t2'
					. ' ON t1.post_id = t2.post_id'
					. ' AND t1.import_date_gmt = t2.max_date'
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
	 * Returns the filter options for the Imports → Posts tab listing.
	 *
	 * Computed over the full imported set (not the current page) so the filter
	 * dropdowns stay complete as the user narrows results.
	 *
	 * @return array<string, list<array{value: string, label: string}>> Options
	 *               keyed by 'post_types'.
	 */
	public function get_imported_filter_facets(): array {
		return array(
			'post_types' => $this->get_imported_post_type_facets(),
		);
	}

	/**
	 * Returns the distinct post types present among imported posts.
	 *
	 * @return list<array{value: string, label: string}> Post-type options.
	 */
	private function get_imported_post_type_facets(): array {
		global $wpdb;

		$items_table = Import_Items_Table::table_name();
		$posts_table = $wpdb->posts;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$types = $wpdb->get_col(
			"SELECT DISTINCT p.post_type FROM `{$items_table}` it"
				. " INNER JOIN `{$posts_table}` p ON p.ID = it.post_id"
				. ' WHERE it.post_id IS NOT NULL'
				. ' ORDER BY p.post_type ASC'
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		$facets = array();
		foreach ( $types as $type ) {
			$object   = get_post_type_object( (string) $type );
			$label    = ( null !== $object )
				? (string) $object->labels->singular_name
				: (string) $type;
			$facets[] = array(
				'value' => (string) $type,
				'label' => $label,
			);
		}

		return $facets;
	}

	/**
	 * Returns a page of failed import items for the Failures tab listing.
	 *
	 * Joins the session row so the response can show the source site URL and
	 * import date without a second query. Returns up to per_page+1 rows so the
	 * caller can derive has_more without a separate count.
	 *
	 * @param int $page     1-indexed page number.
	 * @param int $per_page Items per page.
	 * @return array[] Item rows including session source_site_url and date.
	 */
	public function list_failed_items( int $page = 1, int $per_page = 20 ): array {
		global $wpdb;

		$items_table   = Import_Items_Table::table_name();
		$imports_table = Imports_Table::table_name();
		$offset        = max( 0, ( $page - 1 ) * $per_page );
		$limit         = $per_page + 1;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT it.id, it.session_id, it.title, it.source_post_id,'
					. ' it.error_message, it.import_date_gmt,'
					. ' s.source_site_url'
					. " FROM `{$items_table}` it"
					. " INNER JOIN `{$imports_table}` s ON s.id = it.session_id"
					. " WHERE it.status = 'error'"
					. ' ORDER BY it.import_date_gmt DESC, it.id DESC'
					. ' LIMIT %d OFFSET %d',
				$limit,
				$offset
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Counts failed import items across all sessions.
	 *
	 * Lets the Imports → Posts tab nudge operators toward the Failures tab
	 * when their empty state hides a backlog of errored attempts. Backed by
	 * the `status_import_date` index, which also covers
	 * {@see self::list_failed_items()}.
	 *
	 * @return int Number of items currently flagged as 'error'.
	 */
	public function count_failed_items(): int {
		global $wpdb;

		$items_table = Import_Items_Table::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$count = $wpdb->get_var(
			"SELECT COUNT(*) FROM `{$items_table}` WHERE status = 'error'"
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return null !== $count ? (int) $count : 0;
	}

	/**
	 * Marks a session as rolled back and emits audit log events.
	 *
	 * Bulk-flips the per-item `rolled_back` flag on the success/updated items
	 * the session-level rollback acted on so the items table stays consistent
	 * with the item-level rollback path. Emits a per-item audit event for each
	 * flagged item (`item_rolled_back`, or `item_already_rolled_back` when a
	 * prior rollback already flagged it), so the audit log can reconstruct
	 * which items a session rollback touched without joining the items table.
	 *
	 * @param int $session_id Session ID.
	 */
	public function mark_session_rolled_back( int $session_id ): void {
		global $wpdb;

		$items_table = Import_Items_Table::table_name();

		// Snapshot the success/updated items and their pre-UPDATE rolled_back
		// state so the per-item events below can distinguish a newly flagged
		// row from one a prior rollback already flagged, matching the
		// item-level path.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$items = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, post_id, rolled_back FROM `{$items_table}`"
					. " WHERE session_id = %d AND status IN ( 'success', 'updated' )",
				$session_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$items_updated = $wpdb->query(
			$wpdb->prepare(
				"UPDATE `{$items_table}` SET rolled_back = 1"
					. " WHERE session_id = %d AND status IN ( 'success', 'updated' )",
				$session_id
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		// Bail before touching the session row so a retry can heal the
		// partial rollback.
		if ( false === $items_updated ) {
			$this->logger->session_rollback_failed( $session_id, $wpdb->last_error );
			return;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$updated = $wpdb->update(
			Imports_Table::table_name(),
			array( 'status' => 'rolled_back' ),
			array( 'id' => $session_id ),
			array( '%s' ),
			array( '%d' )
		);

		if ( false === $updated ) {
			$this->logger->session_rollback_failed( $session_id, $wpdb->last_error );
			return;
		}

		// Record the per-item events only once the rollback is durably
		// complete, so a mid-operation failure logs just the session event.
		$snapshot = is_array( $items ) ? $items : array();
		foreach ( $snapshot as $item ) {
			$this->log_item_rollback_event( $session_id, $item );
		}

		if ( 0 === $updated ) {
			$this->logger->session_already_rolled_back( $session_id );
		} else {
			$this->logger->session_rolled_back( $session_id );
		}
	}

	/**
	 * Emits the per-item rollback audit event for one item flagged by a
	 * session-level rollback, matching the events the item-level path records.
	 *
	 * @param int   $session_id Parent session of the item.
	 * @param array $item       Snapshot row with id, post_id, and the
	 *                          pre-UPDATE rolled_back value.
	 */
	private function log_item_rollback_event(
		int $session_id,
		array $item
	): void {
		$item_id = (int) $item['id'];
		$post_id = isset( $item['post_id'] ) ? (int) $item['post_id'] : 0;

		if ( 0 === (int) $item['rolled_back'] ) {
			$this->logger->item_rolled_back( $item_id, $session_id, $post_id );
		} else {
			$this->logger->item_already_rolled_back( $item_id, $session_id, $post_id );
		}
	}

	/**
	 * Marks a single item as rolled back and emits an audit log event.
	 *
	 * @param int $item_id Item ID.
	 */
	public function mark_item_rolled_back( int $item_id ): void {
		global $wpdb;

		$table = Import_Items_Table::table_name();
		// Snapshot session_id and post_id before the UPDATE so the audit row
		// can link to both parents regardless of update outcome.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$item = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT session_id, post_id FROM {$table} WHERE id = %d",
				$item_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$session_id = isset( $item['session_id'] ) ? (int) $item['session_id'] : 0;
		$post_id    = isset( $item['post_id'] ) ? (int) $item['post_id'] : 0;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$updated = $wpdb->update(
			$table,
			array( 'rolled_back' => 1 ),
			array( 'id' => $item_id ),
			array( '%d' ),
			array( '%d' )
		);

		if ( false === $updated ) {
			$this->logger->item_rollback_failed(
				$item_id,
				$session_id,
				$post_id,
				$wpdb->last_error
			);
			return;
		}

		if ( 0 === $updated ) {
			$this->logger->item_already_rolled_back( $item_id, $session_id, $post_id );
		} else {
			$this->logger->item_rolled_back( $item_id, $session_id, $post_id );
		}
	}

	/**
	 * Decodes the JSON value stored in the content_changes column.
	 *
	 * @param mixed $raw Raw column value.
	 * @return array|null Decoded array, or null when no changes are stored.
	 */
	public static function decode_item_changes( mixed $raw ): ?array {
		if ( ! is_string( $raw ) || '' === $raw ) {
			return null;
		}

		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * Deletes a session and all of its associated items.
	 *
	 * @param int $session_id Session ID.
	 * @return bool True if the session row was removed.
	 */
	public function delete_session( int $session_id ): bool {
		global $wpdb;

		$imports_table = Imports_Table::table_name();
		// Snapshot source_site_url before delete so the audit row can describe
		// the session that was removed (the row is gone by the time the event
		// is recorded).
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$session_row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT source_site_url FROM {$imports_table} WHERE id = %d",
				$session_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$source_site_url = isset( $session_row['source_site_url'] )
			? (string) $session_row['source_site_url']
			: '';

		// Bail out on a DB error to avoid orphaning items and emitting a
		// misleading `items_deleted` count in the audit log.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$items_result = $wpdb->delete(
			Import_Items_Table::table_name(),
			array( 'session_id' => $session_id ),
			array( '%d' )
		);

		if ( false === $items_result ) {
			$this->logger->session_delete_failed(
				$session_id,
				$source_site_url,
				$wpdb->last_error
			);
			return false;
		}

		$items_deleted = (int) $items_result;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->delete(
			$imports_table,
			array( 'id' => $session_id ),
			array( '%d' )
		);

		if ( false === $result ) {
			$this->logger->session_delete_failed(
				$session_id,
				$source_site_url,
				$wpdb->last_error
			);
			return false;
		}

		$deleted = $result > 0;

		if ( $deleted ) {
			$this->logger->session_deleted(
				$session_id,
				$source_site_url,
				$items_deleted
			);
		}

		return $deleted;
	}
}
