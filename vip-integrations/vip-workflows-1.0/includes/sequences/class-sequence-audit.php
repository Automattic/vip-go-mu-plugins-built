<?php
/**
 * Sequence audit rows.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Sequences;

use VIPWorkflows\Plugin;

/**
 * Writes the audit row for each sequence change, and works out what an update
 * changed.
 *
 * SequencesController calls this after every successful write: create, import,
 * update, region repair, activation, deactivation and delete. It also records
 * each served export, which changes nothing but takes a copy of the sequence.
 * The sequence editor, REST clients and the sequence abilities all reach the
 * controller, so each change is recorded once, whichever path made it. Writes that call
 * SequenceRepository directly (installers, CLI seeders, the schema upgrade's
 * replay) are not recorded.
 */
final class SequenceAudit {

	/**
	 * The create-sequence ability id.
	 *
	 * The four sequence write ability ids are spelled here, not in the ability
	 * files: those load on `wp_abilities_api_init`, which may not have fired
	 * when the controller checks an id against ABILITY_IDS.
	 */
	public const CREATE_ABILITY_ID = 'vip-workflows/create-sequence';

	/**
	 * The import-sequence ability id.
	 */
	public const IMPORT_ABILITY_ID = 'vip-workflows/import-sequence';

	/**
	 * The update-sequence ability id.
	 */
	public const UPDATE_ABILITY_ID = 'vip-workflows/update-sequence';

	/**
	 * The activate-sequence ability id.
	 */
	public const ACTIVATE_ABILITY_ID = 'vip-workflows/activate-sequence';

	/**
	 * The sequence abilities that call SequencesController.
	 *
	 * The controller accepts an ability id from its request attribute only when
	 * it is one of these.
	 *
	 * @var string[]
	 */
	public const ABILITY_IDS = array(
		self::CREATE_ABILITY_ID,
		self::IMPORT_ABILITY_ID,
		self::UPDATE_ABILITY_ID,
		self::ACTIVATE_ABILITY_ID,
	);

	/**
	 * The request attribute an ability sets to say it made the call.
	 *
	 * An attribute rather than a parameter: a request dispatched over HTTP has
	 * its attributes replaced by the matched route handler, so a client cannot
	 * claim to be an ability.
	 */
	public const REQUEST_ATTRIBUTE = 'vip_workflows_ability';

	/**
	 * The most entries any one list in a change summary holds.
	 */
	public const LIST_CAP = 50;

	/**
	 * Record one sequence audit row.
	 *
	 * A sequence change has no post, so it can't go through
	 * StatusManager::log_workflow_event(), which is post-scoped by signature. It
	 * goes through the EventBus instead, which is already post-optional
	 * (`workflow_events.post_id` is a nullable column) and already lets a caller
	 * declare `actor_type`. No sentinel post id, and no second audit surface.
	 *
	 * A change made by an ability reuses the existing agent scheme:
	 * `actor_type = 'agent'` plus the ability id in `event_data.agent_actor`,
	 * which is what Actor::name_for() and AuditLogController::enrich_event()
	 * already read. `actor_id` still carries the authenticated user, so the row
	 * records both the ability that made the change and the account that
	 * authorized it. Every other change is recorded as the user.
	 *
	 * @param string      $event_type Event type slug, e.g. 'sequence.updated'.
	 * @param Sequence    $sequence   The sequence as it stands after the change
	 *                                (before it, for a delete).
	 * @param array       $extra      Payload specific to the event type.
	 * @param string|null $ability_id Acting ability id, or null for the editor and REST.
	 * @return void
	 */
	public static function record( string $event_type, Sequence $sequence, array $extra = array(), ?string $ability_id = null ): void {
		$event_data = array_merge(
			array(
				'sequence_id'   => $sequence->id,
				'sequence_name' => $sequence->name,
				'sequence_slug' => $sequence->slug,
				'sequence_type' => $sequence->type,
				'via'           => null === $ability_id ? 'rest' : 'ability',
			),
			$extra
		);

		if ( null !== $ability_id ) {
			$event_data['agent_actor'] = $ability_id;
		}

		Plugin::get_instance()->get_event_bus()->emit(
			$event_type,
			$event_data,
			array(
				'post_id'    => null,
				'actor_id'   => get_current_user_id(),
				'actor_type' => null === $ability_id ? 'user' : 'agent',
			)
		);
	}

