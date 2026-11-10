<?php
/**
 * Archive Search Interface.
 *
 * Swappable provider for searching the newsroom's own published content.
 * Phase 1: LLM-assisted WP_Query. Future: Elasticsearch, vector DB.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Assistants;

interface ArchiveSearchInterface {

	/**
	 * Search published articles related to the ideation seed.
	 *
	 * @param string $seed             The raw seed text.
	 * @param array  $extracted_topics Tags/topics from the Seed Analyst.
	 * @param array  $search_queries   Optimized search queries from the Seed Analyst.
	 * @param int    $limit            Maximum results to return.
	 * @return array Array of article results with: id, title, url, excerpt, date, author, thumbnail.
	 */
	public function search( string $seed, array $extracted_topics, array $search_queries = array(), int $limit = 10 ): array;
}
