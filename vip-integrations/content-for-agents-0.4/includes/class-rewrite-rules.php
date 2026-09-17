<?php

/**
 * Rewrite rules for .md and /markdown URL endpoints.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Handles .md and /markdown URL endpoints (e.g. /politics/2025/01/my-article.md or .../my-article/markdown).
 *
 * @package Content_For_Agents
 */
class Rewrite_Rules {

	/**
	 * Constructor.
	 *
	 * @param Loader $loader The loader instance.
	 */
	public function __construct( Loader $loader ) {
		$loader->add_action( 'parse_request', $this, 'maybe_intercept_md_request', 1 );
		$loader->add_action( 'template_redirect', $this, 'maybe_intercept_markdown_query_param', 1 );
	}

	/**
	 * Maybe intercept request for .md or /markdown URL.
	 *
	 * Intercepts requests where the URL path ends with .md or /markdown, finds the parent post,
	 * and serves markdown.
	 *
	 * @param \WP $wp Current WordPress environment instance.
	 */
	// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- The parse_request hook supplies the WordPress environment.
	public function maybe_intercept_md_request( $wp ) {
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_url( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';
		$path        = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! $path ) {
			return;
		}

		// Strip .md or /markdown suffix to get the post path.
		if ( str_ends_with( $path, '.md' ) ) {
			$parent_path = preg_replace( '#\.md/?$#', '', $path );
		} elseif ( preg_match( '#/markdown/?$#', $path ) ) {
			$parent_path = preg_replace( '#/markdown/?$#', '', $path );
		} else {
			return;
		}

		$parent_path = trim( $parent_path, '/' );

		if ( '' === $parent_path ) {
			return;
		}

		// Request paths include the site's subdirectory; home_url() adds it back.
		$home_path = trim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
		if ( '' !== $home_path && str_starts_with( $parent_path, $home_path . '/' ) ) {
			$parent_path = substr( $parent_path, strlen( $home_path ) + 1 );
		}

		$post_id = $this->url_to_post_id( home_url( '/' . $parent_path . '/' ) );

		if ( ! $post_id ) {
			// Try without trailing slash.
			$post_id = $this->url_to_post_id( home_url( '/' . $parent_path ) );
		}

		if ( ! $post_id ) {
			return;
		}

		$post = get_post( $post_id );
		if ( ! $post || ! $this->can_serve_markdown_for_post( $post ) ) {
			return;
		}

		Markdown_Response::serve( $post );
	}

	/**
	 * Resolve a URL to a post ID using VIP's cached lookup.
	 *
	 * @param string $url Permalink to resolve.
	 * @return int Post ID, or 0 when no post matches.
	 */
	private function url_to_post_id( string $url ): int {
		if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			return (int) wpcom_vip_url_to_postid( $url );
		}

		// Core fallback supports local and non-VIP development environments.
		return (int) url_to_postid( $url ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
	}

	/**
	 * Serve markdown when the request includes ?markdown=true (or 1 / yes / on).
	 *
	 * Runs on template_redirect so conditional tags and preview/draft context are available.
	 *
	 * @return void
	 */
	public function maybe_intercept_markdown_query_param(): void {
		if ( ! $this->request_wants_markdown_query_param() ) {
			return;
		}

		if ( ! is_singular() ) {
			return;
		}

		global $post;
		if ( ! $post instanceof \WP_Post ) {
			return;
		}

		if ( ! $this->can_serve_markdown_for_post( $post ) ) {
			return;
		}

		Markdown_Response::serve( $post );
	}

	/**
	 * Whether the request asks for markdown via query string.
	 *
	 * @return bool
	 */
	private function request_wants_markdown_query_param(): bool {
		if ( ! isset( $_GET['markdown'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return false;
		}

		$val = strtolower( sanitize_text_field( wp_unslash( $_GET['markdown'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		return in_array( $val, array( '1', 'true', 'yes', 'on' ), true );
	}

	/**
	 * Whether markdown may be served for this post (published, readable, or valid preview).
	 *
	 * @param \WP_Post $post Post object.
	 * @return bool
	 */
	private function can_serve_markdown_for_post( \WP_Post $post ): bool {
		if ( ! post_type_supports( $post->post_type, 'content-for-agents' ) ) {
			return false;
		}

		if ( 'publish' === $post->post_status ) {
			return true;
		}

		if ( current_user_can( 'read_post', $post->ID ) ) {
			return true;
		}

		if ( ! empty( $_GET['preview'] ) && isset( $_GET['preview_nonce'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$nonce = sanitize_text_field( wp_unslash( $_GET['preview_nonce'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

			return (bool) wp_verify_nonce( $nonce, 'post_preview_' . $post->ID );
		}

		return false;
	}
}
