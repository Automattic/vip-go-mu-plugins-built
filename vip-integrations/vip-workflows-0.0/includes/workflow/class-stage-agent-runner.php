<?php
/**
 * Stage Agent Runner — runs an AI agent when a post enters an AI-owned stage.
 *
 * A status may declare an `agent` config (see SequencesController). When a post
 * enters such a stage, this runner records a pending job and schedules the agent
 * to run asynchronously. On completion the agent's outcome is mapped, via the
 * stage's routing table, to one of the stage's configured transitions.
 *
 * Dispatch is separate from execution and routing.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

use VIPWorkflows\Abilities\AbilityExecutor;
use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\ModuleInterface;
use VIPWorkflows\Telemetry\Tracker;

/**
 * Dispatches and runs stage-owned AI agents.
 */
class StageAgentRunner implements ModuleInterface {

	/**
	 * Post meta key tracking an in-flight agent job for a post.
	 *
	 * Shape: [ stage_key, ability_id, status, queued_at, cause, from_stage ].
	 * `from_stage` is the stage the post entered the AI stage from — the
	 * destination of the "go back" action a failed run offers. Markers written
	 * before it existed simply lack it, and the failed state degrades to
	 * offering the stage's routed transitions instead.
	 *
	 * @var string
	 */
	public const JOB_META = '_vip_workflows_agent_job';

	/**
	 * Scheduled hook that runs the agent for a post + stage.
	 *
	 * @var string
	 */
	public const RUN_HOOK = 'vip_workflows_run_stage_agent';

	/**
	 * Post meta tracking the length of the current agent→agent transition chain.
	 *
	 * Reset to 0 whenever a non-agent (human) transition moves a post into an AI
	 * stage; incremented on each agent run. Bounds runaway loops between agent
	 * stages (e.g. A bumps to B which re-advances to A).
	 *
	 * @var string
	 */
	public const CHAIN_META = '_vip_workflows_agent_chain';

	/**
	 * Maximum consecutive agent-driven transitions before failing in place.
	 *
	 * A loop-guard trip never follows the stage's error route, even when one is
	 * configured: error routes are edges between stages, so routing the trip
	 * could re-enter the very cycle the guard exists to stop — each hop over
	 * the cap erroring into the next agent stage, forever.
	 *
	 * @var int
	 */
	public const MAX_CHAIN = 10;

	/**
	 * How long a job may sit `pending` before it is considered stale (seconds).
	 *
	 * A pending job older than this never ran (cron dropped it) or died mid-run;
	 * StatusManager::has_pending_agent_job() converts it to a failure so the
	 * post is not gated forever. 15 minutes; tune here if agents run longer.
	 *
	 * @var int
	 */
	public const PENDING_TTL = 15 * 60;

	/**
	 * Post meta recording the last agent run that resolved and moved the post:
	 * the stage it ran in, which of pass/fail/error fired, the stage it routed
	 * to, and when.
	 *
	 * Written only by finish(), after the exit transition succeeds — a
	 * fail-in-place resolves nothing, so it writes nothing here. The status
	 * payload surfaces it as `agent_last_run` so the editor sidebar can say
	 * which outcome fired: the job marker is cleared before the transition and
	 * the outcome otherwise survives only as a do_action argument, and reading
	 * the destination back through `agent.routing` is ambiguous the moment two
	 * outcomes route to the same stage. Never cleared — the client matches it
	 * against the stage it was watching, so a stale record from an earlier run
	 * can never claim a move it didn't make.
	 *
	 * @var string
	 */
	public const LAST_RUN_META = '_vip_workflows_agent_last_run';

	/**
	 * Revision meta key recording the ability id that authored a revision.
	 *
	 * Set on the revision post whenever an agent's content write produces one,
	 * so the revisions UI can credit the agent rather than the human the runner
	 * impersonated for capability.
	 *
	 * @var string
	 */
	public const AGENT_REVISION_META = '_vip_workflows_agent_actor';

	/**
	 * The regions a human needs `publish_posts` to move a post into.
	 *
	 * The same pair StatusManager::region_crossing_cap() gates on that capability.
	 * Both make the post readable by someone who could not read it before, so both
	 * are publication for the purposes of the agent boundary.
	 *
	 * @var string[]
	 */
	private const PUBLICATION_REGIONS = array( 'publish', 'private' );

	/**
	 * Longest token log_token() writes to a log line.
	 *
	 * @var int
	 */
	private const LOG_TOKEN_MAX = 100;

	/**
	 * The ability id currently executing a stage agent, or '' when none is.
	 *
	 * Static because the impersonation it shadows (wp_set_current_user) is itself
	 * global process state: whichever runner instance is mid-execution, the
	 * revision hook must see the acting ability. Set around execute() and cleared
	 * on every exit path.
	 *
	 * @var string
	 */
	private static string $acting_ability_id = '';

	/**
	 * The person who started the run whose exit transition is in progress.
	 *
	 * An agent's exit transition runs with nobody logged in, and its job marker is
	 * cleared before it, so a next AI stage dispatched by that transition reads its
	 * starter from here. Set around the exit transition only.
	 *
	 * @var int
	 */
	private static int $exiting_run_started_by = 0;

	/**
	 * Ability executor used to run stage agents. Injectable for testing.
	 *
	 * @var AbilityExecutor|null
	 */
	private ?AbilityExecutor $executor;

	/**
	 * Constructor.
	 *
	 * @param AbilityExecutor|null $executor Optional executor (defaults lazily).
	 */
	public function __construct( ?AbilityExecutor $executor = null ) {
		$this->executor = $executor;
	}

