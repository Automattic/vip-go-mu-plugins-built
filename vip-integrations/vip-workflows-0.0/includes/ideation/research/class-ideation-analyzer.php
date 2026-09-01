<?php
/**
 * Ideation Analyzer - AI-powered analysis for ideation sources.
 *
 * Provides summarization and analysis tools for ideation projects.
 * Uses "simple mode" - sends full content to LLM for small projects.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Research;

use VIPWorkflows\AI\PromptRegistry;
use VIPWorkflows\AI\AiInference;
use VIPWorkflows\Abilities\AiAvailability;
use WP_Error;

/**
 * Ideation analyzer class.
 */
class IdeationAnalyzer {


	/**
	 * Maximum tokens for context in simple mode.
	 */
	private const MAX_SIMPLE_TOKENS = 15000;

	/**
	 * Approximate characters per token (conservative estimate).
	 */
	private const CHARS_PER_TOKEN = 4;

	/**
	 * Check if AI is configured.
	 *
	 * Asks about the admin-selected provider, because every generation below goes
	 * through `AiInference`. The previous check named OpenAI, so a site running
	 * another provider was refused with an instruction it could not act on — and
	 * pointed at "Settings → AI Services", a screen that does not exist.
	 *
	 * The absent-AI-Client case is not a separate branch any more: without the
	 * client no provider can be registered with it, so the check reports the same
	 * `unsupported_environment` requirement, with no destination, either way.
	 *
	 * @return true|WP_Error True if configured, WP_Error otherwise.
	 */
	public function check_configuration(): true|WP_Error {
		if ( AiAvailability::is_configured() ) {
			return true;
		}

		return new WP_Error( 'ai_not_configured', AiAvailability::unconfigured_notice() );
	}

	/**
	 * Summarize a single source.
	 *
	 * @param array $source Source data with 'content', 'title', 'url'.
	 * @param array $options Options: 'max_length' (default 300).
	 * @return array|WP_Error Summary data or error.
	 */
	public function summarize_source( array $source, array $options = array() ) {
		$config_check = $this->check_configuration();
		if ( is_wp_error( $config_check ) ) {
			return $config_check;
		}

		$content = $source['content'] ?? $source['excerpt'] ?? '';
		if ( empty( $content ) ) {
			return new WP_Error(
				'no_content',
				__( 'Source has no content to summarize. Try opening the source and checking if the content loaded.', 'vip-workflows' ),
				array( 'status' => 422 )
			);
		}

		$max_length = $options['max_length'] ?? 300;
		$title      = $source['title'] ?? 'Untitled';

		$prompt = $this->build_source_summary_prompt( $title, $content, $max_length );

		/*
		 * The prompt names the reply's length itself — "approximately {max_length}
		 * words", 300 by default — so it does not grow with the source, which is
		 * truncated to 15,000 tokens going in. 300 words is about 400 tokens, inside
		 * the floor's own headroom, and the floor still leaves room for a caller
		 * asking for a considerably longer summary. The previous 800 was a fifth of
		 * the reasoning cost billed against it.
		 */
		try {
			$result = \WordPress\AiClient\AiClient::prompt( $prompt )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( \VIPWorkflows\Integrations\LlmTextGenerator::bounded_max_tokens( \VIPWorkflows\Integrations\LlmTextGenerator::THINKING_FLOOR ) )
				->generateText();

			return array(
				'summary'    => trim( $result ),
				'source_id'  => $source['source_id'] ?? null,
				'analyzed_at' => current_time( 'mysql' ),
			);

		} catch ( \Exception $e ) {
			return new WP_Error( 'ai_error', $e->getMessage() );
		}
	}

