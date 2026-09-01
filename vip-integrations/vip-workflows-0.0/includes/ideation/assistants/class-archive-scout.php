<?php
/**
 * Archive Scout - Research Ability.
 *
 * Searches the newsroom's own published articles for related past coverage.
 * Uses a swappable ArchiveSearchInterface (default: LLM-assisted WP_Query).
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

/**
 * Archive Scout.
 */
class ArchiveScout {

	/**
	 * Register as an ability.
	 */
	public static function register_ability(): void {
		vip_workflows_register_ability(
			'vip-workflows/archive-scout',
			array(
				'label'               => __( 'Archive Scout', 'vip-workflows' ),
				'description'         => __( 'Searches your published archive for related past coverage.', 'vip-workflows' ),
				'category'            => 'research',
				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'project_id'    => array( 'type' => 'integer' ),
						'seed'          => array( 'type' => 'string' ),
						'seed_analysis' => array( 'type' => 'object' ),
						'query'         => array( 'type' => 'string' ),
					),
					'required'   => array( 'seed' ),
				),
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'cards'   => array( 'type' => 'array' ),
						'summary' => array( 'type' => 'string' ),
					),
				),
				'execute_callback'    => array( self::class, 'execute' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'meta'                => array(
					'type'                  => 'research',
					'display_order'         => 10,
					'show_in_rest'          => true,
					'show_in_commands'      => false,
					'transition_eligible'   => false,
					'icon'                  => 'archive',
					'thinking_message'      => __( 'Searching your archive...', 'vip-workflows' ),
					'success_message'       => __( 'Archive search complete.', 'vip-workflows' ),
				),
			)
		);
	}

	/**
	 * Execute the archive search.
	 *
	 * @param  array $input Input parameters.
	 * @return array { cards: array, summary: string }
	 */
	public static function execute( array $input ): array {
		$seed          = $input['seed'] ?? '';
		$seed_analysis = $input['seed_analysis'] ?? array();
		$custom_query  = $input['query'] ?? '';

		if ( ! empty( $custom_query ) ) {
			$topics  = array();
			$queries = array( $custom_query );
		} else {
			$topics  = $seed_analysis['tags'] ?? array();
			$queries = $seed_analysis['search_queries'] ?? array();
		}

		$search  = new LLMAssistedWPSearch();
		$results = $search->search( $seed, $topics, $queries, 8 );

		if ( empty( $results ) ) {
			return array(
				'cards'   => array(),
				'summary' => __( 'No related articles found in your archive.', 'vip-workflows' ),
			);
		}

		$cards = array();
		foreach ( $results as $article ) {
			$cards[] = array(
				'type'        => 'archive-article',
				'source_type' => 'article',
				'origin'      => 'archive',
				'title'       => $article['title'],
				'url'         => $article['url'],
				'excerpt'     => $article['excerpt'],
				'date'        => $article['date'],
				'author'      => $article['author'],
				'thumbnail'   => $article['thumbnail'] ?? null,
				'post_id'     => $article['id'],
				'source'      => 'archive-scout',
			);
		}

		$count   = count( $cards );
		$summary = sprintf(
			/* translators: %d: number of articles */
			_n(
				'Found %d related article in your archive.',
				'Found %d related articles in your archive.',
				$count,
				'vip-workflows'
			),
			$count
		);

		return array(
			'cards'   => $cards,
			'summary' => $summary,
		);
	}
}
