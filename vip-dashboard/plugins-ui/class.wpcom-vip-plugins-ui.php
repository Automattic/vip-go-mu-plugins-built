<?php

/**
 * Plugin Name: WordPress.com VIP Plugins
 * Plugin URI:  http://vip.wordpress.com/
 * Description: Provides an interface to manage the activation and deactivation of plugins on WordPress.com VIP.
 * Author:      Automattic
 * Author URI:  http://automattic.com/
 */

/**
 * Sets up and creates the VIP Plugins admin screens
 */
class WPCOM_VIP_Plugins_UI {
	/**
	 * @var string Option name containing the list of active plugins.
	 */
	const OPTION_ACTIVE_PLUGINS = 'wpcom_vip_active_plugins';

	/**
	 * @var string This plugin's menu slug.
	 */
	const MENU_SLUG = 'vip-plugins';

	/**
	 * @var string Action: Plugin activation.
	 */
	const ACTION_PLUGIN_ACTIVATE = 'wpcom-vip-plugins_activate';

	/**
	 * @var string Action: Plugin deactivation.
	 */
	const ACTION_PLUGIN_DEACTIVATE = 'wpcom-vip-plugins_deactivate';

	/**
	 * @var string Path to shared plugins directory, relative to WP_PLUGIN_DIR
	 */
	const SHARED_PLUGINS_RELATIVE_PATH = '/../mu-plugins/shared-plugins';

	/**
	 * @var string Whether or not to disable the plugin activation links.
	 */
	public $activation_disabled = false;

	/**
	 * @var string Path to the extra plugins folder.
	 */
	public $plugin_folder;

	/**
	 * @var string Required capability to access this plugin's features. Use the "wpcom_vip_plugins_ui_capability" filter to change this.
	 */
	public $capability = 'manage_options';

	/**
	 * @var string Parent menu's slug. Use the "wpcom_vip_plugins_ui_parent_menu_slug" filter to change this.
	 */
	public $parent_menu_slug = 'vip-dashboard';

	/**
	 * @var string The $hook_suffix value for the menu page.
	 */
	public $hook_suffix;

	/**
	 * @var array List of plugins that should be hidden.
	 */
	public $hidden_plugins = array();

	/**
	 * @var array List of Featured Partner Program plugins.
	 */
	public $fpp_plugins = array();

	/** Singleton *************************************************************/

	/**
	 * @var WPCOM_VIP_Plugins_UI Stores the instance of this class.
	 */
	private static $instance;

	/**
	 * Main WPCOM_VIP_Plugins_UI Instance
	 *
	 * Insures that only one instance of WPCOM_VIP_Plugins_UI exists in memory at any one time.
	 * Also prevents needing to define globals all over the place.
	 *
	 * @staticvar array $instance
	 * @uses WPCOM_VIP_Plugins_UI::setup_globals() Setup the globals needed
	 * @uses WPCOM_VIP_Plugins_UI::setup_actions() Setup the hooks and actions
	 * @see WPCOM_VIP_Plugins_UI()
	 * @return WPCOM_VIP_Plugins_UI The one true WPCOM_VIP_Plugins_UI
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new WPCOM_VIP_Plugins_UI();
			self::$instance->setup_globals();
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	/** Magic Methods *********************************************************/

	/**
	 * A dummy constructor to prevent WPCOM_VIP_Plugins_UI from being loaded more than once.
	 *
	 * @see WPCOM_VIP_Plugins_UI::instance()
	 * @see WPCOM_VIP_Plugins_UI();
	 */
	private function __construct() { /* Do nothing here */ }

	/**
	 * A dummy magic method to prevent WPCOM_VIP_Plugins_UI from being cloned
	 */
	public function __clone() { wp_die( __( 'Cheatin’ uh?' ) ); }

	/**
	 * A dummy magic method to prevent WPCOM_VIP_Plugins_UI from being unserialized
	 */
	public function __wakeup() { wp_die( __( 'Cheatin’ uh?' ) ); }

	/** Private Methods *******************************************************/

