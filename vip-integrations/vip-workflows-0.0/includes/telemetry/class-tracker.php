<?php
/**
 * Product telemetry.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Telemetry;

/**
 * Records product-usage events through the VIP Telemetry library.
 *
 * The library sends each event to Pendo and to Tracks. Pendo only accepts events
 * on production VIP environments; Tracks accepts them from every environment and
 * tags each with it, so filter Tracks by environment when reading it.
 */
class Tracker {

	/**
	 * Prefix the library adds to every event name.
	 */
	private const EVENT_PREFIX = 'vip_workflows_';

	/**
	 * The library's Telemetry instance.
	 *
	 * @var object|null
	 */
	private static ?object $telemetry = null;

	/**
	 * Record an event. Does nothing where the VIP Telemetry library isn't loaded.
	 *
	 * @param  string              $event      Event name, without the prefix.
	 * @param  array<string,mixed> $properties Event properties. Null values are omitted.
	 * @param  int|null            $as_user    User to record the event as, for work with no current user.
	 * @return bool Whether the event was accepted.
	 */
	public static function record( string $event, array $properties = array(), ?int $as_user = null ): bool {
		$telemetry = self::telemetry();
		if ( null === $telemetry ) {
			return false;
		}

		$previous_user = get_current_user_id();

		try {
			if ( null !== $as_user && $as_user !== $previous_user ) {
				wp_set_current_user( $as_user );
			}

			// Pendo discards an event with no user, and logs an error each time.
			if ( get_current_user_id() <= 0 ) {
				return false;
			}

			// Telemetry would send a null as the string "null".
			$properties = array_filter( $properties, static fn( $value ) => null !== $value );

			// The library works out is_vip_user once, for whoever was logged in
			// when it was built. Event properties are merged over it, so set it
			// for the user this event is recorded as.
			if ( class_exists( '\\Automattic\\VIP\\Support_User\\User' ) ) {
				$properties['is_vip_user'] = (bool) \Automattic\VIP\Support_User\User::user_has_vip_support_role( get_current_user_id() );
			}

			return true === $telemetry->record_event( $event, $properties );
		} catch ( \Throwable $e ) {
			return false;
		} finally {
			if ( get_current_user_id() !== $previous_user ) {
				wp_set_current_user( $previous_user );
			}
		}
	}

	/**
	 * Whether the VIP Telemetry library is loaded.
	 *
	 * @return bool
	 */
	public static function is_available(): bool {
		return null !== self::telemetry();
	}

	/**
	 * Replace the Telemetry instance, for tests. Pass null to use the library.
	 *
	 * @param object|null $telemetry Object with a record_event( string, array ) method.
	 */
	public static function set_telemetry( ?object $telemetry ): void {
		self::$telemetry = $telemetry;
	}

	/**
	 * The Telemetry instance, created on first use.
	 *
	 * @return object|null Null when the library isn't loaded.
	 */
	private static function telemetry(): ?object {
		if ( null === self::$telemetry && class_exists( '\\Automattic\\VIP\\Telemetry\\Telemetry' ) ) {
			self::$telemetry = new \Automattic\VIP\Telemetry\Telemetry(
				self::EVENT_PREFIX,
				array( 'plugin_version' => VIP_WORKFLOWS_VERSION )
			);
		}

		return self::$telemetry;
	}
}
