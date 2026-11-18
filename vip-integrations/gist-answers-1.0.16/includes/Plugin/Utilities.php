<?php
/**
 * Helpful utilities for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Plugin;

use WP_Post;
use WP_Query;

use GistAnswers\Admin\AdminMain;
use GistAnswers\Admin\MenuItems;
use GistAnswers\API\Credentials;
use GistAnswers\Model\GistSite;
use GistAnswers\Model\GistWidget;
use GistAnswers\Plugin\AnswerPages;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Helpful utilities for the Gist Answers plugin.
 */
final class Utilities {

	/**
	 * How long (in seconds) the token hash given to a CMS iframe lets the current user create or move answer pages
	 * (see get_token_hash_from_embed_uuid()); it ends sooner if the iframe's embed ticket expires sooner.
	 *
	 * @var int
	 */
	private const ANSWER_PAGE_GRANT_DURATION = 30 * MINUTE_IN_SECONDS;

	/**
	 * The object cache group for locks that apply to one site (see acquire_lock()).
	 *
	 * @var string
	 */
	private const LOCK_CACHE_GROUP = 'gist_answers_locks';

	/**
	 * The object cache group for locks that apply to the whole network (see acquire_lock()).
	 *
	 * @var string
	 */
	private const NETWORK_LOCK_CACHE_GROUP = 'gist_answers_network_locks';

	/**
	 * Words that mark a domain as a pre-production site.
	 *
	 * @var array<string>
	 */
	private const PREPRODUCTION_WORDS = array(
		'preproduction',
		'engineering',
		'staging',
		'testing',
		'test',
	);

	/**
	 * Regular expression matching `dev` (optionally numbered, e.g. `dev2`), which also marks a pre-production site.
	 * (Words that merely contain `dev`, such as `developer` or `devonlive`, don't.)
	 *
	 * @var string
	 */
	private const PREPRODUCTION_DEV_PATTERN = '/^dev\d*$/';

	/**
	 * Second-level labels of country-code domains (e.g., the `co` in `example.co.uk`), which aren't the site's name.
	 *
	 * @var array<string>
	 */
	private const SECOND_LEVEL_LABELS = array(
		'ac',
		'co',
		'com',
		'edu',
		'gov',
		'net',
		'org',
	);

	/**
	 * Extract a translated display name and slug from the given class or divider name.
	 *
	 * @param string $class_name The class or divider name to be extracted.
	 *
	 * @return array<string> Array containing the translated display name and slug for the class.
	 */
	public static function extract_class_name_details( string $class_name ): array {

		$stripped_class_name = explode( '\\', $class_name );
		$stripped_class_name = array_pop( $stripped_class_name );

		$display_name = preg_replace( '/(?<=[a-z])(?=[A-Z])/', ' ', $stripped_class_name );

		$slug = sanitize_title( $display_name );

		$translated_display_name = MenuItems::translate_class_display_name( $display_name );

		return array( $translated_display_name, $slug );
	}

	/**
	 * Extract a translated display name and slug from the given divider heading name.
	 *
	 * @param string $divider_heading_name The divider heading name to be extracted.
	 *
	 * @return array<string> Array containing the translated display name and slug for the divider heading.
	 */
	public static function extract_divider_heading_name_details( string $divider_heading_name ): array {

		$slug = sanitize_title( $divider_heading_name );

		$translated_display_name = MenuItems::translate_divider_heading_display_name( $divider_heading_name );

		return array( $translated_display_name, $slug );
	}

	/**
	 * Determine if the domains match in the given URLs (once normalized; see normalize_domain()).
	 *
	 * @param string $url_1 The first URL to compare.
	 * @param string $url_2 The second URL to compare.
	 *
	 * @return bool True if the domains match, false otherwise.
	 */
	public static function do_domains_match( string $url_1, string $url_2 ): bool {

		$domain_1 = self::normalize_domain( $url_1 );

		return '' !== $domain_1 && self::normalize_domain( $url_2 ) === $domain_1;
	}