	/**
	 * The number of stages a sequence holds: its statuses, or its phases.
	 *
	 * @param Sequence $sequence Sequence.
	 * @return int
	 */
	public static function stage_count( Sequence $sequence ): int {
		return count( self::stages( $sequence ) );
	}

	/**
	 * What an update changed, as a bounded, directional summary.
	 *
	 * Compares the raw stored configs, never the Sequence region accessors: a row
	 * stored before the region gate may have stages with no `status`, and those
	 * accessors throw on it. A missing region diffs as null.
	 *
	 * Labels (stage, role, tool) are copied as they are now, with their keys
	 * alongside, so a later rename never rewrites the row. Name, description,
	 * post types, settings and metadata fields are named in `fields_changed`
	 * without their values. A stage change no list itemizes (start stage, region
	 * checkpoint, a flag, order, a transition label, an assignment input, an
	 * agent's settings) is named as `stages` in `fields_changed`, so no change
	 * goes unrecorded, including in a save that also changed something a list
	 * names. Each change is counted once: in a list, or in `stages`.
	 *
	 * @param Sequence $before              The sequence before the write.
	 * @param Sequence $after               The sequence after the write.
	 * @param array    $dropped_transitions Transitions a region repair removed as
	 *                                      duplicates, each `{from, to}`. The diff
	 *                                      can't see them, since a duplicate shares
	 *                                      its `(from, to)` with the one kept.
	 * @return array Empty when nothing changed.
	 */
	public static function change_summary( Sequence $before, Sequence $after, array $dropped_transitions = array() ): array {
		$summary = array();
		$fields  = array();

		if ( $before->name !== $after->name ) {
			$fields[]                 = 'name';
			$summary['previous_name'] = $before->name;
		}

		if ( (string) $before->description !== (string) $after->description ) {
			$fields[] = 'description';
		}

		foreach ( array( 'post_types', 'settings', 'metadata_fields' ) as $key ) {
			if ( ( $before->config[ $key ] ?? array() ) !== ( $after->config[ $key ] ?? array() ) ) {
				$fields[] = $key;
			}
		}

		$before_stages = self::stages_by_key( $before );
		$after_stages  = self::stages_by_key( $after );
		$is_phase      = Sequence::TYPE_PHASE === $after->type;

		$lists = array(
			'stages_added'        => array(),
			'stages_removed'      => array(),
			'stages_renamed'      => array(),
			'regions_changed'     => array(),
			'agents_changed'      => array(),
			'transitions_added'   => array(),
			'transitions_removed' => array(),
			'transitions_changed' => array(),
		);

		// PHP turns a numeric string key such as "123" into an integer array key,
		// so each key is read back as the string it was stored as.
		foreach ( $after_stages as $key => $stage ) {
			$key = (string) $key;
			if ( ! isset( $before_stages[ $key ] ) ) {
				$lists['stages_added'][] = array(
					'key'   => $key,
					'label' => self::stage_label( $stage, $key ),
				);
			}
		}

		foreach ( $before_stages as $key => $stage ) {
			$key = (string) $key;
			if ( ! isset( $after_stages[ $key ] ) ) {
				$lists['stages_removed'][] = array(
					'key'   => $key,
					'label' => self::stage_label( $stage, $key ),
				);
				continue;
			}

			$now  = $after_stages[ $key ];
			$from = self::stage_label( $stage, $key );
			$to   = self::stage_label( $now, $key );

			if ( $from !== $to ) {
				$lists['stages_renamed'][] = array(
					'key'  => $key,
					'from' => $from,
					'to'   => $to,
				);
			}

			if ( $is_phase ) {
				continue;
			}

			$region_from = isset( $stage['status'] ) && is_string( $stage['status'] ) ? $stage['status'] : null;
			$region_to   = isset( $now['status'] ) && is_string( $now['status'] ) ? $now['status'] : null;

			if ( $region_from !== $region_to ) {
				$lists['regions_changed'][] = array(
					'key'   => $key,
					'label' => $to,
					'from'  => $region_from,
					'to'    => $region_to,
				);
			}

			$agent_change = self::agent_change( $stage['agent'] ?? null, $now['agent'] ?? null );
			if ( null !== $agent_change ) {
				$lists['agents_changed'][] = array_merge(
					array(
						'key'   => $key,
						'label' => $to,
					),
					$agent_change
				);
			}
		}

		// An agent on an added or removed stage goes with the stage, so it is
		// covered by stages_added and stages_removed.

		$labels             = self::stage_labels( $after_stages ) + self::stage_labels( $before_stages );
		$before_transitions = self::transitions_by_pair( $before_stages );
		$after_transitions  = self::transitions_by_pair( $after_stages );

		foreach ( $after_transitions as $pair => $transition ) {
			if ( ! isset( $before_transitions[ $pair ] ) ) {
				$lists['transitions_added'][] = self::transition_ref( $transition, $labels );
				continue;
			}

			$was   = $before_transitions[ $pair ];
			$roles = self::list_diff( $was['allowed_roles'], $transition['allowed_roles'] );
			$tools = self::list_diff( $was['required_tools'], $transition['required_tools'] );

			if ( $roles['added'] || $roles['removed'] || $tools['added'] || $tools['removed'] ) {
				$lists['transitions_changed'][] = array_merge(
					self::transition_ref( $transition, $labels ),
					array(
						'roles_added'   => array_map( array( self::class, 'role_ref' ), $roles['added'] ),
						'roles_removed' => array_map( array( self::class, 'role_ref' ), $roles['removed'] ),
						'tools_added'   => array_map( array( self::class, 'tool_ref' ), $tools['added'] ),
						'tools_removed' => array_map( array( self::class, 'tool_ref' ), $tools['removed'] ),
					)
				);
			}
		}

		foreach ( $before_transitions as $pair => $transition ) {
			if ( ! isset( $after_transitions[ $pair ] ) ) {
				$lists['transitions_removed'][] = self::transition_ref( $transition, $labels );
			}
		}

		foreach ( $dropped_transitions as $dropped ) {
			$lists['transitions_removed'][] = self::transition_ref(
				array(
					'from' => self::text( $dropped['from'] ?? '' ),
					'to'   => self::text( $dropped['to'] ?? '' ),
				),
				$labels
			);
		}

		// Whatever the lists name is left out of this comparison, so a change
		// they named isn't counted twice, and one they didn't is still counted
		// when they named something else in the same save.
		$unitemized_before = self::unitemized( $before, $before_stages, $after_stages, $is_phase, $dropped_transitions );
		$unitemized_after  = self::unitemized( $after, $after_stages, $before_stages, $is_phase );

		if ( $unitemized_before !== $unitemized_after ) {
			$fields[] = 'stages';
		}

		$truncated = array();
		foreach ( $lists as $name => $list ) {
			if ( empty( $list ) ) {
				continue;
			}

			if ( count( $list ) > self::LIST_CAP ) {
				$truncated[ $name ] = count( $list ) - self::LIST_CAP;
				$list               = array_slice( $list, 0, self::LIST_CAP );
			}

			$summary[ $name ] = $list;
		}

		if ( $fields ) {
			$summary = array( 'fields_changed' => $fields ) + $summary;
		}

		if ( $truncated ) {
			$summary['truncated'] = $truncated;
		}

		return $summary;
	}

