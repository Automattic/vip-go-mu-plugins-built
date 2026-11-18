<?php
/**
 * "Tools & Options" admin menu item class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin\MenuItems;

use GistAnswers\Admin\AdminMain;
use GistAnswers\Admin\MenuItems\MenuSubitem;
use GistAnswers\Plugin\AnswerPages;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * "Tools & Options" admin menu item class for the Gist Answers plugin.
 */
final class ToolsOptions extends MenuSubitem {

	private const LOG_API_RESPONSES_OPTION_KEY         = 'gist_answers_log_api_responses';
	private const LOG_API_BACKTRACES_OPTION_KEY        = 'gist_answers_log_api_backtraces';
	private const COUNT_API_REQUESTS_OPTION_KEY        = 'gist_answers_count_api_requests';
	private const SIMULATE_API_SERVER_ERROR_OPTION_KEY = 'gist_answers_simulate_api_server_error';
	private const SIMULATE_API_TOKEN_ERROR_OPTION_KEY  = 'gist_answers_simulate_api_token_error';

	/**
	 * Flag indicating whether developer options have been loaded.
	 *
	 * @var boolean
	 */
	private static bool $options_loaded = false;

	/**
	 * Flag indicating whether API responses should be logged.
	 *
	 * @var boolean
	 */
	private static bool $should_log_api_responses = false;

	/**
	 * Flag indicating whether API backtraces should be logged.
	 *
	 * @var boolean
	 */
	private static bool $should_log_api_backtraces = false;

	/**
	 * Flag indicating whether API requests should be counted.
	 *
	 * @var boolean
	 */
	private static bool $should_count_api_requests = false;

	/**
	 * Flag indicating whether an API server error should be simulated.
	 *
	 * @var boolean
	 */
	private static bool $should_simulate_api_server_error = false;

	/**
	 * Flag indicating whether an API token error should be simulated.
	 *
	 * @var boolean
	 */
	private static bool $should_simulate_api_token_error = false;

	/**
	 * Class constructor.
	 *
	 * @param bool $in_submenu      Whether this menu item is a subitem.
	 * @param bool $is_network_menu Whether this menu item is in the network menu.
	 *
	 * @return void
	 */
	public function __construct( bool $in_submenu, bool $is_network_menu = false ) {
		parent::__construct( self::class, $in_submenu, $is_network_menu );
	}

	/**
	 * Data to be passed to the template for rendering.
	 *
	 * @return object Object containing data to be passed to the template.
	 */
	protected function with(): object {
		return (object) array(
			'source'        => $this->get_admin_page_source(),
			'page_title'    => __( 'Developer', 'gist-answers' ) . ' &rsaquo; ' . $this->display_name,
			'option_fields' => $this->get_option_fields(),
			'danger_fields' => $this->get_danger_fields(),
			'answer_pages'  => $this->get_answer_pages(),
		);
	}

	/**
	 * Load developer options if they have not already been loaded.
	 *
	 * @return void
	 */
	private static function maybe_load_developer_options(): void {
		if ( ! self::$options_loaded ) {

			if ( is_multisite() ) {

				self::$should_log_api_responses  = (bool) get_site_option( self::LOG_API_RESPONSES_OPTION_KEY, false );
				self::$should_log_api_backtraces = (bool) get_site_option( self::LOG_API_BACKTRACES_OPTION_KEY, false );
				self::$should_count_api_requests = (bool) get_site_option( self::COUNT_API_REQUESTS_OPTION_KEY, false );

				self::$should_simulate_api_server_error = (bool) get_site_option( self::SIMULATE_API_SERVER_ERROR_OPTION_KEY, false );
				self::$should_simulate_api_token_error  = (bool) get_site_option( self::SIMULATE_API_TOKEN_ERROR_OPTION_KEY, false );

			} else {

				self::$should_log_api_responses  = (bool) get_option( self::LOG_API_RESPONSES_OPTION_KEY, false );
				self::$should_log_api_backtraces = (bool) get_option( self::LOG_API_BACKTRACES_OPTION_KEY, false );
				self::$should_count_api_requests = (bool) get_option( self::COUNT_API_REQUESTS_OPTION_KEY, false );

				self::$should_simulate_api_server_error = (bool) get_option( self::SIMULATE_API_SERVER_ERROR_OPTION_KEY, false );
				self::$should_simulate_api_token_error  = (bool) get_option( self::SIMULATE_API_TOKEN_ERROR_OPTION_KEY, false );

			}

			self::$options_loaded = true;
		}
	}

