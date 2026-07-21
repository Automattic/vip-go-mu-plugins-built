<?php
/**
 * Telemetry Event Queue class.
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
 * In-memory event queue used by tests to assert on telemetry emissions.
 *
 * Telemetry is disabled outside VIP production, so production tests can't
 * observe what the wrapper would send. Injecting this queue into
 * Telemetry_Service replaces the real send path so tests can assert on
 * the recorded event name and properties directly.
 */
final class Telemetry_Event_Queue {

	/**
	 * Recorded events, in the order Telemetry_Service received them.
	 *
	 * @var list<array{event: string, properties: array<string, mixed>}>
	 */
	private array $events = array();

	/**
	 * Records a telemetry event.
	 *
	 * @param string               $event      Event name (without prefix).
	 * @param array<string, mixed> $properties Event properties.
	 */
	public function record( string $event, array $properties ): void {
		$this->events[] = array(
			'event'      => $event,
			'properties' => $properties,
		);
	}

	/**
	 * Returns every recorded event in insertion order.
	 *
	 * @return list<array{event: string, properties: array<string, mixed>}> Recorded events.
	 */
	public function events(): array {
		return $this->events;
	}

	/**
	 * Discards every recorded event.
	 */
	public function clear(): void {
		$this->events = array();
	}
}
