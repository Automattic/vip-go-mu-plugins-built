<?php
/**
 * Source-site scoping backfill for pre-scoping imports.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

use Safe_Publish\Validators\URL_Validator;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Backfills the source-site scoping meta onto imports created before that
 * scoping existed.
 *
 * Imports made before path-bearing source scoping carry a source post/term ID
 * but no source-site identity, so the scoped lookups added alongside this class
 * stop recognizing them. This runs once per destination, in batches across
 * admin loads, writing the same identity an import writes today.
 *
 * When the import history spans more than one source the per-record identity
 * cannot be inferred, so nothing is written and Source_Backfill_Notice asks the
 * operator to re-import or contact support.
 */
final class Source_Site_Url_Backfill {

	/**
	 * Option tracking the backfill's terminal state. Unset while work remains.
	 */
	public const STATUS_OPTION = 'safe_publish_source_backfill_status';

	/**
	 * User meta key recording that a user dismissed the needs-attention notice.
	 */
	public const NOTICE_DISMISSED_META = 'safe_publish_source_backfill_notice_dismissed';

	/**
	 * Terminal status: every keyless record was backfilled, or there were none.
	 */
	private const STATUS_DONE = 'done';

	/**
	 * Terminal status: keyless records exist but their source is ambiguous.
	 */
	private const STATUS_NEEDS_ATTENTION = 'needs_attention';

	/**
	 * Records backfilled per admin load.
	 */
	private const BATCH_SIZE = 100;

	/**
	 * Object-cache key for the single-runner lock that serializes concurrent
	 * admin loads.
	 */
	public const LOCK_KEY = 'safe_publish_source_backfill_lock';

	/**
	 * Runs one batch of the backfill, or settles a terminal state.
	 */
	public static function maybe_run(): void {
		// A page-load task: skip frequent AJAX requests (heartbeat, autosave).
		if ( wp_doing_ajax() ) {
			return;
		}

		global $wpdb;

		if ( ! isset( $wpdb ) ) {
			return;
		}

		$status = get_option( self::STATUS_OPTION );
		if ( self::STATUS_DONE === $status
			|| self::STATUS_NEEDS_ATTENTION === $status
		) {
			return;
		}

		// Serialize concurrent admin loads so two requests can't write the same
		// batch and create duplicate meta. Atomic with a persistent object
		// cache (the plugin's VIP target); without one the writes stay
		// idempotent, so the worst case is a duplicate same-value row. The TTL
		// only matters as a safety net if a request dies before releasing.
		$lock = wp_cache_add( self::LOCK_KEY, 1, '', 5 * MINUTE_IN_SECONDS );
		if ( false === $lock ) {
			return;
		}

		try {
			$post_ids = self::keyless_post_ids( self::BATCH_SIZE );
			$term_ids = self::keyless_term_ids( self::BATCH_SIZE );

			if ( array() === $post_ids && array() === $term_ids ) {
				update_option( self::STATUS_OPTION, self::STATUS_DONE, false );
				return;
			}

			$identity = self::resolve_source_identity();

			if ( null === $identity ) {
				update_option(
					self::STATUS_OPTION,
					self::STATUS_NEEDS_ATTENTION,
					false
				);
				return;
			}

			if ( '' === $identity ) {
				// No source signal yet (no history, no connection). Retry on a
				// later load once the connection is configured.
				return;
			}

			foreach ( $post_ids as $post_id ) {
				update_post_meta(
					$post_id,
					Options::META_SOURCE_SITE_URL,
					$identity
				);
			}
			foreach ( $term_ids as $term_id ) {
				update_term_meta(
					$term_id,
					Options::META_SOURCE_TERM_URL,
					$identity
				);
			}

			// A short batch means none of that type remain; done when both are.
			if ( count( $post_ids ) < self::BATCH_SIZE
				&& count( $term_ids ) < self::BATCH_SIZE
			) {
				update_option( self::STATUS_OPTION, self::STATUS_DONE, false );
			}
		} finally {
			wp_cache_delete( self::LOCK_KEY );
		}
	}

