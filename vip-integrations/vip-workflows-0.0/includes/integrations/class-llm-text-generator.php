<?php
/**
 * LLM Text Generator.
 *
 * The single terminal step for every AI call that expects free text back, and
 * the one place in the repo that calls `generateTextResult()`.
 *
 * `AiClient::prompt( … )->generateText()` is sugar for
 * `generateTextResult()->toText()`, so it discards the finish reason — and
 * `toText()` walks only the content channel, ignoring model thought. Put those
 * two facts together and a reply the model never got as far as writing surfaces
 * as the library's own `No text content found in first candidate`, which tells
 * the reader neither what happened nor what to do about it.
 *
 * That is not a hypothetical. Thinking models bill their reasoning against the
 * same `max_tokens` ceiling as the reply, and the ceiling is not disclosed to the
 * model, so a budget sized against the expected answer can be spent entirely on
 * reasoning. The candidate then comes back carrying a single thought part, no
 * content part, and a `length` finish reason. The finish reason is the only thing
 * that separates that from a model which finished and simply said nothing.
 *
 * So this owns the terminal step rather than wrapping the whole request. Callers
 * configure their own builder — model, ceiling, system instruction — and hand it
 * over ready to fire; this reads the candidates, names the condition, and returns
 * text or a WP_Error. `LlmJsonGenerator` is layered on top for callers that want
 * the text parsed as JSON, so the finish-reason check has one implementation and
 * sits on the only path from a configured builder to usable output.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Integrations;

use VIPWorkflows\AI\Credentials;
use WP_Error;

/**
 * Llm Text Generator.
 */
class LlmTextGenerator {

	/**
	 * The smallest token ceiling any caller may configure.
	 *
	 * A thinking model's reasoning is billed against the same `max_tokens` as its
	 * reply, and the model is never told what the cap is, so a ceiling sized
	 * against the expected answer alone can be spent entirely on reasoning — which
	 * is the cutoff this class exists to report. That makes the reasoning cost a
	 * floor under every ceiling in the repo, independent of how little the caller
	 * expects back.
	 *
	 * Measured against claude-sonnet-5 rather than estimated: reasoning ran
	 * ~3,900-4,000 tokens across two sampled agents and did not scale with the size
	 * of the reply, with whole runs totalling 4.4-5.2k. 6,000 clears the measured
	 * reasoning by ~1.5x and still leaves roughly 2,000 tokens for an answer, which
	 * is why it is also the ceiling the shortest-replying stage agent was given. A
	 * caller whose reply is genuinely large adds its own budget on top; a caller
	 * whose reply is a line or two sits here.
	 *
	 * Raising a ceiling does not raise spend. It is a cap, not a reservation:
	 * measured usage stayed at 4.4-5.2k whatever the ceiling above it was.
	 *
	 * `LlmTextGeneratorCeilingTest` asserts no caller in the repo sits below this.
	 *
	 * @since 0.0.1
	 *
	 * @var int
	 */
	public const THINKING_FLOOR = 6000;

	/**
	 * Published maximum output tokens, keyed by model id.
	 *
	 * A ceiling above what the model accepts is not truncated, it is *rejected* —
	 * the provider answers the whole request with an HTTP 400 rather than returning
	 * a short reply. That is a worse failure than the cutoff this class reports,
	 * because there is no candidate to read a finish reason from and the error text
	 * comes from the vendor rather than from here. `bounded_max_tokens()` exists to
	 * keep a configured ceiling under this number.
	 *
	 * The AI Client cannot supply these. `ModelMetadata` carries only `id`, `name`,
	 * `supportedCapabilities` and `supportedOptions` — there is no output-limit
	 * field anywhere in the package, and `maxTokens` appears only as the request
	 * value a caller supplies. What metadata does expose cannot be trusted to fill
	 * the gap either: the providers build one hardcoded option list and share it
	 * across every model they enumerate, so a `maxTokens` entry in
	 * `supportedOptions` means "this model accepts the parameter", never "up to N",
	 * and carries no numeric bound at all. Hence a hand-maintained table.
	 *
	 * Deliberately partial, and partial in the safe direction. An id that is absent
	 * is returned unclamped, so the cost of a missing entry is the pre-existing
	 * behaviour while the cost of a wrong-low entry is a budget cut for no reason.
	 * So this lists only published figures, and only where they matter:
	 *
	 *   - Models capping below the largest ceiling in the repo, which are the ones
	 *     a clamp can actually rescue. Every one of them sits below THINKING_FLOOR
	 *     too, so they cannot serve any caller here — reporting says as much.
	 *   - The two models the supported set is written against, whose caps are large
	 *     enough that they never clamp. `gpt-4o` is listed because the margin is the
	 *     reason this exists: the PDF path asks for THINKING_FLOOR + 10000 = 16,000
	 *     against a 16,384 limit, and clears it by 384 tokens.
	 *
	 * Models absent from this table are not unsupported, only unclamped. Adding one
	 * means looking up the vendor's published figure — the suite asserts the two
	 * verified entries, so a value invented here does not pass review quietly.
	 *
	 * @since 0.0.1
	 *
	 * @var array<string, int>
	 */
	public const MODEL_OUTPUT_CAPS = array(
		// Verified end to end; see docs/reference/ai-supported-models.md.
		'claude-sonnet-5'           => 128000,
		'gpt-4o'                    => 16384,

		// Below the largest ceiling here, so a request from this repo is refused
		// outright unless it is clamped.
		'gpt-4o-mini'               => 16384,
		'gpt-4'                     => 8192,
		'gpt-4-turbo'               => 4096,
		'gpt-3.5-turbo'             => 4096,
		'claude-3-haiku-20240307'   => 4096,
		'gemini-1.5-pro'            => 8192,
		'gemini-1.5-flash'          => 8192,
	);

