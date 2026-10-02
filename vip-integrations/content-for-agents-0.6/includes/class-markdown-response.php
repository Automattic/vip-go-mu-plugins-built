<?php

/**
 * Markdown response output handler.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Serves a post as markdown with frontmatter and headers.
 *
 * @package Content_For_Agents
 */
class Markdown_Response {

	/**
	 * Cache group for markdown document output.
	 */
	const CACHE_GROUP = 'content_for_agents_doc';

	/**
	 * Cache TTL (1 hour).
	 */
	const CACHE_TTL = 3600;

	/**
	 * Output markdown response for a post.
	 *
	 * Sends appropriate headers and outputs the full markdown body with frontmatter.
	 * Exits after output.
	 *
	 * @param \WP_Post $post Post object.
	 */
	public static function serve( $post ) {
		if ( 'publish' !== $post->post_status && ! current_user_can( 'read_post', $post->ID ) ) {
			nocache_headers();
			wp_die( esc_html__( 'Content not found.', 'content-for-agents' ), '', array( 'response' => 404 ) );
		}
		if ( post_password_required( $post ) && ! current_user_can( 'edit_post', $post->ID ) ) {
			nocache_headers();
			wp_die( esc_html__( 'This content is password protected.', 'content-for-agents' ), '', array( 'response' => 403 ) );
		}
		if ( ! Markdown_Access::can_serve( $post ) ) {
			nocache_headers();
			wp_die( esc_html__( 'Content not found.', 'content-for-agents' ), '', array( 'response' => 404 ) );
		}

		// Shared caches must contain only anonymous, public, non-preview output.
		$cacheable = Markdown_Access::can_cache( $post );
		$cache_key = 'markdown_' . $post->ID;
		$content   = $cacheable ? wp_cache_get( $cache_key, self::CACHE_GROUP ) : false;
		$title     = html_entity_decode( get_the_title( $post ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$title     = trim( preg_replace( '/\s+/u', ' ', $title ) ?? $title );

		if ( ! is_string( $content ) || '' === $content ) {
			$converter   = new Markdown_Converter();
			$frontmatter = new Frontmatter();

			$markdown_body = $converter->post_to_markdown( $post );
			$yaml          = $frontmatter->build( $post, $markdown_body );

			/** This filter is documented in class-markdown-response.php */
			$markdown_body = apply_filters( 'content_for_agents_after_markdown', $markdown_body, $post );

			$content = $yaml . self::get_title_heading( $title, $markdown_body ) . $markdown_body;

			if ( $cacheable ) {
				// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined -- CACHE_TTL is one hour.
				wp_cache_set( $cache_key, $content, self::CACHE_GROUP, self::CACHE_TTL );
			}
		}

		$canonical_url  = get_permalink( $post );
		$token_count    = Markdown_Converter::estimate_tokens( $content );
		$content_signal = self::get_content_signal_header();

		self::send_headers( $title, $canonical_url, $post->post_name, $token_count, $content_signal );
		if ( ! $cacheable ) {
			nocache_headers();
			header( 'Cache-Control: private, no-store, max-age=0' );
		}

		// This is the complete non-HTML response. Stop the WordPress request after
		// writing it so template rendering and later hooks cannot append output.
		echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		exit;
	}

	/**
	 * Add a document title only when the rendered body does not already begin
	 * with that heading.
	 *
	 * @param string $title         Normalized document title.
	 * @param string $markdown_body Rendered post content.
	 * @return string Markdown heading or an empty string.
	 */
	private static function get_title_heading( string $title, string $markdown_body ): string {
		if ( '' === $title ) {
			return '';
		}

		if ( preg_match( '/\A# ([^\n]+)(?:\n|$)/u', $markdown_body, $matches ) ) {
			$heading = trim( preg_replace( '/\s+/u', ' ', $matches[1] ) ?? $matches[1] );
			if ( $title === $heading ) {
				return '';
			}
		}

		return "# $title\n\n";
	}

	/**
	 * Send standard headers for a markdown response.
	 *
	 * Centralises all header emission so callers only need to provide
	 * the document metadata.
	 *
	 * @param string $title          Human-readable document title.
	 * @param string $canonical_url  Canonical HTML URL for this document.
	 * @param string $slug           URL-safe slug used for the filename.
	 * @param int    $token_count    Estimated token count.
	 * @param string $content_signal Content-Signal header value.
	 * @param int    $cache_ttl      Cache max-age in seconds. 0 (default) uses self::CACHE_TTL.
	 */
	public static function send_headers( string $title, string $canonical_url, string $slug, int $token_count, string $content_signal = '', int $cache_ttl = 0 ) {
		$escaped_title = addcslashes( str_replace( array( "\r", "\n" ), ' ', $title ), '"\\' );
		$filename      = sanitize_file_name( '' !== $slug ? $slug : 'document' ) . '.md';
		$ttl           = $cache_ttl > 0 ? $cache_ttl : self::CACHE_TTL;

		header( 'Content-Type: text/markdown; charset=utf-8' );
		send_nosniff_header();
		header( 'X-Robots-Tag: noindex' );
		header( 'X-Markdown-Tokens: ' . $token_count );
		header( 'Cache-Control: public, max-age=' . $ttl );

		if ( '' !== $content_signal ) {
			header( 'Content-Signal: ' . $content_signal );
		}

		header( 'Link: <' . esc_url( $canonical_url ) . '>; rel="canonical"; title="' . $escaped_title . '"' );
		header( 'Content-Disposition: inline; filename="' . $filename . '"' );
	}

	/**
	 * Get the Content-Signal header value from options.
	 *
	 * @return string Header value (e.g. ai-train=yes, search=yes, ai-input=yes).
	 */
	public static function get_content_signal_header() {
		$options = get_option(
			'content_for_agents_content_signal',
			array(
				'ai-train' => 'yes',
				'search'   => 'yes',
				'ai-input' => 'yes',
			)
		);

		if ( ! is_array( $options ) ) {
			return '';
		}
		$parts = array();
		foreach ( array( 'ai-train', 'search', 'ai-input' ) as $key ) {
			if ( ! array_key_exists( $key, $options ) ) {
				continue;
			}
			$value = $options[ $key ];
			if ( is_string( $value ) ) {
				$value = strtolower( trim( $value ) );
			}
			if ( in_array( $value, array( true, 1, '1', 'yes', 'true' ), true ) ) {
				$parts[] = $key . '=yes';
			} elseif ( in_array( $value, array( false, 0, '0', 'no', 'false' ), true ) ) {
				$parts[] = $key . '=no';
			}
		}

		return implode( ', ', $parts );
	}

	/**
	 * Delete cached markdown document for a post.
	 *
	 * @param int $post_id Post ID.
	 */
	public static function delete_cache( $post_id ) {
		wp_cache_delete( 'markdown_' . $post_id, self::CACHE_GROUP );
	}
}
