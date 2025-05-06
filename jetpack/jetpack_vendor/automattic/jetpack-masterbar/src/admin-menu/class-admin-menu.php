<?php
/**
 * Admin Menu file.
 *
 * @package automattic/jetpack-masterbar
 */

namespace Automattic\Jetpack\Masterbar;

use Automattic\Jetpack\Assets;
use Automattic\Jetpack\Assets\Logo;
use Automattic\Jetpack\Redirect;

require_once __DIR__ . '/class-base-admin-menu.php';

/**
 * Class Admin_Menu.
 */
class Admin_Menu extends Base_Admin_Menu {

	/**
	 * Create the desired menu output.
	 */
	public function reregister_menu_items() {
		// Remove separators.
		remove_menu_page( 'separator1' );
		$this->add_stats_menu();
		$this->add_upgrades_menu();
		$this->add_posts_menu();
		$this->add_media_menu();
		$this->add_page_menu();
		$this->add_testimonials_menu();
		$this->add_portfolio_menu();
		$this->add_comments_menu();
		$this->add_appearance_menu();
		$this->add_plugins_menu();
		$this->add_users_menu();
		$this->add_tools_menu();
		$this->add_options_menu();
		$this->add_jetpack_menu();

		// Remove Links Manager menu since its usage is discouraged. https://github.com/Automattic/wp-calypso/issues/51188.
		// @see https://core.trac.wordpress.org/ticket/21307#comment:73.
		if ( $this->should_disable_links_manager() ) {
			remove_menu_page( 'link-manager.php' );
		}

		ksort( $GLOBALS['menu'] );
	}

	/**
	 * Get the preferred view for the given screen.
	 *
	 * @param string $screen Screen identifier.
	 * @param bool   $fallback_global_preference (Optional) Whether the global preference for all screens should be used
	 *                                           as fallback if there is no specific preference for the given screen.
	 *                                           Default: true.
	 * @return string
	 */
	public function get_preferred_view( $screen, $fallback_global_preference = true ) {
		$force_default_view = in_array( $screen, array( 'users.php', 'options-general.php' ), true );
		$use_wp_admin       = $this->use_wp_admin_interface();

		// When no preferred view has been set for "Users > All Users" or "Settings > General", keep the previous
		// behavior that forced the default view regardless of the global preference.
		// This behavior is overriden by the wpcom_admin_interface option when it is set to wp-admin.
		if ( ! $use_wp_admin && $fallback_global_preference && $force_default_view ) {
			$preferred_view = parent::get_preferred_view( $screen, false );
			if ( self::UNKNOWN_VIEW === $preferred_view ) {
				return self::DEFAULT_VIEW;
			}
			return $preferred_view;
		}

		return parent::get_preferred_view( $screen, $fallback_global_preference );
	}

	/**
	 * Check if Links Manager is being used.
	 */
	public function should_disable_links_manager() {
		// The max ID number of the auto-generated links.
		// See /wp-content/mu-plugins/wpcom-wp-install-defaults.php in WP.com.
		$max_default_id = 10;

		// We are only checking the latest entry link_id so are limiting the query to 1.
		$link_manager_links = get_bookmarks(
			array(
				'orderby'        => 'link_id',
				'order'          => 'DESC',
				'limit'          => 1,
				'hide_invisible' => 0,
			)
		);

		// Ordered links by ID descending, check if the first ID is more than $max_default_id.
		if ( is_countable( $link_manager_links ) && count( $link_manager_links ) > 0 && $link_manager_links[0]->link_id > $max_default_id ) {
			return false;
		}

		return true;
	}

	/**
	 * Adds My Home menu.
	 */
	public function add_my_home_menu() {

		if ( self::DEFAULT_VIEW !== $this->get_preferred_view( 'index.php' ) ) {
			// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
			add_menu_page( __( 'My Home', 'jetpack-masterbar' ), __( 'My Home', 'jetpack-masterbar' ), 'read', 'https://wordpress.com/home/' . $this->domain, null, 'dashicons-admin-home', 1.5 );
			return;
		}

		$this->update_menu( 'index.php', 'https://wordpress.com/home/' . $this->domain, __( 'My Home', 'jetpack-masterbar' ), 'read', 'dashicons-admin-home' );
	}