	/**
	 * Set up the class variables.
	 *
	 * @access private
	 */
	private function setup_globals() {
		$this->plugin_folder = WP_CONTENT_DIR . '/mu-plugins/shared-plugins';

		$this->hidden_plugins = array(
			'internacional', // Not ready yet (ever?)
			'wpcom-legacy-redirector', // requires code-level changes
			'maintenance-mode', // requires theme-level changes

			// Premium
			'new-device-notification',

			// Commercial non-FPP plugins. Available but not promoted.
			'disqus',
			'kapost-byline',
			'inform',
			'share-this-classic-wpcom',
			'share-this-wpcom',
			'five-min-video-suggest',
			'stipple',
			'brightcove',
			'lift-search',
			'msm-sitemap',
			'zemanta',
			'pushup',
			'livepress',
			'wp-discourse',

			// deprecated
			'breadcrumb-navxt', // use the newer version instead
			'daylife', // API doesn't work #36756-z
			'livefyre', // use livefyre3 instead
			'feedwordpress', // breaks all the time
			'wordtwit-1.3-mod', // use publicize
			'uppsite', // Retired from FPP but a couple VIPs still using it
			'wpcom-related-posts', // Now part of JP / WP.com
			'scrollkit-wp', // Scroll Kit shut down but still a few people with it activated
			'google-calendar-events', // https://viprequests.wordpress.com/2015/01/06/update-google-calendar-events-shared-plugin/
			'ice', // Crazy out-of-date, doesn't work with MCE 4+, still in use by a handful for some reason
			'the-attached-image', // Badness - was missing ton of escaping, not using the settings api
		);

		$this->fpp_plugins = array(
			'browsi'       => array(
				'name'        => 'Brow.si',
				'description' => 'Drive more engagement and better monetization on mobile web with Brow.si on your site.',
			),
			'chartbeat'     => array(
				'name'        => 'Chartbeat',
				'description' => 'Get a free trial to see your site\'s real-time data.',
			),
			'co-schedule'     => array(
				'name'        => 'CoSchedule',
				'description' => 'Plan awesome content. Save a bunch of time.',
			),
			'facebook'       => array(
				'name'        => 'Facebook',
				'description' => 'Make your WordPress site social in a few clicks, powered by Facebook.',
			),
			'findthebest'       => array(
				'name'        => 'FindTheBest',
				'description' => 'Add visual, interactive content that matches your post and
				boosts your credibility.',
			),
			'getty-images'       => array(
				'name'        => 'Getty Images',
				'description' => 'Search and use Getty Images photos in your posts without ever leaving WordPress.com.',
			),
			'janrain-capture' => array(
				'name'        => 'Janrain',
				'description' => 'User Registration and Social Integration for WordPress.com VIP.',
			),
			'jwplayer' => array(
				'name'        => 'JW Player',
				'description' => 'The World’s Most Popular Video Player.',
			),
			'livefyre-apps'   => array(
				'name'        => 'Livefyre',
				'description' => 'Replace comments with live conversations connected to the social web.',
			),
			'mediapass'     => array(
				'name'        => 'MediaPass Subscriptions',
				'description' => 'Monetize your content with recurring subscriptions made easy.',
			),
			'postrelease-vip'        => array(
				'name'        => 'Nativo',
				'description' => 'Unlock a premium revenue stream with native ads.',
			),
			'newscred'        => array(
				'name'        => 'NewsCred',
				'description' => 'Publish fully licensed, full text articles and images from 4,000+ of the world’s best news sources!',
			),
			'ooyala'        => array(
				'name'        => 'Ooyala',
				'description' => 'Upload, Search and Publish High Quality Video Across All Screens powered by Ooyala.',
			),
			'wp-parsely'        => array(
				'name'        => 'Parsely',
				'description' => 'Start a trial to finally see your audience clearly.',
			),
			'publishthis'        => array(
				'name'        => 'PublishThis',
				'description' => 'Rapidly discover, curate and publish fresh content on any topic into WordPress.',
			),
			'sailthru'    => array(
				'name'        => 'Sailthru for WordPress',
				'description' => 'Sailthru is the leading provider of personalized marketing communications.',
			),
			'simple-reach-analytics'    => array(
				'name'        => 'SimpleReach',
				'description' => 'Content ROI made simple.',
			),
			'skyword'    => array(
				'name'        => 'Skyword',
				'description' => 'Moving Stories. Forward.',
			),
			'socialflow'    => array(
				'name'        => 'SocialFlow',
				'description' => 'Get more readers and traffic from Twitter & Facebook with SocialFlow Optimized Publisher&trade;.',
			),
			'storify'    => array(
				'name'        => 'Storify',
				'description' => 'Easily add social media to every blog post with Storify.',
			),
			'thePlatform'   => array(
				'name' 		  => 'thePlatform',
				'description' => 'Easily publish and manage your videos in WordPress using thePlatform’s mpx.',
			),
			'tinypass'   => array(
				'name' 		  => 'Tinypass',
				'description' => 'Simple, powerful tools for subscriptions, paywalls, pay-per-view, and donations.',
			),
		);
	}

