<?php
/**
 * Shortcode ID Rewriter class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Content;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rewrites source attachment IDs referenced inside shortcode attributes.
 *
 * The URL rewrite pipeline handles `<img src>` but not shortcode attrs
 * like `[caption id="attachment_N"]`, so source IDs would otherwise
 * leak through to dest and render against the wrong (or no) attachment.
 *
 * Scope: caption-family (`[caption]`, `[wp_caption]`) — their embedded
 * `<img>` gives an `attachment_url_to_postid()` lookup target. Gallery-
 * family (`[gallery ids=...]`, `[playlist ids=...]`) carry bare source
 * IDs with no embedded URL and need source-ID tracking the importer
 * doesn't have yet; deferred to a follow-up.
 */
class Shortcode_ID_Rewriter {

	/**
	 * URL => attachment ID lookup. Defaults to WordPress' built-in
	 * attachment_url_to_postid(); tests inject a stub.
	 *
	 * @var callable
	 */
	private $url_to_id_lookup;

	/**
	 * Constructor.
	 *
	 * @param callable|null $url_to_id_lookup URL => attachment ID resolver,
	 *                                        or null for the WP default.
	 */
	public function __construct( ?callable $url_to_id_lookup = null ) {
		$this->url_to_id_lookup = $url_to_id_lookup ?? 'attachment_url_to_postid';
	}

	/**
	 * Rewrites every `[caption id="attachment_N"]<img ...>` so N becomes the
	 * dest attachment ID resolved from the embedded img's src. Captions
	 * whose img doesn't resolve (third-party, sideload failure,
	 * intermediate-size URL) are left unchanged.
	 *
	 * Assumes URL rewriting already ran — the img src is the dest URL by
	 * the time this regex sees it.
	 *
	 * @param string $content Post content with caption shortcodes.
	 * @return string Content with caption IDs rewritten.
	 */
	public function rewrite_caption_ids( string $content ): string {
		if ( '' === $content
			|| ( false === stripos( $content, '[caption' )
				&& false === stripos( $content, '[wp_caption' ) )
		) {
			return $content;
		}

		$result = preg_replace_callback(
			'#\[(caption|wp_caption)\b([^\]]*)\](.*?)\[/\1\]#is',
			array( $this, 'rewrite_caption_match' ),
			$content
		);

		return is_string( $result ) ? $result : $content;
	}

	/**
	 * Handler for a single caption-shortcode regex match.
	 *
	 * @param array<int, string> $matches Regex captures: [full, tag, attrs, body].
	 * @return string Rewritten match, or the original if no rewrite applies.
	 */
	private function rewrite_caption_match( array $matches ): string {
		$tag   = $matches[1];
		$attrs = $matches[2];
		$body  = $matches[3];

		if ( 1 !== preg_match(
			'/<img\b[^>]*\bsrc\s*=\s*(["\'])([^"\']+)\1/i',
			$body,
			$img_match
		) ) {
			return $matches[0];
		}

		$attachment_id = (int) call_user_func(
			$this->url_to_id_lookup,
			$img_match[2]
		);
		if ( $attachment_id <= 0 ) {
			return $matches[0];
		}

		$new_attrs = preg_replace(
			'/\b(id\s*=\s*["\']attachment_)\d+(["\'])/i',
			'${1}' . $attachment_id . '${2}',
			$attrs,
			1
		);

		if ( ! is_string( $new_attrs ) || $new_attrs === $attrs ) {
			return $matches[0];
		}

		return '[' . $tag . $new_attrs . ']' . $body . '[/' . $tag . ']';
	}
}
