<?php
/**
 * Get Available Transitions ability.
 *
 * Returns what status moves are available for a post and user.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the available transitions query.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_get_available_transitions( ?array $input = null ) {
	$input   = $input ?? array();
	$post_id = (int) ( $input['post_id'] ?? 0 );
	// Always resolve transitions for the authenticated caller — never a
	// caller-supplied user_id, which would leak another user's effective
	// Workflow permissions.
	$user_id = get_current_user_id();

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
	$current_status = $status_manager->get_current_status( $post_id );
	$transitions    = $status_manager->get_available_transitions( $post_id, $user_id );

	return array(
		'post_id'        => $post_id,
		'post_title'     => $post->post_title,
		'current_status' => $current_status,
		'transitions'    => $transitions,
		'guard'          => build_transition_guard_context( $status_manager, $post_id, $current_status ),
	);
}

/**
 * The guard context an agent needs to predict what transition-post will do.
 *
 * The human surfaces get this from `GET /workflow/post/{id}/status` and use it to
 * warn, confirm or veto BEFORE acting. Agents had no equivalent: the only way to
 * discover that a move would stop a running agent, or be refused at the publish
 * boundary, was to call transition-post and read what came back. Offering the
 * edge without the context around it is what made "an agent silently killed
 * another agent's run" possible in the first place.
 *
 * Mirrors the REST payload's `guard` block deliberately — same keys, same
 * meanings — so the two cannot describe the same post differently.
 *
 * @param  \VIPWorkflows\Workflow\StatusManager $status_manager Status manager.
 * @param  int                                  $post_id        Post ID.
 * @param  array|null                           $current_status Resolved current stage, or null.
 * @return array
 */
function build_transition_guard_context( $status_manager, int $post_id, ?array $current_status ): array {
	$stage_key = (string) ( $current_status['key'] ?? '' );
	$sequence = $status_manager->get_sequence_for_post( $post_id );

	// A null region is not a region: it can never compare equal to a target, so
	// a consumer reading this fails closed exactly as the server predicate does.
	$current_region = null;
	if ( $sequence && '' !== $stage_key ) {
		try {
			// Through boundary_region(), the one authority for "which side is the
			// post on" — a live post is publish-side whatever its stage says.
			$current_region = $status_manager->boundary_region(
				$post_id,
				$sequence->get_stage_status( $stage_key )
			);
		} catch ( \InvalidArgumentException $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot resolve the stage region for post %d; the transition guard context reports an unresolved region: %s', $post_id, $e->getMessage() ) );
		}
	}

	return array(
		'current_region' => $current_region,
		'can_bypass'     => \VIPWorkflows\Admin\Settings::can_user_bypass_workflow( get_current_user_id() ),
		'agent_pending'  => $status_manager->has_pending_agent_job( $post_id, $stage_key ),
	);
}

/**
 * Register the Get Available Transitions ability.
 *
 * @return void
 */
function register_get_available_transitions(): void {
	wp_register_ability(
		'vip-workflows/get-available-transitions',
		array(
			'label'               => __( 'Get Available Transitions', 'vip-workflows' ),
			'description'         => __( 'Returns what workflow status transitions are available for a given post and user.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'post_id' ),
				'properties'           => array(
					'post_id' => array(
						'type'        => 'integer',
						'description' => __( 'The post ID to check transitions for.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'post_id'        => array(
						'type'        => 'integer',
						'description' => __( 'The post ID.', 'vip-workflows' ),
					),
					'post_title'     => array(
						'type'        => 'string',
						'description' => __( 'The post title.', 'vip-workflows' ),
					),
					'current_status' => array(
						// Null when the post has no workflow, or when its stored
						// stage no longer resolves in the sequence (dangling key).
						'type'        => array( 'object', 'null' ),
						'description' => __( 'Current workflow status details, or null when unresolved.', 'vip-workflows' ),
					),
					'transitions'    => array(
						'type'        => 'array',
						'description' => __( 'Array of available transitions.', 'vip-workflows' ),
					),
					'guard'          => array(
						'type'        => 'object',
						'description' => __( 'What performing one of these transitions would set off. `current_region` is the editorial region (draft/pending/private/publish) of the post\'s stage, or null when it cannot be resolved; a move whose target region differs, with either side being publish, is refused for a user whose `can_bypass` is false. `agent_pending` is true when an AI agent is mid-run on this post, in which case any transition out of the stage stops it and must be confirmed with transition-post\'s acknowledge_warnings.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_get_available_transitions',
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
