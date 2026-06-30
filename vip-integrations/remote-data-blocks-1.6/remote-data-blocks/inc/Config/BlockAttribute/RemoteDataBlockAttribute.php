<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\BlockAttribute;

use RemoteDataBlocks\Config\ArraySerializable;
use RemoteDataBlocks\Validation\ConfigSchemas;
use WP_Error;
use function wp_generate_uuid4;

/**
 * RemoteDataBlockAttribute class
 *
 * Represents the "remoteData" block attribute for remote data blocks.
 */
class RemoteDataBlockAttribute extends ArraySerializable {
	/**
	 * @inheritDoc
	 */
	public static function get_config_schema(): array {
		return ConfigSchemas::get_remote_data_block_attribute_config_schema();
	}

	/**
	 * @inheritDoc
	 */
	public static function migrate_config( array $config, array $source_args = [] ): array|WP_Error {
		// Provide some defaults to prevent constant defensive checks.
		$defaults = [
			'enabledOverrides' => [],
			'metadata' => [],
			'pagination' => [],
			'results' => [],
		];

		$config = array_merge( $defaults, $config );

		// Migrate the singular "queryInput" to the plural "queryInputs".
		if ( ! isset( $config['queryInputs'] ) ) {
			$config['queryInputs'] = [ $config['queryInput'] ?? [] ];
			unset( $config['queryInput'] );
		}

		// Migrate "results" to the new format with UUID and nested result with type.
		$config['results'] = array_map( function ( array $result ): array {
			if ( isset( $result['result'] ) && is_array( $result['result'] ) ) {
				return $result;
			}

			return [
				'uuid' => wp_generate_uuid4(),
				'result' => array_reduce(
					array_keys( $result ),
					function ( array $carry, string $name ) use ( $result ): array {
						$carry[ $name ] = [
							'name' => $name, // We have lost the name, use the slug.
							'type' => 'unknown', // We have lost the type information.
							'value' => $result[ $name ],
						];

						return $carry;
					},
					[]
				),
			];
		}, $config['results'] ?? [] );

		// Provide some flexibility for external callers to pass config via source
		// args. This also helps with cases where the binding has become disconnected
		// from the ancestor remote data block.
		//
		// Source args will not be present during normal instantiation, but can be
		// passed in when this static method is called externally.
		if ( isset( $source_args['block'] ) ) {
			$config['blockName'] = $source_args['block'];
		}

		if ( isset( $source_args['enabledOverrides'] ) ) {
			$config['enabledOverrides'] = $source_args['enabledOverrides'];
		}

		if ( isset( $source_args['queryInputs'] ) ) {
			$config['queryInputs'] = $source_args['queryInputs'];
		}

		if ( isset( $source_args['queryKey'] ) ) {
			$config['queryKey'] = $source_args['queryKey'];
		}

		// Generate an ID for the block config based on relevant query input. This
		// is used to semi-uniquely identify the block instance for in-memory caching
		// and URL query variables that attempt to target a specific block on a page.
		// In other words, blocks that share the same effective configuration will
		// be treated identically.
		$config['configId'] = md5( wp_json_encode( [
			'blockName' => $config['blockName'] ?? null,
			'enabledOverrides' => $config['enabledOverrides'] ?? [],
			'queryKey' => $config['queryKey'] ?? null,
			'queryInputs' => $config['queryInputs'] ?? [],
		] ) );

		return $config;
	}
}
