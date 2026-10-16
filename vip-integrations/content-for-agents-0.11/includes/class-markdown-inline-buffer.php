<?php

/**
 * Deferred renderer for inline HTML content.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

use WP_HTML_Tag_Processor;

/** Render text and format offsets without constructing format nodes. */
final class Markdown_Inline_Buffer {
	private string $text = '';

	/** @var array<int, array<string, mixed>> */
	private array $events = array();
	/** @var array<int, array{start: int, end: int, punctuation: bool, raw_depth: int, break: bool}> */
	private array $visible = array();
	/** @var array<int, int> Open event indices, from outermost to innermost. */
	private array $open            = array();
	private int $raw_wrapper_depth = 0;

	private Markdown_Output_Writer $writer;

	public function __construct() {
		$this->writer = new Markdown_Output_Writer();
	}

	/** Add one decoded text token from the caller's HTML processor. */
	public function append_text( string $text ): void {
		$chunk = (string) preg_replace( '/\s+/u', ' ', $text );
		$this->record_visible_text( $chunk );
		$this->text .= $chunk;
	}

	/** Add one inline tag from the caller's HTML processor. */
	public function append_tag( WP_HTML_Tag_Processor $processor, string $tag, bool $is_closer, bool $literal_break = false ): bool {
		$type = match ( $tag ) {
				'B', 'STRONG'       => 'strong',
				'I', 'EM'           => 'em',
				'S', 'DEL', 'STRIKE' => 'del',
				'A'                => 'link',
				'CODE'             => 'code',
				'BR'               => 'break',
				'IMG'              => 'image',
				'Q', 'SUB', 'SUP'    => strtolower( $tag ),
				default            => null,
		};
		if ( null === $type ) {
			return false;
		}
		$attributes = array( 'tag' => $tag );
		if ( 'break' === $type ) {
			$attributes['literal'] = $literal_break;
		}
		if ( ! $is_closer && 'link' === $type ) {
			$attributes['href'] = trim( $this->attribute( $processor, 'href' ) );
		} elseif ( ! $is_closer && 'image' === $type ) {
			$attributes['src']   = $this->attribute( $processor, 'src' );
			$attributes['alt']   = $this->attribute( $processor, 'alt' );
			$attributes['title'] = $this->attribute( $processor, 'title' );
		}
		if ( $is_closer && ! in_array( $type, array( 'break', 'image' ), true ) ) {
			$match = null;
			for ( $position = count( $this->open ) - 1; $position >= 0; --$position ) {
				if ( $tag === $this->events[ $this->open[ $position ] ]['tag'] ) {
					$match = $position;
					break;
				}
			}
			if ( null === $match ) {
				return true;
			}
			// Reopen overlapping ranges after the matching close. HTML markers keep the split effects unambiguous in Markdown.
			$matching_index = $this->open[ $match ];
			if ( in_array( $this->events[ $matching_index ]['type'], array( 'strong', 'em', 'del' ), true ) && $match < count( $this->open ) - 1 ) {
				$this->events[ $matching_index ]['force_html'] = true;
			}
			$overlap_indices = array_slice( $this->open, $match + 1 );
			foreach ( $overlap_indices as $index ) {
				if ( in_array( $this->events[ $index ]['type'], array( 'strong', 'em', 'del' ), true ) ) {
					$this->events[ $index ]['force_html'] = true;
				}
			}
			$overlapping = array_map( fn( int $index ): array => $this->events[ $index ], $overlap_indices );
			foreach ( array_reverse( $overlapping ) as $event ) {
				$this->add_event(
					$event['type'],
					false,
					array(
						'tag'             => $event['tag'],
						'forced_boundary' => true,
					)
				);
			}
			$this->add_event( $type, false, $attributes );
			foreach ( $overlapping as $event ) {
				$this->add_event(
					$event['type'],
					true,
					array_merge(
						array_intersect_key( $event, array_flip( array( 'href', 'src', 'alt', 'title', 'tag' ) ) ),
						array(
							'forced_boundary' => true,
							'force_html'      => in_array( $event['type'], array( 'strong', 'em', 'del' ), true ),
						)
					)
				);
			}
			return true;
		}
		$this->add_event( $type, true, $attributes );
		return true;
	}

