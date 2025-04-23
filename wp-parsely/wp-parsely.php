<?php
/**
 * Parse.ly
 *
 * @package   Parsely
 * @author    Parse.ly
 * @copyright 2012 Parse.ly
 * @license   GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       Parse.ly
 * Plugin URI:        https://docs.parse.ly/wordpress
 * Description:       This plugin makes it a snap to add Parse.ly tracking code and metadata to your WordPress blog.
 * Version:           3.17.0
 * Author:            Parse.ly
 * Author URI:        https://www.parse.ly
 * Text Domain:       wp-parsely
 * License:           GPL-2.0-or-later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * GitHub Plugin URI: https://github.com/Parsely/wp-parsely
 * Requires PHP:      7.2
 * Requires WP:       5.0.0
 */

declare(strict_types=1);

namespace Parsely;

use Parsely\Content_Helper\Dashboard_Widget;
use Parsely\Content_Helper\Editor_Sidebar;
use Parsely\Content_Helper\Excerpt_Suggestions;
use Parsely\Content_Helper\Post_List_Stats;
use Parsely\Endpoints\GraphQL_Metadata;
use Parsely\Endpoints\Rest_Metadata;
use Parsely\Integrations\Amp;
use Parsely\Integrations\Google_Web_Stories;
use Parsely\Integrations\Integrations;
use Parsely\REST_API\REST_API_Controller;
use Parsely\UI\Admin_Bar;
use Parsely\UI\Admin_Warning;
use Parsely\UI\Metadata_Renderer;
use Parsely\UI\Network_Admin_Sites_List;
use Parsely\UI\Plugins_Actions;
use Parsely\UI\Recommended_Widget;
use Parsely\UI\Row_Actions;
use Parsely\UI\Settings_Page;
use Parsely\UI\Site_Health;

if ( class_exists( Parsely::class ) ) {
	return;
}

const PARSELY_VERSION = '3.17.0';
const PARSELY_FILE    = __FILE__;

if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

// Load Telemetry classes.
require_once __DIR__ . '/src/Telemetry/telemetry-init.php';


add_action( 'plugins_loaded', __NAMESPACE__ . '\\parsely_initialize_plugin' );
/**
 * Registers the basic classes to initialize the plugin.
 */
function parsely_initialize_plugin(): void {
	$GLOBALS['parsely'] = new Parsely();
	$GLOBALS['parsely']->run();

	if ( class_exists( 'WPGraphQL' ) ) {
		$graphql = new GraphQL_Metadata( $GLOBALS['parsely'] );
		$graphql->run();
	}

	$scripts = new Scripts( $GLOBALS['parsely'] );
	$scripts->run();

	$admin_bar = new Admin_Bar( $GLOBALS['parsely'] );
	$admin_bar->run();

	$metadata_renderer = new Metadata_Renderer( $GLOBALS['parsely'] );
	$metadata_renderer->run();
}

add_action( 'admin_init', __NAMESPACE__ . '\\parsely_admin_init_register' );
/**
 * Registers the Parse.ly wp-admin warnings, plugin actions and row actions.
 */
function parsely_admin_init_register(): void {
	$parsely = $GLOBALS['parsely'];

	( new Admin_Warning( $parsely ) )->run();
	( new Plugins_Actions() )->run();
	( new Row_Actions( $parsely ) )->run();
	( new Post_List_Stats( $parsely ) )->run();
	( new Site_Health( $parsely ) )->run();
	( new Dashboard_Widget( $parsely ) )->run();
}

add_action( 'init', __NAMESPACE__ . '\\parsely_wp_admin_early_register' );
/**
 * Registers the additions the Parse.ly wp-admin settings page and Multisite
 * Network Admin Sites List table.
 */
function parsely_wp_admin_early_register(): void {
	$GLOBALS['parsely_settings_page'] = new Settings_Page( $GLOBALS['parsely'] );
	$GLOBALS['parsely_settings_page']->run();

	$network_admin_sites_list = new Network_Admin_Sites_List( $GLOBALS['parsely'] );
	$network_admin_sites_list->run();

	// Initialize the REST API Controller.
	$rest_api_controller = $GLOBALS['parsely']->get_rest_api_controller();
	$rest_api_controller->init();
}

add_action( 'rest_api_init', __NAMESPACE__ . '\\parsely_rest_api_init' );
/**
 * Registers REST Endpoints that act as a proxy to the Parse.ly API.
 * This is needed to get around CORS issues with Firefox.
 *
 * @since 3.2.0
 */
function parsely_rest_api_init(): void {
	$rest = new Rest_Metadata( $GLOBALS['parsely'] );
	$rest->run();
}

add_action( 'init', __NAMESPACE__ . '\\init_recommendations_block' );
/**
 * Registers the Recommendations Block.
 */
function init_recommendations_block(): void {
	$recommendations_block = new Recommendations_Block();
	$recommendations_block->run();
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\init_content_helper_editor_sidebar' );
/**
 * Inserts the PCH Editor Sidebar.
 *
 * @since 3.5.0 Moved from Parsely\Scripts\enqueue_block_editor_assets().
 * @since 3.9.0 Renamed from init_content_helper().
 */
function init_content_helper_editor_sidebar(): void {
	$GLOBALS['parsely_editor_sidebar']->run();
}

add_action( 'admin_init', __NAMESPACE__ . '\\parsely_content_helper_editor_sidebar_features' );
add_action( 'rest_api_init', __NAMESPACE__ . '\\parsely_content_helper_editor_sidebar_features' );
/**
 * Initializes the PCH Editor Sidebar features.
 *
 * @since 3.16.0
 */
function parsely_content_helper_editor_sidebar_features(): void {
	if ( ! isset( $GLOBALS['parsely_editor_sidebar'] ) ) {
		/**
		 * The Editor Sidebar instance.
		 *
		 * @since 3.16.0
		 * @var Editor_Sidebar $GLOBALS['parsely_editor_sidebar']
		 */
		$GLOBALS['parsely_editor_sidebar'] = new Editor_Sidebar( $GLOBALS['parsely'] );
		$GLOBALS['parsely_editor_sidebar']->init_features();
	}
}

add_action( 'widgets_init', __NAMESPACE__ . '\\parsely_recommended_widget_register' );
/**
 * Registers the Parse.ly Recommended widget.
 */
function parsely_recommended_widget_register(): void {
	register_widget( new Recommended_Widget( $GLOBALS['parsely'] ) );
}

add_action( 'init', __NAMESPACE__ . '\\parsely_integrations' ); // @phpstan-ignore-line
/**
 * Instantiates Integrations collection and registers built-in integrations.
 *
 * @since 2.6.0
 *
 * @param Parsely|string|null $parsely The Parsely object to pass to the integrations.
 * @return Integrations
 */
function parsely_integrations( $parsely = null ): Integrations {
	// If $parsely value is "", then this function is being called by the init
	// hook and we can get the value from $GLOBALS. If $parsely is an instance
	// of the Parsely object, then this function is being called by a test.
	if ( ! is_object( $parsely ) || get_class( $parsely ) !== Parsely::class ) {
		$parsely = $GLOBALS['parsely'];
	}

	$parsely_integrations = new Integrations( $parsely );
	$parsely_integrations->register( 'amp', Amp::class );
	$parsely_integrations->register( 'webstories', Google_Web_Stories::class );
	$parsely_integrations = apply_filters( 'wp_parsely_add_integration', $parsely_integrations );
	$parsely_integrations->integrate();

	return $parsely_integrations;
}
