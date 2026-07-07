<?php
/**
 * Attention Issues Table class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

/**
 * Manages the custom table that stores one row per open degradation issue.
 *
 * One upserted row per identity — (affected_post_id, issue_type, target_ref,
 * target_kind) — keeps the "Needs attention" reads cheap and dedup structural.
 * Handles table creation only; reads and writes go through
 * Attention_Issues_Repository.
 */
final class Attention_Issues_Table {

	/**
	 * Table schema version.
	 */
	private const VERSION = '1';

	/**
	 * Option key used to track the installed table schema version.
	 */
	private const VERSION_OPTION = 'safe_publish_attention_issues_version';

	/**
	 * Returns the full table name including the WordPress table prefix.
	 *
	 * @return string Full table name.
	 */
	public static function table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'safe_publish_attention_issues';
	}

	/**
	 * Creates the attention issues table if it does not exist or is out of date.
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
	 * Creates or upgrades the attention issues table using dbDelta.
	 *
	 * @psalm-suppress MissingFile
	 */
	public static function create_table(): void {
		global $wpdb;

		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			affected_post_id BIGINT UNSIGNED NOT NULL,
			issue_type VARCHAR(40) NOT NULL,
			target_ref BIGINT UNSIGNED NOT NULL,
			target_kind VARCHAR(8) NOT NULL,
			severity VARCHAR(8) NOT NULL,
			source_site_url VARCHAR(255) NOT NULL,
			detail LONGTEXT NULL DEFAULT NULL,
			first_detected_gmt DATETIME NOT NULL,
			last_seen_gmt DATETIME NOT NULL,
			status VARCHAR(10) NOT NULL DEFAULT 'open',
			PRIMARY KEY  (id),
			UNIQUE KEY issue_identity (affected_post_id, issue_type, target_ref, target_kind),
			KEY source_status (source_site_url, status),
			KEY target_lookup (issue_type, target_ref, source_site_url)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::VERSION_OPTION, self::VERSION, false );
	}
}