	/**
	 * The raw stage list: statuses for a workflow, phases for a phase sequence.
	 *
	 * @param Sequence $sequence Sequence.
	 * @return array
	 */
	private static function stages( Sequence $sequence ): array {
		$key    = Sequence::TYPE_PHASE === $sequence->type ? 'phases' : 'statuses';
		$stages = $sequence->config[ $key ] ?? array();

		return is_array( $stages ) ? $stages : array();
	}

	/**
	 * The stages keyed by stage key. The first stage with a key wins.
	 *
	 * @param Sequence $sequence Sequence.
	 * @return array<string, array>
	 */
	private static function stages_by_key( Sequence $sequence ): array {
		$by_key = array();

		foreach ( self::stages( $sequence ) as $stage ) {
			if ( ! is_array( $stage ) ) {
				continue;
			}

			$key = self::text( $stage['key'] ?? '' );
			if ( '' === $key || isset( $by_key[ $key ] ) ) {
				continue;
			}

			$by_key[ $key ] = $stage;
		}

		return $by_key;
	}

	/**
	 * The part of one side's stages that no change list names.
	 *
	 * Built for both sides by change_summary(), which names `stages` when the two
	 * differ. Left out, because a list names them: stages only one side holds; on
	 * a stage both hold, its label and, for a workflow, its region and its agent's
	 * presence, ability and routing; transitions only one side holds; on a
	 * transition both hold, its roles and tools; and the duplicates a region
	 * repair dropped. A field is left out only when its list reads the stored
	 * value whole (see without_read()). Everything else stays, in order: the
	 * shared stages, their flags, their shared transitions with labels and inputs,
	 * an agent's settings, and stored entries no list can read (a stage without a
	 * key, a transition without a target, a duplicate).
	 *
	 * @param Sequence             $sequence The side to read.
	 * @param array<string, array> $own      Its stages, keyed by key.
	 * @param array<string, array> $other    The other side's stages, keyed by key.
	 * @param bool                 $is_phase Whether this is a phase sequence, whose
	 *                                       regions and agents no list names.
	 * @param array                $dropped  Duplicates a region repair removed from
	 *                                       this side, each `{from, to}`.
	 * @return array
	 */
	private static function unitemized( Sequence $sequence, array $own, array $other, bool $is_phase, array $dropped = array() ): array {
		$unkeyed = array();
		$seen    = array();

		foreach ( self::stages( $sequence ) as $stage ) {
			$key = is_array( $stage ) ? self::text( $stage['key'] ?? '' ) : '';
			if ( '' === $key || isset( $seen[ $key ] ) ) {
				$unkeyed[] = $stage;
				continue;
			}
			$seen[ $key ] = true;
		}

		$drops = array();
		foreach ( $dropped as $drop ) {
			$pair           = self::text( $drop['from'] ?? '' ) . "\0" . self::text( $drop['to'] ?? '' );
			$drops[ $pair ] = ( $drops[ $pair ] ?? 0 ) + 1;
		}

		$other_pairs = self::transitions_by_pair( $other );
		$shared      = array();

		foreach ( $own as $key => $stage ) {
			$key = (string) $key;
			if ( ! isset( $other[ $key ] ) ) {
				continue;
			}

			$stage = self::without_read( $stage, 'label', 'is_string' );

			if ( ! $is_phase ) {
				$stage = self::without_read( $stage, 'status', 'is_string' );

				$mine   = self::has_agent( $stage['agent'] ?? null );
				$theirs = self::has_agent( $other[ $key ]['agent'] ?? null );

				if ( $mine && $theirs ) {
					$stage['agent'] = self::without_read( $stage['agent'], 'ability_id', 'is_string' );
					$stage['agent'] = self::without_read( $stage['agent'], 'routing', array( self::class, 'is_routing' ) );
				} elseif ( $mine || $theirs ) {
					// agents_changed names the agent arriving or leaving, settings and all.
					unset( $stage['agent'] );
				}
			}

			if ( isset( $stage['transitions'] ) && is_array( $stage['transitions'] ) ) {
				$paired   = array();
				$unpaired = array();
				$taken    = array();

				foreach ( $stage['transitions'] as $transition ) {
					$to = is_array( $transition ) ? self::text( $transition['to'] ?? '' ) : '';
					if ( '' === $to ) {
						$unpaired[] = $transition;
						continue;
					}

					$pair = $key . "\0" . $to;
					if ( isset( $taken[ $pair ] ) ) {
						if ( ! empty( $drops[ $pair ] ) ) {
							--$drops[ $pair ];
						} else {
							$unpaired[] = $transition;
						}
						continue;
					}
					$taken[ $pair ] = true;

					if ( isset( $other_pairs[ $pair ] ) ) {
						$transition = self::without_read( $transition, 'allowed_roles', array( self::class, 'is_string_list' ) );
						$transition = self::without_read( $transition, 'required_tools', array( self::class, 'is_string_list' ) );
						$paired[]   = $transition;
					}
				}

				$stage['transitions'] = array( $paired, $unpaired );
			}

			$shared[ $key ] = $stage;
		}

		return array( $shared, $unkeyed );
	}

