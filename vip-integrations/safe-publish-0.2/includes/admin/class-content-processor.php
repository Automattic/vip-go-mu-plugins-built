<?php
/**
 * Content Processor class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Content\Content_Media_Processor;
use Safe_Publish\Content\Shortcode_ID_Rewriter;
use Safe_Publish\Media\Media_Importer;
use Safe_Publish\Utils\Options;
use Safe_Publish\Validators\URL_Validator;
use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles content transformation, media import, and URL replacement.
 */
class Content_Processor {

	/**
	 * Block-name => list of post-ID attrs, optionally gated on sibling
	 * attrs (e.g. core/navigation-link.id only when kind=post-type).
	 *
	 * @var array<string, list<array{attr:string, gated_by?: array<string,string>}>>
	 */
	private const POST_ID_BLOCK_ATTRS = array(
		'core/navigation'         => array(
			array( 'attr' => 'ref' ),
		),
		'core/navigation-link'    => array(
			array(
				'attr'     => 'id',
				'gated_by' => array( 'kind' => 'post-type' ),
			),
		),
		'core/navigation-submenu' => array(
			array(
				'attr'     => 'id',
				'gated_by' => array( 'kind' => 'post-type' ),
			),
		),
	);

	/**
	 * Block-name => list of term-ID attrs; same shape as POST_ID_BLOCK_ATTRS.
	 *
	 * @var array<string, list<array{attr:string, gated_by?: array<string,string>}>>
	 */
	private const TERM_ID_BLOCK_ATTRS = array(
		'core/navigation-link'    => array(
			array(
				'attr'     => 'id',
				'gated_by' => array( 'kind' => 'taxonomy' ),
			),
		),
		'core/navigation-submenu' => array(
			array(
				'attr'     => 'id',
				'gated_by' => array( 'kind' => 'taxonomy' ),
			),
		),
	);

	/**
	 * Media Importer instance.
	 *
	 * @var Media_Importer
	 */
	private Media_Importer $media_importer;

	/**
	 * Content Media Processor instance.
	 *
	 * @var Content_Media_Processor
	 */
	private Content_Media_Processor $content_media_processor;

	/**
	 * Shortcode ID Rewriter instance.
	 *
	 * @var Shortcode_ID_Rewriter
	 */
	private Shortcode_ID_Rewriter $shortcode_id_rewriter;

	/**
	 * Stores temporarily disabled WordPress filters.
	 *
	 * @var array
	 */
	private array $disabled_filters = array();

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
	 * Warnings raised during the current run (e.g. unmapped block IDs).
	 *
	 * @var array<array<string, mixed>>
	 */
	private array $warnings = array();

	/**
	 * Constructs the Content_Processor instance.
	 *
	 * @param Media_Importer          $media_importer          Media importer instance.
	 * @param Content_Media_Processor $content_media_processor Content media processor instance.
	 * @param Shortcode_ID_Rewriter   $shortcode_id_rewriter   Shortcode ID rewriter instance.
	 */
	public function __construct(
		Media_Importer $media_importer,
		Content_Media_Processor $content_media_processor,
		Shortcode_ID_Rewriter $shortcode_id_rewriter
	) {
		$this->media_importer          = $media_importer;
		$this->content_media_processor = $content_media_processor;
		$this->shortcode_id_rewriter   = $shortcode_id_rewriter;
	}

	/**
	 * Processes post content by importing media and replacing URLs.
	 *
	 * Detects whether content uses Gutenberg blocks and applies the appropriate
	 * processing strategy. Replaces source URLs in the content after processing.
	 *
	 * @param string               $content         Post content to process.
	 * @param string               $source_site_url Source site URL.
	 * @param array<string, mixed> $context         Optional batch state. Recognized
	 *                                              keys: `session_id_map` (array of
	 *                                              source post ID => destination post
	 *                                              ID for the in-flight bulk batch).
	 * @return string|WP_Error Processed content, or WP_Error on failure.
	 */
	public function process_content(
		string $content,
		string $source_site_url,
		array $context = array()
	): string|WP_Error {
		$this->failed_media        = array();
		$this->unprocessable_media = array();
		$this->warnings            = array();
		$this->media_importer->reset_newly_created_attachment_ids();

		$session_id_map = isset( $context['session_id_map'] )
			&& is_array( $context['session_id_map'] )
			? $context['session_id_map']
			: array();

		if ( $this->is_gutenberg_content( $content ) ) {
			$processed_content = $this->process_gutenberg_blocks(
				$content,
				$source_site_url,
				$session_id_map
			);
		} else {
			$processed_content = $this->content_media_processor->process_content( $content, $source_site_url );
		}

		// Rewrite caption-family shortcode IDs after URL rewriting so the
		// embedded img src points at the dest attachment for lookup.
		$processed_content = $this->shortcode_id_rewriter->rewrite_caption_ids( $processed_content );

		// Merge failures from content_media_processor (used in both the
		// Gutenberg and non-Gutenberg paths).
		$this->failed_media = array_unique(
			array_merge(
				$this->failed_media,
				$this->content_media_processor->get_failed_media()
			)
		);

		$this->unprocessable_media = array_unique(
			array_merge(
				$this->unprocessable_media,
				$this->content_media_processor->get_unprocessable_media()
			)
		);

		$this->content_media_processor->reset_failed_media();
		$this->content_media_processor->reset_unprocessable_media();

		return $this->replace_source_urls( $processed_content, $source_site_url );
	}

