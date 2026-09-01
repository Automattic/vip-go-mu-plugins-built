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
use Safe_Publish\Validators\URL_Validator;
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
	 * @param string $source_site_url Source site URL, normalized to the
	 *                                path-bearing identity before storage.
	 * @param string $session_type    Type of import (single, bulk).
	 * @return int|WP_Error Session ID, or error on an invalid source or a failed
	 *                      insert.
	 */
	public function create_session(
		string $source_site_url,
		string $session_type = 'bulk'
	): int|WP_Error {
		global $wpdb;

		$source_site_url = trim( $source_site_url );

		if ( '' === $source_site_url ) {
			return new WP_Error(
				'session_no_source_site_url',
				__(
					'Cannot open an import session without a connected source site.',
					'safe-publish'
				)
			);
		}

		$normalized = URL_Validator::normalize_site_url_with_path(
			$source_site_url
		);

		if ( '' === $normalized ) {
			return new WP_Error(
				'session_invalid_source_site_url',
				__(
					'Cannot open an import session without a valid connected source site.',
					'safe-publish'
				)
			);
		}

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
				'source_site_url'   => $normalized,
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
	 * On failures (status 'error'), also emits an IMPORT_ITEM_FAILED audit
	 * event so the forensic channel records the per-item failure.
	 *
	 * @param int         $session_id          Session ID.
	 * @param int|null    $source_post_id      Source post ID, or null if not provided.
	 * @param string      $title               Post title.
	 * @param string      $status              Import status (success, error, updated).
	 * @param int|null    $post_id             WordPress post ID; null for error status.
	 * @param string|null $error               Error message; null for success/updated.
	 * @param array       $changes             Changes made during import.
	 * @param array       $warnings            Non-fatal warnings raised during import.
	 * @param string|null $source_modified_gmt Source post's modified_gmt at import time;
	 *                                         null when unknown (e.g. fetch errors).
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
		array $warnings = array(),
		?string $source_modified_gmt = null
	): int|WP_Error {
		global $wpdb;

		if ( 'error' === $status ) {
			$this->emit_item_failed_audit_event(
				$session_id,
				$source_post_id,
				$error,
				$changes
			);
		}

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
				'source_modified_gmt'  => $source_modified_gmt,
			),
			array( '%d', '%s', '%d', '%s', '%d', '%s', '%s', '%s', '%d', '%d', '%s', '%s' )
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
	 * Emits the forensic audit event for a per-item import failure.
	 *
	 * Emitted regardless of the History row insert outcome, so the forensic
	 * record survives a failed row write.
	 *
	 * @param int         $session_id     Session the failed item belongs to.
	 * @param int|null    $source_post_id Source post ID, or null when unknown.
	 * @param string|null $error          Failure message.
	 * @param array       $changes        Per-item changes payload.
	 */
	private function emit_item_failed_audit_event(
		int $session_id,
		?int $source_post_id,
		?string $error,
		array $changes
	): void {
		$action  = isset( $changes['action'] )
			? (string) $changes['action']
			: 'unknown';
		$context = array();

		if ( isset( $changes['reason'] ) ) {
			$context['reason'] = $changes['reason'];
		}

		if ( isset( $changes['parent_id'] ) ) {
			$context['parent_id'] = (int) $changes['parent_id'];
		}

		$this->logger->item_failed(
			$session_id,
			$source_post_id,
			$action,
			(string) $error,
			$context
		);
	}

	/**
	 * Updates source_modified_gmt on multiple import items in one query.
	 *
	 * Backs the sync_status_batch write-through so the stored value drifts no
	 * further than one batch cycle from the source's live modified_gmt.
	 *
	 * @param array<int, string> $updates Map of item_id => source_modified_gmt.
	 */
	public function update_source_modified_gmt_bulk( array $updates ): void {
		if ( 0 === count( $updates ) ) {
			return;
		}

		global $wpdb;

		$table  = Import_Items_Table::table_name();
		$cases  = array();
		$ids    = array();
		$params = array();

		foreach ( $updates as $item_id => $modified ) {
			$cases[]  = 'WHEN %d THEN %s';
			$params[] = (int) $item_id;
			$params[] = (string) $modified;
			$ids[]    = (int) $item_id;
		}

		$ids_placeholder = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
		array_push( $params, ...$ids );

		// phpcs:disable WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare(
				"UPDATE `{$table}` SET source_modified_gmt = CASE id "
					. implode( ' ', $cases )
					. " END WHERE id IN ({$ids_placeholder})",
				...$params
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Completes a session, deriving its final status from item outcomes.
	 *
	 * @param int $session_id Session ID.
	 */
	public function complete_session( int $session_id ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			Imports_Table::table_name(),
			array(
				'status'       => $this->derive_session_status( $session_id ),
				'ended_at_gmt' => current_time( 'mysql', true ),
			),
			array( 'id' => $session_id ),
			array( '%s', '%s' ),
			array( '%d' )
		);
	}

	/**
	 * Derives a session's final status from its item outcomes.
	 *
	 * A session with no failed items completes (this also covers the
	 * zero-items case); with no successful items it fails; a mix is partial.
	 *
	 * @param int $session_id Session ID.
	 * @return string One of 'completed', 'partial', 'failed'.
	 */
	private function derive_session_status( int $session_id ): string {
		global $wpdb;

		$table = Import_Items_Table::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$counts = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT COALESCE(SUM(status IN ('success', 'updated')), 0)"
					. ' AS success_count,'
					. " COALESCE(SUM(status = 'error'), 0) AS failed_count"
					. " FROM `{$table}` WHERE session_id = %d",
				$session_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		$success_count = (int) ( $counts['success_count'] ?? 0 );
		$failed_count  = (int) ( $counts['failed_count'] ?? 0 );

		if ( 0 === $failed_count ) {
			return 'completed';
		}

		if ( 0 === $success_count ) {
			return 'failed';
		}

		return 'partial';
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
	 * Looks up the most recent active item row for a given imported post.
	 *
	 * Rolled-back rows are excluded so the result reflects the post's
	 * current content.
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
				"SELECT * FROM `{$table}` WHERE post_id = %d"
					. ' AND rolled_back = 0'
					. ' ORDER BY id DESC LIMIT 1',
				$post_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return $row ? $row : null;
	}

	/**
	 * Looks up one source's most recent active item row for a given source post.
	 * An empty $source_site_url matches only sessions recorded without one.
	 *
	 * Only non-rolled-back success and updated rows count, so an undone update
	 * or later error can't mask the current import state. Ties on
	 * import_date_gmt break by highest id.
	 *
	 * @param string $source_site_url Path-bearing source identity.
	 * @param int    $source_post_id  Source post ID.
	 * @return array|null Item row, or null when the source has no active row.
	 */
	public function get_active_item_for_source(
		string $source_site_url,
		int $source_post_id
	): ?array {
		global $wpdb;

		$table   = Import_Items_Table::table_name();
		$imports = Imports_Table::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT t.* FROM `{$table}` t"
					. " INNER JOIN `{$imports}` s ON s.id = t.session_id"
					. ' WHERE t.source_post_id = %d'
					. " AND t.status IN ( 'success', 'updated' )"
					. ' AND t.rolled_back = 0'
					. ' AND s.source_site_url = %s'
					. ' ORDER BY t.import_date_gmt DESC, t.id DESC LIMIT 1',
				$source_post_id,
				$source_site_url
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return $row ? $row : null;
	}

	/**
	 * Bulk variant of get_active_item_for_source(): One query per page
	 * instead of N. Backed by the (source_post_id, import_date_gmt) index.
	 *
	 * The dedup subquery is restricted to the same source too, so another
	 * source's newer success can't hide this source's active row. An empty
	 * $source_site_url matches only sessions recorded without one.
	 *
	 * @param string $source_site_url Path-bearing source identity.
	 * @param int[]  $source_ids      Source post IDs to look up.
	 * @return array<int, array> Map of source_post_id → latest active row.
	 */
	public function get_active_items_by_source_ids(
		string $source_site_url,
		array $source_ids
	): array {
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
	 * Derives the routing state from an active item row plus the referenced
	 * local post's presence.
	 *
	 * Trash counts as not-present, so trashed posts fold into Available;
	 * restoring flips them back on next reload.
	 *
	 * @param array|null $active_row         Most recent item row, or null.
	 * @param bool       $local_post_present wp_posts row exists, non-trash.
	 * @return string 'available' | 'up-to-date' | 'outdated' (or 'failed'
	 *                defensively, if ever passed an error row).
	 */
	public static function derive_active_state(
		?array $active_row,
		bool $local_post_present
	): string {
		if ( null === $active_row ) {
			return 'available';
		}

		// Defensive: Active-row queries exclude rolled-back rows. If another
		// caller supplies one, it cannot represent the current imported state.
		if ( 1 === (int) ( $active_row['rolled_back'] ?? 0 ) ) {
			return 'available';
		}

		$status = (string) ( $active_row['status'] ?? '' );

		// Defensive: The Posts listing queries exclude error rows, so this
		// branch is unreachable from that path.
		if ( 'error' === $status ) {
			return 'failed';
		}

		if ( ! $local_post_present ) {
			return 'available';
		}

		$source_modified = (string) ( $active_row['source_modified_gmt'] ?? '' );
		$import_date     = (string) ( $active_row['import_date_gmt'] ?? '' );

		if ( '' !== $source_modified && $source_modified > $import_date ) {
			return 'outdated';
		}

		return 'up-to-date';
	}

	/**
	 * Resolves the routing state for a single source post, scoped to one
	 * source. Backs the focus_source one-render chip swap on the listing
	 * endpoint.
	 *
	 * @param string $source_site_url Path-bearing source identity.
	 * @param int    $source_post_id  Source post ID.
	 * @return string One of 'available', 'up-to-date', 'outdated'.
	 */
	public function resolve_source_post_state(
		string $source_site_url,
		int $source_post_id
	): string {
		$row = $this->get_active_item_for_source(
			$source_site_url,
			$source_post_id
		);

		$post_id            = null !== $row && isset( $row['post_id'] )
			? (int) $row['post_id']
			: 0;
		$local_post_present = false;

		if ( $post_id > 0 ) {
			$status             = get_post_status( $post_id );
			$local_post_present = false !== $status && 'trash' !== $status;
		}

		return self::derive_active_state( $row, $local_post_present );
	}

	/**
	 * Lists one source's imported source-post rows per the active-row rule.
	 * Returns per_page+1 rows so the caller can derive has_more without a
	 * count query.
	 *
	 * The dedup subquery is restricted to the same source too, so another
	 * source's newer import can't hide this source's active row. An empty
	 * $source_site_url matches only sessions recorded without one.
	 *
	 * @param string $source_site_url Path-bearing source identity.
	 * @param int    $page            1-indexed page number.
	 * @param int    $per_page        Items per page.
	 * @param array  $args            {
	 *     Optional. Search/filter/sort criteria.
	 *
	 *     @type string   $search          Title substring to match.
	 *     @type string   $name            Exact wp_posts.post_name (slug) to match.
	 *     @type string[] $post_types      wp_posts.post_type values to include.
	 *     @type int      $session_id      Most-recent-item session to match.
	 *     @type string   $imported_after  Lower bound on import_date_gmt.
	 *     @type string   $imported_before Upper bound on import_date_gmt.
	 *     @type string   $freshness       'any' (default), 'up-to-date',
	 *                                     or 'outdated' — filters by
	 *                                     source_modified_gmt vs import_date_gmt.
	 *     @type string   $orderby         'import_date' (default) or 'title'.
	 *     @type string   $order           'asc' or 'desc' (default).
	 * }
	 * @return array[] Active item rows in display order.
	 */
	public function list_imported_source_rows(
		string $source_site_url,
		int $page = 1,
		int $per_page = 20,
		array $args = array()
	): array {
		global $wpdb;

		$items_table   = Import_Items_Table::table_name();
		$imports_table = Imports_Table::table_name();
		$posts_table   = $wpdb->posts;
		$offset        = max( 0, ( $page - 1 ) * $per_page );
		$limit         = $per_page + 1;

		$search          = isset( $args['search'] ) ? (string) $args['search'] : '';
		$name            = isset( $args['name'] ) ? (string) $args['name'] : '';
		$post_types      = isset( $args['post_types'] ) ? (array) $args['post_types'] : array();
		$session_id      = isset( $args['session_id'] ) ? (int) $args['session_id'] : 0;
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

		if ( $session_id > 0 ) {
			$where[]  = 't1.session_id = %d';
			$params[] = $session_id;
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

	/**
	 * Lists one source's failure rows for the Needs attention inbox. Orphans
	 * are listed individually; source-linked errors are deduped to the latest
	 * attempt. An empty $source_site_url matches only sessions recorded
	 * without one.
	 *
	 * @param string $source_site_url Path-bearing source identity.
	 * @param int    $offset          Row offset into the ordered failure set.
	 * @param int    $limit           Maximum rows to return.
	 * @param bool   $ignored         List ignored rows instead of open ones.
	 * @return array[] Failure rows including source_site_url.
	 */
	public function list_failures(
		string $source_site_url,
		int $offset,
		int $limit,
		bool $ignored = false
	): array {
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
	 * @param string $source_site_url Path-bearing source identity.
	 * @param bool   $ignored         Count ignored rows instead of open ones.
	 * @return int Number of failure rows.
	 */
	public function count_failures(
		string $source_site_url,
		bool $ignored = false
	): int {
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

		return null === $count ? 0 : (int) $count;
	}

	/**
	 * Deletes failure rows by id and/or source_post_id. Scoped to status =
	 * 'error' so it can't reach success/updated rows. The source_post_id
	 * path clears every prior failure attempt for a given source post — the
	 * listing only shows the most recent one, so dismissing must reach the
	 * older siblings too or they re-surface on refresh.
	 *
	 * @param int[]       $item_ids        Item ids to delete (orphan failures).
	 * @param int[]       $source_post_ids Source post ids whose failures to delete.
	 * @param string|null $source_site_url Source identity to scope to; null matches any source.
	 * @return int Number of rows removed.
	 */
	public function delete_failed_items(
		array $item_ids,
		array $source_post_ids = array(),
		?string $source_site_url = null
	): int {
		global $wpdb;

		$scope = $this->build_failed_items_scope(
			$item_ids,
			$source_post_ids,
			$source_site_url
		);
		if ( null === $scope ) {
			return 0;
		}

		$items_table = Import_Items_Table::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$deleted = $wpdb->query(
			$wpdb->prepare(
				"DELETE FROM `{$items_table}`"
					. " WHERE status = 'error' AND ( {$scope['sql']} )",
				...$scope['params']
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return false === $deleted ? 0 : (int) $deleted;
	}

	/**
	 * Sets or clears ignored_gmt on failure rows, mirroring the remove scope:
	 * orphans by item id, source-linked failures across every error attempt for
	 * the source post so the deduped row can't re-surface a sibling.
	 *
	 * @param int[]       $item_ids        Item ids to flag (orphan failures).
	 * @param int[]       $source_post_ids Source post ids whose failures to flag.
	 * @param bool        $ignored         True to ignore, false to restore.
	 * @param string|null $source_site_url Source identity to scope to; null matches any source.
	 * @return int Number of rows updated.
	 */
	public function set_failed_items_ignored(
		array $item_ids,
		array $source_post_ids,
		bool $ignored,
		?string $source_site_url = null
	): int {
		global $wpdb;

		$scope = $this->build_failed_items_scope(
			$item_ids,
			$source_post_ids,
			$source_site_url
		);
		if ( null === $scope ) {
			return 0;
		}

		$items_table = Import_Items_Table::table_name();
		$params      = array();
		$set_sql     = 'ignored_gmt = NULL';
		if ( $ignored ) {
			$set_sql  = 'ignored_gmt = %s';
			$params[] = current_time( 'mysql', true );
		}
		$params = array_merge( $params, $scope['params'] );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$updated = $wpdb->query(
			$wpdb->prepare(
				"UPDATE `{$items_table}` SET {$set_sql}"
					. " WHERE status = 'error' AND ( {$scope['sql']} )",
				...$params
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return false === $updated ? 0 : (int) $updated;
	}

	/**
	 * Normalizes item ids and source post ids into a shared WHERE scope for the
	 * failure remove/ignore paths.
	 *
	 * Both branches carry the source scope, so neither can reach a row the
	 * inbox does not list. An empty $source_site_url matches only sessions
	 * recorded without one; null leaves both branches unscoped.
	 *
	 * @param int[]       $item_ids        Item ids (orphan failures).
	 * @param int[]       $source_post_ids Source post ids.
	 * @param string|null $source_site_url Source identity to scope to; null matches any source.
	 * @return array{sql: string, params: list<int|string>}|null Scope, or null when empty.
	 */
	private function build_failed_items_scope(
		array $item_ids,
		array $source_post_ids,
		?string $source_site_url
	): ?array {
		$positive = static fn( int $id ): bool => $id > 0;

		$ids     = array_values(
			array_unique(
				array_filter( array_map( 'absint', $item_ids ), $positive )
			)
		);
		$sources = array_values(
			array_unique(
				array_filter( array_map( 'absint', $source_post_ids ), $positive )
			)
		);

		if ( 0 === count( $ids ) && 0 === count( $sources ) ) {
			return null;
		}

		$imports_table = Imports_Table::table_name();
		$session_sql   = null === $source_site_url
			? ''
			: " AND session_id IN ( SELECT id FROM `{$imports_table}`"
				. ' WHERE source_site_url = %s )';
		$clauses       = array();
		$params        = array();

		if ( count( $ids ) > 0 ) {
			$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
			$clauses[]    = "( id IN ({$placeholders}){$session_sql} )";
			$params       = array_merge( $params, $ids );
			if ( null !== $source_site_url ) {
				$params[] = $source_site_url;
			}
		}

		if ( count( $sources ) > 0 ) {
			$placeholders = implode(
				',',
				array_fill( 0, count( $sources ), '%d' )
			);
			$clauses[]    = "( source_post_id IN ({$placeholders})"
				. "{$session_sql} )";
			$params       = array_merge( $params, $sources );
			if ( null !== $source_site_url ) {
				$params[] = $source_site_url;
			}
		}

		return array(
			'sql'    => implode( ' OR ', $clauses ),
			'params' => $params,
		);
	}

	/**
	 * Bulk variant of get_item_for_post(): Returns the most recent active item
	 * row for each provided post ID, keyed by post_id.
	 *
	 * Drives the Manage listing — one query for the whole page
	 * instead of N. Relies on the (post_id, import_date_gmt) composite
	 * index for the inner aggregation. Rolled-back rows are excluded so the
	 * result reflects each post's current content. Ties on import_date_gmt
	 * resolve to the highest id.
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
	 * Marks a single item as rolled back and emits an audit log event.
	 *
	 * @param int   $item_id   Item ID.
	 * @param array $omissions References omitted from the rollback.
	 * @return bool True when the row is flagged, false when the write failed.
	 */
	public function mark_item_rolled_back(
		int $item_id,
		array $omissions = array()
	): bool {
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
			return false;
		}

		if ( 0 === $updated ) {
			$this->logger->item_already_rolled_back( $item_id, $session_id, $post_id );
		} else {
			$this->logger->item_rolled_back(
				$item_id,
				$session_id,
				$post_id,
				$omissions
			);
		}

		return true;
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