	/**
	 * An entry without one field a change list reads, when the list reads it whole.
	 *
	 * A stored value the list can only read in part (a null, a scalar where a list
	 * belongs, a role list holding a non-string) stays, so changing it is still a
	 * change even though the list sees none.
	 *
	 * @param array    $entry    Stage, agent or transition config.
	 * @param string   $field    Field a change list reads.
	 * @param callable $readable Whether the list reads a value whole.
	 * @return array
	 */
	private static function without_read( array $entry, string $field, callable $readable ): array {
		if ( array_key_exists( $field, $entry ) && ! $readable( $entry[ $field ] ) ) {
			return $entry;
		}

		unset( $entry[ $field ] );

		return $entry;
	}

	/**
	 * Whether a stored role or tool list is one list_diff() reads whole.
	 *
	 * @param mixed $value Stored value.
	 * @return bool
	 */
	private static function is_string_list( $value ): bool {
		return is_array( $value ) && self::string_list( $value ) === $value;
	}

	/**
	 * Whether stored agent routing is a map agent_change() reads whole.
	 *
	 * @param mixed $value Stored value.
	 * @return bool
	 */
	private static function is_routing( $value ): bool {
		return is_array( $value ) && array_filter( $value, 'is_string' ) === $value;
	}

	/**
	 * Whether a stored agent config is an agent, as agent_change() reads it.
	 *
	 * @param mixed $agent Agent config, if any.
	 * @return bool
	 */
	private static function has_agent( $agent ): bool {
		return is_array( $agent ) && ! empty( $agent );
	}

