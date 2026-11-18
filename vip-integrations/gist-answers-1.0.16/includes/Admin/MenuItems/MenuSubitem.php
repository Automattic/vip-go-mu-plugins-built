<?php
/**
 * Admin menu item base class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin\MenuItems;

use GistAnswers\Admin\MenuItems;
use GistAnswers\Admin\NetworkMenu;
use GistAnswers\Admin\SidebarMenu;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin menu item base class for the Gist Answers plugin.
 */
class MenuSubitem {

	/**
	 * Display name for this menu item.
	 *
	 * @var string
	 */
	protected string $display_name = '';

	/**
	 * Slug for this menu item.
	 *
	 * @var string
	 */
	protected string $slug = '';

	/**
	 * Class constructor.
	 *
	 * @param string $class_name      The name of the class associated with this menu item.
	 * @param bool   $is_subitem      Whether this menu item is a subitem.
	 * @param bool   $is_network_menu Whether this menu item is in the network menu.
	 *
	 * @return void
	 */
	public function __construct( string $class_name, bool $is_subitem = false, bool $is_network_menu = false ) {

		[$this->display_name, $this->slug] = Utilities::extract_class_name_details( $class_name );

		$subitem_class = $is_subitem ? 'gist-answers-admin-menu-subitem' : 'gist-answers-admin-menu-primary-item';

		$subitem_slug = 'gist-answers-' . $this->slug;

		$action_hook = $is_network_menu ? 'network_admin_menu' : 'admin_menu';

		$parent_slug = $is_network_menu ? NetworkMenu::NETWORK_MENU_SLUG : SidebarMenu::ADMIN_MENU_SLUG;

		add_action(
			$action_hook,
			function () use ( $parent_slug, $subitem_class, $subitem_slug ) {
				add_submenu_page(
					$parent_slug,
					__( 'Gist Answers', 'gist-answers' ) . ' &rsaquo; ' . $this->display_name, // By this point, $display_name has been translated.
					'<span class="' . esc_attr( $subitem_class ) . '">' . $this->display_name . '</span>',
					'manage_options',
					$subitem_slug,
					array( $this, 'render_submenu_page' ),
				);
			},
		);
	}

	/**
	 * Data to be passed to the template for rendering. (This method is intended to be overridden by subclasses.)
	 *
	 * @return object Object containing data to be passed to the template.
	 */
	protected function with(): object {
		return (object) array();
	}

	/**
	 * Render the submenu page for this menu item.
	 *
	 * @return void
	 */
	public function render_submenu_page(): void {

		$template_path = GIST_ANSWERS_PLUGIN_DIR . "templates/admin-menu/{$this->slug}.php";

		if ( file_exists( $template_path ) ) {
			?>

			<div class="wrap gist-answers-admin-menu-wrap">
				<h1 class="gist-answers-admin-menu-dummy-title"><!-- required -- WP will insert admin notices after this element --></h1>

				<div id="gist-answers-admin-menu-sticky-detector"></div>

				<div class="gist-answers-admin-menu-wrapped-items">
					<?php $data = $this->with(); ?>

					<?php require $template_path; // phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable -- The path is built from GIST_ANSWERS_PLUGIN_DIR and this class's own slug, and its existence is checked above. ?>
				</div><!-- .gist-answers-admin-menu-wrapped-items -->

				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/popup-iframe.php'; ?>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/alert-modal.php'; ?>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/activation-modal.php'; ?>
				<?php require GIST_ANSWERS_PLUGIN_DIR . 'templates/partials/admin-loader.php'; ?>

			</div><!-- .gist-answers-admin-menu-wrap -->

			<?php
		}
	}

	/**
	 * Get the admin menu subpath (the part that comes after /wp-admin/) for this menu item.
	 *
	 * @return string The admin menu subpath corresponding to this menu item.
	 */
	public static function get_admin_menu_subpath(): string {

		[ , $slug ] = Utilities::extract_class_name_details( static::class );

		return MenuItems::get_admin_menu_subpath_for_slug( $slug );
	}

	/**
	 * Get the admin menu full URL for this menu item.
	 *
	 * @return string The full URL to the admin menu corresponding to this menu item.
	 */
	public static function get_admin_menu_url(): string {
		return admin_url( MenuItems::get_admin_menu_subpath_for_class( static::class ) );
	}

	/**
	 * Get the admin menu URL for the network admin version of this menu page.
	 *
	 * @return string The admin menu URL for the network admin.
	 */
	public static function get_admin_menu_url_for_network(): string {
		return is_multisite() ? network_admin_url( MenuItems::get_admin_menu_subpath_for_class( static::class ) ) : self::get_admin_menu_url();
	}
}
