<?php
/**
 * Admin AJAX Controller class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\API\Catalog_REST_Controller;
use Safe_Publish\API\Source_Posts_API;
use Safe_Publish\API\Post_Type_Fetcher;
use Safe_Publish\Auth\VIP_Safe_Auth;
use Safe_Publish\Utils\Auth_Credential_Provider;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Sync_State_Comparator;
use Safe_Publish\Utils\Topological_Sorter;
use WP_Post;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles AJAX endpoint registration and request handling for the admin area.
 *
 * Registers and processes all admin AJAX actions, delegating to injected
 * services for post imports, content processing, and history tracking.
 */
final class Admin_Ajax_Controller {

	use Verifies_Ajax_Request;

	/**
	 * Site transient key for the cached auth probe result.
	 *
	 * @var string
	 */
	const AUTH_STATUS_TRANSIENT = 'safe_publish_auth_status';

	/**
	 * TTL for the auth-status site transient.
	 *
	 * @var int
	 */
	const AUTH_STATUS_TTL = 5 * MINUTE_IN_SECONDS;

	/**
	 * Maximum number of source IDs accepted by ajax_sync_status_batch in a
	 * single call. Mirrors the catalog endpoint's MAX_PER_PAGE so one batch
	 * can't outgrow what the source serves for a regular page.
	 *
	 * @var int
	 */
	const SYNC_STATUS_BATCH_MAX = 100;

	/**
	 * Maximum number of items accepted by ajax_delete_failed_imports in a
	 * single call. Bounds the prepared statement so a stray script can't
	 * produce a DELETE with a million placeholders.
	 *
	 * @var int
	 */
	const DELETE_FAILED_IMPORTS_BATCH_MAX = 100;

	/**
	 * Maximum number of post ids accepted by ajax_bulk_delete_posts in a
	 * single call. Each trash op runs in PHP — keep the batch small enough
	 * that the request finishes within a typical admin-ajax timeout.
	 *
	 * @var int
	 */
	const BULK_DELETE_POSTS_BATCH_MAX = 50;

	/**
	 * Source Posts API instance.
	 *
	 * @var Source_Posts_API
	 */
	private Source_Posts_API $api;

	/**
	 * History repository instance.
	 *
	 * @var History_Repository
	 */
	private History_Repository $repository;

	/**
	 * Post Import Service instance.
	 *
	 * @var Post_Import_Service
	 */
	private Post_Import_Service $post_import_service;

	/**
	 * Post Type Fetcher instance.
	 *
	 * @var Post_Type_Fetcher
	 */
	private Post_Type_Fetcher $post_type_fetcher;

	/**
	 * Constructs the Admin_Ajax_Controller instance.
	 *
	 * @param Source_Posts_API    $api                 Source Posts API instance.
	 * @param History_Repository  $repository          History repository instance.
	 * @param Post_Import_Service $post_import_service Post Import Service instance.
	 * @param Post_Type_Fetcher   $post_type_fetcher   Post Type Fetcher instance.
	 */
	public function __construct(
		Source_Posts_API $api,
		History_Repository $repository,
		Post_Import_Service $post_import_service,
		Post_Type_Fetcher $post_type_fetcher
	) {
		$this->api                 = $api;
		$this->repository          = $repository;
		$this->post_import_service = $post_import_service;
		$this->post_type_fetcher   = $post_type_fetcher;
	}

	/**
	 * Registers all AJAX action handlers.
	 */
	public function register_handlers(): void {
		add_action( 'wp_ajax_safe_publish_fetch_posts', array( $this, 'ajax_fetch_posts' ) );
		add_action( 'wp_ajax_safe_publish_list_imported_posts', array( $this, 'ajax_list_imported_posts' ) );
		add_action( 'wp_ajax_safe_publish_list_failed_imports', array( $this, 'ajax_list_failed_imports' ) );
		add_action( 'wp_ajax_safe_publish_delete_failed_imports', array( $this, 'ajax_delete_failed_imports' ) );
		add_action( 'wp_ajax_safe_publish_fetch_post_types', array( $this, 'ajax_fetch_post_types' ) );
		add_action( 'wp_ajax_safe_publish_test_connection', array( $this, 'ajax_test_connection' ) );
		add_action( 'wp_ajax_safe_publish_auth_status', array( $this, 'ajax_auth_status' ) );
		add_action( 'wp_ajax_safe_publish_create_draft', array( $this, 'ajax_create_draft' ) );
		add_action( 'wp_ajax_safe_publish_bulk_import', array( $this, 'ajax_bulk_import' ) );
		add_action( 'wp_ajax_safe_publish_delete_post', array( $this, 'ajax_delete_post' ) );
		add_action( 'wp_ajax_safe_publish_bulk_delete_posts', array( $this, 'ajax_bulk_delete_posts' ) );
		add_action( 'wp_ajax_safe_publish_sync_status_batch', array( $this, 'ajax_sync_status_batch' ) );

		$this->register_auth_status_invalidation();
	}

	/**
	 * Registers option-update hooks that bust the auth-status transient when
	 * any authentication-related setting changes.
	 */
	private function register_auth_status_invalidation(): void {
		$options  = array(
			Options::OPTION_CONNECTED_SITE_URL,
			Options::OPTION_BASIC_AUTH_USERNAME,
			Options::OPTION_BASIC_AUTH_PASSWORD,
		);
		$callback = array( __CLASS__, 'bust_auth_status_cache' );

		foreach ( $options as $option ) {
			add_action( 'add_option_' . $option, $callback );
			add_action( 'update_option_' . $option, $callback );
		}
	}