	/**
	 * Returns warnings collected during the most recent process_content() run.
	 *
	 * @return array<array<string, mixed>> Warnings list.
	 */
	public function get_warnings(): array {
		return $this->warnings;
	}

	/**
	 * Checks if content contains Gutenberg blocks.
	 *
	 * @param string $content Post content.
	 * @return bool True if content contains blocks.
	 */
	public function is_gutenberg_content( string $content ): bool {
		return false !== strpos( $content, '<!-- wp:' );
	}

	/**
	 * Processes Gutenberg blocks and imports media.
	 *
	 * @param string         $content         Post content with blocks.
	 * @param string         $source_site_url Source site URL.
	 * @param array<int,int> $session_id_map  Source post ID => destination post ID
	 *                                        for the in-flight bulk batch.
	 * @return string Processed content.
	 */
	private function process_gutenberg_blocks(
		string $content,
		string $source_site_url,
		array $session_id_map = array()
	): string {
		if ( empty( $content ) ) {
			return $content;
		}

		$blocks = parse_blocks( $content );

		if ( empty( $blocks ) ) {
			return $content;
		}

		$needs_media_processing = $this->content_needs_processing( $content );
		$needs_id_remap         = $this->content_has_id_reference_blocks( $blocks );

		if ( ! $needs_media_processing && ! $needs_id_remap ) {
			return $content;
		}

		if ( $needs_media_processing ) {
			$blocks = array_map(
				function ( $block ) use ( $source_site_url ) {
					return $this->process_single_block( $block, $source_site_url );
				},
				$blocks
			);
		}

		if ( $needs_id_remap ) {
			$blocks = $this->process_block_id_references(
				$blocks,
				$source_site_url,
				$session_id_map
			);
		}

		return serialize_blocks( $blocks );
	}

	/**
	 * Replaces source site URLs with current site URLs in content.
	 *
	 * Uses string replacement instead of DOM parsing to avoid altering
	 * markup (entity encoding, self-closing tags, whitespace, etc.).
	 *
	 * @param string $content         Content to process.
	 * @param string $source_site_url Source site URL (scheme://host).
	 * @return string|WP_Error Content with URLs replaced, or WP_Error on failure.
	 */
	public function replace_source_urls( string $content, string $source_site_url ): string|WP_Error {
		if ( empty( $content ) || empty( $source_site_url ) ) {
			return $content;
		}

		$current_site_url = get_site_url();
		$source_host      = wp_parse_url( $source_site_url, PHP_URL_HOST );
		$current_host     = wp_parse_url( $current_site_url, PHP_URL_HOST );

		// Skip if URLs are the same.
		if ( $source_host === $current_host ) {
			return $content;
		}

		// Skip if the source host doesn't appear in the content.
		if ( false === strpos( $content, $source_host ) ) {
			return $content;
		}

		// Match both http and https variants of the source URL so that legacy
		// http:// references are also replaced. The lookahead prevents partial
		// domain matches (e.g., "source.example.com" must not match inside
		// "source.example.company.com").
		$pattern = '/https?:\/\/' . preg_quote( $source_host, '/' )
			. '(?=[^a-zA-Z0-9.]|$)/';

		$result = preg_replace( $pattern, $current_site_url, $content );

		if ( null === $result ) {
			return new WP_Error(
				'url_replacement_failed',
				__(
					'Failed to replace source site URLs in content.',
					'safe-publish'
				)
			);
		}

		return $result;
	}

	/**
	 * Temporarily disables content formatting filters during import.
	 */
	public function disable_content_filters(): void {
		global $wp_filter;

		// Store filters that might affect content formatting.
		$filters_to_disable = array(
			'the_content',
			'content_save_pre',
			'excerpt_save_pre',
			'wp_insert_post_data',
		);

		foreach ( $filters_to_disable as $filter_name ) {
			if ( isset( $wp_filter[ $filter_name ] ) ) {
				$this->disabled_filters[ $filter_name ] = $wp_filter[ $filter_name ];
				unset( $wp_filter[ $filter_name ] );
			}
		}

		// Specifically remove common formatting filters.
		remove_filter( 'the_content', 'wpautop' );
		remove_filter( 'the_content', 'wptexturize' );
		remove_filter( 'content_save_pre', 'wp_filter_post_kses' );
		remove_filter( 'content_filtered_save_pre', 'wp_filter_post_kses' );
		remove_filter( 'excerpt_save_pre', 'wp_filter_post_kses' );
	}

	/**
	 * Restores content formatting filters after import.
	 */
	public function restore_content_filters(): void {
		global $wp_filter;

		// Restore previously disabled filters.
		foreach ( $this->disabled_filters as $filter_name => $filter_callbacks ) {
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			$wp_filter[ $filter_name ] = $filter_callbacks;
		}

		// Clear stored filters.
		$this->disabled_filters = array();

		// Re-add common formatting filters with default priorities.
		add_filter( 'the_content', 'wpautop' );
		add_filter( 'the_content', 'wptexturize' );
		add_filter( 'content_save_pre', 'wp_filter_post_kses' );
		add_filter( 'content_filtered_save_pre', 'wp_filter_post_kses' );
		add_filter( 'excerpt_save_pre', 'wp_filter_post_kses' );
	}

