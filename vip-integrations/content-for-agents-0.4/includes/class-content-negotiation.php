<?php

/**
 * Content negotiation for Accept: text/markdown.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Handles content negotiation via Accept header.
 *
 * When a request includes Accept: text/markdown and the response is a singular post/page,
 * serves markdown instead of HTML.
 *
 * @package Content_For_Agents
 */
class Content_Negotiation {

	/**
	 * Constructor.
	 *
	 * Registers the template_redirect hook only when
	 * CONTENT_FOR_AGENTS_ENABLE_ACCEPT_NEGOTIATION is true.
	 *
	 * @param Loader $loader The loader instance.
	 */
	public function __construct( Loader $loader ) {
		if ( ! CONTENT_FOR_AGENTS_ENABLE_ACCEPT_NEGOTIATION ) {
			return;
		}

		$loader->add_action( 'template_redirect', $this, 'maybe_serve_markdown', 1 );
	}

	/**
	 * Check Accept header and serve markdown if requested.
	 *
	 * Vary: Accept describes negotiation but does not guarantee VIP edge-cache
	 * separation. This feature remains opt-in and disabled by default until
	 * the site's cache configuration has been verified.
	 *
	 * @hook template_redirect
	 */
	public function maybe_serve_markdown() {
		if ( ! is_singular() ) {
			return;
		}

		global $post;
		if ( ! $post ) {
			return;
		}

		if ( ! post_type_supports( $post->post_type, 'content-for-agents' ) ) {
			return;
		}

		if ( 'publish' !== $post->post_status ) {
			return;
		}

		$this->send_vary_accept_header();

		if ( ! $this->wants_markdown() ) {
			return;
		}

		Markdown_Response::serve( $post );
	}

	/**
	 * Emit `Vary: Accept` on the current response.
	 *
	 * Uses `header( ..., false )` so it appends rather than replacing any
	 * existing Vary headers (e.g. `Vary: Cookie` from VIP / WP).
	 */
	protected function send_vary_accept_header(): void {
		if ( headers_sent() ) {
			return;
		}

		header( 'Vary: Accept', false );
	}

	/**
	 * Check if the request prefers markdown via Accept header.
	 *
	 * @return bool True when text/markdown has a higher q-value than text/html.
	 */
	public function wants_markdown() {
		$accept = isset( $_SERVER['HTTP_ACCEPT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ACCEPT'] ) ) : '';
		return self::accept_prefers_markdown( $accept );
	}

	/**
	 * Whether an Accept header prefers markdown over HTML.
	 *
	 * Serves markdown only when an explicit text/markdown token has a strictly
	 * higher q-value than the best text/html or application/xhtml+xml token.
	 * Wildcard ranges (such as the catch-all range or "text" subtype wildcards)
	 * are ignored so agents must request markdown explicitly.
	 *
	 * @param string $accept Raw Accept header value.
	 * @return bool
	 */
	public static function accept_prefers_markdown( string $accept ): bool {
		if ( '' === $accept ) {
			return false;
		}

		$markdown_q = 0.0;
		$html_q     = 0.0;

		foreach ( explode( ',', $accept ) as $range ) {
			$range = trim( $range );
			if ( '' === $range ) {
				continue;
			}

			$parts = array_map( 'trim', explode( ';', $range ) );
			$type  = strtolower( $parts[0] );
			$q     = 1.0;

			for ( $i = 1, $count = count( $parts ); $i < $count; $i++ ) {
				if ( str_starts_with( strtolower( $parts[ $i ] ), 'q=' ) ) {
					$q = (float) substr( $parts[ $i ], 2 );
					$q = max( 0.0, min( 1.0, $q ) );
				}
			}

			if ( 'text/markdown' === $type ) {
				$markdown_q = max( $markdown_q, $q );
			} elseif ( 'text/html' === $type || 'application/xhtml+xml' === $type ) {
				$html_q = max( $html_q, $q );
			}
		}

		return $markdown_q > 0.0 && $markdown_q > $html_q;
	}
}
