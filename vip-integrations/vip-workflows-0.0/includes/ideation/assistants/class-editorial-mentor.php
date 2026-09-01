<?php
/**
 * Editorial Mentor Assistant.
 *
 * Unlike other assistants, the Mentor is continuous. It evaluates
 * the current state of the ideation and provides coaching guidance.
 * Shares analysis dimensions (clarity, completeness, newsworthiness,
 * feasibility) with the downstream AI Pitch Analyzer.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\AI\PromptRegistry;
use VIPWorkflows\AI\AiInference;
use VIPWorkflows\Abilities\Ability;
use VIPWorkflows\Abilities\AiAvailability;
use VIPWorkflows\Integrations\LlmJsonGenerator;
use VIPWorkflows\Integrations\LlmTextGenerator;

/**
 * Editorial Mentor.
 */
class EditorialMentor {

	/**
	 * Get the identifier.
	 *
	 * @return string
	 */
	public function get_id(): string {
		return 'vip-workflows/editorial-mentor';
	}

	/**
	 * Check whether the assistant is available.
	 *
	 * Asks about the admin-selected provider, because `evaluate()` generates
	 * through `AiInference`, which honors that selection. The previous check named
	 * OpenAI outright, so a site running Anthropic was reported unavailable — and
	 * told to configure a vendor it never called — while generation would in fact
	 * have succeeded.
	 *
	 * @return bool
	 */
	public function is_available(): bool {
		return AiAvailability::is_configured();
	}

	/**
	 * Run the mentor evaluation.
	 *
	 * @param  array $context { seed, seed_analysis, pinned_cards, dismissed_count, total_cards }.
	 * @return array { status, cards, summary, meta } or { status: 'failed', error }
	 */
	public function run( array $context ): array {
		if ( ! $this->is_available() ) {
			/*
			 * The mentor's result is returned straight to the REST caller and never
			 * stored, so it could carry reader-phrased text. It deliberately uses the
			 * same vendor-naming, register-neutral line as the Seed Analyst instead:
			 * the ideation panel renders this as flat text with no structured
			 * channel, and one wording for both assistants is worth more here than a
			 * destination the Tools and Agents surfaces already offer.
			 */
			return array(
				'status' => 'unavailable',
				'error'  => AiAvailability::unconfigured_notice(),
			);
		}

		$seed            = $context['seed'] ?? '';
		$seed_analysis   = $context['seed_analysis'] ?? array();
		$pinned_cards    = $context['pinned_cards'] ?? array();
		$dismissed_count = $context['dismissed_count'] ?? 0;
		$total_cards     = $context['total_cards'] ?? 0;

		try {
			$guidance = $this->evaluate( $seed, $seed_analysis, $pinned_cards, $dismissed_count, $total_cards );
			if ( is_wp_error( $guidance ) ) {
				return array(
					'status' => 'failed',
					'error' => $guidance->get_error_message(),
				);
			}

			$cards = array(
				array(
					'type'       => 'mentor-guidance',
					'title'      => __( 'Editorial Guidance', 'vip-workflows' ),
					'guidance'   => $guidance['guidance'],
					'readiness'  => $guidance['readiness'],
					'source'     => 'editorial-mentor',
				),
			);

			return array(
				'status'  => 'completed',
				'cards'   => $cards,
				'summary' => $guidance['guidance'],
				'meta'    => array(
					'readiness'   => $guidance['readiness'],
					'suggestions' => $guidance['suggestions'],
				),
			);

		} catch ( \Exception $e ) {
			return array(
				'status' => 'failed',
				'error' => $e->getMessage(),
			);
		}
	}

