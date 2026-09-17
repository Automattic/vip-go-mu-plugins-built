<?php

/**
 * Discovery tags for markdown alternate in wp_head.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Adds link rel="alternate" type="text/markdown" for agent discovery.
 *
 * @package Content_For_Agents
 */
class Discovery {

	/**
	 * Constructor.
	 *
	 * @param Loader $loader The loader instance.
	 */
	public function __construct( Loader $loader ) {
		$loader->add_action( 'wp_head', $this, 'add_markdown_alternate_link', 10 );
	}

	/**
	 * Add link rel="alternate" type="text/markdown" in head.
	 *
	 * @hook wp_head
	 */
	public function add_markdown_alternate_link() {
		if ( is_front_page() ) {
			$llms_txt_url = home_url( '/llms.txt' );
			printf(
				'<link rel="llms-txt" href="%s">' . "\n",
				esc_url( $llms_txt_url )
			);
			printf(
				'<link rel="alternate" type="text/plain" href="%s">' . "\n",
				esc_url( $llms_txt_url )
			);
		}

		if ( ! is_singular() ) {
			return;
		}

		global $post;
		if ( ! $post || 'publish' !== $post->post_status ) {
			return;
		}

		if ( ! post_type_supports( $post->post_type, 'content-for-agents' ) ) {
			return;
		}

		$markdown_url = $this->get_markdown_url( $post );
		if ( $markdown_url ) {
			printf(
				'<link rel="alternate" type="text/markdown" href="%s">' . "\n",
				esc_url( $markdown_url )
			);
		}

		$markdown_path_url = $this->get_markdown_path_url( $post );
		if ( $markdown_path_url ) {
			printf(
				'<link rel="alternate" type="text/markdown" href="%s">' . "\n",
				esc_url( $markdown_path_url )
			);
		}
	}

	/**
	 * Get the markdown URL for a post (the .md endpoint).
	 *
	 * @param \WP_Post $post Post object.
	 * @return string|null Full markdown URL or null.
	 */
	protected function get_markdown_url( $post ) {
		$permalink = get_permalink( $post );
		if ( ! $permalink ) {
			return null;
		}

		if ( wp_parse_url( $permalink, PHP_URL_QUERY ) ) {
			return add_query_arg( 'markdown', 'true', $permalink );
		}
		return untrailingslashit( $permalink ) . '.md';
	}

	/**
	 * Get the markdown URL for a post (the /markdown path endpoint).
	 *
	 * @param \WP_Post $post Post object.
	 * @return string|null Full markdown URL or null.
	 */
	protected function get_markdown_path_url( $post ) {
		$permalink = get_permalink( $post );
		if ( ! $permalink ) {
			return null;
		}

		if ( wp_parse_url( $permalink, PHP_URL_QUERY ) ) {
			return add_query_arg( 'markdown', 'true', $permalink );
		}
		return untrailingslashit( $permalink ) . '/markdown';
	}
}
