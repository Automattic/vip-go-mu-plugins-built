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
	/**
	 * Append text to Markdown output.
	 *
	 * @param string $markdown            Markdown buffer (by reference).
	 * @param string $text                Text to append.
	 * @param bool   $at_line_start       Whether output is at the start of a line (by reference).
	 * @param int    $blockquote_depth    Current blockquote depth.
	 * @param bool   $preserve_whitespace Whether to preserve whitespace.
	 */
	public function append_text( string &$markdown, string $text, bool &$at_line_start, int $blockquote_depth, bool $preserve_whitespace = false ): void {
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

		if ( $at_line_start && 0 < $blockquote_depth ) {
			$markdown .= str_repeat( '> ', $blockquote_depth );
		}

		if ( $preserve_whitespace && 0 < $blockquote_depth ) {
			$prefix = str_repeat( '> ', $blockquote_depth );
			$text   = str_replace( "\n", "\n" . $prefix, $text );
			if ( str_ends_with( $text, "\n" . $prefix ) ) {
				$text = substr( $text, 0, -strlen( $prefix ) );
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
	 * @param int    $blockquote_depth Current blockquote depth.
	 */
	public function append_line( string &$markdown, string $line, bool &$at_line_start, int $blockquote_depth ): void {
		$this->ensure_newline( $markdown, $at_line_start );
		$this->append_text( $markdown, $line, $at_line_start, $blockquote_depth, true );
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
	 * @param int    $blockquote_depth Current blockquote depth.
	 */
	public function ensure_blank_line( string &$markdown, bool &$at_line_start, int $blockquote_depth = 0 ): void {
		$markdown = rtrim( $markdown, " \t" );
		if ( $blockquote_depth > 0 ) {
			$separator = "\n" . rtrim( str_repeat( '> ', $blockquote_depth ) ) . "\n";
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
			array( '\\', '[', ']', '*', '_', '`' ),
			array( '\\\\', '\\[', '\\]', '\\*', '\\_', '\\`' ),
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
