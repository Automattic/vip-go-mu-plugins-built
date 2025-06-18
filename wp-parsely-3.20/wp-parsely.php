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
 * Version:           3.20.0
 * Author:            Parse.ly
 * Author URI:        https://www.parse.ly
 * Text Domain:       wp-parsely
 * License:           GPL-2.0-or-later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * GitHub Plugin URI: https://github.com/Parsely/wp-parsely
 * Requires PHP:      7.4
 * Requires WP:       6.0.0
 */

declare(strict_types=1);

namespace Parsely;

use Parsely\Content_Helper\Dashboard_Widget;
use Parsely\Content_Helper\Editor_Sidebar;
use Parsely\Content_Helper\Post_List_Stats;
use Parsely\Endpoints\GraphQL_Metadata;
use Parsely\Endpoints\Rest_Metadata;
use Parsely\Integrations\Amp;
use Parsely\Integrations\Google_Web_Stories;
use Parsely\Integrations\Integrations;
use Parsely\UI\Admin_Bar;
use Parsely\UI\Admin_Warning;
use Parsely\UI\Dashboard_Page;
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

const PARSELY_VERSION             = '3.20.0';
const PARSELY_FILE                = __FILE__;
const PARSELY_DATA_SCHEMA_VERSION = '1';
const PARSELY_CACHE_GROUP         = 'wp-parsely';

if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

// Load Telemetry classes.
require_once __DIR__ . '/src/Telemetry/telemetry-init.php';

/**
 * Gets the Parsely object.
 *
 * @since 3.19.0
 *
 * @return Parsely The Parsely object.
 */
function get_parsely(): Parsely {
	if ( ! isset( $GLOBALS['parsely'] ) ) {
		$GLOBALS['parsely'] = new Parsely();
	}

	return $GLOBALS['parsely'];
}

add_action( 'plugins_loaded', __NAMESPACE__ . '\\parsely_initialize_plugin' );
/**
 * Registers the basic classes to initialize the plugin.
 */
function parsely_initialize_plugin(): void {
	$parsely = get_parsely();
	$parsely->run();

	if ( class_exists( 'WPGraphQL' ) ) {
		$graphql = new GraphQL_Metadata( $parsely );
		$graphql->run();
	}

	$scripts = new Scripts( $parsely );
	$scripts->run();

	$admin_bar = new Admin_Bar( $parsely );
	$admin_bar->run();

	$metadata_renderer = new Metadata_Renderer( $parsely );
	$metadata_renderer->run();
}

add_action( 'admin_init', __NAMESPACE__ . '\\parsely_admin_init_register' );
/**
 * Registers the Parse.ly wp-admin warnings, plugin actions and row actions.
 */
function parsely_admin_init_register(): void {
	$parsely = get_parsely();

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
	$parsely = get_parsely();

	// Plugin dashboard page.
	$GLOBALS['parsely_dashboard_page'] = new Dashboard_Page( $parsely );
	$GLOBALS['parsely_dashboard_page']->run();

	// Plugin settings page.
	$GLOBALS['parsely_settings_page'] = new Settings_Page( $parsely );
	$GLOBALS['parsely_settings_page']->run();

	$network_admin_sites_list = new Network_Admin_Sites_List( $parsely );
	$network_admin_sites_list->run();

	// Initialize the REST API Controller.
	$rest_api_controller = $parsely->get_rest_api_controller();
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
	$parsely = get_parsely();

	$rest = new Rest_Metadata( $parsely );
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
		$parsely = get_parsely();

		$GLOBALS['parsely_editor_sidebar'] = new Editor_Sidebar( $parsely );
		$GLOBALS['parsely_editor_sidebar']->init_features();
	}
}

add_action( 'widgets_init', __NAMESPACE__ . '\\parsely_recommended_widget_register' );
/**
 * Registers the Parse.ly Recommended widget.
 */
function parsely_recommended_widget_register(): void {
	$parsely = get_parsely();

	register_widget( new Recommended_Widget( $parsely ) );
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
		$parsely = get_parsely();
	}

	$parsely_integrations = new Integrations( $parsely );
	$parsely_integrations->register( 'amp', Amp::class );
	$parsely_integrations->register( 'webstories', Google_Web_Stories::class );
	$parsely_integrations = apply_filters( 'wp_parsely_add_integration', $parsely_integrations );
	$parsely_integrations->integrate();

	return $parsely_integrations;
}

add_action( 'admin_init', __NAMESPACE__ . '\\parsely_check_data_schema_updates', 999 );
/**
 * Checks and performs any data schema updates.
 *
 * @since 3.19.0 Handles the update from schema version 0 to 1.
 */
function parsely_check_data_schema_updates(): void {
	$current_data_schema_version = get_option( 'parsely_data_schema_version' );

	if ( false === $current_data_schema_version ) {
		$current_data_schema_version = 0;
	}

	if ( PARSELY_DATA_SCHEMA_VERSION <= $current_data_schema_version ) {
		return;
	}

	/**
	 * Updates the smart links to have the Smart Link Status terms,
	 * and checks the _smart_link_applied meta, if it exists.
	 *
	 * Schema version 1.
	 *
	 * @since 3.19.0
	 */
	if ( 0 === $current_data_schema_version ) {
		// Get all the smart links that do not have any Smart Link Status terms.
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.get_posts_get_posts
		$smart_links_without_status = get_posts(
			array(
				'post_type'      => 'parsely_smart_link',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				'tax_query'      => array(
					array(
						'taxonomy' => 'smart_link_status',
						'field'    => 'name',
						'terms'    => \Parsely\Models\Smart_Link_Status::get_all_statuses(),
						'operator' => 'NOT IN',
					),
				),
			)
		);

		if ( count( $smart_links_without_status ) === 0 ) {
			update_option( 'parsely_data_schema_version', PARSELY_DATA_SCHEMA_VERSION );
			return;
		}

		// Loop through the smart links and update them to have the Smart Link Status terms.
		foreach ( $smart_links_without_status as $post_id ) {
			$smart_link = \Parsely\Models\Smart_Link::get_smart_link_by_id( intval( $post_id ) );

			if ( false === $smart_link ) {
				continue;
			}

			$meta_exists = metadata_exists( 'post', $post_id, '_smart_link_applied' );

			// If there is no meta, it means that the smart link is considered applied,
			// for backwards compatibility with Parse.ly < 3.18.0.
			if ( ! $meta_exists ) {
				$smart_link->set_status( \Parsely\Models\Smart_Link_Status::APPLIED, true );
				continue;
			}

			// Get the value of the _smart_link_applied meta.
			$meta_value = get_post_meta( $post_id, '_smart_link_applied', true );

			// If the meta value is true, then the smart link is considered applied.
			if ( 'true' === $meta_value || true === $meta_value ) {
				$smart_link->set_status( \Parsely\Models\Smart_Link_Status::APPLIED, true );
			} else {
				// If the meta value is not true, then the smart link is considered pending.
				$smart_link->set_status( \Parsely\Models\Smart_Link_Status::PENDING, true );
			}

			// Flush the cache for the smart link.
			$smart_link->flush_all_cache();
		}

		update_option( 'parsely_data_schema_version', PARSELY_DATA_SCHEMA_VERSION );
	}
}
