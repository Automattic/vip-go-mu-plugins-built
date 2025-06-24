<?php
/**
 * Generic logger for VIP Security Boost plugin.
 */

namespace Automattic\VIP\Security\Utils;

use Automattic\VIP\Security\Constants;

class Logger {
	/**
	 * Log data to both error_log (non-production) and Logstash
	 *
	 * @param array $data Log data with required fields: feature, message, severity
	 * @return void
	 */
	public static function log( array $data ): void {

		// Auto-detect file and line if not provided
		if ( ! isset( $data['file'] ) && ! isset( $data['line'] ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
			$backtrace  = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 2 );
			$base_index = 0;

			if ( isset( $backtrace[ $base_index ]['file'] ) ) {
				$data['file'] = $backtrace[ $base_index ]['file'];
			}

			if ( isset( $backtrace[ $base_index ]['line'] ) ) {
				$data['line'] = $backtrace[ $base_index ]['line'];
			}

			// If caller wants to log their caller too
			if ( isset( $data['debug_function_caller'] ) ) {
				$function_caller_index = 1;
				if ( isset( $backtrace[ $function_caller_index ]['file'] ) ) {
					$data['extra']['caller_file'] = $backtrace[ $function_caller_index ]['file'];
				}

				if ( isset( $backtrace[ $function_caller_index ]['line'] ) ) {
					$data['extra']['caller_line'] = $backtrace[ $function_caller_index ]['line'];
				}
			}
		}

		// Send to Logstash
		\Automattic\VIP\Logstash\Logger::log2logstash( $data );
	}

	/**
	 * Log an info message
	 *
	 * @param string $feature Feature name
	 * @param string $message Log message
	 * @param array  $extra Extra data
	 */
	public static function info( string $feature, string $message, array $extra = [] ): void {
		self::log( [
			'severity' => 'info',
			'feature'  => $feature,
			'message'  => $message,
			'plugin'   => Constants::LOG_PLUGIN_NAME,
			'extra'    => $extra,
		] );
	}

	/**
	 * Log a warning message
	 *
	 * @param string $feature Feature name
	 * @param string $message Log message
	 * @param array  $extra Extra data
	 */
	public static function warning( string $feature, string $message, array $extra = [] ): void {
		self::log( [
			'severity' => 'warning',
			'feature'  => $feature,
			'message'  => $message,
			'plugin'   => Constants::LOG_PLUGIN_NAME,
			'extra'    => $extra,
		] );
	}

	/**
	 * Log an error message
	 *
	 * @param string $feature Feature name
	 * @param string $message Log message
	 * @param array  $extra Extra data
	 */
	public static function error( string $feature, string $message, array $extra = [] ): void {
		self::log( [
			'severity' => 'error',
			'feature'  => $feature,
			'message'  => $message,
			'plugin'   => Constants::LOG_PLUGIN_NAME,
			'extra'    => $extra,
		] );
	}
}
