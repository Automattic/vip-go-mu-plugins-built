<?php
/**
 * Post Lock class
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
 * Serializes the imports and rollbacks of one source post across requests.
 *
 * Each held lock is an option row, so it works without a persistent object
 * cache. Only direct queries touch the row, keeping the options cache out of
 * the race: Just one request can insert it or take over an expired one.
 */
final class Post_Lock {

	/**
	 * Option name prefix, completed by the source post ID.
	 */
	public const OPTION_PREFIX = 'safe_publish_post_lock_';

	/**
	 * Seconds after which another request may take over a held lock. This
	 * bounds how long an interrupted request blocks the post.
	 */
	public const TTL = 300;

	/**
	 * Constructor.
	 *
	 * @param string $name  Option name of the lock row.
	 * @param int    $stamp Unix time this request wrote to the row.
	 */
	private function __construct(
		private readonly string $name,
		private readonly int $stamp
	) {}

	/**
	 * Acquires the lock for a source post.
	 *
	 * @param int $source_post_id Source post ID.
	 * @return self|null The held lock, or null when it could not be taken.
	 */
	public static function acquire( int $source_post_id ): ?self {
		global $wpdb;

		$name = self::OPTION_PREFIX . $source_post_id;
		$now  = time();

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$inserted = $wpdb->query(
			$wpdb->prepare(
				"INSERT IGNORE INTO {$wpdb->options}"
					. ' (option_name, option_value, autoload)'
					. " VALUES (%s, %d, 'off')",
				$name,
				$now
			)
		);

		if ( 1 === $inserted ) {
			return new self( $name, $now );
		}

		$taken_over = $wpdb->query(
			$wpdb->prepare(
				"UPDATE {$wpdb->options} SET option_value = %d"
					. ' WHERE option_name = %s AND option_value < %d',
				$now,
				$name,
				$now - self::TTL
			)
		);
		// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return 1 === $taken_over ? new self( $name, $now ) : null;
	}

	/**
	 * Releases the lock, unless another request took it over after it
	 * expired.
	 */
	public function release(): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->delete(
			$wpdb->options,
			array(
				'option_name'  => $this->name,
				'option_value' => (string) $this->stamp,
			)
		);
	}

	/**
	 * Returns the refusal given while another request holds the lock.
	 *
	 * @return string Translated message.
	 */
	public static function held_message(): string {
		return __(
			'Another import or rollback of this post is in progress. Try again in a moment.',
			'safe-publish'
		);
	}
}