	/** Figure captions use the same format boundaries as inline emphasis. */
	public function append_caption_boundary( bool $opening ): void {
		$this->add_event( 'caption', $opening, array() );
	}

	/** Add a token or a boundary continued across a block flush. */
	private function add_event( string $type, bool $opening, array $attributes ): void {
		$index          = count( $this->events );
		$this->events[] = array_merge(
			array(
				'position'          => strlen( $this->text ),
				'opening'           => $opening,
				'type'              => $type,
				'skip'              => false,
				'raw_wrapper_depth' => $this->raw_wrapper_depth,
				'item_position'     => count( $this->visible ),
				'start_item'        => count( $this->visible ),
			),
			$attributes
		);
		if ( 'break' === $type || ( 'image' === $type && '' !== ( $attributes['src'] ?? '' ) ) ) {
			$this->record_visible_item( strlen( $this->text ), strlen( $this->text ), false, 'break' === $type );
		} elseif ( ! in_array( $type, array( 'break', 'image' ), true ) ) {
			if ( $opening ) {
				$this->open[] = $index;
				if ( in_array( $type, array( 'q', 'sub', 'sup' ), true ) ) {
					++$this->raw_wrapper_depth;
				}
			} elseif ( ! empty( $this->open ) ) {
				if ( in_array( $type, array( 'q', 'sub', 'sup' ), true ) ) {
					--$this->raw_wrapper_depth;
				}
				$start                          = array_pop( $this->open );
				$this->events[ $start ]['mate'] = $index;
				$this->events[ $index ]['mate'] = $start;
				$first_item                     = $this->events[ $start ]['start_item'];
				$last_item                      = count( $this->visible ) - 1;
				if ( $first_item <= $last_item ) {
					$this->events[ $start ]['first_item']             = $first_item;
					$this->events[ $start ]['last_item']              = $last_item;
					$this->events[ $start ]['first_position']         = $this->visible[ $first_item ]['start'];
					$this->events[ $start ]['last_position']          = $this->visible[ $last_item ]['end'];
					$this->events[ $start ]['first_text_punctuation'] = $this->visible[ $first_item ]['punctuation'];
					$this->events[ $start ]['first_raw_wrapper']      = $this->visible[ $first_item ]['raw_depth'] > $this->events[ $start ]['raw_wrapper_depth'];
				}
			}
		}
	}

	/** Render collected content and carry open inline formats to the next block. */
	public function drain( bool $at_line_start ): string {
		$carry = array();
		foreach ( $this->open as $index ) {
			$carry[] = $this->events[ $index ];
		}
		foreach ( array_reverse( $carry ) as $event ) {
			$this->add_event( $event['type'], false, array( 'tag' => $event['tag'] ?? $event['type'] ) );
		}
		$this->prepare_events();
		$markdown                = $this->render( $at_line_start );
		$this->text              = '';
		$this->events            = array();
		$this->visible           = array();
		$this->open              = array();
		$this->raw_wrapper_depth = 0;
		foreach ( $carry as $event ) {
			$this->add_event( $event['type'], true, array_intersect_key( $event, array_flip( array( 'href', 'src', 'alt', 'title', 'tag', 'force_html' ) ) ) );
		}
		return '' === trim( $markdown ) ? '' : $markdown;
	}

	private function attribute( WP_HTML_Tag_Processor $processor, string $name ): string {
		$value = $processor->get_attribute( $name );
		return is_string( $value ) ? $value : '';
	}

	/** Record range boundaries while the HTML processor walks visible content. */
	private function record_visible_text( string $chunk ): void {
		if ( ! preg_match( '/\S/u', $chunk, $first, PREG_OFFSET_CAPTURE ) ) {
			return;
		}
		preg_match( '/(\S)\s*$/u', $chunk, $last, PREG_OFFSET_CAPTURE );
		$this->record_visible_item( strlen( $this->text ) + $first[0][1], strlen( $this->text ) + $last[1][1] + strlen( $last[1][0] ), 1 === preg_match( '/^\p{P}/u', $first[0][0] ) );
	}

