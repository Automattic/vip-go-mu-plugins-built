<?php
/**
 * Credential adapter facade.
 *
 * Single seam for all AI/service credential reads. Call sites ask this facade
 * for a key by logical service id instead of calling ApiKeysController directly.
 * The facade:
 *   - honors a `VIP_WORKFLOWS_*_KEY` constant override first (parity with the old
 *     stack, regardless of which backend is active);
 *   - otherwise delegates to a capability-selected backend — the WordPress
 *     Connectors API when present (native on 7.0, via Gutenberg 23.0+ on 6.9),
 *     else the legacy encrypted-option store;
 *   - resolves the generation provider and its model, which are preferences
 *     (not credentials) but are derived from which services are keyed.
 *
 * See docs/specs/ai-connectors-audit.md for the mapping and contract.
 *
 * @package VIPWorkflows\AI
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Resolves credentials and the model preference through a pluggable backend.
 */
final class Credentials {

	/**
	 * Logical service id => constant override name (parity with the old stack).
	 */
	private const SERVICE_CONSTANTS = array(
		'openai'    => 'VIP_WORKFLOWS_OPENAI_KEY',
		'anthropic' => 'VIP_WORKFLOWS_ANTHROPIC_KEY',
		'google'    => 'VIP_WORKFLOWS_GOOGLE_KEY',
		'tavily'    => 'VIP_WORKFLOWS_TAVILY_KEY',
		'youtube'   => 'VIP_WORKFLOWS_YOUTUBE_KEY',
	);

	/**
	 * Explicitly selected general-AI provider, written only by the settings screen.
	 */
	private const PROVIDER_OPTION = 'vip_workflows_ai_provider';

	/**
	 * Per-provider model preference map (provider id => model id).
	 */
	private const MODELS_OPTION = 'vip_workflows_ai_models';

	/**
	 * Legacy single-model option (pre-multi-provider; treated as OpenAI's model).
	 */
	private const MODEL_OPTION = 'vip_workflows_ai_model';

	/**
	 * Legacy keys option that previously also stored the model, for back-compat.
	 */
	private const LEGACY_KEYS_OPTION = 'vip_workflows_api_keys';

	/**
	 * Default OpenAI model when none is configured.
	 */
	public const DEFAULT_MODEL = 'gpt-4o';

	/**
	 * Generation providers eligible for general AI (not Tavily/YouTube, which
	 * are search/media services, not AI Client providers).
	 */
	public const AI_PROVIDERS = array( 'openai', 'anthropic', 'google' );

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Selected backend (lazily resolved by capability).
	 *
	 * @var CredentialBackend|null
	 */
	private ?CredentialBackend $backend = null;

	/**
	 * The provider derived from this site's credentials, resolved once.
	 *
	 * Only the *derived* half of `provider()` is cached. The stored selection is
	 * re-read every call, because the settings endpoint writes it and then answers
	 * from `provider()` in the same request; caching that would serve the value the
	 * administrator just replaced. What is worth caching is the credential scan,
	 * which reaches the backend once per provider.
	 *
	 * @var string|null
	 */
	private ?string $keyed_provider = null;

	/**
	 * Whether this instance has already logged an unusable stored selection.
	 *
	 * `provider()` is called several times per request — by the availability gate,
	 * the settings endpoint and each AI surface — and the corruption it reports is
	 * one fact about one option, not one per caller.
	 *
	 * @var bool
	 */
	private bool $logged_unusable_selection = false;

	/**
	 * Get the singleton instance.
	 *
	 * @since 0.0.1
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
	 * Resolve the API key for a service.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $service Logical service id (openai|anthropic|google|tavily|youtube).
	 * @return string The key, or '' when unset.
	 */
	public function api_key( string $service ): string {
		// Constant override wins on every backend (parity with the old stack).
		$constant = self::SERVICE_CONSTANTS[ $service ] ?? '';
		if ( '' !== $constant && defined( $constant ) ) {
			$value = constant( $constant );
			if ( is_string( $value ) && '' !== $value ) {
				return $value;
			}
		}

		return $this->backend()->get_api_key( $service );
	}

	/**
	 * Whether a service has a usable key configured.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $service Logical service id.
	 * @return bool
	 */
	public function has_key( string $service ): bool {
		return '' !== $this->api_key( $service );
	}

	/**
	 * The `wp-config.php` constant that overrides a service's key.
	 *
	 * Exposed so callers can tell a site owner what to set on installs that have
	 * no credential screen at all.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $service Logical service id.
	 * @return string Constant name, or '' for an unknown service.
	 */
	public function constant_name( string $service ): string {
		return self::SERVICE_CONSTANTS[ $service ] ?? '';
	}

