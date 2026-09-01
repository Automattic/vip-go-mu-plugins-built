<?php
/**
 * URL Meta Extractor - Extracts metadata (title, description, image) from URLs.
 *
 * Generic utility for fetching Open Graph and HTML meta tags from any URL.
 * Can be used by research, pitches, or any feature that needs URL metadata.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use WP_Error;

/**
 * URL metadata extractor class.
 */
class UrlMetaExtractor {


	/**
	 * Default timeout for HTTP requests.
	 */
	public const DEFAULT_TIMEOUT = 10;

	/**
	 * User agent string for requests.
	 */
	public const USER_AGENT = 'Mozilla/5.0 (compatible; VIP Workflows)';

	/**
	 * Fetch metadata from a URL.
	 *
	 * @param string $url     URL to fetch metadata from.
	 * @param int    $timeout Request timeout in seconds.
	 * @return array|WP_Error Metadata array or error.
	 */
	public static function fetch( string $url, int $timeout = self::DEFAULT_TIMEOUT ) {
		// Validate URL and fetch with SSRF protection (private IP block + redirect disabled).
		$response = SsrfGuard::remote_get_validated(
			$url,
			array(
				'timeout'    => $timeout,
				'user-agent' => self::USER_AGENT,
			),
			'url-meta-extractor'
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( $status_code >= 400 ) {
			return new WP_Error(
				'http_error',
				/* translators: %d: HTTP status code. */
				sprintf( __( 'HTTP error %d', 'vip-workflows' ), $status_code )
			);
		}

		$body = wp_remote_retrieve_body( $response );

		return self::parse_html( $body, $url );
	}

	/**
	 * Parse HTML to extract metadata.
	 *
	 * @param string $html    HTML content.
	 * @param string $base_url Base URL for resolving relative paths.
	 * @return array Extracted metadata.
	 */
	public static function parse_html( string $html, string $base_url = '' ): array {
		$meta = array(
			'title'       => '',
			'description' => '',
			'image'       => '',
			'site_name'   => '',
			'type'        => '',
			'author'      => '',
			'published'   => '',
		);

		// Extract <title> tag.
		if ( preg_match( '/<title[^>]*>([^<]+)<\/title>/i', $html, $matches ) ) {
			$meta['title'] = self::decode_html( trim( $matches[1] ) );
		}

		// Open Graph tags (og:*).
		$og_tags = array(
			'og:title'       => 'title',
			'og:description' => 'description',
			'og:image'       => 'image',
			'og:site_name'   => 'site_name',
			'og:type'        => 'type',
		);

		foreach ( $og_tags as $property => $key ) {
			$value = self::extract_meta_property( $html, $property );
			if ( $value ) {
				// For title, only use og:title if HTML title is missing or generic.
				if ( 'title' === $key && ! empty( $meta['title'] ) && 10 <= strlen( $meta['title'] ) ) {
					continue;
				}
				$meta[ $key ] = $value;
			}
		}

		// Standard meta tags.
		$standard_tags = array(
			'description' => 'description',
			'author'      => 'author',
		);

		foreach ( $standard_tags as $name => $key ) {
			if ( empty( $meta[ $key ] ) ) {
				$value = self::extract_meta_name( $html, $name );
				if ( $value ) {
					$meta[ $key ] = $value;
				}
			}
		}

		// Article meta.
		$article_tags = array(
			'article:published_time' => 'published',
			'article:author'         => 'author',
		);

		foreach ( $article_tags as $property => $key ) {
			if ( empty( $meta[ $key ] ) ) {
				$value = self::extract_meta_property( $html, $property );
				if ( $value ) {
					$meta[ $key ] = $value;
				}
			}
		}

		// Twitter cards (fallback).
		if ( empty( $meta['image'] ) ) {
			$twitter_image = self::extract_meta_name( $html, 'twitter:image' );
			if ( $twitter_image ) {
				$meta['image'] = $twitter_image;
			}
		}

		// Resolve relative image URLs.
		if ( ! empty( $meta['image'] ) && ! empty( $base_url ) ) {
			$meta['image'] = self::resolve_url( $meta['image'], $base_url );
		}

		// Clean up empty values.
		return array_filter(
			$meta,
			function ( $v ) {
				return '' !== $v;
			}
		);
	}

	/**
	 * Extract meta tag content by property attribute.
	 *
	 * @param string $html     HTML content.
	 * @param string $property Property value to match.
	 * @return string|null Extracted content or null.
	 */
	private static function extract_meta_property( string $html, string $property ): ?string {
		// Match both property="..." content="..." and content="..." property="..." orders.
		$patterns = array(
			'/<meta[^>]+property=["\']' . preg_quote( $property, '/' ) . '["\'][^>]+content=["\']([^"\']+)["\']/i',
			'/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']' . preg_quote( $property, '/' ) . '["\']/i',
		);

		foreach ( $patterns as $pattern ) {
			if ( preg_match( $pattern, $html, $matches ) ) {
				return self::decode_html( trim( $matches[1] ) );
			}
		}

		return null;
	}

	/**
	 * Extract meta tag content by name attribute.
	 *
	 * @param string $html HTML content.
	 * @param string $name Name value to match.
	 * @return string|null Extracted content or null.
	 */
	private static function extract_meta_name( string $html, string $name ): ?string {
		// Match both name="..." content="..." and content="..." name="..." orders.
		$patterns = array(
			'/<meta[^>]+name=["\']' . preg_quote( $name, '/' ) . '["\'][^>]+content=["\']([^"\']+)["\']/i',
			'/<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']' . preg_quote( $name, '/' ) . '["\']/i',
		);

		foreach ( $patterns as $pattern ) {
			if ( preg_match( $pattern, $html, $matches ) ) {
				return self::decode_html( trim( $matches[1] ) );
			}
		}

		return null;
	}

	/**
	 * Decode HTML entities.
	 *
	 * @param string $text Text to decode.
	 * @return string Decoded text.
	 */
	private static function decode_html( string $text ): string {
		return html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	/**
	 * Resolve a potentially relative URL against a base URL.
	 *
	 * @param string $url      URL to resolve.
	 * @param string $base_url Base URL.
	 * @return string Resolved absolute URL.
	 */
	private static function resolve_url( string $url, string $base_url ): string {
		// Already absolute.
		if ( preg_match( '#^https?://#i', $url ) ) {
			return $url;
		}

		// Protocol-relative.
		if ( str_starts_with( $url, '//' ) ) {
			$parsed = wp_parse_url( $base_url );
			return ( $parsed['scheme'] ?? 'https' ) . ':' . $url;
		}

		// Root-relative.
		if ( str_starts_with( $url, '/' ) ) {
			$parsed = wp_parse_url( $base_url );
			$origin = ( $parsed['scheme'] ?? 'https' ) . '://' . ( $parsed['host'] ?? '' );
			if ( ! empty( $parsed['port'] ) ) {
				$origin .= ':' . $parsed['port'];
			}
			return $origin . $url;
		}

		// Relative - append to base path.
		return rtrim( $base_url, '/' ) . '/' . $url;
	}
}
