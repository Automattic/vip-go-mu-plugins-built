<?php
/**
 * Get Sequences ability.
 *
 * Lists active workflow sequences with their statuses. The registered slug
 * (vip-workflows/get-sequences) is kept stable for MCP/back-compat.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the sequences query.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_get_sequences( ?array $input = null ) {
	$input = $input ?? array();
	$type  = $input['type'] ?? null;

	$repository = new \VIPWorkflows\Sequences\SequenceRepository();

	if ( 'workflow' === $type ) {
		$sequences = $repository->get_workflow_sequences( array( 'active' => true ) );
	} else {
		$sequences = $repository->get_active();
	}

	$result = array();

	foreach ( $sequences as $sequence ) {
		$data       = $sequence->to_array();
		$statuses   = $sequence->get_statuses();
		$status_list = array();

		foreach ( $statuses as $status ) {
			$status_list[] = array(
				'key'          => $status['key'],
				'label'        => $status['label'] ?? $status['key'],
				'is_initial'   => ( $status['key'] === $sequence->get_initial_status() ),
				// Stage × status matrix: the core status region the stage lives in,
				// and whether it is that region's entry checkpoint (replaces the
				// removed is_publish flag).
				'status'       => $sequence->get_stage_status( $status['key'] ),
				'region_entry' => ! empty( $status['region_entry'] ),
				'is_dead_end'  => $sequence->is_dead_end_status( $status['key'] ),
			);
		}

		$result[] = array(
			'id'          => $data['id'],
			'name'        => $data['name'],
			'description' => $data['description'] ?? '',
			'type'        => $sequence->type,
			'is_active'   => $sequence->is_active(),
			'statuses'    => $status_list,
		);
	}

	return array(
		'count'     => count( $result ),
		'sequences' => $result,
	);
}

/**
 * Register the Get Sequences ability.
 *
 * @return void
 */
function register_get_sequences(): void {
	wp_register_ability(
		'vip-workflows/get-sequences',
		array(
			'label'               => __( 'Get Sequences', 'vip-workflows' ),
			'description'         => __( 'Lists active workflow sequences with their statuses and configuration.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'type' => array(
						'type'        => 'string',
						'description' => __( 'Optional filter: "workflow". Omit for all.', 'vip-workflows' ),
						'enum'        => array( 'workflow' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'count'     => array(
						'type'        => 'integer',
						'description' => __( 'Number of sequences returned.', 'vip-workflows' ),
					),
					'sequences' => array(
						'type'        => 'array',
						'description' => __( 'Array of sequence objects with status details.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_get_sequences',
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
