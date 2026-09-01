<?php
/**
 * Create Sequence ability.
 *
 * Creates a new workflow sequence (statuses, transitions, metadata fields). The
 * registered slug (vip-workflows/create-sequence) keeps the stable machine name
 * while the agent-facing label uses "Sequence" terminology.
 *
 * The execute callback is a thin adapter over SequencesController::create_item()
 * so all sanitization, slug generation, the phase-type Ideation gate, and config
 * building are reused rather than duplicated.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

use VIPWorkflows\Sequences\Sequence;

/**
 * Execute the sequence creation.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_create_sequence( ?array $input = null ) {
	$input    = $input ?? array();
	$name     = $input['name'] ?? '';
	$statuses = $input['statuses'] ?? null;

	if ( '' === trim( (string) $name ) ) {
		return new \WP_Error( 'missing_name', __( 'The "name" parameter is required.', 'vip-workflows' ) );
	}

	if ( ! is_array( $statuses ) ) {
		return new \WP_Error( 'missing_statuses', __( 'The "statuses" parameter is required and must be an array.', 'vip-workflows' ) );
	}

	// Map the ability input onto a REST request and delegate to the controller,
	// reusing its validation, slug dedup, config building, and draft handling.
	$request = new \WP_REST_Request( 'POST', '/vip-workflows/v1/sequences' );
	foreach ( array( 'name', 'description', 'type', 'status', 'statuses', 'post_types', 'settings', 'metadata_fields' ) as $key ) {
		if ( array_key_exists( $key, $input ) ) {
			$request->set_param( $key, $input[ $key ] );
		}
	}

	$response = ( new \VIPWorkflows\API\SequencesController() )->create_item( $request );

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	$data = $response->get_data();

	// The controller returns a prepared sequence array on success. Per the
	// no-fallback rule, a response missing required keys is a data-integrity bug —
	// surface it rather than papering over it with default values.
	if ( ! is_array( $data ) ) {
		return new \WP_Error( 'create_response_invalid', __( 'Sequence creation returned an unexpected response.', 'vip-workflows' ) );
	}
	foreach ( array( 'id', 'uuid', 'name', 'slug', 'type', 'status', 'statuses_count' ) as $required_key ) {
		if ( ! array_key_exists( $required_key, $data ) ) {
			return new \WP_Error(
				'create_response_incomplete',
				/* translators: %s: response field name. */
				sprintf( __( 'Sequence was created but the response is missing the "%s" field.', 'vip-workflows' ), $required_key )
			);
		}
	}

	$warnings = array();

	// The post-types warning below applies only to workflow sequences. Phase
	// sequences store "phases" rather than "statuses" and are not attached to post
	// types, so the check is not meaningful for them. A sequence with no statuses is
	// now rejected outright by create_item(), so no warning is possible here.
	if ( Sequence::TYPE_WORKFLOW === $data['type'] ) {
		// A workflow sequence with no registered post types is not attached to
		// any content. The admin UI surfaces this to humans; agents only have this
		// output, so warn them here.
		$configured = is_array( $data['post_types'] ?? null ) ? $data['post_types'] : array();
		$valid      = array_filter( $configured, 'post_type_exists' );
		if ( empty( $valid ) ) {
			$warnings[] = __( 'This workflow sequence has no valid post types configured, so it is not attached to any content type and cannot be used yet. Re-create it with a "post_types" array (e.g. ["post"]) or edit the sequence to add at least one registered post type.', 'vip-workflows' );
		}
	}

	return array(
		'sequence_id'    => (int) $data['id'],
		'uuid'           => (string) $data['uuid'],
		'name'           => (string) $data['name'],
		'slug'           => (string) $data['slug'],
		'type'           => (string) $data['type'],
		'status'         => (string) $data['status'],
		'statuses_count' => (int) $data['statuses_count'],
		'warnings'       => $warnings,
		'success'        => true,
	);
}

/**
 * Register the Create Sequence ability.
 *
 * @return void
 */