	/**
	 * Normalize a URL or domain for comparison.
	 *
	 * Lowercases it and strips the scheme (e.g., `https://`), any port, query string, or fragment, a leading `www.`,
	 * and a trailing slash. Any path is kept, so subdirectory sites don't match the site at the root of their domain.
	 *
	 * @param string $url The URL or domain to normalize (e.g., `https://www.example.com/`).
	 *
	 * @return string The normalized domain (e.g., `example.com`), or an empty string if there is none.
	 */
	public static function normalize_domain( string $url ): string {

		$url = strtolower( trim( $url ) );
		$url = preg_replace( '#^[a-z][a-z0-9+.\-]*://#', '', $url );
		$url = preg_replace( '/[?#].*$/', '', $url );

		$slash_index = strpos( $url, '/' );

		$host = false === $slash_index ? $url : substr( $url, 0, $slash_index );
		$path = false === $slash_index ? '' : substr( $url, $slash_index );

		$host = preg_replace( '/:\d+$/', '', $host );

		if ( defined( 'GIST_ANSWERS_DEVELOPMENT_MODE' ) && GIST_ANSWERS_DEVELOPMENT_MODE && function_exists( 'gist_answers_update_local_host' ) ) {
			$host = strtolower( gist_answers_update_local_host( $host ) );
		}

		$host = preg_replace( '/^www\./', '', $host );

		return rtrim( $host . $path, '/' );
	}

	/**
	 * Extract the host from the given URL.
	 *
	 * @param string $url The URL to extract the host from.
	 *
	 * @return string The extracted host.
	 */
	public static function extract_host_from_url( string $url ): string {

		$url = strtolower( $url );

		if ( str_starts_with( $url, 'http' ) ) {
			$host = wp_parse_url( $url, PHP_URL_HOST );
		} else {
			$host = $url;
		}

		if ( defined( 'GIST_ANSWERS_DEVELOPMENT_MODE' ) && GIST_ANSWERS_DEVELOPMENT_MODE && function_exists( 'gist_answers_update_local_host' ) ) {
			$host = gist_answers_update_local_host( $host );
		}

		return strtolower( $host );
	}

	/**
	 * Determine whether a URL or domain looks like a pre-production (e.g., staging or development) site.
	 *
	 * It does if one of PREPRODUCTION_WORDS, or `dev` (or e.g. `dev2`), appears in it as a whole word, where it marks
	 * a copy of a site rather than the site's own name (see strip_preproduction_words()). So e.g. `staging.example.com`,
	 * `example-staging.com` and `example.com/dev` count, but `testing.com`, `dev.to`, `test-kitchen.com` and
	 * `example.dev` don't.
	 *
	 * @param string $url The URL or domain to check.
	 *
	 * @return bool True if it looks like a pre-production site, false otherwise.
	 */
	public static function is_preproduction_domain( string $url ): bool {

		[ , $is_preproduction ] = self::strip_preproduction_words( $url );

		return $is_preproduction;
	}

	/**
	 * Get the key used to match a pre-production site to its production site.
	 *
	 * The key is the normalized domain with the pre-production words (see is_preproduction_domain()) and all
	 * separators removed, so e.g. `staging.example.com`, `example-staging.com`, `dev.example.com`, and
	 * `example.com/dev` all have the same key as `example.com`.
	 *
	 * @param string $url The URL or domain.
	 *
	 * @return string The production match key, or an empty string if there is none.
	 */
	public static function get_production_match_key( string $url ): string {

		[ $production_match_key ] = self::strip_preproduction_words( $url );

		return $production_match_key;
	}

