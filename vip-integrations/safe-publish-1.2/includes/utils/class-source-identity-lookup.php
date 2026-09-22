<?php
/**
 * Source Identity Lookup utility class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

use WP_Post;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves source post IDs to the destination posts that claim them.
 *
 * A source post ID identifies a source-side post irrespective of type, so
 * these lookups must span every post type. WP_Query's 'any' token cannot:
 * It expands to types registered exclude_from_search=false, omitting
 * patterns, navigation menus, and custom types kept out of site search.
 *
 * The status axis inverts: 'any' denies the registered exclude_from_search
 * statuses, so it drops 'trash' and 'auto-draft' but passes unregistered
 * ones, where an explicit status list would drop them.
 *
 * Defaults return the newest claim by ID; callers override status, ordering,
 * result cap, and cache behavior through $args.
 */
class Source_Identity_Lookup {

	/**
	 * Returns every post type a destination post can be imported as.
	 *
	 * Revisions are excluded: A revision is never an import target, and it
	 * always outranks its own parent under the newest-by-ID order.
	 *
	 * @return string[] Post type slugs.
	 */
	public static function post_types(): array {
		$post_types = get_post_types();
		unset( $post_types['revision'] );

		return array_keys( $post_types );
	}

	/**
	 * Finds the destination posts claiming the given source post IDs, scoped
	 * to one source site so destinations connected to different sources can't
	 * collide on overlapping source post IDs.
	 *
	 * @param int|int[]            $source_ids      One source post ID, or a list.
	 * @param string               $source_site_url Path-bearing source site identity.
	 * @param array<string, mixed> $args            WP_Query args merged over the defaults.
	 * @return WP_Post[] Matching posts, newest first by ID unless overridden.
	 */
	public static function find(
		int|array $source_ids,
		string $source_site_url,
		array $args = array()
	): array {
		// An empty IN list compiles to invalid SQL.
		if ( array() === $source_ids ) {
			return array();
		}

		$identity = is_array( $source_ids )
			? array(
				'key'     => Options::META_SOURCE_POST_ID,
				'value'   => $source_ids,
				'compare' => 'IN',
			)
			: array(
				'key'   => Options::META_SOURCE_POST_ID,
				'value' => $source_ids,
			);

		$defaults = array(
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
			'meta_query'       => array(
				'relation' => 'AND',
				$identity,
				array(
					'key'   => Options::META_SOURCE_SITE_URL,
					'value' => $source_site_url,
				),
			),
			'post_type'        => self::post_types(),
			// Drops 'trash' and 'auto-draft'.
			'post_status'      => 'any',
			'orderby'          => 'ID',
			'order'            => 'DESC',
			'posts_per_page'   => 1,
			// Don't suppress posts_* filters; required for cache plugins.
			'suppress_filters' => false,
		);

		return get_posts( array_merge( $defaults, $args ) );
	}
}
