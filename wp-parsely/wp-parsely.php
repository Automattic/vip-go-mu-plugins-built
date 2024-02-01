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
 * Version:           3.13.3
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
use Parsely\Content_Helper\Excerpt_Generator;
use Parsely\Content_Helper\Post_List_Stats;
use Parsely\Endpoints\Analytics_Post_Detail_API_Proxy;
use Parsely\Endpoints\Analytics_Posts_API_Proxy;
use Parsely\Endpoints\ContentSuggestions\Suggest_Meta_Description_API_Proxy;
use Parsely\Endpoints\ContentSuggestions\Write_Title_API_Proxy;
use Parsely\Endpoints\GraphQL_Metadata;
use Parsely\Endpoints\Referrers_Post_Detail_API_Proxy;
use Parsely\Endpoints\Related_API_Proxy;
use Parsely\Endpoints\Rest_Metadata;
use Parsely\Endpoints\User_Meta\Dashboard_Widget_Settings_Endpoint;
use Parsely\Endpoints\User_Meta\Editor_Sidebar_Settings_Endpoint;
use Parsely\Integrations\Amp;
use Parsely\Integrations\Google_Web_Stories;
use Parsely\Integrations\Integrations;
use Parsely\RemoteAPI\Analytics_Post_Detail_API;
use Parsely\RemoteAPI\Analytics_Posts_API;
use Parsely\RemoteAPI\ContentSuggestions\Suggest_Meta_Description_API;
use Parsely\RemoteAPI\ContentSuggestions\Write_Title_API;
use Parsely\RemoteAPI\Referrers_Post_Detail_API;
use Parsely\RemoteAPI\Related_API;
use Parsely\RemoteAPI\Remote_API_Cache;
use Parsely\RemoteAPI\WordPress_Cache;
use Parsely\UI\Admin_Bar;
use Parsely\UI\Admin_Warning;
use Parsely\UI\Metadata_Renderer;
use Parsely\UI\Network_Admin_Sites_List;
use Parsely\UI\Plugins_Actions;
use Parsely\UI\Recommended_Widget;
use Parsely\UI\Row_Actions;
use Parsely\UI\Settings_Page;
use Parsely\UI\Site_Health;

require_once __DIR__ . '/src/Utils/utils.php';

if ( class_exists( Parsely::class ) ) {
	return;
}

const PARSELY_VERSION = '3.13.3';
const PARSELY_FILE    = __FILE__;

require_once __DIR__ . '/src/class-parsely.php';
require_once __DIR__ . '/src/class-scripts.php';
require_once __DIR__ . '/src/class-dashboard-link.php';
require_once __DIR__ . '/src/class-validator.php';
require_once __DIR__ . '/src/UI/class-admin-bar.php';
require_once __DIR__ . '/src/UI/class-metadata-renderer.php';
require_once __DIR__ . '/src/Endpoints/class-metadata-endpoint.php';
require_once __DIR__ . '/src/Endpoints/class-graphql-metadata.php';
require_once __DIR__ . '/src/Telemetry/telemetry-init.php';

require_once __DIR__ . '/src/class-metadata.php';
require_once __DIR__ . '/src/Metadata/class-metadata-builder.php';
require_once __DIR__ . '/src/Metadata/class-author-archive-builder.php';
require_once __DIR__ . '/src/Metadata/class-category-builder.php';
require_once __DIR__ . '/src/Metadata/class-date-builder.php';
require_once __DIR__ . '/src/Metadata/class-front-page-builder.php';
require_once __DIR__ . '/src/Metadata/class-page-builder.php';
require_once __DIR__ . '/src/Metadata/class-page-for-posts-builder.php';
require_once __DIR__ . '/src/Metadata/class-paginated-front-page-builder.php';
require_once __DIR__ . '/src/Metadata/class-post-builder.php';
require_once __DIR__ . '/src/Metadata/class-tag-builder.php';

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

