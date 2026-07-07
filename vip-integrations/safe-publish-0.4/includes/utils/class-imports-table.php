<?php
/**
 * Imports Table class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

/**
 * Manages the custom table that stores one row per import session.
 *
 * Handles table creation only; reads and writes are performed by
 * History_Repository.
 */
final class Imports_Table {

	/**
	 * Table schema version.
	 */
	private const VERSION = '1.0';

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
			KEY created_at_gmt (created_at_gmt)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::VERSION_OPTION, self::VERSION, false );
	}
}
