<?php
/**
 * Web Researcher - Research Ability.
 *
 * Searches the open web via the configured search provider (Tavily)
 * for external context, background, and competing coverage.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

use VIPWorkflows\Abilities\Availability;
use VIPWorkflows\Abilities\RequirementFactory;
use VIPWorkflows\Abilities\RequirementGroup;
use VIPWorkflows\Ideation\Research\SearchProviders\SearchProviderRegistry;

/**
 * Web Researcher.
 */
class WebResearcher {

	/**
	 * Register as an ability.
	 */
	public static function register_ability(): void {
		vip_workflows_register_ability(
			'vip-workflows/web-researcher',
			array(
				'label'               => __( 'Web Researcher', 'vip-workflows' ),
				'description'         => __( 'Searches the open web for external context, background, and competing coverage.', 'vip-workflows' ),
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
					'display_order'         => 20,
					'show_in_rest'          => true,
					'show_in_commands'      => false,
					'transition_eligible'   => false,
					'icon'                  => 'search',
					'thinking_message'      => __( 'Searching the web...', 'vip-workflows' ),
					'success_message'       => __( 'Web research complete.', 'vip-workflows' ),
					'availability_callback' => array( self::class, 'check_availability' ),
				),
			)
		);
	}

	/**
	 * Check if a web search provider is configured.
	 *
	 * Two different things can be missing and they need different copy: no search
	 * provider is registered at all — a code-level gap a site owner cannot fix by
	 * entering a key — versus the selected provider having no credential, which
	 * has a destination. Collapsing both into one message sends half the readers
	 * somewhere useless.
	 *
	 * @since 0.0.1
	 *
	 * @return bool|Availability True when a provider is configured, otherwise the unmet requirements.
	 */
	public static function check_availability(): bool|Availability {
		$source   = array( __( 'Web Researcher', 'vip-workflows' ) );
		$provider = SearchProviderRegistry::get_instance()->get_selected();

		if ( null === $provider ) {
			return Availability::unmet(
				RequirementGroup::all(
					RequirementFactory::dependency(
						'dependency:search-provider',
						__( 'No web search provider is registered, so there is nothing to search with.', 'vip-workflows' ),
						__( 'Web search is not available on this site.', 'vip-workflows' ),
						$source
					)
				)
			);
		}

		if ( $provider->is_configured() ) {
			return true;
		}

		// The provider names its own credential, so a replacement search provider
		// reports its own service rather than inheriting Tavily's.
		return Availability::unmet(
			RequirementGroup::all(
				RequirementFactory::missing_credential( $provider->get_id(), $provider->get_name(), $source )
			)
		);
	}

	/**
	 * Execute the web search.
	 *
	 * @param  array $input Input parameters.
	 * @return array { cards: array, summary: string }
	 */
	public static function execute( array $input ): array {
		$seed          = $input['seed'] ?? '';
		$seed_analysis = $input['seed_analysis'] ?? array();

		$queries = ! empty( $input['query'] )
			? array( $input['query'] )
			: ( $seed_analysis['search_queries'] ?? array( $seed ) );

		$provider = SearchProviderRegistry::get_instance()->get_selected();

		$all_results = array();
		$seen_urls   = array();

		foreach ( $queries as $query ) {
			if ( empty( $query ) ) {
				continue;
			}

			$results = $provider->search( $query, 5 );
			if ( is_wp_error( $results ) ) {
				continue;
			}

			foreach ( $results as $result ) {
				$url = $result['url'] ?? '';
				if ( empty( $url ) || isset( $seen_urls[ $url ] ) ) {
					continue;
				}
				$seen_urls[ $url ] = true;
				$all_results[]     = $result;
			}
		}

		if ( empty( $all_results ) ) {
			return array(
				'cards'   => array(),
				'summary' => __( 'No relevant web results found.', 'vip-workflows' ),
			);
		}

		$cards = array();
		foreach ( array_slice( $all_results, 0, 8 ) as $result ) {
			$cards[] = array(
				'type'        => 'web-article',
				'source_type' => 'article',
				'origin'      => 'search',
				'title'       => $result['title'] ?? '',
				'url'         => $result['url'] ?? '',
				'domain'      => $result['domain'] ?? '',
				'excerpt'     => $result['excerpt'] ?? '',
				'content'     => $result['content'] ?? '',
				'image'       => $result['image'] ?? null,
				'date'        => $result['published_at'] ?? null,
				'author'      => $result['author'] ?? null,
				'score'       => $result['score'] ?? null,
				'source'      => 'web-researcher',
			);
		}

		$summary = sprintf(
			/* translators: %d: article count */
			__( 'Found %d articles from the web.', 'vip-workflows' ),
			count( $cards )
		);

		return array(
			'cards'   => $cards,
			'summary' => $summary,
		);
	}
}
