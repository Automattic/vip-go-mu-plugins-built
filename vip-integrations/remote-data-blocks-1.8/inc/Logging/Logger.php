<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging;

use function do_action;

defined( 'ABSPATH' ) || exit();

class Logger extends AbstractLogger {
	public const ACTION_NAME = 'remote_data_blocks_log';

	/**
	 * Constructor.
	 *
	 * @param string $namespace Optional namespace for the logger.
	 */
	public function __construct( private string $namespace = 'remote-data-blocks' ) {}

	/**
	 * PSR log implementation.
	 */
	public function log( string $level, string $message, array $context = [] ): void {
		/**
		 * Action hook for logging messages. Hook into this to perform your own
		 * logging.
		 *
		 * @param string $namespace The logger namespace.
		 * @param string $level     The log level.
		 * @param string $message   The log message.
		 * @param array  $context   Additional context for the log message.
		 */
		do_action( self::ACTION_NAME, $this->namespace, $level, $message, $context );

		if ( defined( 'WP_DEBUG' ) && constant( 'WP_DEBUG' ) && LogLevel::meets_threshold( $level, LogLevel::ERROR ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[%s] %s: %s', $this->namespace, $level, $message ) );
		}
	}
}