function register_create_sequence(): void {
	wp_register_ability(
		'vip-workflows/create-sequence',
		array(
			'label'               => __( 'Create Sequence', 'vip-workflows' ),
			'description'         => __( 'Creates a new workflow sequence with its statuses, transitions, and metadata fields.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'name', 'statuses' ),
				'properties'           => array(
					'name'            => array(
						'type'        => 'string',
						'description' => __( 'The sequence name.', 'vip-workflows' ),
					),
					'description'     => array(
						'type'        => 'string',
						'description' => __( 'Optional sequence description.', 'vip-workflows' ),
					),
					'type'            => array(
						'type'        => 'string',
						'description' => __( 'Sequence type. Defaults to "workflow". "phase" requires the Ideation feature.', 'vip-workflows' ),
						'enum'        => array( Sequence::TYPE_WORKFLOW, Sequence::TYPE_PHASE ),
						'default'     => Sequence::TYPE_WORKFLOW,
					),
					'status'          => array(
						'type'        => 'string',
						'description' => __( 'Initial lifecycle state of the sequence. Defaults to "active".', 'vip-workflows' ),
						'enum'        => array( 'active', 'draft' ),
					),
					'statuses'        => array(
						'type'        => 'array',
						'description' => __( 'Array of status configurations defining the sequence stages.', 'vip-workflows' ),
						'items'       => array(
							'type'       => 'object',
							'required'   => array( 'key', 'label' ),
							'properties' => array(
								'key'             => array(
									'type'        => 'string',
									'description' => __( 'Machine key for the status.', 'vip-workflows' ),
								),
								'label'           => array(
									'type'        => 'string',
									'description' => __( 'Human-readable status label.', 'vip-workflows' ),
								),
								'color'           => array(
									'type'        => 'string',
									'description' => __( 'Hex color for the status.', 'vip-workflows' ),
								),
								'is_terminal'     => array(
									'type'        => 'boolean',
									'description' => __( 'Whether this is a terminal status.', 'vip-workflows' ),
								),
								'is_initial'      => array(
									'type'        => 'boolean',
									'description' => __( 'Whether this is the initial status.', 'vip-workflows' ),
								),
								'is_dead_end'     => array(
									'type'        => 'boolean',
									'description' => __( 'Whether this status is a dead end (no outgoing transitions).', 'vip-workflows' ),
								),
								'is_in_progress'  => array(
									'type'        => 'boolean',
									'description' => __( 'Whether this status represents active, in-progress work.', 'vip-workflows' ),
								),
								'creates_post'    => array(
									'type'        => 'boolean',
									'description' => __( 'Whether entering this status creates a post.', 'vip-workflows' ),
								),
								'status'          => array(
									'type'        => 'string',
									'description' => __( 'Core status region this stage lives in. Defaults to "draft".', 'vip-workflows' ),
									'enum'        => Sequence::EDITORIAL_STATUSES,
								),
								'region_entry'    => array(
									'type'        => 'boolean',
									'description' => __( 'Marks this stage as the entry checkpoint of its status region — where core-driven status changes re-seat the post. It does not constrain where a transition may point. At most one per region; defaults to the first stage in the region.', 'vip-workflows' ),
								),
								'transitions'     => array(
									'type'        => 'array',
									'description' => __( 'Allowed transitions from this status.', 'vip-workflows' ),
									'items'       => array(
										'type'       => 'object',
										'required'   => array( 'to' ),
										'properties' => array(
											'to'                  => array(
												'type'        => 'string',
												'description' => __( 'Target status key.', 'vip-workflows' ),
											),
											'label'               => array(
												'type'        => 'string',
												'description' => __( 'Transition label.', 'vip-workflows' ),
											),
											'required_tools'      => array(
												'type'        => 'array',
												'description' => __( 'Ability IDs required before this transition.', 'vip-workflows' ),
											),
											'allowed_roles'       => array(
												'type'        => 'array',
												'description' => __( 'Roles permitted to perform this transition.', 'vip-workflows' ),
											),
											'notifications'       => array(
												'type'        => 'array',
												'description' => __( 'Notification channel keys to fire on this transition.', 'vip-workflows' ),
											),
											'show_in_queue'       => array(
												'type'        => 'boolean',
												'description' => __( 'Whether to surface this transition in the queue.', 'vip-workflows' ),
											),
											'inputs'              => array(
												'type'        => 'array',
												'description' => __( 'Inputs collected during this transition, in the order they are asked for. At most one may be an assignment.', 'vip-workflows' ),
											),
											'requires_assignment' => array(
												'type'        => array( 'string', 'object' ),
												'description' => __( 'Assignment requirement for this transition.', 'vip-workflows' ),
											),
										),
									),
								),
								'agent'           => array(
									'type'        => 'object',
									'description' => __( 'Optional AI-stage config. When set, an agent runs when a post enters this status and routes the exit transition based on its outcome.', 'vip-workflows' ),
									'properties'  => array(
										'ability_id' => array(
											'type'        => 'string',
											'description' => __( 'Ability ID of a stage-eligible agent to run on entry.', 'vip-workflows' ),
										),
										'settings'   => array(
											'type'        => 'object',
											'description' => __( 'Optional per-stage settings passed to the agent (e.g. prompt, template).', 'vip-workflows' ),
										),
										'routing'    => array(
											'type'        => 'object',
											'description' => __( 'Maps agent outcomes to destination status keys. Each target must be a configured transition of this status. "error" is required.', 'vip-workflows' ),
											'properties'  => array(
												'pass'  => array( 'type' => 'string' ),
												'fail'  => array( 'type' => 'string' ),
												'error' => array( 'type' => 'string' ),
											),
										),
									),
								),
							),
						),
					),
					'post_types'      => array(
						'type'        => 'array',
						'description' => __( 'Post types this sequence applies to (workflow only). A workflow sequence with no valid post types is not attached to any content and cannot be used — pass at least one registered post type such as "post".', 'vip-workflows' ),
					),
					'settings'        => array(
						'type'        => 'object',
						'description' => __( 'Sequence settings.', 'vip-workflows' ),
					),
					'metadata_fields' => array(
						'type'        => 'array',
						'description' => __( 'Array of editorial metadata field definitions.', 'vip-workflows' ),
						'items'       => array(
							'type'       => 'object',
							'required'   => array( 'key', 'label', 'type' ),
							'properties' => array(
								'key'        => array(
									'type'        => 'string',
									'description' => __( 'Machine key for the metadata field.', 'vip-workflows' ),
								),
								'label'      => array(
									'type'        => 'string',
									'description' => __( 'Human-readable field label, in sentence case.', 'vip-workflows' ),
								),
								'type'       => array(
									'type'        => 'string',
									'description' => __( 'Field type.', 'vip-workflows' ),
									'enum'        => array( 'text', 'textarea', 'select', 'date', 'user' ),
								),
								'required'   => array(
									'type'        => 'boolean',
									'description' => __( 'Whether the field is required.', 'vip-workflows' ),
								),
								'searchable' => array(
									'type'        => 'boolean',
									'description' => __( 'Whether the field is searchable.', 'vip-workflows' ),
								),
								'options'    => array(
									'type'        => 'array',
									'description' => __( 'Options for a "select" field.', 'vip-workflows' ),
								),
							),
						),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'sequence_id'    => array(
						'type'        => 'integer',
						'description' => __( 'The created sequence ID.', 'vip-workflows' ),
					),
					'uuid'           => array(
						'type'        => 'string',
						'description' => __( 'The sequence UUID.', 'vip-workflows' ),
					),
					'name'           => array(
						'type'        => 'string',
						'description' => __( 'The sequence name.', 'vip-workflows' ),
					),
					'slug'           => array(
						'type'        => 'string',
						'description' => __( 'The generated sequence slug.', 'vip-workflows' ),
					),
					'type'           => array(
						'type'        => 'string',
						'description' => __( 'The sequence type.', 'vip-workflows' ),
					),
					'status'         => array(
						'type'        => 'string',
						'description' => __( 'The sequence lifecycle state.', 'vip-workflows' ),
					),
					'statuses_count' => array(
						'type'        => 'integer',
						'description' => __( 'Number of statuses in the sequence.', 'vip-workflows' ),
					),
					'warnings'       => array(
						'type'        => 'array',
						'description' => __( 'Non-fatal advisories about the created sequence (e.g. no valid post types configured).', 'vip-workflows' ),
						'items'       => array( 'type' => 'string' ),
					),
					'success'        => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the sequence was created.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_create_sequence',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'meta'                => array(
				'show_in_commands'    => false,
				'transition_eligible' => false,
				'annotations'         => array(
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => false,
				),
				'mcp'                 => array(
					'public' => true,
					'type'   => 'tool',
				),
			),
		)
	);
}
