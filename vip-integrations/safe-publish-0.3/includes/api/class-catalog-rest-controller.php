<?php
/**
 * Catalog REST Controller class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Auth\HMAC_Authenticator;
use Safe_Publish\Utils\Datetime_Sanitizer;
use WP_Error;
use WP_Post;
use WP_Query;
use WP_REST_Request;
use WP_REST_Response;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Source-side REST controller backing the destination's browsable posts
 * catalog.
 *
 * Owns the query semantics for the catalog UI: title-only search with slug
 * fallback, status/date filters, indexed sort primitives, and Previous /
 * Next pagination via `has_more` (no SQL_CALC_FOUND_ROWS).
 *
 * Lives only on source-mode installs.
 */
final class Catalog_REST_Controller {

	/**
	 * REST namespace shared with Safe_Publish_API monitoring endpoints.
	 */
	private const REST_NAMESPACE = 'safe-publish/v1';

	/**
	 * Hard ceiling on per_page to bound query cost on huge sites. Also the
	 * batch size the destination requests when filling Available pages.
	 */
	public const MAX_PER_PAGE = 100;

	/**
	 * Default per_page when the caller doesn't specify.
	 */
	private const DEFAULT_PER_PAGE = 20;

	/**
	 * Post statuses the destination is allowed to filter against.
	 * Public so the destination AJAX controller can validate before
	 * round-tripping to the source.
	 *
	 * @var string[]
	 */
	public const ALLOWED_STATUSES = array(
		'publish',
		'draft',
		'pending',
		'private',
		'future',
	);

	/**
	 * Orderby values the destination is allowed to request.
	 *
	 * `date` rides the `type_status_date(post_type, post_status, post_date,
	 * ID)` index — fast at any scale. `title` is NOT indexed and degrades
	 * to a filesort on large catalogs; it's kept because the toolbar offers
	 * it and the cost on typical sites is acceptable. `modified` is
	 * deliberately excluded — `post_modified` has no index either, and the
	 * default sort wants the indexed path.
	 *
	 * @var string[]
	 */
	public const ALLOWED_ORDERBY = array( 'date', 'title' );

	/**
	 * Allowed sort directions.
	 *
	 * @var string[]
	 */
	public const ALLOWED_ORDER = array( 'asc', 'desc' );

	/**
	 * Non-public post types the catalog opts in despite public=false.
	 * wp_navigation is structural but its posts are user-authored content
	 * the migration is expected to carry over.
	 *
	 * @var string[]
	 */
	private const ALLOW_NON_PUBLIC = array( 'wp_navigation' );

	/**
	 * HMAC authenticator used to gate the endpoint.
	 *
	 * @var HMAC_Authenticator
	 */
	private HMAC_Authenticator $authenticator;

	/**
	 * Constructor.
	 *
	 * @param HMAC_Authenticator $authenticator HMAC authenticator instance.
	 */
	public function __construct( HMAC_Authenticator $authenticator ) {
		$this->authenticator = $authenticator;
	}

	/**
	 * Hooks the route registration into rest_api_init.
	 */
	public function init(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Registers the catalog routes.
	 */
	public function register_routes(): void {
		register_rest_route(
			self::REST_NAMESPACE,
			'/catalog/posts',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( $this, 'check_permission' ),
				'callback'            => array( $this, 'handle_request' ),
				'args'                => $this->route_args(),
			)
		);

		register_rest_route(
			self::REST_NAMESPACE,
			'/catalog/post-types',
			array(
				'methods'             => 'GET',
				'permission_callback' => array( $this, 'check_permission' ),
				'callback'            => array( $this, 'handle_post_types_request' ),
			)
		);
	}

	/**
	 * Permission gate.
	 *
	 * The HMAC_Authenticator runs at `rest_pre_dispatch` and flips its
	 * authenticated flag for signed requests. We only let the destination's
	 * signed call through — there's no real user behind HMAC requests, so a
	 * `current_user_can` check would be a no-op or misleading.
	 *
	 * @return bool True when the request was HMAC-authenticated.
	 */
	public function check_permission(): bool {
		return $this->authenticator->is_authenticated();
	}

