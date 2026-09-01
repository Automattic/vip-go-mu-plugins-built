<?php
/**
 * Seed Analyst Assistant.
 *
 * Extracts tags, topics, entities, and structured understanding
 * from the freeform ideation seed. Runs first and shares output
 * with other assistants to focus their searches.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\AI\PromptRegistry;
use VIPWorkflows\AI\AiInference;
use VIPWorkflows\API\AvailabilitySerializer;
use VIPWorkflows\Abilities\AiAvailability;
use VIPWorkflows\Integrations\LlmJsonGenerator;
use VIPWorkflows\Integrations\LlmTextGenerator;
use WP_Error;

/**
 * Seed Analyst.
 */
class SeedAnalyst {

	/**
	 * Get the identifier.
	 *
	 * @return string
	 */
	public function get_id(): string {
		return 'vip-workflows/seed-analyst';
	}

	/**
	 * Get the human-readable name.
	 *
	 * The analyst is not a registered ability — it is invoked directly by
	 * `IdeationOrchestrator::run_seed_analyst()` — so nothing in the abilities
	 * registry can name it. This is the only source of its label, which is why the
	 * orchestrator asks the class rather than the registry when it resolves the
	 * labels it sends to the ideation workspace.
	 *
	 * @since 0.0.1
	 *
	 * @return string
	 */
	public function get_label(): string {
		return __( 'Seed Analyst', 'vip-workflows' );
	}

	/**
	 * Check whether the assistant is available.
	 *
	 * Asks about the admin-selected provider, because `analyze_seed()` generates
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
	 * Run seed analysis.
	 *
	 * @param  array $context { seed, brand_context }.
	 * @return array { status, cards, summary, meta } or { status: 'failed', error }
	 */
	public function run( array $context ): array {
		$availability = AiAvailability::for_selected_provider(
			array( $this->get_label() )
		);

		if ( true !== $availability ) {
			/*
			 * This array is persisted as project meta (see
			 * IdeationOrchestrator::run_seed_analyst()), so `error` names the vendor
			 * and nothing reader-specific — no destination, no "ask an
			 * administrator" — and which requirement is unmet travels beside it as
			 * structured identity, exactly as the research abilities do.
			 */
			return array(
				'status'       => 'unavailable',
				'error'        => AiAvailability::unconfigured_notice(),
				'requirements' => AvailabilitySerializer::to_persistable( $availability ),
			);
		}

		$seed          = $context['seed'] ?? '';
		$brand_context = $context['brand_context'] ?? array();

		if ( empty( $seed ) ) {
			return array(
				'status' => 'failed',
				'error' => 'No seed text provided.',
			);
		}

		try {
			$analysis = $this->analyze_seed( $seed, $brand_context );
			if ( is_wp_error( $analysis ) ) {
				return array(
					'status' => 'failed',
					'error' => $analysis->get_error_message(),
				);
			}

			$cards = $this->build_board_cards( $analysis );

			$tag_count    = count( $analysis['tags'] ?? array() );
			$entity_count = $this->count_entities( $analysis['entities'] ?? array() );
			$summary      = sprintf(
				/* translators: 1: number of topics, 2: number of entities */
				__( 'Extracted %1$d topics and %2$d entities from your seed.', 'vip-workflows' ),
				$tag_count,
				$entity_count
			);

			return array(
				'status'  => 'completed',
				'cards'   => $cards,
				'summary' => $summary,
				'meta'    => $analysis,
			);

		} catch ( \Exception $e ) {
			return array(
				'status' => 'failed',
				'error' => $e->getMessage(),
			);
		}
	}

