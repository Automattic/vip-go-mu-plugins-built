<?php
/**
 * Content Media Processor class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Content;

use Safe_Publish\Media\Media_Importer;
use WP_HTML_Tag_Processor;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Content Media Processor Class.
 *
 * Handles processing of media elements and file references within HTML content,
 * including images, videos, audio, file download links, and embedded documents.
 * Delegates to Media_Importer for actual media importing.
 *
 * Uses WordPress' HTML API (WP_HTML_Tag_Processor) to locate and modify
 * media element attributes. The HTML API conforms to the HTML5 spec, natively
 * handles comments, script/style/textarea content, and malformed attributes,
 * and preserves all unmodified markup byte-for-byte.
 */
class Content_Media_Processor {

	/**
	 * Media Importer instance.
	 *
	 * @var Media_Importer
	 */
	private Media_Importer $media_importer;

	/**
	 * URLs of media files that failed to import.
	 *
	 * @var array
	 */
	private array $failed_media = array();

	/**
	 * URLs found in media element attributes that could not be processed,
	 * typically due to malformed HTML.
	 *
	 * @var array
	 */
	private array $unprocessable_media = array();

	/**
	 * Constructs the Content_Media_Processor instance.
	 *
	 * @param Media_Importer $media_importer Media importer for handling
	 *                                       media files.
	 */
	public function __construct( Media_Importer $media_importer ) {
		$this->media_importer = $media_importer;
	}

	/**
	 * Processes and imports media from source post content.
	 *
	 * Iterates over media elements (img, video, audio, source), file download
	 * links (a), and embedded documents (embed, object) in a single pass,
	 * importing source URLs and replacing them with local equivalents. For
	 * links, only URLs whose path ends in a file extension allowed by WordPress
	 * are processed; page links are left untouched. Comments, script, style,
	 * and textarea content are natively skipped by the HTML API.
	 *
	 * @param string $content         Post content with source media URLs.
	 * @param string $source_site_url Source site URL.
	 * @return string Processed content with imported media.
	 */
	public function process_content(
		string $content,
		string $source_site_url
	): string {
		if ( '' === $content ) {
			return $content;
		}

		$processor = new WP_HTML_Tag_Processor( $content );

		while ( $processor->next_tag() ) {
			switch ( $processor->get_tag() ) {
				case 'IMG':
					$this->import_and_replace_attr(
						$processor,
						'src',
						$source_site_url
					);
					$this->process_srcset_attr( $processor, $source_site_url );
					break;

				case 'VIDEO':
					$this->import_and_replace_attr(
						$processor,
						'src',
						$source_site_url
					);
					$this->import_and_replace_attr(
						$processor,
						'poster',
						$source_site_url
					);
					break;

				case 'AUDIO':
					$this->import_and_replace_attr(
						$processor,
						'src',
						$source_site_url
					);
					break;

				case 'SOURCE':
					$this->import_and_replace_attr(
						$processor,
						'src',
						$source_site_url
					);
					$this->process_srcset_attr( $processor, $source_site_url );
					break;

				case 'A':
					$href = $processor->get_attribute( 'href' );
					if (
						is_string( $href )
						&& $this->has_uploadable_file_extension( $href )
					) {
						$this->import_and_replace_attr(
							$processor,
							'href',
							$source_site_url
						);
					}
					break;

				case 'EMBED':
					$this->import_and_replace_attr(
						$processor,
						'src',
						$source_site_url
					);
					break;

				case 'OBJECT':
					$this->import_and_replace_attr(
						$processor,
						'data',
						$source_site_url
					);
					break;
			}
		}

		$content = $processor->get_updated_html();

		$this->detect_missed_media_urls( $content, $source_site_url );

		return $content;
	}

	/**
	 * Returns the list of media URLs that failed to import.
	 *
	 * @return array Failed media URLs.
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
	 * Returns media URLs that could not be processed due to malformed HTML.
	 *
	 * @return array Unprocessable media URLs.
	 */
	public function get_unprocessable_media(): array {
		return $this->unprocessable_media;
	}

	/**
	 * Resets the unprocessable media list.
	 */
	public function reset_unprocessable_media(): void {
		$this->unprocessable_media = array();
	}

	/**
	 * Imports a source URL from a single attribute and replaces it with the
	 * local equivalent.
	 *
	 * @param WP_HTML_Tag_Processor $processor       HTML processor positioned on the current tag.
	 * @param string                $attr_name       Attribute name (e.g. src, poster).
	 * @param string                $source_site_url Source site URL.
	 */
	private function import_and_replace_attr(
		WP_HTML_Tag_Processor $processor,
		string $attr_name,
		string $source_site_url
	): void {
		$url = $processor->get_attribute( $attr_name );

		if ( ! is_string( $url ) || '' === $url ) {
			return;
		}

		$new_url = $this->media_importer
			->import_source_media( $url, $source_site_url );

		if ( is_string( $new_url ) ) {
			$new_url = Media_Importer::reapply_query_parameters(
				$url,
				$new_url
			);

			$processor->set_attribute( $attr_name, $new_url );
		} elseif ( false === $new_url ) {
			$this->failed_media[] = $url;
		}
	}

