<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Core;

/**
 * Service class for testing URLs against rewrite rules.
 *
 * @package Automattic\RewriteRulesInspector\Core
 * @since 1.5.0
 */
final class UrlTester {

	/**
	 * Test a URL against a specific set of rewrite rules and return detailed match information.
	 *
	 * @since 1.5.0
	 * @param string $url The URL to test.
	 * @param array  $rules Array of rewrite rules to test against.
	 * @return array Detailed test results.
	 */
	public function test_url_with_rules( string $url, array $rules ): array {
		// Parse the URL to get the path component.
		$parsed_url = wp_parse_url( $url );
		$path = $parsed_url['path'] ?? '/';
		
		// If wp_parse_url returns null for path, treat the input as a path.
		if ( null === $parsed_url['path'] && ! preg_match( '/^https?:\/\//', $url ) ) {
			$path = $url;
		}

		// Remove WordPress subdirectory if the site is in a subdirectory.
		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );
		if ( ! empty( $home_path ) ) {
			$path = str_replace( $home_path, '', $path );
		}

		$path = ltrim( $path, '/' );

		// Test against each rule and collect matches.
		$matches = [];
		$first_match = null;

		foreach ( $rules as $rule => $data ) {
			$rewrite = is_array( $data ) ? $data['rewrite'] : $data;
			
			if ( preg_match( sprintf( '#^%s#', $rule ), $path, $rule_matches ) ) {
				$match_info = [
					'rule' => $rule,
					'rewrite' => $rewrite,
					'matches' => $rule_matches,
					'query_vars' => $this->extract_query_vars( $rewrite, $rule_matches ),
					'source' => is_array( $data ) ? ( $data['source'] ?? 'other' ) : 'other',
				];

				$matches[] = $match_info;

				// The first match is the one WordPress would use.
				if ( null === $first_match ) {
					$first_match = $match_info;
				}
			}
		}

		// Determine if this would result in a 404.
		$is_404 = empty( $matches );

		// Get the final query that WordPress would execute.
		$final_query = null;
		if ( $first_match ) {
			$final_query = $this->build_final_query( $first_match['rewrite'], $first_match['matches'] );
		}

