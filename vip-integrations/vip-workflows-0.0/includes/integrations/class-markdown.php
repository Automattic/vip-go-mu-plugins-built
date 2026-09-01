<?php
/**
 * Markdown helpers for AI-generated text.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

/**
 * Convert the markdown subset our prompts emit into plain text.
 *
 * AI summaries are markdown because the admin UI renders them as formatted text
 * (see src/admin/components/markdown.js). Some consumers of the same string are
 * not that UI and must not carry markup: a source's `excerpt` is shown wherever
 * plain text is expected, and a sideloaded image's attachment `description`
 * becomes a record in the user's media library, where `**bold**` is simply wrong.
 *
 * So the rich form is stored once and the plain form is derived for those
 * consumers, rather than flattening the summary for everyone.
 *
 * This mirrors what src/admin/components/markdown.js renders, so the two stay in
 * step: anything the renderer understands, this reduces to its text. The bias is
 * to keep content and drop only markup — losing a sentence is worse than leaving
 * a stray character.
 */
class Markdown {

	/**
	 * Strip markdown and collapse the result to a single line.
	 *
	 * For one-line fields — a search result's excerpt, a label, a tooltip — where
	 * the line structure `to_plain_text()` preserves would be wrong rather than
	 * merely unused. Bullet markers go too: a list flattened onto one line reads
	 * as stray hyphens, not as a list.
	 *
	 * @param  string $markdown Markdown source.
	 * @return string Single-line plain text.
	 */
	public static function to_single_line( string $markdown ): string {
		$text = self::to_plain_text( $markdown );

		// Markers first, while they are still anchored to line starts.
		$text = (string) preg_replace( '/^\s*-\s+/m', '', $text );

		return trim( (string) preg_replace( '/\s+/', ' ', $text ) );
	}

	/**
	 * Strip the supported markdown subset, keeping the text and its structure.
	 *
	 * Headings become plain lines and bullets keep their hyphen, because both
	 * read correctly as text; only the markup characters go. Paragraph breaks are
	 * preserved, since the consumers are display surfaces rather than single-line
	 * fields.
	 *
	 * @param  string $markdown Markdown source.
	 * @return string Plain text.
	 */
	public static function to_plain_text( string $markdown ): string {
		if ( '' === trim( $markdown ) ) {
			return '';
		}

		$text = str_replace( array( "\r\n", "\r" ), "\n", $markdown );

		/*
		 * Images first, and before links: `![alt](src)` contains a `[...](...)`
		 * that the link rule would otherwise consume, leaving a bare `!`. The alt
		 * text is kept when there is one — it is the only description of the image
		 * that survives into plain text — and the whole construct goes when there
		 * is not, since a bare URL is not information.
		 */
		$text = (string) preg_replace( '/!\[([^\]]+)\]\([^)]*\)/', '$1', $text );
		$text = (string) preg_replace( '/!\[\s*\]\([^)]*\)/', '', $text );

		// Links keep their label and drop the target.
		$text = (string) preg_replace( '/\[([^\]]+)\]\([^)]*\)/', '$1', $text );
		$text = (string) preg_replace( '/<((?:https?:\/\/|mailto:)[^>\s]+)>/', '$1', $text );

		// Fenced code: keep the code, drop the fences and any language tag.
		$text = (string) preg_replace( '/^\s{0,3}(?:```|~~~).*$/m', '', $text );

		$lines = array();
		foreach ( explode( "\n", $text ) as $line ) {
			// Horizontal rules carry no text at all.
			if ( 1 === preg_match( '/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/', $line ) ) {
				continue;
			}

			// Block-quote markers, and table cell pipes, are structure rather
			// than content; the text between them is kept.
			$line = (string) preg_replace( '/^\s{0,3}>\s?/', '', $line );

			// A table divider row (|---|---|) is pure structure.
			if ( 1 === preg_match( '/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/', $line ) ) {
				continue;
			}

			if ( 1 === preg_match( '/^\s*\|.*\|\s*$/', $line ) ) {
				$cells = array_map( 'trim', explode( '|', trim( trim( $line ), '|' ) ) );
				$line  = implode( ' | ', $cells );
			}

			// Leading `#`s, and the whitespace after them, on heading lines only.
			$line = (string) preg_replace( '/^\s{0,3}#{1,6}\s+/', '', $line );

			// Normalise the bullet marker rather than removing it: a list that
			// loses its markers reads as one run-on sentence, which is half of
			// what the original bug looked like.
			// /u: the bullet character is multibyte, and a byte-wise class would
			// match one of its three bytes and leave the rest as mojibake.
			$line = (string) preg_replace( '/^(\s*)[*+•]\s+/u', '$1- ', $line );

			$lines[] = $line;
		}

		$text = implode( "\n", $lines );

		/*
		 * Emphasis. Bold first so `**x**` does not leave a stray pair of
		 * asterisks behind, and both require a non-space next to the delimiter so
		 * that prose about the `*` character survives. Underscore emphasis is
		 * handled only when the delimiters hug a word boundary — snake_case
		 * identifiers appear in editorial copy about code and must not be eaten.
		 */
		$text = (string) preg_replace( '/\*\*(?=\S)(.+?)(?<=\S)\*\*/s', '$1', $text );
		$text = (string) preg_replace( '/(?<![\w*])\*(?=\S)([^*\n]+?)(?<=\S)\*(?![\w*])/', '$1', $text );
		$text = (string) preg_replace( '/(?<![\w_])__(?=\S)(.+?)(?<=\S)__(?![\w_])/s', '$1', $text );
		$text = (string) preg_replace( '/(?<![\w_])_(?=\S)([^_\n]+?)(?<=\S)_(?![\w_])/', '$1', $text );

		// Strikethrough: the text was written, so it is kept.
		$text = (string) preg_replace( '/~~(?=\S)(.+?)(?<=\S)~~/s', '$1', $text );

		// Inline code: the backticks are markup, the contents are the text.
		$text = (string) preg_replace( '/`([^`\n]+)`/', '$1', $text );

		// Collapse the runs of blank lines that stripping can leave behind.
		$text = (string) preg_replace( "/\n{3,}/", "\n\n", $text );

		return trim( $text );
	}
}
