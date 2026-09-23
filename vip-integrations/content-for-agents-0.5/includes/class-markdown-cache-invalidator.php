<?php
/**
 * Markdown cache invalidator.
 *
 * Hooks into post lifecycle events to clear cached markdown documents.
 *
 * @package Content_For_Agents
 */

namespace Content_For_Agents;

/**
 * Invalidates markdown document cache when posts are saved, trashed, or deleted.
 *
 * @package Content_For_Agents
 */
class Markdown_Cache_Invalidator {

	/**
	 * Constructor.
	 *
	 * @param Loader $loader Loader instance.
	 */
	public function __construct( Loader $loader ) {
		$loader->add_action( 'init', $this, 'register_vip_purge_filters', 100 );
		$loader->add_action( 'pre_post_update', $this, 'purge_previous_urls', 10, 1 );
		$loader->add_action( 'save_post', $this, 'maybe_clear_cache', 10, 3 );
		$loader->add_action( 'before_delete_post', $this, 'clear_cache', 10, 1 );
		$loader->add_action( 'wp_trash_post', $this, 'clear_cache', 10, 1 );
		$loader->add_action( 'post_updated', $this, 'invalidate_old_parent', 10, 3 );
		$loader->add_action( 'edited_term', $this, 'invalidate_term_documents', 10, 3 );
		$loader->add_action( 'profile_update', $this, 'invalidate_author_documents', 10, 2 );
		$loader->add_action( 'content_for_agents_purge_related_documents', $this, 'purge_related_documents', 10, 2 );
	}

	/**
	 * Include Markdown endpoints in VIP's automatic post purge lists.
	 */
	public function register_vip_purge_filters(): void {
		foreach ( get_post_types() as $post_type ) {
			add_filter( "wpcom_vip_cache_purge_{$post_type}_post_urls", array( $this, 'add_vip_purge_urls' ), 10, 2 );
		}
	}

	/**
	 * Preserve VIP's URLs and append endpoints for supported posts.
	 *
	 * @param array $urls    Existing purge URLs.
	 * @param int   $post_id Post ID.
	 * @return array
	 */
	public function add_vip_purge_urls( array $urls, int $post_id ): array {
		$post_type = get_post_type( $post_id );
		if ( ! is_string( $post_type ) || ! post_type_supports( $post_type, 'content-for-agents' ) ) {
			return $urls;
		}

		return array_merge( $urls, self::get_purge_urls( $post_id ) );
	}

	/**
	 * Build Markdown endpoint URLs to purge.
	 *
	 * @param int $post_id Post ID.
	 * @return string[]
	 */
	private static function get_purge_urls( int $post_id ): array {
		$endpoint_url = Markdown_Endpoint::get_path_url( $post_id );
		$query_url    = Markdown_Endpoint::get_query_url( $post_id );
		$urls         = array();

		if ( '' !== $query_url ) {
			$permalink = get_permalink( $post_id );
			if ( is_string( $permalink ) && '' !== $permalink ) {
				// VIP purges all query-string variants when the base URL is purged.
				$urls[] = $permalink;
			}
		}

		if ( '' !== $endpoint_url ) {
			$urls[] = $endpoint_url;
			$urls[] = $endpoint_url . '/';
		}

		if ( '' !== $query_url ) {
			$urls[] = $query_url;
		}

		return $urls;
	}

	/**
	 * Queue the public URLs before a status, slug, or parent change replaces them.
	 *
	 * VIP sends these purges on shutdown, after the update. The save_post hook
	 * still clears the object cache and queues the current URLs.
	 *
	 * @param int $post_id Existing post ID.
	 */
	public function purge_previous_urls( int $post_id ): void {
		if ( ! function_exists( 'wpvip_purge_edge_cache_for_url' ) ) {
			return;
		}

		$post = get_post( $post_id );
		if ( ! $post || 'publish' !== $post->post_status
			|| ! post_type_supports( $post->post_type, 'content-for-agents' ) ) {
			return;
		}

		foreach ( self::get_purge_urls( $post_id ) as $url ) {
			wpvip_purge_edge_cache_for_url( $url );
		}
	}

	/**
	 * Maybe clear the cache on save if post type is enabled.
	 *
	 * Clears this post's cache and, when the post is a child (e.g. report chapter),
	 * the parent's cache so the parent's TOC stays current.
	 *
	 * @param int      $post_id Post ID.
	 * @param \WP_Post $_post   Post object (unused; signature matches save_post).
	 * @param bool     $_update Whether this is an existing post (unused; signature matches save_post).
	 */
	// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- The save_post hook requires all three arguments.
	public function maybe_clear_cache( $post_id, $_post, $_update ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}

		$post_type = get_post_type( $post_id );
		if ( ! post_type_supports( $post_type, 'content-for-agents' ) ) {
			return;
		}

		self::clear_post_cache( $post_id );

