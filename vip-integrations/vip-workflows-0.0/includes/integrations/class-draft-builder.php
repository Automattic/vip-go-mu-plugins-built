<?php
/**
 * DraftBuilder - Shared utilities for AI-powered draft generation.
 *
 * Provides guideline context gathering and markdown-to-blocks conversion
 * used by both the research and ideation controllers.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

/**
 * Draft Builder.
 */
class DraftBuilder {

	/**
	 * Gather guideline markdown (brand + current user + category) for AI context.
	 *
	 * @param int $category_id Optional category ID for category-scoped guidelines.
	 * @return string Combined guideline text.
	 */
	public static function gather_guideline_context( int $category_id = 0 ): string {
		return GuidelineContextProvider::gather_context( $category_id );
	}

	/**
	 * Replace [IMAGE:N] tokens in markdown with wp:image block markup.
	 *
	 * @param string $markdown  The markdown body containing [IMAGE:N] tokens.
	 * @param array  $image_map Indexed array of image data keyed by token index.
	 *                          Each entry: { index, attachment_id, url, alt }.
	 * @return string Markdown with tokens replaced by block markup.
	 */
	public static function replace_image_tokens( string $markdown, array $image_map ): string {
		$lookup = array();
		foreach ( $image_map as $img ) {
			$lookup[ (int) $img['index'] ] = $img;
		}

		return preg_replace_callback(
			'/^\[IMAGE:(\d+)\]\s*$/m',
			function ( $matches ) use ( $lookup ) {
				$idx = (int) $matches[1];
				if ( ! isset( $lookup[ $idx ] ) ) {
					return '';
				}
				$img = $lookup[ $idx ];
				$id  = (int) $img['attachment_id'];
				$url = esc_url( $img['url'] );
				$alt = esc_attr( $img['alt'] ?? '' );

				return "<!-- wp:image {\"id\":{$id},\"sizeSlug\":\"large\"} -->\n"
					. '<figure class="wp-block-image size-large">'
					. "<img src=\"{$url}\" alt=\"{$alt}\" class=\"wp-image-{$id}\"/>"
					. "</figure>\n"
					. '<!-- /wp:image -->';
			},
			$markdown
		);
	}

	/**
	 * Convert markdown text to serialized Gutenberg blocks.
	 *
	 * @param string $markdown Markdown content.
	 * @return string Serialized block markup.
	 */
	public static function markdown_to_blocks( string $markdown ): string {
		$lines  = explode( "\n", $markdown );
		$blocks = array();
		$buffer = '';
		$in_list      = false;
		$list_items   = array();
		$in_quote     = false;
		$quote_lines  = array();

		$flush_paragraph = function () use ( &$buffer, &$blocks ) {
			$text = trim( $buffer );
			$buffer = '';
			if ( empty( $text ) ) {
				return;
			}
			$html = str_replace( "\n", '<br>', esc_html( $text ) );
			$blocks[] = "<!-- wp:paragraph -->\n<p>{$html}</p>\n<!-- /wp:paragraph -->";
		};

		$flush_list = function () use ( &$list_items, &$blocks, &$in_list ) {
			if ( empty( $list_items ) ) {
				return;
			}
			$items_html = '';
			foreach ( $list_items as $item ) {
				$items_html .= '<li>' . esc_html( $item ) . '</li>';
			}
			$blocks[] = "<!-- wp:list -->\n<ul>{$items_html}</ul>\n<!-- /wp:list -->";
			$list_items = array();
			$in_list    = false;
		};

		$flush_quote = function () use ( &$quote_lines, &$blocks, &$in_quote ) {
			if ( empty( $quote_lines ) ) {
				return;
			}
			$text = esc_html( implode( "\n", $quote_lines ) );
			$blocks[] = "<!-- wp:quote -->\n<blockquote class=\"wp-block-quote\"><p>{$text}</p></blockquote>\n<!-- /wp:quote -->";
			$quote_lines = array();
			$in_quote    = false;
		};

		$in_block       = false;
		$block_buffer   = array();

		foreach ( $lines as $line ) {
			if ( preg_match( '/^<!-- wp:\w+/', $line ) ) {
				$flush_paragraph();
				$flush_list();
				$flush_quote();
				$in_block     = true;
				$block_buffer = array( $line );
				if ( preg_match( '/<!-- \/wp:\w+/', $line ) ) {
					$blocks[]     = implode( "\n", $block_buffer );
					$block_buffer = array();
					$in_block     = false;
				}
				continue;
			}

			if ( $in_block ) {
				$block_buffer[] = $line;
				if ( preg_match( '/<!-- \/wp:\w+/', $line ) ) {
					$blocks[]     = implode( "\n", $block_buffer );
					$block_buffer = array();
					$in_block     = false;
				}
				continue;
			}

			if ( preg_match( '/^(#{2,6})\s+(.+)$/', $line, $m ) ) {
				$flush_paragraph();
				$flush_list();
				$flush_quote();
				$level   = strlen( $m[1] );
				$heading = esc_html( trim( $m[2] ) );
				$blocks[] = "<!-- wp:heading {\"level\":{$level}} -->\n<h{$level} class=\"wp-block-heading\">{$heading}</h{$level}>\n<!-- /wp:heading -->";
				continue;
			}

			if ( preg_match( '/^[-*]\s+(.+)$/', $line, $m ) ) {
				$flush_paragraph();
				if ( $in_quote ) {
					$flush_quote();
				}
				$in_list      = true;
				$list_items[] = trim( $m[1] );
				continue;
			}

			if ( $in_list && ! preg_match( '/^[-*]\s/', $line ) ) {
				$flush_list();
			}

			if ( preg_match( '/^>\s*(.*)$/', $line, $m ) ) {
				$flush_paragraph();
				if ( $in_list ) {
					$flush_list();
				}
				$in_quote      = true;
				$quote_lines[] = trim( $m[1] );
				continue;
			}

			if ( $in_quote && ! preg_match( '/^>/', $line ) ) {
				$flush_quote();
			}

			if ( trim( $line ) === '' ) {
				$flush_paragraph();
				continue;
			}

			$buffer .= ( '' !== $buffer ? "\n" : '' ) . $line;
		}

		$flush_paragraph();
		$flush_list();
		$flush_quote();

		return implode( "\n\n", $blocks );
	}
}
