<?php
/**
 * Generic logger for VIP Agentforce plugin.
 */

namespace Automattic\VIP\Salesforce\Agentforce\Utils;

use Automattic\VIP\Salesforce\Agentforce\Constants;
use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;

class Logger {
	/**
	 * @var array<int, array<string, mixed>>
	 */
	protected static array $logged_entries = [];
	protected static bool $track_logs      = false;
	protected static bool $enabled         = true;
	/**
	 * Log data to both error_log (non-production) and Logstash
	 *
	 * @param array<string, mixed> $data Log data with required fields: feature, message, severity
	 * @return void
	 */
	public static function log( array $data ): void {
		if ( ! self::$enabled ) {
			return;
		}

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
		// this is for testing purposes
		if ( self::$track_logs ) {
			self::$logged_entries[] = $data;
		}
		// Send to Logstash
		\Automattic\VIP\Logstash\Logger::log2logstash( $data );
	}

	/**
	 * Log an info message
	 *
	 * @param string $feature Feature name
	 * @param string $message Log message
	 * @param array<string, mixed> $extra Extra data
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
	 * @param array<string,mixed>  $extra Extra data
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
	 * @param array<string,mixed>  $extra Extra data
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


	/**
	 * This is a dedicated function to log warnings only if the user is logged in. The idea is that
	 * we don't want to accidentally log too many warnings in production
	 *
	 * @param string $feature Feature name
	 * @param string $message Log message
	 * @param array<string,mixed>  $extra Extra data
	 */
	public static function warning_log_if_user_logged_in( string $feature, string $message, array $extra = [] ): void {
		if ( Configs::is_local_env() ) {
			self::warning(
				$feature,
				$message,
				$extra
			);
			return;
		}

		add_action('set_current_user', function () use ( $feature, $message, $extra ) {
			if ( is_user_logged_in() ) {
				Logger::warning(
					$feature,
					$message,
					$extra
				);
			}
		});
	}

	/**
	 * Disable logging. Useful for tests to avoid exceeding log limits.
	 */
	public static function disable(): void {
		self::$enabled = false;
	}

	/**
	 * Enable logging.
	 */
	public static function enable(): void {
		self::$enabled = true;
	}
}
