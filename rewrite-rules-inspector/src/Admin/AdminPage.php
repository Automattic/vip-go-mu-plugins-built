<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Admin;

use Automattic\RewriteRulesInspector\Admin\ContextualHelp;

/**
 * Handler class for admin menu registration and management.
 *
 * @package Automattic\RewriteRulesInspector\Admin
 * @since 1.5.0
 */
final class AdminPage {

	/**
	 * Which admin menu parent the Rewrite Rules Inspector page will appear under. Default is Tools.
	 *
	 * @var string $parent_slug
	 */
	private string $parent_slug;

	/**
	 * Rewrite Rules Inspector page slug.
	 *
	 * @var string $page_slug
	 */
	private string $page_slug;

	/**
	 * Capability needed to view the Rewrite Rules Inspector page.
	 *
	 * @var string $view_cap
	 */
	private string $view_cap;

	/**
	 * Callback function for the admin page.
	 *
	 * @var callable $callback
	 */
	private $callback;

	/**
	 * Contextual help service.
	 *
	 * @var ContextualHelp $help_service
	 */
	private ContextualHelp $help_service;

	/**
	 * Constructor.
	 *
	 * @since 1.5.0
	 * @param string   $parent_slug Parent menu slug.
	 * @param string   $page_slug Page slug.
	 * @param string   $view_cap Required capability.
	 * @param callable $callback Page callback function.
	 * @param ContextualHelp $help_service Help service instance.
	 */
	public function __construct( string $parent_slug, string $page_slug, string $view_cap, callable $callback, ContextualHelp $help_service ) {
		$this->parent_slug = $parent_slug;
		$this->page_slug   = $page_slug;
		$this->view_cap    = $view_cap;
		$this->callback    = $callback;
		$this->help_service = $help_service;
	}

	/**
	 * Register the admin page.
	 *
	 * @since 1.5.0
	 */
	public function register(): void {
		add_action( 'admin_menu', [ $this, 'add_submenu_page' ] );
	}

	/**
	 * Add our sub-menu page to the admin navigation.
	 *
	 * @since 1.5.0
	 */
	public function add_submenu_page(): void {
		$hook = add_submenu_page(
			$this->parent_slug,
			__( 'Rewrite Rules Inspector', 'rewrite-rules-inspector' ),
			__( 'Rewrite Rules', 'rewrite-rules-inspector' ),
			$this->view_cap,
			$this->page_slug,
			$this->callback
		);

		// Add screen help.
		add_action( 'load-' . $hook, [ $this, 'add_screen_help' ] );
	}

	/**
	 * Add screen help tabs to explain rewrite rules and permastructs.
	 *
	 * @since 1.5.0
	 */
	public function add_screen_help(): void {
		$this->help_service->add_help_content();
	}

	/**
	 * Get the page slug.
	 *
	 * @since 1.5.0
	 * @return string The page slug.
	 */
	public function get_page_slug(): string {
		return $this->page_slug;
	}
}