	/**
	 * Deletes the cached auth-status site transient.
	 */
	public static function bust_auth_status_cache(): void {
		delete_site_transient( self::AUTH_STATUS_TRANSIENT );
	}

	/**
	 * Handles AJAX request for fetching a page of the source catalog.
	 *
	 * Translates the catalog UI's controls (search/status/date/sort/page)
	 * into args the destination's Source_Posts_API passes through to the
	 * source-side catalog endpoint, then annotates the returned items
	 * with local import status before sending them back.
	 *
	 * Malformed date inputs are forwarded as-is — the source returns a 400
	 * with a clear message, keeping date-format validation as a single
	 * source of truth on the source side.
	 */
	public function ajax_fetch_posts(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing -- caller already verified via check_ajax_referer.
		$source_site_url = sanitize_text_field( wp_unslash( $_POST['source_site_url'] ?? '' ) );

		if ( empty( $source_site_url ) ) {
			wp_send_json_error( __( 'Source site URL is required.', 'safe-publish' ) );
		}

		$args = $this->build_catalog_args();
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$this->validate_auth_or_fail();

		$auth_credentials = Auth_Credential_Provider::get_credentials();

		$result = $this->api->fetch_posts(
			$source_site_url,
			$auth_credentials,
			$args
		);

		if ( is_wp_error( $result ) ) {
			wp_send_json_error( $result->get_error_message() );
		}

		$this->post_import_service->annotate_posts_with_import_status( $result['items'] );

		wp_send_json_success( $result );
	}

	/**
	 * Handles AJAX request for the Imports → Posts tab listing.
	 *
	 * Pure local query — no source roundtrip. Returns the paginated set of
	 * imported posts ordered by most-recent import_date_gmt (from the items
	 * table), joined with each post's most recent items row for session and
	 * rollback eligibility metadata.
	 *
	 * When `focus_source_id` is sent, the response is narrowed to just the
	 * matching imported post — search, filters, sort and pagination are
	 * skipped — so the deep link's target is the only row shown. The client
	 * surfaces the focus via a dismissible pill that returns to the full
	 * listing on Clear.
	 */
	public function ajax_list_imported_posts(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$page            = max( 1, absint( $_POST['page'] ?? 1 ) );
		$per_page        = max( 1, min( 100, absint( $_POST['per_page'] ?? 20 ) ) );
		$with_facets     = 1 === absint( $_POST['with_facets'] ?? 0 );
		$focus_source_id = absint( $_POST['focus_source_id'] ?? 0 );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		if ( $focus_source_id > 0 ) {
			$focused_post = $this->post_import_service->find_imported_post(
				$focus_source_id
			);
			$items        = null === $focused_post
				? array()
				: array(
					$this->build_imported_listing_row(
						$focused_post,
						$this->repository->get_item_for_post(
							$focused_post->ID
						)
					),
				);

			wp_send_json_success(
				$this->with_imported_listing_extras(
					array(
						'items'    => $items,
						'has_more' => false,
					),
					$with_facets
				)
			);
		}

		$args     = $this->build_imported_listing_args();
		$post_ids = $this->repository->list_imported_post_ids( $page, $per_page, $args );

		$has_more = count( $post_ids ) > $per_page;
		if ( $has_more ) {
			$post_ids = array_slice( $post_ids, 0, $per_page );
		}

		if ( 0 === count( $post_ids ) ) {
			wp_send_json_success(
				$this->with_imported_listing_extras(
					array(
						'items'    => array(),
						'has_more' => false,
					),
					$with_facets
				)
			);
		}

		// Hydrate WP_Post objects in the same order as the items-table sort.
		$posts = get_posts(
			array(
				'post__in'               => $post_ids,
				'post_type'              => 'any',
				'post_status'            => 'any',
				'posts_per_page'         => count( $post_ids ),
				'orderby'                => 'post__in',
				'suppress_filters'       => false,
				'update_post_term_cache' => false,
			)
		);

		$items_by_post_id = $this->repository->get_items_for_posts( $post_ids );

		$rows = array();
		foreach ( $posts as $post ) {
			$rows[] = $this->build_imported_listing_row(
				$post,
				$items_by_post_id[ $post->ID ] ?? null
			);
		}

		wp_send_json_success(
			$this->with_imported_listing_extras(
				array(
					'items'    => $rows,
					'has_more' => $has_more,
				),
				$with_facets
			)
		);
	}

