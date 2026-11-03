<?php

/**
 * Markdown conversion failure logging.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

use WP_Error;

/**
 * Logs the message for a conversion failure.
 */
class Markdown_Conversion_Logger {
	/** Former throttling cache group, retained for integration compatibility. */
	const CACHE_GROUP = 'content_for_agents_errors';

	/**
	 * Log a conversion failure with its underlying diagnostic.
	 *
	 * @param WP_Error $error   Conversion failure.
	 * @param int      $post_id Post ID for locating the affected document.
	 * @param string   $block_name Failing block, when available.
	 */
	public static function log( WP_Error $error, int $post_id, string $block_name = '' ): void {
		$site_id = get_current_blog_id();

		$data       = $error->get_error_data();
		$block_name = $block_name ? $block_name : ( is_array( $data ) ? ( $data['block_name'] ?? '' ) : '' );
		$block      = is_string( $block_name ) && '' !== $block_name ? '; block=' . $block_name : '';
		$cause      = is_array( $data ) && isset( $data['cause'] ) && is_wp_error( $data['cause'] ) ? $data['cause'] : $error;
		$exception  = $cause->get_error_data();
		$message    = $cause->get_error_message();
		if ( '' === $message ) {
			$message = (string) $cause->get_error_code();
		}
		if ( $exception instanceof \Throwable ) {
			$message .= ' ' . get_class( $exception ) . ': ' . $exception->getMessage();
		}
		// Keep callback diagnostics on one log line.
		$message = str_replace( array( "\r", "\n" ), ' ', $message );
		error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Production diagnostics for conversion failures.
			sprintf(
				'content-for-agents: Markdown conversion failed; site_id=%d; post_id=%d%s; message=%s',
				$site_id,
				$post_id,
				$block,
				$message
			)
		);
	}
}