	/**
	 * Returns whether the backfill flagged this destination for operator
	 * attention because its imports span more than one source.
	 *
	 * @return bool True when the needs-attention notice should show.
	 */
	public static function needs_attention(): bool {
		return self::STATUS_NEEDS_ATTENTION === get_option( self::STATUS_OPTION );
	}

	/**
	 * Resolves the single source-site identity to attribute keyless records to.
	 *
	 * Returns the path-bearing identity to write; '' when there is no signal
	 * yet (defer to a later load); or null when the source is ambiguous and
	 * nothing should be written. The value comes from the current connection so
	 * it is byte-identical to what an import writes; history is consulted only
	 * to count sources, since pre-scoping rows dropped the subsite path.
	 *
	 * @return string|null Identity to write, '' to defer, or null when ambiguous.
	 */
	private static function resolve_source_identity(): ?string {
		$hosts = self::distinct_history_hosts();
		$count = count( $hosts );

		if ( $count >= 2 ) {
			return null;
		}

		$connection = Options::get_connected_site_url_with_path();

		if ( 1 === $count ) {
			$connection_host = URL_Validator::normalize_site_url(
				(string) Options::get_value( Options::OPTION_CONNECTED_SITE_URL, '' )
			);
			if ( '' !== $connection && $connection_host === $hosts[0] ) {
				return $connection;
			}
			return null;
		}

		// No import history: attribute to the current connection when set.
		return $connection;
	}

	/**
	 * Returns the distinct source hosts recorded in the imports table, each
	 * reduced to its scheme://host[:port] identity.
	 *
	 * Comparing by host (not the path-bearing identity) keeps a legacy
	 * host-only row and a current path-bearing row for the same connection
	 * counted once, so a new import made mid-backfill cannot flip the
	 * destination to multi-source.
	 *
	 * @return string[] Distinct non-empty host identities.
	 */
	private static function distinct_history_hosts(): array {
		global $wpdb;

		$table = Imports_Table::table_name();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_col( "SELECT DISTINCT source_site_url FROM `{$table}`" );

		$hosts = array();
		foreach ( $rows as $row ) {
			$host = URL_Validator::normalize_site_url( (string) $row );
			if ( '' !== $host ) {
				$hosts[ $host ] = true;
			}
		}

		return array_keys( $hosts );
	}

	/**
	 * Returns IDs of posts carrying a source post ID but no source-site URL.
	 *
	 * @param int $limit Maximum IDs to return.
	 * @return int[] Keyless post IDs.
	 */
	private static function keyless_post_ids( int $limit ): array {
		global $wpdb;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT pm.post_id FROM `{$wpdb->postmeta}` pm
				WHERE pm.meta_key = %s
				AND NOT EXISTS (
					SELECT 1 FROM `{$wpdb->postmeta}` pm2
					WHERE pm2.post_id = pm.post_id AND pm2.meta_key = %s
				)
				LIMIT %d",
				Options::META_SOURCE_POST_ID,
				Options::META_SOURCE_SITE_URL,
				$limit
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return array_map( 'intval', $ids );
	}

	/**
	 * Returns IDs of terms carrying a source term ID but no source-site URL.
	 *
	 * @param int $limit Maximum IDs to return.
	 * @return int[] Keyless term IDs.
	 */
	private static function keyless_term_ids( int $limit ): array {
		global $wpdb;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT tm.term_id FROM `{$wpdb->termmeta}` tm
				WHERE tm.meta_key = %s
				AND NOT EXISTS (
					SELECT 1 FROM `{$wpdb->termmeta}` tm2
					WHERE tm2.term_id = tm.term_id AND tm2.meta_key = %s
				)
				LIMIT %d",
				Options::META_SOURCE_TERM_ID,
				Options::META_SOURCE_TERM_URL,
				$limit
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return array_map( 'intval', $ids );
	}
}
