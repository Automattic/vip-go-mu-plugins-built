<?php
/**
 * Autoloader path resolution.
 *
 * Single source of truth for mapping VIPWorkflows class names to file paths.
 * Used by the autoloader in vip-workflows.php and the path-naming guard test
 * in tests/phpunit/Unit/AutoloaderPathsTest.php. No side effects — safe to
 * require multiple times.
 *
 * Lives outside includes/ because the autoloader requires it before
 * managing that directory.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows;

if ( ! function_exists( __NAMESPACE__ . '\\class_to_relative_path' ) ) {
	/**
	 * Map a fully-qualified class name to its expected path under includes/.
	 *
	 * Handles acronyms (YouTubeTranscript -> you-tube-transcript) and camelCase
	 * (MediaProcessor -> media-processor). Returns null for classes outside the
	 * VIPWorkflows namespace.
	 *
	 * @param string $class_name The fully-qualified class name.
	 * @return string|null Path relative to includes/ (e.g. "integrations/class-foo.php"), or null.
	 */
	function class_to_relative_path( string $class_name ): ?string {
		$namespace = 'VIPWorkflows\\';

		if ( strpos( $class_name, $namespace ) !== 0 ) {
			return null;
		}

		$relative_class = substr( $class_name, strlen( $namespace ) );
		$parts          = explode( '\\', $relative_class );
		$class_file     = array_pop( $parts );

		// First, handle transitions from uppercase acronyms to capitalized words (e.g., APIController -> API-Controller).
		$class_file = preg_replace( '/([A-Z]+)([A-Z][a-z])/', '$1-$2', $class_file );
		// Then, handle normal camelCase (e.g., MediaAnalyzer -> Media-Analyzer).
		$class_file = preg_replace( '/([a-z])([A-Z])/', '$1-$2', $class_file );
		$class_file = 'class-' . strtolower( $class_file ) . '.php';

		$path = '';
		if ( ! empty( $parts ) ) {
			$dirs = array_map(
				function ( $dir ) {
					return strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $dir ) );
				},
				$parts
			);
			$path = implode( '/', $dirs ) . '/';
		}

		return $path . $class_file;
	}
}
