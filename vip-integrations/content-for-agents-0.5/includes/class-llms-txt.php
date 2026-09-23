<?php
/**
 * Site-wide /llms.txt endpoint for AI agent discovery.
 *
 * @package Content_For_Agents
 */

declare( strict_types=1 );

namespace Content_For_Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serves /llms.txt in the llmstxt.org shape and aggregates typed section descriptors.
 *
 * Plugins may append Additional Resources subsections via
 * `content_for_agents_additional_resources_blocks`.
 *
 * @package Content_For_Agents
 */
class LLMs_Txt {

	/**
	 * Object cache group for the rendered /llms.txt body.
	 */
	public const CACHE_GROUP = 'content_for_agents_llms_txt';

	/**
	 * Object cache key for the rendered body.
	 */
	public const CACHE_KEY = 'rendered_body';

	/**
	 * Cache TTL in seconds (1 hour).
	 */
	public const CACHE_TTL = 3600;

	/**
	 * Maximum links per section in v1.
	 */
	public const SECTION_CAP = 50;

	/**
	 * Canonical section slug order.
	 *
	 * @var string[]
	 */
	public const SECTION_ORDER = array(
		'about',
		'categories',
		'featured-posts',
		'additional-resources',
	);

	/**
	 * Constructor.
	 *
	 * @param Loader $loader Loader instance.
	 */
	public function __construct( Loader $loader ) {
		add_post_type_support( 'post', 'content-for-agents-llms-txt' );

		$loader->add_action( 'parse_request', $this, 'maybe_serve', 0 );
		$loader->add_filter( 'content_for_agents_llms_txt_sections', $this, 'register_about_section', 5 );
		$loader->add_filter( 'content_for_agents_llms_txt_sections', $this, 'register_categories_section', 7 );
		$loader->add_filter( 'content_for_agents_llms_txt_sections', $this, 'register_featured_posts_section', 10 );
		$loader->add_filter( 'content_for_agents_llms_txt_sections', $this, 'append_additional_resources', 999 );
	}

