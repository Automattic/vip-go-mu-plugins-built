<?php
/**
 * Plugin Name: VIP Block Data API
 * Plugin URI: https://wpvip.com
 * Description: Access Gutenberg block data in JSON via the REST API.
 * Author: WordPress VIP
 * Text Domain: vip-block-data-api
 * Version: 1.4.0
 * Requires at least: 6.0
 * Tested up to: 6.6
 * Requires PHP: 8.0
 * License: GPL-3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi;

if ( ! defined( 'VIP_BLOCK_DATA_API_LOADED' ) ) {
	define( 'VIP_BLOCK_DATA_API_LOADED', true );

	define( 'WPCOMVIP__BLOCK_DATA_API__PLUGIN_VERSION', '1.4.0' );
	define( 'WPCOMVIP__BLOCK_DATA_API__REST_ROUTE', 'vip-block-data-api/v1' );

	// Analytics related configs.
	define( 'WPCOMVIP__BLOCK_DATA_API__STAT_NAME__USAGE', 'vip-block-data-api-usage' );
	define( 'WPCOMVIP__BLOCK_DATA_API__STAT_NAME__ERROR', 'vip-block-data-api-error' );
	define( 'WPCOMVIP__BLOCK_DATA_API__STAT_SAMPLING_RATE_SEC', 10 );

	// Composer dependencies.
	require_once __DIR__ . '/vendor/autoload.php';

	// GraphQL API.
	require_once __DIR__ . '/src/graphql/graphql-api-v1.php';
	require_once __DIR__ . '/src/graphql/graphql-api-v2.php';

	// /wp-json/ API.
	require_once __DIR__ . '/src/rest/rest-api.php';

	// Block parsing.
	require_once __DIR__ . '/src/parser/content-parser.php';
	require_once __DIR__ . '/src/parser/block-additions/core-block.php';
	require_once __DIR__ . '/src/parser/block-additions/core-image.php';

	// Analytics.
	require_once __DIR__ . '/src/analytics/analytics.php';
}
