<?php
/**
 * LLM JSON Parser.
 *
 * Robustly extracts JSON from LLM responses that may include
 * markdown code fences, surrounding prose, or other formatting
 * artifacts. Used by any assistant that expects structured JSON
 * from an LLM.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use WP_Error;

/**
 * Llm Json Parser.
 */
class LlmJsonParser {

	/**
	 * Number of leading characters quoted back in a malformed-response error.
	 *
	 * @since 0.0.1
	 * @var int
	 */
	private const ERROR_EXCERPT_LENGTH = 120;

	/**
	 * Parse a JSON object from raw LLM output.
	 *
	 * Tries three strategies in order:
	 * 1. Direct JSON decode
	 * 2. Extract JSON from markdown code fences
	 * 3. Extract first { ... } block
	 *
	 * On failure the error distinguishes two conditions, because they call for
	 * different fixes: a response that opens a JSON container and never closes it
	 * (`incomplete_response` — the generation stopped mid-structure, which a token
	 * ceiling produces) versus one that closes but will not decode
	 * (`parse_error` — the model emitted something that is not the requested JSON).
	 * Both carry the decoder's own message and the response length so the two are
	 * separable from a log line alone.
	 *
	 * @since 0.0.1
	 *
	 * @param string $raw     Raw LLM response text.
	 * @param string $context Label for error messages (e.g. "mentor response", "seed analysis").
	 * @return array|WP_Error Parsed associative array, or WP_Error on failure.
	 */
	public static function parse( string $raw, string $context = 'LLM response' ): array|WP_Error {
		$text = trim( $raw );

		$decoded    = json_decode( $text, true );
		$json_error = json_last_error_msg();
		if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
			return $decoded;
		}

		if ( preg_match( '/```(?:json)?\s*(\{[\s\S]*?\})\s*```/', $text, $matches ) ) {
			$decoded    = json_decode( $matches[1], true );
			$json_error = json_last_error_msg();
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return $decoded;
			}
		}

		$start = strpos( $text, '{' );
		$end   = strrpos( $text, '}' );
		if ( false !== $start && false !== $end && $start < $end ) {
			$decoded    = json_decode( substr( $text, $start, $end - $start + 1 ), true );
			$json_error = json_last_error_msg();
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return $decoded;
			}
		}

		$length = mb_strlen( $text );

		if ( self::has_unclosed_container( $text ) ) {
			return new WP_Error(
				'incomplete_response',
				sprintf(
					/* translators: 1: what was being parsed, e.g. "mentor response". 2: response length in characters. 3: JSON decoder error message. */
					__( 'Incomplete %1$s: the response opens a JSON structure but never closes it, ending after %2$d characters (%3$s).', 'vip-workflows' ),
					$context,
					$length,
					$json_error
				),
				array(
					'json_error' => $json_error,
					'length'     => $length,
				)
			);
		}

		return new WP_Error(
			'parse_error',
			sprintf(
				/* translators: 1: what was being parsed, e.g. "mentor response". 2: response length in characters. 3: JSON decoder error message. 4: the first characters of the response. */
				__( 'Failed to parse %1$s: %2$d characters could not be decoded as JSON (%3$s). Response began: %4$s', 'vip-workflows' ),
				$context,
				$length,
				$json_error,
				mb_substr( $text, 0, self::ERROR_EXCERPT_LENGTH )
			),
			array(
				'json_error' => $json_error,
				'length'     => $length,
			)
		);
	}

	/**
	 * Determine whether the text opens a JSON container that is never closed.
	 *
	 * Scans from the first `{` or `[`, tracking nesting depth while ignoring
	 * braces and brackets that appear inside string literals. Returns as soon as
	 * the outermost container closes: a balanced structure is complete, whatever
	 * else surrounds it, and its failure to decode is a malformation rather than a
	 * cut-off. Text with no container at all is likewise not incomplete — it is
	 * simply not JSON.
	 *
	 * This observes the shape of the response only. It reports that the structure
	 * is unterminated, not why the model stopped; callers that can read a finish
	 * reason from the provider should report that instead.
	 *
	 * @since 0.0.1
	 *
	 * @param string $text Trimmed response text.
	 * @return bool True when a container is left open (including an unterminated string).
	 */
	private static function has_unclosed_container( string $text ): bool {
		$first_brace   = strpos( $text, '{' );
		$first_bracket = strpos( $text, '[' );

		if ( false === $first_brace && false === $first_bracket ) {
			return false;
		}
		if ( false === $first_brace ) {
			$start = $first_bracket;
		} elseif ( false === $first_bracket ) {
			$start = $first_brace;
		} else {
			$start = min( $first_brace, $first_bracket );
		}

		$length    = strlen( $text );
		$depth     = 0;
		$in_string = false;
		$escaped   = false;

		for ( $i = $start; $i < $length; $i++ ) {
			$char = $text[ $i ];

			if ( $escaped ) {
				$escaped = false;
				continue;
			}

			if ( $in_string ) {
				if ( '\\' === $char ) {
					$escaped = true;
				} elseif ( '"' === $char ) {
					$in_string = false;
				}
				continue;
			}

			if ( '"' === $char ) {
				$in_string = true;
			} elseif ( '{' === $char || '[' === $char ) {
				++$depth;
			} elseif ( '}' === $char || ']' === $char ) {
				--$depth;
				if ( $depth <= 0 ) {
					return false;
				}
			}
		}

		return $in_string || $depth > 0;
	}
}
