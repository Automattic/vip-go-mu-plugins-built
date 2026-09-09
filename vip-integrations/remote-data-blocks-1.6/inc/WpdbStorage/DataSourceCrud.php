<?php declare(strict_types = 1);

namespace RemoteDataBlocks\WpdbStorage;

use RemoteDataBlocks\Config\DataSource\DataSourceInterface;
use WP_Error;

use const RemoteDataBlocks\REMOTE_DATA_BLOCKS__DATA_SOURCE_CLASSMAP;

class DataSourceCrud {
	const CONFIG_OPTION_NAME = 'remote_data_blocks_configs';

	public static function create_config( array $config ): array|WP_Error {
		return self::save_config( $config );
	}

	public static function delete_config_by_uuid( string $uuid ): bool|WP_Error {
		$configs = array_values( array_filter( self::get_configs(), function ( $config ) use ( $uuid ) {
			return $config['uuid'] !== $uuid;
		} ) );

		if ( true !== self::save_configs( $configs ) ) {
			return new WP_Error( 'failed_to_delete_data_source', __( 'Failed to delete data source', 'remote-data-blocks' ) );
		}

		return true;
	}

	public static function get_config_by_uuid( string $uuid ): array|WP_Error {
		foreach ( self::get_configs() as $config ) {
			if ( $config['uuid'] === $uuid ) {
				return $config;
			}
		}

		return new WP_Error( 'data_source_not_found', __( 'Data source not found', 'remote-data-blocks' ), [ 'status' => 404 ] );
	}

	public static function get_configs(): array {
		return array_map(
			function ( array $config ) {
				// Inflate the config to check if it's valid.
				$instance = self::inflate_config( $config );

				// If the data source is valid, set a transient field with the errors encountered when inflating the config.
				// We get the errors from the instance, otherwise there'll be an errors field in the errors field in the config.
				$config['errors'] = is_wp_error( $instance ) ? [ $instance->errors ] : [];

				// Give back the same config with the errors field set, not the inflated instance.
				return $config;
			},
			self::get_all_configs()
		);
	}

	public static function get_configs_by_service( string $service_name ): array {
		return array_values( array_filter( self::get_configs(), function ( $config ) use ( $service_name ): bool {
			return $config['service'] === $service_name;
		} ) );
	}

	public static function update_config_by_uuid( string $uuid, array $service_config ): array|WP_Error {
		$config = self::get_config_by_uuid( $uuid );

		if ( is_wp_error( $config ) ) {
			return $config;
		}

		// Merge the new service config with the existing one.
		$config['service_config'] = array_merge( $config['service_config'] ?? [], $service_config );

		return self::save_config( $config );
	}

	private static function get_all_configs(): array {
		return get_option( self::CONFIG_OPTION_NAME, [] );
	}

	private static function inflate_config( array $config ): DataSourceInterface|WP_Error {
		$data_source_class = REMOTE_DATA_BLOCKS__DATA_SOURCE_CLASSMAP[ $config['service'] ] ?? null;
		if ( null === $data_source_class ) {
			return new WP_Error( 'unsupported_data_source', __( 'Unsupported data source service', 'remote-data-blocks' ) );
		}

		return $data_source_class::from_array( $config );
	}

	public static function get_inflated_config_by_uuid( string $uuid ): DataSourceInterface|WP_Error {
		$config = self::get_config_by_uuid( $uuid );
		if ( is_wp_error( $config ) ) {
			return $config;
		}

		return self::inflate_config( $config );
	}

	private static function save_config( array $config ): array|WP_Error {
		// Update metadata.
		$now = gmdate( 'Y-m-d H:i:s' );
		$new_config = [
			'__metadata' => [
				'created_at' => $config['__metadata']['created_at'] ?? $now,
				'updated_at' => $now,
			],
			'service' => $config['service'] ?? 'unknown',
			'service_config' => $config['service_config'] ?? [],
			'uuid' => $config['uuid'] ?? wp_generate_uuid4(),
		];

		// Validate the data source by attempting to instantiate it.
		$instance = self::inflate_config( $new_config );
		if ( is_wp_error( $instance ) ) {
			return $instance;
		}

		// Create or update the data source.
		$configs = array_values( array_filter( self::get_configs(), function ( $existing ) use ( $new_config ) {
			return $existing['uuid'] !== $new_config['uuid'];
		} ) );
		$configs[] = $new_config;

		if ( true !== self::save_configs( $configs ) ) {
			return new WP_Error( 'failed_to_save_data_source', __( 'Failed to save data source', 'remote-data-blocks' ) );
		}

		return $new_config;
	}

	private static function save_configs( array $configs ): bool|WP_Error {
		return update_option( self::CONFIG_OPTION_NAME, $configs );
	}
}
