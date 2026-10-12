<?php

/**
 * HTML-to-Markdown converter.
 *
 * Derived from WordPress/ai's Markdown Feeds experiment, PR #194, at commit
 * 3504700a6cec86dce5280683a58baf405cef3099. Uses the WordPress HTML API
 * for parsing and Markdown_Output_Writer for output formatting.
 *
 * @see https://github.com/WordPress/ai/pull/194
 *
 * @package Content_For_Agents
 */

declare( strict_types=1 );

namespace Content_For_Agents;

use WP_HTML_Processor;
use WP_HTML_Tag_Processor;

/**
 * Converts HTML fragments into Markdown.
 *
 * @package Content_For_Agents
 */
final class HTML_To_Markdown_Converter {
	/**
	 * Shared Markdown output rules for document and table cell contexts.
	 *
	 * @var Markdown_Output_Writer
	 */
	private Markdown_Output_Writer $writer;

	/**
	 * Initialize the output writer.
	 */
	public function __construct() {
		$this->writer = new Markdown_Output_Writer();
	}

	/**
	 * Converts HTML to Markdown.
	 *
	 * @param string $html HTML to convert.
	 * @return string Markdown output.
	 */
	public function convert( string $html ): string {
		$processor = WP_HTML_Processor::create_fragment( $html );
		$markdown  = $this->convert_with_processor( $processor );

		if ( WP_HTML_Processor::ERROR_UNSUPPORTED === $processor->get_last_error() ) {
			// The tree-aware processor can stop at markup it cannot repair. Replay
			// from the start with source tokens so later post content is retained.
			$markdown = $this->convert_with_processor( new WP_HTML_Tag_Processor( $html ) );
		}

		return trim( $markdown );
	}

	/**
	 * Converts HTML into Markdown using a provided HTML API processor.
	 *
	 * @param WP_HTML_Tag_Processor $processor Processor instance.
	 * @return string Markdown output.
	 */
	private function convert_with_processor( WP_HTML_Tag_Processor $processor ): string {
		$document      = new Markdown_Conversion_Context();
		$table_state   = array(
			'cell'            => null,
			'in_caption'      => false,
			'depth'           => 0,
			'current_row'     => array(),
			'header_row_done' => false,
		);
		$hidden_stack  = array();
		$heading_depth = 0;
		$video_stack   = array();

		while ( $processor->next_token() ) {
			$token_type = $processor->get_token_type();
			if ( '#tag' !== $token_type && '#text' !== $token_type ) {
				continue;
			}
			$token_name = $processor->get_token_name();
			$is_tag     = '#tag' === $token_type;
			$is_closer  = $is_tag && $processor->is_tag_closer();

			if ( ! empty( $hidden_stack ) ) {
				// The Tag Processor exposes source tokens rather than repaired HTML
				// structure, so balance its tags until the hidden element closes.
				if ( $is_tag && $token_name ) {
					if ( $is_closer ) {
						$matching_index = array_search( $token_name, array_reverse( $hidden_stack, true ), true );
						if ( false !== $matching_index ) {
							$hidden_stack = array_slice( $hidden_stack, 0, $matching_index );
						}
					} elseif ( $this->element_expects_closer( $processor, $token_name ) ) {
						$hidden_stack[] = $token_name;
					}
				}
				continue;
			}
			$hidden = $is_tag && ! $is_closer ? $processor->get_attribute( 'hidden' ) : null;
			// Interactivity bindings can reveal content after the initial render.
			$static_hidden      = null !== $hidden && null === $processor->get_attribute( 'data-wp-bind--hidden' );
			$static_aria_hidden = $is_tag && ! $is_closer
				&& 'true' === strtolower( trim( $this->string_attribute( $processor, 'aria-hidden' ) ) )
				&& null === $processor->get_attribute( 'data-wp-bind--aria-hidden' );
			$decorative_video   = $is_tag && ! $is_closer && 'VIDEO' === $token_name
				&& null !== $processor->get_attribute( 'autoplay' )
				&& null !== $processor->get_attribute( 'muted' )
				&& null !== $processor->get_attribute( 'loop' )
				&& null === $processor->get_attribute( 'controls' );

			if (
				$is_tag
				&& $token_name
				&& ! $is_closer
				&& (
					in_array( $token_name, array( 'SCRIPT', 'STYLE', 'DATALIST', 'OPTION', 'SELECT', 'SVG', 'TEMPLATE', 'TEXTAREA', 'TITLE' ), true )
					|| $static_hidden
					|| $static_aria_hidden
					|| $decorative_video
					// Buttons are controls unless they carry a heading's text.
					|| ( 'BUTTON' === $token_name && 0 === $heading_depth )
				)
			) {
				if ( $processor instanceof WP_HTML_Processor ) {
					$this->skip_processor_element( $processor );
				} elseif ( $this->element_expects_closer( $processor, $token_name ) ) {
					$hidden_stack[] = $token_name;
				}
				continue;
			}

			if ( $is_tag && $token_name && preg_match( '/^H[1-6]$/', $token_name ) ) {
				$heading_depth = max( 0, $heading_depth + ( $is_closer ? -1 : 1 ) );
			}

			if ( $is_tag && 'LITE-YOUTUBE' === $token_name ) {
				$this->flush_inline( null !== $table_state['cell'] ? $table_state['cell'] : $document );
				if ( $is_closer ) {
					$link = array_pop( $video_stack );
				} else {
					$video_id      = $this->string_attribute( $processor, 'videoid' );
					$title         = trim( $this->string_attribute( $processor, 'title' ) );
					$video_stack[] = preg_match( '/^[A-Za-z0-9_-]{11}$/', $video_id )
						? '[Video: ' . $this->writer->escape_markdown_link_text( '' !== $title ? $title : 'YouTube' ) . '](https://www.youtube.com/watch?v=' . $video_id . ')'
						: null;
					continue;
				}
				if ( $link ) {
					$context = null !== $table_state['cell'] ? $table_state['cell'] : $document;
					$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
					$this->writer->append_text( $context->output, $link, $context->at_line_start, true );
					$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
				}
				continue;
			}

			if ( $is_tag && in_array( $token_name, array( 'TABLE', 'TR', 'TH', 'TD' ), true ) ) {
				$this->flush_inline( null !== $table_state['cell'] ? $table_state['cell'] : $document );
			}
			if ( $this->handle_table_token( $processor, $token_name, $is_closer, $document, $table_state ) ) {
				continue;
			}

			if ( null !== $table_state['cell'] ) {
				$this->convert_token( $processor, $token_name, $is_closer, $table_state['cell'], true );
			} else {
				$this->convert_token( $processor, $token_name, $is_closer, $document, 0 < $heading_depth );
			}
		}

		$this->flush_inline( $document );
		$this->flush_code( $document );
		$this->writer->finish_open_blocks( $document );
		return $document->output;
	}

