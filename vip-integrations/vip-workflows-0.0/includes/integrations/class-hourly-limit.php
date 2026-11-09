<?php
/**
 * A ceiling on how often one subject may do one action in an hour.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use VIPWorkflows\Telemetry\Tracker;

/**
 * Counts the uses of an action that spends an external service, per subject
 * and per hour, and refuses the use that would go over the ceiling.
 *
 * Each action names its default ceiling where it calls `spend()`. A site
 * changes it with the filter `vip_workflows_{action}_hourly_limit`, and
 * switches it off with 0. Counts are kept per clock hour (UTC): the hour is
 * part of the counter's key, so a count never carries over into the next hour,
 * and a subject that is refused is told how long is left of the current one.
 *
 * The subject is the current user unless the caller names one, such as the
 * project a request is for. A subject of 0 is nobody, and is never counted.
 *
 * Counting is atomic, so concurrent requests cannot both take the last use:
 *
 * - With a persistent object cache, the counter is a cache key that
 *   `wp_cache_incr()` raises in one step. A use that takes the count over the
 *   ceiling is given back with `wp_cache_decr()` and refused.
 * - Without one, the counter is a row in the options table, raised by a single
 *   `INSERT ... ON DUPLICATE KEY UPDATE` that only adds one while the count is
 *   under the ceiling. The row for a new hour removes the rows of earlier hours.
 *
 * A use is reserved before the service is called. `spend_all()` reserves
 * several limits for one request, and gives back those already reserved when
 * a later one refuses, so a refused request leaves every count as it was.
 */
final class HourlyLimit {

	/**
	 * Object cache group of the counters.
	 *
	 * @var string
	 */
	private const CACHE_GROUP = 'vip_workflows_hourly_limit';

	/**
	 * Prefix of the counters' option names, followed by `{hour}_{action}_{subject}`.
	 *
	 * @var string
	 */
	public const OPTION_PREFIX = 'vip_workflows_hourly_';

	/**
	 * Count one use of an action for a subject, or refuse it at the ceiling.
	 *
	 * @param string   $action  Action key, such as `image_generation`.
	 * @param int      $default_limit Ceiling per subject and per hour. 0 or less is no ceiling.
	 * @param string   $reached Sentence for the error when the ceiling is reached.
	 * @param int|null $subject Subject to count against; null for the current user.
	 * @return true|\WP_Error True when the use is allowed, WP_Error with status 429 at the ceiling.
	 */
	public static function spend( string $action, int $default_limit, string $reached, ?int $subject = null ) {
		return self::spend_all( array( array( $action, $default_limit, $reached, $subject ) ) );
	}

	/**
	 * Count one use of each of several limits for one request, or none of them.
	 *
	 * The limits are reserved in the order given. When one refuses, the uses
	 * already reserved for the earlier ones are given back before the refusal
	 * is returned, so a request refused by any limit spends none of them.
	 *
	 * Each limit is [ action, default ceiling, refusal sentence, subject ],
	 * with the same meaning as the arguments of `spend()`; the subject may be
	 * left out for the current user.
	 *
	 * @param array<int, array{0: string, 1: int, 2: string, 3?: int|null}> $limits The limits, in the order they are reserved.
	 * @return true|\WP_Error True when every use is allowed, the first refusal otherwise.
	 */
	public static function spend_all( array $limits ) {
		$reserved = array();

		foreach ( $limits as $limit ) {
			$reservation = self::reserve( $limit[0], $limit[1], $limit[2], $limit[3] ?? null );

			if ( is_wp_error( $reservation ) ) {
				foreach ( $reserved as $taken ) {
					self::release( $taken );
				}
				return $reservation;
			}

			if ( null !== $reservation ) {
				$reserved[] = $reservation;
			}
		}

		return true;
	}

	/**
	 * Reserve one use of an action for a subject.
	 *
	 * @param string   $action  Action key.
	 * @param int      $default_limit Default ceiling.
	 * @param string   $reached Sentence for the error when the ceiling is reached.
	 * @param int|null $subject Subject, or null for the current user.
	 * @return array{key: string, hour: int}|null|\WP_Error The reservation, null when
	 *         nothing is counted, or WP_Error when the use is refused.
	 */
	private static function reserve( string $action, int $default_limit, string $reached, ?int $subject ) {
		$subject = $subject ?? get_current_user_id();
		if ( $subject <= 0 ) {
			return null;
		}

		/**
		 * Filters the ceiling on an action per subject and per hour.
		 *
		 * The dynamic part of the hook name, `$action`, is the action key, such
		 * as `discovery_search`, `image_generation`, `project_image_generation`
		 * or `ai`.
		 *
		 * @param int $limit   Uses per hour. 0 or less switches the ceiling off.
		 * @param int $subject User ID, or the project ID for a per-project action.
		 */
		$limit = (int) apply_filters( "vip_workflows_{$action}_hourly_limit", $default_limit, $subject );
		if ( $limit <= 0 ) {
			return null;
		}

		$now         = time();
		$reservation = array(
			'key'  => "{$action}_{$subject}",
			'hour' => intdiv( $now, HOUR_IN_SECONDS ),
		);
		$remaining   = max( 1, ( $reservation['hour'] + 1 ) * HOUR_IN_SECONDS - $now );

		$taken = wp_using_ext_object_cache()
			? self::take_from_cache( $reservation, $limit, $remaining )
			: self::take_from_database( $reservation, $limit );

		if ( is_wp_error( $taken ) ) {
			return $taken;
		}

		if ( $taken ) {
			return $reservation;
		}

		/**
		 * Fires when a subject is refused because its hourly ceiling is reached.
		 *
		 * @param string $action  Action key.
		 * @param int    $subject User ID, or the project ID for a per-project action.
		 * @param int    $limit   The ceiling.
		 */
		do_action( 'vip_workflows_hourly_limit_reached', $action, $subject, $limit );

		Tracker::record(
			'hourly_limit_reached',
			array(
				'action'    => $action,
				'limit'     => $limit,
				'initiator' => 'user',
			)
		);

		$minutes = (int) ceil( $remaining / MINUTE_IN_SECONDS );

		return new \WP_Error(
			"vip_workflows_{$action}_rate_limited",
			$reached . ' ' . sprintf(
				/* translators: %d: number of minutes. */
				_n( 'Try again in %d minute.', 'Try again in %d minutes.', $minutes, 'vip-workflows' ),
				$minutes
			),
			array(
				'status'      => 429,
				'retry_after' => $remaining,
			)
		);
	}