	/**
	 * Summarize all sources in a project.
	 *
	 * @param array $sources Array of source data.
	 * @param array $options Options: 'max_length' (default 500).
	 * @return array|WP_Error Summary data or error.
	 */
	public function summarize_project( array $sources, array $options = array() ) {
		$config_check = $this->check_configuration();
		if ( is_wp_error( $config_check ) ) {
			return $config_check;
		}

		if ( empty( $sources ) ) {
			return new WP_Error(
				'no_sources',
				__( 'Project has no sources to summarize.', 'vip-workflows' )
			);
		}

		$max_length = $options['max_length'] ?? 500;

		$context = $this->build_sources_context( $sources );

		$prompt = $this->build_project_summary_prompt( $context, count( $sources ), $max_length );

		/*
		 * Two parts, both bounded by the prompt rather than by the sources: a summary
		 * of "approximately {max_length} words" (500 from the only caller, ~650 tokens)
		 * and 3-7 key points (~150). About 800 tokens for a full reply.
		 *
		 * 2,000 above the floor rather than the floor alone because `max_length` is a
		 * caller-supplied option with no bound, and this is the one analyzer method
		 * that synthesizes every source at once — so the reply is the part most likely
		 * to be asked to grow. The previous 1500 was below the reasoning cost.
		 */
		try {
			$result = \WordPress\AiClient\AiClient::prompt( $prompt )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( \VIPWorkflows\Integrations\LlmTextGenerator::bounded_max_tokens( \VIPWorkflows\Integrations\LlmTextGenerator::THINKING_FLOOR + 2000 ) )
				->generateText();

			$parsed = $this->parse_project_summary( $result );

			return array(
				'summary'     => $parsed['summary'],
				'key_points'  => $parsed['key_points'],
				'source_count' => count( $sources ),
				'analyzed_at' => current_time( 'mysql' ),
			);

		} catch ( \Exception $e ) {
			return new WP_Error( 'ai_error', $e->getMessage() );
		}
	}

	/**
	 * Build the source summary prompt.
	 *
	 * @param string $title title.
	 * @param string $content content.
	 * @param int    $max_length max length.
	 * @return string
	 */
	private function build_source_summary_prompt( string $title, string $content, int $max_length ): string {
		$max_chars = self::MAX_SIMPLE_TOKENS * self::CHARS_PER_TOKEN;
		if ( mb_strlen( $content ) > $max_chars ) {
			$content = mb_substr( $content, 0, $max_chars ) . '... [truncated]';
		}

		return PromptRegistry::get_instance()->get(
			'research/source-summary',
			array(
				'max_length' => $max_length,
				'title'      => $title,
				'content'    => $content,
			)
		);
	}

	/**
	 * Build the project summary prompt.
	 *
	 * @param string $context context.
	 * @param int    $source_count source count.
	 * @param int    $max_length max length.
	 * @return string
	 */
	private function build_project_summary_prompt( string $context, int $source_count, int $max_length ): string {
		return PromptRegistry::get_instance()->get(
			'research/project-summary',
			array(
				'source_count' => $source_count,
				'max_length'   => $max_length,
				'context'      => $context,
			)
		);
	}

	/**
	 * Build the sources context.
	 *
	 * @param array $sources sources.
	 * @return string
	 */
	private function build_sources_context( array $sources ): string {
		$context   = '';
		$max_chars = self::MAX_SIMPLE_TOKENS * self::CHARS_PER_TOKEN;
		$used      = 0;

		foreach ( $sources as $index => $source ) {
			$title   = $source['title'] ?? 'Untitled';
			$content = $source['content'] ?? $source['excerpt'] ?? '';
			$domain  = $source['domain'] ?? '';

			$source_text = "---\nSource: {$title}";
			if ( $domain ) {
				$source_text .= " ({$domain})";
			}
			$source_text .= "\n{$content}\n\n";

			if ( $used + mb_strlen( $source_text ) > $max_chars ) {
				$remaining    = $max_chars - $used - 200;
				if ( $remaining > 500 ) {
					$truncated    = mb_substr( $content, 0, $remaining ) . '... [truncated]';
					$source_text  = "---\nSource: {$title}";
					if ( $domain ) {
						$source_text .= " ({$domain})";
					}
					$source_text .= "\n{$truncated}\n\n";
					$context     .= $source_text;
				}
				break;
			}

			$context .= $source_text;
			$used    += mb_strlen( $source_text );
		}

		return $context;
	}

	/**
	 * Parse the project summary.
	 *
	 * @param string $response response.
	 * @return array
	 */
	private function parse_project_summary( string $response ): array {
		$summary    = '';
		$key_points = array();

		if ( preg_match( '/SUMMARY:\s*\n(.*?)(?=KEY POINTS:|$)/si', $response, $matches ) ) {
			$summary = trim( $matches[1] );
		} else {
			$summary = trim( $response );
		}

		if ( preg_match( '/KEY POINTS:\s*\n(.*?)$/si', $response, $matches ) ) {
			$points_text = $matches[1];
			preg_match_all( '/^[-•*]\s*(.+)$/m', $points_text, $point_matches );
			if ( ! empty( $point_matches[1] ) ) {
				$key_points = array_map( 'trim', $point_matches[1] );
			}
		}

		return array(
			'summary'    => $summary,
			'key_points' => $key_points,
		);
	}
}
