<?php
/**
 * Import Sequence ability.
 *
 * Imports a workflow sequence from an exported JSON definition. Thin adapter over
 * SequencesController::import_sequence() so slug dedup, metadata validation,
 * assignment-meta regeneration, and the phase-type Ideation gate are reused.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the sequence import.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_import_sequence( ?array $input = null ) {
	$input          = $input ?? array();
	$sequence_json = $input['sequence_json'] ?? null;

	if ( ! is_array( $sequence_json ) ) {
		return new \WP_Error( 'missing_sequence_json', __( 'The "sequence_json" parameter is required and must be the exported sequence object.', 'vip-workflows' ) );
	}

	$request = new \WP_REST_Request( 'POST', '/vip-workflows/v1/sequences/import' );
	$request->set_param( 'sequence_json', $sequence_json );
	if ( array_key_exists( 'name', $input ) ) {
		$request->set_param( 'name', $input['name'] );
	}

	$response = ( new \VIPWorkflows\API\SequencesController() )->import_sequence( $request );

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	$data      = $response->get_data();
	$sequence = is_array( $data ) ? ( $data['sequence'] ?? null ) : null;

	// Per the no-fallback rule, a success response missing the prepared sequence
	// is a data-integrity bug — surface it rather than coalescing.
	if ( ! is_array( $sequence ) || ! array_key_exists( 'id', $sequence ) ) {
		return new \WP_Error( 'import_response_incomplete', __( 'Sequence was imported but the response did not include the created sequence.', 'vip-workflows' ) );
	}

	return array(
		'sequence_id'    => (int) $sequence['id'],
		'uuid'           => (string) ( $sequence['uuid'] ?? '' ),
		'name'           => (string) ( $sequence['name'] ?? '' ),
		'slug'           => (string) ( $sequence['slug'] ?? '' ),
		'type'           => (string) ( $sequence['type'] ?? '' ),
		'status'         => (string) ( $sequence['status'] ?? '' ),
		'statuses_count' => (int) ( $sequence['statuses_count'] ?? 0 ),
		'success'        => true,
	);
}

/**
 * Register the Import Sequence ability.
 *
 * @return void
 */
function register_import_sequence(): void {
	wp_register_ability(
		'vip-workflows/import-sequence',
		array(
			'label'               => __( 'Import Sequence', 'vip-workflows' ),
			'description'         => __( 'Imports a workflow sequence from an exported JSON definition. The imported sequence is created as a draft.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'sequence_json' ),
				'properties'           => array(
					'sequence_json' => array(
						'type'        => 'object',
						'description' => __( 'The exported sequence object (as produced by the export endpoint): must include type, name, and config.statuses.', 'vip-workflows' ),
					),
					'name'           => array(
						'type'        => 'string',
						'description' => __( 'Optional name override for the imported sequence. Defaults to the name in the JSON.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'sequence_id'    => array(
						'type'        => 'integer',
						'description' => __( 'The imported sequence ID.', 'vip-workflows' ),
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
						'description' => __( 'The sequence lifecycle state (imported sequences are created as draft).', 'vip-workflows' ),
					),
					'statuses_count' => array(
						'type'        => 'integer',
						'description' => __( 'Number of statuses in the imported sequence.', 'vip-workflows' ),
					),
					'success'        => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the sequence was imported.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_import_sequence',
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
