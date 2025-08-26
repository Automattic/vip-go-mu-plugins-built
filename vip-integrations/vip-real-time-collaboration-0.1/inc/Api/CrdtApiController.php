<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Api;

defined( 'ABSPATH' ) || exit();

use VIPRealTimeCollaboration\Auth\SyncPermissions;
use VIPRealTimeCollaboration\Editor\CrdtPersistence;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;
use function is_user_logged_in;
use function is_wp_error;
use function rest_ensure_response;

/**
 * REST API controller for persisting and retrieving CRDT documents.
 */
final class CrdtApiController extends WP_REST_Controller {
	public function __construct(
		private CrdtPersistence $crdt_persistence = new CrdtPersistence()
	) {
		$this->namespace = RestApi::NAMESPACE;
		$this->rest_base = '/crdt';
		$this->schema = [];
	}

	/**
	 * Register REST API routes.
	 */
	#[\Override]
	public function register_routes(): void {
		$common_args = [
			'crdtVersion' => [
				'description' => __(
					'The version or expected version of the CRDT document',
					'vip-real-time-collaboration',
				),
				'type' => 'integer',
				'required' => true,
				'sanitize_callback' => function ( mixed $value ): int {
					return intval( $value );
				},
				'validate_callback' => function ( mixed $value ): bool {
					return is_numeric( $value );
				},
			],
			'syncObjectType' => [
				'description' => __(
					'The sync object type for synchronization (e.g., postType/post, root/base)',
					'vip-real-time-collaboration',
				),
				'type' => 'string',
				'required' => true,
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => [ $this, 'validate_sync_object_type' ],
			],
			'syncObjectId' => [
				'description' => __(
					'The sync object ID for synchronization',
					'vip-real-time-collaboration',
				),
				'type' => 'string',
				'required' => true,
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => [ $this, 'validate_sync_object_id' ],
			],
		];

		register_rest_route(
			$this->namespace,
			$this->rest_base,
			[
				'methods' => 'GET',
				'callback' => [ $this, 'get_crdt_doc' ],
				'permission_callback' => [ $this, 'can_user_get_crdt_doc' ],
				'args' => $common_args,
			]
		);

		register_rest_route(
			$this->namespace,
			$this->rest_base,
			[
				'methods' => 'PUT',
				'callback' => [ $this, 'update_crdt_doc' ],
				'permission_callback' => [ $this, 'can_user_update_crdt_doc' ],
				'args' => array_merge(
					$common_args,
					[
						'crdtDoc' => [
							'description' => __(
								'The CRDT document to persist for the sync object',
								'vip-real-time-collaboration',
							),
							'type' => 'string',
							'required' => true,
							'sanitize_callback' => 'sanitize_text_field',
							'validate_callback' => [ $this->crdt_persistence, 'validate_crdt_doc' ],
						],
					],
					[
						'isInitialUpdate' => [
							'description' => __(
								'The CRDT document to persist for the sync object',
								'vip-real-time-collaboration',
							),
							'type' => 'boolean',
							'required' => true,
							'sanitize_callback' => 'sanitize_text_field',
							'validate_callback' => function ( mixed $value ): bool {
								return is_bool( $value );
							},
						],
					]
				),
			]
		);
	}

	/**
	 * Get the persisted CRDT document for a specific sync object.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function get_crdt_doc( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$post_id = intval( $request->get_param( 'syncObjectId' ) );
		$expected_version = intval( $request->get_param( 'crdtVersion' ) );

		return rest_ensure_response(
			[
				'success' => true,
				'crdtDoc' => $this->crdt_persistence->get_crdt_doc( $post_id, $expected_version ),
			]
		);
	}

	/**
	 * Update the persisted CRDT document for a specific sync object.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function update_crdt_doc( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		/**
		 * @var string
		 */
		$crdt_doc = $request->get_param( 'crdtDoc' );

		$post_id = intval( $request->get_param( 'syncObjectId' ) );
		$is_initial_update = boolval( $request->get_param( 'isInitialUpdate' ) );
		$version = intval( $request->get_param( 'crdtVersion' ) );

		$latest_crdt_doc = $this->crdt_persistence->update_crdt_doc( $post_id, $crdt_doc, $version, $is_initial_update );

		if ( is_wp_error( $latest_crdt_doc ) ) {
			return rest_ensure_response(
				[
					'error' => $latest_crdt_doc->get_error_message(),
					'success' => false,
				]
			);
		}

		if ( $latest_crdt_doc !== $crdt_doc ) {
			// An existing CRDT document superceded the submitted doc. Return it.
			return rest_ensure_response(
				[
					'crdtDoc' => $latest_crdt_doc,
					'success' => true,
				]
			);
		}

		return rest_ensure_response(
			[
				'success' => true,
			]
		);
	}

	/**
	 * Check if the current user has permission to get the CRDT document for a sync object.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True if the request has access, WP_Error object otherwise.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function can_user_get_crdt_doc( WP_REST_Request $request ): bool|WP_Error {
		return $this->can_user_update_crdt_doc( $request );
	}

	/**
	 * Check if the current user has permission to update the CRDT document for a sync object.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True if the request has access, WP_Error object otherwise.
	 */
	public function can_user_update_crdt_doc( WP_REST_Request $request ): bool|WP_Error {
		if ( ! is_user_logged_in() ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You must be logged in to access this endpoint.', 'vip-real-time-collaboration' )
			);
		}

		/**
		 * @var string
		 */
		$sync_object_type = $request->get_param( 'syncObjectType' );

		/**
		 * @var string
		 */
		$sync_object_id = $request->get_param( 'syncObjectId' );

		$permission_check = SyncPermissions::can_sync( $sync_object_type, $sync_object_id );

		if ( true === $permission_check ) {
			return true;
		}

		return new WP_Error(
			'permission_denied',
			is_wp_error( $permission_check ) ? $permission_check->get_error_message() : __( 'You do not have permission to access this resource.', 'vip-real-time-collaboration' )
		);
	}

	/**
	 * Validate the sync object type.
	 *
	 * @param mixed $value The value to validate.
	 * @return bool True if valid, false if invalid.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function validate_sync_object_type( mixed $value ): bool {
		if ( ! is_string( $value ) || empty( $value ) ) {
			return false;
		}

		// Parse sync object type (format: kind/name).
		$parts = explode( '/', $value, 2 );
		if ( count( $parts ) !== 2 ) {
			return false;
		}

		// Extract Gutenberg entity kind and name from sync object type.
		[ $entity_kind, $entity_name ] = $parts;

		// Only allow post type entities
		if ( 'postType' !== $entity_kind || empty( $entity_name ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Validate the sync object ID.
	 *
	 * @param mixed $value The value to validate.
	 * @return bool True if valid, false if invalid.
	 *
	 * @psalm-suppress PossiblyUnusedMethod
	 */
	public function validate_sync_object_id( mixed $value ): bool {
		if ( ! is_numeric( $value ) || intval( $value ) <= 0 ) {
			return false;
		}

		return true;
	}
}