	/**
	 * Set up early action hooks for this plugin
	 *
	 * @access private
	 * @uses add_option() To register an option
	 * @uses add_action() To add various actions
	 */
	private function setup_actions() {
		add_option( self::OPTION_ACTIVE_PLUGINS, array() );

		// Loaded at priority 5 because all plugins are typically loaded before 'plugins_loaded'
		add_action( 'plugins_loaded', array( $this, 'include_active_plugins' ), 5 );

		add_action( 'init', array( $this, 'action_init' ) );
	}

	/** Public Hook Callback Methods ******************************************/

	/**
	 * Now that we've given the theme time to register its own filters,
	 * set up the rest of the plugin's hooks and run some filters.
	 *
	 * @uses add_action() To add various actions
	 */
	public function action_init() {
		// Allow people to customize what capability is required in order to view this menu
		$this->capability       = apply_filters( 'wpcom_vip_plugins_ui_capability',       $this->capability );

		// Controls where this menu is added
		$this->parent_menu_slug = apply_filters( 'wpcom_vip_plugins_ui_parent_menu_slug', $this->parent_menu_slug );

		// Allows hiding of certain plugins from the UI
		$this->hidden_plugins   = apply_filters( 'wpcom_vip_plugins_ui_hidden_plugins',   $this->hidden_plugins );

		add_action( 'admin_menu', array( $this, 'action_admin_menu_add_menu_item' ) );

		add_action( 'wpcom_vip_plugins_ui_menu_page', array( $this, 'cleanup_active_plugins_option' ) );

		add_action( 'admin_post_' . self::ACTION_PLUGIN_ACTIVATE, array( $this, 'action_admin_post_plugin_activate' ) );
		add_action( 'admin_post_' . self::ACTION_PLUGIN_DEACTIVATE, array( $this, 'action_admin_post_plugin_deactivate' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'action_enqueue_scripts' ) );
	}

	/**
	 * Includes any active plugin files that are enabled via the UI/option.
	 */
	public function include_active_plugins() {
		foreach ( $this->get_active_plugins_option() as $plugin ) {
			wpcom_vip_load_plugin( $plugin );
		}
	}

	/**
	 * Adds the new menu item and registers a few more hook callbacks relating to the menu page.
	 */
	public function action_admin_menu_add_menu_item() {
		if ( $this->parent_menu_slug == 'plugins.php' ) {
			$page_title = esc_html__( 'WordPress.com VIP Plugins', 'wpcom-vip-plugins-ui' );
			$menu_label = esc_html__( 'WP.com VIP Plugins', 'wpcom-vip-plugins-ui' );
		} else {
			$page_title = esc_html__( 'WordPress.com VIP Plugins & Services', 'wpcom-vip-plugins-ui' );
			$menu_label = esc_html__( 'Plugins', 'wpcom-vip-plugins-ui' );
		}
		$this->hook_suffix = add_menu_page( $page_title, $menu_label, $this->capability, 'vip-plugins', array( $this, 'display_menu_page' ), 'dashicons-admin-plugins', 64 );

		// This is required because WPCOM_VIP_Plugins_UI_List_Table() is defined inside of a function.
		add_filter( 'manage_' . $this->hook_suffix . '_columns', array( 'WPCOM_VIP_Plugins_UI', 'community_plugins_menu_columns' ) );
	}

