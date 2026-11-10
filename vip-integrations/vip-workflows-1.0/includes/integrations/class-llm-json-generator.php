<?php
/**
 * LLM JSON Generator.
 *
 * The single terminal step for every AI call that expects structured JSON back.
 *
 * `AiClient::prompt( … )->generateText()` is sugar for the result-returning
 * terminal call followed by `toText()`, so it discards the finish reason — the one
 * signal that separates "the model was cut off at the token ceiling" from "the
 * model returned something that is not the requested JSON". Those two need
 * different fixes, and a caller that only sees the broken text cannot tell them
 * apart. Three call sites reached for the convenient method and reported
 * truncation as a parse failure precisely because it was there to reach for.
 *
 * The finish-reason reading itself now lives in `LlmTextGenerator`, which free-text
 * callers need too; this is the JSON layer on top of it. So a caller still cannot
 * forget the check — it sits on the only path from a configured builder to a
 * parsed payload — and there is exactly one implementation of it rather than one
 * per output shape.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use WP_Error;

/**
 * Llm Json Generator.
 */
class LlmJsonGenerator {

	/**
	 * Run a configured prompt builder and decode its JSON response.
	 *
	 * Order matters. `LlmTextGenerator` reads the provider's finish reason before
	 * returning any text, because a response the model abandoned mid-structure
	 * still reaches the decoder as broken JSON: parse first and every low ceiling
	 * in the codebase presents as a malformed model.
	 * `LlmJsonParser::has_unclosed_container()` deliberately reports shape without
	 * claiming a cause and defers to callers that can read a finish reason — that
	 * caller is the text generator this delegates to.
	 *
	 * Provider exceptions are not caught here, or there. Each caller already maps a
	 * refused request onto its own error identity (a REST status, a per-rule result
	 * row), and flattening those into one code would lose information this cannot
	 * reconstruct.
	 *
	 * @since 0.0.1
	 *
	 * @param object   $builder    Configured AI Client prompt builder, ready for its terminal
	 *                             call. Typed loosely because the builder class is internal to
	 *                             the php-ai-client package and is not part of its public
	 *                             surface.
	 * @param string   $context    Label for error messages (e.g. "draft generation", "seed analysis").
	 * @param int|null $max_tokens The ceiling the builder was configured with, so a cutoff can name
	 *                             the number it hit. Null when the caller does not know it.
	 * @return array|WP_Error Decoded associative array, or WP_Error on truncation, an
	 *                        empty result, or a response that will not decode.
	 * @throws \Throwable Whatever the provider throws when it refuses the request.
	 */
	public static function generate( object $builder, string $context, ?int $max_tokens = null ): array|WP_Error {
		$text = LlmTextGenerator::generate( $builder, $context, $max_tokens );
		if ( is_wp_error( $text ) ) {
			return $text;
		}

		return LlmJsonParser::parse( $text, $context );
	}
}