	/**
	 * Remove the separators, and the words that mark a pre-production site, from a URL or domain.
	 *
	 * A word (one of PREPRODUCTION_WORDS, or `dev`, between `.`, `-` or `/`) counts in a subdomain
	 * (`staging.example.com`), in the path (`example.com/dev`), or at the end of the domain's own name, after a hyphen
	 * (`example-staging.com`). It doesn't count as the whole of the domain's name (`testing.com`, `dev.to`) or at its
	 * start (`test-kitchen.com`), as those are as likely to be the site's own name. The top-level domain (and a
	 * country-code domain's second-level label, as in `example.co.uk`) is never counted.
	 *
	 * @param string $url The URL or domain.
	 *
	 * @return array{0: string, 1: bool} The URL or domain with the separators and those words removed, and whether
	 *                                   there were any such words.
	 */
	private static function strip_preproduction_words( string $url ): array {

		$domain = self::normalize_domain( $url );

		$slash_index = strpos( $domain, '/' );

		$host = false === $slash_index ? $domain : substr( $domain, 0, $slash_index );
		$path = false === $slash_index ? '' : substr( $domain, $slash_index + 1 );

		$labels = '' === $host ? array() : explode( '.', $host );

		$top_level_domain = count( $labels ) > 1 ? array_pop( $labels ) : '';

		// The label that names the domain itself, e.g. `example` in `staging.example.com` or `example.co.uk`.
		$name_index = count( $labels ) - 1;

		if ( $name_index > 0 && in_array( $labels[ $name_index ], self::SECOND_LEVEL_LABELS, true ) ) {
			--$name_index;
		}

		$words_found = false;
		$kept        = array();

		$segments = array_merge(
			array_map( fn ( $label, $index ) => array( $label, $index < $name_index ), $labels, array_keys( $labels ) ),
			array_map( fn ( $segment ) => array( $segment, true ), '' === $path ? array() : explode( '/', $path ) )
		);

		foreach ( $segments as $index => [ $segment, $anywhere ] ) {

			$parts = explode( '-', $segment );

			if ( $anywhere ) {

				$remaining = array_filter( $parts, fn ( $part ) => ! self::is_preproduction_word( $part ) );

				$words_found = $words_found || count( $remaining ) < count( $parts );

				$parts = $remaining;

			} elseif ( $index === $name_index ) {

				// Only words at the end of the domain's name count, and its first part is always kept.
				$part_count = count( $parts );

				while ( $part_count > 1 && self::is_preproduction_word( $parts[ $part_count - 1 ] ) ) {

					array_pop( $parts );

					--$part_count;

					$words_found = true;
				}
			}

			$kept[] = implode( '', $parts );
		}

		return array( implode( '', $kept ) . $top_level_domain, $words_found );
	}

	/**
	 * Determine whether a single word of a domain (between `.`, `-` or `/`) marks a pre-production site.
	 *
	 * @param string $word The word.
	 *
	 * @return bool True if it's one of PREPRODUCTION_WORDS, or `dev` (optionally numbered), false otherwise.
	 */
	private static function is_preproduction_word( string $word ): bool {
		return in_array( $word, self::PREPRODUCTION_WORDS, true ) || 1 === preg_match( self::PREPRODUCTION_DEV_PATTERN, $word );
	}

	/**
	 * Extract shortcode data from the given post content starting at the specified index.
	 *
	 * @param string $post_content The post content containing the shortcode.
	 * @param int    $start_index  The index to start searching for the shortcode.
	 *
	 * @return object An object containing the extracted shortcode data.
	 */
	public static function extract_shortcode_data_from( string $post_content, int $start_index ): object {

		$shortcode_data = (object) array(
			'shortcode' => '',
			'params'    => array(),
		);

		$end_index = strpos( $post_content, ']', $start_index );

		if ( false !== $end_index ) {

			$shortcode_content    = substr( $post_content, $start_index, $end_index - $start_index + 1 );
			$shortcode_components = shortcode_parse_atts( trim( $shortcode_content, '[]' ) );

			$shortcode_data->shortcode = array_shift( $shortcode_components );
			$shortcode_data->params    = $shortcode_components;
		}

		return $shortcode_data;
	}

	/**
	 * Get the page slug from the given URL.
	 *
	 * @param string $post_url The URL to extract the page slug from.
	 *
	 * @return string The extracted page slug.
	 */
	public static function get_page_slug_from_url( string $post_url ): string {
		// A URL without a path (e.g., the home page's `https://example.com`) makes wp_parse_url() return null.
		return trim( ! empty( $post_url ) ? strval( wp_parse_url( $post_url, PHP_URL_PATH ) ) : '', '/' );
	}

	/**
	 * Get the post ID from the given page slug.
	 *
	 * @param string        $page_slug  The page slug to get the post ID for.
	 * @param int           $blog_id    Optional blog ID to query within (for multisite setups).
	 * @param array<string> $post_types Optional post types to look in. Defaults to every public post type.
	 *
	 * @return int The post ID corresponding to the given page slug.
	 */
	public static function get_post_id_from_page_slug( string $page_slug, int $blog_id = 0, array $post_types = array() ): int {

		if ( is_multisite() && ! empty( $blog_id ) ) {
			switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
		}

		$post_types = empty( $post_types ) ? get_post_types( array( 'public' => true ) ) : $post_types;

		$maybe_post = get_page_by_path( $page_slug, OBJECT, $post_types );

		$post_id = intval( is_object( $maybe_post ) ? ( $maybe_post->ID ?? 0 ) : 0 );

		if ( is_multisite() && ! empty( $blog_id ) ) {
			restore_current_blog();
		}

		return $post_id;
	}

