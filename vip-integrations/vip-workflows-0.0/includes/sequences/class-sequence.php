<?php
/**
 * Sequence data class.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Sequences;

/**
 * Represents a workflow sequence entity.
 */
class Sequence {


	/**
	 * Sequence type constants.
	 */
	public const TYPE_WORKFLOW = 'workflow';
	public const TYPE_PHASE    = 'phase';

	/**
	 * Sequence ID.
	 *
	 * @var int
	 */
	public int $id;

	/**
	 * UUID.
	 *
	 * @var string
	 */
	public string $uuid;

	/**
	 * Type (workflow or phase).
	 *
	 * @var string
	 */
	public string $type;

	/**
	 * Name.
	 *
	 * @var string
	 */
	public string $name;

	/**
	 * Slug.
	 *
	 * @var string
	 */
	public string $slug;

	/**
	 * Description.
	 *
	 * @var string|null
	 */
	public ?string $description;

	/**
	 * Version number.
	 *
	 * @var int
	 */
	public int $version;

	/**
	 * Status (draft, active, archived).
	 *
	 * @var string
	 */
	public string $status;

	/**
	 * Configuration array.
	 *
	 * @var array
	 */
	public array $config;

	/**
	 * Created by user ID.
	 *
	 * @var int
	 */
	public int $created_by;

	/**
	 * Created at timestamp.
	 *
	 * @var string
	 */
	public string $created_at;

	/**
	 * Updated at timestamp.
	 *
	 * @var string
	 */
	public string $updated_at;

	/**
	 * Valid statuses.
	 */
	public const STATUSES = array( 'draft', 'active', 'archived' );

	/**
	 * Core editorial post statuses — the valid stage regions of the stage × status
	 * matrix. Every workflow stage lives inside exactly one of these regions.
	 */
	public const EDITORIAL_STATUSES = array( 'draft', 'pending', 'private', 'publish' );

	/**
	 * Core overlay statuses. These are core-owned mechanics ("scheduled", "trashed"),
	 * not editorial locations: they have no regions, the workflow never writes them,
	 * and they are never matrix members. (Core-internal `auto-draft`/`inherit` are
	 * likewise never matrix members.)
	 */
	public const OVERLAY_STATUSES = array( 'future', 'trash' );

	/**
	 * The name of the required-metadata gate, in both the forms a client meets it.
	 *
	 * It rides on a held transition as `_locked_code` and it is the error code
	 * StatusManager::transition() refuses with — one rule, one name, so the
	 * editor's projected view of it and the 422 that enforces it cannot drift
	 * apart. `_locked_reason` says the same thing in prose, for a reader; this
	 * says it to code.
	 *
	 * Which matters because this is the one lock a client may re-judge. The gate
	 * reads post meta, and an open block editor holds meta the database has not
	 * seen yet — fields typed into the sidebar are editor-store edits until the
	 * post is saved. Every other lock (role, assignment, capability) is a fact
	 * only the server can settle. See src/editor/required-metadata.js.
	 */
	public const CODE_REQUIRED_METADATA = 'required_fields_missing';

	/**
	 * Create a Sequence from a database row.
	 *
	 * @param  object $row Database row.
	 * @return self
	 */
	public static function from_row( object $row ): self {
		$sequence = new self();

		$sequence->id          = (int) $row->id;
		$sequence->uuid        = $row->uuid;
		$sequence->type        = $row->type ?? self::TYPE_WORKFLOW;
		$sequence->name        = $row->name;
		$sequence->slug        = $row->slug;
		$sequence->description = $row->description;
		$sequence->version     = (int) $row->version;
		$sequence->status      = $row->status;
		$sequence->config      = json_decode( $row->config, true ) ?? array();
		$sequence->created_by  = (int) $row->created_by;
		$sequence->created_at  = $row->created_at;
		$sequence->updated_at  = $row->updated_at;

		return $sequence;
	}

	/**
	 * Convert to array for API responses.
	 *
	 * @return array
	 */
	public function to_array(): array {
		return array(
			'id'          => $this->id,
			'uuid'        => $this->uuid,
			'type'        => $this->type,
			'name'        => $this->name,
			'slug'        => $this->slug,
			'description' => $this->description,
			'version'     => $this->version,
			'status'      => $this->status,
			'config'      => $this->config,
			'created_by'  => $this->created_by,
			'created_at'  => $this->created_at,
			'updated_at'  => $this->updated_at,
		);
	}

	/**
	 * Check if this is a workflow sequence.
	 *
	 * @return bool
	 */
	public function is_workflow(): bool {
		return self::TYPE_WORKFLOW === $this->type;
	}

	/**
	 * Check if this is a phase sequence.
	 *
	 * @return bool
	 */
	public function is_phase(): bool {
		return self::TYPE_PHASE === $this->type;
	}

	// =========================================================================
	// Phase Sequence Methods
	// =========================================================================

	/**
	 * Get phases defined by this sequence.
	 *
	 * @return array Array of phase configs with 'key', 'label', 'transitions'.
	 */
	public function get_phases(): array {
		return $this->config['phases'] ?? array();
	}

	/**
	 * Get a specific phase transition config.
	 *
	 * @param  string $from_phase Source phase key (e.g. 'ideation').
	 * @param  string $to_phase   Target phase key (e.g. 'editorial').
	 * @return array|null Transition config or null if not found.
	 */
	public function get_phase_transition( string $from_phase, string $to_phase ): ?array {
		foreach ( $this->get_phases() as $phase ) {
			if ( $phase['key'] !== $from_phase ) {
				continue;
			}

			foreach ( $phase['transitions'] ?? array() as $transition ) {
				if ( $transition['to'] === $to_phase ) {
					return $transition;
				}
			}
		}

		return null;
	}

