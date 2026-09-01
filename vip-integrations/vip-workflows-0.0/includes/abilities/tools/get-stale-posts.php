<?php
/**
 * Get Stale Posts ability.
 *
 * Returns posts that have been stuck in the same workflow status beyond a threshold.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the stale posts query.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_get_stale_posts( ?array $input = null ) {
	$input          = $input ?? array();
	$threshold_days = max( 1, (int) ( $input['threshold_days'] ?? 3 ) );
	$status         = $input['status'] ?? null;
	$limit          = min( (int) ( $input['limit'] ?? 20 ), 50 );

	$threshold_date = gmdate( 'Y-m-d H:i:s', strtotime( "-{$threshold_days} days" ) );

	$query_args = array(
		'post_type'      => 'any',
		'posts_per_page' => $limit,
		'date_query'     => array(
			array(
				'column' => 'post_modified_gmt',
				'before' => $threshold_date,
			),
		),
		'orderby'        => 'modified',
		'order'          => 'ASC',
	);

	if ( $status ) {
		// A specific workflow stage (StageQuery scopes by stage meta + defaults post_status any).
		$query_args = \VIPWorkflows\Workflow\StageQuery::by_stage_key( $status, $query_args );
	} else {
		// "All active workflow stages" — non-terminal, non-dead-end stages, scoped
		// per sequence so a stage key that is active in one sequence but terminal
		// in another is not mistaken for stale active work in the latter.
		$repository = new \VIPWorkflows\Sequences\SequenceRepository();
		$query_args = \VIPWorkflows\Workflow\StageQuery::active_across( $repository->get_active(), $query_args );
	}

	$query = new \WP_Query( $query_args );
	$posts = array();

	foreach ( $query->posts as $post ) {
		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			continue;
		}

		$author     = get_userdata( (int) $post->post_author );
		$days_stale = (int) ( ( time() - strtotime( $post->post_modified_gmt ) ) / DAY_IN_SECONDS );

		$posts[] = array(
			'post_id'    => $post->ID,
			'title'      => $post->post_title,
			'status'     => $post->post_status,
			'author'     => $author ? $author->display_name : __( 'Unknown', 'vip-workflows' ),
			'modified'   => $post->post_modified,
			'days_stale' => $days_stale,
			'edit_url'   => get_edit_post_link( $post->ID, 'raw' ) ? get_edit_post_link( $post->ID, 'raw' ) : '',
		);
	}

	return array(
		'threshold_days' => $threshold_days,
		'count'          => count( $posts ),
		'posts'          => $posts,
	);
}

/**
 * Register the Get Stale Posts ability.
 *
 * @return void
 */
function register_get_stale_posts(): void {
	wp_register_ability(
		'vip-workflows/get-stale-posts',
		array(
			'label'               => __( 'Get Stale Posts', 'vip-workflows' ),
			'description'         => __( 'Returns posts stuck in a workflow status beyond a configurable number of days.', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'threshold_days' => array(
						'type'        => 'integer',
						'description' => __( 'Number of days without modification to be considered stale (default 3).', 'vip-workflows' ),
						'default'     => 3,
					),
					'status'         => array(
						'type'        => 'string',
						'description' => __( 'Optional specific status to check. Omit for all non-published statuses.', 'vip-workflows' ),
					),
					'limit'          => array(
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
					'threshold_days' => array(
						'type'        => 'integer',
						'description' => __( 'The threshold used.', 'vip-workflows' ),
					),
					'count'          => array(
						'type'        => 'integer',
						'description' => __( 'Number of stale posts.', 'vip-workflows' ),
					),
					'posts'          => array(
						'type'        => 'array',
						'description' => __( 'Array of stale posts.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_get_stale_posts',
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
