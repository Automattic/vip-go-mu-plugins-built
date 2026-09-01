<?php
/**
 * REST API controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Plugin;

/**
 * Main REST API controller that initializes all endpoint controllers.
 */
class RestController {


	/**
	 * API namespace.
	 */
	public const NAMESPACE = 'vip-workflows/v1';

	/**
	 * Initialize the REST API.
	 */
	public function init(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register all REST routes.
	 */
	public function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/status',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_status' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);

		$controllers = array(
			new AssignableUsersController(),
			new SequencesController(),
			new WorkflowController(),
			new NotificationsController(),
			new AbilitiesController(),
			new ToolsController(),
			new PromptsController(),
			new AuditLogController(),
			new GeneralSettingsController(),
			new ExperimentsController(),
			new AssistantsController(),
			new UtilityController(),
			new MetadataController(),
		);

		// Ideation/discovery routes are an ideation-only surface.
		if ( Plugin::experiment_enabled( 'ideation' ) ) {
			$controllers[] = new IdeationController();
			$controllers[] = new IdeationSourcesController();
			$controllers[] = new DiscoveryController();
		}

		/**
		 * Filters the REST API controllers registered by VIP Workflows.
		 *
		 * @param array $controllers Array of controller instances.
		 *
		 * @since 1.2.0
		 */
		$controllers = apply_filters( 'vip_workflows_rest_controllers', $controllers );

		foreach ( $controllers as $controller ) {
			$controller->register_routes();
		}
	}

	/**
	 * Get plugin status for diagnostics.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_status(): \WP_REST_Response {
		global $wpdb;

		// Check if tables exist.
		$tables_exist    = array();
		$required_tables = array(
			'vip_sequences',
			'vip_workflows_events',
			'vip_ability_results',
		);

		foreach ( $required_tables as $table ) {
			$full_name = $wpdb->prefix . $table;
			$exists    = $wpdb->get_var(
				$wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $full_name ) )
			) === $full_name;
			$tables_exist[ $table ] = $exists;
		}

		// Count records.
		$sequence_count = 0;
		if ( $tables_exist['vip_sequences'] ) {
			$sequence_count = (int) $wpdb->get_var(
				$wpdb->prepare( 'SELECT COUNT(*) FROM %i', $wpdb->prefix . 'vip_sequences' )
			);
		}

		return new \WP_REST_Response(
			array(
				'status'          => 'ok',
				'version'         => VIP_WORKFLOWS_VERSION,
				'db_version'      => get_option( 'vip_workflows_db_version', 'not installed' ),
				'tables_exist'    => $tables_exist,
				'sequence_count' => $sequence_count,
			)
		);
	}

	/**
	 * Get the full namespace.
	 *
	 * @return string
	 */
	public static function get_namespace(): string {
		return self::NAMESPACE;
	}
}
