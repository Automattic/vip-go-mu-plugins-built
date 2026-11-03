<?php

/**
 * Markdown output and whitespace formatting.
 *
 * @package Content_For_Agents
 */

declare( strict_types=1 );

namespace Content_For_Agents;

/**
 * Applies line, quote, and whitespace rules to caller-owned output state.
 */
final class Markdown_Output_Writer {
	/** Render a text container after its visible children are complete. */
	public function block_boundary( Markdown_Conversion_Context $context, bool $is_closer, bool $separate_on_open = false ): void {
		if ( ! $is_closer ) {
			$inline = ! $separate_on_open && ! $context->at_line_start;
			$this->open_frame( $context, 'block' );
			$context->block_frames[ array_key_last( $context->block_frames ) ]['inline'] = $inline;
			return;
		}
		$frame = $context->block_frames[ array_key_last( $context->block_frames ) ] ?? array();
		$body  = $this->close_frame( $context, 'block' );
		if ( '' !== trim( $body ) ) {
			if ( '' !== trim( $context->output ) ) {
				$this->mark_item_block( $context );
			}
			if ( $frame['inline'] ?? false ) {
				$context->output       .= $body;
				$context->at_line_start = false;
				$this->ensure_blank_line( $context->output, $context->at_line_start );
			} else {
				$this->append_block( $context, $body );
			}
		}
	}

	/** Render a quote only after its child blocks are complete. */
	public function quote_boundary( Markdown_Conversion_Context $context, bool $is_closer ): void {
		if ( ! $is_closer ) {
			$this->open_frame( $context, 'quote' );
			return;
		}
		$trailing_blank = str_ends_with( $context->output, "\n\n" );
		$body           = $this->close_frame( $context, 'quote' );
		if ( '' === $body ) {
			return;
		}
		if ( '' !== trim( $context->output ) ) {
			$this->mark_item_block( $context );
		}
		$lines = explode( "\n", $body );
		$quote = implode( "\n", array_map( static fn( string $line ): string => '' === $line ? '>' : '> ' . $line, $lines ) );
		if ( $trailing_blank && ! $this->has_active_list_item( $context ) ) {
			$quote .= "\n>";
		}
		$this->append_block( $context, $quote );
	}

	/** Render a list after its item bodies have been collected. */
	public function list_boundary( Markdown_Conversion_Context $context, string $type, bool $is_closer, ?int $start = null ): void {
		if ( ! $is_closer ) {
			$this->open_frame( $context, 'list' );
			$frame_index                                    = array_key_last( $context->block_frames );
			$context->block_frames[ $frame_index ]['type']  = $type;
			$context->block_frames[ $frame_index ]['index'] = null !== $start ? $start - 1 : 0;
			return;
		}
		$body = $this->close_frame( $context, 'list' );
		if ( '' !== $body ) {
			if ( '' !== trim( $context->output ) ) {
				$this->mark_item_block( $context );
			}
			$this->append_block( $context, $body );
		}
	}

	/** Prefix every line of an item after its child blocks are complete. */
	public function list_item_boundary( Markdown_Conversion_Context $context, bool $is_closer ): void {
		if ( ! $is_closer ) {
			$this->open_frame( $context, 'item' );
			return;
		}
		$frame       = $context->block_frames[ array_key_last( $context->block_frames ) ] ?? array();
		$body        = $this->close_frame( $context, 'item' );
		$frame_index = array_key_last( $context->block_frames );
		$marker      = '-';
		if ( null !== $frame_index && 'list' === $context->block_frames[ $frame_index ]['kind'] && 'OL' === $context->block_frames[ $frame_index ]['type'] ) {
			++$context->block_frames[ $frame_index ]['index'];
			$marker = (string) $context->block_frames[ $frame_index ]['index'] . '.';
		}
		$indent = str_repeat( ' ', strlen( $marker ) + 1 );
		$lines  = explode( "\n", $body );
		$item   = $marker . ' ' . array_shift( $lines );
		foreach ( $lines as $line ) {
			$item .= "\n" . ( '' === $line ? '' : $indent . $line );
		}
		if ( null !== $frame_index && 'list' === $context->block_frames[ $frame_index ]['kind'] ) {
			$this->save_list_content( $context, $context->block_frames[ $frame_index ]['parts'] );
			$context->block_frames[ $frame_index ]['parts'][] = array(
				'kind' => 'item',
				'body' => $item,
			);
			$context->block_frames[ $frame_index ]['loose']   = ( $context->block_frames[ $frame_index ]['loose'] ?? false ) || ( $frame['structural_break'] ?? false );
		} else {
			$this->append_block( $context, $body );
		}
	}

