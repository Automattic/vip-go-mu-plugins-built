<?php
/**
 * Assistant Registry.
 *
 * Unified view over research abilities and discovery providers. Groups them
 * into single "assistant" entries so that one plugin providing both
 * capabilities (e.g. discovery + research) shows as one card on the
 * Integrations page.
 *
 * Entries come from two sources:
 *
 *   1. Manifests registered via the `vip_workflows_register_assistant_meta`
 *      action. Plugins that span multiple capabilities use this to group
 *      their ability(ies) and provider(s) under one slug.
 *
 *   2. Auto-generated entries for any ability or provider not claimed by a
 *      manifest. Existing single-capability plugins keep working without
 *      any changes.
 *
 * @package VIPWorkflows\Assistants
 */

declare( strict_types=1 );

namespace VIPWorkflows\Assistants;

use VIPWorkflows\Abilities\Ability;
use VIPWorkflows\Abilities\AbilitySettings;
use VIPWorkflows\Abilities\Availability;
use VIPWorkflows\Abilities\Requirement;
use VIPWorkflows\Discovery\DiscoveryProviderRegistry;

/**
 * Assistant Registry.
 */
class AssistantRegistry {

	/**
	 * Every ability and provider on the card has its dependencies met.
	 */
	public const AVAILABILITY_AVAILABLE = 'available';

	/**
	 * Some — but not all — of the card's abilities and providers are unavailable.
	 *
	 * A Foresight-shaped card whose discovery works while its research does not
	 * lands here, so the UI can say which half is broken instead of reading as
	 * wholly unusable.
	 */
	public const AVAILABILITY_PARTIAL = 'partial';

	/**
	 * Every ability and provider on the card is unavailable.
	 */
	public const AVAILABILITY_UNAVAILABLE = 'unavailable';

	/**
	 * Singleton instance.
	 *
	 * @var mixed
	 */
	private static ?self $instance = null;

	/**
	 * Manifests keyed by slug.
	 *
	 * @var array<string, array>
	 */
	private array $manifests = array();

	/**
	 * Initialized.
	 *
	 * @var bool
	 */
	private bool $initialized = false;

	/**
	 * Ability ids already reported as mis-registering an availability callback.
	 *
	 * @var array<string, true>
	 */
	private array $warned_ability_ids = array();

	/**
	 * Slugs already reported as duplicated, so the notice fires once per request.
	 *
	 * `get_all()` runs on every Agents-page load, every `/assistants` request and
	 * several times per settings save, so an unguarded notice would storm.
	 *
	 * @var array<string, bool>
	 */
	private array $warned_duplicate_slugs = array();

	/**
	 * Construct the AssistantRegistry instance.
	 */
	private function __construct() {}

	/**
	 * Get the singleton instance.
	 *
	 * @return self
	 */
	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Collect manifests from plugins. Runs once on first access.
	 */
	private function maybe_init(): void {
		if ( $this->initialized ) {
			return;
		}

		$this->initialized = true;

		/**
		 * Fires to let plugins declare unified assistant metadata.
		 *
		 * Use when a plugin provides multiple capabilities (e.g. a discovery
		 * provider AND a research ability) that should appear as one card.
		 *
		 * @param AssistantRegistry $registry The registry instance.
		 */
		do_action( 'vip_workflows_register_assistant_meta', $this );
	}

