<?php
/**
 * Plugin Name: VIP Block Data API
 * Plugin URI: https://wpvip.com
 * Description: Access Gutenberg block data in JSON via the REST API.
 * Author: WordPress VIP
 * Text Domain: vip-block-data-api
 * Version: 1.0.2
 * Requires at least: 5.6.0
 * Tested up to: 6.1.0
 * Requires PHP: 7.4
 * License: GPL-3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi;

if ( ! defined( 'VIP_BLOCK_DATA_API_LOADED' ) ) {
	define( 'VIP_BLOCK_DATA_API_LOADED', true );

	define( 'WPCOMVIP__BLOCK_DATA_API__PLUGIN_VERSION', '1.0.2' );
	define( 'WPCOMVIP__BLOCK_DATA_API__REST_ROUTE', 'vip-block-data-api/v1' );

	// Composer dependencies.
	require_once __DIR__ . '/vendor/autoload.php';

	// /wp-json/ API.
	require_once __DIR__ . '/src/rest/rest-api.php';

	// Block parsing.
	require_once __DIR__ . '/src/parser/content-parser.php';
	require_once __DIR__ . '/src/parser/block-additions/core-image.php';

	// Analytics.
	require_once __DIR__ . '/src/analytics/analytics.php';
}
