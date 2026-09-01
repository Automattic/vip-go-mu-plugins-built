<?php
/**
 * Abilities REST API controller.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\API;

use VIPWorkflows\Abilities\Ability;
use VIPWorkflows\Abilities\AbilityExecutor;
use VIPWorkflows\Abilities\AbilitySettings;
use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * REST controller for abilities.
 */
class AbilitiesController extends WP_REST_Controller {


	/**
	 * Context keys that decide which object a run is authorized against.
	 *
	 * `options` is a free-form object, so any key a caller puts in it reaches
	 * the ability. Without this list one of these could arrive that way and win
	 * the merge in `build_effective_context()`, leaving the route authorizing
	 * one object and executing against another.
	 *
	 * Ordered to match how `AbilityExecutor` picks the object it attributes a
	 * run to, so the check and the stored record name the same one.
	 *
	 * @var string[]
	 */
	private const RESERVED_CONTEXT_KEYS = array( 'project_id', 'post_id' );

	/**
	 * Ability executor.
	 *
	 * @var AbilityExecutor
	 */
	private AbilityExecutor $executor;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = RestController::NAMESPACE;
		$this->rest_base = 'abilities';
		$this->executor  = new AbilityExecutor();
	}

	/**
	 * Register routes.
	 */
	public function register_routes(): void {
		// GET /abilities - List available abilities.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'category' => array(
							'description' => __( 'Filter by category.', 'vip-workflows' ),
							'type'        => 'string',
							'enum'        => array( 'vip-workflows', 'research' ),
						),
						'context'  => array(
							'description' => __( 'Filter by usage context.', 'vip-workflows' ),
							'type'        => 'string',
							'enum'        => array( 'workflow', 'phase', 'stage' ),
						),
						'post_id'  => array(
							'description'       => __( 'Post ID. When provided, returns only tools required by available transitions and annotates each with required_for.', 'vip-workflows' ),
							'type'              => 'integer',
							'sanitize_callback' => 'absint',
						),
					),
				),

				/*
				 * A sibling of the handler above, not a key inside it:
				 * `WP_REST_Server::get_data_for_route()` reads `schema` off the outer
				 * options array, so nesting it in the handler registers a schema that
				 * OPTIONS and the route index never report.
				 */
				'schema'              => array( $this, 'get_public_item_schema' ),
			)
		);

		// GET /abilities/{id} - Get single ability info.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[a-z0-9_/-]+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
				'args'                => array(
					'id' => array(
						'description' => __( 'Ability ID.', 'vip-workflows' ),
						'type'        => 'string',
						'required'    => true,
					),
				),
			)
		);

		// POST /abilities/{id}/run - Execute ability.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>[a-z0-9_/-]+)/run',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'run_ability' ),
				'permission_callback' => array( $this, 'run_ability_permissions_check' ),
				'args'                => array(
					'id'           => array(
						'description'       => __( 'Ability ID.', 'vip-workflows' ),
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'post_id'      => array(
						'description'       => __( 'Post ID to analyze.', 'vip-workflows' ),
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
					'content'      => array(
						'description'       => __( 'Content to analyze (if no post_id).', 'vip-workflows' ),
						'type'              => 'string',
						'sanitize_callback' => 'wp_kses_post',
					),
					'selection'    => array(
						'description'       => __( 'Selected text subset.', 'vip-workflows' ),
						'type'              => 'string',
						'sanitize_callback' => 'wp_kses_post',
					),
					'options'      => array(
						'description' => __( 'Ability-specific options.', 'vip-workflows' ),
						'type'        => 'object',
						'default'     => array(),
					),
				),
			)
		);

		// GET /posts/{post_id}/ability-results - Get results for a post.
		register_rest_route(
			$this->namespace,
			'/posts/(?P<post_id>[\d]+)/ability-results',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_post_results' ),
				'permission_callback' => array( $this, 'get_post_results_permissions_check' ),
				'args'                => array(
					'post_id'    => array(
						'description' => __( 'Post ID.', 'vip-workflows' ),
						'type'        => 'integer',
						'required'    => true,
					),
					'ability_id' => array(
						'description' => __( 'Filter by ability.', 'vip-workflows' ),
						'type'        => 'string',
					),
					'limit'      => array(
						'description' => __( 'Max results.', 'vip-workflows' ),
						'type'        => 'integer',
						'default'     => 10,
						'minimum'     => 1,
						'maximum'     => 50,
					),
				),
			)
		);
	}

	/**
	 * List available abilities.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ): WP_REST_Response {
		$category = $request->get_param( 'category' );
		$context  = $request->get_param( 'context' ); // 'workflow', or null for all.
		$settings = AbilitySettings::get_instance();

		$data = array();

		// Strict category filter, except stage context must discover stage-eligible plugins across categories.
		$collect_category = $category ? $category : ( 'stage' === $context ? null : 'vip-workflows' );

		$wp_abilities = wp_get_abilities();
		foreach ( $wp_abilities as $ability ) {
			if ( null !== $collect_category && $ability->get_category() !== $collect_category ) {
				continue;
			}
			$name = $ability->get_name();
			$meta = $ability->get_meta();

			$item = array(
				'id'               => $name,
				'name'             => $name,
				'label'            => $ability->get_label(),
				'description'      => $ability->get_description(),
				'category'         => $ability->get_category(),
				'schema'           => $ability->get_input_schema(),
				'meta'             => $meta,
				'enabled'          => $settings->is_enabled( $name ),
				'show_in_commands' => $settings->show_in_commands( $name, $meta['show_in_commands'] ?? false ),
			);

			/*
			 * A plain `WP_Ability` has no structured availability channel, so it
			 * serializes the empty "nothing unmet" result rather than omitting the
			 * key — a consumer should never have to branch on key presence.
			 */
			$item['availability'] = $ability instanceof Ability
				? AvailabilitySerializer::serialize( $ability->get_availability() )
				: AvailabilitySerializer::serialize_available();

			if ( $ability instanceof Ability ) {
				$item['icon']             = $ability->get_icon();
				$item['thinking_message'] = $ability->get_thinking_message();
				$item['success_message']  = $ability->get_success_message();
				$item['display_order']    = $ability->get_display_order();
				$item['available']        = $item['availability']['available'];
			}

			$data[] = $item;
		}

		// Filter by context (workflow) if specified.
		if ( $context ) {
			$data = array_filter(
				$data,
				function ( $ability ) use ( $context, $settings ) {
					$supports = $ability['meta']['supports'] ?? array();
					if ( ! in_array( $context, $supports, true ) ) {
						return false;
					}

					// AI stage agents: eligible to own a workflow stage.
					if ( 'stage' === $context ) {
						return ! empty( $ability['meta']['stage_eligible'] );
					}

					if ( in_array( $context, array( 'workflow', 'phase' ), true ) ) {
						$ability_settings    = $settings->get( $ability['id'] );
						$meta_eligible       = $ability['meta']['transition_eligible'] ?? false;
						$settings_eligible   = $ability_settings['transition_eligible'] ?? $meta_eligible;
						if ( ! $settings_eligible ) {
							return false;
						}
					}

					return true;
				}
			);
			$data = array_values( $data );
		}

		// Add check_modes from settings to each ability.
		foreach ( $data as &$ability ) {
			$ability_settings = $settings->get( $ability['id'] );
			$ability['check_modes'] = $ability_settings['check_modes'] ?? array();
		}
		unset( $ability );

		// Filter by post_id: return only tools required by available transitions.
		$post_id = $request->get_param( 'post_id' );
		if ( $post_id ) {
			$status_manager = new \VIPWorkflows\Workflow\StatusManager();
			$transitions    = $status_manager->get_available_transitions( $post_id );

			if ( ! empty( $transitions ) ) {
				$tool_transition_map = array();
				foreach ( $transitions as $transition ) {
					foreach ( $transition['required_tools'] ?? array() as $tool_id ) {
						if ( ! isset( $tool_transition_map[ $tool_id ] ) ) {
							$tool_transition_map[ $tool_id ] = array();
						}
						$tool_transition_map[ $tool_id ][] = array(
							'to' => $transition['to'],
							// Already run through transition_label() upstream, so
							// the sidebar and this listing agree by construction.
							// Re-deriving it here dereferenced an unassigned
							// $sequence — a fatal on every request that got here.
							'label' => $transition['label'],
						);
					}
				}

				$data = array_filter(
					$data,
					fn( $ability ) => isset( $tool_transition_map[ $ability['id'] ] )
				);

				foreach ( $data as &$ability ) {
					$ability['required_for'] = $tool_transition_map[ $ability['id'] ] ?? array();
				}
				unset( $ability );
			} else {
				$data = array();
			}
		}

		return new WP_REST_Response( array_values( $data ) );
	}

	/**
	 * Get single ability info.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_item( $request ) {
		$id = $request->get_param( 'id' );

		$ability = wp_get_ability( $id );

		if ( ! $ability ) {
			return new WP_Error(
				'ability_not_found',
				/* translators: %s: ability ID. */
				sprintf( __( 'Ability "%s" not found.', 'vip-workflows' ), $id ),
				array( 'status' => 404 )
			);
		}

		$item = array(
			'id'          => $ability->get_name(),
			'name'        => $ability->get_name(),
			'label'       => $ability->get_label(),
			'description' => $ability->get_description(),
			'category'    => $ability->get_category(),
			'schema'      => $ability->get_input_schema(),
			'meta'        => $ability->get_meta(),
		);

		$item['availability'] = $ability instanceof Ability
			? AvailabilitySerializer::serialize( $ability->get_availability() )
			: AvailabilitySerializer::serialize_available();

		if ( $ability instanceof Ability ) {
			$item['icon']             = $ability->get_icon();
			$item['thinking_message'] = $ability->get_thinking_message();
			$item['success_message']  = $ability->get_success_message();
		}

		return new WP_REST_Response( $item );
	}

	/**
	 * Execute an ability.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function run_ability( $request ) {
		$id = $request->get_param( 'id' );

		$context = $this->build_effective_context( $request );
		if ( $context instanceof WP_Error ) {
			return $context;
		}

		try {
			/*
			 * No execution context, which is itself the accurate one here: this
			 * endpoint is the on-demand run, reached from the command palette and
			 * the editor's tools panel, and in both a person asked for this result
			 * and is watching a spinner for it. That is exactly what the executor's
			 * empty context means, so an ability that defers work for a transition
			 * computes properly for this caller. Naming a surface would be a guess —
			 * the route is open to any client with the capability.
			 */
			$result = $this->executor->execute( $id, $context );

			return new WP_REST_Response( $result->to_array() );

		} catch ( \InvalidArgumentException $e ) {
			return new WP_Error(
				'ability_not_found',
				$e->getMessage(),
				array( 'status' => 404 )
			);
		} catch ( \RuntimeException $e ) {
			return new WP_Error(
				'ability_cannot_execute',
				$e->getMessage(),
				array( 'status' => 400 )
			);
		} catch ( \Exception $e ) {
			return new WP_Error(
				'ability_execution_failed',
				$e->getMessage(),
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Get ability results for a post.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_post_results( $request ): WP_REST_Response {
		$post_id    = (int) $request->get_param( 'post_id' );
		$ability_id = $request->get_param( 'ability_id' );
		$limit      = (int) $request->get_param( 'limit' );

		$results = $this->executor->get_results_for_post( $post_id, $ability_id, $limit );

		return new WP_REST_Response(
			array_map( fn( $r ) => $r->to_array(), $results )
		);
	}

	/**
	 * Check if user can list abilities.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function get_items_permissions_check( $request ): bool {
		// `post_id` turns a global listing into a question about one post, so it
		// takes a per-object answer — as both sibling callbacks here already do.
		$post_id = (int) $request->get_param( 'post_id' );
		if ( $post_id ) {
			return current_user_can( 'edit_post', $post_id );
		}

		return current_user_can( 'edit_posts' );
	}

	/**
	 * Build the context a run will execute against.
	 *
	 * Both the permission callback and the request handler call this, so the
	 * object that gets authorized is by construction the object that runs. The
	 * two used to derive their own context from the same request, and drifted:
	 * the check read the top-level `post_id` while the handler let `options`
	 * overwrite it.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return array|WP_Error Effective context, or an error when the request
	 *                        names two different objects for one run.
	 */
	private function build_effective_context( $request ) {
		$base = array(
			'post_id'   => $request->get_param( 'post_id' ),
			'content'   => $request->get_param( 'content' ),
			'selection' => $request->get_param( 'selection' ),
		);

		$options = $request->get_param( 'options' );
		$options = empty( $options ) ? array() : $options;

		/*
		 * Compared before the merge, which is the only point where the two
		 * values are still distinguishable. A request naming two objects is
		 * malformed rather than ambiguous, so it is refused instead of being
		 * resolved by a precedence rule the caller cannot see.
		 */
		foreach ( self::RESERVED_CONTEXT_KEYS as $key ) {
			if ( ! isset( $base[ $key ], $options[ $key ] ) ) {
				continue;
			}

			if ( (int) $base[ $key ] !== (int) $options[ $key ] ) {
				return new WP_Error(
					'ability_context_conflict',
					sprintf(
						/* translators: %s: name of the duplicated request parameter. */
						__( 'This request gives "%s" two different values. Send it once.', 'vip-workflows' ),
						$key
					),
					array( 'status' => 400 )
				);
			}
		}

		$context = array_merge( $base, $options );

		return array_filter( $context, fn( $v ) => null !== $v );
	}

	/**
	 * The object a run will be attributed to, if any.
	 *
	 * @param  array $context Effective context.
	 * @return int|null Object ID, or null for a run with no object — analyzing
	 *                  passed-in content rather than a stored post.
	 */
	private function effective_object_id( array $context ): ?int {
		foreach ( self::RESERVED_CONTEXT_KEYS as $key ) {
			if ( isset( $context[ $key ] ) ) {
				return (int) $context[ $key ];
			}
		}

		return null;
	}

	/**
	 * Check if user can run abilities.
	 *
	 * Authorizes the effective object rather than the top-level `post_id`
	 * parameter: an identifier that arrives through `options` carries the same
	 * authority, since it is what the ability executes against and what the
	 * stored result and audit event record.
	 *
	 * Ideation projects are registered with `capability_type => 'post'` and
	 * `map_meta_cap`, so one `edit_post` check covers both identifier kinds.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function run_ability_permissions_check( $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$context = $this->build_effective_context( $request );
		if ( $context instanceof WP_Error ) {
			return $context;
		}

		$object_id = $this->effective_object_id( $context );

		/*
		 * A missing object is refused the same way an unreadable one is:
		 * `edit_post` is false for an ID that does not resolve, and answering
		 * 403 rather than 404 keeps the route from confirming which IDs exist.
		 */
		if ( $object_id && ! current_user_can( 'edit_post', $object_id ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to analyze this post.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Check if the user can read stored ability results for a post.
	 *
	 * Ability results are derived from post content (summaries, extracted
	 * quotes, readability/SEO details), so reads must be gated per-post with
	 * `edit_post` — mirroring the write path in `run_ability_permissions_check`
	 * — rather than the global `edit_posts` used for listing abilities.
	 *
	 * @param  WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function get_post_results_permissions_check( $request ) {
		if ( ! current_user_can( 'edit_posts' ) ) {
			return false;
		}

		$post_id = (int) $request->get_param( 'post_id' );
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to view results for this post.', 'vip-workflows' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Schema for one ability in the collection response.
	 *
	 * `get_items()` builds its rows inline, and for a long time this shape was
	 * described nowhere — not in a schema, not in one fixture. Every JS suite
	 * hand-built its own partial copy, and three bugs shipped behind a green suite
	 * because a partial copy cannot contradict the code it is standing in for: a
	 * fixture that put the human name in `name` let thirty tests pass over a screen
	 * of raw ability ids, and fixtures that omitted `enabled` and `icon` hid a
	 * vanishing card list and dashicon slugs rendered as literal text.
	 *
	 * Declaring the shape here makes it introspectable — an OPTIONS request or the
	 * route index now answers what a row contains, for REST consumers and for agents
	 * reading this API over MCP — and gives the test suite something declarative to
	 * pin instead of a regex over this file. `required` lists the keys every row
	 * carries; the rest are emitted conditionally, and which condition governs each
	 * is recorded in tests/fixtures/abilities-response-contract.json, the file that
	 * pins this schema, the endpoint's real output, and the JS fixture builder to one
	 * another.
	 *
	 * This is a declaration only. `get_items()` returns its `WP_REST_Response`
	 * without context filtering, so adding it changes no byte of what the endpoint
	 * sends.
	 *
	 * @since 0.0.1
	 *
	 * @return array Item schema data.
	 */
	public function get_item_schema(): array {
		if ( isset( $this->schema ) ) {
			return $this->add_additional_fields_schema( $this->schema );
		}

		$this->schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'vip-workflows-ability',
			'type'       => 'object',
			'properties' => array(
				'id'               => array(
					'description' => __( 'The ability identifier. Same value as name.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'name'             => array(
					'description' => __( 'The ability identifier, not a human-readable name. Use label for display.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'label'            => array(
					'description' => __( 'Human-readable name. The only key safe to display to a reader.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'description'      => array(
					'description' => __( 'Human-readable description of what the ability does.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'category'         => array(
					'description' => __( 'Ability category.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'schema'           => array(
					'description' => __( 'The ability input schema.', 'vip-workflows' ),
					'type'        => 'object',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'meta'             => array(
					'description' => __( 'Ability meta, including supports, stage_eligible and transition_eligible.', 'vip-workflows' ),
					'type'        => 'object',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'enabled'          => array(
					'description' => __( 'Whether the ability may be run. Turned-off abilities are still listed.', 'vip-workflows' ),
					'type'        => 'boolean',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'show_in_commands' => array(
					'description' => __( 'Whether the ability appears in the editor command palette.', 'vip-workflows' ),
					'type'        => 'boolean',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'availability'     => array(
					'description' => __( 'Serialized availability. Always present: an ability with no structured channel serializes the empty unmet-nothing result rather than omitting the key.', 'vip-workflows' ),
					'type'        => 'object',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'check_modes'      => array(
					'description' => __( 'Configured check modes for the ability.', 'vip-workflows' ),
					'type'        => 'array',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'icon'             => array(
					'description' => __( 'Dashicon slug or literal glyph. Present only for a VIP Workflows ability.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'thinking_message' => array(
					'description' => __( 'Message shown while the ability runs. Present only for a VIP Workflows ability.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'success_message'  => array(
					'description' => __( 'Message shown when the ability succeeds. Present only for a VIP Workflows ability.', 'vip-workflows' ),
					'type'        => 'string',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'display_order'    => array(
					'description' => __( 'UI sort order, lower first. Present only for a VIP Workflows ability.', 'vip-workflows' ),
					'type'        => 'integer',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'available'        => array(
					'description' => __( 'Mirror of availability.available. Present only for a VIP Workflows ability.', 'vip-workflows' ),
					'type'        => 'boolean',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
				'required_for'     => array(
					'description' => __( 'Transitions requiring this tool. Present only when post_id is passed.', 'vip-workflows' ),
					'type'        => 'array',
					'context'     => array( 'view' ),
					'readonly'    => true,
				),
			),
			'required'   => array(
				'id',
				'name',
				'label',
				'description',
				'category',
				'schema',
				'meta',
				'enabled',
				'show_in_commands',
				'availability',
				'check_modes',
			),
		);

		return $this->add_additional_fields_schema( $this->schema );
	}
}