		return [
			'url' => $url,
			'path' => $path,
			'is_404' => $is_404,
			'matches' => $matches,
			'first_match' => $first_match,
			'final_query' => $final_query,
			'total_rules_tested' => count( $rules ),
		];
	}

	/**
	 * Test a URL against all rewrite rules and return detailed match information.
	 *
	 * @since 1.5.0
	 * @param string $url The URL to test.
	 * @return array Detailed test results.
	 */
	public function test_url( string $url ): array {
		global $wp_rewrite;

		// Parse the URL to get the path component.
		$parsed_url = wp_parse_url( $url );
		$path = $parsed_url['path'] ?? '/';
		
		// If wp_parse_url returns null for path, treat the input as a path.
		if ( null === $parsed_url['path'] && ! preg_match( '/^https?:\/\//', $url ) ) {
			$path = $url;
		}

		// Remove WordPress subdirectory if the site is in a subdirectory.
		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );
		if ( ! empty( $home_path ) ) {
			$path = str_replace( $home_path, '', $path );
		}

		$path = ltrim( $path, '/' );

		// Get all rewrite rules using the same method as RewriteRules service.
		$rewrite_rules = get_option( 'rewrite_rules' );
		if ( ! $rewrite_rules ) {
			$rewrite_rules = [];
		}

		// Also check for missing rules that should be generated.
		$maybe_missing = $wp_rewrite->rewrite_rules();
		foreach ( $maybe_missing as $rule => $rewrite ) {
			if ( ! array_key_exists( $rule, $rewrite_rules ) ) {
				$rewrite_rules[ $rule ] = $rewrite;
			}
		}

		// Test against each rule and collect matches.
		$matches = [];
		$first_match = null;

		foreach ( $rewrite_rules as $rule => $rewrite ) {
			if ( preg_match( sprintf( '#^%s#', $rule ), $path, $rule_matches ) ) {
				$match_info = [
					'rule' => $rule,
					'rewrite' => $rewrite,
					'matches' => $rule_matches,
					'query_vars' => $this->extract_query_vars( $rewrite, $rule_matches ),
					'source' => $this->get_rule_source( $rule, $rewrite ),
				];

				$matches[] = $match_info;

				// The first match is the one WordPress would use.
				if ( null === $first_match ) {
					$first_match = $match_info;
				}
			}
		}

		// Determine if this would result in a 404.
		$is_404 = empty( $matches );

		// Get the final query that WordPress would execute.
		$final_query = null;
		if ( $first_match ) {
			$final_query = $this->build_final_query( $first_match['rewrite'], $first_match['matches'] );
		}

		return [
			'url' => $url,
			'path' => $path,
			'is_404' => $is_404,
			'matches' => $matches,
			'first_match' => $first_match,
			'final_query' => $final_query,
			'total_rules_tested' => count( $rewrite_rules ),
		];
	}

	/**
	 * Extract query variables from a rewrite rule.
	 *
	 * @since 1.5.0
	 * @param string $rewrite The rewrite rule.
	 * @param array  $matches The regex matches.
	 * @return array Extracted query variables.
	 */
	private function extract_query_vars( string $rewrite, array $matches ): array {
		$query_vars = [];

		// Parse the rewrite rule to find query variable assignments.
		if ( preg_match_all( '/([^=&]+)=([^&]+)/', $rewrite, $var_matches, PREG_SET_ORDER ) ) {
			foreach ( $var_matches as $var_match ) {
				$key = $var_match[1];
				$value = $var_match[2];

				// Replace $matches[n] with actual values.
				$value = preg_replace_callback(
					'/\$matches\[(\d+)\]/',
					function ( $m ) use ( $matches ) {
						$index = (int) $m[1];
						return isset( $matches[ $index ] ) && $matches[ $index ] !== '' ? $matches[ $index ] : '';
					},
					$value
				);

				$query_vars[ $key ] = $value;
			}
		}

		return $query_vars;
	}

	/**
	 * Get the source of a rewrite rule.
	 *
	 * @since 1.5.0
	 * @param string $rule The rewrite rule pattern.
	 * @param string $rewrite The rewrite rule target.
	 * @return string The rule source.
	 */
	private function get_rule_source( string $rule, string $rewrite ): string {
		// This is a simplified version - in a full implementation,
		// you'd want to use the same logic as RewriteRules::generate_rules_by_source()
		// to determine the actual source.

		// Common patterns to identify sources.
		if ( strpos( $rewrite, 'category_name' ) !== false ) {
			return 'category';
		}
		if ( strpos( $rewrite, 'tag=' ) !== false ) {
			return 'post_tag';
		}
		if ( strpos( $rewrite, 'p=' ) !== false ) {
			return 'post';
		}
		if ( strpos( $rewrite, 'page_id' ) !== false ) {
			return 'page';
		}
		if ( strpos( $rewrite, 'author_name' ) !== false ) {
			return 'author';
		}
		if ( strpos( $rewrite, 'year=' ) !== false ) {
			return 'date';
		}

		return 'other';
	}

	/**
	 * Build the final query string that WordPress would execute.
	 *
	 * @since 1.5.0
	 * @param string $rewrite The rewrite rule.
	 * @param array  $matches The regex matches.
	 * @return string The final query string.
	 */
	private function build_final_query( string $rewrite, array $matches ): string {
		// Replace $matches[n] with actual values.
		$query = preg_replace_callback(
			'/\$matches\[(\d+)\]/',
			function ( $m ) use ( $matches ) {
				$index = (int) $m[1];
				return isset( $matches[ $index ] ) && $matches[ $index ] !== '' ? $matches[ $index ] : '';
			},
			$rewrite
		);

		return $query;
	}

	/**
	 * Get a human-readable explanation of the test results.
	 *
	 * @since 1.5.0
	 * @param array $results The test results from test_url().
	 * @return string Human-readable explanation.
	 */
	public function explain_results( array $results ): string {
		if ( $results['is_404'] ) {
			return sprintf(
				/* translators: %1$s: URL, %2$d: Number of rules tested */
				__( 'The URL "%1$s" does not match any of the %2$d rewrite rules and would result in a 404 error.', 'rewrite-rules-inspector' ),
				$results['url'],
				$results['total_rules_tested']
			);
		}

		$match_count = count( $results['matches'] );
		$first_match = $results['first_match'];

		if ( $match_count === 1 ) {
			return sprintf(
				/* translators: %1$s: URL, %2$s: Rule pattern */
				__( 'The URL "%1$s" matches exactly one rewrite rule: %2$s', 'rewrite-rules-inspector' ),
				$results['url'],
				$first_match['rule']
			);
		}

		return sprintf(
			/* translators: %1$s: URL, %2$d: Number of matches, %3$s: First matching rule */
			__( 'The URL "%1$s" matches %2$d rewrite rules. The first match (which WordPress will use) is: %3$s', 'rewrite-rules-inspector' ),
			$results['url'],
			$match_count,
			$first_match['rule']
		);
	}

	/**
	 * Format test results for CLI output.
	 *
	 * @since 1.5.0
	 * @param array $results The test results from test_url().
	 * @param bool  $verbose Whether to include verbose output.
	 * @return string Formatted CLI output.
	 */
	public function format_for_cli( array $results, bool $verbose = false ): string {
		$output = [];

		$output[] = sprintf( 'Testing URL: %s', $results['url'] );
		$output[] = sprintf( 'Path tested: %s', $results['path'] );
		$output[] = '';

		if ( $results['is_404'] ) {
			$output[] = '❌ Result: 404 (No matching rules found)';
			$output[] = sprintf( 'Tested against %d rewrite rules', $results['total_rules_tested'] );
		} else {
			$output[] = '✅ Result: Found matching rule(s)';
			$output[] = sprintf( 'Total matches: %d', count( $results['matches'] ) );
			$output[] = '';

			$first_match = $results['first_match'];
			$output[] = 'First match (WordPress will use this):';
			$output[] = sprintf( '  Rule: %s', $first_match['rule'] );
			$output[] = sprintf( '  Rewrite: %s', $first_match['rewrite'] );
			$output[] = sprintf( '  Source: %s', $first_match['source'] );

			if ( $verbose && ! empty( $first_match['query_vars'] ) ) {
				$output[] = '  Query variables:';
				foreach ( $first_match['query_vars'] as $key => $value ) {
					$output[] = sprintf( '    %s = %s', $key, $value );
				}
			}

			if ( $verbose && count( $results['matches'] ) > 1 ) {
				$output[] = '';
				$output[] = 'All matching rules:';
				foreach ( $results['matches'] as $index => $match ) {
					$output[] = sprintf( '  %d. %s (source: %s)', $index + 1, $match['rule'], $match['source'] );
				}
			}
		}

		return implode( "\n", $output );
	}
}