	/**
	 * Adds My Mailboxes menu.
	 */
	public function add_my_mailboxes_menu() {
		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_menu_page( __( 'My Mailboxes', 'jetpack-masterbar' ), __( 'My Mailboxes', 'jetpack-masterbar' ), 'manage_options', 'https://wordpress.com/mailboxes/' . $this->domain, null, 'dashicons-email', 4.64424 );
	}

	/**
	 * Adds Stats menu.
	 */
	public function add_stats_menu() {
		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_menu_page( __( 'Stats', 'jetpack-masterbar' ), __( 'Stats', 'jetpack-masterbar' ), 'view_stats', 'https://wordpress.com/stats/day/' . $this->domain, null, 'dashicons-chart-bar', 3 );
	}

	/**
	 * Adds Upgrades menu.
	 *
	 * @param string $plan The current WPCOM plan of the blog.
	 */
	public function add_upgrades_menu( $plan = null ) {
		global $menu;

		$menu_exists = false;
		foreach ( $menu as $item ) {
			if ( 'paid-upgrades.php' === $item[2] ) {
				$menu_exists = true;
				break;
			}
		}

		if ( ! $menu_exists ) {
			if ( $plan ) {
				// Add display:none as a default for cases when CSS is not loaded.
				$site_upgrades = '%1$s<span class="inline-text" style="display:none">%2$s</span>';
				$site_upgrades = sprintf(
					$site_upgrades,
					__( 'Upgrades', 'jetpack-masterbar' ),
					// phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
					__( $plan, 'jetpack-masterbar' )
				);
			} else {
				$site_upgrades = __( 'Upgrades', 'jetpack-masterbar' );
			}
			// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
			add_menu_page( __( 'Upgrades', 'jetpack-masterbar' ), $site_upgrades, 'manage_options', 'paid-upgrades.php', null, 'dashicons-cart', 4 );
		}
		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_submenu_page( 'paid-upgrades.php', __( 'Plans', 'jetpack-masterbar' ), __( 'Plans', 'jetpack-masterbar' ), 'manage_options', 'https://wordpress.com/plans/' . $this->domain, null, 1 );
		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_submenu_page( 'paid-upgrades.php', __( 'Purchases', 'jetpack-masterbar' ), __( 'Purchases', 'jetpack-masterbar' ), 'manage_options', 'https://wordpress.com/purchases/subscriptions/' . $this->domain, null, 2 );

		if ( ! $menu_exists ) {
			// Remove the submenu auto-created by Core.
			$this->hide_submenu_page( 'paid-upgrades.php', 'paid-upgrades.php' );
		}
	}

