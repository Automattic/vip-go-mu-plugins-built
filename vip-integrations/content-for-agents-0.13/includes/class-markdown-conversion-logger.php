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
	/**
	 * Cache group for rate-limiting conversion diagnostics.
	 */
	const CACHE_GROUP = 'content_for_agents_errors';

	/**
	 * Log at most one conversion failure per post and site every five minutes.
	 *
	 * @param WP_Error $error   Conversion failure.
	 * @param int      $post_id Post ID for locating the affected document.
	 */
	public static function log( WP_Error $error, int $post_id ): void {
		$site_id = get_current_blog_id();

		// Include the site because post IDs can repeat across a multisite network.
		if ( ! wp_cache_add( 'conversion_error_' . $site_id . '_' . $post_id, true, self::CACHE_GROUP, 300 ) ) {
			return;
		}

		$data       = $error->get_error_data();
		$block_name = is_array( $data ) && isset( $data['block_name'] ) ? $data['block_name'] : null;
		$block      = is_string( $block_name ) ? '; block=' . $block_name : '';
		$cause      = is_array( $data ) && isset( $data['cause'] ) && is_wp_error( $data['cause'] ) ? $data['cause'] : $error;
		error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Production diagnostics for conversion failures.
			sprintf(
				'content-for-agents: Markdown conversion failed; site_id=%d; post_id=%d%s; message=%s',
				$site_id,
				$post_id,
				$block,
				$cause->get_error_message()
			)
		);
	}
}
