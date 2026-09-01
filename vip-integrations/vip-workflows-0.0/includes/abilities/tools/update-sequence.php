<?php
/**
 * Update Sequence ability.
 *
 * Replaces the configuration of an existing workflow sequence (statuses, transitions,
 * metadata fields). The registered slug (vip-workflows/update-sequence) keeps the
 * stable machine name while the agent-facing label uses "Sequence" terminology.
 *
 * The execute callback is a thin adapter over SequencesController::update_item(), the
 * same path the admin UI uses, so metadata-field validation, stage-agent validation,
 * config building and the SequenceRepository write gate
 * (Sequence::prepare_config_for_write) are reused rather than duplicated. Nothing
 * here can normalize or validate differently from a UI save.
 *
 * Lifecycle state is deliberately NOT writable here. Flipping a sequence live is a
 * materially different risk from editing one, so it lives in its own ability
 * (vip-workflows/activate-sequence): an agent asked to fix a draft sequence must not
 * be able to enable it in the same call. The request handed to the controller is
 * built from a fixed field allowlist that has no `status` member, so the separation
 * is structural rather than a matter of the caller's restraint.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\Sequences\SequenceRepository;

const UPDATE_SEQUENCE_ABILITY_ID = 'vip-workflows/update-sequence';

/**
 * Fields this ability may hand to SequencesController::update_item().
 *
 * `status` is absent by design — see the file docblock.
 */
const UPDATE_SEQUENCE_FIELDS = array(
	'name',
	'description',
	'statuses',
	'post_types',
	'settings',
	'metadata_fields',
);

/**
 * Execute the sequence update.
 *
 * @since 0.0.1
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_update_sequence( ?array $input = null ) {
	$input       = $input ?? array();
	$sequence_id = isset( $input['sequence_id'] ) ? (int) $input['sequence_id'] : 0;
	$name        = $input['name'] ?? '';
	$statuses    = $input['statuses'] ?? null;

	if ( $sequence_id <= 0 ) {
		return new \WP_Error( 'missing_sequence_id', __( 'The "sequence_id" parameter is required.', 'vip-workflows' ) );
	}

	if ( '' === trim( (string) $name ) ) {
		return new \WP_Error( 'missing_name', __( 'The "name" parameter is required.', 'vip-workflows' ) );
	}

	if ( ! is_array( $statuses ) ) {
		return new \WP_Error( 'missing_statuses', __( 'The "statuses" parameter is required and must be an array.', 'vip-workflows' ) );
	}

	$repository = new SequenceRepository();
	$existing   = $repository->find( $sequence_id );

	if ( ! $existing ) {
		return new \WP_Error( 'sequence_not_found', __( 'Sequence not found.', 'vip-workflows' ) );
	}

	$previous_status = $existing->status;

	// Map the ability input onto a REST request and delegate to the controller,
	// reusing its validation, config building and write gate.
	$request = new \WP_REST_Request( 'PUT', '/vip-workflows/v1/sequences/' . $sequence_id );
	$request->set_param( 'id', $sequence_id );
	foreach ( UPDATE_SEQUENCE_FIELDS as $key ) {
		if ( array_key_exists( $key, $input ) ) {
			$request->set_param( $key, $input[ $key ] );
		}
	}

	$response = ( new \VIPWorkflows\API\SequencesController() )->update_item( $request );

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	$data = $response->get_data();

	// The controller returns a prepared sequence array on success. Per the
	// no-fallback rule, a response missing required keys is a data-integrity bug —
	// surface it rather than papering over it with default values.
	if ( ! is_array( $data ) ) {
		return new \WP_Error( 'update_response_invalid', __( 'Sequence update returned an unexpected response.', 'vip-workflows' ) );
	}
	foreach ( array( 'id', 'name', 'slug', 'type', 'status', 'statuses_count' ) as $required_key ) {
		if ( ! array_key_exists( $required_key, $data ) ) {
			return new \WP_Error(
				'update_response_incomplete',
				/* translators: %s: response field name. */
				sprintf( __( 'Sequence was updated but the response is missing the "%s" field.', 'vip-workflows' ), $required_key )
			);
		}
	}

	$warnings = array();

	// An update is a full replacement, so an omitted field is a cleared field. The
	// admin UI always posts every field; an agent may not, and silently detaching a
	// live sequence from every post type is the expensive version of that mistake.
	if ( Sequence::TYPE_WORKFLOW === $data['type'] ) {
		$configured = is_array( $data['post_types'] ?? null ) ? $data['post_types'] : array();
		$valid      = array_filter( $configured, 'post_type_exists' );
		if ( empty( $valid ) ) {
			$warnings[] = __( 'This workflow sequence now has no valid post types configured, so it is not attached to any content type and cannot be used. An update replaces the whole configuration — pass "post_types" (e.g. ["post"]) to keep the attachment.', 'vip-workflows' );
		}
	}

	log_configuration_event(
		'sequence.updated',
		UPDATE_SEQUENCE_ABILITY_ID,
		array(
			'sequence_id'    => (int) $data['id'],
			'sequence_name'  => (string) $data['name'],
			'sequence_slug'  => (string) $data['slug'],
			'sequence_type'  => (string) $data['type'],
			'statuses_count'  => (int) $data['statuses_count'],
			'sequence_status' => (string) $data['status'],
		)
	);

	return array(
		'sequence_id'     => (int) $data['id'],
		'name'            => (string) $data['name'],
		'slug'            => (string) $data['slug'],
		'type'            => (string) $data['type'],
		'status'          => (string) $data['status'],
		'status_changed'  => $previous_status !== (string) $data['status'],
		'statuses_count'  => (int) $data['statuses_count'],
		'warnings'        => $warnings,
		'success'         => true,
	);
}