	/**
	 * Deletes all attachments created during the current processing run.
	 *
	 * Called when an import is aborted to clean up partially-downloaded
	 * attachments that would otherwise be orphaned in the media library.
	 */
	public function delete_newly_created_media(): void {
		$this->media_importer->delete_newly_created_attachments();
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
	 * Returns a formatted error message if any media files failed to import, or
	 * null if there were no failures.
	 *
	 * @return string|null Error message, or null if no failures.
	 */
	public function get_failed_media_error_message(): ?string {
		if ( array() === $this->failed_media ) {
			return null;
		}

		return sprintf(
			/* translators: 1: number of failed media files, 2: comma-separated list of failed media file URLs */
			__( 'Import failed: %1$d media file(s) could not be downloaded: %2$s', 'safe-publish' ),
			count( $this->failed_media ),
			implode( ', ', $this->failed_media )
		);
	}

	/**
	 * Returns media URLs that could not be processed due to malformed HTML in
	 * the source content.
	 *
	 * @return array Unprocessable media URLs.
	 */
	public function get_unprocessable_media(): array {
		return $this->unprocessable_media;
	}

	/**
	 * Returns a formatted error message if any media URLs could not be
	 * processed due to malformed HTML, or null if there were none.
	 *
	 * @return string|null Error message, or null.
	 */
	public function get_unprocessable_media_error_message(): ?string {
		if ( array() === $this->unprocessable_media ) {
			return null;
		}

		return sprintf(
			/* translators: 1: number of unprocessable media URLs, 2: comma-separated list of URLs */
			__( 'Import failed: %1$d media URL(s) could not be processed because the surrounding HTML markup is malformed (e.g. unclosed quotes). Fix the markup on the source site and retry: %2$s', 'safe-publish' ),
			count( $this->unprocessable_media ),
			implode( ', ', $this->unprocessable_media )
		);
	}

	/**
	 * Processes a single Gutenberg block.
	 *
	 * @param array  $block           Block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_single_block( array $block, string $source_site_url ): array {
		if ( empty( $block['blockName'] ) ) {
			return $block;
		}

		switch ( $block['blockName'] ) {
			case 'core/image':
				$block = $this->process_image_block( $block, $source_site_url );
				break;

			case 'core/gallery':
				$block = $this->process_gallery_block( $block, $source_site_url );
				break;

			case 'core/video':
			case 'core/audio':
				$block = $this->process_media_block( $block, $source_site_url );
				break;

			case 'core/embed':
			case 'core-embed/youtube':
			case 'core-embed/vimeo':
			case 'core-embed/twitter':
			case 'core-embed/instagram':
				$block = $this->process_embed_block( $block, $source_site_url );
				break;

			case 'core/html':
				$block = $this->process_html_block( $block, $source_site_url );
				break;

			case 'core/paragraph':
			case 'core/heading':
			case 'core/list':
			case 'core/quote':
				$block = $this->process_text_block( $block, $source_site_url );
				break;

			default:
				// Process URL values in block attrs for custom/third-party
				// blocks, then fall through to process innerHTML for media/links.
				// Skip blocks whose URL attrs are page/term links (handled by
				// process_block_id_references) — sideloading them as media
				// would download HTML and abort the import on a false failure.
				if (
					isset( $block['attrs'] ) && array() !== $block['attrs']
					&& ! isset( self::POST_ID_BLOCK_ATTRS[ $block['blockName'] ] )
					&& ! isset( self::TERM_ID_BLOCK_ATTRS[ $block['blockName'] ] )
				) {
					$block['attrs'] = $this->replace_urls_in_attrs(
						$block['attrs'],
						$source_site_url,
						$block
					);
				}

				// Process innerHTML for any blocks that might contain media or
				// links.
				if ( isset( $block['innerHTML'] ) && '' !== $block['innerHTML'] ) {
					$block['innerHTML'] = $this->content_media_processor->process_content(
						$block['innerHTML'],
						$source_site_url
					);
				}
				break;
		}

		return $block;
	}

	/**
	 * Processes image block to import media and update block attributes.
	 *
	 * @param array  $block           Image block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_image_block( array $block, string $source_site_url ): array {
		$original_url = '';

		// First try to get URL from block attributes.
		if ( ! empty( $block['attrs']['url'] ) ) {
			$original_url = $block['attrs']['url'];
		} elseif ( ! empty( $block['innerHTML'] ) ) {
			// Extract URL from innerHTML img src attribute.
			$original_url = $this->extract_img_src_from_html( $block['innerHTML'] );
		}

		if ( empty( $original_url ) ) {
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$attachment_id = $this->media_importer->import_source_media_as_attachment( $original_url, $source_site_url );

		if ( null === $attachment_id ) {
			// Third-party src — leave attrs unchanged but still process
			// innerHTML so any source-domain anchor hrefs get sideloaded.
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		if ( false === $attachment_id ) {
			$this->failed_media[] = $original_url;
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$new_url = wp_get_attachment_url( $attachment_id );

		if ( false === $new_url ) {
			$this->failed_media[] = $original_url;
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		// Initialize attrs if it doesn't exist.
		if ( ! isset( $block['attrs'] ) ) {
			$block['attrs'] = array();
		}

		// Update block attributes with local URL and attachment ID.
		$block['attrs']['url'] = $new_url;
		$block['attrs']['id']  = $attachment_id;

		// Also update other common image attributes that might reference the URL.
		if ( isset( $block['attrs']['src'] ) ) {
			$block['attrs']['src'] = $new_url;
		}

		$url_with_parameters = Media_Importer::reapply_query_parameters( $original_url, $new_url );

		// Update innerHTML with the appropriate URL for correct rendering.
		if ( ! empty( $block['innerHTML'] ) ) {
			$updated_html       = $this->update_img_src_in_html( $block['innerHTML'], $original_url, $url_with_parameters );
			$updated_html       = $this->update_wp_image_class( $updated_html, $attachment_id );
			$block['innerHTML'] = $updated_html;
		}

		// Update innerContent array if it exists (used by serialize_blocks).
		if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
			foreach ( $block['innerContent'] as $index => $content ) {
				if ( is_string( $content ) ) {
					$updated_content                 = $this->update_img_src_in_html( $content, $original_url, $url_with_parameters );
					$updated_content                 = $this->update_wp_image_class( $updated_content, $attachment_id );
					$block['innerContent'][ $index ] = $updated_content;
				}
			}
		}

		return $this->process_block_inner_html( $block, $source_site_url );
	}

	/**
	 * Processes gallery block to import media from all contained images.
	 *
	 * @param array  $block           Gallery block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_gallery_block( array $block, string $source_site_url ): array {
		// Handle traditional gallery format with images in attributes.
		if ( ! empty( $block['attrs']['images'] ) && is_array( $block['attrs']['images'] ) ) {
			foreach ( $block['attrs']['images'] as $index => $image ) {
				if ( empty( $image['url'] ) ) {
					continue;
				}

				$original_url  = $image['url'];
				$attachment_id = $this->media_importer->import_source_media_as_attachment( $original_url, $source_site_url );

				if ( null === $attachment_id ) {
					continue; // Third-party src — skip this image's attrs.
				}

				if ( false === $attachment_id ) {
					$this->failed_media[] = $original_url;
					continue;
				}

				$new_url = wp_get_attachment_url( $attachment_id );

				if ( false === $new_url ) {
					$this->failed_media[] = $original_url;
					continue;
				}

				// Update block attributes.
				$block['attrs']['images'][ $index ]['url'] = $new_url;
				$block['attrs']['images'][ $index ]['id']  = $attachment_id;

				$url_with_parameters = Media_Importer::reapply_query_parameters( $original_url, $new_url );

				// Update innerHTML with the appropriate URL for correct rendering.
				if ( ! empty( $block['innerHTML'] ) ) {
					$updated_html       = $this->update_img_src_in_html( $block['innerHTML'], $original_url, $url_with_parameters );
					$updated_html       = $this->update_wp_image_class( $updated_html, $attachment_id );
					$block['innerHTML'] = $updated_html;
				}

				// Update innerContent array if it exists (used by serialize_blocks).
				if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
					foreach ( $block['innerContent'] as $content_index => $content ) {
						if ( is_string( $content ) ) {
							$updated_content                         = $this->update_img_src_in_html( $content, $original_url, $url_with_parameters );
							$updated_content                         = $this->update_wp_image_class( $updated_content, $attachment_id );
							$block['innerContent'][ $content_index ] = $updated_content;
						}
					}
				}
			}
		}

		// Handle block-based gallery format with innerBlocks containing image blocks.
		if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
			foreach ( $block['innerBlocks'] as $index => $inner_block ) {
				if ( ! empty( $inner_block['blockName'] ) && 'core/image' === $inner_block['blockName'] ) {
					$block['innerBlocks'][ $index ] = $this->process_image_block( $inner_block, $source_site_url );
				} else {
					$block['innerBlocks'][ $index ] = $this->process_single_block( $inner_block, $source_site_url );
				}
			}

			// Update innerContent array to reflect any changes in innerBlocks.
			if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
				$new_inner_content = array();
				$inner_block_index = 0;

				foreach ( $block['innerContent'] as $content ) {
					if ( is_null( $content ) ) {
						// null values represent positions where inner blocks should be inserted.
						if ( isset( $block['innerBlocks'][ $inner_block_index ] ) ) {
							$new_inner_content[] = null; // Keep the null placeholder.
							++$inner_block_index;
						}
					} else {
						// String content remains as is.
						$new_inner_content[] = $content;
					}
				}

				$block['innerContent'] = $new_inner_content;
			}
		}

		return $this->process_block_inner_html( $block, $source_site_url );
	}

	/**
	 * Processes a media block (video or audio) to import its source.
	 *
	 * @param array  $block           Block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_media_block( array $block, string $source_site_url ): array {
		if ( empty( $block['attrs']['src'] ) ) {
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$original_url  = $block['attrs']['src'];
		$attachment_id = $this->media_importer->import_source_media_as_attachment( $original_url, $source_site_url );

		if ( null === $attachment_id ) {
			// Third-party src — leave attrs unchanged but still process
			// innerHTML so any source-domain anchor hrefs get sideloaded.
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		if ( false === $attachment_id ) {
			$this->failed_media[] = $original_url;
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$new_url = wp_get_attachment_url( $attachment_id );

		if ( false === $new_url ) {
			$this->failed_media[] = $original_url;
			return $this->process_block_inner_html( $block, $source_site_url );
		}

		$block['attrs']['src'] = $new_url;
		$block['attrs']['id']  = $attachment_id;

		$url_with_parameters = Media_Importer::reapply_query_parameters(
			$original_url,
			$new_url
		);

		if ( ! empty( $block['innerHTML'] ) ) {
			$block['innerHTML'] = str_replace(
				$original_url,
				$url_with_parameters,
				$block['innerHTML']
			);
		}

		if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
			foreach ( $block['innerContent'] as $index => $content ) {
				if ( is_string( $content ) ) {
					$block['innerContent'][ $index ] = str_replace(
						$original_url,
						$url_with_parameters,
						$content
					);
				}
			}
		}

		return $this->process_block_inner_html( $block, $source_site_url );
	}

	/**
	 * Processes embed block content.
	 *
	 * @param array  $block           Embed block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_embed_block( array $block, string $source_site_url ): array {
		// Most embed blocks work with URLs that don't need media import,
		// but we can process the innerHTML for any embedded media.
		if ( ! empty( $block['innerHTML'] ) ) {
			$block['innerHTML'] = $this->content_media_processor->process_content( $block['innerHTML'], $source_site_url );
		}

		return $block;
	}

	/**
	 * Processes HTML block to import media.
	 *
	 * @param array  $block           HTML block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_html_block( array $block, string $source_site_url ): array {
		if ( ! empty( $block['attrs']['content'] ) ) {
			$block['attrs']['content'] = $this->content_media_processor->process_content(
				$block['attrs']['content'],
				$source_site_url
			);
		}

		if ( ! empty( $block['innerHTML'] ) ) {
			$block['innerHTML'] = $this->content_media_processor->process_content( $block['innerHTML'], $source_site_url );
		}

		return $block;
	}

	/**
	 * Processes text blocks (paragraph, heading, list, quote) to import media.
	 *
	 * @param array  $block           Text block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Processed block.
	 */
	private function process_text_block( array $block, string $source_site_url ): array {
		if ( ! empty( $block['innerHTML'] ) ) {
			$block['innerHTML'] = $this->content_media_processor->process_content( $block['innerHTML'], $source_site_url );
		}

		return $block;
	}

	/**
	 * Processes block innerHTML and innerContent for remaining media URLs (e.g.
	 * <a href> wrapping a media element) that block-specific handling did not
	 * cover.
	 *
	 * @param array  $block           Block data.
	 * @param string $source_site_url Source site URL.
	 * @return array Block with processed HTML.
	 */
	private function process_block_inner_html( array $block, string $source_site_url ): array {
		if ( ! empty( $block['innerHTML'] ) ) {
			$block['innerHTML'] = $this->content_media_processor->process_content(
				$block['innerHTML'],
				$source_site_url
			);
		}

		if ( ! empty( $block['innerContent'] ) && is_array( $block['innerContent'] ) ) {
			foreach ( $block['innerContent'] as $index => $content ) {
				if ( is_string( $content ) ) {
					$block['innerContent'][ $index ] = $this->content_media_processor->process_content(
						$content,
						$source_site_url
					);
				}
			}
		}

		return $block;
	}

	/**
	 * Extracts image src attribute from HTML content.
	 *
	 * @param string $html HTML content.
	 * @return string Extracted src URL or empty string if not found.
	 */
	private function extract_img_src_from_html( string $html ): string {
		if ( empty( $html ) ) {
			return '';
		}

		// Use DOMDocument for safe HTML parsing.
		$dom = new \DOMDocument();

		// Suppress errors for malformed HTML and use UTF-8 encoding.
		$previous_use_errors = libxml_use_internal_errors( true );
		$dom->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		libxml_use_internal_errors( $previous_use_errors );

		$images = $dom->getElementsByTagName( 'img' );

		if ( $images->length > 0 ) {
			$img = $images->item( 0 ); // Get the first image.
			if ( $img instanceof \DOMElement ) {
				$src = $img->getAttribute( 'src' );

				if ( ! empty( $src ) ) {
					return trim( $src );
				}
			}
		}

		// Fallback to regex if DOMDocument fails.
		if ( preg_match( '/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', $html, $matches ) ) {
			return trim( $matches[1] );
		}

		return '';
	}

	/**
	 * Updates image src attribute in HTML content.
	 *
	 * @param string $html    HTML content.
	 * @param string $old_url Old image URL to replace.
	 * @param string $new_url New image URL.
	 * @return ?string Updated HTML content.
	 */
	private function update_img_src_in_html( string $html, string $old_url, string $new_url ): ?string {
		if ( empty( $html ) || empty( $old_url ) || empty( $new_url ) ) {
			return $html;
		}

		// Use a targeted regex to replace only the src attribute value.
		$pattern     = '/(<img[^>]+src=["\'])' . preg_quote( $old_url, '/' ) . '(["\'][^>]*>)/i';
		$replacement = '${1}' . $new_url . '${2}';

		$updated_html = preg_replace( $pattern, $replacement, $html );

		if ( null !== $updated_html && $updated_html !== $html ) {
			return $updated_html;
		}

		// Fallback to simple string replacement.
		return str_replace( $old_url, $new_url, $html );
	}

	/**
	 * Updates wp-image class with new attachment ID.
	 *
	 * @param string $html              HTML content.
	 * @param int    $new_attachment_id New attachment ID.
	 * @return string Updated HTML content.
	 */
	private function update_wp_image_class( string $html, int $new_attachment_id ): string {
		if ( empty( $html ) || empty( $new_attachment_id ) ) {
			return $html;
		}

		// Pattern to match wp-image-{number} class.
		$pattern     = '/wp-image-\d+/';
		$replacement = 'wp-image-' . $new_attachment_id;

		$updated_html = preg_replace( $pattern, $replacement, $html );

		// If no existing wp-image class found, add it to the img tag.
		if ( $updated_html === $html && strpos( $html, '<img' ) !== false ) {
			// Add wp-image class to img tag that doesn't have one.
			$pattern      = '/(<img[^>]+class=["\'])([^"\']*?)(["\'][^>]*>)/i';
			$replacement  = '${1}${2} wp-image-' . $new_attachment_id . '${3}';
			$updated_html = preg_replace( $pattern, $replacement, $html );

			// If img tag has no class attribute at all, add one.
			if ( $updated_html === $html ) {
				$pattern      = '/(<img[^>]+)(\s*\/?>)/i';
				$replacement  = '${1} class="wp-image-' . $new_attachment_id . '"${2}';
				$updated_html = preg_replace( $pattern, $replacement, $html );
			}
		}

		return $updated_html ? $updated_html : $html;
	}

	/**
	 * Recursively replaces source-domain media URLs in block attrs.
	 *
	 * Walks all string values in $attrs. For each value that is a valid URL
	 * on the source domain, the URL is sideloaded and replaced with the local
	 * attachment URL. Matching occurrences in $block['innerHTML'] and
	 * $block['innerContent'] are also updated so they stay consistent.
	 *
	 * @param array  $attrs           Attributes array to walk (possibly nested).
	 * @param string $source_site_url Source site URL.
	 * @param array  $block           Block data; updated by reference for
	 *                                innerHTML and innerContent.
	 * @return array Updated attributes array.
	 */
	private function replace_urls_in_attrs(
		array $attrs,
		string $source_site_url,
		array &$block
	): array {
		foreach ( $attrs as $key => $value ) {
			if ( is_array( $value ) ) {
				$attrs[ $key ] = $this->replace_urls_in_attrs(
					$value,
					$source_site_url,
					$block
				);
			} elseif (
				is_string( $value ) &&
				filter_var( $value, FILTER_VALIDATE_URL )
			) {
				$attachment_id = $this->media_importer
					->import_source_media_as_attachment( $value, $source_site_url );

				if ( null === $attachment_id ) {
					continue; // Third-party or non-source URL — leave unchanged.
				}

				if ( false === $attachment_id ) {
					$this->failed_media[] = $value;
					continue;
				}

				$new_url = wp_get_attachment_url( $attachment_id );

				if ( false === $new_url ) {
					$this->failed_media[] = $value;
					continue;
				}

				$attrs[ $key ] = $new_url;

				if ( isset( $block['innerHTML'] ) && '' !== $block['innerHTML'] ) {
					$block['innerHTML'] = str_replace(
						$value,
						$new_url,
						$block['innerHTML']
					);
				}

				if (
					isset( $block['innerContent'] ) &&
					is_array( $block['innerContent'] ) &&
					array() !== $block['innerContent']
				) {
					foreach ( $block['innerContent'] as $idx => $content ) {
						if ( is_string( $content ) ) {
							$block['innerContent'][ $idx ] = str_replace(
								$value,
								$new_url,
								$content
							);
						}
					}
				}
			}
		}

		return $attrs;
	}

	/**
	 * Whether the content contains HTTP URLs, the trigger for the media/URL
	 * transformation. Only that pass depends on this check; block-ID remapping
	 * is gated separately by content_has_id_reference_blocks().
	 *
	 * @param string $content Content to check.
	 * @return bool True when the content contains an HTTP URL.
	 */
	private function content_needs_processing( string $content ): bool {
		return false !== strpos( $content, 'http' );
	}

	/**
	 * True when the block tree contains any block name registered for
	 * post- or term-ID remapping.
	 *
	 * @param array<array<string, mixed>> $blocks Parsed block tree.
	 * @return bool
	 */
	private function content_has_id_reference_blocks( array $blocks ): bool {
		foreach ( $blocks as $block ) {
			$name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			if ( '' !== $name && (
				isset( self::POST_ID_BLOCK_ATTRS[ $name ] )
				|| isset( self::TERM_ID_BLOCK_ATTRS[ $name ] )
			) ) {
				return true;
			}

			if (
				isset( $block['innerBlocks'] )
				&& is_array( $block['innerBlocks'] )
				&& array() !== $block['innerBlocks']
				&& $this->content_has_id_reference_blocks( $block['innerBlocks'] )
			) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Rewrites post-/term-ID block attrs from source to destination IDs.
	 *
	 * Two-pass: collect unresolved IDs, bulk-lookup per kind, apply on a
	 * second walk. Unmapped IDs stay in place with a warning. URL attrs are
	 * not regenerated — replace_source_urls swaps the host downstream and
	 * the editor resolves URLs from `id` on next save.
	 *
	 * @param array<array<string, mixed>> $blocks          Parsed block tree.
	 * @param string                      $source_site_url Source site URL.
	 * @param array<int,int>              $session_id_map  Source post ID => destination post ID
	 *                                                     for the in-flight bulk batch.
	 * @return array<array<string, mixed>> Mutated block tree.
	 */
	private function process_block_id_references(
		array $blocks,
		string $source_site_url,
		array $session_id_map
	): array {
		$collected = array(
			'post' => array(),
			'term' => array(),
		);
		$this->collect_id_references( $blocks, $session_id_map, $collected );

		// Path-bearing identity, matching how the source meta is stored.
		$lookup_site_url = URL_Validator::normalize_site_url_with_path(
			$source_site_url
		);

		$post_map = $this->lookup_destination_post_ids(
			$collected['post'],
			$lookup_site_url
		);
		$post_map = $session_id_map + $post_map;

		$term_map = $this->lookup_destination_term_ids(
			$collected['term'],
			$lookup_site_url
		);

		return $this->apply_id_references( $blocks, $post_map, $term_map );
	}

	/**
	 * Walks the block tree and accumulates source post/term IDs that need to
	 * be looked up. IDs already resolvable via the session map skip the
	 * lookup pass.
	 *
	 * @param array<array<string, mixed>>                         $blocks         Block tree.
	 * @param array<int,int>                                      $session_id_map In-batch post-ID map.
	 * @param array{post: array<int,true>, term: array<int,true>} $collected      Accumulator (by reference).
	 */
	private function collect_id_references(
		array $blocks,
		array $session_id_map,
		array &$collected
	): void {
		foreach ( $blocks as $block ) {
			$name  = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] )
				? $block['attrs']
				: array();

			foreach ( self::matching_refs( self::POST_ID_BLOCK_ATTRS, $name, $attrs ) as $id ) {
				if ( ! isset( $session_id_map[ $id ] ) ) {
					$collected['post'][ $id ] = true;
				}
			}

			foreach ( self::matching_refs( self::TERM_ID_BLOCK_ATTRS, $name, $attrs ) as $id ) {
				$collected['term'][ $id ] = true;
			}

			if (
				isset( $block['innerBlocks'] )
				&& is_array( $block['innerBlocks'] )
				&& array() !== $block['innerBlocks']
			) {
				$this->collect_id_references(
					$block['innerBlocks'],
					$session_id_map,
					$collected
				);
			}
		}
	}

	/**
	 * Returns the source IDs a block exposes per the given registry, after
	 * gating attrs (e.g. `kind`) have been checked.
	 *
	 * @param array<string, list<array{attr:string, gated_by?: array<string,string>}>> $registry Block-name => list of attr rules.
	 * @param string                                                                   $name     Block name.
	 * @param array<string, mixed>                                                     $attrs    Block attrs.
	 * @return list<int> Positive source IDs.
	 */
	private static function matching_refs(
		array $registry,
		string $name,
		array $attrs
	): array {
		if ( '' === $name || ! isset( $registry[ $name ] ) ) {
			return array();
		}

		$ids = array();
		foreach ( $registry[ $name ] as $rule ) {
			if ( isset( $rule['gated_by'] ) ) {
				foreach ( $rule['gated_by'] as $gate_attr => $gate_value ) {
					if ( ( $attrs[ $gate_attr ] ?? null ) !== $gate_value ) {
						continue 2;
					}
				}
			}

			$value = $attrs[ $rule['attr'] ] ?? null;
			$id    = is_numeric( $value ) ? (int) $value : 0;
			if ( $id > 0 ) {
				$ids[] = $id;
			}
		}

		return $ids;
	}

	/**
	 * Looks up destination post IDs for a set of source post IDs scoped to the
	 * caller's source site via paired META_SOURCE_POST_ID/META_SOURCE_SITE_URL
	 * postmeta. Returns a source-ID => destination-ID map.
	 *
	 * @param array<int, true> $source_ids      Set of source post IDs (keys).
	 * @param string           $source_site_url Path-bearing source site identity.
	 * @return array<int, int> Source-ID => destination-ID.
	 */
	private function lookup_destination_post_ids(
		array $source_ids,
		string $source_site_url
	): array {
		if ( array() === $source_ids || '' === $source_site_url ) {
			return array();
		}

		$ids   = array_keys( $source_ids );
		$posts = get_posts(
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				'meta_query'             => array(
					'relation' => 'AND',
					array(
						'key'     => Options::META_SOURCE_POST_ID,
						'value'   => $ids,
						'compare' => 'IN',
					),
					array(
						'key'   => Options::META_SOURCE_SITE_URL,
						'value' => $source_site_url,
					),
				),
				// Not 'any': it omits exclude_from_search post types.
				'post_type'              => array_keys( get_post_types() ),
				'post_status'            => 'any',
				'posts_per_page'         => count( $ids ),
				'suppress_filters'       => false,
				'update_post_term_cache' => false,
			)
		);

		$map = array();
		foreach ( $posts as $post ) {
			$source_id = absint(
				get_post_meta( $post->ID, Options::META_SOURCE_POST_ID, true )
			);
			if ( $source_id > 0 && ! isset( $map[ $source_id ] ) ) {
				$map[ $source_id ] = (int) $post->ID;
			}
		}

		return $map;
	}

