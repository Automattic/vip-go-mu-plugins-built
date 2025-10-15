<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Core;

/**
 * Service class for handling permastruct collection and formatting.
 *
 * @package Automattic\RewriteRulesInspector\Core
 * @since 1.5.0
 */
final class Permastructs {

	/**
	 * Get all permastructs that WordPress is aware of.
	 *
	 * @since 1.5.0
	 * @return array Array of permastructs with their names and structures.
	 */
	public function get_permastructs(): array {
		global $wp_rewrite;

		$permastructs = [];

		// Core permastructs.
		$permastructs = array_merge( $permastructs, $this->get_core_permastructs( $wp_rewrite ) );

		// Extra permastructs including tags, categories, etc.
		$permastructs = array_merge( $permastructs, $this->get_extra_permastructs( $wp_rewrite ) );

		// Filter out empty structures.
		$permastructs = array_filter(
			$permastructs,
			function ( $permastruct ) {
				return ! empty( $permastruct['structure'] );
			}
		);

		// Allow filtering of permastructs.
		$permastructs = apply_filters( 'rri_permastructs', $permastructs );

		return $permastructs;
	}

	/**
	 * Get core WordPress permastructs.
	 *
	 * @since 1.5.0
	 * @param \WP_Rewrite $wp_rewrite WordPress rewrite object.
	 * @return array Array of core permastructs.
	 */
	private function get_core_permastructs( \WP_Rewrite $wp_rewrite ): array {
		return [
			'post' => [
				'name'        => __( 'Post Permalink', 'rewrite-rules-inspector' ),
				'structure'   => $wp_rewrite->permalink_structure,
				'description' => __( 'The permalink structure for posts', 'rewrite-rules-inspector' ),
			],
			'date' => [
				'name'        => __( 'Date Archive', 'rewrite-rules-inspector' ),
				'structure'   => $wp_rewrite->get_date_permastruct(),
				'description' => __( 'The permalink structure for date archives', 'rewrite-rules-inspector' ),
			],
			'search' => [
				'name'        => __( 'Search Results', 'rewrite-rules-inspector' ),
				'structure'   => $wp_rewrite->get_search_permastruct(),
				'description' => __( 'The permalink structure for search results', 'rewrite-rules-inspector' ),
			],
			'author' => [
				'name'        => __( 'Author Archive', 'rewrite-rules-inspector' ),
				'structure'   => $wp_rewrite->get_author_permastruct(),
				'description' => __( 'The permalink structure for author archives', 'rewrite-rules-inspector' ),
			],
			'comments' => [
				'name'        => __( 'Comments', 'rewrite-rules-inspector' ),
				'structure'   => $wp_rewrite->root . $wp_rewrite->comments_base,
				'description' => __( 'The permalink structure for comments', 'rewrite-rules-inspector' ),
			],
			'root' => [
				'name'        => __( 'Root', 'rewrite-rules-inspector' ),
				'structure'   => $wp_rewrite->root . '/',
				'description' => __( 'The root permalink structure', 'rewrite-rules-inspector' ),
			],
		];
	}

	/**
	 * Get extra permastructs (tags, categories, custom, etc.).
	 *
	 * @since 1.5.0
	 * @param \WP_Rewrite $wp_rewrite WordPress rewrite object.
	 * @return array Array of extra permastructs.
	 */
	private function get_extra_permastructs( \WP_Rewrite $wp_rewrite ): array {
		$permastructs = [];

		foreach ( $wp_rewrite->extra_permastructs as $permastructname => $permastruct ) {
			$structure = $this->extract_permastruct_structure( $permastruct );

			// Generate human-readable names and descriptions.
			$name        = ucwords( str_replace( [ '_', '-' ], ' ', $permastructname ) );
			/* translators: %s: permastruct name */
			$description = sprintf( __( 'The permalink structure for %s', 'rewrite-rules-inspector' ), strtolower( $name ) );

			// Apply special cases for common permastructs.
			$special_case = $this->get_special_case_permastruct( $permastructname );
			if ( $special_case ) {
				$name        = $special_case['name'];
				$description = $special_case['description'];
			}

			$permastructs[ $permastructname ] = [
				'name'        => $name,
				'structure'   => $structure,
				'description' => $description,
			];
		}

		return $permastructs;
	}

	/**
	 * Extract structure from permastruct data.
	 *
	 * @since 1.5.0
	 * @param mixed $permastruct Permastruct data.
	 * @return string The permastruct structure.
	 */
	private function extract_permastruct_structure( $permastruct ): string {
		$structure = '';
		if ( is_array( $permastruct ) ) {
			// Pre 3.4 compat.
			if ( count( $permastruct ) === 2 ) {
				$structure = $permastruct[0];
			} else {
				$structure = $permastruct['struct'] ?? '';
			}
		} else {
			$structure = $permastruct;
		}

		return $structure;
	}

	/**
	 * Get special case permastruct information.
	 *
	 * @since 1.5.0
	 * @param string $permastructname The permastruct name.
	 * @return array|null Special case data or null.
	 */
	private function get_special_case_permastruct( string $permastructname ): ?array {
		$special_cases = [
			'category' => [
				'name'        => __( 'Category Archive', 'rewrite-rules-inspector' ),
				'description' => __( 'The permalink structure for category archives', 'rewrite-rules-inspector' ),
			],
			'post_tag' => [
				'name'        => __( 'Tag Archive', 'rewrite-rules-inspector' ),
				'description' => __( 'The permalink structure for tag archives', 'rewrite-rules-inspector' ),
			],
			'post_format' => [
				'name'        => __( 'Post Format Archive', 'rewrite-rules-inspector' ),
				'description' => __( 'The permalink structure for post format archives', 'rewrite-rules-inspector' ),
			],
			'test_custom' => [
				'name'        => __( 'Test Custom (Demo)', 'rewrite-rules-inspector' ),
				'description' => __( 'A custom permastruct added for testing the permastructs display feature', 'rewrite-rules-inspector' ),
			],
			'demo_archive' => [
				'name'        => __( 'Demo Archive (Test)', 'rewrite-rules-inspector' ),
				'description' => __( 'A demo archive permastruct with date-based structure for testing', 'rewrite-rules-inspector' ),
			],
		];

		return $special_cases[ $permastructname ] ?? null;
	}
}
