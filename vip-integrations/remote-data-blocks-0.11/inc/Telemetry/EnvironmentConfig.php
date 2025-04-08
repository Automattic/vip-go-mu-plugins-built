<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Telemetry;

defined( 'ABSPATH' ) || exit();

use Automattic\VIP\Telemetry\Tracks;
use function Automattic\VIP\Telemetry\Tracks\get_tracks_core_properties;

/**
 * Class to handle environment configuration for telemetry.
 *
 * This class abstracts WordPress-specific functions for easy mocking.
 */
class EnvironmentConfig {

	public function is_enabled_via_filter(): bool {
		return apply_filters( 'remote_data_blocks_enable_tracks_telemetry', false ) ?? false;
	}

	public function get_tracks_lib_class(): ?string {
		if ( ! class_exists( 'Automattic\VIP\Telemetry\Tracks' ) ) {
			return null;
		}

		return Tracks::class;
	}

	public function is_wpvip_site(): bool {
		$core_props = $this->get_tracks_core_properties();
		if ( ! isset( $core_props['hosting_provider'] ) ) {
			return false;
		}

		return 'wpvip' === $core_props['hosting_provider'];
	}

	public function is_local_env(): bool {
		$core_props = $this->get_tracks_core_properties();
		if ( ! isset( $core_props['vip_env'] ) ) {
			return false;
		}

		return 'local' === $core_props['vip_env'];
	}

	public function is_remote_data_blocks_plugin( string|null $plugin_path ): bool {
		return 'remote-data-blocks/remote-data-blocks.php' === $plugin_path;
	}

	public function should_track_post_having_remote_data_blocks( int $post_id ): bool {
		// Ensure this is not an auto-save or revision.
		if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Get the core properties to be sent with each event.
	 */
	public function get_tracks_core_properties(): array {
		if ( function_exists( 'Automattic\VIP\Telemetry\Tracks\get_tracks_core_properties' ) ) {
			return get_tracks_core_properties();
		}

		return [];
	}

	/**
	 * Get `Tracks` properties which are specific to "Remote Data Blocks". These properties are sent with each event.
	 */
	public function get_remote_data_blocks_properties(): array {
		return [
			'plugin_version' => defined( 'REMOTE_DATA_BLOCKS__PLUGIN_VERSION' ) ? constant( 'REMOTE_DATA_BLOCKS__PLUGIN_VERSION' ) : '',
		];
	}
}
