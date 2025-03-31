<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Shopify;

use RemoteDataBlocks\Integrations\Shopify\ShopifyDataSource;
use RemoteDataBlocks\Integrations\Shopify\ShopifyIntegration;

function register_shopify_block(): void {
	if ( ! defined( 'EXAMPLE_SHOPIFY_ACCESS_TOKEN' ) ) {
		return;
	}

	$access_token = constant( 'EXAMPLE_SHOPIFY_ACCESS_TOKEN' );
	$store_slug = 'stoph-test';

	$shopify_data_source = ShopifyDataSource::from_array( [
		'service_config' => [
			'__version' => 1,
			'access_token' => $access_token,
			'display_name' => 'Shopify Example',
			'store_name' => $store_slug,
		],
	] );

	ShopifyIntegration::register_blocks_for_shopify_data_source( $shopify_data_source );
}
add_action( 'init', __NAMESPACE__ . '\\register_shopify_block' );
