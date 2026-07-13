<?php
/**
 * Config-based ingestion filters.
 *
 * Registers should_ingest_post filters based on VIP_AGENTFORCE_CONFIGS values.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;

/**
 * Handles config-based ingestion filter registration.
 *
 * Supports:
 * - `ingestion_api_sync_all_posts`: When true, all published posts will be ingested.
 * - `ingestion_api_categories`: Array of category names - posts in any of these categories will be ingested.
 */
class Ingestion_Config_Filters {
	/**
	 * Initialize the config-based filters.
	 */
	public static function init(): void {
		// Register sync_all_posts filter if enabled.
		if ( Configs::should_sync_all_posts() ) {
			add_filter( 'vip_agentforce_should_ingest_post', [ __CLASS__, 'filter_sync_all_posts' ], 10, 1 );
			return; // If syncing all posts, no need to check categories.
		}

		// Register categories filter if configured.
		$categories = Configs::get_ingestion_categories();
		if ( ! empty( $categories ) ) {
			add_filter( 'vip_agentforce_should_ingest_post', [ __CLASS__, 'filter_by_categories' ], 10, 2 );
		}
	}

	/**
	 * Filter for sync_all_posts config.
	 *
	 * Fail-close: respects prior rejections (false), but doesn't blindly trust approvals.
	 *
	 * @param bool|null $should_ingest Current filter value. Null means no filter has decided yet.
	 * @return bool Whether to ingest the post.
	 */
	public static function filter_sync_all_posts( ?bool $should_ingest ): bool {
		// Fail-close: respect explicit rejection.
		if ( false === $should_ingest ) {
			return false;
		}

		// sync_all_posts means ingest everything (unless explicitly rejected above).
		return true;
	}

	/**
	 * Filter posts by configured categories.
	 *
	 * Fail-close: respects prior rejections (false), but doesn't blindly trust approvals.
	 * Post must be in configured categories regardless of prior approval.
	 *
	 * @param bool|null $should_ingest Current filter value. Null means no filter has decided yet.
	 * @param \WP_Post  $post          The post being evaluated.
	 * @return bool Whether to ingest the post.
	 */
	public static function filter_by_categories( ?bool $should_ingest, \WP_Post $post ): bool {
		// Fail-close: respect explicit rejection.
		if ( false === $should_ingest ) {
			return false;
		}

		$configured_categories = Configs::get_ingestion_categories();
		if ( empty( $configured_categories ) ) {
			return false;
		}

		$post_categories = get_the_category( $post->ID );
		if ( empty( $post_categories ) || is_wp_error( $post_categories ) ) {
			return false;
		}

		// Check if any post category matches the configured categories.
		foreach ( $post_categories as $category ) {
			// Match by name (not slug) so config is human-readable
			// and survives slug changes as long as the display name stays the same.
			if ( in_array( $category->name, $configured_categories, true ) ) {
				return true;
			}
		}

		return false;
	}
}

Ingestion_Config_Filters::init();
