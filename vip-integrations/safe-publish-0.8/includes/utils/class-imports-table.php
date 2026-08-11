<?php
/**
 * Imports Table class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

use Safe_Publish\Validators\URL_Validator;

/**
 * Manages the custom table that stores one row per import session.
 *
 * Handles table creation and one-time data migrations; reads and writes are
 * performed by History_Repository.
 */
final class Imports_Table {

	/**
	 * Table schema version.
	 */
	private const VERSION = '1.1';

	/**
	 * Option key used to track the installed table schema version.
	 */
	private const VERSION_OPTION = 'safe_publish_imports_version';

	/**
	 * Returns the full table name including the WordPress table prefix.
	 *
	 * @return string Full table name.
	 */
	public static function table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'safe_publish_imports';
	}

	/**
	 * Counts the rows in the imports table.
	 *
	 * @return int Total number of session rows.
	 */
	public static function count(): int {
		global $wpdb;

		$table = self::table_name();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$table}`" );
	}

	/**
	 * Creates the imports table if it does not exist or is out of date.
	 */
	public static function maybe_create_table(): void {
		global $wpdb;

		if ( ! isset( $wpdb ) ) {
			return;
		}

		if ( get_option( self::VERSION_OPTION ) === self::VERSION ) {
			return;
		}

		self::create_table();
	}

	/**
	 * Creates or upgrades the imports table using dbDelta.
	 *
	 * @psalm-suppress MissingFile
	 */
	public static function create_table(): void {
		global $wpdb;

		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT UNSIGNED NOT NULL DEFAULT 0,
			user_display_name VARCHAR(250) NOT NULL DEFAULT '',
			source_site_url VARCHAR(255) NOT NULL,
			session_type VARCHAR(20) NOT NULL,
			status VARCHAR(20) NOT NULL,
			ended_at_gmt DATETIME NULL DEFAULT NULL,
			created_at_gmt DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY created_at_gmt (created_at_gmt),
			KEY source_site_url (source_site_url)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		// Record the version only on success, so a database error leaves the
		// migration to retry instead of marking it complete.
		if ( self::normalize_source_site_urls() ) {
			update_option( self::VERSION_OPTION, self::VERSION, false );
		}
	}

	/**
	 * Rewrites stored source identities to their normalized path-bearing form.
	 *
	 * Sessions once recorded the raw connection option while post meta and
	 * degradations recorded the normalized identity. A trailing slash in the
	 * option was enough to stop the two from comparing equal.
	 *
	 * Self-checking: It normalizes each distinct stored value and rewrites
	 * only what differs, so a repeat run or a reset version option is safe.
	 *
	 * @return bool True when the table was left fully normalized, false on a
	 *              database error so the caller can retry.
	 */
	private static function normalize_source_site_urls(): bool {
		global $wpdb;

		$table = self::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$stored = $wpdb->get_col(
			"SELECT DISTINCT source_site_url FROM `{$table}`"
		);

		// An empty read means either an empty table or a failed query;
		// last_error separates the two.
		if ( '' !== $wpdb->last_error ) {
			return false;
		}

		$succeeded = true;

		foreach ( $stored as $value ) {
			$value      = (string) $value;
			$normalized = URL_Validator::normalize_site_url_with_path( $value );

			// An unparseable value normalizes to '' and is left alone.
			if ( '' === $normalized || $normalized === $value ) {
				continue;
			}

			$updated = $wpdb->update(
				$table,
				array( 'source_site_url' => $normalized ),
				array( 'source_site_url' => $value ),
				array( '%s' ),
				array( '%s' )
			);

			// Carry on so one bad value cannot block the rest; the caller
			// retries the whole pass.
			if ( false === $updated ) {
				$succeeded = false;
			}
		}
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return $succeeded;
	}
}