	/**
	 * Whether this install has an admin screen for entering credentials.
	 *
	 * True only on the Connectors backend, which surfaces keys at Settings →
	 * Connectors. The legacy backend reads an encrypted option that no UI writes,
	 * so there is nowhere to send the user and callers must name the constant
	 * instead of rendering a dead link.
	 *
	 * @since 0.0.1
	 *
	 * @return bool
	 */
	public function has_admin_credential_ui(): bool {
		return $this->backend() instanceof ConnectorsCredentialBackend;
	}

	/**
	 * Get the general-AI provider this site generates through.
	 *
	 * An explicit selection wins. Failing that, a site holding exactly one
	 * generation credential has only one provider it could possibly mean, so that
	 * one is used; anything else — no credential, a choice between two, or a
	 * stored selection this plugin cannot use — resolves to '' and is reported as
	 * an unmet requirement by
	 * `VIPWorkflows\Abilities\AiAvailability::for_selected_provider()`.
	 *
	 * Derivation is reached only when *nothing* is stored. A site that stored a
	 * provider id this plugin does not manage has made a choice, and generating
	 * through some other vendor because that choice cannot be honoured is the
	 * silent substitution this method exists to prevent.
	 *
	 * There is deliberately no default naming a vendor. The option is written in
	 * exactly one place, the provider picker, so connecting a key under Settings →
	 * Connectors and never opening that picker leaves it unset — and a hardcoded
	 * default then told every AI surface on an Anthropic-only site to configure
	 * OpenAI, a vendor its generation never touched. An unset selection is a real
	 * state, and reads better as unmet than as an assumption.
	 *
	 * Resolution scans credentials rather than `available_providers()`, which also
	 * consults the AI Client registry and reports OpenAI as registered whenever
	 * that registry is unreachable. Deriving from it would reintroduce the vendor
	 * guess in exactly the environment where generation cannot run. Whether the
	 * resolved provider is registered is `AiAvailability`'s question, and it asks
	 * the registry directly.
	 *
	 * @since 0.0.1
	 *
	 * @return string Provider id, or '' when no selection can be resolved.
	 */
	public function provider(): string {
		$stored = $this->stored_provider();

		if ( '' !== $stored ) {
			return $stored;
		}

		/*
		 * A stored value this plugin cannot use is corrupt, not absent, and the
		 * two must not share an outcome. Deriving from a lone credential here
		 * would take a site whose administrator *did* choose a vendor and
		 * silently generate through a different one — the substitution this
		 * method was rewritten to remove, reached by a second route. An unset
		 * option falls through to derivation below; an unusable one stops here
		 * and is reported as unmet, exactly as an ambiguous site is.
		 */
		if ( $this->has_stored_selection() ) {
			$this->log_unusable_selection();

			return '';
		}

		if ( null === $this->keyed_provider ) {
			$keyed = array_values( array_filter( self::AI_PROVIDERS, fn ( string $provider ): bool => $this->has_key( $provider ) ) );

			$this->keyed_provider = ( 1 === count( $keyed ) ) ? $keyed[0] : '';
		}

		return $this->keyed_provider;
	}

	/**
	 * Whether an administrator has explicitly chosen a provider.
	 *
	 * Distinct from `provider()` returning non-empty, which is also true of a
	 * selection derived from a lone credential. The settings screen needs the
	 * difference: a derived selection is unsaved, so it must be shown as such and
	 * be savable in one click — otherwise connecting a second key later silently
	 * turns a working site into an ambiguous one with nothing having been chosen.
	 *
	 * @since 0.0.1
	 *
	 * @return bool
	 */
	public function has_explicit_provider(): bool {
		return '' !== $this->stored_provider();
	}

	/**
	 * The explicitly stored provider selection, if there is a usable one.
	 *
	 * Validated against the providers this plugin manages, not merely for being a
	 * non-empty string. The option is hand-editable and is handed on as a provider
	 * id, so an unrecognized value must not be passed on: it reaches
	 * `AiAvailability::for_provider()`, which treats an unmanaged id as a caller
	 * bug and reports it with `_doing_it_wrong()` — programmer-error machinery
	 * aimed at a site owner over their own data — and `AiInference`, which
	 * resolves against the whole AI Client registry rather than this list, so the
	 * two would disagree about what counts as a valid provider.
	 *
	 * Returning '' here means only "there is no usable selection". Whether that is
	 * because none was made or because what was made is unusable is `provider()`'s
	 * to distinguish, via `has_stored_selection()`; the two lead to different
	 * outcomes and only one of them may derive.
	 *
	 * @return string Stored provider id, or '' when unset, malformed, or unmanaged.
	 */
	private function stored_provider(): string {
		$stored = get_option( self::PROVIDER_OPTION, '' );

		if ( ! is_string( $stored ) || ! in_array( $stored, self::AI_PROVIDERS, true ) ) {
			return '';
		}

		return $stored;
	}

