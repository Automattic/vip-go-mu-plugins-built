<?php

/**
 * HTML-to-Markdown converter.
 *
 * This is a local copy of the converter developed in the WordPress/ai
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
 * This is intentionally small and conservative: it focuses on producing a
 * readable Markdown representation of typical WordPress post content without
 * introducing external parsing dependencies. Uses WordPress core's HTML API
 * (WP_HTML_Processor, with fallback to WP_HTML_Tag_Processor).
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
	 * Converts HTML to Markdown.
	 *
	 * @param string $html HTML to convert.
	 * @return string Markdown output.
	 */
	public function convert( string $html ): string {
		$processor = $this->create_processor( $html );
		if ( ! $processor ) {
			return trim( wp_strip_all_tags( $html ) );
		}

		$markdown = $this->convert_with_processor( $processor );

		if (
			$processor instanceof WP_HTML_Processor
			&& WP_HTML_Processor::ERROR_UNSUPPORTED === $processor->get_last_error()
			&& class_exists( WP_HTML_Tag_Processor::class )
		) {
			$markdown = $this->convert_with_processor( new WP_HTML_Tag_Processor( $html ) );
		}

		return trim( $this->cleanup( $markdown ) );
	}

	/**
	 * Creates the best available HTML processor for conversion.
	 *
	 * Uses the HTML Processor in fragment mode when available, and falls back
	 * to the Tag Processor for broader tag tolerance.
	 *
	 * @param string $html HTML string.
	 * @return WP_HTML_Tag_Processor|WP_HTML_Processor|null Processor instance.
	 */
	private function create_processor( string $html ) {
		$processor = null;

		if ( class_exists( WP_HTML_Processor::class ) ) {
			$processor = WP_HTML_Processor::create_fragment( $html );

			if ( ! $processor ) {
				$processor = new WP_HTML_Processor( $html );
			}
		} elseif ( class_exists( WP_HTML_Tag_Processor::class ) ) {
			$processor = new WP_HTML_Tag_Processor( $html );
		}

		return $processor;
	}

	/**
	 * Converts HTML into Markdown using a provided HTML API processor.
	 *
	 * @param WP_HTML_Tag_Processor|WP_HTML_Processor $processor Processor instance.
	 * @return string Markdown output.
	 */
	private function convert_with_processor( $processor ): string {
		$markdown = '';

		$at_line_start    = true;
		$blockquote_depth = 0;
		$in_pre           = false;

		$link_stack   = array();
		$list_stack   = array();
		$hidden_stack = array();

		// Table state.
		$in_table        = false;
		$current_row     = array();
		$is_header_row   = false;
		$header_row_done = false;

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
				&& 'true' === strtolower( trim( (string) $processor->get_attribute( 'aria-hidden' ) ) )
			) {
				if ( $processor instanceof WP_HTML_Processor ) {
					$this->skip_processor_element( $processor );
				} elseif ( $this->element_expects_closer( $processor, $token_name ) ) {
					$hidden_stack[] = $token_name;
				}
				continue;
			}

			if ( '#text' === $token_name ) {
				$text = (string) $processor->get_modifiable_text();

				// If we're in a table cell, collect text for the cell.
				if ( $in_table && ! empty( $current_row ) ) {
					$cell_index                  = count( $current_row ) - 1;
					$current_row[ $cell_index ] .= trim( (string) preg_replace( '/\s+/', ' ', $text ) );
					continue;
				}

				$this->append_text( $markdown, $text, $at_line_start, $blockquote_depth, $in_pre );
				continue;
			}

			// Skip script/style entirely.
			if ( 'SCRIPT' === $token_name || 'STYLE' === $token_name ) {
				continue;
			}

			$is_closer = $processor->is_tag_closer();

			if ( 'BR' === $token_name ) {
				$this->append_newline( $markdown, $at_line_start );
				continue;
			}

			if ( 'HR' === $token_name && ! $is_closer ) {
				$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				$this->append_line( $markdown, '---', $at_line_start, $blockquote_depth );
				$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				continue;
			}

			if ( ( 'P' === $token_name || 'DIV' === $token_name ) && $is_closer ) {
				if ( ! $in_pre ) {
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				}
				continue;
			}

			if ( 'BLOCKQUOTE' === $token_name ) {
				if ( $is_closer ) {
					$blockquote_depth = max( 0, $blockquote_depth - 1 );
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				} else {
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
					++$blockquote_depth;
				}
				continue;
			}

			if ( 'PRE' === $token_name ) {
				if ( $is_closer ) {
					if ( ! $at_line_start ) {
						$this->append_newline( $markdown, $at_line_start );
					}
					$this->append_line( $markdown, '```', $at_line_start, $blockquote_depth );
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
					$in_pre = false;
				} else {
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
					$this->append_line( $markdown, '```', $at_line_start, $blockquote_depth );
					$in_pre = true;
				}
				continue;
			}

			if ( 'CODE' === $token_name && ! $in_pre ) {
				$this->append_text( $markdown, '`', $at_line_start, $blockquote_depth, true );
				$at_line_start = false;
				continue;
			}

			if ( 'STRONG' === $token_name || 'B' === $token_name ) {
				$this->append_text( $markdown, '**', $at_line_start, $blockquote_depth, true );
				$at_line_start = false;
				continue;
			}

			if ( 'EM' === $token_name || 'I' === $token_name ) {
				$this->append_text( $markdown, '*', $at_line_start, $blockquote_depth, true );
				$at_line_start = false;
				continue;
			}

			if ( 'A' === $token_name ) {
				if ( $is_closer ) {
					$href = array_pop( $link_stack );
					if ( $href ) {
						$markdown .= '](' . $href . ')';
					} else {
						$markdown .= ']';
					}
				} else {
					$link_stack[] = (string) $processor->get_attribute( 'href' );
					$this->append_text( $markdown, '[', $at_line_start, $blockquote_depth, true );
				}
				$at_line_start = false;
				continue;
			}

			if ( 'IMG' === $token_name && ! $is_closer ) {
				$src = (string) $processor->get_attribute( 'src' );
				if ( '' === $src ) {
					continue;
				}

				$alt = (string) $processor->get_attribute( 'alt' );
				$this->append_text( $markdown, '![' . $alt . '](' . $src . ')', $at_line_start, $blockquote_depth, true );
				continue;
			}

			// Figure element (contains image + optional caption).
			if ( 'FIGURE' === $token_name ) {
				$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				continue;
			}

			// Figure caption — render as italic text on new line.
			if ( 'FIGCAPTION' === $token_name ) {
				if ( ! $is_closer ) {
					$this->ensure_newline( $markdown, $at_line_start );
					$this->append_text( $markdown, '*', $at_line_start, $blockquote_depth, true );
					$at_line_start = false;
				} else {
					$markdown .= '*';
				}
				continue;
			}

			// Citation in blockquotes — prefix with em dash.
			if ( 'CITE' === $token_name ) {
				if ( ! $is_closer ) {
					if ( 0 < $blockquote_depth ) {
						$this->ensure_newline( $markdown, $at_line_start );
					}
					$this->append_text( $markdown, '— ', $at_line_start, $blockquote_depth, true );
					$at_line_start = false;
				}
				continue;
			}

			if ( 'UL' === $token_name || 'OL' === $token_name ) {
				if ( $is_closer ) {
					array_pop( $list_stack );
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				} else {
					$list_stack[] = array(
						'type'  => $token_name,
						'index' => 0,
					);
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				}
				continue;
			}

			if ( 'LI' === $token_name && ! $is_closer ) {
				$this->ensure_newline( $markdown, $at_line_start );

				$depth  = count( $list_stack );
				$indent = str_repeat( '  ', max( 0, $depth - 1 ) );

				$marker = '-';
				if ( $depth > 0 && 'OL' === $list_stack[ $depth - 1 ]['type'] ) {
					++$list_stack[ $depth - 1 ]['index'];
					$marker = (string) $list_stack[ $depth - 1 ]['index'] . '.';
				}

				$this->append_text(
					$markdown,
					$indent . $marker . ' ',
					$at_line_start,
					$blockquote_depth,
					true
				);

				continue;
			}

			// Table handling.
			if ( 'TABLE' === $token_name ) {
				if ( $is_closer ) {
					$in_table        = false;
					$header_row_done = false;
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				} else {
					$in_table = true;
					$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				}
				continue;
			}

			if ( 'THEAD' === $token_name || 'TBODY' === $token_name || 'TFOOT' === $token_name ) {
				// Skip structural elements; headers are detected via TH tags.
				continue;
			}

			if ( 'TR' === $token_name ) {
				if ( $is_closer ) {
					if ( ! empty( $current_row ) ) {
						$row_line = '| ' . implode( ' | ', $current_row ) . ' |';
						$this->append_line( $markdown, $row_line, $at_line_start, $blockquote_depth );

						// Add separator after header row.
						if ( $is_header_row && ! $header_row_done ) {
							$separator = '|' . str_repeat( ' --- |', count( $current_row ) );
							$this->append_line( $markdown, $separator, $at_line_start, $blockquote_depth );
							$header_row_done = true;
						}
					}
					$current_row   = array();
					$is_header_row = false;
				}
				continue;
			}

			if ( 'TH' === $token_name ) {
				if ( ! $is_closer ) {
					$current_row[] = '';
					$is_header_row = true;
				}
				continue;
			}

			if ( 'TD' === $token_name ) {
				if ( ! $is_closer ) {
					$current_row[] = '';
				}
				continue;
			}

			if ( ! $token_name || ! preg_match( '/^H([1-6])$/', $token_name, $matches ) ) {
				continue;
			}

			if ( $is_closer ) {
				$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
			} else {
				$level = (int) $matches[1];
				$this->ensure_blank_line( $markdown, $at_line_start, $blockquote_depth );
				$this->append_text(
					$markdown,
					str_repeat( '#', $level ) . ' ',
					$at_line_start,
					$blockquote_depth,
					true
				);
			}
			continue;
		}

		return $markdown;
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
	 * Appends plain text to the Markdown output.
	 *
	 * @param string $markdown            Markdown buffer (by reference).
	 * @param string $text                Text to append.
	 * @param bool   $at_line_start       Whether output is at the start of a line (by reference).
	 * @param int    $blockquote_depth    Current blockquote depth.
	 * @param bool   $preserve_whitespace Whether to preserve whitespace.
	 */
	private function append_text( string &$markdown, string $text, bool &$at_line_start, int $blockquote_depth, bool $preserve_whitespace = false ): void {
		if ( '' === $text ) {
			return;
		}

		$text = str_replace( array( "\r\n", "\r" ), "\n", $text );

		if ( ! $preserve_whitespace ) {
			$text = preg_replace( '/\s+/u', ' ', $text );
			if ( 0 < $blockquote_depth && $at_line_start && '' === trim( $text ) ) {
				return;
			}
		}

		if ( $at_line_start && 0 < $blockquote_depth ) {
			$markdown .= str_repeat( '> ', $blockquote_depth );
		}

		if ( $preserve_whitespace && 0 < $blockquote_depth ) {
			// Prefix each code line, but leave a final newline for the next token.
			$prefix = str_repeat( '> ', $blockquote_depth );
			$text   = str_replace( "\n", "\n" . $prefix, $text );
			if ( str_ends_with( $text, "\n" . $prefix ) ) {
				$text = substr( $text, 0, -strlen( $prefix ) );
			}
		}

		$markdown     .= $text;
		$at_line_start = false;
		if ( 0 < $blockquote_depth && str_ends_with( $text, "\n" ) ) {
			$at_line_start = true;
		}
	}

	/**
	 * Appends a newline.
	 *
	 * @param string $markdown      Markdown buffer (by reference).
	 * @param bool   $at_line_start Whether output is at the start of a line (by reference).
	 */
	private function append_newline( string &$markdown, bool &$at_line_start ): void {
		$markdown     .= "\n";
		$at_line_start = true;
	}

	/**
	 * Appends a full line and ensures the buffer ends at a new line.
	 *
	 * @param string $markdown         Markdown buffer (by reference).
	 * @param string $line             Line content.
	 * @param bool   $at_line_start    Whether output is at the start of a line (by reference).
	 * @param int    $blockquote_depth Current blockquote depth.
	 */
	private function append_line( string &$markdown, string $line, bool &$at_line_start, int $blockquote_depth ): void {
		$this->ensure_newline( $markdown, $at_line_start );
		$this->append_text( $markdown, $line, $at_line_start, $blockquote_depth, true );
		$this->append_newline( $markdown, $at_line_start );
	}

	/**
	 * Ensures output starts on a new line.
	 *
	 * @param string $markdown      Markdown buffer (by reference).
	 * @param bool   $at_line_start Whether output is at the start of a line (by reference).
	 */
	private function ensure_newline( string &$markdown, bool &$at_line_start ): void {
		if ( $at_line_start ) {
			return;
		}

		$this->append_newline( $markdown, $at_line_start );
	}

	/**
	 * Ensures output ends with a blank line.
	 *
	 * @param string $markdown      Markdown buffer (by reference).
	 * @param bool   $at_line_start Whether output is at the start of a line (by reference).
	 * @param int    $blockquote_depth Current blockquote depth.
	 */
	private function ensure_blank_line( string &$markdown, bool &$at_line_start, int $blockquote_depth = 0 ): void {
		if ( $blockquote_depth > 0 ) {
			$separator = "\n" . str_repeat( '> ', $blockquote_depth ) . "\n";
			if ( ! str_ends_with( $markdown, $separator ) ) {
				$markdown = rtrim( $markdown, "\n" ) . $separator;
			}
			$at_line_start = true;
			return;
		}

		$markdown      = rtrim( $markdown, "\n" );
		$markdown     .= "\n\n";
		$at_line_start = true;
	}

	/**
	 * Cleans up excessive whitespace and newlines.
	 *
	 * @param string $markdown Markdown buffer.
	 * @return string Cleaned buffer.
	 */
	private function cleanup( string $markdown ): string {
		// Remove trailing whitespace from lines.
		$markdown = preg_replace( "/[ \t]+\n/", "\n", $markdown );
		// Remove leading whitespace from lines (except in code blocks).
		$markdown = preg_replace( "/\n[ \t]+(?!\s*```)/", "\n", (string) $markdown );
		// Collapse multiple blank lines.
		$markdown = preg_replace( "/\n{3,}/", "\n\n", (string) $markdown );
		return (string) $markdown;
	}
}