	/**
	 * Register a unified assistant manifest.
	 *
	 * @param string $slug Unique slug for the unified assistant.
	 * @param array  $args {.
	 *     @type string   $label           Human-readable name.
	 *     @type string   $description     Short description.
	 *     @type string   $icon            Dashicon name or emoji.
	 *     @type string[] $ability_ids     Ability IDs this manifest covers.
	 *     @type string[] $provider_slugs  Discovery provider slugs this manifest covers.
	 *     @type string[] $capabilities    Optional declared capabilities.
	 *     @type array    $settings_schema Optional: merged settings fields.
	 * }
	 * @return bool True if registered.
	 */
	public function register( string $slug, array $args ): bool {
		if ( empty( $args['label'] ) ) {
			_doing_it_wrong(
				__METHOD__,
				sprintf( 'Assistant manifest "%s" is missing required key "label".', esc_html( $slug ) ),
				'1.0.0'
			);
			return false;
		}

		$this->manifests[ $slug ] = array(
			'slug'            => $slug,
			'label'           => (string) $args['label'],
			'description'     => (string) ( $args['description'] ?? '' ),
			'icon'            => (string) ( $args['icon'] ?? '' ),
			'ability_ids'     => (array) ( $args['ability_ids'] ?? array() ),
			'provider_slugs'  => (array) ( $args['provider_slugs'] ?? array() ),
			'capabilities'    => (array) ( $args['capabilities'] ?? array() ),
			'settings_schema' => (array) ( $args['settings_schema'] ?? array() ),
		);

		return true;
	}

	/**
	 * Get all unified assistant entries.
	 *
	 * @return array<int, array> List of assistant entries.
	 */
	public function get_all(): array {
		$this->maybe_init();

		$abilities = $this->collect_agent_abilities();
		$providers = DiscoveryProviderRegistry::get_instance()->get_all();

		$claimed_ability_ids    = array();
		$claimed_provider_slugs = array();

		$entries = array();

		foreach ( $this->manifests as $slug => $manifest ) {
			$entry_abilities = array();
			foreach ( $manifest['ability_ids'] as $id ) {
				if ( isset( $abilities[ $id ] ) ) {
					$entry_abilities[ $id ]  = $abilities[ $id ];
					$claimed_ability_ids[]   = $id;
				}
			}

			$entry_providers = array();
			foreach ( $manifest['provider_slugs'] as $provider_slug ) {
				if ( isset( $providers[ $provider_slug ] ) ) {
					$entry_providers[ $provider_slug ] = $providers[ $provider_slug ];
					$claimed_provider_slugs[]          = $provider_slug;
				}
			}

			if ( empty( $entry_abilities ) && empty( $entry_providers ) ) {
				continue;
			}

			$entries[] = $this->build_entry( $slug, $manifest, $entry_abilities, $entry_providers );
		}

		foreach ( $abilities as $ability_id => $ability_data ) {
			if ( in_array( $ability_id, $claimed_ability_ids, true ) ) {
				continue;
			}

			$auto_slug = $this->derive_slug_from_ability_id( $ability_id );
			$entries[] = $this->build_entry(
				$auto_slug,
				array(
					'slug'            => $auto_slug,
					'label'           => $ability_data['label'],
					'description'     => $ability_data['description'],
					'icon'            => $ability_data['icon'],
					'ability_ids'     => array( $ability_id ),
					'provider_slugs'  => array(),
					'capabilities'    => array(),
					'settings_schema' => $ability_data['settings_schema'],
				),
				array( $ability_id => $ability_data ),
				array()
			);
		}

		foreach ( $providers as $provider_slug => $provider_data ) {
			if ( in_array( $provider_slug, $claimed_provider_slugs, true ) ) {
				continue;
			}

			$entries[] = $this->build_entry(
				$provider_slug,
				array(
					'slug'            => $provider_slug,
					'label'           => $provider_data['label'],
					'description'     => $provider_data['description'],
					'icon'            => $provider_data['icon'],
					'ability_ids'     => array(),
					'provider_slugs'  => array( $provider_slug ),
					'capabilities'    => array(),
					'settings_schema' => array(),
				),
				array(),
				array( $provider_slug => $provider_data )
			);
		}

		$this->warn_on_duplicate_slugs( $entries );

		return $entries;
	}

