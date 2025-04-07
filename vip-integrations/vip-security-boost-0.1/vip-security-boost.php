<?php declare(strict_types = 1);

/**
 * Plugin Name: WordPress VIP Security Boost
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

require_once __DIR__ . '/class-integration.php';

use Automattic\VIP\Integrations\IntegrationsSingleton;
use Automattic\VIP\Security\Integration;

use function Automattic\VIP\Security\Utils\load_integration_configs;

/**
 * Local environment specific configurations.
 */
$is_local_env = ! defined( 'VIP_GO_APP_ENVIRONMENT' ) || 'local' === constant( 'VIP_GO_APP_ENVIRONMENT' );

if ( $is_local_env ) {
    require_once __DIR__ . '/class-integration.php';
    require_once __DIR__ . '/utils/dev-env.php';

	if ( ! defined( 'VIP_GO_APP_ID' ) || ! constant( 'VIP_GO_APP_ID' ) ) {
		define( 'VIP_GO_APP_ID', 101 );
	}

	define( 'VIP_CONFIG_API_URL', vip_get_env_var( 'VIP_CONFIG_API_URL', getenv( 'VIP_CONFIG_API_URL' ) ) );

    /**
     * Register and activate the integration.
     */
    $integration = new Integration( 'security-boost' );

    IntegrationsSingleton::instance()->register( $integration );
    IntegrationsSingleton::instance()->activate_platform_integrations();

    // Load the integration configurations from the CONFIG API
    load_integration_configs();

    // Load the integration
    $integration->load();
}

// Load the modules
require_once __DIR__ . '/class-loader.php';