	/**
	 * Processes the srcset attribute on the current element. Each descriptor
	 * URL is imported individually. Failed descriptors are dropped from the
	 * value. If no descriptors remain, the srcset attribute is removed entirely.
	 *
	 * @param WP_HTML_Tag_Processor $processor      HTML processor positioned on the current tag.
	 * @param string                $source_site_url Source site URL.
	 */
	private function process_srcset_attr(
		WP_HTML_Tag_Processor $processor,
		string $source_site_url
	): void {
		$srcset = $processor->get_attribute( 'srcset' );

		if ( ! is_string( $srcset ) || '' === $srcset ) {
			return;
		}

		$new_srcset = $this->process_srcset_value( $srcset, $source_site_url );

		if ( '' === $new_srcset ) {
			$processor->remove_attribute( 'srcset' );
		} else {
			$processor->set_attribute( 'srcset', $new_srcset );
		}
	}

	/**
	 * Processes a srcset attribute value, importing each URL.
	 *
	 * Source-domain URLs are sideloaded and replaced. Third-party URLs
	 * (null return from the importer) are kept as-is. Descriptors that fail
	 * to download (false return) are dropped and recorded in $failed_media.
	 *
	 * @param string $srcset_value    Raw srcset attribute value.
	 * @param string $source_site_url Source site URL.
	 * @return string Processed srcset value, or empty string if all descriptors
	 *                failed.
	 */
	private function process_srcset_value(
		string $srcset_value,
		string $source_site_url
	): string {
		$descriptors     = array_map( 'trim', explode( ',', $srcset_value ) );
		$new_descriptors = array();

		foreach ( $descriptors as $descriptor ) {
			$parts = preg_split( '/\s+/', trim( $descriptor ), 2 );
			$url   = $parts[0] ?? '';
			$size  = $parts[1] ?? '';

			if ( '' === $url ) {
				continue;
			}

			$new_url = $this->media_importer->import_source_media(
				$url,
				$source_site_url
			);

			if ( null === $new_url ) {
				$new_descriptors[] = $descriptor;
				continue;
			}

			if ( false === $new_url ) {
				$this->failed_media[] = $url;
				continue;
			}

			$new_url = Media_Importer::reapply_query_parameters(
				$url,
				$new_url
			);

			$new_descriptors[] = '' === $size
				? $new_url
				: $new_url . ' ' . $size;
		}

		return implode( ', ', $new_descriptors );
	}

	/**
	 * Detects source-domain URLs in media and embed element attributes that the
	 * processor could not match, typically due to malformed HTML (e.g. unclosed
	 * quotes).
	 *
	 * Uses a loose regex anchored to media and embed tag names and attribute
	 * names. This catches URLs the HTML API skipped (because the tag was
	 * unparseable) while ignoring URLs in non-media contexts (links, CSS,
	 * text).
	 *
	 * @param string $content         Processed content.
	 * @param string $source_site_url Source site URL.
	 */
	private function detect_missed_media_urls(
		string $content,
		string $source_site_url
	): void {
		$source_host = wp_parse_url( $source_site_url, PHP_URL_HOST );

		if ( ! is_string( $source_host ) ) {
			return;
		}

		// Strip comments and script/style blocks so URLs inside them don't
		// trigger false positives. The HTML API natively skips these during
		// processing, but this detection pass uses a plain regex.
		$check_content = preg_replace(
			'~<!--.*?-->|<(script|style)\b[^>]*>.*?</\1\s*>~si',
			'',
			$content
		) ?? $content;

		// Loose regex: anchored to a media/embed tag, then looks for
		// src/poster/srcset/data within the same tag. Uses [^<>]*? (stops at
		// tag boundaries) so it can match inside malformed tags. Link
		// elements are excluded: applying the file-extension filter in a
		// regex context is impractical and would false-positive on page links.
		$pattern = '~<(?:img|video|audio|source|embed|object)\b'
			. '[^<>]*?\s(?:src|poster|srcset|data)\s*=\s*'
			. '["\']?\s*(https?://'
			. preg_quote( $source_host, '~' )
			. '/[^\s"\'<>]*)~i';

		if ( ! preg_match_all( $pattern, $check_content, $matches ) ) {
			return;
		}

		$remaining = array_unique( $matches[1] );

		foreach ( $remaining as $url ) {
			if ( ! in_array( $url, $this->unprocessable_media, true )
				&& ! in_array( $url, $this->failed_media, true ) ) {
				$this->unprocessable_media[] = $url;
			}
		}
	}

	/**
	 * Checks whether a URL path ends in a file extension that WordPress allows
	 * as an upload.
	 *
	 * Used to distinguish downloadable file URLs from page links in link
	 * elements: WordPress page URLs use extensionless pretty permalinks or
	 * query strings, while media library files always have an extension.
	 *
	 * @param string $url URL to inspect.
	 * @return bool True if the extension maps to an allowed type.
	 */
	private function has_uploadable_file_extension( string $url ): bool {
		$path = wp_parse_url( $url, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return false;
		}

		$file_info = pathinfo( $path );

		if (
			! isset( $file_info['extension'] )
			|| '' === $file_info['extension']
		) {
			return false;
		}

		$filetype = wp_check_filetype( $file_info['basename'] );

		return false !== $filetype['type'];
	}
}