	/**
	 * Adds Posts menu.
	 */
	public function add_posts_menu() {
		$submenus_to_update = array();

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'edit.php' ) ) {
			$submenus_to_update['edit.php']     = 'https://wordpress.com/posts/' . $this->domain;
			$submenus_to_update['post-new.php'] = 'https://wordpress.com/post/' . $this->domain;
			$this->update_submenus( 'edit.php', $submenus_to_update );
		}

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'edit-tags.php?taxonomy=category' ) ) {
			$this->update_submenus( 'edit.php', array( 'edit-tags.php?taxonomy=category' => 'https://wordpress.com/settings/taxonomies/category/' . $this->domain ) );
		}

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'edit-tags.php?taxonomy=post_tag' ) ) {
			$this->update_submenus( 'edit.php', array( 'edit-tags.php?taxonomy=post_tag' => 'https://wordpress.com/settings/taxonomies/post_tag/' . $this->domain ) );
		}
	}

	/**
	 * Adds Media menu.
	 */
	public function add_media_menu() {
		if ( self::CLASSIC_VIEW === $this->get_preferred_view( 'upload.php' ) ) {
			return;
		}

		$this->hide_submenu_page( 'upload.php', 'media-new.php' );

		$this->update_menu( 'upload.php', 'https://wordpress.com/media/' . $this->domain );
	}

	/**
	 * Adds Page menu.
	 */
	public function add_page_menu() {
		if ( self::CLASSIC_VIEW === $this->get_preferred_view( 'edit.php?post_type=page' ) ) {
			return;
		}

		$submenus_to_update = array(
			'edit.php?post_type=page'     => 'https://wordpress.com/pages/' . $this->domain,
			'post-new.php?post_type=page' => 'https://wordpress.com/page/' . $this->domain,
		);
		$this->update_submenus( 'edit.php?post_type=page', $submenus_to_update );
	}

	/**
	 * Adds Testimonials menu.
	 */
	public function add_testimonials_menu() {
		$this->add_custom_post_type_menu( 'jetpack-testimonial' );
	}

	/**
	 * Adds Portfolio menu.
	 */
	public function add_portfolio_menu() {
		$this->add_custom_post_type_menu( 'jetpack-portfolio' );
	}

	/**
	 * Adds a custom post type menu.
	 *
	 * @param string $post_type Custom post type.
	 */
	public function add_custom_post_type_menu( $post_type ) {
		if ( self::CLASSIC_VIEW === $this->get_preferred_view( 'edit.php?post_type=' . $post_type ) ) {
			return;
		}

		$submenus_to_update = array(
			'edit.php?post_type=' . $post_type     => 'https://wordpress.com/types/' . $post_type . '/' . $this->domain,
			'post-new.php?post_type=' . $post_type => 'https://wordpress.com/edit/' . $post_type . '/' . $this->domain,
		);
		$this->update_submenus( 'edit.php?post_type=' . $post_type, $submenus_to_update );
	}

	/**
	 * Adds Comments menu.
	 */
	public function add_comments_menu() {
		if ( self::CLASSIC_VIEW === $this->get_preferred_view( 'edit-comments.php' ) ) {
			return;
		}

		$this->update_menu( 'edit-comments.php', 'https://wordpress.com/comments/all/' . $this->domain );
	}

	/**
	 * Adds Appearance menu.
	 *
	 * @return string The Customizer URL.
	 */
	public function add_appearance_menu() {
		$request_uri                     = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		$default_customize_slug          = add_query_arg( 'return', rawurlencode( remove_query_arg( wp_removable_query_args(), $request_uri ) ), 'customize.php' );
		$default_customize_header_slug_1 = add_query_arg( array( 'autofocus' => array( 'control' => 'header_image' ) ), $default_customize_slug );
		// TODO: Remove WPCom_Theme_Customizer::modify_header_menu_links() and WPcom_Custom_Header::modify_admin_menu_links().
		$default_customize_header_slug_2     = admin_url( 'themes.php?page=custom-header' );
		$default_customize_background_slug_1 = add_query_arg( array( 'autofocus' => array( 'control' => 'background_image' ) ), $default_customize_slug );
		// TODO: Remove Colors_Manager::modify_header_menu_links() and Colors_Manager_Common::modify_header_menu_links().
		$default_customize_background_slug_2 = add_query_arg( array( 'autofocus' => array( 'section' => 'colors_manager_tool' ) ), admin_url( 'customize.php' ) );

		if ( $this->is_api_request ) {
			// In case this is an api request we will have to add the 'return' querystring via JS.
			$customize_url = 'customize.php';
		} else {
			$customize_url = $default_customize_slug;
		}

		$submenus_to_update = array(
			$default_customize_slug              => $customize_url,
			$default_customize_header_slug_1     => add_query_arg( array( 'autofocus' => array( 'control' => 'header_image' ) ), $customize_url ),
			$default_customize_header_slug_2     => add_query_arg( array( 'autofocus' => array( 'control' => 'header_image' ) ), $customize_url ),
			$default_customize_background_slug_1 => add_query_arg( array( 'autofocus' => array( 'section' => 'colors_manager_tool' ) ), $customize_url ),
			$default_customize_background_slug_2 => add_query_arg( array( 'autofocus' => array( 'section' => 'colors_manager_tool' ) ), $customize_url ),
		);

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'themes.php' ) ) {
			$submenus_to_update['themes.php'] = 'https://wordpress.com/themes/' . $this->domain;
		}

		$this->update_submenus( 'themes.php', $submenus_to_update );

		$this->hide_submenu_page( 'themes.php', 'custom-header' );
		$this->hide_submenu_page( 'themes.php', 'custom-background' );

		return $customize_url;
	}

	/**
	 * Adds Plugins menu.
	 */
	public function add_plugins_menu() {
		if ( self::CLASSIC_VIEW === $this->get_preferred_view( 'plugins.php' ) ) {
			return;
		}
		$this->hide_submenu_page( 'plugins.php', 'plugin-install.php' );
		$this->hide_submenu_page( 'plugins.php', 'plugin-editor.php' );

		$this->update_menu( 'plugins.php', 'https://wordpress.com/plugins/' . $this->domain );
	}

	/**
	 * Adds Users menu.
	 */
	public function add_users_menu() {
		$submenus_to_update = array(
			'profile.php' => 'https://wordpress.com/me',
		);

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'users.php' ) ) {
			$submenus_to_update['users.php']    = 'https://wordpress.com/people/team/' . $this->domain;
			$submenus_to_update['user-new.php'] = 'https://wordpress.com/people/new/' . $this->domain;
		}

		$slug = current_user_can( 'list_users' ) ? 'users.php' : 'profile.php';
		$this->update_submenus( $slug, $submenus_to_update );
		add_submenu_page( $slug, esc_attr__( 'Account Settings', 'jetpack-masterbar' ), __( 'Account Settings', 'jetpack-masterbar' ), 'read', 'https://wordpress.com/me/account' );
	}

	/**
	 * Adds Tools menu.
	 */
	public function add_tools_menu() {
		$submenus_to_update = array();
		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'import.php' ) ) {
			$submenus_to_update['import.php'] = 'https://wordpress.com/import/' . $this->domain;
		}
		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'export.php' ) ) {
			$submenus_to_update['export.php'] = 'https://wordpress.com/export/' . $this->domain;
		}
		$this->update_submenus( 'tools.php', $submenus_to_update );

		$this->hide_submenu_page( 'tools.php', 'tools.php' );
		$this->hide_submenu_page( 'tools.php', 'delete-blog' );

		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_submenu_page( 'tools.php', esc_attr__( 'Marketing', 'jetpack-masterbar' ), __( 'Marketing', 'jetpack-masterbar' ), 'publish_posts', 'https://wordpress.com/marketing/tools/' . $this->domain, null, 0 );
		if ( ! $this->use_wp_admin_interface() ) {
			// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
			add_submenu_page( 'tools.php', esc_attr__( 'Monetize', 'jetpack-masterbar' ), __( 'Monetize', 'jetpack-masterbar' ), 'manage_options', 'https://wordpress.com/earn/' . $this->domain, null, 1 );
		}
	}

	/**
	 * Adds Settings menu.
	 */
	public function add_options_menu() {
		$submenus_to_update = array();

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'options-general.php' ) ) {
			$this->hide_submenu_page( 'options-general.php', 'sharing' );
		}

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'options-general.php' ) ) {
			$submenus_to_update['options-general.php'] = 'https://wordpress.com/settings/general/' . $this->domain;
		}

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'options-writing.php' ) ) {
			$submenus_to_update['options-writing.php'] = 'https://wordpress.com/settings/writing/' . $this->domain;
		}

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'options-reading.php' )
		) {
			$submenus_to_update['options-reading.php'] = 'https://wordpress.com/settings/reading/' . $this->domain;
		}

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'options-discussion.php' ) ) {
			$submenus_to_update['options-discussion.php'] = 'https://wordpress.com/settings/discussion/' . $this->domain;
		}

		$this->update_submenus( 'options-general.php', $submenus_to_update );

		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_submenu_page( 'options-general.php', esc_attr__( 'Newsletter', 'jetpack-masterbar' ), __( 'Newsletter', 'jetpack-masterbar' ), 'manage_options', 'https://wordpress.com/settings/newsletter/' . $this->domain, null, 7 );
		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_submenu_page( 'options-general.php', esc_attr__( 'Podcasting', 'jetpack-masterbar' ), __( 'Podcasting', 'jetpack-masterbar' ), 'manage_options', 'https://wordpress.com/settings/podcasting/' . $this->domain, null, 8 );
	}

	/**
	 * Create Jetpack menu.
	 *
	 * @param int  $position  Menu position.
	 * @param bool $separator Whether to add a separator before the menu.
	 */
	public function create_jetpack_menu( $position = 50, $separator = true ) {
		if ( $separator ) {
			$this->add_admin_menu_separator( $position, 'manage_options' );
			++$position;
		}

		$icon            = ( new Logo() )->get_base64_logo();
		$is_menu_updated = $this->update_menu( 'jetpack', null, null, null, $icon, $position );
		if ( ! $is_menu_updated ) {
			// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
			add_menu_page( esc_attr__( 'Jetpack', 'jetpack-masterbar' ), __( 'Jetpack', 'jetpack-masterbar' ), 'manage_options', 'jetpack', null, $icon, $position );
		}
		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_submenu_page( 'jetpack', esc_attr__( 'Activity Log', 'jetpack-masterbar' ), __( 'Activity Log', 'jetpack-masterbar' ), 'manage_options', 'https://wordpress.com/activity-log/' . $this->domain, null, 2 );
		// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
		add_submenu_page( 'jetpack', esc_attr__( 'Backup', 'jetpack-masterbar' ), __( 'Backup', 'jetpack-masterbar' ), 'manage_options', 'https://wordpress.com/backup/' . $this->domain, null, 3 );

		if ( self::DEFAULT_VIEW === $this->get_preferred_view( 'jetpack' ) ) {
			$this->hide_submenu_page( 'jetpack', 'jetpack#/settings' );
			$this->hide_submenu_page( 'jetpack', 'stats' );
			$this->hide_submenu_page( 'jetpack', esc_url( Redirect::get_url( 'calypso-backups' ) ) );
			$this->hide_submenu_page( 'jetpack', esc_url( Redirect::get_url( 'calypso-scanner' ) ) );
		}

		if ( ! $is_menu_updated ) {
			// Remove the submenu auto-created by Core just to be sure that there no issues on non-admin roles.
			remove_submenu_page( 'jetpack', 'jetpack' );
		}
	}

	/**
	 * Adds Jetpack menu.
	 */
	public function add_jetpack_menu() {
		$this->create_jetpack_menu();
	}

	/**
	 * Add the calypso /woocommerce-installation/ menu item.
	 *
	 * @param array $current_plan The site's plan if they have one. This is passed from WPcom_Admin_Menu to prevent
	 * redundant database queries.
	 */
	public function add_woocommerce_installation_menu( $current_plan = null ) {
		/**
		 * Whether to show the WordPress.com WooCommerce Installation menu.
		 *
		 * @use add_filter( 'jetpack_show_wpcom_woocommerce_installation_menu', '__return_true' );
		 * @module masterbar
		 * @since jetpack-10.3.0
		 * @param bool $jetpack_show_wpcom_woocommerce_installation_menu Load the WordPress.com WooCommerce Installation menu item. Default to false.
		 * @param array $current_plan Data about the current site's plan.
		 */
		if ( apply_filters( 'jetpack_show_wpcom_woocommerce_installation_menu', false, $current_plan ) ) {
			$this->add_admin_menu_separator( 54, 'activate_plugins' );

			$icon_url = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDg1LjkgNDcuNiI+CjxwYXRoIGZpbGw9IiNhMmFhYjIiIGQ9Ik03Ny40LDAuMWMtNC4zLDAtNy4xLDEuNC05LjYsNi4xTDU2LjQsMjcuN1Y4LjZjMC01LjctMi43LTguNS03LjctOC41cy03LjEsMS43LTkuNiw2LjVMMjguMywyNy43VjguOAoJYzAtNi4xLTIuNS04LjctOC42LTguN0g3LjNDMi42LDAuMSwwLDIuMywwLDYuM3MyLjUsNi40LDcuMSw2LjRoNS4xdjI0LjFjMCw2LjgsNC42LDEwLjgsMTEuMiwxMC44UzMzLDQ1LDM2LjMsMzguOWw3LjItMTMuNXYxMS40CgljMCw2LjcsNC40LDEwLjgsMTEuMSwxMC44czkuMi0yLjMsMTMtOC43bDE2LjYtMjhjMy42LTYuMSwxLjEtMTAuOC02LjktMTAuOEM3Ny4zLDAuMSw3Ny4zLDAuMSw3Ny40LDAuMXoiLz4KPC9zdmc+Cg==';
			$menu_url = 'https://wordpress.com/woocommerce-installation/' . $this->domain;

			// Only show the menu if the user has the capability to activate_plugins.
			// @phan-suppress-next-line PhanTypeMismatchArgumentProbablyReal -- Core should ideally document null for no-callback arg. https://core.trac.wordpress.org/ticket/52539.
			add_menu_page( esc_attr__( 'WooCommerce', 'jetpack-masterbar' ), esc_attr__( 'WooCommerce', 'jetpack-masterbar' ), 'activate_plugins', $menu_url, null, $icon_url, 55 );
		}
	}

	/**
	 * AJAX handler for retrieving the upsell nudge.
	 */
	public function wp_ajax_upsell_nudge_jitm() {
		check_ajax_referer( 'upsell_nudge_jitm' );

		// Filter to turn off all just in time messages
		/** This action is already documented in \Automattic\Jetpack\JITMS\JITM */
		if ( ! apply_filters( 'jetpack_just_in_time_msgs', true ) ) {
			wp_die();
		}

		$nudge = $this->get_upsell_nudge();
		if ( ! $nudge ) {
			wp_die();
		}

		$link = $nudge['link'];
		if ( str_starts_with( $link, '/' ) ) {
			$link = 'https://wordpress.com' . $link;
		}
		?>
		<li class="wp-not-current-submenu menu-top menu-icon-generic toplevel_page_site-notices" id="toplevel_page_site-notices">
			<a href="<?php echo esc_url( $link ); ?>" class="wp-not-current-submenu menu-top menu-icon-generic toplevel_page_site-notices">
				<div class="wp-menu-arrow">
					<div></div>
				</div>
				<div class="wp-menu-image dashicons-before dashicons-admin-generic" aria-hidden="true"><br></div>
				<div class="wp-menu-name">
					<div class="upsell_banner">
						<div class="banner__info">
							<div class="banner__title">
								<?php echo wp_kses( $nudge['content'], array() ); ?>
							</div>
						</div>
						<div class="banner__action">
							<button type="button" class="button">
								<?php echo wp_kses( $nudge['cta'], array() ); ?>
							</button>
						</div>
						<?php if ( $nudge['dismissible'] ) : ?>
							<svg xmlns="http://www.w3.org/2000/svg" data-feature_class="<?php echo esc_attr( $nudge['feature_class'] ); ?>" data-feature_id="<?php echo esc_attr( $nudge['id'] ); ?>" viewBox="0 0 24 24" class="gridicon gridicons-cross dismissible-card__close-icon" height="24" width="24"><g><path d="M18.36 19.78L12 13.41l-6.36 6.37-1.42-1.42L10.59 12 4.22 5.64l1.42-1.42L12 10.59l6.36-6.36 1.41 1.41L13.41 12l6.36 6.36z"></path></g></svg>
						<?php endif; ?>
					</div>
				</div>
			</a>
		</li>
		<?php
		wp_die();
	}

	/**
	 * Fixes scrollbar issue if upsell nudge is loaded.
	 * https://github.com/Automattic/dotcom-forge/issues/7936
	 */
	public function wpcom_upsell_nudge_jitm_fix() {
		$assets_base_path = '../../dist/admin-menu/';
		Assets::register_script(
			'wpcom-upsell-nudge-jitm-fix',
			$assets_base_path . 'wpcom-upsell-nudge-jitm-fix.js',
			__FILE__,
			array(
				'enqueue' => true,
			)
		);
	}

	/**
	 * Returns the first available upsell nudge.
	 * Needs to be implemented separately for each child menu class.
	 * Empty by default.
	 *
	 * @return array
	 */
	public function get_upsell_nudge() {
		return array();
	}
}