		// When a chapter is saved, the parent report's cached markdown (TOC with chapter titles) becomes stale.
		$parent_id = wp_get_post_parent_id( $post_id );
		if ( 0 !== $parent_id ) {
			self::clear_post_cache( $parent_id );
		}
	}

	/** Clear the former parent's navigation when a supported child moves. */
	public function invalidate_old_parent( int $post_id, \WP_Post $after, \WP_Post $before ): void {
		if ( post_type_supports( $after->post_type, 'content-for-agents' )
			&& $before->post_parent && $before->post_parent !== $after->post_parent ) {
			self::clear_post_cache( (int) $before->post_parent );
		}
	}

	/** Category and tag names are part of the base document metadata. */
	public function invalidate_term_documents( int $term_id, int $tt_id, string $taxonomy ): void {
		if ( ! in_array( $taxonomy, array( 'category', 'post_tag' ), true ) ) {
			return;
		}
		$this->purge_related_documents(
			array(
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- The query is bounded to IDs in batches of 100.
				'tax_query' => array(
					array(
						'taxonomy'         => $taxonomy,
						'terms'            => array( $term_id ),
						'include_children' => false,
					),
				),
			)
		);
	}

	/** Only a display-name change affects the built-in author metadata. */
	public function invalidate_author_documents( int $user_id, \WP_User $before ): void {
		$after = get_userdata( $user_id );
		if ( $after && $before->display_name !== $after->display_name ) {
			$this->purge_related_documents( array( 'author' => $user_id ) );
		}
	}

	/**
	 * Clear related public documents in bounded batches.
	 *
	 * The first 100 have object caches cleared and VIP edge purges queued.
	 * VIP Cron Control handles remaining batches through the WordPress cron API
	 * so a taxonomy or profile edit does not process thousands of posts in one save.
	 * VIP deduplicates URL requests and sends them asynchronously on shutdown.
	 * This is an internal cron callback, not an integration query API.
	 *
	 * @param array $relation Author or taxonomy query constraints.
	 * @param int   $after_id Last ID purged by the previous batch.
	 */
	public function purge_related_documents( array $relation, int $after_id = 0 ): void {
		$types = array_values(
			array_filter(
				get_post_types(),
				static function ( $type ) {
					return post_type_supports( $type, 'content-for-agents' );
				}
			)
		);
		if ( ! $types ) {
			return;
		}
		$query = new \WP_Query();
		$args  = array_merge(
			$relation,
			array(
				'post_type'              => $types,
				'post_status'            => 'publish',
				'fields'                 => 'ids',
				'posts_per_page'         => 100,
				'orderby'                => 'ID',
				'order'                  => 'ASC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
		// An ID cursor remains valid if earlier posts are deleted or reassigned.
		$where = static function ( $sql, $current_query ) use ( $query, $after_id ) {
			global $wpdb;
			if ( $current_query === $query && $after_id > 0 ) {
				$sql .= $wpdb->prepare( " AND {$wpdb->posts}.ID > %d", $after_id );
			}
			return $sql;
		};
		add_filter( 'posts_where', $where, 10, 2 );
		try {
			$query->query( $args );
		} finally {
			remove_filter( 'posts_where', $where, 10 );
		}
		foreach ( $query->posts as $id ) {
			self::invalidate_post( (int) $id );
		}
		if ( 100 === count( $query->posts ) ) {
			$args = array( $relation, (int) end( $query->posts ) );
			if ( ! wp_next_scheduled( 'content_for_agents_purge_related_documents', $args ) ) {
				$scheduled = wp_schedule_single_event( time(), 'content_for_agents_purge_related_documents', $args, true );
				if ( is_wp_error( $scheduled ) && 'duplicate_event' !== $scheduled->get_error_code() ) {
					wp_trigger_error(
						__METHOD__,
						'Could not schedule a related document purge: ' . $scheduled->get_error_code(),
						E_USER_WARNING
					);
				}
			}
		}
	}

	/**
	 * Clear cache for a post (delete/trash).
	 *
	 * Also clears the parent's cache when the post is a child (e.g. report chapter)
	 * so the parent's TOC is invalidated.
	 *
	 * @param int $post_id Post ID.
	 */
	public function clear_cache( $post_id ) {
		self::invalidate_post( (int) $post_id );
	}

	/**
	 * Purge a document and its parent after integration data changes.
	 *
	 * @param int $post_id Affected post ID.
	 */
	public static function invalidate_post( int $post_id ): void {
		if ( $post_id <= 0 ) {
			return;
		}
		self::clear_post_cache( $post_id );

		$parent_id = wp_get_post_parent_id( $post_id );
		if ( 0 !== $parent_id ) {
			self::clear_post_cache( $parent_id );
		}
	}

	/**
	 * Clear object cache and all VIP edge-cache variants for a post.
	 *
	 * @param int $post_id Post ID.
	 */
	private static function clear_post_cache( int $post_id ): void {
		Markdown_Response::delete_cache( $post_id );

		if ( ! function_exists( 'wpvip_purge_edge_cache_for_url' ) ) {
			return;
		}

		foreach ( self::get_purge_urls( $post_id ) as $url ) {
			wpvip_purge_edge_cache_for_url( $url );
		}
	}
}
