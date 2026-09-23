<?php

/**
 * Markdown path endpoint.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Serves Markdown through `/markdown` paths and the query endpoint.
 *
 * @package Content_For_Agents
 */
class Markdown_Endpoint {

	/**
	 * Constructor.
	 *
	 * @param Loader $loader The loader instance.
	 */
	public function __construct( Loader $loader ) {
		$loader->add_action( 'parse_request', $this, 'maybe_serve', 1 );
		$loader->add_action( 'template_redirect', $this, 'maybe_serve_query', 1 );
	}

	/**
	 * Serve a supported post when the request path ends in `/markdown`.
	 *
	 * @param \WP $wp Current WordPress environment instance.
	 */
	public function maybe_serve( $wp ): void {
		if ( '' === (string) get_option( 'permalink_structure', '' ) ) {
			return;
		}

		$post_path = self::get_post_path( (string) $wp->request );
		if ( null === $post_path ) {
			return;
		}

		$post_id = $this->url_to_post_id( home_url( '/' . $post_path . '/' ) );
		if ( ! $post_id ) {
			$post_id = $this->url_to_post_id( home_url( '/' . $post_path ) );
		}

		$post = $post_id ? get_post( $post_id ) : null;
		if ( ! $post instanceof \WP_Post || ! $this->can_serve( $post ) ) {
			return;
		}

		Markdown_Response::serve( $post );
	}

	/**
	 * Serve a supported post requested with `?markdown=true`.
	 *
	 * WordPress resolves the singular post and preview state before this hook.
	 */
	public function maybe_serve_query(): void {
		$post = $this->get_query_post();
		if ( ! $post ) {
			return;
		}

		Markdown_Response::serve( $post );
	}

	/**
	 * Extract a post path from WordPress's normalized request path.
	 *
	 * @internal
	 *
	 * @param string $path Request path.
	 * @return string|null Post path, or null when this is not a Markdown endpoint.
	 */
	public static function get_post_path( string $path ): ?string {
		$path   = trim( $path, '/' );
		$suffix = '/markdown';

		if ( ! str_ends_with( $path, $suffix ) ) {
			return null;
		}

		return substr( $path, 0, -strlen( $suffix ) );
	}

	/**
	 * Build the preferred public Markdown URL for a post.
	 *
	 * Pretty permalinks use the `/markdown` path. Plain permalinks fall back to
	 * the query endpoint.
	 *
	 * @param int|\WP_Post $post Post ID or object.
	 * @return string Endpoint URL, or an empty string when unsupported.
	 */
	public static function get_url( $post ): string {
		$path_url = self::get_path_url( $post );

		return '' !== $path_url ? $path_url : self::get_query_url( $post );
	}

	/**
	 * Build the Markdown path endpoint URL for a post.
	 *
	 * Plain `?p=123` permalinks are unsupported because they cannot represent
	 * the endpoint path.
	 *
	 * @param int|\WP_Post $post Post ID or object.
	 * @return string Path endpoint URL, or an empty string when unsupported.
	 */
	public static function get_path_url( $post ): string {
		if ( '' === (string) get_option( 'permalink_structure', '' ) ) {
			return '';
		}

		$post = get_post( $post );
		if ( ! $post instanceof \WP_Post
			|| ( 'page' === get_option( 'show_on_front' ) && (int) get_option( 'page_on_front' ) === $post->ID )
		) {
			return '';
		}

		$permalink = get_permalink( $post );
		if ( ! is_string( $permalink ) || '' === $permalink
			|| wp_parse_url( $permalink, PHP_URL_QUERY ) ) {
			return '';
		}

		return untrailingslashit( $permalink ) . '/markdown';
	}

	/**
	 * Build the Markdown query URL for a post.
	 *
	 * @param int|\WP_Post $post Post ID or object.
	 * @return string Query endpoint URL, or an empty string when unsupported.
	 */
	public static function get_query_url( $post ): string {
		$post = get_post( $post );
		if ( ! $post instanceof \WP_Post
			|| ! post_type_supports( $post->post_type, 'content-for-agents' )
			|| self::is_static_front_page( $post )
		) {
			return '';
		}

		$permalink = get_permalink( $post );

		return is_string( $permalink ) && '' !== $permalink
			? add_query_arg( 'markdown', 'true', $permalink )
			: '';
	}

	/**
	 * Resolve a URL to a post ID using VIP's cached lookup.
	 *
	 * @param string $url Permalink to resolve.
	 * @return int Post ID, or zero when no post matches.
	 */
	private function url_to_post_id( string $url ): int {
		if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			return (int) wpcom_vip_url_to_postid( $url );
		}

		// Core fallback supports local and non-VIP development environments.
		return (int) url_to_postid( $url ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
	}

	/**
	 * Determine whether Markdown may be served for a post.
	 *
	 * @param \WP_Post $post Post object.
	 * @return bool Whether the post may be served.
	 */
	protected function can_serve( \WP_Post $post ): bool {
		if ( ! post_type_supports( $post->post_type, 'content-for-agents' )
			|| self::is_static_front_page( $post )
		) {
			return false;
		}

		return 'publish' === $post->post_status || current_user_can( 'read_post', $post->ID );
	}

	/**
	 * Determine whether the current query may serve Markdown.
	 *
	 * @param \WP_Post $post Resolved post object.
	 * @return bool Whether Markdown may be served.
	 */
	protected function can_serve_query( \WP_Post $post ): bool {
		$status = get_post_status_object( $post->post_status );
		if ( ! $status || $status->internal ) {
			return false;
		}

		return $this->can_serve( $post );
	}

	/**
	 * Get the post selected by a Markdown query request.
	 *
	 * @return \WP_Post|null Resolved post, or null when the request is ineligible.
	 */
	protected function get_query_post(): ?\WP_Post {
		if ( ! $this->request_wants_markdown_query() || ! is_singular() ) {
			return null;
		}

		global $post;
		if ( ! $post instanceof \WP_Post || ! $this->can_serve_query( $post ) ) {
			return null;
		}

		return $post;
	}

	/**
	 * Check whether the request asks for the Markdown query endpoint.
	 *
	 * @return bool Whether the query parameter is enabled.
	 */
	protected function request_wants_markdown_query(): bool {
		if ( ! isset( $_GET['markdown'] ) || ! is_scalar( $_GET['markdown'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return false;
		}

		$value = strtolower( sanitize_text_field( wp_unslash( $_GET['markdown'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		return in_array( $value, array( '1', 'true', 'yes', 'on' ), true );
	}

	/**
	 * Check whether a post is assigned as the site's static front page.
	 *
	 * @param \WP_Post $post Post object.
	 * @return bool Whether the post is the static front page.
	 */
	private static function is_static_front_page( \WP_Post $post ): bool {
		return 'page' === get_option( 'show_on_front' )
			&& (int) get_option( 'page_on_front' ) === $post->ID;
	}
}