	/**
	 * A helper function to safely pluck values from an array of arrays or objects.
	 *
	 * @param array<mixed> $the_list An array of arrays or objects to pluck values from.
	 * @param string       $key      The key or property name to pluck.
	 *
	 * @return array<mixed> An array of plucked values.
	 */
	public static function safe_list_pluck( array $the_list, string $key ): array {

		$values = array();

		foreach ( $the_list as $item ) {

			if ( is_array( $item ) ) {

				$values[] = $item[ $key ] ?? null;

			} elseif ( is_object( $item ) ) {

				if ( array_key_exists( $key, get_object_vars( $item ) ) ) {

					$values[] = $item->$key;

				} else {

					$getter = 'get_' . $key;

					$values[] = method_exists( $item, $getter ) ? $item->$getter() : null;
				}
			}
		}

		return array_filter( $values );
	}

	/**
	 * Get the URL of the page currently being rendered.
	 *
	 * @return string The URL of the page currently being rendered.
	 */
	public static function get_current_page_url(): string {

		global $wp;

		return home_url( add_query_arg( array(), $wp->request ?? null ) );
	}

	/**
	 * Get the current build environment slug.
	 *
	 * @return string The current build environment slug.
	 */
	public static function get_build_environment_slug(): string {

		$build_environment_slug = defined( 'GIST_ANSWERS_BUILD_ENVIRONMENT' ) ? GIST_ANSWERS_BUILD_ENVIRONMENT : 'production';

		if ( str_contains( $build_environment_slug, '.BUILD_ENVIRONMENT.' ) ) {
			$build_environment_slug = 'local-dev';
		}

		return $build_environment_slug;
	}

	/**
	 * Get the script tag `src` attribute from the given JS snippet.
	 *
	 * @param string $js_snippet The JS snippet to extract the `src` attribute from.
	 *
	 * @return string The extracted `src` attribute value, or an empty string if not found.
	 */
	public static function get_script_tag_src( string $js_snippet ): string {

		preg_match( '/<script\s+[^>]*src=["\']([^"\']+)["\'][^>]*><\/script>/', $js_snippet, $matches );

		return $matches[1] ?? '';
	}

	/**
	 * Delete all Gist Answers plugin-related options from the WordPress database.
	 *
	 * @return void
	 */
	public static function delete_api_key_from_database(): void {
		Credentials::delete_api_token();
	}

	/**
	 * Delete all pages and posts that contain Gist Answers widgets from the WordPress database.
	 *
	 * @return void
	 */
	public static function delete_content_with_widgets(): void {

		$blog_ids = self::get_all_blog_ids();

		foreach ( $blog_ids as $blog_id ) {

			if ( ! empty( $blog_id ) && is_multisite() ) {
				switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
			}

			$answer_page_ids = array_merge(
				AnswerPages::get_post_ids_with_gist_answer_block(),
				AnswerPages::get_post_ids_with_gist_question_block(),
				AnswerPages::get_post_ids_with_gist_shortcode(),
			);

			$answer_page_ids = array_unique( $answer_page_ids );

			// The content search above matches text, so check that each post really contains a Gist block or
			// shortcode (rather than, e.g., mentioning one in its text) before moving it to the Trash.
			foreach ( $answer_page_ids as $post_id ) {

				$post = get_post( $post_id );

				if (
					is_object( $post ) &&
					(
						has_block( 'gist-answers/answer', $post ) ||
						has_block( 'gist-answers/question', $post ) ||
						has_shortcode( strval( $post->post_content ), 'gist_answers_render_widget' )
					)
				) {
					wp_trash_post( $post_id );
				}
			}

			if ( ! empty( $blog_id ) && is_multisite() ) {
				restore_current_blog();
			}
		}
	}

