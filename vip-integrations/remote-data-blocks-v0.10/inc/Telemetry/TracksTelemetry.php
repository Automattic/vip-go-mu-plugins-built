<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Telemetry;

defined( 'ABSPATH' ) || exit();

use RemoteDataBlocks\Editor\BlockManagement\ConfigStore;

/**
 * Class to implement Tracks Telemetry.
 */
class TracksTelemetry {
	private const TRACKS_EVENT_PREFIX = 'remotedatablocks_';

	/**
	 * The tracks instance (not using Tracks as type because it is present in MU Plugins codebase).
	 */
	private static object|null $instance = null;

	/**
	 * Environment configuration.
	 */
	private static ?EnvironmentConfig $env_config = null;

	/**
	 * Initialize Tracks Telemetry based on the environment configuration.
	 *
	 * @param EnvironmentConfig $env_config Environment configuration.
	 */
	public static function init( EnvironmentConfig $env_config ): void {
		self::$env_config = $env_config;

		// Do not track on local environment.
		if ( self::$env_config->is_local_env() ) {
			return;
		}

		$tracks_class = self::$env_config->get_tracks_lib_class();
		if ( ! $tracks_class ) {
			return;
		}

		if ( self::$env_config->is_wpvip_site() || self::$env_config->is_enabled_via_filter() ) {
			// We don't need to pass core properties here as they are already set by Tracks library.
			self::$instance = new $tracks_class( '', self::$env_config->get_remote_data_blocks_properties() );
			self::setup_tracking_via_hooks();
		}
	}

	/**
	 * Get `Tracks` global properties to be sent with each event.
	 */
	public static function get_global_properties(): array {
		return array_merge( self::$env_config->get_remote_data_blocks_properties(), self::$env_config->get_tracks_core_properties() );
	}

	private static function setup_tracking_via_hooks(): void {
		// WordPress Dashboard Hooks.
		add_action( 'activated_plugin', [ __CLASS__, 'track_plugin_activation' ] );
		add_action( 'deactivated_plugin', [ __CLASS__, 'track_plugin_deactivation' ] );
		add_action( 'save_post', [ __CLASS__, 'track_remote_data_blocks_usage' ], 10, 2 );
	}

	/**
	 * Activation hook.
	 *
	 * @param string $plugin_path Path of the plugin that was activated.
	 */
	public static function track_plugin_activation( string $plugin_path ): void {
		if ( ! self::$env_config->is_remote_data_blocks_plugin( $plugin_path ) ) {
			return;
		}

		self::record_event( 'plugin_toggle', [ 'action' => 'activate' ] );
	}

	/**
	 * Deactivation hook.
	 *
	 * @param string $plugin_path Path of the plugin that was deactivated.
	 */
	public static function track_plugin_deactivation( string $plugin_path ): void {
		if ( ! self::$env_config->is_remote_data_blocks_plugin( $plugin_path ) ) {
			return;
		}

		self::record_event( 'plugin_toggle', [ 'action' => 'deactivate' ] );
	}

	/**
	 * Track usage of Remote Data Blocks.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $post Post object.
	 */
	public static function track_remote_data_blocks_usage( int $post_id, object $post ): void {
		if ( ! self::$env_config->should_track_post_having_remote_data_blocks( $post_id ) ) {
			return;
		}

		$post_status = $post->post_status;
		if ( 'publish' !== $post_status ) {
			return;
		}

		// Regular expression to match all remote data blocks present in the post content.
		$reg_exp = '/<!--\s{1}wp:remote-data-blocks\/([^\s]+)\s/';
		preg_match_all( $reg_exp, $post->post_content, $matches );
		if ( count( $matches[1] ) === 0 ) {
			return;
		}

		// Get data source and track usage.
		$track_props = [
			'post_status' => $post_status,
			'post_type' => $post->post_type,
		];
		foreach ( $matches[1] as $match ) {
			$data_source_type = ConfigStore::get_data_source_type( 'remote-data-blocks/' . $match );
			if ( ! $data_source_type ) {
				continue;
			}

			// Calculate stats of each remote data source.
			$key = $data_source_type . '_data_source_count';
			$track_props[ $key ] = ( $track_props[ $key ] ?? 0 ) + 1;
			$track_props['remote_data_blocks_total_count'] = ( $track_props['remote_data_blocks_total_count'] ?? 0 ) + 1;
		}

		self::record_event( 'blocks_usage_stats', $track_props );
	}

	/**
	 * Record an event with Tracks.
	 *
	 * @param string $event_name The name of the event.
	 * @param array  $props      The properties to send with the event.
	 *
	 * @return bool True if the event was recorded, false otherwise.
	 */
	public static function record_event( string $event_name, array $props ): bool {
		if ( ! isset( self::$instance ) ) {
			return false;
		}

		$event_name = self::TRACKS_EVENT_PREFIX . $event_name;

		self::$instance->record_event( $event_name, $props );

		return true;
	}

	/**
	 * Get the instance of Tracks.
	 */
	public static function get_instance(): ?object {
		return self::$instance;
	}

	public static function get_env_config(): ?EnvironmentConfig {
		return self::$env_config;
	}

	/**
	 * Reset class properties.
	 */
	public static function reset(): void {
		self::$instance = null;
		self::$env_config = null;
	}
}
