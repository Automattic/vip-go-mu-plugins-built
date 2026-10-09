<?php
/**
 * First-party autoloader for the Share a Draft plugin.
 *
 * The plugin has no runtime Composer dependencies: every class and interface
 * lives directly in inc/ under the Automattic\ShareADraft namespace and follows
 * the WordPress `class-<name>.php` / `interface-<name>.php` file-naming
 * convention. Registering this small autoloader lets the deployed plugin resolve
 * its classes without Composer's generated `vendor/autoload.php`, so no vendor/
 * directory needs shipping. Composer's classmap is still used for local
 * development and the test suites, which load `vendor/autoload.php` directly.
 */

namespace Automattic\ShareADraft;

spl_autoload_register(
	static function ( string $class_name ): void {
		$prefix = __NAMESPACE__ . '\\';

		if ( ! str_starts_with( $class_name, $prefix ) ) {
			return;
		}

		// All classes live directly in inc/; there are no sub-namespaces to map.
		$relative = substr( $class_name, strlen( $prefix ) );
		if ( str_contains( $relative, '\\' ) ) {
			return;
		}

		$slug = strtolower( $relative );

		foreach ( [ 'class', 'interface' ] as $type ) {
			$file = __DIR__ . "/{$type}-{$slug}.php";
			if ( is_readable( $file ) ) {
				// The path is composed from this directory and a validated slug;
				// the dynamic include is inherent to an autoloader.
				require_once $file; // phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
				return;
			}
		}
	}
);
