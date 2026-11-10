<?php
/**
 * Content Extractor - Extracts readable text content from URLs for AI consumption.
 *
 * Fetches HTML, strips non-content elements (scripts, styles, navigation),
 * and returns clean text suitable for LLM processing.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use WP_Error;

/**
 * Content extractor class.
 */
class ContentExtractor {


	/**
	 * Maximum characters to return per URL.
	 */
	private const MAX_CHARS = 4000;

	/**
	 * Request timeout in seconds.
	 */
	private const TIMEOUT = 15;

	/**
	 * User agent string.
	 */
	private const USER_AGENT = 'Mozilla/5.0 (compatible; VIP Workflows)';

	/**
	 * Fetch and extract readable text from a URL.
	 *
	 * @param  string $url URL to extract content from.
	 * @return string|WP_Error Extracted text or error.
	 */
	public static function fetch( string $url ) {
		// Validate URL and fetch with SSRF protection (private IP block + redirect disabled).
		$response = SsrfGuard::remote_get_validated(
			$url,
			array(
				'timeout'    => self::TIMEOUT,
				'user-agent' => self::USER_AGENT,
			),
			'content-extractor'
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( $status_code >= 400 ) {
			return new WP_Error(
				'http_error',
				/* translators: %1$d: HTTP status code, %2$s: requested URL. */
				sprintf( __( 'HTTP error %1$d for %2$s', 'vip-workflows' ), $status_code, $url )
			);
		}

		$html = wp_remote_retrieve_body( $response );

		return self::extract_text( $html );
	}

	/**
	 * Extract readable text from HTML.
	 *
	 * Strips non-content elements, then extracts plain text.
	 *
	 * @param  string $html Raw HTML.
	 * @return string Clean text content.
	 */
	public static function extract_text( string $html ): string {
		$html = preg_replace( '/<script[^>]*>.*?<\/script>/is', '', $html );
		$html = preg_replace( '/<style[^>]*>.*?<\/style>/is', '', $html );
		$html = preg_replace( '/<nav[^>]*>.*?<\/nav>/is', '', $html );
		$html = preg_replace( '/<footer[^>]*>.*?<\/footer>/is', '', $html );
		$html = preg_replace( '/<header[^>]*>.*?<\/header>/is', '', $html );
		$html = preg_replace( '/<aside[^>]*>.*?<\/aside>/is', '', $html );

		$text = wp_strip_all_tags( $html );

		$text = preg_replace( '/\s+/', ' ', $text );
		$text = trim( $text );

		if ( mb_strlen( $text ) > self::MAX_CHARS ) {
			$text = mb_substr( $text, 0, self::MAX_CHARS );
		}

		return $text;
	}
}
