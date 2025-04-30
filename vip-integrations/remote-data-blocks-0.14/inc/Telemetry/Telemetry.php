<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Telemetry;

use RemoteDataBlocks\Editor\BlockManagement\ConfigStore;
use WP_Post;

defined( 'ABSPATH' ) || exit();

/**
 * Class to implement telemetry on WordPress VIP.
 */
class Telemetry {
	private const EVENT_PREFIX = 'remotedatablocks_';
	private static ?self $instance = null;

	final private function __construct( private string $plugin_path, private ?object $telemetry = null ) {}

	/**
	 * Initialize telemetry for the plugin. The Telemetry library is provided
	 * by VIP mu-plugins and only runs in approved environments.
	 *
	 * @psalm-suppress UndefinedClass
	 *
	 * @param string $plugin_path Plugin path.
	 * @param object|null $telemetry Telemetry instance. If null, we will attempt to create one.
	 */
	public static function init( string $plugin_path, ?object $telemetry = null ): void {
		if ( isset( self::$instance ) ) {
			return;
		}

		if ( null === $telemetry && class_exists( 'Automattic\VIP\Telemetry\Telemetry' ) ) {
			$telemetry = new \Automattic\VIP\Telemetry\Telemetry( self::EVENT_PREFIX, self::get_global_properties() );
		}

		self::$instance = new self( $plugin_path, $telemetry );
		self::$instance->setup_tracking_via_hooks();
	}

	/**
	 * Get global event properties. These properties are sent with each event.
	 */
	public static function get_global_properties(): array {
		$plugin_version = defined( 'REMOTE_DATA_BLOCKS__PLUGIN_VERSION' ) ? constant( 'REMOTE_DATA_BLOCKS__PLUGIN_VERSION' ) : 'unknown';

		return [
			'plugin_version' => $plugin_version,
		];
	}

	private function setup_tracking_via_hooks(): void {
		// WordPress hooks.
		add_action( 'activated_plugin', [ $this, 'track_plugin_activation' ], 10, 1 );
		add_action( 'deactivated_plugin', [ $this, 'track_plugin_deactivation' ], 10, 1 );
		add_action( 'save_post', [ $this, 'track_remote_data_blocks_usage' ], 10, 2 );

		// Custom hook to allow other plugin code to track events
		add_action( 'remote_data_blocks_track_event', [ $this, 'record_event' ], 10, 2 );
	}

	/**
	 * Activation hook.
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
	 * Deactivation hook.
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
	 * Track usage of Remote Data Blocks.
	 *
	 * @param int     $post_id Post ID.
	 * @param WP_Post $post Post object.
	 */
	public function track_remote_data_blocks_usage( int $post_id, WP_Post $post ): void {
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
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

		$this->record_event( 'blocks_usage_stats', $track_props );
	}

	/**
	 * Record a telemetry event.
	 *
	 * @param string $event_name The name of the event.
	 * @param array  $props      The properties to send with the event.
	 */
	public function record_event( string $event_name, array $props ): void {
		if ( null === $this->telemetry ) {
			return;
		}

		$this->telemetry->record_event( $event_name, $props );
	}

	/**
	 * Reset class properties.
	 */
	public static function reset(): void {
		self::$instance = null;
	}
}