	/**
	 * Delete all Gist Answers plugin-related sidebar widgets from the WordPress database.
	 *
	 * @return void
	 */
	public static function delete_sidebar_widgets(): void {

		$blog_ids = self::get_all_blog_ids();

		foreach ( $blog_ids as $blog_id ) {

			if ( ! empty( $blog_id ) && is_multisite() ) {
				switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
			}

			$sidebars_widgets = get_option( 'sidebars_widgets', array() );

			foreach ( $sidebars_widgets as $sidebar_id => $widgets_list ) {

				if ( is_array( $widgets_list ) ) {
					foreach ( $widgets_list as $index => $widget_id ) {
						if ( str_starts_with( $widget_id, 'gist_answers_' ) ) {
							unset( $sidebars_widgets[ $sidebar_id ][ $index ] );
						}
					}

					$sidebars_widgets[ $sidebar_id ] = array_values( $sidebars_widgets[ $sidebar_id ] );
				}
			}

			update_option( 'sidebars_widgets', $sidebars_widgets );

			delete_option( 'widget_gist_answers_answer_widget' );
			delete_option( 'widget_gist_answers_question_widget' );

			if ( ! empty( $blog_id ) && is_multisite() ) {
				restore_current_blog();
			}
		}

		if ( is_multisite() ) {
			delete_site_option( 'widget_gist_answers_answer_widget' );
			delete_site_option( 'widget_gist_answers_question_widget' );
		}
	}

	/**
	 * Delete all Gist Answers plugin-related options and transients from the WordPress database.
	 *
	 * The plugin's transients are deleted by name too, as with a persistent object cache (as on WordPress VIP) they
	 * are kept there rather than in the options table, where the query below can't find them.
	 *
	 * @return void
	 */
	public static function delete_all_database_options(): void {

		global $wpdb;

		$transient_names = array_merge( Credentials::TRANSIENT_NAMES, AdminMain::TRANSIENT_NAMES, AnswerPages::TRANSIENT_NAMES, GistSite::TRANSIENT_NAMES, array( Activate::NEW_ACTIVATION_FLAG ) );

		foreach ( self::get_all_blog_ids() as $blog_id ) {

			if ( ! empty( $blog_id ) && is_multisite() ) {
				switch_to_blog( $blog_id ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- Intentional multisite operation on the target site's data (options and posts); restore_current_blog() follows.
			}

			// The widget IDs come from the stored publisher data, so the cached widget code goes before the options do.
			$widget_transient_names = array_map( array( GistWidget::class, 'get_cache_transient_name' ), Credentials::get_stored_widget_ids() );

			foreach ( array_merge( $transient_names, $widget_transient_names ) as $transient_name ) {
				delete_transient( $transient_name );
			}

			// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- The options API can't list option names by prefix; the options themselves are deleted through it (below), so the object cache is cleared too.
			$option_names = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT option_name FROM $wpdb->options WHERE option_name LIKE %s OR option_name LIKE %s",
					$wpdb->esc_like( 'gist_answers_' ) . '%',
					$wpdb->esc_like( '_transient_gist_answers_' ) . '%',
				)
			);
			// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

			foreach ( $option_names as $option_name ) {
				if ( str_starts_with( $option_name, '_transient_' ) ) {
					delete_transient( substr( $option_name, strlen( '_transient_' ) ) );
				} else {
					delete_option( $option_name );
				}
			}

			if ( ! empty( $blog_id ) && is_multisite() ) {
				restore_current_blog();
			}
		}

