<?php
/**
 * Get Transition History ability.
 *
 * Returns the status transition log (audit trail) for a given post.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the transition history query.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_get_transition_history( ?array $input = null ) {
	$input   = $input ?? array();
	$post_id = (int) ( $input['post_id'] ?? 0 );
	$limit   = min( (int) ( $input['limit'] ?? 20 ), 50 );

	if ( ! $post_id ) {
		return new \WP_Error( 'missing_post_id', __( 'The "post_id" parameter is required.', 'vip-workflows' ) );
	}

	$post = get_post( $post_id );
	if ( ! $post ) {
		return new \WP_Error( 'not_found', __( 'Post not found.', 'vip-workflows' ) );
	}

	$permission_error = require_post_edit_permission( $post_id );
	if ( $permission_error ) {
		return $permission_error;
	}

	$status_manager = new \VIPWorkflows\Workflow\StatusManager();
	$history        = $status_manager->get_transition_history( $post_id, $limit );

	// Enrich with actor display names (agent-aware). An agent's id lives inside
	// event_data, where the transition wrote it.
	foreach ( $history as &$entry ) {
		$entry['actor_name'] = \VIPWorkflows\Workflow\Actor::name_for(
			array(
				'actor_id'    => $entry['actor_id'],
				'actor_type'  => $entry['actor_type'],
				'agent_actor' => $entry['event_data']['agent_actor'] ?? null,
			)
		);
	}
	unset( $entry );

	return array(
		'post_id'    => $post_id,
		'post_title' => $post->post_title,
		'count'      => count( $history ),
		'history'    => $history,
	);
}

/**
 * Register the Get Transition History ability.
 *
 * @return void
 */
function register_get_transition_history(): void {
	wp_register_ability(
		'vip-workflows/get-transition-history',
		array(
			'label'               => __( 'Get Transition History', 'vip-workflows' ),
			'description'         => __( 'Returns the status transition audit trail for a given post.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'post_id' ),
				'properties'           => array(
					'post_id' => array(
						'type'        => 'integer',
						'description' => __( 'The post ID to get history for.', 'vip-workflows' ),
					),
					'limit'   => array(
						'type'        => 'integer',
						'description' => __( 'Maximum number of entries (default 20, max 50).', 'vip-workflows' ),
						'default'     => 20,
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'post_id'    => array(
						'type'        => 'integer',
						'description' => __( 'The post ID.', 'vip-workflows' ),
					),
					'post_title' => array(
						'type'        => 'string',
						'description' => __( 'The post title.', 'vip-workflows' ),
					),
					'count'      => array(
						'type'        => 'integer',
						'description' => __( 'Number of transitions returned.', 'vip-workflows' ),
					),
					'history'    => array(
						'type'        => 'array',
						'description' => __( 'Array of transition events. Each carries the event type, the recorded event_data (from/to stage keys plus the labels they had at the time, comment, notes), the actor and the timestamp.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_get_transition_history',
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