	/** Mark a block boundary inside the nearest item as structural. */
	public function mark_item_block( Markdown_Conversion_Context $context ): void {
		for ( $index = count( $context->block_frames ) - 1; $index >= 0; --$index ) {
			if ( 'item' === $context->block_frames[ $index ]['kind'] ) {
				$context->block_frames[ $index ]['structural_break'] = true;
				return;
			}
		}
	}

	/** Whether a quote owns the current output stream. */
	public function in_quote( Markdown_Conversion_Context $context ): bool {
		foreach ( $context->block_frames as $frame ) {
			if ( 'quote' === $frame['kind'] ) {
				return true;
			}
		}
		return false;
	}

	/** Complete containers left open by a source fragment. */
	public function finish_open_blocks( Markdown_Conversion_Context $context ): void {
		while ( ! empty( $context->block_frames ) ) {
			$frame = $context->block_frames[ array_key_last( $context->block_frames ) ];
			switch ( $frame['kind'] ) {
				case 'item':
					$this->list_item_boundary( $context, true );
					break;
				case 'list':
					$this->list_boundary( $context, '', true );
					break;
				case 'quote':
					$this->quote_boundary( $context, true );
					break;
				case 'block':
					$this->block_boundary( $context, true );
					break;
			}
		}
	}

	/** Whether the current list has an open item. */
	public function has_active_list_item( Markdown_Conversion_Context $context ): bool {
		for ( $index = count( $context->block_frames ) - 1; $index >= 0; --$index ) {
			if ( 'item' === $context->block_frames[ $index ]['kind'] ) {
				return true;
			}
			if ( 'list' === $context->block_frames[ $index ]['kind'] ) {
				return false;
			}
		}
		return false;
	}

	/** Save the parent stream while an HTML block owns its children. */
	private function open_frame( Markdown_Conversion_Context $context, string $kind ): void {
		$context->block_frames[] = array(
			'kind'             => $kind,
			'output'           => $context->output,
			'at_line_start'    => $context->at_line_start,
			'parts'            => array(),
			'loose'            => false,
			'structural_break' => false,
		);
		$context->output         = '';
		$context->at_line_start  = true;
	}

	/** Restore the parent stream and return the completed child body. */
	private function close_frame( Markdown_Conversion_Context $context, string $kind ): string {
		$frame = $context->block_frames[ array_key_last( $context->block_frames ) ] ?? null;
		if ( null === $frame || $kind !== $frame['kind'] ) {
			return '';
		}
		$body = trim( $context->output, "\n" );
		if ( 'list' === $kind ) {
			$this->save_list_content( $context, $frame['parts'] );
			$body     = '';
			$previous = null;
			foreach ( $frame['parts'] as $part ) {
				if ( null !== $previous ) {
					$body .= 'item' === $previous && 'item' === $part['kind'] && ! $frame['loose'] ? "\n" : "\n\n";
				}
				$body    .= $part['body'];
				$previous = $part['kind'];
			}
		}
		array_pop( $context->block_frames );
		$context->output        = $frame['output'];
		$context->at_line_start = $frame['at_line_start'];
		return $body;
	}

	/**
	 * Keep visible content between list items in source order.
	 *
	 * @param array<int, array{kind: string, body: string}> $parts Ordered list output segments.
	 */
	private function save_list_content( Markdown_Conversion_Context $context, array &$parts ): void {
		$content = trim( $context->output, "\n" );
		if ( '' !== trim( $content ) ) {
			$parts[] = array(
				'kind' => 'content',
				'body' => $content,
			);
		}
		$context->output        = '';
		$context->at_line_start = true;
	}

	/** Join completed block output to its parent stream. */
	private function append_block( Markdown_Conversion_Context $context, string $body ): void {
		$this->ensure_blank_line( $context->output, $context->at_line_start );
		$context->output       .= $body;
		$context->at_line_start = false;
		$this->ensure_blank_line( $context->output, $context->at_line_start );
	}

	/**
	 * Append text to Markdown output.
	 *
	 * @param string $markdown            Markdown buffer (by reference).
	 * @param string $text                Text to append.
	 * @param bool   $at_line_start       Whether output is at the start of a line (by reference).
	 * @param bool   $preserve_whitespace Whether to preserve whitespace.
	 */
	public function append_text( string &$markdown, string $text, bool &$at_line_start, bool $preserve_whitespace = false ): void {
		if ( '' === $text ) {
			return;
		}

		$text = str_replace( array( "\r\n", "\r" ), "\n", $text );

		if ( ! $preserve_whitespace ) {
			$text = preg_replace( '/\s+/u', ' ', $text );
			if ( $at_line_start ) {
				$text = ltrim( (string) $text );
			}
			if ( '' === $text ) {
				return;
			}
		}

		$markdown     .= $text;
		$at_line_start = str_ends_with( $text, "\n" );
	}

