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

		// Capture source rules during the full generation needed to detect missing rules.
		$generated = $this->generate_rules_with_sources( $wp_rewrite );
		$rewrite_rules_by_source = $generated['sources'];

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
		$maybe_missing       = $generated['rules'];
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
	 * Generate rules once and observe the final rules for each source.
	 *
	 * @since 1.6.1
	 * @param \WP_Rewrite $wp_rewrite WordPress rewrite object.
	 * @return array Generated rules and source attribution.
	 */
	private function generate_rules_with_sources( \WP_Rewrite $wp_rewrite ): array {
		$sources = array_unique( array_merge(
			array( 'post', 'date', 'root', 'comments', 'search', 'author', 'page' ),
			array_keys( $wp_rewrite->extra_permastructs )
		) );
		$by_source = array_fill_keys( $sources, array() );
		$callbacks = array();
		foreach ( $sources as $source ) {
			$callbacks[ $source . '_rewrite_rules' ] = static function ( $rules ) use ( &$by_source, $source ) {
				$by_source[ $source ] = $rules;
				return $rules;
			};
		}

		// Observe legacy tag filters only when another plugin already uses them.
		if ( isset( $by_source['post_tag'] ) && has_filter( 'tag_rewrite_rules' ) ) {
			$callbacks['tag_rewrite_rules'] = static function ( $rules ) use ( &$by_source ) {
				$by_source['post_tag'] = $rules;
				return $rules;
			};
		}

		foreach ( $callbacks as $hook => $callback ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Observing core hooks.
			add_filter( $hook, $callback, PHP_INT_MAX );
		}
		try {
			$rules = $wp_rewrite->rewrite_rules();
		} finally {
			foreach ( $callbacks as $hook => $callback ) {
				remove_filter( $hook, $callback, PHP_INT_MAX );
			}
		}

		return array( 'rules' => $rules, 'sources' => $by_source );
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
		if ( empty( $_GET['s'] ) ) {
			return '';
		}

		// Use the same path as the URL tester so filtering and testing agree.
		return ( new UrlTester() )->get_path( sanitize_text_field( $_GET['s'] ) );
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