	/**
	 * Warn when two entries claim the same slug.
	 *
	 * The entry slug is how a card addresses itself: `get()` resolves through it,
	 * `update_settings()` resolves through `get()`, and the REST routes take it as
	 * a path segment. Two entries sharing one means the second is unreachable and
	 * writes aimed at it land on the first — which is exactly the bug that made
	 * saving Media Scout's card write to Web Researcher's ability, and it was
	 * silent for as long as it existed.
	 *
	 * Auto-generated ability slugs can no longer collide with each other, since
	 * they carry the whole ability id, and two manifests cannot collide because
	 * manifests are keyed by slug. What remains reachable is a manifest declaring a
	 * slug that matches an entry generated for something it did not claim — most
	 * plausibly a plugin that registers a manifest and a discovery provider under
	 * its own name and forgets to list the provider in `provider_slugs`.
	 *
	 * Diagnostic only: the entries are still returned, because refusing to render
	 * the Agents page would be a worse outcome than rendering it with a duplicate.
	 *
	 * @param array<int, array> $entries Built entries.
	 * @return void
	 */
	private function warn_on_duplicate_slugs( array $entries ): void {
		$counts = array_count_values( array_column( $entries, 'slug' ) );

		foreach ( $counts as $slug => $count ) {
			$slug = (string) $slug;

			if ( $count < 2 || isset( $this->warned_duplicate_slugs[ $slug ] ) ) {
				continue;
			}

			$this->warned_duplicate_slugs[ $slug ] = true;

			_doing_it_wrong(
				__METHOD__,
				sprintf(
					'Two or more agent entries claim the slug "%1$s" (%2$d of them). Only the first is reachable: settings saved against that slug will be written to it, and the others cannot be addressed at all. Give each manifest its own slug.',
					esc_html( $slug ),
					(int) $count
				),
				'1.0.0'
			);
		}
	}

	/**
	 * Get a single unified entry by slug.
	 *
	 * @param string $slug Slug.
	 */
	public function get( string $slug ): ?array {
		foreach ( $this->get_all() as $entry ) {
			if ( $entry['slug'] === $slug ) {
				return $entry;
			}
		}

		return null;
	}

	/**
	 * Save settings for an assistant.
	 *
	 * Writes through to all underlying ability and provider storage so that
	 * legacy consumers (ability executor, discovery controller) continue to
	 * work unchanged.
	 *
	 * @param string $slug    Assistant slug.
	 * @param array  $updates {.
	 *     @type bool  $enabled Whether the assistant is enabled.
	 *     @type array $options Settings values keyed by option name.
	 * }
	 * @return bool True if the assistant exists and settings were saved.
	 */
	public function update_settings( string $slug, array $updates ): bool {
		$entry = $this->get( $slug );
		if ( ! $entry ) {
			return false;
		}

		$enabled = isset( $updates['enabled'] ) ? (bool) $updates['enabled'] : null;
		$options = isset( $updates['options'] ) && is_array( $updates['options'] ) ? $updates['options'] : array();

		if ( ! empty( $entry['ability_ids'] ) ) {
			$ability_settings = AbilitySettings::get_instance();
			$bulk             = array();

			foreach ( $entry['ability_ids'] as $ability_id ) {
				$payload = array();
				if ( null !== $enabled ) {
					$payload['enabled'] = $enabled;
				}
				if ( ! empty( $options ) ) {
					$payload['options'] = $options;
				}
				if ( ! empty( $payload ) ) {
					$bulk[ $ability_id ] = $payload;
				}
			}

			if ( ! empty( $bulk ) ) {
				$ability_settings->update_bulk( $bulk );
			}
		}

		if ( ! empty( $entry['provider_slugs'] ) ) {
			$provider_enable_settings = get_option( 'vip_discovery_provider_settings', array() );
			$provider_enable_settings = is_array( $provider_enable_settings ) ? $provider_enable_settings : array();

			foreach ( $entry['provider_slugs'] as $provider_slug ) {
				if ( null !== $enabled ) {
					if ( ! isset( $provider_enable_settings[ $provider_slug ] ) ) {
						$provider_enable_settings[ $provider_slug ] = array();
					}
					$provider_enable_settings[ $provider_slug ]['enabled'] = $enabled;
				}

				if ( ! empty( $options ) ) {
					$config_option = 'vip_discovery_provider_' . sanitize_key( $provider_slug );
					$existing      = get_option( $config_option, array() );
					$existing      = is_array( $existing ) ? $existing : array();
					update_option( $config_option, array_merge( $existing, $options ) );
				}

				$this->clear_discovery_cache( $provider_slug );
			}

			update_option( 'vip_discovery_provider_settings', $provider_enable_settings );
		}

		return true;
	}