	/**
	 * Serve the exact index path without relying on a rewrite-rule flush.
	 *
	 * VIP code-loaded plugins do not receive activation hooks on deployment.
	 * parse_request runs after init, so integration filters are registered.
	 *
	 * @hook parse_request
	 *
	 */
	public function maybe_serve(): void {
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_url( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';
		$path        = wp_parse_url( $request_uri, PHP_URL_PATH );
		$index_path  = wp_parse_url( home_url( '/llms.txt' ), PHP_URL_PATH );

		// WP::$request is empty under plain permalinks, so compare URL paths here.
		if ( ! is_string( $path ) || ! is_string( $index_path )
			|| untrailingslashit( $path ) !== untrailingslashit( $index_path ) ) {
			return;
		}
		self::serve();
	}

	/**
	 * Serve /llms.txt and exit.
	 */
	public static function serve(): void {
		$body = self::get_rendered_body();
		self::send_headers();
		if ( ! Markdown_Access::can_cache_discovery() ) {
			nocache_headers();
			header( 'Cache-Control: private, no-store, max-age=0' );
		}
		echo $body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		exit;
	}

	/**
	 * Get the rendered /llms.txt body, using object cache when available.
	 */
	public static function get_rendered_body(): string {
		$cacheable = Markdown_Access::can_cache_discovery();
		$cached    = $cacheable ? wp_cache_get( self::CACHE_KEY, self::CACHE_GROUP ) : false;
		if ( is_string( $cached ) && '' !== $cached ) {
			return $cached;
		}

		$sections = self::collect_sections();
		$body     = self::render_body( $sections );

		if ( $cacheable ) {
			// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined -- CACHE_TTL is one hour.
			wp_cache_set( self::CACHE_KEY, $body, self::CACHE_GROUP, self::CACHE_TTL );
		}

		return $body;
	}

	/**
	 * Collect, validate, deduplicate, and order section descriptors.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function collect_sections(): array {
		/** @var array<int, array<string, mixed>> $raw_sections */
		$raw_sections = apply_filters( 'content_for_agents_llms_txt_sections', array() );

		if ( ! is_array( $raw_sections ) ) {
			return array();
		}

		$seen  = array();
		$valid = array();

		foreach ( $raw_sections as $section ) {
			try {
				if ( ! is_array( $section ) ) {
					continue;
				}

				$slug = isset( $section['slug'] ) ? sanitize_key( (string) $section['slug'] ) : '';
				if ( '' === $slug || ! isset( $section['title'], $section['links'] ) || ! is_array( $section['links'] ) ) {
					if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
						wp_trigger_error( __METHOD__, 'Skipping malformed llms.txt section descriptor.' );
					}
					continue;
				}

				if ( isset( $seen[ $slug ] ) ) {
					if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
						wp_trigger_error(
							__METHOD__,
							sprintf(
								'Duplicate llms.txt section slug "%1$s" dropped (first registration wins).',
								$slug
							)
						);
					}
					continue;
				}

				$seen[ $slug ] = true;
				$valid[]       = $section;
			} catch ( \Throwable $e ) {
				if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
					wp_trigger_error( __METHOD__, $e->getMessage() );
				}
			}
		}

		return self::sort_sections( $valid );
	}

	/**
	 * Sort sections by SECTION_ORDER, unknown slugs after known ones in registration order.
	 *
	 * @param array<int, array<string, mixed>> $sections Section descriptors.
	 * @return array<int, array<string, mixed>>
	 */
	public static function sort_sections( array $sections ): array {
		$order_map = array_flip( self::SECTION_ORDER );
		$known     = array();
		$unknown   = array();

		foreach ( $sections as $section ) {
			$slug = sanitize_key( (string) ( $section['slug'] ?? '' ) );
			if ( isset( $order_map[ $slug ] ) ) {
				$known[] = array(
					'order'   => $order_map[ $slug ],
					'section' => $section,
				);
			} else {
				$unknown[] = $section;
			}
		}

		usort(
			$known,
			static function ( array $a, array $b ): int {
				return $a['order'] <=> $b['order'];
			}
		);

		$ordered = array_map(
			static function ( array $item ): array {
				return $item['section'];
			},
			$known
		);

		return array_merge( $ordered, $unknown );
	}

	/**
	 * Render the full llmstxt.org-shaped body.
	 *
	 * @param array<int, array<string, mixed>> $sections Ordered section descriptors.
	 */
	public static function render_body( array $sections ): string {
		$settings     = Settings::get_settings();
		$site_summary = preg_replace(
			'/\s+/',
			' ',
			trim( (string) ( $settings['site_summary'] ?? Settings::get_default_site_summary() ) )
		);

		$lines   = array();
		$lines[] = '# ' . html_entity_decode( get_bloginfo( 'name' ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		if ( '' !== $site_summary ) {
			$lines[] = '> ' . $site_summary;
		}
		$lines[] = '';

		$content_signal = Markdown_Response::get_content_signal_header();
		if ( '' !== $content_signal ) {
			// The body-line Content-Signal mirrors HTTP header / robots.txt vocabulary.
			$lines[] = 'Content-Signal: ' . $content_signal;
			$lines[] = '';
		}

		foreach ( $sections as $section ) {
			$rendered = self::render_section( $section );
			if ( '' !== $rendered ) {
				$lines[] = $rendered;
				$lines[] = '';
			}
		}

		return rtrim( implode( "\n", $lines ) ) . "\n";
	}

	/**
	 * Render a single section descriptor.
	 *
	 * @param array<string, mixed> $section Section descriptor.
	 */
	public static function render_section( array $section ): string {
		$title = trim( (string) ( $section['title'] ?? '' ) );
		if ( '' === $title ) {
			return '';
		}

		$links       = is_array( $section['links'] ?? null ) ? $section['links'] : array();
		$description = isset( $section['description'] ) ? trim( (string) $section['description'] ) : '';

		if ( '' === $description && empty( $links ) ) {
			return '';
		}

		$lines   = array();
		$lines[] = '## ' . $title;

		if ( '' !== $description ) {
			$lines[] = '';
			$lines[] = $description;
		}

		if ( ! empty( $links ) ) {
			$lines[] = '';
			foreach ( $links as $link ) {
				$line = self::render_link_line( $link );
				if ( '' !== $line ) {
					$lines[] = $line;
				}
			}
		}

		return implode( "\n", $lines );
	}

	/**
	 * Render a single markdown link bullet.
	 *
	 * @param mixed $link Link descriptor.
	 */
	public static function render_link_line( $link ): string {
		if ( ! is_array( $link ) ) {
			return '';
		}

		$title = trim( (string) ( $link['title'] ?? '' ) );
		$url   = self::sanitize_link_url( (string) ( $link['url'] ?? '' ) );

		if ( '' === $title || '' === $url ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG && ( '' !== $title || '' !== (string) ( $link['url'] ?? '' ) ) ) {
				wp_trigger_error( __METHOD__, 'Skipping malformed llms.txt link.' );
			}
			return '';
		}

		$description = isset( $link['description'] ) ? trim( (string) $link['description'] ) : '';
		if ( '' !== $description ) {
			return '- [' . $title . '](' . $url . '): ' . $description;
		}

		return '- [' . $title . '](' . $url . ')';
	}

	/**
	 * Sanitize a link URL for markdown output.
	 */
	public static function sanitize_link_url( string $url ): string {
		$url = trim( $url );
		if ( '' === $url || str_contains( $url, "\n" ) || str_contains( $url, "\r" ) ) {
			return '';
		}

		$escaped = esc_url_raw( $url );
		return is_string( $escaped ) ? $escaped : '';
	}

	/**
	 * Send HTTP headers for /llms.txt.
	 */
	public static function send_headers(): void {
		header( 'Content-Type: text/plain; charset=utf-8' );
		send_nosniff_header();
		header( 'X-Robots-Tag: noindex' );
		header( 'Cache-Control: public, max-age=300, s-maxage=3600' );

		$content_signal = Markdown_Response::get_content_signal_header();
		if ( '' !== $content_signal ) {
			header( 'Content-Signal: ' . $content_signal );
		}
	}

	/**
	 * Build the static About section descriptor.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_about_section(): array {
		$settings = Settings::get_settings();
		$links    = array();

		if ( is_array( $settings['about_links'] ?? null ) ) {
			foreach ( $settings['about_links'] as $link ) {
				if ( ! is_array( $link ) ) {
					continue;
				}

				$links[] = array(
					'title'       => (string) ( $link['title'] ?? '' ),
					'url'         => (string) ( $link['url'] ?? '' ),
					'description' => (string) ( $link['description'] ?? '' ),
				);
			}
		}

		return array(
			'slug'        => 'about',
			'title'       => __( 'About', 'content-for-agents' ),
			'description' => (string) ( $settings['about_description'] ?? '' ),
			'links'       => $links,
		);
	}

	/**
	 * Register the About section on the typed filter.
	 *
	 * @param array<int, array<string, mixed>> $sections Existing sections.
	 * @return array<int, array<string, mixed>>
	 */
	public function register_about_section( array $sections ): array {
		$sections[] = self::get_about_section();
		return $sections;
	}

	/**
	 * Register Categories from settings (with automatic fallback).
	 *
	 * @param array<int, array<string, mixed>> $sections Existing sections.
	 * @return array<int, array<string, mixed>>
	 */
	public function register_categories_section( array $sections ): array {
		$categories = self::get_categories_section();
		if ( ! empty( $categories['links'] ) ) {
			$sections[] = $categories;
		}

		return $sections;
	}

	/**
	 * Build the Categories section descriptor.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_categories_section(): array {
		return array(
			'slug'        => 'categories',
			'title'       => __( 'Categories', 'content-for-agents' ),
			'description' => __( 'Browse content by category.', 'content-for-agents' ),
			'links'       => self::get_category_links(),
		);
	}

	/**
	 * Build category link bullets for /llms.txt.
	 *
	 * @return array<int, array<string, string>>
	 */
	private static function get_category_links(): array {
		$selected_ids = Settings::get_category_ids_for_llms_txt();
		$query_args   = array(
			'taxonomy'               => Settings::CATEGORIES_TAXONOMY,
			'update_term_meta_cache' => false,
		);

		if ( is_array( $selected_ids ) ) {
			$query_args['include']    = $selected_ids;
			$query_args['orderby']    = 'include';
			$query_args['hide_empty'] = false;
			$total                    = count( $selected_ids );
		} else {
			$query_args['hide_empty'] = true;
			$query_args['number']     = self::SECTION_CAP + 1;
			$query_args['parent']     = 0;
			$total                    = 0;
		}

		$terms = get_terms( $query_args );
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return array();
		}

		if ( ! is_array( $selected_ids ) ) {
			$total = count( $terms );
		}

		$links = array();
		$slice = array_slice( $terms, 0, self::SECTION_CAP );

		foreach ( $slice as $term ) {
			if ( ! $term instanceof \WP_Term ) {
				continue;
			}

			$url = get_term_link( $term );
			if ( is_wp_error( $url ) ) {
				continue;
			}

			$description = trim( (string) $term->description );
			if ( '' !== $description ) {
				$description = html_entity_decode( wp_html_excerpt( wp_strip_all_tags( $description ), 160, '…' ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
			}

			$link = array(
				'title' => html_entity_decode( $term->name, ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
				'url'   => $url,
			);
			if ( '' !== $description ) {
				$link['description'] = $description;
			}
			$links[] = $link;
		}

		$archive_url = get_term_link( (int) get_option( 'default_category' ), Settings::CATEGORIES_TAXONOMY );
		if ( is_wp_error( $archive_url ) ) {
			$archive_url = home_url( '/topic/' );
		}

		return self::maybe_append_see_all_link( $links, $total, (string) $archive_url );
	}

	/**
	 * Register Featured Posts from settings (with recency fallback).
	 *
	 * @param array<int, array<string, mixed>> $sections Existing sections.
	 * @return array<int, array<string, mixed>>
	 */
	public function register_featured_posts_section( array $sections ): array {
		$featured = self::get_featured_posts_section();
		if ( ! empty( $featured['links'] ) ) {
			$sections[] = $featured;
		}
		return $sections;
	}

	/**
	 * Build the Featured Posts section descriptor.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_featured_posts_section(): array {
		$settings = Settings::get_settings();
		$ids      = is_array( $settings['featured_posts'] ?? null ) ? $settings['featured_posts'] : array();
		$ids      = array_values(
			array_unique(
				array_filter(
					array_map( 'absint', $ids ),
					static function ( int $id ): bool {
						return $id > 0;
					}
				)
			)
		);

		$query_args = array(
			'post_type'              => 'post',
			'post_status'            => 'publish',
			'has_password'           => false,
			'posts_per_page'         => self::SECTION_CAP,
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'fields'                 => 'ids',
		);

		if ( ! empty( $ids ) ) {
			$query_args['post__in'] = $ids;
			$query_args['orderby']  = 'post__in';
		} else {
			$query_args['orderby'] = 'date';
			$query_args['order']   = 'DESC';
		}

		$query = new \WP_Query( $query_args );
		$links = array();

		foreach ( $query->posts as $post_id ) {
			$post = get_post( (int) $post_id );
			if ( ! $post instanceof \WP_Post || ! Markdown_Access::can_serve( $post, Markdown_Access::CONTEXT_DISCOVERY ) ) {
				continue;
			}

			$url = self::get_post_markdown_url( $post );
			if ( '' === $url ) {
				continue;
			}

			$excerpt = get_the_excerpt( $post );
			if ( '' !== $excerpt ) {
				$excerpt = html_entity_decode( wp_html_excerpt( wp_strip_all_tags( $excerpt ), 160, '…' ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
			}

			$link = array(
				'title' => html_entity_decode( get_the_title( $post ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
				'url'   => $url,
			);
			if ( '' !== $excerpt ) {
				$link['description'] = $excerpt;
			}
			$links[] = $link;
		}

		return array(
			'slug'        => 'featured-posts',
			'title'       => __( 'Featured posts', 'content-for-agents' ),
			'description' => __( 'Selected posts from this site.', 'content-for-agents' ),
			'links'       => $links,
		);
	}

	/**
	 * Append Additional Resources from settings and integration blocks.
	 *
	 * @param array<int, array<string, mixed>> $sections Existing sections.
	 * @return array<int, array<string, mixed>>
	 */
	public function append_additional_resources( array $sections ): array {
		$description = self::build_additional_resources_description();
		if ( '' === $description ) {
			return $sections;
		}

		$sections[] = array(
			'slug'        => 'additional-resources',
			'title'       => __( 'Additional Resources', 'content-for-agents' ),
			'description' => $description,
			'links'       => array(),
		);

		return $sections;
	}

	/**
	 * Build the Additional Resources section body from settings and integration blocks.
	 */
	public static function build_additional_resources_description(): string {
		$parts = array();

		$blocks = Settings::get_settings()['additional_resources_blocks'];

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$title = trim( (string) ( $block['title'] ?? '' ) );
			$body  = trim( (string) ( $block['body'] ?? '' ) );
			if ( '' === $title ) {
				continue;
			}

			$subsection = '### ' . $title;
			if ( '' !== $body ) {
				$subsection .= "\n\n" . $body;
			}
			$parts[] = $subsection;
		}

		return implode( "\n\n", $parts );
	}

	/**
	 * Build a `/markdown` URL for a post.
	 *
	 * @param \WP_Post $post Post object.
	 */
	public static function get_post_markdown_url( \WP_Post $post ): string {
		return Markdown_Endpoint::get_url( $post );
	}

	/**
	 * Append a capped-section "See all" trailer link when total exceeds the cap.
	 *
	 * @param array<int, array<string, mixed>> $links     Link descriptors.
	 * @param int                              $total     Total available items.
	 * @param string                           $archive_url Archive URL.
	 * @return array<int, array<string, mixed>>
	 */
	public static function maybe_append_see_all_link( array $links, int $total, string $archive_url ): array {
		if ( $total <= self::SECTION_CAP || '' === self::sanitize_link_url( $archive_url ) ) {
			return $links;
		}

		$links[] = array(
			'title' => __( 'See all →', 'content-for-agents' ),
			'url'   => $archive_url,
		);

		return $links;
	}
}
