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
	 * Most members of a role checked for read access to an assigned post.
	 */
	public const ROLE_ACCESS_CHECK_LIMIT = 200;

	/**
	 * The most post IDs get_current_for_posts() puts in one query's IN list.
	 *
	 * A longer list is read in several queries, so a large page of posts
	 * never builds a statement past the server's packet size limit.
	 */
	public const CURRENT_FOR_POSTS_CHUNK = 500;

	/**
	 * Post meta naming each user a post has a pending user assignment for, one
	 * row per user.
	 *
	 * Assignments are stored as serialized arrays, so "which posts is this user
	 * assigned to" cannot be asked of them in SQL: answering it meant reading
	 * every assignment on the site and unserializing each one. This index is a
	 * plain value per row, so it is one indexed lookup. It is derived data:
	 * sync_pending_assignee_index() rebuilds a post's rows from its slots after
	 * every write, and the slots stay the record.
	 */
	public const PENDING_ASSIGNEE_INDEX_KEY = '_vip_workflows_pending_assignee';

	/**
	 * Prefix of every assignment slot's meta key.
	 */
	public const STORAGE_PREFIX = '_vip_workflows_assignment_';

	/**
	 * How many times a rebuild of the pending-assignee index rewrites a post
	 * whose rows a concurrent request keeps changing, before it logs.
	 */
	public const INDEX_SETTLE_ATTEMPTS = 5;

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
		$assignment = $this->build_assignment( $value, $assignee_type );

		update_post_meta( $post_id, $this->get_storage_key( $meta_key ), $assignment );

		$this->announce_assignment( $post_id, $meta_key, $assignment, $config );
	}

	/**
	 * The stored shape of a new, pending assignment.
	 *
	 * @param  mixed  $value         Assigned value (user ID, role slug, agent ID).
	 * @param  string $assignee_type Type of assignee (user, role, agent).
	 * @return array
	 */
	private function build_assignment( $value, string $assignee_type ): array {
		// Preserve ordering when multiple assignments occur within one second.
		return array(
			'value'       => $value,
			'type'        => $assignee_type,
			'status'      => self::STATUS_PENDING,
			'assigned_at' => current_time( 'Y-m-d H:i:s.u' ),
			'assigned_by' => get_current_user_id(),
		);
	}

	/**
	 * Run the side effects of a stored assignment: its on_assign actions and
	 * the created hook.
	 *
	 * @param int    $post_id    Post ID.
	 * @param string $meta_key   Assignment slot key.
	 * @param array  $assignment Assignment data as stored.
	 * @param array  $config     Sequence input config.
	 */
	private function announce_assignment( int $post_id, string $meta_key, array $assignment, array $config ): void {
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

		$this->announce_unassignment( $post_id, $meta_key, $existing );
	}

	/**
	 * Fire the removed hook for a cleared slot.
	 *
	 * @param int    $post_id  Post ID.
	 * @param string $meta_key Assignment slot key.
	 * @param array  $existing The assignment the slot held.
	 */
	private function announce_unassignment( int $post_id, string $meta_key, array $existing ): void {
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
		$prefix  = self::STORAGE_PREFIX;
		$results = array();
		// get_post_meta() answers false, not an array, for a post ID of 0.
		foreach ( (array) get_post_meta( $post_id ) as $meta_key => $values ) {
			if ( ! str_starts_with( (string) $meta_key, $prefix ) ) {
				continue;
			}
			foreach ( (array) $values as $meta_value ) {
				$row             = new \stdClass();
				$row->meta_key   = $meta_key;
				$row->meta_value = $meta_value;
				$results[]       = $row;
			}
		}

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
		return $this->pick_current( $this->get_all( $post_id ) );
	}

	/**
	 * The current assignment of each of many posts, read in one query per
	 * CURRENT_FOR_POSTS_CHUNK posts.
	 *
	 * The same rule as get_current(), for a list that would otherwise run one
	 * query per post.
	 *
	 * A chunk whose query fails fails the whole read. Treating its posts as
	 * having nothing pending would report every one of them unassigned.
	 *
	 * @param  int[] $post_ids Post IDs.
	 * @return array<int, array{meta_key: string, assignment: array}|null>|\WP_Error Each
	 *               post's current assignment, keyed by post ID, where a post with
	 *               nothing pending maps to null; or a 500 when any chunk's query fails.
	 */
	public function get_current_for_posts( array $post_ids ) {
		global $wpdb;

		$post_ids = array_values( array_unique( array_map( 'intval', $post_ids ) ) );
		if ( ! $post_ids ) {
			return array();
		}

		$prefix  = self::STORAGE_PREFIX;
		$by_post = array_fill_keys( $post_ids, array() );

		foreach ( array_chunk( $post_ids, self::CURRENT_FOR_POSTS_CHUNK ) as $chunk ) {
			$placeholders = implode( ', ', array_fill( 0, count( $chunk ), '%d' ) );

			// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- Same uncached read as get_all(), for many posts; $placeholders holds only %d tokens.
			$results = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT post_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id IN ( {$placeholders} ) AND meta_key LIKE %s",
					array_merge( $chunk, array( $wpdb->esc_like( $prefix ) . '%' ) )
				)
			);
			// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare

			if ( null === $results || '' !== $wpdb->last_error ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( '[VIP Workflows] Current assignments could not be read: assignment_read_failed' );
				return new \WP_Error(
					'assignment_read_failed',
					__( 'Assignments could not be read.', 'vip-workflows' ),
					array( 'status' => 500 )
				);
			}

			foreach ( $results as $row ) {
				$key  = str_replace( $prefix, '', $row->meta_key );
				$data = maybe_unserialize( $row->meta_value );
				if ( is_array( $data ) ) {
					$by_post[ (int) $row->post_id ][ $key ] = $data;
				}
			}
		}

		return array_map( array( $this, 'pick_current' ), $by_post );
	}

	/**
	 * The most recently made pending assignment among a post's slots.
	 *
	 * @param  array $assignments Assignments keyed by slot key, as get_all() returns them.
	 * @return array{meta_key: string, assignment: array}|null The slot key and its
	 *                      assignment, or null when nothing is pending.
	 */
	private function pick_current( array $assignments ): ?array {
		$current = null;

		foreach ( $assignments as $meta_key => $assignment ) {
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

	/**
	 * Complete the person-facing assignments of the stage a post is leaving.
	 *
	 * A transition's user or role assignment names who works the stage that
	 * transition leads into, so it is done once the post moves on. Callers run
	 * this on every stage change, forward or backward, before the moving
	 * transition captures its own assignment. The one exception is a
	 * failed-agent revert: StatusManager skips this call for it, so the
	 * assignments survive the agent run that failed.
	 *
	 * Agent slots are left alone: AgentRunner completes or expires those when
	 * the agent finishes.
	 *
	 * @param int $post_id Post ID.
	 */
	public function complete_on_stage_exit( int $post_id ): void {
		$this->complete_pending_person_slots( $post_id, $this->get_all( $post_id ) );
	}

	/**
	 * Complete the named slots, for a stage the post left while they were
	 * being written.
	 *
	 * StatusManager::transition() calls this when a concurrent transition
	 * moved the post on between its stage write and its assignment write. The
	 * assignment belongs to a stage the post is no longer in, so it is done
	 * for the same reason complete_on_stage_exit() completes one. Only the
	 * named slots are touched: the transition that moved the post on may have
	 * written its own assignment for the stage it entered.
	 *
	 * @param int      $post_id   Post ID.
	 * @param string[] $meta_keys Assignment slot keys the transition wrote.
	 */
	public function complete_slots_for_left_stage( int $post_id, array $meta_keys ): void {
		$assignments = array();
		foreach ( $meta_keys as $meta_key ) {
			$assignment = $this->get( $post_id, $meta_key );
			if ( $assignment ) {
				$assignments[ $meta_key ] = $assignment;
			}
		}

		$this->complete_pending_person_slots( $post_id, $assignments );
	}

	/**
	 * Complete every pending user or role assignment in a set of slots.
	 *
	 * @param int   $post_id     Post ID.
	 * @param array $assignments Assignments keyed by slot key.
	 */
	private function complete_pending_person_slots( int $post_id, array $assignments ): void {
		foreach ( $assignments as $meta_key => $assignment ) {
			if ( self::STATUS_PENDING !== ( $assignment['status'] ?? null ) ) {
				continue;
			}

			if ( ! in_array( $assignment['type'] ?? null, array( 'user', 'role' ), true ) ) {
				continue;
			}

			$this->mark_completed( $post_id, (string) $meta_key );
		}
	}

	// =========================================================================
	// Transition input (used by StatusManager::transition())
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
	 * Reject input keys a transition does not declare.
	 *
	 * `input_data` arrives as a free-form map, and StatusManager stores it in
	 * transition meta and writes every key into the audit log as a labelled
	 * note. Only the transition's assignment input is collected, so only its
	 * keys are accepted: the assignee under `meta_key`, the optional
	 * `{meta_key}_notes`, and the `__name` label of each. Any other key, such
	 * as a retired free-text note or a key the transition never declared,
	 * fails the transition with a 400 naming the key, so a client learns
	 * that its data was not saved instead of losing it.
	 *
	 * @param  array|null $transition Transition config from sequence, or null when no authored edge applies.
	 * @param  array      $input_data User-provided input data.
	 * @return true|\WP_Error True when every key is declared, or a 400 naming the first undeclared key.
	 */
	public function check_transition_input_keys( ?array $transition, array $input_data ) {
		$allowed = array_flip( $this->get_declared_input_keys( $transition ) );

		foreach ( array_keys( $input_data ) as $key ) {
			if ( isset( $allowed[ $key ] ) ) {
				continue;
			}

			return new \WP_Error(
				'unknown_transition_input',
				sprintf(
					/* translators: %s: Input key submitted with the transition. */
					__( 'This transition doesn’t accept the “%s” input.', 'vip-workflows' ),
					(string) $key
				),
				array(
					'status' => 400,
					'key'    => (string) $key,
				)
			);
		}

		return true;
	}

	/**
	 * The input keys a transition declares.
	 *
	 * @param  array|null $transition Transition config from sequence, or null when no authored edge applies.
	 * @return string[] The assignee key, its notes key, and the `__name` label of each, for every assignment input.
	 */
	private function get_declared_input_keys( ?array $transition ): array {
		$inputs = $transition['inputs'] ?? array();

		if ( ! is_array( $inputs ) ) {
			return array();
		}

		$allowed = array();
		foreach ( $inputs as $input_config ) {
			if ( ! is_array( $input_config ) || 'assignment' !== ( $input_config['type'] ?? '' ) ) {
				continue;
			}

			$meta_key = $input_config['meta_key'] ?? '';
			if ( ! is_string( $meta_key ) || '' === $meta_key ) {
				continue;
			}

			$allowed[] = $meta_key;
			$allowed[] = $meta_key . '__name';
			$allowed[] = $meta_key . '_notes';
			$allowed[] = $meta_key . '_notes__name';
		}

		return $allowed;
	}

	/**
	 * The slots a transition's input will write, as they stand now.
	 *
	 * StatusManager::transition() reads this when it validates a self-edge and
	 * hands it back to process_transition_input(), which writes each slot only
	 * if it still holds the value read here.
	 *
	 * @param  int   $post_id    Post ID.
	 * @param  array $transition Transition config from sequence.
	 * @param  array $input_data User-provided input data.
	 * @return array<string, array|null> Each slot's assignment keyed by slot key,
	 *                                   null for a slot that holds none.
	 */
	public function get_transition_slots( int $post_id, array $transition, array $input_data ): array {
		$slots = array();

		foreach ( $this->get_written_inputs( $transition, $input_data ) as $meta_key => $input_config ) {
			$slots[ $meta_key ] = $this->get( $post_id, $meta_key );
		}

		return $slots;
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
	 * With `$expected`, every write is a compare-and-set: a slot is written
	 * only if it still holds what get_transition_slots() read. A slot that
	 * changed in between was written by a concurrent transition, so this
	 * one returns a 409 instead of overwriting it, and writes nothing.
	 * A transition assigns at most one slot (the cap
	 * Sequence::prepare_config_for_write() enforces), so a refusal leaves no
	 * other slot half-written.
	 *
	 * @param  int        $post_id    Post ID.
	 * @param  array      $transition Transition config from sequence.
	 * @param  array      $input_data User-provided input data.
	 * @param  array|null $expected   Slots as get_transition_slots() read them, or null to write unconditionally.
	 * @return string[]|\WP_Error The slot keys this call assigned (not the ones it cleared),
	 *                            or a 409 when a slot changed after `$expected` was read.
	 * @throws \LogicException When `$expected` has no entry for a slot the input writes.
	 */
	public function process_transition_input( int $post_id, array $transition, array $input_data, ?array $expected = null ) {
		$assigned = array();

		// A transition captures a list holding at most one assignment and nothing
		// else — the rules Sequence::prepare_config_for_write() enforces — so the
		// loop finds one slot or none.
		foreach ( $this->get_written_inputs( $transition, $input_data ) as $meta_key => $input_config ) {
			$assignee_type  = $input_config['assignee_type'] ?? 'user';
			$assigned_value = $input_data[ $meta_key ];

			if ( null === $expected ) {
				if ( ! $assigned_value ) {
					$this->unassign( $post_id, $meta_key );
					continue;
				}

				$this->assign( $post_id, $meta_key, $assigned_value, $assignee_type, $input_config );
				$assigned[] = $meta_key;
				continue;
			}

			if ( ! array_key_exists( $meta_key, $expected ) ) {
				throw new \LogicException( sprintf( 'No expected value was read for assignment slot "%s".', esc_html( $meta_key ) ) );
			}

			$previous   = $expected[ $meta_key ];
			$assignment = $assigned_value ? $this->build_assignment( $assigned_value, $assignee_type ) : null;
			$written    = $this->compare_and_set( $post_id, $this->get_storage_key( $meta_key ), $previous, $assignment );

			if ( true !== $written ) {
				return $this->slot_write_error( $written, $meta_key, $input_config );
			}

			if ( null === $assignment ) {
				if ( null !== $previous ) {
					$this->announce_unassignment( $post_id, $meta_key, $previous );
				}
				continue;
			}

			$this->announce_assignment( $post_id, $meta_key, $assignment, $input_config );
			$assigned[] = $meta_key;
		}

		return $assigned;
	}

	/**
	 * The assignment inputs of a transition that its input data writes,
	 * keyed by slot key.
	 *
	 * @param  array $transition Transition config from sequence.
	 * @param  array $input_data User-provided input data.
	 * @return array<string, array> Input configs keyed by slot key.
	 */
	private function get_written_inputs( array $transition, array $input_data ): array {
		$inputs  = $transition['inputs'] ?? array();
		$written = array();

		if ( ! is_array( $inputs ) ) {
			return $written;
		}

		foreach ( $inputs as $input_config ) {
			if ( ! is_array( $input_config ) || 'assignment' !== ( $input_config['type'] ?? '' ) ) {
				continue;
			}

			$meta_key = $input_config['meta_key'] ?? null;
			if ( ! $meta_key || ! array_key_exists( $meta_key, $input_data ) ) {
				continue;
			}

			$written[ (string) $meta_key ] = $input_config;
		}

		return $written;
	}

	/**
	 * Write a slot only if it still holds the expected assignment.
	 *
	 * The UPDATE and DELETE carry the expected serialized value in their
	 * WHERE clause, the same conditional write update_post_meta() makes with
	 * a `$prev_value`. They are issued directly because update_post_meta()
	 * falls back to an unconditional insert when the row is gone, and
	 * delete_post_meta() deletes by the IDs it selected first. The new value
	 * is unslashed and serialized exactly as update_post_meta() stores it.
	 *
	 * A slot that held nothing is filled through add_post_meta() with
	 * `$unique`. That check is a read before the insert, so two writers can
	 * both pass it. The older row wins: a writer whose row is not the first
	 * for the slot deletes it and loses.
	 *
	 * @param  int        $post_id     Post ID.
	 * @param  string     $storage_key Full meta key of the slot.
	 * @param  array|null $expected    What the slot must hold, null for nothing.
	 * @param  array|null $assignment  What to write, null to clear the slot.
	 * @return true|string True when written, 'assignment_conflict' when the slot
	 *                     changed, or 'assignment_write_failed' on a database error.
	 */
	private function compare_and_set( int $post_id, string $storage_key, ?array $expected, ?array $assignment ) {
		global $wpdb;

		if ( null === $expected ) {
			if ( null === $assignment ) {
				// Clearing a slot that held nothing writes nothing. It only has to
				// be still empty.
				wp_cache_delete( $post_id, 'post_meta' );
				return is_array( get_post_meta( $post_id, $storage_key, true ) ) ? 'assignment_conflict' : true;
			}

			$meta_id = add_post_meta( $post_id, $storage_key, $assignment, true );
			if ( ! $meta_id ) {
				// Refused either because the slot is filled now, or by the database.
				wp_cache_delete( $post_id, 'post_meta' );
				return is_array( get_post_meta( $post_id, $storage_key, true ) ) ? 'assignment_conflict' : 'assignment_write_failed';
			}

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Must see a row another request inserted just now.
			$first_id = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT MIN(meta_id) FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = %s",
					$post_id,
					$storage_key
				)
			);

			if ( $first_id !== (int) $meta_id ) {
				delete_metadata_by_mid( 'post', (int) $meta_id );
				return 'assignment_conflict';
			}

			return true;
		}

		$where = array(
			'post_id'    => $post_id,
			'meta_key'   => $storage_key, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- One post's row, by post_id.
			'meta_value' => maybe_serialize( $expected ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- The compare half of the compare-and-set.
		);

		if ( null === $assignment ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Conditional delete; the post meta cache is cleared below.
			$rows = $wpdb->delete( $wpdb->postmeta, $where );
		} else {
			$rows = $wpdb->update( $wpdb->postmeta, array( 'meta_value' => maybe_serialize( wp_unslash( $assignment ) ) ), $where ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.SlowDBQuery.slow_db_query_meta_value -- Conditional update of the value written; the post meta cache is cleared below.
		}

		wp_cache_delete( $post_id, 'post_meta' );

		if ( false === $rows ) {
			return 'assignment_write_failed';
		}

		return $rows > 0 ? true : 'assignment_conflict';
	}

	/**
	 * The error a refused slot write returns.
	 *
	 * @param  string $code         'assignment_conflict' or 'assignment_write_failed'.
	 * @param  string $meta_key     Assignment slot key.
	 * @param  array  $input_config The slot's input config.
	 * @return \WP_Error
	 */
	private function slot_write_error( string $code, string $meta_key, array $input_config ): \WP_Error {
		$label = $input_config['label'] ?? $meta_key;

		if ( 'assignment_conflict' === $code ) {
			return new \WP_Error(
				'assignment_conflict',
				sprintf(
					/* translators: %s: Assignment field label. */
					__( 'Someone else changed “%s” while your change was being applied. Reload and try again.', 'vip-workflows' ),
					$label
				),
				array(
					'status'   => 409,
					'meta_key' => $meta_key,
				)
			);
		}

		return new \WP_Error(
			'assignment_write_failed',
			sprintf(
				/* translators: %s: Assignment field label. */
				__( '“%s” could not be saved.', 'vip-workflows' ),
				$label
			),
			array(
				'status'   => 500,
				'meta_key' => $meta_key,
			)
		);
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

	/**
	 * Refuse a user assignee who cannot read the post once it has moved.
	 *
	 * My Work lists an assigned post only for an assignee who passes
	 * `read_post` on it, so an assignment to someone who cannot open the post
	 * would never reach them. Refusing it here tells the assigner while they
	 * can still choose someone else.
	 *
	 * StatusManager calls this with validate_transition_assignees(), before
	 * any post state changes. The assignment lives on the post after the move,
	 * so access is judged against $status_after, the core status the post
	 * will hold once the transition commits: a move into `publish` can open
	 * the post to an assignee who cannot read the draft, and a move out of it
	 * can close the post to one who reads it now.
	 *
	 * Role assignees are not refused: the members of a role can change after
	 * the assignment is made. get_assignee_access_warnings() reports them.
	 *
	 * @param  int    $post_id      Post ID.
	 * @param  array  $transition   Transition config from sequence.
	 * @param  array  $input_data   User-provided input data.
	 * @param  string $status_after Core status the post will hold after the transition.
	 * @return true|\WP_Error True when every supplied user assignee can read the post.
	 */
	public function validate_assignee_access( int $post_id, array $transition, array $input_data, string $status_after ) {
		$user_assignees = array_filter(
			$this->get_supplied_assignees( $transition, $input_data ),
			static fn( $assignee ) => 'user' === $assignee['type']
		);
		if ( empty( $user_assignees ) ) {
			return true;
		}

		$current_status = (string) get_post_status( $post_id );
		if ( $status_after !== $current_status && ! get_post_status_object( $status_after ) ) {
			return new \WP_Error(
				'assignee_access_unresolved',
				sprintf(
					/* translators: %s: Post status slug. */
					__( 'Can’t check who may open this post after the move: the status “%s” is not registered.', 'vip-workflows' ),
					$status_after
				),
				array(
					'status'      => 409,
					'post_status' => $status_after,
				)
			);
		}

		foreach ( $user_assignees as $assignee ) {
			$user_id = (int) $assignee['value'];
			if ( $this->user_can_read_post_as( $user_id, $post_id, $status_after, $current_status ) ) {
				continue;
			}

			$user = get_userdata( $user_id );

			return new \WP_Error(
				'assignee_cannot_read',
				sprintf(
					/* translators: %s: Display name of the chosen assignee. */
					__( '%s can’t open this post, so they can’t be assigned to it.', 'vip-workflows' ),
					$user ? $user->display_name : (string) $user_id
				),
				array(
					'status'        => 400,
					'meta_key'      => $assignee['meta_key'],
					'assignee_type' => 'user',
					'user_id'       => $user_id,
				)
			);
		}

		return true;
	}

	/**
	 * Describe role assignees whose members cannot all read the post.
	 *
	 * A role assignment is never refused for access; this flags it instead.
	 * Call it after the transition commits, so access is judged against the
	 * post's final status.
	 *
	 * At most ROLE_ACCESS_CHECK_LIMIT members are checked per role. A role
	 * with no members is judged by the capabilities the role itself grants.
	 *
	 * @param  int   $post_id    Post ID.
	 * @param  array $transition Transition config from sequence.
	 * @param  array $input_data User-provided input data.
	 * @return array[] Warnings, each with `type`, `meta_key`, `role` and `message`.
	 */
	public function get_assignee_access_warnings( int $post_id, array $transition, array $input_data ): array {
		$warnings = array();

		foreach ( $this->get_supplied_assignees( $transition, $input_data ) as $assignee ) {
			if ( 'role' !== $assignee['type'] || ! is_string( $assignee['value'] ) ) {
				continue;
			}

			$role_slug = $assignee['value'];
			$role      = get_role( $role_slug );
			if ( ! $role ) {
				continue;
			}

			$member_ids = get_users(
				array(
					'role'   => $role_slug,
					'fields' => 'ID',
					'number' => self::ROLE_ACCESS_CHECK_LIMIT,
				)
			);

			if ( empty( $member_ids ) ) {
				$readable_count = $this->role_can_read_post( $role, $post_id ) ? 1 : 0;
				$checked_count  = 1;
			} else {
				$checked_count  = count( $member_ids );
				$readable_count = count(
					array_filter(
						$member_ids,
						static fn( $member_id ) => user_can( (int) $member_id, 'read_post', $post_id )
					)
				);
			}

			if ( $readable_count === $checked_count ) {
				continue;
			}

			$role_names = wp_roles()->get_names();
			$role_name  = isset( $role_names[ $role_slug ] ) ? translate_user_role( $role_names[ $role_slug ] ) : $role_slug;

			$message = 0 === $readable_count
				/* translators: %s: Role name. */
				? __( 'No one with the %s role can open this post, so the assignment won’t appear in anyone’s My Work.', 'vip-workflows' )
				/* translators: %s: Role name. */
				: __( 'Some people with the %s role can’t open this post, so the assignment won’t appear in their My Work.', 'vip-workflows' );

			$warnings[] = array(
				'type'     => 'assignee_cannot_read',
				'meta_key' => $assignee['meta_key'],
				'role'     => $role_slug,
				'message'  => sprintf( $message, $role_name ),
			);
		}

		return $warnings;
	}

	// =========================================================================
	// Private Helpers
	// =========================================================================

	/**
	 * Assignees a transition's input names, one per assignment slot.
	 *
	 * Slots absent from the input or submitted empty are skipped: they assign
	 * no one.
	 *
	 * @param  array $transition Transition config from sequence.
	 * @param  array $input_data User-provided input data.
	 * @return array[] Each with `meta_key`, `type` and `value`.
	 */
	private function get_supplied_assignees( array $transition, array $input_data ): array {
		$inputs = $transition['inputs'] ?? array();
		if ( ! is_array( $inputs ) ) {
			return array();
		}

		$assignees = array();
		foreach ( $inputs as $input_config ) {
			if ( ! is_array( $input_config ) || 'assignment' !== ( $input_config['type'] ?? '' ) ) {
				continue;
			}

			$meta_key = $input_config['meta_key'] ?? null;
			if ( ! $meta_key || ! array_key_exists( $meta_key, $input_data ) ) {
				continue;
			}

			$value = $input_data[ $meta_key ];
			// The same test process_transition_input() uses to clear a slot.
			if ( ! $value ) {
				continue;
			}

			$assignees[] = array(
				'meta_key' => $meta_key,
				'type'     => $input_config['assignee_type'] ?? 'user',
				'value'    => $value,
			);
		}

		return $assignees;
	}

	/**
	 * Whether a user could read the post if it held $status.
	 *
	 * Nothing is written. For the length of one user_can() call, two filters
	 * scoped to this post make core's `read_post` mapping see $status:
	 *
	 * - `get_post_status`: map_meta_cap( 'read_post' ) reads the status
	 *   through get_post_status() to decide between public (`read`), the
	 *   author (`read`), private (`read_private_posts`) and everything else.
	 * - `map_meta_cap`: for everything else it maps through `edit_post`,
	 *   which reads `$post->post_status` directly and adds
	 *   `edit_published_posts` (publish, future) or `edit_private_posts`
	 *   (private) for a non-author. That one status-dependent capability is
	 *   swapped for the one $status would add. It runs first, so later
	 *   map_meta_cap filters see core's mapping for $status.
	 *
	 * Both use the post type's own capability names, so custom capabilities
	 * are honoured. A post type without map_meta_cap maps `read_post` to a
	 * single capability that does not depend on status.
	 *
	 * @param  int    $user_id        User ID.
	 * @param  int    $post_id        Post ID.
	 * @param  string $status         Status to judge access against.
	 * @param  string $current_status Status the post holds now.
	 * @return bool
	 */
	private function user_can_read_post_as( int $user_id, int $post_id, string $status, string $current_status ): bool {
		if ( $status === $current_status ) {
			return user_can( $user_id, 'read_post', $post_id );
		}

		$as_status = static function ( $post_status, $post ) use ( $post_id, $status ) {
			return ( $post instanceof \WP_Post && $post_id === (int) $post->ID ) ? $status : $post_status;
		};

		$edit_caps_as_status = static function ( $caps, $cap, $cap_user_id, $args ) use ( $post_id, $status ) {
			if ( 'edit_post' !== $cap || ! isset( $args[0] ) || $post_id !== (int) $args[0] ) {
				return $caps;
			}

			$post      = get_post( $post_id );
			$post_type = $post ? get_post_type_object( $post->post_type ) : null;
			if ( ! $post_type || ! $post_type->map_meta_cap || ( $post->post_author && (int) $cap_user_id === (int) $post->post_author ) ) {
				return $caps;
			}

			$status_cap = static function ( string $post_status ) use ( $post_type ): ?string {
				if ( in_array( $post_status, array( 'publish', 'future' ), true ) ) {
					return $post_type->cap->edit_published_posts;
				}

				return 'private' === $post_status ? $post_type->cap->edit_private_posts : null;
			};

			$stored_cap = $status_cap( (string) $post->post_status );
			$target_cap = $status_cap( $status );
			if ( $stored_cap === $target_cap ) {
				return $caps;
			}

			if ( null !== $stored_cap ) {
				$index = array_search( $stored_cap, $caps, true );
				if ( false !== $index ) {
					unset( $caps[ $index ] );
				}
			}
			if ( null !== $target_cap ) {
				$caps[] = $target_cap;
			}

			return array_values( $caps );
		};

		add_filter( 'get_post_status', $as_status, PHP_INT_MAX, 2 );
		add_filter( 'map_meta_cap', $edit_caps_as_status, PHP_INT_MIN, 4 );
		try {
			return user_can( $user_id, 'read_post', $post_id );
		} finally {
			remove_filter( 'get_post_status', $as_status, PHP_INT_MAX );
			remove_filter( 'map_meta_cap', $edit_caps_as_status, PHP_INT_MIN );
		}
	}

	/**
	 * Whether a role's own capabilities let a non-author read the post.
	 *
	 * Used for a role with no members, where there is no user to check.
	 *
	 * @param  \WP_Role $role    Role.
	 * @param  int      $post_id Post ID.
	 * @return bool
	 */
	private function role_can_read_post( \WP_Role $role, int $post_id ): bool {
		foreach ( map_meta_cap( 'read_post', 0, $post_id ) as $capability ) {
			if ( ! $role->has_cap( $capability ) ) {
				return false;
			}
		}

		return true;
	}

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
	 * Keep the pending-assignee index in step with every assignment write.
	 *
	 * Every write path fires one of these actions after it writes, including
	 * process_transition_input()'s compare-and-set, whose direct SQL no meta
	 * hook sees. Listening here rather than calling from each write keeps the
	 * index out of the write paths themselves.
	 */
	public static function register_index_hooks(): void {
		$sync = static function ( $post_id ): void {
			( new self() )->sync_pending_assignee_index( (int) $post_id );
		};

		foreach ( array( 'created', 'removed', 'completed', 'expired' ) as $event ) {
			add_action( 'vip_workflows_assignment_' . $event, $sync, 1 );
		}
	}

	/**
	 * Rebuild a post's pending-assignee index from its assignment slots.
	 *
	 * Rebuilt whole rather than patched per write, so every write path leaves
	 * the same rows. Only pending user assignments are indexed: those are the
	 * ones that put a post in a person's My Work.
	 *
	 * Two requests can rebuild one post at once, and a rebuild that read the
	 * slots before another request's write can then overwrite the newer rows
	 * with its own snapshot, or leave a row twice. So each rebuild checks its
	 * work: after writing, it reads the slots and the rows again and, if they
	 * no longer agree, rebuilds. Whichever rebuild writes last also checks
	 * last, after every slot write before it, so the index ends matching the
	 * slots. That needs no lock. A named database lock would not serve here
	 * anyway: on VIP, HyperDB sends a SELECT, GET_LOCK included, to a read
	 * replica, while the writes go to the primary. After this request's first
	 * write to postmeta, HyperDB reads postmeta from the primary, and both the
	 * rebuild and the check read with direct queries rather than through the
	 * shared object cache, so the check reads what was actually stored.
	 *
	 * @param int  $post_id Post ID.
	 * @param bool $report  Whether to log malformed slots, on the first read
	 *                      only. The backfill passes false: it has already
	 *                      logged them for the page.
	 */
	public function sync_pending_assignee_index( int $post_id, bool $report = true ): void {
		for ( $attempt = 1; $attempt <= self::INDEX_SETTLE_ATTEMPTS; ++$attempt ) {
			$user_ids = $this->read_pending_user_ids( $post_id, $report && 1 === $attempt );
			if ( null === $user_ids ) {
				// Logged. Rewriting the rows from nothing would drop real ones.
				return;
			}

			delete_post_meta( $post_id, self::PENDING_ASSIGNEE_INDEX_KEY );
			foreach ( $user_ids as $user_id ) {
				add_post_meta( $post_id, self::PENDING_ASSIGNEE_INDEX_KEY, (string) $user_id );
			}

			if ( $this->pending_assignee_index_matches( $post_id ) ) {
				return;
			}
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( sprintf( '[VIP Workflows] The pending-assignee index of post %d still disagreed with its assignment slots after %d rebuilds; another request is writing it.', $post_id, self::INDEX_SETTLE_ATTEMPTS ) );
	}

	/**
	 * Whether a post's pending-assignee rows are exactly what its slots name
	 * now: each pending user once, nobody else.
	 *
	 * @param int $post_id Post ID.
	 * @return bool
	 */
	public function pending_assignee_index_matches( int $post_id ): bool {
		global $wpdb;

		$expected = $this->read_pending_user_ids( $post_id, false );
		if ( null === $expected ) {
			return false;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- read past the object cache on purpose; see read_pending_user_ids().
		$rows = $wpdb->get_col( $wpdb->prepare( "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = %s", $post_id, self::PENDING_ASSIGNEE_INDEX_KEY ) );
		if ( '' !== $wpdb->last_error ) {
			return false;
		}

		$rows = array_map( 'intval', $rows );
		sort( $expected );
		sort( $rows );

		return $expected === $rows;
	}

	/**
	 * The pending user assignees a post's slots name, read from the database.
	 *
	 * Read with a direct query rather than get_post_meta(): the object cache is
	 * shared, and another request can refill a post's entry from a lagging
	 * replica between this request clearing it and reading it, so the rebuild
	 * and its check would agree on stale data. A direct query after this
	 * request's own postmeta write is answered by the primary under HyperDB.
	 *
	 * @param int  $post_id Post ID.
	 * @param bool $report  Whether to log malformed slots. The check after a
	 *                      write reads the same slots again and does not
	 *                      repeat what the rebuild already logged.
	 * @return int[]|null User IDs, or null when the slots could not be read (logged).
	 */
	private function read_pending_user_ids( int $post_id, bool $report ): ?array {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- read past the object cache on purpose; see above.
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key LIKE %s ORDER BY meta_id ASC", $post_id, $wpdb->esc_like( self::STORAGE_PREFIX ) . '%' ) );
		if ( null === $rows || '' !== $wpdb->last_error ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Could not read the assignment slots of post %d to index them: %s', $post_id, $wpdb->last_error ) );
			return null;
		}

		// The newest row per key wins, as get_all() resolves a duplicated slot,
		// so the index names whoever My Work shows as the assignee. That is not
		// get_post_meta( ..., true )'s answer, which is the oldest row.
		$slots = array();
		foreach ( $rows as $row ) {
			$slots[ (string) $row->meta_key ] = $row->meta_value;
		}

		return self::pending_user_ids_from_slots( $post_id, $slots, $report );
	}

	/**
	 * The users a post's assignment slots have a pending user assignment for.
	 *
	 * Shared by the per-post rebuild and the schema backfill, so both index
	 * the same rows. A slot that is not an assignment (not an array, or
	 * missing its type, status or value) is a data-integrity error: it is
	 * logged with its post and slot, and left out. A pending user assignment
	 * whose value is not a user ID is logged the same way and never indexed,
	 * so a missing value cannot become user 0.
	 *
	 * @param  int                  $post_id Post ID, for the log.
	 * @param  array<string, mixed> $slots   Raw stored values keyed by full meta key.
	 * @param  bool                 $report  Whether to log malformed slots.
	 * @return int[] User IDs, each once.
	 */
	public static function pending_user_ids_from_slots( int $post_id, array $slots, bool $report = true ): array {
		$user_ids = array();

		foreach ( $slots as $meta_key => $raw ) {
			$assignment = maybe_unserialize( $raw );

			if ( ! is_array( $assignment ) || ! isset( $assignment['type'], $assignment['status'] ) || ! array_key_exists( 'value', $assignment ) ) {
				if ( $report ) {
					// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					error_log( sprintf( '[VIP Workflows] Assignment slot %s on post %d is malformed, so it is not in the pending-assignee index.', $meta_key, $post_id ) );
				}
				continue;
			}

			if ( self::STATUS_PENDING !== $assignment['status'] || 'user' !== $assignment['type'] ) {
				continue;
			}

			$user_id = filter_var( $assignment['value'], FILTER_VALIDATE_INT, array( 'options' => array( 'min_range' => 1 ) ) );
			if ( false === $user_id ) {
				if ( $report ) {
					// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					error_log( sprintf( '[VIP Workflows] Pending user assignment %s on post %d names no valid user ID, so it is not in the pending-assignee index.', $meta_key, $post_id ) );
				}
				continue;
			}

			$user_ids[ $user_id ] = true;
		}

		return array_keys( $user_ids );
	}

	/**
	 * Get the storage meta key for an assignment.
	 *
	 * @param  string $meta_key Assignment slot key.
	 * @return string Full meta key for storage.
	 */
	private function get_storage_key( string $meta_key ): string {
		return self::STORAGE_PREFIX . sanitize_key( $meta_key );
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

		/**
		 * Filter the per-assignee-type handlers run when an assignment is created.
		 *
		 * Keyed by assignee type (the `assignee_type` a sequence's assignment
		 * input stores). Each entry's only read key is `on_assign`: a callable
		 * receiving `( int $post_id, mixed $value, array $config )`. Nothing else
		 * in an entry is read, and the built-in types register no handler.
		 *
		 * This is not a list of allowed types: an assignment input stores any
		 * `assignee_type` string, whether or not it appears here.
		 *
		 * @param array $handlers Handlers keyed by assignee type.
		 */
		$handlers = apply_filters( 'vip_workflows_assignee_types', array() );
		$handler  = $handlers[ $assignment['type'] ]['on_assign'] ?? null;
		if ( is_callable( $handler ) ) {
			call_user_func( $handler, $post_id, $assignment['value'], $config );
		}
	}
}
