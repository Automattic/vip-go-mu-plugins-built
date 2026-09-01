<?php
/**
 * Status Manager - handles workflow status transitions.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

use VIPWorkflows\Plugin;
use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\Sequences\SequenceRepository;
use VIPWorkflows\Database\Schema;
use VIPWorkflows\Abilities\AbilityExecutor;
use VIPWorkflows\Abilities\AbilitySettings;
use VIPWorkflows\Workflow\AssignmentManager;

/**
 * Manages workflow status transitions for posts.
 */
class StatusManager {


	/**
	 * Sequence repository.
	 *
	 * @var SequenceRepository
	 */
	private SequenceRepository $sequence_repository;

	/**
	 * Post type manager.
	 *
	 * @var PostTypeManager
	 */
	private PostTypeManager $post_type_manager;

	/**
	 * Meta key holding the authoritative workflow stage for a post.
	 */
	public const STAGE_META_KEY = '_vip_workflows_current_stage_key';

	/**
	 * Meta key holding the sequence a post is managed by.
	 */
	public const SEQUENCE_META_KEY = '_vip_workflows_sequence_id';

	/**
	 * Request-scoped re-entrancy guard, keyed by post ID.
	 *
	 * MUST be static, not an instance property: runtime code constructs throwaway
	 * StatusManager instances (e.g. the transition-post ability), while the
	 * transition_post_status hook is bound to a different singleton. A static
	 * guard is visible across all instances in the request, so on_status_transition
	 * can reliably distinguish a plugin-driven write from a core-driven one.
	 *
	 * @var array<int, bool>
	 */
	private static array $transition_in_progress = array();

	/**
	 * Constructor.
	 *
	 * @param SequenceRepository|null $sequence_repository Sequence repository.
	 * @param PostTypeManager|null    $post_type_manager    Post type manager.
	 */
	public function __construct(
		?SequenceRepository $sequence_repository = null,
		?PostTypeManager $post_type_manager = null
	) {
		$this->sequence_repository = $sequence_repository ?? new SequenceRepository();
		$this->post_type_manager    = $post_type_manager ?? new PostTypeManager();
	}

	/**
	 * Initialize hooks.
	 */
	public function init(): void {
		add_action( 'transition_post_status', array( $this, 'on_status_transition' ), 10, 3 );
	}

	/**
	 * Whether a plugin-driven status commit is currently in flight for a post.
	 *
	 * Consumers hooked on core's transition_post_status use this to suppress the
	 * mid-commit fire: when a workflow crossing (or assignment) writes
	 * post_status through core, the workflow stage action that follows carries
	 * the authoritative signal, so the core hook should only emit for genuinely
	 * core-driven changes (Publish button, quick edit, cron future→publish, ...).
	 *
	 * @param  int $post_id Post ID.
	 * @return bool
	 */
	public static function is_transition_in_progress( int $post_id ): bool {
		return isset( self::$transition_in_progress[ $post_id ] );
	}

	/**
	 * Get the sequence for a post.
	 *
	 * Only returns a sequence if one is explicitly assigned to the post.
	 * Does NOT fall back to post type mapping - users must choose to start a workflow.
	 *
	 * @param  int $post_id Post ID.
	 * @return Sequence|null
	 */
	public function get_sequence_for_post( int $post_id ): ?Sequence {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return null;
		}

		// Only return if a sequence is explicitly assigned.
		$sequence_id = get_post_meta( $post_id, '_vip_workflows_sequence_id', true );
		if ( $sequence_id ) {
			return $this->sequence_repository->find( (int) $sequence_id );
		}

