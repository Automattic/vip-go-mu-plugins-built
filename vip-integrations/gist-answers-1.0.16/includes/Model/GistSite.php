<?php
/**
 * Gist Site model class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Model;

use GistAnswers\Admin\AdminMain;
use GistAnswers\Admin\MenuItems\Dashboard;
use GistAnswers\API\Credentials;
use GistAnswers\API\Endpoint;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Gist Site model class for the Gist Answers plugin.
 */
final class GistSite {

	private const SHOW_DISCONNECT_ACTION = false;

	private const SITE_ACTIVATION_ERRORS_TRANSIENT = 'gist_answers_site_activation_errors';

	// Every transient this class sets (on each site, and network-wide on multisite), for the Danger Zone to delete.
	public const TRANSIENT_NAMES = array(
		self::SITE_ACTIVATION_ERRORS_TRANSIENT,
	);

	private const GATHER_POST_COUNTS = false;
	private const GATHER_CATEGORIES  = false;

	/**
	 * The ID of the blog/site.
	 *
	 * @var integer
	 */
	private int $blog_id = 0;

	/**
	 * The domain of the blog/site.
	 *
	 * @var string
	 */
	private string $domain = '';

	/**
	 * The display name of the blog/site.
	 *
	 * @var string
	 */
	private string $display_name = '';

	/**
	 * A searchable version of the display name.
	 *
	 * @var string
	 */
	private string $searchable_name = '';

	/**
	 * The number of posts on the blog/site.
	 *
	 * @var integer
	 */
	private int $post_count = 0;

	/**
	 * The home URL of the blog/site.
	 *
	 * @var string
	 */
	private string $home_url = '';

	/**
	 * The Gist Answers connection URL of the blog/site.
	 *
	 * @var string
	 */
	private string $gist_url = '';

	/**
	 * The WordPress admin URL of the blog/site.
	 *
	 * @var string
	 */
	private string $admin_url = '';

	/**
	 * The icon URL of the blog/site.
	 *
	 * @var string
	 */
	private string $icon_url = '';

	/**
	 * Whether the site has a stored Gist API token.
	 *
	 * @var boolean
	 */
	private bool $has_stored_api_token = false;

	/**
	 * Whether the site has a valid Gist API token.
	 *
	 * @var boolean
	 */
	private bool $has_valid_api_token = false;

	/**
	 * Publisher group data for this site.
	 *
	 * @var object|null
	 */
	private ?object $publisher_group = null;

	/**
	 * Publisher data for this site.
	 *
	 * @var object|null
	 */
	private ?object $publisher = null;

	/**
	 * Whether the site has a stored Gist.ai publisher.
	 *
	 * @var boolean
	 */
	private bool $has_stored_publisher = false;

	/**
	 * Widgets data for this site.
	 *
	 * @var object|null
	 */
	private ?object $widgets = null;

	/**
	 * Categories data for this site.
	 *
	 * @var array<object>
	 */
	private array $categories = array();

	/**
	 * Stored copy of the API token response.
	 *
	 * @var object|null
	 */
	private ?object $api_token_response = null;

	/**
	 * List of cached/already loaded sites.
	 *
	 * @var array<object>
	 */
	private static array $cached_sites = array();

	/**
	 * Cached site statuses for this page load.
	 *
	 * @var array<object>|null
	 */
	private static ?array $cached_site_statuses = null;

	/**
	 * Class constructor.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Loads the current site if omitted.
	 *
	 * @return void
	 */
	public function __construct( int $blog_id = 0 ) {

		$should_retry = $this->perform_setup( $blog_id );

		if ( $should_retry ) {
			$this->perform_setup( $blog_id );
		}
	}

