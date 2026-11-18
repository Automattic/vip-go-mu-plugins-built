<?php
/**
 * Class for adding divider headings to the admin menu for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin\MenuItems;

use GistAnswers\Admin\NetworkMenu;
use GistAnswers\Admin\SidebarMenu;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class for adding divider headings to the admin menu for the Gist Answers plugin.
 */
final class DividerHeading {

	/**
	 * Display name for this divider heading.
	 *
	 * @var string
	 */
	protected string $display_name = '';

	/**
	 * Slug for this divider heading.
	 *
	 * @var string
	 */
	protected string $slug = '';

	/**
	 * Class constructor.
	 *
	 * @param string $divider_heading_name The name of the divider heading.
	 * @param bool   $is_network_menu      Whether this divider heading is in the network menu.
	 *
	 * @return void
	 */
	public function __construct( string $divider_heading_name, bool $is_network_menu = false ) {

		[$this->display_name, $this->slug] = Utilities::extract_divider_heading_name_details( $divider_heading_name );

		$subitem_slug = 'gist-answers-' . $this->slug;

		$action_hook = $is_network_menu ? 'network_admin_menu' : 'admin_menu';

		$parent_slug = $is_network_menu ? NetworkMenu::NETWORK_MENU_SLUG : SidebarMenu::ADMIN_MENU_SLUG;

		add_action(
			$action_hook,
			function () use ( $parent_slug, $subitem_slug ) {
				add_submenu_page(
					$parent_slug,
					__( 'Gist Answers', 'gist-answers' ) . ' &rsaquo; ' . $this->display_name, // By this point, $display_name has been translated.
					'<span class="gist-answers-admin-menu-divider-heading">' . $this->display_name . '</span>',
					'manage_options',
					$subitem_slug,
					'__return_false',
				);
			},
		);
	}
}
