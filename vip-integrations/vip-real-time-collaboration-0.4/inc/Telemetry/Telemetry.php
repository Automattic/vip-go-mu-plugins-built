<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Telemetry;

defined( 'ABSPATH' ) || exit();

/**
 * Class to implement telemetry on WordPress VIP.
 */
final class Telemetry {
	private const EVENT_PREFIX = 'viprealtimecollaboration_';
	private static ?self $instance = null;

	private function __construct( private string $plugin_path, private ?object $telemetry = null ) {}

	/**
	 * Initializes telemetry for the plugin. The Telemetry library is provided
	 * by VIP mu-plugins and only runs in approved environments.
	 *
	 * @param string $plugin_path Plugin path.
	 * @param object|null $telemetry Telemetry instance. If null, we will attempt to create one.
	 */
	public static function init( string $plugin_path, ?object $telemetry = null ): void {
		if ( isset( self::$instance ) ) {
			return;
		}

		if ( null === $telemetry && class_exists( '\Automattic\VIP\Telemetry\Telemetry' ) ) {
			$telemetry = new \Automattic\VIP\Telemetry\Telemetry( self::EVENT_PREFIX, self::get_global_properties() );
		}

		self::$instance = new self( $plugin_path, $telemetry );
		self::$instance->setup_tracking_via_hooks();
	}

	/**
	 * Gets global event properties. These properties are sent with each event.
	 */
	public static function get_global_properties(): array {
		$plugin_version = defined( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_VERSION' ) ? constant( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_VERSION' ) : 'unknown';

		return [
			'plugin_version' => $plugin_version,
		];
	}

	/**
	 * Sets up tracking via WordPress hooks.
	 */
	private function setup_tracking_via_hooks(): void {
		// WordPress hooks.
		add_action( 'activated_plugin', [ $this, 'track_plugin_activation' ], 10, 1 );
		add_action( 'deactivated_plugin', [ $this, 'track_plugin_deactivation' ], 10, 1 );

		// Custom hook to allow other plugin code to track events
		add_action( 'vip_real_time_collaboration_track_event', [ $this, 'record_event' ], 10, 2 );

		// Enable the Pendo JavaScript library for tracking.
		if ( class_exists( '\Automattic\VIP\Telemetry\Pendo' ) ) {
			/** @psalm-suppress InvalidArgument */
			add_action( 'admin_init', [ \Automattic\VIP\Telemetry\Pendo::class, 'enable_javascript_library' ] );
		}
	}

	/**
	 * Tracks plugin activation.
	 *
	 * @param string $plugin_path Path of the plugin that was activated.
	 */
	public function track_plugin_activation( string $plugin_path ): void {
		if ( ! str_ends_with( $this->plugin_path, $plugin_path ) ) {
			return;
		}

		$this->record_event( 'plugin_toggle', [ 'action' => 'activate' ] );
	}

	/**
	 * Tracks plugin deactivation.
	 *
	 * @param string $plugin_path Path of the plugin that was deactivated.
	 */
	public function track_plugin_deactivation( string $plugin_path ): void {
		if ( ! str_ends_with( $this->plugin_path, $plugin_path ) ) {
			return;
		}

		$this->record_event( 'plugin_toggle', [ 'action' => 'deactivate' ] );
	}

	/**
	 * Records a telemetry event.
	 *
	 * @param string $event_name The name of the event.
	 * @param array  $props      The properties to send with the event.
	 */
	public function record_event( string $event_name, array $props ): void {
		if ( null === $this->telemetry ) {
			return;
		}

		/** @psalm-suppress MixedMethodCall */
		$this->telemetry->record_event( $event_name, $props );
	}

	/**
	 * Resets class properties.
	 */
	public static function reset(): void {
		self::$instance = null;
	}
}
