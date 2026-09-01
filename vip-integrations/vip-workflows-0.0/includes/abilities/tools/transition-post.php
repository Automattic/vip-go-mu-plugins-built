<?php
/**
 * Transition Post ability.
 *
 * Moves a post to a new workflow status.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the post transition.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_transition_post( ?array $input = null ) {
	$input     = $input ?? array();
	$post_id   = (int) ( $input['post_id'] ?? 0 );
	$to_status = $input['to_status'] ?? '';
	$comment   = $input['comment'] ?? '';

	if ( ! $post_id ) {
		return new \WP_Error( 'missing_post_id', __( 'The "post_id" parameter is required.', 'vip-workflows' ) );
	}

	if ( empty( $to_status ) ) {
		return new \WP_Error( 'missing_status', __( 'The "to_status" parameter is required.', 'vip-workflows' ) );
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

	// The origin is the workflow stage the post is leaving. post_status is now
	// visibility-only and no longer equals the stage, so read the stage meta —
	// symmetric with to_status, which is a stage key.
	$from_status = (string) get_post_meta( $post_id, \VIPWorkflows\Workflow\StatusManager::STAGE_META_KEY, true );

	$options = array(
		'acknowledge_warnings' => ! empty( $input['acknowledge_warnings'] ),
	);
	if ( ! empty( $comment ) ) {
		$options['comment'] = sanitize_text_field( $comment );
	}

	$result = $status_manager->transition( $post_id, $to_status, $options );

	if ( is_wp_error( $result ) ) {
		return $result;
	}

	// transition() returns a warnings-pending array (NOT a WP_Error) when a
	// warning needs acknowledgement — nothing is committed. Two things raise
	// one: a required tool that soft-failed, and a stage agent that is mid-run
	// and would be stopped by this move.
	//
	// The interactive surfaces answer it by asking the user. A programmatic
	// caller cannot be asked, so it is told what it would be overriding and
	// re-invokes with acknowledge_warnings: true to proceed. Reporting
	// success:true here — which this did — meant an agent could believe it had
	// moved a post it had not, and, for the agent warning, that one agent had
	// quietly killed another.
	if ( is_array( $result ) && ! empty( $result['warnings_pending'] ) ) {
		return array(
			'post_id'          => $post_id,
			'post_title'       => $post->post_title,
			'from_status'      => $from_status,
			'to_status'        => $to_status,
			'success'          => false,
			'warnings_pending' => true,
			'warnings'         => $result['soft_warnings'] ?? array(),
		);
	}

	return array(
		'post_id'     => $post_id,
		'post_title'  => $post->post_title,
		'from_status' => $from_status,
		'to_status'   => $to_status,
		'success'     => true,
	);
}

/**
 * Register the Transition Post ability.
 *
 * @return void
 */
function register_transition_post(): void {
	wp_register_ability(
		'vip-workflows/transition-post',
		array(
			'label'               => __( 'Transition Post', 'vip-workflows' ),
			'description'         => __( 'Moves a post to a new workflow status. Respects role-based transition rules.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'post_id', 'to_status' ),
				'properties'           => array(
					'post_id'   => array(
						'type'        => 'integer',
						'description' => __( 'The post ID to transition.', 'vip-workflows' ),
					),
					'to_status' => array(
						'type'        => 'string',
						'description' => __( 'The target workflow status key.', 'vip-workflows' ),
					),
					'comment'   => array(
						'type'        => 'string',
						'description' => __( 'Optional transition comment for the audit trail.', 'vip-workflows' ),
					),
					'acknowledge_warnings' => array(
						'type'        => 'boolean',
						'description' => __( 'Acknowledge soft warnings and proceed — including stopping an AI agent that is currently working on this post. Re-invoke with this set to true after a response with "warnings_pending": true.', 'vip-workflows' ),
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'post_id'     => array(
						'type'        => 'integer',
						'description' => __( 'The post ID.', 'vip-workflows' ),
					),
					'from_status' => array(
						'type'        => 'string',
						'description' => __( 'The previous status.', 'vip-workflows' ),
					),
					'to_status'   => array(
						'type'        => 'string',
						'description' => __( 'The new status.', 'vip-workflows' ),
					),
					'success'     => array(
						'type'        => 'boolean',
						'description' => __( 'Whether the transition succeeded. False when warnings_pending is true.', 'vip-workflows' ),
					),
					'warnings_pending' => array(
						'type'        => 'boolean',
						'description' => __( 'True when unacknowledged warnings held back the transition; nothing was committed.', 'vip-workflows' ),
					),
					'warnings'    => array(
						'type'        => 'array',
						'description' => __( 'The warnings requiring acknowledgement, when warnings_pending is true. Each has a `type` (e.g. agent_in_progress) and a `message`.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_transition_post',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
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
