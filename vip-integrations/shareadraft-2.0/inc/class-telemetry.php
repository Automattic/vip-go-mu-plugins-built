<?php

namespace Automattic\ShareADraft;

/**
 * Tracks-only telemetry helper — the pattern VIP integrations should reuse.
 *
 * Wraps the VIP Telemetry API shipped by the platform's MU plugins. That API
 * is present under `vip dev-env` and in production but absent in bare PHPUnit
 * runs, hence the class_exists guard: without it, recording events is a no-op.
 *
 * Never put secrets, raw content, email addresses, or other customer data in
 * event properties.
 */
final class Telemetry {
	/**
	 * Tracks source prefix for every event this plugin records.
	 *
	 * The leading token (`shareadraft`) is the Tracks "source" and MUST be a
	 * single lowercase word with no underscores, and MUST be a source Tracks is
	 * registered to accept. Events from any other source are silently
	 * discarded and never appear in the Tracks tools, so do not change this
	 * without registering the new source first.
	 */
	public const EVENT_PREFIX = 'shareadraft_';

	/** @var self|null */
	private static $instance;

	/** @var \Automattic\VIP\Telemetry\Telemetry|null */
	private $client;

	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct() {
		if ( class_exists( \Automattic\VIP\Telemetry\Telemetry::class ) ) {
			$this->client = new \Automattic\VIP\Telemetry\Telemetry(
				self::EVENT_PREFIX,
				self::global_properties()
			);
		}
	}

	/**
	 * Environment-level properties attached to every event this plugin records.
	 *
	 * @return array<string, mixed>
	 */
	private static function global_properties(): array {
		$properties = [
			'plugin_version' => VIP_SHAREADRAFT_VERSION,
		];

		// The environment's unique numeric ID on VIP. A production (parent) and
		// its non-production (child) environments have different IDs, so this
		// pins each event to a specific environment. Absent off-platform (local,
		// non-VIP), so only included when the constant is a positive integer.
		if ( defined( 'VIP_GO_APP_ID' ) ) {
			/** @var mixed $app_id */
			$app_id = constant( 'VIP_GO_APP_ID' );
			if ( is_int( $app_id ) && $app_id > 0 ) {
				$properties['vip_app_id'] = $app_id;
			}
		}

		return $properties;
	}

	/**
	 * Record a Tracks event. The event name is automatically prefixed with
	 * EVENT_PREFIX by the VIP Telemetry client.
	 *
	 * @param array<string, mixed> $properties
	 */
	public function record_event( string $event_name, array $properties = [] ): void {
		if ( null !== $this->client && self::should_record() ) {
			$this->client->record_event( $event_name, $properties );
		}
	}

	/**
	 * Whether events should be recorded in the current environment.
	 *
	 * The local dev-env (VIP_GO_APP_ENVIRONMENT === 'local') is where the E2E
	 * suite runs, including in GitHub CI, so recording there would pump
	 * synthetic events into production Tracks. Every real VIP environment
	 * (production, develop, staging, …) still records, and its type travels on
	 * each event as the platform's `vip_env` property for downstream filtering.
	 */
	private static function should_record(): bool {
		$is_local = defined( 'VIP_GO_APP_ENVIRONMENT' ) && 'local' === constant( 'VIP_GO_APP_ENVIRONMENT' );

		/**
		 * Filters whether Share a Draft telemetry is recorded in this environment.
		 *
		 * Defaults to false on the local dev-env and true everywhere else. Return
		 * true to record from a dev-env (e.g. a deliberate smoke test), or false
		 * to suppress recording elsewhere.
		 *
		 * @param bool $should_record Whether to record events.
		 */
		return (bool) apply_filters( 'shareadraft_record_telemetry', ! $is_local );
	}
}
