<?php
/**
 * Rector configuration
 *
 * @package Parsely
 */

declare(strict_types=1);

use Rector\Config\RectorConfig;
use Rector\Php54\Rector\Array_\LongArrayToShortArrayRector;
use Rector\Set\ValueObject\LevelSetList;

return static function ( RectorConfig $rector_config ): void {
	$rector_config->bootstrapFiles(
		array(
			__DIR__ . '/vendor/php-stubs/wordpress-stubs/wordpress-stubs.php',
		)
	);

	$rector_config->paths(
		array(
			__DIR__ . '/src',
			__DIR__ . '/tests',
			__DIR__ . '/views',
			__DIR__ . '/uninstall.php',
			__DIR__ . '/wp-parsely.php',
		)
	);

	// Define sets of rules.
	$rector_config->sets(
		array(
			LevelSetList::UP_TO_PHP_72,
		)
	);
	$rector_config->skip(
		array(
			LongArrayToShortArrayRector::class,
		)
	);

	$rector_config->indent( "\t", 1 );
};
