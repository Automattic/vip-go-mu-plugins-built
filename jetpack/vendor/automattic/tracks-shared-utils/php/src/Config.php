<?php

namespace Automattic\TracksSharedUtils;

/**
 * Lazily loads the config generated from shared/url-sanitization.json.
 *
 * @internal Use the functions in functions.php instead.
 */
final class Config {
	/** @var array|null */
	private static $data = null;

	/**
	 * @return array{allowedParams: array{exact: string[], prefixes: string[]}, urlProps: string[], limits: array{maxDepth: int, maxDecodes: int}}
	 */
	public static function get(): array {
		if ( null === self::$data ) {
			self::$data = require __DIR__ . '/../generated/url-sanitization.php';
		}
		return self::$data;
	}
}