	/**
	 * Looks up destination term IDs for a set of source term IDs scoped to the
	 * caller's source site URL via paired META_SOURCE_TERM_ID/URL term meta.
	 *
	 * Queries termmeta directly to avoid get_terms()'s taxonomy IN clause —
	 * pointless at our selectivity (paired-meta narrows to a tiny result set)
	 * and degrades on sites with thousands of registered taxonomies.
	 *
	 * @param array<int, true> $source_ids      Set of source term IDs (keys).
	 * @param string           $source_site_url Exact source site URL stored as
	 *                                          paired meta.
	 * @return array<int, int> Source-ID => destination-ID.
	 */
	private function lookup_destination_term_ids(
		array $source_ids,
		string $source_site_url
	): array {
		if ( array() === $source_ids || '' === $source_site_url ) {
			return array();
		}

		global $wpdb;

		$ids          = array_keys( $source_ids );
		$placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

		$prepare_args = array_merge(
			array( Options::META_SOURCE_TERM_ID ),
			array_map( 'intval', $ids ),
			array( Options::META_SOURCE_TERM_URL, $source_site_url )
		);

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT tm_id.term_id AS term_id,
						tm_id.meta_value AS source_id
				 FROM {$wpdb->termmeta} tm_id
				 INNER JOIN {$wpdb->termmeta} tm_url
					 ON tm_url.term_id = tm_id.term_id
				 WHERE tm_id.meta_key = %s
					 AND tm_id.meta_value IN ($placeholders)
					 AND tm_url.meta_key = %s
					 AND tm_url.meta_value = %s",
				...$prepare_args
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber

		if ( ! is_array( $rows ) || array() === $rows ) {
			return array();
		}

		// Prime the term cache so downstream get_term() calls are free.
		$term_ids = array_map(
			static fn( $row ): int => (int) $row->term_id,
			$rows
		);
		_prime_term_caches( $term_ids );

		$map = array();
		foreach ( $rows as $row ) {
			$source_id = absint( $row->source_id );
			if ( $source_id > 0 && ! isset( $map[ $source_id ] ) ) {
				$map[ $source_id ] = (int) $row->term_id;
			}
		}

		return $map;
	}