	/**
	 * Load the assets for this plugin on the correct screen only
	 *
	 * @param  string $hook
	 * @return void
	 */
	public function action_enqueue_scripts( $hook ) {
		$vip_dashboard_plugin_file = __DIR__ . '/../vip-dashboard.php';

		// @todo Enqueue the bundled file
		wp_enqueue_style( 'wpcom-vip-plugins-ui', plugin_dir_url( $vip_dashboard_plugin_file ) . 'assets/css/plugins-ui.css' );
		wp_enqueue_script( 'wpcom-vip-plugins-ui', plugin_dir_url( $vip_dashboard_plugin_file ) . 'assets/js/plugins-ui.js' );
	}

	/**
	 * Handles the plugin activation links and activates the requested plugin.
	 */
	public function action_admin_post_plugin_activate() {
		if ( $this->activation_disabled )
			wp_die( __( 'Plugin activation via this UI has been disabled from within your theme.', 'wpcom-vip-plugins-ui' ) );

		if ( empty( $_GET['plugin'] ) )
			wp_die( sprintf( __( 'Missing %s parameter', 'wpcom-vip-plugins-ui' ), '<code>plugin</code>' ) );

		if ( ! current_user_can( $this->capability ) )
			wp_die( __( 'You do not have sufficient permissions to activate plugins for this site.' ) );

		$plugin_slug = sanitize_file_name( $_GET['plugin'] );
		$plugin_file = $plugin_slug . '/' . $plugin_slug . '.php';

		check_admin_referer( 'activate-' . $plugin_slug );

		if ( is_wp_error( $this->activate_plugin( $plugin_slug ) ) )
			wp_die( __( "Failed to activate plugin. Maybe it's already activated?", 'wpcom-vip-plugins-ui' ) );

		wp_safe_redirect( $this->get_menu_url( array( 'activated' => '1' ) ) );
		exit();
	}

	/**
	 * Handles the plugin deactivation links and deactivates the requested plugin.
	 */
	public function action_admin_post_plugin_deactivate() {
		if ( empty( $_GET['plugin'] ) )
			wp_die( sprintf( __( 'Missing %s parameter', 'wpcom-vip-plugins-ui' ), '<code>plugin</code>' ) );

		if ( ! current_user_can( $this->capability ) )
			wp_die( __( 'You do not have sufficient permissions to deactivate plugins for this site.' ) );

		$plugin_slug = sanitize_file_name( $_GET['plugin'] );
		$plugin_file = $plugin_slug . '/' . $plugin_slug . '.php';

		check_admin_referer( 'deactivate-' . $plugin_slug );

		// Note that core's deactivate_plugins() returns no value, so we _assume_
		// the deactivation worked
		$this->deactivate_plugin( $plugin_slug );

		wp_safe_redirect( $this->get_menu_url( array( 'deactivated' => '1' ) ) );
		exit();
	}

	/**
	 * Outputs the contents of the menu page.
	 */
	public function display_menu_page() {
		require_once( dirname( __FILE__ ) . '/class.wpcom-vip-plugins-ui-list-table.php' );
		require_once( dirname( __FILE__ ) . '/class.wpcom-vip-featured-plugins-ui-list-table.php' );

		do_action( 'wpcom_vip_plugins_ui_menu_page' );

		$fpp_table = new WPCOM_VIP_Featured_Plugins_List_Table();
		$fpp_table->prepare_items();

		// @todo replace with custom table
		$community_table = _get_list_table('WP_Plugins_List_Table');
		$community_table->prepare_items();

		$shared_table = new WPCOM_VIP_Plugins_UI_List_Table();
		$shared_table->prepare_items();

		if ( ! empty( $_GET['activated'] ) )
			add_settings_error( 'wpcom-vip-plugins-ui', 'wpcom-vip-plugins-activated', __( 'Plugin activated.', 'wpcom-vip-plugins-ui' ), 'updated' );
		elseif( ! empty( $_GET['deactivated'] ) )
			add_settings_error( 'wpcom-vip-plugins-ui', 'wpcom-vip-plugins-activated', __( 'Plugin deactivated.', 'wpcom-vip-plugins-ui' ), 'updated' );

?>
<div class="wrap">
	<?php screen_icon( 'plugins' ); ?>
	<h2><?php esc_html_e( 'WordPress.com VIP Plugins & Services', 'wpcom-vip-plugins-ui' ); ?></h2>

	<?php settings_errors( 'wpcom-vip-plugins-ui' ); ?>

	<main id="plugins" role="main">

		<?php $fpp_table->display(); ?>

		<?php $community_table->display(); ?>

		<?php $shared_table->display(); ?>

	</main>

</div>
<?php
	}