	/**
	 * Perform setup procedures on this object.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Loads the current site if omitted.
	 *
	 * @return bool Whether the setup should be retried.
	 */
	private function perform_setup( int $blog_id = 0 ): bool {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		$this->blog_id = $blog_id;

		if ( ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$this->initialize_wp_site_details();

		$should_retry = $this->initialize_gist_site_details();

		if ( ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return $should_retry;
	}

	/**
	 * Initialize useful details about the WordPress site.
	 *
	 * @return void
	 */
	private function initialize_wp_site_details(): void {

		if ( is_multisite() ) {

			$site_details = get_site( $this->blog_id );

			if ( ! empty( (array) $site_details ) ) {

				$this->domain       = $site_details->domain ?? '';
				$this->display_name = get_option( 'blogname' );
				$this->home_url     = get_home_url( $this->blog_id );

				if ( self::GATHER_POST_COUNTS ) {
					$this->post_count = intval( $site_details->post_count ?? 0 );
				}
			}
		} else {

			$this->domain       = wp_parse_url( home_url(), PHP_URL_HOST );
			$this->display_name = get_bloginfo( 'name' );
			$this->home_url     = home_url();

			if ( self::GATHER_POST_COUNTS ) {

				$count_posts = wp_count_posts();

				$this->post_count = isset( $count_posts->publish ) ? intval( $count_posts->publish ) : 0;
			}
		}

		$this->searchable_name = Utilities::get_searchable_string( $this->display_name );

		$admin_menu_subpath = Dashboard::get_admin_menu_subpath();

		$this->gist_url  = get_admin_url( $this->blog_id, '/' . $admin_menu_subpath );
		$this->admin_url = get_admin_url( $this->blog_id );
		$this->icon_url  = get_site_icon_url( 512, GIST_ANSWERS_PLUGIN_URL . 'public/images/globe.png' );
	}

	/**
	 * Initialize useful details about the Gist site.
	 *
	 * @return boolean Whether the setup should be retried.
	 */
	private function initialize_gist_site_details(): bool {

		$should_retry = false;

		$this->has_stored_api_token = Credentials::has_stored_api_token();
		$this->has_valid_api_token  = Credentials::has_valid_api_token();

		$this->api_token_response = Endpoint::get_last_response();

		if ( $this->has_valid_api_token ) {

			$this->has_stored_api_token = true;

			$this->publisher_group = Credentials::get_publisher_group( $this->blog_id );
			$this->publisher       = Credentials::get_publisher( $this->blog_id );
			$this->widgets         = Credentials::get_widgets_raw( $this->blog_id );

			if ( self::GATHER_CATEGORIES ) {
				$this->categories = Credentials::get_categories();
			}
		}

		$this->has_stored_publisher = Credentials::has_stored_publisher();

		return $should_retry;
	}

	/**
	 * Get the blog/site ID.
	 *
	 * @return int ID of the blog/site.
	 */
	public function get_blog_id(): int {
		return $this->blog_id;
	}

	/**
	 * Get the blog/site domain.
	 *
	 * @return string Domain of the blog/site.
	 */
	public function get_domain(): string {
		return $this->domain;
	}

	/**
	 * Get the blog/site display name.
	 *
	 * @return string Display name of the blog/site.
	 */
	public function get_display_name(): string {
		return $this->display_name;
	}

	/**
	 * Get the searchable version of the blog/site display name.
	 *
	 * @return string Searchable display name of the blog/site.
	 */
	public function get_searchable_name(): string {
		return $this->searchable_name;
	}

	/**
	 * Get the number of posts on the blog/site.
	 *
	 * @return int Number of posts on the blog/site.
	 */
	public function get_post_count(): int {
		return $this->post_count;
	}

	/**
	 * Get the home URL of the blog/site.
	 *
	 * @return string URL of the blog/site home page.
	 */
	public function get_home_url(): string {
		return $this->home_url;
	}

	/**
	 * Get the Gist Answers connection URL of the blog/site.
	 *
	 * @return string URL of the Gist Answers connection page for the blog/site.
	 */
	public function get_gist_url(): string {
		return $this->gist_url;
	}

	/**
	 * Get the WordPress admin URL of the blog/site.
	 *
	 * @return string URL of the WordPress admin page for the blog/site.
	 */
	public function get_admin_url(): string {
		return $this->admin_url;
	}

	/**
	 * Get the icon URL of the blog/site.
	 *
	 * @return string URL of the blog/site icon.
	 */
	public function get_icon_url(): string {
		return $this->icon_url;
	}

	/**
	 * Check whether the site has a stored Gist API token.
	 *
	 * @return bool True if the site has a stored Gist API token, false otherwise.
	 */
	public function has_stored_api_token(): bool {
		return $this->has_stored_api_token;
	}

	/**
	 * Check whether the site has a valid Gist API token.
	 *
	 * @return bool True if the site has a valid Gist API token, false otherwise.
	 */
	public function has_valid_api_token(): bool {
		return $this->has_valid_api_token;
	}

	/**
	 * Get the publisher group data for the blog/site.
	 *
	 * @return object Publisher group data for the blog/site.
	 */
	public function get_publisher_group(): object {
		return is_object( $this->publisher_group ) ? $this->publisher_group : (object) array();
	}

	/**
	 * Get the publisher data for the blog/site.
	 *
	 * @return object Publisher data for the blog/site.
	 */
	public function get_publisher(): object {
		return is_object( $this->publisher ) ? $this->publisher : (object) array();
	}

	/**
	 * Get the publisher ID for the blog/site.
	 *
	 * @return string The publisher ID for the blog/site.
	 */
	public function get_publisher_id(): string {
		return is_object( $this->publisher ) ? ( $this->publisher->id ?? '' ) : '';
	}

	/**
	 * Check whether the site has a stored publisher.
	 *
	 * @return bool True if the site has a stored publisher, false otherwise.
	 */
	public function has_stored_publisher(): bool {
		return $this->has_stored_publisher;
	}

	/**
	 * Check whether the site has a valid publisher.
	 *
	 * @return bool True if the site has a valid publisher, false otherwise.
	 */
	public function has_valid_publisher(): bool {

		$publisher = $this->get_publisher();

		return boolval( $publisher->id ?? false );
	}

	/**
	 * Get the raw widgets data for the blog/site.
	 *
	 * @return object Raw widgets data for the blog/site.
	 */
	public function get_widgets_raw(): object {
		return is_object( $this->widgets ) ? $this->widgets : (object) array();
	}

	/**
	 * Get the chat (answer) widgets data for the blog/site.
	 *
	 * @return array<GistWidget> List of chat widgets for the blog/site.
	 */
	public function get_chat_widgets(): array {

		$widgets = $this->get_widgets_raw();

		$chat_widgets = is_object( $widgets ) ? ( $widgets->chat_widgets ?? array() ) : array();

		usort(
			$chat_widgets,
			function ( $a, $b ) {
				return ( $a->name ?? '' ) <=> ( $b->name ?? '' );
			}
		);

		return array_map( fn ( $widget ) => new GistWidget( $widget ), $chat_widgets );
	}

	/**
	 * Get the search (question) widgets data for the blog/site.
	 * `
	 *
	 * @return array<GistWidget> List of search widgets for the blog/site.
	 */
	public function get_search_widgets(): array {

		$widgets = $this->get_widgets_raw();

		$search_widgets = is_object( $widgets ) ? ( $widgets->search_widgets ?? array() ) : array();

		usort(
			$search_widgets,
			function ( $a, $b ) {
				return ( $a->name ?? '' ) <=> ( $b->name ?? '' );
			}
		);

		return array_map( fn ( $widget ) => new GistWidget( $widget ), $search_widgets );
	}

	/**
	 * Get the total number of widgets avaiable for this site.
	 *
	 * @return int The total number of widgets avaiable for this site.
	 */
	public function get_widgets_count(): int {

		$chat_widgets   = $this->get_chat_widgets();
		$search_widgets = $this->get_search_widgets();

		return count( $chat_widgets ) + count( $search_widgets );
	}

	/**
	 * Get the categories data for the blog/site.
	 *
	 * @return array<mixed> Categories data for the blog/site.
	 */
	public function get_categories(): array {
		return $this->categories;
	}

	/**
	 * Retrieve the category name matching the given ID (if avaialble).
	 *
	 * @param string $category_id ID of the category to retrieve the name for.
	 *
	 * @return string Name of the category matching the given ID, or empty string if not found.
	 */
	public function look_up_category_name( string $category_id ): string {

		if ( isset( $this->categories[ $category_id ] ) ) {
			return $this->categories[ $category_id ];
		}

		return '';
	}

	/**
	 * Validate the given category ID.
	 *
	 * @param string $category_id The category ID to validate.
	 *
	 * @return bool True if the category ID is valid, false otherwise.
	 */
	public function category_id_is_valid( string $category_id ): bool {
		return ! empty( $this->look_up_category_name( $category_id ) );
	}

	/**
	 * Retrieve the stored API token response.
	 *
	 * @return object The stored API token response.
	 */
	public function get_api_token_response(): object {
		return is_object( $this->api_token_response ) ? $this->api_token_response : (object) array();
	}

	/**
	 * Get a site by its ID (using the cached version if available).
	 *
	 * @param int $blog_id  Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return GistSite A valid GistSite object, either pulled from cache or loaded fresh.
	 */
	public static function get( int $blog_id = 0 ): GistSite {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		if ( ! isset( self::$cached_sites[ $blog_id ] ) ) {
			self::$cached_sites[ $blog_id ] = new GistSite( $blog_id );
		}

		return self::$cached_sites[ $blog_id ];
	}

	/**
	 * Forget the cached copy of a site, so the next call to get() loads it fresh.
	 *
	 * @param int $blog_id Optional ID of the blog/site. Defaults to 0.
	 *
	 * @return void
	 */
	public static function forget( int $blog_id = 0 ): void {

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		unset( self::$cached_sites[ $blog_id ] );
	}

	/**
	 * Store site activation errors as a transient for the next page load.
	 *
	 * @param array<object> $errors          Array of activation error messages.
	 * @param object        $activation_data Object containing activation data for the site.
	 *
	 * @return void
	 */
	public static function store_site_activation_errors( array $errors, object $activation_data ): void {

		$output = (object) array(
			'errors' => $errors,
			'data'   => $activation_data,
		);

		if ( is_multisite() ) {
			set_site_transient( self::SITE_ACTIVATION_ERRORS_TRANSIENT, $output, 60 );
		} else {
			set_transient( self::SITE_ACTIVATION_ERRORS_TRANSIENT, $output, 60 );
		}
	}

	/**
	 * Get stored site activation errors for the current page load.
	 *
	 * @return object Object containing activation data for the site, empty if none is stored.
	 */
	public static function get_site_activation_errors(): object {

		if ( is_multisite() ) {

			$transient = get_site_transient( self::SITE_ACTIVATION_ERRORS_TRANSIENT );

			delete_site_transient( self::SITE_ACTIVATION_ERRORS_TRANSIENT );

		} else {

			$transient = get_transient( self::SITE_ACTIVATION_ERRORS_TRANSIENT );

			delete_transient( self::SITE_ACTIVATION_ERRORS_TRANSIENT );
		}

		return is_object( $transient ) ? $transient : (object) array();
	}

	/**
	 * Determine if the given chat (answer) widget ID is valid for this site.
	 *
	 * @param string $widget_id The chat (answer) widget ID to validate.
	 *
	 * @return bool True if the widget ID is valid, false otherwise.
	 */
	public function chat_widget_id_is_valid( string $widget_id ): bool {

		$chat_widgets = $this->get_chat_widgets();

		$chat_widget_ids = Utilities::safe_list_pluck( $chat_widgets, 'id' );

		return in_array( $widget_id, $chat_widget_ids, true );
	}

	/**
	 * Determine if the given search (question) widget ID is valid for this site.
	 *
	 * @param string $widget_id The search (question) widget ID to validate.
	 *
	 * @return bool True if the widget ID is valid, false otherwise.
	 */
	public function search_widget_id_is_valid( string $widget_id ): bool {

		$search_widgets = $this->get_search_widgets();

		$search_widget_ids = Utilities::safe_list_pluck( $search_widgets, 'id' );

		return in_array( $widget_id, $search_widget_ids, true );
	}

	/**
	 * Determine whether this site is properly connected to Gist.ai (i.e., has a valid API token and publisher).
	 *
	 * @return bool True if the site is properly connected, false otherwise.
	 */
	public function is_connected(): bool {
		return $this->has_valid_api_token() && $this->has_valid_publisher();
	}

	/**
	 * Retrieve the source of the API token (environment variable, constant, or database).
	 *
	 * @return string The source of the API token ('environment', 'constant', 'database', or 'undedfined').
	 */
	public static function get_api_token_source(): string {
		return Credentials::get_api_token_source();
	}

	/**
	 * Let outside code know whether cagegory gathering is enabled for this site.
	 *
	 * @return bool True if category gathering is enabled, false otherwise.
	 */
	public static function should_gather_categories(): bool {
		return self::GATHER_CATEGORIES;
	}

	/**
	 * Load or reload the list of categorie sofr this site.
	 *
	 * @return void
	 */
	public function reload_categories(): void {
		$this->categories = Credentials::get_categories();
	}

	/**
	 * Retrieve the default category ID for this site.
	 *
	 * @return string The default category ID for this site.
	 */
	public function get_default_category_id(): string {

		$categories = $this->get_categories();

		$other_category_id = array_search( 'Other', $categories, true );
		$other_category_id = false === $other_category_id ? key( $categories ) : $other_category_id;

		return strval( $other_category_id );
	}

	/**
	 * Get the cached ingestion status for this site.
	 *
	 * @return object The cached ingestion status for this site.
	 */
	public function get_cached_status(): object {

		if ( ! is_array( self::$cached_site_statuses ) ) {
			self::$cached_site_statuses = AdminMain::get_cached_site_statuses();
		}

		$publisher_id = $this->get_publisher_id() ?? '';

		$maybe_site_status = self::$cached_site_statuses[ $publisher_id ] ?? null;

		return is_object( $maybe_site_status ) ? $maybe_site_status : (object) array();
	}
}
