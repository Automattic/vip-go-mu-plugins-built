<?php declare(strict_types = 1);

/**
 * Plugin Name: VIP Real-Time Collaboration
 * Description: A real-time collaboration plugin made by VIP for enhancing the Block Editor experience.
 * Author: WPVIP
 * Author URI: https://wpvip.com
 * Text Domain: vip-real-time-collaboration
 * Version: 0.2.2
 * Requires at least: 6.7
 * Requires PHP: 8.2
 */

namespace VIPRealTimeCollaboration;

use VIPRealTimeCollaboration\Api\RestApi;
use VIPRealTimeCollaboration\Assets\Assets;
use VIPRealTimeCollaboration\Auth\SyncPermissions;
use VIPRealTimeCollaboration\Compatibility\Compatibility;
use VIPRealTimeCollaboration\Settings\Settings;
use VIPRealTimeCollaboration\Overrides\Overrides;

defined( 'ABSPATH' ) || exit();

// Check if the plugin is already loaded, if so, return early to prevent duplicate plugin instances.
if ( defined( 'VIP_REAL_TIME_COLLABORATION__LOADED' ) ) {
	return;
}

if ( ! vip_real_time_collaboration_pre_init() ) {
	return;
}

define( 'VIP_REAL_TIME_COLLABORATION__LOADED', true );
define( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_ROOT', __FILE__ );
define( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_DIRECTORY', untrailingslashit( plugin_dir_path( __FILE__ ) ) );
define( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_VERSION', '0.2.2' );

// Autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Telemetry
Telemetry\Telemetry::init( __FILE__ );

// Examples (must be manually built):
// require_once __DIR__ . '/examples/local-updates-block/local-updates-block.php';
// require_once __DIR__ . '/examples/post-meta-block/post-meta-block.php';

add_action( 'plugins_loaded', static function (): void {
	// If the plugin cannot load, return early.
	if ( ! Compatibility::should_plugin_load() ) {
		return;
	}

	// Initialize the core classes needed to manage the Gutenberg experiment.
	new Settings();
	// This is to account for the case where:
	// - The plugin is activated
	// - The RTC setting is disabled
	// - The experiment is manually activated
	// We want to ensure that we override the experimental features, to disable RTC functionality.
	new Compatibility();

	// If RTC is disabled, return early.
	if ( ! Settings::is_vip_rtc_enabled() ) {
		return;
	}

	// Load the rest of the plugin, that actually provides RTC functionality.

	// Initialize permission system
	SyncPermissions::init();

	new Assets();
	new Overrides();
	new RestApi();

	// Fire action to indicate that the plugin has loaded.
	do_action( 'vip_real_time_collaboration_loaded' );
}, 10, 0 );

/**
 * Verify that we can initialize the VIP Real-Time Collaboration plugin.
 *
 * @global string $wp_version The WordPress version string.
 *
 * @return bool true if the plugin can load, false otherwise.
 */
function vip_real_time_collaboration_pre_init(): bool {
	$php_version = phpversion();
	if ( is_string( $php_version ) && version_compare( $php_version, '8.2', '<' ) ) {
		add_action( 'admin_notices', function (): void {
			wp_admin_notice(
				__(
					'The VIP Real-Time Collaboration plugin requires PHP 8.2+. The VIP Real-Time Collaboration plugin has been disabled.',
					'vip_real_time_collaboration'
				),
				[ 'type' => 'error' ]
			);
		}, 10, 0 );
		return false;
	}

	global $wp_version;

	// Account for plugins overriding the $wp_version global, look at gutenberg.php for reference.
	/** @psalm-suppress MissingFile */
	// This is a built-in WordPress file, so we can ignore the warning here.
	include ABSPATH . WPINC . '/version.php';

	if ( version_compare( $wp_version, '6.7', '<' ) ) {
		add_action( 'admin_notices', function (): void {
			wp_admin_notice(
				__(
					'The VIP Real-Time Collaboration plugin requires WordPress 6.7+. The VIP Real-Time Collaboration plugin has been disabled.',
					'vip_real_time_collaboration'
				),
				[ 'type' => 'error' ]
			);
		}, 10, 0 );
		return false;
	}

	return true;
}