	/**
	 * Handles AJAX request for the Failures tab listing.
	 *
	 * Returns a page of items with status 'error' — failed imports that have no
	 * local post — most recent first. Rows can be cleared from the tab via
	 * {@see self::ajax_delete_failed_imports()}.
	 */
	public function ajax_list_failed_imports(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$page             = max( 1, absint( $_POST['page'] ?? 1 ) );
		$per_page         = max( 1, min( 100, absint( $_POST['per_page'] ?? 20 ) ) );
		$search           = trim(
			sanitize_text_field( wp_unslash( $_POST['search'] ?? '' ) )
		);
		$attempted_after  = self::sanitize_calendar_day(
			sanitize_text_field( wp_unslash( $_POST['attempted_after'] ?? '' ) ),
			false
		);
		$attempted_before = self::sanitize_calendar_day(
			sanitize_text_field( wp_unslash( $_POST['attempted_before'] ?? '' ) ),
			true
		);
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$args = array();
		if ( '' !== $search ) {
			$args['search'] = $search;
		}
		if ( null !== $attempted_after ) {
			$args['attempted_after'] = $attempted_after;
		}
		if ( null !== $attempted_before ) {
			$args['attempted_before'] = $attempted_before;
		}

		$rows = $this->repository->list_failed_items( $page, $per_page, $args );

		$has_more = count( $rows ) > $per_page;
		if ( $has_more ) {
			$rows = array_slice( $rows, 0, $per_page );
		}

		$items = array_map(
			static fn( array $row ): array => array(
				'id'              => (int) $row['id'],
				'session_id'      => (int) $row['session_id'],
				'title'           => (string) $row['title'],
				'source_post_id'  => null !== $row['source_post_id']
					? (int) $row['source_post_id']
					: null,
				'source_site_url' => (string) $row['source_site_url'],
				'error_message'   => (string) ( $row['error_message'] ?? '' ),
				'import_date_gmt' => (string) $row['import_date_gmt'],
			),
			$rows
		);

		wp_send_json_success(
			array(
				'items'    => $items,
				'has_more' => $has_more,
			)
		);
	}

	/**
	 * Handles AJAX request for removing failed imports.
	 *
	 * Takes a list of item ids and hard-deletes the matching rows scoped to
	 * `status = 'error'` so the endpoint can't be coerced into removing success
	 * or updated rows.
	 */
	public function ajax_delete_failed_imports(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		// Each element is downstream-sanitized via absint().
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$raw_ids = (array) wp_unslash( $_POST['item_ids'] ?? array() );

		$item_ids = array_map( 'absint', $raw_ids );

		if ( 0 === count( $item_ids ) ) {
			wp_send_json_error( __( 'No items provided.', 'safe-publish' ) );
		}

		if ( count( $item_ids ) > self::DELETE_FAILED_IMPORTS_BATCH_MAX ) {
			wp_send_json_error(
				sprintf(
					/* translators: %d: maximum number of items per batch */
					__(
						'Failed-import removal is limited to %d items at a time.',
						'safe-publish'
					),
					self::DELETE_FAILED_IMPORTS_BATCH_MAX
				)
			);
		}

		$deleted = $this->repository->delete_failed_items( $item_ids );

		wp_send_json_success( array( 'deleted' => $deleted ) );
	}

	/**
	 * Validates and normalizes the Imports listing's search/filter/sort
	 * params from the request.
	 *
	 * @return array{search?: string, name?: string, imported_after?: string, imported_before?: string, statuses: list<string>, post_types: list<string>, session_id: int, orderby: string, order: string} Listing args.
	 */
	private function build_imported_listing_args(): array {
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- caller verified the nonce.
		$search = trim(
			sanitize_text_field( wp_unslash( $_POST['search'] ?? '' ) )
		);

		$name = sanitize_title( wp_unslash( $_POST['name'] ?? '' ) );

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitize_key_list() sanitizes each element.
		$raw_statuses     = (array) wp_unslash( $_POST['statuses'] ?? array() );
		$allowed_statuses = array( 'publish', 'draft', 'pending', 'private', 'future' );
		$statuses         = array_values(
			array_intersect(
				$this->sanitize_key_list( $raw_statuses ),
				$allowed_statuses
			)
		);

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitize_key_list() sanitizes each element.
		$raw_post_types = (array) wp_unslash( $_POST['post_types'] ?? array() );
		$post_types     = array_values(
			array_filter(
				$this->sanitize_key_list( $raw_post_types ),
				'post_type_exists'
			)
		);

		$session_id = absint( $_POST['session_id'] ?? 0 );

		$orderby = 'title' === sanitize_key( wp_unslash( $_POST['orderby'] ?? '' ) )
			? 'title'
			: 'import_date';

		$order = 'asc' === sanitize_key( wp_unslash( $_POST['order'] ?? '' ) )
			? 'asc'
			: 'desc';

		$imported_after  = self::sanitize_calendar_day(
			sanitize_text_field( wp_unslash( $_POST['imported_after'] ?? '' ) ),
			false
		);
		$imported_before = self::sanitize_calendar_day(
			sanitize_text_field( wp_unslash( $_POST['imported_before'] ?? '' ) ),
			true
		);
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$args = array(
			'statuses'   => $statuses,
			'post_types' => $post_types,
			'session_id' => $session_id,
			'orderby'    => $orderby,
			'order'      => $order,
		);

		if ( '' !== $search ) {
			$args['search'] = $search;
		}

		if ( '' !== $name ) {
			$args['name'] = $name;
		}

		if ( null !== $imported_after ) {
			$args['imported_after'] = $imported_after;
		}

		if ( null !== $imported_before ) {
			$args['imported_before'] = $imported_before;
		}

		return $args;
	}

	/**
	 * Validates a YYYY-MM-DD calendar-day input and expands it to a MySQL
	 * datetime boundary.
	 *
	 * @param mixed $value   Raw param value.
	 * @param bool  $ceiling True when this is the upper bound of a range
	 *                       (advances to end-of-day).
	 * @return string|null Canonical `Y-m-d H:i:s`, or null when absent/invalid.
	 */
	private static function sanitize_calendar_day(
		mixed $value,
		bool $ceiling
	): ?string {
		if ( ! is_string( $value ) || '' === $value ) {
			return null;
		}

		// createFromFormat normalizes overflow (month 13 → next year);
		// round-trip the parsed value to reject those.
		$dt = \DateTimeImmutable::createFromFormat( '!Y-m-d', $value );
		if ( false === $dt || $dt->format( 'Y-m-d' ) !== $value ) {
			return null;
		}

		if ( $ceiling ) {
			$dt = $dt->setTime( 23, 59, 59 );
		}

		return $dt->format( 'Y-m-d H:i:s' );
	}

