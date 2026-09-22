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

		// Preserve ordering when multiple assignments occur within one second.
		$assignment = array(
			'value'       => $value,
			'type'        => $assignee_type,
			'status'      => self::STATUS_PENDING,
			'assigned_at' => current_time( 'Y-m-d H:i:s.u' ),
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
	 * Clear an assignment slot.
	 *
	 * The caller decides whether the slot may be empty. Transitions validate
	 * required assignments before committing any changes.
	 *
	 * A no-op, not an error, when the slot was never assigned: this is
	 * "reach a state with nothing here", not "undo a specific assignment".
	 *
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Assignment slot key.
	 */
	public function unassign( int $post_id, string $meta_key ): void {
		$storage_key = $this->get_storage_key( $meta_key );
		$existing    = get_post_meta( $post_id, $storage_key, true );

		if ( ! is_array( $existing ) ) {
			return;
		}

		delete_post_meta( $post_id, $storage_key );

		/**
		 * Fires when an assignment is cleared.
		 *
		 * @param int    $post_id           Post ID.
		 * @param string $meta_key          Assignment slot key.
		 * @param array  $former_assignment The assignment that was in the slot before it was cleared.
		 */
		do_action( 'vip_workflows_assignment_removed', $post_id, $meta_key, $existing );
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
	 * The post's current assignment — whichever pending assignment, across
	 * every slot and every assignee type, was made most recently.
	 *
	 * A post can carry several assignment slots at once (one per transition
	 * that has asked for one), and only one deserves the "Assigned to"
	 * spotlight in the sidebar and the board. Picking "the first pending
	 * USER assignment found" — the previous rule — discarded every role or
	 * agent assignment outright and did not even track recency among users;
	 * a post with three assignments could show the oldest one forever.
	 *
	 * @param  int $post_id Post ID.
	 * @return array{meta_key: string, assignment: array}|null The slot key and its
	 *                      assignment, or null when nothing is pending.
	 */
	public function get_current( int $post_id ): ?array {
		$current = null;

		foreach ( $this->get_all( $post_id ) as $meta_key => $assignment ) {
			if ( self::STATUS_PENDING !== ( $assignment['status'] ?? null ) ) {
				continue;
			}

			$assigned_at = $assignment['assigned_at'] ?? '';
			if ( null === $current || $assigned_at > ( $current['assignment']['assigned_at'] ?? '' ) ) {
				$current = array(
					'meta_key'   => $meta_key,
					'assignment' => $assignment,
				);
			}
		}

		return $current;
	}

	/**
	 * Describe an assignment's stored value as the client-facing shape every
	 * route already serves an actor in.
	 *
	 * A user resolves through `Actor::from_user()` — the same shape a post's
	 * author or an event's actor gets. A role or an agent has no single
	 * person behind it, so each gets a parallel shape naming what it is
	 * rather than borrowing a person's. This is a display description of an
	 * assignment's target, not a claim about who acted — `Actor`'s own,
	 * narrower job, which is deliberately not asked to answer this.
	 *
	 * @param  string $assignee_type 'user', 'role', or 'agent'.
	 * @param  mixed  $value         The raw stored value.
	 * @return array|null The description, or null when it cannot be
	 *                     resolved (unknown type, deleted user, retired
	 *                     role/agent).
	 */
	public function describe_assignee( string $assignee_type, $value ): ?array {
		if ( 'user' === $assignee_type ) {
			return Actor::from_user( $value );
		}

		if ( 'role' === $assignee_type ) {
			$roles = wp_roles()->roles;
			if ( ! isset( $roles[ $value ]['name'] ) ) {
				return null;
			}

			return array(
				'id'           => 0,
				'type'         => 'role',
				'display_name' => translate_user_role( $roles[ $value ]['name'] ),
				'agent_actor'  => null,
				'avatar'       => null,
			);
		}

		if ( 'agent' === $assignee_type ) {
			$agents = ( new AgentRunner() )->get_registered_agents();
			if ( ! isset( $agents[ $value ] ) ) {
				return null;
			}

			return array(
				'id'           => 0,
				'type'         => 'agent',
				'display_name' => $agents[ $value ]['label'] ?? (string) $value,
				'agent_actor'  => (string) $value,
				'avatar'       => null,
			);
		}

		return null;
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
	 * Validate required assignment input before a transition has side effects.
	 *
	 * An existing assignment does not satisfy a required input: the caller must
	 * explicitly submit the assignee it wants to keep or select.
	 *
	 * @param  array $transition Transition config from sequence.
	 * @param  array $input_data User-provided input data.
	 * @return true|\WP_Error True when required assignments are supplied.
	 */
	public function validate_transition_input( array $transition, array $input_data ) {
		$inputs = $transition['inputs'] ?? array();

		if ( ! is_array( $inputs ) ) {
			return true;
		}

		foreach ( $inputs as $input_config ) {
			if ( ! is_array( $input_config ) || 'assignment' !== ( $input_config['type'] ?? '' ) || empty( $input_config['required'] ) ) {
				continue;
			}

			$meta_key = $input_config['meta_key'] ?? '';

			if ( empty( $input_data[ $meta_key ] ) ) {
				return new \WP_Error(
					'required_assignment_missing',
					sprintf(
						/* translators: %s: Assignment field label. */
						__( 'Choose an assignee for “%s” in the post editor before continuing.', 'vip-workflows' ),
						$input_config['label'] ?? $meta_key
					),
					array(
						'status'   => 422,
						'meta_key' => $meta_key,
					)
				);
			}
		}

		return true;
	}

	/**
	 * Process assignment input from a transition.
	 *
	 * Called by StatusManager::transition() after validate_transition_input().
	 *
	 * A slot's key ABSENT from `$input_data` is left untouched — the caller
	 * (a REST client, an ability, a revert) simply had nothing to say about
	 * it, most commonly because the transition carries no assignment input
	 * at all. A slot's key PRESENT but empty is an explicit instruction to
	 * clear it — the one way an optional assignment popover has to submit
	 * "no one" after a prior assignment, which `array_key_exists()` is what
	 * tells apart from "nothing submitted".
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

			if ( ! $meta_key || ! array_key_exists( $meta_key, $input_data ) ) {
				continue;
			}

			$assigned_value = $input_data[ $meta_key ];

			if ( ! $assigned_value ) {
				$this->unassign( $post_id, $meta_key );
				continue;
			}

			$this->assign( $post_id, $meta_key, $assigned_value, $assignee_type, $input_config );
		}
	}

	/**
	 * Validate supplied assignees before a transition changes any post state.
	 *
	 * StatusManager calls this before tools, publishing, and process_transition_input().
	 *
	 * Missing values and explicit empty selections are handled by the transition's
	 * required/optional input rules. Other values must identify a valid assignee.
	 *
	 * @param  array $transition Transition config from sequence.
	 * @param  array $input_data User-provided input data.
	 * @return true|\WP_Error True when all supplied assignees are valid.
	 */
	public function validate_transition_assignees( array $transition, array $input_data ) {
		$inputs = $transition['inputs'] ?? array();
		if ( ! is_array( $inputs ) ) {
			return true;
		}

		foreach ( $inputs as $input_config ) {
			if ( ! is_array( $input_config ) || 'assignment' !== ( $input_config['type'] ?? '' ) ) {
				continue;
			}

			$meta_key = $input_config['meta_key'] ?? null;
			if ( ! $meta_key || ! array_key_exists( $meta_key, $input_data ) ) {
				continue;
			}

			$value = $input_data[ $meta_key ];
			if ( null === $value || '' === $value ) {
				continue;
			}

			$assignee_type = $input_config['assignee_type'] ?? 'user';
			if ( $this->is_valid_assignee( $assignee_type, $value ) ) {
				continue;
			}

			switch ( $assignee_type ) {
				case 'user':
					/* translators: %s: Assignment field label. */
					$message = __( 'Choose an existing user for “%s” before continuing.', 'vip-workflows' );
					break;
				case 'role':
					/* translators: %s: Assignment field label. */
					$message = __( 'Choose a registered role for “%s” before continuing.', 'vip-workflows' );
					break;
				default:
					/* translators: %s: Assignment field label. */
					$message = __( 'Enter a valid assignee identifier for “%s” before continuing.', 'vip-workflows' );
			}

			return new \WP_Error(
				'invalid_assignee',
				sprintf( $message, $input_config['label'] ?? $meta_key ),
				array(
					'status'        => 422,
					'meta_key'      => $meta_key,
					'assignee_type' => $assignee_type,
				)
			);
		}

		return true;
	}

	// =========================================================================
	// Private Helpers
	// =========================================================================

	/**
	 * Whether an assignee value resolves to a real target for its type.
	 *
	 * @param  string $assignee_type Assignee type (user, role, agent, ...).
	 * @param  mixed  $value         Assignee value from the transition input.
	 * @return bool
	 */
	private function is_valid_assignee( string $assignee_type, $value ): bool {
		switch ( $assignee_type ) {
			case 'user':
				// Casting first would turn values such as "7invalid" into user 7.
				if ( ! ( is_int( $value ) || is_string( $value ) ) || ! preg_match( '/^[1-9][0-9]*$/D', (string) $value ) ) {
					return false;
				}
				$user_id = filter_var( $value, FILTER_VALIDATE_INT, array( 'options' => array( 'min_range' => 1 ) ) );
				return false !== $user_id && (bool) get_userdata( $user_id );
			case 'role':
				return is_string( $value ) && wp_roles()->is_role( $value );
			default:
				// Other types (e.g. agent) resolve through their registered
				// handler; require a non-empty string or integer identifier.
				return ( is_string( $value ) || is_int( $value ) ) && ! empty( $value ) && '' !== trim( (string) $value );
		}
	}

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
