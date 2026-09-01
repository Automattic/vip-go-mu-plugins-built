<?php
/**
 * Tools REST API controller.
 *
 * Admin-gated surface for configuring tools (abilities in the `vip-workflows`
 * category). Mirrors the AssistantsController pattern: a read-only list plus a
 * per-tool settings save. Replaces the retired `/v1/settings/abilities`
 * endpoint.
 *
 * @package VIPWorkflows\API
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Abilities\Ability;
use VIPWorkflows\Abilities\AbilitySettings;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;

/**
 * REST controller for tool configuration.
 */
class ToolsController extends WP_REST_Controller {

	/**
	 * Construct the ToolsController instance.
	 */
	public function __construct() {
		$this->namespace = RestController::NAMESPACE;
		$this->rest_base = 'tools';
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
				'args'                => array(
					'category' => array(
						'description' => __( 'Filter by ability category.', 'vip-workflows' ),
						'type'        => 'string',
						'default'     => 'vip-workflows',
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[a-z0-9_/-]+)/settings',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_settings' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
				'args'                => array(
					'id' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
			)
		);
	}

	/**
	 * List all configurable tools in a category.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ): WP_REST_Response {
		$category = $request ? ( $request->get_param( 'category' ) ?? 'vip-workflows' ) : 'vip-workflows';
		$data     = array();

		foreach ( wp_get_abilities() as $ability ) {
			if ( ! $this->is_tool( $ability, $category ) ) {
				continue;
			}
			$data[] = $this->prepare_tool( $ability );
		}

		return new WP_REST_Response( $data );
	}

	/**
	 * Update settings for a single tool.
	 *
	 * Body: { enabled?, options?, check_modes?, show_in_commands?, transition_eligible? }
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_settings( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$id      = $request->get_param( 'id' );
		$updates = $request->get_json_params();

		if ( ! is_array( $updates ) ) {
			return new WP_Error(
				'invalid_payload',
				__( 'Invalid settings payload.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		$ability = $this->find_tool( $id );
		if ( ! $ability ) {
			return new WP_Error(
				'unknown_tool',
				__( 'Unknown tool.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		AbilitySettings::get_instance()->update( $id, $updates );

		return new WP_REST_Response( $this->prepare_tool( $ability ) );
	}

	/**
	 * Check whether the current user can administer this endpoint.
	 *
	 * @return bool
	 */
	public function admin_permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Whether an ability is a configurable tool in the given category.
	 *
	 * @param  object $ability  Ability instance.
	 * @param  string $category Category to match.
	 * @return bool
	 */
	private function is_tool( object $ability, string $category ): bool {
		if ( $ability->get_category() !== $category ) {
			return false;
		}
		$meta = $ability->get_meta();
		return ! empty( $meta['type'] );
	}

	/**
	 * Resolve a configurable `vip-workflows` tool by ability ID.
	 *
	 * @param  string $id Ability ID.
	 * @return object|null Ability instance, or null if not a configurable tool.
	 */
	private function find_tool( string $id ): ?object {
		foreach ( wp_get_abilities() as $ability ) {
			if ( $ability->get_name() === $id && $this->is_tool( $ability, 'vip-workflows' ) ) {
				return $ability;
			}
		}
		return null;
	}

	/**
	 * Build the response shape for a single tool.
	 *
	 * @param  object $ability Ability instance.
	 * @return array<string, mixed>
	 */
	private function prepare_tool( object $ability ): array {
		$settings         = AbilitySettings::get_instance();
		$name             = $ability->get_name();
		$meta             = $ability->get_meta();
		$ability_settings = $settings->get( $name );
		$icon             = $ability instanceof Ability
			? $ability->get_icon()
			: ( $meta['icon'] ?? 'tool' );

		$item = array(
			'id'                  => $name,
			'name'                => $ability->get_label(),
			'description'         => $ability->get_description(),
			'icon'                => $icon,
			'category'            => $ability->get_category(),
			'enabled'             => $ability_settings['enabled'],
			'options'             => $ability_settings['options'],
			'check_modes'         => $ability_settings['check_modes'] ?? array(),
			'schema'              => $ability->get_input_schema(),
			'settings_schema'     => $meta['settings_schema'] ?? array(),
			'meta'                => $meta,
			'show_in_commands'    => $settings->show_in_commands( $name, $meta['show_in_commands'] ?? false ),
			'transition_eligible' => $ability_settings['transition_eligible'] ?? ( $meta['transition_eligible'] ?? false ),
		);

		/*
		 * A plain `WP_Ability` has no structured availability channel, so it
		 * serializes the empty "nothing unmet" result rather than omitting the key.
		 */
		$item['availability'] = $ability instanceof Ability
			? AvailabilitySerializer::serialize( $ability->get_availability() )
			: AvailabilitySerializer::serialize_available();

		if ( $ability instanceof Ability ) {
			$item['thinking_message'] = $ability->get_thinking_message();
			$item['success_message']  = $ability->get_success_message();
			$item['display_order']    = $ability->get_display_order();
			$item['available']        = $item['availability']['available'];
		}

		return $item;
	}
}
