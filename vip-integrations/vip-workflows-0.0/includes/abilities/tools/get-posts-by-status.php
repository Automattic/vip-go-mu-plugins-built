<?php
/**
 * Get Posts By Status ability.
 *
 * Query posts filtered by workflow status.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the posts-by-status query.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_get_posts_by_status( ?array $input = null ) {
	$input     = $input ?? array();
	$status    = $input['status'] ?? null;
	$post_type = $input['post_type'] ?? 'post';
	$limit     = min( (int) ( $input['limit'] ?? 20 ), 50 );

	if ( empty( $status ) ) {
		return new \WP_Error( 'missing_status', __( 'The "status" parameter is required.', 'vip-workflows' ) );
	}

	// Select posts at this workflow stage (any post_status — the stage is decoupled
	// from visibility). StageQuery owns the storage shape.
	$query_args = \VIPWorkflows\Workflow\StageQuery::by_stage_key(
		$status,
		array(
			'post_type'      => $post_type,
			'post_status'    => 'any',
			'posts_per_page' => $limit,
			'orderby'        => 'modified',
			'order'          => 'DESC',
		)
	);

	$query = new \WP_Query( $query_args );

	$posts = array();

	foreach ( $query->posts as $post ) {
		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			continue;
		}

		$author       = get_userdata( (int) $post->post_author );
		$sequence_id = get_post_meta( $post->ID, '_vip_workflows_sequence_id', true );

		$posts[] = array(
			'post_id'      => $post->ID,
			'title'        => $post->post_title,
			'post_type'    => $post->post_type,
			'status'       => $post->post_status,
			'author'       => $author ? $author->display_name : __( 'Unknown', 'vip-workflows' ),
			'modified'     => $post->post_modified,
			'sequence_id'  => $sequence_id ? (int) $sequence_id : null,
			'edit_url'     => get_edit_post_link( $post->ID, 'raw' ) ? get_edit_post_link( $post->ID, 'raw' ) : '',
		);
	}

	return array(
		'status'      => $status,
		'total_found' => count( $posts ),
		'count'       => count( $posts ),
		'posts'       => $posts,
	);
}

/**
 * Register the Get Posts By Status ability.
 *
 * @return void
 */
function register_get_posts_by_status(): void {
	wp_register_ability(
		'vip-workflows/get-posts-by-status',
		array(
			'label'               => __( 'Get Posts By Status', 'vip-workflows' ),
			'description'         => __( 'Query posts filtered by a specific workflow status.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'required'             => array( 'status' ),
				'properties'           => array(
					'status'    => array(
						'type'        => 'string',
						'description' => __( 'The workflow status to filter by (e.g., "draft", "pending-review").', 'vip-workflows' ),
					),
					'post_type' => array(
						'type'        => 'string',
						'description' => __( 'Post type to query. Defaults to "post".', 'vip-workflows' ),
						'default'     => 'post',
					),
					'limit'     => array(
						'type'        => 'integer',
						'description' => __( 'Maximum number of results (default 20, max 50).', 'vip-workflows' ),
						'default'     => 20,
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'status'      => array(
						'type'        => 'string',
						'description' => __( 'The queried status.', 'vip-workflows' ),
					),
					'total_found' => array(
						'type'        => 'integer',
						'description' => __( 'Number of matching posts the current user can edit.', 'vip-workflows' ),
					),
					'count'       => array(
						'type'        => 'integer',
						'description' => __( 'Number of posts returned.', 'vip-workflows' ),
					),
					'posts'       => array(
						'type'        => 'array',
						'description' => __( 'Array of posts.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_get_posts_by_status',
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
