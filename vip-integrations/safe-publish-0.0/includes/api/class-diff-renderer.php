<?php
/**
 * Diff Renderer class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Post_Type_Map;
use stdClass;
use WP_Error;
use WP_Post;
use WP_Query;
use WP_REST_Request;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders diffs between current and incoming post content.
 *
 * Handles all diff generation logic including content, title, excerpt,
 * taxonomies, meta, featured media, and block-level diffs.
 */
final class Diff_Renderer {

	/**
	 * Renders a comprehensive diff preview for a source post. The post and
	 * featured-media fetches are tagged Request_Actions::PREVIEW; the
	 * rest_base lookup is tagged Request_Actions::LIST_ITEMS.
	 *
	 * @param WP_REST_Request $request      REST request object.
	 * @param callable        $make_request fn($url, $action, $credentials): array|WP_Error.
	 * @param array           $credentials  Authentication credentials.
	 *
	 * @return array|WP_Error Array on success, WP_Error if post not found.
	 */
	public function render_diff(
		WP_REST_Request $request,
		callable $make_request,
		array $credentials
	): array|WP_Error {
		$source_post_id  = (int) $request->get_param( 'postId' );
		$post_type       = (string) $request->get_param( 'postType' );
		$mode            = (string) $request->get_param( 'mode' );
		$cleanup         = (bool) $request->get_param( 'cleanup' );
		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );

		$mapped_post_type = Post_Type_Map::to_wp_slug( $post_type );

		// Find local post by source post ID.
		$local_post = $this->find_local_post( $source_post_id, $mapped_post_type );
		if ( is_wp_error( $local_post ) ) {
			return $local_post;
		}

		// Fetch source post data.
		$source_data = $this->fetch_source_post(
			$source_site_url,
			$post_type,
			$source_post_id,
			$make_request,
			$credentials
		);
		if ( is_wp_error( $source_data ) ) {
			return $source_data;
		}

		// Extract incoming data from source response.
		$incoming = $this->extract_incoming_data( $source_data );

		if ( is_wp_error( $incoming ) ) {
			return $incoming;
		}

		// Extract current local data.
		$current = $this->extract_current_data( $local_post );

		// Apply normalization if requested.
		if ( $cleanup ) {
			$current  = $this->apply_cleanup( $current );
			$incoming = $this->apply_cleanup( $incoming );
		}

		// Ensure WordPress diff renderer is available.
		if ( ! class_exists( 'WP_Text_Diff_Renderer_Table' ) ) {
			/** @psalm-suppress MissingFile */
			require_once ABSPATH . 'wp-includes/wp-diff.php';
		}

		// Generate all diffs.
		$content_diff_html = $this->generate_content_diff( $current['content'], $incoming['content'], $mode );
		$non_content_diffs = $this->generate_non_content_diffs( $current, $incoming );

		// Generate featured media side-by-side preview.
		$featured_media_html = $this->generate_featured_media_diff(
			$local_post->ID,
			$source_site_url,
			$source_data,
			$make_request,
			$credentials
		);

		// Generate block-level diffs if content has blocks.
		$block_diffs = $this->generate_block_diffs( $current['content'], $incoming['content'] );

		// Generate rendered previews.
		$current_rendered  = $this->render_content( $current['content'] );
		$incoming_rendered = $this->render_content( $incoming['content'] );

		$non_content_diffs['featuredMedia'] = $featured_media_html;