	/**
	 * A stage's label, or its key when it has none.
	 *
	 * @param array  $stage Stage config.
	 * @param string $key   Stage key.
	 * @return string
	 */
	private static function stage_label( array $stage, string $key ): string {
		$label = self::text( $stage['label'] ?? '' );

		return '' === $label ? $key : $label;
	}

	/**
	 * Stage labels keyed by stage key.
	 *
	 * @param array<string, array> $stages Stages keyed by key.
	 * @return array<string, string>
	 */
	private static function stage_labels( array $stages ): array {
		$labels = array();

		foreach ( $stages as $key => $stage ) {
			$labels[ $key ] = self::stage_label( $stage, (string) $key );
		}

		return $labels;
	}

	/**
	 * Every transition keyed by its `(from, to)` pair.
	 *
	 * The write gate keeps the pair unique. A stored row older than that rule may
	 * hold a duplicate; the first one is kept, as a region repair keeps it.
	 *
	 * @param array<string, array> $stages Stages keyed by key.
	 * @return array<string, array{from: string, to: string, allowed_roles: string[], required_tools: string[]}>
	 */
	private static function transitions_by_pair( array $stages ): array {
		$pairs = array();

		foreach ( $stages as $from => $stage ) {
			$transitions = $stage['transitions'] ?? array();
			if ( ! is_array( $transitions ) ) {
				continue;
			}

			foreach ( $transitions as $transition ) {
				if ( ! is_array( $transition ) ) {
					continue;
				}

				// A stored row older than the write gate may hold a target that
				// isn't a string. It names no transition, so it is skipped; the
				// `stages` catch-all still records that the stage changed.
				$to   = self::text( $transition['to'] ?? '' );
				$pair = $from . "\0" . $to;

				if ( '' === $to || isset( $pairs[ $pair ] ) ) {
					continue;
				}

				$pairs[ $pair ] = array(
					'from'           => (string) $from,
					'to'             => $to,
					'allowed_roles'  => self::string_list( $transition['allowed_roles'] ?? array() ),
					'required_tools' => self::string_list( $transition['required_tools'] ?? array() ),
				);
			}
		}

		return $pairs;
	}

	/**
	 * A stored scalar as a string; anything else, which a stored row older than
	 * the write gate may hold, as an empty string.
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	private static function text( $value ): string {
		return is_scalar( $value ) ? (string) $value : '';
	}

	/**
	 * A list of distinct, non-empty strings.
	 *
	 * @param mixed $values Raw list.
	 * @return string[]
	 */
	private static function string_list( $values ): array {
		if ( ! is_array( $values ) ) {
			return array();
		}

		$strings = array_filter( array_map( 'strval', array_filter( $values, 'is_scalar' ) ), 'strlen' );

		return array_values( array_unique( $strings ) );
	}