		if ( is_multisite() ) {

			foreach ( $transient_names as $transient_name ) {
				delete_site_transient( $transient_name );
			}

			// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- See above.
			$meta_keys = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT meta_key FROM $wpdb->sitemeta WHERE site_id = %d AND ( meta_key LIKE %s OR meta_key LIKE %s )",
					get_current_network_id(),
					$wpdb->esc_like( 'gist_answers_' ) . '%',
					$wpdb->esc_like( '_site_transient_gist_answers_' ) . '%',
				)
			);
			// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

			foreach ( $meta_keys as $meta_key ) {
				if ( str_starts_with( $meta_key, '_site_transient_' ) ) {
					delete_site_transient( substr( $meta_key, strlen( '_site_transient_' ) ) );
				} else {
					delete_site_option( $meta_key );
				}
			}
		}
	}

	/**
	 * Get the IDs of all of the sites to clean up: 0 (the current site), plus every site in the network on multisite.
	 *
	 * @return array<int> The blog IDs.
	 */
	public static function get_all_blog_ids(): array {
		return array_merge(
			array( 0 ),
			is_multisite() ? array_map(
				'intval',
				get_sites(
					array(
						'fields' => 'ids',
						'number' => 0,
					)
				)
			) : array(),
		);
	}

	/**
	 * Determine whether the Gist Answers plugin folder can be deleted from the Danger Zone.
	 *
	 * It can't in a local development environment (to protect developers' checkouts), on WordPress VIP, or wherever
	 * the plugin folder isn't writable.
	 *
	 * @return bool True if the plugin folder can be deleted, false otherwise.
	 */
	public static function can_delete_plugin_folder(): bool {

		$http_host = sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ?? '' ) );

		$is_local_dev = ( defined( 'GIST_ANSWERS_DEVELOPMENT_MODE' ) && GIST_ANSWERS_DEVELOPMENT_MODE ) || str_contains( $http_host, 'prorata.test' );

		$is_vip = defined( 'VIP_GO_APP_ENVIRONMENT' ) || defined( 'WPCOM_IS_VIP_ENV' );

		return ! $is_local_dev && ! $is_vip && ! empty( GIST_ANSWERS_PLUGIN_DIR ) && wp_is_writable( GIST_ANSWERS_PLUGIN_DIR );
	}

	/**
	 * Delete the Gist Answers plugin folder, everywhere except where can_delete_plugin_folder() rules it out.
	 *
	 * @return void
	 */
	public static function delete_plugin_folder(): void {

		if ( self::can_delete_plugin_folder() ) {
			if ( ! empty( GIST_ANSWERS_PLUGIN_DIR ) ) {

				require_once ABSPATH . 'wp-admin/includes/file.php';

				if ( WP_Filesystem() ) {

					global $wp_filesystem;

					if ( $wp_filesystem->is_dir( GIST_ANSWERS_PLUGIN_DIR ) ) {
						$wp_filesystem->delete( GIST_ANSWERS_PLUGIN_DIR, true );
					}
				}
			}
		}
	}

	/**
	 * Get the token hash for the CMS iframe with the given URL (see get_token_hash_from_embed_uuid()).
	 *
	 * @param string $iframe_url The iframe URL, whose `embed` query argument is the embed ticket (a JWT).
	 * @param int    $blog_id    Optional ID of the blog/site the iframe is shown for. Defaults to the current site.
	 *
	 * @return string The token hash, or an empty string if the URL has no embed ticket.
	 */
	public static function get_token_hash_from_iframe_url( $iframe_url, int $blog_id = 0 ): string {

		$query = strval( wp_parse_url( $iframe_url, PHP_URL_QUERY ) );

		parse_str( $query, $query_args );

		$embed_token = is_string( $query_args['embed'] ?? null ) ? $query_args['embed'] : '';

		$embed_uuid = self::get_embed_token_uuid( $embed_token );

		$expires = time() + self::ANSWER_PAGE_GRANT_DURATION;

		$ticket_expires = intval( self::get_embed_token_payload( $embed_token )['exp'] ?? 0 );

		if ( $ticket_expires > 0 ) {
			$expires = min( $expires, $ticket_expires );
		}

		return self::get_token_hash_from_embed_uuid( $embed_uuid, $blog_id, $expires );
	}

	/**
	 * Get the token hash for the given embed UUID: a short-lived grant that lets the current user create or move
	 * answer pages on the given site, for the publisher linked to it, when the CMS iframe asks to.
	 *
	 * The hash has the form `<expiry timestamp>.<HMAC>`, where the HMAC covers the operation, the embed UUID, the
	 * user, the site, the publisher, and the expiry, so it can't be reused by another user, on another site, for
	 * another publisher, or once it has expired (see token_hash_is_valid()).
	 *
	 * @param string $embed_uuid The embed UUID (from the iframe's embed ticket).
	 * @param int    $blog_id    Optional ID of the blog/site. Defaults to the current site.
	 * @param int    $expires    Optional expiry timestamp. Defaults to ANSWER_PAGE_GRANT_DURATION from now.
	 *
	 * @return string The token hash, or an empty string if there is no UUID, no logged-in user, or no publisher.
	 */
	public static function get_token_hash_from_embed_uuid( $embed_uuid, int $blog_id = 0, int $expires = 0 ): string {

		// An empty UUID must not produce a usable hash (it would match any request without an embed token).
		if ( ! is_string( $embed_uuid ) || '' === $embed_uuid ) {
			return '';
		}

		$user_id = get_current_user_id();

		$blog_id = is_multisite() ? ( $blog_id ? $blog_id : get_current_blog_id() ) : 0;

		$publisher_id = Credentials::get_stored_publisher_id( $blog_id );

		if ( empty( $user_id ) || '' === $publisher_id ) {
			return '';
		}

		$expires = $expires > 0 ? $expires : time() + self::ANSWER_PAGE_GRANT_DURATION;

		$grant = implode( '|', array( 'answer-page', $embed_uuid, $user_id, $blog_id, $publisher_id, $expires ) );

		return $expires . '.' . wp_hash( $grant, 'auth', 'sha256' );
	}

	/**
	 * Determine whether the given token hash is a valid, unexpired grant for the current user to create or move
	 * answer pages on the given site (see get_token_hash_from_embed_uuid()).
	 *
	 * @param string $token_hash The token hash.
	 * @param string $embed_uuid The embed UUID it was issued for.
	 * @param int    $blog_id    Optional ID of the blog/site. Defaults to the current site.
	 *
	 * @return bool True if the token hash is valid, false otherwise.
	 */
	public static function token_hash_is_valid( string $token_hash, string $embed_uuid, int $blog_id = 0 ): bool {

		$parts = explode( '.', $token_hash, 2 );

		if ( 2 !== count( $parts ) || ! ctype_digit( $parts[0] ) ) {
			return false;
		}

		$expires = intval( $parts[0] );

		// A grant never lasts longer than ANSWER_PAGE_GRANT_DURATION, so a later expiry can't have been issued here.
		if ( $expires < time() || $expires > time() + self::ANSWER_PAGE_GRANT_DURATION ) {
			return false;
		}

		$expected_hash = self::get_token_hash_from_embed_uuid( $embed_uuid, $blog_id, $expires );

		return '' !== $expected_hash && hash_equals( $expected_hash, $token_hash );
	}

	/**
	 * Get the UUID from the given embed token (JWT).
	 *
	 * @param string $jwt The embed token (JWT) to extract the UUID from.
	 *
	 * @return string The extracted UUID, or an empty string if not found.
	 */
	public static function get_embed_token_uuid( string $jwt ): string {

		$data = self::get_embed_token_payload( $jwt );

		return is_string( $data['uuid'] ?? null )
			? $data['uuid']
			: '';
	}

	/**
	 * Get the decoded payload of the given embed token (JWT). The signature isn't checked: only Gist Answers can
	 * verify it, and the payload is only used to tie the token hash to the ticket (see get_token_hash_from_iframe_url()).
	 *
	 * @param string $jwt The embed token (JWT).
	 *
	 * @return array<mixed> The payload, or an empty array if it can't be decoded.
	 */
	private static function get_embed_token_payload( string $jwt ): array {

		$parts = explode( '.', $jwt );

		if ( 3 !== count( $parts ) ) {
			return array();
		}

		$payload = $parts[1];

		$payload = strtr( $payload, '-_', '+/' );

		$padding = strlen( $payload ) % 4;

		if ( $padding ) {
			$payload .= str_repeat( '=', 4 - $padding );
		}

		$decoded = base64_decode( $payload, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Used legitimately for token encryption.

		if ( false === $decoded ) {
			return array();
		}

		$data = json_decode( $decoded, true );

		return is_array( $data ) ? $data : array();
	}

	/**
	 * Try to acquire a lock with the given name, which expires by itself after the given number of seconds.
	 *
	 * With a persistent object cache (as on WordPress VIP), the lock is atomic, so only one request at a time can hold
	 * it. Without one, it is kept in a transient, which narrows the window in which two requests can both acquire it,
	 * but can't close it.
	 *
	 * @param string $name     The lock name (prefixed with `gist_answers_`).
	 * @param int    $duration The number of seconds after which the lock expires, if it isn't released before then.
	 * @param bool   $network  Optional. Whether the lock applies to the whole network, on multisite. Defaults to false.
	 *
	 * @return bool True if the lock was acquired, false if it is already held.
	 */
	public static function acquire_lock( string $name, int $duration, bool $network = false ): bool {

		$network = $network && is_multisite();

		if ( wp_using_ext_object_cache() ) {

			if ( $network ) {
				wp_cache_add_global_groups( self::NETWORK_LOCK_CACHE_GROUP );
			}

			return wp_cache_add( $name, time(), $network ? self::NETWORK_LOCK_CACHE_GROUP : self::LOCK_CACHE_GROUP, $duration ); // phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined -- A lock is meant to expire quickly.
		}

		$is_locked = $network ? get_site_transient( $name ) : get_transient( $name );

		if ( false !== $is_locked ) {
			return false;
		}

		return $network ? set_site_transient( $name, time(), $duration ) : set_transient( $name, time(), $duration );
	}

	/**
	 * Release a lock acquired with acquire_lock().
	 *
	 * @param string $name    The lock name.
	 * @param bool   $network Optional. Whether the lock applies to the whole network, on multisite. Defaults to false.
	 *
	 * @return void
	 */
	public static function release_lock( string $name, bool $network = false ): void {

		$network = $network && is_multisite();

		if ( wp_using_ext_object_cache() ) {
			wp_cache_delete( $name, $network ? self::NETWORK_LOCK_CACHE_GROUP : self::LOCK_CACHE_GROUP );
		} elseif ( $network ) {
			delete_site_transient( $name );
		} else {
			delete_transient( $name );
		}
	}

	/**
	 * Determine if the given post falls within the specified tax query.
	 *
	 * @param int|WP_Post $post_or_post_id The post object or post ID to check.
	 * @param array       $tax_query       A valid `$tax_query` array as used by WP_Query.
	 *
	 * @return boolean True if the post matches the tax query, false otherwise.
	 */
	public static function post_matches_tax_query( int|WP_Post $post_or_post_id, array $tax_query ): bool {

		if ( empty( $tax_query ) ) {
			return true;
		}

		$post_id = is_int( $post_or_post_id ) ? $post_or_post_id : ( $post_or_post_id->ID ?? 0 );

		$query = new WP_Query(
			array(
				'post_type'           => 'any',
				'post_status'         => 'any',
				'post__in'            => array( $post_id ),
				'ignore_sticky_posts' => true,
				'tax_query'           => $tax_query, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- This is a necessary tax query check which only gets called under very specific circumstances and within the WordPress admin, so performance is not a significant concern.
				'fields'              => 'ids',
				'posts_per_page'      => 1,
			)
		);

		return ! empty( $query->posts );
	}

	/**
	 * Get the domain from the given URL.
	 *
	 * @param string $url The URL to extract the domain from.
	 *
	 * @return string The extracted domain, or an empty string if not found.
	 */
	public static function get_domain_from_url( string $url ): string {

		$host = self::extract_host_from_url( $url );

		return strtolower( $host );
	}

	/**
	 * Get a searchable version of the given string.
	 *
	 * @param string $input_string The string to convert into a searchable format.
	 *
	 * @return string The searchable version of the string.
	 */
	public static function get_searchable_string( string $input_string ): string {

		$searchable_string = wp_strip_all_tags( $input_string );

		$searchable_string = html_entity_decode( $searchable_string, ENT_QUOTES, 'UTF-8' );
		$searchable_string = strtolower( $searchable_string );
		$searchable_string = trim( $searchable_string );
		$searchable_string = preg_replace( '/[^a-z0-9]+/', '', $searchable_string );

		return $searchable_string;
	}

	/**
	 * Score how closely two names match, ignoring case and all non-alphanumeric characters.
	 *
	 * The score is the Levenshtein similarity of the searchable versions of both names, rounded down so that only
	 * identical searchable names score 100.
	 *
	 * @param string $name_1 The first name to compare.
	 * @param string $name_2 The second name to compare.
	 *
	 * @return int The match score, from 0 (no similarity) to 100 (identical once normalized).
	 */
	public static function get_name_match_score( string $name_1, string $name_2 ): int {

		$searchable_1 = self::get_searchable_string( $name_1 );
		$searchable_2 = self::get_searchable_string( $name_2 );

		if ( '' === $searchable_1 || '' === $searchable_2 ) {
			return 0;
		}

		if ( $searchable_1 === $searchable_2 ) {
			return 100;
		}

		$max_length = max( strlen( $searchable_1 ), strlen( $searchable_2 ) );
		$distance   = levenshtein( $searchable_1, $searchable_2 );

		return min( 99, max( 0, (int) floor( ( 1 - ( $distance / $max_length ) ) * 100 ) ) );
	}
}