	/**
	 * Get the API response logging flag.
	 *
	 * @return bool True if API responses should be logged; false otherwise.
	 */
	public static function should_log_api_responses(): bool {

		self::maybe_load_developer_options();

		return self::$should_log_api_responses;
	}

	/**
	 * Get the API backtrace logging flag.
	 *
	 * @return bool True if API backtraces should be logged; false otherwise.
	 */
	public static function should_log_api_backtraces(): bool {

		self::maybe_load_developer_options();

		return self::$should_log_api_backtraces;
	}

	/**
	 * Get the API request counting flag.
	 *
	 * @return bool True if API requests should be counted; false otherwise.
	 */
	public static function should_count_api_requests(): bool {

		self::maybe_load_developer_options();

		return self::$should_count_api_requests;
	}

	/**
	 * Get the API server error simulation flag.
	 *
	 * @return bool True if an API server error should be simulated; false otherwise.
	 */
	public static function should_simulate_api_server_error(): bool {

		self::maybe_load_developer_options();

		return self::$should_simulate_api_server_error;
	}

	/**
	 * Get the API token error simulation flag.
	 *
	 * @return bool True if an API token error should be simulated; false otherwise.
	 */
	public static function should_simulate_api_token_error(): bool {

		self::maybe_load_developer_options();

		return self::$should_simulate_api_token_error;
	}

	/**
	 * Get the option fields for the "Tools & Options" admin menu item.
	 *
	 * @return array<object> Array of option fields.
	 */
	private function get_option_fields(): array {
		return array(
			(object) array(
				'id'      => 'gist_answers_log_api_responses',
				'type'    => 'checkbox',
				'label'   => __( 'Log API responses', 'gist-answers' ),
				'prefill' => self::should_log_api_responses(),
			),
			(object) array(
				'id'      => 'gist_answers_log_api_backtraces',
				'type'    => 'checkbox',
				'label'   => __( 'Log API backtraces', 'gist-answers' ),
				'prefill' => self::should_log_api_backtraces(),
			),
			(object) array(
				'type' => 'logging-info',
			),
			(object) array(
				'type' => 'divider',
			),
			(object) array(
				'id'      => 'gist_answers_count_api_requests',
				'type'    => 'checkbox',
				'label'   => __( 'Count API requests', 'gist-answers' ),
				'prefill' => self::should_count_api_requests(),
			),
			(object) array(
				'id'      => 'gist_answers_simulate_api_server_error',
				'type'    => 'checkbox',
				'label'   => __( 'Simulate API server error', 'gist-answers' ),
				'prefill' => self::should_simulate_api_server_error(),
			),
			(object) array(
				'id'      => 'gist_answers_simulate_api_token_error',
				'type'    => 'checkbox',
				'label'   => __( 'Simulate API token expiration', 'gist-answers' ),
				'prefill' => self::should_simulate_api_token_error(),
			),
		);
	}

	/**
	 * Get the danger-zone fields for the "Tools & Options" admin menu item.
	 *
	 * @return array<object> Array of danger-zone fields.
	 */
	private function get_danger_fields(): array {
		$fields = array(
			(object) array(
				'id'      => 'gist_answers_delete_api_key',
				'type'    => 'checkbox',
				'label'   => __( 'Delete the API token from the database', 'gist-answers' ),
				'prefill' => false,
			),
			(object) array(
				'id'      => 'gist_answers_delete_content',
				'type'    => 'checkbox',
				'label'   => __( 'Move pages & posts containing Gist widgets to the Trash', 'gist-answers' ),
				'prefill' => false,
			),
			(object) array(
				'id'      => 'gist_answers_delete_widgets',
				'type'    => 'checkbox',
				'label'   => __( 'Delete Gist widgets from sidebars', 'gist-answers' ),
				'prefill' => false,
			),
			(object) array(
				'id'      => 'gist_answers_delete_options',
				'type'    => 'checkbox',
				'label'   => __( 'Delete all Gist Answers database options', 'gist-answers' ),
				'prefill' => false,
			),
		);

		// Deleting the plugin folder doesn't work in a development environment, on VIP, or where the folder is read-only.
		if ( Utilities::can_delete_plugin_folder() ) {
			$fields[] = (object) array(
				'id'      => 'gist_answers_delete_plugin',
				'type'    => 'checkbox',
				'label'   => __( 'Delete the Gist Answers plugin', 'gist-answers' ),
				'prefill' => false,
			);
		}

		return $fields;
	}