	/**
	 * Collect abilities that should appear in the unified Agents surface.
	 *
	 * @return array<string, array>
	 */
	private function collect_agent_abilities(): array {
		if ( ! function_exists( 'wp_get_abilities' ) ) {
			return array();
		}

		$collected = array();
		$settings  = AbilitySettings::get_instance();

		foreach ( wp_get_abilities() as $ability ) {
			$category = $ability->get_category();
			$meta     = $ability->get_meta();
			$id       = $ability->get_name();
			if ( ! $this->should_collect_agent_ability( $id, $category, $meta ) ) {
				continue;
			}

			$this->warn_on_discarded_availability_callback( $ability, $id, $meta );

			$settings_row = $settings->get( $id );

			$icon = $ability instanceof Ability
				? $ability->get_icon()
				: ( $meta['icon'] ?? 'search' );

			/*
			 * Resolved once and both keys derived from it. Asking for
			 * `is_available()` and `get_availability()` separately runs the
			 * registered callback twice per registry read, and the two answers
			 * can disagree when a callback is not perfectly idempotent.
			 *
			 * A plain `WP_Ability` has no structured availability channel at
			 * all — `warn_on_discarded_availability_callback()` above reports
			 * that as the registration bug it is — so it contributes the
			 * empty "nothing unmet" result rather than a fabricated one.
			 */
			$availability = $ability instanceof Ability ? $ability->get_availability() : Availability::available();

			$collected[ $id ] = array(
				'id'              => $id,
				'label'           => $ability->get_label(),
				'description'     => $ability->get_description(),
				'category'        => $category,
				'icon'            => $icon,
				'meta'            => $meta,
				'settings_schema' => (array) ( $meta['settings_schema'] ?? array() ),
				'enabled'         => (bool) $settings_row['enabled'],
				'options'         => (array) ( $settings_row['options'] ?? array() ),
				'available'       => $availability->is_available(),
				'availability'    => $availability,
				'display_order'   => $ability instanceof Ability ? $ability->get_display_order() : 99,
			);
		}

		return $collected;
	}

	/**
	 * Warn when an availability callback is registered somewhere it is ignored.
	 *
	 * Only `vip_workflows_register_ability()` sets `ability_class`, so an ability
	 * registered through core's `wp_register_ability()` is a plain `WP_Ability`
	 * with no `is_available()`. This surface then treats it as permanently
	 * available and its `availability_callback` is discarded without a trace —
	 * the agent silently reports ready while its dependencies are unmet.
	 *
	 * Diagnostic only: the entry is still collected, so behavior is unchanged.
	 *
	 * Reported once per ability per request. This runs on every `get_all()` — every
	 * Agents-page load, every `/assistants` request, several times over a single
	 * settings save — and a registration bug does not become more true on the
	 * fourth read. Repeating it with `WP_DEBUG` on buries the notice that matters
	 * in a storm of copies of itself.
	 *
	 * @param  object $ability The registered ability instance.
	 * @param  string $id      Ability ID.
	 * @param  array  $meta    Ability metadata.
	 * @return void
	 */
	private function warn_on_discarded_availability_callback( object $ability, string $id, array $meta ): void {
		if ( $ability instanceof Ability || empty( $meta['availability_callback'] ) ) {
			return;
		}

		if ( isset( $this->warned_ability_ids[ $id ] ) ) {
			return;
		}

		$this->warned_ability_ids[ $id ] = true;

		_doing_it_wrong(
			__METHOD__,
			sprintf(
				'Ability "%s" declares an availability_callback but was not registered through vip_workflows_register_ability(), so the callback is ignored and the agent will always report as available.',
				esc_html( $id )
			),
			'1.0.0'
		);
	}

