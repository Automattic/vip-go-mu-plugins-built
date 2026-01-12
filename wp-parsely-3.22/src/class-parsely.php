<?php
/**
 * Parsely class
 *
 * @package Parsely
 * @since   2.5.0
 */

declare(strict_types=1);

namespace Parsely;

use Parsely\REST_API\REST_API_Controller;
use Parsely\Services\Content_API\Content_API_Service;
use Parsely\Services\Suggestions_API\Suggestions_API_Service;
use Parsely\UI\Metadata_Renderer;
use Parsely\UI\Settings_Page;
use Parsely\Utils\Utils;
use WP_Post;

/**
 * Holds most of the logic for the plugin.
 *
 * @since 1.0.0
 * @since 2.5.0 Moved from plugin root file to this file.
 *
 * @phpstan-type Parsely_Options array{
 *   apikey: string,
 *   content_id_prefix: string,
 *   api_secret: string,
 *   use_top_level_cats: bool,
 *   custom_taxonomy_section: string,
 *   cats_as_tags: bool,
 *   content_helper: Parsely_Options_Content_Helper,
 *   headline_testing: Parsely_Options_Headline_Testing,
 *   track_authenticated_users: bool,
 *   lowercase_tags: bool,
 *   force_https_canonicals: bool,
 *   track_post_types: string[],
 *   track_page_types: string[],
 *   track_post_types_as?: array<string, string>,
 *   full_metadata_in_non_posts: bool,
 *   disable_javascript: bool,
 *   disable_amp: bool,
 *   meta_type: string,
 *   logo: string,
 *   metadata_secret: string,
 *   disable_autotrack: bool,
 *   plugin_version: string,
 * }
 *
 * @phpstan-type Parsely_Options_Content_Helper array{
 *   ai_features_enabled: bool,
 *   smart_linking: Parsely_Options_Content_Helper_Feature,
 *   title_suggestions: Parsely_Options_Content_Helper_Feature,
 *   excerpt_suggestions: Parsely_Options_Content_Helper_Feature,
 *   traffic_boost: Parsely_Options_Content_Helper_Feature,
 * }
 *
 * @phpstan-type Parsely_Options_Content_Helper_Feature array{
 *   enabled: bool,
 *   allowed_user_roles: string[],
 * }
 *
 * @phpstan-type Parsely_Options_Headline_Testing array{
 *   enabled: bool,
 *   installation_method: string,
 *   enable_flicker_control: bool,
 *   enable_live_updates: bool,
 *   live_update_timeout: int,
 *   allow_after_content_load: bool,
 * }
 *
 * @phpstan-type WP_HTTP_Request_Args array{
 *   method?: string,
 *   timeout?: float,
 *   blocking?: bool,
 *   headers?: array<string, string>,
 *   body?: string,
 *   data_format?: string,
 * }
 *
 * @phpstan-import-type Metadata_Attributes from Metadata
 */
class Parsely {
	/**
	 * Declare our constants
	 */
	public const VERSION            = PARSELY_VERSION;
	public const MENU_SLUG          = 'parsely-settings'; // The page param passed to admin.php.
	public const OPTIONS_KEY        = 'parsely'; // The key used to store options in the WP database.
	public const CAPABILITY         = 'manage_options'; // The capability required to administer settings.
	public const DASHBOARD_BASE_URL = 'https://dash.parsely.com';

	private const PARSELY_CANONICAL_URL_META_KEY = '_parsely_canonical_url';

	/**
	 * The Content API service.
	 *
	 * @var ?Content_API_Service $content_api_service
	 */
	private $content_api_service;

	/**
	 * The Suggestions API service.
	 *
	 * @var ?Suggestions_API_Service $suggestions_api_service
	 */
	private $suggestions_api_service;

	/**
	 * The Parse.ly internal REST API controller.
	 *
	 * @var REST_API_Controller|null $rest_api_controller
	 */
	private $rest_api_controller;