	/**
	 * Whether the option holds anything at all, usable or not.
	 *
	 * The question `stored_provider()` cannot answer, because it reports usability
	 * and this reports presence. A site that stored `mistral` has an administrator
	 * who made a choice; that the choice cannot be honoured is a reason to say so,
	 * never a reason to treat them as having chosen nothing and pick for them.
	 *
	 * @return bool
	 */
	private function has_stored_selection(): bool {
		$stored = get_option( self::PROVIDER_OPTION, '' );

		return '' !== $stored && false !== $stored && null !== $stored;
	}

	/**
	 * Report an unusable stored selection to the error log, once per instance.
	 *
	 * A hand-edited or half-migrated option is a data-integrity problem, and the
	 * only symptom it otherwise produces is the generic "No AI provider is
	 * selected" requirement — accurate for the administrator, but it hides the
	 * difference between a site that never chose and a site whose choice is
	 * unreadable. The stored value is logged verbatim when it is a string: it is a
	 * provider id, not a credential.
	 *
	 * @return void
	 */
	private function log_unusable_selection(): void {
		if ( $this->logged_unusable_selection ) {
			return;
		}

		$this->logged_unusable_selection = true;

		$stored = get_option( self::PROVIDER_OPTION, '' );

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging of a data-integrity problem.
		error_log(
			sprintf(
				'[VIP Workflows] %1$s holds %2$s, which is not a provider this plugin manages; no provider will be resolved until one is chosen in VIP Workflows → Settings.',
				self::PROVIDER_OPTION,
				is_string( $stored ) ? '"' . $stored . '"' : 'a value of type ' . gettype( $stored )
			)
		);
	}

	/**
	 * Get the configured model for the selected provider (a preference).
	 *
	 * Reads the per-provider model map. For OpenAI, falls back to the legacy
	 * single-model options so a previously-saved selection survives. A provider
	 * with no stored model returns '' for OpenAI's default to apply, or '' for
	 * other providers so the inference resolver can fall back. Validation
	 * against the live catalog happens at save time, not here.
	 *
	 * @since 0.0.1
	 *
	 * @return string Model identifier ('' when none configured for a non-default provider).
	 */
	public function model(): string {
		$provider = $this->provider();

		$map = get_option( self::MODELS_OPTION, array() );
		if ( is_array( $map ) && isset( $map[ $provider ] ) && is_string( $map[ $provider ] ) && '' !== $map[ $provider ] ) {
			return $map[ $provider ];
		}

		/*
		 * OpenAI by name, and only here: the legacy options below predate
		 * multi-provider support, so what they hold is OpenAI's model by
		 * definition. This is not a default *selection* standing in for an unset
		 * one — `provider()` no longer has one.
		 */
		if ( 'openai' === $provider ) {
			$legacy = get_option( self::MODEL_OPTION, '' );
			if ( is_string( $legacy ) && '' !== $legacy ) {
				return $legacy;
			}
			$legacy_keys = get_option( self::LEGACY_KEYS_OPTION, array() );
			if ( is_array( $legacy_keys ) && ! empty( $legacy_keys['openai_model'] ) ) {
				return (string) $legacy_keys['openai_model'];
			}
			return self::DEFAULT_MODEL;
		}

		return '';
	}

	/**
	 * Generation providers that are both registered in the AI Client and keyed.
	 *
	 * @since 0.0.1
	 *
	 * @return string[] Available provider ids (always includes nothing it can't use).
	 */
	public function available_providers(): array {
		$registry = class_exists( 'WordPress\\AiClient\\AiClient' )
			? \WordPress\AiClient\AiClient::defaultRegistry()
			: null;

		$available = array();
		foreach ( self::AI_PROVIDERS as $provider ) {
			// OpenAI by name because it is the provider the AI Client bundles, so
			// it is the one assumption worth making when the registry cannot be
			// asked. Not a default selection — see `provider()`.
			$registered = ( is_object( $registry ) && method_exists( $registry, 'hasProvider' ) )
				? $registry->hasProvider( $provider )
				: ( 'openai' === $provider );
			if ( $registered && $this->has_key( $provider ) ) {
				$available[] = $provider;
			}
		}
		return $available;
	}

	/**
	 * Resolve (and cache) the active backend by capability.
	 *
	 * Connectors are present natively on WordPress 7.0 and via Gutenberg 23.0+
	 * on 6.9; otherwise fall back to the legacy encrypted-option store.
	 *
	 * @return CredentialBackend
	 */
	private function backend(): CredentialBackend {
		if ( null === $this->backend ) {
			$this->backend = function_exists( 'wp_get_connector' )
				? new ConnectorsCredentialBackend()
				: new LegacyCredentialBackend();
		}
		return $this->backend;
	}

	/**
	 * Override the backend (test seam / advanced override).
	 *
	 * @since 0.0.1
	 *
	 * @param  CredentialBackend|null $backend Backend to use, or null to re-detect.
	 * @return void
	 */
	public function set_backend( ?CredentialBackend $backend ): void {
		$this->backend = $backend;

		// `provider()` derives from the keys this backend holds, so a swap has to
		// re-derive rather than serve the previous backend's answer.
		$this->keyed_provider = null;
	}
}
