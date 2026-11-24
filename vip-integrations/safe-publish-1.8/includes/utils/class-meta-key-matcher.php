<?php
/**
 * Meta Key Matcher utility class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Compares post meta keys the way the postmeta meta_key column does.
 */
final class Meta_Key_Matcher {

	/**
	 * Collations under which equal printable ASCII keys differ at most in case
	 * and trailing spaces.
	 */
	private const CASE_INSENSITIVE_ASCII_COLLATIONS = array(
		'utf8mb4_unicode_520_ci',
		'utf8mb4_unicode_ci',
		'utf8mb4_general_ci',
		'utf8mb4_0900_ai_ci',
		'utf8mb4_uca1400_ai_ci',
		'utf8mb3_unicode_ci',
		'utf8mb3_general_ci',
		'utf8_unicode_ci',
		'utf8_general_ci',
		'latin1_swedish_ci',
	);

	/**
	 * Checks whether a meta key equals one of the given keys under the meta_key
	 * column's collation, which lookups compare keys with. The database checks
	 * keys PHP can't compare, once per request, table, and key list; a failed
	 * check counts as a match.
	 *
	 * @param string   $meta_key Meta key, as stored.
	 * @param string[] $keys     Lowercase printable ASCII keys; at least one.
	 * @return bool Whether lookups read the key as one of the keys.
	 */
	public static function matches( string $meta_key, array $keys ): bool {
		global $wpdb;
		static $matches = array();

		// SQLite folds only ASCII case, as strtolower() does, and has no MySQL
		// collations to query.
		/** @psalm-suppress UndefinedClass */
		if ( is_a( $wpdb, 'WP_SQLite_DB' ) ) {
			return in_array( strtolower( $meta_key ), $keys, true );
		}

		$table     = $wpdb->postmeta;
		$collation = self::meta_key_collation( $table );

		if (
			in_array(
				$collation,
				self::CASE_INSENSITIVE_ASCII_COLLATIONS,
				true
			)
			&& 0 === preg_match( '/[^\x20-\x7E]/', $meta_key )
		) {
			return in_array(
				strtolower( rtrim( $meta_key, ' ' ) ),
				$keys,
				true
			);
		}

		$list = implode( ',', $keys );

		if ( isset( $matches[ $table ][ $list ][ $meta_key ] ) ) {
			return $matches[ $table ][ $list ][ $meta_key ];
		}

		$placeholders = implode( ', ', array_fill( 0, count( $keys ), '%s' ) );
		$key          = self::meta_key_placeholder( $collation );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$match = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT {$key} IN ($placeholders)",
				$meta_key,
				...$keys
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber,WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		$matches[ $table ][ $list ][ $meta_key ] = '0' !== $match;

		return $matches[ $table ][ $list ][ $meta_key ];
	}

	/**
	 * Returns a postmeta table's meta_key collation, or an empty string when it
	 * can't be read.
	 *
	 * @param string $table Postmeta table name.
	 * @return string Collation name.
	 */
	private static function meta_key_collation( string $table ): string {
		global $wpdb;
		static $collations = array();

		if ( ! isset( $collations[ $table ] ) ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$column = $wpdb->get_row(
				$wpdb->prepare(
					'SHOW FULL COLUMNS FROM %i WHERE Field = %s',
					$table,
					'meta_key'
				),
				ARRAY_A
			);

			$collations[ $table ] = (string) ( $column['Collation'] ?? '' );
		}

		return $collations[ $table ];
	}

	/**
	 * Returns a key placeholder compared under a meta_key collation, or under
	 * the connection's when the collation name is invalid.
	 *
	 * @param string $collation Collation name.
	 * @return string SQL holding one %s placeholder.
	 */
	private static function meta_key_placeholder( string $collation ): string {
		return 1 === preg_match( '/^([a-z0-9]+)_\w+$/', $collation, $match )
			? "CONVERT( %s USING {$match[1]} ) COLLATE {$collation}"
			: '%s';
	}
}
