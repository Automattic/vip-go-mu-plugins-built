<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Store\DataSource;

use RemoteDataBlocks\Editor\BlockManagement\ConfigStore;
use RemoteDataBlocks\WpdbStorage\DataSourceCrud;
use WP_Error;

class DataSourceConfigManager {
	public const CONFIG_SOURCE_CODE = 'code';
	public const CONFIG_SOURCE_STORAGE = 'storage';
	public const CONFIG_SOURCE_CONSTANT = 'constant';
	public const MUTABLE_CONFIG_SOURCES = [ self::CONFIG_SOURCE_STORAGE ];

	private static function get_all_from_storage(): array {
		return array_map(
			function ( array $config ) {
				return array_merge( $config, [ 'config_source' => self::CONFIG_SOURCE_STORAGE ] );
			},
			DataSourceCrud::get_configs()
		);
	}

	private static function get_all_from_constant(): array {
		return array_map(
			function ( array $config ) {
				return array_merge( $config, [ 'config_source' => self::CONFIG_SOURCE_CONSTANT ] );
			},
			ConstantConfigStore::get_configs()
		);
	}

	private static function get_all_from_code(): array {
		return array_map(
			function ( array $config ) {
				return array_merge( $config, [ 'config_source' => self::CONFIG_SOURCE_CODE ] );
			},
			ConfigStore::get_data_sources_as_array()
		);
	}

	/**
	 * Quick and dirty de-duplication of data sources. If the data source does
	 * not have a UUID (because it is registered in code), we generate an
	 * identifier based on the display name and service name.
	 */
	private static function de_duplicate_configs( array $configs ): array {
		return array_values( array_reduce(
			$configs,
			function ( array $acc, array $item ) {
				// Some sources run within a service_config array i.e. airtables, so check and assign.
				$display_name = $item['service_config']['display_name'] ?? $item['display_name'];
				$identifier = $item['uuid'] ?? md5(
					sprintf( '%s_%s', $display_name, $item['service'] ?? 'code-configured' )
				);
				$acc[ $identifier ] = $item;
				return $acc;
			},
			[]
		) );
	}

	/**
	 * Get all data sources from all origins with optional filters.
	 *
	 * Supported filters:
	 * - service: Filter by service name (e.g. 'airtable', 'google-sheets', 'shopify')
	 * - enable_blocks: Filter by blocks enabled status (false matches with null/false and true matches with true)
	 *
	 * Passing an unsupported filter key will return an error.
	 *
	 * @param array{
	 *   service?: string,
	 *   enable_blocks?: bool
	 * } $filters Optional filters to apply to the results.
	 * @return array<array{
	 *   uuid?: string,
	 *   service: string,
	 *   service_config: array<string, mixed>,
	 *   config_source: string,
	 *   __metadata?: array{
	 *     created_at: string,
	 *     updated_at: string
	 *   }
	 * }>
	 */
	public static function get_all( array $filters = [] ): array|WP_Error {
		$code_configured = self::get_all_from_code();
		$constant_configured = self::get_all_from_constant();
		$storage_configured = self::get_all_from_storage();

		/**
		 * De-duplicate configs.
		 *
		 * Precedence (lowest to highest):
		 * - Code-configured data sources
		 * - Constant-configured data sources
		 * - Storage-configured data sources
		 */
		$configs = self::de_duplicate_configs(
			array_merge( $code_configured, $constant_configured, $storage_configured )
		);

		return self::apply_config_array_filters( $configs, $filters );
	}

