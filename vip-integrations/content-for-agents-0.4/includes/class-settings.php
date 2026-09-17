<?php
/**
 * Settings page and REST API for Markdown for Agents.
 *
 * @package Content_For_Agents
 */

declare( strict_types=1 );

namespace Content_For_Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers Settings > Markdown for Agents and GET/POST REST routes.
 *
 * Cookie-authenticated REST requests are nonce-verified automatically via
 * rest_cookie_check_errors; the React app must use createNonceMiddleware.
 *
 * @package Content_For_Agents
 */
class Settings {

	public const OPTION_KEY      = 'content_for_agents_settings';
	public const REST_NAMESPACE  = 'content-for-agents/v1';
	public const ADMIN_PAGE_SLUG = 'content-for-agents-settings';

	/**
	 * Maximum additional-resources blocks stored in settings.
	 */
	public const ADDITIONAL_RESOURCES_BLOCKS_CAP = 20;

	/**
	 * Maximum About link bullets stored in settings.
	 */
	public const ABOUT_LINKS_CAP = 10;

	/**
	 * WordPress taxonomy used for the /llms.txt Categories section.
	 */
	public const CATEGORIES_TAXONOMY = 'category';

	/**
	 * Default settings shape.
	 *
	 * @var array<string, mixed>
	 */
	private static array $defaults = array(
		'site_summary'                => '',
		'about_description'           => '',
		'about_links'                 => array(),
		'category_ids'                => array(),
		'featured_posts'              => array(),
		'additional_resources_blocks' => array(),
	);

	/**
	 * Constructor.
	 *
	 * @param Loader $loader Loader instance.
	 */
	public function __construct( Loader $loader ) {
		$loader->add_action( 'admin_menu', $this, 'register_admin_page' );
		$loader->add_action( 'admin_enqueue_scripts', $this, 'enqueue_admin_assets' );
		$loader->add_action( 'rest_api_init', $this, 'register_routes' );
	}

	/**
	 * Return merged settings with defaults applied.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_settings(): array {
		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		$defaults = apply_filters( 'content_for_agents_settings_defaults', self::$defaults );
		$merged   = array_merge( self::$defaults, is_array( $defaults ) ? $defaults : array(), $stored );

		$summary   = is_scalar( $merged['site_summary'] ) ? trim( (string) $merged['site_summary'] ) : '';
		$resources = self::normalize_additional_resources_blocks( $merged['additional_resources_blocks'] );

		/**
		 * Filter integration-maintained resources for the settings UI and index.
		 * Use settings_defaults for editable starter content instead.
		 *
		 * @param array $resources Normalized resource blocks.
		 */
		$resources = apply_filters( 'content_for_agents_additional_resources_blocks', $resources );

