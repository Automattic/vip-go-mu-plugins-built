<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Telemetry;

use RemoteDataBlocks\Editor\BlockManagement\ConfigStore;
use WP_Post;

use function parse_blocks;

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

	/**
	 * Set up tracking via WordPress hooks.
	 *
	 * @psalm-suppress UndefinedClass
	 */
	private function setup_tracking_via_hooks(): void {
		// WordPress hooks.
		add_action( 'activated_plugin', [ $this, 'track_plugin_activation' ], 10, 1 );
		add_action( 'deactivated_plugin', [ $this, 'track_plugin_deactivation' ], 10, 1 );
		add_action( 'save_post', [ $this, 'track_remote_data_blocks_usage' ], 10, 2 );

		// Custom hook to allow other plugin code to track events
		add_action( 'remote_data_blocks_track_event', [ $this, 'record_event' ], 10, 2 );

		// Enable the Pendo JavaScript library for tracking.
		if ( class_exists( '\Automattic\VIP\Telemetry\Pendo' ) ) {
			add_action( 'admin_init', [ \Automattic\VIP\Telemetry\Pendo::class, 'enable_javascript_library' ] );
		}
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
		// Skip if the post is a revision or autosave.
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return;
		}

		// Skip if the post is not being published.
		$post_status = $post->post_status;
		if ( 'publish' !== $post_status ) {
			return;
		}

		// Parse the post content into blocks, and skip if there are no blocks.
		$blocks = parse_blocks( $post->post_content );
		if ( empty( $blocks ) ) {
			return;
		}

		// Get data source and track usage.
		$track_props = [
			'post_status' => $post_status,
			'post_type' => $post->post_type,
		];

		// Process blocks recursively
		$this->process_blocks_recursively( $blocks, $track_props );

		// Only send event if we found remote data blocks
		if ( ( $track_props['remote_data_blocks_total_count'] ?? 0 ) > 0 ) {
			$this->record_event( 'blocks_usage_stats', $track_props );
		}
	}

	/**
	 * Recursively process blocks to find and track Remote Data Blocks usage.
	 *
	 * @param array $blocks Array of blocks to process.
	 * @param array $track_props Reference to tracking properties array to update.
	 */
	private function process_blocks_recursively( array $blocks, array &$track_props ): void {
		foreach ( $blocks as $block ) {
			// Process inner blocks first if they exist
			if ( ! empty( $block['innerBlocks'] ) ) {
				$this->process_blocks_recursively( $block['innerBlocks'], $track_props );
			}

			// Skip blocks that are not remote data blocks, or don't have the blockName set.
			if ( ! isset( $block['blockName'] ) || ! str_starts_with( $block['blockName'], 'remote-data-blocks/' ) ) {
				continue;
			}

			// Skip blocks that don't have a data source type set like code-configured, etc.
			$data_source_type = ConfigStore::get_data_source_type( $block['blockName'] );
			if ( ! $data_source_type ) {
				continue;
			}

			// Calculate stats of each remote data source.
			$key = $data_source_type . '_data_source_count';
			$track_props[ $key ] = ( $track_props[ $key ] ?? 0 ) + 1;
			$track_props['remote_data_blocks_total_count'] = ( $track_props['remote_data_blocks_total_count'] ?? 0 ) + 1;

			// Calculate the stats of the fallback blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				foreach ( $block['innerBlocks'] as $inner_block ) {
					// The only fallback block is the no-results block, as the error block is a variation.
					if ( 'remote-data-blocks/no-results' !== $inner_block['blockName'] ) {
						continue;
					}

					// check if the mode attribute is set to "error" as that means it's the error block.
					if ( 'error' === ( $inner_block['attrs']['mode'] ?? '' ) ) {
						$track_props['error_fallback_block_count'] = ( $track_props['error_fallback_block_count'] ?? 0 ) + 1;
					} else {
						$track_props['no_results_fallback_block_count'] = ( $track_props['no_results_fallback_block_count'] ?? 0 ) + 1;
					}
				}
			}
		}
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
