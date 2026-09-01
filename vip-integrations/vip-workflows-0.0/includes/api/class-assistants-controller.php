<?php
/**
 * Assistants REST API controller.
 *
 * Unified endpoints for the merged Assistants tab on the Integrations page.
 * Wraps research abilities and discovery providers into single assistant
 * entries so that plugins spanning multiple capabilities appear as one card.
 *
 * @package VIPWorkflows\API
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Assistants\AssistantRegistry;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;

/**
 * Assistants Controller.
 */
class AssistantsController extends WP_REST_Controller {

	/**
	 * Construct the AssistantsController instance.
	 */
	public function __construct() {
		$this->namespace = RestController::NAMESPACE;
		$this->rest_base = 'assistants';
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
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_assistants' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		/*
		 * Single-item read. The two agents this feature exists to explain have no
		 * settings body at all, so without this route the only way to force a
		 * recompute of one agent's availability is to flip and save its enable
		 * preference — an unrelated state change.
		 */
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<slug>[a-zA-Z0-9_-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_assistant' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
					'args'                => array(

						/*
						 * Not sanitized: the route regex already constrains the
						 * value and the registry lookup is an exact string match.
						 * `sanitize_key` would lowercase it, making a registered
						 * mixed-case slug writable through the sibling settings
						 * route but 404 here.
						 */
						'slug' => array(
							'description' => __( 'Agent slug.', 'vip-workflows' ),
							'type'        => 'string',
							'required'    => true,
						),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<slug>[a-zA-Z0-9_-]+)/settings',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'admin_permissions_check' ),
					'args'                => array(
						'slug' => array(
							'type'     => 'string',
							'required' => true,
						),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);
	}

	/**
	 * List all unified assistants.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function get_assistants( WP_REST_Request $request ): WP_REST_Response {
		$entries = AssistantRegistry::get_instance()->get_all();

		usort(
			$entries,
			function ( array $a, array $b ): int {
				$order = ( $a['display_order'] ?? 99 ) <=> ( $b['display_order'] ?? 99 );
				if ( 0 !== $order ) {
					return $order;
				}
				return strcasecmp( $a['label'], $b['label'] );
			}
		);

		return new WP_REST_Response( array_map( array( $this, 'prepare_entry' ), $entries ) );
	}

	/**
	 * Read a single assistant.
	 *
	 * Returns the same entry shape as a list element, so the card can recompute
	 * one agent's availability without refetching the whole list.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function get_assistant( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$slug  = $request->get_param( 'slug' );
		$entry = AssistantRegistry::get_instance()->get( $slug );

		if ( null === $entry ) {
			return new WP_Error(
				'unknown_assistant',
				__( 'Unknown agent.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response( $this->prepare_entry( $entry ) );
	}

	/**
	 * Update settings for a single assistant.
	 *
	 * Body: { enabled?: bool, options?: object }
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function update_settings( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$slug    = $request->get_param( 'slug' );
		$updates = $request->get_json_params();

		if ( ! is_array( $updates ) ) {
			return new WP_Error(
				'invalid_payload',
				__( 'Invalid settings payload.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		$registry = AssistantRegistry::get_instance();
		if ( ! $registry->get( $slug ) ) {
			return new WP_Error(
				'unknown_assistant',
				__( 'Unknown agent.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$saved = $registry->update_settings( $slug, $updates );
		if ( ! $saved ) {
			return new WP_Error(
				'save_failed',
				__( 'Failed to save agent settings.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( $this->prepare_entry( $registry->get( $slug ) ) );
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
	 * Convert a registry entry into a response-safe shape.
	 *
	 * `AssistantRegistry` deliberately hands out `availability` as an
	 * `Availability` object, because the message register belongs to the read
	 * boundary rather than the registry. Serializing it here is therefore
	 * mandatory, not cosmetic: the object would otherwise be `json_encode`d as
	 * its private properties.
	 *
	 * These routes are `manage_options`-only, so in practice the shared
	 * serializer always resolves to the admin register here — but the capability
	 * check stays in the serializer so no controller carries its own copy.
	 *
	 * @since 0.0.1
	 *
	 * @param  array<string, mixed> $entry Registry entry.
	 * @return array<string, mixed>
	 */
	private function prepare_entry( array $entry ): array {
		$entry['availability'] = AvailabilitySerializer::serialize( $entry['availability'] );

		return $entry;
	}

	/**
	 * Item schema for an assistant entry.
	 *
	 * @since 0.0.1
	 *
	 * @return array<string, mixed>
	 */
	public function get_item_schema(): array {
		if ( $this->schema ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$string_list = array(
			'type'  => 'array',
			'items' => array( 'type' => 'string' ),
		);

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'assistant',
			'type'       => 'object',
			'properties' => array(
				'slug'                  => array(
					'description' => __( 'Unique agent slug.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'label'                 => array(
					'description' => __( 'Human-readable agent name.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'description'           => array(
					'description' => __( 'What the agent does.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'icon'                  => array(
					'description' => __( 'Dashicon name or emoji shown on the card.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'capabilities'          => array_merge(
					$string_list,
					array(
						'description' => __( 'Contexts the agent can be used in.', 'vip-workflows' ),
						'context'     => array( 'view', 'edit' ),
						'readonly'    => true,
					)
				),
				'available_in_ai_stage' => array(
					'description' => __( 'Whether the agent can own an AI workflow stage.', 'vip-workflows' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'ability_ids'           => array_merge(
					$string_list,
					array(
						'description' => __( 'Abilities aggregated onto this card.', 'vip-workflows' ),
						'context'     => array( 'view', 'edit' ),
						'readonly'    => true,
					)
				),
				'provider_slugs'        => array_merge(
					$string_list,
					array(
						'description' => __( 'Discovery providers aggregated onto this card.', 'vip-workflows' ),
						'context'     => array( 'view', 'edit' ),
						'readonly'    => true,
					)
				),
				'enabled'               => array(
					'description' => __( 'Administrator preference. Independent of availability.', 'vip-workflows' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
				),
				'available'             => array(
					'description' => __( 'Whether every dependency of every capability on this card is satisfied.', 'vip-workflows' ),
					'type'        => 'boolean',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'availability'          => AvailabilitySerializer::get_schema(),
				'availability_sources'  => array(
					'description' => __( 'Per-capability availability attribution.', 'vip-workflows' ),
					'type'        => 'array',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'type'      => array(
								'description' => __( 'Whether this source is an ability or a discovery provider.', 'vip-workflows' ),
								'type'        => 'string',
								'enum'        => array( 'ability', 'provider' ),
							),
							'id'        => array(
								'description' => __( 'Ability id or provider slug.', 'vip-workflows' ),
								'type'        => 'string',
							),
							'label'     => array(
								'description' => __( 'Human-readable capability name.', 'vip-workflows' ),
								'type'        => 'string',
							),
							'available' => array(
								'description' => __( 'Whether this single source is satisfied.', 'vip-workflows' ),
								'type'        => 'boolean',
							),
						),
					),
				),
				'availability_state'    => array(
					'description' => __( 'Derived classification across every source on the card.', 'vip-workflows' ),
					'type'        => 'string',
					'enum'        => array(
						AssistantRegistry::AVAILABILITY_AVAILABLE,
						AssistantRegistry::AVAILABILITY_PARTIAL,
						AssistantRegistry::AVAILABILITY_UNAVAILABLE,
					),
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'options'               => array(
					'description'          => __( 'Saved option values, keyed by option name.', 'vip-workflows' ),
					'type'                 => 'object',
					'context'              => array( 'view', 'edit' ),
					'additionalProperties' => true,
				),
				'settings_schema'        => array(
					'description'          => __( 'Field definitions the card renders, keyed by field name.', 'vip-workflows' ),
					'type'                 => 'object',
					'context'              => array( 'view', 'edit' ),
					'readonly'             => true,
					'additionalProperties' => array( 'type' => 'object' ),
				),
				'display_order'         => array(
					'description' => __( 'Sort weight on the Agents screen.', 'vip-workflows' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'origin'                => array(
					'description' => __( 'Whether the agent ships with the plugin or comes from an extension.', 'vip-workflows' ),
					'type'        => 'string',
					'enum'        => array( 'built-in', 'plugin' ),
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
			),
		);

		return $this->add_additional_fields_schema( $this->schema );
	}
}
