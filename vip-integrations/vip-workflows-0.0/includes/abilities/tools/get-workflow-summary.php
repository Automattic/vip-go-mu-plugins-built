<?php
/**
 * Get Workflow Summary ability.
 *
 * Returns post counts grouped by workflow status.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the workflow summary query.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_get_workflow_summary( ?array $input = null ) {
	$input        = $input ?? array();
	$sequence_id = $input['sequence_id'] ?? null;

	$repository = new \VIPWorkflows\Sequences\SequenceRepository();

	// If a specific sequence is requested, use it; otherwise get all active.
	if ( $sequence_id ) {
		$sequence = $repository->find( (int) $sequence_id );
		if ( ! $sequence ) {
			return new \WP_Error( 'not_found', __( 'Sequence not found.', 'vip-workflows' ) );
		}
		$sequences = array( $sequence );
	} else {
		$sequences = $repository->get_active();
	}

	$summary = array();

	foreach ( $sequences as $sequence ) {
		$statuses      = $sequence->get_statuses();
		$status_counts = array();

		// One aggregate query per sequence (StageQuery owns the stage storage).
		$counts = \VIPWorkflows\Workflow\StageQuery::counts_by_stage( $sequence );

		foreach ( $statuses as $status ) {
			$status_key = $status['key'];

			$status_counts[] = array(
				'status' => $status_key,
				'label'  => $status['label'] ?? $status_key,
				'count'  => $counts[ $status_key ] ?? 0,
			);
		}

		$sequence_data = $sequence->to_array();

		$summary[] = array(
			'sequence_id'   => $sequence_data['id'],
			'sequence_name' => $sequence_data['name'],
			'type'          => $sequence->type,
			'statuses'      => $status_counts,
		);
	}

	return array( 'sequences' => $summary );
}

/**
 * Register the Get Workflow Summary ability.
 *
 * @return void
 */
function register_get_workflow_summary(): void {
	wp_register_ability(
		'vip-workflows/get-workflow-summary',
		array(
			'label'               => __( 'Get Workflow Summary', 'vip-workflows' ),
			'description'         => __( 'Returns post counts grouped by workflow status for each active sequence.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'sequence_id' => array(
						'type'        => 'integer',
						'description' => __( 'Optional sequence ID to filter by. Omit for all active sequences.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'sequences' => array(
						'type'        => 'array',
						'description' => __( 'Array of sequences with their status counts.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_get_workflow_summary',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta'                => array(
				'show_in_commands'    => false,
				'transition_eligible' => false,
				'annotations'         => array(
					'readonly'    => true,
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