	/**
	 * Handles a single catalog request.
	 *
	 * @param WP_REST_Request $request Incoming REST request.
	 * @return WP_REST_Response|WP_Error Catalog envelope or error.
	 */
	public function handle_request(
		WP_REST_Request $request
	): WP_REST_Response|WP_Error {
		$post_type = $this->resolve_post_type(
			(string) $request->get_param( 'post_type' )
		);
		if ( is_wp_error( $post_type ) ) {
			return $post_type;
		}

		$statuses = $this->resolve_statuses( $request->get_param( 'status' ) );

		$include = self::resolve_include( $request->get_param( 'include' ) );
		if ( count( $include ) > 0 ) {
			return $this->handle_include_request( $post_type, $statuses, $include );
		}

		$published_after  = Datetime_Sanitizer::sanitize_iso_datetime(
			$request->get_param( 'published_after' ),
			false
		);
		$published_before = Datetime_Sanitizer::sanitize_iso_datetime(
			$request->get_param( 'published_before' ),
			true
		);

		if ( false === $published_after || false === $published_before ) {
			return new WP_Error(
				'safe_publish_catalog_invalid_date',
				__(
					'published_after and published_before must be ISO 8601 dates.',
					'safe-publish'
				),
				array( 'status' => 400 )
			);
		}

		// no_found_rows skips SQL_CALC_FOUND_ROWS for performance, but loses
		// the total page count. We only need "is there a next page?" — ask
		// WP_Query for one extra row and let the slice below derive has_more.
		$per_page_raw = $request->get_param( 'per_page' );
		$per_page     = null === $per_page_raw
			? self::DEFAULT_PER_PAGE
			: max( 1, min( self::MAX_PER_PAGE, (int) $per_page_raw ) );

		$page = max( 1, (int) $request->get_param( 'page' ) );

		$orderby_raw = (string) $request->get_param( 'orderby' );
		$orderby     = in_array( $orderby_raw, self::ALLOWED_ORDERBY, true )
			? $orderby_raw
			: 'date';

		$order_raw = strtolower( (string) $request->get_param( 'order' ) );
		$order     = in_array( $order_raw, self::ALLOWED_ORDER, true )
			? strtoupper( $order_raw )
			: 'DESC';

		$search = trim( (string) $request->get_param( 'search' ) );
		$name   = sanitize_title( (string) $request->get_param( 'name' ) );

		$args = array(
			'post_type'           => $post_type,
			'post_status'         => $statuses,
			'orderby'             => $orderby,
			'order'               => $order,
			'no_found_rows'       => true,
			'posts_per_page'      => $per_page + 1,
			'offset'              => ( $page - 1 ) * $per_page,
			'ignore_sticky_posts' => true,
		);

		if ( '' !== $name ) {
			$args['name'] = $name;
		}

		$date_query = $this->build_date_query( $published_after, $published_before );
		if ( array() !== $date_query ) {
			$args['date_query'] = $date_query;
		}

		if ( '' !== $search ) {
			$args['s'] = $search;
		}

		$posts = $this->run_query( $args, '' !== $search );

		$has_more = count( $posts ) > $per_page;
		if ( $has_more ) {
			$posts = array_slice( $posts, 0, $per_page );
		}

		$items = array();
		foreach ( $posts as $post ) {
			$items[] = Source_Posts_API::prepare_listing_payload_from_post( $post );
		}

		return new WP_REST_Response(
			array(
				'items'    => $items,
				'has_more' => $has_more,
			),
			200
		);
	}

	/**
	 * Returns the listing payload for an include-by-ID lookup.
	 *
	 * Backs the destination's sync-status batch check. Search, date, ordering,
	 * and pagination inputs don't apply (the caller names the exact set of
	 * IDs); `has_more` is always false.
	 *
	 * @param string   $post_type Resolved post type slug.
	 * @param string[] $statuses  Resolved status allowlist.
	 * @param int[]    $ids       Source post IDs to look up (already sanitized).
	 * @return WP_REST_Response Catalog envelope.
	 */
	private function handle_include_request(
		string $post_type,
		array $statuses,
		array $ids
	): WP_REST_Response {
		$args = array(
			'post_type'           => $post_type,
			'post_status'         => $statuses,
			'post__in'            => $ids,
			'orderby'             => 'post__in',
			'no_found_rows'       => true,
			'posts_per_page'      => count( $ids ),
			'ignore_sticky_posts' => true,
		);

		$items = array();
		foreach ( $this->run_query( $args, false ) as $post ) {
			$items[] = Source_Posts_API::prepare_listing_payload_from_post( $post );
		}

		return new WP_REST_Response(
			array(
				'items'    => $items,
				'has_more' => false,
			),
			200
		);
	}

