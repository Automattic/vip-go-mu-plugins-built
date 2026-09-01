<?php
/**
 * Keyword Check ability - WordPress Abilities API compatible.
 *
 * Flags content containing specified keywords.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the keyword check.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_keyword_check( ?array $input = null ) {
	$input   = $input ?? array();
	$content = '';
	$title   = '';
	$post    = null;

	// Get content from post or input.
	if ( ! empty( $input['post_id'] ) ) {
		$post = get_post( $input['post_id'] );
		if ( $post ) {
			$permission_error = require_post_edit_permission( (int) $input['post_id'] );
			if ( $permission_error ) {
				return $permission_error;
			}

			$content = $post->post_content;
			$title   = $post->post_title;
		}
	} elseif ( ! empty( $input['content'] ) ) {
		$content = $input['content'];
		$title   = $input['title'] ?? '';
	}

	if ( empty( $content ) && empty( $title ) ) {
		return new \WP_Error(
			'no_content',
			__( 'No content to analyze.', 'vip-workflows' )
		);
	}

	$settings = \VIPWorkflows\Abilities\AbilitySettings::get_instance()->get_options( 'vip-workflows/keyword-check' );

	// Get flagged words from settings.
	$flagged_words = array();
	$raw_words     = $settings['flagged_words'] ?? '';
	if ( ! empty( $raw_words ) ) {
		if ( is_array( $raw_words ) ) {
			$flagged_words = $raw_words;
		} elseif ( is_string( $raw_words ) ) {
			$flagged_words = array_map( 'trim', explode( ',', $raw_words ) );
		}
	}

	// Filter out empty values.
	$flagged_words = array_filter(
		$flagged_words,
		function ( $word ) {
			return ! empty( trim( $word ) );
		}
	);

	if ( empty( $flagged_words ) ) {
		// No words to check - pass by default.
		return array(
			'score'       => 100,
			'status'      => 'pass',
			'summary'     => __( 'No flagged words configured.', 'vip-workflows' ),
			'issues'      => array(),
			'suggestions' => array(),
			'analysis'    => array(
				'flagged_words_checked' => 0,
				'matches_found'         => 0,
			),
		);
	}

	$issues      = array();
	$suggestions = array();
	$analysis    = array(
		'flagged_words_checked' => count( $flagged_words ),
		'matches_found'         => 0,
		'matches'               => array(),
	);
	$score       = 100;

	// Combine title and content for checking.
	$full_text       = $title . ' ' . wp_strip_all_tags( $content );
	$full_text_lower = strtolower( $full_text );

	$case_sensitive = $settings['case_sensitive'] ?? false;

	// Check each flagged word.
	foreach ( $flagged_words as $word ) {
		$word = trim( $word );
		if ( empty( $word ) ) {
			continue;
		}

		$search_word = $case_sensitive ? $word : strtolower( $word );
		$search_text = $case_sensitive ? $full_text : $full_text_lower;

		// Use word boundary matching to avoid partial matches.
		// e.g., "test" shouldn't match "testing" unless configured.
		$match_partial = $settings['match_partial'] ?? false;

		if ( $match_partial ) {
			$found = strpos( $search_text, $search_word ) !== false;
			$count = substr_count( $search_text, $search_word );
		} else {
			// Word boundary matching.
			$pattern = '/\b' . preg_quote( $search_word, '/' ) . '\b/';
			if ( ! $case_sensitive ) {
				$pattern .= 'i';
			}
			$found = preg_match( $pattern, $full_text );
			$count = preg_match_all( $pattern, $full_text );
		}

		if ( $found ) {
			$analysis['matches_found']++;
			$analysis['matches'][] = array(
				'word'  => $word,
				'count' => $count,
			);

			// Each flagged word found reduces score.
			$score   -= 20;
			$issues[] = array(
				'type'      => 'flagged_word',
				'check_key' => 'flagged_words',
				'message'   => sprintf(
				/* translators: 1: The flagged word, 2: Number of occurrences */
					_n(
						'Found flagged word "%1$s" (%2$d occurrence).',
						'Found flagged word "%1$s" (%2$d occurrences).',
						$count,
						'vip-workflows'
					),
					esc_html( $word ),
					$count
				),
				'severity'  => 'warning',
				'data'      => array(
					'word'  => $word,
					'count' => $count,
				),
			);
		}
	}

	// Ensure score doesn't go below 0.
	$score = max( 0, $score );

	// Determine status.
	if ( $score >= 80 ) {
		$status = 'pass';
	} elseif ( $score >= 50 ) {
		$status = 'warning';
	} else {
		$status = 'fail';
	}

	// Generate summary.
	$matches_found = $analysis['matches_found'];
	if ( 0 === $matches_found ) {
		$summary = __( 'No flagged words found.', 'vip-workflows' );
	} else {
		$summary = sprintf(
		/* translators: %d: Number of flagged words found */
			_n(
				'Found %d flagged word in content.',
				'Found %d flagged words in content.',
				$matches_found,
				'vip-workflows'
			),
			$matches_found
		);
	}

	// Add suggestion if issues found.
	if ( ! empty( $issues ) ) {
		$suggestions[] = array(
			'type'    => 'review_content',
			'message' => __( 'Review and remove or replace the flagged words before publishing.', 'vip-workflows' ),
		);
	}

	return array(
		'score'       => $score,
		'status'      => $status,
		'summary'     => $summary,
		'issues'      => $issues,
		'suggestions' => $suggestions,
		'analysis'    => $analysis,
	);
}