		return array(
			'contentDiffHtml'      => $content_diff_html,
			'blockDiffs'           => $block_diffs,
			'nonContentDiffs'      => $non_content_diffs,
			'current'              => array(
				'title'   => $current['title'] ?? null,
				'excerpt' => $current['excerpt'] ?? null,
				'meta'    => $current['meta'] ?? null,
				'terms'   => $current['terms'] ?? null,
			),
			'incomingRenderedHtml' => $incoming_rendered,
			'currentRenderedHtml'  => $current_rendered,
		);
	}

	/**
	 * Finds local post by source post ID.
	 *
	 * @param int    $source_post_id Source post ID to search for.
	 * @param string $post_type      Post type to search.
	 *
	 * @return WP_Post|WP_Error Post object on success, WP_Error if not found.
	 */
	public function find_local_post(
		int $source_post_id,
		string $post_type
	): WP_Post|WP_Error {
		$query = new WP_Query(
			array(
				'meta_key'       => Options::META_SOURCE_POST_ID,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				'meta_value'     => $source_post_id,
				'post_type'      => $post_type,
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'all',
			)
		);

		if ( ! $query->have_posts() ) {
			return new WP_Error(
				'post_not_found',
				__( 'No matching post found in current site.', 'safe-publish' ),
				array( 'status' => 404 )
			);
		}

		$post = $query->posts[0];

		if ( ! $post instanceof WP_Post ) {
			return new WP_Error(
				'invalid_post',
				__( 'Invalid post object returned.', 'safe-publish' ),
				array( 'status' => 500 )
			);
		}

		return $post;
	}

	/**
	 * Fetches source post data via API.
	 *
	 * @param string   $source_site_url Source site URL.
	 * @param string   $post_type       Post type to fetch.
	 * @param int      $post_id         Source post ID.
	 * @param callable $make_request    fn($url, $action, $credentials): array|WP_Error.
	 * @param array    $credentials     Authentication credentials.
	 *
	 * @return array|WP_Error Post data on success, WP_Error on failure.
	 */
	private function fetch_source_post(
		string $source_site_url,
		string $post_type,
		int $post_id,
		callable $make_request,
		array $credentials
	): array|WP_Error {
		$endpoint       = Source_Post_Type_Resolver::resolve_rest_base(
			$post_type,
			$source_site_url,
			$make_request,
			$credentials
		);
		$api_base       = trailingslashit( $source_site_url ) . 'wp-json/wp/v2/' . $endpoint . '/' . $post_id;
		$query_args     = array(
			'context' => 'edit',
			'_embed'  => '1',
		);
		$source_api_url = add_query_arg( $query_args, $api_base );

		$response = $make_request(
			$source_api_url,
			Request_Actions::PREVIEW,
			$credentials
		);

		if ( is_wp_error( $response ) ) {
			return new WP_Error(
				'source_fetch_failed',
				__( 'Failed to fetch source post.', 'safe-publish' ),
				array( 'status' => 500 )
			);
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( ! is_array( $data ) ) {
			return new WP_Error(
				'invalid_response',
				__( 'Invalid response from source site.', 'safe-publish' ),
				array( 'status' => 500 )
			);
		}

		return $data;
	}

	/**
	 * Extracts incoming data from source API response.
	 *
	 * @param array $data Source post data.
	 *
	 * @return array|WP_Error Structured incoming data, or error when
	 *                        raw fields are unavailable.
	 */
	private function extract_incoming_data( array $data ): array|WP_Error {
		if (
			! isset( $data['title']['raw'] ) ||
			! isset( $data['content']['raw'] ) ||
			! isset( $data['excerpt']['raw'] )
		) {
			return new WP_Error(
				'raw_data_unavailable',
				__(
					'Could not fetch raw post data. Verify that authentication is configured correctly.',
					'safe-publish'
				),
				array( 'status' => 403 )
			);
		}

		$incoming = array(
			'title'   => $data['title']['raw'],
			'content' => $data['content']['raw'],
			'excerpt' => $data['excerpt']['raw'],
			'meta'    => isset( $data['meta'] ) && is_array( $data['meta'] ) ? $data['meta'] : array(),
			'terms'   => array(),
		);

		$incoming['terms'] = Source_Posts_API::extract_embedded_terms( $data );

		return $incoming;
	}

	/**
	 * Extracts current data from local post.
	 *
	 * @param WP_Post $post Local post object.
	 *
	 * @return array Structured current data.
	 */
	private function extract_current_data( WP_Post $post ): array {
		$current = array(
			'title'   => $post->post_title,
			'content' => $post->post_content,
			'excerpt' => $post->post_excerpt,
			'meta'    => get_post_meta( $post->ID ),
			'terms'   => array(),
		);

		// Extract taxonomies.
		$taxonomies = get_post_taxonomies( $post->ID );
		if ( is_array( $taxonomies ) ) {
			foreach ( $taxonomies as $taxonomy ) {
				$terms = get_the_terms( $post->ID, $taxonomy );
				if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
					$names = array();
					foreach ( $terms as $term ) {
						$names[] = $term->name;
					}
					$current['terms'][ $taxonomy ] = $names;
				}
			}
		}

		return $current;
	}

	/**
	 * Applies cleanup/normalization to data for cleaner diffs.
	 *
	 * @param array $data Data to normalize.
	 *
	 * @return array Normalized data.
	 */
	private function apply_cleanup( array $data ): array {
		// Normalize content for better diffs.
		if ( isset( $data['content'] ) ) {
			$data['content'] = $this->normalize_for_diff( $data['content'] );
		}

		// Light normalization for title and excerpt.
		$light_normalize = static function ( string $text ): string {
			$text = str_replace( array( "\r\n", "\r" ), "\n", $text );
			$text = preg_replace( "/[ \t]+/", ' ', $text );
			$text = preg_replace( "/\n{3,}/", "\n\n", $text );
			return trim( $text );
		};

		if ( isset( $data['title'] ) ) {
			$data['title'] = $light_normalize( $data['title'] );
		}

		if ( isset( $data['excerpt'] ) ) {
			$data['excerpt'] = $light_normalize( $data['excerpt'] );
		}

		return $data;
	}

	/**
	 * Generates content diff HTML.
	 *
	 * Returns an empty string when the inputs are identical; the client uses
	 * that signal to omit the Source Diff view.
	 *
	 * @param string $current  Current content.
	 * @param string $incoming Incoming content.
	 * @param string $mode     Diff mode ('split' or 'inline').
	 *
	 * @return string Diff HTML, or '' when no changes.
	 */
	private function generate_content_diff( string $current, string $incoming, string $mode ): string {
		return wp_text_diff(
			$current,
			$incoming,
			array(
				'title_left'      => __( 'Current Content', 'safe-publish' ),
				'title_right'     => __( 'Incoming Content', 'safe-publish' ),
				'show_split_view' => ( 'split' === $mode ),
			)
		);
	}

	/**
	 * Generates non-content diffs (title, excerpt, taxonomies, meta).
	 *
	 * @param array $current  Current data.
	 * @param array $incoming Incoming data.
	 *
	 * @return array Non-content diff HTML keyed by field.
	 */
	private function generate_non_content_diffs( array $current, array $incoming ): array {
		$diffs = array();

		// Title diff.
		$diffs['title'] = $this->generate_simple_diff(
			$current['title'] ?? '',
			$incoming['title'] ?? '',
			__( 'Current Title', 'safe-publish' ),
			__( 'Incoming Title', 'safe-publish' )
		);

		// Excerpt diff (with normalization).
		$current_excerpt  = $this->prepare_excerpt_for_diff( $current['excerpt'] ?? '' );
		$incoming_excerpt = $this->prepare_excerpt_for_diff( $incoming['excerpt'] ?? '' );
		$diffs['excerpt'] = $this->generate_simple_diff(
			$current_excerpt,
			$incoming_excerpt,
			__( 'Current Excerpt', 'safe-publish' ),
			__( 'Incoming Excerpt', 'safe-publish' )
		);

		// Taxonomies diff.
		$current_terms_text  = $this->build_terms_text( $current['terms'] ?? array() );
		$incoming_terms_text = $this->build_terms_text( $incoming['terms'] ?? array() );
		$diffs['taxonomies'] = $this->generate_simple_diff(
			$current_terms_text,
			$incoming_terms_text,
			__( 'Current Taxonomies', 'safe-publish' ),
			__( 'Incoming Taxonomies', 'safe-publish' )
		);

		// Meta diff.
		$current_meta_text  = $this->build_meta_text( $current['meta'] ?? array() );
		$incoming_meta_text = $this->build_meta_text( $incoming['meta'] ?? array() );
		$diffs['meta']      = $this->generate_simple_diff(
			$current_meta_text,
			$incoming_meta_text,
			__( 'Current Meta', 'safe-publish' ),
			__( 'Incoming Meta', 'safe-publish' )
		);

		return $diffs;
	}

	/**
	 * Generates a simple diff for two text strings.
	 *
	 * Returns an empty string when the inputs are identical; the client uses
	 * that signal to omit the section by default.
	 *
	 * @param string $current     Current text.
	 * @param string $incoming    Incoming text.
	 * @param string $title_left  Title for left side.
	 * @param string $title_right Title for right side.
	 *
	 * @return string Diff HTML, or '' when no changes.
	 */
	private function generate_simple_diff(
		string $current,
		string $incoming,
		string $title_left,
		string $title_right
	): string {
		return wp_text_diff(
			$current,
			$incoming,
			array(
				'title_left'  => $title_left,
				'title_right' => $title_right,
			)
		);
	}

	/**
	 * Generates the featured media side-by-side preview.
	 *
	 * Returns an empty string when both sides resolve to the same image (or
	 * both sides are missing); the client uses that signal to omit the
	 * section.
	 *
	 * @param int      $local_post_id   Local post ID.
	 * @param string   $source_site_url Source site URL.
	 * @param array    $source_data     Source post data.
	 * @param callable $make_request    fn($url, $action, $credentials): array|WP_Error.
	 * @param array    $credentials     Authentication credentials.
	 *
	 * @return string Side-by-side preview HTML, or '' when unchanged.
	 */
	private function generate_featured_media_diff(
		int $local_post_id,
		string $source_site_url,
		array $source_data,
		callable $make_request,
		array $credentials
	): string {
		$incoming_featured_id  = isset( $source_data['featured_media'] ) ? absint( $source_data['featured_media'] ) : 0;
		$incoming_featured_url = '';

		if ( $incoming_featured_id && ! empty( $source_site_url ) ) {
			$media_api_url  = trailingslashit( $source_site_url ) . 'wp-json/wp/v2/media/' . $incoming_featured_id;
			$media_response = $make_request(
				$media_api_url,
				Request_Actions::PREVIEW,
				$credentials
			);

			if ( ! is_wp_error( $media_response ) ) {
				$media_body = wp_remote_retrieve_body( $media_response );
				$media_json = json_decode( $media_body, true );
				if ( is_array( $media_json ) && ! empty( $media_json['source_url'] ) ) {
					$incoming_featured_url = (string) $media_json['source_url'];
				}
			}
		}

		$current_featured_id  = get_post_thumbnail_id( $local_post_id );
		$current_featured_url = '';
		if ( $current_featured_id ) {
			$resolved = wp_get_attachment_image_url( $current_featured_id, 'full' );
			if ( is_string( $resolved ) ) {
				$current_featured_url = $resolved;
			}
		}

		if ( $current_featured_url === $incoming_featured_url ) {
			return '';
		}

		$current_img  = $current_featured_url
			? sprintf(
				'<a href="%1$s" target="_blank" rel="noopener noreferrer"><img alt="" src="%1$s" /></a>',
				esc_url( $current_featured_url )
			)
			: '<em>' . esc_html__( 'None', 'safe-publish' ) . '</em>';
		$incoming_img = $incoming_featured_url
			? sprintf(
				'<a href="%1$s" target="_blank" rel="noopener noreferrer"><img alt="" src="%1$s" /></a>',
				esc_url( $incoming_featured_url )
			)
			: '<em>' . esc_html__( 'None', 'safe-publish' ) . '</em>';

		return sprintf(
			'<div class="incoming-featured-media-preview">
				<div>%1$s</div>
				<div>%2$s</div>
			</div>',
			$current_img,
			$incoming_img
		);
	}

	/**
	 * Generates block-level diffs for Gutenberg content.
	 *
	 * @param string $current  Current content.
	 * @param string $incoming Incoming content.
	 *
	 * @return array Block diff data.
	 */
	private function generate_block_diffs( string $current, string $incoming ): array {
		if ( ! function_exists( 'parse_blocks' ) || ! function_exists( 'render_block' ) ) {
			return array();
		}

		$normalize_block_html = static function ( string $html ): string {
			// Remove leading/trailing whitespace.
			$html = trim( $html );

			// Remove lazy-loading & decoding attrs that WP may add automatically.
			$html = preg_replace( '/\sloading=("|\')lazy\1/i', '', $html );
			$html = preg_replace( '/\sdecoding=("|\')async\1/i', '', $html );
			$html = preg_replace( '/\sfetchpriority=("|\')high\1/i', '', $html );

			// Collapse multiple spaces / newlines.
			$html = preg_replace( '/\s+/', ' ', $html );

			// Normalize self-closing tags spacing.
			$html = preg_replace( '/\s+\/>/', '/>', $html );

			// Normalize wp-image-* numeric class volatility (retain class marker).
			$html = preg_replace( '/wp-image-\d+/', 'wp-image-XXX', $html );

			// Trim again.
			return trim( $html );
		};

		$current_blocks  = parse_blocks( $current ?? '' );
		$incoming_blocks = parse_blocks( $incoming ?? '' );
		$max             = max( count( $current_blocks ), count( $incoming_blocks ) );
		$block_diffs     = array();

		for ( $i = 0; $i < $max; $i++ ) {
			$cur = $current_blocks[ $i ] ?? null;
			$inc = $incoming_blocks[ $i ] ?? null;

			if ( ! $cur && ! $inc ) {
				continue;
			}

			$cur_name = $cur['blockName'] ?? null;
			$inc_name = $inc['blockName'] ?? null;

			$cur_rendered = $cur ? render_block( $cur ) : '';
			$inc_rendered = $inc ? render_block( $inc ) : '';

			$norm_cur = $cur ? $normalize_block_html( wp_kses_post( $cur_rendered ) ) : '';
			$norm_inc = $inc ? $normalize_block_html( wp_kses_post( $inc_rendered ) ) : '';

			// Skip empty freeform whitespace slots — parse_blocks emits them
			// between real blocks and they carry no visible signal.
			$cur_empty_freeform = ! $cur || ( null === $cur_name && '' === $norm_cur );
			$inc_empty_freeform = ! $inc || ( null === $inc_name && '' === $norm_inc );
			if ( $cur_empty_freeform && $inc_empty_freeform ) {
				continue;
			}

			$status = 'unchanged';
			if ( $cur && ! $inc ) {
				$status = 'removed';
			} elseif ( ! $cur && $inc ) {
				$status = 'added';
			} elseif ( $cur_name !== $inc_name ) {
				$status = 'modified';
			} elseif ( $cur && $inc && $norm_cur !== $norm_inc ) {
				$status = 'modified';
			}

			$block_diffs[] = array(
				'index'    => $i,
				'status'   => $status,
				'current'  => $cur ? array(
					'name'       => $cur_name,
					'attrs'      => $cur['attrs'] ?? new stdClass(),
					'rendered'   => wp_kses_post( $cur_rendered ),
					'normalized' => $norm_cur,
				) : null,
				'incoming' => $inc ? array(
					'name'       => $inc_name,
					'attrs'      => $inc['attrs'] ?? new stdClass(),
					'rendered'   => wp_kses_post( $inc_rendered ),
					'normalized' => $norm_inc,
				) : null,
			);
		}

		return $block_diffs;
	}

	/**
	 * Renders content with WordPress filters and block rendering.
	 *
	 * @param string $content Content to render.
	 *
	 * @return string Rendered content.
	 */
	private function render_content( string $content ): string {
		$rendered = $content;

		// Render blocks if present.
		if ( function_exists( 'has_blocks' ) && function_exists( 'do_blocks' ) ) {
			if ( has_blocks( $rendered ) ) {
				$rendered = do_blocks( $rendered );
			}
		}

		// Apply standard content filters (shortcodes, embeds, formatting).
		if ( function_exists( 'apply_filters' ) ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
			$rendered = apply_filters( 'the_content', $rendered );
		}

		return $rendered;
	}

	/**
	 * Normalizes HTML/content for wp_text_diff to reduce noise.
	 *
	 * Canonicalizes Gutenberg blocks via parse_blocks/serialize_blocks,
	 * ensures block comments and tags break onto their own lines,
	 * and collapses excessive whitespace without altering content meaning.
	 *
	 * This runs only for diff visualization and does not affect saved content.
	 *
	 * @param string $html Raw content HTML.
	 *
	 * @return string Normalized content suitable for line-based diffing.
	 */
	private function normalize_for_diff( string $html ): string {
		// Standardize newlines early.
		$html = str_replace( array( "\r\n", "\r" ), "\n", $html );

		// Canonicalize Gutenberg block formatting if present.
		if ( false !== strpos( $html, '<!-- wp:' )
			&& function_exists( 'parse_blocks' )
			&& function_exists( 'serialize_blocks' ) ) {
			$blocks = parse_blocks( $html );
			if ( is_array( $blocks ) && ! empty( $blocks ) ) {
				$html = serialize_blocks( $blocks );
			}
		}

		// Insert consistent line breaks to help the line-based diff.
		$html = $this->add_line_breaks_for_diff( $html );

		// Collapse runs of spaces/tabs.
		$html = preg_replace( "/[ \t]+/", ' ', $html );

		// Collapse many blank lines to max 1 blank line.
		$html = preg_replace( "/\n{3,}/", "\n\n", $html );

		// Trim edges for diff neatness.
		return trim( $html );
	}

	/**
	 * Adds predictable line breaks to improve alignment in diff.
	 *
	 * Puts Gutenberg block comments on their own lines,
	 * breaks between HTML tags (`><` -> `>\n<`),
	 * and normalizes self-closing spacing.
	 *
	 * @param string $html HTML content.
	 *
	 * @return ?string HTML with line breaks added.
	 */
	private function add_line_breaks_for_diff( string $html ): ?string {
		// Ensure each block comment is on its own line.
		$html = preg_replace( '/\s*(<!--\s*\/?wp:[^>]+-->)\s*/', "\n$1\n", $html );

		// Break between adjacent tags.
		$html = preg_replace( '/>\s*</', ">\n<", $html );

		// Normalize self-closing tag spacing.
		$html = preg_replace( '/\s+\/>/', '/>', $html );

		// Remove duplicate empty lines introduced by inserts.
		$html = preg_replace( "/\n{3,}/", "\n\n", $html );

		return $html;
	}

	/**
	 * Prepares excerpt for diff comparison by normalizing wrapping.
	 *
	 * @param string $excerpt Excerpt text.
	 *
	 * @return string Normalized excerpt.
	 */
	private function prepare_excerpt_for_diff( string $excerpt ): string {
		$excerpt = trim( $excerpt );

		// If entire excerpt is wrapped in a single <p>...</p>, strip that outer pair only.
		if ( preg_match( '#^<p>(.*)</p>$#si', $excerpt, $matches ) ) {
			$excerpt = $matches[1];
		}

		// Normalize whitespace: collapse internal newlines/spaces to single spaces.
		$excerpt = str_replace( array( "\r\n", "\r" ), "\n", $excerpt );
		$excerpt = preg_replace( '/\s+/', ' ', $excerpt );

		return trim( $excerpt );
	}

	/**
	 * Builds text representation of terms for diff comparison.
	 *
	 * @param array $terms_array Taxonomy terms array.
	 *
	 * @return string Text representation.
	 */
	private function build_terms_text( array $terms_array ): string {
		if ( empty( $terms_array ) ) {
			return '';
		}

		$lines = array();
		foreach ( $terms_array as $taxonomy => $names ) {
			$lines[] = $taxonomy . ': ' . implode( ', ', (array) $names );
		}

		return implode( "\n", $lines );
	}

	/**
	 * Builds text representation of meta for diff comparison.
	 *
	 * @param array $meta_array Post meta array.
	 *
	 * @return string Text representation.
	 */
	private function build_meta_text( array $meta_array ): string {
		if ( empty( $meta_array ) ) {
			return '';
		}

		$lines = array();
		foreach ( $meta_array as $key => $value ) {
			// Skip protected meta (leading underscore) and plugin internal meta.
			if ( 0 === strpos( $key, '_' ) || 0 === strpos( $key, 'safe_publish_' ) ) {
				continue;
			}

			$val = is_array( $value ) ? ( isset( $value[0] ) ? $value[0] : wp_json_encode( $value ) ) : $value;
			if ( is_array( $val ) || is_object( $val ) ) {
				$val = wp_json_encode( $val );
			}

			$lines[] = $key . ': ' . (string) $val;
		}

		return implode( "\n", $lines );
	}
}
