<?php
/**
 * Assignment Manager - handles workflow assignments.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

/**
 * Manages assignment storage, validation, and lifecycle.
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
				'validate'    => array( $this, 'validate_user_assignment' ),
			),
			'role'  => array(
				'label'       => __( 'Role', 'vip-workflows' ),
				'description' => __( 'Assign to anyone with a specific role', 'vip-workflows' ),
				'storage'     => 'role_slug',
				'validate'    => array( $this, 'validate_role_assignment' ),
			),
			'agent' => array(
				'label'       => __( 'Agent', 'vip-workflows' ),
				'description' => __( 'Assign to an automated agent/bot', 'vip-workflows' ),
				'storage'     => 'agent_id',
				'validate'    => array( $this, 'validate_agent_assignment' ),
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
	// Validation
	// =========================================================================

	/**
	 * Check if a user satisfies an assignment requirement.
	 *
	 * @param  int   $post_id     Post ID.
	 * @param  int   $user_id     User ID to check.
	 * @param  array $requirement Normalized requirement with meta_key and match.
	 * @return bool
	 */
	public function user_satisfies_requirement( int $post_id, int $user_id, array $requirement ): bool {
		$meta_key   = $requirement['meta_key'] ?? '';
		$match_mode = $requirement['match'] ?? 'current_user';

		$assignment = $this->get( $post_id, $meta_key );
		if ( ! $assignment ) {
			return false;
		}

		// For 'completed' match mode (used by agents), check status only.
		if ( 'completed' === $match_mode ) {
			return self::STATUS_COMPLETED === ( $assignment['status'] ?? '' );
		}

		// Only pending assignments can block/satisfy transitions.
		if ( self::STATUS_PENDING !== ( $assignment['status'] ?? '' ) ) {
			return false;
		}

		// Delegate to type-specific validator.
		$type_handler = $this->get_assignee_type( $assignment['type'] );
		if ( isset( $type_handler['validate'] ) && is_callable( $type_handler['validate'] ) ) {
			return call_user_func( $type_handler['validate'], $assignment['value'], $user_id, $match_mode );
		}

		return false;
	}

	/**
	 * Validate user assignment.
	 *
	 * @param  int|string $assigned_user_id Assigned user ID.
	 * @param  int        $current_user_id  Current user ID.
	 * @param  string     $match_mode       Match mode.
	 * @return bool
	 */
	public function validate_user_assignment( $assigned_user_id, int $current_user_id, string $match_mode ): bool {
		if ( 'current_user' === $match_mode ) {
			return (int) $assigned_user_id === $current_user_id;
		}
		return false;
	}

	/**
	 * Validate role assignment.
	 *
	 * @param  string $assigned_role   Assigned role slug.
	 * @param  int    $current_user_id Current user ID.
	 * @param  string $match_mode      Match mode.
	 * @return bool
	 */
	public function validate_role_assignment( $assigned_role, int $current_user_id, string $match_mode ): bool {
		if ( 'current_user_role' === $match_mode || 'current_user' === $match_mode ) {
			$user = get_userdata( $current_user_id );
			return $user && in_array( $assigned_role, $user->roles, true );
		}
		return false;
	}

	/**
	 * Validate agent assignment.
	 *
	 * Agents don't validate by user - they validate by task completion status.
	 *
	 * @param  string $agent_id   Agent ID.
	 * @param  int    $user_id    User ID (unused for agents).
	 * @param  string $match_mode Match mode.
	 * @return bool
	 */
	public function validate_agent_assignment( $agent_id, int $user_id, string $match_mode ): bool {
		// Agent validation is status-based (checked via 'completed' match mode).
		return false;
	}

	// =========================================================================
	// Shared Helpers (used by StatusManager)
	// =========================================================================

	/**
	 * Normalize requires_assignment config to array format.
	 *
	 * Allows shorthand: "legal_reviewer" → { meta_key: "legal_reviewer", match: "current_user" }
	 *
	 * @param  string|array $requirement The requires_assignment config.
	 * @return array Normalized requirement with meta_key and match.
	 */
	public function normalize_requirement( $requirement ): array {
		if ( is_string( $requirement ) ) {
			return array(
				'meta_key' => $requirement,
				'match'    => 'current_user',
			);
		}
		return $requirement;
	}

	/**
	 * Get user-friendly error message for assignment failure.
	 *
	 * @param  int   $post_id     Post ID.
	 * @param  array $requirement Normalized requirement.
	 * @return string Error message.
	 */
	public function get_error_message( int $post_id, array $requirement ): string {
		$assignment = $this->get( $post_id, $requirement['meta_key'] );

		if ( ! $assignment ) {
			return __( 'This transition requires an assignment that has not been made.', 'vip-workflows' );
		}

		if ( self::STATUS_COMPLETED === ( $assignment['status'] ?? '' ) ) {
			return __( 'This assignment has already been completed.', 'vip-workflows' );
		}

		if ( 'user' === $assignment['type'] ) {
			$user = get_userdata( $assignment['value'] );
			$name = $user ? $user->display_name : __( 'Unknown user', 'vip-workflows' );
			return sprintf(
			/* translators: %s: user name */
				__( 'This transition can only be performed by %s.', 'vip-workflows' ),
				$name
			);
		}

		if ( 'role' === $assignment['type'] ) {
			return sprintf(
			/* translators: %s: role name */
				__( 'This transition requires the %s role.', 'vip-workflows' ),
				$assignment['value']
			);
		}

		if ( 'agent' === $assignment['type'] ) {
			return __( 'This transition is waiting for an automated check to complete.', 'vip-workflows' );
		}

		return __( 'You do not have permission to perform this transition.', 'vip-workflows' );
	}

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
		// because an assignment is not required to lead the list: an author can put
		// a note ahead of it, and the note's position is not this method's business.
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

	/**
	 * Get lock reason for UI display.
	 *
	 * Shorter than get_error_message() - used for transition button tooltips.
	 *
	 * @param  int   $post_id     Post ID.
	 * @param  array $requirement Normalized requirement.
	 * @return string Short lock reason.
	 */
	public function get_lock_reason( int $post_id, array $requirement ): string {
		$assignment = $this->get( $post_id, $requirement['meta_key'] );

		if ( ! $assignment ) {
			return __( 'No assignee', 'vip-workflows' );
		}

		if ( 'user' === $assignment['type'] ) {
			$user = get_userdata( $assignment['value'] );
			return sprintf(
			/* translators: %s: user name */
				__( 'Assigned to %s', 'vip-workflows' ),
				$user ? $user->display_name : '?'
			);
		}

		if ( 'agent' === $assignment['type'] ) {
			$status = $assignment['status'] ?? 'pending';
			if ( self::STATUS_PENDING === $status ) {
				return __( 'Waiting for automated check', 'vip-workflows' );
			}
			if ( self::STATUS_EXPIRED === $status ) {
				return __( 'Automated check timed out', 'vip-workflows' );
			}
		}

		if ( 'role' === $assignment['type'] ) {
			return sprintf(
			/* translators: %s: role name */
				__( 'Requires %s role', 'vip-workflows' ),
				$assignment['value']
			);
		}

		return __( 'Assignment required', 'vip-workflows' );
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
