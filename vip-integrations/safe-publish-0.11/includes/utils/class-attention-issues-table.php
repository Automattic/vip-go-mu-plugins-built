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
 * target_kind, target_slug) — keeps the "Needs attention" reads cheap and
 * dedup structural. An integer-keyed issue fills target_ref; a string-keyed
 * one fills target_slug and leaves target_ref at 0, which also marks it
 * unresolvable. URL-keyed types store the md5 in target_slug, the URL in
 * detail.
 * Handles table creation only; reads and writes go through
 * Attention_Issues_Repository.
 */
final class Attention_Issues_Table {

	/**
	 * Table schema version.
	 */
	private const VERSION = '3';

	/**
	 * Option key used to track the installed table schema version.
	 */
	private const VERSION_OPTION = 'safe_publish_attention_issues_version';

	/**
	 * Name of the unique key carrying the row identity.
	 */
	private const IDENTITY_INDEX = 'issue_identity';

	/**
	 * Columns the identity key must cover, in order.
	 *
	 * @var string[]
	 */
	private const IDENTITY_COLUMNS = array(
		'affected_post_id',
		'issue_type',
		'target_ref',
		'target_kind',
		'target_slug',
	);

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

		self::drop_outdated_identity_index();

		$sql = "CREATE TABLE {$table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			affected_post_id BIGINT UNSIGNED NOT NULL,
			issue_type VARCHAR(40) NOT NULL,
			target_ref BIGINT UNSIGNED NOT NULL,
			target_kind VARCHAR(16) NOT NULL,
			target_slug VARCHAR(100) NOT NULL DEFAULT '',
			severity VARCHAR(8) NOT NULL,
			source_site_url VARCHAR(255) NOT NULL,
			detail LONGTEXT NULL DEFAULT NULL,
			first_detected_gmt DATETIME NOT NULL,
			last_seen_gmt DATETIME NOT NULL,
			status VARCHAR(10) NOT NULL DEFAULT 'open',
			ignored_gmt DATETIME NULL DEFAULT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY issue_identity (affected_post_id, issue_type, target_ref, target_kind, target_slug),
			KEY source_status (source_site_url, status),
			KEY target_lookup (issue_type, target_ref, source_site_url)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::VERSION_OPTION, self::VERSION, false );
	}

	/**
	 * Drops issue_identity when its columns differ from the current schema.
	 *
	 * A changed key is dbDelta's blind spot: It matches an index by name and
	 * leaves the old columns in place, so the stale key has to go first. Reads
	 * SHOW INDEX, not information_schema, whose index metadata MySQL serves
	 * from a cache that can be a day stale.
	 *
	 * Version-independent: It fires whenever issue_identity's columns differ
	 * from IDENTITY_COLUMNS, so a later change to the key needs no new code.
	 */
	private static function drop_outdated_identity_index(): void {
		global $wpdb;

		$table = self::table_name();
		$index = self::IDENTITY_INDEX;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange
		// SHOW INDEX errors on a missing table, so confirm it exists first.
		$found = $wpdb->get_var(
			$wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) )
		);

		if ( null === $found ) {
			return;
		}

		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SHOW INDEX FROM `{$table}` WHERE Key_name = %s",
				$index
			),
			ARRAY_A
		);

		if ( ! is_array( $rows ) || array() === $rows ) {
			return;
		}

		$columns = array();
		foreach ( $rows as $row ) {
			$columns[ (int) $row['Seq_in_index'] ] = (string) $row['Column_name'];
		}
		ksort( $columns );

		if ( self::IDENTITY_COLUMNS === array_values( $columns ) ) {
			return;
		}

		$wpdb->query( "ALTER TABLE `{$table}` DROP INDEX `{$index}`" );
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange
	}
}
