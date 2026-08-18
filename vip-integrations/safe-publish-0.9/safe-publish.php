<?php
/**
 * @package Safe_Publish
 * @author WPVIP
 *
 * Plugin Name: Safe Publish
 * Plugin URI: https://github.com/Automattic/safe-publish
 * Description: Enables content transfer from non-production to production environments.
 * Author: WPVIP
 * Author URI: https://wpvip.com
 * Text Domain: Safe-publish
 * Version: 0.9.0
 * Requires at least: 6.8
 * Requires PHP: 8.2
 */

declare(strict_types=1);


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

if ( defined( 'SAFE_PUBLISH_LOADED' ) ) {
	return;
}

// Define plugin constants.
define( 'SAFE_PUBLISH_LOADED', true );
define( 'SAFE_PUBLISH_VERSION', '0.9.0' );
define( 'SAFE_PUBLISH_PLUGIN_FILE', __FILE__ );
define( 'SAFE_PUBLISH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SAFE_PUBLISH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Autoloader for plugin symbols using WordPress filename conventions.
spl_autoload_register(
	static function ( string $class_name ): void {
		$namespace = 'Safe_Publish\\';

		if ( ! str_starts_with( $class_name, $namespace ) ) {
			return;
		}

		$relative_path = substr( $class_name, strlen( $namespace ) );
		$relative_path = strtolower(
			str_replace( array( '\\', '_' ), array( '/', '-' ), $relative_path )
		);
		$separator     = strrpos( $relative_path, '/' );
		$directory     = false === $separator
			? ''
			: substr( $relative_path, 0, $separator + 1 );
		$symbol_name   = false === $separator
			? $relative_path
			: substr( $relative_path, $separator + 1 );
		$includes_path = realpath( SAFE_PUBLISH_PLUGIN_DIR . 'includes' );

		if ( false === $includes_path ) {
			return;
		}

		$includes_prefix = $includes_path . DIRECTORY_SEPARATOR;
		$directory       = str_replace( '/', DIRECTORY_SEPARATOR, $directory );

		foreach ( array( 'class-', 'trait-' ) as $prefix ) {
			$file_path      = $includes_prefix . $directory . $prefix
				. $symbol_name . '.php';
			$real_file_path = realpath( $file_path );

			if (
				false === $real_file_path
				|| ! str_starts_with( $real_file_path, $includes_prefix )
			) {
				continue;
			}

			// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable -- Validated path within the includes directory.
			require_once $real_file_path;
			return;
		}
	}
);

\Safe_Publish\Utils\Options::register_constant_filters();

// Initialize the plugin.
add_action( 'plugins_loaded', 'safe_publish_init_plugin' );

/**
 * Initializes the plugin.
 */
function safe_publish_init_plugin(): void {
	global $safe_publish_plugin;

	// Load text domain.
	load_plugin_textdomain( 'safe-publish', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );

	// The plugin requires cURL with SSL for outbound source requests.
	if ( ! safe_publish_has_curl_ssl() ) {
		add_action( 'admin_notices', 'safe_publish_curl_required_notice' );
		return;
	}

	// Initialize the main plugin class.
	$safe_publish_plugin = new \Safe_Publish\Plugin();
	$safe_publish_plugin->init();
}

/**
 * Reports whether cURL with SSL support is available.
 *
 * @return bool True when the cURL extension is loaded with SSL support.
 */
function safe_publish_has_curl_ssl(): bool {
	if ( ! function_exists( 'curl_init' ) || ! function_exists( 'curl_exec' ) ) {
		return false;
	}

	$version = curl_version();

	return is_array( $version )
		&& 0 !== ( CURL_VERSION_SSL & $version['features'] );
}

/**
 * Renders the admin notice shown when cURL with SSL is unavailable.
 */
function safe_publish_curl_required_notice(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	wp_admin_notice(
		esc_html__(
			'Safe Publish requires the cURL PHP extension with SSL support, which is not available on this site.',
			'safe-publish'
		),
		array( 'type' => 'error' )
	);
}

/**
 * Plugin activation hook.
 */
register_activation_hook( __FILE__, 'safe_publish_activation' );

/**
 * Plugin activation callback.
 *
 * Creates database tables, sets default options, and flushes rewrite rules.
 */
function safe_publish_activation(): void {
	\Safe_Publish\Utils\Audit_Log_Table::create_table();
	\Safe_Publish\Utils\Imports_Table::create_table();
	\Safe_Publish\Utils\Import_Items_Table::create_table();
	\Safe_Publish\Utils\Attention_Issues_Table::create_table();

	// Set default options.
	if ( false === get_option( 'safe_publish_connected_site_url' ) ) {
		update_option( 'safe_publish_connected_site_url', '' );
	}

	if ( false === get_option( 'safe_publish_number_of_posts' ) ) {
		update_option( 'safe_publish_number_of_posts', 10 );
	}

	if ( false === get_option( 'safe_publish_sync_mode' ) ) {
		update_option( 'safe_publish_sync_mode', '' );
	}

	// Flush rewrite rules if needed (only in non-VIP environments).
	if ( ! defined( 'WPCOM_IS_VIP_ENV' ) || ! WPCOM_IS_VIP_ENV ) {
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules -- Only executed in non-VIP environments
		flush_rewrite_rules();
	}
}

/**
 * Plugin deactivation hook.
 */
register_deactivation_hook( __FILE__, 'safe_publish_deactivation' );

/**
 * Plugin deactivation callback.
 *
 * Flushes rewrite rules when plugin is deactivated.
 */
function safe_publish_deactivation(): void {
	// Flush rewrite rules (only in non-VIP environments).
	if ( ! defined( 'WPCOM_IS_VIP_ENV' ) || ! WPCOM_IS_VIP_ENV ) {
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules -- Only executed in non-VIP environments
		flush_rewrite_rules();
	}
}
