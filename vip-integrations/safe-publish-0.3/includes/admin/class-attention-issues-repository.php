<?php
/**
 * Attention Issues Repository class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Attention_Issues_Table;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stores and reconciles the current set of open degradation issues.
 *
 * State projection, not an event log: one upserted row per identity
 * (affected_post_id, issue_type, target_ref, target_kind). Detection upserts
 * on a still-open degradation and resolves (deletes) the row once the
 * underlying reconciliation succeeds, so reads are a plain SELECT of open
 * rows.
 */
final class Attention_Issues_Repository {

	/**
	 * Inserts an open issue or refreshes the existing row for its identity.
	 *
	 * @param int    $affected_post_id Destination post the issue is attached to.
	 * @param string $issue_type       One of the tracked issue types.
	 * @param int    $target_ref       Source id of the unresolved target.
	 * @param string $target_kind      'post' or 'term'.
	 * @param string $severity         'warning' or 'error'.
	 * @param string $source_site_url  Path-bearing source identity.
	 * @param array  $detail           Small render payload, stored as JSON.
	 */
	public function upsert_issue(
		int $affected_post_id,
		string $issue_type,
		int $target_ref,
		string $target_kind,
		string $severity,
		string $source_site_url,
		array $detail = array()
	): void {
		global $wpdb;

		$table  = Attention_Issues_Table::table_name();
		$now    = current_time( 'mysql', true );
		$detail = $this->encode_detail( $detail );

		// target_kind is part of the key, so the UPDATE clause omits it.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare(
				"INSERT INTO `{$table}`"
					. ' (affected_post_id, issue_type, target_ref, target_kind,'
					. ' severity, source_site_url, detail, first_detected_gmt,'
					. ' last_seen_gmt, status)'
					. " VALUES (%d, %s, %d, %s, %s, %s, %s, %s, %s, 'open')"
					. ' ON DUPLICATE KEY UPDATE'
					. ' severity = %s, source_site_url = %s,'
					. " detail = %s, last_seen_gmt = %s, status = 'open'",
				$affected_post_id,
				$issue_type,
				$target_ref,
				$target_kind,
				$severity,
				$source_site_url,
				$detail,
				$now,
				$now,
				$severity,
				$source_site_url,
				$detail,
				$now
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Reconciles the open issues attached to one imported post.
	 *
	 * The import produces the authoritative current set of degradations for the
	 * post, so each present issue is upserted and any open row of a managed type
	 * whose ref is no longer present is resolved.
	 *
	 * @param int      $affected_post_id Destination post id.
	 * @param string   $source_site_url  Path-bearing source identity.
	 * @param string[] $managed_types    Issue types this reconcile owns.
	 * @param array[]  $current          Issues to keep open; each carries
	 *                                   issue_type, target_ref, target_kind,
	 *                                   severity, and an optional detail array.
	 */
	public function reconcile_post_issues(
		int $affected_post_id,
		string $source_site_url,
		array $managed_types,
		array $current
	): void {
		foreach ( $current as $issue ) {
			$this->upsert_issue(
				$affected_post_id,
				$issue['issue_type'],
				(int) $issue['target_ref'],
				$issue['target_kind'],
				$issue['severity'],
				$source_site_url,
				$issue['detail'] ?? array()
			);
		}

		$this->delete_stale_post_issues(
			$affected_post_id,
			$managed_types,
			$current
		);
	}

	/**
	 * Reconciles open issues that share one target ref across many posts.
	 *
	 * Used by the navigation rewriter: posts whose write failed stay open;
	 * every other open issue for the target is resolved, because those posts now
	 * reference it correctly or no longer reference it at all.
	 *
	 * @param string $issue_type      Issue type.
	 * @param int    $target_ref      Source id of the shared target (the menu).
	 * @param string $target_kind     'post' or 'term'.
	 * @param string $severity        'warning' or 'error'.
	 * @param string $source_site_url Path-bearing source identity.
	 * @param int[]  $failed_post_ids Posts whose reconciliation write failed.
	 * @param array  $detail          Small render payload, stored as JSON.
	 */
	public function reconcile_target_issues(
		string $issue_type,
		int $target_ref,
		string $target_kind,
		string $severity,
		string $source_site_url,
		array $failed_post_ids,
		array $detail = array()
	): void {
		if ( '' === $source_site_url ) {
			return;
		}

		$failed_post_ids = array_map( 'intval', $failed_post_ids );

		foreach ( $failed_post_ids as $post_id ) {
			$this->upsert_issue(
				$post_id,
				$issue_type,
				$target_ref,
				$target_kind,
				$severity,
				$source_site_url,
				$detail
			);
		}

		$this->delete_target_issues_except(
			$issue_type,
			$target_ref,
			$source_site_url,
			$failed_post_ids
		);
	}

	/**
	 * Deletes every issue attached to a destination post.
	 *
	 * Wired to post deletion: a hard-deleted post can never be re-imported to
	 * reconcile its issues, so they would otherwise linger unfixably.
	 *
	 * @param int $affected_post_id Destination post id.
	 */
	public function delete_for_post( int $affected_post_id ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete(
			Attention_Issues_Table::table_name(),
			array( 'affected_post_id' => $affected_post_id ),
			array( '%d' )
		);
	}

	/**
	 * Returns a page of open issues for a source identity, errors before
	 * warnings.
	 *
	 * @param string $source_site_url Path-bearing source identity.
	 * @param int    $page            1-indexed page number.
	 * @param int    $per_page        Items per page.
	 * @return array[] Open issue rows with detail decoded; one extra row is
	 *                 returned so callers can detect a further page.
	 */
	public function get_open_issues(
		string $source_site_url,
		int $page = 1,
		int $per_page = 20
	): array {
		global $wpdb;

		$table  = Attention_Issues_Table::table_name();
		$offset = max( 0, ( $page - 1 ) * $per_page );
		$limit  = $per_page + 1;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM `{$table}`"
					. " WHERE source_site_url = %s AND status = 'open'"
					. " ORDER BY FIELD(severity, 'error', 'warning'),"
					. ' last_seen_gmt DESC, id DESC'
					. ' LIMIT %d OFFSET %d',
				$source_site_url,
				$limit,
				$offset
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( ! is_array( $rows ) ) {
			return array();
		}

		return array_map(
			function ( array $row ): array {
				$row['detail'] = $this->decode_detail( $row['detail'] ?? '' );
				return $row;
			},
			$rows
		);
	}

	/**
	 * Counts open issues for a source identity.
	 *
	 * @param string $source_site_url Path-bearing source identity.
	 * @return int Number of open issue rows.
	 */
	public function count_open_issues( string $source_site_url ): int {
		global $wpdb;

		$table = Attention_Issues_Table::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM `{$table}`"
					. " WHERE source_site_url = %s AND status = 'open'",
				$source_site_url
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return null === $count ? 0 : (int) $count;
	}

	/**
	 * Fetches a single issue row.
	 *
	 * Pass $target_kind to disambiguate a post and a term that share a
	 * target_ref; leave it null to match the first row regardless of kind.
	 *
	 * @param int         $affected_post_id Destination post id.
	 * @param string      $issue_type       Issue type.
	 * @param int         $target_ref       Source id of the target.
	 * @param string|null $target_kind      'post', 'term', or null to match any.
	 * @return array|null Issue row with detail decoded, or null when absent.
	 */
	public function get_issue(
		int $affected_post_id,
		string $issue_type,
		int $target_ref,
		?string $target_kind = null
	): ?array {
		global $wpdb;

		$table  = Attention_Issues_Table::table_name();
		$where  = 'affected_post_id = %d AND issue_type = %s AND target_ref = %d';
		$params = array( $affected_post_id, $issue_type, $target_ref );

		if ( null !== $target_kind ) {
			$where   .= ' AND target_kind = %s';
			$params[] = $target_kind;
		}

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM `{$table}` WHERE {$where}",
				...$params
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( ! is_array( $row ) ) {
			return null;
		}

		$row['detail'] = $this->decode_detail( $row['detail'] ?? '' );

		return $row;
	}

	/**
	 * Resolves a single issue, keyed by its full identity.
	 *
	 * Lets a retry clear exactly the row it fixed without reconciling the post's
	 * other issues.
	 *
	 * @param int    $affected_post_id Destination post id.
	 * @param string $issue_type       Issue type.
	 * @param int    $target_ref       Source id of the target.
	 * @param string $target_kind      'post' or 'term'.
	 * @return int Number of rows deleted.
	 */
	public function resolve_issue(
		int $affected_post_id,
		string $issue_type,
		int $target_ref,
		string $target_kind
	): int {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$deleted = $wpdb->delete(
			Attention_Issues_Table::table_name(),
			array(
				'affected_post_id' => $affected_post_id,
				'issue_type'       => $issue_type,
				'target_ref'       => $target_ref,
				'target_kind'      => $target_kind,
			),
			array( '%d', '%s', '%d', '%s' )
		);

		return false === $deleted ? 0 : (int) $deleted;
	}

	/**
	 * Refreshes last_seen_gmt on a single issue, marking a retry that ran but did
	 * not resolve it.
	 *
	 * @param int    $affected_post_id Destination post id.
	 * @param string $issue_type       Issue type.
	 * @param int    $target_ref       Source id of the target.
	 * @param string $target_kind      'post' or 'term'.
	 */
	public function touch_issue(
		int $affected_post_id,
		string $issue_type,
		int $target_ref,
		string $target_kind
	): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->update(
			Attention_Issues_Table::table_name(),
			array( 'last_seen_gmt' => current_time( 'mysql', true ) ),
			array(
				'affected_post_id' => $affected_post_id,
				'issue_type'       => $issue_type,
				'target_ref'       => $target_ref,
				'target_kind'      => $target_kind,
			),
			array( '%s' ),
			array( '%d', '%s', '%d', '%s' )
		);
	}