require_once __DIR__ . '/src/content-helper/common/class-content-helper-feature.php';
require_once __DIR__ . '/src/content-helper/post-list-stats/class-post-list-stats.php';
require_once __DIR__ . '/src/UI/class-admin-warning.php';
require_once __DIR__ . '/src/UI/class-plugins-actions.php';
require_once __DIR__ . '/src/UI/class-row-actions.php';
require_once __DIR__ . '/src/UI/class-site-health.php';
require_once __DIR__ . '/src/content-helper/dashboard-widget/class-dashboard-widget.php';

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

require_once __DIR__ . '/src/UI/class-settings-page.php';
require_once __DIR__ . '/src/UI/class-network-admin-sites-list.php';

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
}

// Endpoint base classes.
require_once __DIR__ . '/src/Endpoints/class-base-endpoint.php';
require_once __DIR__ . '/src/Endpoints/class-base-api-proxy.php';
require_once __DIR__ . '/src/Endpoints/user-meta/class-base-endpoint-user-meta.php';

// Endpoint classes.
require_once __DIR__ . '/src/Endpoints/class-analytics-post-detail-api-proxy.php';
require_once __DIR__ . '/src/Endpoints/class-analytics-posts-api-proxy.php';
require_once __DIR__ . '/src/Endpoints/class-referrers-post-detail-api-proxy.php';
require_once __DIR__ . '/src/Endpoints/class-related-api-proxy.php';
require_once __DIR__ . '/src/Endpoints/class-rest-metadata.php';
require_once __DIR__ . '/src/Endpoints/content-suggestions/class-suggest-meta-description-api-proxy.php';
require_once __DIR__ . '/src/Endpoints/content-suggestions/class-write-title-api-proxy.php';
require_once __DIR__ . '/src/Endpoints/user-meta/class-dashboard-widget-settings-endpoint.php';
require_once __DIR__ . '/src/Endpoints/user-meta/class-editor-sidebar-settings-endpoint.php';

// RemoteAPI base classes.
require_once __DIR__ . '/src/RemoteAPI/interface-cache.php';
require_once __DIR__ . '/src/RemoteAPI/interface-remote-api.php';
require_once __DIR__ . '/src/RemoteAPI/class-remote-api-cache.php';
require_once __DIR__ . '/src/RemoteAPI/class-wordpress-cache.php';
require_once __DIR__ . '/src/RemoteAPI/class-base-endpoint-remote.php';
require_once __DIR__ . '/src/RemoteAPI/content-suggestions/class-content-suggestions-base-api.php';

// RemoteAPI classes.
require_once __DIR__ . '/src/RemoteAPI/class-analytics-post-detail-api.php';
require_once __DIR__ . '/src/RemoteAPI/class-analytics-posts-api.php';
require_once __DIR__ . '/src/RemoteAPI/class-referrers-post-detail-api.php';
require_once __DIR__ . '/src/RemoteAPI/class-related-api.php';
require_once __DIR__ . '/src/RemoteAPI/class-validate-api.php';
require_once __DIR__ . '/src/RemoteAPI/content-suggestions/class-suggest-meta-description-api.php';
require_once __DIR__ . '/src/RemoteAPI/content-suggestions/class-write-title-api.php';

add_action( 'rest_api_init', __NAMESPACE__ . '\\parsely_rest_api_init' );
/**
 * Registers REST Endpoints that act as a proxy to the Parse.ly API.
 * This is needed to get around CORS issues with Firefox.
 *
 * @since 3.2.0
 */
