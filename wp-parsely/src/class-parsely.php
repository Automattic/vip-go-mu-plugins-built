<?php
/**
 * Parsely class
 *
 * @package Parsely
 * @since   2.5.0
 */

declare(strict_types=1);

namespace Parsely;

use Parsely\UI\Metadata_Renderer;
use Parsely\UI\Settings_Page;
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
 *   track_authenticated_users: bool,
 *   lowercase_tags: bool,
 *   force_https_canonicals: bool,
 *   track_post_types: string[],
 *   track_page_types: string[],
 *   track_post_types_as?: array<string, string>,
 *   disable_javascript: bool,
 *   disable_amp: bool,
 *   meta_type: string,
 *   logo: string,
 *   metadata_secret: string,
 *   disable_autotrack: bool,
 *   plugin_version: string,
 * }
 *
 * @phpstan-type WP_HTTP_Request_Args array{
 *   method: string,
 *   timeout: float,
 *   blocking: bool,
 *   headers: array<string, string>,
 *   body: string,
 *   data_format: string,
 * }
 *
 * @phpstan-import-type Metadata_Attributes from Metadata
 */
class Parsely {
	/**
	 * Declare our constants
	 */
	public const VERSION                         = PARSELY_VERSION;
	public const MENU_SLUG                       = 'parsely'; // The page param passed to options-general.php.
	public const OPTIONS_KEY                     = 'parsely'; // The key used to store options in the WP database.
	public const CAPABILITY                      = 'manage_options'; // The capability required to administer settings.
	public const DASHBOARD_BASE_URL              = 'https://dash.parsely.com';
	public const PUBLIC_API_BASE_URL             = 'https://api.parsely.com/v2';
	public const PUBLIC_SUGGESTIONS_API_BASE_URL = 'https://content-suggestions-beta.parsely-recspod.net';

	/**
	 * Declare some class properties
	 *
	 * @var Parsely_Options $option_defaults The defaults we need for the class.
	 */
	private $option_defaults = array(
		'apikey'                    => '',
		'content_id_prefix'         => '',
		'api_secret'                => '',
		'use_top_level_cats'        => false,
		'custom_taxonomy_section'   => 'category',
		'cats_as_tags'              => false,
		'track_authenticated_users' => false,
		'lowercase_tags'            => true,
		'force_https_canonicals'    => false,
		'track_post_types'          => array(),
		'track_page_types'          => array(),
		'disable_javascript'        => false,
		'disable_amp'               => false,
		'meta_type'                 => 'json_ld',
		'logo'                      => '',
		'metadata_secret'           => '',
		'disable_autotrack'         => false,
		'plugin_version'            => self::VERSION,
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

		add_action( 'save_post', array( $this, 'update_metadata_endpoint' ) );
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
		static $cache = array();
		$post_id      = is_int( $post ) ? $post : $post->ID;
		if ( isset( $cache[ $post_id ] ) ) {
			return $cache[ $post_id ];
		}

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
			$cache[ $post_id ] = false;
			return false;
		}

		/**
		 * Filters the statuses that are permitted to be tracked.
		 *
		 * By default, the only status tracked is 'publish'. Use this filter if
		 * you have other published content that has a different (custom) status.
		 *
		 * @since 2.5.0
		 *
		 * @param string[]    $trackable_statuses The list of post statuses that are allowed to be tracked.
		 * @param int|WP_Post $post               Which post object or ID is being checked.
		 */
		$statuses          = apply_filters( 'wp_parsely_trackable_statuses', array( 'publish' ), $post );
		$cache[ $post_id ] = in_array( get_post_status( $post ), $statuses, true );
		return $cache[ $post_id ];
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
	 * Updates the Parsely metadata endpoint with the new metadata of the post.
	 *
	 * @param int $post_id id of the post to update.
	 */
	public function update_metadata_endpoint( int $post_id ): void {
		$parsely_options = $this->get_options();
		if ( $this->site_id_is_missing() || '' === $parsely_options['metadata_secret'] ) {
			return;
		}

		$post = get_post( $post_id );
		if ( null === $post ) {
			return;
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

		$parsely_api_endpoint    = self::PUBLIC_API_BASE_URL . '/metadata/posts';
		$parsely_metadata_secret = $parsely_options['metadata_secret'];

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
		 * @var WP_HTTP_Request_Args $options
		 */
		$options = array(
			'method'      => 'POST',
			'headers'     => $headers,
			'blocking'    => false,
			'body'        => $body,
			'data_format' => 'body',
		);

		$response = wp_remote_post( $parsely_api_endpoint, $options );

		if ( ! is_wp_error( $response ) ) {
			$current_timestamp = time();
			update_post_meta( $post_id, 'parsely_metadata_last_updated', $current_timestamp );
		}
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

		if ( ! is_array( $options ) ) {
			$this->set_default_track_as_values();
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
	 * Gets the URL of the plugin's settings page.
	 *
	 * @param int|null $_blog_id The Blog ID for the multisite subsite to use
	 *                           for context (Default null for current).
	 * @return string
	 */
	public static function get_settings_url( int $_blog_id = null ): string {
		return get_admin_url( $_blog_id, 'options-general.php?page=' . self::MENU_SLUG );
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
			self::PUBLIC_API_BASE_URL,
			self::PUBLIC_SUGGESTIONS_API_BASE_URL,
		);

		add_filter(
			'http_request_host_is_external',
			function ( $external, $host, $url ) use ( $allowed_urls ) {
				// Check if the URL matches any URLs on the allowed list.
				foreach ( $allowed_urls as $allowed_url ) {
					if ( \Parsely\Utils\str_starts_with( $url, $allowed_url ) ) {
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