	/**
	 * Update the log API responses option.
	 *
	 * @param bool $flag Whether to enable or disable logging API responses.
	 *
	 * @return void
	 */
	public static function update_log_api_responses( bool $flag ): void {
		if ( is_multisite() ) {
			update_site_option( self::LOG_API_RESPONSES_OPTION_KEY, $flag );
		} else {
			update_option( self::LOG_API_RESPONSES_OPTION_KEY, $flag );
		}
	}

	/**
	 * Update the log API backtraces option.
	 *
	 * @param bool $flag Whether to enable or disable logging API backtraces.
	 *
	 * @return void
	 */
	public static function update_log_api_backtraces( bool $flag ): void {
		if ( is_multisite() ) {
			update_site_option( self::LOG_API_BACKTRACES_OPTION_KEY, $flag );
		} else {
			update_option( self::LOG_API_BACKTRACES_OPTION_KEY, $flag );
		}
	}

	/**
	 * Update the count API requests option.
	 *
	 * @param bool $flag Whether to enable or disable counting API requests.
	 *
	 * @return void
	 */
	public static function update_count_api_requests( bool $flag ): void {
		if ( is_multisite() ) {
			update_site_option( self::COUNT_API_REQUESTS_OPTION_KEY, $flag );
		} else {
			update_option( self::COUNT_API_REQUESTS_OPTION_KEY, $flag );
		}
	}

	/**
	 * Update the simulate API server error option.
	 *
	 * @param bool $flag Whether to enable or disable simulating API server errors.
	 *
	 * @return void
	 */
	public static function update_simulate_api_server_error( bool $flag ): void {
		if ( is_multisite() ) {
			update_site_option( self::SIMULATE_API_SERVER_ERROR_OPTION_KEY, $flag );
		} else {
			update_option( self::SIMULATE_API_SERVER_ERROR_OPTION_KEY, $flag );
		}
	}

	/**
	 * Update the simulate API token error option.
	 *
	 * @param bool $flag Whether to enable or disable simulating API token errors.
	 *
	 * @return void
	 */
	public static function update_simulate_api_token_error( bool $flag ): void {
		if ( is_multisite() ) {
			update_site_option( self::SIMULATE_API_TOKEN_ERROR_OPTION_KEY, $flag );
		} else {
			update_option( self::SIMULATE_API_TOKEN_ERROR_OPTION_KEY, $flag );
		}
	}

	/**
	 * Determine the source of the admin page for the "Tools & Options" menu item ('network' or 'subsite').
	 *
	 * @return string
	 */
	private function get_admin_page_source(): string {

		$current_screen = get_current_screen();

		return ( is_object( $current_screen ) && ( $current_screen->is_network ?? false ) ) ? 'network' : 'subsite';
	}

	/**
	 * Get the detected answer pages for the "Tools & Options" admin menu item.
	 *
	 * @return array<object> Array of detected answer page objects.
	 */
	public static function get_answer_pages(): array {
		return array_map(
			function ( $page ) {

				$post_id    = $page->post_id ?? null;
				$post_title = $page->post_title ?? '';
				$source     = AdminMain::get_source_display_text_for( $page->source ?? '', $page->post_type ?? '' );
				$post_url   = $page->post_url ?? '';
				$edit_url   = $page->edit_url ?? '';

				return sprintf(
					'<strong>%s</strong> (#%s) &bull; %s &bull; <a href="%s" target="_blank">View</a> &bull; <a href="%s" target="_blank">Edit</a>',
					$post_title,
					$post_id,
					$source,
					$post_url,
					$edit_url
				);
			},
			AnswerPages::get_detected(),
		);
	}
}
