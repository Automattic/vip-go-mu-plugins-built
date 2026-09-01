<?php
/**
 * Workflow REST API controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Plugin;
use VIPWorkflows\Database\Schema;
use VIPWorkflows\Story\Story;
use VIPWorkflows\Ideation\Assistants\IdeationOrchestrator;
use VIPWorkflows\Ideation\Research\IdeationPostTypes;
use VIPWorkflows\Workflow\Actor;
use VIPWorkflows\Workflow\StagePalette;
use VIPWorkflows\Workflow\StatusManager;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * REST controller for workflow operations on posts.
 */
class WorkflowController extends WP_REST_Controller {


	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = RestController::NAMESPACE;
		$this->rest_base = 'workflow';
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		// GET /workflow/post/{id}/status - Get current status and available transitions.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/post/(?P<id>[\d]+)/status',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_post_status' ),
					'permission_callback' => array( $this, 'get_post_status_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// POST /workflow/post/{id}/transition - Transition to a new status.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/post/(?P<id>[\d]+)/transition',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'transition_status' ),
					'permission_callback' => array( $this, 'transition_permissions_check' ),
					'args'                => array(
						'id'        => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
						'to_status' => array(
							'description'       => 'Target status key.',
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'comment'   => array(
							'description'       => 'Transition comment.',
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'acknowledge_warnings' => array(
							'description' => 'Set to true to proceed despite soft warnings.',
							'type'        => 'boolean',
							'default'     => false,
						),
						'input_data' => array(
							'description'       => 'Key-value data collected from transition inputs.',
							'type'              => 'object',
							'default'           => array(),
							'sanitize_callback' => function ( $data ) {
								if ( ! is_array( $data ) ) {
									return array();
								}
								return array_map( 'sanitize_text_field', $data );
							},
						),
					),
				),
			)
		);

		// POST /workflow/post/{id}/agent-revert - Return a post whose stage agent
		// failed in place to the stage it entered from.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/post/(?P<id>[\d]+)/agent-revert',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'revert_agent_stage' ),
					'permission_callback' => array( $this, 'transition_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// GET /workflow/post/{id}/history - Get transition history.
		//
		// Gated on `edit_post` for this post (get_post_status_permissions_check),
		// not on a role allowlist: the people who need a post's history are the
		// people working on that post, and an author who can edit it must not be
		// refused its own record.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/post/(?P<id>[\d]+)/history',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_history' ),
					'permission_callback' => array( $this, 'get_post_status_permissions_check' ),
					'args'                => array(
						'id'       => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
						'page'     => array(
							'description'       => 'Current page of the collection.',
							'type'              => 'integer',
							'default'           => 1,
							'minimum'           => 1,
							'sanitize_callback' => 'absint',
						),
						'per_page' => array(
							'description'       => 'Maximum number of records to return.',
							'type'              => 'integer',
							'default'           => 20,
							'minimum'           => 1,
							'maximum'           => 100,
							'sanitize_callback' => 'absint',
						),
					),
				),
			)
		);

		// GET /workflow/post/{id}/ideation - The ideation project this post came from.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/post/(?P<id>[\d]+)/ideation',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_ideation' ),
					'permission_callback' => array( $this, 'get_post_status_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// POST /workflow/post/{id}/sequence - Assign a sequence to a post.
		// DELETE /workflow/post/{id}/sequence - Remove workflow from a post.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/post/(?P<id>[\d]+)/sequence',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'assign_sequence' ),
					'permission_callback' => array( $this, 'transition_permissions_check' ),
					'args'                => array(
						'id'           => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
						'sequence_id' => array(
							'description' => 'Sequence ID to assign.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'remove_sequence' ),
					'permission_callback' => array( $this, 'transition_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// POST /workflow/post/{id}/claim - Claim a post for review.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/post/(?P<id>[\d]+)/claim',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'claim_post' ),
					'permission_callback' => array( $this, 'transition_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// DELETE /workflow/post/{id}/claim - Release a claimed post.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/post/(?P<id>[\d]+)/unclaim',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'unclaim_post' ),
					'permission_callback' => array( $this, 'transition_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Post ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// GET /workflow/my-queue - Get posts in queue for current user.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/my-queue',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_my_queue' ),
					'permission_callback' => array( $this, 'get_my_queue_permissions_check' ),
				),
			)
		);

		// GET /workflow/my-work - Get all active work items for current user.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/my-work',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_my_work' ),
					// Was `is_user_logged_in`. The handler's identity test —
					// author, claimer, assignee — decides relevance, not
					// authorization, and the assignment picker offers Subscribers.
					'permission_callback' => array( $this, 'get_my_work_permissions_check' ),
				),
			)
		);

		// GET /workflow/kanban - Get Kanban board data for all active sequences.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/kanban',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_kanban_data' ),
					'permission_callback' => array( $this, 'get_my_queue_permissions_check' ),
					'args'                => array(
						'sequence_id' => array(
							'description' => 'Filter by sequence ID, or "none" for posts outside any workflow.',
							'type'        => 'string',
							'required'    => false,
						),
						'include_hidden' => array(
							'description' => 'Include hidden statuses (terminal, etc.).',
							'type'        => 'boolean',
							'default'     => false,
						),
					),
				),
			)
		);

		// GET /workflow/calendar - Get posts for calendar view.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/calendar',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_calendar_data' ),
					'permission_callback' => array( $this, 'get_my_queue_permissions_check' ),
					'args'                => array(
						'start'          => array(
							'description' => 'Start date (Y-m-d format).',
							'type'        => 'string',
							'required'    => true,
						),
						'end'            => array(
							'description' => 'End date (Y-m-d format).',
							'type'        => 'string',
							'required'    => true,
						),
						'filter'         => array(
							'description' => 'Filter type: all or published.',
							'type'        => 'string',
							'default'     => 'all',
							'enum'        => array( 'all', 'published' ),
						),
					),
				),
			)
		);
	}

	/**
	 * Get post workflow status.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_post_status( $request ) {
		$post_id = (int) $request->get_param( 'id' );
		$post    = get_post( $post_id );

		if ( ! $post ) {
			return new WP_Error(
				'rest_post_not_found',
				__( 'Post not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$status_manager = Plugin::get_instance()->get_status_manager();
		$sequence      = $status_manager->get_sequence_for_post( $post_id );

		if ( ! $sequence ) {
			// Two very different posts land here. One was never put in a workflow
			// and gets the sequence selector. The other names a sequence row that
			// has since been deleted: it has no renderable workflow either, but it
			// is NOT free — crosses_publish_boundary() fails closed on it, so every
			// status change is refused for as long as the dangling meta survives.
			// Offering it the selector was the bug: the only operation that can
			// free it is remove_sequence(), and nothing surfaced it.
			//
			// Not logged here: this endpoint is polled by the editor, and the
			// condition is already logged where it does damage — by
			// resolve_managed_stage() on every save, and by remove_sequence()
			// when it is finally cleared.
			$orphaned = $status_manager->has_dangling_sequence( $post_id );

			// No workflow assigned - return available sequences for selection.
			// An orphaned post is offered none: re-assigning a workflow on top of a
			// dangling one would bury the broken identity rather than clear it.
			$available = $orphaned ? array() : $status_manager->get_available_sequences_for_post( $post_id );

			$payload = array(
				'has_workflow'         => false,
				'orphaned'             => $orphaned,
				'post_id'              => $post_id,
				'post_status'          => $post->post_status,
				'sequence'            => null,
				'current'              => null,
				'transitions'          => array(),
				'all_statuses'         => array(),
				'available_sequences' => $available,
				'metadata_fields'      => array(),
			);

			// `guard` is owed to every post the save layer will act on, and to no
			// other — its absence is what tells the client there is nothing to
			// guard. An orphaned post IS acted on, so it gets one: a null region
			// is the input evaluateStatusChange() needs to reach the same answer
			// crosses_publish_boundary() gives (fail closed — veto for a
			// non-bypass user, confirm for a bypass one). Without it the client
			// waves the save into a refusal it can neither explain nor escape.
			if ( $orphaned ) {
				$payload['guard'] = array(
					'current_region' => null,
					'can_bypass'     => \VIPWorkflows\Admin\Settings::can_user_bypass_workflow( get_current_user_id() ),
					'agent_pending'  => false,
				);
			}

			return new WP_REST_Response( $payload );
		}

		$current_status = $status_manager->get_current_status( $post_id );
		$transitions    = $status_manager->get_available_transitions( $post_id );

		// Get claim info (simple claim/release system). The actor is the shared
		// shape every other route serves, so the panel can draw a claimer the
		// way a list draws an author; `is_current` rides alongside it because
		// "is this me" is about the reader, not about the person.
		$claimed_by_id = get_post_meta( $post_id, '_vip_workflows_assigned_to', true );
		$claimed_by    = Actor::from_user( $claimed_by_id );
		if ( $claimed_by ) {
			$claimed_by['is_current'] = get_current_user_id() === $claimed_by['id'];
		}

		// Get sequence-based assignments (via transitions).
		$assignment_manager = new \VIPWorkflows\Workflow\AssignmentManager();
		$assignments        = $assignment_manager->get_all( $post_id );
		$assigned_to        = null;
		// Find the first pending user assignment to show as primary assignee.
		foreach ( $assignments as $key => $assignment ) {
			if ( 'user' === $assignment['type'] && 'pending' === $assignment['status'] ) {
				$assigned_to = Actor::from_user( $assignment['value'] );
				if ( $assigned_to ) {
					$assigned_to['is_current'] = get_current_user_id() === $assigned_to['id'];
					// Which assignment slot this came from. Served but not yet
					// read: the sidebar's Release button posts to /unclaim,
					// which clears the claim meta rather than an assignment, so
					// nothing consumes this today.
					$assigned_to['slot'] = $key;
				}
				break;
			}
		}

		// Determine if current user can claim this post.
		// Claim is available if:
		// 1. Current status has show_in_queue: true (it's a reviewable stage).
		// 2. Post is not already claimed.
		// 3. User is not the author.
		// 4. User has a reviewer role for this sequence.
		$is_author        = get_current_user_id() === (int) $post->post_author;
		$status_config    = $sequence->get_status( $current_status['key'] ?? '' );
		$is_queue_stage   = ! empty( $status_config['show_in_queue'] );
		$can_claim = $is_queue_stage
		&& ! $claimed_by
		&& ! $is_author
		&& $sequence->can_user_claim();

		$agent_pending = $status_manager->has_pending_agent_job( $post_id, $current_status['key'] ?? '' );

		// The side-effect guard's client input: everything needed to decide,
		// without a round trip, whether a pending post_status change is silent,
		// needs a confirm, or is vetoed. The current side of the publish boundary
		// is the region of the post's STAGE — the workflow's authority — not its
		// post_status, which core may already have moved.
		try {
			// Through boundary_region(), never straight off the stage: it applies
			// the same "whichever side is publish" rule crosses_publish_boundary()
			// does, so the client cannot warn where the server refuses.
			$current_region = $status_manager->boundary_region(
				$post_id,
				$sequence->get_stage_status( $current_status['key'] ?? '' )
			);
		} catch ( \InvalidArgumentException $e ) {
			// The post is workflow-managed but its stage does not resolve to a
			// region (dangling stage key after a sequence edit, or a stored
			// stage with no `status` field): a data-integrity condition. Log it
			// and emit a NULL region rather than failing the response.
			//
			// This endpoint is the only surface that renders the veto's audited
			// escape ("Remove from workflow"), and
			// StatusManager::crosses_publish_boundary() deliberately fails
			// CLOSED for exactly this post — so erroring the whole response
			// would leave the post vetoed at the save layer with no reachable
			// way out. Same treatment as the sibling list-table surface
			// (class-posts-columns.php), which logs and emits an unresolved
			// region so the client fails closed without losing the payload.
			//
			// A null region is not a region, so it can never compare equal to
			// the target region: the client's evaluateStatusChange() answers
			// VETO on any publish crossing for a non-bypass user and WARN
			// otherwise — closed, but escapable.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot resolve the stage region for post %d; the workflow guard payload reports an unresolved region: %s', $post_id, $e->getMessage() ) );

			$current_region = null;
		}

		return new WP_REST_Response(
			array(
				'has_workflow'  => true,
				'post_id'       => $post_id,
				'post_status'   => $post->post_status,
				'is_author'     => $is_author,
				'can_claim'     => $can_claim,
				'sequence'     => array(
					'id'   => $sequence->id,
					'name' => $sequence->name,
					'slug' => $sequence->slug,
				),
				'current'         => $current_status,
				'transitions'     => $transitions,
				'agent_pending'   => $agent_pending,
				'agent_job'       => $this->get_agent_job_state( $post_id, $current_status['key'] ?? '' ),
				'agent_last_run'  => $this->get_agent_last_run( $post_id ),
				'guard'           => array(
					'current_region' => $current_region,
					'can_bypass'     => \VIPWorkflows\Admin\Settings::can_user_bypass_workflow( get_current_user_id() ),
					'agent_pending'  => $agent_pending,
				),
				'all_statuses'    => $sequence->get_statuses(),
				// Served for an enrolled post too, not only for one with no
				// workflow: the editor sidebar draws the post's sequence as a
				// picker rather than a heading, so it needs the alternatives to
				// offer. Re-assignment is a real operation — assign_sequence()
				// treats a second assignment as a replacement — and this is the
				// list of sequences it may name. The list includes the post's
				// own, so the picker can show what is selected.
				//
				// The `orphaned` carve-out above is untouched: a post whose
				// sequence row was deleted is still offered NOTHING, because
				// assigning on top of a dangling identity buries the broken
				// state instead of clearing it. It never reaches this branch.
				'available_sequences' => $status_manager->get_available_sequences_for_post( $post_id ),
				'assigned_to'     => $assigned_to,
				'claimed_by'      => $claimed_by,
				'assignments'     => $assignments,
				'metadata_fields' => $sequence->get_metadata_fields_with_meta_keys(),
			)
		);
	}

	/**
	 * Transition post to a new status.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function transition_status( $request ) {
		$post_id              = (int) $request->get_param( 'id' );
		$to_status            = $request->get_param( 'to_status' );
		$comment              = $request->get_param( 'comment' );
		$acknowledge_warnings = (bool) $request->get_param( 'acknowledge_warnings' );
		$input_data           = $request->get_param( 'input_data' );

		$status_manager = Plugin::get_instance()->get_status_manager();

		$options = array(
			'comment'              => $comment,
			'acknowledge_warnings' => $acknowledge_warnings,
		);

		if ( ! empty( $input_data ) && is_array( $input_data ) ) {
			$options['input_data'] = $input_data;
		}

		// A person can finish a warning-held agent route through this same
		// endpoint. Capture the exact marker before transition() moves the post so
		// a successful acknowledgement can resolve the run without mistaking an
		// unrelated human transition or a stale marker for the agent's decision.
		$agent_job     = get_post_meta( $post_id, \VIPWorkflows\Workflow\StageAgentRunner::JOB_META, true );
		$current_stage = get_post_meta( $post_id, StatusManager::STAGE_META_KEY, true );
		$held_agent_job = null;
		if (
			$acknowledge_warnings
			&& is_array( $agent_job )
			&& 'warnings_pending' === ( $agent_job['status'] ?? '' )
			&& ( $agent_job['stage_key'] ?? '' ) === $current_stage
			&& ( $agent_job['to_status'] ?? '' ) === $to_status
		) {
			$held_agent_job = $agent_job;
		}

		$result = $status_manager->transition( $post_id, $to_status, $options );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Check if result contains warnings that need acknowledgement.
		if ( is_array( $result ) && ! empty( $result['warnings_pending'] ) ) {
			return new WP_REST_Response( $result, 200 );
		}

		if ( is_array( $held_agent_job ) ) {
			update_post_meta(
				$post_id,
				\VIPWorkflows\Workflow\StageAgentRunner::LAST_RUN_META,
				array(
					'stage_key'   => (string) $held_agent_job['stage_key'],
					'outcome'     => (string) $held_agent_job['outcome'],
					'to'          => (string) $held_agent_job['to_status'],
					'finished_at' => current_time( 'mysql' ),
				)
			);
			delete_post_meta( $post_id, \VIPWorkflows\Workflow\StageAgentRunner::JOB_META, $held_agent_job );
		}

		// Return the updated status payload.
		$response = $this->get_post_status( $request );
		$data     = $response->get_data();

		// Surface the ACTUAL committed post status (not the stage projection —
		// core can coerce e.g. publish -> future for future-dated posts) so the
		// editor's status lock adopts the new baseline instead of reverting a
		// workflow-driven status change back to the stale page-load status.
		if ( is_array( $data['current'] ?? null ) ) {
			$data['current']['wp_status'] = get_post_status( $post_id );
		}

		// No `access_revoked` / `redirect_url` here any more. They encoded "this
		// transition left the user with no edges, so they have lost edit_post",
		// which was true only while StatusManager::restrict_workflow_edit_access()
		// revoked the cap through map_meta_cap. That filter is gone: a user with
		// no permitted edges keeps edit_post and stays in the editor with their
		// unsaved work, so emitting the flag would state something false to every
		// consumer of this endpoint.
		$response->set_data( $data );

		return $response;
	}

	/**
	 * Read the surfaced agent-job state for a post's current stage.
	 *
	 * Returns the pending/failed job (with any error message), or the warning
	 * decision held for a person, so the editor can show the matching state.
	 * Null when there is no job for the current stage.
	 *
	 * A failed job carries `revert_to` — the stage the "Go back" action returns
	 * the post to — whenever StatusManager::get_agent_revert_stage() resolves
	 * one. Absent otherwise: the client offers go-back exactly when the server
	 * would honor it, and the failed state without it falls back to the stage's
	 * routed transitions (which the payload's `transitions` then carries).
	 *
	 * @param  int    $post_id Post ID.
	 * @param  string $stage   Current stage key.
	 * @return array|null
	 */
	private function get_agent_job_state( int $post_id, string $stage ): ?array {
		$job = get_post_meta( $post_id, \VIPWorkflows\Workflow\StageAgentRunner::JOB_META, true );
		if ( ! is_array( $job ) || ( $job['stage_key'] ?? '' ) !== $stage ) {
			return null;
		}

		$status = (string) ( $job['status'] ?? '' );
		if ( 'warnings_pending' === $status ) {
			return array(
				'status'        => $status,
				'to_status'     => (string) ( $job['to_status'] ?? '' ),
				'outcome'       => (string) ( $job['outcome'] ?? '' ),
				'soft_warnings' => is_array( $job['soft_warnings'] ?? null ) ? $job['soft_warnings'] : array(),
				'comment'       => (string) ( $job['comment'] ?? '' ),
			);
		}

		$state = array(
			'status' => $status,
			'error'  => (string) ( $job['error'] ?? '' ),
		);

		if ( 'failed' === $state['status'] ) {
			$status_manager = Plugin::get_instance()->get_status_manager();
			$revert_stage   = $status_manager->get_agent_revert_stage( $post_id );

			if ( null !== $revert_stage ) {
				$sequence     = $status_manager->get_sequence_for_post( $post_id );
				$revert_config = $sequence ? $sequence->get_status( $revert_stage ) : null;

				$state['revert_to'] = array(
					'key'   => $revert_stage,
					'label' => (string) ( $revert_config['label'] ?? $revert_stage ),
				);
			}
		}

		return $state;
	}

	/**
	 * Read the last resolved agent run for a post.
	 *
	 * Which of pass/fail/error fired, the stage the run belonged to, and the
	 * stage it routed to (StageAgentRunner::LAST_RUN_META). The editor's
	 * transition rail matches `stage_key`/`to` against the move it just
	 * observed to flash the taken outcome — the record is not scoped to the
	 * current stage here, because by the time it matters the post has already
	 * left the stage it describes.
	 *
	 * @param  int $post_id Post ID.
	 * @return array|null Null when no run has resolved for this post.
	 */
	private function get_agent_last_run( int $post_id ): ?array {
		$run = get_post_meta( $post_id, \VIPWorkflows\Workflow\StageAgentRunner::LAST_RUN_META, true );
		if ( ! is_array( $run ) || '' === (string) ( $run['stage_key'] ?? '' ) ) {
			return null;
		}

		return array(
			'stage_key'   => (string) $run['stage_key'],
			'outcome'     => (string) ( $run['outcome'] ?? '' ),
			'to'          => (string) ( $run['to'] ?? '' ),
			'finished_at' => (string) ( $run['finished_at'] ?? '' ),
		);
	}

	/**
	 * Return a post whose stage agent failed in place to the stage it came from.
	 *
	 * The failed state's one action. Going forward again through the AI stage is
	 * how a run is retried — entry re-dispatches the agent — so there is no
	 * separate re-run.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function revert_agent_stage( $request ) {
		$post_id = (int) $request->get_param( 'id' );

		$status_manager = Plugin::get_instance()->get_status_manager();
		$result         = $status_manager->revert_failed_agent_stage( $post_id );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Return the updated status payload, with the committed post status the
		// same way transition_status() surfaces it — a revert can cross a region
		// boundary, and the editor's status lock must adopt the new baseline.
		$response = $this->get_post_status( $request );
		$data     = $response->get_data();
		if ( is_array( $data['current'] ?? null ) ) {
			$data['current']['wp_status'] = get_post_status( $post_id );
		}
		$response->set_data( $data );

		return $response;
	}

	/**
	 * Get transition history for a post.
	 *
	 * A paged collection: the body is the page's entries and the totals ride in
	 * `X-WP-Total` / `X-WP-TotalPages`, the way core paginates a collection. The
	 * audit-log route wraps its own totals in the body instead; that route serves
	 * one screen, while this one already has consumers reading its entries as a
	 * plain array, and a header keeps them working.
	 *
	 * The entries themselves are in the same shape the audit-log route serves —
	 * `event_type`, its label, the raw `event_data` and an actor object — because
	 * a post's history is that stream filtered to one post and one event type.
	 * One shape is what lets both views render an event with the same component
	 * instead of each interpreting a stage change its own way. The `post` field is
	 * the one thing left off: this route is already scoped to a post, so every
	 * entry would repeat it.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_history( $request ) {
		$post_id = (int) $request->get_param( 'id' );
		$post    = get_post( $post_id );

		if ( ! $post ) {
			return new WP_Error(
				'rest_post_not_found',
				__( 'Post not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$page     = (int) $request->get_param( 'page' );
		$per_page = (int) $request->get_param( 'per_page' );

		$status_manager = Plugin::get_instance()->get_status_manager();
		$total          = $status_manager->count_transition_history( $post_id );
		$history        = $status_manager->get_transition_history( $post_id, $per_page, ( $page - 1 ) * $per_page );

		// Enrich each entry the way the audit log does: the actor as an object —
		// display name, whether it was a person or an agent, and an avatar to
		// render for a person — plus the event type's label.
		foreach ( $history as &$entry ) {
			$entry['event_type_label'] = StatusManager::event_type_label( $entry['event_type'] );
			$entry['actor']            = Actor::from_event( $entry );
		}
		unset( $entry );

		$response = new WP_REST_Response( $history );
		$response->header( 'X-WP-Total', (string) $total );
		$response->header( 'X-WP-TotalPages', (string) ( $per_page > 0 ? (int) ceil( $total / $per_page ) : 0 ) );

		return $response;
	}

	/**
	 * Assign a sequence to a post.
	 *
	 * The route names no stage: a post is always seated at the entry stage of
	 * the region its status is already in, so starting a workflow never moves
	 * the post. A sequence with no stage in that region is refused rather than
	 * seated somewhere that would change the status as the price of entry.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function assign_sequence( $request ) {
		$post_id      = (int) $request->get_param( 'id' );
		$sequence_id = (int) $request->get_param( 'sequence_id' );

		$post = get_post( $post_id );
		if ( ! $post ) {
			return new WP_Error(
				'rest_post_not_found',
				__( 'Post not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$status_manager = Plugin::get_instance()->get_status_manager();

		/*
		 * Seating a post reads the target sequence's stage regions, so a stored
		 * config that violates a Sequence write-gate invariant throws here rather
		 * than returning. That throw is correct — the architecture forbids
		 * defaulting missing stage data at read time — but uncaught it made this
		 * route answer with WordPress's generic critical-error page: a 500 with no
		 * message, in the editor, with the actual reason only in debug.log.
		 *
		 * Convert it to a WP_Error carrying the exception's own message, so the
		 * author is told which sequence and which region are broken. The diagnosis
		 * is surfaced, not swallowed: nothing here repairs or works around the
		 * config.
		 */
		try {
			$result = $status_manager->assign_sequence( $post_id, $sequence_id );
		} catch ( \Throwable $e ) {
			return new WP_Error(
				'rest_sequence_invalid_config',
				sprintf(
					/* translators: %s: data-integrity error from the sequence read path. */
					__( 'This sequence cannot be applied because its configuration is invalid: %s', 'vip-workflows' ),
					$e->getMessage()
				),
				array( 'status' => 500 )
			);
		}

		// Seating can be refused — the sequence models no stage in the post's
		// status region, the user may not cross into the named stage's region, or
		// a crossing failed at the core status write. Each arrives as a WP_Error
		// already carrying the message and status code the author should see;
		// surface it rather than falling through to success.
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( false === $result ) {
			return new WP_Error(
				'rest_sequence_assign_failed',
				__( 'Failed to assign sequence.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		if ( ! Story::for_object( $post_id ) ) {
			$story = Story::create( get_the_title( $post_id ), Story::STATUS_EDITORIAL );
			if ( ! is_wp_error( $story ) ) {
				$story->add_object( $post_id, 'post' );
			}
		}

		// Return updated status.
		return $this->get_post_status( $request );
	}

	/**
	 * Remove a post from its workflow — the escape hatch behind the publish veto.
	 *
	 * Delegates wholly to StatusManager::remove_sequence(), the one authority
	 * for removal: it deletes the workflow identity (sequence + stage meta),
	 * lets any in-flight stage-agent job abandon itself, records the audited
	 * `workflow.removed` event, and writes NO post_status — the post stays where
	 * core has it and is simply no longer workflow-managed. Its WP_Error (post
	 * missing, or the post not in a workflow) propagates to the client as-is.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error True on success.
	 */
	public function remove_sequence( $request ) {
		$post_id = (int) $request->get_param( 'id' );

		return Plugin::get_instance()->get_status_manager()->remove_sequence( $post_id );
	}

	/**
	 * Claim a post for review.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function claim_post( $request ) {
		$post_id = (int) $request->get_param( 'id' );

		$post = get_post( $post_id );
		if ( ! $post ) {
			return new WP_Error(
				'rest_post_not_found',
				__( 'Post not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		// Check if already claimed by someone else.
		$current_assignee = get_post_meta( $post_id, '_vip_workflows_assigned_to', true );
		$current_user_id  = get_current_user_id();

		if ( $current_assignee && (int) $current_assignee !== $current_user_id ) {
			$assignee = get_userdata( $current_assignee );
			return new WP_Error(
				'post_already_claimed',
				sprintf(
					/* translators: %s: display name of the user who already claimed the post. */
					__( 'This post is already claimed by %s.', 'vip-workflows' ),
					$assignee ? $assignee->display_name : __( 'another user', 'vip-workflows' )
				),
				array( 'status' => 409 )
			);
		}

		// Claim the post.
		update_post_meta( $post_id, '_vip_workflows_assigned_to', $current_user_id );

		// Log the event.
		$this->log_event(
			$post_id,
			'post.claimed',
			array(
				'claimed_by' => $current_user_id,
			)
		);

		return new WP_REST_Response(
			array(
				'success'     => true,
				'post_id'     => $post_id,
				'assigned_to' => $current_user_id,
				'message'     => __( 'Post claimed successfully.', 'vip-workflows' ),
			)
		);
	}

	/**
	 * Release a claimed post.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function unclaim_post( $request ) {
		$post_id = (int) $request->get_param( 'id' );

		$post = get_post( $post_id );
		if ( ! $post ) {
			return new WP_Error(
				'rest_post_not_found',
				__( 'Post not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		// Check if claimed by current user or if user is admin.
		$current_assignee = get_post_meta( $post_id, '_vip_workflows_assigned_to', true );
		$current_user_id  = get_current_user_id();

		if ( $current_assignee && (int) $current_assignee !== $current_user_id && ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'cannot_unclaim',
				__( 'You can only release posts you have claimed.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		// Release the post.
		delete_post_meta( $post_id, '_vip_workflows_assigned_to' );

		// Log the event.
		$this->log_event(
			$post_id,
			'post.released',
			array(
				'released_by'      => $current_user_id,
				'previous_claimer' => $current_assignee,
			)
		);

		return new WP_REST_Response(
			array(
				'success' => true,
				'post_id' => $post_id,
				'message' => __( 'Post released successfully.', 'vip-workflows' ),
			)
		);
	}

	/**
	 * The ideation project a post was created from, and what was gathered in it.
	 *
	 * A post commissioned out of ideation carries the research that justified it —
	 * the sources, the angle, the entities. Once the writer is in the editor that
	 * material is a click away on another screen, which in practice means it is
	 * gone. This hands back enough of it to show in the sidebar, next to the stage
	 * the post is sitting in.
	 *
	 * Returns an empty payload rather than a 404 when a post has no project. Most
	 * posts do not, and that is not an error condition — it is the normal case,
	 * and the panel simply renders nothing.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_ideation( $request ): WP_REST_Response {
		$post_id    = (int) $request->get_param( 'id' );
		$project_id = (int) get_post_meta( $post_id, '_vip_ideation_project_id', true );

		$empty = array(
			'project_id' => 0,
			'items'      => array(),
		);

		if ( $project_id <= 0 ) {
			return new WP_REST_Response( $empty );
		}

		$project = get_post( $project_id );

		/*
		 * A project that has been deleted, or that predates a rename of the post
		 * type, leaves the meta pointing at nothing. Treated as "no project"
		 * rather than an error: the post is still perfectly editable, and a broken
		 * link is not worth a red notice in the sidebar.
		 */
		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_REST_Response( $empty );
		}

		/*
		 * The project belongs to whoever ideated; the post may since have been
		 * handed to a writer who cannot read it. Editing the post is the right
		 * permission to check — it is already checked for this route — but the
		 * project's own rules still apply to opening the workspace, so the link is
		 * only offered to someone who could actually follow it.
		 */
		$can_open = current_user_can( 'edit_posts' ) && (
			get_current_user_id() === (int) $project->post_author
			|| current_user_can( 'edit_others_posts' )
		);

		$orchestrator = new IdeationOrchestrator();
		$state        = $orchestrator->get_state( $project_id );

		$items = array();

		foreach ( $state['cards'] ?? array() as $card ) {
			$status = (string) ( $card['card_status'] ?? '' );

			/*
			 * Only what someone chose.
			 *
			 * A project accumulates dozens of cards that assistants went and found;
			 * repeating all of them here turns the sidebar into a second search
			 * result and buries the two things that carry intent — what the desk
			 * pinned, and what somebody added by hand. Everything else stays one
			 * click away in the workspace.
			 */
			$is_pinned = 'pinned' === $status;
			$is_added  = 'manual' === (string) ( $card['origin'] ?? '' );

			if ( ! $is_pinned && ! $is_added ) {
				continue;
			}

			// Pinned then dismissed is still dismissed.
			if ( 'dismissed' === $status ) {
				continue;
			}

			$items[] = array(
				'id'       => (string) ( $card['source_id'] ?? $card['card_id'] ?? '' ),
				'title'    => (string) ( $card['title'] ?? '' ),
				'url'      => (string) ( $card['url'] ?? '' ),
				'domain'   => (string) ( $card['domain'] ?? '' ),
				'excerpt'  => self::ideation_excerpt( $card ),
				'pinned'   => $is_pinned,
				'uploaded' => ! empty( $card['attachment_id'] ),
			);
		}

		/*
		 * Pinned first, original order preserved within each group. Pinning is the
		 * one signal the desk gives about what mattered, so it is the one thing
		 * worth reordering for.
		 */
		$pinned = array_values( array_filter( $items, fn( $i ) => $i['pinned'] ) );
		$rest   = array_values( array_filter( $items, fn( $i ) => ! $i['pinned'] ) );
		$items  = array_merge( $pinned, $rest );

		return new WP_REST_Response(
			array(
				'project_id' => $project_id,
				'title'      => (string) $project->post_title,
				'url'        => $can_open
					? admin_url( 'admin.php?page=vip-workflows-ideation#workspace?project=' . $project_id )
					: '',
				'source'     => self::ideation_source( $project_id ),
				'items'      => $items,
			)
		);
	}

	/**
	 * The article the project was started from.
	 *
	 * This is the one piece of the workspace the writer needs in front of them
	 * rather than a click away: everything else in the panel is supporting
	 * material, and this is the thing being written about.
	 *
	 * Read from the discovery item the project was seeded with, which the
	 * discovery controller stores as JSON wrapping a `{ provider, prompt }`
	 * envelope. A project seeded by hand has no item, so the typed seed stands in
	 * — it is still what the work started from, it just has nothing to link to.
	 *
	 * @param int $project_id Ideation project id.
	 * @return array|null
	 */
	private static function ideation_source( int $project_id ): ?array {
		$stored = get_post_meta( $project_id, '_vip_discovery_prompt', true );

		if ( is_string( $stored ) ) {
			$decoded = json_decode( $stored, true );
			$stored  = is_array( $decoded ) ? $decoded : array();
		}

		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		/*
		 * The envelope is the only shape this key has ever held: the discovery
		 * controller is its sole writer and has stored `{ provider, prompt }`
		 * since the key was introduced. Anything else is malformed rather than
		 * old, so it reads as no source at all and the typed seed below stands
		 * in — the same path a hand-started project takes.
		 */
		$prompt = is_array( $stored['prompt'] ?? null ) ? $stored['prompt'] : array();

		$title = trim( (string) ( $prompt['title'] ?? '' ) );

		if ( '' !== $title ) {
			$url = trim( (string) ( $prompt['url'] ?? '' ) );

			return array(
				'title'    => $title,
				'url'      => $url,
				'domain'   => '' !== $url ? (string) wp_parse_url( $url, PHP_URL_HOST ) : '',
				'excerpt'  => wp_trim_words(
					wp_strip_all_tags( (string) ( $prompt['description'] ?? '' ) ),
					40,
					'…'
				),
				'provider' => (string) ( $stored['provider'] ?? '' ),
			);
		}

		$seed = trim( (string) get_post_meta( $project_id, '_vip_ideation_seed', true ) );

		if ( '' === $seed ) {
			return null;
		}

		return array(
			'title'    => wp_trim_words( wp_strip_all_tags( $seed ), 18, '…' ),
			'url'      => '',
			'domain'   => '',
			'excerpt'  => '',
			'provider' => '',
		);
	}

	/**
	 * A short, plain-text line describing an ideation card.
	 *
	 * Cards are not one shape. A source has an excerpt; an insight card carries
	 * its content, or a list of tags or entities, and no excerpt at all. Each is
	 * reduced to a sentence so the panel can render one row per card without
	 * knowing what kind it is.
	 *
	 * @param array $card Ideation card.
	 * @return string
	 */
	private static function ideation_excerpt( array $card ): string {
		$text = (string) ( $card['excerpt'] ?? $card['content'] ?? '' );

		if ( '' === trim( $text ) && ! empty( $card['tags'] ) && is_array( $card['tags'] ) ) {
			$text = implode( ', ', array_map( 'strval', $card['tags'] ) );
		}

		if ( '' === trim( $text ) && ! empty( $card['entities'] ) && is_array( $card['entities'] ) ) {
			$text = implode(
				', ',
				array_map(
					fn( $entity ) => is_array( $entity ) ? (string) ( $entity['name'] ?? '' ) : (string) $entity,
					$card['entities']
				)
			);
		}

		return wp_trim_words( wp_strip_all_tags( $text ), 28, '…' );
	}

	/**
	 * Permission check for getting post status.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function get_post_status_permissions_check( $request ) {
		$post_id = (int) $request->get_param( 'id' );
		return current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Permission check for transitioning status.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function transition_permissions_check( $request ) {
		$post_id = (int) $request->get_param( 'id' );
		return current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Log an event to the audit log.
	 *
	 * @param int    $post_id    Post ID.
	 * @param string $event_type Event type.
	 * @param array  $event_data Event data.
	 */
	private function log_event( int $post_id, string $event_type, array $event_data ): void {
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

	/**
	 * Check if user can access their queue.
	 *
	 * @return bool
	 */
	public function get_my_queue_permissions_check(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check if user can list their own work items.
	 *
	 * `edit_posts`, not `edit_others_posts`: the route reports only posts the
	 * caller is already involved with.
	 *
	 * @return bool
	 */
	public function get_my_work_permissions_check(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Get posts in queue for current user.
	 *
	 * Rows come back grouped by sequence and then by stage, newest post first
	 * within each group, because that is the order the queries run in.
	 *
	 * Each row carries the wait twice over: `waiting` is the phrase, and
	 * `modified` is the instant it was worded from. Sending only the phrase, as
	 * this used to, left the Waiting column with nothing to order itself by.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_my_queue( $request ) {
		$user = wp_get_current_user();
		if ( ! $user->exists() ) {
			return new WP_REST_Response( array() );
		}

		$repository = new \VIPWorkflows\Sequences\SequenceRepository();
		$sequences = $repository->get_workflow_sequences();
		$items      = array();

		foreach ( $sequences as $sequence ) {
			if ( ! $sequence->is_active() ) {
				continue;
			}

			$statuses = $sequence->get_statuses();

			foreach ( $statuses as $status ) {
				// Skip terminal statuses.
				if ( ! empty( $status['is_terminal'] ) ) {
					continue;
				}

				// Only show statuses explicitly marked show_in_queue: true.
				if ( empty( $status['show_in_queue'] ) ) {
					continue;
				}

				// Coarse stage-level check: can the user perform any transition from
				// this stage at all (role rules — no post context yet)? Per-post
				// capability/assignment filtering happens below, with the post ID.
				$user_transitions = $sequence->get_transitions_for_user( $status['key'] );
				if ( empty( $user_transitions ) ) {
					continue;
				}

				// Get posts in this stage.
				$query = new \WP_Query(
					\VIPWorkflows\Workflow\StageQuery::in_stage(
						$sequence,
						$status['key'],
						array( 'posts_per_page' => 50 )
					)
				);

				foreach ( $query->posts as $post ) {
					// The route gate is a bare `edit_posts`, and
					// get_transitions_for_user() below defers per-post rights to
					// transition(). Without this the queue described every other
					// user's unpublished post. get_kanban(), get_calendar() and
					// the dashboard query all carry the same line.
					if ( ! current_user_can( 'edit_post', $post->ID ) ) {
						continue;
					}

					   $current_user_id = get_current_user_id();

					   // Skip posts authored by current user (unless self-review is allowed).
					if ( (int) $post->post_author === $current_user_id && ! \VIPWorkflows\Admin\Settings::is_self_review_allowed() ) {
						continue;
					}

					   $assigned_id = get_post_meta( $post->ID, '_vip_workflows_assigned_to', true );

					   // Skip posts assigned to someone else.
					if ( $assigned_id && (int) $assigned_id !== $current_user_id ) {
						continue;
					}

					// Re-resolve transitions WITH the post context so region-crossing
					// capability filtering (Sequence::get_transitions_for_user only
					// filters crossings when a post ID is provided) and assignment
					// locks apply per post. A post the user can do nothing with does
					// not belong in their queue.
					$post_transitions = $sequence->get_transitions_for_user( $status['key'], 0, $post->ID );

					// On an AI stage only the agent's routed destinations are
					// anyone's to take — the same filter the editor payload
					// applies, and the rule transition() enforces.
					$routed_targets = Plugin::get_instance()->get_status_manager()->agent_routed_targets( $status );
					if ( null !== $routed_targets ) {
						$post_transitions = array_values(
							array_filter(
								$post_transitions,
								fn( $t ) => in_array( (string) $t['to'], $routed_targets, true )
							)
						);
					}

					if ( empty( $post_transitions ) ) {
						continue;
					}

					// Get quick actions (transitions marked show_in_queue: true).
					//
					// A locked one is not among them. A quick action is a
					// one-click move in a table cell — there is no room there to
					// say why it would be refused, and no field editor or
					// assignee picker in reach to fix it. Offering it produced a
					// button whose only outcome was a snackbar and an audit row
					// for a move the queue had just presented as available. This
					// is the rule KanbanBoard already applies to drop targets:
					// what the server marks `_locked` is not on offer.
					$quick_actions = array_values(
						array_filter(
							$post_transitions,
							fn( $t ) => ! empty( $t['show_in_queue'] ) && empty( $t['_locked'] )
						)
					);

					// Calculate waiting time.
					$modified = strtotime( $post->post_modified );
					$waiting  = human_time_diff( $modified, current_time( 'timestamp' ) );

					$items[] = array(
						'post_id'        => $post->ID,
						'title'          => $post->post_title ? $post->post_title : __( '(no title)', 'vip-workflows' ),
						'edit_url'       => get_edit_post_link( $post->ID, 'raw' ),
						'author'         => Actor::from_user( $post->post_author ),
						'sequence_name' => $sequence->name,
						'sequence_id'   => $sequence->id,
						'status_key'     => $status['key'],
						'status_label'   => $status['label'],
						'status_color'   => $status['color'] ?? StagePalette::DEFAULT_COLOR,
						// The phrase and the moment behind it. `human_time_diff()`
						// is what a Kanban card shows for the same post, so the
						// two screens word one wait one way. On its own, though,
						// prose is a decision about how to *show* a moment, and a
						// payload that ships the decision instead of the moment
						// left the Waiting column nothing to sort by — hence
						// `modified`, the same site-local `Y-m-d H:i:s` the kanban
						// and my-work payloads carry, which the column orders on
						// and its `<time>` announces.
						'waiting'        => $waiting,
						'modified'       => $post->post_modified,
						'quick_actions'  => array_map(
							fn( $action ) => array(
								'to'    => $action['to'],
								'label' => $action['label'],
							),
							$quick_actions
						),
					);
				}
			}
		}

		return new WP_REST_Response( $items );
	}

	/**
	 * Get all active work items for current user.
	 *
	 * Returns posts where user is assigned (via claim or assignment) and not terminal/published.
	 *
	 * Every row carries two independent pairs, as the calendar endpoint does:
	 * the workflow stage (`status_label` / `status_color`), which is NULL for a
	 * post no workflow manages, and the core post status (`post_status` /
	 * `post_status_label`), which every post has. They are not interchangeable
	 * — a scheduled post is not at a workflow stage called "Scheduled".
	 *
	 * @param  WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function get_my_work( $request ) {
		$current_user_id = get_current_user_id();
		if ( ! $current_user_id ) {
			return new WP_REST_Response( array() );
		}

		$repository         = new \VIPWorkflows\Sequences\SequenceRepository();
		$assignment_manager = new \VIPWorkflows\Workflow\AssignmentManager();
		$items              = array();

		// Get all sequences.
		$sequences = $repository->get_all();

		foreach ( $sequences as $sequence ) {
			// Get all non-terminal, non-published statuses.
			foreach ( $sequence->get_statuses() as $status ) {
				// Skip terminal statuses.
				if ( ! empty( $status['is_dead_end'] ) || ! empty( $status['is_terminal'] ) ) {
					continue;
				}

				// Query posts in this stage.
				$query = new \WP_Query(
					\VIPWorkflows\Workflow\StageQuery::in_stage(
						$sequence,
						$status['key'],
						array(
							'posts_per_page' => 100,
							'orderby'        => 'date',
							'order'          => 'DESC',
						)
					)
				);

				foreach ( $query->posts as $post ) {
					   // Check if user is involved with this post.
					   $claimed_by_id = get_post_meta( $post->ID, '_vip_workflows_assigned_to', true );
					   $assignments   = $assignment_manager->get_all( $post->ID );

					   $is_claimed  = $claimed_by_id && (int) $claimed_by_id === $current_user_id;
					   $is_assigned = false;

					   // Check if user has a pending assignment.
					foreach ( $assignments as $assignment ) {
						if ( 'user' === $assignment['type'] && $current_user_id === (int) $assignment['value'] && 'pending' === $assignment['status'] ) {
							$is_assigned = true;
							break;
						}
					}

					   // Check if user is the post author.
						   $is_author = $current_user_id === (int) $post->post_author;

					   // Skip if user is not involved (not author, not claimed, not assigned).
					if ( ! $is_author && ! $is_claimed && ! $is_assigned ) {
						continue;
					}

					$items[] = array(
						'post_id'           => $post->ID,
						'title'             => $post->post_title ? $post->post_title : __( '(no title)', 'vip-workflows' ),
						'edit_url'          => get_edit_post_link( $post->ID, 'raw' ),
						'workflow_name'     => $sequence->name,
						'status_label'      => $status['label'],
						'status_color'      => $status['color'] ?? StagePalette::DEFAULT_COLOR,
						'post_status'       => $post->post_status,
						'post_status_label' => $this->get_core_status_label( $post ),
						'urgency'           => 'normal',
						'created_date'      => $post->post_date,
						'modified_date'     => $post->post_modified,
					);
				}
			}
		}

		// Also include non-workflow posts that match criteria. The NOT EXISTS
		// exclusion is applied at the query level (via StageQuery) so a workflow
		// post sitting in a terminal draft-visibility stage — absent from $items
		// because the loop above skips terminal stages — can never leak in here
		// as a plain non-workflow draft.
		$query = new \WP_Query(
			\VIPWorkflows\Workflow\StageQuery::not_in_any_workflow(
				array(
					'post_type'      => 'post',
					'post_status'    => array( 'draft', 'pending', 'future' ),
					'posts_per_page' => 100,
					'author'         => $current_user_id,
				)
			)
		);

		foreach ( $query->posts as $post ) {
			$items[] = array(
				'post_id'           => $post->ID,
				'title'             => $post->post_title ? $post->post_title : __( '(no title)', 'vip-workflows' ),
				'edit_url'          => get_edit_post_link( $post->ID, 'raw' ),
				'workflow_name'     => null,
				// A post in no workflow is at no stage, so it has no stage label and
				// no stage color. Emitting its core status here put "Scheduled" in a
				// column headed Stage, tinted like one, and scraped it into the stage
				// filter — a post that is in no workflow appearing to be in a
				// workflow stage. The core status travels in its own pair below.
				'status_label'      => null,
				'status_color'      => null,
				'post_status'       => $post->post_status,
				'post_status_label' => $this->get_core_status_label( $post ),
				'urgency'           => 'normal',
				'created_date'      => $post->post_date,
				'modified_date'     => $post->post_modified,
			);
		}

		// Sort by urgency (breaking > urgent > normal), then by created date DESC.
		$urgency_order = array(
			'breaking' => 1,
			'urgent'   => 2,
			'normal'   => 3,
		);

		usort(
			$items,
			function ( $a, $b ) use ( $urgency_order ) {
				$urgency_a = $urgency_order[ $a['urgency'] ] ?? 3;
				$urgency_b = $urgency_order[ $b['urgency'] ] ?? 3;

				if ( $urgency_a !== $urgency_b ) {
					return $urgency_a <=> $urgency_b;
				}

				// Same urgency - sort by created date DESC.
				return strtotime( $b['created_date'] ) <=> strtotime( $a['created_date'] );
			}
		);

		return new WP_REST_Response( $items );
	}

	/**
	 * Label of a post's core status, as registered.
	 *
	 * Both My Work passes query registered statuses only, so a post whose
	 * status has no status object carries a status nothing declared: a
	 * data-integrity condition. It is logged and reported as an absent label
	 * rather than substituting the raw slug, which reads in the UI as though it
	 * were the real one. The row still ships — this endpoint is a user's own
	 * work list, and dropping the post would hide the work instead of the
	 * problem.
	 *
	 * @param  \WP_Post $post Post.
	 * @return string|null Registered label, or null when the status is not registered.
	 */
	private function get_core_status_label( \WP_Post $post ): ?string {
		$status_object = get_post_status_object( $post->post_status );

		if ( ! $status_object ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d carries the unregistered post status "%s"; My Work reports it with no status label.', $post->ID, $post->post_status ) );

			return null;
		}

		return $status_object->label;
	}

	/**
	 * Get Kanban board data for all active sequences.
	 *
	 * Returns posts grouped by status columns for each sequence.
	 * Only returns posts the current user has access to.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_kanban_data( $request ) {
		$current_user_id = get_current_user_id();
		if ( ! $current_user_id ) {
			return new WP_REST_Response(
				array(
					'sequences' => array(),
					'columns'    => array(),
				)
			);
		}

		$filter_sequence_id = $request->get_param( 'sequence_id' );
		$include_hidden      = (bool) $request->get_param( 'include_hidden' );

		$repository         = new \VIPWorkflows\Sequences\SequenceRepository();
		$assignment_manager = new \VIPWorkflows\Workflow\AssignmentManager();

		// Always get ALL workflow sequences for the dropdown.
		$all_sequences = $repository->get_workflow_sequences();

		$no_workflow_mode = 'none' === $filter_sequence_id;

		// But only process columns for the filtered one (or all if no filter).
		if ( $no_workflow_mode ) {
			$sequences_to_process = array();
		} elseif ( $filter_sequence_id ) {
			$sequence = $repository->find( (int) $filter_sequence_id );
			$sequences_to_process = $sequence ? array( $sequence ) : array();
		} else {
			$sequences_to_process = $all_sequences;
		}

		$result_sequences = array();
		$result_columns    = array();

		// Build the sequences list for dropdown (all active workflows).
		foreach ( $all_sequences as $bp ) {
			if ( ! $bp->is_active() ) {
				continue;
			}

			$result_sequences[] = array(
				'id'         => $bp->id,
				'name'       => $bp->name,
				'slug'       => $bp->slug,
				'post_types' => $bp->get_post_types(),
			);
		}

		// Build columns only for the selected sequence(s).
		foreach ( $sequences_to_process as $sequence ) {
			if ( ! $sequence->is_active() ) {
				continue;
			}

			$statuses = $sequence->get_statuses();

			foreach ( $statuses as $status ) {
				// Hidden ⇔ terminal, dead-end, or a publish-region stage that is
				// the end of the line (no outgoing transitions): posts there are
				// live with no pending workflow work. A publish-region stage WITH
				// onward transitions is a real board column. The region comes from
				// the stage's `status` field (stage × status matrix), which the
				// write gate guarantees on every stored stage.
				$is_hidden = ! empty( $status['is_terminal'] )
					|| ! empty( $status['is_dead_end'] )
					|| ( 'publish' === $sequence->get_stage_status( $status['key'] ) && empty( $status['transitions'] ) );

				// Skip hidden statuses unless requested.
				if ( ! $include_hidden && $is_hidden ) {
					continue;
				}

				// Query posts in this stage.
				$query = new \WP_Query(
					\VIPWorkflows\Workflow\StageQuery::in_stage(
						$sequence,
						$status['key'],
						array(
							'posts_per_page' => 100,
							'orderby'        => 'modified',
							'order'          => 'DESC',
						)
					)
				);

				$cards = array();

				foreach ( $query->posts as $post ) {
					// Check user access: user must be able to edit the post.
					if ( ! current_user_can( 'edit_post', $post->ID ) ) {
						continue;
					}

					$claimed_by_id = get_post_meta( $post->ID, '_vip_workflows_assigned_to', true );

					// Get assignment info.
					$assignments = $assignment_manager->get_all( $post->ID );
					$assigned_to = null;
					foreach ( $assignments as $assignment ) {
						if ( 'user' === $assignment['type'] && 'pending' === $assignment['status'] ) {
							$assigned_to = Actor::from_user( $assignment['value'] );
							break;
						}
					}

					// Get due date if set.
					$due_date = get_post_meta( $post->ID, '_vip_workflows_due_date', true );

					$urgency = 'normal';

					// Calculate waiting time.
					$modified     = strtotime( $post->post_modified );
					$waiting_time = human_time_diff( $modified, current_time( 'timestamp' ) );

					$cards[] = array(
						'id'           => $post->ID,
						'title'        => $post->post_title ? $post->post_title : __( '(no title)', 'vip-workflows' ),
						'edit_url'     => get_edit_post_link( $post->ID, 'raw' ),
						'author'       => Actor::from_user( $post->post_author ),
						// A pending assignment names the person the card is
						// waiting on; with none, whoever claimed it stands in.
						'assigned_to'  => $assigned_to ?? Actor::from_user( $claimed_by_id ),
						'due_date'     => $due_date ? $due_date : null,
						'urgency'      => $urgency,
						'waiting_time' => $waiting_time,
						'modified'     => $post->post_modified,
						'created'      => $post->post_date,
					);
				}

				// Build column key unique across sequences.
				$column_key = $sequence->slug . '__' . $status['key'];

				$result_columns[] = array(
					'key'          => $column_key,
					'status_key'   => $status['key'],
					'sequence_id' => $sequence->id,
					'label'        => $status['label'],
					'color'        => $status['color'] ?? StagePalette::DEFAULT_COLOR,
					'is_initial'   => ! empty( $status['is_initial'] ),
					'is_terminal'  => ! empty( $status['is_terminal'] ),
					'is_hidden'    => $is_hidden,
					'count'        => count( $cards ),
					'cards'        => $cards,
				);
			}
		}

		if ( $no_workflow_mode ) {
			$all_post_types = array();
			foreach ( $all_sequences as $bp ) {
				if ( $bp->is_active() ) {
					$all_post_types = array_merge( $all_post_types, $bp->get_post_types() );
				}
			}
			$all_post_types = array_unique( $all_post_types );
			$all_post_types = $all_post_types ? $all_post_types : array( 'post' );

			// Colors come from StagePalette, not from a second copy of the core-status
			// map: a plain draft in this board and the same draft on the calendar are
			// tinted by the same authority.
			$wp_statuses = array(
				array(
					'key' => 'draft',
					'label' => __( 'Draft', 'vip-workflows' ),
					'color' => StagePalette::for_post_status( 'draft' ),
				),
				array(
					'key' => 'pending',
					'label' => __( 'Pending Review', 'vip-workflows' ),
					'color' => StagePalette::for_post_status( 'pending' ),
				),
				array(
					'key' => 'future',
					'label' => __( 'Scheduled', 'vip-workflows' ),
					'color' => StagePalette::for_post_status( 'future' ),
				),
				array(
					'key' => 'publish',
					'label' => __( 'Published', 'vip-workflows' ),
					'color' => StagePalette::for_post_status( 'publish' ),
				),
			);

			foreach ( $wp_statuses as $status_def ) {
				// Exclude workflow-managed posts at the query level (NOT EXISTS via
				// StageQuery) so the 100-row LIMIT applies AFTER exclusion. Filtering
				// per-row afterwards would let workflow rows fill the window and starve
				// plain drafts, emptying the column on an active site.
				$query = new \WP_Query(
					\VIPWorkflows\Workflow\StageQuery::not_in_any_workflow(
						array(
							'post_type'      => $all_post_types,
							'post_status'    => $status_def['key'],
							'posts_per_page' => 100,
							'orderby'        => 'modified',
							'order'          => 'DESC',
						)
					)
				);

				$cards = array();
				foreach ( $query->posts as $post ) {
					if ( ! current_user_can( 'edit_post', $post->ID ) ) {
						continue;
					}

					$modified     = strtotime( $post->post_modified );
					$waiting_time = human_time_diff( $modified, current_time( 'timestamp' ) );

					$cards[] = array(
						'id'           => $post->ID,
						'title'        => $post->post_title ? $post->post_title : __( '(no title)', 'vip-workflows' ),
						'edit_url'     => get_edit_post_link( $post->ID, 'raw' ),
						'author'       => Actor::from_user( $post->post_author ),
						'assigned_to'  => null,
						'due_date'     => null,
						'urgency'      => 'normal',
						'waiting_time' => $waiting_time,
						'modified'     => $post->post_modified,
						'created'      => $post->post_date,
					);
				}

				$result_columns[] = array(
					'key'          => 'nowf__' . $status_def['key'],
					'status_key'   => $status_def['key'],
					'sequence_id' => null,
					'label'        => $status_def['label'],
					'color'        => $status_def['color'],
					'is_initial'   => false,
					'is_terminal'  => false,
					'is_hidden'    => false,
					'count'        => count( $cards ),
					'cards'        => $cards,
				);
			}
		}

		return new WP_REST_Response(
			array(
				'sequences' => $result_sequences,
				'columns'    => $result_columns,
			)
		);
	}

	/**
	 * Get posts for calendar view.
	 *
	 * Returns posts within the date range, grouped by date.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_calendar_data( $request ) {
		$start_date = $request->get_param( 'start' );
		$end_date   = $request->get_param( 'end' );
		$filter     = $request->get_param( 'filter' );

		// Validate dates.
		$start = \DateTime::createFromFormat( 'Y-m-d', $start_date );
		$end   = \DateTime::createFromFormat( 'Y-m-d', $end_date );

		if ( ! $start || ! $end ) {
			return new WP_Error(
				'invalid_dates',
				__( 'Invalid date format. Use Y-m-d.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		// Build query args based on filter.
		$post_statuses = array( 'publish', 'future' );
		if ( 'all' === $filter ) {
			$post_statuses = array( 'publish', 'future', 'draft', 'pending', 'private' );
		}

		// Get all post types that can have workflows.
		$post_types = array( 'post', 'page' );
		$repository = new \VIPWorkflows\Sequences\SequenceRepository();
		$sequences = $repository->get_workflow_sequences();

		foreach ( $sequences as $sequence ) {
			if ( $sequence->is_active() ) {
				$bp_post_types = $sequence->get_post_types();
				$post_types    = array_merge( $post_types, $bp_post_types );
			}
		}
		$post_types = array_unique( $post_types );

		// Query posts within date range.
		$query = new \WP_Query(
			array(
				'post_type'      => $post_types,
				'post_status'    => $post_statuses,
				'posts_per_page' => 500,
				'date_query'     => array(
					array(
						'after'     => $start_date,
						'before'    => $end_date,
						'inclusive' => true,
					),
				),
				'orderby'        => 'date',
				'order'          => 'ASC',
			)
		);

		$events = array();

		// Preload all sequence IDs referenced by these posts to avoid N+1.
		$sequence_ids = array();
		foreach ( $query->posts as $post ) {
			$bid = get_post_meta( $post->ID, '_vip_workflows_sequence_id', true );
			if ( $bid ) {
				$sequence_ids[] = (int) $bid;
			}
		}
		$preloaded_sequences = $repository->preload( $sequence_ids );

		foreach ( $query->posts as $post ) {
			if ( ! current_user_can( 'edit_post', $post->ID ) ) {
				continue;
			}

			$sequence_id = get_post_meta( $post->ID, '_vip_workflows_sequence_id', true );
			$stage_key    = get_post_meta( $post->ID, '_vip_workflows_current_stage_key', true );

			$workflow_info = null;
			if ( $sequence_id ) {
				$sequence = $preloaded_sequences[ (int) $sequence_id ] ?? null;
				if ( $sequence && $stage_key ) {
					$status_config = $sequence->get_status( $stage_key );
					$workflow_info = array(
						'sequence_id'   => (int) $sequence_id,
						'sequence_name' => $sequence->name,
						'status_key'     => $stage_key,
						'status_label'   => $status_config['label'] ?? $stage_key,
						'status_color'   => $status_config['color'] ?? StagePalette::DEFAULT_COLOR,
					);
				}
			}

			// Map post_status to display info.
			$status_obj   = get_post_status_object( $post->post_status );
			$status_label = $status_obj ? $status_obj->label : $post->post_status;
			$status_color = StagePalette::for_post_status( $post->post_status );

			// Use workflow status if available.
			if ( $workflow_info ) {
				$status_label = $workflow_info['status_label'];
				$status_color = $workflow_info['status_color'];
			}

			$events[] = array(
				'id'           => $post->ID,
				'title'        => $post->post_title ? $post->post_title : __( '(no title)', 'vip-workflows' ),
				'start'        => $post->post_date,
				'end'          => $post->post_date,
				'post_type'    => $post->post_type,
				'post_status'  => $post->post_status,
				'status_label' => $status_label,
				'status_color' => $status_color,
				'edit_url'     => get_edit_post_link( $post->ID, 'raw' ),
				'view_url'     => get_permalink( $post->ID ),
				'excerpt'      => wp_trim_words( wp_strip_all_tags( $post->post_content ), 30 ),
				'author'       => Actor::from_user( $post->post_author ),
				'workflow'     => $workflow_info,
				'is_scheduled' => 'future' === $post->post_status,
				'is_published' => 'publish' === $post->post_status,
			);
		}

		return new WP_REST_Response(
			array(
				'events' => $events,
				'range'  => array(
					'start' => $start_date,
					'end'   => $end_date,
				),
			)
		);
	}
}
