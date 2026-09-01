<?php
/**
 * Diff Renderer class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Admin\Content_Logger;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Post_Type_Map;
use stdClass;
use WP_Error;
use WP_Post;
use WP_Query;
use WP_REST_Request;
use WP_Term;

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
	 * Logger instance.
	 *
	 * @var Content_Logger
	 */
	private Content_Logger $logger;

	/**
	 * Constructs the Diff_Renderer instance.
	 */
	public function __construct() {
		$this->logger = new Content_Logger();
	}

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
		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );

		$mapped_post_type = Post_Type_Map::to_wp_slug( $post_type );

		// Find the local post by source ID, scoped to the connected source.
		$local_post = $this->find_local_post(
			$source_post_id,
			$mapped_post_type,
			Options::get_connected_site_url_with_path()
		);
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

		$resolved_post_data = Source_Post_Type_Resolver::resolve_post_data(
			$post_type,
			$source_data,
			$source_site_url,
			$make_request,
			$credentials
		);
		if ( is_wp_error( $resolved_post_data ) ) {
			return $resolved_post_data;
		}

		// Extract incoming data from the shared validated raw values.
		$incoming = $this->extract_incoming_data(
			$source_data,
			$resolved_post_data['raw_values']
		);

		// Extract current local data.
		$current = $this->extract_current_data( $local_post );

		// Normalize both sides for cleaner diffs.
		$current  = $this->normalize_diff_data( $current );
		$incoming = $this->normalize_diff_data( $incoming );

		// Ensure WordPress diff renderer is available.
		if ( ! class_exists( 'WP_Text_Diff_Renderer_Table' ) ) {
			/** @psalm-suppress MissingFile */
			require_once ABSPATH . 'wp-includes/wp-diff.php';
		}

		// Generate all diffs.
		$content_diff_html = $this->generate_simple_diff(
			$current['content'],
			$incoming['content'],
			__( 'Current Content', 'safe-publish' ),
			__( 'Incoming Content', 'safe-publish' )
		);
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
	 * @param int    $source_post_id  Source post ID to search for.
	 * @param string $post_type       Post type to search.
	 * @param string $source_site_url Source site identity of the import.
	 *
	 * @return WP_Post|WP_Error Post object on success, WP_Error if not found.
	 */
	public function find_local_post(
		int $source_post_id,
		string $post_type,
		string $source_site_url
	): WP_Post|WP_Error {
		$query = new WP_Query(
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'     => array(
					'relation' => 'AND',
					array(
						'key'   => Options::META_SOURCE_POST_ID,
						'value' => $source_post_id,
					),
					array(
						'key'   => Options::META_SOURCE_SITE_URL,
						'value' => $source_site_url,
					),
				),
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
			$message    = $response->get_error_message();
			$error_code = $response->get_error_code();
			$error_data = $response->get_error_data();

			$this->logger->content_fetch_failed(
				$post_id,
				$source_site_url,
				$message
			);

			// Size-limit reason passes through with its own code; other
			// failures surface under the stable UI error code.
			if ( HTTP_Client::ERROR_RESPONSE_TOO_LARGE === $error_code ) {
				return $response;
			}

			// The transport reason names the connected host, so surface it to
			// administrators only; the log above records it either way.
			$withhold_source_message =
				HTTP_Client::ERROR_REQUEST_FAILED === $error_code
				&& ! current_user_can( 'manage_options' );
			if ( $withhold_source_message ) {
				$message = __(
					'Failed to fetch data from source site.',
					'safe-publish'
				);
			}

			$rest_error_data = array( 'status' => 500 );
			$source_error    = is_array( $error_data )
				? ( $error_data[ HTTP_Client::ERROR_DATA_SOURCE_ERROR ] ?? null )
				: null;
			if (
				is_array( $source_error )
				&& isset( $source_error['message'], $source_error['template'] )
				&& is_string( $source_error['message'] )
				&& is_string( $source_error['template'] )
				// The client rejects a template with any other tag.
				&& 1 === preg_match(
					'#^[^<]*<reason />[^<]*$#',
					$source_error['template']
				)
				&& ! $withhold_source_message
			) {
				$rest_error_data[ HTTP_Client::ERROR_DATA_SOURCE_ERROR ] =
					$source_error;
			}

			return new WP_Error(
				'source_fetch_failed',
				$message,
				$rest_error_data
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
	 * @param array $data       Source post data.
	 * @param array $raw_values Validated raw title, content, and excerpt.
	 *
	 * @return array Structured incoming data.
	 */
	private function extract_incoming_data(
		array $data,
		array $raw_values
	): array {
		$incoming = array(
			'title'   => $raw_values['title'],
			'content' => $raw_values['content'],
			'excerpt' => $raw_values['excerpt'],
			'meta'    => isset( $data['meta'] ) && is_array( $data['meta'] ) ? $data['meta'] : array(),
			'terms'   => array(),
		);

		// Only safe_publish_terms carries parent and description; a source on an
		// older plugin version leaves the comparison on names alone.
		$source_terms = Source_Posts_API::extract_source_terms( $data );

		$incoming['terms']           = $source_terms
			?? Source_Posts_API::extract_embedded_terms( $data );
		$incoming['has_term_fields'] = null !== $source_terms;

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
			'title'        => $post->post_title,
			'content'      => $post->post_content,
			'excerpt'      => $post->post_excerpt,
			'meta'         => get_post_meta( $post->ID ),
			'terms'        => array(),
			'term_objects' => array(),
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
					$current['terms'][ $taxonomy ]        = $names;
					$current['term_objects'][ $taxonomy ] = $terms;
				}
			}
		}

		return $current;
	}

	/**
	 * Normalizes one side of the comparison for cleaner diffs.
	 *
	 * @param array $data Data to normalize.
	 *
	 * @return array Normalized data.
	 */
	private function normalize_diff_data( array $data ): array {
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
			__( 'Current', 'safe-publish' ),
			__( 'Incoming', 'safe-publish' )
		);

		// Excerpt diff (with normalization).
		$current_excerpt  = $this->prepare_excerpt_for_diff( $current['excerpt'] ?? '' );
		$incoming_excerpt = $this->prepare_excerpt_for_diff( $incoming['excerpt'] ?? '' );
		$diffs['excerpt'] = $this->generate_simple_diff(
			$current_excerpt,
			$incoming_excerpt,
			__( 'Current', 'safe-publish' ),
			__( 'Incoming', 'safe-publish' )
		);

		// Taxonomies diff.
		$diffs['taxonomies'] = $this->generate_terms_diff( $current, $incoming );

		// Meta diff.
		$current_meta_text  = $this->build_meta_text( $current['meta'] ?? array() );
		$incoming_meta_text = $this->build_meta_text( $incoming['meta'] ?? array() );
		$diffs['meta']      = $this->generate_simple_diff(
			$current_meta_text,
			$incoming_meta_text,
			__( 'Current', 'safe-publish' ),
			__( 'Incoming', 'safe-publish' )
		);

		return $diffs;
	}

	/**
	 * Generates a simple diff for two text strings.
	 *
	 * Returns an empty string when the inputs are identical; the client uses
	 * that signal to control whether the section is shown.
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
			} else {
				// Log the failure rather than silently rendering the incoming
				// featured image as absent.
				$this->logger->content_fetch_failed(
					$incoming_featured_id,
					$source_site_url,
					$media_response->get_error_message()
				);
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

		// Normalize whitespace: Collapse internal newlines/spaces to single spaces.
		$excerpt = str_replace( array( "\r\n", "\r" ), "\n", $excerpt );
		$excerpt = preg_replace( '/\s+/', ' ', $excerpt );

		return trim( $excerpt );
	}

	/**
	 * Builds text representation of terms for diff comparison, names only.
	 *
	 * Accepts either a list of names (current side, via get_the_terms) or the
	 * per-term records the incoming side returns from extract_embedded_terms.
	 * Used when the source sends no per-term fields to compare.
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
		foreach ( $terms_array as $taxonomy => $items ) {
			$names = array();
			foreach ( (array) $items as $item ) {
				if ( is_array( $item ) ) {
					$names[] = isset( $item['name'] ) ? (string) $item['name'] : '';
				} else {
					$names[] = (string) $item;
				}
			}
			$lines[] = $taxonomy . ': ' . implode( ', ', $names );
		}

		return implode( "\n", $lines );
	}

	/**
	 * Generates the taxonomies diff, comparing each term's parent and
	 * description when the source sends them, and appending a note for every
	 * shown difference the import would not apply.
	 *
	 * Covers the taxonomies the payload carries, since the import writes no
	 * others.
	 *
	 * @param array $current  Current data.
	 * @param array $incoming Incoming data.
	 *
	 * @return string Diff HTML, or '' when no changes.
	 */
	private function generate_terms_diff( array $current, array $incoming ): string {
		$title_left  = __( 'Current', 'safe-publish' );
		$title_right = __( 'Incoming', 'safe-publish' );
		$records     = $incoming['terms'] ?? array();

		if ( true !== ( $incoming['has_term_fields'] ?? false ) ) {
			$local = array_intersect_key(
				$current['terms'] ?? array(),
				$records
			);

			return $this->generate_simple_diff(
				$this->build_terms_text( $local ),
				$this->build_terms_text( $records ),
				$title_left,
				$title_right
			);
		}

		$term_objects = $current['term_objects'] ?? array();

		$records = $this->drop_untouched_taxonomies(
			$records,
			$term_objects
		);

		$local = array_intersect_key( $term_objects, $records );

		// A blank side diffs as one empty line, so it reads as a deletion.
		if ( array() === $local ) {
			$local = array_fill_keys( array_keys( $records ), array() );
		}

		$plans = ( new Meta_Terms_Manager() )->plan_terms(
			$records,
			Options::get_connected_site_url_with_path()
		);

		$assigned_html = $this->generate_simple_diff(
			$this->build_term_fields_text( $this->current_term_fields( $local ) ),
			$this->build_term_fields_text(
				$this->incoming_term_fields( $records, $plans )
			),
			$title_left,
			$title_right
		);

		$related_current  = $this->current_related_terms( $plans );
		$related_incoming = $this->incoming_related_term_fields( $plans );
		$related_html     = array() === $related_incoming
			? ''
			: $this->generate_simple_diff(
				$this->build_term_fields_text(
					$this->current_term_fields( $related_current )
				),
				$this->build_term_fields_text( $related_incoming ),
				$title_left,
				$title_right
			);

		if ( '' === $assigned_html && '' === $related_html ) {
			return '';
		}

		$assigned_notes = array_merge(
			$this->build_term_notes(
				$plans,
				$this->local_term_ids( $local ),
				true
			),
			$this->unregistered_taxonomy_notes( $records )
		);
		$related_notes  = $this->build_term_notes(
			$plans,
			$this->local_term_ids( $related_current ),
			false
		);

		$html = $assigned_html . $this->build_term_notes_html( $assigned_notes );

		if ( '' !== $related_html ) {
			$html .= $this->build_related_terms_html(
				$related_html . $this->build_term_notes_html( $related_notes )
			);
		}

		return $html;
	}

	/**
	 * Drops a payload taxonomy the source sent empty and the post carries no
	 * terms in, which the import neither attaches nor clears.
	 *
	 * @param array $records      Source term records by taxonomy.
	 * @param array $term_objects Local terms by taxonomy.
	 *
	 * @return array Records left to compare.
	 */
	private function drop_untouched_taxonomies(
		array $records,
		array $term_objects
	): array {
		return array_filter(
			$records,
			static fn( mixed $items, string|int $taxonomy ): bool =>
				array() !== $items
				|| array() !== ( $term_objects[ $taxonomy ] ?? array() ),
			ARRAY_FILTER_USE_BOTH
		);
	}

	/**
	 * Lists the IDs of the terms the post carries.
	 *
	 * @param array<string, WP_Term[]> $term_objects Local terms by taxonomy.
	 *
	 * @return int[] Local term IDs.
	 */
	private function local_term_ids( array $term_objects ): array {
		$ids = array();

		foreach ( $term_objects as $terms ) {
			foreach ( $terms as $term ) {
				$ids[] = (int) $term->term_id;
			}
		}

		return $ids;
	}

	/**
	 * Renders term fields for diff comparison: One summary line per taxonomy,
	 * then a line per term carrying a parent or a description. Terms are keyed
	 * and ordered by slug.
	 *
	 * @param array<string, list<array{name:string, slug:string, parent:string, description:string}>> $by_tax Display fields by taxonomy.
	 *
	 * @return string Text representation.
	 */
	private function build_term_fields_text( array $by_tax ): string {
		ksort( $by_tax );

		$lines = array();

		foreach ( $by_tax as $taxonomy => $terms ) {
			usort(
				$terms,
				static fn( array $a, array $b ): int =>
					strcmp( $a['slug'], $b['slug'] )
			);

			$labels = array();

			foreach ( $terms as $term ) {
				$labels[] = $this->term_label( $term['name'], $term['slug'] );
			}

			$lines[] = $taxonomy . ': ' . implode( ', ', $labels );

			foreach ( $terms as $term ) {
				$key = $this->term_key( $term['slug'], (string) $taxonomy );

				if ( '' !== $term['parent'] ) {
					$lines[] = $key . ' parent: ' . $term['parent'];
				}

				if ( '' !== $term['description'] ) {
					$lines[] = $key . ' description: ' . $term['description'];
				}
			}
		}

		return implode( "\n", $lines );
	}

	/**
	 * Collects the display fields of the post's local terms.
	 *
	 * @param array<string, WP_Term[]> $term_objects Local terms by taxonomy.
	 *
	 * @return array<string, list<array{name:string, slug:string, parent:string, description:string}>>
	 */
	private function current_term_fields( array $term_objects ): array {
		$by_tax = array();

		foreach ( $term_objects as $taxonomy => $terms ) {
			$fields = array();

			foreach ( $terms as $term ) {
				$fields[] = $this->term_display_fields( $term );
			}

			$by_tax[ (string) $taxonomy ] = $fields;
		}

		return $by_tax;
	}

	/**
	 * Collects the display fields of the source's assigned terms. Ancestors
	 * arrive unassigned and are created but not attached, so they only serve to
	 * name a parent here.
	 *
	 * @param array $records Source term records by taxonomy.
	 * @param array $plans   Per-taxonomy term plans from Meta_Terms_Manager.
	 *
	 * @return array<string, list<array{name:string, slug:string, parent:string, description:string}>>
	 */
	private function incoming_term_fields( array $records, array $plans ): array {
		$by_tax = array();

		foreach ( $records as $taxonomy => $items ) {
			$paired = $this->paired_terms( $plans[ (string) $taxonomy ] ?? array() );
			$index  = $this->source_term_index( $items, $paired );
			$fields = array();

			foreach ( $items as $item ) {
				if ( false === ( $item['assigned'] ?? true ) ) {
					continue;
				}

				$fields[] = $this->record_display_fields(
					$item,
					$index,
					$paired[ absint( $item['source_term_id'] ?? 0 ) ] ?? null
				);
			}

			$by_tax[ (string) $taxonomy ] = $fields;
		}

		return $by_tax;
	}

	/**
	 * Collects the destination terms the unassigned records pair with. A
	 * taxonomy carrying such records is listed even when none of them pairs,
	 * so the current side never comes out blank.
	 *
	 * @param array $plans Per-taxonomy term plans from Meta_Terms_Manager.
	 *
	 * @return array<string, WP_Term[]>
	 */
	private function current_related_terms( array $plans ): array {
		$by_tax = array();

		foreach ( $plans as $taxonomy => $entries ) {
			$terms   = array();
			$related = false;

			foreach ( $entries as $entry ) {
				if ( true === $entry['record']['assigned'] ) {
					continue;
				}

				$related = true;

				if ( $entry['term'] instanceof WP_Term ) {
					$terms[ (int) $entry['term']->term_id ] = $entry['term'];
				}
			}

			if ( true === $related ) {
				$by_tax[ (string) $taxonomy ] = array_values( $terms );
			}
		}

		return $by_tax;
	}

	/**
	 * Collects the source fields of unassigned terms used to carry hierarchy.
	 *
	 * @param array $plans Per-taxonomy term plans from Meta_Terms_Manager.
	 *
	 * @return array<string, list<array{name:string, slug:string, parent:string, description:string}>>
	 */
	private function incoming_related_term_fields( array $plans ): array {
		$by_tax = array();

		foreach ( $plans as $taxonomy => $entries ) {
			$records = wp_list_pluck( $entries, 'record' );
			$paired  = $this->paired_terms( $entries );
			$index   = $this->source_term_index( $records, $paired );
			$fields  = array();

			foreach ( $entries as $entry ) {
				$record = $entry['record'];

				if ( true === $record['assigned'] ) {
					continue;
				}

				$fields[] = $this->record_display_fields(
					$record,
					$index,
					$entry['term'] instanceof WP_Term ? $entry['term'] : null
				);
			}

			if ( array() !== $fields ) {
				$by_tax[ (string) $taxonomy ] = $fields;
			}
		}

		return $by_tax;
	}

	/**
	 * Maps source term IDs to the destination term they pair with.
	 *
	 * @param array $entries Plan entries for one taxonomy.
	 *
	 * @return array<int, WP_Term> Source term ID mapped to destination term.
	 */
	private function paired_terms( array $entries ): array {
		$paired = array();

		foreach ( $entries as $entry ) {
			$source_term_id = (int) $entry['record']['source_term_id'];

			if ( $source_term_id > 0 && $entry['term'] instanceof WP_Term ) {
				$paired[ $source_term_id ] = $entry['term'];
			}
		}

		return $paired;
	}

	/**
	 * Maps source term IDs to the source's name and the slug the destination
	 * identifies the term by, so both sides name a parent alike.
	 *
	 * @param array               $items  Source term records for one taxonomy.
	 * @param array<int, WP_Term> $paired Destination terms by source term ID.
	 *
	 * @return array<int, array{name:string, slug:string}>
	 */
	private function source_term_index( array $items, array $paired ): array {
		$index = array();

		foreach ( $items as $item ) {
			$id = absint( $item['source_term_id'] ?? 0 );

			if ( 0 === $id || isset( $index[ $id ] ) ) {
				continue;
			}

			$name = (string) ( $item['name'] ?? '' );
			$slug = isset( $paired[ $id ] )
				? (string) $paired[ $id ]->slug
				: (string) ( $item['slug'] ?? '' );

			$index[ $id ] = array(
				'name' => $name,
				'slug' => '' !== $slug ? $slug : sanitize_title( $name ),
			);
		}

		return $index;
	}

	/**
	 * Renders one local term's display fields.
	 *
	 * @param WP_Term $term Local term.
	 *
	 * @return array{name:string, slug:string, parent:string, description:string}
	 */
	private function term_display_fields( WP_Term $term ): array {
		$parent = (int) $term->parent > 0
			? get_term( (int) $term->parent, (string) $term->taxonomy )
			: null;

		return array(
			'name'        => (string) $term->name,
			'slug'        => (string) $term->slug,
			'parent'      => $parent instanceof WP_Term
				? $this->term_label( (string) $parent->name, (string) $parent->slug )
				: '',
			'description' => $this->collapse_whitespace( (string) $term->description ),
		);
	}

	/**
	 * Renders one source record's display fields, showing the description in
	 * the form the destination would store it in.
	 *
	 * @param array                                       $record Source term record.
	 * @param array<int, array{name:string, slug:string}> $index Source term ID mapped to name and slug.
	 * @param WP_Term|null                                $pair   Destination term the record pairs with,
	 *                                                            or null when none does.
	 *
	 * @return array{name:string, slug:string, parent:string, description:string}
	 */
	private function record_display_fields(
		array $record,
		array $index,
		?WP_Term $pair
	): array {
		$id          = absint( $record['source_term_id'] ?? 0 );
		$name        = (string) ( $record['name'] ?? '' );
		$stored      = $pair instanceof WP_Term ? (string) $pair->description : null;
		$source      = (string) ( $record['description'] ?? '' );
		$description = wp_kses_post( $source );

		// Mirrors the reconcile: Core narrows a description as it saves, and
		// how far depends on who imports, so either form already stored means
		// nothing would change.
		if (
			null !== $stored
			&& (
				$stored === $description
				|| Meta_Terms_Manager::narrow_description( $source ) === $stored
			)
		) {
			$description = $stored;
		}

		return array(
			'name'        => $name,
			'slug'        => $this->record_slug( $record, $index, $id ),
			'parent'      => $this->parent_label(
				absint( $record['parent'] ?? 0 ),
				$index
			),
			'description' => $this->collapse_whitespace( $description ),
		);
	}

	/**
	 * Reads the slug a record is identified by: The paired destination term's,
	 * falling back to the source's own for a term the import would create.
	 *
	 * @param array                                       $record Source term record.
	 * @param array<int, array{name:string, slug:string}> $index  Source term ID mapped to name and slug.
	 * @param int                                         $id     Source term ID.
	 *
	 * @return string Slug.
	 */
	private function record_slug( array $record, array $index, int $id ): string {
		$slug = (string) ( $index[ $id ]['slug'] ?? '' );

		if ( '' === $slug ) {
			$slug = (string) ( $record['slug'] ?? '' );
		}

		return '' !== $slug
			? $slug
			: sanitize_title( (string) ( $record['name'] ?? '' ) );
	}

	/**
	 * Names the parent a record sends, or '' when the records name none.
	 *
	 * @param int                                         $source_parent_id Source parent term ID.
	 * @param array<int, array{name:string, slug:string}> $index            Source term ID mapped to name and slug.
	 *
	 * @return string Parent label.
	 */
	private function parent_label( int $source_parent_id, array $index ): string {
		if ( ! isset( $index[ $source_parent_id ] ) ) {
			return '';
		}

		return $this->term_label(
			$index[ $source_parent_id ]['name'],
			$index[ $source_parent_id ]['slug']
		);
	}

	/**
	 * Lists a note for every shown field difference the import would leave
	 * unwritten, keyed by the destination term the note describes.
	 *
	 * @param array $plans       Per-taxonomy term plans from Meta_Terms_Manager.
	 * @param int[] $current_ids IDs of the terms shown on the current side.
	 * @param bool  $assigned    Whether to build notes for assigned records.
	 *
	 * @return string[] Note lines.
	 */
	private function build_term_notes(
		array $plans,
		array $current_ids,
		bool $assigned
	): array {
		$notes = array();

		foreach ( $plans as $taxonomy => $entries ) {
			$records   = wp_list_pluck( $entries, 'record' );
			$paired    = $this->paired_terms( $entries );
			$index     = $this->source_term_index( $records, $paired );
			$by_source = $this->entries_by_source( $entries );

			foreach ( $entries as $entry ) {
				if ( ! ( $entry['term'] instanceof WP_Term ) ) {
					continue;
				}

				$record = $entry['record'];

				if ( $assigned !== $record['assigned'] ) {
					continue;
				}

				$current  = $this->term_display_fields( $entry['term'] );
				$incoming = $this->record_display_fields(
					$record,
					$index,
					$entry['term']
				);
				$key      = $this->term_key( $current['slug'], (string) $taxonomy );

				// A term missing from this comparison's current side shows no
				// destination values.
				$shown_current = in_array(
					(int) $entry['term']->term_id,
					$current_ids,
					true
				);

				$source_parent = absint( $record['parent'] ?? 0 );
				$parent_stands = isset( $paired[ $source_parent ] )
					&& (int) $paired[ $source_parent ]->term_id
						=== (int) $entry['term']->parent;

				foreach ( array( 'name', 'parent', 'description' ) as $field ) {
					if (
						$current[ $field ] === $incoming[ $field ]
						|| in_array( $field, $entry['changes'], true )
					) {
						continue;
					}

					// A note is only ever the companion to a value the table
					// shows on one side or the other.
					if (
						'' === $incoming[ $field ]
						&& ( ! $shown_current || '' === $current[ $field ] )
					) {
						continue;
					}

					$blocked = (string) ( $entry['blocked'][ $field ] ?? '' );

					// The term keeps its parent and nothing blocks it, so the
					// line differs only because that parent is renamed.
					if (
						'parent' === $field
						&& '' === $blocked
						&& $parent_stands
					) {
						if (
							isset( $by_source[ $source_parent ] )
							&& $assigned ===
								$by_source[ $source_parent ]['record']['assigned']
						) {
							$parent_note = $this->renamed_parent_note(
								$source_parent,
								$by_source,
								(string) $taxonomy
							);

							if ( '' !== $parent_note ) {
								$notes[] = $parent_note;
							}
						}

						continue;
					}

					$notes[] = $key . ': ' . $this->term_note_message(
						$field,
						$blocked
					);
				}
			}
		}

		// Two records can produce one note: Several children naming the same
		// parent, or two source terms pairing with one destination term.
		return array_values( array_unique( $notes ) );
	}

	/**
	 * Indexes the plan entries by source term ID, so a record's parent can be
	 * looked up.
	 *
	 * @param array $entries Plan entries for one taxonomy.
	 *
	 * @return array<int, array{record:array, term:WP_Term|null, eligible:bool, changes:string[], blocked:array<string, string>}>
	 */
	private function entries_by_source( array $entries ): array {
		$by_source = array();

		foreach ( $entries as $entry ) {
			$source_term_id = (int) $entry['record']['source_term_id'];

			if ( $source_term_id > 0 ) {
				$by_source[ $source_term_id ] = $entry;
			}
		}

		return $by_source;
	}

	/**
	 * Annotates a parent line that differs only because the parent itself is
	 * renamed, keyed to that parent rather than to the term whose line shows it.
	 * Returns '' when the rename applies, since the line then matches.
	 *
	 * @param int    $source_parent_id Source parent term ID.
	 * @param array  $by_source        Plan entries by source term ID.
	 * @param string $taxonomy         Taxonomy slug.
	 *
	 * @return string Note line, or '' when the difference needs none.
	 */
	private function renamed_parent_note(
		int $source_parent_id,
		array $by_source,
		string $taxonomy
	): string {
		$entry = $by_source[ $source_parent_id ] ?? null;

		if ( null === $entry || ! ( $entry['term'] instanceof WP_Term ) ) {
			return '';
		}

		if ( in_array( 'name', $entry['changes'], true ) ) {
			return '';
		}

		return $this->term_key( (string) $entry['term']->slug, $taxonomy )
			. ': ' . $this->term_note_message(
				'name',
				(string) ( $entry['blocked']['name'] ?? '' )
			);
	}

	/**
	 * Builds the identifier joining a term's lines to its notes: The slug, which
	 * the import never rewrites, plus the taxonomy, so a renamed term keys alike
	 * on both sides and terms sharing a slug across taxonomies stay distinct.
	 *
	 * @param string $slug     Term slug.
	 * @param string $taxonomy Taxonomy slug.
	 *
	 * @return string Note key.
	 */
	private function term_key( string $slug, string $taxonomy ): string {
		return $slug . ' (' . $taxonomy . ')';
	}

	/**
	 * Names a term shown as a value, in a summary line or as another term's
	 * parent.
	 *
	 * @param string $name Term name.
	 * @param string $slug Term slug.
	 *
	 * @return string Term label.
	 */
	private function term_label( string $name, string $slug ): string {
		return $name . ' (' . $slug . ')';
	}

	/**
	 * Renders why a field difference would not be applied.
	 *
	 * @param string $field  Field that differs.
	 * @param string $reason Blocking reason, or '' when nothing blocks the
	 *                       write and the import simply leaves the field alone.
	 *
	 * @return string Note message.
	 */
	private function term_note_message( string $field, string $reason ): string {
		$blocked = match ( $reason ) {
			'name_taken'        => __( 'may not apply — name taken', 'safe-publish' ),
			'parent_loop'       => __( 'may not apply — parent conflict', 'safe-publish' ),
			'parent_unresolved' => __( 'may not apply — parent missing', 'safe-publish' ),
			default             => '',
		};

		if ( '' !== $blocked ) {
			return $blocked;
		}

		$label = match ( $field ) {
			'parent'      => __( 'parent', 'safe-publish' ),
			'description' => __( 'description', 'safe-publish' ),
			default       => __( 'name', 'safe-publish' ),
		};

		return sprintf(
			/* translators: %s: term field, one of name, parent, or description */
			__( '%s not updated on import', 'safe-publish' ),
			$label
		);
	}

	/**
	 * Lists a note for every payload taxonomy the destination does not
	 * register and the import skips whole.
	 *
	 * @param array $records Source term records by taxonomy.
	 *
	 * @return string[] Note lines.
	 */
	private function unregistered_taxonomy_notes( array $records ): array {
		$notes = array();

		foreach ( array_keys( $records ) as $taxonomy ) {
			// Matches the slug the import checks.
			$tax = sanitize_key( (string) $taxonomy );

			if ( '' === $tax || taxonomy_exists( $tax ) ) {
				continue;
			}

			$notes[] = $tax . ': ' . __(
				'not imported — taxonomy not registered',
				'safe-publish'
			);
		}

		return $notes;
	}

	/**
	 * Renders the notes as a list below the diff table. Core escapes and
	 * word-diffs everything inside the table, so a note placed there would read
	 * as inserted content.
	 *
	 * @param string[] $notes Note lines.
	 *
	 * @return string Notes HTML, or '' when there are none.
	 */
	private function build_term_notes_html( array $notes ): string {
		if ( array() === $notes ) {
			return '';
		}

		$items = '';
		foreach ( $notes as $note ) {
			$items .= '<li>' . esc_html( $note ) . '</li>';
		}

		return '<ul class="safe-publish-term-notes">' . $items . '</ul>';
	}

	/**
	 * Wraps the comparison for terms used only to preserve hierarchy.
	 *
	 * @param string $diff_html Related term diff table.
	 *
	 * @return string Related terms HTML.
	 */
	private function build_related_terms_html( string $diff_html ): string {
		$heading = __( 'Related hierarchy terms', 'safe-publish' );
		$help    = __(
			'The source sends these terms to carry the hierarchy, not to assign them to the post.',
			'safe-publish'
		);

		return '<div class="safe-publish-related-terms">'
			. '<h4 class="safe-publish-related-terms__heading">'
			. esc_html( $heading ) . '</h4>'
			. '<p class="safe-publish-related-terms__help">'
			. esc_html( $help ) . '</p>'
			. $diff_html
			. '</div>';
	}

	/**
	 * Collapses whitespace so a rewrapped description does not read as a
	 * change, and a multi-line one stays on its own diff line.
	 *
	 * @param string $text Text to normalize.
	 *
	 * @return string Normalized text.
	 */
	private function collapse_whitespace( string $text ): string {
		return trim( (string) preg_replace( '/\s+/', ' ', $text ) );
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
