<?php
/**
 * Plugin Name: Share a Draft
 * Plugin URI: https://wordpress.org/plugins/shareadraft/
 * Description: Generate safe-to-share, time- and usage-limited preview links so reviewers without a WordPress account can review a draft.
 * Version: 2.0.0
 * Requires at least: 6.9
 * Requires PHP: 8.2
 * Author: Automattic
 * Author URI: https://wpvip.com
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: shareadraft
 * Domain Path: /languages
 */

use Automattic\ShareADraft\BulkLinkRevoker;
use Automattic\ShareADraft\LinkGarbageCollector;
use Automattic\ShareADraft\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( defined( 'VIP_SHAREADRAFT_LOADED' ) ) {
	return;
}

define( 'VIP_SHAREADRAFT_LOADED', true );
define( 'VIP_SHAREADRAFT_VERSION', '2.0.0' );
define( 'VIP_SHAREADRAFT_FILE', __FILE__ );

require_once __DIR__ . '/inc/autoload.php';

register_deactivation_hook( __FILE__, [ LinkGarbageCollector::class, 'unschedule' ] );
register_deactivation_hook( __FILE__, [ BulkLinkRevoker::class, 'unschedule' ] );
register_activation_hook( __FILE__, [ BulkLinkRevoker::class, 'reschedule' ] );

Plugin::get_instance()->register();

// Links made with Share a Draft 1.x, until 2.1.0 removes them.
require_once __DIR__ . '/vestigial.php';
Automattic\ShareADraft\Vestigial\bootstrap();
