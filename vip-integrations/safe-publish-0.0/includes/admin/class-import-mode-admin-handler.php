<?php
/**
 * Import Mode Admin Handler class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bootstraps the WordPress admin area for sites configured to import content.
 *
 * Acts as the composition coordinator for admin menu, Exports page, import
 * row-action AJAX, primary AJAX controller, and the post-import notice.
 */
final class Import_Mode_Admin_Handler {

	/**
	 * Admin Menu Manager instance.
	 *
	 * @var Admin_Menu_Manager
	 */
	private Admin_Menu_Manager $menu_manager;

	/**
	 * Exports page instance.
	 *
	 * @var Exports_Page
	 */
	private Exports_Page $exports_page;

	/**
	 * Import row-action AJAX handler instance.
	 *
	 * @var Import_Actions_Ajax_Handler
	 */
	private Import_Actions_Ajax_Handler $import_actions;

	/**
	 * Admin AJAX Controller instance.
	 *
	 * @var Admin_Ajax_Controller
	 */
	private Admin_Ajax_Controller $ajax_controller;

	/**
	 * Post-import admin notice instance.
	 *
	 * @var Post_Import_Notice
	 */
	private Post_Import_Notice $post_import_notice;

	/**
	 * Constructs the Import_Mode_Admin_Handler instance.
	 *
	 * @param Admin_Menu_Manager          $menu_manager       Admin Menu Manager instance.
	 * @param Exports_Page                $exports_page       Exports page instance.
	 * @param Import_Actions_Ajax_Handler $import_actions     Row-action AJAX handler.
	 * @param Admin_Ajax_Controller       $ajax_controller    Admin AJAX Controller instance.
	 * @param Post_Import_Notice          $post_import_notice Post-import admin notice instance.
	 */
	public function __construct(
		Admin_Menu_Manager $menu_manager,
		Exports_Page $exports_page,
		Import_Actions_Ajax_Handler $import_actions,
		Admin_Ajax_Controller $ajax_controller,
		Post_Import_Notice $post_import_notice
	) {
		$this->menu_manager       = $menu_manager;
		$this->exports_page       = $exports_page;
		$this->import_actions     = $import_actions;
		$this->ajax_controller    = $ajax_controller;
		$this->post_import_notice = $post_import_notice;
	}

	/**
	 * Initializes admin functionality by registering all sub-service hooks.
	 *
	 * Exports_Page registers unconditionally — its menu callback gates on
	 * `Exports_Page::is_visible()` at admin_menu time, when $wpdb is loaded.
	 */
	public function init(): void {
		$this->menu_manager->register();
		$this->import_actions->init();
		$this->ajax_controller->register_handlers();
		$this->post_import_notice->init();
		$this->exports_page->init();
	}
}