	/**
	 * Reduces request input to a list of sanitized, non-empty key strings,
	 * ignoring any non-scalar entries.
	 *
	 * @param mixed $raw Raw request value (array or scalar).
	 * @return list<string> Sanitized keys.
	 */
	private function sanitize_key_list( $raw ): array {
		return array_values(
			array_filter(
				array_map(
					static fn( $value ): string =>
						is_scalar( $value ) ? sanitize_key( (string) $value ) : '',
					(array) $raw
				)
			)
		);
	}

	/**
	 * Appends the listing's first-load extras to a response when requested.
	 *
	 * Computes the filter facets over the full set so the client fetches them
	 * once (on first load) rather than on every page/filter change.
	 *
	 * @param array $response    Response payload to augment.
	 * @param bool  $with_facets Whether to attach the first-load extras.
	 * @return array Response, with the `facets` key when `$with_facets` is true.
	 */
	private function with_imported_listing_extras(
		array $response,
		bool $with_facets
	): array {
		if ( $with_facets ) {
			$response['facets'] = $this->repository->get_imported_filter_facets();
		}

		return $response;
	}

	/**
	 * Serializes an imported post + its most-recent items-table row into the
	 * row shape consumed by the Imports → Posts tab DataView.
	 *
	 * @param \WP_Post   $post Imported WordPress post.
	 * @param array|null $item Most recent items-table row, or null if absent.
	 * @return array Row payload matching the listing's item shape.
	 */
	private function build_imported_listing_row( \WP_Post $post, ?array $item ): array {
		$source_post_id   = (int) get_post_meta( $post->ID, Options::META_SOURCE_POST_ID, true );
		$source_link      = (string) get_post_meta( $post->ID, Options::META_SOURCE_LINK, true );
		$edit_url_or_null = get_edit_post_link( $post->ID, 'raw' );

		return array(
			'id'                   => $post->ID,
			'source_post_id'       => $source_post_id,
			'title'                => $post->post_title,
			'post_type'            => $post->post_type,
			'local_status'         => $post->post_status,
			'edit_url'             => is_string( $edit_url_or_null ) ? $edit_url_or_null : '',
			'source_link'          => $source_link,
			'item_id'              => null !== $item ? (int) $item['id'] : null,
			'session_id'           => null !== $item ? (int) $item['session_id'] : null,
			'rollback_status'      => null !== $item ? (string) $item['status'] : null,
			'has_previous_content' => null !== $item ? (bool) $item['has_previous_content'] : false,
			'import_date_gmt'      => null !== $item ? (string) $item['import_date_gmt'] : null,
		);
	}

	/**
	 * Sanitizes the catalog UI's filter/sort/page params.
	 *
	 * Allowlists for sort/status are imported from the source-side controller
	 * so an in-tree change can't drift the two sides.
	 *
	 * @return array Validated args for Source_Posts_API::fetch_posts.
	 */
	private function build_catalog_args(): array {
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- caller (ajax_fetch_posts) verified the nonce.
		$orderby_raw = sanitize_text_field( wp_unslash( $_POST['orderby'] ?? '' ) );
		$order_raw   = strtolower( sanitize_text_field( wp_unslash( $_POST['order'] ?? '' ) ) );

		$args = array(
			'page'      => max( 1, absint( $_POST['page'] ?? 1 ) ),
			'per_page'  => max( 1, absint( $_POST['per_page'] ?? 20 ) ),
			'orderby'   => in_array( $orderby_raw, Catalog_REST_Controller::ALLOWED_ORDERBY, true )
				? $orderby_raw
				: 'date',
			'order'     => in_array( $order_raw, Catalog_REST_Controller::ALLOWED_ORDER, true )
				? $order_raw
				: 'desc',
			'post_type' => sanitize_text_field( wp_unslash( $_POST['post_type'] ?? 'post' ) ),
		);

		$search = trim( sanitize_text_field( wp_unslash( $_POST['search'] ?? '' ) ) );
		if ( '' !== $search ) {
			$args['search'] = $search;
		}

		$name = sanitize_title( wp_unslash( $_POST['name'] ?? '' ) );
		if ( '' !== $name ) {
			$args['name'] = $name;
		}

		// Each element is reduced to the shared allowlist by normalize_statuses
		// via sanitize_key, so the array as a whole is safe to pass through.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$statuses = self::normalize_statuses( wp_unslash( $_POST['status'] ?? array() ) );
		if ( array() !== $statuses ) {
			$args['status'] = $statuses;
		}

		foreach ( array( 'published_after', 'published_before' ) as $param ) {
			$raw = sanitize_text_field( wp_unslash( $_POST[ $param ] ?? '' ) );
			if ( '' !== $raw ) {
				$args[ $param ] = $raw;
			}
		}
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		return $args;
	}

	/**
	 * Reduces a raw status param to the shared allowlist; unknown values
	 * are dropped silently so a fat-fingered request still yields a result.
	 *
	 * @param mixed $raw Raw status value (array or string).
	 * @return string[] Sanitized status list.
	 */
	private static function normalize_statuses( mixed $raw ): array {
		if ( is_string( $raw ) ) {
			$raw = '' === $raw ? array() : explode( ',', $raw );
		}

		if ( ! is_array( $raw ) ) {
			return array();
		}

		return array_values(
			array_intersect(
				array_map(
					static fn( string $v ): string => sanitize_key( $v ),
					array_filter( $raw, 'is_string' )
				),
				Catalog_REST_Controller::ALLOWED_STATUSES
			)
		);
	}

