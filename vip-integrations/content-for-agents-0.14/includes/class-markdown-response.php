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
			nocache_headers();
			wp_die( esc_html__( 'Markdown could not be generated.', 'content-for-agents' ), '', array( 'response' => 500 ) );
			return;
		}

		try {
			self::send_headers( $title, get_permalink( $post ), $post->post_name, Markdown_Converter::estimate_tokens( $content ), self::get_content_signal_header( $post->ID ) );
		} catch ( \Throwable $error ) {
			Markdown_Conversion_Logger::log( new \WP_Error( 'content_for_agents_header_exception', 'Markdown header preparation failed.', $error ), $post->ID );
			header( 'Content-Type: text/markdown; charset=utf-8' );
			header( 'X-Content-Type-Options: nosniff' );
			header( 'X-Robots-Tag: noindex' );
			header( 'Content-Disposition: inline; filename="document.md"' );
		}
		if ( ! $cacheable ) {
			try {
				nocache_headers();
			} catch ( \Throwable $error ) {
				Markdown_Conversion_Logger::log( new \WP_Error( 'content_for_agents_nocache_exception', 'No-cache header filtering failed; using default headers.', $error ), $post->ID );
				header_remove( 'Last-Modified' );
				header( 'Expires: Wed, 11 Jan 1984 05:00:00 GMT' );
			}
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
		$context = null;
		try {
			$context = new Post_Context( $post );
			$title   = html_entity_decode( get_the_title( $post ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
			return trim( preg_replace( '/\s+/u', ' ', $title ) ?? $title );
		} catch ( \Throwable $error ) {
			Markdown_Conversion_Logger::log( new \WP_Error( 'content_for_agents_title_exception', 'Title filtering failed.', $error ), $post->ID );
			return html_entity_decode( wp_strip_all_tags( $post->post_title ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		} finally {
			$context?->restore();
		}
	}

	/**
	 * Build the response, including frontmatter and filtered body.
	 *
	 * @param \WP_Post                $post      Post being rendered.
	 * @param string                  $title     Normalized WordPress post title.
	 * @param Markdown_Converter|null $converter Converter used for this response.
	 * @return string|\WP_Error Complete document or a post-level conversion failure.
	 */
	private static function build_content( \WP_Post $post, string $title, ?Markdown_Converter $converter = null ): string|\WP_Error {
		$converter     = $converter ?? new Markdown_Converter();
		$markdown_body = $converter->post_to_markdown( $post );
		if ( is_wp_error( $markdown_body ) ) {
			return $markdown_body;
		}
		$context = null;
		$yaml    = "---\n---\n\n";
		try {
			$context = new Post_Context( $post );
			try {
				$yaml = Post_Context::preserve( static fn() => ( new Frontmatter() )->build( $post, $markdown_body ) );
			} catch ( \Throwable $error ) {
				Markdown_Conversion_Logger::log( new \WP_Error( 'content_for_agents_frontmatter_exception', 'Frontmatter generation failed.', $error ), $post->ID );
			}
			try {
				$filtered = Post_Context::preserve( static fn() => apply_filters( 'content_for_agents_after_markdown', $markdown_body, $post ) );
			} catch ( \Throwable $error ) {
				$filtered = new \WP_Error( 'content_for_agents_after_markdown_exception', 'Body filter failed.', $error );
			}
			if ( is_string( $filtered ) ) {
				$markdown_body = $filtered;
			} else {
				$error = is_wp_error( $filtered ) ? $filtered : new \WP_Error( 'content_for_agents_invalid_after_markdown_value', 'Body filter returned a non-string value.' );
				Markdown_Conversion_Logger::log( $error, $post->ID );
			}
			$prefix = self::get_markdown_prefix( $title, $post, $markdown_body );
		} catch ( \Throwable $error ) {
			$failure = new \WP_Error( 'content_for_agents_response_exception', 'Markdown response setup failed.', $error );
			Markdown_Conversion_Logger::log( $failure, $post->ID );
			return $failure;
		} finally {
			$context?->restore();
		}
		return $yaml . $prefix . $markdown_body;
	}

	/**
	 * Build the Markdown prefix shown before post content.
	 *
	 * @param string   $title         Normalized WordPress post title.
	 * @param \WP_Post $post          Post being rendered.
	 * @param string   $markdown_body Rendered post content.
	 * @return string Markdown prefix, including any spacing before the body.
	 */
	private static function get_markdown_prefix( string $title, \WP_Post $post, string $markdown_body ): string {
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
		try {
			$filtered = Post_Context::preserve( static fn() => apply_filters( 'content_for_agents_markdown_prefix', $prefix, $post, $markdown_body ) );
		} catch ( \Throwable $error ) {
			$filtered = new \WP_Error( 'content_for_agents_prefix_exception', 'Prefix filter failed.', $error );
		}
		if ( is_string( $filtered ) ) {
			return $filtered;
		}
		$error = is_wp_error( $filtered ) ? $filtered : new \WP_Error( 'content_for_agents_invalid_prefix_value', 'Prefix filter returned a non-string value.' );
		Markdown_Conversion_Logger::log( $error, $post->ID );
		return $prefix;
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
	 * @param int $post_id Response post ID, or zero outside a post response.
	 * @return string Header value (e.g. ai-train=yes, search=yes, ai-input=yes).
	 */
	public static function get_content_signal_header( int $post_id = 0 ) {
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
		$stored = $options;
		try {
			$options = Post_Context::preserve( static fn() => apply_filters( 'content_for_agents_content_signal_values', $options ) );
			if ( is_wp_error( $options ) ) {
				Markdown_Conversion_Logger::log( $options, $post_id );
				$options = $stored;
			} elseif ( ! is_array( $options ) && is_array( $stored ) ) {
				Markdown_Conversion_Logger::log( new \WP_Error( 'content_for_agents_signal_value', 'Content-Signal filter returned a non-array value.' ), $post_id );
				$options = $stored;
			}
		} catch ( \Throwable $error ) {
			Markdown_Conversion_Logger::log( new \WP_Error( 'content_for_agents_signal_filter_exception', 'Content-Signal filtering failed.', $error ), $post_id );
			$options = $stored;
		}

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