	/**
	 * Diagnostics already emitted this request, keyed by message.
	 *
	 * A single ideation run calls this once per generation, so one misconfigured
	 * ceiling would otherwise report itself in dozens of identical copies. Mirrors
	 * the de-duplication in `VIPWorkflows\AI\AiInference`.
	 *
	 * @var array<string, true>
	 */
	private static array $reported = array();

	/**
	 * Clamp a requested token ceiling to what the resolved model actually allows.
	 *
	 * Callers size their ceilings against the work in front of them plus the
	 * reasoning cost underneath it (see `THINKING_FLOOR`); neither of those knows
	 * what the administrator has selected in settings. This is the one place that
	 * does, so it is where a ceiling the model would refuse gets brought back into
	 * range.
	 *
	 * It cannot be done inside `generate()`, which is the other candidate: the
	 * builder is handed over already configured, and `PromptBuilder` keeps its
	 * `ModelConfig` protected with no accessor for the ceiling or the model. That is
	 * why `generate()` takes `$max_tokens` as a separate argument at all. So this is
	 * applied at the call site, wrapped around the argument to `usingMaxTokens()` —
	 * which also covers the callers that never reach `generate()` and call
	 * `generateText()` on the builder themselves.
	 *
	 * Clamping is reported rather than silent. A quietly reduced budget would be
	 * spent on reasoning and come back as the truncation this class reports, so the
	 * editor would be told the ceiling was too low while the administrator's setting
	 * — the actual cause — went unmentioned. When the model's own cap is beneath
	 * `THINKING_FLOOR`, no ceiling can make it work and the notice says so instead
	 * of implying the number can be raised.
	 *
	 * @since 0.0.1
	 *
	 * @param  int         $requested The ceiling the caller sized for its payload.
	 * @param  string|null $model_id  Model to bound against. Null resolves the
	 *                                administrator's selection, which is what every
	 *                                caller wants; passing one explicitly is for
	 *                                tests and for a caller that already knows it.
	 * @return int The requested ceiling, or the model's cap when it is lower.
	 */
	public static function bounded_max_tokens( int $requested, ?string $model_id = null ): int {
		if ( null === $model_id ) {
			$model_id = Credentials::get_instance()->model();
		}

		$cap = self::MODEL_OUTPUT_CAPS[ $model_id ] ?? null;

		/*
		 * An unlisted model is returned untouched. This is not a fallback standing in
		 * for a value that should exist — there is no cap to read, here or from the
		 * package, and inventing a conservative one would cut budgets on every model
		 * the table has not been taught about.
		 */
		if ( null === $cap || $requested <= $cap ) {
			return $requested;
		}

		self::report(
			$cap < self::THINKING_FLOOR
				? sprintf(
					'A %d-token ceiling was requested, but the selected model "%s" accepts at most %d — below the %d tokens this plugin\'s models spend on reasoning alone. The request has been clamped to %d so the provider does not refuse it outright, but this model cannot complete a generation here whatever the ceiling. Select a model with a larger output limit in VIP Workflows settings.',
					$requested,
					$model_id,
					$cap,
					self::THINKING_FLOOR,
					$cap
				)
				: sprintf(
					'A %d-token ceiling was requested, but the selected model "%s" accepts at most %d, so the request has been clamped to that. Generations on this step may be reported as cut off at their token limit; raising the ceiling will not help, because the limit is the model\'s.',
					$requested,
					$model_id,
					$cap
				)
		);

		return $cap;
	}

