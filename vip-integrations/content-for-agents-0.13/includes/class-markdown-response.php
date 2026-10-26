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

		$cacheable = Markdown_Access::can_cache( $post );
		$title     = self::get_response_title( $post );
		$converter = new Markdown_Converter();
		$content   = self::build_content( $post, $title, $converter );
		if ( is_wp_error( $content ) ) {
			Markdown_Conversion_Logger::log( $content, $post->ID );
			nocache_headers();
			wp_die( esc_html__( 'Markdown could not be generated.', 'content-for-agents' ), '', array( 'response' => 500 ) );
			return;
		}

		$canonical_url  = get_permalink( $post );
		$token_count    = Markdown_Converter::estimate_tokens( $content );
		$content_signal = self::get_content_signal_header();

		self::send_headers( $title, $canonical_url, $post->post_name, $token_count, $content_signal );
		if ( ! $cacheable ) {
			nocache_headers();
			header( 'Cache-Control: private, no-store, max-age=0' );
		}

		( new Markdown_Stats() )->record_served( $converter->used_block_callback() );

		// This is the complete non-HTML response. Stop the WordPress request after
		// writing it so template rendering and later hooks cannot append output.
		echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		exit;
	}

	/**
	 * Read the filtered title with the requested post in WordPress globals.
	 *
	 * @param \WP_Post $post Post being rendered.
	 * @return string Normalized post title.
	 */
	private static function get_response_title( \WP_Post $post ): string {
		$context = new Post_Context( $post );
		try {
			$title = html_entity_decode( get_the_title( $post ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
			return trim( preg_replace( '/\s+/u', ' ', $title ) ?? $title );
		} finally {
			$context->restore();
		}
	}

	/**
	 * Build the response, including frontmatter and filtered body.
	 *
	 * @param \WP_Post                $post      Post being rendered.
	 * @param string                  $title     Normalized WordPress post title.
	 * @param Markdown_Converter|null $converter Converter used for this response.
	 * @return string|\WP_Error Complete Markdown document or a conversion failure.
	 */
	private static function build_content( \WP_Post $post, string $title, ?Markdown_Converter $converter = null ): string|\WP_Error {
		$context = null;
		try {
			$converter     = $converter ?? new Markdown_Converter();
			$markdown_body = $converter->post_to_markdown( $post );
			if ( is_wp_error( $markdown_body ) ) {
				return $markdown_body;
			}

			// Conversion restores its context; response filters still need this post.
			$context       = new Post_Context( $post );
			$yaml          = ( new Frontmatter() )->build( $post, $markdown_body );
			$markdown_body = apply_filters( 'content_for_agents_after_markdown', $markdown_body, $post );
			if ( is_wp_error( $markdown_body ) ) {
				return $markdown_body;
			}
			if ( ! is_string( $markdown_body ) ) {
				return new \WP_Error( 'content_for_agents_invalid_after_markdown_value', 'Markdown body filter returned a non-string value.' );
			}

			// Build the prefix after conversion so its filter can inspect the final body.
			$prefix = self::get_markdown_prefix( $title, $post, $markdown_body );
			if ( is_wp_error( $prefix ) ) {
				return $prefix;
			}
			return $yaml . $prefix . $markdown_body;
		} catch ( \Throwable $error ) {
			return new \WP_Error( 'content_for_agents_response_exception', 'Markdown document assembly failed.', $error );
		} finally {
			$context?->restore();
		}
	}

	/**
	 * Build the Markdown prefix shown before post content.
	 *
	 * @param string   $title         Normalized WordPress post title.
	 * @param \WP_Post $post          Post being rendered.
	 * @param string   $markdown_body Rendered post content.
	 * @return string|\WP_Error Markdown prefix, including any spacing before the body, or a failure.
	 */
	private static function get_markdown_prefix( string $title, \WP_Post $post, string $markdown_body ): string|\WP_Error {
		$markdown_title = '' !== $title ? trim( ( new HTML_To_Markdown_Converter() )->convert( $title ) ) : '';
		$prefix         = '' !== $markdown_title ? "# $markdown_title\n\n" : '';

		/**
		 * Filters the Markdown placed after frontmatter and before post content.
		 *
		 * Return an empty string to omit the default title heading. Include any
		 * desired spacing before the post content in the returned string.
		 *
		 * @param string   $prefix        Default title heading.
		 * @param \WP_Post $post          Post being rendered.
		 * @param string   $markdown_body Converted post content.
		 */
		$prefix = apply_filters( 'content_for_agents_markdown_prefix', $prefix, $post, $markdown_body );
		return is_wp_error( $prefix ) || is_string( $prefix )
			? $prefix
			: new \WP_Error( 'content_for_agents_invalid_prefix_value', 'Markdown prefix filter returned a non-string value.' );
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
	 */
	public static function send_headers( string $title, string $canonical_url, string $slug, int $token_count, string $content_signal = '' ) {
		$escaped_title = addcslashes( str_replace( array( "\r", "\n" ), ' ', $title ), '"\\' );
		$filename      = sanitize_file_name( '' !== $slug ? $slug : 'document' ) . '.md';

		header( 'Content-Type: text/markdown; charset=utf-8' );
		send_nosniff_header();
		header( 'X-Robots-Tag: noindex' );
		header( 'X-Markdown-Tokens: ' . $token_count );

		if ( '' !== $content_signal ) {
			header( 'Content-Signal: ' . $content_signal );
		}

		header( 'Link: <' . esc_url( $canonical_url ) . '>; rel="canonical"; title="' . $escaped_title . '"' );
		header( 'Content-Disposition: inline; filename="' . $filename . '"' );
	}

	/**
	 * Get the Content-Signal value from site options and code-level overrides.
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

		/**
		 * Filters the site-wide Content-Signal values used by Markdown and robots.txt.
		 *
		 * Return an array keyed by ai-train, search, and ai-input. An empty array
		 * suppresses the signal. Values are normalized below.
		 *
		 * @param mixed $options Stored values, or the defaults when none are saved.
		 */
		$options = apply_filters( 'content_for_agents_content_signal_values', $options );

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
}
