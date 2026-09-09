<?php declare(strict_types = 1);

namespace RemoteDataBlocks\REST;

use RemoteDataBlocks\Telemetry\DataSourceTelemetry;
use RemoteDataBlocks\Store\DataSource\DataSourceConfigManager;
use RemoteDataBlocks\Snippet\Snippet;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

defined( 'ABSPATH' ) || exit();

class DataSourceController extends WP_REST_Controller {
	public function __construct() {
		$this->namespace = REMOTE_DATA_BLOCKS__REST_NAMESPACE;
		$this->rest_base = 'data-sources';
	}

	public function register_routes(): void {
		// get_items list
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				'methods' => 'GET',
				'callback' => [ $this, 'get_items' ],
				'permission_callback' => [ $this, 'get_items_permissions_check' ],
			]
		);

		// get_item
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<uuid>[\w-]+)',
			[
				'methods' => 'GET',
				'callback' => [ $this, 'get_item' ],
				'permission_callback' => [ $this, 'get_item_permissions_check' ],
				'args' => [
					'uuid' => [
						'type' => 'string',
						'required' => true,
					],
				],
			]
		);

		// get_snippet
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/snippets/(?P<uuid>[\w-]+)',
			[
				'methods' => 'GET',
				'callback' => [ $this, 'get_snippets' ],
				'permission_callback' => [ $this, 'get_item_permissions_check' ],
				'args' => [
					'uuid' => [
						'type' => 'string',
						'required' => true,
					],
				],
			]
		);

		// create_item
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				'methods' => 'POST',
				'callback' => [ $this, 'create_item' ],
				'permission_callback' => [ $this, 'create_item_permissions_check' ],
				'args' => [
					'service' => [
						'type' => 'string',
						'required' => true,
						'enum' => REMOTE_DATA_BLOCKS__SERVICES,
					],
					'service_config' => [
						'type' => 'object',
						'required' => true,
					],
				],
			]
		);

		// update_item
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<uuid>[\w-]+)',
			[
				'methods' => 'PUT',
				'callback' => [ $this, 'update_item' ],
				'permission_callback' => [ $this, 'update_item_permissions_check' ],
				'args' => [
					'uuid' => [
						'type' => 'string',
						'required' => true,
					],
				],
			]
		);

		// delete_item
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<uuid>[\w-]+)',
			[
				'methods' => 'DELETE',
				'callback' => [ $this, 'delete_item' ],
				'permission_callback' => [ $this, 'delete_item_permissions_check' ],
				'args' => [
					'uuid' => [
						'type' => 'string',
						'required' => true,
					],
				],
			]
		);

		// delete_multiple_items
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<uuids>[a-zA-Z0-9,-]+)',
			[
				'methods' => 'DELETE',
				'callback' => [ $this, 'delete_multiple_items' ],
				'permission_callback' => [ $this, 'delete_item_permissions_check' ],
				'args' => [
					'uuids' => [
						'type' => 'string',
						'required' => true,
					],
				],
			]
		);
	}

	/**
	 * Creates a new item.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function create_item( mixed $request ): WP_REST_Response|WP_Error {
		$data_source_properties = $request->get_json_params();
		$item = DataSourceConfigManager::create( $data_source_properties );

		DataSourceTelemetry::track_add( $data_source_properties );

		return rest_ensure_response( $item );
	}

	/**
	 * Retrieves a collection of items.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_items( mixed $request ): WP_REST_Response|WP_Error {
		$data_sources = DataSourceConfigManager::get_all();

		return rest_ensure_response( $data_sources );
	}

	/**
	 * Retrieves a single item.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_item( mixed $request ): WP_REST_Response|WP_Error {
		$response = DataSourceConfigManager::get( $request->get_param( 'uuid' ) );
		return rest_ensure_response( $response );
	}

	public function get_snippets( mixed $request ): WP_REST_Response|WP_Error {
		$snippets = Snippet::generate_snippets( $request->get_param( 'uuid' ) );
		return rest_ensure_response( [ 'snippets' => $snippets ] );
	}

	/**
	 * Updates a single item.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function update_item( mixed $request ): WP_REST_Response|WP_Error {
		$data_source_properties = $request->get_json_params();
		$item = DataSourceConfigManager::update( $request->get_param( 'uuid' ), $data_source_properties );

		if ( is_wp_error( $item ) ) {
			return $item; // Return WP_Error if update fails
		}

		DataSourceTelemetry::track_update( $data_source_properties );

		return rest_ensure_response( $item );
	}

	/**
	 * Deletes a single item.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function delete_item( mixed $request ): WP_REST_Response|WP_Error {
		$data_source_properties = $request->get_json_params();
		$result = DataSourceConfigManager::delete( $request->get_param( 'uuid' ) );

		DataSourceTelemetry::track_delete( $data_source_properties );

		return rest_ensure_response( $result );
	}

	/**
	 * Deletes multiple items.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function delete_multiple_items( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$uuids = explode( ',', $request->get_param( 'uuids' ) );

		if ( empty( $uuids ) ) {
			return new WP_Error(
				'no_uuids_provided',
				__( 'No items provided for deletion.', 'remote-data-blocks' ),
				[ 'status' => 400 ]
			);
		}

		$failed = [];
		foreach ( $uuids as $uuid ) {
			$result = DataSourceConfigManager::delete( $uuid );
			if ( is_wp_error( $result ) ) {
				$failed[] = [
					'uuid' => $uuid,
					'error' => $result->get_error_message(),
				];
			}
		}

		if ( ! empty( $failed ) ) {
			return rest_ensure_response([
				'status' => 'partial_success',
				'message' => __( 'Some items could not be deleted.', 'remote-data-blocks' ),
				'failed' => $failed,
			]);
		}

		return rest_ensure_response([
			'status' => 'success',
			'message' => __( 'All items deleted successfully.', 'remote-data-blocks' ),
		]);
	}

	// These all require manage_options for now, but we can adjust as needed

	public function get_item_permissions_check( mixed $request ): bool|WP_Error {
		return current_user_can( 'manage_options' );
	}

	public function get_items_permissions_check( mixed $request ): bool|WP_Error {
		return current_user_can( 'manage_options' );
	}

	public function create_item_permissions_check( mixed $request ): bool|WP_Error {
		return current_user_can( 'manage_options' );
	}

	public function update_item_permissions_check( mixed $request ): bool|WP_Error {
		return current_user_can( 'manage_options' );
	}

	public function delete_item_permissions_check( mixed $request ): bool|WP_Error {
		return current_user_can( 'manage_options' );
	}
}