	/**
	 * Declare some class properties
	 *
	 * @var Parsely_Options $option_defaults The defaults we need for the class.
	 */
	private $option_defaults = array(
		'apikey'                     => '',
		'content_id_prefix'          => '',
		'api_secret'                 => '',
		'use_top_level_cats'         => false,
		'custom_taxonomy_section'    => 'category',
		'cats_as_tags'               => false,
		'content_helper'             => array(
			'ai_features_enabled' => true,
			'smart_linking'       => array(
				'enabled'            => true,
				'allowed_user_roles' => array( 'administrator' ),
			),
			'title_suggestions'   => array(
				'enabled'            => true,
				'allowed_user_roles' => array( 'administrator' ),
			),
			'excerpt_suggestions' => array(
				'enabled'            => true,
				'allowed_user_roles' => array( 'administrator' ),
			),
			'traffic_boost'       => array(
				'enabled'            => true,
				'allowed_user_roles' => array( 'administrator' ),
			),
		),
		'headline_testing'           => array(
			'enabled'                  => false,
			'installation_method'      => 'one_line',
			'enable_flicker_control'   => false,
			'enable_live_updates'      => false,
			'live_update_timeout'      => 30000,
			'allow_after_content_load' => false,
		),
		'track_authenticated_users'  => false,
		'lowercase_tags'             => true,
		'force_https_canonicals'     => false,
		'track_post_types'           => array(),
		'track_page_types'           => array(),
		'full_metadata_in_non_posts' => true,
		'disable_javascript'         => false,
		'disable_amp'                => false,
		'meta_type'                  => 'json_ld',
		'logo'                       => '',
		'metadata_secret'            => '',
		'disable_autotrack'          => false,
		'plugin_version'             => self::VERSION,
	);

	/**
	 * Declare post types that Parse.ly will process as "posts".
	 *
	 * @since 2.5.0
	 * @var string[]
	 *
	 * @link https://docs.parse.ly/metadata-jsonld/#distinguishing-between-posts-and-non-posts-pages
	 */
	public const SUPPORTED_JSONLD_POST_TYPES = array(
		'NewsArticle',
		'Article',
		'TechArticle',
		'BlogPosting',
		'LiveBlogPosting',
		'Report',
		'Review',
		'CreativeWork',
		'OpinionNewsArticle',
		'AnalysisNewsArticle',
		'BackgroundNewsArticle',
		'ReviewNewsArticle',
		'ReportageNewsArticle',
		'Recipe',
		'AdvertiserContentArticle',
		'MedicalWebPage',
		'PodcastEpisode',
	);

	/**
	 * Declare post types that Parse.ly will process as "non-posts".
	 *
	 * @since 2.5.0
	 * @var string[]
	 *
	 * @link https://docs.parse.ly/metadata-jsonld/#distinguishing-between-posts-and-non-posts-pages
	 */
	public const SUPPORTED_JSONLD_NON_POST_TYPES = array(
		'WebPage',
		'Event',
		'Hotel',
		'Restaurant',
		'Movie',
	);

	/**
	 * Declare all supported types (both post and non-post types).
	 *
	 * @since 3.7.0
	 * @var string[]
	 */
	private static $all_supported_types;

	/**
	 * Returns whether credentials are being managed at the platform level.
	 *
	 * This allows hosting providers to provide a more customized experience for
	 * the plugin by handling credentials automatically.
	 *
	 * @since 3.9.0
	 * @access private
	 * @var bool
	 */
	public $are_credentials_managed;

	/**
	 * Holds the managed options and their values.
	 *
	 * This allows hosting providers to provide a more customized experience for
	 * the plugin by handling options automatically.
	 *
	 * @since 3.9.0
	 * @access private
	 * @var array<empty>|array<string, bool|string|null>
	 */
	public $managed_options = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		self::$all_supported_types = array_merge( self::SUPPORTED_JSONLD_POST_TYPES, self::SUPPORTED_JSONLD_NON_POST_TYPES );

		$this->are_credentials_managed = $this->are_credentials_managed();
		$this->set_managed_options();

