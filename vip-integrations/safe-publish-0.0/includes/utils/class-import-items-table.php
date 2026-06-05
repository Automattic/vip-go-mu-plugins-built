<?php
/**
 * Import Items Table class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

/**
 * Manages the custom table that stores one row per imported item within a
 * session.
 *
 * Handles table creation only; reads and writes are performed by
 * History_Repository.
 */
final class Import_Items_Table {

	/**
	 * Table schema version.
	 */
	private const VERSION = '1.0';

	/**
	 * Option key used to track the installed table schema version.
	 */
	private const VERSION_OPTION = 'safe_publish_import_items_version';

	/**
	 * Returns the full table name including the WordPress table prefix.
	 *
	 * @return string Full table name.
	 */
	public static function table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'safe_publish_import_items';
	}

	/**
	 * Creates the import items table if it does not exist or is out of date.
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
	 * Creates or upgrades the import items table using dbDelta.
	 *
	 * @psalm-suppress MissingFile
	 */
	public static function create_table(): void {
		global $wpdb;

		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();

		// status_import_date powers the Failures listing (status='error'
		// ordered by import_date_gmt DESC). The existing session_id_status
		// composite leads with session_id, so that query can't index-seek on
		// status alone without this one.
		$sql = "CREATE TABLE {$table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			session_id BIGINT UNSIGNED NOT NULL,
			title TEXT NOT NULL,
			source_post_id BIGINT UNSIGNED NULL DEFAULT NULL,
			status VARCHAR(20) NOT NULL,
			post_id BIGINT UNSIGNED NULL DEFAULT NULL,
			error_message TEXT NULL DEFAULT NULL,
			content_changes LONGTEXT NULL DEFAULT NULL,
			warnings LONGTEXT NULL DEFAULT NULL,
			has_previous_content TINYINT(1) NOT NULL DEFAULT 0,
			rolled_back TINYINT(1) NOT NULL DEFAULT 0,
			import_date_gmt DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY session_id_status (session_id, status),
			KEY post_id_import_date (post_id, import_date_gmt),
			KEY status_import_date (status, import_date_gmt)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::VERSION_OPTION, self::VERSION, false );
	}
}
