<?php
/**
 * Plugin Name: WordPress Security Controls
 * Plugin URI: https://github.com/Automattic/vip-security-boost-integration
 * Description: A comprehensive security suite that protects WordPress VIP sites against common vulnerabilities and implements industry-standard security hardening measures.
 * Author: WordPress VIP
 * Text Domain: vip-security-boost
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * License: GPL version 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * @package vip-security-boost
 */

declare(strict_types = 1);

require_once __DIR__ . '/utils/configs.php';
require_once __DIR__ . '/utils/class-configs.php';
require_once __DIR__ . '/email/class-email.php';
require_once __DIR__ . '/utils/class-constants.php';
require_once __DIR__ . '/utils/class-logger.php';
require_once __DIR__ . '/utils/class-collector.php';
require_once __DIR__ . '/utils/class-tracking.php';

use function Automattic\VIP\Security\Utils\load_integration_configs_from_headers;
use function Automattic\VIP\Security\Utils\load_integration_configs_from_url;

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

// Load the modules
require_once __DIR__ . '/class-loader.php';

// Initialize tracking hooks
\Automattic\VIP\Security\Utils\Tracking::setup_action_hooks();

// Initialize collector hooks
add_filter( 'vip_prometheus_collectors', function ( $collectors ) {
	$collectors['vip_security_boost'] = new \Automattic\VIP\Security\Utils\Collector();

	return $collectors;
} );
