<?php
/**
 * Admin sidebar menu class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin;

use GistAnswers\Admin\MenuItems;
use GistAnswers\Admin\MenuItems\DividerHeading;
use GistAnswers\Model\GistSite;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin sidebar menu class for the Gist Answers plugin.
 */
final class SidebarMenu {

	public const ADMIN_MENU_SLUG = 'gist-answers';

	/**
	 * Class constructor.
	 *
	 * @return void
	 */
	public function __construct() {
		add_action(
			'after_setup_theme',
			function () {

				$gist_site = GistSite::get();

				$is_or_was_connected = $gist_site->has_stored_api_token() && $gist_site->has_stored_publisher();

				if ( $is_or_was_connected ) {
					$menu_items = MenuItems::get_connected();
				} else {
					$menu_items = MenuItems::get_disconnected();
				}

				$this->create_admin_menu();
				$this->create_admin_submenus( $menu_items );

				$this->hide_primary_menu_item();

				if ( ! $is_or_was_connected && ! MenuItems::should_show_developer_menu() ) {
					$this->hide_sidebar_menu_dashboard();
				}
			}
		);
	}

	/**
	 * Create the admin menu in the sidebar.
	 *
	 * @return void
	 */
	private function create_admin_menu(): void {
		add_action(
			'admin_menu',
			function () {
				add_menu_page(
					__( 'Gist Answers', 'gist-answers' ),
					__( 'Gist Answers', 'gist-answers' ),
					'manage_options',
					self::ADMIN_MENU_SLUG,
					'__return_false',
					null, // Icon is generated via CSS.
					50,
				);
			}
		);
	}

	/**
	 * Create the admin submenus in the sidebar.
	 *
	 * @param array<object> $menu_items The menu items to be rendered.
	 *
	 * @return void
	 */
	private function create_admin_submenus( array $menu_items ): void {
		add_action(
			'init',
			function () use ( $menu_items ) {

				$in_submenu = false;

				foreach ( $menu_items as $menu_item ) {
					switch ( $menu_item->type ?? null ) {
						case 'divider_heading':
							$name = $menu_item->name ?? null;

							if ( ! empty( $name ) ) {
								new DividerHeading( $name );
							}

							$in_submenu = true;

							break;

						case 'menu_subitem':
							$class_name = $menu_item->class_name ?? null;

							if ( ! empty( $class_name ) ) {

								$class_name = preg_replace( '/\s+/', '', $class_name );

								$qualified_class_name = 'GistAnswers\\Admin\\MenuItems\\' . $class_name;

								new $qualified_class_name( $in_submenu );
							}
					}
				}
			}
		);
	}

	/**
	 * Hide the primary menu item in the admin sidebar.
	 *
	 * @return void
	 */
	private function hide_primary_menu_item(): void {
		add_action(
			'admin_menu',
			function () {
				remove_submenu_page( self::ADMIN_MENU_SLUG, self::ADMIN_MENU_SLUG );
			},
			65535,
		);
	}

	/**
	 * Hide the sidebar menu "Dashboard" item when the API has not been connected.
	 *
	 * @return void
	 */
	private function hide_sidebar_menu_dashboard(): void {
		add_action(
			'admin_footer',
			function () {
				?>
				<style>
					.toplevel_page_gist-answers {
						& .wp-submenu {
							display: none !important;
						}

						&:not(.wp-menu-open)::after {
							display: none !important;
						}
					}
				</style>
				<?php
			},
		);
	}
}
