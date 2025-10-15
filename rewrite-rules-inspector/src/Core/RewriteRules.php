<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Core;

/**
 * Service class for handling rewrite rules generation and filtering.
 *
 * @package Automattic\RewriteRulesInspector\Core
 * @since 1.5.0
 */
final class RewriteRules {

	/**
	 * Sources of rules.
	 *
	 * @var array $sources
	 */
	private array $sources = [];

	/**
	 * Get the rewrite rules for the current view.
	 *
	 * @since 1.5.0
	 * @return array Array of rewrite rules with their sources.
	 */
	public function get_rules(): array {
		global $wp_rewrite;

		$rewrite_rules_array = [];
		$rewrite_rules       = get_option( 'rewrite_rules' );
		if ( ! $rewrite_rules ) {
			$rewrite_rules = [];
		}

		// Track down which rewrite rules are associated with which methods by breaking it down.
		$rewrite_rules_by_source = $this->generate_rules_by_source( $wp_rewrite );

		// Apply the filters used in core just in case.
		foreach ( $rewrite_rules_by_source as $source => $rules ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- core hook.
			$rewrite_rules_by_source[ $source ] = apply_filters( $source . '_rewrite_rules', $rules );
			if ( 'post_tag' === $source ) {
				// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core hook.
				$rewrite_rules_by_source[ $source ] = apply_filters( 'tag_rewrite_rules', $rules );
			}
		}

		// Match rules with their sources.
		foreach ( $rewrite_rules as $rule => $rewrite ) {
			$rewrite_rules_array[ $rule ]['rewrite'] = $rewrite;
			foreach ( $rewrite_rules_by_source as $source => $rules ) {
				if ( array_key_exists( $rule, $rules ) ) {
					$rewrite_rules_array[ $rule ]['source'] = $source;
				}
			}

			if ( ! isset( $rewrite_rules_array[ $rule ]['source'] ) ) {
				$rewrite_rules_array[ $rule ]['source'] = apply_filters( 'rewrite_rules_inspector_source', 'other', $rule, $rewrite );
			}
		}

		// Find any rewrite rules that should've been generated but weren't.
		$maybe_missing       = $wp_rewrite->rewrite_rules();
		$rewrite_rules_array = array_reverse( $rewrite_rules_array, true );
		foreach ( $maybe_missing as $rule => $rewrite ) {
			if ( ! array_key_exists( $rule, $rewrite_rules_array ) ) {
				$rewrite_rules_array[ $rule ] = [
					'rewrite' => $rewrite,
					'source'  => 'missing',
				];
			}
		}

		// Prepend rules so it's obvious.
		$rewrite_rules_array = array_reverse( $rewrite_rules_array, true );

		// Allow static sources of rewrite rules to override, etc.
		$rewrite_rules_array = apply_filters( 'rri_rewrite_rules', $rewrite_rules_array );

		// Set the sources used in our filtering.
		$sources = [ 'all' ];
		foreach ( $rewrite_rules_array as $rule => $data ) {
			$sources[] = $data['source'];
		}

		$this->sources = array_unique( $sources );

		// Apply filtering based on search and source.
		$rewrite_rules_array = $this->apply_filters( $rewrite_rules_array );

		return $rewrite_rules_array;
	}

	/**
	 * Generate rewrite rules by source.
	 *
	 * @since 1.5.0
	 * @param \WP_Rewrite $wp_rewrite WordPress rewrite object.
	 * @return array Array of rules organized by source.
	 */
	private function generate_rules_by_source( \WP_Rewrite $wp_rewrite ): array {
		$rewrite_rules_by_source = [];

		// Core permastructs.
		$rewrite_rules_by_source['post']     = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->permalink_structure, EP_PERMALINK );
		$rewrite_rules_by_source['date']     = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->get_date_permastruct(), EP_DATE );
		$rewrite_rules_by_source['root']     = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->root . '/', EP_ROOT );
		$rewrite_rules_by_source['comments'] = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->root . $wp_rewrite->comments_base, EP_COMMENTS, true, true, true, false );
		$rewrite_rules_by_source['search']   = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->get_search_permastruct(), EP_SEARCH );
		$rewrite_rules_by_source['author']   = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->get_author_permastruct(), EP_AUTHORS );
		$rewrite_rules_by_source['page']     = $wp_rewrite->page_rewrite_rules();

		// Extra permastructs including tags, categories, etc.
		foreach ( $wp_rewrite->extra_permastructs as $permastructname => $permastruct ) {
			if ( is_array( $permastruct ) ) {
				// Pre 3.4 compat.
				if ( count( $permastruct ) === 2 ) {
					$rewrite_rules_by_source[ $permastructname ] = $wp_rewrite->generate_rewrite_rules( $permastruct[0], $permastruct[1] );
				} else {
					$rewrite_rules_by_source[ $permastructname ] = $wp_rewrite->generate_rewrite_rules( $permastruct['struct'], $permastruct['ep_mask'], $permastruct['paged'], $permastruct['feed'], $permastruct['forcomments'], $permastruct['walk_dirs'], $permastruct['endpoints'] );
				}
			} else {
				$rewrite_rules_by_source[ $permastructname ] = $wp_rewrite->generate_rewrite_rules( $permastruct, EP_NONE );
			}
		}

		return $rewrite_rules_by_source;
	}

	/**
	 * Apply search and source filters to rules.
	 *
	 * @since 1.5.0
	 * @param array $rewrite_rules_array Array of rewrite rules.
	 * @return array Filtered array of rewrite rules.
	 */
	private function apply_filters( array $rewrite_rules_array ): array {
		$match_path = $this->get_search_path();

		$should_filter_by_source = ! empty( $_GET['source'] ) && 'all' !== $_GET['source'] && in_array( $_GET['source'], $this->sources, true );

		// Filter based on match or source if necessary.
		foreach ( $rewrite_rules_array as $rule => $data ) {
			// If we're searching rules based on URL and there's no match, don't return it.
			if ( $match_path !== '' && $match_path !== '0' && ! preg_match( sprintf( '#^%s#', $rule ), $match_path ) ) {
				unset( $rewrite_rules_array[ $rule ] );
			} elseif ( $should_filter_by_source && $data['source'] !== $_GET['source'] ) {
				unset( $rewrite_rules_array[ $rule ] );
			}
		}

		return $rewrite_rules_array;
	}

	/**
	 * Get the search path from URL parameter.
	 *
	 * @since 1.5.0
	 * @return string The search path.
	 */
	private function get_search_path(): string {
		$match_path = '';
		
		if ( ! empty( $_GET['s'] ) ) {
			$input = sanitize_text_field( $_GET['s'] );
			
			// If the input doesn't start with http:// or https://, treat it as a path.
			if ( ! preg_match( '/^https?:\/\//', $input ) ) {
				$match_path = $input;
			} else {
				$match_path = wp_parse_url( esc_url( $input ), PHP_URL_PATH );
			}
			
			// Ensure we have a string value.
			if ( null === $match_path ) {
				$match_path = '';
			}
			
			$wordpress_subdir_for_site = wp_parse_url( home_url(), PHP_URL_PATH );
			if ( ! empty( $wordpress_subdir_for_site ) ) {
				$match_path = str_replace( $wordpress_subdir_for_site, '', $match_path );
			}

			$match_path = ltrim( $match_path, '/' );
		}

		return $match_path;
	}

	/**
	 * Get available sources for filtering.
	 *
	 * @since 1.5.0
	 * @return array Array of available sources.
	 */
	public function get_sources(): array {
		return $this->sources;
	}
}
