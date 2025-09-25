<?php declare(strict_types = 1);

/**
 * Plugin Name: VIP Real-Time Collaboration
 * Description: A real-time collaboration plugin made by VIP for enhancing the Block Editor experience.
 * Author: WPVIP
 * Author URI: https://wpvip.com
 * Text Domain: vip-real-time-collaboration
 * Version: 0.1.0
 * Requires at least: 6.7
 * Requires PHP: 8.2
 */

namespace VIPRealTimeCollaboration;

use VIPRealTimeCollaboration\Api\RestApi;
use VIPRealTimeCollaboration\Assets\Assets;
use VIPRealTimeCollaboration\Auth\SyncPermissions;
use VIPRealTimeCollaboration\Compatibility\Compatibility;
use VIPRealTimeCollaboration\Editor\CrdtPersistence;
use VIPRealTimeCollaboration\Overrides\Overrides;

defined( 'ABSPATH' ) || exit();

// Check if the plugin is already loaded, if so, return early to prevent duplicate plugin instances.
if ( defined( 'VIP_REAL_TIME_COLLABORATION__LOADED' ) ) {
	return;
}

define( 'VIP_REAL_TIME_COLLABORATION__LOADED', true );
define( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_ROOT', __FILE__ );
define( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_DIRECTORY', untrailingslashit( plugin_dir_path( __FILE__ ) ) );
define( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_VERSION', '0.1.1' );

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

	// Initialize permission system
	SyncPermissions::init();

	new Assets();
	new Compatibility();
	new CrdtPersistence();
	new Overrides();
	new RestApi();

	// Fire action to indicate that the plugin has loaded.
	do_action( 'vip_real_time_collaboration_loaded' );
}, 10, 0 );