		$this->allow_parsely_remote_requests();
	}

	/**
	 * Gets the allowed post statuses for tracking.
	 *
	 * Uses the `wp_parsely_trackable_statuses` filter to determine which post statuses are allowed to be tracked.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_Post|int|null $post The post object.
	 * @return array<string> The allowed post statuses.
	 */
	public static function get_trackable_statuses( $post = null ): array {
		/**
		 * Filters the statuses that are permitted to be tracked.
		 *
		 * By default, the only status tracked is 'publish'. Use this filter if
		 * you have other published content that has a different (custom) status.
		 *
		 * @since 2.5.0
		 * @since 3.17.0 Filter extracted to a separate method.
		 *
		 * @param string[]         $trackable_statuses The list of post statuses that are allowed to be tracked.
		 * @param WP_Post|int|null $post               Which post object or ID is being checked.
		 */
		return apply_filters( 'wp_parsely_trackable_statuses', array( 'publish' ), $post );
	}

	/**
	 * Registers action and filter hook callbacks, and immediately upgrades
	 * options if needed.
	 */
	public function run(): void {
		// Run upgrade options if they exist for the version currently defined.
		$options = $this->get_options();
		if ( self::VERSION !== $options['plugin_version'] ) {
			$method = 'upgrade_plugin_to_version_' . str_replace( '.', '_', self::VERSION );
			if ( method_exists( $this, $method ) ) {
				/**
				 * Variable.
				 *
				 * @var callable
				 */
				$callable = array( $this, $method );
				call_user_func_array( $callable, array( $options ) );
			}

			// Update our version info.
			$options['plugin_version'] = self::VERSION;
			update_option( self::OPTIONS_KEY, $options );
		}

		// @phpstan-ignore return.void
		add_action( 'save_post', array( $this, 'call_update_metadata_endpoint' ) );
	}

	/**
	 * Returns the Content API service.
	 *
	 * This method returns the Content API service, which is used to interact with the Parse.ly Content API.
	 *
	 * @since 3.17.0
	 *
	 * @return Content_API_Service
	 */
	public function get_content_api(): Content_API_Service {
		if ( ! isset( $this->content_api_service ) ) {
			$this->content_api_service = new Content_API_Service( $this );
		}

		return $this->content_api_service;
	}

	/**
	 * Returns the Suggestions API service.
	 *
	 * This method returns the Suggestions API service, which is used to interact with the Parse.ly Suggestions API.
	 *
	 * @since 3.17.0
	 *
	 * @return Suggestions_API_Service
	 */
	public function get_suggestions_api(): Suggestions_API_Service {
		if ( ! isset( $this->suggestions_api_service ) ) {
			$this->suggestions_api_service = new Suggestions_API_Service( $this );
		}

		return $this->suggestions_api_service;
	}

	/**
	 * Gets the REST API controller.
	 *
	 * If the controller is not set, a new instance is created.
	 *
	 * @since 3.17.0
	 *
	 * @return REST_API_Controller
	 */
	public function get_rest_api_controller(): REST_API_Controller {
		if ( ! isset( $this->rest_api_controller ) ) {
			$this->rest_api_controller = new REST_API_Controller( $this );
		}

		return $this->rest_api_controller;
	}

	/**
	 * Gets the full URL of the JavaScript tracker file for the site. If an API
	 * key is not set, return an empty string.
	 *
	 * @since 3.2.0
	 *
	 * @return string
	 */
	public function get_tracker_url(): string {
		if ( $this->site_id_is_set() ) {
			$tracker_url = 'https://cdn.parsely.com/keys/' . $this->get_site_id() . '/p.js';
			return esc_url( $tracker_url );
		}
		return '';
	}

	/**
	 * Deprecated.
	 * Inserts the code for the <meta name='parsely-page'> parameter within the
	 * head tag.
	 *
	 * @since 3.2.0
	 * @deprecated 3.3.0
	 * @see Metadata_Renderer::render_metadata
	 *
	 * @param string $meta_type `json_ld` or `repeated_metas`.
	 */
	public function render_metadata( string $meta_type ): void {
		_deprecated_function( __FUNCTION__, '3.3', 'Metadata_Renderer::render_metadata()' );
		$metadata_renderer = new Metadata_Renderer( $this );
		$metadata_renderer->render_metadata( $meta_type );
	}

	/**
	 * Deprecated.
	 * Insert the code for the <meta name='parsely-page'> parameter within the
	 * head tag.
	 *
	 * @since 3.0.0
	 * @deprecated 3.3.0
	 * @see Metadata_Renderer::render_metadata
	 */
	public function insert_page_header_metadata(): void {
		_deprecated_function( __FUNCTION__, '3.3', 'Metadata_Renderer::render_metadata()' );
		$parsely_options   = $this->get_options();
		$metadata_renderer = new Metadata_Renderer( $this );
		$metadata_renderer->render_metadata( $parsely_options['meta_type'] );
	}

	/**
	 * Compares the post_status key against an allowed list.
	 *
	 * By default, only 'publish'ed content includes tracking data.
	 *
	 * @since 2.5.0
	 *
	 * @param int|WP_Post $post Which post object or ID to check.
	 * @return bool Should the post status be tracked for the provided post's post_type.
	 *              By default,only 'publish' is allowed.
	 */
	public static function post_has_trackable_status( $post ): bool {
		/**
		 * Filters whether the post password check should be skipped when getting
		 * the post trackable status.
		 *
		 * @since 3.0.1
		 *
		 * @param bool $skip True if the password check should be skipped.
		 * @param int|WP_Post $post Which post object or ID is being checked.
		 *
		 * @return bool
		 */
		$skip_password_check = apply_filters( 'wp_parsely_skip_post_password_check', false, $post );
		if ( ! $skip_password_check && post_password_required( $post ) ) {
			return false;
		}

		$statuses = self::get_trackable_statuses( $post );
		return in_array( get_post_status( $post ), $statuses, true );
	}

	/**
	 * Deprecated. Please use the `Metadata` class instead.
	 *
	 * Creates parsely metadata object from post metadata.
	 *
	 * @deprecated 3.3.0
	 * @see \Parsely\Metadata::construct_metadata
	 *
	 * @param array<string, mixed> $parsely_options parsely_options array.
	 * @param WP_Post              $post object.
	 * @return Metadata_Attributes
	 */
	public function construct_parsely_metadata( array $parsely_options, WP_Post $post ) {
		_deprecated_function( __FUNCTION__, '3.3', 'Metadata::construct_metadata()' );
		$metadata = new Metadata( $this );
		return $metadata->construct_metadata( $post );
	}

	/**
	 * Calls Parse.ly's update metadata endpoint, sending the post's updated
	 * metadata.
	 *
	 * @param int $post_id The ID of the post to update.
	 * @return bool True if the metadata endpoint was called, false otherwise.
	 */
	public function call_update_metadata_endpoint( int $post_id ): bool {
		$options = $this->get_options();

		if ( $this->site_id_is_missing() || '' === $options['metadata_secret'] ) {
			return false;
		}

		$current_post_type = get_post_type( $post_id );
		if ( false === $current_post_type ) {
			return false;
		}

		$tracked_post_types = array_merge(
			$options['track_post_types'],
			$options['track_page_types']
		);

		// Check that the post's type is trackable.
		if ( ! in_array( $current_post_type, $tracked_post_types, true ) ) {
			return false;
		}

		// Check that the post's status is trackable.
		if ( ! self::post_has_trackable_status( $post_id ) ) {
			return false;
		}

		$post = get_post( $post_id );
		if ( null === $post ) {
			return false;
		}

		// Don't call the endpoint when integration tests are running, but
		// signal that the above checks have passed.
		if ( defined( 'INTEGRATION_TESTS_RUNNING' ) ) {
			return true;
		}

		$metadata = ( new Metadata( $this ) )->construct_metadata( $post );

		$endpoint_metadata = array(
			'canonical_url' => $metadata['url'] ?? '',
			'page_type'     => $this->convert_jsonld_to_parsely_type( $metadata['@type'] ?? '' ),
			'title'         => $metadata['headline'] ?? '',
			'image_url'     => $metadata['image']['url'] ?? '',
			'pub_date_tmsp' => $metadata['datePublished'] ?? '',
			'section'       => $metadata['articleSection'] ?? '',
			'authors'       => $metadata['creator'] ?? '',
			'tags'          => $metadata['keywords'] ?? '',
		);

		$parsely_api_base_url    = Content_API_Service::get_base_url();
		$parsely_api_endpoint    = $parsely_api_base_url . '/metadata/posts';
		$parsely_metadata_secret = $options['metadata_secret'];

		$headers = array( 'Content-Type' => 'application/json' );
		$body    = wp_json_encode(
			array(
				'secret'   => $parsely_metadata_secret,
				'apikey'   => $this->get_site_id(),
				'metadata' => $endpoint_metadata,
			)
		);

		/**
		 * POST request options.
		 *
		 * @var WP_HTTP_Request_Args $request_options
		 */
		$request_options = array(
			'method'      => 'POST',
			'headers'     => $headers,
			'blocking'    => false,
			'body'        => $body,
			'data_format' => 'body',
		);

		$response = wp_remote_post( $parsely_api_endpoint, $request_options );

		if ( is_wp_error( $response ) ) {
			return false;
		}

		update_post_meta( $post_id, 'parsely_metadata_last_updated', time() );

		return true;
	}

	/**
	 * Safely returns options for the plugin by assigning defaults contained in
	 * optionDefaults.
	 *
	 * As soon as actual options are saved, they override the defaults. This
	 * prevents us from having to do a lot of isset() checking on variables.
	 *
	 * @return Parsely_Options
	 */
	public function get_options() {
		/**
		 * Variable.
		 *
		 * @var Parsely_Options|null
		 */
		$options = get_option( self::OPTIONS_KEY, null );

		// Existing plugin installation without full metadata option.
		/* @phpstan-ignore isset.offset, booleanAnd.alwaysFalse */
		if ( is_array( $options ) && ! isset( $options['full_metadata_in_non_posts'] ) ) {
			$this->set_default_full_metadata_in_non_posts();
		}

		// Existing plugin installation without Content Intelligence options.
		/* @phpstan-ignore isset.offset, booleanAnd.alwaysFalse */
		if ( is_array( $options ) && ! isset( $options['content_helper'] ) ) {
			$this->set_default_content_helper_settings_values();
		}

		// Existing plugin installation that's missing a Content Intelligence
		// feature option.
		/* @phpstan-ignore isset.offset */
		if ( is_array( $options ) && isset( $options['content_helper'] ) ) {
			/** @var array<string,Parsely_Options_Content_Helper_Feature> $pch_options */
			$pch_options = $options['content_helper'];

			/** @var array<string,Parsely_Options_Content_Helper_Feature> $pch_options_defaults */
			$pch_options_defaults = $this->option_defaults['content_helper'];

			if ( count( $pch_options ) !== count( $pch_options_defaults ) ) {
				$new_keys = array_diff(
					array_keys( $pch_options_defaults ),
					array_keys( $pch_options )
				);

				foreach ( $new_keys as $key ) {
					$options['content_helper'][ $key ] = $pch_options_defaults[ $key ];
				}
			}
		}

		// New plugin installation that hasn't saved its options yet.
		if ( ! is_array( $options ) ) {
			$this->set_default_track_as_values();
			$this->set_default_full_metadata_in_non_posts();
			$options = $this->option_defaults;
		}

		/**
		 * Final options including managed credentials and options.
		 *
		 * @var Parsely_Options
		 */
		return array_merge(
			$this->option_defaults,
			$options,
			$this->get_managed_credentials(),
			$this->managed_options
		);
	}

	/**
	 * Returns the value of a nested option.
	 *
	 * @since 3.16.0
	 *
	 * @param string          $option  The option to get.
	 * @param Parsely_Options $options The options to get the value from.
	 * @return mixed The value of the nested option.
	 */
	public static function get_nested_option_value( $option, $options ) {
		$keys  = explode( '[', str_replace( ']', '', $option ) );
		$value = $options;

		foreach ( $keys as $key ) {
			if ( isset( $value[ $key ] ) ) {
				$value = $value[ $key ];
			}
		}

		return $value;
	}

	/**
	 * Sets the default values for the track_post_types and track_page_types
	 * options.
	 *
	 * @since 3.9.0
	 */
	public function set_default_track_as_values(): void {
		$this->option_defaults['track_page_types'] = array();
		$this->option_defaults['track_post_types'] = array();

		$post_types = get_post_types( array( 'public' => true ) );

		foreach ( $post_types as $post_type ) {
			if ( ! post_type_supports( $post_type, 'editor' ) ) {
				continue;
			}

			if ( is_post_type_hierarchical( $post_type ) ) {
				$this->option_defaults['track_page_types'][] = $post_type;
			} else {
				$this->option_defaults['track_post_types'][] = $post_type;
			}
		}
	}

	/**
	 * Sets the default value for the full_metadata_in_non_posts option.
	 *
	 * @since 3.14.0
	 */
	public function set_default_full_metadata_in_non_posts(): void {
		$this->option_defaults['full_metadata_in_non_posts'] = true;

		// Usage of any of these filters will result in the setting being set
		// to false.
		$filter_tags = array(
			'wp_parsely_metadata',
			'wp_parsely_post_tags',
			'wp_parsely_permalink',
			'wp_parsely_post_category',
			'wp_parsely_pre_authors',
			'wp_parsely_post_authors',
			'wp_parsely_custom_taxonomies',
			'wp_parsely_post_type',
		);

		foreach ( $filter_tags as $filter_tag ) {
			if ( has_filter( $filter_tag ) ) {
				$this->option_defaults['full_metadata_in_non_posts'] = false;
				break;
			}
		}
	}

	/**
	 * Sets the default values for Content Intelligence options.
	 *
	 * Gives PCH access to all users having the edit_posts capability, to keep
	 * consistent behavior with plugin versions prior to 3.16.0.
	 *
	 * @since 3.16.0
	 */
	public function set_default_content_helper_settings_values(): void {
		$this->option_defaults['content_helper'] =
		Permissions::build_pch_permissions_settings_array(
			true,
			array_keys( Permissions::get_user_roles_with_edit_posts_cap() )
		);
	}

	/**
	 * Gets the URL of the plugin's settings page.
	 *
	 * @param int|null $_blog_id The Blog ID for the multisite subsite to use
	 *                           for context (Default null for current).
	 * @return string
	 */
	public static function get_settings_url( ?int $_blog_id = null ): string {
		return get_admin_url( $_blog_id, 'admin.php?page=' . self::MENU_SLUG );
	}

	/**
	 * Returns the URL of the Parse.ly dashboard for a specific page. If a page
	 * is not specified, the home dashboard URL for the specified Site ID is
	 * returned.
	 *
	 * @since 3.7.0
	 *
	 * @param string $site_id The Site ID for which to get the URL.
	 * @param string $page_url Optional. The page for which to get the URL.
	 * @return string The complete dashboard URL.
	 */
	public static function get_dash_url( string $site_id, string $page_url = '' ): string {
		$result = trailingslashit( self::DASHBOARD_BASE_URL . '/' . $site_id ) . 'find';

		if ( '' !== $page_url ) {
			$page_url = self::get_url_with_itm_source( $page_url, null );
			$result  .= '?url=' . rawurlencode( $page_url );
		}

		return $result;
	}

	/**
	 * Adds or replaces the itm_source parameter in the URL. Removes the
	 * parameter if the passed value is null or an empty string.
	 *
	 * @since 3.9.0
	 *
	 * @param string      $url The URL to modify.
	 * @param string|null $itm_source The value of the itm_source parameter.
	 * @return string The resulting URL.
	 */
	public static function get_url_with_itm_source( string $url, $itm_source ): string {
		if ( null === $itm_source || '' === $itm_source ) {
			return remove_query_arg( 'itm_source', $url );
		}

		$itm_source = rawurlencode( $itm_source );

		return add_query_arg( 'itm_source', $itm_source, $url );
	}

	/**
	 * Checks to see if the current user is a member of the current blog.
	 *
	 * @return bool
	 */
	public function is_blog_member_logged_in(): bool {
		// Can't use $blog_id here because it futzes with the global $blog_id.
		$current_blog_id = get_current_blog_id();
		$current_user_id = get_current_user_id();

		return is_user_member_of_blog( $current_user_id, $current_blog_id );
	}

	/**
	 * Converts JSON-LD type to respective Parse.ly page type.
	 *
	 * If the JSON-LD type is one of the types Parse.ly supports as a "post",
	 * then "post" will be returned. Otherwise, for "non-posts" and unknown
	 * types, "index" is returned.
	 *
	 * @since 2.5.0
	 *
	 * @see https://docs.parse.ly/metatags/#h-field-description
	 *
	 * @param string $type JSON-LD type.
	 * @return string "post" or "index".
	 */
	public function convert_jsonld_to_parsely_type( string $type ): string {
		return in_array( $type, self::SUPPORTED_JSONLD_POST_TYPES, true ) ? 'post' : 'index';
	}

	/**
	 * Determines if a Site ID is saved in the options.
	 *
	 * @since 2.6.0
	 * @since 3.7.0 renamed from api_key_is_set.
	 *
	 * @return bool True is Site ID is set, false if it is missing.
	 */
	public function site_id_is_set(): bool {
		$options = $this->get_options();

		return '' !== $options['apikey'];
	}

	/**
	 * Determines if a Site ID is not saved in the options.
	 *
	 * @since 2.6.0
	 * @since 3.7.0 renamed from api_key_is_missing.
	 *
	 * @return bool True if Site ID is missing, false if it is set.
	 */
	public function site_id_is_missing(): bool {
		return ! $this->site_id_is_set();
	}

	/**
	 * Gets the Site ID if set.
	 *
	 * @since 2.6.0
	 * @since 3.7.0 renamed from get_site_id.
	 *
	 * @return string Site ID if set, or empty string if not.
	 */
	public function get_site_id(): string {
		$options = $this->get_options();

		return $this->site_id_is_set() ? $options['apikey'] : '';
	}

	/**
	 * Returns whether the API Secret is set in the plugin's options.
	 *
	 * @since 3.4.0
	 *
	 * @return bool True if the API Secret is set, false if not set.
	 */
	public function api_secret_is_set(): bool {
		$options = $this->get_options();

		return '' !== $options['api_secret'];
	}

	/**
	 * Returns the API Secret stored in the plugin's options.
	 *
	 * @since 3.4.0
	 *
	 * @return string The API Secret, empty string if the API secret is not set.
	 */
	public function get_api_secret(): string {
		$options = $this->get_options();

		return $this->api_secret_is_set() ? $options['api_secret'] : '';
	}

	/**
	 * Returns all supported post and non-post types.
	 *
	 * @since 3.7.0
	 *
	 * @return string[] all supported types
	 */
	public function get_all_supported_types(): array {
		return self::$all_supported_types;
	}

	/**
	 * Gets all tracked post types.
	 *
	 * @since 3.7.0
	 *
	 * @return array<string>
	 */
	public function get_all_track_types(): array {
		$options = $this->get_options();

		return array_unique( array_merge( $options['track_post_types'], $options['track_page_types'] ) );
	}

	/**
	 * Gets default options.
	 *
	 * @since 3.8.0
	 *
	 * @return Parsely_Options
	 */
	public function get_default_options() {
		return $this->option_defaults;
	}

	/**
	 * Returns the credentials that are being managed at the platform level.
	 *
	 * @since 3.9.0
	 * @access private
	 *
	 * @return Parsely_Options|array<empty> The managed credentials.
	 */
	private function get_managed_credentials() {
		if ( true !== $this->are_credentials_managed ) {
			return array();
		}

		$credentials = apply_filters( 'wp_parsely_credentials', array() );

		if ( ! is_array( $credentials ) || 0 === count( $credentials ) ) {
			return array();
		}

		$result = array();

		if ( isset( $credentials['site_id'] ) ) {
			$result['apikey'] = $credentials['site_id'];
		}

		if ( isset( $credentials['api_secret'] ) ) {
			$result['api_secret'] = $credentials['api_secret'];
		}

		if ( isset( $credentials['metadata_secret'] ) ) {
			$result['metadata_secret'] = $credentials['metadata_secret'];
		}

		return $result;
	}

	/**
	 * Returns whether credentials are being managed at the platform level.
	 *
	 * @since 3.9.0
	 * @access private
	 *
	 * @return bool Whether credentials are being managed at the platform level.
	 */
	private function are_credentials_managed(): bool {
		$credentials = apply_filters( 'wp_parsely_credentials', array() );

		if ( ! is_array( $credentials ) || 0 === count( $credentials ) ) {
			return false;
		}

		return $credentials['is_managed'] ?? false;
	}

	/**
	 * Sets the values of managed options.
	 *
	 * This function won't accept managing credentials or certain plugin options
	 * that are being managed through other means. For managing credentials,
	 * please use the `wp_parsely_credentials` filter.
	 *
	 * @since 3.9.0
	 * @access private
	 */
	private function set_managed_options(): void {
		$managed_options = apply_filters( 'wp_parsely_managed_options', false );

		if ( ! is_array( $managed_options ) ) {
			return;
		}

		// Don't allow certain options to be set as managed.
		unset(
			$managed_options['apikey'],
			$managed_options['api_secret'],
			$managed_options['metadata_secret'],
			$managed_options['track_post_types'],
			$managed_options['track_page_types'],
			$managed_options['plugin_version']
		);

		if ( 0 === count( $managed_options ) ) {
			return;
		}

		/**
		 * Current options.
		 *
		 * @var Parsely_Options $current_options
		 */
		$current_options = get_option( self::OPTIONS_KEY, array() );

		// Set managed options values.
		foreach ( $managed_options as $key => $value ) {
			$is_option_valid = isset( $this->option_defaults[ $key ] );

			if ( $is_option_valid ) {
				if ( null === $value ) {
					// When null, the option gets its value from the database.
					$this->managed_options[ $key ] =
						$current_options[ $key ] ?? $this->option_defaults[ $key ];
				} else {
					$this->managed_options[ $key ] =
						$this->sanitize_managed_option( $key, $value );
				}
			}
		}
	}

	/**
	 * Gets the Parse.ly canonical URL for a given post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_Post|int $post The post ID or post object.
	 * @return string The Parse.ly canonical URL.
	 */
	public static function get_canonical_url_from_post( $post ): string {
		$post_id       = is_int( $post ) ? $post : $post->ID;
		$canonical_url = get_post_meta( $post_id, self::PARSELY_CANONICAL_URL_META_KEY, true );

		if ( null !== $canonical_url && is_string( $canonical_url ) && '' !== $canonical_url ) {
			return self::get_canonical_url( $canonical_url );
		}

		$permalink = get_permalink( $post );

		if ( false === $permalink ) {
			return __( 'no permalink', 'wp-parsely' );
		}

		return self::get_canonical_url( $permalink );
	}

	/**
	 * Returns the canonical version of the passed URL.
	 *
	 * In this context, the canonical URL is the URL containing the Site ID as
	 * its domain. If the Site ID differs from the real domain, the
	 * `wp_parsely_canonical_url_domain` filter can be used to set it.
	 *
	 * @since 3.19.0
	 * @since 3.20.4 Made the domain overridable.
	 *
	 * @param string $url The URL to get the canonical URL for.
	 * @return string The canonical URL.
	 */
	public static function get_canonical_url( string $url ): string {
		$canonical_url_domain = apply_filters(
			'wp_parsely_canonical_url_domain',
			null
		);

		// Handle domain override.
		if ( is_string( $canonical_url_domain ) ) {
			// Get the canonical URL domain without protocol, trailing slashes
			// or accidental whitespace.
			$canonical_url_domain = rtrim( trim( $canonical_url_domain ), '/' );
			$canonical_url_domain = preg_replace( '#^https?://#', '', $canonical_url_domain );

			if ( is_string( $canonical_url_domain ) && '' !== $canonical_url_domain ) {
				$url_domain = (string) wp_parse_url( $url, PHP_URL_HOST );
				return str_replace( $url_domain, $canonical_url_domain, $url );
			}
		}

		$site_id       = \Parsely\get_parsely()->get_site_id();
		$home_url_host = (string) wp_parse_url( home_url(), PHP_URL_HOST );

		if ( $home_url_host === $site_id ) {
			// URL does not need to be modified.
			return $url;
		}

		// Return the URL with the Site ID as the domain.
		return str_replace( $home_url_host, $site_id, $url );
	}

	/**
	 * Sets the Parse.ly canonical URL for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_Post|int $post The post object or post ID.
	 * @param string      $url The canonical URL.
	 * @return bool True if the canonical URL was set, false otherwise.
	 */
	public static function set_canonical_url( $post, string $url ): bool {
		$post_id       = is_int( $post ) ? $post : $post->ID;
		$canonical_url = self::get_canonical_url( $url );

		return false !== update_post_meta(
			$post_id,
			self::PARSELY_CANONICAL_URL_META_KEY,
			sanitize_url( $canonical_url, array( 'http', 'https' ) )
		);
	}

	/**
	 * Sanitizes the value of the passed managed option.
	 *
	 * @since 3.9.0
	 * @access private
	 *
	 * @param string      $option_id The option's ID.
	 * @param bool|string $value The option's value.
	 * @return bool|string The sanitized option value.
	 */
	private function sanitize_managed_option( string $option_id, $value ) {
		$option_value_type = gettype( $this->option_defaults[ $option_id ] );

		if ( 'boolean' === $option_value_type && ! is_bool( $value ) ) {
			_doing_it_wrong(
				__FUNCTION__,
				esc_html(
					sprintf( /* translators: 1: Option ID */
						__( 'The value of the managed option `%1$s` must be of type `boolean`.', 'wp-parsely' ),
						$option_id
					)
				),
				''
			);

			return false;
		}

		if ( 'string' === $option_value_type ) {
			if ( ! is_string( $value ) ) {
				_doing_it_wrong(
					__FUNCTION__,
					esc_html(
						sprintf( /* translators: 1: Option ID */
							__( 'The value of the managed option `%1$s` must be of type `string`.', 'wp-parsely' ),
							$option_id
						)
					),
					''
				);

				$value = strval( $value );
			}

			// String options that are restricted to specific values.
			$restricted_value_options = array(
				'custom_taxonomy_section' => Settings_Page::get_section_taxonomies(),
				'meta_type'               => array( 'json_ld', 'repeated_metas' ),
			);

			// Verify that the above values are respected.
			foreach ( $restricted_value_options as $option_key => $valid_values ) {
				if ( $option_id === $option_key ) {
					if ( ! in_array( $value, $valid_values, true ) ) {
						_doing_it_wrong(
							__FUNCTION__,
							esc_html(
								sprintf( /* translators: 1: Option value 2: Option ID */
									__( 'The value `%1$s` is not allowed for the managed option `%2$s`.', 'wp-parsely' ),
									$value,
									$option_id
								)
							),
							''
						);

						$value = $this->option_defaults[ $option_id ];
					}
				}
			}
		}

		return $value;
	}

	/**
	 * Allows remote requests to Parse.ly.
	 *
	 * This is needed for environments, such as wp-now, that block remote requests.
	 *
	 * @since 3.13.0
	 * @access private
	 */
	private function allow_parsely_remote_requests(): void {
		$allowed_urls = array(
			self::DASHBOARD_BASE_URL,
			Content_API_Service::get_base_url(),
			Suggestions_API_Service::get_base_url(),
		);

		add_filter(
			'http_request_host_is_external',
			function ( bool $external, string $host, string $url ) use ( $allowed_urls ) {
				// Check if the URL matches any URLs on the allowed list.
				foreach ( $allowed_urls as $allowed_url ) {
					if ( Utils::str_starts_with( $url, $allowed_url ) ) {
						return true;
					}
				}
				return $external;
			},
			10,
			3
		);
	}
}