	/**
	 * Handle table boundaries and cells before ordinary token conversion.
	 *
	 * @param WP_HTML_Tag_Processor       $processor   Current processor.
	 * @param string|null                 $token_name  Current token name.
	 * @param bool                        $is_closer   Whether the token closes a tag.
	 * @param Markdown_Conversion_Context $document Document context.
	 * @param array                       $table_state Table context (by reference).
	 * @return bool Whether the token was consumed as table structure.
	 */
	private function handle_table_token( WP_HTML_Tag_Processor $processor, ?string $token_name, bool $is_closer, Markdown_Conversion_Context $document, array &$table_state ): bool {
		if ( 'TABLE' === $token_name ) {
			if ( ! $is_closer ) {
				if ( 0 === $table_state['depth'] ) {
					$this->writer->ensure_blank_line( $document->output, $document->at_line_start );
				} elseif ( null !== $table_state['cell'] ) {
					$this->writer->append_newline( $table_state['cell']->output, $table_state['cell']->at_line_start );
				}
				++$table_state['depth'];
			} elseif ( 1 < $table_state['depth'] ) {
				--$table_state['depth'];
				if ( null !== $table_state['cell'] ) {
					$this->writer->append_newline( $table_state['cell']->output, $table_state['cell']->at_line_start );
				}
			} elseif ( 1 === $table_state['depth'] ) {
				if ( $table_state['in_caption'] ) {
					$this->flush_inline( $document );
					$this->writer->ensure_blank_line( $document->output, $document->at_line_start );
				}
				$this->close_table_cell( $table_state['cell'], $table_state['current_row'] );
				$this->emit_table_row( $document, $table_state['current_row'], $table_state['header_row_done'] );
				$table_state['depth']           = 0;
				$table_state['in_caption']      = false;
				$table_state['header_row_done'] = false;
				$this->writer->ensure_blank_line( $document->output, $document->at_line_start );
			}
			return true;
		}

		if ( 1 === $table_state['depth'] && 'CAPTION' === $token_name ) {
			if ( $is_closer ) {
				$this->flush_inline( $document );
				$this->writer->ensure_blank_line( $document->output, $document->at_line_start );
			} else {
				$this->writer->ensure_blank_line( $document->output, $document->at_line_start );
			}
			$table_state['in_caption'] = ! $is_closer;
			return true;
		}

		$is_table_structure = in_array( $token_name, array( 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD' ), true );
		if ( 1 < $table_state['depth'] && $is_table_structure ) {
			// Flatten nested tables into the outer cell. Nested cell and row
			// boundaries become line boundaries in that cell.
			if ( $is_closer && null !== $table_state['cell'] && in_array( $token_name, array( 'TH', 'TD', 'TR' ), true ) ) {
				$this->writer->append_newline( $table_state['cell']->output, $table_state['cell']->at_line_start );
			}
			return true;
		}

		if ( 1 === $table_state['depth'] && 'TR' === $token_name ) {
			if ( $is_closer ) {
				$this->close_table_cell( $table_state['cell'], $table_state['current_row'] );
				$this->emit_table_row( $document, $table_state['current_row'], $table_state['header_row_done'] );
			}
			return true;
		}

		if ( 1 === $table_state['depth'] && ( 'TH' === $token_name || 'TD' === $token_name ) ) {
			if ( ! $is_closer ) {
				$this->close_table_cell( $table_state['cell'], $table_state['current_row'] );
				$table_state['cell'] = new Markdown_Conversion_Context();
				// Colspan and rowspan are intentionally unsupported. Each TH or
				// TD produces exactly one Markdown cell.
			} else {
				$this->close_table_cell( $table_state['cell'], $table_state['current_row'] );
			}
			return true;
		}

		if ( 1 === $table_state['depth'] && $is_table_structure ) {
			// THEAD, TBODY, and TFOOT only group rows.
			return true;
		}

		if ( 0 < $table_state['depth'] && null === $table_state['cell'] && ! $table_state['in_caption'] ) {
			// Ignore whitespace and unsupported content outside cells and captions.
			return true;
		}

		return false;
	}

	/**
	 * Converts a non-table-structural token into a context.
	 *
	 * @param WP_HTML_Tag_Processor       $processor  Processor instance.
	 * @param string|null                 $token_name Current token name.
	 * @param bool                        $is_closer  Whether the token closes a tag.
	 * @param Markdown_Conversion_Context $context Conversion context.
	 * @param bool                        $literal_break Whether a break must stay on the current Markdown line.
	 */
	private function convert_token( WP_HTML_Tag_Processor $processor, ?string $token_name, bool $is_closer, Markdown_Conversion_Context $context, bool $literal_break ): void {
		if ( '#text' === $token_name ) {
			if ( ! empty( $context->media_stack ) ) {
				return;
			}
			$text = $processor->get_modifiable_text();
			if ( null !== $context->pre_code ) {
				$context->pre_code .= $text;
				return;
			}
			$this->inline_buffer( $context )->append_text( $text );
			return;
		}

		// Skip script/style tokens entirely.
		if ( 'SCRIPT' === $token_name || 'STYLE' === $token_name ) {
			return;
		}

		if ( ! empty( $context->media_stack ) && ! in_array( $token_name, array( 'AUDIO', 'VIDEO', 'SOURCE' ), true ) ) {
			return;
		}
		if ( null !== $context->pre_code && 'PRE' !== $token_name ) {
			if ( 'BR' === $token_name ) {
				$context->pre_code .= "\n";
			} elseif ( 'CODE' === $token_name && ! $is_closer && null === $context->pre_language ) {
				$context->pre_language = $this->code_language( $processor );
			}
			return;
		}
		if ( null !== $token_name && in_array( $token_name, array( 'B', 'STRONG', 'I', 'EM', 'S', 'DEL', 'STRIKE', 'A', 'CODE', 'BR', 'IMG', 'Q', 'SUB', 'SUP' ), true ) ) {
			$this->inline_buffer( $context )->append_tag( $processor, $token_name, $is_closer, $literal_break );
			return;
		}
		if ( null !== $token_name && ( in_array( $token_name, array( 'P', 'DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'MAIN', 'NAV', 'BLOCKQUOTE', 'PRE', 'FIGURE', 'UL', 'OL', 'LI', 'HR', 'CITE', 'IFRAME', 'AUDIO', 'VIDEO', 'SOURCE' ), true ) || preg_match( '/^H[1-6]$/', $token_name ) ) ) {
			$this->flush_inline( $context );
		}
		if ( 'HR' === $token_name && ! $is_closer ) {
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
			$this->writer->append_line( $context->output, '---', $context->at_line_start );
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
			return;
		}

		if ( in_array( $token_name, array( 'P', 'DIV', 'SECTION', 'ARTICLE', 'ASIDE', 'HEADER', 'FOOTER', 'MAIN', 'NAV' ), true ) ) {
			$this->writer->block_boundary( $context, $is_closer, ! in_array( $token_name, array( 'P', 'DIV' ), true ) );
			return;
		}

		if ( 'BLOCKQUOTE' === $token_name ) {
			$this->writer->quote_boundary( $context, $is_closer );
			return;
		}

		if ( 'PRE' === $token_name ) {
			if ( $is_closer ) {
				$this->flush_code( $context );
			} else {
				$this->writer->mark_item_block( $context );
				$context->pre_code     = '';
				$context->pre_language = $this->code_language( $processor );
				$context->in_pre       = true;
			}
			return;
		}

		if ( 'IFRAME' === $token_name && ! $is_closer ) {
			$src = $this->string_attribute( $processor, 'src' );
			if ( '' !== $src ) {
				$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
				$this->writer->append_text( $context->output, '[Embedded media](' . $this->writer->escape_markdown_destination( $src ) . ')', $context->at_line_start, true );
				$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
			}
			return;
		}

		if ( 'AUDIO' === $token_name || 'VIDEO' === $token_name ) {
			if ( $is_closer ) {
				array_pop( $context->media_stack );
			} else {
				$src = $this->string_attribute( $processor, 'src' );

				$context->media_stack[] = array(
					'type'    => $token_name,
					'has_src' => '' !== $src,
				);
				if ( '' !== $src ) {
					$this->writer->append_text( $context->output, '[' . ucfirst( strtolower( $token_name ) ) . '](' . $this->writer->escape_markdown_destination( $src ) . ')', $context->at_line_start, true );
				}
			}
			return;
		}

		if ( 'SOURCE' === $token_name && ! $is_closer && ! empty( $context->media_stack ) ) {
			$index = count( $context->media_stack ) - 1;
			$src   = $this->string_attribute( $processor, 'src' );
			if ( ! $context->media_stack[ $index ]['has_src'] && '' !== $src ) {
				$this->writer->append_text( $context->output, '[' . ucfirst( strtolower( $context->media_stack[ $index ]['type'] ) ) . '](' . $this->writer->escape_markdown_destination( $src ) . ')', $context->at_line_start, true );
				$context->media_stack[ $index ]['has_src'] = true;
			}
			return;
		}

		if ( 'FIGURE' === $token_name ) {
			if ( $this->writer->has_active_list_item( $context ) ) {
				if ( $is_closer ) {
					$this->writer->ensure_newline( $context->output, $context->at_line_start );
				}
				return;
			}
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
			return;
		}

		if ( 'FIGCAPTION' === $token_name ) {
			if ( ! $is_closer ) {
				$this->flush_inline( $context );
				$this->writer->ensure_newline( $context->output, $context->at_line_start );
				$this->inline_buffer( $context )->append_caption_boundary( true );
			} else {
				$this->inline_buffer( $context )->append_caption_boundary( false );
				$this->flush_inline( $context );
			}
			return;
		}

		if ( 'CITE' === $token_name ) {
			if ( ! $is_closer ) {
				if ( $this->writer->in_quote( $context ) ) {
					$this->writer->ensure_newline( $context->output, $context->at_line_start );
				}
				$this->writer->append_text( $context->output, '— ', $context->at_line_start, true );
			}
			return;
		}

		if ( 'UL' === $token_name || 'OL' === $token_name ) {
			$start = ! $is_closer && 'OL' === $token_name ? $processor->get_attribute( 'start' ) : null;
			$this->writer->list_boundary( $context, $token_name, $is_closer, null !== $start ? (int) $start : null );
			return;
		}

		if ( 'LI' === $token_name ) {
			$this->writer->list_item_boundary( $context, $is_closer );
			return;
		}

		if ( ! $token_name || ! preg_match( '/^H([1-6])$/', $token_name, $matches ) ) {
			return;
		}

		if ( $is_closer ) {
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
		} else {
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
			$this->writer->append_text( $context->output, str_repeat( '#', (int) $matches[1] ) . ' ', $context->at_line_start, true );
		}
	}

	/**
	 * Finalizes the active table cell into the current row.
	 *
	 * @param Markdown_Conversion_Context|null $cell Active cell context (by reference).
	 * @param array      $current_row Current table row (by reference).
	 */
	private function close_table_cell( ?Markdown_Conversion_Context &$cell, array &$current_row ): void {
		if ( null === $cell ) {
			return;
		}

		$this->flush_code( $cell );
		$current_row[] = $this->format_table_cell( $cell->output );
		$cell          = null;
	}

	/**
	 * Emits the current table row and an optional header separator.
	 *
	 * @param Markdown_Conversion_Context $document Document conversion context.
	 * @param array $current_row     Current table row (by reference).
	 * @param bool  $header_row_done Whether the first row has been emitted (by reference).
	 */
	private function emit_table_row( Markdown_Conversion_Context $document, array &$current_row, bool &$header_row_done ): void {
		if ( ! empty( $current_row ) ) {
			$this->writer->append_line(
				$document->output,
				'| ' . implode( ' | ', $current_row ) . ' |',
				$document->at_line_start
			);

			if ( ! $header_row_done ) {
				$this->writer->append_line(
					$document->output,
					'|' . str_repeat( ' --- |', count( $current_row ) ),
					$document->at_line_start
				);
				$header_row_done = true;
			}
		}

		$current_row = array();
	}

	/**
	 * Formats buffered table-cell content for a Markdown row.
	 *
	 * @param string $cell Buffered table-cell content.
	 * @return string Formatted table-cell content.
	 */
	private function format_table_cell( string $cell ): string {
		$cell = trim( $cell );
		$cell = (string) preg_replace( '/[ \t]*\n+[ \t]*/', '<br>', $cell );

		return str_replace( '|', '\\|', $cell );
	}

	/**
	 * Advances the HTML Processor past the current element and its descendants.
	 *
	 * @param WP_HTML_Processor $processor Processor positioned on an opening tag.
	 */
	private function skip_processor_element( WP_HTML_Processor $processor ): void {
		if ( ! $processor->expects_closer() ) {
			return;
		}

		$depth = $processor->get_current_depth();
		while ( $processor->next_token() && $depth <= $processor->get_current_depth() ) {
			continue;
		}
	}

	/**
	 * Whether the current element expects a closing token.
	 *
	 * @param WP_HTML_Tag_Processor $processor Processor instance.
	 * @param string                                  $token_name Current token name.
	 * @return bool Whether the element expects a closing token.
	 */
	private function element_expects_closer( WP_HTML_Tag_Processor $processor, string $token_name ): bool {
		if ( $processor->has_self_closing_flag() ) {
			return false;
		}
		return ! WP_HTML_Processor::is_void( $token_name );
	}

	/** Read a text attribute without treating a boolean attribute as text. */
	private function string_attribute( WP_HTML_Tag_Processor $processor, string $name ): string {
		$value = $processor->get_attribute( $name );
		return is_string( $value ) ? $value : '';
	}

	/** Share one inline buffer across the current document or table cell. */
	private function inline_buffer( Markdown_Conversion_Context $context ): Markdown_Inline_Buffer {
		if ( null === $context->inline_buffer ) {
			$context->inline_buffer = new Markdown_Inline_Buffer();
		}
		return $context->inline_buffer;
	}

	/** Render inline content before a block or generated output takes over. */
	private function flush_inline( Markdown_Conversion_Context $context ): void {
		if ( null === $context->inline_buffer ) {
			return;
		}
		$markdown = $context->inline_buffer->drain( $context->at_line_start );
		$this->writer->append_text( $context->output, $markdown, $context->at_line_start, true );
	}

	/** Read an explicit syntax language from a code element's class list. */
	private function code_language( WP_HTML_Tag_Processor $processor ): ?string {
		$classes = $processor->class_list();
		if ( null === $classes ) {
			return null;
		}
		foreach ( $classes as $class ) {
			$language = str_starts_with( $class, 'language-' ) ? substr( $class, 9 ) : '';
			if ( '' !== $language && preg_match( '/^[A-Za-z0-9_+-]+$/', $language ) ) {
				return $language;
			}
		}
		return null;
	}

	/**
	 * Emit complete or unclosed code content from a conversion context.
	 *
	 * @param Markdown_Conversion_Context $context Conversion context.
	 */
	private function flush_code( Markdown_Conversion_Context $context ): void {
		if ( null !== $context->pre_code ) {
			$content = (string) $context->pre_code;
			$fence   = $this->writer->code_delimiter( $content, 3 );

			$context->pre_code = null;
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
			$this->writer->append_line( $context->output, $fence . ( $context->pre_language ?? '' ), $context->at_line_start );
			$this->writer->append_text( $context->output, $content, $context->at_line_start, true );
			if ( ! $context->at_line_start ) {
				$this->writer->append_newline( $context->output, $context->at_line_start, true );
			}
			$this->writer->append_line( $context->output, $fence, $context->at_line_start );
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start );
			$context->in_pre       = false;
			$context->pre_language = null;
		}
	}
}