	/**
	 * Check whether an ability should appear in the unified Agents surface.
	 *
	 * Core stage-only abilities stay internal until they are migrated into
	 * plugin-scoped agents; otherwise every `vip-workflows/*` stage ability would
	 * collapse into the same auto-generated agent slug.
	 *
	 * @param string $id       Ability ID.
	 * @param string $category Ability category.
	 * @param array  $meta     Ability metadata.
	 * @return bool
	 */
	private function should_collect_agent_ability( string $id, string $category, array $meta ): bool {
		if ( 'research' === $category ) {
			return true;
		}

		if ( ! $this->ability_supports_stage( $meta ) ) {
			return false;
		}

		return ! str_starts_with( $id, 'vip-workflows/' );
	}

	/**
	 * Check whether ability metadata marks the ability as AI-stage capable.
	 *
	 * @param array $meta Ability metadata.
	 * @return bool
	 */
	private function ability_supports_stage( array $meta ): bool {
		$supports = (array) ( $meta['supports'] ?? array() );
		return in_array( 'stage', $supports, true ) && ! empty( $meta['stage_eligible'] );
	}

	/**
	 * Build a unified entry from a manifest plus matched abilities and providers.
	 *
	 * Three availability keys, deliberately separate:
	 *
	 *   - `available` (bool) — the historic AND-fold across every source. Its
	 *     value is unchanged by the structured additions.
	 *   - `availability` (Availability) — the deduplicated unmet requirement set.
	 *     Kept as an object rather than serialized here because the message
	 *     register is chosen at each read boundary; serializing at this layer
	 *     would freeze one audience's wording into every consumer.
	 *   - `availability_sources` (list) + `availability_state` (string) —
	 *     per-source attribution and the derived available/partial/unavailable
	 *     classification. Each source row is
	 *     `array{ type: 'ability'|'provider', id: string, label: string, available: bool }`.
	 *
	 * @param string               $slug      Entry slug.
	 * @param array                $manifest  Manifest data (real or synthesized).
	 * @param array<string, array> $abilities Abilities keyed by id.
	 * @param array<string, array> $providers Providers keyed by slug.
	 * @return array
	 */
	private function build_entry( string $slug, array $manifest, array $abilities, array $providers ): array {
		$capabilities = $this->resolve_capabilities( $manifest, $abilities, $providers );

		$enabled_values   = array();
		$available_values = array();
		$availabilities   = array();
		$sources          = array();
		$options          = array();
		$display_order    = 99;

		foreach ( $abilities as $ability ) {
			$enabled_values[]   = $ability['enabled'];
			$available_values[] = $ability['available'];
			$availabilities[]   = $ability['availability'];
			$sources[]          = array(
				'type'      => 'ability',
				'id'        => $ability['id'],
				'label'     => $ability['label'],
				'available' => $ability['available'],
			);
			$options            = array_merge( $options, $ability['options'] );
			if ( $ability['display_order'] < $display_order ) {
				$display_order = $ability['display_order'];
			}
		}

		$discovery_registry       = DiscoveryProviderRegistry::get_instance();
		$provider_enable_settings = get_option( 'vip_discovery_provider_settings', array() );
		$provider_enable_settings = is_array( $provider_enable_settings ) ? $provider_enable_settings : array();

		foreach ( $providers as $provider_slug => $provider ) {
			/*
			 * `is_available()` is `get_availability()->is_available()`, so reading
			 * the structured result and taking its bool is the same value the
			 * bool accessor produced — with the callback invoked once, not twice.
			 */
			$provider_availability = $discovery_registry->get_availability( $provider_slug );

			$enabled_values[]   = (bool) ( $provider_enable_settings[ $provider_slug ]['enabled'] ?? true );
			$available_values[] = $provider_availability->is_available();
			$availabilities[]   = $provider_availability;
			$sources[]          = array(
				'type'      => 'provider',
				'id'        => $provider_slug,
				'label'     => $provider['label'],
				'available' => $provider_availability->is_available(),
			);

			$config  = get_option( 'vip_discovery_provider_' . sanitize_key( $provider_slug ), array() );
			$options = array_merge( $options, is_array( $config ) ? $config : array() );
		}

		$settings_schema = $manifest['settings_schema'];
		if ( empty( $settings_schema ) ) {
			foreach ( $abilities as $ability ) {
				$settings_schema = array_merge( $settings_schema, $ability['settings_schema'] );
			}
		}

		$first_ability_id = $abilities ? array_key_first( $abilities ) : null;

		return array(
			'slug'            => $slug,
			'label'           => $manifest['label'],
			'description'     => $manifest['description'],
			'icon'            => $manifest['icon'],
			'capabilities'    => $capabilities,
			'available_in_ai_stage' => in_array( 'stage', $capabilities, true ),
			'ability_ids'     => array_keys( $abilities ),
			'provider_slugs'  => array_keys( $providers ),
			'enabled'         => empty( $enabled_values ) ? true : ! in_array( false, $enabled_values, true ),
			'available'       => empty( $available_values ) ? true : ! in_array( false, $available_values, true ),
			'availability'         => $this->aggregate_availability( $availabilities ),
			'availability_sources' => $sources,
			'availability_state'   => $this->derive_availability_state( $sources ),
			'options'         => $options,
			'settings_schema' => $settings_schema,
			'display_order'   => $display_order,
			'origin'          => $first_ability_id && str_starts_with( $first_ability_id, 'vip-workflows/' ) ? 'built-in' : 'plugin',
		);
	}