	/**
	 * Lists post types the catalog endpoint will actually serve.
	 *
	 * Mirrors resolve_post_type()'s gate so the destination's dropdown only
	 * shows types that won't 400 when selected. Excludes attachments (files
	 * with status `inherit`, not content posts). Lets ALLOW_NON_PUBLIC types
	 * (e.g. wp_navigation) through despite public=false. Custom CPTs that
	 * meet the contract come through automatically.
	 *
	 * @return WP_REST_Response List of catalog-eligible post types.
	 */
	public function handle_post_types_request(): WP_REST_Response {
		$internal_blocklist = array( 'attachment' );

		$items = array();
		foreach ( get_post_types( array(), 'objects' ) as $slug => $object ) {
			if ( in_array( $slug, $internal_blocklist, true ) ) {
				continue;
			}
			if ( true !== $object->show_in_rest ) {
				continue;
			}
			if ( true !== $object->public
				&& ! in_array( $slug, self::ALLOW_NON_PUBLIC, true )
			) {
				continue;
			}

			$name = isset( $object->labels->name )
				&& is_string( $object->labels->name )
				? $object->labels->name
				: $slug;

			$items[] = array(
				'slug'        => $slug,
				'name'        => $name,
				'label'       => $name,
				'rest_base'   => is_string( $object->rest_base )
					&& '' !== $object->rest_base
					? $object->rest_base
					: $slug,
				'description' => is_string( $object->description )
					? $object->description
					: '',
			);
		}

		return new WP_REST_Response( $items, 200 );
	}

	/**
	 * Runs the WP_Query with the title-only / slug-equality search override
	 * active for the duration of the call.
	 *
	 * @param array $args        WP_Query arguments. Must not request `fields`
	 *                           or the WP_Post-only narrowing below breaks.
	 * @param bool  $with_search True when an `s` term is in play.
	 * @return WP_Post[] Result posts.
	 */
	private function run_query( array $args, bool $with_search ): array {
		if ( $with_search ) {
			add_filter( 'posts_search', array( $this, 'override_posts_search' ), 10, 2 );
		}

		try {
			$query = new WP_Query( $args );
		} finally {
			if ( $with_search ) {
				remove_filter(
					'posts_search',
					array( $this, 'override_posts_search' ),
					10
				);
			}
		}

		return array_values(
			array_filter(
				$query->posts,
				static fn( $post ): bool => $post instanceof WP_Post
			)
		);
	}

	/**
	 * Replaces WP's default 3-column search with title-only LIKE plus an
	 * exact slug fallback, so the destination's "search titles" affordance
	 * matches what the catalog actually queries.
	 *
	 * Final shape: `AND ((title LIKE %t1% AND title LIKE %t2% ...) OR
	 * post_name = %full_term%)`. The slug branch only meaningfully matches
	 * single-token inputs (slugs don't contain spaces); multi-token search
	 * resolves through the AND'd title clauses.
	 *
	 * Same `LIKE '%foo%'` profile as `wp/v2/posts?search` (narrower scope,
	 * indexed slug shortcut). VIP Enterprise Search is worth considering
	 * if performance demands it.
	 *
	 * @param string   $search Existing search SQL fragment (ignored).
	 * @param WP_Query $query  Current WP_Query instance.
	 * @return string SQL fragment to splice into the WHERE clause.
	 */
	public function override_posts_search( string $search, WP_Query $query ): string {
		global $wpdb;
		unset( $search );

		$term = trim( (string) $query->get( 's' ) );
		if ( '' === $term ) {
			return '';
		}

		$tokens = preg_split( '/\s+/', $term );
		if ( ! is_array( $tokens ) ) {
			$tokens = array( $term );
		}
		$tokens = array_values(
			array_filter( $tokens, static fn( string $t ): bool => '' !== $t )
		);

		$title_clauses = array();
		foreach ( $tokens as $token ) {
			$like            = '%' . $wpdb->esc_like( $token ) . '%';
			$title_clauses[] = $wpdb->prepare(
				"{$wpdb->posts}.post_title LIKE %s",
				$like
			);
		}

		$title_sql = '' !== implode( '', $title_clauses )
			? '(' . implode( ' AND ', $title_clauses ) . ')'
			: '';

		$slug_sql = $wpdb->prepare( "{$wpdb->posts}.post_name = %s", $term );

		if ( '' === $title_sql ) {
			return " AND ({$slug_sql}) ";
		}

		return " AND ({$title_sql} OR {$slug_sql}) ";
	}

