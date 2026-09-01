<?php
/**
 * Readability ability - WordPress Abilities API compatible.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the readability analysis.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_readability( ?array $input = null ) {
	$input   = $input ?? array();
	$content = '';

	// Get content from post or input.
	if ( ! empty( $input['post_id'] ) ) {
		$post = get_post( $input['post_id'] );
		if ( $post ) {
			$permission_error = require_post_edit_permission( (int) $input['post_id'] );
			if ( $permission_error ) {
				return $permission_error;
			}

			$content = $post->post_content;
		}
	} elseif ( ! empty( $input['content'] ) ) {
		$content = $input['content'];
	}

	if ( empty( $content ) ) {
		return new \WP_Error(
			'no_content',
			__( 'No content to analyze.', 'vip-workflows' )
		);
	}

	$settings     = \VIPWorkflows\Abilities\AbilitySettings::get_instance()->get_options( 'vip-workflows/readability' );
	$target_grade = $settings['target_grade'] ?? 8;

	// Get plain text.
	$plain_text = wp_strip_all_tags( $content );
	$plain_text = html_entity_decode( $plain_text, ENT_QUOTES, 'UTF-8' );

	// Basic counts.
	$word_count      = str_word_count( $plain_text );
	$sentences       = count_sentences( $plain_text );
	$syllable_count  = count_syllables( $plain_text );
	$paragraph_count = substr_count( $content, '</p>' );
	$paragraph_count = $paragraph_count ? $paragraph_count : 1;

	if ( 0 === $word_count || 0 === $sentences ) {
		return new \WP_Error(
			'insufficient_content',
			__( 'Not enough content to analyze.', 'vip-workflows' )
		);
	}

	// Calculate metrics.
	$avg_sentence_length = $word_count / $sentences;
	$avg_syllables_word  = $syllable_count / $word_count;

	// Flesch Reading Ease (0-100, higher is easier).
	$flesch_ease = 206.835 - ( 1.015 * $avg_sentence_length ) - ( 84.6 * $avg_syllables_word );
	$flesch_ease = max( 0, min( 100, $flesch_ease ) );

	// Flesch-Kincaid Grade Level.
	$fk_grade = ( 0.39 * $avg_sentence_length ) + ( 11.8 * $avg_syllables_word ) - 15.59;
	$fk_grade = max( 0, round( $fk_grade, 1 ) );

	// Find complex words (3+ syllables).
	$words            = str_word_count( $plain_text, 1 );
	$complex_words    = array_filter( $words, fn( $word ) => syllable_count( $word ) >= 3 );
	$complex_word_pct = ( count( $complex_words ) / $word_count ) * 100;

	// Find long sentences.
	$sentence_list  = get_sentences( $plain_text );
	$long_sentences = array();
	foreach ( $sentence_list as $index => $sentence ) {
		$sentence_words = str_word_count( $sentence );
		if ( $sentence_words > 25 ) {
			$long_sentences[] = array(
				'index'      => $index + 1,
				'word_count' => $sentence_words,
				'preview'    => wp_trim_words( $sentence, 10, '...' ),
			);
		}
	}

	// Build analysis.
	$analysis = array(
		'word_count'           => $word_count,
		'sentence_count'       => $sentences,
		'paragraph_count'      => $paragraph_count,
		'syllable_count'       => $syllable_count,
		'avg_sentence_length'  => round( $avg_sentence_length, 1 ),
		'avg_syllables_word'   => round( $avg_syllables_word, 2 ),
		'flesch_ease'          => round( $flesch_ease, 1 ),
		'flesch_kincaid_grade' => $fk_grade,
		'complex_word_pct'     => round( $complex_word_pct, 1 ),
		'long_sentences'       => $long_sentences,
		'reading_time_min'     => ceil( $word_count / 200 ),
	);

	// Determine issues and suggestions.
	$issues      = array();
	$suggestions = array();

	// Check grade level vs target.
	if ( $fk_grade > $target_grade + 2 ) {
		$issues[] = array(
			'type'     => 'grade_too_high',
			'message'  => sprintf(
			/* translators: 1: Flesch-Kincaid grade, 2: Target grade */
				__( 'Reading level (grade %1$s) is above target (grade %2$d). Content may be too complex.', 'vip-workflows' ),
				$fk_grade,
				$target_grade
			),
			'severity' => 'warning',
		);
	}

	// Check sentence length.
	if ( $avg_sentence_length > 20 ) {
		$issues[] = array(
			'type'     => 'long_sentences',
			'message'  => sprintf(
			/* translators: %s: Average sentence length */
				__( 'Average sentence length is %s words. Aim for 15-20 words.', 'vip-workflows' ),
				round( $avg_sentence_length, 1 )
			),
			'severity' => 'warning',
		);
		$suggestions[] = array(
			'type'    => 'shorten_sentences',
			'message' => __( 'Break long sentences into shorter ones. Use periods more often.', 'vip-workflows' ),
		);
	}

	// Check complex words.
	if ( $complex_word_pct > 15 ) {
		$issues[] = array(
			'type'     => 'complex_vocabulary',
			'message'  => sprintf(
			/* translators: %s: Percentage of complex words */
				__( '%s%% of words are complex (3+ syllables). Consider simpler alternatives.', 'vip-workflows' ),
				round( $complex_word_pct, 1 )
			),
			'severity' => 'info',
		);

		// Show examples of complex words.
		$complex_examples = array_slice( array_unique( $complex_words ), 0, 5 );
		if ( $complex_examples ) {
			$suggestions[] = array(
				'type'    => 'simplify_words',
				'message' => sprintf(
				/* translators: %s: List of complex words */
					__( 'Consider simpler alternatives for: %s', 'vip-workflows' ),
					implode( ', ', $complex_examples )
				),
			);
		}
	}

	// Flag specific long sentences.
	if ( count( $long_sentences ) > 0 ) {
		foreach ( array_slice( $long_sentences, 0, 3 ) as $ls ) {
			$suggestions[] = array(
				'type'     => 'split_sentence',
				'message'  => sprintf(
				/* translators: 1: Sentence number, 2: Word count, 3: Sentence preview */
					__( 'Sentence %1$d has %2$d words: "%3$s"', 'vip-workflows' ),
					$ls['index'],
					$ls['word_count'],
					$ls['preview']
				),
				'location' => array( 'sentence' => $ls['index'] ),
			);
		}
	}

	// Calculate score (based on Flesch ease, adjusted).
	$score = $flesch_ease;
	if ( $fk_grade > $target_grade + 2 ) {
		$score -= 10;
	}
	if ( $avg_sentence_length > 25 ) {
		$score -= 10;
	}
	$score = max( 0, min( 100, $score ) );

	// Determine status.
	if ( $score >= 70 ) {
		$status = 'pass';
	} elseif ( $score >= 40 ) {
		$status = 'warning';
	} else {
		$status = 'fail';
	}

	// Generate summary.
	$grade_desc = grade_to_description( $fk_grade );
	$summary    = sprintf(
	/* translators: 1: Grade level, 2: Grade description, 3: Ease description */
		__( 'Grade level: %1$s (%2$s). %3$s', 'vip-workflows' ),
		$fk_grade,
		$grade_desc,
		ease_to_description( $flesch_ease )
	);

	return array(
		'score'       => round( $score ),
		'status'      => $status,
		'summary'     => $summary,
		'analysis'    => $analysis,
		'issues'      => $issues,
		'suggestions' => $suggestions,
	);
}