	/**
	 * Check if a phase transition is allowed for a user.
	 *
	 * Checks that the transition exists and the user's role is permitted.
	 * Tool execution happens separately at transition time.
	 *
	 * @param  string $from_phase Source phase key.
	 * @param  string $to_phase   Target phase key.
	 * @param  int    $user_id    User ID. Default current user.
	 * @return bool
	 */
	public function is_phase_transition_allowed( string $from_phase, string $to_phase, int $user_id = 0 ): bool {
		$transition = $this->get_phase_transition( $from_phase, $to_phase );
		if ( ! $transition ) {
			return false;
		}

		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( empty( $transition['allowed_roles'] ) ) {
			return true;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		return ! empty( array_intersect( $user->roles, (array) $transition['allowed_roles'] ) );
	}

	/**
	 * Get post types this sequence applies to.
	 *
	 * @return array
	 */
	public function get_post_types(): array {
		return $this->config['post_types'] ?? array( 'post' );
	}

	/**
	 * Get workflow statuses defined by this sequence.
	 *
	 * @return array Array of status configs with 'key', 'label', 'color', etc.
	 */
	public function get_statuses(): array {
		return $this->config['statuses'] ?? array();
	}

	/**
	 * Get a specific status configuration.
	 *
	 * @param  string $status_key Status key.
	 * @return array|null
	 */
	public function get_status( string $status_key ): ?array {
		foreach ( $this->get_statuses() as $status ) {
			if ( $status['key'] === $status_key ) {
				return $status;
			}
		}
		return null;
	}

	/**
	 * Get a status by a boolean flag (e.g., is_initial, is_in_progress, is_terminal).
	 *
	 * @param  string $flag Flag name to search for.
	 * @return array|null Status config or null if not found.
	 */
	public function get_status_by_flag( string $flag ): ?array {
		foreach ( $this->get_statuses() as $status ) {
			if ( ! empty( $status[ $flag ] ) ) {
				return $status;
			}
		}
		return null;
	}

	/**
	 * Get the initial status for new posts.
	 *
	 * @return string
	 */
	public function get_initial_status(): string {
		$statuses = $this->get_statuses();

		if ( empty( $statuses ) ) {
			return 'draft';
		}

		// Honor an explicit is_initial flag; otherwise fall back to the first status.
		$flagged = $this->get_status_by_flag( 'is_initial' );

		return $flagged['key'] ?? $statuses[0]['key'];
	}

	/**
	 * Get transitions allowed from a given status.
	 *
	 * @param  string $from_status Current status key.
	 * @return array Array of transition configs.
	 */
	public function get_transitions( string $from_status ): array {
		$status = $this->get_status( $from_status );
		return $status['transitions'] ?? array();
	}

	/**
	 * Check if a transition is allowed (exists in sequence).
	 *
	 * @param  string $from_status Current status.
	 * @param  string $to_status   Target status.
	 * @return bool
	 */
	public function is_transition_allowed( string $from_status, string $to_status ): bool {
		return null !== $this->get_transition( $from_status, $to_status );
	}

	/**
	 * Get a specific transition config.
	 *
	 * @param  string $from_status Current status.
	 * @param  string $to_status   Target status.
	 * @return array|null Transition config or null if not found.
	 */
	public function get_transition( string $from_status, string $to_status ): ?array {
		$transitions = $this->get_transitions( $from_status );
		foreach ( $transitions as $transition ) {
			if ( $transition['to'] === $to_status ) {
				return $transition;
			}
		}
		return null;
	}

	/**
	 * Get transitions filtered by core region-crossing capabilities, user role,
	 * and assignment requirements.
	 *
	 * Region-crossing edges defer to core capabilities: crossing into the publish
	 * or private region requires the post type's publish cap, and crossing out of
	 * publish requires its edit-published cap. An edge the user lacks the cap for
	 * is not offered — there is no escalation mechanism, and workflow bypass roles
	 * bypass workflow rules (roles/assignments), never core capabilities. The
	 * crossing filter needs a post context to resolve the post type, so it only
	 * applies when $post_id is provided. The per-post `edit_post` baseline is
	 * enforced by StatusManager::transition(), not here.
	 *
	 * @param  string $from_status Current status key.
	 * @param  int    $user_id     User ID to check roles for. Default current user.
	 * @param  int    $post_id     Post ID for capability and assignment checks. Default 0 (skip both).
	 * @return array Transitions the user is allowed to perform (with _locked flag for assignment blocks).
	 */
	public function get_transitions_for_user( string $from_status, int $user_id = 0, int $post_id = 0 ): array {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( ! $user_id ) {
			return array();
		}

		$transitions = $this->get_role_permitted_transitions( $from_status, $user_id, $post_id );

		// Core capabilities outrank workflow configuration (bypass roles bypass
		// workflow rules, never core caps), so the crossing filter applies on top
		// of the role-permitted result. It needs a post context to resolve the
		// post type, so it only applies when $post_id is provided.
		if ( $post_id ) {
			$transitions = array_values(
				array_filter(
					$transitions,
					fn( $transition ) => $this->user_can_cross_region( $from_status, (string) ( $transition['to'] ?? '' ), $user_id, $post_id )
				)
			);
		}

		return $transitions;
	}

	/**
	 * Get transitions permitted by WORKFLOW configuration alone — sequence role
	 * rules and assignment context, WITHOUT the core region-capability filter.
	 *
	 * The role-only layer beneath get_transitions_for_user(), which applies the
	 * core region-capability filter on top of this result. Kept separate so the
	 * two questions stay distinguishable: "does the sequence permit this edge
	 * for this role" versus "does core let this user set that status". Every
	 * UI/enforcement surface consumes the cap-filtered get_transitions_for_user()
	 * instead. This method must never call core capability checks (no
	 * user_can/current_user_can): its answer is the workflow's own configuration,
	 * and callers layer capabilities on afterwards.
	 *
	 * @param  string $from_status Current status key.
	 * @param  int    $user_id     User ID to check roles for. Default current user.
	 * @param  int    $post_id     Post ID for assignment checks. Default 0 (skip).
	 * @return array Transitions the workflow configuration permits (with _locked flag for assignment blocks).
	 */
	public function get_role_permitted_transitions( string $from_status, int $user_id = 0, int $post_id = 0 ): array {
		$transitions = $this->get_transitions( $from_status );

		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( ! $user_id ) {
			return array();
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return array();
		}

		$user_roles = $user->roles;

		// Check if user has a role that can bypass workflow restrictions.
		$bypass_roles     = \VIPWorkflows\Admin\Settings::get_bypass_workflow_roles();
		$can_bypass       = ! empty( array_intersect( $user_roles, $bypass_roles ) );
		$can_bypass_tools = \VIPWorkflows\Admin\Settings::can_user_bypass_tool_checks( $user_id );

		if ( $can_bypass ) {
			return $can_bypass_tools ? $transitions : $this->lock_disabled_required_tools( $transitions );
		}

		$assignment_manager = new \VIPWorkflows\Workflow\AssignmentManager();
		$allowed = array();

		// Missing required fields are a property of the POST, not of any one edge,
		// so this is read once rather than per transition. It mirrors the gate in
		// StatusManager::transition(): every edge the gate would refuse is offered
		// locked, so no surface renders a move the server is going to reject —
		// which, since that gate narrowed to publish-region crossings, means the
		// publish edges alone. A blanket lock here would disable moves the server
		// would happily perform.
		$missing_metadata = $post_id ? $this->get_missing_required_metadata( $post_id ) : array();

		// Resolved once, and not until an edge actually has to be judged.
		// get_stage_status() throws on a stage stored before the region write
		// gate (or on one the sequence no longer defines), which is the right
		// answer for an edge about to be judged and a pointless risk otherwise —
		// this method is a read path with no try/catch above it, so a throw here
		// is a 500 on the editor sidebar, the board and My Queue alike. A post
		// whose every edge is already locked, or which has no edges at all,
		// never asks the question and so never pays that risk.
		$from_region = null;

		foreach ( $transitions as $transition ) {
			// Check allowed_roles.
			if ( ! empty( $transition['allowed_roles'] ) ) {
				$transition_roles = (array) $transition['allowed_roles'];
				if ( ! array_intersect( $user_roles, $transition_roles ) ) {
					continue; // User doesn't have required role.
				}
			}

			// Check requires_assignment (if post_id provided).
			if ( $post_id && ! empty( $transition['requires_assignment'] ) ) {
				$requirement = $assignment_manager->normalize_requirement( $transition['requires_assignment'] );

				if ( ! $assignment_manager->user_satisfies_requirement( $post_id, $user_id, $requirement ) ) {
					$transition['_locked']        = true;
					$transition['_locked_reason'] = $assignment_manager->get_lock_reason( $post_id, $requirement );
				}
			}

			// An already-locked edge keeps the assignment reason: not being the
			// assignee blocks the move whether or not the fields are filled, so it
			// is the more useful thing to say.
			if ( $missing_metadata && empty( $transition['_locked'] ) ) {
				$from_region ??= $this->get_stage_status( $from_status );

				if ( self::crosses_into_publish( $from_region, $this->get_stage_status( (string) ( $transition['to'] ?? '' ) ) ) ) {
					$transition['_locked'] = true;
					// Names the rule holding this edge, so the editor can tell it
					// apart from the locks it must take on trust and re-judge it
					// against the fields the author has actually filled in. See
					// CODE_REQUIRED_METADATA.
					$transition['_locked_code']   = self::CODE_REQUIRED_METADATA;
					$transition['_locked_reason'] = sprintf(
						/* translators: %s: list of metadata field labels, joined for the locale. */
						__( 'Required fields are empty: %s', 'vip-workflows' ),
						wp_sprintf( '%l', array_map( fn( $field ) => (string) $field['label'], $missing_metadata ) )
					);
				}
			}

			$allowed[] = $transition;
		}

		return $can_bypass_tools ? $allowed : $this->lock_disabled_required_tools( $allowed );
	}

	/**
	 * Lock transitions whose required checks are switched off site-wide.
	 *
	 * The transition gate treats a disabled required tool as a hard failure. Its
	 * read models must therefore carry the same answer so the editor rail, board,
	 * and My Queue do not offer a move the server will deterministically refuse.
	 * Existing assignment or metadata locks keep their more immediately useful
	 * reason.
	 *
	 * @param  array $transitions Transitions already filtered for the user.
	 * @return array Transitions with disabled-tool locks projected.
	 */
	private function lock_disabled_required_tools( array $transitions ): array {
		$settings = \VIPWorkflows\Abilities\AbilitySettings::get_instance();

		foreach ( $transitions as &$transition ) {
			if ( ! empty( $transition['_locked'] ) ) {
				continue;
			}

			$disabled_tools = array();
			foreach ( $transition['required_tools'] ?? array() as $tool_id ) {
				if ( ! $settings->is_enabled( (string) $tool_id ) ) {
					$disabled_tools[] = (string) $tool_id;
				}
			}

			if ( $disabled_tools ) {
				$transition['_locked']        = true;
				$transition['_locked_reason'] = sprintf(
					/* translators: %s: list of required tool IDs. */
					__( 'Required checks are switched off: %s', 'vip-workflows' ),
					wp_sprintf( '%l', $disabled_tools )
				);
			}
		}
		unset( $transition );

		return $transitions;
	}

	/**
	 * Whether a user holds the core capability a region-crossing edge requires.
	 *
	 * Capability map (resolved via the post type's cap object):
	 * - crossing INTO `publish` or `private` → `publish_posts`
	 * - crossing OUT OF `publish` (to a draft/pending-region stage) → `edit_published_posts`
	 * - all other crossings (e.g. draft ↔ pending) → baseline only (no extra cap)
	 * - same-region moves → no cap involved
	 *
	 * @param  string $from_stage Source stage key.
	 * @param  string $to_stage   Target stage key.
	 * @param  int    $user_id    User ID.
	 * @param  int    $post_id    Post ID (resolves the post type).
	 * @return bool
	 */
	private function user_can_cross_region( string $from_stage, string $to_stage, int $user_id, int $post_id ): bool {
		$from_region = $this->get_stage_status( $from_stage );
		$to_region   = $this->get_stage_status( $to_stage );

		if ( $from_region === $to_region ) {
			return true;
		}

		$post_type_object = get_post_type_object( (string) get_post_type( $post_id ) );
		if ( ! $post_type_object ) {
			// Data-integrity condition: the post's type is not registered, so the
			// crossing capability cannot be resolved. Fail closed on the edge.
			error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				sprintf(
					'[VIP Workflows] Cannot resolve post type for post %d while filtering region-crossing transitions in sequence "%s".',
					$post_id,
					$this->slug
				)
			);
			return false;
		}

		$caps = $post_type_object->cap;

		if ( in_array( $to_region, array( 'publish', 'private' ), true ) ) {
			return $this->user_has_region_cap( $user_id, $caps, 'publish_posts', $post_id );
		}

		if ( 'publish' === $from_region ) {
			return $this->user_has_region_cap( $user_id, $caps, 'edit_published_posts', $post_id );
		}

		return true;
	}