		return array(
			'site_summary'                => '' !== $summary ? $summary : self::get_default_site_summary(),
			'about_description'           => is_scalar( $merged['about_description'] ) ? trim( (string) $merged['about_description'] ) : '',
			'about_links'                 => self::normalize_about_links( $merged['about_links'] ),
			'category_ids'                => self::normalize_category_ids( $merged['category_ids'] ),
			'featured_posts'              => is_array( $merged['featured_posts'] ) ? array_values( array_filter( wp_parse_id_list( $merged['featured_posts'] ) ) ) : array(),
			'additional_resources_blocks' => self::normalize_additional_resources_blocks( $resources ),
		);
	}

	/**
	 * Normalize additional-resources blocks for read paths (no cap trim).
	 *
	 * @param mixed $blocks Raw blocks from storage.
	 * @return array<int, array<string, string>>
	 */
	public static function normalize_additional_resources_blocks( mixed $blocks ): array {
		if ( ! is_array( $blocks ) ) {
			return array();
		}

		$normalized = array();
		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$title = isset( $block['title'] ) ? sanitize_text_field( (string) $block['title'] ) : '';
			$body  = isset( $block['body'] ) ? sanitize_textarea_field( (string) $block['body'] ) : '';
			$id    = isset( $block['id'] ) ? sanitize_key( (string) $block['id'] ) : '';

			if ( '' === $title ) {
				continue;
			}

			if ( '' === $id ) {
				$id = sanitize_key( wp_unique_id( 'block-' ) );
			}

			$normalized[] = array(
				'id'    => $id,
				'title' => $title,
				'body'  => $body,
			);
		}

		return $normalized;
	}

	/**
	 * Default blockquote summary for /llms.txt.
	 */
	public static function get_default_site_summary(): string {
		return html_entity_decode( get_bloginfo( 'description' ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	/**
	 * Normalize About link bullets for read and save paths.
	 *
	 * @param mixed $links Raw links from storage.
	 * @return array<int, array<string, string>>
	 */
	public static function normalize_about_links( mixed $links ): array {
		if ( ! is_array( $links ) ) {
			return array();
		}

		$normalized = array();
		foreach ( $links as $link ) {
			if ( ! is_array( $link ) ) {
				continue;
			}

			$title       = isset( $link['title'] ) ? sanitize_text_field( (string) $link['title'] ) : '';
			$url         = LLMs_Txt::sanitize_link_url( (string) ( $link['url'] ?? '' ) );
			$description = isset( $link['description'] ) ? sanitize_text_field( (string) $link['description'] ) : '';
			$id          = isset( $link['id'] ) ? sanitize_key( (string) $link['id'] ) : '';

			if ( '' === $title || '' === $url ) {
				continue;
			}

			if ( '' === $id ) {
				$id = sanitize_key( wp_unique_id( 'about-link-' ) );
			}

			$normalized[] = array(
				'id'          => $id,
				'title'       => $title,
				'url'         => $url,
				'description' => $description,
			);
		}

		return $normalized;
	}

	/**
	 * Category term IDs for /llms.txt when editors have saved a custom selection.
	 *
	 * @return int[]|null Null when unset or empty (use automatic top-level categories with posts).
	 */
	public static function get_category_ids_for_llms_txt(): ?array {
		$ids = self::get_settings()['category_ids'];
		return empty( $ids ) ? null : $ids;
	}

	/**
	 * Normalize saved category IDs for settings and /llms.txt curation.
	 *
	 * @param mixed $ids Raw IDs from storage.
	 * @return int[]
	 */
	public static function normalize_category_ids( mixed $ids ): array {
		if ( ! is_array( $ids ) ) {
			return array();
		}

		$normalized = array();
		foreach ( $ids as $raw_id ) {
			$id = absint( $raw_id );
			if ( $id <= 0 || in_array( $id, $normalized, true ) ) {
				continue;
			}

			$term = get_term( $id, self::CATEGORIES_TAXONOMY );
			if ( ! $term instanceof \WP_Term || 0 !== (int) $term->parent ) {
				continue;
			}

			$normalized[] = $id;
		}

		return $normalized;
	}

	/** @hook admin_menu */
	public function register_admin_page(): void {
		add_submenu_page(
			'options-general.php',
			__( 'Content for Agents Settings', 'content-for-agents' ),
			__( 'Content for Agents', 'content-for-agents' ),
			'manage_options',
			self::ADMIN_PAGE_SLUG,
			array( $this, 'render_admin_page' )
		);
	}

	public function render_admin_page(): void {
		echo '<div class="wrap"><div id="content-for-agents-settings-admin"></div></div>';
	}

	/** @hook admin_enqueue_scripts */
	public function enqueue_admin_assets( string $hook_suffix ): void {
		if ( 'settings_page_' . self::ADMIN_PAGE_SLUG !== $hook_suffix ) {
			return;
		}

		$asset_file = plugin_dir_path( __DIR__ ) . 'build/settings/index.asset.php';
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset  = require $asset_file;
		$handle = 'content-for-agents-settings';

		wp_enqueue_script(
			$handle,
			plugins_url( 'build/settings/index.js', CONTENT_FOR_AGENTS_FILE ),
			$asset['dependencies'],
			$asset['version'],
			true
		);

		$style_path = plugin_dir_path( __DIR__ ) . 'build/settings/style-index.css';
		if ( file_exists( $style_path ) ) {
			$style_deps = array( 'wp-components' );

			wp_enqueue_style(
				$handle,
				plugins_url( 'build/settings/style-index.css', CONTENT_FOR_AGENTS_FILE ),
				$style_deps,
				$asset['version']
			);
		}

		wp_add_inline_script(
			$handle,
			'window.contentForAgentsSettings = ' . wp_json_encode(
				array(
					'llmsTxtUrl' => home_url( '/llms.txt' ),
					'restUrl'    => rest_url(),
					'nonce'      => wp_create_nonce( 'wp_rest' ),
				)
			) . ';',
			'before'
		);

		wp_set_script_translations( $handle, 'content-for-agents' );
	}

	/** @hook rest_api_init */
	public function register_routes(): void {
		register_rest_route(
			self::REST_NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings_endpoint' ),
					'permission_callback' => static fn(): bool => current_user_can( 'manage_options' ),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_settings_endpoint' ),
					'permission_callback' => static fn(): bool => current_user_can( 'manage_options' ),
				),
			)
		);
	}

	public function get_settings_endpoint(): \WP_REST_Response {
		return rest_ensure_response( $this->build_response() );
	}

	public function save_settings_endpoint( \WP_REST_Request $request ): \WP_REST_Response {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			return new \WP_REST_Response( array( 'error' => 'Invalid payload.' ), 400 );
		}

		update_option( self::OPTION_KEY, $this->sanitize_settings( $body ) );

		return rest_ensure_response( $this->build_response() );
	}

	/**
	 * @return array<string, mixed>
	 */
	private function build_response(): array {
		$settings = self::get_settings();

		return array(
			'settings'                => $settings,
			'featured_posts_resolved' => $this->resolve_featured_posts( $settings['featured_posts'] ),
			'categories_available'    => $this->resolve_categories_available(),
		);
	}

	/**
	 * @param array<string, mixed> $input Raw request body.
	 * @return array<string, mixed>
	 */
	private function sanitize_settings( array $input ): array {
		// Defaults and integration output belong to the read path, not saved overrides.
		$stored    = get_option( self::OPTION_KEY, array() );
		$sanitized = is_array( $stored ) ? array_intersect_key( $stored, self::$defaults ) : array();

		if ( isset( $input['featured_posts'] ) && is_array( $input['featured_posts'] ) ) {
			$ids = array();
			foreach ( $input['featured_posts'] as $raw_id ) {
				$id = absint( $raw_id );
				if ( $id <= 0 ) {
					continue;
				}
				if ( 'publish' !== get_post_status( $id ) || 'post' !== get_post_type( $id ) || '' !== get_post_field( 'post_password', $id ) ) {
					continue;
				}
				if ( ! in_array( $id, $ids, true ) ) {
					$ids[] = $id;
				}
			}
			$sanitized['featured_posts'] = $ids;
		}

		if ( isset( $input['site_summary'] ) ) {
			$sanitized['site_summary'] = sanitize_textarea_field( (string) $input['site_summary'] );
		}

		if ( isset( $input['about_description'] ) ) {
			$sanitized['about_description'] = sanitize_textarea_field( (string) $input['about_description'] );
		}

		if ( isset( $input['about_links'] ) && is_array( $input['about_links'] ) ) {
			$links                    = self::normalize_about_links( $input['about_links'] );
			$sanitized['about_links'] = array_slice(
				$links,
				0,
				self::ABOUT_LINKS_CAP
			);
		}

		if ( array_key_exists( 'category_ids', $input ) && is_array( $input['category_ids'] ) ) {
			$sanitized['category_ids'] = self::normalize_category_ids( $input['category_ids'] );
		}

		if ( isset( $input['additional_resources_blocks'] ) && is_array( $input['additional_resources_blocks'] ) ) {
			$blocks                                   = self::normalize_additional_resources_blocks( $input['additional_resources_blocks'] );
			$sanitized['additional_resources_blocks'] = array_slice(
				$blocks,
				0,
				self::ADDITIONAL_RESOURCES_BLOCKS_CAP
			);
		}

		return $sanitized;
	}

	/**
	 * @param int[] $ids Ordered post IDs.
	 * @return array<int, array<string, mixed>>
	 */
	private function resolve_featured_posts( array $ids ): array {
		$resolved = array();

		foreach ( $ids as $id ) {
			$post = get_post( (int) $id );
			if ( ! $post instanceof \WP_Post || 'publish' !== $post->post_status ) {
				continue;
			}

			$resolved[] = array(
				'id'        => $post->ID,
				'title'     => html_entity_decode( get_the_title( $post ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
				'excerpt'   => get_the_excerpt( $post ),
				'permalink' => get_permalink( $post ),
				'edit_link' => get_edit_post_link( $post->ID, 'raw' ),
			);
		}

		return $resolved;
	}

	/**
	 * Top-level categories for the settings checkbox list.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private function resolve_categories_available(): array {
		$terms = get_terms(
			array(
				'taxonomy'               => self::CATEGORIES_TAXONOMY,
				'hide_empty'             => false,
				'parent'                 => 0,
				'orderby'                => 'name',
				'order'                  => 'ASC',
				'update_term_meta_cache' => false,
			)
		);

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return array();
		}

		$resolved = array();
		foreach ( $terms as $term ) {
			if ( ! $term instanceof \WP_Term ) {
				continue;
			}

			$permalink = get_term_link( $term );
			if ( is_wp_error( $permalink ) ) {
				continue;
			}

			$resolved[] = array(
				'id'        => $term->term_id,
				'name'      => html_entity_decode( $term->name, ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
				'slug'      => $term->slug,
				'count'     => (int) $term->count,
				'permalink' => $permalink,
			);
		}

		return $resolved;
	}
}
