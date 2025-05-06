<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\Shopify;

use RemoteDataBlocks\Store\DataSource\DataSourceConfigManager;
use RemoteDataBlocks\Config\Query\GraphqlQuery;
use RemoteDataBlocks\Formatting\StringFormatter;
use RemoteDataBlocks\Snippet\Snippet;

use function register_remote_data_block;

class ShopifyIntegration {
	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_blocks' ], 10, 0 );
	}

	public static function register_blocks(): void {
		$data_source_configs = DataSourceConfigManager::get_all( [
			'service' => REMOTE_DATA_BLOCKS_SHOPIFY_SERVICE,
			'enable_blocks' => true,
		] );

		foreach ( $data_source_configs as $config ) {
			$data_source = ShopifyDataSource::from_array( $config );

			self::register_blocks_for_shopify_data_source( $data_source );
		}
	}

	public static function get_queries( ShopifyDataSource $data_source ): array {
		return [
			'shopify_get_product' => GraphqlQuery::from_array( [
				'data_source' => $data_source,
				'input_schema' => [
					'id' => [
						'type' => 'id',
						'name' => 'Product ID',
					],
				],
				'output_schema' => [
					'is_collection' => false,
					'type' => [
						'description' => [
							'name' => 'Product description',
							'path' => '$.data.product.descriptionHtml',
							'type' => 'string',
						],
						'details_button_url' => [
							'name' => 'Details URL',
							'generate' => function ( $data ): string {
								return '/path-to-page/' . $data['data']['product']['id'];
							},
							'type' => 'button_url',
						],
						'image_alt_text' => [
							'name' => 'Image Alt Text',
							'path' => '$.data.product.featuredImage.altText',
							'type' => 'image_alt',
						],
						'image_url' => [
							'name' => 'Image URL',
							'path' => '$.data.product.featuredImage.url',
							'type' => 'image_url',
						],
						'price' => [
							'name' => 'Item price',
							'path' => '$.data.product.priceRange.maxVariantPrice.amount',
							'type' => 'currency_in_current_locale',
						],
						'title' => [
							'name' => 'Title',
							'path' => '$.data.product.title',
							'type' => 'title',
						],
						'variant_id' => [
							'name' => 'Variant ID',
							'path' => '$.data.product.variants.edges[0].node.id',
							'type' => 'id',
						],
					],
				],
				'graphql_query' => file_get_contents( __DIR__ . '/Queries/GetProductById.graphql' ),
			] ),
			'shopify_search_products' => GraphqlQuery::from_array( [
				'data_source' => $data_source,
				'input_schema' => [
					'search' => [
						'type' => 'ui:search_input',
						'default_value' => '',
					],
					'limit' => [
						'default_value' => 8,
						'name' => 'Items per page',
						'type' => 'ui:pagination_per_page',
					],
					'cursor_next' => [
						'name' => 'Next page cursor',
						'type' => 'ui:pagination_cursor_next',
					],
					'cursor_previous' => [
						'name' => 'Previous page cursor',
						'type' => 'ui:pagination_cursor_previous',
					],
				],
				'output_schema' => [
					'path' => '$.data.products.edges[*]',
					'is_collection' => true,
					'type' => [
						'id' => [
							'name' => 'Product ID',
							'path' => '$.node.id',
							'type' => 'id',
						],
						'image_url' => [
							'name' => 'Item image URL',
							'path' => '$.node.images.edges[0].node.originalSrc',
							'type' => 'image_url',
						],
						'price' => [
							'name' => 'Item price',
							'path' => '$.node.priceRange.maxVariantPrice.amount',
							'type' => 'currency_in_current_locale',
						],
						'title' => [
							'name' => 'Product title',
							'path' => '$.node.title',
							'type' => 'title',
						],
					],
				],
				'pagination_schema' => [
					'cursor_next' => [
						'name' => 'Next page cursor',
						'path' => '$.data.products.pageInfo.endCursor',
						'type' => 'string',
					],
					'cursor_previous' => [
						'name' => 'Previous page cursor',
						'path' => '$.data.products.pageInfo.startCursor',
						'type' => 'string',
					],
					'has_next_page' => [
						'name' => 'Has next page',
						'path' => '$.data.products.pageInfo.hasNextPage',
						'type' => 'boolean',
					],
				],
				'graphql_query' => file_get_contents( __DIR__ . '/Queries/SearchProducts.graphql' ),
			] ),
		];
	}

	public static function register_blocks_for_shopify_data_source( ShopifyDataSource $data_source ): void {
		$block_title = $data_source->get_display_name();
		$queries = self::get_queries( $data_source );

		register_remote_data_block( [
			'title' => $block_title,
			'icon' => 'cart',
			'render_query' => [
				'query' => $queries['shopify_get_product'],
			],
			'selection_queries' => [
				[
					'query' => $queries['shopify_search_products'],
					'type' => 'search',
				],
			],
			'patterns' => [
				[
					'html' => file_get_contents( __DIR__ . '/Patterns/product-teaser.html' ),
					'role' => 'inner_blocks',
					'title' => 'Shopify Product Teaser',
				],
			],
		] );
	}

	/**
	 * Get the block registration snippets for the Shopify integration.
	 *
	 * @param array $data_source_config The data source configuration.
	 * @return array<Snippet> The block registration snippets.
	 */
	public static function get_block_registration_snippets( array $data_source_config ): array {
		$raw_template = file_get_contents( __DIR__ . '/templates/block_registration.template' );
		$display_name = $data_source_config['service_config']['display_name'];
		$code = strtr( $raw_template, [
			'{{DATA_SOURCE_UUID}}' => $data_source_config['uuid'],
			'{{BLOCK_REG_FN_SLUG}}' => StringFormatter::normalize_function_name( [
				$display_name,
			] ),
		] );
		return [ new Snippet( $display_name, $code ) ];
	}
}
