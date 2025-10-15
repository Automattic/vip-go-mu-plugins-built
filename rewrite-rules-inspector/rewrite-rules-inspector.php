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
 * Version:           1.5.1
 * Author:            Automattic, Daniel Bachhuber
 * Author URI:        https://automattic.com/
 * Text Domain:       rewrite-rules-inspector
 * License:           GPL-2.0-or-later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * GitHub Plugin URI: https://github.com/Automattic/Rewrite-Rules-Inspector
 * Requires PHP:      7.4
 * Requires WP:       5.9.0
 */

define( 'REWRITE_RULES_INSPECTOR_VERSION', '1.5.1' ); // Unused for now.
define( 'REWRITE_RULES_INSPECTOR_FILE_PATH', plugin_basename( __FILE__ ) );

// Load the WP_List_Table class if it doesn't yet exist.
if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . '/wp-admin/includes/class-wp-list-table.php';
}

// Load core classes.
require __DIR__ . '/src/Core/RewriteRules.php';
require __DIR__ . '/src/Core/Permastructs.php';
require __DIR__ . '/src/Core/FileExport.php';
require __DIR__ . '/src/Core/RuleFlush.php';
require __DIR__ . '/src/Core/UrlTester.php';

// Load admin classes.
require __DIR__ . '/src/Admin/AdminPage.php';
require __DIR__ . '/src/Admin/ViewRenderer.php';
require __DIR__ . '/src/Admin/ContextualHelp.php';
require __DIR__ . '/src/Admin/RewriteRulesTable.php';

// Load main plugin class.
require __DIR__ . '/src/Plugin.php';

add_action(
	'plugins_loaded',
	function(): void {
		global $rewrite_rules_inspector;
		$rewrite_rules_inspector = new \Automattic\RewriteRulesInspector\Plugin();
		$rewrite_rules_inspector->run();
	}
);
