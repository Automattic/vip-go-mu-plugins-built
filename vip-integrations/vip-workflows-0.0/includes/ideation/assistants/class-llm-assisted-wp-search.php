<?php
/**
 * LLM-Assisted WordPress Search.
 *
 * Phase 1 implementation of ArchiveSearchInterface.
 * Uses WP_Query for candidate retrieval, then LLM for relevance re-ranking.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\AI\PromptRegistry;
use VIPWorkflows\AI\AiInference;
use VIPWorkflows\Abilities\AiAvailability;
use VIPWorkflows\Integrations\LlmTextGenerator;

/**
 * LLMAssisted WPSearch.
 */
class LLMAssistedWPSearch implements ArchiveSearchInterface {

	private const MAX_CANDIDATES = 30;
	private const MAX_RERANK     = 10;

	/**
	 * Search.
	 *
	 * @param string $seed Ideation seed text.
	 * @param array  $extracted_topics extracted topics.
	 * @param array  $search_queries search queries.
	 * @param int    $limit Maximum number of results.
	 */
	public function search( string $seed, array $extracted_topics, array $search_queries = array(), int $limit = 10 ): array {
		$queries = ! empty( $search_queries ) ? $search_queries : $extracted_topics;
		if ( empty( $queries ) ) {
			$queries = array( $seed );
		}

		$candidates = $this->gather_candidates( $queries );
		if ( empty( $candidates ) ) {
			return array();
		}

		$reranked = $this->rerank_with_llm( $seed, $candidates, $limit );

		return $reranked;
	}

	/**
	 * Run multiple WP_Query searches and merge unique results.
	 *
	 * @param array $queries Search terms to query.
	 * @return array Deduplicated post results.
	 */
	private function gather_candidates( array $queries ): array {
		$seen       = array();
		$candidates = array();

		foreach ( $queries as $query_term ) {
			if ( empty( $query_term ) ) {
				continue;
			}

			$posts = get_posts(
				array(
					's'              => $query_term,
					'post_type'      => 'post',
					'post_status'    => 'publish',
					'posts_per_page' => 10,
					'orderby'        => 'relevance',
					'order'          => 'DESC',
				)
			);

			foreach ( $posts as $post ) {
				if ( isset( $seen[ $post->ID ] ) ) {
					continue;
				}
				$seen[ $post->ID ] = true;

				$candidates[] = array(
					'id'        => $post->ID,
					'title'     => $post->post_title,
					'excerpt'   => $this->get_excerpt( $post ),
					'date'      => $post->post_date,
					'author'    => get_the_author_meta( 'display_name', $post->post_author ),
					'url'       => get_permalink( $post->ID ),
					'thumbnail' => get_the_post_thumbnail_url( $post->ID, 'medium' ) ? get_the_post_thumbnail_url( $post->ID, 'medium' ) : null,
				);

				if ( count( $candidates ) >= self::MAX_CANDIDATES ) {
					break 2;
				}
			}
		}

		return $candidates;
	}

	/**
	 * Use the LLM to re-rank candidates by relevance to the seed.
	 *
	 * @param string $seed       Original seed text.
	 * @param array  $candidates Candidate articles.
	 * @param int    $limit      How many to return.
	 * @return array Re-ranked and trimmed results.
	 */
	private function rerank_with_llm( string $seed, array $candidates, int $limit ): array {
		/*
		 * Re-ranking is an enhancement, not a requirement: an unconfigured site
		 * still gets its search results, just in the order the query returned them.
		 * The check asks about the selected provider because the call below resolves
		 * the model through `AiInference` — naming OpenAI here silently disabled
		 * re-ranking on every site configured for another provider.
		 */
		if ( ! AiAvailability::is_configured() ) {
			return array_slice( $candidates, 0, $limit );
		}

		$candidate_lines = array();
		foreach ( $candidates as $i => $c ) {
			$candidate_lines[] = sprintf( '[%d] "%s" - %s', $i, $c['title'], mb_substr( $c['excerpt'], 0, 150 ) );
		}
		$candidate_text = implode( "\n", $candidate_lines );

		$prompt = PromptRegistry::get_instance()->get(
			'ideation/wp-search-rerank',
			array(
				'limit'          => $limit,
				'seed'           => $seed,
				'candidate_text' => $candidate_text,
			)
		);

		try {
			/*
			 * The reply is the smallest in the plugin: a JSON array of at most
			 * `$limit` integers, which is a few dozen tokens even when the caller asks
			 * for every candidate. So this ceiling is effectively pure reasoning
			 * budget and belongs at the floor — the previous 200 could not cover the
			 * thinking that precedes the array under any prompt, which means re-ranking
			 * has not actually been running.
			 *
			 * It failed silently, which is why nobody saw it: this chain discards the
			 * finish reason by design (see LlmJsonGeneratorGuardTest, which allowlists
			 * it), so a cut-off reply is indistinguishable from a model that returned
			 * no array, and both fall through to the archive order the query already
			 * produced. The cost of the old ceiling was result quality with no error
			 * anywhere — the degradation this chain is allowed to have, arrived at for
			 * the wrong reason.
			 */
			$result = \WordPress\AiClient\AiClient::prompt( $prompt )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( LlmTextGenerator::THINKING_FLOOR ) )
				->asJsonResponse()
				->generateText();

			$indices = json_decode( $result, true );
			if ( ! is_array( $indices ) ) {
				return array_slice( $candidates, 0, $limit );
			}

			$reranked = array();
			foreach ( $indices as $idx ) {
				if ( is_int( $idx ) && isset( $candidates[ $idx ] ) ) {
					$reranked[] = $candidates[ $idx ];
				}
				if ( count( $reranked ) >= $limit ) {
					break;
				}
			}

			return $reranked;
		} catch ( \Exception $e ) {
			return array_slice( $candidates, 0, $limit );
		}
	}

	/**
	 * Get a clean excerpt for a post.
	 *
	 * @param \WP_Post $post The post.
	 * @return string Excerpt text.
	 */
	private function get_excerpt( \WP_Post $post ): string {
		if ( ! empty( $post->post_excerpt ) ) {
			return wp_strip_all_tags( $post->post_excerpt );
		}

		$content = wp_strip_all_tags( $post->post_content );
		return mb_substr( $content, 0, 300 );
	}
}