		return null;
	}

	/**
	 * Whether a post carries a workflow identity that cannot be resolved.
	 *
	 * `get_sequence_for_post()` answers null for two very different posts: one
	 * that was never put in a workflow, and one whose `_vip_workflows_sequence_id`
	 * names a sequence row that has since been deleted. Only the second is a
	 * data-integrity condition, and the difference matters at every surface:
	 * crosses_publish_boundary() fails CLOSED on it — reporting a crossing for
	 * every target status, forever — so a surface that reads it as "not in a
	 * workflow" offers the sequence SELECTOR to a post that is frozen, and never
	 * offers remove_sequence(), the one operation that can free it.
	 *
	 * @param  int $post_id Post ID.
	 * @return bool True when the post names a sequence that no longer exists.
	 */
	public function has_dangling_sequence( int $post_id ): bool {
		$sequence_id = (int) get_post_meta( $post_id, self::SEQUENCE_META_KEY, true );
		if ( ! $sequence_id ) {
			return false;
		}

		return null === $this->sequence_repository->find( $sequence_id );
	}

	/**
	 * Whether a stage agent job is currently pending for a post at a given stage.
	 *
	 * A pending job older than StageAgentRunner::PENDING_TTL is stale — cron
	 * dropped the event or the run died without reaching a terminal path. It is
	 * converted to a failure (so the editor surfaces the error and its go-back
	 * action) and no longer gates transitions. The origin stage is carried over:
	 * a timed-out run's failed state offers the same way back a failed run's does.
	 *
	 * @param  int    $post_id Post ID.
	 * @param  string $stage   Stage key to check against.
	 * @return bool True when an agent job is pending for that stage.
	 */
	public function has_pending_agent_job( int $post_id, string $stage ): bool {
		$job = get_post_meta( $post_id, StageAgentRunner::JOB_META, true );

		if (
			! is_array( $job )
			|| 'pending' !== ( $job['status'] ?? '' )
			|| ( $job['stage_key'] ?? '' ) !== $stage
		) {
			return false;
		}

		$queued_at = strtotime( (string) ( $job['queued_at'] ?? '' ) );
		if ( ! $queued_at || ( current_time( 'timestamp' ) - $queued_at ) > StageAgentRunner::PENDING_TTL ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( 'VIP Workflows: agent job for post %d at stage "%s" timed out (queued_at: %s).', $post_id, $stage, (string) ( $job['queued_at'] ?? '' ) ) );

			update_post_meta(
				$post_id,
				StageAgentRunner::JOB_META,
				array(
					'stage_key'  => $stage,
					'ability_id' => (string) ( $job['ability_id'] ?? '' ),
					'status'     => 'failed',
					'error'      => __( 'Agent run timed out.', 'vip-workflows' ),
					'failed_at'  => current_time( 'mysql' ),
					'from_stage' => (string) ( $job['from_stage'] ?? '' ),
				)
			);

			return false;
		}

		return true;
	}

	/**
	 * The stage a failed agent run offers as its way back, or null.
	 *
	 * Resolves only when ALL of: the post's current stage is AI-owned, its job
	 * marker records a failure for that same stage, the marker knows the stage
	 * the post entered from, and the sequence still defines that stage. Anything
	 * less returns null — and the failed state then releases the stage's routed
	 * transitions instead (see agent_owns_stage_exits), so a post is never
	 * stranded behind a go-back that cannot be honored.
	 *
	 * @param  int $post_id Post ID.
	 * @return string|null The origin stage key, or null when no go-back exists.
	 */
	public function get_agent_revert_stage( int $post_id ): ?string {
		$sequence = $this->get_sequence_for_post( $post_id );
		if ( ! $sequence ) {
			return null;
		}

		$current_stage = (string) get_post_meta( $post_id, self::STAGE_META_KEY, true );
		$stage_config  = $sequence->get_status( $current_stage );
		if ( ! is_array( $stage_config ) || empty( $stage_config['agent']['ability_id'] ) ) {
			return null;
		}

		$job = get_post_meta( $post_id, StageAgentRunner::JOB_META, true );
		if (
			! is_array( $job )
			|| 'failed' !== ( $job['status'] ?? '' )
			|| ( $job['stage_key'] ?? '' ) !== $current_stage
		) {
			return null;
		}

		$from_stage = (string) ( $job['from_stage'] ?? '' );
		if ( '' === $from_stage || $from_stage === $current_stage ) {
			return null;
		}

		return null !== $sequence->get_status( $from_stage ) ? $from_stage : null;
	}

	/**
	 * Return a post whose stage agent failed in place to the stage it came from.
	 *
	 * The one exit a failed AI stage offers people (the stage's own transitions
	 * belong to its agent — see agent_owns_stage_exits). It is not an authored
	 * edge, so the move runs as an `agent_revert` through transition(), which
	 * skips the edge and role checks an edge would carry while keeping the core
	 * capability gates, the region machinery, and the audit trail.
	 *
	 * Human intervention resets the agent-loop guard, exactly as a human
	 * transition into an AI stage does — going back and forward again IS the
	 * re-run. The failed marker is cleared compare-and-delete after the move, so
	 * a job the origin stage's own dispatch just queued (the origin can itself
	 * be an AI stage) is never touched.
	 *
	 * @param  int $post_id Post ID.
	 * @return bool|array|\WP_Error True on success, transition()'s warnings array
	 *                              if one surfaces, WP_Error otherwise.
	 */
	public function revert_failed_agent_stage( int $post_id ): bool|array|\WP_Error {
		$revert_to = $this->get_agent_revert_stage( $post_id );
		if ( null === $revert_to ) {
			return new \WP_Error(
				'no_agent_revert',
				__( 'This post has no failed AI stage to go back from.', 'vip-workflows' ),
				array( 'status' => 409 )
			);
		}

		$failed_job = get_post_meta( $post_id, StageAgentRunner::JOB_META, true );

		delete_post_meta( $post_id, StageAgentRunner::CHAIN_META );

		$result = $this->transition( $post_id, $revert_to, array( 'agent_revert' => true ) );
		if ( true !== $result ) {
			return $result;
		}

		if ( is_array( $failed_job ) ) {
			delete_post_meta( $post_id, StageAgentRunner::JOB_META, $failed_job );
		}

		return true;
	}

	/**
	 * Get available sequences that can be assigned to a post.
	 *
	 * @param  int $post_id Post ID.
	 * @return array Array of sequences.
	 */
	public function get_available_sequences_for_post( int $post_id ): array {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return array();
		}

		$sequence_ids = $this->post_type_manager->get_sequences_for_post( $post );
		$sequences = array();

		foreach ( $sequence_ids as $id ) {
			$sequence = $this->sequence_repository->find( $id );
			if ( $sequence ) {
				$sequences[] = array(
					'id'   => $sequence->id,
					'name' => $sequence->name,
					'slug' => $sequence->slug,
				);
			}
		}

		return $sequences;
	}

	/**
	 * Get current workflow status for a post.
	 *
	 * @param  int $post_id Post ID.
	 * @return array|null Status info with 'key', 'label', 'color', etc.
	 */
	public function get_current_status( int $post_id ): ?array {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return null;
		}

		$sequence = $this->get_sequence_for_post( $post_id );
		if ( ! $sequence ) {
			return null;
		}

		// Meta is the sole authority for the workflow stage.
		$status_key = get_post_meta( $post_id, self::STAGE_META_KEY, true );
		if ( ! $status_key ) {
			// A post with a sequence but no stage meta is a data-integrity bug — bail, do not infer from post_status.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d has a sequence but no stage meta; cannot resolve current stage.', $post_id ) );
			return null;
		}

		$status = $sequence->get_status( $status_key );
		if ( ! $status ) {
			// Stage meta names a stage the sequence does not define — a data-integrity
			// bug (dangling key after a sequence edit). Log and bail; never fabricate
			// a synthetic stage.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d stage meta names stage "%s", which is not defined in sequence "%s"; cannot resolve current stage.', $post_id, $status_key, $sequence->slug ) );
			return null;
		}

		return $status;
	}

	/**
	 * Whether an AI stage's transitions are withheld from people right now.
	 *
	 * An agent owns the stage it runs on: it moves the post out along one of its
	 * configured outcome routes, so the stage's transitions are not anybody
	 * else's to take and are not offered. The Sequence editor greys the same
	 * stage's unrouted transitions out for the same reason.
	 *
	 * Withheld in two states:
	 *
	 * - a run is in flight — that is exactly when "the agent will move it
	 *   onward" is true;
	 * - the run failed (or timed out — `has_pending_agent_job()` converts a
	 *   stale pending job to a failure) AND a go-back is available. A failed
	 *   stage's one human exit is back the way the post came
	 *   (revert_failed_agent_stage), so its forward transitions stay the
	 *   agent's.
	 *
	 * Released everywhere else — a failure with no resolvable origin (a marker
	 * predating `from_stage`, or an origin the sequence no longer defines), or a
	 * stage that gained its agent while posts were already sitting in it. In
	 * those states the go-back cannot be honored and no run is coming, so
	 * withholding would strand the post; the routed transitions come back
	 * instead (never the unrouted ones — get_available_transitions filters
	 * those in every state).
	 *
	 * @param  int    $post_id   Post ID.
	 * @param  string $stage_key Stage the post currently sits in.
	 * @param  array  $status    The stage's sequence config.
	 * @return bool True when the stage's transitions are withheld.
	 */
	private function agent_owns_stage_exits( int $post_id, string $stage_key, array $status ): bool {
		if ( empty( $status['agent']['ability_id'] ) ) {
			return false;
		}

		if ( $this->has_pending_agent_job( $post_id, $stage_key ) ) {
			return true;
		}

		return null !== $this->get_agent_revert_stage( $post_id );
	}

	/**
	 * The destinations an AI stage's routing map names, or null off AI stages.
	 *
	 * These are the ONLY exits a person may take from an AI stage: the sequence
	 * editor draws every other transition the stage holds as disabled, and this
	 * is the runtime half of that promise — get_available_transitions() never
	 * offers an unrouted transition and transition() refuses one, so the two
	 * cannot disagree with the canvas (or with each other) no matter which
	 * surface, or hand-built request, asks.
	 *
	 * Public because every surface that OFFERS transitions must apply the same
	 * filter (the editor payload does via get_available_transitions(); My Queue
	 * builds its quick actions from Sequence::get_transitions_for_user directly).
	 *
	 * @param  ?array $status The stage's sequence config.
	 * @return array|null Routed destination keys, or null when the stage has no agent.
	 */
	public function agent_routed_targets( ?array $status ): ?array {
		if ( ! is_array( $status ) || empty( $status['agent']['ability_id'] ) ) {
			return null;
		}

		$routing = is_array( $status['agent']['routing'] ?? null ) ? $status['agent']['routing'] : array();

		return array_values( array_filter( array_map( 'strval', $routing ) ) );
	}

	/**
	 * How a transition is presented to a writer.
	 *
	 * An authored label wins outright. Otherwise the label is derived from the
	 * destination's *current* name, every time it is read — never stored. That is
	 * the whole point: a stored copy goes stale the moment someone renames the
	 * stage, and the buttons in the editor sidebar then advertise a name that no
	 * longer exists anywhere.
	 *
	 * Phrased as an action rather than as the bare stage name, because these are
	 * buttons. "Review" reads as a state; "Move to Review" reads as something you
	 * can click, and sits correctly beside authored labels like "Send to Legal".
	 *
	 * @param  array $transition Transition config.
	 * @param  array $to_status  The destination stage's config.
	 * @return string
	 */
	public static function transition_label( array $transition, array $to_status ): string {
		$authored = trim( (string) ( $transition['label'] ?? '' ) );

		if ( '' !== $authored ) {
			return $authored;
		}

		return sprintf(
			/* translators: %s: destination stage label. */
			__( 'Move to %s', 'vip-workflows' ),
			$to_status['label'] ?? $transition['to'] ?? ''
		);
	}

	/**
	 * Get available transitions for a post (filtered by current user's role).
	 *
	 * @param  int $post_id Post ID.
	 * @param  int $user_id User ID. Default current user.
	 * @return array Array of available transitions the user can perform.
	 */
	public function get_available_transitions( int $post_id, int $user_id = 0 ): array {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return array();
		}

		$sequence = $this->get_sequence_for_post( $post_id );
		if ( ! $sequence ) {
			return array();
		}

		// Stage lives in meta (sole authority). No post_status fallback.
		$current_stage = get_post_meta( $post_id, self::STAGE_META_KEY, true );
		if ( ! $current_stage ) {
			return array();
		}

		// An AI stage offers nothing while its agent is working: the agent owns
		// the way out. See agent_owns_stage_exits() for the states that hand it
		// back rather than strand the post.
		$stage_config = $sequence->get_status( $current_stage );
		if ( is_array( $stage_config ) && $this->agent_owns_stage_exits( $post_id, $current_stage, $stage_config ) ) {
			return array();
		}

		// Withholding the edges is not a block on moving the post. Interrupting a
		// running agent stays a warn/confirm that transition() issues through
		// warnings_pending — a caller that means it (an admin tool, the Kanban
		// board acting on a stuck post) can still transition and gets asked
		// first.
		//
		// Get transitions filtered by user role and assignment.
		$transitions = $sequence->get_transitions_for_user( $current_stage, $user_id, $post_id );

		// On an AI stage, only the agent's routed destinations are anyone's to
		// take — see agent_routed_targets(). Applied whenever the stage offers
		// anything at all, so an unrouted transition never appears here in any
		// job state.
		$routed_targets = $this->agent_routed_targets( is_array( $stage_config ) ? $stage_config : null );

		// Map transitions to include full status info.
		$result = array();
		foreach ( $transitions as $transition ) {
			if ( null !== $routed_targets && ! in_array( (string) $transition['to'], $routed_targets, true ) ) {
				continue;
			}

			$to_status = $sequence->get_status( $transition['to'] );
			if ( $to_status ) {
				/*
				 * An explicit allowlist: a field absent from here never reaches the
				 * editor, and the omission is silent.
				 */
				$mapped = array(
					'to'             => $transition['to'],
					'label'          => self::transition_label( $transition, $to_status ),
					'status_info'    => $to_status,
					'allowed_roles'  => $transition['allowed_roles'] ?? array(),
					'required_tools' => $transition['required_tools'] ?? array(),
				);

				// What the transition captures, in the order the author arranged
				// it — the editor collects them in that order before the move.
				if ( ! empty( $transition['inputs'] ) ) {
					$mapped['inputs'] = $transition['inputs'];
				}

				// Preserve the lock the sequence projected — assignment or
				// required metadata. `_locked_code` names the rule and is only
				// set by the gates that have one; the editor reads it to tell
				// the lock it may re-judge against unsaved meta from the ones
				// it must take on trust (see Sequence::CODE_REQUIRED_METADATA).
				// This list is an allowlist: a key left out of it never reaches
				// any client, silently.
				if ( isset( $transition['_locked'] ) ) {
					$mapped['_locked']        = $transition['_locked'];
					$mapped['_locked_reason'] = $transition['_locked_reason'] ?? '';

					if ( isset( $transition['_locked_code'] ) ) {
						$mapped['_locked_code'] = $transition['_locked_code'];
					}
				}

				$result[] = $mapped;
			}
		}

		return $result;
	}

	/**
	 * Transition a post to a new workflow stage.
	 *
	 * Stage moves within one status region never touch post_status; a move whose
	 * edge crosses a region boundary writes the target region's status through
	 * core (before the stage-meta write) and accepts core's committed answer.
	 *
	 * @param  int    $post_id   Post ID.
	 * @param  string $to_status Target stage key (unprefixed).
	 * @param  array  $options   Transition options (input_data, acknowledge_warnings, etc.).
	 * @return bool|array|\WP_Error True on success, warnings array, WP_Error on failure.
	 */
	public function transition( int $post_id, string $to_status, array $options = array() ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return new \WP_Error( 'invalid_post', __( 'Post not found.', 'vip-workflows' ) );
		}

		// Trash is a core-owned overlay that suspends the workflow in place:
		// transitions on trashed posts are rejected outright, before any other
		// check, and the agent actor does NOT bypass this.
		if ( 'trash' === $post->post_status ) {
			return new \WP_Error(
				'post_trashed',
				__( 'This post is in the Trash; restore it before changing its workflow stage.', 'vip-workflows' ),
				array( 'status' => 409 )
			);
		}

		$sequence = $this->get_sequence_for_post( $post_id );
		if ( ! $sequence ) {
			return new \WP_Error(
				'no_sequence',
				__( 'No workflow sequence for this post.', 'vip-workflows' ),
				array( 'status' => 409 )
			);
		}

		$current_stage = get_post_meta( $post_id, self::STAGE_META_KEY, true );
		if ( ! $current_stage ) {
			// Meta is the sole authority; a workflow post with no stage is a data-integrity bug.
			return new \WP_Error(
				'no_stage',
				__( 'This post has no workflow stage.', 'vip-workflows' ),
				array( 'status' => 409 )
			);
		}

		// An agent-driven exit transition (from StageAgentRunner) runs in a
		// user-less cron context and is trusted: it bypasses the assignment, role,
		// and capability checks that apply to human callers (but never the trash
		// rejection above). This flag is only ever set by the in-process runner —
		// WorkflowController builds $options explicitly and never forwards it, so
		// it cannot be injected via REST.
		$is_agent_actor = ! empty( $options['agent_actor'] );

		// A go-back from a failed AI stage (revert_failed_agent_stage). Not an
		// authored edge, so it skips the edge-existence, routed-exit and role
		// checks — its own legitimacy was established by get_agent_revert_stage()
		// before this call. It keeps every core capability gate below: the caller
		// is a person, and going back across a region boundary is still a status
		// change core must permit them. Internal-only, same as agent_actor: no
		// REST surface forwards it.
		$is_revert = ! $is_agent_actor && ! empty( $options['agent_revert'] );

		// Validate transition is allowed in sequence.
		if ( ! $is_revert && ! $sequence->is_transition_allowed( $current_stage, $to_status ) ) {
			return new \WP_Error(
				'invalid_transition',
				sprintf(
					/* translators: %1$s: current workflow status key, %2$s: target workflow status key. */
					__( 'Transition from "%1$s" to "%2$s" is not allowed.', 'vip-workflows' ),
					$current_stage,
					$to_status
				),
				array( 'status' => 422 )
			);
		}

		// An AI stage's exits are its agent's routed destinations — the server
		// half of the sequence editor's disabled-transition contract (see
		// agent_routed_targets). Enforced here, not only in the offered list, so
		// a hand-built REST call cannot take an edge no surface shows. The agent
		// itself and the go-back are the two sanctioned exceptions.
		if ( ! $is_agent_actor && ! $is_revert ) {
			$routed_targets = $this->agent_routed_targets( $sequence->get_status( $current_stage ) );
			if ( null !== $routed_targets && ! in_array( $to_status, $routed_targets, true ) ) {
				return new \WP_Error(
					'unrouted_agent_exit',
					__( 'This stage belongs to an AI agent; only the destinations its outcomes route to can be taken.', 'vip-workflows' ),
					array( 'status' => 403 )
				);
			}
		}

		// A transition target must be a DEFINED workflow stage. is_transition_allowed()
		// only checks the transition config exists, not that its target resolves, so
		// two undefined targets can still reach here: a core WordPress status (e.g.
		// `future` — a scheduling overlay owned by core, never a stage), and a
		// dangling target (a sequence whose transition `to:` references a stage that
		// isn't defined). Reject both — otherwise get_stage_status() below throws on
		// them. A stage merely KEYED like a core status (e.g. one named "publish")
		// IS defined and is fine.
		if ( null === $sequence->get_status( $to_status ) ) {
			return new \WP_Error(
				'invalid_transition',
				sprintf(
					/* translators: %s: target status key. */
					__( '"%s" is not a defined workflow stage and cannot be a transition target.', 'vip-workflows' ),
					$to_status
				),
				array( 'status' => 422 )
			);
		}

		// The regions the edge's endpoints live in decide whether this move is a
		// boundary crossing (the only kind of stage move that writes post_status).
		//
		// get_stage_status() THROWS for a stage stored before the region write gate
		// (see Sequence::require_stage_region). Uncaught, that is a 500 on a REST
		// transition and a fatal in cron for an agent's exit transition — for a
		// condition whose repair lives on the Sequence editor. A WP_Error naming
		// the stage says the same thing without taking the request down, and every
		// other read path in this class already guards the call.
		try {
			$from_region = $sequence->get_stage_status( $current_stage );
			$to_region   = $sequence->get_stage_status( $to_status );
		} catch ( \InvalidArgumentException $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot transition post %d from "%s" to "%s": %s', $post_id, $current_stage, $to_status, $e->getMessage() ) );

			return new \WP_Error(
				'stage_region_missing',
				sprintf(
					/* translators: %s: the underlying reason, naming the stage. */
					__( 'This workflow cannot be used until its stages have status regions: %s Open the sequence and assign the missing ones.', 'vip-workflows' ),
					$e->getMessage()
				),
				array( 'status' => 409 )
			);
		}

		// Null for a revert — a go-back has no authored edge, so it carries no
		// label, tools, inputs or assignment requirement.
		$transition_config      = $sequence->get_transition( $current_stage, $to_status );
		$assignment_manager     = new AssignmentManager();
		$assignment_requirement = null;

		/*
		 * An agent run executes at uid 0 under cron, so it names the identity it
		 * acts for and the capability checks below are evaluated against that
		 * rather than against whoever is current.
		 *
		 * `agent_actor` waives the workflow's own configuration rules — the role
		 * table and requires_assignment — because those describe which *human* may
		 * push a button. It was never entitled to waive core capabilities.
		 */
		if ( $is_agent_actor ) {
			$actor_id = (int) ( $options['agent_actor_user'] ?? 0 );

			// uid 0 holds nothing, so a run naming no actor is refused here.
			if ( ! user_can( $actor_id, 'edit_post', $post_id ) ) {
				return new \WP_Error(
					'cannot_edit_post',
					__( 'The agent is not acting for a user who may edit this post.', 'vip-workflows' ),
					array( 'status' => 403 )
				);
			}

			if ( $from_region !== $to_region && ! $this->user_can_cross_region( $post, $from_region, $to_region, $actor_id ) ) {
				return new \WP_Error(
					'forbidden_region_crossing',
					__( 'The agent is not acting for a user who may change this post to that status.', 'vip-workflows' ),
					array( 'status' => 403 )
				);
			}
		} else {
			// Baseline capability for every transition: the caller must be able to
			// edit the post. Workflow bypass roles bypass workflow rules below, never
			// core capabilities.
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return new \WP_Error(
					'cannot_edit_post',
					__( 'You are not allowed to edit this post.', 'vip-workflows' ),
					array( 'status' => 403 )
				);
			}

			// Boundary edges defer to core capabilities: crossing into a region
			// requires the capability core requires for that status on this post type.
			if ( $from_region !== $to_region && ! $this->current_user_can_cross_region( $post, $from_region, $to_region ) ) {
				return new \WP_Error(
					'forbidden_region_crossing',
					__( 'You do not have permission to change this post to that status.', 'vip-workflows' ),
					array( 'status' => 403 )
				);
			}
		}

		// Validate user has permission for this transition (role-based). A revert
		// is exempt for the same reason it skips the edge check: no edge, so no
		// authored role list to consult — edit_post and the region gates above
		// are its permission model.
		if ( ! $is_agent_actor && ! $is_revert && ! $sequence->can_user_transition( $current_stage, $to_status ) ) {
			return new \WP_Error(
				'forbidden_transition',
				__( 'You do not have permission to perform this transition.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		// Check requires_assignment.
		if ( ! $is_agent_actor && ! empty( $transition_config['requires_assignment'] ) ) {
			$assignment_requirement = $assignment_manager->normalize_requirement( $transition_config['requires_assignment'] );

			if ( ! $assignment_manager->user_satisfies_requirement( $post_id, get_current_user_id(), $assignment_requirement ) ) {
				if ( ! \VIPWorkflows\Admin\Settings::can_user_bypass_workflow() ) {
					return new \WP_Error(
						'assignment_required',
						$assignment_manager->get_error_message( $post_id, $assignment_requirement ),
						array( 'status' => 403 )
					);
				}
			}
		}

		$acknowledge_warnings = ! empty( $options['acknowledge_warnings'] );

		// Interrupting a running stage agent is a confirm, not a block.
		//
		// The agent runs on the user's behalf, so anyone who may perform this
		// transition may stop it — they just have to be told they are. Moving the
		// post out from under a run makes StageAgentRunner abandon it: the
		// outcome, and the routing decision it would have made, are discarded,
		// while anything the ability already wrote to the post stays.
		//
		// This lives here, in transition(), and not in each surface, because
		// EVERY surface goes through this method — the block editor panel, the
		// Kanban board, My Queue, the Quick Edit buttons, and the
		// `vip-workflows/transition-post` ability. It rides the existing
		// warnings_pending protocol so none of them needs a second one. It is
		// deliberately outside the can_user_bypass_tool_checks() block below: a
		// tool-check bypass says nothing about whether you meant to kill an agent.
		//
		// The agent actor is exempt: an agent's own exit transition IS its run
		// finishing, and warning it about itself would deadlock every AI stage.
		if ( ! $is_agent_actor && ! $acknowledge_warnings && $this->has_pending_agent_job( $post_id, $current_stage ) ) {
			return array(
				'warnings_pending' => true,
				'soft_warnings'    => array(
					array(
						'type'    => 'agent_in_progress',
						// Same sentence as the JS getAgentInterruptWarning(), to
						// the character, so the two surfaces share one .pot entry.
						'message' => __( 'An AI agent is working on this post — continuing will stop it.', 'vip-workflows' ),
					),
				),
			);
		}

		// The sequence's own "required" promise, enforced in the same place as the
		// transition's required tools: an empty required metadata field holds the
		// post exactly the way a failed hard check does, and names the field.
		//
		// WHERE it is enforced is the whole of the rule. `required_tools` is
		// declared on ONE transition, so it asks its question exactly where its
		// author put it. A `required` metadata field is declared on the
		// SEQUENCE, so it has no edge of its own — and asked on every edge, a
		// single flag refused every move in the sequence, starting with the first
		// step out of the entry stage. A "Final headline" that only has to exist
		// before the post goes live was holding up Submit-for-review, at the one
		// moment the author has nothing useful to type. The two things the
		// sequence editor labels "Required" then read as one promise with two very
		// different scopes, and the narrower of them was invisible on the surface
		// making it.
		//
		// Going live is the deadline every sequence-wide field really shares: the
		// last point at which the omission still matters, and the only point every
		// field has in common. So the gate fires on a crossing INTO the publish
		// region and nowhere else — not between two draft-region stages, not from
		// draft into pending, and not between two stages that are already
		// publish-side, where the post is live and there is no boundary left to
		// defend. Sequence::crosses_into_publish() is that rule, and
		// get_role_permitted_transitions() locks exactly the edges it covers, so
		// no surface offers a move this gate is going to refuse.
		//
		// The authored RETREAT exemption survives this, without a clause of its
		// own. `publish` is the last region in the editorial progression, so no
		// edge entering it can be travelling backwards: a send-back is outside the
		// gate's scope by construction. That exemption was added because fields
		// declared sequence-wide froze a post with an empty field in BOTH
		// directions — on a surface with no field editor (the board, My Queue),
		// with no way out of the stage at all — and narrowing the scope answers
		// that same complaint everywhere else in the sequence too.
		//
		// This is a WORKFLOW rule, so it holds on workflow transitions and only
		// there. The core status-change reconcile path (on_status_transition ->
		// resolve_reseat_stage) re-seats a post at a region's entry stage by
		// writing the stage meta directly and never comes through here: a
		// scheduled post going live, or a status changed in Quick Edit, lands in
		// its new region with required fields still empty. That is the
		// core-owned-status invariant, not an oversight — the workflow reconciles
		// to what core did, it does not veto it.
		//
		// `bypass_tool_check_roles` does NOT apply. A required tool check can fail
		// for reasons the author cannot reach — a service that is down, a
		// heuristic that will never agree — which is what that escape hatch exists
		// for. An empty required field is always within reach of the person doing
		// the transition: the answer is to type it into the panel that is already
		// open.
		//
		// `bypass_workflow_roles` DOES apply, for the same reason it applies to
		// requires_assignment a dozen lines above: both are workflow rules about
		// the person performing the move, and a role that is trusted to move a
		// post without satisfying its assignment requirement is trusted to move
		// one without every field filled in. Exempting one and not the other was
		// an inconsistency, not a decision.
		//
		// The agent actor and the go-back are exempt for the reason they are exempt
		// everywhere else: an AI stage's own exit transition IS its run finishing,
		// and blocking it would strand the post mid-stage on an omission no agent
		// can fix — while a revert is the move that gets the post BACK to where the
		// omission can be fixed.
		//
		// The scope test comes first in the condition because it is the cheapest
		// and the most often false: both regions are already resolved above, and
		// most edges in most sequences never touch the publish boundary.
		if ( Sequence::crosses_into_publish( $from_region, $to_region )
			&& ! $is_agent_actor && ! $is_revert && ! \VIPWorkflows\Admin\Settings::can_user_bypass_workflow() ) {
			$metadata_check = $this->check_required_metadata( $post_id, $sequence );

			if ( is_wp_error( $metadata_check ) ) {
				$this->log_blocked_transition( $post_id, $current_stage, $to_status, $metadata_check );
				return $metadata_check;
			}
		}

		// Run required tools and check for hard failures (unless user can bypass).
		if ( ! \VIPWorkflows\Admin\Settings::can_user_bypass_tool_checks() ) {
			$tool_check = $this->run_transition_tools( $post_id, $transition_config, $acknowledge_warnings );

			if ( is_wp_error( $tool_check ) ) {
				$this->log_blocked_transition( $post_id, $current_stage, $to_status, $tool_check );
				return $tool_check;
			}

			if ( is_array( $tool_check ) && ! empty( $tool_check['warnings_pending'] ) ) {
				return $tool_check;
			}
		}

		// The committed post_status BEFORE this transition writes anything —
		// go-live consumers compare it against committed_status (equals it on
		// same-region moves, which write no status).
		$previous_status = (string) get_post_status( $post_id );

		// Region crossing: write the target region's status through core BEFORE the
		// stage-meta write; a core failure surfaces and the stage does not move.
		// Same-region moves never touch post_status — pending, future, whatever core
		// set stays exactly as it is.
		$crossed_region = $from_region !== $to_region;
		if ( $crossed_region ) {
			$committed = $this->commit_post_status( $post_id, $to_region );
			if ( is_wp_error( $committed ) ) {
				return $committed;
			}
		}

		// Update workflow stage meta (authoritative), as a COMPARE-AND-SWAP against
		// the stage this transition validated against.
		//
		// Everything above — is_transition_allowed(), the region math, the
		// capability and assignment checks — was decided from $current_stage, read
		// at the top of this method. Two concurrent transitions on the same post
		// both read it, both validate, and both write; the second silently
		// overwrites the first, having validated an edge that no longer starts
		// where it thought. Passing $current_stage as update_post_meta()'s
		// $prev_value makes the write conditional in SQL (`WHERE meta_value =
		// $current_stage`), so the loser of that race changes nothing and finds out.
		//
		// A self-edge writes the same value, which update_post_meta() reports as
		// false without touching anything, so it is settled before the CAS rather
		// than misread as a lost race.
		if ( $current_stage !== $to_status ) {
			$swapped = update_post_meta( $post_id, self::STAGE_META_KEY, $to_status, $current_stage );

			if ( ! $swapped ) {
				return $this->abort_lost_transition( $post_id, $current_stage, $to_status, $crossed_region, $previous_status );
			}
		}

		// Mark required assignment as completed (keeps audit trail).
		if ( $assignment_requirement ) {
			$assignment_manager->mark_completed( $post_id, $assignment_requirement['meta_key'] );
		}

		// Process new assignment input if present. A revert has no transition
		// config (see above) and therefore no input to process.
		if ( is_array( $transition_config ) ) {
			$assignment_manager->process_transition_input( $post_id, $transition_config, $options['input_data'] ?? array() );
		}

		// Store transition input data if provided.
		if ( ! empty( $options['input_data'] ) ) {
			$this->store_transition_data( $post_id, $to_status, $options['input_data'] );
		}

		// The context carries the COMMITTED status — core may have coerced the
		// write (publish → future for future-dated posts) — plus the status the
		// post held before this transition wrote anything.
		$context = array(
			'cause'            => 'workflow',
			'committed_status' => (string) get_post_status( $post_id ),
			'previous_status'  => $previous_status,
		);

		// Log the transition.
		$this->log_transition( $post_id, $current_stage, $to_status, $options, $context );

		// Dispatch the stage-change events. Fired here (after any region-status
		// write is committed and stage meta is written) rather than from
		// on_status_transition(), because same-region stage moves produce no core
		// transition_post_status.
		$this->dispatch_stage_change( $post_id, $to_status, $current_stage, $sequence, $context );

		return true;
	}

	/**
	 * Commit a region's status onto a post through core (the shared
	 * boundary-crossing write used by transition() and assign_sequence()).
	 *
	 * The write goes through wp_update_post so core owns the outcome — including
	 * coercions such as `publish` → `future` for future-dated posts, which are
	 * accepted silently. The request-scoped guard keeps on_status_transition()
	 * from treating this plugin-driven write as a core-driven one.
	 *
	 * Also used to put a status BACK when a transition is abandoned after its
	 * status write landed (see abort_lost_transition()), which is why the
	 * parameter is any core status rather than only a region.
	 *
	 * @param  int    $post_id Post ID.
	 * @param  string $status  Status to write — a region (one of Sequence::EDITORIAL_STATUSES) when crossing, or a previously committed status when rolling back.
	 * @return string|\WP_Error The committed post status, or WP_Error when core refused the write.
	 */
	private function commit_post_status( int $post_id, string $status ) {
		self::$transition_in_progress[ $post_id ] = true;
		try {
			$result = wp_update_post(
				array(
					'ID'          => $post_id,
					'post_status' => $status,
				),
				true
			);
		} finally {
			unset( self::$transition_in_progress[ $post_id ] );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Read back what core actually committed; it may differ from the region
		// asked for (e.g. `future` for a future-dated publish) and that is correct.
		return (string) get_post_status( $post_id );
	}

	/**
	 * Abandon a transition whose stage compare-and-swap did not take.
	 *
	 * Two ways to get here. Either a concurrent transition moved the post while
	 * this one was validating — the stage no longer matches what every check
	 * above was decided from — or the meta write genuinely failed. Both are
	 * refusals, not partial successes.
	 *
	 * The status write, if this was a region crossing, has already landed. It is
	 * put back to exactly what the post held before (not to the source region:
	 * core may have coerced the original, e.g. `publish` → `future`, and the
	 * region would not reproduce that). Nothing else has been written yet — the
	 * assignment, input-data, log and event calls all come after the swap — so
	 * restoring the status is the whole rollback.
	 *
	 * @param  int    $post_id         Post ID.
	 * @param  string $expected_stage  Stage this transition validated against.
	 * @param  string $to_status       Stage it was trying to reach.
	 * @param  bool   $crossed_region  Whether a status write already landed.
	 * @param  string $previous_status The post's status before that write.
	 * @return \WP_Error
	 */
	private function abort_lost_transition( int $post_id, string $expected_stage, string $to_status, bool $crossed_region, string $previous_status ): \WP_Error {
		$actual_stage = (string) get_post_meta( $post_id, self::STAGE_META_KEY, true );

		if ( $crossed_region ) {
			$restored = $this->commit_post_status( $post_id, $previous_status );
			if ( is_wp_error( $restored ) ) {
				// The rollback itself failed: the post now holds the target
				// region's status at the source stage. Nothing here can fix that,
				// so say so as loudly as possible rather than returning a tidy
				// error that hides it.
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log(
					sprintf(
						'[VIP Workflows] Post %d: transition "%s" -> "%s" was abandoned (stage is now "%s"), and restoring post_status "%s" ALSO failed: %s. The post is left with a committed status that its stage does not match.',
						$post_id,
						$expected_stage,
						$to_status,
						$actual_stage,
						$previous_status,
						$restored->get_error_message()
					)
				);
			}
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log(
			sprintf(
				'[VIP Workflows] Post %d: transition "%s" -> "%s" was abandoned; the stage was "%s" at write time.',
				$post_id,
				$expected_stage,
				$to_status,
				$actual_stage
			)
		);

		if ( $actual_stage !== $expected_stage ) {
			return new \WP_Error(
				'transition_conflict',
				sprintf(
					/* translators: 1: stage the transition started from, 2: stage the post is in now. */
					__( 'This post moved to another stage while your change was being applied: it started at "%1$s" and is now at "%2$s". Reload and try again.', 'vip-workflows' ),
					$expected_stage,
					$actual_stage
				),
				array( 'status' => 409 )
			);
		}

		return new \WP_Error(
			'transition_write_failed',
			__( 'The workflow stage could not be saved. The post was not moved.', 'vip-workflows' ),
			array( 'status' => 500 )
		);
	}

	/**
	 * Whether the current user holds the core capability a region-crossing edge
	 * requires, resolved through the post type's cap object:
	 *
	 * - crossing INTO `publish` or `private` → `publish_posts`
	 * - crossing OUT OF `publish` → `edit_published_posts`
	 * - all other crossings (e.g. draft ↔ pending) → baseline only
	 *
	 * There is no escalation mechanism: a workflow edge never lets a user set a
	 * status their role cannot set through core. (Sequence::get_transitions_for_user
	 * applies the same table when offering edges.)
	 *
	 * @param  \WP_Post $post        Post being transitioned.
	 * @param  string   $from_region Source stage's region.
	 * @param  string   $to_region   Target stage's region.
	 * @return bool
	 */
	private function current_user_can_cross_region( \WP_Post $post, string $from_region, string $to_region ): bool {
		$cap = $this->region_crossing_cap( $post, $from_region, $to_region );

		if ( null === $cap ) {
			return false;
		}

		return '' === $cap ? true : current_user_can( $cap );
	}

	/**
	 * Resolve the capability required to cross between two status regions.
	 *
	 * Shared by the current-user and named-user checks so the two can never
	 * disagree about which capability a crossing needs.
	 *
	 * @param  \WP_Post $post        Post being transitioned.
	 * @param  string   $from_region Region the post is leaving.
	 * @param  string   $to_region   Region the post is entering.
	 * @return string|null Capability name, '' when the crossing needs none, or
	 *                     null when it cannot be resolved (caller fails closed).
	 */
	private function region_crossing_cap( \WP_Post $post, string $from_region, string $to_region ): ?string {
		$post_type_object = get_post_type_object( $post->post_type );
		if ( ! $post_type_object ) {
			// Data-integrity condition: an unregistered post type cannot resolve the
			// crossing capability. Fail closed.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot resolve post type "%s" for post %d while checking region-crossing capability.', $post->post_type, $post->ID ) );
			return null;
		}

		$caps = $post_type_object->cap;

		if ( in_array( $to_region, array( 'publish', 'private' ), true ) ) {
			return (string) $caps->publish_posts;
		}

		if ( 'publish' === $from_region ) {
			return (string) $caps->edit_published_posts;
		}

		return '';
	}

	/**
	 * Whether a NAMED user may cross from one status region to another.
	 *
	 * Takes the actor explicitly rather than reading whoever happens to be
	 * current, because the caller that most needs this check has no current
	 * user: the stage-agent runner restores the previous user before writing
	 * state, so under cron the boundary would otherwise be evaluated against
	 * uid 0 — or, worse, against an administrator who merely happened to be
	 * current, silently granting more than the run was entitled to.
	 *
	 * Mirrors Sequence::user_has_region_cap(): resolve the capability from the
	 * post type's own cap object, and fail closed — loudly — when it cannot be
	 * resolved.
	 *
	 * @param  \WP_Post $post        Post being transitioned.
	 * @param  string   $from_region Region the post is leaving.
	 * @param  string   $to_region   Region the post is entering.
	 * @param  int      $user_id     Actor to evaluate. 0 can never cross.
	 * @return bool
	 */
	private function user_can_cross_region( \WP_Post $post, string $from_region, string $to_region, int $user_id ): bool {
		$cap = $this->region_crossing_cap( $post, $from_region, $to_region );

		if ( null === $cap ) {
			return false;
		}

		return '' === $cap ? true : user_can( $user_id, $cap );
	}

	/**
	 * Fire the workflow stage-change actions.
	 *
	 * The single dispatch point for a stage change, called by transition(),
	 * assign_sequence(), and the core-driven reconcile path in
	 * on_status_transition(). Keys are unprefixed stage keys. The $context arg is
	 * additive — existing 4-arg listeners keep working.
	 *
	 * @param int      $post_id   Post ID.
	 * @param string   $new_stage New stage key.
	 * @param string   $old_stage Old stage key ('' when a sequence assignment seats a post with no prior stage).
	 * @param Sequence $sequence Sequence.
	 * @param array    $context   Event context: 'cause' ('workflow' for an edge traversal or assignment seat, 'core' for a checkpoint reseat after a core-driven status change), 'committed_status' (the post_status core actually committed), and 'previous_status' (the committed post_status immediately before this stage change wrote anything; equals committed_status when no status was written).
	 */
	private function dispatch_stage_change( int $post_id, string $new_stage, string $old_stage, Sequence $sequence, array $context ): void {
		/**
		 * Fires when a post transitions to a new workflow stage.
		 *
		 * @param int       $post_id   Post ID.
		 * @param string    $new_stage New stage key (unprefixed).
		 * @param string    $old_stage Old stage key (unprefixed; '' when seated by assignment with no prior stage).
		 * @param Sequence $sequence Sequence.
		 * @param array     $context   { 'cause' => 'workflow'|'core', 'committed_status' => string, 'previous_status' => string }.
		 */
		do_action( 'vip_workflows_status_transition', $post_id, $new_stage, $old_stage, $sequence, $context );

		// Specific stage entered / exited events.
		do_action( "vip_workflows_entered_{$new_stage}", $post_id, $old_stage, $sequence, $context );

		// An assignment seat has no stage to exit.
		if ( '' !== $old_stage ) {
			do_action( "vip_workflows_exited_{$old_stage}", $post_id, $new_stage, $sequence, $context );
		}
	}

	/**
	 * Store transition data for a status.
	 *
	 * Appends a new entry to the history log for this status.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $status  Status key.
	 * @param array  $data    Data to store (note values).
	 */
	private function store_transition_data( int $post_id, string $status, array $data ): void {
		$existing = get_post_meta( $post_id, '_vip_workflows_transition_data', true );
		if ( ! is_array( $existing ) ) {
			$existing = array();
		}

			// Initialize status array if not exists.
		if ( ! isset( $existing[ $status ] ) || ! is_array( $existing[ $status ] ) ) {
			$existing[ $status ] = array();
		}

			// Get current user info.
		$user_id = get_current_user_id();
		$user = get_userdata( $user_id );

			// Append new entry to history.
		$existing[ $status ][] = array(
			'timestamp' => current_time( 'mysql' ),
			'user_id'   => $user_id,
			'user_name' => $user ? $user->display_name : __( 'Unknown', 'vip-workflows' ),
			'notes'     => $data,
		);

		update_post_meta( $post_id, '_vip_workflows_transition_data', $existing );
	}

	/**
	 * Handle the core transition_post_status hook — the entire reconcile layer.
	 *
	 * Anyone with the core capability may change post_status through core UI /
	 * REST / CLI / cron; the workflow never fights it. When a core-driven change
	 * lands the post in an editorial region its stage does not live in, the post
	 * is re-seated at that region's entry stage (its checkpoint). Overlays
	 * (`future`/`trash`) have no regions and never move the stage; untrash needs
	 * no special case — it arrives here as trash → restored-status and the
	 * generic rule seats it.
	 *
	 * No-race scope (deliberate): the guarantee that an in-flight stage agent is
	 * not interrupted by a person is enforced only on plugin-driven transitions
	 * — transition() gates on has_pending_agent_job() and every editorial surface
	 * routes through it. A native core status change (Quick Edit, bulk edit, a
	 * direct wp_update_post) is intentionally NOT agent-gated here: core edits are
	 * legitimate and cannot carry an interactive confirm. The defense against the
	 * resulting reseat-vs-agent race is not a gate but the runner's
	 * abandon-on-supersede — the reseat below moves the stage and re-stamps the
	 * job marker's queued_at, so any in-flight run for the departed stage discards
	 * its result without clobbering the new stage's job (StageAgentRunner
	 * ::abandon_if_superseded; proven end-to-end by AgentReseatIntegrationTest).
	 *
	 * @param string   $new_status New status.
	 * @param string   $old_status Old status.
	 * @param \WP_Post $post       Post object.
	 */
	public function on_status_transition( string $new_status, string $old_status, \WP_Post $post ): void {
		if ( $new_status === $old_status ) {
			return;
		}

		// Plugin-driven writes (transition()/assign_sequence()) handle their own
		// stage meta and event dispatch; the static guard is visible across all
		// StatusManager instances in the request. Only core-driven changes fall through.
		if ( isset( self::$transition_in_progress[ $post->ID ] ) ) {
			return;
		}

		$managed = $this->resolve_managed_stage( $post->ID );
		if ( null === $managed ) {
			return;
		}

		list( $sequence, $current_stage ) = $managed;

		// The shared reseat decision — would_reseat() asks exactly this question
		// without performing the move, so predicate and behavior cannot drift.
		$entry_stage = $this->resolve_reseat_stage( $post->ID, $new_status, $sequence, $current_stage );
		if ( null === $entry_stage ) {
			return;
		}

		// Checkpoint reseat: move the stage to the target region's entry stage and
		// fire the stage-change events with cause 'core' (notifications, stage-entry
		// agents, and SLA clocks depend on them). A reseat writes no post_status —
		// core already committed it — so previous_status equals committed_status
		// here (consumers detecting go-live on the core hook use its own old/new
		// arguments instead).
		$previous_status = (string) get_post_status( $post->ID );

		update_post_meta( $post->ID, self::STAGE_META_KEY, $entry_stage );

		$context = array(
			'cause'            => 'core',
			'committed_status' => (string) get_post_status( $post->ID ),
			'previous_status'  => $previous_status,
		);

		$this->log_transition( $post->ID, $current_stage, $entry_stage, array(), $context );

		$this->dispatch_stage_change( $post->ID, $entry_stage, $current_stage, $sequence, $context );
	}

	/**
	 * Which side of the publish line a post is CURRENTLY on.
	 *
	 * The stage's region is the workflow's own answer, and normally it is the
	 * whole answer: a region-crossing move writes the region's status, and a
	 * core-driven status change re-seats the stage. The two come apart when the
	 * reseat has nowhere to go — a sequence that models no publish-region stage
	 * leaves the stage alone when core publishes the post
	 * (resolve_reseat_stage() returns null and logs it), so the post is LIVE at,
	 * say, a draft-region stage.
	 *
	 * Reading the boundary from the stage alone then compared draft to draft and
	 * let a non-bypass user unpublish a live post with no veto — the exact act
	 * the boundary is symmetric in order to prevent. The same applies to
	 * future-dating a live post.
	 *
	 * So: whichever side is publish wins. That is strictly narrowing — when the
	 * stage and the committed status agree it changes nothing, and when they
	 * disagree it fails closed.
	 *
	 * Every surface that reports "the current side of the boundary" MUST come
	 * through here — the boundary predicate, the editor's guard payload, the
	 * list-table row data and the transition guard context — or a client will
	 * warn where the server refuses.
	 *
	 * @param  int    $post_id      Post ID.
	 * @param  string $stage_region The region of the post's current stage.
	 * @return string The region the boundary is measured from.
	 */
	public function boundary_region( int $post_id, string $stage_region ): string {
		if ( 'publish' === $this->status_to_region( (string) get_post_status( $post_id ) ) ) {
			return 'publish';
		}

		return $stage_region;
	}

	/**
	 * Map a core post_status onto the editorial region it belongs to.
	 *
	 * The single authority for boundary math. Two core statuses are not regions
	 * of their own:
	 *
	 * - `future` → `publish` — scheduling is "publish, delayed".
	 * - `auto-draft` → `draft` — core's embryo of a draft.
	 *
	 * Every other status maps to itself, INCLUDING statuses that are not
	 * editorial regions at all (`trash`, `inherit`, any custom status): this
	 * method only rewrites the two aliases above and never validates its input
	 * against Sequence::EDITORIAL_STATUSES. Callers that must not treat a
	 * non-region status as a region of its own (crosses_publish_boundary()
	 * excluding overlays) do that filtering themselves, before calling here.
	 *
	 * `future` deliberately gets a DIFFERENT answer here than on the reseat
	 * path: Sequence::OVERLAY_STATUSES keeps `future` an overlay, so
	 * on_status_transition() leaves a scheduled post's stage exactly where it is
	 * and cron's later `future` → `publish` is what reseats it. This method
	 * answers "which side of the publish line does this status sit on", and a
	 * scheduled post sits on the publish side — otherwise scheduling would be a
	 * way around the publish boundary. Both mappings are correct and MUST NOT be
	 * unified: one answers workflow placement and the other answers which side
	 * of the publish boundary the status occupies.
	 *
	 * @param  string $status Core post status.
	 * @return string The editorial region the status belongs to.
	 */
	public function status_to_region( string $status ): string {
		if ( 'future' === $status ) {
			return 'publish';
		}

		if ( 'auto-draft' === $status ) {
			return 'draft';
		}

		return $status;
	}

	/**
	 * Whether moving a post to $target_status would cross the publish boundary.
	 *
	 * Symmetric on direction: both into-publish and out-of-publish return true.
	 * Unpublishing is not the lesser act — it rewinds a completed workflow on a
	 * live post — and an asymmetric rule would leave a hole (a user barred from
	 * publishing could still unpublish).
	 *
	 * The current side of the boundary comes from the post's current STAGE (the
	 * workflow's authority), not from its post_status: a post whose status core
	 * has already moved is still seated where the workflow left it, and the
	 * stage is what a crossing would disturb. The target side comes from
	 * status_to_region(), so `future` is publish-side here.
	 *
	 * Trashing crosses nothing in either direction: `trash` is an overlay that
	 * suspends the workflow in place. So is `inherit`, which is core-internal.
	 *
	 * A post with no sequence is not workflow-managed and crosses nothing. A
	 * post that IS managed but whose stage cannot be resolved fails CLOSED (see
	 * below): this predicate is the sole authority for the publish veto, so
	 * answering "no crossing" on corrupt data would silently disarm it.
	 *
	 * @param  int    $post_id       Post ID.
	 * @param  string $target_status Status the post would be moved to.
	 * @return bool
	 */
	public function crosses_publish_boundary( int $post_id, string $target_status ): bool {
		// `trash` is an overlay: it suspends the workflow in place, never moves
		// the stage, and is explicitly unaffected by the publish boundary in
		// either direction. `inherit` is core-internal (revisions, attachments)
		// and is never a user-initiated editorial move. Neither is a region, so
		// they must be filtered out before the region compare below — otherwise
		// status_to_region() hands them back verbatim and trashing a live
		// workflow post reads as an out-of-publish crossing.
		//
		// `future` is deliberately NOT carved out here: it is publish-side for
		// this predicate. See status_to_region().
		if ( in_array( $target_status, array( 'trash', 'inherit' ), true ) ) {
			return false;
		}

		$managed = $this->resolve_managed_stage( $post_id );
		if ( null === $managed ) {
			// resolve_managed_stage() has already logged if this was the
			// data-integrity case. Separate the two reasons it can answer null:
			// a post with NO sequence is simply unmanaged and crosses nothing,
			// while a post WITH one whose stage is missing or undefined is
			// corrupt. Fail closed on the latter — reporting a crossing routes
			// the user to the audited escape hatch (remove_sequence()), which
			// is the correct destination for a post whose workflow meta is
			// broken, rather than letting it slip past the veto unrecorded.
			return (bool) get_post_meta( $post_id, self::SEQUENCE_META_KEY, true );
		}

		list( $sequence, $current_stage ) = $managed;

		try {
			$current_region = $sequence->get_stage_status( $current_stage );
		} catch ( \InvalidArgumentException $e ) {
			// A stored stage missing its region is a data-integrity condition.
			// Log and fail closed, for the same reason as above.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot resolve the publish boundary for post %d moving to status "%s": %s', $post_id, $target_status, $e->getMessage() ) );
			return true;
		}

		$current_region = $this->boundary_region( $post_id, $current_region );

		$target_region = $this->status_to_region( $target_status );

		if ( $current_region === $target_region ) {
			return false;
		}

		// The regions differ, so at most one of them can be `publish`: either
		// side being publish means the move crosses the boundary.
		return 'publish' === $current_region || 'publish' === $target_region;
	}

	/**
	 * Whether a core-driven change to $target_status would move the post's stage.
	 *
	 * The prediction half of the reconcile layer: it asks resolve_reseat_stage()
	 * — the same decision on_status_transition() acts on — so the predicate and
	 * the reseat cannot drift. False for overlay statuses (`future`/`trash`) and
	 * core-internal ones, for a target region the stage already lives in, for a
	 * region the sequence does not model, and for a post with no sequence.
	 *
	 * @param  int    $post_id       Post ID.
	 * @param  string $target_status Status the post would be moved to.
	 * @return bool
	 */
	public function would_reseat( int $post_id, string $target_status ): bool {
		$managed = $this->resolve_managed_stage( $post_id );
		if ( null === $managed ) {
			return false;
		}

		list( $sequence, $current_stage ) = $managed;

		return null !== $this->resolve_reseat_stage( $post_id, $target_status, $sequence, $current_stage );
	}

	/**
	 * Remove a post from its workflow — the escape hatch behind the publish veto.
	 *
	 * Deletes the workflow identity (sequence + stage meta) and writes NO
	 * post_status: removal takes the post out of the workflow and leaves it
	 * exactly where core has it, so the user can then publish normally,
	 * unguarded, because the post is no longer workflow-managed.
	 *
	 * Any in-flight stage-agent job is cancelled by the SAME mechanism a
	 * checkpoint reseat uses, not a second one: StageAgentRunner re-checks the
	 * post's sequence and current stage before and after the ability executes,
	 * and abandons a run whose workflow identity has moved out from under it —
	 * discarding the result, clearing only its own job marker
	 * (compare-and-delete) and recording no failure. Deleting the meta here IS
	 * that signal.
	 *
	 * Removal is not reversible: re-assigning the sequence afterwards is the
	 * ordinary assign flow and seats the post at the region's checkpoint.
	 *
	 * @param  int $post_id Post ID.
	 * @return bool|\WP_Error True on success; WP_Error when the post does not exist or is not in a workflow.
	 */
	public function remove_sequence( int $post_id ): bool|\WP_Error {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return new \WP_Error( 'invalid_post', __( 'Post not found.', 'vip-workflows' ), array( 'status' => 404 ) );
		}

		$sequence_id = get_post_meta( $post_id, self::SEQUENCE_META_KEY, true );
		if ( ! $sequence_id ) {
			// Removing a post that is not in a workflow is a caller error, not a
			// no-op: the caller believed the post was managed.
			return new \WP_Error(
				'no_sequence',
				__( 'No workflow sequence for this post.', 'vip-workflows' ),
				array( 'status' => 409 )
			);
		}

		$removed_stage = (string) get_post_meta( $post_id, self::STAGE_META_KEY, true );

		// A sequence id naming a sequence that no longer exists is a
		// data-integrity condition. Log it and still remove: removal is the cure
		// for a dangling reference, and refusing would strand the post in a
		// workflow that cannot be resolved, completed, or escaped.
		$sequence = $this->sequence_repository->find( (int) $sequence_id );
		if ( ! $sequence ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d names sequence %d, which does not exist; removing the dangling workflow identity.', $post_id, (int) $sequence_id ) );
		}

		delete_post_meta( $post_id, self::SEQUENCE_META_KEY );
		delete_post_meta( $post_id, self::STAGE_META_KEY );

		// The claim is workflow state too: a post out of the workflow cannot be
		// claimed within it, and a surviving assignee would keep the post in its
		// claimer's queue with no stage to work. The controller-side removal this
		// method replaces cleared it; keep doing so.
		delete_post_meta( $post_id, '_vip_workflows_assigned_to' );

		$this->log_workflow_event(
			$post_id,
			'workflow.removed',
			array(
				'sequence_id'        => (int) $sequence_id,
				'sequence_name'      => $sequence ? $sequence->name : '',
				'removed_stage'       => $removed_stage,
				// A dangling sequence reference (logged above) is the one case
				// where no label can be proven; null rather than a fabrication.
				'removed_stage_label' => self::snapshot_stage_label( $sequence, $removed_stage ),
				'cause'               => 'workflow',
			)
		);

		return true;
	}

	/**
	 * Resolve the sequence and validated current stage of a workflow post.
	 *
	 * The shared entry guard for every consumer that reasons about a post's
	 * stage: the reconcile layer and both boundary predicates. A post with no
	 * sequence is simply unmanaged (null, silent); a post WITH a sequence
	 * whose stage meta is missing or names an undefined stage is a
	 * data-integrity bug — logged, then null. Never fabricates a stage.
	 *
	 * @param  int $post_id Post ID.
	 * @return array{0: Sequence, 1: string}|null Sequence and current stage key, or null.
	 */
	private function resolve_managed_stage( int $post_id ): ?array {
		$sequence = $this->get_sequence_for_post( $post_id );
		if ( ! $sequence ) {
			return null;
		}

		$current_stage = get_post_meta( $post_id, self::STAGE_META_KEY, true );
		if ( ! $current_stage || null === $sequence->get_status( (string) $current_stage ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d has sequence "%s" but its stage meta ("%s") is missing or undefined; cannot resolve its workflow stage.', $post_id, $sequence->slug, (string) $current_stage ) );
			return null;
		}

		return array( $sequence, (string) $current_stage );
	}

	/**
	 * Resolve the stage a core-driven move to $target_status would re-seat at.
	 *
	 * The one authority for "does this status change move the stage, and where
	 * to": on_status_transition() performs the answer, would_reseat() merely
	 * reports it. Returns null — no reseat — when the target is an overlay
	 * (`future`/`trash`, which suspend or delay without moving the stage) or a
	 * core-internal status, when the stage already lives in the target region,
	 * or when the sequence does not model that region.
	 *
	 * @param  int      $post_id       Post ID (for logging).
	 * @param  string   $target_status Status the post is (or would be) moved to.
	 * @param  Sequence $sequence     Sequence managing the post.
	 * @param  string   $current_stage The post's current stage key.
	 * @return string|null Entry stage to re-seat at, or null when nothing moves.
	 */
	private function resolve_reseat_stage( int $post_id, string $target_status, Sequence $sequence, string $current_stage ): ?string {
		// Overlays have no regions: trash suspends the workflow in place; `future`
		// is "in transit" (publish, delayed). Leave the stage.
		if ( in_array( $target_status, Sequence::OVERLAY_STATUSES, true ) ) {
			return null;
		}

		// Core-internal statuses are never matrix members.
		if ( in_array( $target_status, array( 'auto-draft', 'inherit' ), true ) ) {
			return null;
		}

		try {
			// Already consistent: the stage lives in the region core moved to.
			if ( $sequence->get_stage_status( $current_stage ) === $target_status ) {
				return null;
			}

			$entry_stage = $sequence->get_region_entry_stage( $target_status );
		} catch ( \InvalidArgumentException $e ) {
			// Data-integrity condition (a stored stage missing its region, or a used
			// region without a checkpoint) — log and bail rather than fatal a core
			// status write.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot reconcile a move to status "%s" on post %d: %s', $target_status, $post_id, $e->getMessage() ) );
			return null;
		}

		if ( null === $entry_stage ) {
			// The sequence does not model this region (e.g. core set `pending` and
			// the sequence has no pending-region stage). Tolerated: the stage stays.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d moved to status "%s", a region sequence "%s" does not model; stage "%s" left in place.', $post_id, $target_status, $sequence->slug, $current_stage ) );
			return null;
		}

		return $entry_stage;
	}

	/**
	 * Snapshot the human-readable label of a stage at event-write time.
	 *
	 * Stage keys are minted once by the sequence editor (`status_1`, `status_2`, …)
	 * and never change when the author renames the stage, so an audit row that
	 * stores only the key renders as `status_3` forever. Every workflow event that
	 * names a stage therefore snapshots the label the stage carried at the moment
	 * the event happened.
	 *
	 * History is immutable: an entry shows the name the stage had at the time, not
	 * its current name. That is deliberate — renaming a stage must not rewrite what
	 * past events were called — so no consumer resolves labels live.
	 *
	 * Returns null when no label can be proven (no sequence, or a stage the
	 * sequence no longer defines). Null is honest and lets the reader show the raw
	 * key; a fabricated label would persist a wrong value forever.
	 *
	 * @since 0.0.1
	 *
	 * @param  Sequence|null $sequence Sequence the event happened under, if resolvable.
	 * @param  string        $stage_key Stage key being named by the event.
	 * @return string|null Label, or null when none can be proven.
	 */
	private static function snapshot_stage_label( ?Sequence $sequence, string $stage_key ): ?string {
		if ( ! $sequence || '' === $stage_key ) {
			return null;
		}

		$config = $sequence->get_status( $stage_key );

		return isset( $config['label'] ) && '' !== $config['label'] ? (string) $config['label'] : null;
	}

	/**
	 * Log a status transition.
	 *
	 * @param int    $post_id     Post ID.
	 * @param string $from_status From status.
	 * @param string $to_status   To status.
	 * @param array  $options     Additional options.
	 * @param array  $context     Stage-change context ('cause', 'committed_status', 'previous_status') — the same array passed to dispatch_stage_change().
	 */
	private function log_transition( int $post_id, string $from_status, string $to_status, array $options, array $context ): void {
		global $wpdb;

		$sequence = $this->get_sequence_for_post( $post_id );

		$post = get_post( $post_id );

		// Extract note content from input_data.
		$notes = array();
		if ( ! empty( $options['input_data'] ) ) {
			foreach ( $options['input_data'] as $key => $value ) {
				// Skip the __name meta keys.
				if ( strpos( $key, '__name' ) !== false ) {
					continue;
				}
				// Skip assignment metadata (if there's a corresponding _notes key, this is just the assignment value).
				if ( isset( $options['input_data'][ $key . '_notes' ] ) ) {
					continue;
				}
				// Get the display name if available.
				$name_key = $key . '__name';
				$label = isset( $options['input_data'][ $name_key ] ) ? $options['input_data'][ $name_key ] : $key;
				$notes[] = array(
					'label' => $label,
					'value' => $value,
				);
			}
		}

		// Agent-driven transitions carry the acting ability id in `agent_actor`
		// (set by StageAgentRunner). Record actor_type='agent' + the agent id so
		// the audit trail can answer "which agent did this" — the runner
		// impersonates a capable human for the write, so actor_id alone would
		// mis-credit the human.
		$agent_actor = isset( $options['agent_actor'] ) ? (string) $options['agent_actor'] : '';
		$is_agent    = '' !== $agent_actor;

		$wpdb->insert(
			Schema::get_table_name( 'workflows_events' ),
			array(
				'post_id'    => $post_id,
				'event_type' => 'status_transition',
				'event_data' => wp_json_encode(
					array(
						'from_status'    => $from_status,
						'to_status'      => $to_status,
						'from_label'     => self::snapshot_stage_label( $sequence, $from_status ),
						'to_label'       => self::snapshot_stage_label( $sequence, $to_status ),
						'post_title'     => $post ? $post->post_title : '',
						'sequence_name'  => $sequence ? $sequence->name : '',
						'comment'         => $options['comment'] ?? null,
						'notes'           => $notes,
						'cause'           => $context['cause'],
						'previous_status' => $context['previous_status'],
						'agent_actor'     => $is_agent ? $agent_actor : null,
						// A go-back from a failed AI stage travels no authored
						// edge; the trail says so rather than implying one.
						'agent_revert'    => ! empty( $options['agent_revert'] ) ? true : null,
					)
				),
				'actor_id'   => get_current_user_id(),
				'actor_type' => $is_agent ? 'agent' : 'user',
				'created_at' => current_time( 'mysql' ),
			)
		);
	}

	/**
	 * Get transition history for a post.
	 *
	 * Returns rows in the canonical event shape — `event_type` plus the decoded
	 * `event_data` — rather than lifting a chosen few of the payload's keys to the
	 * top level. The audit log reads the table this way, and a post's history is
	 * the same stream filtered to one post and one event type, so serving it
	 * differently is what used to force the editor's history modal to render a
	 * stage change with its own code instead of the audit log's.
	 *
	 * `event_data` carries the `from_label` / `to_label` snapshots taken at write
	 * time. Consumers must render those, not the stage keys: a key is an internal
	 * identifier (`status_3`) that never changes when the stage is renamed.
	 *
	 * The sort carries `id` as a tiebreaker behind `created_at`. Timestamps have
	 * one-second resolution and a scripted run can write several transitions
	 * inside one second; with no tiebreaker, MySQL is free to order those rows
	 * differently between two queries, which makes a paged read drop and repeat
	 * entries across page boundaries.
	 *
	 * @param  int $post_id Post ID.
	 * @param  int $limit   Number of records to return.
	 * @param  int $offset  Number of records to skip.
	 * @return array
	 */
	public function get_transition_history( int $post_id, int $limit = 20, int $offset = 0 ): array {
		global $wpdb;

		$table = Schema::get_table_name( 'workflows_events' );

		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$table} WHERE post_id = %d AND event_type = 'status_transition' ORDER BY created_at DESC, id DESC LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$post_id,
				$limit,
				$offset
			)
		);

		return array_map(
			function ( $row ) {
				return array(
					'id'         => (int) $row->id,
					'event_type' => $row->event_type,
					'event_data' => json_decode( $row->event_data, true ) ?? array(),
					'actor_id'   => (int) $row->actor_id,
					'actor_type' => $row->actor_type ?? 'user',
					'created_at' => $row->created_at,
				);
			},
			$results
		);
	}

	/**
	 * Count a post's transition-history records.
	 *
	 * The companion to get_transition_history()'s paged read: a page of results
	 * cannot say how many pages there are.
	 *
	 * @param  int $post_id Post ID.
	 * @return int
	 */
	public function count_transition_history( int $post_id ): int {
		global $wpdb;

		$table = Schema::get_table_name( 'workflows_events' );

		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$table} WHERE post_id = %d AND event_type = 'status_transition'", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$post_id
			)
		);
	}

	/**
	 * The EventBus's own record of a stage change.
	 *
	 * One stage change is recorded twice over in the workflow-events table:
	 * log_transition() writes the canonical `status_transition` audit row — the
	 * one carrying the comment, the collected notes, agent attribution, and
	 * write-time label snapshots — and the automation EventBus stores its
	 * `post.stage_changed` emission in the same table as bookkeeping
	 * (automation executions reference the stored event by id). The bus row
	 * says nothing the canonical row does not, so every human-facing reader —
	 * the audit log and the recent-activity ability — excludes it via
	 * bus_bookkeeping_exclusion().
	 *
	 * @var string
	 */
	public const STAGE_CHANGE_BUS_EVENT = 'post.stage_changed';

	/**
	 * LIKE patterns matching the bus's per-stage bookkeeping families.
	 *
	 * `stage.{key}.entered` and `stage.{key}.completed` are the per-stage half
	 * of the same bookkeeping: emitted so automations can key on one stage,
	 * stored by the bus beside the generic stage change. Deliberately two
	 * narrow patterns rather than `stage.%`: EventRegistry::register() is
	 * public, so the wider `stage.` namespace is claimable by extensions whose
	 * events have no canonical row and must stay visible.
	 *
	 * @var string[]
	 */
	public const STAGE_EVENT_FAMILY_LIKES = array( 'stage.%.entered', 'stage.%.completed' );

	/**
	 * The WHERE fragment excluding the bus's stage-change bookkeeping from a read.
	 *
	 * Lives here beside event_type_label() because StatusManager owns the
	 * events table's vocabulary: the readers — AuditLogController and the
	 * recent-activity ability — compose their queries from this rather than
	 * each keeping a private copy of which rows are bookkeeping.
	 *
	 * Returned as a prepared-statement pair — a fragment whose placeholders
	 * line up with the values — so a caller folds both into whatever query it
	 * is building and $wpdb->prepare() does the quoting.
	 *
	 * @param  string $column The event-type column as the caller's query names it (`event_type`, `e.event_type`).
	 * @return array{sql: string, values: string[]} Fragment and the values that fill its placeholders.
	 */
	public static function bus_bookkeeping_exclusion( string $column ): array {
		$terms  = array( "{$column} <> %s" );
		$values = array( self::STAGE_CHANGE_BUS_EVENT );

		foreach ( self::STAGE_EVENT_FAMILY_LIKES as $like ) {
			$terms[]  = "{$column} NOT LIKE %s";
			$values[] = $like;
		}

		return array(
			'sql'    => '( ' . implode( ' AND ', $terms ) . ' )',
			'values' => $values,
		);
	}

	/**
	 * The human-readable name for an event type.
	 *
	 * The vocabulary of the workflow-events table, in one place: the audit log
	 * titles its entries and builds its type filter from this, and a post's
	 * history route serves it alongside each event so both views can name an
	 * event the same way.
	 *
	 * Two subsystems write to that table, and this map covers only the first —
	 * the transition and configuration events. The automation EventBus stores
	 * every event it emits, so anything this map misses is asked of the
	 * EventRegistry, which already names its own vocabulary and matches the
	 * per-stage `stage.*.entered` family by pattern. Without that step the audit
	 * log printed raw slugs ("stage.publish.entered") as entry titles.
	 *
	 * A slug neither knows reads as itself. The type filter is built from the
	 * distinct slugs the table holds, so it serves whatever was ever written —
	 * including rows from a version whose event type has since been renamed or
	 * retired, and the raw slug is more use to a reader than a blank.
	 *
	 * @param  string $event_type Event type slug.
	 * @return string
	 */
	public static function event_type_label( string $event_type ): string {
		$labels = array(
			'status_transition'     => __( 'Stage Changed', 'vip-workflows' ),
			'transition_blocked'    => __( 'Transition Blocked', 'vip-workflows' ),
			'tool_warnings'         => __( 'Tool Warnings', 'vip-workflows' ),
			'workflow.assigned'     => __( 'Workflow Assigned', 'vip-workflows' ),
			'workflow.removed'      => __( 'Workflow Removed', 'vip-workflows' ),
			'post.claimed'          => __( 'Post Claimed', 'vip-workflows' ),
			'post.released'         => __( 'Post Released', 'vip-workflows' ),
			'ability.executed'      => __( 'Tool Executed', 'vip-workflows' ),
			'ability.failed'        => __( 'Tool Failed', 'vip-workflows' ),
			// Configuration events. These carry no post, which the response shape
			// already allows (`post_id` is a nullable column and `post` is null here).
			'sequence.updated'     => __( 'Sequence Updated', 'vip-workflows' ),
			'sequence.activated'   => __( 'Sequence Activated', 'vip-workflows' ),
			'sequence.deactivated' => __( 'Sequence Deactivated', 'vip-workflows' ),
			// Maintenance. Carries no post and no actor: the nightly prune runs
			// on cron and belongs to no one.
			'maintenance.cleanup'  => __( 'Cleanup Run', 'vip-workflows' ),
		);

		if ( isset( $labels[ $event_type ] ) ) {
			return $labels[ $event_type ];
		}

		// Reached from REST responses only, long after the bus is constructed;
		// get_event_bus() is not nullable, so a pre-init caller fails loudly here
		// rather than quietly labelling every automation event with its slug.
		$label = Plugin::get_instance()->get_event_bus()->get_registry()->get_label( $event_type );

		return $label ?? $event_type;
	}

	/**
	 * Assign a sequence to a post.
	 *
	 * Assignment never writes post_status. The post is seated at the entry stage
	 * (checkpoint) of the region matching the status it already has, so there is
	 * nothing to write — and a caller cannot name a stage elsewhere to force one.
	 * Region crossings are transition()'s business, where
	 * current_user_can_cross_region() polices them; entering a workflow is not a
	 * crossing and must never become one.
	 *
	 * A post whose status region the sequence does not model at all therefore
	 * cannot be seated: there is nowhere in the sequence the post already is.
	 * That is refused, not repaired — assignment never moves a post to make room
	 * for itself. The author changes the status, or picks a sequence that covers
	 * it.
	 *
	 * @param  int $post_id      Post ID.
	 * @param  int $sequence_id Sequence ID.
	 * @return bool|\WP_Error True on success, WP_Error when the sequence models no stage in the post's status region, false on error.
	 */
	public function assign_sequence( int $post_id, int $sequence_id ) {
		$sequence = $this->sequence_repository->find( $sequence_id );
		if ( ! $sequence ) {
			return false;
		}

		$post = get_post( $post_id );
		if ( ! $post ) {
			return false;
		}

		if ( ! in_array( $sequence_id, $this->post_type_manager->get_sequences_for_post( $post ), true ) ) {
			return false;
		}

		// Trash suspends the workflow machinery entirely; a trashed post cannot
		// enter a workflow.
		if ( 'trash' === $post->post_status ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Refusing to assign sequence %d to post %d: the post is in the Trash.', $sequence_id, $post_id ) );
			return false;
		}

		// The region the post currently occupies (shared boundary math: `future`
		// counts as publish, `auto-draft` as draft).
		$current_region = $this->status_to_region( $post->post_status );

		// Seat at the checkpoint of the post's current region.
		$stage_key = $sequence->get_region_entry_stage( $current_region );
		if ( null === $stage_key ) {
			// The sequence has no stage in the post's region, so there is no seat
			// that leaves the status alone. Refuse rather than seat the post
			// elsewhere: entering a workflow must never be the thing that changes
			// a post's status — least of all for a scheduled post, where the
			// "publish" region it belongs to would otherwise be reached by
			// unscheduling it.
			//
			// The region is what the message names, not the raw status: a `future`
			// post is publish-side (status_to_region()), so the stage it lacks is
			// a published one.
			$region_object = get_post_status_object( $current_region );
			$region_label  = $region_object->label ?? $current_region;

			return new \WP_Error(
				'unmodeled_post_status',
				sprintf(
					/* translators: 1: sequence name. 2: post status label, e.g. "Pending Review". */
					__( 'The "%1$s" sequence has no stage with the %2$s status, so it cannot be started on this post. Change the post\'s status, or choose a sequence that covers it.', 'vip-workflows' ),
					$sequence->name,
					$region_label
				),
				array( 'status' => 400 )
			);
		}

		// The committed status before the assignment writes anything, and the
		// previous workflow identity (a re-assignment may replace an existing
		// workflow; the previous stage, if any, is the stage being exited).
		$previous_status = (string) get_post_status( $post_id );
		$previous_stage  = (string) get_post_meta( $post_id, self::STAGE_META_KEY, true );

		// The seat is inside the post's own region by construction — the entry
		// stage is selected from that region's stages — so no post_status write
		// follows and there is nothing to roll back. A scheduled post seated in
		// the publish region stays `future`.
		update_post_meta( $post_id, self::SEQUENCE_META_KEY, $sequence_id );
		update_post_meta( $post_id, self::STAGE_META_KEY, $stage_key );

		// Log the assignment.
		$this->log_workflow_event(
			$post_id,
			'workflow.assigned',
			array(
				'sequence_id'        => $sequence_id,
				'sequence_name'      => $sequence->name,
				'initial_stage'       => $stage_key,
				'initial_stage_label' => self::snapshot_stage_label( $sequence, $stage_key ),
				'cause'               => 'workflow',
			)
		);

		// Assignment fires the same stage-change dispatch as transition(), so
		// notifications and stage-entry agents see the seat.
		$this->dispatch_stage_change(
			$post_id,
			$stage_key,
			$previous_stage,
			$sequence,
			array(
				'cause'            => 'workflow',
				'committed_status' => (string) get_post_status( $post_id ),
				'previous_status'  => $previous_status,
			)
		);

		return true;
	}

	/**
	 * Hold a transition while a required metadata field is empty.
	 *
	 * The companion to run_transition_tools(): the sequence editor writes
	 * "Required" on two different things — a transition's tools and a
	 * sequence's metadata fields — and this is the half that makes the second
	 * one mean what the first one means. The refusal carries the same
	 * `hard_failures` shape, so every surface that already renders a blocked
	 * transition renders this one too.
	 *
	 * WHICH fields are missing is not decided here either:
	 * Sequence::get_missing_required_metadata() owns that, and
	 * Sequence::get_role_permitted_transitions() projects the same answer into
	 * `_locked` so no surface offers a move this gate is going to refuse. This
	 * method only turns that answer into the refusal shape.
	 *
	 * Nor does it decide WHICH MOVES have to answer for the omission. Its caller
	 * asks it only on a crossing into the publish region — see the comment block
	 * at the call site — so reaching this method already means the post is on its
	 * way live.
	 *
	 * @param  int      $post_id   Post ID.
	 * @param  Sequence $sequence The sequence this post is seated in.
	 * @return true|\WP_Error True when nothing is missing, WP_Error naming the
	 *                        empty fields otherwise.
	 */
	private function check_required_metadata( int $post_id, Sequence $sequence ) {
		$missing_labels = array();
		$hard_failures  = array();

		foreach ( $sequence->get_missing_required_metadata( $post_id ) as $field ) {
			$label            = (string) $field['label'];
			$missing_labels[] = $label;
			$hard_failures[]  = array(
				'field'    => (string) $field['key'],
				'label'    => $label,
				// The label is NOT repeated here. `label` is the row's own bold
				// prefix in ToolFailuresModal, which prints "{label}: {message}",
				// so naming the field in both halves read "Section: Section is
				// required and has no value.".
				'message'  => __( 'This field is required and has no value.', 'vip-workflows' ),
				'severity' => 'hard',
			);
		}

		if ( empty( $hard_failures ) ) {
			return true;
		}

		return new \WP_Error(
			Sequence::CODE_REQUIRED_METADATA,
			sprintf(
				/* translators: %s: list of metadata field labels, joined for the locale. */
				__( 'Transition blocked by required fields: %s', 'vip-workflows' ),
				wp_sprintf( '%l', $missing_labels )
			),
			array(
				'status'        => 422,
				'hard_failures' => $hard_failures,
				'soft_warnings' => array(),
			)
		);
	}

	/**
	 * Run required tools for a transition and check for hard failures.
	 *
	 * @param  int   $post_id              Post ID.
	 * @param  array $transition_config    Transition configuration from sequence.
	 * @param  bool  $acknowledge_warnings Whether user has acknowledged warnings.
	 * @return true|array|\WP_Error True if all pass, array with warnings_pending, or WP_Error if blocked.
	 */
	private function run_transition_tools( int $post_id, ?array $transition_config, bool $acknowledge_warnings = false ) {
		// No transition config or no required tools = pass.
		if ( ! $transition_config || empty( $transition_config['required_tools'] ) ) {
			return true;
		}

		$required_tools = $transition_config['required_tools'];
		$executor       = new AbilityExecutor();
		$settings       = AbilitySettings::get_instance();

		/*
		 * Only pass schema-valid input to abilities. Transition-eligible abilities
		 * declare additionalProperties => false, so anything beyond what their
		 * schema names fails validation before the ability ever runs. Which is why
		 * the surface a run came from travels as the executor's third argument
		 * instead: an ability that is expensive from here — and this path reads
		 * nothing but `issues`, with a user waiting on a save — can see that it was
		 * called by a transition and answer from cache rather than stalling one.
		 */
		$input = array(
			'post_id' => $post_id,
		);

		$hard_failures  = array();
		$soft_warnings  = array();
		$all_results    = array();

		foreach ( $required_tools as $tool_id ) {
			try {
				// Disabling an ability is site-wide; `required_tools` is per
				// transition. Letting the switch empty the contract removed a gate
				// from every sequence at once, unrecorded.
				if ( ! $settings->is_enabled( $tool_id ) ) {
					$hard_failures[] = array(
						'tool'     => $tool_id,
						'key'      => 'tool_disabled',
						'message'  => __( 'This required check is switched off. Re-enable it, or remove it from this transition.', 'vip-workflows' ),
						'severity' => 'hard',
					);

					continue;
				}

				$result                  = $executor->execute( $tool_id, $input, 'transition' );
				$all_results[ $tool_id ] = $result;

				// A failed result's output is empty, which reads exactly like a
				// check that ran clean. It raised no opinion to accept, so it
				// blocks and `acknowledge_warnings` cannot reach it.
				if ( ! $result->success ) {
					$reason = trim( (string) ( $result->error ?? '' ) );

					// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging of tool execution failures.
					error_log( "VIP Workflows: Tool {$tool_id} failed: " . ( '' !== $reason ? $reason : 'no reason given' ) );

					$hard_failures[] = array(
						'tool'     => $tool_id,
						'key'      => 'execution_error',
						'message'  => '' !== $reason ? $reason : __( 'Check could not be completed', 'vip-workflows' ),
						'severity' => 'hard',
					);

					continue;
				}

				// Check each issue against check modes.
				$issues = $result->output['issues'] ?? array();
				if ( ! empty( $issues ) ) {
					foreach ( $issues as $issue ) {
						// The check_key maps to the settings key (e.g., 'min_words').
						// Fall back to 'type' if 'check_key' is not present.
						$check_key = $issue['check_key'] ?? $issue['type'] ?? 'general';

						// Check if this is a hard check:
							// 1. Explicitly set as hard in settings.
							// 2. Or issue has severity 'error' or 'hard' (fallback for dynamic checks like checklist items).
						$issue_severity = $issue['severity'] ?? 'warning';
						$is_hard        = $settings->is_hard_check( $tool_id, $check_key )
						 || 'error' === $issue_severity
						 || 'hard' === $issue_severity;

						if ( $is_hard ) {
							$hard_failures[] = array(
								'tool'    => $tool_id,
								'key'     => $check_key,
								'message' => $issue['message'] ?? $issue['description'] ?? __( 'Check failed', 'vip-workflows' ),
								'severity' => 'hard',
							);
						} else {
							$soft_warnings[] = array(
								'tool'    => $tool_id,
								'key'     => $check_key,
								'message' => $issue['message'] ?? $issue['description'] ?? __( 'Check warning', 'vip-workflows' ),
								'severity' => 'soft',
							);
						}
					}
				}
			} catch ( \Exception $e ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging of tool execution failures.
				error_log( "VIP Workflows: Tool {$tool_id} threw exception: " . $e->getMessage() );
				// Same reasoning: no verdict reached. Also covers a required tool
				// whose plugin is gone — the executor throws resolving the name.
				$hard_failures[] = array(
					'tool'     => $tool_id,
					'key'      => 'execution_error',
					'message'  => $e->getMessage(),
					'severity' => 'hard',
				);
			}
		}

		// If there are hard failures, block the transition.
		if ( ! empty( $hard_failures ) ) {
			return new \WP_Error(
				'tool_check_failed',
				__( 'Transition blocked by required checks.', 'vip-workflows' ),
				array(
					'status'        => 422,
					'hard_failures' => $hard_failures,
					'soft_warnings' => $soft_warnings,
				)
			);
		}

		// If only soft warnings and user hasn't acknowledged them, return for confirmation.
		if ( ! empty( $soft_warnings ) && ! $acknowledge_warnings ) {
			return array(
				'warnings_pending' => true,
				'soft_warnings'    => $soft_warnings,
			);
		}

		// Log acknowledged warnings before proceeding.
		if ( ! empty( $soft_warnings ) ) {
			$this->log_tool_warnings( $post_id, $transition_config['to'] ?? 'unknown', $soft_warnings );
		}

		return true;
	}

	/**
	 * Log a blocked transition to the audit trail.
	 *
	 * @param int       $post_id     Post ID.
	 * @param string    $from_status Current status.
	 * @param string    $to_status   Target status.
	 * @param \WP_Error $error       The error that blocked the transition.
	 */
	private function log_blocked_transition( int $post_id, string $from_status, string $to_status, \WP_Error $error ): void {
		global $wpdb;

		$error_data = $error->get_error_data();
		$sequence  = $this->get_sequence_for_post( $post_id );

		$wpdb->insert(
			Schema::get_table_name( 'workflows_events' ),
			array(
				'post_id'    => $post_id,
				'event_type' => 'transition_blocked',
				'event_data' => wp_json_encode(
					array(
						'from_status'   => $from_status,
						'to_status'     => $to_status,
						'from_label'    => self::snapshot_stage_label( $sequence, $from_status ),
						'to_label'      => self::snapshot_stage_label( $sequence, $to_status ),
						'reason'        => $error->get_error_message(),
						'hard_failures' => $error_data['hard_failures'] ?? array(),
						'soft_warnings' => $error_data['soft_warnings'] ?? array(),
					)
				),
				'actor_id'   => get_current_user_id(),
				'actor_type' => 'user',
				'created_at' => current_time( 'mysql' ),
			)
		);
	}

	/**
	 * Log tool warnings (soft failures) during a transition.
	 *
	 * @param int    $post_id   Post ID.
	 * @param string $to_status Target status.
	 * @param array  $warnings  Array of warning details.
	 */
	private function log_tool_warnings( int $post_id, string $to_status, array $warnings ): void {
		global $wpdb;

		$sequence = $this->get_sequence_for_post( $post_id );

		$wpdb->insert(
			Schema::get_table_name( 'workflows_events' ),
			array(
				'post_id'    => $post_id,
				'event_type' => 'tool_warnings',
				'event_data' => wp_json_encode(
					array(
						'to_status' => $to_status,
						'to_label'  => self::snapshot_stage_label( $sequence, $to_status ),
						'warnings'  => $warnings,
					)
				),
				'actor_id'   => get_current_user_id(),
				'actor_type' => 'user',
				'created_at' => current_time( 'mysql' ),
			)
		);
	}

	/**
	 * Log a generic workflow event.
	 *
	 * @param int    $post_id    Post ID.
	 * @param string $event_type Event type.
	 * @param array  $event_data Event data.
	 */
	private function log_workflow_event( int $post_id, string $event_type, array $event_data ): void {
		global $wpdb;

		$wpdb->insert(
			Schema::get_table_name( 'workflows_events' ),
			array(
				'post_id'    => $post_id,
				'event_type' => $event_type,
				'event_data' => wp_json_encode( $event_data ),
				'actor_id'   => get_current_user_id(),
				'actor_type' => 'user',
				'created_at' => current_time( 'mysql' ),
			)
		);
	}
}
