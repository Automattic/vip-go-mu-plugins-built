<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector;

use Automattic\RewriteRulesInspector\Core\RewriteRules;
use Automattic\RewriteRulesInspector\Core\Permastructs;
use Automattic\RewriteRulesInspector\Core\FileExport;
use Automattic\RewriteRulesInspector\Core\RuleFlush;
use Automattic\RewriteRulesInspector\Core\UrlTester;
use Automattic\RewriteRulesInspector\Admin\AdminPage;
use Automattic\RewriteRulesInspector\Admin\ViewRenderer;
use Automattic\RewriteRulesInspector\Admin\ContextualHelp;
use Automattic\RewriteRulesInspector\Admin\RewriteRulesTable;

/**
 * Main class for the plugin.
 *
 * @package Automattic\RewriteRulesInspector
 * @since 1.0.0
 */
final class Plugin {

	/**
	 * Which admin menu parent the Rewrite Rules Inspector page will appear under. Default is Tools.
	 *
	 * @var string $parent_slug
	 */
	public string $parent_slug = 'tools.php';

	/**
	 * Rewrite Rules Inspector page slug.
	 *
	 * @var string $page_slug
	 */
	public string $page_slug = 'rewrite-rules-inspector';

	/**
	 * Capability needed to view the Rewrite Rules Inspector page.
	 *
	 * @var string $view_cap
	 */
	public string $view_cap = 'manage_options';

	/**
	 * Whether or not users can flush the rewrite rules from this tool.
	 *
	 * @var bool $flushing_enabled
	 */
	public bool $flushing_enabled = true;

	/**
	 * Rewrite rules service.
	 *
	 * @var RewriteRules $rewrite_rules_service
	 */
	private RewriteRules $rewrite_rules_service;

	/**
	 * Permastruct service.
	 *
	 * @var Permastructs $permastruct_service
	 */
	private Permastructs $permastruct_service;

	/**
	 * File export service.
	 *
	 * @var FileExport $file_export_service
	 */
	private FileExport $file_export_service;

	/**
	 * Rule flush service.
	 *
	 * @var RuleFlush $rule_flush_service
	 */
	private RuleFlush $rule_flush_service;

	/**
	 * URL tester service.
	 *
	 * @var UrlTester $url_tester_service
	 */
	private UrlTester $url_tester_service;

	/**
	 * Admin page handler.
	 *
	 * @var AdminPage $admin_page
	 */
	private AdminPage $admin_page;

	/**
	 * View renderer.
	 *
	 * @var ViewRenderer $view_renderer
	 */
	private ViewRenderer $view_renderer;

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
	 */
	public function __construct() {
		$this->initialize_services();
	}

	/**
	 * Initialize all services.
	 *
	 * @since 1.5.0
	 */
	private function initialize_services(): void {
		$this->rewrite_rules_service = new RewriteRules();
		$this->permastruct_service   = new Permastructs();
		$this->file_export_service   = new FileExport( $this->view_cap );
		$this->rule_flush_service    = new RuleFlush( $this->flushing_enabled, $this->view_cap );
		$this->url_tester_service    = new UrlTester();
		$this->view_renderer         = new ViewRenderer( plugin_dir_path( __DIR__ ) );
		$this->help_service          = new ContextualHelp();
		$this->admin_page            = new AdminPage( $this->parent_slug, $this->page_slug, $this->view_cap, [ $this, 'view_rules' ], $this->help_service );
	}

	/**
	 * Run the integration.
	 *
	 * @since 1.3.0
	 */
	public function run(): void {
		// This plugin only runs in the admin, but we need it initialized on init.
		add_action( 'init', [ $this, 'action_init' ] );
		
		// Register and enqueue admin styles.
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_styles' ] );

	}

	/**
	 * Initialize the plugin.
	 *
	 * @since 1.0.0
	 */
	public function action_init(): void {
		if ( ! is_admin() ) {
			return;
		}

		// Allow the view to be placed elsewhere than tools.php.
		$this->parent_slug = apply_filters( 'rri_parent_slug', $this->parent_slug );

		// Whether or not users can flush the rewrite rules from this tool.
		$this->flushing_enabled = apply_filters( 'rri_flushing_enabled', $this->flushing_enabled );

		// Re-initialize services with updated settings.
		$this->initialize_services();

		// Register admin page.
		$this->admin_page->register();

		// User actions available for the rewrite rules page.
		if ( isset( $_GET['page'], $_GET['action'] ) && $_GET['page'] === $this->page_slug && 'download-rules' === $_GET['action'] ) {
			add_action( 'admin_init', [ $this, 'download_rules' ] );
		} elseif ( isset( $_GET['page'], $_GET['action'] ) && $_GET['page'] === $this->page_slug && 'flush-rules' === $_GET['action'] ) {
			add_action( 'admin_init', [ $this, 'flush_rules' ] );
		}
	}

	/**
	 * Enqueue admin styles and scripts for the rewrite rules inspector page.
	 *
	 * @since 1.5.0
	 * @param string $hook_suffix The current admin page hook suffix.
	 */
	public function enqueue_admin_styles( string $hook_suffix ): void {
		// Only enqueue on our admin page.
		if ( 'tools_page_' . $this->page_slug !== $hook_suffix ) {
			return;
		}

		$css_url = plugin_dir_url( __DIR__ ) . 'assets/css/admin.css';
		$js_url  = plugin_dir_url( __DIR__ ) . 'assets/js/admin.js';
		$version = REWRITE_RULES_INSPECTOR_VERSION;

		// Enqueue styles.
		wp_enqueue_style(
			'rewrite-rules-inspector-admin',
			$css_url,
			[],
			$version
		);

		// Enqueue scripts.
		wp_enqueue_script(
			'rewrite-rules-inspector-admin',
			$js_url,
			[ 'jquery' ],
			$version,
			true
		);
	}

	/**
	 * View the rewrite rules for the site.
	 *
	 * @since 1.0.0
	 */
	public function view_rules(): void {
		$rules = $this->rewrite_rules_service->get_rules();
		$sources = $this->rewrite_rules_service->get_sources();
		$permastructs = $this->permastruct_service->get_permastructs();

		$wp_list_table = new RewriteRulesTable( $rules, $sources, $this->flushing_enabled );
		$wp_list_table->prepare_items();

		// Test URL if one is provided.
		$url_test_results = null;
		if ( ! empty( $_GET['s'] ) ) {
			$url = sanitize_text_field( $_GET['s'] );
			// Use the same filtered rules for URL testing to ensure consistency.
			$url_test_results = $this->url_tester_service->test_url_with_rules( $url, $rules );
		}
		$flush_success = ( isset( $_GET['message'] ) && 'flush-success' === $_GET['message'] );

		$this->view_renderer->render_rules_view( $rules, $permastructs, $wp_list_table, $url_test_results, $flush_success );
	}

	/**
	 * Process a user's request to download a set of the rewrite rules.
	 *
	 * @since 1.0.0
	 */
	public function download_rules(): void {
		$rules = $this->rewrite_rules_service->get_rules();
		$this->file_export_service->download_rules( $rules );
	}

	/**
	 * Allow a user to flush rewrite rules for their site.
	 *
	 * @since 1.0.0
	 */
	public function flush_rules(): void {
		global $plugin_page;
		$redirect_url = menu_page_url( $plugin_page, false );
		$this->rule_flush_service->flush_rules( $redirect_url );
	}


	/**
	 * Get the URL tester service.
	 *
	 * @since 1.5.0
	 * @return UrlTester The URL tester service.
	 */
	public function get_url_tester(): UrlTester {
		return $this->url_tester_service;
	}
}
