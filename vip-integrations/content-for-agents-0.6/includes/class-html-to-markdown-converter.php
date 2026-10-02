<?php

/**
 * HTML-to-Markdown converter.
 *
 * This converter is derived from the one developed in the WordPress/ai
 * Markdown Feeds experiment (PR #194):
 *
 * @see https://github.com/WordPress/ai/pull/194
 *
 * Upstream source:
 * includes/Experiments/Markdown_Feeds/HTML_To_Markdown_Converter.php
 * at commit 3504700a6cec86dce5280683a58baf405cef3099
 *
 * PR #194 closed without merging. Retain this tested derivative for now.
 * dmsnell/html-to-md is a candidate replacement, but currently has no tagged
 * release and documents escaping, table and image/link limitations. Evaluate
 * it against the supported content before changing conversion behavior.
 *
 * @see https://github.com/dmsnell/html-to-md
 *
 * This converter focuses on producing a readable Markdown representation of
 * typical WordPress post content without external parsing dependencies. It
 * traverses WordPress's HTML API tokens and delegates Markdown formatting to
 * Markdown_Output_Writer.
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
			$markdown = $this->convert_with_processor( new WP_HTML_Tag_Processor( $html ) );
		}

		return trim( $markdown );
	}

	/**
	 * Converts HTML into Markdown using a provided HTML API processor.
	 *
	 * @param WP_HTML_Tag_Processor|WP_HTML_Processor $processor Processor instance.
	 * @return string Markdown output.
	 */
	private function convert_with_processor( $processor ): string {
		$document      = new Markdown_Conversion_Context();
		$table_state   = array(
			'cell'            => null,
			'depth'           => 0,
			'current_row'     => array(),
			'is_header_row'   => false,
			'header_row_done' => false,
		);
		$hidden_stack  = array();
		$heading_depth = 0;
		$video_stack   = array();

		while ( $processor->next_token() ) {
			$token_name = $processor->get_token_name();
			$is_tag     = '#tag' === $processor->get_token_type();

			if ( ! empty( $hidden_stack ) ) {
				// The Tag Processor exposes source tokens rather than repaired HTML
				// structure, so balance its tags until the hidden element closes.
				if ( $is_tag && $token_name ) {
					if ( $processor->is_tag_closer() ) {
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

			if (
				$is_tag
				&& $token_name
				&& ! $processor->is_tag_closer()
				&& (
					in_array( $token_name, array( 'SCRIPT', 'STYLE' ), true )
					|| 'true' === strtolower( trim( (string) $processor->get_attribute( 'aria-hidden' ) ) )
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
				$heading_depth = max( 0, $heading_depth + ( $processor->is_tag_closer() ? -1 : 1 ) );
			}

			if ( $is_tag && 'LITE-YOUTUBE' === $token_name ) {
				if ( $processor->is_tag_closer() ) {
					$link = array_pop( $video_stack );
				} else {
					$video_id      = (string) $processor->get_attribute( 'videoid' );
					$title         = trim( (string) $processor->get_attribute( 'title' ) );
					$video_stack[] = preg_match( '/^[A-Za-z0-9_-]{11}$/', $video_id )
						? '[Video: ' . $this->writer->escape_markdown_link_text( '' !== $title ? $title : 'YouTube' ) . '](https://www.youtube.com/watch?v=' . $video_id . ')'
						: null;
					continue;
				}
				if ( $link ) {
					$context = null !== $table_state['cell'] ? $table_state['cell'] : $document;
					$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
					$this->writer->append_text( $context->output, $link, $context->at_line_start, $context->blockquote_depth, true );
					$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
				}
				continue;
			}

			if ( $is_tag && 'BR' === $token_name && 0 < $heading_depth ) {
				if ( null !== $table_state['cell'] ) {
					$table_state['cell']->output = rtrim( $table_state['cell']->output, " \t" );
					$this->writer->append_text( $table_state['cell']->output, ' ', $table_state['cell']->at_line_start, $table_state['cell']->blockquote_depth, true );
				} else {
					$document->output = rtrim( $document->output, " \t" );
					$this->writer->append_text( $document->output, ' ', $document->at_line_start, $document->blockquote_depth, true );
				}
				continue;
			}

			if ( $this->handle_table_token( $processor, $token_name, $document, $table_state ) ) {
				continue;
			}

			if ( null !== $table_state['cell'] ) {
				$this->convert_token( $processor, $token_name, $table_state['cell'] );
			} else {
				$this->convert_token( $processor, $token_name, $document );
			}
		}

		$this->flush_code( $document );
		return $document->output;
	}

	/**
	 * Handle table boundaries and cells before ordinary token conversion.
	 *
	 * @param WP_HTML_Tag_Processor|WP_HTML_Processor $processor   Current processor.
	 * @param string|null                            $token_name  Current token name.
	 * @param Markdown_Conversion_Context $document Document context.
	 * @param array                                  $table_state Table context (by reference).
	 * @return bool Whether the token was consumed as table structure.
	 */
	private function handle_table_token( $processor, ?string $token_name, Markdown_Conversion_Context $document, array &$table_state ): bool {
		$is_closer = $processor->is_tag_closer();
		if ( 'TABLE' === $token_name ) {
			if ( ! $is_closer ) {
				if ( 0 === $table_state['depth'] ) {
					$this->writer->ensure_blank_line( $document->output, $document->at_line_start, $document->blockquote_depth );
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
				$this->close_table_cell( $table_state['cell'], $table_state['current_row'] );
				$this->emit_table_row( $document, $table_state['current_row'], $table_state['is_header_row'], $table_state['header_row_done'] );
				$table_state['depth']           = 0;
				$table_state['header_row_done'] = false;
				$this->writer->ensure_blank_line( $document->output, $document->at_line_start, $document->blockquote_depth );
			}
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
				$this->emit_table_row( $document, $table_state['current_row'], $table_state['is_header_row'], $table_state['header_row_done'] );
			}
			return true;
		}

		if ( 1 === $table_state['depth'] && ( 'TH' === $token_name || 'TD' === $token_name ) ) {
			if ( ! $is_closer ) {
				$this->close_table_cell( $table_state['cell'], $table_state['current_row'] );
				$table_state['cell'] = new Markdown_Conversion_Context();
				if ( 'TH' === $token_name ) {
					$table_state['is_header_row'] = true;
				}
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

		if ( 0 < $table_state['depth'] && null === $table_state['cell'] ) {
			// Ignore whitespace and unsupported content outside table cells.
			return true;
		}

		return false;
	}

	/**
	 * Converts a non-table-structural token into a context.
	 *
	 * @param WP_HTML_Tag_Processor|WP_HTML_Processor $processor  Processor instance.
	 * @param string|null                            $token_name Current token name.
	 * @param Markdown_Conversion_Context $context Conversion context.
	 */
	private function convert_token( $processor, ?string $token_name, Markdown_Conversion_Context $context ): void {
		if ( '#text' === $token_name ) {
			if ( null !== $context->pre_code ) {
				$context->pre_code .= (string) $processor->get_modifiable_text();
				return;
			}
			if ( null !== $context->inline_code ) {
				$context->inline_code .= (string) $processor->get_modifiable_text();
				return;
			}
			$text = (string) $processor->get_modifiable_text();
			if ( '' !== trim( $text ) ) {
				$this->begin_active_link( $context );
			}
			$this->append_formatted_text( $context, $text );
			return;
		}

		// Skip script/style tokens entirely.
		if ( 'SCRIPT' === $token_name || 'STYLE' === $token_name ) {
			return;
		}

		$is_closer = $processor->is_tag_closer();
		if ( in_array( $token_name, array( 'P', 'DIV', 'BLOCKQUOTE', 'PRE', 'FIGURE', 'FIGCAPTION', 'UL', 'OL', 'LI', 'HR' ), true ) || preg_match( '/^H[1-6]$/', (string) $token_name ) ) {
			$this->close_active_link( $context );
		}
		if ( null !== $context->pre_code && 'PRE' !== $token_name ) {
			if ( 'BR' === $token_name ) {
				$context->pre_code .= "\n";
			}
			return;
		}
		if ( null !== $context->inline_code && 'CODE' !== $token_name ) {
			if ( 'BR' === $token_name ) {
				$context->inline_code .= "\n";
			} elseif ( 'A' === $token_name ) {
				if ( '' !== $context->inline_code ) {
					$context->inline_code_parts[] = array( $context->inline_code, $context->inline_code_link );
					$context->inline_code         = '';
				}
				$context->inline_code_link = $is_closer ? null : (string) $processor->get_attribute( 'href' );
			}
			return;
		}

		if ( 'BR' === $token_name ) {
			// Markdown emphasis cannot close after a line break. Close each
			// active span now and reopen it if more text follows the break.
			for ( $index = count( $context->emphasis_stack ) - 1; $index >= 0; --$index ) {
				if ( $context->emphasis_stack[ $index ]['emitted'] ) {
					$this->writer->append_text( $context->output, $context->emphasis_stack[ $index ]['marker'], $context->at_line_start, $context->blockquote_depth, true );
					$context->emphasis_stack[ $index ]['emitted'] = false;
					$context->emphasis_stack[ $index ]['start']   = null;
				}
			}
			$this->writer->append_newline( $context->output, $context->at_line_start, $context->in_pre );
			return;
		}

		if ( 'HR' === $token_name && ! $is_closer ) {
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			$this->writer->append_line( $context->output, '---', $context->at_line_start, $context->blockquote_depth );
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			return;
		}

		if ( ( 'P' === $token_name || 'DIV' === $token_name ) && $is_closer ) {
			if ( ! $context->in_pre ) {
				$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			}
			return;
		}

		if ( 'BLOCKQUOTE' === $token_name ) {
			if ( $is_closer ) {
				$context->blockquote_depth = max( 0, $context->blockquote_depth - 1 );
				$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			} else {
				$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
				++$context->blockquote_depth;
			}
			return;
		}

		if ( 'PRE' === $token_name ) {
			if ( $is_closer ) {
				$this->flush_code( $context );
			} else {
				$context->pre_code = '';
				$context->in_pre   = true;
			}
			return;
		}

		if ( 'CODE' === $token_name && ! $context->in_pre ) {
			if ( ! $is_closer ) {
				$context->inline_code       = '';
				$context->inline_code_parts = array();
				$context->inline_code_link  = null;
				return;
			}

			$this->flush_code( $context );
			return;
		}

		if ( 'STRONG' === $token_name || 'B' === $token_name ) {
			$this->handle_emphasis( $context, '**', $is_closer );
			return;
		}

		if ( 'EM' === $token_name || 'I' === $token_name ) {
			$this->handle_emphasis( $context, '*', $is_closer );
			return;
		}

		if ( 'A' === $token_name ) {
			if ( $is_closer ) {
				$this->close_active_link( $context );
				array_pop( $context->link_stack );
			} else {
				$href = (string) $processor->get_attribute( 'href' );
				if ( '' !== $href ) {
					$this->flush_pending_emphasis( $context );
					if ( strlen( $context->output ) === $context->last_link_end && ! $context->at_line_start ) {
						$this->writer->append_text( $context->output, ' ', $context->at_line_start, $context->blockquote_depth, true );
					}
				}
				$context->link_stack[] = array(
					'href' => $href,
					'open' => false,
				);
			}
			return;
		}

		if ( 'IMG' === $token_name && ! $is_closer ) {
			$src = (string) $processor->get_attribute( 'src' );
			if ( '' !== $src ) {
				$this->begin_active_link( $context );
				$this->flush_pending_emphasis( $context );
				$alt = (string) $processor->get_attribute( 'alt' );
				$this->writer->append_text( $context->output, '![' . $this->writer->escape_markdown_link_text( $alt ) . '](' . $this->writer->escape_markdown_destination( $src ) . ')', $context->at_line_start, $context->blockquote_depth, true );
			}
			return;
		}

		if ( 'AUDIO' === $token_name || 'VIDEO' === $token_name ) {
			if ( $is_closer ) {
				array_pop( $context->media_stack );
			} else {
				$src = (string) $processor->get_attribute( 'src' );

				$context->media_stack[] = array(
					'type'    => $token_name,
					'has_src' => '' !== $src,
				);
				if ( '' !== $src ) {
					$this->begin_active_link( $context );
					$this->flush_pending_emphasis( $context );
					$this->writer->append_text( $context->output, '[' . ucfirst( strtolower( $token_name ) ) . '](' . $this->writer->escape_markdown_destination( $src ) . ')', $context->at_line_start, $context->blockquote_depth, true );
				}
			}
			return;
		}

		if ( 'SOURCE' === $token_name && ! $is_closer && ! empty( $context->media_stack ) ) {
			$index = count( $context->media_stack ) - 1;
			$src   = (string) $processor->get_attribute( 'src' );
			if ( ! $context->media_stack[ $index ]['has_src'] && '' !== $src ) {
				$this->begin_active_link( $context );
				$this->flush_pending_emphasis( $context );
				$this->writer->append_text( $context->output, '[' . ucfirst( strtolower( $context->media_stack[ $index ]['type'] ) ) . '](' . $this->writer->escape_markdown_destination( $src ) . ')', $context->at_line_start, $context->blockquote_depth, true );
				$context->media_stack[ $index ]['has_src'] = true;
			}
			return;
		}

		if ( 'FIGURE' === $token_name ) {
			if ( $this->has_active_list_item( $context ) ) {
				if ( $is_closer ) {
					$this->append_list_continuation( $context );
				}
				return;
			}
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			return;
		}

		if ( 'FIGCAPTION' === $token_name ) {
			if ( ! $is_closer ) {
				if ( $this->has_active_list_item( $context ) ) {
					$this->append_list_continuation( $context );
				} else {
					$this->writer->ensure_newline( $context->output, $context->at_line_start );
				}
				$this->handle_emphasis( $context, '_', false );
			} else {
				$this->handle_emphasis( $context, '_', true );
			}
			return;
		}

		if ( 'CITE' === $token_name ) {
			if ( ! $is_closer ) {
				if ( 0 < $context->blockquote_depth ) {
					$this->writer->ensure_newline( $context->output, $context->at_line_start );
				}
				$this->writer->append_text( $context->output, '— ', $context->at_line_start, $context->blockquote_depth, true );
			}
			return;
		}

		if ( 'UL' === $token_name || 'OL' === $token_name ) {
			if ( $is_closer ) {
				array_pop( $context->list_stack );
				$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			} else {
				$start = 'OL' === $token_name ? $processor->get_attribute( 'start' ) : null;

				$context->list_stack[] = array(
					'type'                => $token_name,
					'index'               => null !== $start ? (int) $start - 1 : 0,
					'continuation_indent' => null,
				);
				$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			}
			return;
		}

		if ( 'LI' === $token_name && ! $is_closer ) {
			$this->writer->ensure_newline( $context->output, $context->at_line_start );

			$depth  = count( $context->list_stack );
			$indent = 1 < $depth && null !== $context->list_stack[ $depth - 2 ]['continuation_indent']
				? $context->list_stack[ $depth - 2 ]['continuation_indent']
				: str_repeat( '  ', max( 0, $depth - 1 ) );
			$marker = '-';
			if ( 0 < $depth && 'OL' === $context->list_stack[ $depth - 1 ]['type'] ) {
				++$context->list_stack[ $depth - 1 ]['index'];
				$marker = (string) $context->list_stack[ $depth - 1 ]['index'] . '.';
			}

			$this->writer->append_text( $context->output, $indent . $marker . ' ', $context->at_line_start, $context->blockquote_depth, true );
			if ( 0 < $depth ) {
				$context->list_stack[ $depth - 1 ]['continuation_indent'] = str_repeat( ' ', strlen( $indent . $marker . ' ' ) );
			}
			return;
		}

		if ( 'LI' === $token_name && $is_closer ) {
			$depth = count( $context->list_stack );
			if ( 0 < $depth ) {
				$indent = $context->list_stack[ $depth - 1 ]['continuation_indent'];
				if ( null !== $indent && str_ends_with( $context->output, "\n" . $indent ) ) {
					$context->output        = substr( $context->output, 0, -strlen( $indent ) );
					$context->at_line_start = true;
				}
				$context->list_stack[ $depth - 1 ]['continuation_indent'] = null;
			}
			return;
		}

		if ( ! $token_name || ! preg_match( '/^H([1-6])$/', $token_name, $matches ) ) {
			return;
		}

		if ( $is_closer ) {
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
		} else {
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			$this->writer->append_text( $context->output, str_repeat( '#', (int) $matches[1] ) . ' ', $context->at_line_start, $context->blockquote_depth, true );
		}
	}

	/**
	 * Start a link after any Markdown block marker has been written.
	 *
	 * @param Markdown_Conversion_Context $context Current output state.
	 */
	private function begin_active_link( Markdown_Conversion_Context $context ): void {
		$index = count( $context->link_stack ) - 1;
		if ( $index < 0 || '' === $context->link_stack[ $index ]['href'] || $context->link_stack[ $index ]['open'] ) {
			return;
		}

		$context->last_link_start = strlen( $context->output );
		$this->writer->append_text( $context->output, '[', $context->at_line_start, $context->blockquote_depth, true );
		$context->link_stack[ $index ]['open'] = true;
	}

	/**
	 * End a link before a Markdown block boundary.
	 *
	 * @param Markdown_Conversion_Context $context Current output state.
	 */
	private function close_active_link( Markdown_Conversion_Context $context ): void {
		$index = count( $context->link_stack ) - 1;
		if ( $index < 0 || ! $context->link_stack[ $index ]['open'] ) {
			return;
		}

		$context->last_link_suffix_start = strlen( $context->output );
		$this->writer->append_text(
			$context->output,
			'](' . $this->writer->escape_markdown_destination( $context->link_stack[ $index ]['href'] ) . ')',
			$context->at_line_start,
			$context->blockquote_depth,
			true
		);
		$context->last_link_end                = strlen( $context->output );
		$context->link_stack[ $index ]['open'] = false;
	}

	/**
	 * Place leading spaces before pending emphasis markers.
	 *
	 * @param Markdown_Conversion_Context $context Current output state.
	 * @param string                      $text    Decoded HTML text.
	 */
	private function append_formatted_text( Markdown_Conversion_Context $context, string $text ): void {
		if ( ! empty( $context->emphasis_stack ) && preg_match( '/^\s+/u', $text, $matches ) ) {
			$this->writer->append_text( $context->output, $matches[0], $context->at_line_start, $context->blockquote_depth );
			$text = substr( $text, strlen( $matches[0] ) );
		}

		if ( '' === $text ) {
			return;
		}

		if ( $context->at_line_start ) {
			$text = (string) preg_replace_callback(
				'/^(\s*)(?:([+*-])(?=\s|$)|(\d+)([.)])(?=\s|$))/u',
				static function ( array $matches ): string {
					$marker = '' !== ( $matches[2] ?? '' ) ? $matches[2] : $matches[3] . $matches[4];
					return $matches[1] . substr( $marker, 0, -1 ) . '\\' . substr( $marker, -1 );
				},
				$text
			);
		}

		$this->flush_pending_emphasis( $context );
		$this->writer->append_text( $context->output, $text, $context->at_line_start, $context->blockquote_depth );
	}

	/**
	 * Keep whitespace outside Markdown emphasis delimiters.
	 *
	 * @param Markdown_Conversion_Context $context   Current output state.
	 * @param string                      $marker    Markdown delimiter.
	 * @param bool                        $is_closer Whether this token closes emphasis.
	 */
	private function handle_emphasis( Markdown_Conversion_Context $context, string $marker, bool $is_closer ): void {
		if ( ! $is_closer ) {
			$merge = $marker === $context->last_closed_emphasis_marker
				&& strlen( $context->output ) === $context->last_closed_emphasis_end
				&& str_ends_with( $context->output, $marker );
			if ( $merge ) {
				$context->output = substr( $context->output, 0, -strlen( $marker ) );
			}
			$context->emphasis_stack[] = array(
				'marker'  => $marker,
				'emitted' => $merge,
				'start'   => $merge ? $context->last_closed_emphasis_start : null,
			);
			return;
		}

		$opening = array_pop( $context->emphasis_stack );
		if ( ! $opening || ! $opening['emitted'] ) {
			return;
		}

		if (
			null !== $opening['start']
			&& $context->last_link_start === $opening['start'] + strlen( $marker )
			&& null !== $context->last_link_suffix_start
			&& strlen( $context->output ) === $context->last_link_end
		) {
			// A link occupying the whole emphasis can put the markers inside its label.
			$before                           = substr( $context->output, 0, $opening['start'] );
			$label                            = substr( $context->output, $context->last_link_start + 1, $context->last_link_suffix_start - $context->last_link_start - 1 );
			$suffix                           = substr( $context->output, $context->last_link_suffix_start );
			$context->output                  = $before . '[' . $marker . $label . $marker . $suffix;
			$context->last_link_start         = $opening['start'];
			$context->last_link_suffix_start += strlen( $marker );
			$context->last_link_end           = strlen( $context->output );
			return;
		}

		$trailing_space = '';
		if ( preg_match( '/[ \t]+$/', $context->output, $matches ) ) {
			$trailing_space  = $matches[0];
			$context->output = substr( $context->output, 0, -strlen( $trailing_space ) );
		}
		$this->writer->append_text( $context->output, $marker, $context->at_line_start, $context->blockquote_depth, true );
		$this->writer->append_text( $context->output, $trailing_space, $context->at_line_start, $context->blockquote_depth, true );
		$context->last_closed_emphasis_marker = $marker;
		$context->last_closed_emphasis_start  = $opening['start'];
		$context->last_closed_emphasis_end    = strlen( $context->output );
	}

	/**
	 * Emit opening markers when emphasis first contains visible content.
	 *
	 * @param Markdown_Conversion_Context $context Current output state.
	 */
	private function flush_pending_emphasis( Markdown_Conversion_Context $context ): void {
		foreach ( $context->emphasis_stack as &$emphasis ) {
			if ( $emphasis['emitted'] ) {
				continue;
			}
			$emphasis['start'] = strlen( $context->output );
			$this->writer->append_text( $context->output, $emphasis['marker'], $context->at_line_start, $context->blockquote_depth, true );
			$emphasis['emitted'] = true;
		}
		unset( $emphasis );
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
	 * @param bool  $is_header_row   Whether the row contains header cells (by reference).
	 * @param bool  $header_row_done Whether a header row has been emitted (by reference).
	 */
	private function emit_table_row( Markdown_Conversion_Context $document, array &$current_row, bool &$is_header_row, bool &$header_row_done ): void {
		if ( ! empty( $current_row ) ) {
			$this->writer->append_line(
				$document->output,
				'| ' . implode( ' | ', $current_row ) . ' |',
				$document->at_line_start,
				$document->blockquote_depth
			);

			if ( $is_header_row && ! $header_row_done ) {
				$this->writer->append_line(
					$document->output,
					'|' . str_repeat( ' --- |', count( $current_row ) ),
					$document->at_line_start,
					$document->blockquote_depth
				);
				$header_row_done = true;
			}
		}

		$current_row   = array();
		$is_header_row = false;
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
	 * @param WP_HTML_Tag_Processor|WP_HTML_Processor $processor Processor instance.
	 * @param string                                  $token_name Current token name.
	 * @return bool Whether the element expects a closing token.
	 */
	private function element_expects_closer( $processor, string $token_name ): bool {
		if ( $processor->has_self_closing_flag() ) {
			return false;
		}

		return ! in_array(
			$token_name,
			array( 'AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR' ),
			true
		);
	}

	/**
	 * Emit complete or unclosed code content from a conversion context.
	 *
	 * @param Markdown_Conversion_Context $context Conversion context.
	 */
	private function flush_code( Markdown_Conversion_Context $context ): void {
		if ( null !== $context->pre_code ) {
			$this->flush_pending_emphasis( $context );
			$content = (string) $context->pre_code;
			$fence   = $this->writer->code_delimiter( $content, 3 );

			$context->pre_code = null;
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			$this->writer->append_line( $context->output, $fence, $context->at_line_start, $context->blockquote_depth );
			$this->writer->append_text( $context->output, $content, $context->at_line_start, $context->blockquote_depth, true );
			if ( ! $context->at_line_start ) {
				$this->writer->append_newline( $context->output, $context->at_line_start, true );
			}
			$this->writer->append_line( $context->output, $fence, $context->at_line_start, $context->blockquote_depth );
			$this->writer->ensure_blank_line( $context->output, $context->at_line_start, $context->blockquote_depth );
			$context->in_pre = false;
		}

		if ( null !== $context->inline_code ) {
			$this->begin_active_link( $context );
			$this->flush_pending_emphasis( $context );
			if ( '' !== $context->inline_code || empty( $context->inline_code_parts ) ) {
				$context->inline_code_parts[] = array( $context->inline_code, $context->inline_code_link );
			}
			$rendered = '';
			foreach ( $context->inline_code_parts as $part ) {
				$span      = $this->writer->inline_code_span( (string) $part[0] );
				$rendered .= $part[1] ? '[' . $span . '](' . $this->writer->escape_markdown_destination( $part[1] ) . ')' : $span;
			}
			$context->inline_code       = null;
			$context->inline_code_parts = array();
			$context->inline_code_link  = null;
			$this->writer->append_text( $context->output, $rendered, $context->at_line_start, $context->blockquote_depth, true );
		}
	}

	/**
	 * Whether conversion is currently inside a list item.
	 *
	 * @param Markdown_Conversion_Context $context Conversion context.
	 * @return bool Whether a list item is active.
	 */
	private function has_active_list_item( Markdown_Conversion_Context $context ): bool {
		if ( empty( $context->list_stack ) ) {
			return false;
		}
		$last = $context->list_stack[ count( $context->list_stack ) - 1 ];
		return null !== $last['continuation_indent'];
	}

	/**
	 * Continue a block element within its containing Markdown list item.
	 *
	 * @param Markdown_Conversion_Context $context Conversion context.
	 */
	private function append_list_continuation( Markdown_Conversion_Context $context ): void {
		$last = $context->list_stack[ count( $context->list_stack ) - 1 ];
		$this->writer->ensure_newline( $context->output, $context->at_line_start );
		$this->writer->append_text( $context->output, $last['continuation_indent'], $context->at_line_start, $context->blockquote_depth, true );
	}
}
