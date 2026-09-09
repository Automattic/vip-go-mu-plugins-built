<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Store\DataSource;

use RemoteDataBlocks\Config\DataSource\DataSourceInterface;
use WP_Error;

use const RemoteDataBlocks\REMOTE_DATA_BLOCKS__DATA_SOURCE_CLASSMAP;

class ConstantConfigStore {
	private const CONFIG_CONSTANT_NAME = 'REMOTE_DATA_BLOCKS_CONFIGS';

	/**
	 * Get all configurations from the constant.
	 *
	 * @return array<array{
	 *   service: string,
	 *   service_config: array<string, mixed>
	 * }>
	 */
	public static function get_configs(): array {
		if ( ! self::is_available() ) {
			return [];
		}

		$configs = constant( self::CONFIG_CONSTANT_NAME );
		$valid_configs = [];

		foreach ( $configs as $config ) {
			$validation_result = self::validate_config( $config );
			if ( ! is_wp_error( $validation_result ) ) {
				$valid_configs[] = $config;
			}
		}

		return $valid_configs;
	}

	public static function get_config_by_uuid( string $uuid ): array|WP_Error {
		$configs = constant( self::CONFIG_CONSTANT_NAME );
		$found = array_filter( $configs, function ( $config ) use ( $uuid ) {
			return $config['uuid'] === $uuid;
		} );

		if ( empty( $found ) ) {
			return new WP_Error(
				'data_source_not_found',
				__( 'Data source not found', 'remote-data-blocks' ),
				[ 'status' => 404 ]
			);
		}

		$config = reset( $found );
		$validation_result = self::validate_config( $config );

		if ( is_wp_error( $validation_result ) ) {
			return $validation_result;
		}

		return $config;
	}

	private static function validate_config( array $config ): DataSourceInterface|WP_Error {
		$data_source_class = REMOTE_DATA_BLOCKS__DATA_SOURCE_CLASSMAP[ $config['service'] ] ?? null;
		if ( null === $data_source_class ) {
			return new WP_Error(
				'unsupported_data_source',
				__( 'Unsupported data source service', 'remote-data-blocks' )
			);
		}

		return $data_source_class::from_array( $config );
	}

	/**
	 * Check if constant configuration is available and valid.
	 *
	 * @return bool Whether the constant configuration is available and valid.
	 */
	private static function is_available(): bool {
		if ( ! defined( self::CONFIG_CONSTANT_NAME ) ) {
			return false;
		}

		$value = constant( self::CONFIG_CONSTANT_NAME );
		return is_array( $value );
	}
}