	private function record_visible_item( int $start, int $end, bool $text_punctuation, bool $is_break = false ): void {
		$this->visible[] = array(
			'start'       => $start,
			'end'         => $end,
			'punctuation' => $text_punctuation,
			'raw_depth'   => $this->raw_wrapper_depth,
			'break'       => $is_break,
		);
	}

	/** Resolve markers from boundaries collected during the token walk. */
	private function prepare_events(): void {
		// A break at a format edge needs HTML syntax: Markdown markers cannot flank it reliably.
		$edge_breaks = array();
		foreach ( $this->events as $index => $event ) {
			if ( ! $event['opening'] || ! isset( $event['mate'] ) ) {
				continue;
			}
			$closing = $event['mate'];
			if ( isset( $event['first_item'] ) ) {
				foreach ( array( $event['first_item'], $event['last_item'] ) as $item ) {
					if ( $this->visible[ $item ]['break'] ) {
						$edge_breaks[ $item ] = true;
					}
				}
			}
			if ( in_array( $event['type'], array( 'strong', 'em', 'del', 'caption', 'q', 'sub', 'sup' ), true ) ) {
				if ( ! isset( $event['first_item'] ) ) {
					$this->events[ $index ]['skip']   = true;
					$this->events[ $closing ]['skip'] = true;
					continue;
				}
				$this->events[ $index ]['position']   = $event['first_position'];
				$this->events[ $closing ]['position'] = $event['last_position'];
				if ( in_array( $event['type'], array( 'strong', 'em', 'del', 'caption' ), true ) ) {
					$marker = match ( $event['type'] ) {
						'strong' => '**',
						'em'     => '*',
						'caption' => '_',
						default  => '~~',
					};
					$tag = $event['type'];
					if ( $event['force_html'] ?? false || $this->visible[ $event['first_item'] ]['break'] || $this->visible[ $event['last_item'] ]['break'] || ( 'caption' !== $event['type'] && ( $event['first_text_punctuation'] || '~' === substr( $this->text, $event['first_position'], 1 ) ) && ! $event['first_raw_wrapper'] ) ) {
						$this->events[ $index ]['marker']   = '<' . $tag . '>';
						$this->events[ $closing ]['marker'] = '</' . $tag . '>';
					} else {
						$this->events[ $index ]['marker']   = $marker;
						$this->events[ $closing ]['marker'] = $marker;
					}
				} else {
					$this->events[ $index ]['marker']   = '<' . $event['type'] . '>';
					$this->events[ $closing ]['marker'] = '</' . $event['type'] . '>';
				}
			} elseif ( 'link' === $event['type'] ) {
				if ( '' === trim( $event['href'] ) || ! isset( $event['first_item'] ) ) {
					$this->events[ $index ]['skip']   = true;
					$this->events[ $closing ]['skip'] = true;
				} else {
					$this->events[ $index ]['position'] = $event['first_position'];
					$this->events[ $index ]['marker']   = '[';
					$this->events[ $closing ]['marker'] = '](' . $this->writer->escape_markdown_destination( $event['href'] ) . ')';
				}
			}
		}
		foreach ( $this->events as $index => $event ) {
			if ( 'break' === $event['type'] && isset( $edge_breaks[ $event['item_position'] ] ) ) {
				$this->events[ $index ]['literal'] = true;
			}
		}
	}