	/**
	 * Second-pass walk: applies the post/term ID maps to the block tree.
	 * Unmapped references are left untouched and recorded as warnings so the
	 * admin can fix them up after publishing dependencies.
	 *
	 * @param array<array<string, mixed>> $blocks   Block tree.
	 * @param array<int,int>              $post_map Source-ID => destination-ID.
	 * @param array<int,int>              $term_map Source-ID => destination-ID.
	 * @return array<array<string, mixed>> Mutated tree.
	 */
	private function apply_id_references(
		array $blocks,
		array $post_map,
		array $term_map
	): array {
		foreach ( $blocks as $i => $block ) {
			$name  = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] )
				? $block['attrs']
				: array();

			$attrs = $this->rewrite_attrs(
				$attrs,
				$name,
				self::POST_ID_BLOCK_ATTRS,
				$post_map,
				'post'
			);
			$attrs = $this->rewrite_attrs(
				$attrs,
				$name,
				self::TERM_ID_BLOCK_ATTRS,
				$term_map,
				'term'
			);

			if ( array() !== $attrs ) {
				$blocks[ $i ]['attrs'] = $attrs;
			}

			if (
				isset( $block['innerBlocks'] )
				&& is_array( $block['innerBlocks'] )
				&& array() !== $block['innerBlocks']
			) {
				$blocks[ $i ]['innerBlocks'] = $this->apply_id_references(
					$block['innerBlocks'],
					$post_map,
					$term_map
				);
			}
		}

		return $blocks;
	}

	/**
	 * Rewrites the registered attrs on a single block using the given map.
	 * Logs a warning for each matched attr whose source ID was not resolvable
	 * so the admin can surface and fix it.
	 *
	 * @param array<string, mixed>                                                     $attrs    Block attrs.
	 * @param string                                                                   $name     Block name.
	 * @param array<string, list<array{attr:string, gated_by?: array<string,string>}>> $registry Block-name => list of attr rules.
	 * @param array<int,int>                                                           $id_map   Source-ID => destination-ID.
	 * @param string                                                                   $kind     'post' or 'term' (warning context).
	 * @return array<string, mixed> Mutated attrs.
	 */
	private function rewrite_attrs(
		array $attrs,
		string $name,
		array $registry,
		array $id_map,
		string $kind
	): array {
		if ( '' === $name || ! isset( $registry[ $name ] ) ) {
			return $attrs;
		}

		foreach ( $registry[ $name ] as $rule ) {
			if ( isset( $rule['gated_by'] ) ) {
				foreach ( $rule['gated_by'] as $gate_attr => $gate_value ) {
					if ( ( $attrs[ $gate_attr ] ?? null ) !== $gate_value ) {
						continue 2;
					}
				}
			}

			$value     = $attrs[ $rule['attr'] ] ?? null;
			$source_id = is_numeric( $value ) ? (int) $value : 0;
			if ( $source_id <= 0 ) {
				continue;
			}

			if ( isset( $id_map[ $source_id ] ) ) {
				$attrs[ $rule['attr'] ] = $id_map[ $source_id ];
			} else {
				$this->warnings[] = array(
					'type'      => 'unmapped_block_reference',
					'kind'      => $kind,
					'block'     => $name,
					'source_id' => $source_id,
				);
			}
		}

		return $attrs;
	}
}