/**
 * Permission callback for keyword check.
 *
 * @return bool|\WP_Error
 */
function can_execute_keyword_check() {
	if ( current_user_can( 'edit_posts' ) ) {
		return true;
	}

	return new \WP_Error(
		'rest_forbidden',
		__( 'You do not have permission to execute this ability.', 'vip-workflows' ),
		array( 'status' => 403 )
	);
}

/**
 * Register the keyword check ability.
 *
 * Called on wp_abilities_api_init hook.
 *
 * @return void
 */
function register_keyword_check(): void {
	wp_register_ability(
		'vip-workflows/keyword-check',
		array(
			'label'               => __( 'Keyword Check', 'vip-workflows' ),
			'description'         => __( 'Flag content containing specified keywords (e.g., banned words, competitor names, sensitive terms).', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'post_id'        => array(
						'type'        => 'integer',
						'description' => __( 'The post ID to analyze.', 'vip-workflows' ),
					),
					'content'        => array(
						'type'        => 'string',
						'description' => __( 'Raw content to analyze (alternative to post_id).', 'vip-workflows' ),
					),
					'title'          => array(
						'type'        => 'string',
						'description' => __( 'Post title (required if using content).', 'vip-workflows' ),
					),
					'flagged_words'  => array(
						'type'        => 'string',
						'description' => __( 'Comma-separated list of words to flag.', 'vip-workflows' ),
					),
					'case_sensitive' => array(
						'type'        => 'boolean',
						'description' => __( 'Match case-sensitive.', 'vip-workflows' ),
					),
					'match_partial'  => array(
						'type'        => 'boolean',
						'description' => __( 'Match partial words (e.g., "test" matches "testing").', 'vip-workflows' ),
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
						'description' => __( 'Score from 0-100 (lower = more flagged words).', 'vip-workflows' ),
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
					'issues'      => array(
						'type'        => 'array',
						'description' => __( 'List of flagged words found.', 'vip-workflows' ),
					),
					'suggestions' => array(
						'type'        => 'array',
						'description' => __( 'List of improvement suggestions.', 'vip-workflows' ),
					),
					'analysis'    => array(
						'type'        => 'object',
						'description' => __( 'Detailed analysis data.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_keyword_check',
			'permission_callback' => __NAMESPACE__ . '\\can_execute_keyword_check',
			'meta'                => array(
				'show_in_rest'        => true,
				'show_in_commands'    => true,
				'icon'                => 'tag',
				'type'                => 'check',
				'supports'            => array( 'workflow' ),
				'transition_eligible' => true,
				'settings_schema'     => array(
					'flagged_words'  => array(
						'type'        => 'string',
						'default'     => '',
						'label'       => __( 'Flagged words', 'vip-workflows' ),
						'description' => __( 'Comma-separated list of words to flag.', 'vip-workflows' ),
						'enforceable' => true,
					),
					'case_sensitive' => array(
						'type'        => 'boolean',
						'default'     => false,
						'label'       => __( 'Case-sensitive matching', 'vip-workflows' ),
					),
					'match_partial'  => array(
						'type'        => 'boolean',
						'default'     => false,
						'label'       => __( 'Match partial words', 'vip-workflows' ),
						'description' => __( 'e.g., "test" matches "testing"', 'vip-workflows' ),
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