	/** Walk resolved event positions, emitting each text segment once. */
	private function render( bool $at_line_start ): string {
		$events  = $this->events;
		$indices = array_keys( array_filter( $events, static fn( array $event ): bool => ! $event['skip'] ) );
		usort(
			$indices,
			static function ( int $left, int $right ) use ( $events ): int {
				$position_order = $events[ $left ]['position'] <=> $events[ $right ]['position'];
				if ( 0 !== $position_order ) {
					return $position_order;
				}
				$a = $events[ $left ];
				$b = $events[ $right ];
				if ( ( $a['forced_boundary'] ?? false ) || ( $b['forced_boundary'] ?? false ) ) {
					return $left <=> $right;
				}
				if ( ! isset( $a['mate'], $b['mate'] ) ) {
					return $left <=> $right;
				}
				$a_range = $a['opening'] ? $a : $events[ $a['mate'] ];
				$b_range = $b['opening'] ? $b : $events[ $b['mate'] ];
				if ( ! isset( $a_range['first_item'], $b_range['first_item'] ) ) {
					return $left <=> $right;
				}
				if ( $a['opening'] !== $b['opening'] ) {
					if ( in_array( $a['type'], array( 'strong', 'em', 'del', 'caption' ), true ) && $a['type'] === $b['type'] && ( $a['marker'] ?? null ) === ( $b['marker'] ?? null ) ) {
						return $a['opening'] ? -1 : 1;
					}
					return $a['opening'] ? 1 : -1;
				}
				$edge_order = $a['opening']
					? $b_range['last_item'] <=> $a_range['last_item']
					: $b_range['first_item'] <=> $a_range['first_item'];
				if ( 0 !== $edge_order ) {
					return $edge_order;
				}
				if ( ( 'link' === $a['type'] ) !== ( 'link' === $b['type'] ) ) {
					return ( 'link' === $a['type'] ? -1 : 1 ) * ( $a['opening'] ? 1 : -1 );
				}
				return $left <=> $right;
			}
		);
		$output        = '';
		$offset        = 0;
		$code          = false;
		$code_text     = '';
		$code_link     = null;
		$code_had_part = false;
		$wrappers      = array();
		$effect_depths = array();
		foreach ( $indices as $index ) {
			$event = $events[ $index ];
			if ( $event['position'] > $offset ) {
				$chunk = substr( $this->text, $offset, $event['position'] - $offset );
				if ( $code ) {
					$code_text .= $chunk;
				} else {
					$this->append_text_chunk( $output, $at_line_start, $wrappers, $chunk );
				}
				$offset = $event['position'];
			}
			if ( $event['skip'] ) {
				continue;
			}
			if ( $code && ! in_array( $event['type'], array( 'code', 'link', 'break' ), true ) ) {
				continue;
			}
			if ( 'break' === $event['type'] ) {
				if ( $code ) {
					$code_text .= "\n";
				} else {
					$this->open_pending( $output, $wrappers );
					$output = rtrim( $output, " \t" );
					if ( $event['literal'] || count( $this->visible ) - 1 === $event['item_position'] ) {
						$this->append_visible( $output, $at_line_start, '<br>' );
					} else {
						$output       .= "\\\n";
						$at_line_start = true;
					}
				}
				continue;
			}
			if ( 'image' === $event['type'] ) {
				if ( '' !== $event['src'] ) {
					$this->open_pending( $output, $wrappers );
					$this->append_visible( $output, $at_line_start, '![' . $this->writer->escape_markdown_link_text( $event['alt'] ) . '](' . $this->writer->escape_markdown_destination( $event['src'] ) . $this->writer->format_markdown_title( $event['title'] ) . ')' );
				}
				continue;
			}
			if ( 'code' === $event['type'] ) {
				// Code delimiters depend on the completed text; links inside code split it into separate spans.
				if ( $event['opening'] ) {
					$code          = true;
					$code_had_part = false;
				} else {
					if ( '' !== $code_text || ! $code_had_part ) {
						$this->open_pending( $output, $wrappers );
						$this->append_visible( $output, $at_line_start, $this->render_code( $code_text ) );
					}
					$code_text = '';
					$code      = false;
				}
				continue;
			}
			if ( $code && 'link' === $event['type'] ) {
				if ( $event['opening'] ) {
					if ( '' !== $code_text ) {
						$this->open_pending( $output, $wrappers );
						$this->append_visible( $output, $at_line_start, $this->render_code( $code_text ) );
						$code_had_part = true;
					}
					$code_text = '';
					$code_link = $event['href'];
				} else {
					$span = $this->render_code( $code_text );
					$this->open_pending( $output, $wrappers );
					$this->append_visible( $output, $at_line_start, '[' . $span . '](' . $this->writer->escape_markdown_destination( (string) $code_link ) . ')' );
					$code_had_part = true;
					$code_text     = '';
					$code_link     = null;
				}
				continue;
			}
			$is_effect = in_array( $event['type'], array( 'strong', 'em', 'del', 'caption' ), true );
			// A caption already applies emphasis, so an inner <em> adds no new effect.
			$effect = 'caption' === $event['type'] ? 'em' : $event['type'];
			if ( $event['opening'] ) {
				if ( $is_effect ) {
					$depth                    = $effect_depths[ $effect ] ?? 0;
					$effect_depths[ $effect ] = $depth + 1;
					if ( 0 !== $depth ) {
						continue;
					}
				}
				$wrappers[] = array(
					'open'    => $event['marker'],
					'close'   => $events[ $event['mate'] ]['marker'],
					'visible' => false,
				);
			} else {
				if ( $is_effect ) {
					$depth                    = ( $effect_depths[ $effect ] ?? 1 ) - 1;
					$effect_depths[ $effect ] = $depth;
					if ( 0 !== $depth ) {
						continue;
					}
				}
				$wrapper = array_pop( $wrappers );
				if ( $wrapper['visible'] ) {
					$output .= $wrapper['close'];
				}
			}
		}
		$this->append_text_chunk( $output, $at_line_start, $wrappers, substr( $this->text, $offset ) );
		return $output;
	}

