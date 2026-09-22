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
	 * History reader.
	 *
	 * @var History_Read_Service
	 */
	private History_Read_Service $read_service;

	/**
	 * Constructs the History_Repository instance.
	 */
	public function __construct() {
		$this->logger       = new Import_Logger();
		$this->read_service = new History_Read_Service();
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
		$result = $this->read_service->get_session(
			array( 'session_id' => $session_id )
		);

		return is_wp_error( $result ) ? null : $result;
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
		$result = $this->read_service->get_session_items(
			array( 'session_id' => $session_id )
		);

		return is_wp_error( $result ) ? array() : $result;
	}

	/**
	 * Retrieves a single item by ID.
	 *
	 * @param int $item_id Item ID.
	 * @return array|null Item row or null if not found.
	 */
	public function get_item( int $item_id ): ?array {
		$result = $this->read_service->get_item(
			array( 'item_id' => $item_id )
		);

		return is_wp_error( $result ) ? null : $result;
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
		$result = $this->read_service->get_item_for_post(
			array( 'post_id' => $post_id )
		);

		return is_wp_error( $result ) ? null : $result;
	}

	/**
	 * Looks up active items for a page of source post IDs in one query. Backed
	 * by the (source_post_id, import_date_gmt) index.
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
		$result = $this->read_service->get_active_items_by_source_ids(
			array(
				'source_site_url' => $source_site_url,
				'source_ids'      => $source_ids,
			)
		);

		return is_wp_error( $result ) ? array() : $result;
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
		$result = $this->read_service->list_imported_source_rows(
			array(
				'source_site_url' => $source_site_url,
				'page'            => $page,
				'per_page'        => $per_page,
				'args'            => $args,
			)
		);

		return is_wp_error( $result ) ? array() : $result;
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
		$result = $this->read_service->list_failures(
			array(
				'source_site_url' => $source_site_url,
				'offset'          => $offset,
				'limit'           => $limit,
				'ignored'         => $ignored,
			)
		);

		return is_wp_error( $result ) ? array() : $result;
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
		$result = $this->read_service->count_failures(
			array(
				'source_site_url' => $source_site_url,
				'ignored'         => $ignored,
			)
		);

		return is_wp_error( $result ) ? 0 : $result['count'];
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
		$result = $this->read_service->get_items_for_posts(
			array( 'post_ids' => $post_ids )
		);

		return is_wp_error( $result ) ? array() : $result;
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
