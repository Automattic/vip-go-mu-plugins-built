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
 * The registry also omits types whose registering plugin was deactivated.
 *
 * The status axis inverts: 'any' denies the registered exclude_from_search
 * statuses but passes unregistered ones, where an explicit status list would
 * drop them. post_stati() names the denied ones so neither kind is lost.
 *
 * Defaults return the newest claim by ID; callers override status, ordering,
 * result cap, and cache behavior through $args.
 */
class Source_Identity_Lookup {

	/**
	 * Returns registered post types a destination post can be imported as.
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
	 * Finds post types held by posts claiming this source identity, including
	 * types that are no longer registered on the destination.
	 *
	 * @param int|int[] $source_ids      Source post IDs to look up.
	 * @param string    $source_site_url Source site identity.
	 * @return string[] Post type slugs, excluding revisions.
	 */
	private static function claimed_post_types(
		int|array $source_ids,
		string $source_site_url
	): array {
		global $wpdb;

		$ids          = array_map( 'intval', (array) $source_ids );
		$placeholders = implode( ', ', array_fill( 0, count( $ids ), '%s' ) );
		$values       = array_merge(
			array( Options::META_SOURCE_POST_ID ),
			$ids,
			array( Options::META_SOURCE_SITE_URL, $source_site_url )
		);

		// WP_Query cannot include unregistered types without naming them.
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$types = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT posts.post_type FROM {$wpdb->posts} posts
				 INNER JOIN {$wpdb->postmeta} source ON source.post_id = posts.ID
				 INNER JOIN {$wpdb->postmeta} site ON site.post_id = posts.ID
				 WHERE source.meta_key = %s
				 AND source.meta_value IN ($placeholders)
				 AND site.meta_key = %s AND site.meta_value = %s
				 AND posts.post_type <> 'revision'",
				$values
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber

		return array_map( 'strval', $types );
	}

	/**
	 * Returns a post_status argument that denies only trash and auto-draft,
	 * or nothing at all when $include_trash is set.
	 *
	 * Naming a denied status alongside 'any' removes its denial clause, so
	 * hidden and unregistered statuses resolve either way.
	 *
	 * @param bool $include_trash Whether trash and auto-draft stay in scope.
	 * @return string[] post_status query argument.
	 */
	public static function post_stati( bool $include_trash = false ): array {
		$hidden = get_post_stati( array( 'exclude_from_search' => true ) );

		if ( ! $include_trash ) {
			unset( $hidden['trash'], $hidden['auto-draft'] );
		}

		return array_merge( array( 'any' ), array_keys( $hidden ) );
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

		$post_types = self::post_types();
		if ( ! isset( $args['post_type'] ) ) {
			$post_types = array_values(
				array_unique(
					array_merge(
						$post_types,
						self::claimed_post_types( $source_ids, $source_site_url )
					)
				)
			);
		}

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
			'post_type'        => $post_types,
			'post_status'      => self::post_stati(),
			'orderby'          => 'ID',
			'order'            => 'DESC',
			'posts_per_page'   => 1,
			// Don't suppress posts_* filters; required for cache plugins.
			'suppress_filters' => false,
		);

		return get_posts( array_merge( $defaults, $args ) );
	}
}