	/**
	 * What was added to a list and what was removed from it.
	 *
	 * @param string[] $before Before.
	 * @param string[] $after  After.
	 * @return array{added: string[], removed: string[]}
	 */
	private static function list_diff( array $before, array $after ): array {
		return array(
			'added'   => array_values( array_diff( $after, $before ) ),
			'removed' => array_values( array_diff( $before, $after ) ),
		);
	}

	/**
	 * A transition named by its stages.
	 *
	 * @param array                 $transition Transition with `from` and `to`.
	 * @param array<string, string> $labels     Stage labels keyed by key.
	 * @return array{from: string, to: string, from_label: string, to_label: string}
	 */
	private static function transition_ref( array $transition, array $labels ): array {
		return array(
			'from'       => $transition['from'],
			'to'         => $transition['to'],
			'from_label' => $labels[ $transition['from'] ] ?? $transition['from'],
			'to_label'   => $labels[ $transition['to'] ] ?? $transition['to'],
		);
	}

	/**
	 * A role with its display name as it reads now.
	 *
	 * @param string $slug Role slug.
	 * @return array{slug: string, name: string}
	 */
	private static function role_ref( string $slug ): array {
		$names = wp_roles()->role_names;

		return array(
			'slug' => $slug,
			'name' => isset( $names[ $slug ] ) ? translate_user_role( $names[ $slug ] ) : $slug,
		);
	}

	/**
	 * A tool with its label as it reads now.
	 *
	 * Asks whether the ability is registered first: wp_get_ability() on an
	 * unregistered id raises an incorrect-usage notice.
	 *
	 * @param string $id Ability id.
	 * @return array{id: string, label: string}
	 */
	private static function tool_ref( string $id ): array {
		$label = \vip_workflows_has_ability( $id ) ? (string) wp_get_ability( $id )->get_label() : $id;

		return array(
			'id'    => $id,
			'label' => '' === $label ? $id : $label,
		);
	}

	/**
	 * How a stage's agent changed, or null when it didn't.
	 *
	 * Only the agent's presence, its ability and its routing are itemized. A
	 * change to its settings alone falls to the `stages` catch-all.
	 *
	 * @param mixed $before Agent config before, if any.
	 * @param mixed $after  Agent config after, if any.
	 * @return array|null
	 */
	private static function agent_change( $before, $after ): ?array {
		$had = self::has_agent( $before );
		$has = self::has_agent( $after );

		if ( ! $had && ! $has ) {
			return null;
		}

		if ( ! $had ) {
			return array(
				'change'  => 'added',
				'ability' => array(
					'from' => null,
					'to'   => self::text( $after['ability_id'] ?? '' ),
				),
			);
		}

		if ( ! $has ) {
			return array(
				'change'  => 'removed',
				'ability' => array(
					'from' => self::text( $before['ability_id'] ?? '' ),
					'to'   => null,
				),
			);
		}

		$change = array();

		$ability_from = self::text( $before['ability_id'] ?? '' );
		$ability_to   = self::text( $after['ability_id'] ?? '' );
		if ( $ability_from !== $ability_to ) {
			$change['ability'] = array(
				'from' => $ability_from,
				'to'   => $ability_to,
			);
		}

		$routing_before = is_array( $before['routing'] ?? null ) ? $before['routing'] : array();
		$routing_after  = is_array( $after['routing'] ?? null ) ? $after['routing'] : array();
		$routing        = array();

		foreach ( array_unique( array_merge( array_keys( $routing_before ), array_keys( $routing_after ) ) ) as $outcome ) {
			$from = isset( $routing_before[ $outcome ] ) ? self::text( $routing_before[ $outcome ] ) : null;
			$to   = isset( $routing_after[ $outcome ] ) ? self::text( $routing_after[ $outcome ] ) : null;

			if ( $from !== $to ) {
				$routing[] = array(
					'outcome' => (string) $outcome,
					'from'    => $from,
					'to'      => $to,
				);
			}
		}

		if ( $routing ) {
			$change['routing'] = $routing;
		}

		if ( empty( $change ) ) {
			return null;
		}

		// One entry per stage. The change names the larger of the two when both
		// moved; the entry carries both.
		return array( 'change' => isset( $change['ability'] ) ? 'ability' : 'routing' ) + $change;
	}
}