	/** Delay wrappers until there is content for them to surround. */
	private function open_pending( string &$output, array &$wrappers ): void {
		foreach ( $wrappers as &$wrapper ) {
			if ( ! $wrapper['visible'] ) {
				$output            .= $wrapper['open'];
				$wrapper['visible'] = true;
			}
		}
		unset( $wrapper );
	}

	private function append_text_chunk( string &$output, bool &$at_line_start, array &$wrappers, string $chunk ): void {
		if ( '' === $chunk ) {
			return;
		}
		$leading = strspn( $chunk, " \t\n" );
		if ( 0 < $leading ) {
			$space   = $this->escape_text( substr( $chunk, 0, $leading ), $at_line_start );
			$output .= $space;
			if ( '' !== $space ) {
				$at_line_start = false;
			}
		}
		$rest = substr( $chunk, $leading );
		if ( '' !== $rest ) {
			$escaped = $this->escape_text( $rest, $at_line_start );
			$this->open_pending( $output, $wrappers );
			$output       .= $escaped;
			$at_line_start = false;
		}
	}

	/** Generated visible content occupies the current source line. */
	private function append_visible( string &$output, bool &$at_line_start, string $markdown ): void {
		$output       .= $markdown;
		$at_line_start = false;
	}

	/** A code span cannot represent an HTML break. */
	private function render_code( string $text ): string {
		if ( ! str_contains( $text, "\n" ) ) {
			return $this->writer->inline_code_span( $text );
		}
		return '<code>' . str_replace( "\n", '<br>', htmlspecialchars( $text, ENT_NOQUOTES | ENT_SUBSTITUTE, 'UTF-8' ) ) . '</code>';
	}

	private function escape_text( string $text, bool $at_line_start ): string {
		$text = str_replace(
			array( '\\', '`', '*', '_', '~', '[', ']', '<', '>', '#' ),
			array( '\\\\', '\\`', '\\*', '\\_', '\\~', '\\[', '\\]', '\\<', '\\>', '\\#' ),
			$text
		);
		if ( $at_line_start ) {
			$text = ltrim( $text );
			$text = (string) preg_replace_callback(
				'/^(\s*)(-{3,})(?=\s|$)/u',
				static fn( array $matches ): string => $matches[1] . '\\' . $matches[2],
				$text
			);
			$text = (string) preg_replace_callback(
				'/^(\s*)(?:([+*-])(?=\s|$)|(\d+)([.)])(?=\s|$))/u',
				static function ( array $matches ): string {
					$marker = '' !== ( $matches[2] ?? '' ) ? $matches[2] : $matches[3] . $matches[4];
					return $matches[1] . substr( $marker, 0, -1 ) . '\\' . substr( $marker, -1 );
				},
				$text
			);
		}
		return $text;
	}
}
