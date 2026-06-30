<?php
/**
 * Sync_State_Comparator utility class.
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
 * Decides whether a source post is newer than the destination's last
 * import snapshot.
 *
 * Anchored on the items table's `import_date_gmt`, not the local post's
 * `post_modified_gmt`: the latter tracks destination editorial activity
 * and is the MySQL zero-date for fresh drafts, which `strtotime` reads
 * as year 0000 instead of failing — silently flagging fresh imports as
 * outdated.
 */
class Sync_State_Comparator {

	/**
	 * Parses both timestamps in explicit UTC and reports whether the source
	 * is newer. Equal timestamps resolve to "not newer": `import_date_gmt`
	 * is stamped after the source fetch, so any later edit compares
	 * strictly greater.
	 *
	 * @param string $source_modified_gmt ISO 8601 modified_gmt from source
	 *                                    (`Y-m-d\TH:i:s\Z`).
	 * @param string $import_date_gmt     MySQL datetime from items table
	 *                                    (`Y-m-d H:i:s`).
	 * @return bool|null True when source is newer, false when not, null on
	 *                   parse failure.
	 */
	public static function source_is_newer(
		string $source_modified_gmt,
		string $import_date_gmt
	): ?bool {
		$utc       = new DateTimeZone( 'UTC' );
		$source_dt = DateTimeImmutable::createFromFormat(
			'Y-m-d\TH:i:s\Z',
			$source_modified_gmt,
			$utc
		);
		$import_dt = DateTimeImmutable::createFromFormat(
			'Y-m-d H:i:s',
			$import_date_gmt,
			$utc
		);

		if ( false === $source_dt || false === $import_dt ) {
			return null;
		}

		return $source_dt > $import_dt;
	}
}
