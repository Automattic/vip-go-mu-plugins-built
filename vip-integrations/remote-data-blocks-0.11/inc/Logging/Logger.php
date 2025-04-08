<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging;

use Psr\Log\AbstractLogger;
use Psr\Log\LogLevel;
use Stringable;
use function add_filter;
use function apply_filters;
use function do_action;

defined( 'ABSPATH' ) || exit();

/**
 * A simple PSR-3 logger implementation. Eventually this can be provided as a
 * Composer package and used by other WordPress VIP plugins.
 */
class Logger extends AbstractLogger {
	/**
	 * Whether the factory has have been initialized. Done automatically on first use.
	 */
	private static bool $initialized = false;

	/**
	 * We use the factory pattern to provide access to namespaced instances.
	 *
	 * @var Logger[]
	 */
	private static array $instances = [];

	/**
	 * The minimum observed log level.
	 */
	private string $log_level;

	/**
	 * Log levels in ascending priority order.
	 *
	 * @var array<string, int>
	 */
	private array $log_levels = [
		LogLevel::DEBUG => 1,
		LogLevel::INFO => 2,
		LogLevel::NOTICE => 3,
		LogLevel::WARNING => 4,
		LogLevel::ERROR => 5,
		LogLevel::CRITICAL => 6,
		LogLevel::ALERT => 7,
		LogLevel::EMERGENCY => 8,
	];

	/**
	 * Protected constructor, use create factory method.
	 *
	 * @param string $namespace Optional namespace for the logger.
	 */
	protected function __construct( private string $namespace ) {
		$default_log_level = defined( 'WP_DEBUG' ) && WP_DEBUG ? LogLevel::DEBUG : LogLevel::WARNING;

		/**
		 * Filter the log level threshhold. Must supply a valid PSR log level.
		 *
		 * @param string $default_log_level The default log level.
		 */
		$this->log_level = apply_filters( 'wpcomvip_log_level', $default_log_level );

		// If an invalid log level is provided, revert to the default.
		if ( ! $this->validate_log_level( $this->log_level, 'wpcomvip_log_level filter' ) ) {
			$this->log_level = $default_log_level;
		}
	}

	/**
	 * Create reusable namespaced instances of the logger.
	 *
	 * @param string $namespace Optional namespace for the logger.
	 */
	public static function create( string $namespace = 'default' ): self {
		self::init();

		if ( ! isset( self::$instances[ $namespace ] ) ) {
			self::$instances[ $namespace ] = new self( $namespace );
		}

		return self::$instances[ $namespace ];
	}

	public static function init(): void {
		if ( self::$initialized ) {
			return;
		}

		self::$initialized = true;

		// Filter logger classes out of the stack traces. Using a static closure
		// keeps the filter from being added to the stack.
		add_filter( 'qm/trace/ignore_class', static function ( array $classes ): array {
			return array_merge( $classes, [
				AbstractLogger::class => true,
				Logger::class => true,
				LoggerManager::class => true,
			] );
		}, 10, 1 );
	}

	/**
	 * Returns true if log level 1 is higher than log level 2, otherwise false.
	 *
	 * @param mixed $level1 The first log level.
	 * @param mixed $level2 The second log level.
	 */
	public function is_log_level_higher( mixed $level1, mixed $level2 ): bool {
		if ( ! isset( $this->log_levels[ $level1 ], $this->log_levels[ $level2 ] ) ) {
			return false;
		}

		return $this->log_levels[ $level1 ] >= $this->log_levels[ $level2 ];
	}

	/**
	 * PSR log implementation.
	 */
	public function log( mixed $level, Stringable|string $message, array $context = [] ): void {
		$level = strval( $level );
		$message = strval( $message );

		if ( ! $this->should_log( $level ) ) {
			return;
		}

		/**
		 * Action hook for logging messages. Hook into this to perform your own
		 * logging.
		 *
		 * @param string $namespace The logger namespace.
		 * @param string $level     The log level.
		 * @param string $message   The log message.
		 * @param array  $context   Additional context for the log message.
		 */
		do_action( 'wpcomvip_log', $this->namespace, $level, $message, $context );

		// Prefix with a "source" name to help identify the source of the log message.
		if ( isset( $context['source'] ) ) {
			$message = sprintf( '[%s] %s', $context['source'], $message );
			unset( $context['source'] );
		}

		$this->log_to_query_monitor( $level, $message, $context );
	}

	private function log_to_query_monitor( string $level, string $message, array $context = [] ): void {
		/**
		 * Filter to determine if a message should be logged to Query Monitor.
		 *
		 * @param bool   $should_log_to_query_monitor Whether the message should be logged to Query Monitor.
		 * @param string $level                       The log level.
		 * @param string $message                     The log message.
		 * @param array  $context                     Additional context for the log message.
		 */
		$should_log_to_query_monitor = apply_filters( 'wpcomvip_log_to_query_monitor', true, $level, $message, $context );

		if ( ! $should_log_to_query_monitor ) {
			return;
		}

		$action = sprintf( 'qm/%s', $level );
		$qm_log = trim( sprintf( '%s %s', $message, empty( $context ) ? '' : wp_json_encode( $context ) ) );

		// https://querymonitor.com/wordpress-debugging/profiling-and-logging/#logging
		do_action( $action, $qm_log );
	}

	/**
	 * Determine if a message should be logged based on the log level.
	 */
	private function should_log( string $level ): bool {
		if ( ! $this->validate_log_level( $level, 'log method' ) ) {
			return false;
		}

		return $this->is_log_level_higher( $level, $this->log_level );
	}

	/**
	 * Validate that the provided log level is a valid PSR log level.
	 *
	 * @param string $level  The log level to validate.
	 * @param string $caller A description of the code path that is validating the log level.
	 */
	private function validate_log_level( string $level, string $caller ): bool {
		if ( ! isset( $this->log_levels[ $level ] ) ) {
			$this->log( LogLevel::ERROR, sprintf( 'Invalid log level provided to %s, must match a Psr\\Log\\LogLevel class constant.', $caller ) );
			return false;
		}

		return true;
	}
}
