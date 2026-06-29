<?php
/**
 * Audit Log Table class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

/**
 * Manages the custom audit log table for Safe Publish.
 *
 * Handles table creation, row insertion, querying, and deletion.
 */
final class Audit_Log_Table {

	/**
	 * Table schema version.
	 */
	private const VERSION = '1';

	/**
	 * Option key used to track the installed table schema version.
	 */
	private const VERSION_OPTION = 'safe_publish_audit_log_version';

	/**
	 * Returns the full table name including the WordPress table prefix.
	 *
	 * @return string Full table name.
	 */
	public static function table_name(): string {
		global $wpdb;
		return $wpdb->prefix . 'safe_publish_audit_log';
	}

	/**
	 * Creates the audit log table if it does not exist or is out of date.
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
	 * Creates or upgrades the audit log table using dbDelta.
	 *
	 * @psalm-suppress MissingFile
	 */
	public static function create_table(): void {
		global $wpdb;

		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			channel VARCHAR(32) NOT NULL,
			level VARCHAR(8) NOT NULL,
			event VARCHAR(64) NOT NULL,
			created_at_gmt DATETIME NOT NULL,
			data LONGTEXT NOT NULL,
			PRIMARY KEY  (id),
			KEY channel_created_gmt (channel, created_at_gmt),
			KEY created_at_gmt (created_at_gmt)
		) {$charset};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $sql );

		update_option( self::VERSION_OPTION, self::VERSION, false );
	}

	/**
	 * Inserts a log event row.
	 *
	 * @param string $channel        Logger channel (e.g. 'auth').
	 * @param string $level          Event level: 'info' or 'error'.
	 * @param string $event          Event type string (e.g. 'REQUEST_AUTHENTICATED').
	 * @param string $created_at_gmt MySQL-formatted GMT datetime string.
	 * @param array  $data           Event payload, stored as JSON.
	 */
	public static function insert(
		string $channel,
		string $level,
		string $event,
		string $created_at_gmt,
		array $data
	): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$wpdb->insert(
			self::table_name(),
			array(
				'channel'        => $channel,
				'level'          => $level,
				'event'          => $event,
				'created_at_gmt' => $created_at_gmt,
				'data'           => wp_json_encode( $data, JSON_UNESCAPED_SLASHES ),
			),
			array( '%s', '%s', '%s', '%s', '%s' )
		);
	}

	/**
	 * Queries log events in reverse-chronological order.
	 *
	 * @param array $args {
	 *     Optional query arguments.
	 *
	 *     @type string|string[] $channel    Filter by channel(s). String or array.
	 *     @type string|string[] $level      Filter by level(s). String or array.
	 *     @type string          $event_type Partial match on the event column.
	 *     @type string          $after_gmt  MySQL GMT datetime; rows with created_at_gmt >= this.
	 *     @type string          $before_gmt MySQL GMT datetime; rows with created_at_gmt <= this.
	 *     @type int             $limit      Maximum rows to return. Default 50, max 100.
	 *     @type int             $offset     Row offset for pagination. Default 0.
	 * }
	 * @return array Rows with 'data' decoded from JSON to an array.
	 */
	public static function get_events( array $args = array() ): array {
		global $wpdb;

		$table  = self::table_name();
		$limit  = min( absint( $args['limit'] ?? 50 ), 100 );
		$offset = absint( $args['offset'] ?? 0 );

		list( $where_sql, $values ) = self::build_where_clause( $args );
		$values[]                   = $limit;
		$values[]                   = $offset;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare( "SELECT * FROM `{$table}` {$where_sql} ORDER BY created_at_gmt DESC, id DESC LIMIT %d OFFSET %d", ...$values ),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( ! $rows ) {
			return array();
		}

		return array_map(
			static function ( array $row ): array {
				$row['data'] = json_decode( $row['data'], true ) ?? array();
				return $row;
			},
			$rows
		);
	}

	/**
	 * Counts log events matching the given filters.
	 *
	 * @param array $args Accepts the same filter keys as get_events(), without limit/offset.
	 * @return int Total matching row count.
	 */
	public static function count( array $args = array() ): int {
		global $wpdb;

		$table = self::table_name();

		list( $where_sql, $values ) = self::build_where_clause( $args );

		if ( $values ) {
			// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			return (int) $wpdb->get_var(
				$wpdb->prepare( "SELECT COUNT(*) FROM `{$table}` {$where_sql}", ...$values )
			);
			// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$table}`" );
	}

	/**
	 * Builds the WHERE clause + ordered parameter list from the shared filter
	 * args used by get_events() and count(). Pulling the logic up keeps the
	 * two query methods in sync as filters evolve.
	 *
	 * @param array $args Filter args; see get_events() docblock for keys.
	 * @return array Two-element list: [ string $where_sql, array $values ].
	 */
	private static function build_where_clause( array $args ): array {
		global $wpdb;

		$conditions = array();
		$values     = array();

		if ( ! empty( $args['channel'] ) ) {
			$channels     = array_values( (array) $args['channel'] );
			$placeholders = implode( ', ', array_fill( 0, count( $channels ), '%s' ) );
			$conditions[] = "channel IN ({$placeholders})";
			array_push( $values, ...$channels );
		}

		if ( ! empty( $args['level'] ) ) {
			$levels       = array_values( (array) $args['level'] );
			$placeholders = implode( ', ', array_fill( 0, count( $levels ), '%s' ) );
			$conditions[] = "level IN ({$placeholders})";
			array_push( $values, ...$levels );
		}

		if ( ! empty( $args['event_type'] ) ) {
			$conditions[] = 'event LIKE %s';
			$values[]     = '%' . $wpdb->esc_like( $args['event_type'] ) . '%';
		}

		if ( ! empty( $args['after_gmt'] ) ) {
			$conditions[] = 'created_at_gmt >= %s';
			$values[]     = $args['after_gmt'];
		}

		if ( ! empty( $args['before_gmt'] ) ) {
			$conditions[] = 'created_at_gmt <= %s';
			$values[]     = $args['before_gmt'];
		}

		$where_sql = $conditions ? 'WHERE ' . implode( ' AND ', $conditions ) : '';

		return array( $where_sql, $values );
	}

	/**
	 * Returns the most recent created_at_gmt timestamp for events matching any
	 * of the given patterns.
	 *
	 * @param string   $channel         Channel to filter by (e.g. 'auth').
	 * @param string[] $event_patterns  Substrings to match against the event column (OR logic).
	 * @return string|null GMT MySQL datetime string, or null if none match.
	 */
	public static function get_last_timestamp(
		string $channel,
		array $event_patterns
	): ?string {
		global $wpdb;

		$table           = self::table_name();
		$like_conditions = array();
		$values          = array( $channel );

		foreach ( $event_patterns as $pattern ) {
			$like_conditions[] = 'event LIKE %s';
			$values[]          = '%' . $wpdb->esc_like( $pattern ) . '%';
		}

		$event_where = implode( ' OR ', $like_conditions );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT MAX(created_at_gmt) FROM `{$table}` WHERE channel = %s AND ({$event_where})",
				...$values
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return false !== $result ? $result : null;
	}

	/**
	 * Deletes all log events for a given channel.
	 *
	 * @param string $channel Channel whose rows should be deleted (e.g. 'auth').
	 */
	public static function clear( string $channel ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete(
			self::table_name(),
			array( 'channel' => $channel ),
			array( '%s' )
		);
	}
}