	/**
	 * Whether a user holds a named capability from a post type's cap object,
	 * failing loud (and closed) when the post type doesn't declare it.
	 *
	 * A post type registered without the standard primitive caps (e.g. an
	 * external CPT with `map_meta_cap => false` and a partial `capabilities`
	 * map) may have no `edit_published_posts` property at all. Reading it
	 * blind yields null → `user_can( null )` → every affected edge silently
	 * hidden from everyone. Closed is the correct failure mode for a
	 * capability check, but it must be diagnosable — so the data-integrity
	 * condition is logged.
	 *
	 * @param  int    $user_id  User ID.
	 * @param  object $caps     The post type's cap object.
	 * @param  string $cap_name Cap property to resolve (e.g. 'publish_posts').
	 * @param  int    $post_id  Post ID (for the log line).
	 * @return bool
	 */
	private function user_has_region_cap( int $user_id, object $caps, string $cap_name, int $post_id ): bool {
		if ( ! isset( $caps->{$cap_name} ) || ! is_string( $caps->{$cap_name} ) || '' === $caps->{$cap_name} ) {
			error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				sprintf(
					'[VIP Workflows] Post type of post %d declares no "%s" capability; hiding the region-crossing transition in sequence "%s" (fail closed).',
					$post_id,
					$cap_name,
					$this->slug
				)
			);
			return false;
		}

