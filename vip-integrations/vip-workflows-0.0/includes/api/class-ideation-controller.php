<?php
/**
 * Ideation REST API Controller.
 *
 * Endpoints for the story ideation workspace: seed submission,
 * state polling, card interactions, and mentor evaluation.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\AI\PromptRegistry;
use VIPWorkflows\AI\AiInference;
use VIPWorkflows\Ideation\Assistants\IdeationOrchestrator;
use VIPWorkflows\Integrations\DraftBuilder;
use VIPWorkflows\Integrations\SsrfGuard;
use VIPWorkflows\Integrations\UploadsPathGuard;
use VIPWorkflows\Integrations\LlmJsonGenerator;
use VIPWorkflows\Integrations\LlmTextGenerator;
use VIPWorkflows\Integrations\Markdown;
use VIPWorkflows\Ideation\Research\IdeationAnalyzer;
use VIPWorkflows\Ideation\Research\IdeationPostTypes;
use VIPWorkflows\Workflow\Actor;
use VIPWorkflows\Story\Story;
use VIPWorkflows\Sequences\SequenceRepository;
use VIPWorkflows\Abilities\AbilityExecutor;
use VIPWorkflows\Abilities\AbilitySettings;
use VIPWorkflows\Abilities\AiAvailability;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;
use WP_Error;

/**
 * Ideation Controller.
 */
class IdeationController extends WP_REST_Controller {

	/**
	 * REST namespace.
	 *
	 * @var mixed
	 */
	protected $namespace = 'vip-workflows/v1';
	/**
	 * REST route base.
	 *
	 * @var mixed
	 */
	protected $rest_base = 'ideation';

	/**
	 * Token ceiling for draft generation, covering reasoning plus the whole draft.
	 *
	 * Unlike most ceilings in the plugin, the reply genuinely governs this one, and
	 * it has to be sized against the longest draft the route actually accepts rather
	 * than the 500-word default. `word_count` is bounded at 2000, which that bound's
	 * own comment models as ~2,600 tokens of body; the headline and the JSON
	 * envelope around it reach roughly 3,200 once the markdown is escaped into a
	 * string. So the previous flat 4000 could not satisfy the route's own accepted
	 * maximum even before reasoning was counted — and reasoning is billed against
	 * the same budget, leaving a maximum-length request nothing to write the body
	 * with.
	 *
	 * 6,000 tokens of reply budget above the floor is ~1.9x that modeled maximum,
	 * which absorbs a model that overshoots "approximately", and matches what the
	 * copy-edit agent was given for the same reason: it is the other caller whose
	 * reply has to reproduce a whole article body.
	 *
	 * Named rather than inlined because `create_draft` records the ceiling it ran
	 * under in `vip_draft_ai_context`. That was a second copy of the literal, so the
	 * audit trail could silently disagree with the request it claims to describe.
	 *
	 * @since 0.0.1
	 *
	 * @var int
	 */
	private const DRAFT_MAX_TOKENS = LlmTextGenerator::THINKING_FLOOR + 6000;

	/**
	 * Orchestrator.
	 *
	 * @var IdeationOrchestrator
	 */
	private IdeationOrchestrator $orchestrator;

