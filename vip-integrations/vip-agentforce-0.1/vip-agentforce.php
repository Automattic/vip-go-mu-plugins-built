<?php
/**
 * Plugin Name: VIP Agentforce
 * Plugin URI: https://github.com/Automattic/vip-agentforce
 * Description: WordPress integration for Salesforce Agentforce on VIP
 * Author: WordPress VIP
 * Text Domain: vip-agentforce
 * Version: 0.1.1
 * Requires at least: 6.7
 * Requires PHP: 8.1
 * License: GPL version 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * @package vip-agentforce
 */

declare(strict_types = 1);
const VIP_AGENTFORCE_FILE = __FILE__;

require_once __DIR__ . '/utils/class-configs.php';
require_once __DIR__ . '/utils/class-constants.php';
require_once __DIR__ . '/utils/class-logger.php';
require_once __DIR__ . '/utils/class-tracking.php';
require_once __DIR__ . '/utils/traits/trait-singleton.php';
require_once __DIR__ . '/utils/traits/trait-with-plugin-paths.php';

// quick loading of env.php for local development
if ( file_exists( __DIR__ . '/env.php' ) ) {
	require_once __DIR__ . '/env.php';
}

// Developer mode setup (excluded from releases).
if ( defined( 'VIP_AGENTFORCE_DEVELOPER_MODE' ) && true === VIP_AGENTFORCE_DEVELOPER_MODE && file_exists( __DIR__ . '/dev/setup.php' ) ) {
	require_once __DIR__ . '/dev/setup.php';
}

use function Automattic\VIP\Salesforce\Agentforce\Utils\load_integration_configs_from_headers;
use function Automattic\VIP\Salesforce\Agentforce\Utils\load_integration_configs_from_url;

/**
 * Local environment specific configurations.
 */
$is_local_env = ! defined( 'VIP_GO_APP_ENVIRONMENT' ) || 'local' === constant( 'VIP_GO_APP_ENVIRONMENT' );

if ( $is_local_env ) {
	require_once __DIR__ . '/utils/dev-env.php';

	if ( ! defined( 'VIP_GO_APP_ID' ) || ! constant( 'VIP_GO_APP_ID' ) ) {
		define( 'VIP_GO_APP_ID', 101 );
	}

	// Check headers for integration test configs
	if ( isset( $_SERVER['HTTP_X_INTEGRATION_TEST'] ) ) {
		// Load the integration configurations from the headers
		load_integration_configs_from_headers();
	} else {
		// Load the integration configurations from the CONFIG API
		load_integration_configs_from_url();
	}
}

if ( class_exists( 'Automattic\\VIP\\Prometheus\\Plugin' ) ) {
	require __DIR__ . '/utils/metrics.php';
}
// Initialize tracking hooks
\Automattic\VIP\Salesforce\Agentforce\Utils\Tracking::init();


// Load the modules
require_once __DIR__ . '/modules/ingestion/class-ingestion-post-record.php';
require_once __DIR__ . '/modules/ingestion/class-ingestion-api-result.php';
require_once __DIR__ . '/modules/ingestion/class-default-transformer.php';
require_once __DIR__ . '/modules/ingestion/class-sync-result.php';
require_once __DIR__ . '/modules/ingestion/class-ingestion.php';
require_once __DIR__ . '/modules/ingestion/class-ingestion-failure.php';
require_once __DIR__ . '/modules/ingestion/class-deletion-failure.php';
require_once __DIR__ . '/modules/ingestion/class-ingestion-config-filters.php';

// Load WP-CLI commands.
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once __DIR__ . '/modules/ingestion/class-ingestion-cli.php';
}

// CMP
require_once __DIR__ . '/modules/cmp/class-assets.php';
require_once __DIR__ . '/modules/cmp/class-settings-page.php';
require_once __DIR__ . '/modules/cmp/class-agentforce.php';
require_once __DIR__ . '/modules/cmp/class-cmp.php';
// initialize CMP module
\Automattic\VIP\Salesforce\Agentforce\Cmp\Cmp::get_instance();
