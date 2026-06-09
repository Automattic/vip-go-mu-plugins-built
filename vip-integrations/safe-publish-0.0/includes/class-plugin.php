<?php
/**
 * Main Plugin class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish;

use Safe_Publish\Admin\Admin_Ajax_Controller;
use Safe_Publish\Admin\Import_Mode_Admin_Handler;
use Safe_Publish\Admin\Admin_Menu_Manager;
use Safe_Publish\Admin\Content_Processor;
use Safe_Publish\Admin\Exports_Page;
use Safe_Publish\Admin\History_Repository;
use Safe_Publish\Admin\Import_Actions_Ajax_Handler;
use Safe_Publish\Admin\Post_Import_Notice;
use Safe_Publish\Admin\Post_Import_Service;
use Safe_Publish\Admin\Session_Rollback_Service;
use Safe_Publish\Admin\Settings_Logger;
use Safe_Publish\Admin\Settings_Page;
use Safe_Publish\Admin\Settings_Sanitizer;
use Safe_Publish\Auth\Auth_Manager;
use Safe_Publish\API\Catalog_REST_Controller;
use Safe_Publish\API\Source_Posts_API;
use Safe_Publish\API\HTTP_Client;
use Safe_Publish\API\Meta_Terms_Manager;
use Safe_Publish\API\Post_Type_Fetcher;
use Safe_Publish\API\Safe_Publish_API;
use Safe_Publish\API\Source_Author_REST_Field;
use Safe_Publish\Content\Content_Media_Processor;
use Safe_Publish\Media\Media_Importer;
use Safe_Publish\Utils\Audit_Log_Table;
use Safe_Publish\Utils\Import_Items_Table;
use Safe_Publish\Utils\Imports_Table;
use Safe_Publish\Utils\Options;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main Plugin Class.
 */
final class Plugin {

	/**
	 * Source Posts API instance.
	 *
	 * @var Source_Posts_API|null
	 */
	private ?Source_Posts_API $api = null;

	/**
	 * Safe Publish API instance.
	 *
	 * @var Safe_Publish_API|null
	 */
	private ?Safe_Publish_API $safe_publish_api = null;

	/**
	 * Constructs the Plugin instance.
	 */
	public function __construct() {
		// Initialize components lazily.
	}

	/**
	 * Initializes plugin.
	 */
	public function init(): void {
		Audit_Log_Table::maybe_create_table();
		Imports_Table::maybe_create_table();
		Import_Items_Table::maybe_create_table();

		( new Settings_Logger() )->register_handlers();

		$sync_mode          = Options::get_value( Options::OPTION_SYNC_MODE, '' );
		$connected_site_url = Options::get_value( Options::OPTION_CONNECTED_SITE_URL, '' );

		$can_export = in_array(
			$sync_mode,
			array( Options::SYNC_MODE_EXPORT, Options::SYNC_MODE_BIDIRECTIONAL ),
			true
		);

		if ( $can_export && ! empty( $connected_site_url ) ) {
			$auth_manager = new Auth_Manager();
			$auth_manager->init();

			$source_author_field = new Source_Author_REST_Field(
				$auth_manager->get_authenticator()
			);

			$source_author_field->init();

			$catalog_controller = new Catalog_REST_Controller(
				$auth_manager->get_authenticator()
			);

			$catalog_controller->init();
		}

		$can_import = in_array(
			$sync_mode,
			array( Options::SYNC_MODE_IMPORT, Options::SYNC_MODE_BIDIRECTIONAL ),
			true
		);

		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_filter(
			'vip_pendo_allowed_screens',
			array( $this, 'register_pendo_screens' )
		);

		if ( $can_import ) {
			$this->init_full_admin();
		} else {
			$this->init_settings_only_admin( $can_export );
		}
	}

	/**
	 * Registers the plugin's admin screens with VIP Pendo telemetry.
	 *
	 * Registered here rather than in a menu class because the screens span
	 * both admin modes: the import-mode menu lives in Admin_Menu_Manager while
	 * the export-only top-level page lives in this class, so neither owns the
	 * full list. The "Source Posts" submenu reuses the `safe-publish` slug, so
	 * it shares the top-level hook suffix and needs no separate entry. The
	 * Exports submenu resolves to `safe-publish_page_safe-publish-exports` in
	 * both modes because WordPress builds the suffix from the sanitized parent
	 * menu title ("Safe Publish"), not the parent slug. Screens absent in the
	 * active mode simply never match the current hook suffix.
	 *
	 * @param string[] $allowed_screens Hook suffixes where Pendo is enabled.
	 * @return string[] Filtered list including the plugin's admin screens.
	 */
	public function register_pendo_screens( array $allowed_screens ): array {
		return array_merge(
			$allowed_screens,
			array(
				'toplevel_page_safe-publish',
				'toplevel_page_safe-publish-settings',
				'safe-publish_page_safe-publish-imports',
				'safe-publish_page_safe-publish-settings',
				'safe-publish_page_safe-publish-exports',
			)
		);
	}