	/**
	 * Build board-level cards from the analysis.
	 *
	 * Produces distinct card types: tag cloud, entity cards, and news angle.
	 *
	 * @param array $analysis The structured analysis from the LLM.
	 * @return array Board cards.
	 */
	private function build_board_cards( array $analysis ): array {
		$cards = array();

		// News angle card (the editorial insight, should be prominent on the board).
		if ( ! empty( $analysis['news_angle'] ) ) {
			$cards[] = array(
				'type'       => 'news-angle',
				'title'      => __( 'News Angle', 'vip-workflows' ),
				'content'    => $analysis['news_angle'],
				'source'     => 'seed-analyst',
			);
		}

		// Tag cloud card (interactive topic pills).
		if ( ! empty( $analysis['tags'] ) ) {
			$cards[] = array(
				'type'   => 'tag-cloud',
				'title'  => __( 'Topics', 'vip-workflows' ),
				'tags'   => $analysis['tags'],
				'source' => 'seed-analyst',
			);
		}

		// Entity cards (one card per entity group that has entries).
		$entity_labels = array(
			'people'        => __( 'People', 'vip-workflows' ),
			'organizations' => __( 'Organizations', 'vip-workflows' ),
			'places'        => __( 'Places', 'vip-workflows' ),
		);

		foreach ( $entity_labels as $group => $label ) {
			$items = $analysis['entities'][ $group ] ?? array();
			if ( ! empty( $items ) ) {
				$cards[] = array(
					'type'         => 'entity',
					'title'        => $label,
					'entity_group' => $group,
					'entities'     => $items,
					'source'       => 'seed-analyst',
				);
			}
		}

		return $cards;
	}

	/**
	 * Count total entities across all groups.
	 *
	 * @param array $entities Entity groups.
	 * @return int Total count.
	 */
	private function count_entities( array $entities ): int {
		$count = 0;
		foreach ( $entities as $items ) {
			if ( is_array( $items ) ) {
				$count += count( $items );
			}
		}
		return $count;
	}

	/**
	 * Format brand knowledge entries into a prompt section.
	 *
	 * Each entry may carry a short title and the full guideline content. Both are
	 * included so the model receives the actual guidance, not just the label.
	 *
	 * @param array $brand_context Brand knowledge entries, each { title, content }.
	 * @return string Prompt section, or an empty string when there is nothing to add.
	 */
	private static function format_brand_context( array $brand_context ): string {
		$brand_lines = array();
		foreach ( $brand_context as $entry ) {
			$title   = trim( (string) ( $entry['title'] ?? '' ) );
			$content = trim( (string) ( $entry['content'] ?? '' ) );

			if ( '' !== $content ) {
				$brand_lines[] = '' !== $title ? "{$title}:\n{$content}" : $content;
			} elseif ( '' !== $title ) {
				$brand_lines[] = $title;
			}
		}

		if ( empty( $brand_lines ) ) {
			return '';
		}

		return "\n\nBRAND CONTEXT (use to inform topic classification):\n" . implode( "\n\n", $brand_lines );
	}

	/**
	 * Analyze the seed text using the LLM.
	 *
	 * @param string $seed          The raw seed text.
	 * @param array  $brand_context Brand knowledge entries.
	 * @return array|WP_Error Structured analysis.
	 */
	private function analyze_seed( string $seed, array $brand_context ): array|WP_Error {
		$brand_section = self::format_brand_context( $brand_context );

		$prompt = PromptRegistry::get_instance()->get(
			'ideation/seed-analyst',
			array(
				'seed'          => $seed,
				'brand_context' => $brand_section,
			)
		);

		/*
		 * The payload this asks for is small and capped by the prompt itself: 3-7
		 * lowercase topic slugs, only those entities actually named in the seed, 2-3
		 * search queries, a one-sentence news angle and a title. Counting the JSON
		 * keys and the nested entity groups around them, a full response models at
		 * roughly 250 tokens, and the prompt closes by asking the model to keep
		 * everything concise.
		 *
		 * So almost none of this ceiling is the answer — it is the reasoning that
		 * precedes it, which is why the previous 500 failed. 500 was ample for the
		 * payload and about an eighth of what the model spends thinking before
		 * writing it, so the budget was exhausted on the thought channel and the
		 * reply came back with no content part at all. Sized at the floor for that
		 * reason: the reply is far too small to be what governs the number.
		 */
		$decoded = LlmJsonGenerator::generate(
			\WordPress\AiClient\AiClient::prompt( $prompt )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( LlmTextGenerator::THINKING_FLOOR ) )
				->asJsonResponse(),
			'seed analysis'
		);
		if ( is_wp_error( $decoded ) ) {
			return $decoded;
		}

		return array(
			'tags'            => $decoded['tags'] ?? array(),
			'entities'        => $decoded['entities'] ?? array(),
			'search_queries'  => $decoded['search_queries'] ?? array(),
			'news_angle'      => $decoded['news_angle'] ?? '',
			'suggested_title' => $decoded['suggested_title'] ?? '',
		);
	}
}