	/**
	 * Construct the IdeationController instance.
	 */
	public function __construct() {
		$this->orchestrator = new IdeationOrchestrator();
	}

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		// Submit a seed and create ideation project.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/seed',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_from_seed' ),
				'permission_callback' => array( $this, 'create_permissions_check' ),
				'args'                => array(
					'seed' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => function ( $value ) {
							return ! empty( trim( $value ) );
						},
					),
				),
			)
		);

		// Get ideation state (cards, assistants, pins).
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_state' ),
					'permission_callback' => array( $this, 'edit_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_project' ),
					'permission_callback' => array( $this, 'edit_permissions_check' ),
				),
			)
		);

		// Pin a card.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/pin',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'pin_card' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'source_id' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Dismiss a card.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/dismiss',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'dismiss_card' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'source_id' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Unpin a card.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/unpin',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'unpin_card' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'source_id' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Restore a dismissed card.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/restore',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'restore_card' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'source_id' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		// Run a single assistant's initial pass (called in parallel by frontend).
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/run-assistant',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'run_initial_assistant' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'assistant' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => function ( $value ) {
							return in_array( $value, ( new IdeationOrchestrator() )->get_queryable_assistants(), true );
						},
					),
				),
			)
		);

		// Re-run the Seed Analyst from scratch, replacing the analysis and board.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/restart-analysis',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'restart_analysis' ),
				// Same gate as run-assistant: recovering a project whose analysis
				// never ran is the author's own repair, not an administrator's.
				'permission_callback' => array( $this, 'edit_permissions_check' ),
			)
		);

		// Run a follow-up query against a single assistant.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/query',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'run_query' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'query'     => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => function ( $value ) {
							return ! empty( trim( $value ) );
						},
					),
					'assistant' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => function ( $value ) {
							return in_array( $value, ( new IdeationOrchestrator() )->get_queryable_assistants(), true );
						},
					),
				),
			)
		);

		// Run mentor evaluation.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/mentor',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'run_mentor' ),
				// run_mentor writes an analysis — it must use the per-object edit
				// gate, not a bare read check.
				'permission_callback' => array( $this, 'edit_permissions_check' ),
			)
		);

		// Generate an AI image.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/generate-image',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'generate_image' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'prompt' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
						'validate_callback' => function ( $value ) {
							return ! empty( trim( $value ) );
						},
					),
				),
			)
		);

		// Create a draft post from ideation research.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/create-draft',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_draft' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(

					/*
					 * The bound has to be one the token ceiling can actually deliver.
					 * The requested length reaches the model as "approximately
					 * {word_count} words": at roughly 1.3 tokens per English word,
					 * 2000 words is about 2600 tokens of body, plus the headline and
					 * the JSON envelope around the escaped markdown. 2000 words is
					 * already longer than a long-form feature. Without the bound
					 * `absint` accepted any magnitude, so a caller could ask for a
					 * draft the ceiling could only ever return half-written.
					 *
					 * `self::DRAFT_MAX_TOKENS` is sized from this figure, so the two
					 * move together — see its own note for why the ceiling has to
					 * clear the body several times over rather than merely exceed it.
					 *
					 * `validate_callback` is required for the bound to do anything:
					 * `register_rest_route()` does not supply a default one, and
					 * `WP_REST_Request::has_valid_params()` skips any argument that
					 * has none — so `maximum` alone would be silently inert.
					 */
					'word_count' => array(
						'type'              => 'integer',
						'default'           => 500,
						'maximum'           => 2000,
						'sanitize_callback' => 'absint',
						'validate_callback' => 'rest_validate_request_arg',
					),
					'acknowledge_warnings' => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
			)
		);

		// Pre-check whether a phase transition is allowed (role + tools).
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/check-phase-transition',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'check_phase_transition_endpoint' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
				'args'                => array(
					'to_phase' => array(
						'type'              => 'string',
						'required'          => true,
						'enum'              => array( 'editorial' ),
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);

		// Generate a project-level summary from pinned sources.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/summarize',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'summarize_project' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
			)
		);

		// Get the latest project summary.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/summary',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_summary' ),
				'permission_callback' => array( $this, 'edit_permissions_check' ),
			)
		);

		// List recent ideation projects.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'list_projects' ),
				'permission_callback' => array( $this, 'get_permissions_check' ),
				'args'                => array(
					'per_page' => array(
						'type'              => 'integer',
						'default'           => 10,
						'sanitize_callback' => 'absint',
					),
					'author' => array(
						'type'    => 'string',
						'default' => 'me',
						'enum'    => array( 'me', 'all' ),
					),
				),
			)
		);
	}

	/**
	 * Create an ideation project from a seed.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function create_from_seed( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$seed    = $request->get_param( 'seed' );
		$user_id = get_current_user_id();

		$project_id = $this->orchestrator->create_from_seed( $seed, $user_id );
		if ( is_wp_error( $project_id ) ) {
			return $project_id;
		}

		$state = $this->orchestrator->get_state( $project_id );

		return new WP_REST_Response( $state, 201 );
	}

	/**
	 * Get the full ideation state for a project.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function get_state( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$project_id = (int) $request->get_param( 'id' );

		$project = get_post( $project_id );
		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_Error( 'not_found', __( 'Project not found.', 'vip-workflows' ), array( 'status' => 404 ) );
		}

		$state = $this->orchestrator->get_state( $project_id );

		return new WP_REST_Response( $state );
	}

	/**
	 * Delete the project.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_project( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$project_id = (int) $request->get_param( 'id' );
		$project    = get_post( $project_id );

		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_Error( 'not_found', __( 'Project not found.', 'vip-workflows' ), array( 'status' => 404 ) );
		}

		wp_delete_post( $project_id, true );

		return new WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * Pin a card in the workspace.
	 *
	 * If the pinned source has no AI summary yet, one is generated
	 * automatically so that create-draft has richer context.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function pin_card( WP_REST_Request $request ): WP_REST_Response {
		$project_id = (int) $request->get_param( 'id' );
		$source_id  = $request->get_param( 'source_id' );

		$this->orchestrator->pin_card( $project_id, $source_id );
		$this->maybe_summarize_source( $project_id, $source_id );

		return new WP_REST_Response( $this->orchestrator->get_state( $project_id ) );
	}

	/**
	 * Dismiss a card from the workspace.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function dismiss_card( WP_REST_Request $request ): WP_REST_Response {
		$project_id = (int) $request->get_param( 'id' );
		$source_id  = $request->get_param( 'source_id' );

		$this->orchestrator->dismiss_card( $project_id, $source_id );

		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * Unpin a previously pinned card.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function unpin_card( WP_REST_Request $request ): WP_REST_Response {
		$project_id = (int) $request->get_param( 'id' );
		$source_id  = $request->get_param( 'source_id' );

		$this->orchestrator->unpin_card( $project_id, $source_id );

		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * Restore a dismissed card back to the workspace.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function restore_card( WP_REST_Request $request ): WP_REST_Response {
		$project_id = (int) $request->get_param( 'id' );
		$source_id  = $request->get_param( 'source_id' );

		$this->orchestrator->restore_card( $project_id, $source_id );

		return new WP_REST_Response( array( 'success' => true ) );
	}

	/**
	 * Run one assistant's initial pass and return updated state.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function run_initial_assistant( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$project_id   = (int) $request->get_param( 'id' );
		$assistant_id = $request->get_param( 'assistant' );

		$project = get_post( $project_id );
		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_Error( 'not_found', __( 'Project not found.', 'vip-workflows' ), array( 'status' => 404 ) );
		}

		$result = $this->orchestrator->run_initial_assistant( $project_id, $assistant_id );

		if ( 'failed' === ( $result['status'] ?? '' ) ) {
			return new WP_Error(
				'assistant_failed',
				$result['error'] ?? __( 'Agent failed.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( $this->orchestrator->get_state( $project_id ) );
	}

	/**
	 * Re-run the Seed Analyst and return updated state.
	 *
	 * Unlike run-assistant, anything short of `completed` is reported as an error:
	 * the caller asked for the analysis and the board to be replaced, and they were
	 * not. The stored analyst result carries why, so the client refetches state to
	 * show it.
	 *
	 * @since 0.0.1
	 *
	 * @param  WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error Fresh ideation state, or the failure.
	 */
	public function restart_analysis( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$project_id = (int) $request->get_param( 'id' );

		$project = get_post( $project_id );
		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_Error( 'not_found', __( 'Project not found.', 'vip-workflows' ), array( 'status' => 404 ) );
		}

		$result = $this->orchestrator->restart_analysis( $project_id );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( 'completed' !== ( $result['status'] ?? '' ) ) {
			return new WP_Error(
				'restart_failed',
				$result['error'] ?? __( 'The seed analysis could not run.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response( $this->orchestrator->get_state( $project_id ) );
	}

	/**
	 * Run a follow-up query against a single assistant and return updated state.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function run_query( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$project_id   = (int) $request->get_param( 'id' );
		$query        = $request->get_param( 'query' );
		$assistant_id = $request->get_param( 'assistant' );

		$project = get_post( $project_id );
		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_Error( 'not_found', __( 'Project not found.', 'vip-workflows' ), array( 'status' => 404 ) );
		}

		$result = $this->orchestrator->run_query( $project_id, $assistant_id, $query );

		if ( ( $result['status'] ?? '' ) === 'failed' ) {
			return new WP_Error(
				'query_failed',
				$result['error'] ?? __( 'Query failed.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$state = $this->orchestrator->get_state( $project_id );

		return new WP_REST_Response( $state );
	}

	/**
	 * Run the editorial mentor evaluation.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function run_mentor( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$project_id = (int) $request->get_param( 'id' );

		$result = $this->orchestrator->run_mentor( $project_id );

		return new WP_REST_Response( $result );
	}

	/**
	 * Generate an AI image for a project.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function generate_image( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$project_id = (int) $request->get_param( 'id' );
		$prompt     = $request->get_param( 'prompt' );

		$result = $this->orchestrator->generate_image( $project_id, $prompt );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( $result, 201 );
	}

	/**
	 * Create a draft post from ideation workspace content.
	 *
	 * Builds context from the seed, seed analysis, and pinned cards,
	 * then uses AI to generate a full article draft.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function create_draft( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		global $wpdb;

		$project_id = (int) $request->get_param( 'id' );
		$project    = get_post( $project_id );

		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_Error( 'not_found', __( 'Project not found.', 'vip-workflows' ), array( 'status' => 404 ) );
		}

		$gate = $this->check_phase_transition( 'editorial', $project_id, (bool) $request->get_param( 'acknowledge_warnings' ) );
		if ( is_wp_error( $gate ) ) {
			return $gate;
		}

		if ( ! class_exists( '\WordPress\AiClient\AiClient' ) ) {
			return new WP_Error( 'ai_unavailable', __( 'AI client is not available.', 'vip-workflows' ), array( 'status' => 503 ) );
		}

		$state      = $this->orchestrator->get_state( $project_id );
		$seed       = $state['seed'] ?? '';
		$analysis   = $state['seed_analysis'] ?? array();
		$pinned_ids = $state['pinned_ids'] ?? array();
		$all_cards  = $state['cards'] ?? array();

		$pinned_cards = array_values(
			array_filter(
				$all_cards,
				function ( $card ) use ( $pinned_ids ) {
					$id = $card['source_id'] ?? $card['card_id'] ?? '';
					return in_array( $id, $pinned_ids, true );
				}
			)
		);

		$pinned_images = array();
		$image_index   = 0;
		foreach ( $pinned_cards as $card ) {
			$source_type   = $card['source_type'] ?? '';
			$attachment_id = (int) ( $card['attachment_id'] ?? 0 );
			$image_url     = $card['image'] ?? '';

			if ( $attachment_id && wp_attachment_is_image( $attachment_id ) ) {
				$image_url = wp_get_attachment_url( $attachment_id );
			} elseif ( 'image' === $source_type && ! empty( $image_url ) ) {
				$attachment_id = $this->sideload_image( $image_url, $card['title'] ?? '' );
				if ( ! $attachment_id ) {
					continue;
				}
				$image_url  = wp_get_attachment_url( $attachment_id );
				$source_id  = $card['source_id'] ?? $card['card_id'] ?? '';
				if ( $source_id ) {
					$wpdb->update(
						$wpdb->prefix . 'vip_ideation_sources',
						array( 'attachment_id' => $attachment_id ),
						array(
							'project_id' => $project_id,
							'source_id'  => $source_id,
						),
						array( '%d' ),
						array( '%d', '%s' )
					);
				}
			} else {
				continue;
			}

			++$image_index;
			$alt = $card['title'] ?? $card['label'] ?? '';
			$ai  = ! empty( $card['ai_analysis'] )
				? ( is_array( $card['ai_analysis'] ) ? $card['ai_analysis'] : json_decode( $card['ai_analysis'], true ) )
				: array();
			// This becomes the attachment's description in the media library, a
			// record outside this UI, so the markdown the summary carries for the
			// card modal is stripped rather than persisted into it.
			$desc = Markdown::to_plain_text(
				(string) ( $ai['summary'] ?? $card['excerpt'] ?? $alt )
			);

			$pinned_images[] = array(
				'index'         => $image_index,
				'attachment_id' => $attachment_id,
				'url'           => $image_url,
				'alt'           => $alt,
				'description'   => $desc,
			);
		}

		$research_context = "Seed idea: {$seed}\n";

		if ( ! empty( $analysis['tags'] ) ) {
			$research_context .= 'Topics: ' . implode( ', ', $analysis['tags'] ) . "\n";
		}

		if ( ! empty( $analysis['news_angle'] ) ) {
			$research_context .= "News angle: {$analysis['news_angle']}\n";
		}

		if ( ! empty( $pinned_cards ) ) {
			$research_context .= "\nPinned research sources:\n";
			foreach ( $pinned_cards as $card ) {
				$title = $card['title'] ?? $card['label'] ?? '';
				$url   = $card['url'] ?? '';

				$ai = ! empty( $card['ai_analysis'] )
					? ( is_array( $card['ai_analysis'] ) ? $card['ai_analysis'] : json_decode( $card['ai_analysis'], true ) )
					: array();
				$summary = $ai['summary']
					?? $card['summary'] ?? $card['content'] ?? $card['snippet'] ?? '';

				if ( ! empty( $title ) ) {
					$research_context .= "\n- {$title}";
					if ( ! empty( $url ) ) {
						$research_context .= " ({$url})";
					}
					if ( ! empty( $summary ) ) {
						$research_context .= "\n  {$summary}";
					}
				}
			}
		}

		$category_id       = (int) get_post_meta( $project_id, '_vip_ideation_category_id', true );
		$guideline_context = DraftBuilder::gather_guideline_context( $category_id );
		$word_count        = (int) $request->get_param( 'word_count' );
		$project_name      = $project->post_title;

		$image_instructions = '';
		if ( ! empty( $pinned_images ) ) {
			$image_instructions = "\n\nAVAILABLE IMAGES:\n"
				. 'You have the following images to place in the article. '
				. 'Insert [IMAGE:N] on its own line where the image fits editorially. '
				. "Not all images must be used, but place at least one if any are available.\n";
			foreach ( $pinned_images as $img ) {
				$image_instructions .= "[IMAGE:{$img['index']}] \"{$img['alt']}\" - {$img['description']}\n";
			}
		}

		$image_placement = ! empty( $pinned_images )
			? ' Place [IMAGE:N] tokens on their own line where images belong.'
			: '';

		$registry      = PromptRegistry::get_instance();
		$system_prompt = $registry->get(
			'ideation/draft-system',
			array(
				'guideline_context' => $guideline_context,
				'word_count'        => $word_count,
				'image_placement'   => $image_placement,
			)
		);

		$user_prompt = $registry->get(
			'ideation/draft-user',
			array(
				'project_name'       => $project_name,
				'research_context'   => $research_context,
				'image_instructions' => $image_instructions,
			)
		);

		$parsed = $this->generate_draft_payload( $system_prompt, $user_prompt );
		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		if ( empty( $parsed['title'] ) || empty( $parsed['body'] ) ) {
			return new WP_Error(
				'ai_parse_error',
				__( 'AI response is missing required fields (title, body).', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$title = sanitize_text_field( $parsed['title'] );
		$body  = $parsed['body'];

		if ( ! empty( $pinned_images ) ) {
			$body = DraftBuilder::replace_image_tokens( $body, $pinned_images );
		}

		$blocks = DraftBuilder::markdown_to_blocks( $body );

		$post_id = wp_insert_post(
			array(
				'post_type'    => 'post',
				'post_title'   => $title,
				'post_content' => $blocks,
				'post_status'  => 'draft',
				'post_author'  => get_current_user_id(),
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		update_post_meta( $post_id, '_vip_ideation_project_id', $project_id );

		if ( ! empty( $pinned_images ) ) {
			set_post_thumbnail( $post_id, $pinned_images[0]['attachment_id'] );

			foreach ( $pinned_images as $img ) {
				wp_update_post(
					array(
						'ID'          => $img['attachment_id'],
						'post_parent' => $post_id,
					)
				);
			}
		}

		$story = Story::for_object( $project_id );
		if ( $story ) {
			$story->add_object( $post_id, 'post' );
			$story->transition( Story::STATUS_EDITORIAL );
		}

		update_post_meta(
			$post_id,
			'vip_draft_ai_context',
			wp_json_encode(
				array(
					'provider'       => 'openai',
					'model'          => $model_name,
					'temperature'    => 0.7,
					'max_tokens'     => self::DRAFT_MAX_TOKENS,
					'word_count'     => $word_count,
					'system_prompt'  => $system_prompt,
					'user_prompt'    => $user_prompt,
					'project_id'     => $project_id,
					'project_title'  => $project_name,
					'source'         => 'ideation',
					'generated_by'   => get_current_user_id(),
					'generated_at'   => current_time( 'mysql', true ),
				)
			)
		);

		if ( $category_id > 0 ) {
			wp_set_post_categories( $post_id, array( $category_id ) );
		}

		return new WP_REST_Response(
			array(
				'post_id'  => $post_id,
				'edit_url' => get_edit_post_link( $post_id, 'raw' ),
			),
			201
		);
	}

	/**
	 * Generate the draft JSON payload for the create-draft route.
	 *
	 * Kept separate from the route so the three ways generation can fail — a
	 * provider that refuses the request, a reply cut off at the ceiling, and a
	 * reply that will not decode — each reach the caller under their own REST code
	 * instead of the single `ai_parse_error` they used to share. A truncated draft
	 * was previously indistinguishable from any other malformed response, which is
	 * the difference between "raise the ceiling" and "the model misbehaved".
	 *
	 * @since 0.0.1
	 *
	 * @param string $system_prompt Draft system instruction.
	 * @param string $user_prompt   Draft user prompt.
	 * @return array|WP_Error Decoded draft payload, or a WP_Error carrying a 500 status.
	 */
	private function generate_draft_payload( string $system_prompt, string $user_prompt ): array|WP_Error {
		/*
		 * No temperature is requested. The draft prompt does not depend on a
		 * particular sampling setting, and the value previously sent here (0.7) was
		 * rejected outright by newer Claude models, which report `temperature` as
		 * deprecated and answer the whole request with HTTP 400. Leaving the option
		 * unset uses each provider's own default and keeps this route working on
		 * every configured model.
		 *
		 * The call is wrapped because a provider can reject a request for reasons
		 * this code cannot anticipate. It was previously the only AI call in this
		 * class with no handler, so such a rejection escaped as an uncaught
		 * exception and the route answered with WordPress's generic critical-error
		 * page — no message, nothing to act on.
		 */
		try {
			$parsed = LlmJsonGenerator::generate(
				\WordPress\AiClient\AiClient::prompt( $user_prompt )
					->usingSystemInstruction( $system_prompt )
					->usingModel( AiInference::get_instance()->model() )
					->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( self::DRAFT_MAX_TOKENS ) )
					->asJsonResponse(),
				'draft generation'
			);
		} catch ( \Throwable $e ) {
			return new WP_Error(
				'ai_error',
				$e->getMessage(),
				array( 'status' => 500 )
			);
		}

		if ( ! is_wp_error( $parsed ) ) {
			return $parsed;
		}

		/*
		 * The generator already distinguishes truncation from a response that will not
		 * decode, so the REST code carries that distinction through rather than
		 * flattening it: `ai_truncated_response`, `ai_incomplete_response`,
		 * `ai_parse_error`, `ai_no_candidates`. Prefixing instead of mapping means a
		 * condition the generator learns to report later cannot quietly arrive here as
		 * a parse error, which is the conflation this route is being fixed for.
		 */
		return new WP_Error(
			'ai_' . $parsed->get_error_code(),
			$parsed->get_error_message(),
			array( 'status' => 500 )
		);
	}

	/**
	 * Pre-check whether a phase transition is allowed without executing it.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function check_phase_transition_endpoint( WP_REST_Request $request ): WP_REST_Response {
		$project_id = (int) $request->get_param( 'id' );
		$project    = get_post( $project_id );

		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_REST_Response(
				array(
					'allowed' => false,
					'code' => 'not_found',
					'message' => __( 'Project not found.', 'vip-workflows' ),
				),
				200
			);
		}

		$gate = $this->check_phase_transition( $request->get_param( 'to_phase' ), $project_id );
		if ( is_wp_error( $gate ) ) {
			return new WP_REST_Response(
				array(
					'allowed'        => false,
					'code'           => $gate->get_error_code(),
					'message'        => $gate->get_error_message(),
					'hard_failures'  => $gate->get_error_data()['hard_failures'] ?? array(),
					'soft_warnings'  => $gate->get_error_data()['soft_warnings'] ?? array(),
				),
				200
			);
		}

		return new WP_REST_Response( array( 'allowed' => true ), 200 );
	}

	/**
	 * List recent ideation projects for the current user.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function list_projects( WP_REST_Request $request ): WP_REST_Response {
		$per_page = $request->get_param( 'per_page' );
		$author   = $request->get_param( 'author' );

		$query_args = array(
			'post_type'      => IdeationPostTypes::POST_TYPE,
			'post_status'    => array( 'active', 'draft' ),
			'posts_per_page' => $per_page,
			'orderby'        => 'modified',
			'order'          => 'DESC',
		);

		// Listing every author's projects requires edit_others_posts; everyone
		// else (including author=all without the cap) is scoped to their own
		// projects.
		if ( 'all' !== $author || ! current_user_can( 'edit_others_posts' ) ) {
			$query_args['author'] = get_current_user_id();
		}

		$projects = get_posts( $query_args );

		global $wpdb;
		$sources_table = $wpdb->prefix . 'vip_ideation_sources';

		$items = array();
		foreach ( $projects as $project ) {
			$seed_analysis = get_post_meta( $project->ID, '_vip_ideation_seed_analysis', true );
			$seed_analysis = json_decode( $seed_analysis ? $seed_analysis : '{}', true );

			$source_count = (int) $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM %i WHERE project_id = %d',
					$sources_table,
					$project->ID
				)
			);

			$story           = Story::for_object( $project->ID );
			$pipeline_status = $story ? $story->get_status() : null;

			$items[] = array(
				'id'              => $project->ID,
				'title'           => $project->post_title,
				'seed'            => get_post_meta( $project->ID, '_vip_ideation_seed', true ),
				'tags'            => $seed_analysis['tags'] ?? array(),
				'status'          => $project->post_status,
				'source_count'    => $source_count,
				'pipeline_status' => $pipeline_status,
				'author'          => Actor::from_user( $project->post_author ),
				'created_at'      => $project->post_date,
				'updated_at'      => $project->post_modified,
			);
		}

		return new WP_REST_Response( $items );
	}

	/**
	 * Generate a project-level summary from pinned sources.
	 *
	 * Uses individual source summaries (auto-generated on pin) as input
	 * to produce an overall project summary + key points.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function summarize_project( WP_REST_Request $request ): WP_REST_Response|WP_Error {
		$project_id = (int) $request->get_param( 'id' );
		$project    = get_post( $project_id );

		if ( ! $project || IdeationPostTypes::POST_TYPE !== $project->post_type ) {
			return new WP_Error( 'not_found', __( 'Project not found.', 'vip-workflows' ), array( 'status' => 404 ) );
		}

		$state      = $this->orchestrator->get_state( $project_id );
		$pinned_ids = $state['pinned_ids'] ?? array();
		$all_cards  = $state['cards'] ?? array();

		$pinned_sources = array_values(
			array_filter(
				$all_cards,
				function ( $card ) use ( $pinned_ids ) {
					$id = $card['source_id'] ?? $card['card_id'] ?? '';
					return in_array( $id, $pinned_ids, true ) && ! empty( $card['source_id'] );
				}
			)
		);

		if ( empty( $pinned_sources ) ) {
			return new WP_Error( 'no_pinned', __( 'Pin some sources before generating a summary.', 'vip-workflows' ), array( 'status' => 400 ) );
		}

		$analyzer = new IdeationAnalyzer();
		$result   = $analyzer->summarize_project( $pinned_sources, array( 'max_length' => 500 ) );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		global $wpdb;
		$analyses_table = $wpdb->prefix . 'vip_ideation_analyses';

		$wpdb->insert(
			$analyses_table,
			array(
				'project_id'  => $project_id,
				'tool_type'   => 'summarize',
				'query'       => null,
				'source_ids'  => wp_json_encode( array_column( $pinned_sources, 'source_id' ) ),
				'result'      => wp_json_encode( $result ),
				'tokens_used' => null,
				'created_by'  => get_current_user_id(),
				'created_at'  => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s', '%s', '%s', '%d', '%d', '%s' )
		);

		return new WP_REST_Response( $result );
	}

	/**
	 * Get the latest project summary if one exists.
	 *
	 * @param WP_REST_Request $request REST request.
	 */
	public function get_summary( WP_REST_Request $request ): WP_REST_Response {
		$project_id = (int) $request->get_param( 'id' );

		global $wpdb;
		$analyses_table = $wpdb->prefix . 'vip_ideation_analyses';

		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT result FROM %i WHERE project_id = %d AND tool_type = 'summarize' ORDER BY created_at DESC LIMIT 1",
				$analyses_table,
				$project_id
			),
			ARRAY_A
		);

		if ( ! $row ) {
			return new WP_REST_Response(
				array(
					'summary' => null,
					'key_points' => array(),
				)
			);
		}

		$data = json_decode( $row['result'], true );

		return new WP_REST_Response(
			array(
				'summary'    => $data['summary'] ?? null,
				'key_points' => $data['key_points'] ?? array(),
			)
		);
	}

	/**
	 * Summarize a source if it hasn't been summarized yet.
	 *
	 * Looks up the source in the ideation_sources table and runs
	 * IdeationAnalyzer::summarize_source() when ai_analysis has no summary.
	 * Failures are silently ignored since summarization is best-effort.
	 *
	 * @param int    $project_id Ideation project post ID.
	 * @param string $source_id Source ID.
	 */
	private function maybe_summarize_source( int $project_id, string $source_id ): void {
		global $wpdb;

		$table  = $wpdb->prefix . 'vip_ideation_sources';
		$source = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT * FROM %i WHERE project_id = %d AND source_id = %s',
				$table,
				$project_id,
				$source_id
			),
			ARRAY_A
		);

		if ( ! $source ) {
			return;
		}

		$ai_analysis = ! empty( $source['ai_analysis'] )
			? json_decode( $source['ai_analysis'], true )
			: array();

		if ( ! empty( $ai_analysis['summary'] ) ) {
			return;
		}

		$source_type = $source['source_type'] ?? 'article';

		if ( 'video' === $source_type ) {
			$this->analyze_video_source( $source, $table );
			return;
		}

		if ( 'image' === $source_type ) {
			$this->analyze_image_source( $source, $table );
			return;
		}

		$analyzer = new IdeationAnalyzer();
		$result   = $analyzer->summarize_source( $source );

		if ( is_wp_error( $result ) ) {
			return;
		}

		$ai_analysis['summary']     = $result['summary'];
		$ai_analysis['analyzed_at'] = $result['analyzed_at'];

		$wpdb->update(
			$table,
			array(
				'ai_analysis' => wp_json_encode( $ai_analysis ),
				'updated_at'  => current_time( 'mysql' ),
			),
			array(
				'project_id' => $project_id,
				'source_id'  => $source_id,
			),
			array( '%s', '%s' ),
			array( '%d', '%s' )
		);
	}

	/**
	 * Analyze a video source by fetching its YouTube transcript.
	 *
	 * @param array  $source Source row.
	 * @param string $table Database table name.
	 */
	private function analyze_video_source( array $source, string $table ): void {
		// Same gate as `analyze_image_source()`, and for a sharper reason than
		// symmetry: the analysis below hands `AiInference::model()` straight to
		// `usingModel()`, whose parameter is not nullable. An unresolvable
		// selection returns null there, so without this the call raises a
		// TypeError — an \Error, which the catch below does not catch, because it
		// only catches \Exception. That is an uncaught fatal on a site with no AI
		// provider configured, reached by pinning a video card.
		if ( ! AiAvailability::is_configured() ) {
			return;
		}

		$video_url = $source['url'] ?? $source['image'] ?? '';
		$video_id  = \VIPWorkflows\Integrations\YouTubeTranscript::extract_video_id( $video_url );

		if ( ! $video_id ) {
			return;
		}

		$transcript = \VIPWorkflows\Integrations\YouTubeTranscript::fetch( $video_id );
		if ( is_wp_error( $transcript ) ) {
			return;
		}

		$title     = $source['title'] ?? '';
		$max_chars = 12000;
		$trimmed   = mb_strlen( $transcript ) > $max_chars
			? mb_substr( $transcript, 0, $max_chars ) . '...'
			: $transcript;

		$prompt = PromptRegistry::get_instance()->get(
			'research/video-transcript',
			array(
				'title'      => $title,
				'transcript' => $trimmed,
			)
		);

		/*
		 * This reply is substantial enough to need budget of its own on top of the
		 * floor. The prompt asks for five numbered sections over a transcript trimmed
		 * to 12,000 characters (~3,000 prompt tokens) — key topics and arguments,
		 * notable quotes reproduced from the transcript, the people and organizations
		 * mentioned, a relevance assessment, and a summary — and instructs the model
		 * to be specific and cite the transcript, so the quotes and entity list scale
		 * with how much is in the video. A thorough analysis models at roughly 1,000
		 * to 1,500 tokens.
		 *
		 * 2,000 above the floor covers that with room for a dense transcript. The
		 * previous 1000 was under a third of the reasoning cost alone, so this
		 * analysis was not being produced: the failure is invisible here because the
		 * catch below returns silently and the source is simply left unanalyzed.
		 */
		try {
			$analysis = \WordPress\AiClient\AiClient::prompt( $prompt )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( LlmTextGenerator::THINKING_FLOOR + 2000 ) )
				->generateText();
		} catch ( \Exception $e ) {
			return;
		}

		$this->save_source_analysis( $source, $table, trim( $analysis ), 'transcript' );
	}

	/**
	 * Analyze an image source using the Vision API.
	 *
	 * @param array  $source Source row.
	 * @param string $table Database table name.
	 */
	private function analyze_image_source( array $source, string $table ): void {
		// The analysis below resolves its model through `AiInference`, so the gate
		// asks about the selected provider. Naming OpenAI skipped image analysis
		// entirely on a site configured for anything else.
		if ( ! AiAvailability::is_configured() ) {
			return;
		}

		$image_url = $source['image'] ?? $source['url'] ?? '';
		$file_path = null;
		$mime_type = null;
		$cleanup   = false;

		if ( ! empty( $source['attachment_id'] ) ) {
			$file_path = get_attached_file( (int) $source['attachment_id'] );
			$mime_type = get_post_mime_type( (int) $source['attachment_id'] );

			if ( $file_path && is_wp_error( UploadsPathGuard::validate( $file_path ) ) ) {
				return;
			}
		}

		if ( ! $file_path && ! empty( $image_url ) ) {
			$tmp = SsrfGuard::download_validated_no_redirects( $image_url, 30, 'analyze_image_source' );
			if ( is_wp_error( $tmp ) ) {
				return;
			}
			$file_path = $tmp;
			$mime_type = wp_check_filetype( wp_parse_url( $image_url, PHP_URL_PATH ) )['type'];
			$mime_type = $mime_type ? $mime_type : 'image/jpeg';
			$cleanup   = true;
		}

		if ( ! $file_path || ! file_exists( $file_path ) ) {
			return;
		}

		/*
		 * The ideation source variant of the image prompt is the short one: a single
		 * sentence asking what is shown, any visible text, and key details for
		 * editorial use. Even answered thoroughly that is a few hundred tokens of
		 * description, well inside the floor's own headroom, so nothing is added on
		 * top. The previous 800 was a fifth of the reasoning cost, and as with the
		 * transcript above the catch below swallows the failure, so the source was
		 * simply left with no vision analysis at all.
		 */
		try {
			$file     = new \WordPress\AiClient\Files\DTO\File( $file_path, $mime_type );
			$analysis = \WordPress\AiClient\AiClient::prompt(
				apply_filters(
					'vip_workflows_ai_image_prompt',
					PromptRegistry::get_instance()->get( 'ideation/image-source-analysis' ),
					(int) ( $source['attachment_id'] ?? 0 )
				)
			)
				->withFile( $file )
				->usingModel( AiInference::get_instance()->model() )
				->usingMaxTokens( LlmTextGenerator::bounded_max_tokens( LlmTextGenerator::THINKING_FLOOR ) )
				->generateText();
		} catch ( \Exception $e ) {
			if ( $cleanup ) {
				wp_delete_file( $file_path );
			}
			return;
		}

		if ( $cleanup ) {
			wp_delete_file( $file_path );
		}

		$this->save_source_analysis( $source, $table, trim( $analysis ), 'vision' );
	}

	/**
	 * Persist analysis results to the sources table.
	 *
	 * @param array  $source Source row.
	 * @param string $table Database table name.
	 * @param string $analysis Analysis data.
	 * @param string $method Analysis method.
	 */
	private function save_source_analysis( array $source, string $table, string $analysis, string $method ): void {
		global $wpdb;

		$ai_data = ! empty( $source['ai_analysis'] )
			? json_decode( $source['ai_analysis'], true )
			: array();

		$ai_data['summary']         = $analysis;
		$ai_data['analyzed_at']     = current_time( 'mysql' );
		$ai_data['analysis_method'] = $method;

		$wpdb->update(
			$table,
			array(
				'ai_analysis' => wp_json_encode( $ai_data ),
				'updated_at'  => current_time( 'mysql' ),
			),
			array(
				'project_id' => (int) $source['project_id'],
				'source_id'  => $source['source_id'],
			),
			array( '%s', '%s' ),
			array( '%d', '%s' )
		);
	}

	/**
	 * Check whether the current user can create resources for this endpoint.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function create_permissions_check( WP_REST_Request $request ): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Sideload an external image URL into the media library.
	 *
	 * @param string $url   External image URL.
	 * @param string $title Image title for the attachment.
	 * @return int Attachment ID, or 0 on failure.
	 */
	private function sideload_image( string $url, string $title ): int {
		if ( ! function_exists( 'media_handle_sideload' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
			require_once ABSPATH . 'wp-admin/includes/file.php';
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}

		$tmp = SsrfGuard::download_validated_no_redirects( $url, 30, 'sideload_image' );
		if ( is_wp_error( $tmp ) ) {
			return 0;
		}

		$filename = basename( wp_parse_url( $url, PHP_URL_PATH ) );
		$filename = $filename ? $filename : 'image.jpg';
		$file     = array(
			'name'     => sanitize_file_name( $filename ),
			'tmp_name' => $tmp,
		);

		$attachment_id = \media_handle_sideload( $file, 0, $title );
		if ( is_wp_error( $attachment_id ) ) {
			wp_delete_file( $tmp );
			return 0;
		}

		return (int) $attachment_id;
	}

	/**
	 * Check whether the current user can access this resource.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function get_permissions_check( WP_REST_Request $request ): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check whether the current user can edit this resource.
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return bool
	 */
	public function edit_permissions_check( WP_REST_Request $request ): bool {
		$project_id = (int) $request->get_param( 'id' );
		$project    = get_post( $project_id );

		if ( ! $project ) {
			return false;
		}

		return current_user_can( 'edit_posts' ) && (
			get_current_user_id() === (int) $project->post_author
			|| current_user_can( 'edit_others_posts' )
		);
	}

	/**
	 * Gate a phase transition: check role access and run required tools.
	 *
	 * @param string $to_phase              Target phase ('editorial').
	 * @param int    $project_id            Ideation project post ID.
	 * @param bool   $acknowledge_warnings  Whether user acknowledged soft warnings.
	 * @return true|WP_Error True if allowed, WP_Error if blocked.
	 */
	private function check_phase_transition( string $to_phase, int $project_id, bool $acknowledge_warnings = false ) {
		$repository = new SequenceRepository();
		$sequence  = $repository->get_active_phase_sequence();

		if ( ! $sequence ) {
			return new WP_Error(
				'no_phase_sequence',
				__( 'No active phase sequence found. A phase sequence is required.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		$transition = $sequence->get_phase_transition( 'ideation', $to_phase );
		if ( ! $transition ) {
			return new WP_Error(
				'transition_disabled',
				__( 'This transition is not configured.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		if ( ! $sequence->is_phase_transition_allowed( 'ideation', $to_phase, get_current_user_id() ) ) {
			return new WP_Error(
				'transition_forbidden',
				__( 'You do not have permission for this transition.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		$required_tools = $transition['required_tools'] ?? array();
		if ( empty( $required_tools ) ) {
			return true;
		}

		$executor = new AbilityExecutor();
		$settings = AbilitySettings::get_instance();
		$input    = array( 'project_id' => $project_id );

		$hard_failures = array();
		$soft_warnings = array();

		foreach ( $required_tools as $tool_id ) {
			$ability    = wp_get_ability( $tool_id );
			$tool_label = $ability ? $ability->get_label() : $tool_id;

			try {
				if ( ! $settings->is_enabled( $tool_id ) ) {
					$hard_failures[] = array(
						'tool'       => $tool_id,
						'tool_label' => $tool_label,
						'key'        => 'tool_disabled',
						'message'    => __( 'This required check is switched off. Re-enable it, or remove it from this transition.', 'vip-workflows' ),
						'severity'   => 'hard',
					);

					continue;
				}

				$result = $executor->execute( $tool_id, $input, 'ideation' );

				if ( ! $result->success ) {
					$hard_failures[] = array(
						'tool'       => $tool_id,
						'tool_label' => $tool_label,
						'key'        => 'execution_failed',
						'message'    => $result->error ? $result->error : __( 'This tool failed to execute.', 'vip-workflows' ),
						'severity'   => 'hard',
					);
					continue;
				}

				$issues = $result->output['issues'] ?? array();

				foreach ( $issues as $issue ) {
					$check_key      = $issue['check_key'] ?? $issue['type'] ?? 'general';
					$issue_severity = $issue['severity'] ?? 'warning';
					$is_hard        = $settings->is_hard_check( $tool_id, $check_key )
						|| 'error' === $issue_severity
						|| 'hard' === $issue_severity;

					$entry = array(
						'tool'       => $tool_id,
						'tool_label' => $tool_label,
						'key'        => $check_key,
						'message'    => $issue['message'] ?? $issue['description'] ?? __( 'Check failed', 'vip-workflows' ),
						'severity'   => $is_hard ? 'hard' : 'soft',
					);

					if ( $is_hard ) {
						$hard_failures[] = $entry;
					} else {
						$soft_warnings[] = $entry;
					}
				}
			} catch ( \InvalidArgumentException $e ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging of tool execution failures.
				error_log( "VIP Workflows: Phase transition tool {$tool_id} not found: " . $e->getMessage() );
				$hard_failures[] = array(
					'tool'       => $tool_id,
					'tool_label' => $tool_id,
					'key'        => 'tool_not_found',
					'message'    => __( 'This required tool is not installed or registered.', 'vip-workflows' ),
					'severity'   => 'hard',
				);
			} catch ( \Exception $e ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging of tool execution failures.
				error_log( "VIP Workflows: Phase transition tool {$tool_id} threw exception: " . $e->getMessage() );
				$hard_failures[] = array(
					'tool'       => $tool_id,
					'tool_label' => $tool_label,
					'key'        => 'execution_error',
					'message'    => __( 'This tool failed to run. Contact an administrator.', 'vip-workflows' ),
					'severity'   => 'hard',
				);
			}
		}

		if ( ! empty( $hard_failures ) ) {
			return new WP_Error(
				'tool_check_failed',
				__( 'Transition blocked by required checks.', 'vip-workflows' ),
				array(
					'status'        => 422,
					'hard_failures' => $hard_failures,
					'soft_warnings' => $soft_warnings,
				)
			);
		}

		if ( ! empty( $soft_warnings ) && ! $acknowledge_warnings ) {
			return new WP_Error(
				'tool_check_warnings',
				__( 'Transition has warnings that need acknowledgement.', 'vip-workflows' ),
				array(
					'status'        => 422,
					'hard_failures' => array(),
					'soft_warnings' => $soft_warnings,
				)
			);
		}

		return true;
	}
}