	/**
	 * Append a newline.
	 *
	 * @param string $markdown            Markdown buffer (by reference).
	 * @param bool   $at_line_start       Whether output is at the start of a line (by reference).
	 * @param bool   $preserve_whitespace Whether code whitespace must be preserved.
	 */
	public function append_newline( string &$markdown, bool &$at_line_start, bool $preserve_whitespace = false ): void {
		if ( ! $preserve_whitespace ) {
			$markdown = rtrim( $markdown, " \t" );
			if ( str_ends_with( $markdown, "\n\n" ) ) {
				$at_line_start = true;
				return;
			}
		}
		$markdown     .= "\n";
		$at_line_start = true;
	}

	/**
	 * Append a full line.
	 *
	 * @param string $markdown         Markdown buffer (by reference).
	 * @param string $line             Line content.
	 * @param bool   $at_line_start    Whether output is at the start of a line (by reference).
	 */
	public function append_line( string &$markdown, string $line, bool &$at_line_start ): void {
		$this->ensure_newline( $markdown, $at_line_start );
		$this->append_text( $markdown, $line, $at_line_start, true );
		$this->append_newline( $markdown, $at_line_start );
	}

	/**
	 * Ensure output starts on a new line.
	 *
	 * @param string $markdown      Markdown buffer (by reference).
	 * @param bool   $at_line_start Whether output is at the start of a line (by reference).
	 */
	public function ensure_newline( string &$markdown, bool &$at_line_start ): void {
		if ( $at_line_start ) {
			return;
		}

		$this->append_newline( $markdown, $at_line_start );
	}

	/**
	 * Ensure output ends with a blank line.
	 *
	 * @param string $markdown         Markdown buffer (by reference).
	 * @param bool   $at_line_start    Whether output is at the start of a line (by reference).
	 */
	public function ensure_blank_line( string &$markdown, bool &$at_line_start ): void {
		$markdown      = rtrim( $markdown, " \t" );
		$markdown      = rtrim( $markdown, "\n" );
		$markdown     .= "\n\n";
		$at_line_start = true;
	}

	/**
	 * Format one run of inline code with a safe delimiter.
	 *
	 * @param string $content Code text.
	 * @return string Markdown code span.
	 */
	public function inline_code_span( string $content ): string {
		$content       = str_replace( array( "\r\n", "\r", "\n" ), ' ', $content );
		$fence         = $this->code_delimiter( $content, 1 );
		$needs_padding = str_starts_with( $content, '`' ) || str_ends_with( $content, '`' )
			|| ( str_starts_with( $content, ' ' ) && str_ends_with( $content, ' ' ) && '' !== trim( $content ) );
		$space         = $needs_padding ? ' ' : '';
		return $fence . $space . $content . $space . $fence;
	}

	/**
	 * Escape plain HTML attribute text used as a Markdown link label.
	 *
	 * @param string $text Visible label text.
	 * @return string Markdown-safe label.
	 */
	public function escape_markdown_link_text( string $text ): string {
		$text = (string) preg_replace( '/\s+/u', ' ', $text );
		return str_replace(
			array( '\\', '[', ']', '*', '_', '~', '`' ),
			array( '\\\\', '\\[', '\\]', '\\*', '\\_', '\\~', '\\`' ),
			$text
		);
	}

	/**
	 * Choose a code delimiter longer than any backtick run in decoded content.
	 *
	 * @param string $content Decoded code content.
	 * @param int    $minimum Minimum delimiter length.
	 * @return string Backtick delimiter.
	 */
	public function code_delimiter( string $content, int $minimum ): string {
		$longest_run = 0;
		if ( str_contains( $content, '`' ) ) {
			preg_match_all( '/`+/', $content, $runs );
			foreach ( $runs[0] as $run ) {
				$longest_run = max( $longest_run, strlen( $run ) );
			}
		}
		return str_repeat( '`', max( $minimum, $longest_run + 1 ) );
	}

	/** Format an optional HTML title attribute for a Markdown image. */
	public function format_markdown_title( string $title ): string {
		$title = trim( (string) preg_replace( '/\s+/u', ' ', $title ) );
		if ( '' === $title ) {
			return '';
		}
		return ' "' . str_replace( array( '\\', '"' ), array( '\\\\', '\\"' ), $title ) . '"';
	}

	/**
	 * Escape characters that would terminate a Markdown link destination.
	 *
	 * @param string $url URL from an HTML attribute.
	 * @return string Markdown-safe destination.
	 */
	public function escape_markdown_destination( string $url ): string {
		$url = (string) preg_replace_callback(
			'/[\s<>]/u',
			static function ( array $matches ): string {
				return rawurlencode( $matches[0] );
			},
			$url
		);
		return str_replace( array( '\\', '(', ')' ), array( '\\\\', '\\(', '\\)' ), $url );
	}
}
