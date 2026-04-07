<?php
/**
 * Class for the smart link status enum.
 *
 * @package Parsely
 * @since 3.19.0
 */

namespace Parsely\Models;

/**
 * Smart Link Status enum.
 *
 * Since enum classes are only available since PHP 8, we need to use a class to
 * simulate an enum.
 *
 * @since 3.19.0
 */
class Smart_Link_Status {
	const ALL     = 'all';
	const APPLIED = 'applied';
	const PENDING = 'pending';

	/**
	 * Checks if a status is valid.
	 *
	 * @since 3.19.0
	 *
	 * @param string $status The status to check.
	 * @return bool True if the status is valid, false otherwise.
	 */
	public static function is_valid_status( string $status ): bool {
		return in_array( $status, self::get_all_statuses(), true );
	}

	/**
	 * Gets all the statuses.
	 *
	 * @since 3.19.0
	 *
	 * @return array<string> The statuses.
	 */
	public static function get_all_statuses(): array {
		return array( self::ALL, self::APPLIED, self::PENDING );
	}
}