	/**
	 * Give back a reserved use.
	 *
	 * @param array{key: string, hour: int} $reservation What `reserve()` returned.
	 */
	private static function release( array $reservation ): void {
		if ( wp_using_ext_object_cache() ) {
			wp_cache_decr( self::cache_key( $reservation ), 1, self::CACHE_GROUP );
			return;
		}

		global $wpdb;

		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"UPDATE {$wpdb->options} SET option_value = option_value - 1 WHERE option_name = %s AND option_value > 0",
				self::option_name( $reservation )
			)
		);
	}

	/**
	 * Raise the cache counter by one if that keeps it within the ceiling.
	 *
	 * @param array{key: string, hour: int} $reservation The counter.
	 * @param int                           $limit       The ceiling.
	 * @param int                           $remaining   Seconds left of the hour.
	 * @return bool|\WP_Error True when the use is taken, false at the ceiling,
	 *                        WP_Error when the cache cannot count.
	 */
	private static function take_from_cache( array $reservation, int $limit, int $remaining ) {
		$key = self::cache_key( $reservation );

		// Creates the counter for the hour unless another request already has.
		// It outlives the hour by a minute; the next hour has a key of its own.
		wp_cache_add( $key, 0, self::CACHE_GROUP, $remaining + MINUTE_IN_SECONDS ); // phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined -- the counter must expire just after its hour ends, so near the end of an hour the expiry is under 300 seconds by design; a longer expiry would only keep a dead key.

		$count = wp_cache_incr( $key, 1, self::CACHE_GROUP );
		if ( false === $count ) {
			return new \WP_Error(
				'vip_workflows_hourly_limit_unavailable',
				__( 'The usage limit could not be checked. Try again shortly.', 'vip-workflows' ),
				array( 'status' => 503 )
			);
		}

		if ( (int) $count > $limit ) {
			wp_cache_decr( $key, 1, self::CACHE_GROUP );
			return false;
		}

		return true;
	}

	/**
	 * Raise the database counter by one if that keeps it within the ceiling.
	 *
	 * One statement creates the row at 1, or adds one to it while it is under
	 * the ceiling. MySQL reports 1 affected row for a new row, 2 for a raised
	 * one and 0 for a row left as it was, which is the refusal.
	 *
	 * @param array{key: string, hour: int} $reservation The counter.
	 * @param int                           $limit       The ceiling, at least 1.
	 * @return bool|\WP_Error True when the use is taken, false at the ceiling,
	 *                        WP_Error when the database cannot count.
	 */
	private static function take_from_database( array $reservation, int $limit ) {
		global $wpdb;

		$affected = $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
			$wpdb->prepare(
				"INSERT INTO {$wpdb->options} ( option_name, option_value, autoload ) VALUES ( %s, '1', 'off' )
				ON DUPLICATE KEY UPDATE option_value = IF( option_value + 0 < %d, option_value + 1, option_value )",
				self::option_name( $reservation ),
				$limit
			)
		);

		if ( false === $affected ) {
			return new \WP_Error(
				'vip_workflows_hourly_limit_unavailable',
				__( 'The usage limit could not be checked. Try again shortly.', 'vip-workflows' ),
				array( 'status' => 503 )
			);
		}

		if ( 1 === (int) $affected ) {
			// The first use in a new hour: the counters of earlier hours are spent.
			$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
				$wpdb->prepare(
					"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s AND option_name < %s",
					$wpdb->esc_like( self::OPTION_PREFIX ) . '%',
					self::OPTION_PREFIX . $reservation['hour'] . '_'
				)
			);
		}

		return (int) $affected > 0;
	}

	/**
	 * Object cache key of a counter.
	 *
	 * @param array{key: string, hour: int} $reservation The counter.
	 */
	private static function cache_key( array $reservation ): string {
		return $reservation['hour'] . '_' . $reservation['key'];
	}

	/**
	 * Option name of a counter.
	 *
	 * @param array{key: string, hour: int} $reservation The counter.
	 */
	private static function option_name( array $reservation ): string {
		return self::OPTION_PREFIX . $reservation['hour'] . '_' . $reservation['key'];
	}
}
