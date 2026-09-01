<?php
/**
 * Plugin Name: VIP Workflows
 * Plugin URI: https://wpvip.com/
 * Description: Enterprise workflows and automation platform for WordPress VIP
 * Version: 0.0.2
 * Author: WordPress VIP
 * Author URI: https://wpvip.com/
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: vip-workflows
 * Domain Path: /languages
 * Requires at least: 7.0
 * Requires PHP: 8.2
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Self-load guard: when both a site copy and the platform-bundled copy are
// present, the first one to parse wins and the second returns before redefining
// any constants. This is the load sentinel the Integration Center wrapper checks.
if ( defined( 'VIP_WORKFLOWS_LOADED' ) ) {
	return;
}

// Plugin constants.
define( 'VIP_WORKFLOWS_LOADED', true );
define( 'VIP_WORKFLOWS_VERSION', '0.0.2' );
define( 'VIP_WORKFLOWS_PLUGIN_FILE', __FILE__ );
define( 'VIP_WORKFLOWS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'VIP_WORKFLOWS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Minimum requirements.
define( 'VIP_WORKFLOWS_MIN_PHP_VERSION', '8.2' );
define( 'VIP_WORKFLOWS_MIN_WP_VERSION', '7.0' );

/**
 * Check minimum requirements before loading the plugin.
 *
 * @return bool True if requirements are met.
 */
function check_requirements(): bool {
	$meets_requirements = true;

	if ( version_compare( PHP_VERSION, VIP_WORKFLOWS_MIN_PHP_VERSION, '<' ) ) {
		add_action( 'admin_notices', __NAMESPACE__ . '\\php_version_notice' );
		$meets_requirements = false;
	}

	if ( version_compare( get_bloginfo( 'version' ), VIP_WORKFLOWS_MIN_WP_VERSION, '<' ) ) {
		add_action( 'admin_notices', __NAMESPACE__ . '\\wp_version_notice' );
		$meets_requirements = false;
	}

	return $meets_requirements;
}

/**
 * Display PHP version notice.
 */
function php_version_notice(): void {
	?>
	<div class="notice notice-error">
		<p>
			<?php
			printf(
				/* translators: 1: Required PHP version, 2: Current PHP version */
				esc_html__( 'VIP Workflows requires PHP %1$s or higher. You are running PHP %2$s.', 'vip-workflows' ),
				esc_html( VIP_WORKFLOWS_MIN_PHP_VERSION ),
				esc_html( PHP_VERSION )
			);
			?>
		</p>
	</div>
	<?php
}

/**
 * Display WordPress version notice.
 */
function wp_version_notice(): void {
	?>
	<div class="notice notice-error">
		<p>
			<?php
			printf(
				/* translators: 1: Required WP version, 2: Current WP version */
				esc_html__( 'VIP Workflows requires WordPress %1$s or higher. You are running WordPress %2$s.', 'vip-workflows' ),
				esc_html( VIP_WORKFLOWS_MIN_WP_VERSION ),
				esc_html( get_bloginfo( 'version' ) )
			);
			?>
		</p>
	</div>
	<?php
}

// Path-resolution helper used by the autoloader and the path-naming guard test.
require_once __DIR__ . '/autoload-paths.php';

/**
 * Autoloader for plugin classes.
 *
 * @param string $class_name The fully-qualified class name.
 */
function autoloader( string $class_name ): void {
	$relative = class_to_relative_path( $class_name );
	if ( null === $relative ) {
		return;
	}

	$file = VIP_WORKFLOWS_PLUGIN_DIR . 'includes/' . $relative;

	// VIP-safe inclusion: resolve real paths and require only when the target
	// stays within includes/. realpath() returns false for missing files, so a
	// non-existent class file is skipped silently. The trailing separator on the
	// base prevents a sibling-prefix directory (e.g. includes-other/) from
	// passing the boundary check.
	$real_base = realpath( VIP_WORKFLOWS_PLUGIN_DIR . 'includes' );
	$real_file = realpath( $file );

	if ( false !== $real_file && false !== $real_base && str_starts_with( $real_file, $real_base . DIRECTORY_SEPARATOR ) ) {
		require_once $file;
	}
}

spl_autoload_register( __NAMESPACE__ . '\\autoloader' );

// Load Composer autoloader for PSR-4 classes.
$composer_autoload = VIP_WORKFLOWS_PLUGIN_DIR . 'vendor/autoload.php';
if ( file_exists( $composer_autoload ) ) {
	require_once $composer_autoload;
}

// Load ActionScheduler (not PSR-4, requires explicit bootstrap).
$action_scheduler = VIP_WORKFLOWS_PLUGIN_DIR . 'vendor/woocommerce/action-scheduler/action-scheduler.php';
if ( file_exists( $action_scheduler ) ) {
	require_once $action_scheduler;
}

/**
 * Initialize the plugin.
 *
 * The Abilities API (wp_register_ability) and the PHP AI Client are provided by
 * WordPress 7.0+ core; check_requirements() gates activation below 7.0, so no
 * runtime fallback loading is needed.
 */
function init(): void {
	if ( ! check_requirements() ) {
		return;
	}

	// Load the main plugin class.
	$plugin = Plugin::get_instance();
	$plugin->init();
}

// Initialize on plugins_loaded to ensure all dependencies are available.
add_action( 'plugins_loaded', __NAMESPACE__ . '\\init' );

/**
 * Run schema upgrades automatically when the code version bumps.
 */
function maybe_upgrade_schema(): void {
	$current = get_option( 'vip_workflows_db_version', '0.0.0' );

	if ( version_compare( $current, Database\Schema::VERSION, '>=' ) ) {
		return;
	}

	$schema = new Database\Schema();
	try {
		$schema->install();
	} catch ( \RuntimeException $e ) {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( 'VIP Workflows: schema upgrade failed — ' . $e->getMessage() );
	}
}

add_action( 'admin_init', __NAMESPACE__ . '\\maybe_upgrade_schema' );

/**
 * Activation hook.
 */
function activate(): void {
	if ( ! check_requirements() ) {
		return;
	}

	// Run database migrations.
	$schema = new Database\Schema();
	$schema->install();

	// Seed default data.
	$seeder = new Database\Seeder();
	$seeder->seed();

	// Clear rewrite rules. On VIP, rewrite rules are managed at the platform
	// level, so the flush is both unnecessary and restricted.
	if ( ! ( defined( 'WPCOM_IS_VIP_ENV' ) && WPCOM_IS_VIP_ENV ) ) {
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules -- one-time flush on plugin activation, non-VIP only.
		flush_rewrite_rules();
	}
}

register_activation_hook( __FILE__, __NAMESPACE__ . '\\activate' );

/**
 * Deactivation hook.
 */
function deactivate(): void {
	// Clear scheduled jobs if Action Scheduler is available.
	if ( function_exists( 'as_unschedule_all_actions' ) ) {
		$jobs = array(
			'vip_workflows_check_sla_breaches',
		);

		foreach ( $jobs as $job ) {
			as_unschedule_all_actions( $job );
		}
	}

	// On VIP, rewrite rules are managed at the platform level, so the flush is
	// both unnecessary and restricted.
	if ( ! ( defined( 'WPCOM_IS_VIP_ENV' ) && WPCOM_IS_VIP_ENV ) ) {
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules -- one-time flush on plugin deactivation, non-VIP only.
		flush_rewrite_rules();
	}
}

register_deactivation_hook( __FILE__, __NAMESPACE__ . '\\deactivate' );
