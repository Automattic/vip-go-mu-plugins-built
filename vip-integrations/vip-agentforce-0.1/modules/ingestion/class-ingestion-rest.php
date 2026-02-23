<?php
/**
 * REST API endpoint for querying bulk sync progress.
 *
 * Note: Parker uses WP-CLI (sync --status --format=json) instead,
 * since GOOP can't make HTTP requests to WP sites. This endpoint is
 * for local testing/direct admin access.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Ingestion;

/**
 * Registers a REST API endpoint for querying bulk sync progress.
 */
class Ingestion_REST {
	/**
	 * REST namespace.
	 */
	public const REST_NAMESPACE = 'vip-agentforce/v1';

	/**
	 * Initialize REST routes.
	 */
	public static function init(): void {
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ] );
	}

	/**
	 * Register REST API routes.
	 */
	public static function register_routes(): void {
		register_rest_route(
			self::REST_NAMESPACE,
			'/sync-progress',
			[
				'methods'             => 'GET',
				'callback'            => [ __CLASS__, 'get_sync_progress' ],
				'permission_callback' => [ __CLASS__, 'check_permission' ],
			]
		);
	}

	/**
	 * Check if the current user has permission to view sync progress.
	 *
	 * @return bool|\WP_Error True if authorized, WP_Error otherwise.
	 */
	public static function check_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to view sync progress.', 'vip-agentforce' ),
				[ 'status' => 403 ]
			);
		}

		return true;
	}

	/**
	 * Handle GET /sync-progress request.
	 *
	 * @return \WP_REST_Response Response with sync progress data.
	 */
	public static function get_sync_progress(): \WP_REST_Response {
		$progress = Ingestion_Sync_Progress::get();

		if ( null === $progress ) {
			return new \WP_REST_Response(
				[
					'status'  => Ingestion_Sync_Progress::STATUS_IDLE,
					'message' => 'No sync has been initiated.',
				],
				200
			);
		}

		return new \WP_REST_Response( $progress, 200 );
	}
}