	/**
	 * Handles AJAX request for fetching post types.
	 */
	public function ajax_fetch_post_types(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		$source_site_url = sanitize_text_field( wp_unslash( $_POST['source_site_url'] ?? '' ) );

		if ( empty( $source_site_url ) ) {
			wp_send_json_error( __( 'Source site URL is required.', 'safe-publish' ) );
		}

		$this->validate_auth_or_fail();

		$auth_credentials = Auth_Credential_Provider::get_credentials();

		$post_types = $this->post_type_fetcher->fetch_post_types( $source_site_url, $auth_credentials );

		if ( is_wp_error( $post_types ) ) {
			wp_send_json_error( $post_types->get_error_message() );
		}

		wp_send_json_success( $post_types );
	}

	/**
	 * Handles AJAX request for testing connection.
	 */
	public function ajax_test_connection(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		$connected_site_url = sanitize_text_field( wp_unslash( $_POST['connected_site_url'] ?? '' ) );

		if ( empty( $connected_site_url ) ) {
			wp_send_json_error( __( 'Connected site URL is required.', 'safe-publish' ) );
		}

		$this->validate_auth_or_fail();

		$auth_credentials = Auth_Credential_Provider::get_credentials();

		// When the settings form submits live credential fields, always honour
		// them — including when they are empty — so cleared fields override any
		// previously saved Basic Auth credentials.
		if ( array_key_exists( 'username', $_POST ) && array_key_exists( 'password', $_POST ) ) {
			$username = sanitize_text_field( wp_unslash( $_POST['username'] ) );
			$password = sanitize_text_field( wp_unslash( $_POST['password'] ) );

			if ( ! empty( $username ) && ! empty( $password ) ) {
				$auth_credentials['username'] = $username;
				$auth_credentials['password'] = $password;
			} else {
				unset( $auth_credentials['username'], $auth_credentials['password'] );
			}
		}

		$results = $this->api->test_connection( $connected_site_url, $auth_credentials );

		wp_send_json_success( $results );
	}

	/**
	 * Handles AJAX request for the cached auth-status probe.
	 *
	 * Returns the cached probe result so the import and settings UIs can
	 * surface live auth state on page load without each one issuing its own
	 * network request.
	 */
	public function ajax_auth_status(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		wp_send_json_success( $this->get_cached_auth_status() );
	}

	/**
	 * Returns the cached auth-status probe result, refreshing it if absent.
	 *
	 * @return array Probe result from VIP_Safe_Auth::test_authorization().
	 */
	private function get_cached_auth_status(): array {
		$cached = get_site_transient( self::AUTH_STATUS_TRANSIENT );
		if ( is_array( $cached ) && isset( $cached['status'] ) ) {
			return $cached;
		}

		$result = VIP_Safe_Auth::test_authorization(
			get_option( Options::OPTION_CONNECTED_SITE_URL, '' ),
			Auth_Credential_Provider::get_credentials()
		);

		set_site_transient(
			self::AUTH_STATUS_TRANSIENT,
			$result,
			self::AUTH_STATUS_TTL
		);

		return $result;
	}

	/**
	 * Handles AJAX request for creating a draft post.
	 *
	 * Validates input, checks for an existing post with the same source ID,
	 * returns a confirmation prompt when one exists (unless force_update is set),
	 * processes content, creates or updates the post, and logs history.
	 */
	public function ajax_create_draft(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability( 'edit_posts' );

		$this->validate_auth_or_fail();

		$source_post_id = absint( $_POST['source_post_id'] ?? 0 );
		$title          = sanitize_text_field( wp_unslash( $_POST['title'] ?? '' ) );
		$raw_post_type  = sanitize_text_field( wp_unslash( $_POST['post_type'] ?? 'post' ) );
		$force_update   = isset( $_POST['force_update'] ) && 'true' === $_POST['force_update'];

		// Validate basic input before any session or duplicate-detection work so
		// that malformed requests do not leave history rows behind and cannot
		// reach the confirm-prompt branch by way of an existing post lookup.
		// Post_Import_Service::validate_required_fields() and resolve_post_type()
		// repeat these checks as defense-in-depth and to cover the bulk-import
		// code path.
		if ( 0 === $source_post_id ) {
			wp_send_json_error( __( 'Source post ID is required.', 'safe-publish' ) );
		}

		if ( '' === $title ) {
			wp_send_json_error( __( 'Post title is required.', 'safe-publish' ) );
		}

		$post_type = $this->post_import_service->resolve_post_type( $raw_post_type );

		if ( is_wp_error( $post_type ) ) {
			wp_send_json_error( $post_type->get_error_message() );
		}

		// Force-update confirmation prompt is HTTP UX, not import logic: if the
		// post is already imported and the caller hasn't opted into updating,
		// return the prompt response instead of running the import.
		$imported_post = $this->post_import_service->find_imported_post( $source_post_id );

		if ( $imported_post && ! $force_update ) {
			wp_send_json_success(
				array(
					'existing'       => true,
					'post_id'        => $imported_post->ID,
					'post_title'     => $imported_post->post_title,
					'edit_url'       => admin_url( 'post.php?post=' . $imported_post->ID . '&action=edit' ),
					'message'        => sprintf(
						/* translators: %s: title of the existing post */
						__( 'Post "%s" already exists. Do you want to update it with the latest content from the source site?', 'safe-publish' ),
						$imported_post->post_title
					),
					'confirm_action' => 'update_existing',
				)
			);
		}

		// Session is created only after the request is eligible to proceed —
		// past basic validation and past the confirm-prompt short-circuit — so
		// that rejected requests do not leave rows in the history table.
		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );
		$session_result  = $this->repository->create_session( $source_site_url, 'single' );

