<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Telemetry;

use RemoteDataBlocks\Store\DataSource\DataSourceConfigManager;
use function do_action;

defined( 'ABSPATH' ) || exit();

class DataSourceTelemetry {
	const DATA_SOURCE_INTERACTION_EVENT_NAME = 'data_source_interaction';
	const DATA_SOURCE_VIEW_EVENT_NAME = 'view_data_sources';

	private static function get_interaction_track_props( array $config ): array {
		$props = [];

		if ( REMOTE_DATA_BLOCKS_GENERIC_HTTP_SERVICE === $config['service'] ) {
			$auth = $config['service_config']['auth'] ?? [];
			$props['authentication_type'] = $auth['type'] ?? '';
			$props['api_key_location'] = $auth['addTo'] ?? '';
		}

		return $props;
	}

	private static function track_interaction( array $config, string $action ): void {
		do_action( 'remote_data_blocks_track_event', self::DATA_SOURCE_INTERACTION_EVENT_NAME, array_merge( [
			'data_source_type' => $config['service'],
			'action' => $action,
		], self::get_interaction_track_props( $config ) ) );
	}

	public static function track_add( array $config ): void {
		self::track_interaction( $config, 'add' );
	}

	public static function track_update( array $config ): void {
		self::track_interaction( $config, 'update' );
	}

	public static function track_delete( array $config ): void {
		self::track_interaction( $config, 'delete' );
	}

	public static function track_view( array $configs ): void {
		$code_configured_count = count( array_filter(
			$configs,
			function ( $config ) {
				return DataSourceConfigManager::CONFIG_SOURCE_CODE === $config['config_source'];
			}
		) );
		$storage_configured_count = count( array_filter(
			$configs,
			function ( $config ) {
				return DataSourceConfigManager::CONFIG_SOURCE_STORAGE === $config['config_source'];
			}
		) );
		$constant_configured_count = count( array_filter(
			$configs,
			function ( $config ) {
				return DataSourceConfigManager::CONFIG_SOURCE_CONSTANT === $config['config_source'];
			}
		) );

		do_action( 'remote_data_blocks_track_event', self::DATA_SOURCE_VIEW_EVENT_NAME, [
			'total_data_sources_count' => count( $configs ),
			'code_configured_data_sources_count' => $code_configured_count,
			'ui_configured_data_sources_count' => $storage_configured_count,
			'constant_configured_data_sources_count' => $constant_configured_count,
		] );
	}
}
