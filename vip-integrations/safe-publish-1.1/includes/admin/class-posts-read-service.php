<?php
/**
 * Posts read service.
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
use WP_Post;

/**
 * Reads source catalogs and local import state without a transport dependency.
 *
 * @psalm-type ListingInput = array{
 *   source_site_url?: string, state?: string, page?: int|string,
 *   per_page?: int|string, with_needs_attention_count?: int|string,
 *   post_type?: string, post_types?: array<array-key, scalar>,
 *   search?: string, name?: string, orderby?: string, order?: string,
 *   status?: string|array<array-key, mixed>, published_after?: string,
 *   published_before?: string, imported_after?: string,
 *   imported_before?: string
 * }
 */
final class Posts_Read_Service {

	/** Maximum source pages scanned to fill an Available page. */
	public const AVAILABLE_FILL_MAX_FETCHES = 15;

	/** Maximum source IDs per sync status request. */
	public const SYNC_STATUS_BATCH_MAX = 100;

	/**
	 * Constructs the posts reader with the existing data services.
	 *
	 * @param Source_Posts_API            $api                 Source catalog API.
	 * @param History_Repository          $repository          Import history.
	 * @param Post_Import_Service         $post_import_service Import lookup service.
	 * @param Post_Type_Fetcher           $post_type_fetcher   Source type fetcher.
	 * @param Attention_Issues_Repository $attention_issues    Attention counts.
	 */
	public function __construct(
		private Source_Posts_API $api,
		private History_Repository $repository,
		private Post_Import_Service $post_import_service,
		private Post_Type_Fetcher $post_type_fetcher,
		private Attention_Issues_Repository $attention_issues
	) {}

	/**
	 * State-routed Posts listing endpoint.
	 *
	 * 'all'/'available' are catalog-primary (catalog fetch annotated with
	 * local data). 'up-to-date'/'outdated' are local-primary (items aggregated
	 * by source_post_id, merged with source data via include=).
	 *
	 * @param array $input Unslashed listing fields with optional filters.
	 * @psalm-param ListingInput $input
	 * @return array|\WP_Error Payload or validation/source error.
	 */
	public function list_posts( array $input ): array|\WP_Error {

		$source_site_url            = sanitize_text_field(
			$input['source_site_url'] ?? ''
		);
		$state                      = self::sanitize_state(
			$input['state'] ?? 'all'
		);
		$with_needs_attention_count = 1 === absint(
			$input['with_needs_attention_count'] ?? 0
		);

		if ( '' === $source_site_url ) {
			return new \WP_Error(
				'missing_source_url',
				__( 'Source site URL is required.', 'safe-publish' )
			);
		}

		if ( in_array( $state, array( 'all', 'available' ), true ) ) {
			$payload = $this->list_posts_via_catalog(
				$source_site_url,
				$state,
				$input
			);
		} else {
			$payload = $this->list_posts_via_local(
				$source_site_url,
				$state,
				$input
			);
		}

		if ( is_wp_error( $payload ) ) {
			return $payload;
		}

		$payload['state'] = $state;
		if ( $with_needs_attention_count ) {
			$connected_url = Options::get_connected_site_url_with_path();

			$payload['needs_attention_count'] =
				$this->repository->count_failures( $connected_url )
				+ $this->attention_issues->count_open_issues( $connected_url );
		}

		return $payload;
	}

