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
 * Text Domain: safe-publish
 * Version: 0.0.4
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
define( 'SAFE_PUBLISH_VERSION', '0.0.4' );
define( 'SAFE_PUBLISH_PLUGIN_FILE', __FILE__ );
define( 'SAFE_PUBLISH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SAFE_PUBLISH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Autoloader for classes.
spl_autoload_register(
	function ( $class_name ): void {
		// Only autoload Safe_Publish classes.
		if ( 0 !== strpos( $class_name, 'Safe_Publish\\' ) ) {
				return;
		}

		// Convert namespace to file path.
		$class_path = str_replace( 'Safe_Publish\\', '', $class_name );
		$class_path = str_replace( '\\', '/', $class_path );
		$class_path = strtolower( $class_path );
		$class_path = str_replace( '_', '-', $class_path );

		// Map class names to file paths.
		$file_path = SAFE_PUBLISH_PLUGIN_DIR . 'includes/';

		// Handle specific namespace mappings.
		if ( 0 === strpos( $class_path, 'admin/' ) ) {
			$file_path .= 'admin/class-' . str_replace( 'admin/', '', $class_path ) . '.php';
		} elseif ( 0 === strpos( $class_path, 'api/' ) ) {
			$file_path .= 'api/class-' . str_replace( 'api/', '', $class_path ) . '.php';
		} elseif ( 0 === strpos( $class_path, 'auth/' ) ) {
			$file_path .= 'auth/class-' . str_replace( 'auth/', '', $class_path ) . '.php';
		} elseif ( 0 === strpos( $class_path, 'media/' ) ) {
			$file_path .= 'media/class-' . str_replace( 'media/', '', $class_path ) . '.php';
		} elseif ( 0 === strpos( $class_path, 'content/' ) ) {
			$file_path .= 'content/class-' . str_replace( 'content/', '', $class_path ) . '.php';
		} elseif ( 0 === strpos( $class_path, 'utils/' ) ) {
			$file_path .= 'utils/class-' . str_replace( 'utils/', '', $class_path ) . '.php';
		} elseif ( 0 === strpos( $class_path, 'seeder/' ) ) {
			$file_path .= 'seeder/class-' . str_replace( 'seeder/', '', $class_path ) . '.php';
		} elseif ( 0 === strpos( $class_path, 'validators/' ) ) {
			$file_path .= 'validators/class-' . str_replace( 'validators/', '', $class_path ) . '.php';
		} else {
			$file_path .= 'class-' . $class_path . '.php';
		}

		// VIP-safe file inclusion with proper validation.
		// Ensure the file path is within the plugin directory for security.
		$real_plugin_dir = realpath( SAFE_PUBLISH_PLUGIN_DIR );
		$real_file_path  = realpath( $file_path );

		// Try trait prefix if class prefix doesn't resolve.
		if ( ! $real_file_path ) {
			$file_path      = str_replace( '/class-', '/trait-', $file_path );
			$real_file_path = realpath( $file_path );
		}

		// Validate that the file exists and is within the plugin directory.
		if ( $real_file_path
			&& 0 === strpos( $real_file_path, $real_plugin_dir )
		) {
			// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable -- Safe file inclusion within plugin directory with validation
			require_once $file_path;
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

	// Initialize the main plugin class.
	$safe_publish_plugin = new \Safe_Publish\Plugin();
	$safe_publish_plugin->init();
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
