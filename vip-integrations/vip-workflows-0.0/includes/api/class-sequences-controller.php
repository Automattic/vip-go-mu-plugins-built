<?php
/**
 * Sequences REST API controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\Sequences\SequenceRepository;
use VIPWorkflows\Plugin;
use VIPWorkflows\Workflow\StagePalette;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * REST controller for sequences.
 * Phase 1: Read-only access to sequences.
 */
class SequencesController extends WP_REST_Controller {


	/**
	 * Sequence repository.
	 *
	 * @var SequenceRepository
	 */
	private SequenceRepository $repository;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace  = RestController::NAMESPACE;
		$this->rest_base  = 'sequences';
		$this->repository = new SequenceRepository();
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		// GET /sequences - List sequences.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		// GET /sequences/{id} - Get single sequence.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Unique identifier for the sequence.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
			)
		);

		// GET /sequences/slug/{slug} - Get sequence by slug.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/slug/(?P<slug>[a-z0-9-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item_by_slug' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'slug' => array(
							'description' => 'Sequence slug.',
							'type'        => 'string',
							'required'    => true,
						),
					),
				),
			)
		);

		// DELETE /sequences/{id} - Delete sequence.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'delete_item_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Unique identifier for the sequence.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// POST /sequences - Create sequence.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'args'                => $this->get_create_args(),
				),
			)
		);

		// PUT /sequences/{id} - Update sequence.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)',
			array(
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
					'args'                => array_merge(
						array(
							'id' => array(
								'description' => 'Unique identifier for the sequence.',
								'type'        => 'integer',
								'required'    => true,
							),
						),
						$this->get_create_args()
					),
				),
			)
		);

		// GET /sequences/{id}/export - Export sequence as JSON.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/export',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'export_sequence' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Sequence ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// GET /sequences/{id}/stats - Get post counts per status.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/stats',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_stats' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Sequence ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// POST /sequences/{id}/repair-regions - Assign default status regions to
		// stages stored before the write gate.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[\d]+)/repair-regions',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'repair_stage_regions' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
					'args'                => array(
						'id' => array(
							'description' => 'Sequence ID.',
							'type'        => 'integer',
							'required'    => true,
						),
					),
				),
			)
		);

		// GET /sequences/options - What a sequence may be built out of.
		//
		// Registered before the /{id} routes only for reading order; `options`
		// is not digits, so it cannot be mistaken for one.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/options',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_authoring_options' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
			)
		);

		// POST /sequences/import - Import sequence from JSON.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/import',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'import_sequence' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
					'args'                => array(
						'sequence_json' => array(
							'description' => 'Sequence JSON data.',
							'type'        => 'object',
							'required'    => true,
						),
						'name'          => array(
							'description' => 'Name for the imported sequence.',
							'type'        => 'string',
							'required'    => false,
						),
					),
				),
			)
		);
	}

	/**
	 * Get collection of sequences.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_items( $request ) {
		$args = array(
			'type'        => $request->get_param( 'type' ),
			'status'      => $request->get_param( 'status' ),
			'latest_only' => $request->get_param( 'latest_only' ) !== false,
		);

		$sequences = $this->repository->get_all( array_filter( $args ) );

		// Phase sequences are an ideation-owned surface; hidden while the
		// Ideation feature is off.
		if ( ! Plugin::experiment_enabled( 'ideation' ) ) {
			$sequences = array_values(
				array_filter( $sequences, static fn ( $bp ) => Sequence::TYPE_PHASE !== $bp->type )
			);
		}

		return new WP_REST_Response(
			array_map( fn( $bp ) => $this->prepare_sequence_response( $bp ), $sequences )
		);
	}

	/**
	 * What a sequence may be built out of.
	 *
	 * The editor used to work both of these out for itself: it read
	 * `/wp/v2/types` and subtracted a hand-written list of WordPress's internal
	 * post types, and it wrote the phase adjacency out a second time in
	 * JavaScript. Neither is the editor's to know. Which post types can carry a
	 * workflow, and which phases a post can move between, are decided here —
	 * this controller is what accepts the save — so they are answered here, and
	 * the canvas offers what the write gate will take.
	 *
	 * The phase graph is published twice because it answers two questions: what a
	 * phase sequence MAY connect (`phase_transitions`) and what it MUST
	 * (`required_phase_transitions`). The canvas draws against the first and
	 * refuses Save against the second; build_config() keeps only the first and
	 * Sequence::prepare_config_for_write() refuses a config missing the second.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_authoring_options( $request ) {
		return new WP_REST_Response(
			array(
				'post_types'                 => $this->eligible_post_types(),
				'phase_transitions'          => Sequence::phase_edges( Sequence::PHASE_TRANSITIONS ),
				'required_phase_transitions' => Sequence::phase_edges( Sequence::REQUIRED_PHASES ),
			)
		);
	}

	/**
	 * Post types a workflow sequence can be attached to.
	 *
	 * WordPress registers its own machinery as post types — patterns, templates,
	 * navigation, fonts, menu items, media — and the set grows every release, so
	 * naming them to exclude them is a list that is wrong by the next one. Core
	 * already marks its own: everything it registers is `_builtin`. So the
	 * eligible set is the two content types WordPress ships, plus every post
	 * type someone else registered that is exposed to REST and has an editing
	 * screen. REST because the editor sidebar, the metadata fields and the
	 * transition endpoints all reach a post through it, so a post type that is
	 * not there cannot run a workflow. An editing screen because REST alone does
	 * not mean a person writes it: plugins expose their own storage over REST
	 * too, this one's ideation projects among them, and a workflow on a post
	 * type nobody can open in the editor has nowhere to run. `show_ui` rather
	 * than `public`, because a private content type an editorial team writes
	 * in wp-admin is still content.
	 *
	 * Media is not an exception that has to be written down: `attachment` is
	 * `_builtin`, so it never enters. Nor is this a gate — the write path
	 * sanitizes the slugs it is sent and stores them, exactly as before, because
	 * a sequence whose CPT comes from a plugin that is switched off must not
	 * lose its post types to an unrelated save.
	 *
	 * @return array List of { value, label } pairs, ready for the editor.
	 */
	private function eligible_post_types(): array {
		$eligible = array();

		foreach ( array( 'post', 'page' ) as $slug ) {
			$post_type = get_post_type_object( $slug );
			if ( $post_type ) {
				$eligible[ $slug ] = $post_type;
			}
		}

		$registered = get_post_types(
			array(
				'_builtin'     => false,
				'show_in_rest' => true,
				'show_ui'      => true,
			),
			'objects'
		);

		foreach ( $registered as $slug => $post_type ) {
			$eligible[ $slug ] = $post_type;
		}

		$options = array();
		foreach ( $eligible as $slug => $post_type ) {
			$options[] = array(
				'value' => $slug,
				'label' => $post_type->label,
			);
		}

		return $options;
	}

	/**
	 * Every phase a phase sequence may name, source or target.
	 *
	 * @return array List of phase keys.
	 */
	private static function phase_keys(): array {
		$keys = array_keys( Sequence::PHASE_TRANSITIONS );

		foreach ( Sequence::PHASE_TRANSITIONS as $targets ) {
			foreach ( $targets as $to ) {
				if ( ! in_array( $to, $keys, true ) ) {
					$keys[] = $to;
				}
			}
		}

		return $keys;
	}

	/**
	 * Get single sequence.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$id       = (int) $request->get_param( 'id' );
		$sequence = $this->repository->find( $id );

		if ( ! $sequence ) {
			return new WP_Error(
				'rest_sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response( $this->prepare_sequence_response( $sequence ) );
	}

	/**
	 * Get sequence by slug.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item_by_slug( $request ) {
		$slug     = $request->get_param( 'slug' );
		$sequence = $this->repository->find_by_slug( $slug );

		if ( ! $sequence ) {
			return new WP_Error(
				'rest_sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		return new WP_REST_Response( $this->prepare_sequence_response( $sequence ) );
	}

	/**
	 * Prepare sequence for response.
	 *
	 * @param  \VIPWorkflows\Sequences\Sequence $sequence Sequence.
	 * @return array
	 */
	private function prepare_sequence_response( $sequence ): array {
		$data                   = $sequence->to_array();
		$statuses               = $sequence->get_statuses();
		$data['statuses_count'] = count( $statuses );
		$data['post_types']     = $sequence->get_post_types();
		$data['status_summary'] = array_map(
			fn( $s ) => array(
				'key'         => $s['key'],
				'label'       => $s['label'] ?? $s['key'],
				'is_terminal' => $s['is_terminal'] ?? false,
				'color'       => $s['color'] ?? null,
			),
			$statuses
		);

		// Stages stored before the status-region write gate. Non-empty means every
		// read of those stages throws, so the editor surfaces the repair affordance
		// instead of letting the author meet a fatal with no way forward.
		$data['stages_missing_region'] = $sequence->get_stages_missing_region();

		return $data;
	}

	/**
	 * Check if user can list sequences.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function get_items_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check if user can view a sequence.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function get_item_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Check if user can delete a sequence.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function delete_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Delete a sequence.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function delete_item( $request ) {
		$id       = (int) $request->get_param( 'id' );
		$sequence = $this->repository->find( $id );

		if ( ! $sequence ) {
			return new WP_Error(
				'rest_sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$deleted = $this->repository->delete( $id );

		if ( ! $deleted ) {
			return new WP_Error(
				'rest_sequence_delete_failed',
				__( 'Could not delete the sequence. Try again.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response(
			array(
				'deleted' => true,
				'id'      => $id,
			)
		);
	}

	/**
	 * Get collection params.
	 *
	 * @return array
	 */
	public function get_collection_params(): array {
		return array(
			'type'        => array(
				'description' => 'Filter by type.',
				'type'        => 'string',
				'enum'        => array( Sequence::TYPE_WORKFLOW, Sequence::TYPE_PHASE ),
			),
			'status'      => array(
				'description' => 'Filter by status.',
				'type'        => 'string',
				'enum'        => array( 'draft', 'active', 'archived' ),
			),
			'latest_only' => array(
				'description' => 'Return only the latest version of each sequence.',
				'type'        => 'boolean',
				'default'     => true,
			),
		);
	}

	/**
	 * Schema for a transition's `inputs` list.
	 *
	 * Shared by the REST create/update args and the create-sequence and
	 * update-sequence abilities, so every write path describes an input the same
	 * way. The sequence editor mints an assignment's `meta_key` itself; every
	 * other caller has to supply one, and nothing else tells it so.
	 *
	 * An assignment is the only input type, so `type` is limited to it and an
	 * entry must name its `meta_key`. The write gate refuses any other type and
	 * the 2.25.0 migration cleared retired notes from stored sequences, so no
	 * caller has a note to send back. validate_assignment_keys() still owns the
	 * rest of the key rules (non-empty, well-formed, unique across the sequence)
	 * and reports them with errors that name the transitions involved.
	 *
	 * @return array JSON Schema for the `inputs` array.
	 */
	public static function get_transition_inputs_schema(): array {
		return array(
			'type'        => 'array',
			'description' => __( 'Inputs collected when this transition is taken. An "assignment" is the only input type, and a transition may declare at most one. Every assignment must carry a "meta_key" that is non-empty and unique across the whole sequence; a missing or repeated key is rejected.', 'vip-workflows' ),
			'items'       => array(
				'type'       => 'object',
				'required'   => array( 'type', 'meta_key' ),
				'properties' => array(
					'type'          => array(
						'type'        => 'string',
						'description' => __( 'Input type. "assignment" collects an assignee when the transition is taken; no other type is accepted.', 'vip-workflows' ),
						'enum'        => array( 'assignment' ),
					),
					'meta_key'      => array(
						'type'        => 'string',
						'description' => __( 'Assignment slot key (lowercase letters, numbers, dashes and underscores). Taking the transition stores the assignee in the post meta "_vip_workflows_assignment_{meta_key}". Required for an assignment, and must be unique within the sequence: two transitions sharing a key would overwrite each other’s assignment. Keep a slot’s existing key when updating a sequence.', 'vip-workflows' ),
					),
					'assignee_type' => array(
						'type'        => 'string',
						'description' => __( 'What the assignment names: "user" (default), "role", or "agent". Extensions may register more through the vip_workflows_assignee_types filter.', 'vip-workflows' ),
					),
					'label'         => array(
						'type'        => 'string',
						'description' => __( 'Label shown for the assignee field when the transition is taken.', 'vip-workflows' ),
					),
					'required'      => array(
						'type'        => 'boolean',
						'description' => __( 'Whether an assignee must be chosen to take the transition.', 'vip-workflows' ),
					),
					'filter'        => array(
						'type'        => 'object',
						'description' => __( 'Limits who can be chosen as the assignee.', 'vip-workflows' ),
						'properties'  => array(
							'roles' => array(
								'type'        => 'array',
								'description' => __( 'Role slugs the assignee is chosen from.', 'vip-workflows' ),
								'items'       => array( 'type' => 'string' ),
							),
						),
					),
				),
			),
		);
	}

	/**
	 * Get args for create/update.
	 *
	 * @return array
	 */
	private function get_create_args(): array {
		return array(
			'type'            => array(
				'description' => 'Sequence type.',
				'type'        => 'string',
				'enum'        => array( Sequence::TYPE_WORKFLOW, Sequence::TYPE_PHASE ),
				'default'     => Sequence::TYPE_WORKFLOW,
			),
			'name'            => array(
				'description' => 'Sequence name.',
				'type'        => 'string',
				'required'    => true,
			),
			'description'     => array(
				'description' => 'Sequence description.',
				'type'        => 'string',
				'default'     => '',
			),
			'status'          => array(
				'description' => 'Initial lifecycle state. Defaults to active; pass "draft" to create unpublished.',
				'type'        => 'string',
				'enum'        => array( 'active', 'draft' ),
				'default'     => 'active',
			),
			'statuses'        => array(
				'description' => 'Array of status configurations.',
				'type'        => 'array',
				'required'    => true,
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'key'            => array(
							'type'     => 'string',
							'required' => true,
						),
						'label'          => array(
							'type'     => 'string',
							'required' => true,
						),
						'color'          => array( 'type' => 'string' ),
						'is_terminal'    => array( 'type' => 'boolean' ),
						'is_initial'     => array( 'type' => 'boolean' ),
						'is_dead_end'    => array( 'type' => 'boolean' ),
						'is_in_progress' => array( 'type' => 'boolean' ),
						'creates_post'   => array( 'type' => 'boolean' ),
						'status'         => array(
							'description' => 'Core status region this stage lives in. Defaults to draft.',
							'type'        => 'string',
							'enum'        => Sequence::EDITORIAL_STATUSES,
						),
						'region_entry'   => array(
							'description' => 'Marks this stage as the entry checkpoint of its status region — where a post lands when something outside the workflow puts it in that status (a core-driven status change, or an assignment that names no stage). It does not constrain where a transition may point (at most one per region; defaults to the first stage in the region).',
							'type'        => 'boolean',
						),
						'transitions'    => array(
							'type'  => 'array',
							'items' => array(
								'type'       => 'object',
								'properties' => array(
									'to'             => array(
										'type'     => 'string',
										'required' => true,
									),
									'label'          => array( 'type' => 'string' ),
									'required_tools' => array( 'type' => 'array' ),
									'allowed_roles'  => array( 'type' => 'array' ),
									'notifications'  => array( 'type' => 'array' ),
									'show_in_queue'  => array( 'type' => 'boolean' ),
									'inputs'         => self::get_transition_inputs_schema(),
								),
							),
						),
						'agent'          => array(
							'type'        => 'object',
							'description' => 'Optional AI-stage config: an agent runs on entry and routes the exit transition.',
						),
					),
				),
			),
			'post_types'      => array(
				'description' => 'Post types this sequence applies to (workflow only).',
				'type'        => 'array',
				'default'     => array(),
			),
			'settings'        => array(
				'description' => 'Sequence settings.',
				'type'        => 'object',
				'default'     => array(),
			),
			'metadata_fields' => array(
				'description' => 'Array of editorial metadata field definitions.',
				'type'        => 'array',
				'default'     => array(),
				'items'       => array(
					'type'       => 'object',
					'properties' => array(
						'key'        => array(
							'type'     => 'string',
							'required' => true,
						),
						'label'      => array(
							'type'     => 'string',
							'required' => true,
						),
						'type'       => array(
							'type'     => 'string',
							'required' => true,
						),
						'required'   => array( 'type' => 'boolean' ),
						'searchable' => array( 'type' => 'boolean' ),
						'options'    => array( 'type' => 'array' ),
					),
				),
			),
		);
	}

	/**
	 * Check if user can create a sequence.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function create_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if user can update a sequence.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function update_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Create a new sequence.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create_item( $request ) {
		$type = $request->get_param( 'type' ) ?? Sequence::TYPE_WORKFLOW;

		if ( Sequence::TYPE_PHASE === $type && ! Plugin::experiment_enabled( 'ideation' ) ) {
			return new WP_Error(
				'rest_sequence_type_disabled',
				__( 'Phase sequences require the Ideation feature to be enabled.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		$name            = sanitize_text_field( $request->get_param( 'name' ) );
		$description     = sanitize_textarea_field( $request->get_param( 'description' ) ?? '' );
		$status          = $request->get_param( 'status' );
		$statuses        = $request->get_param( 'statuses' );
		$post_types      = $request->get_param( 'post_types' ) ?? array();
		$settings        = $request->get_param( 'settings' ) ?? array();
		$metadata_fields = $request->get_param( 'metadata_fields' ) ?? array();

		$validated_metadata = $this->validate_metadata_fields( $metadata_fields );
		if ( is_wp_error( $validated_metadata ) ) {
			return $validated_metadata;
		}

		$agent_validation = $this->validate_status_agents( $statuses );
		if ( is_wp_error( $agent_validation ) ) {
			return $agent_validation;
		}

		$statuses = self::normalize_request_input_shape( $statuses );
		if ( is_wp_error( $statuses ) ) {
			return $statuses;
		}

		$assignment_validation = $this->validate_assignment_keys( $statuses );
		if ( is_wp_error( $assignment_validation ) ) {
			return $assignment_validation;
		}

		// Generate slug from name.
		$slug = sanitize_title( $name );

		// Check if slug already exists for this type. Checks all statuses (not just
		// active) since the (type, slug, version) unique key collides regardless.
		if ( $this->repository->slug_exists( $slug, $type ) ) {
			$slug .= '-' . wp_generate_password( 4, false );
		}

		// A malformed graph (duplicate keys, invalid stage regions, duplicate
		// region entries, dangling transition targets) is rejected at write time
		// by Sequence::prepare_config_for_write(), as is a phase sequence missing
		// the lifecycle it owes. It throws;
		// translate that into a controlled 422 rather than a fatal.
		try {
			$config = $this->build_config( $type, $statuses, $post_types, $settings, $validated_metadata );
			$id     = $this->repository->create( $name, $slug, $description, $config, get_current_user_id(), $type );
		} catch ( \InvalidArgumentException $e ) {
			return new WP_Error(
				'rest_sequence_invalid_config',
				$e->getMessage(),
				array( 'status' => 422 )
			);
		}

		// Update status if not active (default is active).
		if ( $id && $status && 'draft' === $status ) {
			$this->repository->update( $id, array( 'status' => 'draft' ) );
		}

		if ( ! $id ) {
			return new WP_Error(
				'rest_sequence_create_failed',
				__( 'Could not create the sequence. Try again.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$sequence = $this->repository->find( $id );

		return new WP_REST_Response( $this->prepare_sequence_response( $sequence ), 201 );
	}

	/**
	 * Update an existing sequence.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function update_item( $request ) {
		$id = (int) $request->get_param( 'id' );

		$existing = $this->repository->find( $id );
		if ( ! $existing ) {
			return new WP_Error(
				'rest_sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$name            = sanitize_text_field( $request->get_param( 'name' ) ?? '' );
		$description     = sanitize_textarea_field( $request->get_param( 'description' ) ?? '' );
		$status          = $request->get_param( 'status' );
		$statuses        = $request->get_param( 'statuses' ) ?? array();
		$post_types      = $request->get_param( 'post_types' ) ?? array();
		$settings        = $request->get_param( 'settings' ) ?? array();
		$metadata_fields = $request->get_param( 'metadata_fields' ) ?? array();

		$validated_metadata = $this->validate_metadata_fields( $metadata_fields );
		if ( is_wp_error( $validated_metadata ) ) {
			return $validated_metadata;
		}

		$agent_validation = $this->validate_status_agents( $statuses );
		if ( is_wp_error( $agent_validation ) ) {
			return $agent_validation;
		}

		$statuses = self::normalize_request_input_shape( $statuses );
		if ( is_wp_error( $statuses ) ) {
			return $statuses;
		}

		$assignment_validation = $this->validate_assignment_keys( $statuses );
		if ( is_wp_error( $assignment_validation ) ) {
			return $assignment_validation;
		}

		// See create_item(): building the config and writing it both reject a
		// config they cannot store with a thrown exception; surface it as a
		// controlled 422 rather than a fatal.
		try {
			// Build config (use existing type).
			$config = $this->build_config( $existing->type, $statuses, $post_types, $settings, $validated_metadata );

			$update_data = array(
				'name'        => $name,
				'description' => $description,
				'config'      => $config,
			);

			// Only update status if provided and valid.
			if ( $status && in_array( $status, array( 'active', 'draft' ), true ) ) {
				$update_data['status'] = $status;
			}

			$new_id = $this->repository->update( $id, $update_data );
		} catch ( \InvalidArgumentException $e ) {
			return new WP_Error(
				'rest_sequence_invalid_config',
				$e->getMessage(),
				array( 'status' => 422 )
			);
		}

		if ( ! $new_id ) {
			return new WP_Error(
				'rest_sequence_update_failed',
				__( 'Could not update the sequence. Try again.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$sequence = $this->repository->find( $new_id );

		return new WP_REST_Response( $this->prepare_sequence_response( $sequence ) );
	}

	/**
	 * Build sequence config from form data.
	 *
	 * @param  string $type             Sequence type.
	 * @param  array  $statuses         Statuses array.
	 * @param  array  $post_types       Post types array.
	 * @param  array  $settings         Settings array.
	 * @param  array  $metadata_fields  Pre-validated metadata fields array.
	 * @return array
	 * @throws \InvalidArgumentException When a stage's name sanitizes to empty.
	 */
	private function build_config( string $type, array $statuses, array $post_types, array $settings, array $metadata_fields = array() ): array {
		if ( Sequence::TYPE_PHASE === $type ) {
			return $this->build_phase_config( $statuses );
		}

		// Process statuses.
		$processed_statuses = array();
		foreach ( $statuses as $status ) {
			if ( ! is_array( $status ) ) {
				continue;
			}

			$color           = $status['color'] ?? StagePalette::DEFAULT_COLOR;
			$sanitized_color = sanitize_hex_color( $color );
			if ( empty( $sanitized_color ) ) {
				$sanitized_color = StagePalette::DEFAULT_COLOR;
			}

			self::require_stage_names( array( $status ) );

			$processed_status = array(
				// `key` is required by the REST schema; don't invent one. A missing or
				// sanitized-to-empty key is rejected by Sequence::prepare_config_for_write().
				'key'         => sanitize_key( $status['key'] ?? '' ),
				'label'       => sanitize_text_field( $status['label'] ?? '' ),
				'color'       => $sanitized_color,
				'transitions' => array(),
			);

			$processed_status['is_terminal'] = ! empty( $status['is_terminal'] );

			// Persist the remaining declared status flags so the create/update
			// contract is honored (these are read by the Kanban board and
			// get_initial_status; previously they were silently dropped).
			foreach ( array( 'is_initial', 'is_dead_end', 'is_in_progress', 'creates_post' ) as $status_flag ) {
				if ( ! empty( $status[ $status_flag ] ) ) {
					$processed_status[ $status_flag ] = true;
				}
			}

			// Stage × status matrix fields. The value is passed through (sanitized
			// when it is a string) so the write gate — not this builder — decides
			// validity: a present-but-invalid `status` must throw there, while a
			// missing one is defaulted to 'draft' at write time.
			if ( isset( $status['status'] ) ) {
				$processed_status['status'] = is_string( $status['status'] )
					? sanitize_key( $status['status'] )
					: $status['status'];
			}
			if ( array_key_exists( 'region_entry', $status ) ) {
				$processed_status['region_entry'] = (bool) $status['region_entry'];
			}

			if ( isset( $status['show_in_queue'] ) ) {
				$processed_status['show_in_queue'] = (bool) $status['show_in_queue'];
			}

			// Process transitions.
			if ( ! empty( $status['transitions'] ) && is_array( $status['transitions'] ) ) {
				foreach ( $status['transitions'] as $transition ) {
					if ( ! is_array( $transition ) ) {
						continue;
					}
					$processed_transition = array(
						'to'    => sanitize_key( $transition['to'] ?? '' ),
						'label' => sanitize_text_field( $transition['label'] ?? '' ),
					);

					$raw_tools                              = $transition['required_tools'] ?? array();
					$processed_transition['required_tools'] = is_array( $raw_tools )
						? array_map( array( $this, 'sanitize_ability_id' ), $raw_tools )
						: array();

					if ( ! empty( $transition['allowed_roles'] ) && is_array( $transition['allowed_roles'] ) ) {
						$processed_transition['allowed_roles'] = array_map( 'sanitize_key', $transition['allowed_roles'] );
					}

					if ( ! empty( $transition['show_in_queue'] ) ) {
						$processed_transition['show_in_queue'] = true;
					}

					if ( ! empty( $transition['notifications'] ) && is_array( $transition['notifications'] ) ) {
						$processed_transition['notifications'] = array_map( 'sanitize_key', $transition['notifications'] );
					}

					// What the transition captures, in order. The list is rebuilt
					// rather than passed through, like every other field here: an
					// input carrying a key this allowlist does not name never
					// reaches storage.
					//
					// An input that sanitizes down to nothing is still kept, and
					// keeps its position. Dropping it would renumber the ones after
					// it while an author was still filling it in — and an input with
					// no key is a config problem the write gate and
					// validate_assignment_keys() are there to name, not something to
					// make disappear on the way past.
					if ( ! empty( $transition['inputs'] ) && is_array( $transition['inputs'] ) ) {
						$processed_transition['inputs'] = array();

						foreach ( $transition['inputs'] as $input ) {
							if ( ! is_array( $input ) ) {
								continue;
							}

							$processed_input = array(
								'type' => sanitize_key( $input['type'] ?? '' ),
							);

							if ( ! empty( $input['required'] ) ) {
								$processed_input['required'] = true;
							}
							if ( ! empty( $input['meta_key'] ) ) {
								$processed_input['meta_key'] = sanitize_key( $input['meta_key'] );
							}
							// Assignment-specific config.
							if ( ! empty( $input['assignee_type'] ) ) {
								$processed_input['assignee_type'] = sanitize_key( $input['assignee_type'] );
							}
							if ( ! empty( $input['label'] ) ) {
								$processed_input['label'] = sanitize_text_field( $input['label'] );
							}
							if ( ! empty( $input['filter'] ) && is_array( $input['filter'] ) ) {
								$processed_input['filter'] = array();
								if ( ! empty( $input['filter']['roles'] ) && is_array( $input['filter']['roles'] ) ) {
									$processed_input['filter']['roles'] = array_map( 'sanitize_key', $input['filter']['roles'] );
								}
							}

							$processed_transition['inputs'][] = $processed_input;
						}
					}

					$processed_status['transitions'][] = $processed_transition;
				}
			}

			// AI-owned stage: an agent runs on entry and picks the exit transition.
			// Validated up front by validate_status_agents(); here we only sanitize.
			if ( ! empty( $status['agent'] ) && is_array( $status['agent'] ) ) {
				$processed_status['agent'] = $this->sanitize_status_agent( $status['agent'] );
			}

			$processed_statuses[] = $processed_status;
		}

		$config = array(
			'version'         => '2.0',
			'statuses'        => $processed_statuses,
			'settings'        => $settings,
			'metadata_fields' => $metadata_fields,
		);

		$processed_post_types = array_map( 'sanitize_key', array_filter( $post_types ) );
		$config['post_types'] = $processed_post_types;
		return $config;
	}

	/**
	 * Build config for a phase sequence.
	 *
	 * The $phases param is passed via the "statuses" REST field (reused for simplicity).
	 *
	 * Which phases exist and which of them connect is PHASE_TRANSITIONS — the
	 * same map `/sequences/options` hands the editor, so a connection the
	 * canvas let the author draw is a connection this keeps.
	 *
	 * What it must carry is Sequence::REQUIRED_PHASES, and that is not checked
	 * here: Sequence::prepare_config_for_write() checks it, on the config this
	 * returns, for every write path — create, update, import and a direct
	 * repository call alike. Checking what survived this filtering rather than
	 * what was sent is the point: a phase dropped for being outside the graph
	 * leaves the same hole as one never named.
	 *
	 * Public so validate-sequence and import_sequence() build a phase config the
	 * same way create and update do, instead of each keeping a copy.
	 *
	 * @param  array $phases Phases array from the request.
	 * @return array
	 */
	public function build_phase_config( array $phases ): array {
		$valid_keys = self::phase_keys();
		$processed  = array();

		foreach ( $phases as $phase ) {
			if ( ! is_array( $phase ) ) {
				continue;
			}

			$key = sanitize_key( $phase['key'] ?? '' );
			if ( ! in_array( $key, $valid_keys, true ) ) {
				continue;
			}

			$processed_phase = array(
				'key'         => $key,
				'label'       => sanitize_text_field( $phase['label'] ?? ucfirst( $key ) ),
				'transitions' => array(),
			);

			$allowed_targets = Sequence::PHASE_TRANSITIONS[ $key ] ?? array();

			if ( $allowed_targets && ! empty( $phase['transitions'] ) && is_array( $phase['transitions'] ) ) {
				foreach ( $phase['transitions'] as $transition ) {
					if ( ! is_array( $transition ) ) {
						continue;
					}

					$to = sanitize_key( $transition['to'] ?? '' );
					if ( ! in_array( $to, $allowed_targets, true ) ) {
						continue;
					}

					$processed_transition = array(
						'to'             => $to,
						'label'          => sanitize_text_field( $transition['label'] ?? '' ),
						'required_tools' => array(),
						'allowed_roles'  => array(),
						'notifications'  => array(),
					);

					if ( ! empty( $transition['required_tools'] ) && is_array( $transition['required_tools'] ) ) {
						$processed_transition['required_tools'] = array_map( array( $this, 'sanitize_ability_id' ), $transition['required_tools'] );
					}

					if ( ! empty( $transition['allowed_roles'] ) && is_array( $transition['allowed_roles'] ) ) {
						$processed_transition['allowed_roles'] = array_map( 'sanitize_key', $transition['allowed_roles'] );
					}

					if ( ! empty( $transition['notifications'] ) && is_array( $transition['notifications'] ) ) {
						$processed_transition['notifications'] = array_map( 'sanitize_key', $transition['notifications'] );
					}

					$processed_phase['transitions'][] = $processed_transition;
				}
			}

			// Keyed by phase key, so a request naming the same phase twice stores
			// one of them rather than both. Two entries under one key is a
			// sequence whose readers disagree — the write gate's lifecycle check
			// reads the last, a `find`-style lookup at runtime reads the first — and
			// the pair that disagrees is exactly a phase with no hand-off out.
			$processed[ $key ] = $processed_phase;
		}

		$processed = array_values( $processed );

		return array(
			'version' => '1.0',
			'phases'  => $processed,
		);
	}

	/**
	 * Export sequence as JSON.
	 *
	 * @param  WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function export_sequence( $request ) {
		$id       = $request->get_param( 'id' );
		$sequence = $this->repository->find( $id );

		if ( ! $sequence ) {
			return new WP_Error(
				'rest_sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$export = array(
			'name'        => $sequence->name,
			'type'        => $sequence->type,
			'description' => $sequence->description,
			'config'      => $sequence->config,
		);

		return new WP_REST_Response( $export );
	}

	/**
	 * Get post counts per status for a sequence.
	 *
	 * @param  WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_stats( $request ) {
		$id       = $request->get_param( 'id' );
		$sequence = $this->repository->find( $id );

		if ( ! $sequence ) {
			return new WP_Error(
				'rest_sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		// StageQuery owns the (now stage-meta) aggregation.
		$stats = \VIPWorkflows\Workflow\StageQuery::counts_by_stage( $sequence, \VIPWorkflows\Workflow\StageQuery::author_scope_for_current_user() );

		return new WP_REST_Response( $stats );
	}

	/**
	 * Assign default status regions to stages that predate the write gate.
	 *
	 * The author-triggered repair behind the Sequence editor's notice. Replays the
	 * stored config through the shared write gate, which normalizes a missing
	 * region to 'draft'. Returns the repaired sequence so the editor can re-hydrate
	 * without a second request.
	 *
	 * The response carries a `repair` report next to the sequence: which
	 * transitions the collapse had to drop, because a stage arrived holding two to
	 * one target. The editor names them, because a repair that reshapes an author's
	 * sequence without saying what it changed is the silent behaviour this whole
	 * path exists to end.
	 *
	 * @param  WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function repair_stage_regions( $request ) {
		$id = (int) $request->get_param( 'id' );

		$repaired = $this->repository->repair_stage_regions( $id );

		if ( is_wp_error( $repaired ) ) {
			return $repaired;
		}

		if ( false === $repaired ) {
			return new WP_Error(
				'sequence_repair_failed',
				__( 'The sequence could not be saved.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		$sequence = $this->repository->find( $id );
		if ( ! $sequence ) {
			// The row was written a moment ago; its disappearance is a real fault.
			return new WP_Error(
				'rest_sequence_not_found',
				__( 'Sequence not found.', 'vip-workflows' ),
				array( 'status' => 404 )
			);
		}

		$response           = $this->prepare_sequence_response( $sequence );
		$response['repair'] = array(
			'dropped' => $repaired['dropped'],
		);

		return new WP_REST_Response( $response );
	}

	/**
	 * Import sequence from JSON.
	 *
	 * @param  WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function import_sequence( $request ) {
		$sequence_json = $request->get_param( 'sequence_json' );
		$custom_name   = $request->get_param( 'name' );

		// Validate required fields.
		if ( empty( $sequence_json['type'] ) || ! in_array( $sequence_json['type'], array( 'workflow', 'phase' ), true ) ) {
			return new WP_Error(
				'invalid_sequence_type',
				__( 'Sequence type must be "workflow" or "phase".', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		if ( 'phase' === $sequence_json['type'] && ! Plugin::experiment_enabled( 'ideation' ) ) {
			return new WP_Error(
				'rest_sequence_type_disabled',
				__( 'Phase sequences require the Ideation feature to be enabled.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		if ( empty( $sequence_json['name'] ) ) {
			return new WP_Error(
				'missing_sequence_name',
				__( 'Sequence name is required.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		if ( empty( $sequence_json['config'] ) || ! is_array( $sequence_json['config'] ) ) {
			return new WP_Error(
				'invalid_sequence_config',
				__( 'Sequence config is required and must be an object.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		// A phase sequence carries its graph under `phases`, not `statuses`, and is
		// built exactly as create and update build it: phases and hand-offs outside
		// the phase graph dropped, everything kept sanitized. The lifecycle it owes
		// is checked by the repository's write gate below, as on every other write.
		if ( Sequence::TYPE_PHASE === $sequence_json['type'] ) {
			if ( empty( $sequence_json['config']['phases'] ) || ! is_array( $sequence_json['config']['phases'] ) ) {
				return new WP_Error(
					'invalid_sequence_phases',
					__( 'Phase sequence must have at least one phase.', 'vip-workflows' ),
					array( 'status' => 400 )
				);
			}

			$config = $this->build_phase_config( $sequence_json['config']['phases'] );
		} else {
			if ( empty( $sequence_json['config']['statuses'] ) || ! is_array( $sequence_json['config']['statuses'] ) ) {
				return new WP_Error(
					'invalid_sequence_statuses',
					__( 'Sequence must have at least one stage.', 'vip-workflows' ),
					array( 'status' => 400 )
				);
			}

			// A stage with no name is refused here as build_config() refuses it on
			// create/update: the import never passes through that builder.
			try {
				self::require_stage_names( $sequence_json['config']['statuses'] );
			} catch ( \InvalidArgumentException $e ) {
				return new WP_Error(
					'rest_sequence_invalid_config',
					$e->getMessage(),
					array( 'status' => 422 )
				);
			}

			// Imported agent configs go through the same validation as create/update —
			// an import must not smuggle in an agent create_item() would reject.
			$agent_validation = $this->validate_status_agents( $sequence_json['config']['statuses'] );
			if ( is_wp_error( $agent_validation ) ) {
				return $agent_validation;
			}

			// A file exported by an older version may carry free-text note inputs,
			// which are retired. They are removed exactly as the 2.25.0 migration
			// removes them from stored rows, so an old export imports the way an
			// old row upgrades. Only the known note types are removed: any other
			// input that is not an assignment is still refused below.
			$sequence_json['config'] = Sequence::drop_retired_note_inputs( $sequence_json['config'] )['config'];

			// A file exported by an older version declares what a transition captures
			// as a single `input`. Converted here, at the boundary, because everything
			// below — the slot validator, the key regenerator — reads `inputs` and
			// should never have to ask which version wrote the file it is walking.
			try {
				$sequence_json['config'] = Sequence::normalize_input_shape( $sequence_json['config'] );
			} catch ( \InvalidArgumentException $e ) {
				return new WP_Error(
					'invalid_transition_input',
					$e->getMessage(),
					array( 'status' => 400 )
				);
			}

			// Assignment slots, same gate as create/update. Checked before the keys
			// are regenerated below, so the error names the key the author exported
			// rather than a freshly minted one — and so regeneration, which reads no
			// old key, never mints over a blank or shared one.
			$assignment_validation = $this->validate_assignment_keys( $sequence_json['config']['statuses'] );
			if ( is_wp_error( $assignment_validation ) ) {
				return $assignment_validation;
			}

			// Validate metadata_fields if present in the imported config.
			if ( ! empty( $sequence_json['config']['metadata_fields'] ) ) {
				$validated_metadata = $this->validate_metadata_fields( $sequence_json['config']['metadata_fields'] );
				if ( is_wp_error( $validated_metadata ) ) {
					return $validated_metadata;
				}
				$sequence_json['config']['metadata_fields'] = $validated_metadata;
			}

			// Process config - regenerate assignment slot keys and map workflow references.
			$config = $sequence_json['config'];

			// Regenerate assignment slot keys for transitions and sanitize agent
			// configs the same way build_config() does on create/update.
			if ( ! empty( $config['statuses'] ) ) {
				$config['statuses'] = $this->regenerate_assignment_keys( $config['statuses'] );

				foreach ( $config['statuses'] as &$status ) {
					// Validated up front by validate_status_agents(); here we only sanitize.
					if ( ! empty( $status['agent'] ) && is_array( $status['agent'] ) ) {
						$status['agent'] = $this->sanitize_status_agent( $status['agent'] );
					}
				}
				unset( $status );
			}
		}

		// Use custom name if provided, otherwise use name from JSON.
		$name = $custom_name ? $custom_name : $sequence_json['name'];

		// Generate unique slug from name.
		$slug = $this->unique_import_slug( $name );

		// Create the sequence. The shared write gate normalizes stage keys and
		// regions (closing the old import bypass of build_config() normalization)
		// and rejects a malformed graph (duplicate keys, invalid regions, duplicate
		// region entries, dangling transition targets) — or, for a phase sequence,
		// one missing the lifecycle it owes — with a thrown exception; surface it
		// as a controlled 422 rather than a fatal.
		try {
			$sequence_id = $this->repository->create(
				$name,
				$slug,
				$sequence_json['description'] ?? '',
				$config,
				get_current_user_id(),
				$sequence_json['type']
			);
		} catch ( \InvalidArgumentException $e ) {
			return new WP_Error(
				'rest_sequence_invalid_config',
				$e->getMessage(),
				array( 'status' => 422 )
			);
		}

		return $this->imported_sequence_response( $sequence_id );
	}

	/**
	 * A slug for an imported sequence that no stored sequence holds.
	 *
	 * Checks every status and version, since the (type, slug, version) unique
	 * key collides regardless.
	 *
	 * @param  string $name Sequence name.
	 * @return string
	 */
	private function unique_import_slug( string $name ): string {
		global $wpdb;
		$slug      = sanitize_title( $name );
		$base_slug = $slug;
		$counter   = 1;

		$table = $wpdb->prefix . 'vip_sequences';
		while ( $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$table} WHERE slug = %s", $slug ) ) > 0 ) { // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- plugin table vip_sequences; live read, not cached
			$slug = $base_slug . '-' . $counter;
			++$counter;
		}

		return $slug;
	}

	/**
	 * Mark a freshly imported sequence as a draft and build the import response.
	 *
	 * @param  int|false $sequence_id ID returned by the repository create.
	 * @return WP_REST_Response|WP_Error
	 */
	private function imported_sequence_response( $sequence_id ) {
		if ( ! $sequence_id ) {
			return new WP_Error(
				'sequence_import_failed',
				__( 'Could not import the sequence. Try again.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		// Update status to 'draft' (create method sets it to 'active' by default).
		$this->repository->update( $sequence_id, array( 'status' => 'draft' ) );

		$sequence = $this->repository->find( $sequence_id );

		if ( ! $sequence ) {
			return new WP_Error(
				'sequence_not_found',
				__( 'Sequence was created but could not be retrieved.', 'vip-workflows' ),
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response(
			array(
				'success'  => true,
				'sequence' => $this->prepare_sequence_response( $sequence ),
			),
			201
		);
	}

	/**
	 * Sanitize an ability ID, preserving the vendor/name slash.
	 *
	 * @param string $id Resource ID.
	 */
	private function sanitize_ability_id( string $id ): string {
		return preg_replace( '/[^a-z0-9\-_\/]/', '', strtolower( trim( $id ) ) );
	}

	/**
	 * Valid routing outcome keys for an AI stage agent.
	 *
	 * An agent returns one of these outcomes; the stage's routing map translates
	 * the outcome into one of the stage's configured transition destinations.
	 * `error` names where an execution failure (WP_Error/exception/timeout)
	 * routes — it is optional, and a stage without it fails errored runs in
	 * place instead (StageAgentRunner::resolve_error).
	 *
	 * @var string[]
	 */
	private const AGENT_ROUTING_OUTCOMES = array( 'pass', 'fail', 'error' );

	/**
	 * Validate the optional `agent` config on each status.
	 *
	 * A status may declare `agent = { ability_id, settings, routing }` to mark it
	 * as AI-owned. When `agent` is present:
	 *   - `ability_id` must be a non-empty string,
	 *   - `routing`, when present, must be an object of known outcome keys —
	 *     every one of them optional, `error` included (an errored run with no
	 *     error route fails in place),
	 *   - every routing target must be the `to` of one of that status's transitions.
	 *
	 * Follows the fail-loud contract: an invalid agent config is a data-integrity
	 * error, not something to silently drop.
	 *
	 * @param  mixed $statuses Raw statuses value from request or import.
	 * @return true|WP_Error True when valid (or no agents present), WP_Error otherwise.
	 */
	public function validate_status_agents( $statuses ): bool|WP_Error {
		if ( ! is_array( $statuses ) ) {
			return true;
		}

		foreach ( $statuses as $status ) {
			if ( ! is_array( $status ) || empty( $status['agent'] ) ) {
				continue;
			}

			$stage_key = $this->status_key( $status );

			$agent = $status['agent'];
			if ( ! is_array( $agent ) ) {
				return new WP_Error(
					'invalid_status_agent',
					/* translators: %s: stage key */
					sprintf( __( 'Stage "%s" has an agent that is not an object.', 'vip-workflows' ), $stage_key ),
					array( 'status' => 400 )
				);
			}

			$ability_id = is_string( $agent['ability_id'] ?? null ) ? trim( $agent['ability_id'] ) : '';
			if ( '' === $ability_id ) {
				return new WP_Error(
					'invalid_status_agent_ability',
					/* translators: %s: stage key */
					sprintf( __( 'Stage "%s" has an agent that requires a non-empty "ability_id".', 'vip-workflows' ), $stage_key ),
					array( 'status' => 400 )
				);
			}

			// The ability must be registered and stage-eligible — mirrors the
			// context=stage filter in AbilitiesController::get_items().
			$ability      = wp_get_ability( $ability_id );
			$ability_meta = $ability ? $ability->get_meta() : array();
			if ( ! $ability || empty( $ability_meta['stage_eligible'] ) ) {
				return new WP_Error(
					'invalid_status_agent_ability_unknown',
					sprintf(
						/* translators: 1: stage key, 2: ability ID */
						__( 'Stage "%1$s" names the agent ability "%2$s", which is not a registered stage-eligible agent.', 'vip-workflows' ),
						$stage_key,
						$ability_id
					),
					array( 'status' => 400 )
				);
			}

			$routing = $agent['routing'] ?? array();
			if ( ! is_array( $routing ) ) {
				return new WP_Error(
					'invalid_status_agent_routing',
					/* translators: %s: stage key */
					sprintf( __( 'Stage "%s" has an agent whose routing is not an object mapping outcomes to destination stages.', 'vip-workflows' ), $stage_key ),
					array( 'status' => 400 )
				);
			}

			// Reject unknown routing keys (e.g. the retired `warning` outcome).
			// Stage agents make a binary editorial judgment: only pass, fail, and
			// the system-level error outcome are valid routing keys.
			foreach ( array_keys( $routing ) as $outcome ) {
				if ( ! in_array( $outcome, self::AGENT_ROUTING_OUTCOMES, true ) ) {
					return new WP_Error(
						'invalid_status_agent_routing_key',
						sprintf(
							/* translators: 1: stage key, 2: routing key */
							__( 'Stage "%1$s" has an agent routing outcome "%2$s" that is not valid. Use "pass", "fail", or "error".', 'vip-workflows' ),
							$stage_key,
							$outcome
						),
						array( 'status' => 400 )
					);
				}
			}

			// Valid destinations are the `to` keys of this status's own transitions.
			$valid_targets = array();
			if ( ! empty( $status['transitions'] ) && is_array( $status['transitions'] ) ) {
				foreach ( $status['transitions'] as $transition ) {
					if ( is_array( $transition ) && ! empty( $transition['to'] ) ) {
						$valid_targets[] = sanitize_key( $transition['to'] );
					}
				}
			}

			foreach ( self::AGENT_ROUTING_OUTCOMES as $outcome ) {
				if ( empty( $routing[ $outcome ] ) ) {
					continue;
				}
				$target = sanitize_key( $routing[ $outcome ] );
				if ( ! in_array( $target, $valid_targets, true ) ) {
					return new WP_Error(
						'invalid_status_agent_routing_target',
						sprintf(
							/* translators: 1: stage key, 2: outcome name, 3: target stage key */
							__( 'Stage “%1$s” routes agent outcome “%2$s” to “%3$s” with no transition to travel on.', 'vip-workflows' ),
							$stage_key,
							$outcome,
							$target
						),
						array( 'status' => 400 )
					);
				}
			}
		}

		return true;
	}

	/**
	 * Sanitize a status `agent` config for storage.
	 *
	 * Assumes {@see validate_status_agents()} has already run. Only the binary
	 * `pass`/`fail` outcomes and the system-level `error` outcome are persisted.
	 *
	 * @param  array $agent Raw agent config.
	 * @return array Sanitized agent config.
	 */
	private function sanitize_status_agent( array $agent ): array {
		$routing = array();
		foreach ( self::AGENT_ROUTING_OUTCOMES as $outcome ) {
			if ( ! empty( $agent['routing'][ $outcome ] ) ) {
				$routing[ $outcome ] = sanitize_key( $agent['routing'][ $outcome ] );
			}
		}

		$sanitized = array(
			'ability_id' => $this->sanitize_ability_id( (string) ( $agent['ability_id'] ?? '' ) ),
			'routing'    => $routing,
		);

		if ( ! empty( $agent['settings'] ) && is_array( $agent['settings'] ) ) {
			$sanitized['settings'] = $agent['settings'];
		}

		return $sanitized;
	}

	/**
	 * The transitions a status declares, as an index => transition map.
	 *
	 * A malformed (non-array) transitions value, or a non-array entry inside it,
	 * is rejected by Sequence::prepare_config_for_write() at write time; this
	 * only keeps the readers below from warning on their way to that rejection.
	 * Keys are preserved so a caller can write back to the position it read.
	 *
	 * @param  mixed $status One status entry.
	 * @return array Index-preserving map of the status's transition arrays.
	 */
	private function status_transitions( $status ): array {
		if ( ! is_array( $status ) || empty( $status['transitions'] ) || ! is_array( $status['transitions'] ) ) {
			return array();
		}

		return array_filter( $status['transitions'], 'is_array' );
	}

	/**
	 * A request's stages, with every transition's capture inputs in the current
	 * shape.
	 *
	 * A client written against the older schema declares what a transition captures
	 * as a singular `input`. build_config() rebuilds each transition from a key
	 * allowlist that names only `inputs`, so without this the older key is neither
	 * read nor refused — it is simply gone, and the save returns 200 having deleted
	 * the note or the assignment slot the caller sent. Converted here, before
	 * validate_assignment_keys() walks the statuses, so the slot validator sees the
	 * slots the request actually declares rather than none.
	 *
	 * The same conversion the import boundary does, through the same function, for
	 * the same reason: everything downstream reads `inputs` and none of it should
	 * have to ask which schema the caller was written against.
	 *
	 * @param  mixed $statuses The request's `statuses` parameter.
	 * @return array|WP_Error The statuses, or an error naming a transition that
	 *                        declares both keys.
	 */
	private static function normalize_request_input_shape( $statuses ) {
		if ( ! is_array( $statuses ) ) {
			return array();
		}

		try {
			$normalized = Sequence::normalize_input_shape( array( 'statuses' => $statuses ) );
		} catch ( \InvalidArgumentException $e ) {
			return new WP_Error(
				'invalid_transition_input',
				$e->getMessage(),
				array( 'status' => 400 )
			);
		}

		return $normalized['statuses'];
	}

	/**
	 * The assignment inputs a transition declares, keyed by their position in its
	 * `inputs` list.
	 *
	 * A transition's `inputs` list holds at most one input that assigns work — a cap the write gate enforces (see
	 * Sequence::prepare_config_for_write()). This returns them as a list anyway,
	 * rather than the one: the two callers walk it, and a validator that assumed
	 * the cap would stop reporting the very shape it is supposed to catch when the
	 * cap is what has been broken.
	 *
	 * Keys are preserved because regenerate_assignment_keys() writes back by
	 * position.
	 *
	 * @param  mixed $transition One transition entry.
	 * @return array Index-preserving map of the transition's assignment inputs.
	 */
	private static function transition_assignment_inputs( $transition ): array {
		if ( ! is_array( $transition ) || ! is_array( $transition['inputs'] ?? null ) ) {
			return array();
		}

		return array_filter(
			$transition['inputs'],
			fn( $input ) => is_array( $input ) && 'assignment' === ( $input['type'] ?? '' )
		);
	}

	/**
	 * The key a status declares, normalized the way it will be stored.
	 *
	 * Errors about a stage name the stage by this key rather than by its
	 * position in the array: the position is an artefact of the request body and
	 * has no representation in the sequence canvas the author is looking at,
	 * while the key is on screen. A stage carrying no key at all is rejected
	 * separately by Sequence::prepare_config_for_write().
	 *
	 * @param  mixed $status One status entry.
	 * @return string Sanitized stage key, empty when the stage declares none.
	 */
	private function status_key( $status ): string {
		if ( ! is_array( $status ) ) {
			return '';
		}

		return sanitize_key( (string) ( $status['key'] ?? '' ) );
	}

	/**
	 * Refuse a stage whose name sanitizes to empty.
	 *
	 * `label` is required by the REST schema too, and it is what writers see on
	 * the board and on every button that moves a post here. One that sanitizes
	 * to empty (a name of only spaces, say) is a stage with no name: reject it
	 * rather than store a blank. Shared by build_config(), import_sequence() and
	 * validate-sequence, so every write path refuses the same stages.
	 *
	 * A stage with no key either is left to Sequence::prepare_config_for_write(),
	 * which names that problem; a name error could only point at a blank key.
	 *
	 * @param  array $statuses Raw stage list from a request, import or dry run.
	 * @return void
	 * @throws \InvalidArgumentException When a keyed stage's name sanitizes to empty.
	 */
	public static function require_stage_names( array $statuses ): void {
		foreach ( $statuses as $status ) {
			if ( ! is_array( $status ) ) {
				continue;
			}

			$key = sanitize_key( is_scalar( $status['key'] ?? null ) ? (string) $status['key'] : '' );
			if ( '' === $key ) {
				continue;
			}

			$label = is_scalar( $status['label'] ?? null ) ? sanitize_text_field( (string) $status['label'] ) : '';
			if ( '' === $label ) {
				throw new \InvalidArgumentException(
					sprintf(
						/* translators: %s: the stage's key, e.g. "in_review". */
						esc_html__( 'The stage keyed “%s” has no valid name.', 'vip-workflows' ),
						esc_html( $key )
					)
				);
			}
		}
	}

	/**
	 * Validate assignment slot keys.
	 *
	 * A transition input of type `assignment` declares a slot: taking that
	 * transition writes an assignment into `_vip_workflows_assignment_{key}` on the
	 * post.
	 *
	 * Two rules keep a slot honest:
	 *   - a slot names a key. An empty one assigns nothing.
	 *   - a slot is declared once. Two transitions sharing a key write the same
	 *     post meta, so the second assignment silently overwrites the first.
	 *
	 * Keys are compared after sanitize_key(), the normalization build_config()
	 * stores them under, so a pair that differs only in what sanitize_key
	 * normalizes away ("Legal_Reviewer" against "legal_reviewer") is caught here
	 * instead of landing on one slot on write.
	 *
	 * Follows the fail-loud contract: broken assignment wiring is a
	 * data-integrity error, not something to silently persist.
	 *
	 * @param  mixed $statuses Raw statuses value from request or import.
	 * @return true|WP_Error True when valid (or no assignments present), WP_Error otherwise.
	 */
	public function validate_assignment_keys( $statuses ): bool|WP_Error {
		if ( ! is_array( $statuses ) ) {
			return true;
		}

		// Every slot the sequence declares, with the transition that declared it,
		// so a repeat can name both transitions rather than an opaque key.
		$slot_keys = array();
		foreach ( $statuses as $status ) {
			$stage_key = $this->status_key( $status );

			foreach ( $this->status_transitions( $status ) as $transition ) {
				foreach ( self::transition_assignment_inputs( $transition ) as $input ) {
					$key = sanitize_key( (string) ( $input['meta_key'] ?? '' ) );

					if ( '' === $key ) {
						return new WP_Error(
							'invalid_assignment_key',
							sprintf(
								/* translators: %s: stage key */
								__( 'A transition from “%s” has no assignment key. Give it a unique one.', 'vip-workflows' ),
								$stage_key
							),
							array( 'status' => 400 )
						);
					}

					$target = sanitize_key( is_scalar( $transition['to'] ?? null ) ? (string) $transition['to'] : '' );

					if ( isset( $slot_keys[ $key ] ) ) {
						return new WP_Error(
							'duplicate_assignment_key',
							sprintf(
								/* translators: 1: first stage key, 2: first transition's target stage key, 3: second stage key, 4: second transition's target stage key */
								__( 'The transitions from “%1$s” to “%2$s” and from “%3$s” to “%4$s” share an assignment key. Give each its own.', 'vip-workflows' ),
								$slot_keys[ $key ]['stage'],
								$slot_keys[ $key ]['to'],
								$stage_key,
								$target
							),
							array(
								'status'   => 400,
								'meta_key' => $key, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key -- Error data, not a query.
							)
						);
					}

					$slot_keys[ $key ] = array(
						'stage' => $stage_key,
						'to'    => $target,
					);
				}
			}
		}

		return true;
	}

	/**
	 * Regenerate assignment slot keys on import.
	 *
	 * An imported sequence gets its own assignment slots rather than sharing the
	 * ones the source sequence writes, so every declared key is minted fresh.
	 * Runs after validate_assignment_keys(), which has already refused a blank or
	 * repeated key, so every slot here is distinct and its old key goes unread.
	 *
	 * @param  array $statuses Imported statuses, already validated.
	 * @return array Statuses with fresh slot keys.
	 */
	private function regenerate_assignment_keys( array $statuses ): array {
		$minted = 0;

		foreach ( $statuses as $status_index => $status ) {
			foreach ( $this->status_transitions( $status ) as $transition_index => $transition ) {
				foreach ( array_keys( self::transition_assignment_inputs( $transition ) ) as $input_index ) {
					// The counter keeps two slots apart even when they are minted in the same second.
					$statuses[ $status_index ]['transitions'][ $transition_index ]['inputs'][ $input_index ]['meta_key'] = sanitize_key( sprintf( 'wfp_n%d_%d_%s', time(), $minted++, wp_generate_password( 5, false ) ) );
				}
			}
		}

		return $statuses;
	}

	/**
	 * Validate and sanitize metadata_fields config.
	 *
	 * @param  mixed $metadata_fields Raw metadata_fields value from request or import.
	 * @return array|WP_Error Sanitized fields array or WP_Error on validation failure.
	 */
	public function validate_metadata_fields( $metadata_fields ): array|WP_Error {
		if ( empty( $metadata_fields ) ) {
			return array();
		}

		if ( ! is_array( $metadata_fields ) ) {
			return new WP_Error(
				'invalid_metadata_fields',
				__( 'metadata_fields must be an array.', 'vip-workflows' ),
				array( 'status' => 400 )
			);
		}

		$allowed_types = array( 'text', 'textarea', 'select', 'date', 'user' );
		$seen_keys     = array();
		$result        = array();

		foreach ( $metadata_fields as $index => $field ) {
			if ( ! is_array( $field ) ) {
				return new WP_Error(
					'invalid_metadata_field',
					/* translators: %d: field index */
					sprintf( __( 'metadata_fields[%d] must be an object.', 'vip-workflows' ), $index ),
					array( 'status' => 400 )
				);
			}

			$key = $field['key'] ?? '';
			if ( empty( $key ) || ! preg_match( '/^[a-z0-9_]+$/', $key ) ) {
				return new WP_Error(
					'invalid_metadata_field_key',
					/* translators: %d: field index */
					sprintf( __( 'metadata_fields[%d] key must be a non-empty string of lowercase letters, digits, and underscores.', 'vip-workflows' ), $index ),
					array( 'status' => 400 )
				);
			}

			if ( in_array( $key, $seen_keys, true ) ) {
				return new WP_Error(
					'duplicate_metadata_field_key',
					/* translators: %s: duplicate key */
					sprintf( __( 'Duplicate metadata field key: "%s".', 'vip-workflows' ), $key ),
					array( 'status' => 400 )
				);
			}
			$seen_keys[] = $key;

			$label = $field['label'] ?? '';
			if ( empty( $label ) ) {
				return new WP_Error(
					'invalid_metadata_field_label',
					/* translators: %s: field key */
					sprintf( __( 'metadata field "%s" is missing a label.', 'vip-workflows' ), $key ),
					array( 'status' => 400 )
				);
			}

			$type = $field['type'] ?? '';
			if ( ! in_array( $type, $allowed_types, true ) ) {
				return new WP_Error(
					'invalid_metadata_field_type',
					/* translators: %1$s: field key, %2$s: allowed types list */
					sprintf( __( 'metadata field "%1$s" has invalid type. Allowed: %2$s.', 'vip-workflows' ), $key, implode( ', ', $allowed_types ) ),
					array( 'status' => 400 )
				);
			}

			if ( 'select' === $type ) {
				$options = $field['options'] ?? null;
				if ( ! is_array( $options ) || empty( $options ) ) {
					return new WP_Error(
						'invalid_metadata_field_options',
						/* translators: %s: field key */
						sprintf( __( 'metadata field "%s" of type "select" requires a non-empty options array.', 'vip-workflows' ), $key ),
						array( 'status' => 400 )
					);
				}
				$sanitized_options = array_map( 'sanitize_text_field', $options );
			}

			$sanitized = array(
				'key'        => sanitize_key( $key ),
				'label'      => sanitize_text_field( $label ),
				'type'       => $type,
				'required'   => ! empty( $field['required'] ),
				'searchable' => ! empty( $field['searchable'] ),
			);

			if ( 'select' === $type ) {
				$sanitized['options'] = $sanitized_options;
			}

			$result[] = $sanitized;
		}

		return $result;
	}
}
