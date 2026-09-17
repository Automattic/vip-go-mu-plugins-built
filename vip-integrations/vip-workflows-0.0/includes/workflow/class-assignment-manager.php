<?php
/**
 * Assignment Manager - handles workflow assignments.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

/**
 * Manages assignment storage and lifecycle.
 *
 * Used by StatusManager::transition().
 */
class AssignmentManager {


	/**
	 * Assignment status constants.
	 */
	public const STATUS_PENDING   = 'pending';
	public const STATUS_COMPLETED = 'completed';
	public const STATUS_EXPIRED   = 'expired';

	/**
	 * Get all registered assignee types.
	 *
	 * @return array
	 */
	public function get_assignee_types(): array {
		$types = array(
			'user'  => array(
				'label'       => __( 'User', 'vip-workflows' ),
				'description' => __( 'Assign to a specific user', 'vip-workflows' ),
				'storage'     => 'user_id',
			),
			'role'  => array(
				'label'       => __( 'Role', 'vip-workflows' ),
				'description' => __( 'Assign to anyone with a specific role', 'vip-workflows' ),
				'storage'     => 'role_slug',
			),
			'agent' => array(
				'label'       => __( 'Agent', 'vip-workflows' ),
				'description' => __( 'Assign to an automated agent/bot', 'vip-workflows' ),
				'storage'     => 'agent_id',
			),
		);

		/**
		 * Filter registered assignee types.
		 *
		 * @param array $types Registered assignee types.
		 */
		return apply_filters( 'vip_workflows_assignee_types', $types );
	}

	/**
	 * Get a specific assignee type configuration.
	 *
	 * @param  string $type Assignee type key.
	 * @return array|null
	 */
	public function get_assignee_type( string $type ): ?array {
		$types = $this->get_assignee_types();
		return $types[ $type ] ?? null;
	}

	// =========================================================================
	// Assignment CRUD
	// =========================================================================

	/**
	 * Create an assignment.
	 *
	 * @param int    $post_id       Post ID.
	 * @param string $meta_key      Assignment slot key (e.g., 'legal_reviewer').
	 * @param mixed  $value         Assigned value (user ID, role slug, agent ID).
	 * @param string $assignee_type Type of assignee (user, role, agent).
	 * @param array  $config        Optional config from sequence input.
	 */
	public function assign( int $post_id, string $meta_key, $value, string $assignee_type, array $config = array() ): void {
		$storage_key = $this->get_storage_key( $meta_key );

		$assignment = array(
			'value'       => $value,
			'type'        => $assignee_type,
			'status'      => self::STATUS_PENDING,
			'assigned_at' => current_time( 'mysql' ),
			'assigned_by' => get_current_user_id(),
		);

		update_post_meta( $post_id, $storage_key, $assignment );

		$this->trigger_assign_actions( $post_id, $meta_key, $assignment, $config );

		/**
		 * Fires when an assignment is created.
		 *
		 * @param int    $post_id    Post ID.
		 * @param string $meta_key   Assignment slot key.
		 * @param array  $assignment Assignment data.
		 * @param array  $config     Sequence input config.
		 */
		do_action( 'vip_workflows_assignment_created', $post_id, $meta_key, $assignment, $config );
	}

	/**
	 * Get an assignment.
	 *
	 * @param  int    $post_id  Post ID.
	 * @param  string $meta_key Assignment slot key.
	 * @return array|null Assignment data or null if not found.
	 */
	public function get( int $post_id, string $meta_key ): ?array {
		$storage_key = $this->get_storage_key( $meta_key );
		$assignment  = get_post_meta( $post_id, $storage_key, true );

		return is_array( $assignment ) ? $assignment : null;
	}