	/**
	 * Fold every source's unmet requirements into one set for the card.
	 *
	 * Satisfaction is never evaluated here — a source whose dependencies are met
	 * arrives as the empty available result and contributes nothing. The only work
	 * is deduplication, and it has two shapes that both occur in production:
	 *
	 *   - Two capabilities on one card needing the same thing. Foresight registers
	 *     one `settings:foresight-news` requirement from both its discovery
	 *     provider and its ability, so the same id arrives from two sources.
	 *   - Two members of one group needing the same thing. Media Scout's `any`
	 *     group lists the Tavily image and Tavily video providers, which both
	 *     name `credential:tavily`.
	 *
	 * Both collapse to a single row whose `sources` name every capability that
	 * needs it. Group satisfaction mode is carried through untouched: flattening
	 * Media Scout's `any` group into `all` would turn "configure at least one of"
	 * into three hard blockers, which is the exact defect this shape exists to
	 * prevent.
	 *
	 * A repeated id only collapses when the kind and destination agree too. Two
	 * genuinely different requirements sharing an id is a registration mistake, and
	 * collapsing them would silently drop the loser's destination and wording —
	 * leaving a reader instructed to fix one thing when two are broken. Both are
	 * kept and the mistake is reported, so the conflict is visible.
	 *
	 * @since 0.0.1
	 *
	 * @param  Availability[] $availabilities One per contributing ability and provider.
	 * @return Availability
	 */
	private function aggregate_availability( array $availabilities ): Availability {
		$canonical  = array();
		$seen_ids   = array();
		$warned_ids = array();

		foreach ( $availabilities as $availability ) {
			foreach ( $availability->get_requirements() as $requirement ) {
				$key = self::requirement_key( $requirement );

				if ( isset( $canonical[ $key ] ) ) {
					$canonical[ $key ] = $canonical[ $key ]->with_sources( $requirement->get_sources() );
					continue;
				}

				$id = $requirement->get_id();

				if ( isset( $seen_ids[ $id ] ) && ! isset( $warned_ids[ $id ] ) ) {
					$warned_ids[ $id ] = true;

					_doing_it_wrong(
						__METHOD__,
						sprintf(
							'Two requirements on the same agent share the id "%s" but disagree on kind or destination. The id is the deduplication key, so collapsing them would silently discard one destination and its wording; both are rendered instead. Give each distinct requirement its own id.',
							esc_html( $id )
						),
						'1.0.0'
					);
				}

				$seen_ids[ $id ]   = true;
				$canonical[ $key ] = $requirement;
			}
		}

		$groups     = array();
		$signatures = array();

		foreach ( $availabilities as $availability ) {
			foreach ( $availability->get_groups() as $group ) {
				$keys = array();

				foreach ( $group->get_requirements() as $requirement ) {
					$key = self::requirement_key( $requirement );
					if ( ! in_array( $key, $keys, true ) ) {
						$keys[] = $key;
					}
				}

				if ( empty( $keys ) ) {
					continue;
				}

				/*
				 * An identical group arriving from a second source is the same
				 * group, not a second one to render. Membership is a set, so the
				 * signature is sorted: two `any` groups listing the same providers
				 * in different orders are the same choice, and leaving them
				 * uncollapsed renders that choice twice. `groupKey()` in
				 * src/common/AgentRequirements.js sorts the same way, so
				 * the React key agrees with the collapse decision.
				 */
				$signature = $keys;
				sort( $signature );
				$signature = $group->get_satisfy() . '|' . implode( ',', $signature );

				if ( in_array( $signature, $signatures, true ) ) {
					continue;
				}
				$signatures[] = $signature;

				$groups[] = $group->with_requirements(
					array_map(
						static function ( string $key ) use ( $canonical ): Requirement {
							return $canonical[ $key ];
						},
						$keys
					)
				);
			}
		}

		foreach ( $availabilities as $availability ) {
			if ( ! $availability->is_available() ) {
				return Availability::unmet( ...$groups );
			}
		}

		return Availability::available();
	}