		if ( is_wp_error( $session_result ) ) {
			wp_send_json_error( $session_result->get_error_message() );
		}

		$session_id = $session_result;

		$post_data = array(
			'id'             => $source_post_id,
			'title'          => $title,
			// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitized by Post_Import_Service::extract_post_fields().
			'link'           => wp_unslash( $_POST['source_link'] ?? '' ),
			'post_type'      => $raw_post_type,
			'featured_media' => absint( $_POST['featured_media_id'] ?? 0 ),
		);

		// JSON string not sanitized to preserve structure; validated after decode.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$meta_param = isset( $_POST['meta'] ) ? wp_unslash( $_POST['meta'] ) : '';
		if ( is_string( $meta_param ) && '' !== $meta_param ) {
			$decoded_meta = json_decode( $meta_param, true );
			if ( is_array( $decoded_meta ) ) {
				$post_data['meta'] = $decoded_meta;
			}
		}

		// JSON string not sanitized to preserve structure; validated after decode.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$terms_param = isset( $_POST['terms'] ) ? wp_unslash( $_POST['terms'] ) : '';
		if ( is_string( $terms_param ) && '' !== $terms_param ) {
			$decoded_terms = json_decode( $terms_param, true );
			if ( is_array( $decoded_terms ) ) {
				$post_data['terms'] = $decoded_terms;
			}
		}

		$result = $this->post_import_service->import_post(
			$post_data,
			$session_id,
			array( 'force_draft_on_update' => true )
		);

		$this->repository->complete_session( $session_id );

		if ( ! $result['success'] ) {
			wp_send_json_error( $result['error'] );
		}

		$result['message'] = $result['existing']
			? __( 'Existing draft updated with latest content.', 'safe-publish' )
			: __( 'Draft post created successfully.', 'safe-publish' );