	/**
	 * Get all assignments for a post.
	 *
	 * @param  int $post_id Post ID.
	 * @return array Array of assignments keyed by meta_key.
	 */
	public function get_all( int $post_id ): array {
		global $wpdb;

		$prefix  = '_vip_workflows_assignment_';
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key LIKE %s",
				$post_id,
				$wpdb->esc_like( $prefix ) . '%'
			)
		);

		$assignments = array();
		foreach ( $results as $row ) {
			$key  = str_replace( $prefix, '', $row->meta_key );
			$data = maybe_unserialize( $row->meta_value );
			if ( is_array( $data ) ) {
				$assignments[ $key ] = $data;
			}
		}

		return $assignments;
	}

	/**
	 * Mark an assignment as completed.
	 *
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Assignment slot key.
	 * @param array  $result   Optional result data from completion.
	 */
	public function mark_completed( int $post_id, string $meta_key, array $result = array() ): void {
		$assignment = $this->get( $post_id, $meta_key );
		if ( ! $assignment ) {
			return;
		}

		$assignment['status']       = self::STATUS_COMPLETED;
		$assignment['completed_at'] = current_time( 'mysql' );
		$assignment['completed_by'] = get_current_user_id();

		if ( ! empty( $result ) ) {
			$assignment['result'] = $result;
		}

		$storage_key = $this->get_storage_key( $meta_key );
		update_post_meta( $post_id, $storage_key, $assignment );

		/**
		 * Fires when an assignment is completed.
		 *
		 * @param int    $post_id    Post ID.
		 * @param string $meta_key   Assignment slot key.
		 * @param array  $assignment Updated assignment data.
		 */
		do_action( 'vip_workflows_assignment_completed', $post_id, $meta_key, $assignment );
	}

	/**
	 * Mark an assignment as expired (agent timeout).
	 *
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Assignment slot key.
	 * @param string $reason   Reason for expiration.
	 */
	public function mark_expired( int $post_id, string $meta_key, string $reason = '' ): void {
		$assignment = $this->get( $post_id, $meta_key );
		if ( ! $assignment ) {
			return;
		}

		$assignment['status']     = self::STATUS_EXPIRED;
		$assignment['expired_at'] = current_time( 'mysql' );
		$assignment['reason']     = $reason;

		$storage_key = $this->get_storage_key( $meta_key );
		update_post_meta( $post_id, $storage_key, $assignment );

		/**
		 * Fires when an assignment expires.
		 *
		 * @param int    $post_id    Post ID.
		 * @param string $meta_key   Assignment slot key.
		 * @param array  $assignment Updated assignment data.
		 */
		do_action( 'vip_workflows_assignment_expired', $post_id, $meta_key, $assignment );
	}

	// =========================================================================
	// Shared Helpers (used by StatusManager)
	// =========================================================================

	/**
	 * Process assignment input from a transition.
	 *
	 * Called by StatusManager::transition().
	 *
	 * @param int   $post_id    Post ID.
	 * @param array $transition Transition config from sequence.
	 * @param array $input_data User-provided input data.
	 */
	public function process_transition_input( int $post_id, array $transition, array $input_data ): void {
		$inputs = $transition['inputs'] ?? array();

		if ( ! is_array( $inputs ) ) {
			return;
		}

		// A transition captures a list, and at most one entry in it assigns work —
		// the cap Sequence::prepare_config_for_write() enforces, so the loop finds
		// one slot or none. Walked as a list rather than reached for by index
		// because an assignment is not required to lead the list: a stored note can
		// sit ahead of it, and the note's position is not this method's business.
		foreach ( $inputs as $input_config ) {
			if ( ! is_array( $input_config ) || 'assignment' !== ( $input_config['type'] ?? '' ) ) {
				continue;
			}

			$meta_key      = $input_config['meta_key'] ?? null;
			$assignee_type = $input_config['assignee_type'] ?? 'user';

			if ( ! $meta_key ) {
				continue;
			}

			$assigned_value = $input_data[ $meta_key ] ?? null;
			if ( ! $assigned_value ) {
				continue;
			}

			$this->assign( $post_id, $meta_key, $assigned_value, $assignee_type, $input_config );
		}
	}

	// =========================================================================
	// Private Helpers
	// =========================================================================

	/**
	 * Get the storage meta key for an assignment.
	 *
	 * @param  string $meta_key Assignment slot key.
	 * @return string Full meta key for storage.
	 */
	private function get_storage_key( string $meta_key ): string {
		return '_vip_workflows_assignment_' . sanitize_key( $meta_key );
	}

	/**
	 * Trigger actions when an assignment is created.
	 *
	 * @param int    $post_id    Post ID.
	 * @param string $meta_key   Assignment slot key.
	 * @param array  $assignment Assignment data.
	 * @param array  $config     Sequence input config.
	 */
	private function trigger_assign_actions( int $post_id, string $meta_key, array $assignment, array $config ): void {
		$on_assign = $config['on_assign'] ?? array();

		// Notifications.
		if ( ! empty( $on_assign['notify'] ) ) {
			/**
			 * Fires when an assignment needs notification.
			 *
			 * @param int    $post_id     Post ID.
			 * @param string $meta_key    Assignment slot key.
			 * @param array  $assignment  Assignment data.
			 * @param array  $notify_config Notification config.
			 */
			do_action( 'vip_workflows_assignment_notify', $post_id, $meta_key, $assignment, $on_assign['notify'] );
		}

		// Agent trigger.
		if ( 'agent' === $assignment['type'] ) {
			/**
			 * Fires when an agent is assigned (to queue the task).
			 *
			 * @param int    $post_id  Post ID.
			 * @param string $agent_id Agent ID.
			 * @param array  $config   Sequence input config.
			 */
			do_action( 'vip_workflows_agent_assigned', $post_id, $assignment['value'], $config );
		}

		// Custom type on_assign callback.
		$type_handler = $this->get_assignee_type( $assignment['type'] );
		if ( isset( $type_handler['on_assign'] ) && is_callable( $type_handler['on_assign'] ) ) {
			call_user_func( $type_handler['on_assign'], $post_id, $assignment['value'], $config );
		}
	}
}