	/**
	 * Identity used to decide whether two requirements are the same requirement.
	 *
	 * The id alone is the authored key, but two requirements that disagree on kind
	 * or destination cannot be rendered as one row without losing information, so
	 * both participate in the key. Wording outside the destination is deliberately
	 * excluded: the same gap phrased differently by two sources is still one gap,
	 * and first-wins is the right answer there.
	 *
	 * @since 0.0.1
	 *
	 * @param  Requirement $requirement Requirement to key.
	 * @return string
	 */
	private static function requirement_key( Requirement $requirement ): string {
		$destination = $requirement->get_destination();

		return implode(
			"\n",
			array(
				$requirement->get_id(),
				$requirement->get_kind(),
				$destination->get_kind(),
				$destination->get_url(),
				$destination->get_label(),
				$destination->get_hint(),
			)
		);
	}

	/**
	 * Classify the card as available, partially unavailable, or unavailable.
	 *
	 * `available` is a single AND-fold and cannot tell "nothing on this card
	 * works" apart from "one of its two capabilities does not", which the card
	 * needs in order to scope its notice to the capability that is actually
	 * broken.
	 *
	 * @since 0.0.1
	 *
	 * @param  array<int, array<string, mixed>> $sources Per-source availability rows.
	 * @return string One of the AVAILABILITY_* constants.
	 */
	private function derive_availability_state( array $sources ): string {
		if ( empty( $sources ) ) {
			return self::AVAILABILITY_AVAILABLE;
		}

		$available_count = count(
			array_filter(
				$sources,
				static function ( array $source ): bool {
					return (bool) $source['available'];
				}
			)
		);

		if ( count( $sources ) === $available_count ) {
			return self::AVAILABILITY_AVAILABLE;
		}

		return 0 === $available_count ? self::AVAILABILITY_UNAVAILABLE : self::AVAILABILITY_PARTIAL;
	}

