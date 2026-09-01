<?php
/**
 * Activate Sequence ability.
 *
 * Flips a workflow sequence between its `active` and `draft` lifecycle states.
 *
 * Deliberately a separate ability from vip-workflows/update-sequence rather than a
 * field on it. Editing a draft sequence and putting one live are materially different
 * risks: a sequence defines post types, statuses, transitions, required tools and role
 * permissions, so activating it changes who may do what to real content. An agent
 * asked to fix a draft sequence must not be able to enable it in the same call, and an
 * agent asked to enable one must not be able to rewrite it on the way.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\Sequences\SequenceRepository;

const ACTIVATE_SEQUENCE_ABILITY_ID = 'vip-workflows/activate-sequence';

/**
 * Execute the sequence activation state change.
 *
 * @since 0.0.1
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_activate_sequence( ?array $input = null ) {
	$input       = $input ?? array();
	$sequence_id = isset( $input['sequence_id'] ) ? (int) $input['sequence_id'] : 0;

	if ( $sequence_id <= 0 ) {
		return new \WP_Error( 'missing_sequence_id', __( 'The "sequence_id" parameter is required.', 'vip-workflows' ) );
	}

	// Required with no default, so enabling a sequence is always something the
	// caller asked for in as many words.
	if ( ! array_key_exists( 'active', $input ) || ! is_bool( $input['active'] ) ) {
		return new \WP_Error( 'missing_active', __( 'The "active" parameter is required and must be a boolean.', 'vip-workflows' ) );
	}

	$active        = $input['active'];
	$target_status = $active ? 'active' : 'draft';

	$repository = new SequenceRepository();
	$sequence  = $repository->find( $sequence_id );

	if ( ! $sequence ) {
		return new \WP_Error( 'sequence_not_found', __( 'Sequence not found.', 'vip-workflows' ) );
	}

	$previous_status = $sequence->status;

	if ( $previous_status === $target_status ) {
		// Nothing was written, so nothing is audited.
		return array(
			'sequence_id'     => $sequence->id,
			'name'            => $sequence->name,
			'previous_status' => $previous_status,
			'status'          => $previous_status,
			'changed'         => false,
			'success'         => true,
		);
	}

	// Activation is the only lifecycle direction that can put a broken configuration
	// in front of editors, so it is gated on the stored config actually being sound.
	// The status column is not part of `config`, so SequenceRepository::update() runs
	// no write gate on a status-only change — without this check, a sequence rejected
	// by every write path could still be switched live. Deactivation needs no check:
	// it can only reduce exposure.
	if ( $active ) {
		$blocker = describe_activation_blocker( $sequence );

		if ( null !== $blocker ) {
			return new \WP_Error( 'sequence_invalid', $blocker );
		}
	}

	$result = $repository->update( $sequence_id, array( 'status' => $target_status ) );

	if ( ! $result ) {
		return new \WP_Error( 'activation_failed', __( 'Failed to change the sequence lifecycle state.', 'vip-workflows' ) );
	}

	log_configuration_event(
		$active ? 'sequence.activated' : 'sequence.deactivated',
		ACTIVATE_SEQUENCE_ABILITY_ID,
		array(
			'sequence_id'    => $sequence->id,
			'sequence_name'  => $sequence->name,
			'sequence_slug'  => $sequence->slug,
			'sequence_type'  => $sequence->type,
			'previous_status' => $previous_status,
			'sequence_status' => $target_status,
		)
	);

	return array(
		'sequence_id'     => $sequence->id,
		'name'            => $sequence->name,
		'previous_status' => $previous_status,
		'status'          => $target_status,
		'changed'         => true,
		'success'         => true,
	);
}

/**
 * Why this sequence must not be activated, if it must not be.
 *
 * Checks the two stage x status invariants that no write gate can see on a
 * status-only change, plus the gate itself. The invariant checks use the
 * non-throwing detectors: the throwing read path fatals on exactly the
 * configurations this needs to describe.
 *
 * @since 0.0.1
 *
 * @param  Sequence $sequence Stored sequence.
 * @return string|null Reason to refuse, or null when the sequence is sound.
 */
function describe_activation_blocker( Sequence $sequence ): ?string {
	$missing_region = $sequence->get_stages_missing_region();

	if ( ! empty( $missing_region ) ) {
		return sprintf(
			/* translators: %s: comma-separated list of stage keys. */
			__( 'This sequence cannot be activated: these stages have no status region, and every read of them fails — %s. Repair the sequence first.', 'vip-workflows' ),
			implode( ', ', $missing_region )
		);
	}

	$missing_entry = $sequence->get_regions_missing_entry();

	if ( ! empty( $missing_entry ) ) {
		return sprintf(
			/* translators: %s: comma-separated list of status regions. */
			__( 'This sequence cannot be activated: these status regions hold stages but designate no entry checkpoint, so any status change into them fails — %s. Repair the sequence first.', 'vip-workflows' ),
			implode( ', ', $missing_entry )
		);
	}

	try {
		Sequence::prepare_config_for_write( $sequence->config, $sequence->type );
	} catch ( \InvalidArgumentException $e ) {
		return sprintf(
			/* translators: %s: validation error from the sequence write gate. */
			__( 'This sequence cannot be activated because its stored configuration is invalid: %s', 'vip-workflows' ),
			$e->getMessage()
		);
	}

	return null;
}

/**
 * Register the Activate Sequence ability.
 *
 * @since 0.0.1
 *
 * @return void
 */
function register_activate_sequence(): void {
	vip_workflows_register_ability(
		ACTIVATE_SEQUENCE_ABILITY_ID,
		array(
			'label'               => __( 'Activate Sequence', 'vip-workflows' ),
			'description'         => __( 'Puts a workflow sequence live, or takes it back to draft. This is the only ability that changes a sequence lifecycle state; Update Sequence cannot. Activation is refused when the stored configuration is invalid.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'sequence_id', 'active' ),
				'properties'           => array(
					'sequence_id' => array(
						'type'        => 'integer',
						'description' => __( 'The ID of the sequence whose lifecycle state should change.', 'vip-workflows' ),
					),
					'active'      => array(
						'type'        => 'boolean',
						'description' => __( 'True to put the sequence live, false to return it to draft. Required: there is no default.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'sequence_id'     => array(
						'type'        => 'integer',
						'description' => __( 'The sequence ID.', 'vip-workflows' ),
					),
					'name'            => array(
						'type'        => 'string',
						'description' => __( 'The sequence name.', 'vip-workflows' ),
					),
					'previous_status' => array(
						'type'        => 'string',
						'description' => __( 'The lifecycle state before the call.', 'vip-workflows' ),
					),
					'status'          => array(
						'type'        => 'string',
						'description' => __( 'The lifecycle state after the call.', 'vip-workflows' ),
					),
					'changed'         => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the call changed anything. False when the sequence was already in the requested state.', 'vip-workflows' ),
					),
					'success'         => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the requested lifecycle state is now in effect.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_activate_sequence',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'meta'                => array(
				'show_in_commands'    => false,
				'transition_eligible' => false,
				'annotations'         => array(
					'readonly'    => false,
					'destructive' => false,
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
