<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging;

/**
 * Describes log levels.
 */
class LogLevel {
	const EMERGENCY = 'emergency';
	const ALERT = 'alert';
	const CRITICAL = 'critical';
	const ERROR = 'error';
	const WARNING = 'warning';
	const NOTICE = 'notice';
	const INFO = 'info';
	const DEBUG = 'debug';

	/**
	 * Log levels in ascending priority order.
	 *
	 * @var array<string, int>
	 */
	private static array $priority = [
		self::DEBUG => 1,
		self::INFO => 2,
		self::NOTICE => 3,
		self::WARNING => 4,
		self::ERROR => 5,
		self::CRITICAL => 6,
		self::ALERT => 7,
		self::EMERGENCY => 8,
	];

	/**
	 * Returns true if log level 1 is higher than or equal to log level 2,
	 * otherwise false.
	 *
	 * @param string $level The level being logged.
	 * @param string $threshold_level The threshold level to compare against.
	 */
	public static function meets_threshold( string $level, string $threshold_level ): bool {
		if ( ! isset( self::$priority[ $level ], self::$priority[ $threshold_level ] ) ) {
			return false;
		}

		return self::$priority[ $level ] >= self::$priority[ $threshold_level ];
	}
}
