<?php
/**
 * Datetime Sanitizer class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

use DateTimeImmutable;
use DateTimeZone;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared date/datetime parser used by every date-range AJAX/REST handler
 * to accept ISO 8601 datetimes alongside bare calendar days.
 */
class Datetime_Sanitizer {

	/**
	 * Validates an incoming ISO 8601 datetime or bare calendar-day param.
	 *
	 * The `!` prefix on the formats resets unparsed fields to zero — without
	 * it, a date-only input would inherit the current clock time. For a
	 * date-only upper bound, $ceiling lifts the moment to end-of-day so
	 * events on that calendar day are included.
	 *
	 * @param mixed $value   Raw param value.
	 * @param bool  $ceiling True when this is the upper bound of a range.
	 * @return string|null|false MySQL datetime, null when absent, or false
	 *                           on parse failure.
	 */
	public static function sanitize_iso_datetime(
		mixed $value,
		bool $ceiling = false
	): string|null|false {
		if ( null === $value || '' === $value ) {
			return null;
		}

		if ( ! is_string( $value ) ) {
			return false;
		}

		$utc = new DateTimeZone( 'UTC' );

		foreach ( array( '!' . DATE_ATOM, '!Y-m-d\TH:i:s' ) as $format ) {
			$dt = DateTimeImmutable::createFromFormat( $format, $value );
			if ( false !== $dt ) {
				return $dt->setTimezone( $utc )->format( 'Y-m-d H:i:s' );
			}
		}

		$dt = DateTimeImmutable::createFromFormat( '!Y-m-d', $value );
		if ( false !== $dt && $dt->format( 'Y-m-d' ) === $value ) {
			if ( $ceiling ) {
				$dt = $dt->setTime( 23, 59, 59 );
			}
			return $dt->format( 'Y-m-d H:i:s' );
		}

		return false;
	}
}