/**
 * Permission callback for readability analysis.
 *
 * @return bool
 */
function can_execute_readability(): bool {
	return current_user_can( 'edit_posts' );
}

/**
 * Register the Readability ability.
 *
 * Called on wp_abilities_api_init hook.
 *
 * @return void
 */
function register_readability(): void {
	wp_register_ability(
		'vip-workflows/readability',
		array(
			'label'               => __( 'Readability Analysis', 'vip-workflows' ),
			'description'         => __( 'Analyze content readability using Flesch-Kincaid score, sentence length, and complexity metrics.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'post_id'      => array(
						'type'        => 'integer',
						'description' => __( 'The post ID to analyze.', 'vip-workflows' ),
					),
					'content'      => array(
						'type'        => 'string',
						'description' => __( 'Raw content to analyze (alternative to post_id).', 'vip-workflows' ),
					),
					'target_grade' => array(
						'type'        => 'integer',
						'description' => __( 'Target reading grade level.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'score', 'status', 'summary' ),
				'properties'           => array(
					'score'       => array(
						'type'        => 'number',
						'description' => __( 'Readability score from 0-100.', 'vip-workflows' ),
					),
					'status'      => array(
						'type'        => 'string',
						'enum'        => array( 'pass', 'warning', 'fail' ),
						'description' => __( 'Status: pass, warning, or fail.', 'vip-workflows' ),
					),
					'summary'     => array(
						'type'        => 'string',
						'description' => __( 'Summary message.', 'vip-workflows' ),
					),
					'analysis'    => array(
						'type'        => 'object',
						'description' => __( 'Detailed metrics.', 'vip-workflows' ),
					),
					'issues'      => array(
						'type'        => 'array',
						'description' => __( 'List of issues found.', 'vip-workflows' ),
					),
					'suggestions' => array(
						'type'        => 'array',
						'description' => __( 'List of improvement suggestions.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_readability',
			'permission_callback' => __NAMESPACE__ . '\\can_execute_readability',
			'meta'                => array(
				'show_in_rest'        => true,
				'show_in_commands'    => true,
				'icon'                => 'typography',
				'type'                => 'check',
				'supports'            => array( 'workflow' ),
				'transition_eligible' => true,
				'settings_schema'     => array(
					'target_grade' => array(
						'type'        => 'integer',
						'default'     => 8,
						'label'       => __( 'Target reading grade level', 'vip-workflows' ),
						'description' => __( 'Content above this grade level will flag warnings.', 'vip-workflows' ),
						'minimum'     => 1,
						'maximum'     => 16,
						'enforceable' => true,
					),
				),
				'annotations'         => array(
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				),
			),
		)
	);
}

/**
 * Count sentences in text.
 *
 * @param  string $text Plain text.
 * @return int
 */
function count_sentences( string $text ): int {
	$count = preg_match_all( '/[.!?]+/', $text );
	return max( 1, $count );
}

/**
 * Get sentences as array.
 *
 * @param  string $text Plain text.
 * @return array
 */
function get_sentences( string $text ): array {
	$sentences = preg_split( '/(?<=[.!?])\s+/', $text, -1, PREG_SPLIT_NO_EMPTY );
	return array_filter( $sentences, fn( $s ) => str_word_count( $s ) > 0 );
}

/**
 * Count syllables in text.
 *
 * @param  string $text Plain text.
 * @return int
 */
function count_syllables( string $text ): int {
	$words = str_word_count( strtolower( $text ), 1 );
	$total = 0;

	foreach ( $words as $word ) {
		$total += syllable_count( $word );
	}

	return $total;
}

/**
 * Count syllables in a single word.
 *
 * @param  string $word The word.
 * @return int
 */
function syllable_count( string $word ): int {
	$word = strtolower( trim( $word ) );

	if ( strlen( $word ) <= 3 ) {
		return 1;
	}

	// Remove common word endings.
	$word = preg_replace( '/(?:es|ed|e)$/', '', $word );

	// Count vowel groups.
	$count = preg_match_all( '/[aeiouy]+/', $word );

	return max( 1, $count );
}

/**
 * Convert grade level to description.
 *
 * @param  float $grade Grade level.
 * @return string
 */
function grade_to_description( float $grade ): string {
	if ( $grade <= 5 ) {
		return __( 'Elementary school', 'vip-workflows' );
	} elseif ( $grade <= 8 ) {
		return __( 'Middle school', 'vip-workflows' );
	} elseif ( $grade <= 12 ) {
		return __( 'High school', 'vip-workflows' );
	} else {
		return __( 'College level', 'vip-workflows' );
	}
}

/**
 * Convert Flesch ease to description.
 *
 * @param  float $ease Flesch ease score.
 * @return string
 */
function ease_to_description( float $ease ): string {
	if ( $ease >= 80 ) {
		return __( 'Very easy to read.', 'vip-workflows' );
	} elseif ( $ease >= 60 ) {
		return __( 'Easy to read.', 'vip-workflows' );
	} elseif ( $ease >= 40 ) {
		return __( 'Moderately difficult.', 'vip-workflows' );
	} elseif ( $ease >= 20 ) {
		return __( 'Difficult to read.', 'vip-workflows' );
	} else {
		return __( 'Very difficult to read.', 'vip-workflows' );
	}
}