	/**
	 * Apply filters to an array of configs.
	 *
	 * @param array $configs The configs to filter.
	 * @param array{
	 *   service?: string,
	 *   enable_blocks?: bool
	 * } $filters The filters to apply.
	 * @return array|WP_Error The filtered configs or WP_Error if invalid filter.
	 */
	private static function apply_config_array_filters( array $configs, array $filters ): array|WP_Error {
		if ( empty( $filters ) ) {
			return $configs;
		}

		/**
		 * Validate all filter keys.
		 */
		foreach ( array_keys( $filters ) as $key ) {
			/** @var non-empty-string $key */
			if ( ! in_array( $key, [ 'service', 'enable_blocks' ], true ) ) {
				return new WP_Error(
					'invalid_filter',
					sprintf( 'Invalid filter key: %s', (string) $key ),
					[ 'status' => 400 ]
				);
			}
		}

		return array_filter(
			$configs,
			function ( array $config ) use ( $filters ): bool {
				foreach ( $filters as $key => $value ) {
					$service = $config['service'] ?? '';
					$service_config = $config['service_config'] ?? [];
					/** @var string $key Either 'service' or 'enable_blocks' */
					$passes_filter = match ( $key ) {
						'service' => $service === $value,
						'enable_blocks' => ( $service_config['enable_blocks'] ?? false ) === $value,
					};

					if ( ! $passes_filter ) {
						return false;
					}
				}
				return true;
			}
		);
	}

	/**
	 * Get a data source by its UUID.
	 *
	 * @param string $uuid The UUID of the data source to get.
	 * @return array{
	 *   uuid: string,
	 *   service: string,
	 *   service_config: array<string, mixed>,
	 *   config_source: string,
	 *   __metadata?: array{
	 *     created_at: string,
	 *     updated_at: string
	 *   }
	 * }|WP_Error
	 */
	public static function get( string $uuid ): array|WP_Error {
		$from_constant = ConstantConfigStore::get_config_by_uuid( $uuid );
		if ( ! is_wp_error( $from_constant ) ) {
			return array_merge(
				$from_constant,
				[ 'config_source' => self::CONFIG_SOURCE_CONSTANT ]
			);
		}

		$from_storage = DataSourceCrud::get_config_by_uuid( $uuid );
		if ( ! is_wp_error( $from_storage ) ) {
			return array_merge(
				$from_storage,
				[ 'config_source' => self::CONFIG_SOURCE_STORAGE ]
			);
		}

		return new WP_Error(
			'data_source_not_found',
			__( 'Data source not found', 'remote-data-blocks' ),
			[ 'status' => 404 ]
		);
	}

	/**
	 * Create a new data source.
	 *
	 * @param array $config The configuration for the new data source.
	 * @return array{
	 *   uuid: string,
	 *   service: string,
	 *   service_config: array<string, mixed>,
	 *   config_source: string,
	 *   __metadata: array{
	 *     created_at: string,
	 *     updated_at: string
	 *   }
	 * }|WP_Error
	 */
	public static function create( array $config ): array|WP_Error {
		$result = DataSourceCrud::create_config( $config );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return array_merge( $result, [ 'config_source' => self::CONFIG_SOURCE_STORAGE ] );
	}

	/**
	 * Update a data source.
	 *
	 * @param string $uuid The UUID of the data source to update.
	 * @param array $config The new configuration for the data source.
	 * @return array{
	 *   uuid: string,
	 *   service: string,
	 *   service_config: array<string, mixed>,
	 *   config_source: string,
	 *   __metadata: array{
	 *     created_at: string,
	 *     updated_at: string
	 *   }
	 * }|WP_Error
	 */
	public static function update( string $uuid, array $config ): array|WP_Error {
		if (
			isset( $config['config_source'] ) &&
			! in_array( $config['config_source'], self::MUTABLE_CONFIG_SOURCES, true )
		) {
			/**
			 * Only storage-configured data sources are mutable.
			 */
			return new WP_Error(
				'cannot_update_config',
				__( 'Cannot update a data source with this config_source', 'remote-data-blocks' ),
				[ 'status' => 400 ]
			);
		}

		$result = DataSourceCrud::update_config_by_uuid( $uuid, $config );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return array_merge( $result, [ 'config_source' => self::CONFIG_SOURCE_STORAGE ] );
	}

	/**
	 * Delete a data source.
	 *
	 * @param string $uuid The UUID of the data source to delete.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	public static function delete( string $uuid ): bool|WP_Error {
		return DataSourceCrud::delete_config_by_uuid( $uuid );
	}
}
