<?php

defined( 'ABSPATH' ) || exit;

final class Clipisode_Social_Meta {

	private const FORMAT_ORDER = [ 'wide', 'square', 'portrait' ];

	public static function request_user_agent(): string {
		return isset( $_SERVER['HTTP_USER_AGENT'] )
			? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) )
			: '';
	}

	/**
	 * Choose the first Open Graph image for a known link-preview crawler.
	 * Consumers that understand OG arrays can still inspect every variant.
	 */
	public static function preferred_format( string $user_agent ): string {
		if ( preg_match( '/Pinterestbot/i', $user_agent ) ) {
			return 'portrait';
		}
		if ( preg_match( '/facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Discordbot|TelegramBot|WhatsApp|SkypeUriPreview|MicrosoftPreview/i', $user_agent ) ) {
			return 'wide';
		}
		if ( preg_match( '/Slackbot-LinkExpanding|Applebot|iMessage|Messages|com\.apple\.WebKit\.Networking|AppleWebKit/i', $user_agent ) ) {
			return 'square';
		}
		return 'wide';
	}

	/**
	 * Put the crawler's preferred aspect ratio first, then include the other
	 * available images in stable Open Graph order.
	 *
	 * @param array<string, array{id: int, url: string, width: int, height: int, type: string}> $variants
	 * @return array<int, array{id: int, url: string, width: int, height: int, type: string}>
	 */
	public static function ordered_images( array $variants, string $user_agent ): array {
		$order = array_values( array_unique( array_merge(
			[ self::preferred_format( $user_agent ) ],
			self::FORMAT_ORDER
		) ) );
		$images = [];
		foreach ( $order as $format ) {
			if ( isset( $variants[ $format ] ) ) {
				$images[] = $variants[ $format ];
			}
		}
		return $images;
	}

	/**
	 * Invitation metadata varies by crawler, so it must not be reused across
	 * User-Agent values by a page cache or CDN.
	 */
	public static function send_crawler_headers(): void {
		if ( headers_sent() ) {
			return;
		}
		nocache_headers();
		header( 'Vary: User-Agent', false );
	}

	/**
	 * Remove Open Graph and Twitter Card tags emitted by themes or SEO plugins.
	 * Clipisode templates print their own resource-specific tags before wp_head().
	 */
	public static function strip_social_tags( string $markup ): string {
		$filtered = preg_replace(
			'/<meta\b(?=[^>]*(?:name|property)\s*=\s*["\'](?:og:|twitter:))[^>]*>\s*/i',
			'',
			$markup
		);

		return is_string( $filtered ) ? $filtered : $markup;
	}

	/**
	 * Run wp_head() while keeping Clipisode's social metadata authoritative.
	 */
	public static function print_filtered_wp_head(): void {
		ob_start();
		wp_head();
		$markup = (string) ob_get_clean();

		// wp_head() output is trusted WordPress/plugin markup and must remain intact.
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo self::strip_social_tags( $markup );
	}
}