	/**
	 * Restricts the requested post type to one that's both registered and
	 * REST-visible — same gate handle_post_types_request() applies, so the
	 * catalog can never surface internal types even with a crafted request.
	 *
	 * @param string $raw Raw post_type request param.
	 * @return string|WP_Error Resolved slug or error when the type isn't allowed.
	 */
	private function resolve_post_type( string $raw ): string|WP_Error {
		$slug = '' === $raw ? 'post' : sanitize_key( $raw );

		$object = get_post_type_object( $slug );
		if (
			null === $object
			|| true !== $object->show_in_rest
			|| ( true !== $object->public
				&& ! in_array( $slug, self::ALLOW_NON_PUBLIC, true ) )
		) {
			return new WP_Error(
				'safe_publish_catalog_invalid_post_type',
				__(
					'Requested post type is not available through the catalog.',
					'safe-publish'
				),
				array( 'status' => 400 )
			);
		}

		return $slug;
	}

	/**
	 * Normalizes the include param to a deduped, capped list of positive IDs.
	 *
	 * Accepts an array or a comma-separated string. The cap matches MAX_PER_PAGE
	 * so a single batch can't outgrow what the endpoint serves for a regular page.
	 *
	 * @param mixed $raw Raw include param.
	 * @return int[] Sanitized include list.
	 */
	private static function resolve_include( mixed $raw ): array {
		if ( is_string( $raw ) && '' !== $raw ) {
			$raw = explode( ',', $raw );
		}

		if ( ! is_array( $raw ) ) {
			return array();
		}

		$ids = array_values(
			array_unique(
				array_filter(
					array_map(
						static fn( mixed $v ): int => absint( $v ),
						$raw
					),
					static fn( int $id ): bool => $id > 0
				)
			)
		);

		return array_slice( $ids, 0, self::MAX_PER_PAGE );
	}

	/**
	 * Resolves and validates the status list against the allowlist.
	 *
	 * No status param (or one with no allowlisted entries) means "no
	 * filter" — return every allowlisted status so the catalog's default
	 * matches the UX of an empty FormTokenField in the destination's
	 * toolbar. Matches WordPress admin's own "show everything" default.
	 *
	 * @param mixed $raw Raw status param (array or string).
	 * @return string[] Sanitized status list.
	 */
	private function resolve_statuses( mixed $raw ): array {
		if ( is_string( $raw ) && '' !== $raw ) {
			$raw = explode( ',', $raw );
		}

		if ( ! is_array( $raw ) || array() === $raw ) {
			return self::ALLOWED_STATUSES;
		}

		$filtered = array_values(
			array_intersect(
				array_map(
					static fn( string $v ): string => sanitize_key( $v ),
					array_filter( $raw, 'is_string' )
				),
				self::ALLOWED_STATUSES
			)
		);

		return array() === $filtered ? self::ALLOWED_STATUSES : $filtered;
	}

	/**
	 * Builds the date_query clause from already-validated ISO timestamps.
	 *
	 * Filters on `post_date` (source-local) rather than `post_date_gmt`
	 * because `type_status_date(post_type, post_status, post_date, ID)` is
	 * the only index that covers a date range — `post_date_gmt` has no
	 * index, so filtering against it forces a row scan within the index
	 * prefix. The trade-off is calendar-day skew at the TZ boundary, which
	 * matches WP's own admin "Filter by date" behavior.
	 *
	 * @param string|null $after  Lower-bound timestamp (inclusive) or null.
	 * @param string|null $before Upper-bound timestamp (inclusive) or null.
	 * @return array WP_Query date_query, empty when neither bound is set.
	 */
	private function build_date_query( ?string $after, ?string $before ): array {
		if ( null === $after && null === $before ) {
			return array();
		}

		$clause = array(
			'column'    => 'post_date',
			'inclusive' => true,
		);

		if ( null !== $after ) {
			$clause['after'] = $after;
		}

		if ( null !== $before ) {
			$clause['before'] = $before;
		}

		return array( $clause );
	}


	/**
	 * Type schema for the route, used by WP's REST discovery output.
	 *
	 * Defaults and allowlists live in handle_request so there's one source
	 * of truth — declaring them here too would let the two definitions drift.
	 *
	 * @return array Route args.
	 */
	private function route_args(): array {
		return array(
			'page'             => array( 'type' => 'integer' ),
			'per_page'         => array( 'type' => 'integer' ),
			'search'           => array( 'type' => 'string' ),
			'name'             => array( 'type' => 'string' ),
			'status'           => array(
				'type'  => 'array',
				'items' => array( 'type' => 'string' ),
			),
			'published_after'  => array( 'type' => 'string' ),
			'published_before' => array( 'type' => 'string' ),
			'orderby'          => array( 'type' => 'string' ),
			'order'            => array( 'type' => 'string' ),
			'post_type'        => array( 'type' => 'string' ),
			'include'          => array(
				'type'  => 'array',
				'items' => array( 'type' => 'integer' ),
			),
		);
	}
}
