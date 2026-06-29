<?php
/**
 * Telemetry Service class.
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
 * Thin wrapper around the VIP mu-plugins telemetry library
 * (Automattic\VIP\Telemetry\Telemetry). Guards class_exists so non-VIP /
 * local installs silently no-op when the class is missing.
 *
 * All Safe Publish telemetry call sites go through this service; the raw
 * VIP class is never referenced directly. Tests inject a
 * Telemetry_Event_Queue via the constructor to assert on recorded events
 * without needing a live send path.
 */
final class Telemetry_Service {

	/**
	 * Event-name prefix passed to the VIP client at construction time.
	 */
	public const EVENT_PREFIX = 'safe_publish_';

	/**
	 * Fully-qualified class name of the VIP mu-plugins telemetry client.
	 * Stored as a string so the wrapper can resolve it at runtime via
	 * class_exists without forcing the autoloader to fail on non-VIP
	 * installs.
	 */
	private const VIP_TELEMETRY_CLASS = '\\Automattic\\VIP\\Telemetry\\Telemetry';

	/**
	 * Test-only queue. When set, replaces the real send path and tests
	 * assert on its contents.
	 *
	 * @var Telemetry_Event_Queue|null
	 */
	private ?Telemetry_Event_Queue $queue;

	/**
	 * Resolved VIP client instance, or null when the class is absent on
	 * this install (non-VIP env, unit tests without a stub). Typed as
	 * object so the wrapper compiles without the VIP class being present.
	 *
	 * @var object|null
	 */
	private ?object $client = null;

	/**
	 * Constructs the service.
	 *
	 * @param array<string, mixed>       $global_properties Global properties.
	 * @param Telemetry_Event_Queue|null $queue             Optional test queue.
	 */
	public function __construct(
		array $global_properties = array(),
		?Telemetry_Event_Queue $queue = null
	) {
		$this->queue = $queue;

		if ( null === $queue && class_exists( self::VIP_TELEMETRY_CLASS ) ) {
			$class = self::VIP_TELEMETRY_CLASS;
			// Class only resolves on VIP-hosted installs.
			/** @psalm-suppress UndefinedClass */
			$this->client = new $class( self::EVENT_PREFIX, $global_properties );
		}
	}

	/**
	 * Records a telemetry event.
	 *
	 * Silently no-ops when the VIP telemetry class isn't available (local
	 * dev, unit tests without a stub). When a Telemetry_Event_Queue is
	 * injected, the queue receives the event instead of the live client.
	 *
	 * @param string               $event      Event name without prefix.
	 * @param array<string, mixed> $properties Event properties.
	 */
	public function record_event(
		string $event,
		array $properties = array()
	): void {
		if ( null !== $this->queue ) {
			$this->queue->record( $event, $properties );
			return;
		}

		if ( null === $this->client ) {
			return;
		}

		$this->client->record_event( $event, $properties );
	}
}