	/**
	 * Report a clamped ceiling once per request.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $message Diagnostic text.
	 * @return void
	 */
	private static function report( string $message ): void {
		if ( isset( self::$reported[ $message ] ) ) {
			return;
		}

		self::$reported[ $message ] = true;

		_doing_it_wrong( __CLASS__ . '::bounded_max_tokens', esc_html( $message ), '1.0.0' );
	}

	/**
	 * Run a configured prompt builder and return its text.
	 *
	 * Order matters, and it is the reverse of what reads naturally. The provider's
	 * finish reason is checked before the text is fetched, because a run that hit
	 * the ceiling reaches `toText()` as either broken text or no text at all: ask
	 * for the text first and every low ceiling in the codebase presents as a model
	 * that returned nothing.
	 *
	 * A `length` finish is reported as a cutoff whether or not a partial content
	 * part survived. Partial free text is not a cheaper version of the answer — a
	 * truncated fact-check report silently drops findings, and a truncated rewrite
	 * is a body with its end missing — so there is nothing to be gained by handing
	 * it back and no way for a caller to tell it apart from a complete reply.
	 *
	 * Provider exceptions are not caught here. Each caller already maps a refused
	 * request onto its own error identity (a REST status, a tool result row), and
	 * flattening those into one code would lose information this cannot
	 * reconstruct.
	 *
	 * @since 0.0.1
	 *
	 * @param object   $builder    Configured AI Client prompt builder, ready for its terminal
	 *                             call. Typed loosely because the builder class is internal to
	 *                             the php-ai-client package and is not part of its public
	 *                             surface.
	 * @param string   $context    Label for error messages (e.g. "AI agent", "seed analysis").
	 * @param int|null $max_tokens The ceiling the builder was configured with, so a cutoff can
	 *                             name the number it hit. Null when the caller does not know it,
	 *                             in which case the cutoff is reported without a figure.
	 * @return string|WP_Error Generated text, or WP_Error on a cutoff, an empty result, a
	 *                         filtered response, or a reply carrying no text.
	 * @throws \Throwable Whatever the provider throws when it refuses the request.
	 */
	public static function generate( object $builder, string $context, ?int $max_tokens = null ): string|WP_Error {
		$result     = $builder->generateTextResult();
		$candidates = $result->getCandidates();

		if ( array() === $candidates ) {
			return new WP_Error(
				'no_candidates',
				sprintf(
					/* translators: %s: what was being generated, e.g. "AI agent". */
					__( 'The %s returned no response at all. Re-running it may succeed; if it keeps happening, the AI provider is not answering.', 'vip-workflows' ),
					$context
				)
			);
		}

		$finish_reason = $candidates[0]->getFinishReason();

		if ( $finish_reason->isLength() ) {
			return new WP_Error(
				'truncated_response',
				null === $max_tokens
					? sprintf(
						/* translators: %s: what was being generated, e.g. "AI agent". */
						__( 'The %s stopped at its token limit before it finished. That ceiling is a setting, not a problem with your content — ask an administrator to raise it for this step.', 'vip-workflows' ),
						$context
					)
					: sprintf(
						/* translators: 1: what was being generated, e.g. "AI agent". 2: the configured token ceiling. */
						__( 'The %1$s used its entire %2$d-token limit before it finished, so it produced nothing usable. That ceiling is a setting, not a problem with your content — ask an administrator to raise it for this step.', 'vip-workflows' ),
						$context,
						$max_tokens
					)
			);
		}

		if ( $finish_reason->isContentFilter() ) {
			return new WP_Error(
				'content_filtered',
				sprintf(
					/* translators: %s: what was being generated, e.g. "AI agent". */
					__( 'The %s was stopped by the AI provider\'s content filter, so it returned nothing. Re-running it will not help until the wording that triggered the filter changes.', 'vip-workflows' ),
					$context
				)
			);
		}

		/*
		 * The model finished on its own terms, so anything missing now is a reply
		 * that genuinely carried no text on the content channel — not a ceiling
		 * problem. `toText()` throws in that case and there is no way to ask about
		 * it without calling it, so the throw is the check.
		 */
		try {
			return $result->toText();
		} catch ( \RuntimeException $e ) {
			return new WP_Error(
				'no_text_content',
				sprintf(
					/* translators: %s: what was being generated, e.g. "AI agent". */
					__( 'The %s finished without writing any text. Re-running it may succeed.', 'vip-workflows' ),
					$context
				)
			);
		}
	}
}