	/**
	 * Evaluate the ideation state and produce guidance.
	 *
	 * @param string $seed            Raw seed text.
	 * @param array  $seed_analysis   Extracted metadata.
	 * @param array  $pinned_cards    Cards the user has pinned.
	 * @param int    $dismissed_count Number of dismissed cards.
	 * @param int    $total_cards     Total cards from all assistants.
	 * @return array|WP_Error Guidance with 'guidance' and 'readiness' keys.
	 */
	private function evaluate( string $seed, array $seed_analysis, array $pinned_cards, int $dismissed_count, int $total_cards ): array|\WP_Error {
		$pinned_breakdown = $this->build_pinned_breakdown( $pinned_cards );
		$tags             = implode( ', ', $seed_analysis['tags'] ?? array() );
		$news_angle       = $seed_analysis['news_angle'] ?? 'Not yet determined';
		$pinned_count     = count( $pinned_cards );
		$assistant_list   = $this->build_assistant_list();

		$pinned_details = '';
		foreach ( array_slice( $pinned_cards, 0, 10 ) as $card ) {
			$type    = $card['source_type'] ?? $card['type'] ?? 'article';
			$origin  = $card['origin'] ?? 'search';
			$title   = $card['title'] ?? 'Untitled';
			$domain  = $card['domain'] ?? '';
			$excerpt = $card['excerpt'] ?? '';
			if ( mb_strlen( $excerpt ) > 200 ) {
				$excerpt = mb_substr( $excerpt, 0, 200 ) . '...';
			}

			$pinned_details .= "- [{$type}, {$origin}] \"{$title}\"";
			if ( $domain ) {
				$pinned_details .= " ({$domain})";
			}
			if ( $excerpt ) {
				$pinned_details .= "\n  Excerpt: {$excerpt}";
			}
			$pinned_details .= "\n";
		}
		if ( empty( $pinned_details ) ) {
			$pinned_details = '(none yet)';
		}

		$prompt = PromptRegistry::get_instance()->get(
			'ideation/editorial-mentor',
			array(
				'seed'             => $seed,
				'tags'             => $tags,
				'news_angle'       => $news_angle,
				'total_cards'      => $total_cards,
				'pinned_count'     => $pinned_count,
				'pinned_breakdown' => $pinned_breakdown,
				'dismissed_count'  => $dismissed_count,
				'pinned_details'   => $pinned_details,
				'assistant_list'   => $assistant_list,
			)
		);

		/*
		 * The prompt asks for three fields: `guidance` (2-3 sentences of prose),
		 * `readiness` (one enum value) and `suggestions` (up to three objects of
		 * label / assistant id / query). Sized against that: prose runs to roughly
		 * 150 tokens on a verbose model, the enum is a handful, and each suggestion
		 * costs 50-60 once the ability id and the JSON keys are counted — about 340
		 * for a full response.
		 *
		 * That model was right and still is; what it left out is that the reply is
		 * not the only thing drawing on the ceiling. Reasoning is billed against the
		 * same budget and measures an order of magnitude larger than this payload,
		 * so the 1000 this previously carried was around a third of the thinking
		 * cost alone. It has nonetheless been observed returning full guidance,
		 * because thinking is adaptive and a short prompt over a handful of pinned
		 * sources reasons far less than the worst case — the ceiling was gambling on
		 * the prompt staying small, not failing outright. Sized at the floor because
		 * 340 tokens of reply is nowhere near what governs the number.
		 */
		$decoded = LlmJsonGenerator::generate(
			\WordPress\AiClient\AiClient::prompt( $prompt )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( LlmTextGenerator::THINKING_FLOOR ) )
				->asJsonResponse(),
			'mentor response'
		);
		if ( is_wp_error( $decoded ) ) {
			return $decoded;
		}

		$suggestions = array();
		foreach ( ( $decoded['suggestions'] ?? array() ) as $s ) {
			if ( ! empty( $s['label'] ) && ! empty( $s['assistant'] ) && ! empty( $s['query'] ) ) {
				$suggestions[] = array(
					'label'     => $s['label'],
					'assistant' => $s['assistant'],
					'query'     => $s['query'],
				);
			}
		}

		return array(
			'guidance'    => $decoded['guidance'] ?? '',
			'readiness'   => $decoded['readiness'] ?? 'needs-context',
			'suggestions' => $suggestions,
		);
	}

	/**
	 * Build a list of available research assistants for the prompt.
	 *
	 * @return string Formatted list of assistant IDs and descriptions.
	 */
	private function build_assistant_list(): string {
		$all   = wp_get_abilities();
		$lines = array();

		foreach ( $all as $ability ) {
			if ( ! ( $ability instanceof Ability ) ) {
				continue;
			}
			$meta = $ability->get_meta();
			if ( ( $meta['type'] ?? '' ) !== 'research' ) {
				continue;
			}
			$lines[] = sprintf(
				'- id: "%s" (%s)',
				$ability->get_name(),
				$ability->get_description()
			);
		}

		if ( empty( $lines ) ) {
			return '(none available)';
		}

		return implode( "\n", $lines );
	}

	/**
	 * Build a breakdown string of pinned card types.
	 *
	 * @param array $pinned_cards Pinned cards.
	 * @return string E.g., "2 archive articles, 1 web article, 1 image".
	 */
	private function build_pinned_breakdown( array $pinned_cards ): string {
		$counts = array();
		foreach ( $pinned_cards as $card ) {
			$type = $card['source_type'] ?? $card['type'] ?? 'article';
			$counts[ $type ] = ( $counts[ $type ] ?? 0 ) + 1;
		}

		if ( empty( $counts ) ) {
			return 'none';
		}

		$parts = array();
		foreach ( $counts as $type => $count ) {
			$label   = str_replace( '-', ' ', $type );
			$parts[] = "{$count} {$label}" . ( $count > 1 ? 's' : '' );
		}

		return implode( ', ', $parts );
	}
}
