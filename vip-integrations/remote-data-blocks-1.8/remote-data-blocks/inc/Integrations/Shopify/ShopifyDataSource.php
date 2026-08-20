<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\Shopify;

use RemoteDataBlocks\Integrations\GenericHttp\GenericHttpDataSource;
use RemoteDataBlocks\Validation\Types;
use function plugins_url;

defined( 'ABSPATH' ) || exit();

class ShopifyDataSource extends GenericHttpDataSource {
	protected const SERVICE_NAME = REMOTE_DATA_BLOCKS_SHOPIFY_SERVICE;
	protected const SERVICE_SCHEMA_VERSION = 1;

	protected static function get_service_config_schema(): array {
		return Types::object( [
			'__version' => Types::integer(),
			'access_token' => Types::nullable( Types::skip_sanitize( Types::string() ) ),
			'display_name' => Types::string(),
			'enable_blocks' => Types::nullable( Types::boolean() ),
			'store_name' => Types::string(),
		] );
	}

	protected static function map_service_config( array $service_config ): array {
		// Extract the store name from the full URL, if provided.
		$store_name = preg_replace( '#^https?://#', '', $service_config['store_name'] );
		$store_name = preg_replace( '#\.myshopify\.com.*#', '', $store_name );

		$endpoint = sprintf( 'https://%s.myshopify.com/api/2024-04/graphql.json', $store_name );

		// Special case for the Shopify Mock Store, which uses a different endpoint.
		if ( 'mock.shop' === $store_name ) {
			$endpoint = 'https://mock.shop/api';
		}

		return [
			'display_name' => $service_config['display_name'],
			'endpoint' => $endpoint,
			'image_url' => plugins_url( './assets/shopify_logo_black.png', __FILE__ ),
			'request_headers' => [
				'Content-Type' => 'application/json',
				'X-Shopify-Storefront-Access-Token' => $service_config['access_token'] ?? '',
			],
		];
	}
}