	/**
	 * Filters the columns of the Community Plugins table.
	 *
	 * @param array $columns An array of existing columns.
	 * @return array Modified list of columns.
	 */
	public static function community_plugins_menu_columns( $columns ) {
		// @todo support different labels for Shared vs Community plugins
		$columns['name'] = 'Plugins';
		$columns['description'] = '';

		return $columns;
	}

	/** Helper Functions ******************************************************/

	/**
	 * Gets the list of VIP plugins that have been activated via the UI.
	 *
	 * @return array List of active plugin slugs.
	 */
	public function get_active_plugins_option() {
		return (array) get_option( self::OPTION_ACTIVE_PLUGINS, array() );
	}

	/**
	 * Removes any invalid plugins from the option, i.e. when they're deleted.
	 */
	public function cleanup_active_plugins_option() {
		$active_plugins = $this->get_active_plugins_option();

		foreach ( $active_plugins as $active_plugin ) {
			if ( ! $this->validate_plugin( $active_plugin ) ) {
				$this->deactivate_plugin( $active_plugin, true );
			}
		}
	}

	/**
	 * Generates the URL to activate a VIP plugin.
	 *
	 * @param string $plugin The slug of the VIP plugin to activate.
	 * @return string Activation URL.
	 */
	public function get_plugin_activation_link( $plugin ) {
		return wp_nonce_url( admin_url( 'admin-post.php?action=' . self::ACTION_PLUGIN_ACTIVATE . '&plugin=' . urlencode( $plugin ) ), 'activate-' . $plugin );
	}

	/**
	 * Generates the URL to deactivate a VIP plugin.
	 *
	 * @param string $plugin The slug of the VIP plugin to deactivate.
	 * @return string Deactivation URL.
	 */
	public function get_plugin_deactivation_link( $plugin ) {
		return wp_nonce_url( admin_url( 'admin-post.php?action=' . self::ACTION_PLUGIN_DEACTIVATE . '&plugin=' . urlencode( $plugin ) ), 'deactivate-' . $plugin );
	}

	/**
	 * Determines if a given plugin slug is already activated or not.
	 *
	 * @param string $plugin The slug of the VIP plugin to check.
	 * @return string|bool "option" if the plugin was activated via UI, "manual" if activated via code, and false if not activated.
	 */
	public function is_plugin_active( $plugin ) {
		if ( in_array( $plugin, $this->get_active_plugins_option() ) )
			return 'option';
		elseif ( in_array( 'shared-plugins/' . $plugin, wpcom_vip_get_loaded_plugins() ) )
			return 'manual';
		else
			return false;
	}

	/**
	 * Filters an array of action links to add an activation or deactivation link.
	 *
	 * @param array $actions Existing actions.
	 * @param string $plugin Plugin slug to generate the link for.
	 * @return array List of actions, including the new one.
	 */
	public function add_activate_or_deactive_action_link( $actions, $plugin ) {
		$is_active = WPCOM_VIP_Plugins_UI()->is_plugin_active( $plugin );

		if ( $is_active ) {
			if ( 'option' == $is_active ) {
				$actions['deactivate'] = '<a href="' . esc_url( WPCOM_VIP_Plugins_UI()->get_plugin_deactivation_link( $plugin ) ) . '" title="' . esc_attr__( 'Deactivate this plugin' ) . '">' . __( 'Deactivate' ) . '</a>';
			} elseif ( 'manual' == $is_active ) {
				$actions['deactivate-manually'] = '<span title="To deactivate this particular plugin, edit your theme\'s functions.php file">' . __( "Enabled via your theme's code" ) . '</span>';
			}
		}

		// Only show activation links if they aren't disabled
		elseif ( ! $this->activation_disabled ) {
			$actions['activate'] = '<a href="' . esc_url( WPCOM_VIP_Plugins_UI()->get_plugin_activation_link( $plugin ) ) . '" title="' . esc_attr__( 'Activate this plugin' ) . '" class="edit">' . __( 'Activate' ) . '</a>';
		}

		return $actions;
	}

