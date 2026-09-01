<?php
/**
 * Get Recent Activity ability.
 *
 * Returns recent editorial activity across the site.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Execute the recent activity query.
 *
 * @param  array|null $input Input parameters.
 * @return array|\WP_Error Result data or error.
 */
function execute_get_recent_activity( ?array $input = null ) {
	$input = $input ?? array();
	$limit = min( (int) ( $input['limit'] ?? 20 ), 50 );
	$days  = min( (int) ( $input['days'] ?? 7 ), 30 );

	global $wpdb;

	$table = \VIPWorkflows\Database\Schema::get_table_name( 'workflows_events' );
	$since = gmdate( 'Y-m-d H:i:s', strtotime( "-{$days} days" ) );

	// The EventBus stores its own `post.stage_changed` / `stage.{key}.entered`
	// emissions in this table as bookkeeping beside StatusManager's canonical
	// `status_transition` row, so an unfiltered read reports one stage change
	// three times over — and eats the limit doing it. Serve assistants the same
	// de-duplicated stream the audit log serves.
	$exclusion = \VIPWorkflows\Workflow\StatusManager::bus_bookkeeping_exclusion( 'event_type' );

	$results = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->prepare(
			"SELECT * FROM {$table} WHERE created_at >= %s AND {$exclusion['sql']} ORDER BY created_at DESC LIMIT %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			array_merge( array( $since ), $exclusion['values'], array( $limit ) )
		)
	);

	$events = array();

	foreach ( $results as $row ) {
		$data   = json_decode( $row->event_data, true );
		$data   = $data ? $data : array();
		$post   = get_post( (int) $row->post_id );

		if ( ! $post || ! current_user_can( 'edit_post', $post->ID ) ) {
			continue;
		}

		$actor_name = \VIPWorkflows\Workflow\Actor::name_for(
			array(
				'actor_id'    => (int) $row->actor_id,
				'actor_type'  => $row->actor_type ?? 'user',
				'agent_actor' => $data['agent_actor'] ?? null,
			)
		);

		$events[] = array(
			'event_type' => $row->event_type,
			'post_id'    => (int) $row->post_id,
			'post_title' => $post->post_title,
			'actor'      => $actor_name,
			'details'    => $data,
			'created_at' => $row->created_at,
		);
	}

	return array(
		/* translators: %d: number of days in the activity period. */
		'period' => sprintf( __( 'Last %d days', 'vip-workflows' ), $days ),
		'count'  => count( $events ),
		'events' => $events,
	);
}

/**
 * Register the Get Recent Activity ability.
 *
 * @return void
 */
function register_get_recent_activity(): void {
	wp_register_ability(
		'vip-workflows/get-recent-activity',
		array(
			'label'               => __( 'Get Recent Activity', 'vip-workflows' ),
			'description'         => __( 'Returns recent editorial activity across the site (status transitions, assignments, etc.).', 'vip-workflows' ),
			'category'            => 'vip-workflows',
			'input_schema'        => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'days'  => array(
						'type'        => 'integer',
						'description' => __( 'Number of days to look back (default 7, max 30).', 'vip-workflows' ),
						'default'     => 7,
					),
					'limit' => array(
						'type'        => 'integer',
						'description' => __( 'Maximum number of events (default 20, max 50).', 'vip-workflows' ),
						'default'     => 20,
					),
				),
			),
			'output_schema'       => array(
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => array(
					'period' => array(
						'type'        => 'string',
						'description' => __( 'The time period queried.', 'vip-workflows' ),
					),
					'count'  => array(
						'type'        => 'integer',
						'description' => __( 'Number of events returned.', 'vip-workflows' ),
					),
					'events' => array(
						'type'        => 'array',
						'description' => __( 'Array of recent activity events.', 'vip-workflows' ),
					),
				),
			),
			'execute_callback'    => __NAMESPACE__ . '\\execute_get_recent_activity',
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
