<?php
/**
 * Shortcode Media Rewriter class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Content;

use Safe_Publish\Media\Media_Importer;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Imports media from classic [audio] and [video] shortcode URL attrs.
 *
 * The media pass walks HTML tags with WP_HTML_Tag_Processor, which never sees
 * shortcodes, so URLs inside [audio]/[video] attrs are never sideloaded and the
 * later host swap repoints them at a destination file that was never imported.
 * This rewriter sideloads and repoints them, mirroring Shortcode_ID_Rewriter.
 *
 * Scope is the URL-bearing attrs WordPress recognizes: src plus
 * wp_get_audio_extensions() for [audio]; src, poster plus
 * wp_get_video_extensions() for [video]. Reading the helpers at runtime
 * keeps the codec set in step with core and with shared filters.
 */
class Shortcode_Media_Rewriter {

	/**
	 * Source URL importer: (string $url, string $source_site_url) returning the
	 * destination URL, false on failure, or null to leave the URL unchanged.
	 *
	 * @var callable
	 */
	private $import_media;

	/**
	 * Media files that failed to import, keyed by source URL.
	 *
	 * @var array<string, string> URL => originating block name (always empty).
	 */
	private array $failed_media = array();

	/**
	 * Constructor.
	 *
	 * @param callable $import_media Source URL importer returning the
	 *                               destination URL, false, or null.
	 */
	public function __construct( callable $import_media ) {
		$this->import_media = $import_media;
	}

	/**
	 * Sideloads media from [audio]/[video] shortcode URL attrs and repoints
	 * each to its destination URL.
	 *
	 * @param string $content         Post content with shortcodes.
	 * @param string $source_site_url Source site URL.
	 * @return string Content with shortcode media URLs rewritten.
	 */
	public function rewrite_shortcode_media(
		string $content,
		string $source_site_url
	): string {
		if ( '' === $content
			|| ( false === stripos( $content, '[audio' )
				&& false === stripos( $content, '[video' ) )
		) {
			return $content;
		}

		$result = preg_replace_callback(
			'#\[(\[?)(audio|video)(?![\w-])([^\]]*)\](\]?)#',
			fn ( array $matches ): string => $this->rewrite_shortcode_match(
				$matches,
				$source_site_url
			),
			$content
		);

		return is_string( $result ) ? $result : $content;
	}

	/**
	 * Returns the media files that failed to import.
	 *
	 * @return array<string, string> URL => originating block name.
	 */
	public function get_failed_media(): array {
		return $this->failed_media;
	}

	/**
	 * Resets the failed media list.
	 */
	public function reset_failed_media(): void {
		$this->failed_media = array();
	}

	/**
	 * Rewrites one [audio]/[video] opening tag.
	 *
	 * @param array<int, string> $matches         Captures: [full, esc-open, tag,
	 *                                             attrs, esc-close].
	 * @param string             $source_site_url Source site URL.
	 * @return string Rewritten shortcode, or the original when unchanged.
	 */
	private function rewrite_shortcode_match(
		array $matches,
		string $source_site_url
	): string {
		// Escaped shortcode ([[audio ...]]) renders literally, not as media.
		if ( '[' === $matches[1] && ']' === $matches[4] ) {
			return $matches[0];
		}

		$allowed = 'audio' === $matches[2]
			? array_merge( array( 'src' ), wp_get_audio_extensions() )
			: array_merge( array( 'src', 'poster' ), wp_get_video_extensions() );

		$new_attrs = $this->rewrite_attrs(
			$matches[3],
			$allowed,
			$source_site_url
		);

		if ( $new_attrs === $matches[3] ) {
			return $matches[0];
		}

		return '[' . $matches[1] . $matches[2] . $new_attrs . ']' . $matches[4];
	}

	/**
	 * Rewrites the value of each allowed URL attribute within a shortcode's
	 * opening-tag attribute string.
	 *
	 * @param string             $attrs           Attribute string of the tag.
	 * @param array<int, string> $allowed         Attribute names to rewrite.
	 * @param string             $source_site_url Source site URL.
	 * @return string Attribute string with importable URLs repointed.
	 */
	private function rewrite_attrs(
		string $attrs,
		array $allowed,
		string $source_site_url
	): string {
		// preg_quote each name: The codec list is filterable, so treat the
		// attribute names as literals rather than trust them in the pattern.
		$names = implode(
			'|',
			array_map(
				static fn ( string $attr ): string => preg_quote( $attr, '#' ),
				$allowed
			)
		);

		$pattern = '#(?<![\w-])((?:' . $names
			. ')\s*=\s*)(?:"([^"]*)"|\'([^\']*)\'|([^\s\]]+))#';

		$result = preg_replace_callback(
			$pattern,
			fn ( array $matches ): string => $this->rewrite_attr_value(
				$matches,
				$source_site_url
			),
			$attrs
		);

		return is_string( $result ) ? $result : $attrs;
	}

	/**
	 * Imports one attribute's URL value and repoints it, quoting preserved.
	 *
	 * @param array<int, string> $matches         Captures: [full, name-and-eq,
	 *                                             dq-value, sq-value, bare-value].
	 * @param string             $source_site_url Source site URL.
	 * @return string Rewritten attribute, or the original when unchanged.
	 */
	private function rewrite_attr_value(
		array $matches,
		string $source_site_url
	): string {
		if ( isset( $matches[2] ) && '' !== $matches[2] ) {
			$value = $matches[2];
			$quote = '"';
		} elseif ( isset( $matches[3] ) && '' !== $matches[3] ) {
			$value = $matches[3];
			$quote = "'";
		} elseif ( isset( $matches[4] ) && '' !== $matches[4] ) {
			$value = $matches[4];
			$quote = '';
		} else {
			return $matches[0];
		}

		$new_url = ( $this->import_media )( $value, $source_site_url );

		if ( is_string( $new_url ) ) {
			$new_url = Media_Importer::reapply_query_parameters(
				$value,
				$new_url
			);
			return $matches[1] . $quote . $new_url . $quote;
		}

		if ( false === $new_url ) {
			$this->failed_media[ $value ] = '';
		}

		// null: Third-party or already-local — leave the URL as-is.
		return $matches[0];
	}
}
