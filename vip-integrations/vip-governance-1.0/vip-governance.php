<?php
/**
 * Plugin Name: WordPress VIP Block Governance
 * Plugin URI: https://github.com/Automattic/vip-governance-plugin
 * Description: Add additional governance capabilities to the block editor.
 * Author: WordPress VIP
 * Text Domain: vip-governance
 * Version: 1.0.17
 * Requires at least: 6.8
 * Tested up to: 7.1
 * Requires PHP: 8.2
 * License: GPL-3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

defined( 'ABSPATH' ) || exit();

if ( ! function_exists( __NAMESPACE__ . '\\vip_governance_pre_init' ) ) {
	/**
	 * Verify that the VIP Block Governance plugin can initialize.
	 *
	 * @global string $wp_version The WordPress version string.
	 *
	 * @return bool True if the plugin can load, false otherwise.
	 */
	function vip_governance_pre_init(): bool {
		$php_version = phpversion();
		if ( is_string( $php_version ) && version_compare( $php_version, '8.2', '<' ) ) {
			add_action( 'admin_notices', static function (): void {
				wp_admin_notice(
					__(
						'The WordPress VIP Block Governance plugin requires PHP 8.2+. The WordPress VIP Block Governance plugin has been disabled.',
						'vip-governance'
					),
					[ 'type' => 'error' ]
				);
			}, 10, 0 );
			return false;
		}

		global $wp_version;

		// Account for plugins overriding the $wp_version global. See gutenberg.php for reference.
		include ABSPATH . WPINC . '/version.php';

		if ( version_compare( $wp_version, '6.8', '<' ) ) {
			add_action( 'admin_notices', static function (): void {
				wp_admin_notice(
					__(
						'The WordPress VIP Block Governance plugin requires WordPress 6.8+. The WordPress VIP Block Governance plugin has been disabled.',
						'vip-governance'
					),
					[ 'type' => 'error' ]
				);
			}, 10, 0 );
			return false;
		}

		return true;
	}
}

// Check if the plugin is already loaded, if so, return early to prevent duplicate plugin instances.
if ( defined( 'VIP_GOVERNANCE_LOADED' ) ) {
	return;
}

if ( ! vip_governance_pre_init() ) {
	return;
}

define( 'VIP_GOVERNANCE_LOADED', true );
define( 'WPCOMVIP__GOVERNANCE__PLUGIN_VERSION', '1.0.17' );
define( 'WPCOMVIP__GOVERNANCE__RULES_SCHEMA_VERSION', '1.0.0' );

if ( ! defined( 'WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_FILE' ) ) {
	define( 'WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_FILE', __FILE__ );
}

if ( ! defined( 'WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_DIR' ) ) {
	define( 'WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_DIR', __DIR__ );
}

define( 'WPCOMVIP_GOVERNANCE_RULES_FILENAME', 'governance-rules.json' );

define( 'WPCOMVIP__GOVERNANCE__RULES_REST_ROUTE', 'vip-governance/v1' );

define( 'WPCOMVIP__GOVERNANCE__STAT_NAME___USAGE', 'vip-governance-usage' );
define( 'WPCOMVIP__GOVERNANCE__STAT_NAME___ERROR', 'vip-governance-usage-error' );

// Composer Dependencies.
require_once __DIR__ . '/vendor/autoload.php';

// Analytics.
require_once __DIR__ . '/governance/analytics.php';

// Block Locking.
require_once __DIR__ . '/governance/block-locking.php';

// Utilities.
require_once __DIR__ . '/governance/governance-utilities.php';

// Initialize Governance.
require_once __DIR__ . '/governance/init-governance.php';
require_once __DIR__ . '/governance/nested-governance-processing.php';

// Rules Parser and Validator.
require_once __DIR__ . '/governance/rules-parser.php';

// Settings Panel.
require_once __DIR__ . '/governance/settings/settings.php';

// /wp-json/ API.
require_once __DIR__ . '/governance/rest/rest-api.php';