	/**
	 * Registers plugin settings with WordPress.
	 */
	public function register_settings(): void {
		$sanitizer = new Settings_Sanitizer();

		register_setting(
			Options::SETTINGS_GROUP,
			Options::OPTION_CONNECTED_SITE_URL,
			array(
				'sanitize_callback' => array( $sanitizer, 'sanitize_url' ),
				'default'           => '',
			)
		);

		register_setting(
			Options::SETTINGS_GROUP,
			Options::OPTION_SYNC_MODE,
			array(
				'sanitize_callback' => array( $sanitizer, 'sanitize_sync_mode' ),
				'default'           => '',
			)
		);

		register_setting(
			Options::SETTINGS_GROUP,
			Options::OPTION_BASIC_AUTH_USERNAME,
			array(
				'sanitize_callback' => array( $sanitizer, 'sanitize_username' ),
				'default'           => '',
			)
		);

		register_setting(
			Options::SETTINGS_GROUP,
			Options::OPTION_BASIC_AUTH_PASSWORD,
			array(
				'sanitize_callback' => array( $sanitizer, 'sanitize_password' ),
				'default'           => '',
			)
		);
	}

	/**
	 * Initializes the full admin UI for import and bidirectional modes.
	 */
	private function init_full_admin(): void {
		// Build shared low-level services.
		$http_client             = new HTTP_Client();
		$media_importer          = new Media_Importer( $http_client );
		$content_media_processor = new Content_Media_Processor( $media_importer );
		$post_type_fetcher       = new Post_Type_Fetcher( $http_client );

		// Initialize Source Posts API with shared HTTP client.
		$this->api = new Source_Posts_API( $http_client );

		// Build content processor with direct media service dependencies.
		$content_processor = new Content_Processor( $media_importer, $content_media_processor );

		$this->safe_publish_api = new Safe_Publish_API();

		// Build admin object graph and initialize.
		$this->build_full_admin_handler(
			$this->api,
			$content_processor,
			$media_importer,
			$post_type_fetcher
		)->init();
	}

	/**
	 * Builds and wires the Import_Mode_Admin_Handler with all required
	 * sub-services for import mode.
	 *
	 * @param Source_Posts_API  $api                Source Posts API instance.
	 * @param Content_Processor $content_processor  Content Processor instance.
	 * @param Media_Importer    $media_importer     Media Importer instance.
	 * @param Post_Type_Fetcher $post_type_fetcher  Post Type Fetcher instance.
	 * @return Import_Mode_Admin_Handler Fully constructed Import_Mode_Admin_Handler coordinator.
	 */
	private function build_full_admin_handler(
		Source_Posts_API $api,
		Content_Processor $content_processor,
		Media_Importer $media_importer,
		Post_Type_Fetcher $post_type_fetcher
	): Import_Mode_Admin_Handler {
		$repository       = new History_Repository();
		$rollback_service = new Session_Rollback_Service( $repository );

		$exports_page = new Exports_Page();

		$import_actions = new Import_Actions_Ajax_Handler( $rollback_service );

		$post_import_service = new Post_Import_Service(
			$api,
			$media_importer,
			$content_processor,
			$repository,
			new Meta_Terms_Manager()
		);

		$menu_manager = new Admin_Menu_Manager();

		$ajax_controller = new Admin_Ajax_Controller(
			$api,
			$repository,
			$post_import_service,
			$post_type_fetcher
		);

		return new Import_Mode_Admin_Handler(
			$menu_manager,
			$exports_page,
			$import_actions,
			$ajax_controller,
			new Post_Import_Notice()
		);
	}

	/**
	 * Initializes the settings-only admin UI for export-only and unconfigured
	 * modes.
	 *
	 * @param bool $can_export Whether the site is configured to export content.
	 */
	private function init_settings_only_admin( bool $can_export = false ): void {
		add_action( 'admin_menu', array( $this, 'add_settings_only_admin_menu' ) );

		if ( $can_export ) {
			( new Exports_Page() )->init_export_only();
		}
	}

	/**
	 * Registers the Safe Publish top-level menu pointing to the settings page.
	 *
	 * Uses the 'safe-publish-settings' slug to match the slug used by
	 * Admin_Menu_Manager in import mode, so that options.php's post-save
	 * redirect always lands on a registered page regardless of sync mode.
	 */
	public function add_settings_only_admin_menu(): void {
		add_menu_page(
			__( 'Safe Publish', 'safe-publish' ),
			__( 'Safe Publish', 'safe-publish' ),
			'manage_options',
			'safe-publish-settings',
			array( $this, 'render_settings_only_page' ),
			'dashicons-migrate',
			99
		);
	}

	/**
	 * Renders the settings page for export-only and unconfigured modes.
	 */
	public function render_settings_only_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die(
				esc_html__(
					'You do not have sufficient permissions to access this page.',
					'safe-publish'
				)
			);
		}

		( new Settings_Page() )->render();
	}

	/**
	 * Gets Safe Publish API instance.
	 *
	 * @return ?Safe_Publish_API Safe Publish API instance or null.
	 */
	public function get_safe_publish_api(): ?Safe_Publish_API {
		return $this->safe_publish_api ?? null;
	}
}