	/**
	 * Validates a plugin slug.
	 *
	 * @param string $plugin The slug of the VIP plugin to validate.
	 * @return bool True if valid, false if not.
	 */
	public function validate_plugin( $plugin ) {
		if ( 0 !== validate_file( $plugin ) ) {
			return false;
		}

		$shared_plugins = $this->get_shared_plugins();

		// The $plugin param passed here is just the slug - the plugin folder...
		// but $this->get_shared_plugins() returns an array of $plugin_file => info
		// The plugin files don't necessarily match their folder.
		foreach ( $shared_plugins as $plugin_file => $plugin_info ) {
			if ( $plugin === dirname( $plugin_file ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Activates a plugin.
	 *
	 * @param string $plugin The slug of the plugin to activate.
	 * @return bool|WP_Error True if the plugin was activated, a WP_Error if an error was encountered.
	 */
	public function activate_plugin( $plugin ) {
		if ( ! $this->validate_plugin( $plugin ) ) {
			return new WP_Error( 'activation', __( 'Invalid plugin' ) );
		}

		$plugins = $this->get_active_plugins_option();

		// Don't add it twice.
		if ( in_array( $plugin, $plugins, true ) ) {
			return new WP_Error( 'activation', __( 'Plugin already activated' ) );
		}

		$plugins[] = $plugin;

		do_action( 'wpcom_vip_plugins_ui_activate_plugin', $plugin );

		return update_option( self::OPTION_ACTIVE_PLUGINS, $plugins );
	}

	/**
	 * Deactivates a plugin.
	 *
	 * @param string $plugin The slug of the plugin to deactivate.
	 * @return void deactivate_plugins() returns nothing...so we can't actually know if it succeeded :)
	 */
	public function deactivate_plugin( $plugin, $force = false ) {
		if ( ! $force && ! $this->validate_plugin( $plugin ) ) {
			return false;
		}

		do_action( 'wpcom_vip_plugins_ui_deactivate_plugin', $plugin );

		$plugins = $this->get_active_plugins_option();

		if ( ! in_array( $plugin, $plugins, true ) ) {
			return false;
		}

		// Remove from array and re-index (just to stay clean).
		$plugins = array_values( array_diff( $plugins, array( $plugin ) ) );

		return update_option( self::OPTION_ACTIVE_PLUGINS, $plugins );
	}

	/**
	 * Generates a link to the plugin's menu page.
	 *
	 * @param array $extra_query_args Optional. Extra arguments to pass to add_query_arg().
	 * @return string URL to the plugin's menu page.
	 */
	public function get_menu_url( $extra_query_args = array() ) {
		$menu_url = ( 'plugins.php' === $this->parent_menu_slug ) ? 'plugins.php' : 'admin.php';

		$menu_url = add_query_arg(
			array_merge(
				array( 'page' => self::MENU_SLUG ),
				$extra_query_args
			),
			$menu_url
		);

		$menu_url = admin_url( $menu_url );

		return $menu_url;
	}

	/**
	 * Grab list of regular WP plugins
	 *
	 * @see get_plugins()
	 * @return array Array of plugins
	 */
	public function get_plugins() {
		return get_plugins();
	}

	/**
	 * Grab list of VIP Shared Plugins
	 *
	 * @see get_plugins()
	 * @return array Array of shared plugins
	 */
	public function get_shared_plugins() {
		return get_plugins( self::SHARED_PLUGINS_RELATIVE_PATH );
	}
}