		return user_can( $user_id, $caps->{$cap_name} );
	}

	/**
	 * Check if a user can perform a specific transition.
	 *
	 * @param  string $from_status Current status.
	 * @param  string $to_status   Target status.
	 * @param  int    $user_id     User ID. Default current user.
	 * @return bool
	 */
	public function can_user_transition( string $from_status, string $to_status, int $user_id = 0 ): bool {
		$transitions = $this->get_transitions_for_user( $from_status, $user_id );
		foreach ( $transitions as $transition ) {
			if ( $transition['to'] === $to_status ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Get settings.
	 *
	 * @return array
	 */
	public function get_settings(): array {
		return $this->config['settings'] ?? array();
	}

	/**
	 * Get metadata fields defined by this sequence.
	 *
	 * @return array Array of field configs with 'key', 'label', 'type', and optional 'required', 'searchable', 'options'.
	 */
	public function get_metadata_fields(): array {
		return $this->config['metadata_fields'] ?? array();
	}

	/**
	 * Get metadata fields with their resolved post meta keys attached.
	 *
	 * Each entry is the field config plus a 'meta_key' of the form
	 * wf_meta_{sequence_id}_{field_key}. This is the shape the editor store
	 * and Metadata panel consume, used both for initial localization and for
	 * the workflow status endpoint so assign/remove can refresh fields live.
	 *
	 * @return array Field configs each augmented with a 'meta_key'.
	 */
	public function get_metadata_fields_with_meta_keys(): array {
		$fields = array();
		foreach ( $this->get_metadata_fields() as $field ) {
			$entry             = $field;
			$entry['meta_key'] = 'wf_meta_' . $this->id . '_' . $field['key'];
			$fields[]          = $entry;
		}
		return $fields;
	}

	/**
	 * The sequence's required metadata fields that this post has not filled in.
	 *
	 * The single answer to "what is missing?", asked by two callers that must not
	 * disagree: StatusManager::transition() refuses a move on it, and
	 * get_role_permitted_transitions() projects the same answer into `_locked` so
	 * the surfaces stop offering the move in the first place. When those two were
	 * separate the board offered a drop the server then refused, and the round
	 * trip wrote a `transition_blocked` row for a move the board had shown as legal.
	 *
	 * WHICH moves have to care is not decided here: both callers ask this only
	 * about edges crosses_into_publish() covers. This answers what is empty, never
	 * whether a particular transition should be held for it.
	 *
	 * Only the post's OWN fields are consulted — meta keys are namespaced
	 * `wf_meta_{sequence_id}_{field_key}`, so a field another sequence marks
	 * required is never looked at here.
	 *
	 * @param  int $post_id Post ID.
	 * @return array Field configs (each with its `meta_key`) that are required and
	 *               empty, in config order. Empty array when nothing is missing.
	 */
	public function get_missing_required_metadata( int $post_id ): array {
		$missing = array();

		foreach ( $this->get_metadata_fields_with_meta_keys() as $field ) {
			if ( empty( $field['required'] ) ) {
				continue;
			}

			$value = get_post_meta( $post_id, $field['meta_key'], true );

			if ( self::metadata_value_is_empty( (string) $field['type'], $value ) ) {
				$missing[] = $field;
			}
		}

		return $missing;
	}

	/**
	 * Whether an edge takes the post INTO the publish region.
	 *
	 * The scope of the sequence's required-field gate, and the one definition
	 * of it. Two callers have to give the same answer —
	 * StatusManager::transition() refuses a move on it, and
	 * get_role_permitted_transitions() projects the same answer into `_locked` so
	 * the surfaces stop offering that move — and written out twice they would
	 * eventually disagree, which is a board that accepts a drop the server then
	 * rolls back.
	 *
	 * A sequence's `required` fields are declared once for the whole sequence,
	 * not per edge, so going live is the only deadline every one of them shares:
	 * see the gate in StatusManager::transition() for why that is where they are
	 * enforced.
	 *
	 * Stated over REGIONS rather than stages because the caller in StatusManager
	 * has already resolved both, through a try/catch that turns a region-less
	 * stage into a refusal instead of a 500; re-resolving them here would throw
	 * straight past it.
	 *
	 * A move with publish on both ends does not qualify: the post is already
	 * live, so there is no boundary left to defend. Nor does any move between
	 * two non-publish regions, in either direction.
	 *
	 * @param  string $from_region Region the post is leaving (one of EDITORIAL_STATUSES).
	 * @param  string $to_region   Region the post is entering (one of EDITORIAL_STATUSES).
	 * @return bool
	 */
	public static function crosses_into_publish( string $from_region, string $to_region ): bool {
		return 'publish' === $to_region && 'publish' !== $from_region;
	}

	/**
	 * Whether a stored metadata value counts as empty.
	 *
	 * The single answer to "has this field been filled in?", shared by
	 * everything that asks: the required-field gate in
	 * StatusManager::transition(), the `value`/`null` decision in
	 * MetadataController::get_metadata(), and — mirrored, since it cannot call
	 * PHP — the editor's MetadataRow. Two of those used to answer it
	 * separately and disagreed about whitespace, so an automation script could
	 * read a field back as filled that the workflow refused to move past.
	 *
	 * It lives on Sequence because the thing being judged is a sequence's
	 * metadata field config, not a post's meta row.
	 *
	 * Deliberately not `empty()`, which calls `0` and `'0'` blank: a `0` typed
	 * into a text field, and a `'0'` picked from a select, are answers the
	 * author gave. The test is per type instead, and every authorable type is
	 * covered (Sequences REST validation allows exactly these five):
	 *
	 * - `user`: registered as `integer` meta, where 0 is the canonical "no
	 *   user" sentinel — the value the editor's picker writes when it is
	 *   cleared, because an empty string fails the registered integer schema
	 *   before the sanitiser ever runs. Empty is therefore 0, and only 0.
	 * - `text`, `textarea`, `select`, `date`: registered as `string` meta.
	 *   Empty is the empty string, whitespace included — spaces are not an
	 *   answer. `'0'` is not empty.
	 *
	 * An unset meta key reads back as `''`, which both branches already call
	 * empty (`(int) '' === 0`).
	 *
	 * @param  string $type  Field type from the sequence config.
	 * @param  mixed  $value Stored meta value.
	 * @return bool
	 */
	public static function metadata_value_is_empty( string $type, $value ): bool {
		if ( 'user' === $type ) {
			return 0 === (int) $value;
		}

		return '' === trim( (string) $value );
	}

	/**
	 * Check if sequence is active.
	 *
	 * @return bool
	 */
	public function is_active(): bool {
		return 'active' === $this->status;
	}

	/**
	 * Check if this is a terminal status (workflow complete).
	 *
	 * @param  string $status_key Status key.
	 * @return bool
	 */
	public function is_terminal_status( string $status_key ): bool {
		$status = $this->get_status( $status_key );
		return ! empty( $status['is_terminal'] );
	}

	/**
	 * Get reviewer roles for this sequence.
	 *
	 * Reviewer roles can claim posts from the queue.
	 *
	 * @return array Array of role slugs. Defaults to ['editor', 'administrator'].
	 */
	public function get_reviewer_roles(): array {
		return $this->config['reviewer_roles'] ?? array( 'editor', 'administrator' );
	}

	/**
	 * Check if a user can claim posts in this workflow.
	 *
	 * @param  int $user_id User ID. Default current user.
	 * @return bool
	 */
	public function can_user_claim( int $user_id = 0 ): bool {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( ! $user_id ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		$reviewer_roles = $this->get_reviewer_roles();
		return ! empty( array_intersect( $user->roles, $reviewer_roles ) );
	}

	// =========================================================================
	// Status Helper Methods
	// =========================================================================

	/**
	 * Check if a status is a dead-end (the item terminates here).
	 *
	 * @param  string $status_key Status key.
	 * @return bool
	 */
	public function is_dead_end_status( string $status_key ): bool {
		$status = $this->get_status( $status_key );
		return ! empty( $status['is_dead_end'] );
	}

	/**
	 * Check if a status creates a post on entry.
	 *
	 * @param  string $status_key Status key.
	 * @return bool
	 */
	public function status_creates_post( string $status_key ): bool {
		$status = $this->get_status( $status_key );
		return ! empty( $status['creates_post'] );
	}

	/**
	 * Get statuses that create posts.
	 *
	 * @return array Array of status configs.
	 */
	public function get_post_creating_statuses(): array {
		return array_filter( $this->get_statuses(), fn( $s ) => ! empty( $s['creates_post'] ) );
	}

	/**
	 * Get dead-end statuses.
	 *
	 * @return array Array of status configs.
	 */
	public function get_dead_end_statuses(): array {
		return array_filter( $this->get_statuses(), fn( $s ) => ! empty( $s['is_dead_end'] ) );
	}

	/**
	 * Get active statuses (not dead-end).
	 *
	 * @return array Array of status configs.
	 */
	public function get_active_statuses(): array {
		return array_filter( $this->get_statuses(), fn( $s ) => empty( $s['is_dead_end'] ) );
	}

	// =========================================================================
	// Stage × Status Matrix
	// =========================================================================

	/**
	 * Get the status region a stage lives in.
	 *
	 * Every stage lives inside exactly one core editorial status region (its
	 * per-stage `status` config field, guaranteed present by the write gate).
	 *
	 * @param  string $stage_key Stage key.
	 * @return string One of EDITORIAL_STATUSES.
	 * @throws \InvalidArgumentException If the stage is undefined, or defined but missing its `status` region (data-integrity error).
	 */
	public function get_stage_status( string $stage_key ): string {
		$stage = $this->get_status( $stage_key );

		if ( null === $stage ) {
			throw new \InvalidArgumentException(
				sprintf( 'Unknown workflow stage "%s" in sequence "%s".', esc_html( $stage_key ), esc_html( $this->slug ) )
			);
		}

		return $this->require_stage_region( $stage );
	}

	/**
	 * Read a stage config's `status` region, failing loud when it is missing.
	 *
	 * The write gate (prepare_config_for_write) guarantees the field on every stage
	 * it writes, and the 2.17.0 schema migration replays stored configs through it
	 * so rows predating the rule are not left as latent fatals. A missing or
	 * non-string value therefore means the config reached the database around both
	 * paths — a data-integrity error, never silently defaulted at read time.
	 *
	 * @param  array $stage Stage config.
	 * @return string
	 * @throws \InvalidArgumentException If the stage has no valid `status` region.
	 */
	private function require_stage_region( array $stage ): string {
		$region = $stage['status'] ?? null;

		if ( ! is_string( $region ) || '' === $region ) {
			throw new \InvalidArgumentException(
				sprintf(
					'Stage "%s" in sequence "%s" has no status region — the config predates the write gate or was written around it.',
					esc_html( (string) ( $stage['key'] ?? '' ) ),
					esc_html( $this->slug )
				)
			);
		}

		return $region;
	}

	/**
	 * Stage keys whose config carries no `status` region, in config order.
	 *
	 * The read path (require_stage_region) throws on such a stage, by design: a
	 * region-less stage is a data-integrity error, and nothing silently defaults
	 * it. This is the non-throwing counterpart that lets a caller *detect* the
	 * condition without tripping it, so the Sequence editor can offer the
	 * explicit repair (see SequenceRepository::repair_stage_regions) instead of
	 * leaving the author with a fatal and no way out.
	 *
	 * Empty for every sequence written through prepare_config_for_write().
	 *
	 * @return string[] Stage keys missing a region.
	 */
	public function get_stages_missing_region(): array {
		if ( self::TYPE_PHASE === $this->type ) {
			// Phase sequences carry a `phases` graph, not stages with regions.
			return array();
		}

		return self::find_stages_missing_region( $this->get_statuses() );
	}

	/**
	 * Stage keys in a raw stage list whose config carries no `status` region.
	 *
	 * The config-level counterpart of get_stages_missing_region(), so a caller
	 * holding a *proposed* config — one that is not a stored row and therefore has
	 * no Sequence instance — can ask the same question. Both share this body so
	 * the two callers cannot drift into disagreeing about what "missing" means.
	 *
	 * @since 0.0.1
	 *
	 * @param  array $statuses Raw stage list from a sequence config.
	 * @return string[] Stage keys missing a region, in config order.
	 */
	public static function find_stages_missing_region( array $statuses ): array {
		$missing = array();

		foreach ( $statuses as $stage ) {
			if ( ! is_array( $stage ) ) {
				continue;
			}

			// Report only what the write gate can actually repair: no key, null,
			// or the empty string. A boolean/number/array region is malformed
			// config, not a missing one — prepare_config_for_write() rejects it,
			// so offering "Assign default status" for it would be a button that
			// can only ever 400.
			$region = $stage['status'] ?? null;
			if ( null === $region || '' === $region ) {
				$missing[] = (string) ( $stage['key'] ?? '' );
			}
		}

		return $missing;
	}

	/**
	 * Status regions that hold stages but designate no entry checkpoint.
	 *
	 * The second of the two stage × status invariants, and the non-throwing
	 * counterpart of get_region_entry_stage(), which throws on exactly this
	 * condition. get_stages_missing_region() does NOT cover it: a config whose
	 * stages all carry regions but whose regions carry no `region_entry` marker
	 * reports zero missing regions while every core-driven reseat into that region
	 * still fatals. Anything that reports what is wrong with a config has to ask
	 * both questions.
	 *
	 * @since 0.0.1
	 *
	 * @return string[] Region statuses with stages but no entry checkpoint.
	 */
	public function get_regions_missing_entry(): array {
		if ( self::TYPE_PHASE === $this->type ) {
			// Phase sequences carry a `phases` graph, not stages with regions.
			return array();
		}

		return self::find_regions_missing_entry( $this->get_statuses() );
	}

	/**
	 * Regions in a raw stage list that hold stages but designate no entry checkpoint.
	 *
	 * The config-level counterpart of get_regions_missing_entry(); see
	 * find_stages_missing_region() for why both forms exist.
	 *
	 * @since 0.0.1
	 *
	 * @param  array $statuses Raw stage list from a sequence config.
	 * @return string[] Region statuses with stages but no entry checkpoint.
	 */
	public static function find_regions_missing_entry( array $statuses ): array {
		$has_stages = array();
		$has_entry  = array();

		foreach ( $statuses as $stage ) {
			if ( ! is_array( $stage ) ) {
				continue;
			}

			$region = $stage['status'] ?? null;

			// A stage with no usable region belongs to the other invariant; it has
			// no region to hold a checkpoint, so counting it here would report a
			// phantom region keyed on null.
			if ( ! is_string( $region ) || '' === $region ) {
				continue;
			}

			$has_stages[ $region ] = true;

			if ( ! empty( $stage['region_entry'] ) ) {
				$has_entry[ $region ] = true;
			}
		}

		return array_values( array_diff( array_keys( $has_stages ), array_keys( $has_entry ) ) );
	}

	/**
	 * Get the entry stage (checkpoint) of a status region.
	 *
	 * Where a post lands when something OUTSIDE the workflow puts it in this
	 * region: core driving a status change across a region boundary (Publish
	 * button, quick edit, REST, CLI, cron, untrash), which re-seats the post at
	 * this stage, or a sequence assigned to a post that already has a status.
	 * That is its whole job — it is NOT a door transitions have to use. A
	 * workflow transition may target any stage in any region; prepare_config_for_write()
	 * does not constrain where a crossing lands (see its docblock).
	 *
	 * Exactly one entry per used region is established in exactly two places, and
	 * nowhere else: prepare_config_for_write() on every write, and the 2.17.0
	 * schema migration, which replays already-stored configs through that same
	 * gate. The migration exists because the gate is write-time only — rows
	 * persisted before the checkpoint rule landed carried no marker, and no read
	 * ever supplied one, so every such row was a latent fatal. A throw from here
	 * now means a config reached the database around both paths.
	 *
	 * @param  string $status Region status (one of EDITORIAL_STATUSES).
	 * @return string|null Entry stage key, or null if the sequence doesn't use that region.
	 * @throws \InvalidArgumentException If the region is used but no stage is marked as its entry — a data-integrity error, never defaulted at read time.
	 */
	public function get_region_entry_stage( string $status ): ?string {
		$stages = $this->get_stages_in_region( $status );

		if ( empty( $stages ) ) {
			return null;
		}

		foreach ( $stages as $stage ) {
			if ( ! empty( $stage['region_entry'] ) ) {
				return $stage['key'];
			}
		}

		throw new \InvalidArgumentException(
			sprintf( 'Region "%s" in sequence "%s" has stages but no entry checkpoint.', esc_html( $status ), esc_html( $this->slug ) )
		);
	}

	/**
	 * Get the stage configs living in a status region.
	 *
	 * @param  string $status Region status (one of EDITORIAL_STATUSES).
	 * @return array Stage configs, in sequence order. Empty if the region is unused.
	 */
	public function get_stages_in_region( string $status ): array {
		return array_values(
			array_filter(
				$this->get_statuses(),
				fn( $stage ) => $this->require_stage_region( $stage ) === $status
			)
		);
	}

	/**
	 * Whether a transition between two stages crosses a region boundary.
	 *
	 * A boundary crossing is the only kind of stage move that writes post_status;
	 * same-region moves never touch it. A crossing always lands on the target
	 * region's checkpoint — the write gate refuses to store one that doesn't — so
	 * this answers "does this move write a status", never "where does it land".
	 *
	 * @param  string $from_stage Source stage key.
	 * @param  string $to_stage   Target stage key.
	 * @return bool
	 * @throws \InvalidArgumentException If either stage is undefined or missing its region.
	 */
	public function is_region_crossing( string $from_stage, string $to_stage ): bool {
		return $this->get_stage_status( $from_stage ) !== $this->get_stage_status( $to_stage );
	}

	/**
	 * Get the keys of active stages — those that are neither dead-end nor terminal.
	 *
	 * Used for "all active workflow stages" query semantics (e.g. get-stale-posts),
	 * which core post statuses can no longer express once stage is decoupled from
	 * post_status.
	 *
	 * @return string[]
	 */
	public function get_active_stage_keys(): array {
		$active = array_filter(
			$this->get_statuses(),
			fn( $s ) => empty( $s['is_dead_end'] ) && empty( $s['is_terminal'] )
		);

		return array_values( array_map( fn( $s ) => $s['key'], $active ) );
	}

	/**
	 * Validate and normalize a sequence config at write time.
	 *
	 * This is the single write-time integrity gate — EVERY write path
	 * (create/update, import, seeder) flows through it via
	 * SequenceRepository::create()/update(), and callers must persist the
	 * returned (normalized) config.
	 *
	 * Because it is write-time only, a rule added here does NOT reach rows already
	 * in the database, and the read path has no fallback to cover them — so adding
	 * a rule means adding a schema migration that replays stored configs through
	 * this gate (see the 2.17.0 entry in Schema::get_migrations(), which exists
	 * because the region and checkpoint rules below shipped without one and turned
	 * every older row into a latent fatal). Normalization here must stay pure, so
	 * replaying an already-normalized config is a no-op.
	 *
	 * It enforces, for stage-based sequences:
	 *
	 * - At least one stage. An empty pipeline cannot hold posts.
	 * - Stage keys and transition targets are sanitize_key-normalized here, in
	 *   the shared gate, so no write path (import included) can bypass
	 *   normalization.
	 * - Unique, non-empty stage keys, because posts store stage identity as
	 *   sequence ID plus stage key; a duplicate key makes identity ambiguous.
	 * - Every stage carries a `status` region from EDITORIAL_STATUSES. A missing
	 *   value defaults to 'draft' — write-time normalization, never a read-time
	 *   fallback; an invalid value throws.
	 * - Every used region has exactly one `region_entry: true` checkpoint. None
	 *   marked → the first stage (array order) in the region is auto-assigned;
	 *   more than one → throws.
	 * - Every transition target references a defined stage. A dangling target (a
	 *   typo, or a core status like `future` that is not a workflow stage) would
	 *   let is_transition_allowed() pass while get_stage_status() has nothing to
	 *   resolve.
	 * - A stage holds at most one transition per target. Two disagree about which
	 *   copy governs, and the loosest one wins the permission check — see the note
	 *   at the check itself in normalize_stages(). Rejected on write;
	 *   collapse_duplicate_transitions() collapses it, and reports it, on stored
	 *   rows written before the rule.
	 *
	 * What it does NOT constrain is where a transition may point: any stage may
	 * target any other, in any region. `region_entry` marks where a post is seated
	 * when something OUTSIDE the workflow puts it in a region — a core-driven
	 * status change or a sequence assignment — not the only door in. A crossing
	 * transition still writes the target region's status through core and still
	 * defers to StatusManager::current_user_can_cross_region(); only the constraint
	 * on where such an edge may land is absent.
	 *
	 * Phase sequences use a `phases` graph rather than `statuses` and are exempt
	 * from the stage rules above. The exemption is keyed on the sequence TYPE, not
	 * the presence of a `phases` key — otherwise a workflow config could smuggle in a
	 * stray `phases` key to skip validation of an invalid `statuses` graph.
	 *
	 * @param  array  $config Sequence config array.
	 * @param  string $type   Sequence type (workflow/pitch/phase).
	 * @return array The normalized config to persist.
	 * @throws \InvalidArgumentException If the config has no stages, an empty or duplicate stage key, an invalid stage status region, more than one region entry per region, or a transition to an undefined stage.
	 */
	public static function prepare_config_for_write( array $config, string $type = self::TYPE_WORKFLOW ): array {
		// Phase sequences carry a `phases` graph, not `statuses`; the stage rules
		// below don't apply to them.
		if ( self::TYPE_PHASE === $type ) {
			return $config;
		}

		return self::normalize_stages( $config );
	}

	/**
	 * Everything the write gate normalizes and rejects.
	 *
	 * Kept separate from prepare_config_for_write() because it takes a repair mode
	 * the write gate never uses, and collapse_duplicate_transitions() reaches it
	 * directly to get that mode. Both go through this one function, so neither can
	 * drift from the other's idea of what a normalized config is.
	 *
	 * The repair mode exists because a stored row can carry a
	 * shape the gate now rejects but the gate that wrote it allowed — a second
	 * transition to a target the stage already reaches — and a repair that ran this
	 * in write mode would throw on exactly the rows it exists to rescue, before
	 * repairing anything. In repair mode that one rejection becomes a collapse: the
	 * first transition to a target (config order) is kept, every later one is
	 * removed and reported to the caller, and the shape the write gate refuses is
	 * still never produced. Everything else it rejects has no inferable answer and
	 * throws in either mode.
	 *
	 * @param  array $config    Sequence config array (workflow/pitch type).
	 * @param  bool  $repair    Collapse a duplicate transition target instead of
	 *                          throwing on it. Write paths leave this off.
	 * @param  array $collapsed Out-param, repair mode only: one `{from, to}` record
	 *                          per transition removed by the collapse, in config
	 *                          order, so a caller can put it straight into its
	 *                          `dropped` list. The target is named because the
	 *                          surviving transition still reaches it — the collapse
	 *                          removes a second way there, never a destination.
	 * @return array The normalized config.
	 * @throws \InvalidArgumentException If the config has no stages, an empty or duplicate stage key, an invalid stage status region, more than one region entry per region, a transition to an undefined stage, or — outside repair mode — more than one transition to the same target.
	 */
	private static function normalize_stages( array $config, bool $repair = false, array &$collapsed = array() ): array {
		$statuses = $config['statuses'] ?? array();

		if ( empty( $statuses ) || ! is_array( $statuses ) ) {
			throw new \InvalidArgumentException( 'A workflow sequence must define at least one stage.' );
		}

		$normalized = array();

		// Duplicates the repair mode collapsed. Held here and handed to the
		// out-param only once every check below has passed, so a config that turns
		// out to be unrepairable leaves the caller's report untouched rather than
		// half-written.
		$collapsed_pairs = array();

		foreach ( array_values( $statuses ) as $stage ) {
			if ( ! is_array( $stage ) ) {
				throw new \InvalidArgumentException( 'Every sequence stage must be an object.' );
			}

			// Key normalization lives HERE, in the shared gate, so the import path
			// cannot bypass it (it used to, by skipping build_config()).
			$key = sanitize_key( (string) ( $stage['key'] ?? '' ) );
			if ( '' === $key ) {
				throw new \InvalidArgumentException( 'Every sequence stage must have a non-empty key.' );
			}
			$stage['key'] = $key;

			// Region: an absent value normalizes to 'draft' at write time (where
			// WordPress puts new posts); anything else must be a core editorial
			// status. "Absent" must cover exactly what
			// Sequence::get_stages_missing_region() reports as missing — no key,
			// null, or the empty string — because the repair that detector offers
			// ("Assign default status") replays the stored config through this
			// gate. Anything the detector does NOT report (a boolean, a number, a
			// non-editorial string) is malformed config, not a missing region, and
			// is still rejected below.
			if ( ! array_key_exists( 'status', $stage ) || null === $stage['status'] || '' === $stage['status'] ) {
				$stage['status'] = 'draft';
			}
			if ( ! is_string( $stage['status'] ) || ! in_array( $stage['status'], self::EDITORIAL_STATUSES, true ) ) {
				throw new \InvalidArgumentException(
					sprintf(
						'Stage "%s" has an invalid status region; valid regions are: %s.',
						esc_html( $key ),
						esc_html( implode( ', ', self::EDITORIAL_STATUSES ) )
					)
				);
			}

			// Checkpoint marker: booleans only. The import path carries nested JSON
			// the REST schema's boolean type never sees, and truthiness would coerce
			// the string "false" to true — so any non-boolean (other than a JSON
			// null, treated as absent) is rejected, never coerced. Persisted only
			// when true.
			if ( array_key_exists( 'region_entry', $stage ) && null !== $stage['region_entry'] && ! is_bool( $stage['region_entry'] ) ) {
				throw new \InvalidArgumentException(
					sprintf( 'Stage "%s" region_entry must be a boolean.', esc_html( $key ) )
				);
			}
			if ( empty( $stage['region_entry'] ) ) {
				unset( $stage['region_entry'] );
			} else {
				$stage['region_entry'] = true;
			}

			// Transitions, when present, must be an array of transition objects,
			// each naming a target stage as a string. Anything else (a bare string,
			// a string entry, a non-string `to`) would slip past the dangling-target
			// check below — foreach over a non-array skips silently — and persist a
			// shape that fatals later in get_transitions_for_user(). Malformed
			// config is an error, not something to skip. A JSON null is treated as
			// absent.
			if ( array_key_exists( 'transitions', $stage ) && null !== $stage['transitions'] ) {
				if ( ! is_array( $stage['transitions'] ) ) {
					throw new \InvalidArgumentException(
						sprintf( 'Stage "%s" transitions must be an array of transition objects.', esc_html( $key ) )
					);
				}
				$targets           = array();
				$duplicate_targets = array();
				foreach ( $stage['transitions'] as $index => &$transition ) {
					if ( ! is_array( $transition ) || ! isset( $transition['to'] ) || ! is_string( $transition['to'] ) ) {
						throw new \InvalidArgumentException(
							sprintf( 'Every transition on stage "%s" must be an object with a string "to" target.', esc_html( $key ) )
						);
					}
					// Targets get the same normalization as stage keys, so the
					// dangling-target check below compares like with like. It also
					// decides what counts as a duplicate: `Live` and `live` are one
					// target once sanitized, so the check has to sit after this
					// line, and so does the collapse that repairs it.
					$transition['to'] = sanitize_key( $transition['to'] );

					$transition = self::normalize_transition_inputs( $transition, $key );

					// One transition per target, per stage. A duplicate is not a
					// harmless extra row: every runtime read of a transition
					// resolves by target and they disagree about which copy wins —
					// get_transition() takes the first (so it decides required
					// tools and assignment), can_user_transition() is true if ANY
					// copy allows the user, and get_role_permitted_transitions()
					// walks past a copy that fails the role check to a later one.
					// The loosest copy therefore governs permission while the
					// first governs requirements, which is a silent privilege
					// widening no author asked for.
					//
					// So no write path may store it — but rows already carry it,
					// because the gate that wrote them tolerated the shape, and a
					// rule added to the gate must never leave a stored row
					// permanently unmigratable. In repair mode the duplicate is
					// collapsed onto the first transition to that target (config
					// order) and reported to the caller. Either way the shape does
					// not survive this gate.
					if ( isset( $targets[ $transition['to'] ] ) ) {
						if ( ! $repair ) {
							throw new \InvalidArgumentException(
								sprintf(
									'Stage "%1$s" has more than one transition to "%2$s"; a stage may hold at most one transition per target.',
									esc_html( $key ),
									esc_html( $transition['to'] )
								)
							);
						}

						$duplicate_targets[ $index ] = $transition['to'];
						continue;
					}
					$targets[ $transition['to'] ] = true;
				}
				unset( $transition );

				foreach ( $duplicate_targets as $index => $target ) {
					unset( $stage['transitions'][ $index ] );

					$collapsed_pairs[] = array(
						'from' => $key,
						'to'   => $target,
					);
				}

				if ( ! empty( $duplicate_targets ) ) {
					// Re-indexed only where something was actually removed, so a
					// config the collapse did not touch re-encodes byte-identically
					// and the migration's no-op check still sees a no-op.
					$stage['transitions'] = array_values( $stage['transitions'] );
				}
			}

			$normalized[] = $stage;
		}

		$stage_keys = array_map( fn( $s ) => $s['key'], $normalized );
		$duplicates = array_filter( array_count_values( $stage_keys ), fn( $count ) => $count > 1 );

		if ( ! empty( $duplicates ) ) {
			throw new \InvalidArgumentException(
				sprintf( 'Sequence stage keys must be unique; duplicate key "%s".', esc_html( (string) array_key_first( $duplicates ) ) )
			);
		}

		// Every used region designates exactly one entry checkpoint: more than one
		// is ambiguous; none auto-assigns the first stage (array order) in the region.
		$region_entries      = array();
		$region_first_stage  = array();
		foreach ( $normalized as $index => $stage ) {
			$region = $stage['status'];
			if ( ! isset( $region_first_stage[ $region ] ) ) {
				$region_first_stage[ $region ] = $index;
			}
			if ( ! empty( $stage['region_entry'] ) ) {
				$region_entries[ $region ] = ( $region_entries[ $region ] ?? 0 ) + 1;
			}
		}
		foreach ( $region_first_stage as $region => $first_index ) {
			$entries = $region_entries[ $region ] ?? 0;
			if ( $entries > 1 ) {
				throw new \InvalidArgumentException(
					sprintf( 'Region "%s" may designate only one entry stage; found %d.', esc_html( (string) $region ), (int) $entries )
				);
			}
			if ( 0 === $entries ) {
				$normalized[ $first_index ]['region_entry'] = true;
			}
		}

		// Every transition must target a stage defined in this same sequence.
		$defined = array_flip( $stage_keys );
		foreach ( $normalized as $stage ) {
			foreach ( $stage['transitions'] ?? array() as $transition ) {
				$to = is_array( $transition ) ? (string) ( $transition['to'] ?? '' ) : '';
				if ( ! isset( $defined[ $to ] ) ) {
					throw new \InvalidArgumentException(
						sprintf( 'Transition target "%s" is not a defined stage.', esc_html( $to ) )
					);
				}
			}
		}

		// Repair mode only: every check has passed, so the collapse is final and the
		// caller can be told what it removed. Assigned rather than appended, so the
		// out-param is this call's report and nothing else — a caller that reuses
		// one array across sequences cannot end up reporting an earlier row's
		// removals against a later one.
		if ( $repair ) {
			$collapsed = $collapsed_pairs;
		}

		$config['statuses'] = $normalized;

		return $config;
	}

	/**
	 * Put every transition's capture inputs into the current shape, and nothing else.
	 *
	 * The write gate does this as part of normalizing a config, which is enough for
	 * every path that writes one. Import is the exception: it validates assignment
	 * slot keys and mints fresh ones on the raw JSON it was handed, BEFORE the gate
	 * sees it — and that JSON was exported by whatever version the author was
	 * running. Reading the old shape at those two call sites would put an
	 * era-check into code that has no business knowing there was an era; so the
	 * import converts once, at its boundary, and everything downstream sees only
	 * `inputs`.
	 *
	 * Deliberately narrow. It is not a second write gate — it does not touch stage
	 * keys, regions, checkpoints or targets, and a config that passes through it
	 * still has to satisfy prepare_config_for_write() in full.
	 *
	 * @param  array $config Sequence config array.
	 * @return array The config, with every transition carrying `inputs` or no input key.
	 * @throws \InvalidArgumentException If a transition's inputs cannot be normalized.
	 */
	public static function normalize_input_shape( array $config ): array {
		if ( empty( $config['statuses'] ) || ! is_array( $config['statuses'] ) ) {
			return $config;
		}

		foreach ( $config['statuses'] as $status_index => $status ) {
			if ( ! is_array( $status ) || empty( $status['transitions'] ) || ! is_array( $status['transitions'] ) ) {
				continue;
			}

			$stage_key = sanitize_key( (string) ( $status['key'] ?? '' ) );

			foreach ( $status['transitions'] as $transition_index => $transition ) {
				if ( ! is_array( $transition ) ) {
					continue;
				}

				$config['statuses'][ $status_index ]['transitions'][ $transition_index ] =
					self::normalize_transition_inputs( $transition, $stage_key );
			}
		}

		return $config;
	}

	/**
	 * A transition's capture inputs, in the one shape every reader walks.
	 *
	 * A transition captures a list of inputs. It used to capture exactly one, held
	 * in a singular `input` object whose `none` type meant "captures nothing", so
	 * every row stored before this carries that shape. It is converted here, in the
	 * write gate, rather than tolerated at read time: `AssignmentManager` and
	 * `StatusManager` get one shape to walk and never have to ask which era a
	 * config came from.
	 *
	 * `none` becomes the empty list — the absence of an input is no inputs, not an
	 * input that captures nothing — and a real one becomes a one-element list. An
	 * empty list is then dropped entirely, so a transition that captures nothing
	 * says nothing, matching how `region_entry` is persisted.
	 *
	 * A config carrying BOTH keys is refused. It cannot come from any write path
	 * this plugin owns, only from hand-written import JSON, and the two disagree
	 * about what the transition captures — there is no answer to infer.
	 *
	 * At most one input may be an assignment. Notes are unbounded, but a
	 * transition's assignment is the slot `requires_assignment` gates on and the
	 * one `AssignmentManager` fills, so a second names no distinguishable slot.
	 * Collapsing it would discard an assignment an author configured, so it is
	 * refused on write instead.
	 *
	 * @param  array  $transition A transition, with `to` already sanitized.
	 * @param  string $stage_key  The stage holding it, for error messages.
	 * @return array The transition, carrying `inputs` or no input key at all.
	 * @throws \InvalidArgumentException If the transition carries both input keys, if `inputs` is not a list of objects, or if more than one input is an assignment.
	 */
	private static function normalize_transition_inputs( array $transition, string $stage_key ): array {
		// A JSON null reads as absent here, the same way `transitions` and
		// `region_entry` are read above.
		$has_legacy = array_key_exists( 'input', $transition ) && null !== $transition['input'];
		$has_list   = array_key_exists( 'inputs', $transition ) && null !== $transition['inputs'];

		if ( $has_legacy && $has_list ) {
			throw new \InvalidArgumentException(
				sprintf(
					'A transition on stage "%s" declares both "input" and "inputs"; it may declare only the list.',
					esc_html( $stage_key )
				)
			);
		}

		if ( $has_legacy ) {
			$legacy = $transition['input'];

			if ( ! is_array( $legacy ) ) {
				throw new \InvalidArgumentException(
					sprintf( 'A transition on stage "%s" has an "input" that is not an object.', esc_html( $stage_key ) )
				);
			}

			// The retired sentinel: a transition that captured nothing said so with
			// a typed input rather than by having none.
			$transition['inputs'] = 'none' === ( $legacy['type'] ?? 'none' ) ? array() : array( $legacy );
		}

		unset( $transition['input'] );

		if ( ! $has_legacy && ! $has_list ) {
			// Nothing to normalize, and nothing to add: a transition that captures
			// nothing carries no input key. Returning here is what keeps the gate a
			// byte-for-byte no-op on the configs that already say nothing.
			unset( $transition['inputs'] );
			return $transition;
		}

		if ( ! is_array( $transition['inputs'] ) ) {
			throw new \InvalidArgumentException(
				sprintf( 'A transition on stage "%s" must declare "inputs" as an array of input objects.', esc_html( $stage_key ) )
			);
		}

		$inputs      = array_values( $transition['inputs'] );
		$assignments = 0;

		foreach ( $inputs as $input ) {
			if ( ! is_array( $input ) ) {
				throw new \InvalidArgumentException(
					sprintf( 'Every capture input on stage "%s" must be an object.', esc_html( $stage_key ) )
				);
			}

			if ( 'assignment' === ( $input['type'] ?? '' ) ) {
				++$assignments;
			}
		}

		if ( $assignments > 1 ) {
			throw new \InvalidArgumentException(
				sprintf(
					'A transition on stage "%1$s" declares %2$d assignment inputs; a transition may declare at most one.',
					esc_html( $stage_key ),
					(int) $assignments
				)
			);
		}

		if ( empty( $inputs ) ) {
			unset( $transition['inputs'] );
			return $transition;
		}

		// Assigned rather than unset-and-re-added, so a config that was already in
		// this shape re-encodes with its keys in the same order and the migration's
		// no-op check still sees a no-op.
		$transition['inputs'] = $inputs;

		return $transition;
	}

	/**
	 * Collapse a stage's duplicate transitions to one per target, and report what
	 * that removed.
	 *
	 * The one-transition-per-target rule was added to the write gate after rows
	 * were already in the database, so every path that replays a stored config
	 * through the gate — the 2.19.0 migration and
	 * SequenceRepository::repair_stage_regions() — would otherwise throw on
	 * exactly the rows it exists to fix. This runs normalize_stages() in repair
	 * mode instead: the first transition to a target (config order) is kept, every
	 * later one is removed, and each removal is named in `dropped` rather than
	 * disappearing quietly, because the loser takes its roles, required tools and
	 * notifications with it. Sanitization is what decides a duplicate, so `Live`
	 * and `live` are one target and collapse together.
	 *
	 * A collapse never strands an agent route or a caller's idea of where a stage
	 * can go: the transition that survives reaches the same target the removed one
	 * did, so every destination the stage had before it, it still has after.
	 *
	 * Everything else the gate rejects — duplicate stage keys, a dangling target,
	 * two checkpoints in one region — has no inferable answer and still throws,
	 * from normalize_stages(), for a human to resolve in the editor.
	 *
	 * @param  array  $config Stored sequence config.
	 * @param  string $type   Sequence type (workflow/pitch/phase).
	 * @return array{config: array, dropped: array<int, array{from: string, to: string}>}
	 *               `dropped` names each removed transition by the stage that held
	 *               it and the target it duplicated.
	 * @throws \InvalidArgumentException If the config is malformed in a way no collapse can repair.
	 */
	public static function collapse_duplicate_transitions( array $config, string $type = self::TYPE_WORKFLOW ): array {
		if ( self::TYPE_PHASE === $type ) {
			return array(
				'config'  => $config,
				'dropped' => array(),
			);
		}

		$dropped = array();
		$config  = self::normalize_stages( $config, true, $dropped );

		return array(
			'config'  => $config,
			'dropped' => $dropped,
		);
	}
}
