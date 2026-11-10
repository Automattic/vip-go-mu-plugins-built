<?php
/**
 * Experiments REST Controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Plugin;
use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Handles the experiment (feature toggle) settings surface.
 */
class ExperimentsController extends WP_REST_Controller {


	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = 'vip-workflows/v1';
		$this->rest_base = 'settings/experiments';
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_experiments' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'toggle_experiment' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
					'args'                => array(
						'id'      => array(
							'type'     => 'string',
							'required' => true,
						),
						'enabled' => array(
							'type'     => 'boolean',
							'required' => true,
						),
					),
				),
			)
		);
	}

	/**
	 * Check admin permissions.
	 *
	 * @return bool
	 */
	public function admin_permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get all registered experiments and their enabled state.
	 *
	 * @return WP_REST_Response
	 */
	public function get_experiments(): WP_REST_Response {
		$registry = Plugin::get_instance()->get_experiment_registry();

		return new WP_REST_Response( $registry->to_array() );
	}

	/**
	 * Enable or disable a single experiment.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function toggle_experiment( WP_REST_Request $request ) {
		$registry = Plugin::get_instance()->get_experiment_registry();

		$id      = (string) $request->get_param( 'id' );
		$enabled = (bool) $request->get_param( 'enabled' );

		$experiment = $registry->get( $id );

		if ( null === $experiment ) {
			return new WP_Error(
				'rest_experiment_not_found',
				sprintf( /* translators: %s: experiment ID. */ __( 'Unknown experiment "%s".', 'vip-workflows' ), $id ),
				array( 'status' => 404 )
			);
		}

		if ( ! $experiment->is_available() ) {
			return new WP_Error(
				'rest_experiment_unavailable',
				sprintf( /* translators: %s: experiment ID. */ __( 'Experiment "%s" is not available.', 'vip-workflows' ), $id ),
				array( 'status' => 400 )
			);
		}

		if ( $enabled ) {
			$registry->enable( $id );
		} else {
			$registry->disable( $id );
		}

		return new WP_REST_Response( $registry->to_array() );
	}
}