function parsely_rest_api_init(): void {
	$wp_cache = new WordPress_Cache();
	$rest     = new Rest_Metadata( $GLOBALS['parsely'] );
	$rest->run();

	// Content Helper settings endpoints.
	( new Dashboard_Widget_Settings_Endpoint( $GLOBALS['parsely'] ) )->run();
	( new Editor_Sidebar_Settings_Endpoint( $GLOBALS['parsely'] ) )->run();

	parsely_run_rest_api_endpoint(
		Related_API::class,
		Related_API_Proxy::class,
		$wp_cache
	);

	parsely_run_rest_api_endpoint(
		Analytics_Posts_API::class,
		Analytics_Posts_API_Proxy::class,
		$wp_cache
	);

	parsely_run_rest_api_endpoint(
		Analytics_Post_Detail_API::class,
		Analytics_Post_Detail_API_Proxy::class,
		$wp_cache
	);

	parsely_run_rest_api_endpoint(
		Referrers_Post_Detail_API::class,
		Referrers_Post_Detail_API_Proxy::class,
		$wp_cache
	);

	parsely_run_rest_api_endpoint(
		Write_Title_API::class,
		Write_Title_API_Proxy::class,
		$wp_cache
	);

	parsely_run_rest_api_endpoint(
		Suggest_Meta_Description_API::class,
		Suggest_Meta_Description_API_Proxy::class,
		$wp_cache
	);
}

require_once __DIR__ . '/src/blocks/recommendations/class-recommendations-block.php';

add_action( 'init', __NAMESPACE__ . '\\init_recommendations_block' );
/**
 * Registers the Recommendations Block.
 */
function init_recommendations_block(): void {
	$recommendations_block = new Recommendations_Block();
	$recommendations_block->run();
}

require_once __DIR__ . '/src/content-helper/editor-sidebar/class-editor-sidebar.php';

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\init_content_helper_editor_sidebar' );
/**
 * Inserts the PCH Editor Sidebar.
 *
 * @since 3.5.0 Moved from Parsely\Scripts\enqueue_block_editor_assets().
 * @since 3.9.0 Renamed from init_content_helper().
 */
function init_content_helper_editor_sidebar(): void {
	( new Editor_Sidebar( $GLOBALS['parsely'] ) )->run();
}

require_once __DIR__ . '/src/content-helper/excerpt-generator/class-excerpt-generator.php';

// The priority of 9 is used to ensure that the Excerpt Generator is loaded before the PCH Editor Sidebar (10).
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\init_content_helper_excerpt_generator', 9 );
/**
 * Initializes and inserts the PCH Excerpt Generator.
 *
 * @since 3.13.0
 */
function init_content_helper_excerpt_generator(): void {
	( new Excerpt_Generator( $GLOBALS['parsely'] ) )->run();
}

require_once __DIR__ . '/src/UI/class-recommended-widget.php';

add_action( 'widgets_init', __NAMESPACE__ . '\\parsely_recommended_widget_register' );
/**
 * Registers the Parse.ly Recommended widget.
 */
function parsely_recommended_widget_register(): void {
	register_widget( new Recommended_Widget( $GLOBALS['parsely'] ) );
}

require_once __DIR__ . '/src/Integrations/class-integration.php';
require_once __DIR__ . '/src/Integrations/class-integrations.php';
require_once __DIR__ . '/src/Integrations/class-amp.php';
require_once __DIR__ . '/src/Integrations/class-google-web-stories.php';

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

/**
 * Instantiates and runs the specified API endpoint.
 *
 * @since 3.6.0
 *
 * @param string          $api_class_name The proxy class to instantiate.
 * @param string          $proxy_api_class_name The API proxy class to instantiate and run.
 * @param WordPress_Cache $wp_cache The WordPress cache instance to be used.
 */
function parsely_run_rest_api_endpoint(
	string $api_class_name,
	string $proxy_api_class_name,
	WordPress_Cache &$wp_cache
): void {
	/**
	 * Internal Variable.
	 *
	 * @var RemoteAPI\Base_Endpoint_Remote
	 */
	$remote_api       = new $api_class_name( $GLOBALS['parsely'] );
	$remote_api_cache = new Remote_API_Cache( $remote_api, $wp_cache );

	/**
	 * Internal Variable.
	 *
	 * @var Endpoints\Base_API_Proxy
	 */
	$remote_api_proxy = new $proxy_api_class_name( $GLOBALS['parsely'], $remote_api_cache );
	$remote_api_proxy->run();
}
