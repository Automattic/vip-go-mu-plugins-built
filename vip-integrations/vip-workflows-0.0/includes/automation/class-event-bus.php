<?php
/**
 * Event bus.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Automation;

use VIPWorkflows\Database\Schema;

/**
 * Central event bus for workflow events.
 *
 * Records every event the plugin emits into the workflow-events table, which is
 * what the audit log, a post's history modal and the recent-activity ability all
 * read. Emitting is the whole job: the bus used to also execute "automation
 * flows" off the back of each event, and that engine was removed — nothing could
 * author a flow, so nothing ever ran. See the 2.24.0 schema migration.
 *
 * A subscriber wanting to act on an event hooks `vip_workflows_event_emitted`.
 */
class EventBus {


	/**
	 * Event registry.
	 *
	 * @var EventRegistry
	 */
	private EventRegistry $registry;

	/**
	 * Constructor.
	 *
	 * @param EventRegistry $registry Event registry.
	 */
	public function __construct( EventRegistry $registry ) {
		$this->registry = $registry;
	}

	/**
	 * Emit an event.
	 *
	 * @param string $event_type Event type.
	 * @param array  $event_data Event data.
	 * @param array  $context    Execution context.
	 */
	public function emit( string $event_type, array $event_data, array $context = array() ): void {
		$event_id = $this->store_event( $event_type, $event_data, $context );

		/**
		 * Fires when an event is emitted.
		 *
		 * @param string $event_type Event type.
		 * @param array  $event_data Event data.
		 * @param int    $event_id   Stored event ID.
		 */
		do_action( 'vip_workflows_event_emitted', $event_type, $event_data, $event_id );
	}

	/**
	 * Store an event in the database.
	 *
	 * @param  string $event_type Event type.
	 * @param  array  $event_data Event data.
	 * @param  array  $context    Context.
	 * @return int Event ID.
	 */
	private function store_event( string $event_type, array $event_data, array $context ): int {
		global $wpdb;

		$wpdb->insert(
			Schema::get_table_name( 'workflows_events' ),
			array(
				'post_id'    => $context['post_id'] ?? null,
				'event_type' => $event_type,
				'event_data' => wp_json_encode( $event_data ),
				'actor_id'   => $context['actor_id'] ?? get_current_user_id(),
				'actor_type' => $context['actor_type'] ?? 'user',
				'created_at' => current_time( 'mysql' ),
			)
		);

		return $wpdb->insert_id;
	}

	/**
	 * Get the event registry.
	 *
	 * @return EventRegistry
	 */
	public function get_registry(): EventRegistry {
		return $this->registry;
	}
}
