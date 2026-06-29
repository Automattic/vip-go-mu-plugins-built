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
use Safe_Publish\Utils\Datetime_Sanitizer;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Sync_State_Comparator;
use Safe_Publish\Utils\Telemetry_Events;
use Safe_Publish\Utils\Telemetry_Service;
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
	 * Maximum number of source catalog pages scanned while filling one
	 * Available page, bounding worst-case latency when non-imported rows are
	 * sparse. If the scan hits this cap before the page fills, has_more stays
	 * true so the client can keep paging.
	 *
	 * @var int
	 */
	const AVAILABLE_FILL_MAX_FETCHES = 15;

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
	 * Telemetry service used to emit import-completion events.
	 *
	 * @var Telemetry_Service
	 */
	private Telemetry_Service $telemetry;

	/**
	 * Constructs the Admin_Ajax_Controller instance.
	 *
	 * @param Source_Posts_API    $api                 Source Posts API instance.
	 * @param History_Repository  $repository          History repository instance.
	 * @param Post_Import_Service $post_import_service Post Import Service instance.
	 * @param Post_Type_Fetcher   $post_type_fetcher   Post Type Fetcher instance.
	 * @param Telemetry_Service   $telemetry           Telemetry service.
	 */
	public function __construct(
		Source_Posts_API $api,
		History_Repository $repository,
		Post_Import_Service $post_import_service,
		Post_Type_Fetcher $post_type_fetcher,
		Telemetry_Service $telemetry
	) {
		$this->api                 = $api;
		$this->repository          = $repository;
		$this->post_import_service = $post_import_service;
		$this->post_type_fetcher   = $post_type_fetcher;
		$this->telemetry           = $telemetry;
	}

	/**
	 * Registers all AJAX action handlers.
	 */
	public function register_handlers(): void {
		add_action( 'wp_ajax_safe_publish_list_posts', array( $this, 'ajax_list_posts' ) );
		add_action( 'wp_ajax_safe_publish_list_orphan_failures', array( $this, 'ajax_list_orphan_failures' ) );
		add_action( 'wp_ajax_safe_publish_delete_failed_items', array( $this, 'ajax_delete_failed_items' ) );
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
	 * State-routed Posts listing endpoint.
	 *
	 * 'all'/'available' are catalog-primary (catalog fetch annotated with
	 * local data). 'up-to-date'/'outdated'/'failed' are local-primary (items
	 * aggregated by source_post_id, merged with source data via include=).
	 * `focus_source_id` resolves to a concrete state echoed back in
	 * `focused_state` so the frontend can swap its chip in one render.
	 */
	public function ajax_list_posts(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$source_site_url = sanitize_text_field(
			wp_unslash( $_POST['source_site_url'] ?? '' )
		);
		// Allowlisted to a small enum by sanitize_state.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$requested_state   = self::sanitize_state( $_POST['state'] ?? 'all' );
		$focus_source_id   = absint( $_POST['focus_source_id'] ?? 0 );
		$with_orphan_count = 1 === absint( $_POST['with_orphan_count'] ?? 0 );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		if ( '' === $source_site_url ) {
			wp_send_json_error( __( 'Source site URL is required.', 'safe-publish' ) );
		}

		$focused_state = null;
		$state         = $requested_state;
		if ( $focus_source_id > 0 ) {
			$focused_state = $this->repository->resolve_source_post_state(
				$focus_source_id
			);
			if ( 'all' !== $state && $focused_state !== $state ) {
				$state = $focused_state;
			}
		}

		if ( in_array( $state, array( 'all', 'available' ), true ) ) {
			$payload = $this->list_posts_via_catalog( $source_site_url, $state );
		} else {
			$payload = $this->list_posts_via_local( $source_site_url, $state );
		}

		if ( is_wp_error( $payload ) ) {
			wp_send_json_error( $payload->get_error_message() );
		}

		$payload['state'] = $state;
		if ( null !== $focused_state ) {
			$payload['focused_state']          = $focused_state;
			$payload['focused_source_post_id'] = $focus_source_id;
		}
		if ( $with_orphan_count ) {
			$payload['orphan_count'] = $this->repository->count_orphan_failures();
		}

		wp_send_json_success( $payload );
	}

	/**
	 * Lists orphan failures (errors with no source_post_id) for the drawer.
	 */
	public function ajax_list_orphan_failures(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$page             = max( 1, absint( $_POST['page'] ?? 1 ) );
		$per_page         = max( 1, min( 100, absint( $_POST['per_page'] ?? 20 ) ) );
		$search           = trim(
			sanitize_text_field( wp_unslash( $_POST['search'] ?? '' ) )
		);
		$attempted_after  = Datetime_Sanitizer::sanitize_iso_datetime(
			sanitize_text_field( wp_unslash( $_POST['attempted_after'] ?? '' ) ),
			false
		);
		$attempted_before = Datetime_Sanitizer::sanitize_iso_datetime(
			sanitize_text_field( wp_unslash( $_POST['attempted_before'] ?? '' ) ),
			true
		);
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$args = array();
		if ( '' !== $search ) {
			$args['search'] = $search;
		}
		if ( is_string( $attempted_after ) ) {
			$args['attempted_after'] = $attempted_after;
		}
		if ( is_string( $attempted_before ) ) {
			$args['attempted_before'] = $attempted_before;
		}

		$rows = $this->repository->list_orphan_failures( $page, $per_page, $args );

		$has_more = count( $rows ) > $per_page;
		if ( $has_more ) {
			$rows = array_slice( $rows, 0, $per_page );
		}

		$items = array_map(
			static fn( array $row ): array => array(
				'id'              => (int) $row['id'],
				'session_id'      => (int) $row['session_id'],
				'title'           => (string) $row['title'],
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
	 * Removes failure rows by id. The repository helper scopes to
	 * status='error' so success/updated rows are unreachable.
	 */
	public function ajax_delete_failed_items(): void {
		check_ajax_referer( 'safe_publish_ajax_nonce', 'nonce' );
		$this->verify_ajax_capability();

		// Each element is downstream-sanitized via absint().
		// phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$raw_item_ids   = (array) wp_unslash( $_POST['item_ids'] ?? array() );
		$raw_source_ids = (array) wp_unslash(
			$_POST['source_post_ids'] ?? array()
		);
		// phpcs:enable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

		$item_ids        = array_map( 'absint', $raw_item_ids );
		$source_post_ids = array_map( 'absint', $raw_source_ids );

		if ( 0 === count( $item_ids ) && 0 === count( $source_post_ids ) ) {
			wp_send_json_error( __( 'No items provided.', 'safe-publish' ) );
		}

		$total = count( $item_ids ) + count( $source_post_ids );
		if ( $total > self::DELETE_FAILED_IMPORTS_BATCH_MAX ) {
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

		$deleted = $this->repository->delete_failed_items(
			$item_ids,
			$source_post_ids
		);

		wp_send_json_success( array( 'deleted' => $deleted ) );
	}

	/**
	 * Builds the catalog-primary payload for ajax_list_posts.
	 *
	 * @param string $source_site_url Source site URL.
	 * @param string $state           'all' or 'available'.
	 * @return array|\WP_Error Listing payload, or WP_Error on catalog failure.
	 */
	private function list_posts_via_catalog(
		string $source_site_url,
		string $state
	): array|\WP_Error {
		$this->validate_auth_or_fail();
		$auth_credentials = Auth_Credential_Provider::get_credentials();
		$args             = $this->build_catalog_args();

		if ( 'available' === $state ) {
			return $this->list_available_via_catalog(
				$source_site_url,
				$auth_credentials,
				$args
			);
		}

		$result = $this->api->fetch_posts(
			$source_site_url,
			$auth_credentials,
			$args
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$this->post_import_service->annotate_posts_with_import_status(
			$result['items']
		);

		$rows = array_map(
			static fn( array $item ): array =>
				self::build_unified_row_from_catalog( $item ),
			$result['items']
		);

		return array(
			'items'    => $rows,
			'has_more' => isset( $result['has_more'] )
				&& true === (bool) $result['has_more'],
		);
	}

	/**
	 * Builds the Available payload by pulling source catalog pages until the
	 * requested page is filled with non-imported rows.
	 *
	 * The Available chip drops already-imported rows, so a single source page
	 * can render almost empty while the source still reports more raw items.
	 * Filling across pages lets has_more reflect the non-imported count rather
	 * than the source's raw pagination.
	 *
	 * @param string $source_site_url  Source site URL.
	 * @param array  $auth_credentials Source auth credentials.
	 * @param array  $args             Validated catalog args, incl. page/per_page.
	 * @return array|\WP_Error Listing payload, or WP_Error on catalog failure.
	 */
	private function list_available_via_catalog(
		string $source_site_url,
		array $auth_credentials,
		array $args
	): array|\WP_Error {
		$client_page     = max( 1, (int) ( $args['page'] ?? 1 ) );
		$client_per_page = max( 1, (int) ( $args['per_page'] ?? 20 ) );

		// +1 past the page window tells us whether a further page exists.
		$offset = ( $client_page - 1 ) * $client_per_page;
		$needed = $offset + $client_per_page + 1;

		$collected       = array();
		$collected_count = 0;
		$source_more     = true;
		$capped          = false;
		$catalog_page    = 1;

		while ( $collected_count < $needed && $source_more ) {
			if ( $catalog_page > self::AVAILABLE_FILL_MAX_FETCHES ) {
				$capped = true;
				break;
			}

			$page_args             = $args;
			$page_args['page']     = $catalog_page;
			$page_args['per_page'] = Catalog_REST_Controller::MAX_PER_PAGE;

			$result = $this->api->fetch_posts(
				$source_site_url,
				$auth_credentials,
				$page_args
			);

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			$this->post_import_service->annotate_posts_with_import_status(
				$result['items']
			);

			$collected = array_merge(
				$collected,
				array_filter(
					$result['items'],
					static fn( array $item ): bool =>
						false === ( $item['is_imported'] ?? false )
				)
			);

			$collected_count = count( $collected );

			$source_more = isset( $result['has_more'] )
				&& true === (bool) $result['has_more'];

			++$catalog_page;
		}

		$rows = array_map(
			static fn( array $item ): array =>
				self::build_unified_row_from_catalog( $item ),
			array_slice( $collected, $offset, $client_per_page )
		);

		return array(
			'items'    => $rows,
			'has_more' => $collected_count > $offset + $client_per_page
				|| $capped,
		);
	}

	/**
	 * Builds the local-primary payload for ajax_list_posts.
	 *
	 * @param string $source_site_url Source site URL.
	 * @param string $state           'up-to-date', 'outdated', or 'failed'.
	 * @return array|\WP_Error Listing payload.
	 */
	private function list_posts_via_local(
		string $source_site_url,
		string $state
	): array|\WP_Error {
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$page     = max( 1, absint( $_POST['page'] ?? 1 ) );
		$per_page = max( 1, min( 100, absint( $_POST['per_page'] ?? 20 ) ) );
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$args = $this->build_local_listing_args();

		if ( 'failed' === $state ) {
			$active_rows = $this->repository->list_failed_source_rows(
				$page,
				$per_page,
				$args
			);
		} else {
			$args['freshness'] = 'outdated' === $state ? 'outdated' : 'up-to-date';
			$active_rows       = $this->repository->list_imported_source_rows(
				$page,
				$per_page,
				$args
			);
		}

		$has_more = count( $active_rows ) > $per_page;
		if ( $has_more ) {
			$active_rows = array_slice( $active_rows, 0, $per_page );
		}

		$source_by_id = $this->fetch_source_data_for_active_rows(
			$source_site_url,
			$active_rows,
			$state
		);

		$rows = array_map(
			static fn( array $active_row ): array =>
				self::build_unified_row_from_active(
					$active_row,
					$source_by_id[ (int) $active_row['source_post_id'] ] ?? null
				),
			$active_rows
		);

		return array(
			'items'    => $rows,
			'has_more' => $has_more,
		);
	}

	/**
	 * Fetches source data for a page of active rows, grouped by the row's
	 * post_type. Failed rows skip the fetch and reuse the snapshot title.
	 *
	 * @param string $source_site_url Source site URL.
	 * @param array  $active_rows     Rows from a list_*_source_rows() call.
	 * @param string $state           Routing state.
	 * @return array<int, array> Map of source_post_id → source row.
	 */
	private function fetch_source_data_for_active_rows(
		string $source_site_url,
		array $active_rows,
		string $state
	): array {
		if ( 0 === count( $active_rows ) || 'failed' === $state ) {
			return array();
		}

		$this->validate_auth_or_fail();
		$auth_credentials = Auth_Credential_Provider::get_credentials();

		$ids_by_post_type = array();
		foreach ( $active_rows as $row ) {
			$post_type = (string) ( $row['wp_post_type'] ?? 'post' );
			$source_id = (int) ( $row['source_post_id'] ?? 0 );
			if ( $source_id > 0 ) {
				$ids_by_post_type[ $post_type ][] = $source_id;
			}
		}

		$by_id = array();
		foreach ( $ids_by_post_type as $post_type => $ids ) {
			$response = $this->api->fetch_posts(
				$source_site_url,
				$auth_credentials,
				array(
					'post_type' => $post_type,
					'include'   => $ids,
				)
			);

			if ( is_wp_error( $response ) ) {
				continue;
			}

			foreach ( $response['items'] as $item ) {
				$by_id[ (int) $item['id'] ] = $item;
			}
		}

		return $by_id;
	}

	/**
	 * Builds the unified Posts row shape from an annotated catalog item.
	 *
	 * @param array $item Annotated catalog item.
	 * @return array Unified row.
	 */
	private static function build_unified_row_from_catalog( array $item ): array {
		return array(
			'id'                   => (int) ( $item['id'] ?? 0 ),
			'source_post_id'       => (int) ( $item['id'] ?? 0 ),
			'title'                => (string) ( $item['title'] ?? '' ),
			'link'                 => (string) ( $item['link'] ?? '' ),
			'modified_gmt'         => (string) ( $item['modified_gmt'] ?? '' ),
			'date_gmt'             => (string) ( $item['date_gmt'] ?? '' ),
			'post_type'            => (string) ( $item['post_type'] ?? 'post' ),
			'status'               => (string) ( $item['status'] ?? '' ),
			'local_state'          => (string) ( $item['local_state'] ?? 'available' ),
			'is_imported'          => (bool) ( $item['is_imported'] ?? false ),
			'wp_post_status'       => $item['wp_post_status'] ?? null,
			'item_id'              => $item['item_id'] ?? null,
			'post_id'              => $item['post_id'] ?? null,
			'import_date_gmt'      => $item['import_date_gmt'] ?? null,
			'error_message'        => $item['error_message'] ?? null,
			'has_previous_content' => (bool) ( $item['has_previous_content'] ?? false ),
			'edit_url'             => (string) ( $item['edit_url'] ?? '' ),
		);
	}

	/**
	 * Builds the unified Posts row shape from an active items-table row.
	 *
	 * @param array      $active_row Active items-table row.
	 * @param array|null $source     Matching catalog item, or null if the
	 *                               source post was not in the catalog response.
	 * @return array Unified row.
	 */
	private static function build_unified_row_from_active(
		array $active_row,
		?array $source
	): array {
		$source_post_id  = (int) ( $active_row['source_post_id'] ?? 0 );
		$post_id         = isset( $active_row['post_id'] )
			? (int) $active_row['post_id']
			: 0;
		$wp_post_type    = isset( $active_row['wp_post_type'] )
			? (string) $active_row['wp_post_type']
			: 'post';
		$wp_post_status  = isset( $active_row['wp_post_status'] )
			? (string) $active_row['wp_post_status']
			: null;
		$import_date     = (string) ( $active_row['import_date_gmt'] ?? '' );
		$source_modified = (string) ( $active_row['source_modified_gmt'] ?? '' );
		$is_failed       = 'error' === (string) ( $active_row['status'] ?? '' );
		$local_state     = $is_failed
			? 'failed'
			: ( '' !== $source_modified && $source_modified > $import_date
				? 'outdated'
				: 'up-to-date' );
		$edit_url        = $post_id > 0 ? get_edit_post_link( $post_id, 'raw' ) : null;

		return array(
			'id'                   => $source_post_id,
			'source_post_id'       => $source_post_id,
			'title'                => null !== $source
				? (string) ( $source['title'] ?? '' )
				: (string) ( $active_row['title'] ?? '' ),
			'link'                 => null !== $source
				? (string) ( $source['link'] ?? '' )
				: '',
			'modified_gmt'         => null !== $source
				? (string) ( $source['modified_gmt'] ?? '' )
				: $source_modified,
			'date_gmt'             => null !== $source
				? (string) ( $source['date_gmt'] ?? '' )
				: '',
			'post_type'            => null !== $source
				? (string) ( $source['post_type'] ?? $wp_post_type )
				: $wp_post_type,
			'status'               => null !== $source
				? (string) ( $source['status'] ?? '' )
				: '',
			'local_state'          => $local_state,
			'is_imported'          => 'failed' !== $local_state,
			'wp_post_status'       => $wp_post_status,
			'item_id'              => isset( $active_row['id'] ) ? (int) $active_row['id'] : null,
			'post_id'              => $post_id > 0 ? $post_id : null,
			'import_date_gmt'      => '' !== $import_date ? $import_date : null,
			'error_message'        => isset( $active_row['error_message'] )
				? (string) $active_row['error_message']
				: null,
			'has_previous_content' => (bool) ( $active_row['has_previous_content'] ?? 0 ),
			'edit_url'             => is_string( $edit_url ) ? $edit_url : '',
		);
	}

	/**
	 * Reduces a raw state value to the supported allowlist; unknown values
	 * fall back to 'all'.
	 *
	 * @param mixed $raw Raw state value.
	 * @return string Sanitized state.
	 */
	private static function sanitize_state( mixed $raw ): string {
		$value   = is_scalar( $raw ) ? sanitize_key( (string) $raw ) : '';
		$allowed = array( 'all', 'available', 'up-to-date', 'outdated', 'failed' );

		return in_array( $value, $allowed, true ) ? $value : 'all';
	}

	/**
	 * Validates and normalizes the local-primary listing's search/filter/sort
	 * params from the request.
	 *
	 * @return array Listing args for list_imported_source_rows() /
	 *               list_failed_source_rows().
	 */
	private function build_local_listing_args(): array {
		// Caller verified the nonce.
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$search = trim(
			sanitize_text_field( wp_unslash( $_POST['search'] ?? '' ) )
		);
		$name   = sanitize_title( wp_unslash( $_POST['name'] ?? '' ) );

		// sanitize_key_list() sanitizes each element.
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$raw_post_types = (array) wp_unslash( $_POST['post_types'] ?? array() );
		$post_types     = array_values(
			array_filter(
				$this->sanitize_key_list( $raw_post_types ),
				'post_type_exists'
			)
		);

		// The frontend sends post_type (singular) as the active selector;
		// merge it into post_types so the local listing filter actually fires.
		$post_type_singular = sanitize_key( wp_unslash( $_POST['post_type'] ?? '' ) );
		if ( '' !== $post_type_singular && post_type_exists( $post_type_singular ) ) {
			$post_types[] = $post_type_singular;
			$post_types   = array_values( array_unique( $post_types ) );
		}

		$session_id = absint( $_POST['session_id'] ?? 0 );

		$orderby = 'title' === sanitize_key( wp_unslash( $_POST['orderby'] ?? '' ) )
			? 'title'
			: 'import_date';

		$order = 'asc' === sanitize_key( wp_unslash( $_POST['order'] ?? '' ) )
			? 'asc'
			: 'desc';

		$imported_after  = Datetime_Sanitizer::sanitize_iso_datetime(
			sanitize_text_field( wp_unslash( $_POST['imported_after'] ?? '' ) ),
			false
		);
		$imported_before = Datetime_Sanitizer::sanitize_iso_datetime(
			sanitize_text_field( wp_unslash( $_POST['imported_before'] ?? '' ) ),
			true
		);
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		$args = array(
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

		if ( is_string( $imported_after ) ) {
			$args['imported_after'] = $imported_after;
		}

		if ( is_string( $imported_before ) ) {
			$args['imported_before'] = $imported_before;
		}

		return $args;
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
	 * Sanitizes the catalog UI's filter/sort/page params.
	 *
	 * Allowlists for sort/status are imported from the source-side controller
	 * so an in-tree change can't drift the two sides.
	 *
	 * @return array Validated args for Source_Posts_API::fetch_posts.
	 */
	private function build_catalog_args(): array {
		// Caller verified the nonce.
		// phpcs:disable WordPress.Security.NonceVerification.Missing
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
		$imported_post = $this->post_import_service->find_imported_post(
			$source_post_id,
			Options::get_connected_site_url_with_path()
		);

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
			$session_id
		);

		$this->repository->complete_session( $session_id );

		if ( ! $result['success'] ) {
			wp_send_json_error( $result['error'] );
		}

		$this->telemetry->record_event(
			Telemetry_Events::SINGLE_IMPORT_COMPLETED,
			array(
				'outcome'       => $result['existing']
					? Telemetry_Events::SINGLE_OUTCOME_UPDATED
					: Telemetry_Events::SINGLE_OUTCOME_NEW,
				'warning_count' => count( $result['warnings'] ?? array() ),
			)
		);

		$result['message'] = $result['existing']
			? __( 'Existing post updated with latest content.', 'safe-publish' )
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
		$sorted_order = self::defer_dependent_types(
			array_merge( $sort_result['sorted'], $sort_result['leftover'] ),
			$batch_fresh_data
		);
		$processed    = array();

		// Source ID => destination ID accumulator. Feeds block-attribute ID
		// remapping for items referencing in-batch imports (e.g. wp_navigation).
		$session_id_map = array();

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
					'session_id_map'          => $session_id_map,
				)
			);
			$results[] = $result;

			$processed[ $source_id ] = true;

			if ( $result['success'] ) {
				++$successful;
				$session_id_map[ $source_id ] = (int) $result['post_id'];
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
				array(
					'batch_fresh_data' => $batch_fresh_data,
					'session_id_map'   => $session_id_map,
				)
			);
			$results[] = $result;

			if ( $result['success'] ) {
				++$successful;
				if ( $source_post_id > 0 ) {
					$session_id_map[ $source_post_id ] = (int) $result['post_id'];
				}
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

		$this->telemetry->record_event(
			Telemetry_Events::BULK_IMPORT_COMPLETED,
			array(
				'batch_size'   => count( $results ),
				'successful'   => $successful,
				'failed'       => $failed,
				'has_failures' => $failed > 0,
			)
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
	 * Manage page.
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
	 * Handles AJAX request for the Manage listing's live sync-status check.
	 *
	 * Takes a batch of source post IDs and returns per-ID a `{ status }`
	 * entry, where status is one of `up-to-date | outdated | missing |
	 * unreachable | invalid`, computed by comparing the source post's
	 * `modified_gmt` against the destination's most recent
	 * `import_date_gmt`. Posts are batched by type so each post-type
	 * group costs one signed catalog call.
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
			->fetch_imported_posts_by_source_ids(
				$source_ids,
				Options::get_connected_site_url_with_path()
			);

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

		// item_id => source_modified_gmt updates, flushed in one query below.
		$source_modified_updates = array();

		$item_by_source_id = array();
		foreach ( $imported_by_source_id as $source_id => $local_post ) {
			$item = $items_by_post_id[ $local_post->ID ] ?? null;
			if ( null !== $item && isset( $item['id'] ) ) {
				$item_by_source_id[ $source_id ] = $item;
			}
		}

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

				$source_modified = $source_modified_by_id[ $id ];

				$verdict = self::compare_sync_state(
					$source_modified,
					$context[ $id ]
				);

				$statuses[ $id ] = array( 'status' => $verdict );

				if ( isset( $item_by_source_id[ $id ] ) ) {
					$source_modified_updates[ (int) $item_by_source_id[ $id ]['id'] ]
						= $source_modified;
				}
			}
		}

		$this->repository->update_source_modified_gmt_bulk( $source_modified_updates );

		wp_send_json_success( array( 'statuses' => $statuses ) );
	}

	/**
	 * Maps Sync_State_Comparator's verdict to the sync-status batch's status
	 * string. `invalid` flags a local parse failure (a data bug), distinct
	 * from `unreachable` (network) and `missing` (caller-set). A blank or
	 * zero-date source timestamp means the source has no save history
	 * (typical for drafts that were never saved) — those are up-to-date by
	 * definition, not a parse failure.
	 *
	 * @param string $source_modified_gmt ISO 8601 modified_gmt from the source.
	 * @param string $import_date_gmt     MySQL datetime from the items table.
	 * @return string Verdict: 'up-to-date', 'outdated', or 'invalid'.
	 */
	private static function compare_sync_state(
		string $source_modified_gmt,
		string $import_date_gmt
	): string {
		if (
			'' === $source_modified_gmt
			|| '0000-00-00 00:00:00' === $source_modified_gmt
			|| '0000-00-00T00:00:00' === $source_modified_gmt
		) {
			return 'up-to-date';
		}

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
	 * Moves dependent types (wp_navigation) to the end of the import order so
	 * the items they reference via core/navigation-link `id` attrs populate
	 * the session ID map first.
	 *
	 * Asymmetry is one-directional — navs reference pages, not vice versa —
	 * so the topological sorter itself stays unaware of the type.
	 *
	 * @param int[]                            $sorted_order     Source IDs in topo order.
	 * @param array<int, array<string, mixed>> $batch_fresh_data Pass-1 fresh data
	 *                                                           keyed by source ID.
	 * @return int[] Order with dependent types pushed to the end (request-order
	 *               preserved among them).
	 */
	private static function defer_dependent_types(
		array $sorted_order,
		array $batch_fresh_data
	): array {
		$dependent_types = array( 'wp_navigation' );

		$head = array();
		$tail = array();
		foreach ( $sorted_order as $source_id ) {
			$post_type = (string) ( $batch_fresh_data[ $source_id ]['post_type'] ?? '' );
			if ( in_array( $post_type, $dependent_types, true ) ) {
				$tail[] = $source_id;
			} else {
				$head[] = $source_id;
			}
		}

		return array_merge( $head, $tail );
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
