<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\SalesforceD2C;

use RemoteDataBlocks\Store\DataSource\DataSourceConfigManager;
use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Integrations\SalesforceD2C\Auth\SalesforceD2CAuth;
use RemoteDataBlocks\Formatting\StringFormatter;
use WP_Error;

class SalesforceD2CIntegration {
	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_blocks' ], 10, 0 );
	}

	public static function register_blocks(): void {
		$data_source_configs = DataSourceConfigManager::get_all( [
			'service' => REMOTE_DATA_BLOCKS_SALESFORCE_D2C_SERVICE,
			'enable_blocks' => true,
		] );

		foreach ( $data_source_configs as $config ) {
			$data_source = SalesforceD2CDataSource::from_array( $config );

			self::register_blocks_for_salesforce_data_source( $data_source );
		}
	}

	private static function get_queries( SalesforceD2CDataSource $data_source ): array {
		$base_endpoint = $data_source->get_endpoint();
		$service_config = $data_source->to_array()['service_config'];

		$get_request_headers = function () use ( $base_endpoint, $service_config ): array|WP_Error {
			$access_token = SalesforceD2CAuth::generate_token(
				$base_endpoint,
				$service_config['client_id'],
				$service_config['client_secret']
			);
			$request_headers = [ 'Content-Type' => 'application/json' ];

			if ( is_wp_error( $access_token ) ) {
				return $access_token;
			}

			return array_merge( $request_headers, [ 'Authorization' => sprintf( 'Bearer %s', $access_token ) ] );
		};

		return [
			'display' => HttpQuery::from_array( [
				'data_source' => $data_source,
				'endpoint' => function ( array $input_variables ) use ( $base_endpoint, $service_config ): string {
					return sprintf(
						'%s/services/data/v63.0/commerce/webstores/%s/products?skus=%s',
						$base_endpoint,
						$service_config['store_id'],
						$input_variables['product_sku']
					);
				},
				'input_schema' => [
					'product_sku' => [
						'name' => 'Product SKU',
						'type' => 'id',
						'required' => true,
					],
				],
				'output_schema' => [
					'is_collection' => true,
					'path' => '$.products[*]',
					'type' => [
						'id' => [
							'name' => 'Product ID',
							'path' => '$.id',
							'type' => 'id',
						],
						'name' => [
							'name' => 'Name',
							'path' => '$.name',
							'type' => 'title',
						],
						'sku' => [
							'name' => 'SKU',
							'path' => '$.sku',
							'type' => 'string',
						],
						'description' => [
							'name' => 'Description',
							'path' => '$.fields.Description',
							'type' => 'string',
						],
						'image_url' => [
							'name' => 'Image URL',
							'path' => '$.defaultImage.url',
							'type' => 'image_url',
						],
						'image_alt_text' => [
							'name' => 'Image Alt Text',
							'path' => '$.defaultImage.alternateText',
							'type' => 'image_alt',
						],
					],
				],
				'request_headers' => $get_request_headers,
			] ),
			'search' => HttpQuery::from_array( [
				'data_source' => $data_source,
				'endpoint' => function ( array $input_variables ) use ( $base_endpoint, $service_config ): string {
					return sprintf(
						'%s/services/data/v63.0/commerce/webstores/%s/search/products?searchTerm=%s',
						$base_endpoint,
						$service_config['store_id'],
						urlencode( $input_variables['search'] )
					);
				},
				'input_schema' => [
					'search' => [
						'required' => true,
						'type' => 'ui:search_input',
					],
				],
				'output_schema' => [
					'path' => '$.productsPage.products[*]',
					'is_collection' => true,
					'type' => [
						'product_id' => [
							'name' => 'Product ID',
							'path' => '$.id',
							'type' => 'id',
						],
						'product_sku' => [
							'name' => 'Product SKU',
							'path' => '$.fields.StockKeepingUnit.value',
							'type' => 'string',
						],
						'name' => [
							'name' => 'Name',
							'path' => '$.name',
							'type' => 'title',
						],
						'image_url' => [
							'name' => 'Image URL',
							'path' => '$.defaultImage.url',
							'type' => 'image_url',
						],
					],
				],
				'request_headers' => $get_request_headers,
			] ),
		];
	}

	public static function register_blocks_for_salesforce_data_source( SalesforceD2CDataSource $data_source ): void {
		$queries = self::get_queries( $data_source );

		register_remote_data_block(
			[
				'title' => $data_source->get_display_name(),
				'icon' => 'money-alt',
				'render_query' => [
					'query' => $queries['display'],
				],
				'selection_queries' => [
					[
						'query' => $queries['search'],
						'type' => 'search',
					],
				],
				'overrides' => [
					[
						'display_name' => 'Use Salesforce product from URL',
						'name' => 'salesforce_sku',
					],
				],
			]
		);

		add_filter( 'query_vars', function ( array $query_vars ): array {
			$query_vars[] = 'sku';
			return $query_vars;
		}, 10, 1 );

		add_filter( 'remote_data_blocks_query_input_variables', function ( array $input_variables, array $enabled_overrides ): array {
			if ( true === in_array( 'salesforce_sku', $enabled_overrides, true ) ) {
				$product_sku = get_query_var( 'sku' );

				if ( ! empty( $product_sku ) ) {
					$input_variables['product_sku'] = $product_sku;
				}
			}

			return $input_variables;
		}, 10, 2 );
	}

	/**
	 * Get the block registration snippets for the Salesforce D2C integration.
	 *
	 * @param array $data_source_config The data source configuration.
	 * @return array The block registration snippets.
	 */
	public static function get_block_registration_snippets( array $data_source_config ): array {
		$raw_snippet = file_get_contents( __DIR__ . '/templates/block_registration.template' );
		$snippet = strtr( $raw_snippet, [
			'{{DATA_SOURCE_UUID}}' => $data_source_config['uuid'],
			'{{BLOCK_REG_FN_SLUG}}' => StringFormatter::normalize_function_name( [
				$data_source_config['service_config']['display_name'],
			] ),
		] );
		return [ $snippet ];
	}
}
