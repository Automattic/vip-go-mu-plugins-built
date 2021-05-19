<?php
/**
 * Rewrite Rules Inspector
 *
 * @package      automattic\rewrite-rules-inspector
 * @author       Automattic, Daniel Bachhuber
 * @copyright    2012 Automattic
 * @license      GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       Rewrite Rules Inspector
 * Plugin URI:        https://wordpress.org/plugins/rewrite-rules-inspector/
 * Description:       Simple WordPress admin tool for inspecting your rewrite rules.
 * Version:           1.3.1
 * Author:            Automattic, Daniel Bachhuber
 * Author URI:        https://automattic.com/
 * Text Domain:       rewrite-rules-inspector
 * License:           GPL-2.0-or-later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * GitHub Plugin URI: https://github.com/Automattic/Rewrite-Rules-Inspector
 * Requires PHP:      5.6
 * Requires WP:       3.1.0
 */

define( 'REWRITE_RULES_INSPECTOR_VERSION', '1.3.1' ); // Unused for now.
define( 'REWRITE_RULES_INSPECTOR_FILE_PATH', plugin_basename( __FILE__ ) );

require __DIR__ . '/src/class-rewrite-rules-inspector.php';

// Load the WP_List_Table class if it doesn't yet exist.
if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . '/wp-admin/includes/class-wp-list-table.php';
}

require __DIR__ . '/src/class-rewrite-rules-inspector-list-table.php';

add_action(
	'plugins_loaded',
	function() {
		global $rewrite_rules_inspector;
		$rewrite_rules_inspector = new Rewrite_Rules_Inspector();
		$rewrite_rules_inspector->run();
	}
);

add_action( 'init', 'rri_load_textdomain' );
/**
 * Load plugin textdomain.
 *
 * Only look for WP_LANG_DIR . '/plugins/rewrite-rules-inspector-' . $locale . '.mo'.
 * WP_LANG_DIR is usually WP_CONTENT_DIR . '/languages/'.
 * No other fallback location is supported.
 *
 * This can be removed once minimum supported WordPress is 4.6 or later.
 *
 * @since 1.3.1
 */
function rri_load_textdomain() {
	load_plugin_textdomain( 'rewrite-rules-inspector' );
}