	/**
	 * Resolve display capabilities from declared manifest values plus inference.
	 *
	 * Manifest declarations are presentation hints, not trust boundaries: each
	 * declared capability must be backed by a matching ability/provider. Missing
	 * declarations are still inferred for existing agents and auto-generated
	 * entries.
	 *
	 * @param array                $manifest  Manifest data.
	 * @param array<string, array> $abilities Abilities keyed by id.
	 * @param array<string, array> $providers Providers keyed by slug.
	 * @return string[]
	 */
	private function resolve_capabilities( array $manifest, array $abilities, array $providers ): array {
		$valid_capabilities = $this->get_valid_capabilities( $abilities, $providers );
		$capabilities       = array();

		foreach ( (array) ( $manifest['capabilities'] ?? array() ) as $capability ) {
			$capability = (string) $capability;
			if ( isset( $valid_capabilities[ $capability ] ) && ! in_array( $capability, $capabilities, true ) ) {
				$capabilities[] = $capability;
			}
		}

		foreach ( array( 'research', 'stage', 'discovery' ) as $capability ) {
			if ( isset( $valid_capabilities[ $capability ] ) && ! in_array( $capability, $capabilities, true ) ) {
				$capabilities[] = $capability;
			}
		}

		return $capabilities;
	}

	/**
	 * Get capabilities backed by the entry's actual abilities/providers.
	 *
	 * @param array<string, array> $abilities Abilities keyed by id.
	 * @param array<string, array> $providers Providers keyed by slug.
	 * @return array<string, bool>
	 */
	private function get_valid_capabilities( array $abilities, array $providers ): array {
		$valid_capabilities = array();

		foreach ( $abilities as $ability ) {
			if ( 'research' === $ability['category'] ) {
				$valid_capabilities['research'] = true;
			}

			if ( $this->ability_supports_stage( $ability['meta'] ) ) {
				$valid_capabilities['stage'] = true;
			}
		}

		if ( ! empty( $providers ) ) {
			$valid_capabilities['discovery'] = true;
		}

		return $valid_capabilities;
	}

	/**
	 * Derive an assistant slug for an ability with no manifest to claim it.
	 *
	 * The slug carries the whole ability id, not just its vendor prefix:
	 * `workflow-agent-wikipedia/wikipedia` becomes
	 * `workflow-agent-wikipedia-wikipedia`.
	 *
	 * Taking only the prefix collapsed every ability a plugin registers onto one
	 * slug, which the entry slug cannot support — it is how a card addresses
	 * itself. `vip-workflows/web-researcher` and `vip-workflows/media-scout` both
	 * derived `vip-workflows`, so `get()` returned whichever came first and saving
	 * Media Scout's card wrote to Web Researcher's ability.
	 *
	 * Grouping several abilities onto one card is what a manifest is for, and a
	 * manifest keeps its declared slug — this only affects entries generated
	 * because nothing claimed them. Nothing persists an entry slug (settings
	 * write through to ability ids and provider slugs), so widening it is safe.
	 *
	 * @param string $ability_id Ability ID.
	 * @return string Slug unique to this ability.
	 */
	private function derive_slug_from_ability_id( string $ability_id ): string {
		return str_replace( '/', '-', $ability_id );
	}

	/**
	 * Clear all discovery caches for a provider (recommend, search, filters).
	 *
	 * @param string $provider_slug Provider slug.
	 */
	private function clear_discovery_cache( string $provider_slug ): void {
		global $wpdb;

		$slug = sanitize_key( $provider_slug );
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
				$wpdb->esc_like( '_transient_vip_discovery_recommend_' . $slug ) . '%',
				$wpdb->esc_like( '_transient_vip_discovery_search_' . $slug ) . '%'
			)
		);
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
				$wpdb->esc_like( '_transient_timeout_vip_discovery_recommend_' . $slug ) . '%',
				$wpdb->esc_like( '_transient_timeout_vip_discovery_search_' . $slug ) . '%'
			)
		);
	}
}
