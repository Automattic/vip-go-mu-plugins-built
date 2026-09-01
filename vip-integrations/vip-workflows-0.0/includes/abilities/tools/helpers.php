<?php
/**
 * Shared helper functions for workflow ability tools.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Require edit access for a post-scoped ability.
 *
 * @param int $post_id Post ID.
 * @return \WP_Error|null Error when access is denied, otherwise null.
 */
function require_post_edit_permission( int $post_id ): ?\WP_Error {
	if ( current_user_can( 'edit_post', $post_id ) ) {
		return null;
	}

	// Note: no array error-data is attached here. AbilityExecutor treats a
	// WP_Error whose error-data is an array as a *success* payload, so an
	// array such as array( 'status' => 403 ) would cause permission denials
	// to be reported as successful ability results to direct executor callers.
	return new \WP_Error(
		'forbidden',
		__( 'You do not have permission to edit this post.', 'vip-workflows' )
	);
}

/**
 * Record a configuration-scoped audit event attributed to the acting ability.
 *
 * A sequence write has no post, so it cannot go through
 * StatusManager::log_workflow_event(), which is post-scoped by signature. It goes
 * through the EventBus instead, which is already post-optional (`workflow_events.post_id`
 * is a nullable column, and store_event() passes `$context['post_id'] ?? null`) and
 * already lets a caller declare `actor_type`. No sentinel post id, and no second
 * audit surface.
 *
 * Attribution reuses the existing agent scheme rather than inventing one:
 * `actor_type = 'agent'` plus the acting ability id in `event_data.agent_actor`, which
 * is what Actor::name_for() and AuditLogController::enrich_event()
 * already read. `actor_id` still carries the authenticated user, so the trail records
 * both the ability that performed the write and the account that authorized it.
 *
 * @since 0.0.1
 *
 * @param string $event_type Event type slug (e.g. 'sequence.updated').
 * @param string $ability_id Acting ability id, recorded as the agent actor.
 * @param array  $event_data Event payload.
 * @return void
 */
function log_configuration_event( string $event_type, string $ability_id, array $event_data ): void {
	\VIPWorkflows\Plugin::get_instance()->get_event_bus()->emit(
		$event_type,
		array_merge( $event_data, array( 'agent_actor' => $ability_id ) ),
		array(
			'post_id'    => null,
			'actor_id'   => get_current_user_id(),
			'actor_type' => 'agent',
		)
	);
}
