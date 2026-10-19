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
		$loader->add_filter( 'wp_headers', $this, 'add_accept_vary', PHP_INT_MAX );
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
		// A real post at this URL takes precedence over the parent's Markdown path.
		if ( self::get_canonical_post_at_path( (string) $wp->request ) ) {
			return;
		}

		$post = $this->get_post_from_path( $post_path );
		if ( ! $post instanceof \WP_Post || ! $this->can_serve_path( $post ) ) {
			return;
		}

		Markdown_Response::serve( $post );
	}

	/**
	 * Resolve a Markdown path with VIP lookup, then verify a nested page path.
	 *
	 * Some hierarchical page URLs can be served by WordPress while URL-to-post
	 * lookup misses them. The page fallback only accepts an exact canonical URL.
	 *
	 * @param string $post_path Post path without the Markdown suffix.
	 * @return \WP_Post|null Resolved post.
	 */
	protected function get_post_from_path( string $post_path ): ?\WP_Post {
		$post_id = self::url_to_post_id( home_url( '/' . $post_path . '/' ) );
		if ( ! $post_id ) {
			$post_id = self::url_to_post_id( home_url( '/' . $post_path ) );
		}
		$post = $post_id ? get_post( $post_id ) : null;
		if ( $post instanceof \WP_Post ) {
			return $post;
		}
		if ( ! str_contains( $post_path, '/' ) ) {
			return null;
		}
		$page = get_page_by_path( $post_path, OBJECT, 'page' );
		if ( ! $page instanceof \WP_Post ) {
			return null;
		}
		return self::permalink_matches( $page, home_url( '/' . $post_path . '/' ) ) ? $page : null;
	}

	/**
	 * Find a post whose permalink exactly matches a requested path.
	 *
	 * @param string $path Site-relative path.
	 * @return \WP_Post|null Canonical post at the path, if one exists.
	 */
	private static function get_canonical_post_at_path( string $path ): ?\WP_Post {
		$url     = home_url( '/' . trim( $path, '/' ) . '/' );
		$post_id = self::url_to_post_id( $url );
		$post    = $post_id ? get_post( $post_id ) : null;
		if ( $post instanceof \WP_Post && self::permalink_matches( $post, $url ) ) {
			return $post;
		}

		// URL lookup can miss nested pages when another plugin owns their rewrite.
		$page = get_page_by_path( $path, OBJECT, 'page' );
		return $page instanceof \WP_Post && self::permalink_matches( $page, $url ) ? $page : null;
	}

	/**
	 * @param \WP_Post $post Post to check.
	 * @param string   $url  Requested URL.
	 */
	private static function permalink_matches( \WP_Post $post, string $url ): bool {
		$permalink = get_permalink( $post );
		return is_string( $permalink ) && untrailingslashit( $permalink ) === untrailingslashit( $url );
	}

	/**
	 * Serve a supported post requested with `?markdown=true` or an Accept header.
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
		$url = self::get_path_url_for_purge( $post );
		if ( '' === $url ) {
			return '';
		}

		$path = wp_parse_url( $url, PHP_URL_PATH );
		$home = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		// The collision lookup expects a site-relative path, including on subdirectory installs.
		if ( is_string( $path ) && is_string( $home ) && str_starts_with( $path, $home )
			&& self::get_canonical_post_at_path( ltrim( substr( $path, strlen( $home ) ), '/' ) ) ) {
			return '';
		}

		return $url;
	}

	/**
	 * Get a possible Markdown path even when another post now owns that URL.
	 *
	 * @internal Used to purge paths that may have served Markdown before a collision.
	 *
	 * @param int|\WP_Post $post Post ID or object.
	 * @return string Possible path URL, or an empty string when unsupported.
	 */
	public static function get_path_url_for_purge( $post ): string {
		if ( '' === (string) get_option( 'permalink_structure', '' ) ) {
			return '';
		}

		$post = get_post( $post );
		if ( ! $post instanceof \WP_Post
			|| ! post_type_supports( $post->post_type, 'content-for-agents' )
			|| ! is_post_type_viewable( $post->post_type )
			|| self::is_static_front_page( $post )
		) {
			return '';
		}

		$permalink = get_permalink( $post );
		if ( ! is_string( $permalink ) || '' === $permalink
			|| untrailingslashit( $permalink ) === untrailingslashit( home_url( '/' ) )
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
			|| ! is_post_type_viewable( $post->post_type )
		) {
			return '';
		}

		$permalink = get_permalink( $post );
		if ( ! self::is_static_front_page( $post )
			&& is_string( $permalink )
			&& untrailingslashit( $permalink ) === untrailingslashit( home_url( '/' ) )
		) {
			return '';
		}

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
	private static function url_to_post_id( string $url ): int {
		if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			return (int) wpcom_vip_url_to_postid( $url );
		}

		// Core fallback supports local and non-VIP development environments.
		return (int) url_to_postid( $url ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
	}

	/**
	 * Determine whether a path may serve Markdown for a post.
	 *
	 * The static front page has no dedicated path. Its former slug may still
	 * resolve to the page, so keep path requests from serving it there.
	 *
	 * @param \WP_Post $post Post object.
	 * @return bool Whether the path may serve Markdown.
	 */
	protected function can_serve_path( \WP_Post $post ): bool {
		return ! self::is_static_front_page( $post ) && $this->can_serve( $post );
	}

	/**
	 * Determine whether Markdown may be served for a post.
	 *
	 * @param \WP_Post $post Post object.
	 * @return bool Whether the post may be served.
	 */
	protected function can_serve( \WP_Post $post ): bool {
		if ( ! post_type_supports( $post->post_type, 'content-for-agents' )
			|| ! is_post_type_viewable( $post->post_type ) ) {
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
		$query_requested = $this->request_wants_markdown_query();
		// Feed and embed URLs keep their WordPress format unless the query requests Markdown.
		global $wp_the_query;
		$post = self::get_main_query_post();
		if ( ! $post || ( ! $query_requested && ( $wp_the_query->is_feed() || $wp_the_query->is_embed() || ! $this->request_wants_markdown_accept() ) ) ) {
			return null;
		}

		return $this->can_serve_query( $post ) ? $post : null;
	}

	/**
	 * Get the post WordPress resolved in the original main query.
	 *
	 * @return \WP_Post|null Resolved post, if the request is singular.
	 */
	private static function get_main_query_post(): ?\WP_Post {
		global $wp_the_query;
		if ( ! $wp_the_query instanceof \WP_Query || ! $wp_the_query->is_singular() ) {
			return null;
		}

		$post = $wp_the_query->get_queried_object();
		return $post instanceof \WP_Post ? $post : null;
	}

	/**
	 * Select the supported Markdown representation from the Accept value.
	 *
	 * A case-sensitive substring match, including quoted parameters and quality
	 * weights, keeps the response format consistent within shared cache variants.
	 */
	protected function request_wants_markdown_accept(): bool {
		$method = strtoupper( (string) ( $_SERVER['REQUEST_METHOD'] ?? 'GET' ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Compared with a fixed method allowlist.
		$accept = $_SERVER['HTTP_ACCEPT'] ?? ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Compared with a fixed supported string.
		if ( ! in_array( $method, array( 'GET', 'HEAD' ), true ) || ! is_string( $accept ) ) {
			return false;
		}

		return false !== strpos( $accept, 'text/markdown' );
	}

	/**
	 * Tell caches that the normal URL can serve HTML or Markdown by Accept value.
	 *
	 * @param array $headers WordPress response headers.
	 * @return array Response headers.
	 */
	public function add_accept_vary( array $headers ): array {
		global $wp_the_query;
		$post = self::get_main_query_post();
		if ( ! $post || $wp_the_query->is_feed() || $wp_the_query->is_embed() || $this->request_wants_markdown_query() ) {
			return $headers;
		}

		if ( 'publish' !== $post->post_status || '' !== $post->post_password
			|| ! post_type_supports( $post->post_type, 'content-for-agents' )
			|| ! is_post_type_viewable( $post->post_type ) ) {
			return $headers;
		}

		foreach ( $headers as $name => $value ) {
			if ( 0 !== strcasecmp( (string) $name, 'Vary' ) ) {
				continue;
			}
			$values = array_map( 'trim', explode( ',', (string) $value ) );
			if ( in_array( '*', $values, true ) || in_array( 'accept', array_map( 'strtolower', $values ), true ) ) {
				return $headers;
			}
			$headers[ $name ] = (string) $value . ', Accept';
			return $headers;
		}

		$headers['Vary'] = 'Accept';
		return $headers;
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