	/**
	 * Builds the catalog-primary payload for ajax_list_posts.
	 *
	 * @param string               $source_site_url Source site URL.
	 * @param string               $state           'all' or 'available'.
	 * @return array|\WP_Error Listing payload, or WP_Error on catalog failure.
	 * @param array<string, mixed> $input Unslashed input; omitted fields use defaults.
	 */
	private function list_posts_via_catalog(
		string $source_site_url,
		string $state,
		array $input
	): array|\WP_Error {
		$auth_error = $this->validate_auth();
		if ( is_wp_error( $auth_error ) ) {
			return $auth_error;
		}
		$auth_credentials = Auth_Credential_Provider::get_credentials();
		$args             = $this->build_catalog_args( $input );

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
	 * Builds the available-state payload by pulling source catalog pages until
	 * the requested page is filled with non-imported rows.
	 *
	 * The Not imported chip drops already-imported rows, so a single source
	 * page can render almost empty while the source still reports more raw
	 * items. Filling across pages lets has_more reflect the non-imported count
	 * rather than the source's raw pagination.
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
	 * Scoped to the stored connection rather than $source_site_url, which is
	 * not normalized to the identity sessions are recorded under.
	 *
	 * @param string               $source_site_url Source site URL to fetch from.
	 * @param string               $state           'up-to-date' or 'outdated'.
	 * @return array|\WP_Error Listing payload.
	 * @param array<string, mixed> $input Unslashed input; omitted fields use defaults.
	 */
	private function list_posts_via_local(
		string $source_site_url,
		string $state,
		array $input
	): array|\WP_Error {
		$page     = max( 1, absint( $input['page'] ?? 1 ) );
		$per_page = max( 1, min( 100, absint( $input['per_page'] ?? 20 ) ) );

		$args              = $this->build_local_listing_args( $input );
		$args['freshness'] = 'outdated' === $state ? 'outdated' : 'up-to-date';
		$active_rows       = $this->repository->list_imported_source_rows(
			Options::get_connected_site_url_with_path(),
			$page,
			$per_page,
			$args
		);

		$has_more = count( $active_rows ) > $per_page;
		if ( $has_more ) {
			$active_rows = array_slice( $active_rows, 0, $per_page );
		}

		$source_by_id = $this->fetch_source_data_for_active_rows(
			$source_site_url,
			$active_rows
		);

		if ( is_wp_error( $source_by_id ) ) {
			return $source_by_id;
		}

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
	 * Fetches source data for a page of active rows, grouped by post_type.
	 *
	 * @param string $source_site_url Source site URL.
	 * @param array  $active_rows     Rows from list_imported_source_rows().
	 * @return array<int, array>|\WP_Error Source rows or authentication error.
	 */
	private function fetch_source_data_for_active_rows(
		string $source_site_url,
		array $active_rows
	): array|\WP_Error {
		if ( 0 === count( $active_rows ) ) {
			return array();
		}

		$auth_error = $this->validate_auth();
		if ( is_wp_error( $auth_error ) ) {
			return $auth_error;
		}
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
	private static function build_unified_row_from_catalog(
		array $item
	): array {
		return array(
			'id'                   => (int) ( $item['id'] ?? 0 ),
			'source_post_id'       => (int) ( $item['id'] ?? 0 ),
			'title'                => (string) ( $item['title'] ?? '' ),
			'link'                 => (string) ( $item['link'] ?? '' ),
			'modified_gmt'         => (string) ( $item['modified_gmt'] ?? '' ),
			'date_gmt'             => (string) ( $item['date_gmt'] ?? '' ),
			'post_type'            => (string) ( $item['post_type'] ?? 'post' ),
			'status'               => (string) ( $item['status'] ?? '' ),
			'local_state'          =>
				(string) ( $item['local_state'] ?? 'available' ),
			'is_imported'          => (bool) ( $item['is_imported'] ?? false ),
			'wp_post_status'       => $item['wp_post_status'] ?? null,
			'item_id'              => $item['item_id'] ?? null,
			'post_id'              => $item['post_id'] ?? null,
			'import_date_gmt'      => $item['import_date_gmt'] ?? null,
			'has_previous_content' =>
				(bool) ( $item['has_previous_content'] ?? false ),
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
		$source_modified = (string) (
			$active_row['source_modified_gmt'] ?? ''
		);
		$local_state     = '' !== $source_modified
			&& $source_modified > $import_date
			? 'outdated'
			: 'up-to-date';
		$edit_url        = $post_id > 0
			? get_edit_post_link( $post_id, 'raw' )
			: null;

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
			'is_imported'          => true,
			'wp_post_status'       => $wp_post_status,
			'item_id'              => isset( $active_row['id'] )
				? (int) $active_row['id']
				: null,
			'post_id'              => $post_id > 0 ? $post_id : null,
			'import_date_gmt'      => '' !== $import_date ? $import_date : null,
			'has_previous_content' =>
				(bool) ( $active_row['has_previous_content'] ?? 0 ),
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
		$allowed = array( 'all', 'available', 'up-to-date', 'outdated' );

		return in_array( $value, $allowed, true ) ? $value : 'all';
	}

	/**
	 * Validates and normalizes the local-primary listing's search/filter/sort
	 * params from the request.
	 *
	 * @return array Listing args for list_imported_source_rows().
	 * @param array<string, mixed> $input Unslashed input; omitted fields use defaults.
	 */
	private function build_local_listing_args( array $input ): array {
		$search = trim(
			sanitize_text_field( $input['search'] ?? '' )
		);
		$name   = sanitize_title( $input['name'] ?? '' );

		$raw_post_types = (array) ( $input['post_types'] ?? array() );
		$post_types     = array_values(
			array_filter(
				$this->sanitize_key_list( $raw_post_types ),
				'post_type_exists'
			)
		);

		// The frontend sends post_type (singular) as the active selector;
		// merge it into post_types so the local listing filter actually fires.
		$post_type_singular = sanitize_key( $input['post_type'] ?? '' );
		if (
			'' !== $post_type_singular
			&& post_type_exists( $post_type_singular )
		) {
			$post_types[] = $post_type_singular;
			$post_types   = array_values( array_unique( $post_types ) );
		}

		$orderby = 'title' === sanitize_key( $input['orderby'] ?? '' )
			? 'title'
			: 'import_date';

		$order = 'asc' === sanitize_key( $input['order'] ?? '' )
			? 'asc'
			: 'desc';

		$imported_after  = Datetime_Sanitizer::sanitize_iso_datetime(
			sanitize_text_field( $input['imported_after'] ?? '' ),
			false
		);
		$imported_before = Datetime_Sanitizer::sanitize_iso_datetime(
			sanitize_text_field( $input['imported_before'] ?? '' ),
			true
		);

		$args = array(
			'post_types' => $post_types,
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
	private function sanitize_key_list( mixed $raw ): array {
		return array_values(
			array_filter(
				array_map(
					static fn( $value ): string =>
						is_scalar( $value )
							? sanitize_key( (string) $value )
							: '',
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
	 * @param array<string, mixed> $input Unslashed input; omitted fields use defaults.
	 */
	private function build_catalog_args( array $input ): array {
		$orderby_raw = sanitize_text_field( $input['orderby'] ?? '' );
		$order_raw   = strtolower(
			sanitize_text_field( $input['order'] ?? '' )
		);

		$args = array(
			'page'      => max( 1, absint( $input['page'] ?? 1 ) ),
			'per_page'  => max( 1, absint( $input['per_page'] ?? 20 ) ),
			'orderby'   => in_array(
				$orderby_raw,
				Catalog_REST_Controller::ALLOWED_ORDERBY,
				true
			)
				? $orderby_raw
				: 'date',
			'order'     => in_array(
				$order_raw,
				Catalog_REST_Controller::ALLOWED_ORDER,
				true
			)
				? $order_raw
				: 'desc',
			'post_type' => sanitize_text_field( $input['post_type'] ?? 'post' ),
		);

		$search = trim( sanitize_text_field( $input['search'] ?? '' ) );
		if ( '' !== $search ) {
			$args['search'] = $search;
		}

		$name = sanitize_title( $input['name'] ?? '' );
		if ( '' !== $name ) {
			$args['name'] = $name;
		}

		$statuses = self::normalize_statuses( $input['status'] ?? array() );
		if ( array() !== $statuses ) {
			$args['status'] = $statuses;
		}

		foreach ( array( 'published_after', 'published_before' ) as $param ) {
			$raw = sanitize_text_field( $input[ $param ] ?? '' );
			if ( '' !== $raw ) {
				$args[ $param ] = $raw;
			}
		}

		return $args;
	}

	/**
	 * Reduces a raw status param to the filter allowlist; unknown values
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
				Catalog_REST_Controller::FILTER_STATUSES
			)
		);
	}

	/**
	 * Handles AJAX request for fetching post types.
	 *
	 * @param array $input Unslashed source URL.
	 * @psalm-param array{source_site_url?: mixed, ...} $input
	 * @return array|\WP_Error Payload or validation/source error.
	 */
	public function fetch_post_types( array $input ): array|\WP_Error {

		$source_site_url = sanitize_text_field(
			$input['source_site_url'] ?? ''
		);

		if ( ( '' === $source_site_url || '0' === $source_site_url ) ) {
			return new \WP_Error(
				'missing_source_url',
				__( 'Source site URL is required.', 'safe-publish' )
			);
		}

		$auth_error = $this->validate_auth();
		if ( is_wp_error( $auth_error ) ) {
			return $auth_error;
		}

		$auth_credentials = Auth_Credential_Provider::get_credentials();

		return $this->post_type_fetcher->fetch_post_types(
			$source_site_url,
			$auth_credentials
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
	 * The catalog lists only non-internal statuses, so a trashed source
	 * post (status `trash`) reads as `missing` here. Deliberate: Trashed
	 * posts have no public surface, so sync-status treats them as deleted.
	 *
	 * @param array $input Source IDs, cast to an array.
	 * @psalm-param array{source_ids?: mixed, ...} $input
	 * @return array|\WP_Error Payload or validation/source error.
	 */
	public function sync_status_batch( array $input ): array|\WP_Error {

		$auth_error = $this->validate_auth();
		if ( is_wp_error( $auth_error ) ) {
			return $auth_error;
		}

		$raw_ids = (array) ( $input['source_ids'] ?? array() );

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
			return new \WP_Error(
				'sync_status_batch_too_large',
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
			return array( 'statuses' => (object) array() );
		}

		// Two bulk queries instead of N per-row meta_query + items-table reads.
		$imported_by_source_id = $this->post_import_service
			->fetch_imported_posts_by_source_ids(
				$source_ids,
				Options::get_connected_site_url_with_path()
			);

		if ( 0 === count( $imported_by_source_id ) ) {
			return array( 'statuses' => (object) array() );
		}

		$post_ids = array_map(
			static fn( WP_Post $p ): int => (int) $p->ID,
			$imported_by_source_id
		);

		$items_by_post_id = $this->repository->get_items_for_posts( $post_ids );

		$by_post_type         = array();
		$context              = array();
		$item_id_by_source_id = array();

		foreach ( $imported_by_source_id as $source_id => $local_post ) {
			$item = $items_by_post_id[ $local_post->ID ] ?? null;
			if ( null === $item || ! isset( $item['import_date_gmt'] ) ) {
				continue;
			}

			$context[ $source_id ] = (string) $item['import_date_gmt'];
			if ( isset( $item['id'] ) ) {
				$item_id_by_source_id[ $source_id ] = (int) $item['id'];
			}

			$post_type                    = (string) $local_post->post_type;
			$by_post_type[ $post_type ][] = $source_id;
		}

		if ( 0 === count( $context ) ) {
			return array( 'statuses' => (object) array() );
		}

		$source_site_url  = get_option(
			Options::OPTION_CONNECTED_SITE_URL,
			''
		);
		$auth_credentials = Auth_Credential_Provider::get_credentials();

		// item_id => source_modified_gmt updates, flushed in one query below.
		$source_modified_updates = array();

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
				$source_modified_by_id[ (int) $item['id'] ]
					= (string) $item['modified_gmt'];
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

				if ( isset( $item_id_by_source_id[ $id ] ) ) {
					$source_modified_updates[ $item_id_by_source_id[ $id ] ] = $source_modified;
				}
			}
		}

		$this->repository->update_source_modified_gmt_bulk(
			$source_modified_updates
		);

		return array( 'statuses' => $statuses );
	}

	/**
	 * Maps Sync_State_Comparator's verdict to the sync-status batch's status
	 * string. `invalid` flags a local parse failure (a data bug), distinct
	 * from `unreachable` (network) and `missing` (caller-set). A blank or
	 * zero-date source timestamp means the source has no save history
	 * (typical for drafts that were never saved). Those are up-to-date by
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
	 * Returns an actionable error for missing or short shared credentials.
	 *
	 * @return \WP_Error|null Authentication error, or null when valid.
	 */
	private function validate_auth(): ?\WP_Error {
		$credentials = Auth_Credential_Provider::get_credentials();
		if ( VIP_Safe_Auth::has_valid_credential_format( $credentials ) ) {
			return null;
		}

		$missing = '' === ( $credentials['shared_secret'] ?? '' );
		return new \WP_Error(
			$missing ? 'posts_read_missing_secret' : 'posts_read_short_secret',
			$missing
				? __(
					'Shared Secret is not configured. Add SAFE_PUBLISH_SHARED_SECRET to wp-config.php on both sites.',
					'safe-publish'
				)
				: __(
					'Shared Secret is too short. SAFE_PUBLISH_SHARED_SECRET must be at least 16 characters.',
					'safe-publish'
				),
			array( 'status' => 401 )
		);
	}
}
