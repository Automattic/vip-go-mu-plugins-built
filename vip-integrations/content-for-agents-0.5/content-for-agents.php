<?php
/**
 * Plugin Name:       Content for Agents
 * Description:       Publish WordPress VIP content as Markdown with agent discovery and extensible block conversion.
 * Version:           0.5.0
 * Requires at least: 7.0
 * Requires PHP:      8.2
 * Author:            WPVIP
 * Author URI:        https://wpvip.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       content-for-agents
 *
 * Derived from PRC Markdown for Agents by Pew Research Center.
 * Original copyright 2025 Pew Research Center. See docs/NOTICE.md and LICENSE.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( defined( 'CONTENT_FOR_AGENTS_LOADED' ) ) {
	return;
}

if ( ! pre_init() ) {
	return;
}

/**
 * Check requirements for VIP application loaders that bypass plugin activation.
 *
 * WordPress checks the plugin headers during normal activation. Its version
 * compatibility helper reads the unmodified core version, even when another
 * plugin changes the global version string.
 */
function pre_init(): bool {
	if ( is_php_version_compatible( '8.2' ) && is_wp_version_compatible( '7.0' ) ) {
		return true;
	}

	add_action( 'admin_notices', __NAMESPACE__ . '\\incompatible_runtime_notice' );
	add_action( 'network_admin_notices', __NAMESPACE__ . '\\incompatible_runtime_notice' );
	return false;
}

/**
 * Explain why the plugin did not load on an unsupported runtime.
 */
function incompatible_runtime_notice(): void {
	echo '<div class="notice notice-error"><p>';
	echo esc_html__( 'Content for Agents requires WordPress 7.0 or newer and PHP 8.2 or newer. The plugin was not loaded.', 'content-for-agents' );
	echo '</p></div>';
}

define( 'CONTENT_FOR_AGENTS_LOADED', true );
define( 'CONTENT_FOR_AGENTS_FILE', __FILE__ );
define( 'CONTENT_FOR_AGENTS_DIR', plugin_dir_path( __FILE__ ) );
define( 'CONTENT_FOR_AGENTS_URL', plugin_dir_url( __FILE__ ) );
define( 'CONTENT_FOR_AGENTS_VERSION', '0.5.0' );

// Autoload top-level plugin classes using WordPress filename conventions.
spl_autoload_register(
	static function ( string $requested_class ): void {
		$namespace = __NAMESPACE__ . '\\';

		if ( ! str_starts_with( $requested_class, $namespace ) ) {
			return;
		}

		$class_name = substr( $requested_class, strlen( $namespace ) );

		// Integration plugins use separate namespaces and autoloaders.
		if ( false === $class_name || str_contains( $class_name, '\\' ) ) {
			return;
		}

		$file_name = 'class-' . strtolower( str_replace( '_', '-', $class_name ) ) . '.php';
		$file_path = CONTENT_FOR_AGENTS_DIR . 'includes/' . $file_name;

		if ( is_readable( $file_path ) ) {
			require_once $file_path;
		}
	}
);

/**
 * Register the plugin hooks after application plugins have loaded.
 */
function initialize_plugin(): void {
	( new Bootstrap() )->run();
}

add_action( 'plugins_loaded', __NAMESPACE__ . '\\initialize_plugin', 10, 0 );