	/**
	 * Lazily resolve the ability executor.
	 *
	 * @return AbilityExecutor
	 */
	private function executor(): AbilityExecutor {
		return $this->executor ??= new AbilityExecutor();
	}

	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'stage-agent-runner';
	}

	/**
	 * Initialize hooks.
	 */
	public function init(): void {
		// Fires whenever a post enters a new workflow stage (StatusManager).
		add_action( 'vip_workflows_status_transition', array( $this, 'maybe_dispatch' ), 10, 5 );
		add_action( self::RUN_HOOK, array( $this, 'run_stage_agent' ), 10, 2 );

		// Attribute agent-authored revisions: tag the revision as it is saved,
		// then relabel its author in the core revisions UI.
		add_action( '_wp_put_post_revision', array( $this, 'stamp_agent_revision' ), 10, 1 );
		add_filter( 'wp_prepare_revision_for_js', array( $this, 'label_agent_revision' ), 10, 2 );
	}

	/**
	 * Dispatch the stage agent when a post enters an AI-owned stage.
	 *
	 * Fires for BOTH transition causes: a workflow edge traversal ('workflow')
	 * and a checkpoint reseat after a core-driven status change ('core') — a post
	 * core re-seats at an AI stage still gets its agent. The cause is recorded in
	 * the job payload.
	 *
	 * @param int      $post_id    Post ID.
	 * @param string   $new_status New stage key (unprefixed).
	 * @param string   $old_status Previous stage key (unprefixed).
	 * @param Sequence $sequence  Sequence for the post.
	 * @param array    $context    Transition context: 'cause' (workflow|core) and
	 *                             'committed_status'. Additive — legacy 4-arg
	 *                             emitters omit it.
	 */
	public function maybe_dispatch( int $post_id, string $new_status, string $old_status, Sequence $sequence, array $context = array() ): void {
		if ( $new_status === $old_status ) {
			return;
		}

		$status = $sequence->get_status( $new_status );
		if ( empty( $status['agent'] ) || empty( $status['agent']['ability_id'] ) ) {
			// Not an AI stage — nothing to do.
			return;
		}

		// Re-entrancy guard: never schedule a second job while one is already
		// pending for this same post + stage.
		$existing = get_post_meta( $post_id, self::JOB_META, true );
		if (
			is_array( $existing )
			&& 'pending' === ( $existing['status'] ?? '' )
			&& ( $existing['stage_key'] ?? '' ) === $new_status
		) {
			return;
		}

		// Reset the loop-guard chain when a human (non-agent) stage moved the post
		// in; only consecutive agent→agent hops accumulate toward MAX_CHAIN.
		$previous = $sequence->get_status( $old_status );
		if ( empty( $previous['agent'] ) ) {
			delete_post_meta( $post_id, self::CHAIN_META );
		}

		// Who caused this run, for telemetry: the person whose move entered the
		// stage, or, for an agent-to-agent hop, whoever started the chain.
		$started_by = get_current_user_id();
		if ( $started_by <= 0 ) {
			$started_by = self::$exiting_run_started_by;
		}

		update_post_meta(
			$post_id,
			self::JOB_META,
			array(
				'stage_key'  => $new_status,
				'ability_id' => $status['agent']['ability_id'],
				'status'     => 'pending',
				'queued_at'  => current_time( 'mysql' ),
				'cause'      => (string) ( $context['cause'] ?? 'workflow' ),
				'from_stage' => $old_status,
				'started_by' => $started_by,
			)
		);

		$scheduled = wp_schedule_single_event( time(), self::RUN_HOOK, array( $post_id, $new_status ), true );
		if ( true !== $scheduled ) {
			// An identical event (same hook + args = same post + stage) is already
			// queued — e.g. a reseat round-trip (A→B→A) re-entered this stage while
			// its original run event was still pending. That queued event will serve
			// the freshly written pending marker when it fires: success, not failure.
			if ( $this->is_duplicate_event_error( $scheduled ) ) {
				$this->log_duplicate_event( $post_id, $new_status );
				return;
			}

			// The run was never queued — a pending marker with no scheduled event
			// would gate the post forever. Fail in place so the editor surfaces
			// the error and its go-back action. Never routed through the error
			// route: this fires mid-transition (inside the stage-change action),
			// and routing would re-enter transition() reentrantly.
			$message = is_wp_error( $scheduled )
				? $scheduled->get_error_message()
				: __( 'The agent run could not be scheduled.', 'vip-workflows' );
			$this->fail_in_place(
				$post_id,
				$new_status,
				$status['agent']['ability_id'],
				$message,
				$old_status,
				array( 'stop_reason' => 'dispatch_failed' ),
				is_wp_error( $scheduled ) ? (string) $scheduled->get_error_code() : ''
			);
		}
	}

	/**
	 * Whether a wp_schedule_single_event() result is the duplicate-event error.
	 *
	 * @param  mixed $scheduled Return value of wp_schedule_single_event().
	 * @return bool
	 */
	private function is_duplicate_event_error( $scheduled ): bool {
		return is_wp_error( $scheduled ) && 'duplicate_event' === $scheduled->get_error_code();
	}

	/**
	 * Info-log that an already-queued identical run event will serve the job.
	 *
	 * @param int    $post_id   Post ID.
	 * @param string $stage_key Stage key.
	 */
	private function log_duplicate_event( int $post_id, string $stage_key ): void {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log(
			sprintf(
				'[VIP Workflows] Agent run already queued; the existing event serves the new pending job: post=%d stage=%s',
				$post_id,
				self::log_token( $stage_key )
			)
		);
	}

	/**
	 * Run the stage agent for a post, then route the exit transition.
	 *
	 * Runs the stage's agent ability, maps its outcome (pass/fail, or
	 * error on failure) through the stage's routing table to a destination
	 * status, and performs that transition as the agent. Every terminal path
	 * resolves the pending job marker so the post is never left stranded.
	 *
	 * The current stage is checked both BEFORE and AFTER execution: a stage
	 * move landing mid-run (most commonly a core-driven checkpoint reseat)
	 * cancels the run cleanly — result discarded, no failure recorded, never
	 * finished against the new stage. A reseat landing in the narrow window
	 * between the post-execution re-check and transition() (TOCTOU) is bounded
	 * by fail_in_place()'s own-stage marker guard plus transition()'s own
	 * current-stage validation — no locking.
	 *
	 * @param int    $post_id   Post ID.
	 * @param string $stage_key Stage key the agent was dispatched for.
	 */
	public function run_stage_agent( int $post_id, string $stage_key ): void {
		$status_manager = \VIPWorkflows\Plugin::get_instance()->get_status_manager();
		$sequence       = $status_manager->get_sequence_for_post( $post_id );
		if ( ! $sequence ) {
			$this->clear_job_for_stage( $post_id, $stage_key );
			return;
		}

		// If the post is no longer in the stage we were dispatched for (a human
		// or admin moved it), abandon the run without forcing a transition.
		$current_stage = get_post_meta( $post_id, StatusManager::STAGE_META_KEY, true );
		if ( $current_stage !== $stage_key ) {
			$this->clear_job_for_stage( $post_id, $stage_key );
			return;
		}

		// This run's identity, read before the ability executes: the queued_at of
		// the marker it is serving. abandon_if_superseded() compares it afterwards
		// so an A→B→A round trip (which re-enters the SAME stage with a fresh job)
		// is not mistaken for "nothing moved".
		$job_at_dispatch = get_post_meta( $post_id, self::JOB_META, true );
		$run_token       = is_array( $job_at_dispatch ) ? (string) ( $job_at_dispatch['queued_at'] ?? '' ) : '';

		// Where the post came from — the failed state's go-back destination.
		// Carried through every fail-in-place so the marker a human sees still
		// knows the way back.
		$from_stage = is_array( $job_at_dispatch ) ? (string) ( $job_at_dispatch['from_stage'] ?? '' ) : '';

		// Who the run's telemetry is recorded as. See maybe_dispatch().
		$started_by = is_array( $job_at_dispatch ) ? (int) ( $job_at_dispatch['started_by'] ?? 0 ) : 0;

		$status = $sequence->get_status( $stage_key );
		$agent  = $status['agent'] ?? null;

		// The ability id is what makes a stage AI-owned — the same test
		// maybe_dispatch(), agent_routed_targets() and the canvas apply. Only
		// its absence means the config changed under us and the queued job
		// serves a stage that no longer has an agent.
		if ( empty( $agent['ability_id'] ) ) {
			$this->clear_job_for_stage( $post_id, $stage_key );
			return;
		}

		$ability_id = $agent['ability_id'];

		// Routing may be empty — every outcome is optional, an empty map
		// included. The run still executes: its verdict then has no route, and
		// resolves through the same fail-in-place-with-go-back path any
		// unrouted outcome takes. This guard used to demand routing too and
		// silently cleared the job otherwise, which was sound only while the
		// validator made an empty map unwritable; once it became authorable,
		// that read stranded the post with no marker, no error, and no exits.
		$routing = is_array( $agent['routing'] ?? null ) ? $agent['routing'] : array();

		// Loop guard: bound consecutive agent→agent transitions. The counter is
		// READ here and written exactly once, in finish(), immediately before the
		// exit transition — a run counts toward the chain only when it actually
		// moves the post, and every path that does not transition (abandons,
		// throws, failed exits, this cap) simply never writes.
		//
		// It used to increment eagerly here and restore the pre-increment value on
		// each of those paths. A restore is a blind write of a value read before
		// the ability ran, so a concurrent run's increment landing in that window
		// was discarded — the loop guard silently lost hops and stopped bounding
		// the thing it exists to bound.
		$chain = (int) get_post_meta( $post_id, self::CHAIN_META, true ) + 1;

		if ( $chain > self::MAX_CHAIN ) {
			// Always in place, never the error route — see MAX_CHAIN.
			$this->fail_in_place(
				$post_id,
				$stage_key,
				$ability_id,
				__( 'Stopped after too many consecutive agent transitions (possible workflow loop).', 'vip-workflows' ),
				$from_stage,
				array(
					'stop_reason' => 'loop_guard',
					'chain'       => $chain,
					'started_by'  => $started_by,
				)
			);
			return;
		}

		// The agent writes the post on the server, which a shared editing session
		// never hears about, so its changes and theirs would overwrite each
		// other (see CoEditing). transition() refuses a person's move in while
		// the post is shared; this catches agent-to-agent hops and anyone who
		// opened the post after the move. In place, so Re-run works once they
		// have left.
		if ( CoEditing::is_shared( $post_id ) ) {
			$this->fail_in_place(
				$post_id,
				$stage_key,
				$ability_id,
				__( 'The AI agent did not run because more than one person had this post open. Re-run it once only one person is editing.', 'vip-workflows' ),
				$from_stage,
				array(
					'stop_reason' => 'co_editing',
					'chain'       => $chain,
					'started_by'  => $started_by,
				)
			);
			return;
		}

		// Stage agents run in an async (cron) context with no logged-in user, so
		// the ability's permission_callback (typically current_user_can('edit_posts'))
		// would fail. Execute as the capable post author and restore afterward.
		// The impersonated human owns the write for capability purposes, so any
		// revision the agent produces is natively
		// authored by them; self::$acting_ability_id lets stamp_agent_revision()
		// tag that revision with the agent that actually made the edit, and the
		// revisions UI is relabelled from there.
		$previous_user = get_current_user_id();
		$actor_user    = $this->resolve_agent_user( $post_id );

		// No capable owner means no identity this run may legitimately borrow.
		// Stop in place regardless of the configured error route: an error-route
		// transition would require the same missing actor and would replace this
		// actionable failure with a generic transition error.
		if ( $actor_user <= 0 ) {
			$this->fail_in_place(
				$post_id,
				$stage_key,
				$ability_id,
				__( 'The author cannot edit posts, so the agent didn’t run. Reassign the post or move it back.', 'vip-workflows' ),
				$from_stage,
				array(
					'stop_reason' => 'no_actor',
					'chain'       => $chain,
					'started_by'  => $started_by,
				)
			);
			return;
		}

		wp_set_current_user( $actor_user );
		self::$acting_ability_id = $ability_id;

		try {
			$result = $this->executor()->execute( $ability_id, array( 'post_id' => $post_id ) + ( $agent['settings'] ?? array() ), 'agent' );
		} catch ( \Throwable $e ) {
			self::$acting_ability_id = '';
			wp_set_current_user( $previous_user );

			// A stage move landing mid-execution abandons the thrown run just
			// like a completed one — a failure for a departed stage is stale.
			if ( $this->abandon_if_superseded( $post_id, $stage_key, $run_token ) ) {
				return;
			}

			$this->resolve_error(
				$post_id,
				$stage_key,
				$ability_id,
				$e->getMessage(),
				get_class( $e ),
				$routing,
				$from_stage,
				$chain,
				$actor_user,
				array(
					'started_by'  => $started_by,
					'chain'       => $chain,
					'outcome'     => 'error',
					'stop_reason' => 'execution_error',
				)
			);
			return;
		}

		self::$acting_ability_id = '';
		wp_set_current_user( $previous_user );

		// The stage can move while the agent executes — most commonly a
		// core-driven checkpoint reseat (a core status change re-seating the
		// post at the target region's entry stage). A completed run whose stage
		// is gone is cancelled cleanly, never finished against the new stage:
		// routing its exit transition would fire from a stage the post no
		// longer occupies, and recording a failure would strand a stale error.
		// Abandon exactly like the pre-execution check; the new stage's own
		// dispatch (either cause) proceeds independently.
		if ( $this->abandon_if_superseded( $post_id, $stage_key, $run_token ) ) {
			return;
		}

		$outcome = $this->outcome_from_result( $result );

		// What telemetry reports about this run, carried to wherever it concludes.
		$run = array(
			'started_by'  => $started_by,
			'chain'       => $chain,
			'outcome'     => $outcome,
			'duration_ms' => empty( $result->unmet_requirements ) ? (int) $result->duration_ms : null,
			'stop_reason' => 'error' === $outcome ? 'execution_error' : null,
		);

		// An execution error (WP_Error / unrecognized result) follows the
		// stage's error route when the sequence configures one, and fails in
		// place otherwise — the error path is opt-in, per stage. A pass/fail
		// *verdict* is a successful run and routes normally.
		if ( 'error' === $outcome ) {
			$message = ! empty( $result->error )
				? $result->error
				: __( 'The agent returned an unrecognized result.', 'vip-workflows' );
			// A failure the ability built itself carries no code; a successful run
			// with no recognized verdict is a contract violation, not a failure.
			if ( ! empty( $result->error_code ) ) {
				$error_code = $result->error_code;
			} else {
				$error_code = empty( $result->success ) ? 'ability_failure' : 'unrecognized_result';
			}
			$this->resolve_error( $post_id, $stage_key, $ability_id, $message, $error_code, $routing, $from_stage, $chain, $actor_user, $run );
			return;
		}

		// A verdict the stage does not route is a configuration gap, which is an
		// error: it takes the error route when one exists (see route()) and
		// otherwise stops here — the post stays put with a visible, actionable
		// message rather than being moved to a destination nobody configured.
		$target = $this->route( $outcome, $routing );
		if ( null === $target ) {
			$this->fail_in_place(
				$post_id,
				$stage_key,
				$ability_id,
				sprintf(
					/* translators: %s: agent outcome key (pass or fail). */
					__( 'No route for the “%s” outcome. Add one in the sequence editor, or move the post back.', 'vip-workflows' ),
					$outcome
				),
				$from_stage,
				array_merge( $run, array( 'stop_reason' => 'unrouted_outcome' ) )
			);
			return;
		}

		// A verdict with no route of its own fell back to the error route (see
		// route()), and is reported as error-routed even though its outcome is not
		// `error`.
		$run['error_routed'] = empty( $routing[ $outcome ] );

		$this->finish( $post_id, $stage_key, $ability_id, $target, $outcome, $chain, $actor_user, $from_stage, '', $run );
	}

	/**
	 * Resolve an execution error: route it, or fail in place.
	 *
	 * The error path is opt-in per stage. A routing map carrying an `error`
	 * destination sends the errored run there — an agent-driven transition like
	 * any other, counted by the loop guard and audited with the error message as
	 * its comment. Without one, the run fails in place and the editor offers the
	 * way back.
	 *
	 * Not every failure comes here. The loop guard (see MAX_CHAIN), a dispatch
	 * that could not be scheduled, and an exit transition that itself failed
	 * always fail in place — routing those would re-enter the machinery that
	 * just failed.
	 *
	 * @param int    $post_id    Post ID.
	 * @param string $stage_key  Stage the agent ran (or was to run) in.
	 * @param string $ability_id Agent ability ID.
	 * @param string $message    The error.
	 * @param string $error_code Machine-readable cause (WP_Error code or exception class), for logs.
	 * @param array  $routing    The stage's routing map.
	 * @param string $from_stage Stage the post entered from ('' when unknown).
	 * @param int    $chain      Chain length this run represents.
	 * @param int    $actor_user User the routed exit transition acts for.
	 * @param array  $run        Telemetry details for the run. See run_stage_agent().
	 */
	private function resolve_error( int $post_id, string $stage_key, string $ability_id, string $message, string $error_code, array $routing, string $from_stage, int $chain, int $actor_user, array $run = array() ): void {
		if ( ! empty( $routing['error'] ) ) {
			$this->finish( $post_id, $stage_key, $ability_id, $routing['error'], 'error', $chain, $actor_user, $from_stage, $message, $run, $error_code );
			return;
		}

		$this->fail_in_place( $post_id, $stage_key, $ability_id, $message, $from_stage, $run, $error_code );
	}

	/**
	 * Abandon the run when it no longer owns the post's current stage job.
	 *
	 * Two ways that happens: the post left the dispatched stage mid-execution, or
	 * it left and came back and a NEWER run was queued for the same stage. Clears
	 * the run's own job marker (compare-and-delete, own-stage guarded) unless a
	 * newer run owns it, and logs the discard. Never records a failure, never
	 * fires an agent action, and never touches the loop-guard chain — an
	 * abandoned run did not transition, so it simply never wrote to it. The
	 * current stage's own dispatch proceeds independently.
	 *
	 * @param  int    $post_id   Post ID.
	 * @param  string $stage_key Stage the run was dispatched for.
	 * @param  string $run_token The `queued_at` of the marker this run was dispatched for.
	 * @return bool True when the run was abandoned.
	 */
	private function abandon_if_superseded( int $post_id, string $stage_key, string $run_token ): bool {
		$current_stage = get_post_meta( $post_id, StatusManager::STAGE_META_KEY, true );
		$job           = get_post_meta( $post_id, self::JOB_META, true );

		// The stage key alone cannot see a round trip. A reseat out of this stage
		// and back into it (A→B→A) leaves the post exactly where this run was
		// dispatched, but the re-entry queued a FRESH job — the one this PR's own
		// `duplicate_event` branch exists to serve. Finishing against it would
		// route the post on a stale outcome AND delete the new run's marker
		// (clear_job_for_stage matches on stage key, which still matches). The
		// marker's queued_at is what distinguishes the two runs.
		$superseded = is_array( $job )
			&& 'pending' === ( $job['status'] ?? '' )
			&& (string) ( $job['stage_key'] ?? '' ) === $stage_key
			&& (string) ( $job['queued_at'] ?? '' ) !== $run_token;

		if ( $current_stage === $stage_key && ! $superseded ) {
			return false;
		}

		// Only ever clear a marker this run owns. A newer dispatch's marker is
		// what gates the post until its own run finishes.
		if ( ! $superseded ) {
			$this->clear_job_for_stage( $post_id, $stage_key );
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log(
			sprintf(
				'[VIP Workflows] Agent run abandoned mid-execution, outcome discarded: post=%d stage=%s reason=%s current=%s',
				$post_id,
				self::log_token( $stage_key ),
				$superseded ? 'superseded' : 'stage_moved',
				self::log_token( (string) $current_stage )
			)
		);

		return true;
	}

	/**
	 * Resolve a capable user to run the agent as, in the user-less cron context.
	 *
	 * The post author, and only the post author — they own the content, so the
	 * revision the agent produces is attributed to the right person and the
	 * agent can do nothing they could not have done by hand.
	 *
	 * This used to fall back to the first administrator when the author could
	 * not edit posts, which inverted the intent: the run gained privilege
	 * precisely when the content owner had least. On seeded dev content, where
	 * posts are authored by subscribers, that fallback was the common path
	 * rather than the exception.
	 *
	 * Returning 0 makes the caller abandon the run and surface it for a human
	 * instead. A stalled agent is visible and recoverable; one running as
	 * somebody else is neither.
	 *
	 * @param  int $post_id Post ID.
	 * @return int User ID, or 0 when the author cannot run the agent.
	 */
	private function resolve_agent_user( int $post_id ): int {
		$author = (int) get_post_field( 'post_author', $post_id );

		if ( $author > 0 && user_can( $author, 'edit_posts' ) ) {
			return $author;
		}

		return 0;
	}

	/**
	 * Tag a freshly saved revision with the agent that authored it.
	 *
	 * Hooked on `_wp_put_post_revision`, which fires for every revision core
	 * saves. Only stamps when a stage agent is mid-execution (self::$acting_ability_id
	 * set) — human edits and non-agent writes pass through untouched, so no
	 * spurious meta is written when the agent makes no content change.
	 *
	 * @param  int $revision_id Newly created revision post ID.
	 * @return void
	 */
	public function stamp_agent_revision( int $revision_id ): void {
		if ( '' === self::$acting_ability_id ) {
			return;
		}

		update_post_meta( $revision_id, self::AGENT_REVISION_META, self::$acting_ability_id );
	}

	/**
	 * Relabel an agent-authored revision's author in the core revisions UI.
	 *
	 * Hooked on `wp_prepare_revision_for_js` (the data source for the revisions
	 * browser and the compare-revisions screen). When the revision carries the
	 * agent tag, its author label is replaced with the agent's name — resolved
	 * the same way as the audit trail — marked "(agent)" so it reads distinctly
	 * from a human author. Untagged revisions are returned unchanged.
	 *
	 * @param  array    $data     Revision data prepared for the JS UI.
	 * @param  \WP_Post $revision Revision post object.
	 * @return array
	 */
	public function label_agent_revision( array $data, $revision ): array {
		$ability_id = (string) get_post_meta( $revision->ID, self::AGENT_REVISION_META, true );
		if ( '' === $ability_id ) {
			return $data;
		}

		$agent_name = Actor::name_for(
			array(
				'actor_type'  => 'agent',
				'agent_actor' => $ability_id,
			)
		);

		/* translators: %s: agent name. */
		$data['author'] = sprintf( __( '%s (agent)', 'vip-workflows' ), $agent_name );

		return $data;
	}

	/**
	 * Determine the routing outcome from an ability result.
	 *
	 * A failed execution, or a success whose output carries no recognized
	 * `status`, is treated as `error` (fail loud, route to human review).
	 *
	 * @param \VIPWorkflows\Abilities\AbilityResult $result Ability result.
	 * @return string One of pass|fail|error.
	 */
	private function outcome_from_result( $result ): string {
		if ( empty( $result->success ) ) {
			return 'error';
		}

		$status = $result->output['status'] ?? '';
		if ( in_array( $status, array( 'pass', 'fail' ), true ) ) {
			return $status;
		}

		// Successful run with an unrecognized/absent status is a contract
		// violation — surface it via the error route rather than guessing.
		return 'error';
	}

	/**
	 * Resolve a verdict to a destination status via the routing table.
	 *
	 * A verdict the stage does not route is a configuration gap, and a gap is an
	 * error — so it falls back to the `error` destination when the stage opts
	 * into one. The error route itself is optional: with neither the verdict nor
	 * `error` routed this returns null and the caller fails the run in place.
	 * Nothing here invents a destination — routing a post somewhere the author
	 * never asked for is worse than stopping with a visible error.
	 *
	 * @param string $outcome Outcome key (pass or fail).
	 * @param array  $routing Routing map.
	 * @return string|null Destination status key, or null when the outcome is unrouted and the map carries no `error` destination.
	 */
	private function route( string $outcome, array $routing ): ?string {
		if ( ! empty( $routing[ $outcome ] ) ) {
			return $routing[ $outcome ];
		}
		return ! empty( $routing['error'] ) ? $routing['error'] : null;
	}

	/**
	 * Whether an agent route between two stages is held because it publishes.
	 *
	 * Crossing INTO `publish` or `private` from outside them is held unless the
	 * sequence opts in with `allow_agent_publish`. A move that starts on that side
	 * publishes nothing new and is not held. The one rule the runner stops on
	 * (publication_hold) and StatusManager withholds the route from people on
	 * (agent_routed_targets), so the sequence editor's disabled edge, the offered
	 * transitions and the run agree.
	 *
	 * @param  Sequence $sequence Sequence the stages belong to.
	 * @param  string   $from_key The AI stage.
	 * @param  string   $to_key   Stage its outcome routes to.
	 * @return bool True when the route is held.
	 * @throws \InvalidArgumentException When the destination's region cannot be read.
	 */
	public static function holds_publication( Sequence $sequence, string $from_key, string $to_key ): bool {
		// Strict `true`: import_sequence() stores config verbatim, and "false" is
		// truthy in PHP. Waives this policy only — StatusManager evaluates the run's
		// actor against the same crossing, so an opted-in sequence still cannot
		// publish for an author who could not.
		if ( true === ( $sequence->get_settings()['allow_agent_publish'] ?? false ) ) {
			return false;
		}

		if ( ! in_array( $sequence->get_stage_status( $to_key ), self::PUBLICATION_REGIONS, true ) ) {
			return false;
		}

		try {
			$from_region = $sequence->get_stage_status( $from_key );
		} catch ( \InvalidArgumentException $e ) {
			$from_region = '';
		}

		// Already readable: this move publishes nothing new.
		return ! in_array( $from_region, self::PUBLICATION_REGIONS, true );
	}

	/**
	 * Why this move has to wait for a person, or '' when the agent may take it.
	 *
	 * $target was chosen by a model reading author-controlled content. The verdict
	 * nonce and fencing raise the cost of steering it without closing it — see
	 * docs/reference/stage-agent-verdict-threat-model.md, "Residual risk". A wrong
	 * verdict between editorial stages costs a review cycle; making a post readable
	 * cannot be undone by moving a stage, so it waits for a person unless the
	 * sequence opts in.
	 *
	 * The boundary is the one StatusManager::region_crossing_cap() draws: crossing
	 * INTO `publish` or `private` is what a human needs `publish_posts` for. Both
	 * regions, because both make the post readable by someone who could not read it
	 * before. A move that starts on that side publishes nothing new and is not held,
	 * which is what keeps an agent usable in a post-publish stage.
	 *
	 * @param  int    $post_id   Post ID.
	 * @param  string $from_key  Stage the post is seated in.
	 * @param  string $to_key    Stage the agent routed to.
	 * @param  string $outcome   Outcome that chose the route.
	 * @param  string $error_code Machine-readable cause on an error-routed run (WP_Error
	 *                            code or exception class), '' otherwise. Never the
	 *                            message: that text comes from extensions and
	 *                            providers, and is not fit for the server log.
	 * @param  string $error      The error an errored run reported, '' otherwise. The
	 *                            same text fail_in_place() stores in the job marker
	 *                            for an errored run with no route, so a held error
	 *                            route tells the editor as much as an unrouted one.
	 *                            Shown to the editor, never logged.
	 * @return array{message: string, reason: string}|null Message for the editor and a stop
	 *               reason for telemetry (publish_held, left_workflow or
	 *               unreadable_region), or null to proceed.
	 */
	private function publication_hold( int $post_id, string $from_key, string $to_key, string $outcome, string $error_code, string $error = '' ): ?array {
		$status_manager = \VIPWorkflows\Plugin::get_instance()->get_status_manager();
		$sequence       = $status_manager->get_sequence_for_post( $post_id );

		if ( ! $sequence ) {
			// The post left the workflow mid-run. transition() has nothing to move it
			// against either; refusing here keeps the boundary owned by this method.
			return array(
				'message' => __( 'This post is no longer in a workflow, so the agent could not complete its move.', 'vip-workflows' ),
				'reason'  => 'left_workflow',
			);
		}

		try {
			$held = self::holds_publication( $sequence, $from_key, $to_key );
		} catch ( \InvalidArgumentException $e ) {
			// A destination whose region cannot be read cannot be cleared as
			// non-publishing. Held rather than passed through: the check belongs to
			// this method, not to whatever the transition happens to refuse next.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'[VIP Workflows] Agent route held, destination region unreadable: post=%d stage=%s target=%s outcome=%s code=%s',
					$post_id,
					self::log_token( $from_key ),
					self::log_token( $to_key ),
					self::log_token( $outcome ),
					self::log_token( get_class( $e ) )
				)
			);

			return array(
				'message' => sprintf(
					/* translators: %s: destination stage key. */
					__( 'Stage “%s” has no status. Fix it in the sequence editor, or move the post back.', 'vip-workflows' ),
					$to_key
				),
				'reason'  => 'unreadable_region',
			);
		}

		if ( ! $held ) {
			return null;
		}

		// Only the code is logged: the message is free-form text from an extension
		// or provider and may carry secrets or line breaks. It goes to the editor
		// in the hold message below instead.
		if ( 'error' === $outcome && '' !== $error_code ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'[VIP Workflows] Agent error route held at publish boundary: post=%d stage=%s target=%s outcome=%s code=%s',
					$post_id,
					self::log_token( $from_key ),
					self::log_token( $to_key ),
					self::log_token( $outcome ),
					self::log_token( $error_code )
				)
			);
		}

		// Points at the sequence, not at a manual move: a held route is withheld
		// from people while the agent owns the stage
		// (StatusManager::agent_routed_targets), so "transition it yourself" named
		// something nobody could reach.
		//
		// An errored run did not complete, and saying it did hides the failure
		// the editor has to fix. It gets its own message, carrying the error the
		// run reported — the one place that error reaches the editor, since the
		// hold replaces the message an unrouted error would have stored.
		if ( 'error' === $outcome ) {
			$message = '' !== $error
				? sprintf(
					/* translators: %s: the error the agent run reported. */
					__( 'The agent run failed, and its error route would publish this post. AI stages are not permitted to publish. Error: %s', 'vip-workflows' ),
					$error
				)
				: __( 'The agent run failed, and its error route would publish this post. AI stages are not permitted to publish.', 'vip-workflows' );
		} else {
			$message = __( 'The agent run completed, but attempted to publish this post. AI stages are not permitted to publish.', 'vip-workflows' );
		}

		return array(
			'message' => $message,
			'reason'  => 'publish_held',
		);
	}

	/**
	 * Reduce a value to a bounded token that is safe in a server log line.
	 *
	 * Keeps letters, digits, `_`, `.`, `-`, `\` (namespaced class names) and `/`
	 * (ability IDs) and caps the length, so nothing written through it can break
	 * the line, forge another entry or carry prose.
	 *
	 * @param  string $value Identifier-like value: a key, an error code, an ability ID or a class name.
	 * @return string The token, or `-` when nothing safe remains.
	 */
	public static function log_token( string $value ): string {
		$token = substr( (string) preg_replace( '#[^A-Za-z0-9_.\\\\/-]#', '', $value ), 0, self::LOG_TOKEN_MAX );

		return '' === $token ? '-' : $token;
	}

	/**
	 * Clear the job marker and perform the agent's exit transition.
	 *
	 * The marker is cleared before the transition so the destination stage's
	 * dispatch and the human-transition gate see no stale pending job.
	 *
	 * This is also the ONE place the agent→agent loop guard is written. It has to
	 * land before the transition, because the transition is what dispatches the
	 * next agent, and it must be written only here, because a run that never
	 * reaches this point never moved the post.
	 *
	 * @param int    $post_id    Post ID.
	 * @param string $stage_key  Stage the agent ran in.
	 * @param string $ability_id Agent ability ID (actor).
	 * @param string $target     Destination status key.
	 * @param string $outcome    Outcome (pass|fail|error) for the fired action.
	 * @param int    $chain      Chain length this run represents (pre-run value + 1).
	 * @param int    $actor_user User the run acts for; the transition's capability
	 *                           checks are evaluated against them.
	 * @param string $from_stage Stage the post entered from, kept for a fail-in-place fallback.
	 * @param string $comment    Audit comment for the exit transition — the error message on an error-routed run, '' otherwise.
	 * @param array  $run        Telemetry details for the run. See run_stage_agent().
	 * @param string $error_code Machine-readable cause on an error-routed run, '' otherwise.
	 */
	private function finish( int $post_id, string $stage_key, string $ability_id, string $target, string $outcome, int $chain, int $actor_user, string $from_stage = '', string $comment = '', array $run = array(), string $error_code = '' ): void {
		// Before anything is cleared or counted: a move that makes the post
		// readable waits for a person. Checked here rather than at the call sites
		// because every agent-driven move arrives through this method — a routed
		// error is an exit transition like any other, and routing one at a
		// publishing stage must not be the cheap way around the boundary.
		$hold = $this->publication_hold( $post_id, $stage_key, $target, $outcome, $error_code, 'error' === $outcome ? $comment : '' );
		if ( null !== $hold ) {
			$this->fail_in_place( $post_id, $stage_key, $ability_id, $hold['message'], $from_stage, array_merge( $run, array( 'stop_reason' => $hold['reason'] ) ) );
			return;
		}

		// Clear the marker before transitioning so an agent→agent chain (the
		// destination re-dispatching) is not clobbered by a stale delete. Only
		// this run's own marker is cleared — a job a newer stage already owns
		// must survive a slow, stale run finishing late.
		$this->clear_job_for_stage( $post_id, $stage_key );

		// Count this hop before the move it is counting. A failed transition
		// leaves the count standing rather than restoring it: the post stays in
		// the AI stage, and the two ways out of that state — Re-run, or a human
		// transition into the stage — both reset the counter to zero.
		update_post_meta( $post_id, self::CHAIN_META, $chain );

		// `acknowledge_warnings` is deliberately not set. It used to be passed
		// as true on every agent transition, which dismissed the soft warnings a
		// transition's tools raise — the ones a person moving this post would
		// have been shown and asked to confirm. An agent should not answer that
		// question on someone's behalf.
		//
		// The pending-agent-job warning is a separate case and is already exempt
		// via `agent_actor`, so an agent's own exit transition still cannot warn
		// about itself and deadlock the stage.
		$options = array(
			'agent_actor'      => $ability_id,

			/*
			 * The identity this run acts for. The previous user is restored before
			 * this point, so under cron there is nobody to authorise against.
			 * Passed explicitly rather than leaving the impersonation in place:
			 * that would authorise against whatever the request carried, and an
			 * administrator author would newly satisfy
			 * can_user_bypass_tool_checks() — one escalation traded for another.
			 */
			'agent_actor_user' => $actor_user,

			// Who the transition's gate events are recorded as. See maybe_dispatch().
			'telemetry_user'   => (int) ( $run['started_by'] ?? 0 ),
		);

		// An error-routed exit carries its error as the transition's audit
		// comment — the destination's reviewer reads WHY the post arrived from
		// the same history entry that says it did.
		if ( '' !== $comment ) {
			$options['comment'] = $comment;
		}

		$status_manager               = \VIPWorkflows\Plugin::get_instance()->get_status_manager();
		self::$exiting_run_started_by = (int) ( $run['started_by'] ?? 0 );
		try {
			$transitioned = $status_manager->transition( $post_id, $target, $options );
		} finally {
			self::$exiting_run_started_by = 0;
		}

		// transition() answers with a warnings array rather than a WP_Error when
		// it stops for soft warnings, so `true` is the only success. Treating any
		// non-error return as success would mark the run complete while the post
		// never moved.
		if ( ! is_wp_error( $transitioned ) && true !== $transitioned ) {
			$this->hold_for_warnings(
				$post_id,
				$stage_key,
				$ability_id,
				$target,
				$outcome,
				is_array( $transitioned ) ? $transitioned : array(),
				$comment,
				$run
			);
			return;
		}
		if ( is_wp_error( $transitioned ) ) {
			// The exit transition itself failed (e.g. a required tool on it hard-
			// failed). The post is still in the AI stage — fail in place so a human
			// sees it and can act, rather than leaving it silently stranded. Always
			// in place, even for a stage with an error route: the error route is an
			// exit transition too, and this exit just refused.
			$this->fail_in_place( $post_id, $stage_key, $ability_id, $transitioned->get_error_message(), $from_stage, array_merge( $run, array( 'stop_reason' => 'exit_refused' ) ), (string) $transitioned->get_error_code() );
			return;
		}

		// The move happened; record which outcome made it. After the transition,
		// not before — a refused exit resolves nothing worth reporting.
		update_post_meta(
			$post_id,
			self::LAST_RUN_META,
			array(
				'stage_key'   => $stage_key,
				'outcome'     => $outcome,
				'to'          => $target,
				'finished_at' => current_time( 'mysql' ),
			)
		);

		do_action( 'vip_workflows_agent_completed', $post_id, $ability_id, $outcome );

		$this->record_run( $post_id, 'error' === $outcome || ! empty( $run['error_routed'] ) ? 'error_routed' : 'routed', $run );
	}

	/**
	 * Preserve a soft-warning decision for a person without marking the run failed.
	 *
	 * The editor replays this exact transition only after a person confirms the
	 * warnings. Keeping the destination, raw warnings, outcome, and audit comment
	 * together means that acknowledgement cannot turn an error route into an
	 * ordinary transition or lose why it reached human review.
	 *
	 * @param int    $post_id     Post ID.
	 * @param string $stage_key   Stage the agent ran in.
	 * @param string $ability_id  Agent ability ID.
	 * @param string $target      Destination status key.
	 * @param string $outcome     Outcome (pass|fail|error) for the held action.
	 * @param array  $transitioned Warning payload from StatusManager::transition().
	 * @param string $comment     Audit comment to preserve for the human transition.
	 * @param array  $run         Telemetry details for the run. See run_stage_agent().
	 */
	private function hold_for_warnings( int $post_id, string $stage_key, string $ability_id, string $target, string $outcome, array $transitioned, string $comment, array $run = array() ): void {
		$existing = get_post_meta( $post_id, self::JOB_META, true );
		if ( is_array( $existing ) && ( $existing['stage_key'] ?? '' ) !== '' && ( $existing['stage_key'] ?? '' ) !== $stage_key ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'[VIP Workflows] Stale warning marker suppressed, another stage owns the job: post=%d stage=%s owner=%s',
					$post_id,
					self::log_token( $stage_key ),
					self::log_token( (string) $existing['stage_key'] )
				)
			);
			return;
		}

		update_post_meta(
			$post_id,
			self::JOB_META,
			array(
				'stage_key'     => $stage_key,
				'ability_id'    => $ability_id,
				'status'        => 'warnings_pending',
				'to_status'     => $target,
				'outcome'       => $outcome,
				'soft_warnings' => is_array( $transitioned['soft_warnings'] ?? null ) ? $transitioned['soft_warnings'] : array(),
				'comment'       => $comment,
				'held_at'       => current_time( 'mysql' ),
			)
		);

		$this->record_run( $post_id, 'held_for_warnings', $run );
	}

	/**
	 * Record an agent execution failure without moving the post.
	 *
	 * Marks the job `failed` (retaining the error for the editor to surface) and
	 * leaves the post in the AI stage. The editor then shows the error with one
	 * action: go back to `from_stage` (StatusManager::revert_failed_agent_stage).
	 * When no origin is recorded — a marker predating `from_stage`, or one whose
	 * stage the sequence no longer defines — the stage's routed transitions are
	 * offered instead, so a failed agent never strands the post.
	 *
	 * @param int    $post_id    Post ID.
	 * @param string $stage_key  Stage the agent ran in.
	 * @param string $ability_id Agent ability ID.
	 * @param string $message    Failure message.
	 * @param string $from_stage Stage the post entered from ('' when unknown).
	 * @param array  $run        Telemetry details for the run, including why it stopped.
	 * @param string $error_code Machine-readable cause (WP_Error code or exception class), for logs.
	 */
	private function fail_in_place( int $post_id, string $stage_key, string $ability_id, string $message, string $from_stage = '', array $run = array(), string $error_code = '' ): void {
		// Identifiers only. The message is free-form text from an extension, a
		// provider or a WP_Error and may carry secrets or line breaks; it stays
		// in the job marker for the editor, not in the server log.
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log(
			sprintf(
				'[VIP Workflows] Agent stopped in place: post=%d stage=%s agent=%s reason=%s code=%s',
				$post_id,
				self::log_token( $stage_key ),
				self::log_token( $ability_id ),
				self::log_token( (string) ( $run['stop_reason'] ?? '' ) ),
				self::log_token( $error_code )
			)
		);

		// A stale run must not clobber a job a newer stage already owns (e.g. a
		// checkpoint reseat or a bypass admin moved the post on and its next
		// agent is pending) — the same own-stage rationale as
		// clear_job_for_stage(). Overwriting would un-gate that post's new job
		// and strand a stale visible failure.
		$existing = get_post_meta( $post_id, self::JOB_META, true );
		if ( is_array( $existing ) && ( $existing['stage_key'] ?? '' ) !== '' && ( $existing['stage_key'] ?? '' ) !== $stage_key ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'[VIP Workflows] Stale failure marker suppressed, another stage owns the job: post=%d stage=%s owner=%s',
					$post_id,
					self::log_token( $stage_key ),
					self::log_token( (string) $existing['stage_key'] )
				)
			);
			return;
		}

		update_post_meta(
			$post_id,
			self::JOB_META,
			array(
				'stage_key'  => $stage_key,
				'ability_id' => $ability_id,
				'status'     => 'failed',
				'error'      => $message,
				'failed_at'  => current_time( 'mysql' ),
				'from_stage' => $from_stage,
			)
		);

		do_action( 'vip_workflows_agent_failed', $post_id, $ability_id, $message );

		$this->record_run( $post_id, 'stopped_in_place', $run );
	}

	/**
	 * Record an agent run that concluded.
	 *
	 * Recorded as the person who started the run. Failing that, as whoever is
	 * logged in, and under cron as the post's author.
	 *
	 * @param int    $post_id     Post ID.
	 * @param string $disposition routed | error_routed | stopped_in_place | held_for_warnings.
	 * @param array  $run         started_by, chain, outcome, duration_ms and stop_reason, each optional.
	 */
	private function record_run( int $post_id, string $disposition, array $run ): void {
		if ( ! Tracker::is_available() ) {
			return;
		}

		$as_user = (int) ( $run['started_by'] ?? 0 );
		if ( $as_user <= 0 && get_current_user_id() <= 0 ) {
			$as_user = (int) get_post_field( 'post_author', $post_id );
		}

		Tracker::record(
			'agent_run_finished',
			array(
				'outcome'      => $run['outcome'] ?? null,
				'disposition'  => $disposition,
				'stop_reason'  => 'stopped_in_place' === $disposition ? ( $run['stop_reason'] ?? null ) : null,
				'duration_ms'  => $run['duration_ms'] ?? null,
				'chain_length' => $run['chain'] ?? null,
				'initiator'    => 'agent',
			),
			$as_user > 0 ? $as_user : null
		);
	}

	/**
	 * Delete the job marker only when it belongs to the given stage.
	 *
	 * A run finishing (or being abandoned) for one stage must never remove a
	 * job a newer stage has since queued for the same post. The delete is
	 * compare-and-delete: the read marker is passed as delete_post_meta()'s
	 * $meta_value (WordPress serializes arrays for the match), so if another
	 * process swapped the marker between the read and the delete (e.g. a
	 * reseat's fresh dispatch in a concurrent request), nothing is deleted.
	 *
	 * @param int    $post_id   Post ID.
	 * @param string $stage_key Stage whose job marker may be cleared.
	 */
	private function clear_job_for_stage( int $post_id, string $stage_key ): void {
		$job = get_post_meta( $post_id, self::JOB_META, true );

		// No marker to clear. Passing an empty $meta_value to delete_post_meta
		// would delete ALL rows for the key — including one written between
		// this read and the delete — so bail instead.
		if ( '' === $job || null === $job || false === $job ) {
			return;
		}

		if ( is_array( $job ) && ( $job['stage_key'] ?? '' ) !== '' && ( $job['stage_key'] ?? '' ) !== $stage_key ) {
			return;
		}

		delete_post_meta( $post_id, self::JOB_META, $job );
	}
}