/**
 * Register the Update Sequence ability.
 *
 * @since 0.0.1
 *
 * @return void
 */
function register_update_sequence(): void {
	vip_workflows_register_ability(
		UPDATE_SEQUENCE_ABILITY_ID,
		array(
			'label'               => __( 'Update Sequence', 'vip-workflows' ),
			'description'         => __( 'Replaces the configuration of an existing workflow sequence — its statuses, transitions, required tools, role permissions and metadata fields. This is a full replacement, not a patch: any field you omit is cleared, so read the sequence first (Validate Sequence returns its stored configuration). Cannot change whether the sequence is active; use Activate Sequence for that.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'sequence_id', 'name', 'statuses' ),
				'properties'           => array(
					'sequence_id'     => array(
						'type'        => 'integer',
						'description' => __( 'The ID of the sequence to update.', 'vip-workflows' ),
					),
					'name'            => array(
						'type'        => 'string',
						'description' => __( 'The sequence name.', 'vip-workflows' ),
					),
					'description'     => array(
						'type'        => 'string',
						'description' => __( 'Sequence description. Omitting this clears it.', 'vip-workflows' ),
					),
					'statuses'        => array(
						'type'        => 'array',
						'description' => __( 'The complete array of status configurations defining the sequence stages. Replaces the existing stages entirely.', 'vip-workflows' ),
						'items'       => array(
							'type'       => 'object',
							'required'   => array( 'key', 'label' ),
							'properties' => array(
								'key'            => array(
									'type'        => 'string',
									'description' => __( 'Machine key for the status.', 'vip-workflows' ),
								),
								'label'          => array(
									'type'        => 'string',
									'description' => __( 'Human-readable status label.', 'vip-workflows' ),
								),
								'color'          => array(
									'type'        => 'string',
									'description' => __( 'Hex color for the status.', 'vip-workflows' ),
								),
								'is_terminal'    => array(
									'type'        => 'boolean',
									'description' => __( 'Whether this is a terminal status.', 'vip-workflows' ),
								),
								'is_initial'     => array(
									'type'        => 'boolean',
									'description' => __( 'Whether this is the initial status.', 'vip-workflows' ),
								),
								'is_dead_end'    => array(
									'type'        => 'boolean',
									'description' => __( 'Whether this status is a dead end (no outgoing transitions).', 'vip-workflows' ),
								),
								'is_in_progress' => array(
									'type'        => 'boolean',
									'description' => __( 'Whether this status represents active, in-progress work.', 'vip-workflows' ),
								),
								'creates_post'   => array(
									'type'        => 'boolean',
									'description' => __( 'Whether entering this status creates a post.', 'vip-workflows' ),
								),
								'status'         => array(
									'type'        => 'string',
									'description' => __( 'Core status region this stage lives in. Defaults to "draft".', 'vip-workflows' ),
									'enum'        => Sequence::EDITORIAL_STATUSES,
								),
								'region_entry'   => array(
									'type'        => 'boolean',
									'description' => __( 'Marks this stage as the entry checkpoint of its status region. At most one per region; defaults to the first stage in the region.', 'vip-workflows' ),
								),
								'transitions'    => array(
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
								'agent'          => array(
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
						'description' => __( 'Post types this sequence applies to (workflow only). Omitting this detaches the sequence from every post type.', 'vip-workflows' ),
					),
					'settings'        => array(
						'type'        => 'object',
						'description' => __( 'Sequence settings. Omitting this clears them.', 'vip-workflows' ),
					),
					'metadata_fields' => array(
						'type'        => 'array',
						'description' => __( 'The complete array of editorial metadata field definitions. Omitting this clears them.', 'vip-workflows' ),
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
						'description' => __( 'The updated sequence ID.', 'vip-workflows' ),
					),
					'name'           => array(
						'type'        => 'string',
						'description' => __( 'The sequence name.', 'vip-workflows' ),
					),
					'slug'           => array(
						'type'        => 'string',
						'description' => __( 'The sequence slug.', 'vip-workflows' ),
					),
					'type'           => array(
						'type'        => 'string',
						'description' => __( 'The sequence type.', 'vip-workflows' ),
					),
					'status'         => array(
						'type'        => 'string',
						'description' => __( 'The sequence lifecycle state, unchanged by this ability.', 'vip-workflows' ),
					),
					'status_changed' => array(
						'type'        => 'boolean',
						'description' => __( 'Always false: this ability cannot change lifecycle state. Reported so a caller can verify it.', 'vip-workflows' ),
					),
					'statuses_count' => array(
						'type'        => 'integer',
						'description' => __( 'Number of statuses in the updated sequence.', 'vip-workflows' ),
					),
					'warnings'       => array(
						'type'        => 'array',
						'description' => __( 'Non-fatal advisories about the updated sequence (e.g. no valid post types configured).', 'vip-workflows' ),
						'items'       => array( 'type' => 'string' ),
					),
					'success'        => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the sequence was updated.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_update_sequence',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'meta'                => array(
				'show_in_commands'    => false,
				'transition_eligible' => false,
				'annotations'         => array(
					'readonly'    => false,
					'destructive' => true,
					'idempotent'  => true,
				),
				'mcp'                 => array(
					'public' => true,
					'type'   => 'tool',
				),
			),
		)
	);
}
