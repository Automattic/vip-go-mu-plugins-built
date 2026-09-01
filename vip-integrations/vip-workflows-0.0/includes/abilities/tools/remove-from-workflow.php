<?php
/**
 * Remove From Workflow ability.
 *
 * The Abilities-API half of the publish veto's escape hatch.
 *
 * A non-bypass user's status change across the publish boundary is refused at
 * the save layer, and the refusal names exactly two ways through: move the post
 * through the workflow to a published stage, or take it out of the workflow —
 * which is recorded. Both were reachable from the UI; only the first was
 * reachable from an ability, so an agent asked to "remove this from its workflow
 * and publish it" could not do the thing the veto itself told it to do.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the workflow removal.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_remove_from_workflow( ?array $input = null ) {
	$input   = $input ?? array();
	$post_id = (int) ( $input['post_id'] ?? 0 );

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

	// Read the identity BEFORE removing it: remove_sequence() deletes the meta
	// it is derived from, and the caller needs to know what it just took the post
	// out of. A dangling sequence id (the row was deleted) still resolves to a
	// name of null here, which is exactly the case removal exists to clean up.
	$sequence      = $status_manager->get_sequence_for_post( $post_id );
	$removed_stage  = (string) get_post_meta( $post_id, \VIPWorkflows\Workflow\StatusManager::STAGE_META_KEY, true );

	// StatusManager::remove_sequence() is the sole authority: it deletes the
	// sequence + stage + claim meta, writes NO post_status (the post stays
	// exactly where core has it), cancels any in-flight stage agent by the same
	// mechanism a reseat does, and records a `workflow.removed` audit event. The
	// audit trail is the entire reason this operation is acceptable, so this
	// ability must not reimplement any part of it.
	$result = $status_manager->remove_sequence( $post_id );

	if ( is_wp_error( $result ) ) {
		return $result;
	}

	return array(
		'post_id'        => $post_id,
		'post_title'     => $post->post_title,
		'workflow_name'  => $sequence ? $sequence->name : '',
		'removed_stage'  => $removed_stage,
		'post_status'    => (string) get_post_status( $post_id ),
		'success'        => true,
	);
}

/**
 * Register the Remove From Workflow ability.
 *
 * @return void
 */
function register_remove_from_workflow(): void {
	wp_register_ability(
		'vip-workflows/remove-from-workflow',
		array(
			'label'               => __( 'Remove From Workflow', 'vip-workflows' ),
			'description'         => __( 'Takes a post out of its workflow, leaving its published status exactly as it is. The removal is recorded in the workflow log and cannot be undone: re-assigning a workflow later starts the post at the first stage of its region. This is the audited escape from the publish guard — prefer moving the post through the workflow to a published stage where that is possible.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'post_id' ),
				'properties'           => array(
					'post_id' => array(
						'type'        => 'integer',
						'description' => __( 'The post ID to remove from its workflow.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'post_id'       => array(
						'type'        => 'integer',
						'description' => __( 'The post ID.', 'vip-workflows' ),
					),
					'post_title'    => array(
						'type'        => 'string',
						'description' => __( 'The post title.', 'vip-workflows' ),
					),
					'workflow_name' => array(
						'type'        => 'string',
						'description' => __( 'The workflow the post was removed from. Empty when its sequence no longer exists.', 'vip-workflows' ),
					),
					'removed_stage' => array(
						'type'        => 'string',
						'description' => __( 'The stage key the post was sitting at when it was removed.', 'vip-workflows' ),
					),
					'post_status'   => array(
						'type'        => 'string',
						'description' => __( 'The post status after removal — unchanged, because removal writes none.', 'vip-workflows' ),
					),
					'success'       => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the removal succeeded.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_remove_from_workflow',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'meta'                => array(
				'show_in_commands'    => false,
				'transition_eligible' => false,
				'annotations'         => array(
					'readonly'    => false,
					// Destructive: the workflow identity is deleted, the audit
					// entry records it, and re-assigning does not restore the
					// stage the post was removed from.
					'destructive' => true,
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
