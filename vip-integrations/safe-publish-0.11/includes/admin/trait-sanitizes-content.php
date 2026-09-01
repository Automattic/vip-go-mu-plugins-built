<?php
/**
 * Content sanitization trait
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Provides optional kses sanitization with modification detection.
 *
 * Used by import paths. The default tracks the caller's `unfiltered_html`
 * capability — callers that already hold that capability (administrators on
 * single-site) skip kses to preserve content fidelity; other callers run
 * through wp_kses, and any modification is reported as a WP_Error.
 * Both behaviors are overridable via the safe_publish_import_kses filter.
 */
trait Sanitizes_Content {

	public const FIELD_CONTENT = 'content';
	public const FIELD_EXCERPT = 'excerpt';

	/**
	 * Sanitizes a field value and fails if sanitization modifies it.
	 *
	 * Callers that already hold `unfiltered_html` skip kses to preserve
	 * content fidelity (matching WordPress core importer behavior). Other
	 * callers run the value through wp_kses and receive a WP_Error when the
	 * sanitizer changes anything. Both branches are overridable via the
	 * safe_publish_import_kses filter.
	 *
	 * @param string $value The HTML value to sanitize.
	 * @param string $field FIELD_CONTENT or FIELD_EXCERPT constant.
	 * @return string|WP_Error Sanitized value, or error if modified.
	 */
	private function sanitize_field(
		string $value,
		string $field
	): string|WP_Error {
		if ( self::FIELD_CONTENT !== $field
			&& self::FIELD_EXCERPT !== $field
		) {
			return new WP_Error(
				'safe_publish_invalid_field',
				sprintf(
					'Invalid sanitization field key: %s',
					$field
				)
			);
		}

		/**
		 * Filters whether to apply kses sanitization during import.
		 *
		 * Defaults to running kses for any caller that does not hold the
		 * `unfiltered_html` capability, matching WordPress core's behavior
		 * for non-trusted authors. Return true to force kses, false to skip.
		 *
		 * @param bool   $enabled Whether to apply kses. Defaults to
		 *                        `! current_user_can( 'unfiltered_html' )`.
		 * @param string $field   Field being sanitized: 'content' or 'excerpt'.
		 */
		$enabled = apply_filters(
			'safe_publish_import_kses',
			! current_user_can( 'unfiltered_html' ),
			$field
		);

		if ( ! $enabled ) {
			return $value;
		}

		/**
		 * Filters the allowed HTML tags and attributes for import sanitization.
		 *
		 * Only applied when safe_publish_import_kses returns true.
		 *
		 * @param array  $allowed Allowed HTML elements and attributes.
		 * @param string $field   Field being sanitized: 'content' or 'excerpt'.
		 */
		$allowed = apply_filters(
			'safe_publish_import_kses_allowed_html',
			wp_kses_allowed_html( 'post' ),
			$field
		);

		$sanitized = wp_kses( $value, $allowed );

		if ( ! $this->is_content_modified( $value, $sanitized ) ) {
			return $sanitized;
		}

		$stripped = $this->identify_stripped_html(
			$value,
			$sanitized
		);

		return $this->build_sanitization_error(
			$field,
			$stripped
		);
	}

	/**
	 * Builds a sanitization error with a translated field label.
	 *
	 * @param string $field    Field key: 'content' or 'excerpt'.
	 * @param string $stripped Description of stripped elements.
	 * @return WP_Error The error with a translated message.
	 */
	private function build_sanitization_error(
		string $field,
		string $stripped
	): WP_Error {
		$label = self::FIELD_CONTENT === $field
			? __( 'post content', 'safe-publish' )
			: __( 'excerpt', 'safe-publish' );

		return new WP_Error(
			'safe_publish_content_sanitized',
			sprintf(
				/* translators: 1: field name, 2: stripped elements */
				__(
					'Import aborted: %1$s was modified by sanitization. Stripped: %2$s.',
					'safe-publish'
				),
				$label,
				$stripped
			)
		);
	}

	/**
	 * Checks if sanitization meaningfully modified content.
	 *
	 * Normalizes whitespace and CSS formatting before comparing to avoid false
	 * positives from cosmetic changes like semicolon spacing in style
	 * attributes.
	 *
	 * @param string $before Content before sanitization.
	 * @param string $after  Content after sanitization.
	 * @return bool True if content was meaningfully modified.
	 */
	private function is_content_modified(
		string $before,
		string $after
	): bool {
		$normalize = static function ( string $s ): string {
			$s = preg_replace( '/\s+/', ' ', trim( $s ) );
			return str_replace( '; ', ';', $s );
		};

		return $normalize( $before ) !== $normalize( $after );
	}

	/**
	 * Identifies HTML tokens that were stripped by sanitization.
	 *
	 * Output is not escaped; rendering layers should handle escaping.
	 *
	 * @param string $before Content before sanitization.
	 * @param string $after  Content after sanitization.
	 * @return string Comma-separated list of stripped HTML tokens.
	 */
	private function identify_stripped_html(
		string $before,
		string $after
	): string {
		$before_tokens = preg_split(
			'/(<[^>]+>)/',
			$before,
			-1,
			PREG_SPLIT_DELIM_CAPTURE
		);

		$after_tokens = preg_split(
			'/(<[^>]+>)/',
			$after,
			-1,
			PREG_SPLIT_DELIM_CAPTURE
		);

		$removed = array_diff( $before_tokens, $after_tokens );

		$stripped = array();

		foreach ( $removed as $token ) {
			$token = trim( $token );

			// Skip empty tokens, closing tags, and HTML comments.
			if ( '' === $token
				|| str_starts_with( $token, '</' )
				|| str_starts_with( $token, '<!--' )
			) {
				continue;
			}

			// Only include HTML tags, not text content.
			if ( ! str_starts_with( $token, '<' ) ) {
				continue;
			}

			$stripped[] = $token;
		}

		$stripped = array_unique( $stripped );

		if ( array() !== $stripped ) {
			return implode( ', ', $stripped );
		}

		return $this->first_difference_snippet( $before, $after );
	}

	/**
	 * Returns a snippet showing the first point of difference.
	 *
	 * Used as a fallback when no tag-level tokens were identified as stripped
	 * (e.g. attribute value changes within a surviving tag).
	 *
	 * @param string $before Content before sanitization.
	 * @param string $after  Content after sanitization.
	 * @return string Snippet showing what changed.
	 */
	private function first_difference_snippet(
		string $before,
		string $after
	): string {
		$max_len = min( strlen( $before ), strlen( $after ) );
		$pos     = 0;

		while ( $pos < $max_len
			&& $before[ $pos ] === $after[ $pos ]
		) {
			++$pos;
		}

		$start   = max( 0, $pos - 20 );
		$excerpt = substr( $before, $start, 60 );

		return sprintf(
			/* translators: %s: content snippet around the modification */
			__(
				'modification near: ...%s...',
				'safe-publish'
			),
			$excerpt
		);
	}
}