		wp_send_json_success( $result );
	}

	/**
	 * Handles AJAX request for bulk importing posts.
	 *
	 * Runs in two passes so parent-child relationships are preserved across a
	 * batch: pass 1 fetches each post's fresh REST payload without writing to
	 * the DB, and pass 2 processes the batch in topological order so a source
	 * parent is imported before its children.
	 */
	public function ajax_bulk_import(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability( 'edit_posts' );

		$this->validate_auth_or_fail();

		// JSON string not sanitized to preserve structure; validated after decode.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$posts_data_json = isset( $_POST['posts_data'] ) ? wp_unslash( $_POST['posts_data'] ) : '';

		if ( empty( $posts_data_json ) ) {
			wp_send_json_error( __( 'Posts data is required.', 'safe-publish' ) );
		}

		$posts_data = json_decode( $posts_data_json, true );

		if ( ! is_array( $posts_data ) || empty( $posts_data ) ) {
			wp_send_json_error( __( 'Invalid posts data provided.', 'safe-publish' ) );
		}

		// Limit bulk operations to prevent timeout/memory issues.
		if ( count( $posts_data ) > 50 ) {
			wp_send_json_error( __( 'Bulk import limited to 50 posts at a time.', 'safe-publish' ) );
		}

		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );
		$session_result  = $this->repository->create_session( $source_site_url, 'bulk' );

		if ( is_wp_error( $session_result ) ) {
			wp_send_json_error( $session_result->get_error_message() );
		}

		$session_id = $session_result;

		// Pass 1: fetch each post's REST payload without touching the DB. The
		// payload is the same source of truth used by pass 2, so prefetched
		// posts skip the in-pipeline fetch when they're processed.
		$batch_fresh_data = array();
		$request_index    = array();
		foreach ( $posts_data as $index => $post_data ) {
			$source_post_id = absint( $post_data['id'] ?? 0 );
			if ( 0 === $source_post_id ) {
				continue;
			}

			$post_type = sanitize_text_field( $post_data['post_type'] ?? 'post' );
			$fresh     = $this->api->fetch_fresh_post( $source_post_id, $post_type );
			if ( is_wp_error( $fresh ) ) {
				continue;
			}

			$batch_fresh_data[ $source_post_id ] = $fresh;
			$request_index[ $source_post_id ]    = $index;
		}

		// Topologically sort so each source parent is processed before its
		// children. Cycle leftovers fall through to the normal unresolvable-
		// parent error path.
		$parent_map = array();
		foreach ( $batch_fresh_data as $source_id => $fresh ) {
			$parent_map[ $source_id ] = absint( $fresh['parent'] ?? 0 );
		}

		$sort_result  = Topological_Sorter::sort( $parent_map );
		$sorted_order = array_merge( $sort_result['sorted'], $sort_result['leftover'] );
		$processed    = array();

		$results    = array();
		$successful = 0;
		$failed     = 0;

		// Pass 2: process in topological order, then append items whose pass-1
		// fetch failed (or was skipped) in request order — import_post() will
		// re-fetch them and surface the underlying failure.
		foreach ( $sorted_order as $source_id ) {
			$index     = $request_index[ $source_id ];
			$post_data = $posts_data[ $index ];
			$prefetch  = $batch_fresh_data[ $source_id ];

			$result    = $this->post_import_service->import_post(
				$post_data,
				$session_id,
				array(
					'prefetched_fresh_result' => $prefetch,
					'batch_fresh_data'        => $batch_fresh_data,
				)
			);
			$results[] = $result;

			$processed[ $source_id ] = true;

			if ( $result['success'] ) {
				++$successful;
			} else {
				++$failed;
			}
		}

		foreach ( $posts_data as $post_data ) {
			$source_post_id = absint( $post_data['id'] ?? 0 );
			if ( $source_post_id > 0 && isset( $processed[ $source_post_id ] ) ) {
				continue;
			}

			$result    = $this->post_import_service->import_post(
				$post_data,
				$session_id,
				array( 'batch_fresh_data' => $batch_fresh_data )
			);
			$results[] = $result;

			if ( $result['success'] ) {
				++$successful;
			} else {
				++$failed;
			}
		}

		$this->repository->complete_session( $session_id );

		Post_Import_Notice::record(
			$session_id,
			count( $results ),
			$successful,
			$failed
		);

		wp_send_json_success(
			array(
				'total'      => count( $results ),
				'successful' => $successful,
				'failed'     => $failed,
				'results'    => $results,
				'session_id' => $session_id,
			)
		);
	}

	/**
	 * Handles AJAX request for deleting a locally imported post.
	 *
	 * Moves the local post to trash by its WordPress post ID. The Imports →
	 * Posts tab is the only caller and already has the local ID in hand, so
	 * no source-side lookup is needed; the imported-post meta is still
	 * required so this endpoint can't be repurposed to trash arbitrary posts.
	 */
	public function ajax_delete_post(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability( 'delete_posts' );

		$post_id = absint( $_POST['post_id'] ?? 0 );

		if ( ! $post_id ) {
			wp_send_json_error( __( 'Post ID is required.', 'safe-publish' ) );
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			wp_send_json_error( __( 'Post not found.', 'safe-publish' ) );
		}

		$source_id = (string) get_post_meta(
			$post->ID,
			Options::META_SOURCE_POST_ID,
			true
		);

		if ( '' === $source_id ) {
			wp_send_json_error( __( 'Post not found.', 'safe-publish' ) );
		}

		if ( ! current_user_can( 'delete_post', $post->ID ) ) {
			wp_send_json_error( __( 'Forbidden', 'safe-publish' ), 403 );
		}

		$result = wp_trash_post( $post->ID );

		if ( ! $result ) {
			wp_send_json_error( __( 'Failed to delete the post.', 'safe-publish' ) );
		}

		wp_send_json_success( array( 'message' => __( 'Post moved to trash.', 'safe-publish' ) ) );
	}

	/**
	 * Handles AJAX request for bulk-trashing imported posts from the
	 * Imports → Posts tab.
	 *
	 * Each id is verified to map to a real post that this plugin imported
	 * (META_SOURCE_POST_ID present) and that the caller can delete; rows
	 * that fail either check are skipped, not aborted. The endpoint moves
	 * matched posts to the trash via wp_trash_post — same disposition as
	 * the single-delete path.
	 */
	public function ajax_bulk_delete_posts(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability( 'delete_posts' );

		// Each element is downstream-sanitized via absint().
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$raw_ids = (array) wp_unslash( $_POST['post_ids'] ?? array() );

		$post_ids = array_values(
			array_unique(
				array_filter(
					array_map( 'absint', $raw_ids ),
					static fn( int $id ): bool => $id > 0
				)
			)
		);

		if ( 0 === count( $post_ids ) ) {
			wp_send_json_error( __( 'No posts provided.', 'safe-publish' ) );
		}

		if ( count( $post_ids ) > self::BULK_DELETE_POSTS_BATCH_MAX ) {
			wp_send_json_error(
				sprintf(
					/* translators: %d: maximum number of posts per batch */
					__(
						'Bulk delete is limited to %d posts at a time.',
						'safe-publish'
					),
					self::BULK_DELETE_POSTS_BATCH_MAX
				)
			);
		}

		$deleted = 0;
		$skipped = 0;

		foreach ( $post_ids as $post_id ) {
			$post = get_post( $post_id );
			if ( ! $post ) {
				++$skipped;
				continue;
			}

			$source_id = (string) get_post_meta(
				$post->ID,
				Options::META_SOURCE_POST_ID,
				true
			);
			if ( '' === $source_id ) {
				++$skipped;
				continue;
			}

			if ( ! current_user_can( 'delete_post', $post->ID ) ) {
				++$skipped;
				continue;
			}

			if ( wp_trash_post( $post->ID ) ) {
				++$deleted;
			} else {
				++$skipped;
			}
		}

		wp_send_json_success(
			array(
				'deleted' => $deleted,
				'skipped' => $skipped,
			)
		);
	}

	/**
	 * Handles AJAX request for the Imports → Posts tab sync-status column.
	 *
	 * Takes a batch of source post IDs and returns per-ID a `{ status,
	 * modified_gmt? }` entry, where status is one of `up-to-date | outdated
	 * | missing | unreachable | invalid`, computed by comparing the source
	 * post's `modified_gmt` against the destination's most recent
	 * `import_date_gmt`. `modified_gmt` is set only for `outdated` and
	 * `up-to-date` — i.e., when the source returned a parseable timestamp.
	 * Posts are batched by type so each post-type group costs one signed
	 * catalog call.
	 *
	 * Catalog_REST_Controller::ALLOWED_STATUSES excludes 'trash', so a
	 * trashed source post reads as `missing` here. Deliberate — trashed
	 * posts have no public surface, so sync-status treats them as deleted.
	 */
	public function ajax_sync_status_batch(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability( 'edit_posts' );

		$this->validate_auth_or_fail();

		// phpcs:disable WordPress.Security.NonceVerification.Missing -- caller already verified via check_ajax_referer.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- each element is downstream-sanitized via absint().
		$raw_ids = (array) wp_unslash( $_POST['source_ids'] ?? array() );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$source_ids = array_values(
			array_unique(
				array_filter(
					array_map(
						static fn( mixed $v ): int => absint( $v ),
						$raw_ids
					),
					static fn( int $id ): bool => $id > 0
				)
			)
		);

		if ( count( $source_ids ) > self::SYNC_STATUS_BATCH_MAX ) {
			wp_send_json_error(
				sprintf(
					/* translators: %d: maximum number of posts per batch */
					__(
						'Sync status check is limited to %d posts at a time.',
						'safe-publish'
					),
					self::SYNC_STATUS_BATCH_MAX
				)
			);
		}

		if ( 0 === count( $source_ids ) ) {
			wp_send_json_success( array( 'statuses' => (object) array() ) );
		}

		// Two bulk queries instead of N per-row meta_query + items-table reads.
		$imported_by_source_id = $this->post_import_service
			->fetch_imported_posts_by_source_ids( $source_ids );

		if ( 0 === count( $imported_by_source_id ) ) {
			wp_send_json_success( array( 'statuses' => (object) array() ) );
		}

		$post_ids = array_map(
			static fn( WP_Post $p ): int => (int) $p->ID,
			$imported_by_source_id
		);

		$items_by_post_id = $this->repository->get_items_for_posts( $post_ids );

		$by_post_type = array();
		$context      = array();

		foreach ( $imported_by_source_id as $source_id => $local_post ) {
			$item = $items_by_post_id[ $local_post->ID ] ?? null;
			if ( null === $item || ! isset( $item['import_date_gmt'] ) ) {
				continue;
			}

			$context[ $source_id ] = (string) $item['import_date_gmt'];

			$post_type                    = (string) $local_post->post_type;
			$by_post_type[ $post_type ][] = $source_id;
		}

		if ( 0 === count( $context ) ) {
			wp_send_json_success( array( 'statuses' => (object) array() ) );
		}

		$source_site_url  = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );
		$auth_credentials = Auth_Credential_Provider::get_credentials();

		$statuses = array();
		foreach ( $by_post_type as $post_type => $ids ) {
			$response = $this->api->fetch_posts(
				$source_site_url,
				$auth_credentials,
				array(
					'post_type' => $post_type,
					'include'   => $ids,
				)
			);

			if ( is_wp_error( $response ) ) {
				foreach ( $ids as $id ) {
					$statuses[ $id ] = array( 'status' => 'unreachable' );
				}
				continue;
			}

			$source_modified_by_id = array();
			foreach ( $response['items'] as $item ) {
				$source_modified_by_id[ (int) $item['id'] ] = (string) $item['modified_gmt'];
			}

			foreach ( $ids as $id ) {
				if ( ! isset( $source_modified_by_id[ $id ] ) ) {
					$statuses[ $id ] = array( 'status' => 'missing' );
					continue;
				}

				$verdict = self::compare_sync_state(
					$source_modified_by_id[ $id ],
					$context[ $id ]
				);

				$entry = array( 'status' => $verdict );
				if ( 'invalid' !== $verdict ) {
					$entry['modified_gmt'] = $source_modified_by_id[ $id ];
				}
				$statuses[ $id ] = $entry;
			}
		}

		wp_send_json_success( array( 'statuses' => $statuses ) );
	}

	/**
	 * Maps Sync_State_Comparator's verdict to the Imports tab's status
	 * string. `invalid` flags a local parse failure (a data bug), distinct
	 * from `unreachable` (network) and `missing` (caller-set).
	 *
	 * @param string $source_modified_gmt ISO 8601 modified_gmt from the source.
	 * @param string $import_date_gmt     MySQL datetime from the items table.
	 * @return string Verdict: 'up-to-date', 'outdated', or 'invalid'.
	 */
	private static function compare_sync_state(
		string $source_modified_gmt,
		string $import_date_gmt
	): string {
		$is_newer = Sync_State_Comparator::source_is_newer(
			$source_modified_gmt,
			$import_date_gmt
		);

		if ( null === $is_newer ) {
			return 'invalid';
		}

		return $is_newer ? 'outdated' : 'up-to-date';
	}

	/**
	 * Sends a JSON error response when the Shared Secret does not satisfy
	 * VIP_Safe_Auth::has_valid_credential_format(). Splits the failure into
	 * "missing" and "too short" so the operator gets an actionable message.
	 */
	private function validate_auth_or_fail(): void {
		$credentials = Auth_Credential_Provider::get_credentials();

		if ( VIP_Safe_Auth::has_valid_credential_format( $credentials ) ) {
			return;
		}

		if ( '' === ( $credentials['shared_secret'] ?? '' ) ) {
			wp_send_json_error(
				__(
					'Shared Secret is not configured. Add SAFE_PUBLISH_SHARED_SECRET to wp-config.php on both sites.',
					'safe-publish'
				),
				401
			);
		} else {
			wp_send_json_error(
				__(
					'Shared Secret is too short. SAFE_PUBLISH_SHARED_SECRET must be at least 16 characters.',
					'safe-publish'
				),
				401
			);
		}
	}
}