	/**
	 * Resolves managed-type open rows for a post whose ref is no longer present.
	 *
	 * @param int      $affected_post_id Destination post id.
	 * @param string[] $managed_types    Issue types this reconcile owns.
	 * @param array[]  $current          Issues that should stay open.
	 */
	private function delete_stale_post_issues(
		int $affected_post_id,
		array $managed_types,
		array $current
	): void {
		global $wpdb;

		if ( array() === $managed_types ) {
			return;
		}

		$table  = Attention_Issues_Table::table_name();
		$params = array( $affected_post_id );

		$type_placeholders = implode(
			', ',
			array_fill( 0, count( $managed_types ), '%s' )
		);
		array_push( $params, ...$managed_types );

		$where = "affected_post_id = %d AND status = 'open'"
			. " AND issue_type IN ({$type_placeholders})";

		if ( count( $current ) > 0 ) {
			$tuples = array();
			foreach ( $current as $issue ) {
				$tuples[] = '(%s, %d, %s)';
				$params[] = $issue['issue_type'];
				$params[] = (int) $issue['target_ref'];
				$params[] = $issue['target_kind'];
			}
			$where .= ' AND (issue_type, target_ref, target_kind) NOT IN ('
				. implode( ', ', $tuples ) . ')';
		}

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare( "DELETE FROM `{$table}` WHERE {$where}", ...$params )
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Resolves open rows for a shared target except the posts that still fail.
	 *
	 * @param string $issue_type      Issue type.
	 * @param int    $target_ref      Source id of the shared target.
	 * @param string $source_site_url Path-bearing source identity.
	 * @param int[]  $keep_post_ids   Posts whose issue must stay open.
	 */
	private function delete_target_issues_except(
		string $issue_type,
		int $target_ref,
		string $source_site_url,
		array $keep_post_ids
	): void {
		global $wpdb;

		$table  = Attention_Issues_Table::table_name();
		$params = array( $issue_type, $target_ref, $source_site_url );

		$where = 'issue_type = %s AND target_ref = %d AND source_site_url = %s'
			. " AND status = 'open'";

		if ( count( $keep_post_ids ) > 0 ) {
			$placeholders = implode(
				', ',
				array_fill( 0, count( $keep_post_ids ), '%d' )
			);
			$where       .= " AND affected_post_id NOT IN ({$placeholders})";
			array_push( $params, ...$keep_post_ids );
		}

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare( "DELETE FROM `{$table}` WHERE {$where}", ...$params )
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Encodes a detail payload for storage.
	 *
	 * @param array $detail Render payload.
	 * @return string JSON string; empty string when encoding fails.
	 */
	private function encode_detail( array $detail ): string {
		$json = wp_json_encode( $detail );

		return false === $json ? '' : $json;
	}

	/**
	 * Decodes a stored detail payload.
	 *
	 * @param string|null $raw Stored JSON.
	 * @return array Decoded payload, or an empty array.
	 */
	private function decode_detail( ?string $raw ): array {
		if ( null === $raw || '' === $raw ) {
			return array();
		}

		$decoded = json_decode( $raw, true );

		return is_array( $decoded ) ? $decoded : array();
	}
}
