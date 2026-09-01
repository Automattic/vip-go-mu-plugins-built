<?php
/**
 * Availability of AI text generation through a named provider.
 *
 * Four things have to be true before an ability can generate text, and each
 * needs different copy: a provider has to be resolvable at all — an unset
 * selection on a site with no credential, or with two, is nobody's to guess —
 * that provider must be registered with the WordPress AI Client, a code-level
 * gap nothing a site owner types will fix, it must have a credential, and a
 * model must be chosen for it. Every AI-backed ability needs the same four
 * checks, so deriving them once here is what keeps the answer identical across
 * abilities and, more importantly, identical to what `AiInference::model()`
 * requires at runtime: those are the exact conditions under which it returns a
 * usable model rather than null.
 *
 * The check deliberately stops at *configuration*. Whether a key is still valid
 * can only be learned by calling the provider, and `AiClient::isConfigured()`
 * does exactly that — a live list-models round trip. An availability callback
 * runs on every Tools-page read, so it must not make network calls; a present
 * but revoked key therefore reports available and fails at execution, which is
 * the only honest split.
 *
 * Lives in `VIPWorkflows\Abilities` rather than `VIPWorkflows\AI` because what it
 * returns is the abilities availability contract — `Availability`,
 * `RequirementGroup`, `Requirement` — and it sits at the same level as
 * `RequirementFactory`, which already reaches into `VIPWorkflows\AI\Credentials`
 * for the same reason. The dependency direction is unchanged.
 *
 * @package VIPWorkflows\Abilities
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

use VIPWorkflows\AI\Credentials;

/**
 * Resolves whether a generation provider can be used, and what is missing if not.
 */
final class AiAvailability {

	/**
	 * Prefix for the "the AI Client cannot offer this provider" requirement id.
	 */
	private const ENVIRONMENT_ID_PREFIX = 'environment:ai-provider:';

	/**
	 * Prefix for the "no model chosen for this provider" requirement id.
	 */
	private const MODEL_ID_PREFIX = 'settings:ai-model:';

	/**
	 * Id for the "no provider could be resolved" requirement.
	 *
	 * Unprefixed, because unlike the other two it is not about any one provider —
	 * naming one would be the bug it exists to prevent.
	 */
	private const PROVIDER_ID = 'settings:ai-provider:none';

	/**
	 * Admin page holding the provider + model pickers.
	 */
	private const SETTINGS_PAGE = 'admin.php?page=vip-workflows-settings';

	/**
	 * Display names for the generation providers this plugin manages.
	 *
	 * Brand names, so untranslated. Mirrors `PROVIDER_LABELS` in
	 * `src/admin/components/AiModelSettings.js` so a requirement card and the
	 * provider picker name the same provider the same way.
	 *
	 * @var array<string, string>
	 */
	private const PROVIDER_LABELS = array(
		'openai'    => 'OpenAI',
		'anthropic' => 'Anthropic',
		'google'    => 'Google',
	);

	/**
	 * Not instantiable; the check is stateless.
	 */
	private function __construct() {}

	/**
	 * Whether text generation through the admin-selected provider is configured.
	 *
	 * The entry point for everything that generates through `AiInference`, which
	 * honors the selected provider. Asking about a hardcoded provider instead is
	 * what produced the reported bug: a site running Anthropic was told to
	 * configure OpenAI, a vendor its generation never touched.
	 *
	 * @since 0.0.1
	 *
	 * @param  string[] $sources Labels of the abilities needing generation.
	 * @return bool|Availability True when generation is configured, otherwise the
	 *                          unmet requirements.
	 */
	public static function for_selected_provider( array $sources = array() ): bool|Availability {
		$provider = Credentials::get_instance()->provider();

		/*
		 * Handled here rather than in `for_provider()` because the two empty
		 * strings mean different things. `Credentials::provider()` returns '' for
		 * a site condition an administrator can fix — nothing selected, and
		 * nothing derivable from a lone credential — whereas a caller passing ''
		 * to `for_provider()` has a bug, which that method reports as one. Routing
		 * this through it would file a real configuration gap as programmer error
		 * and emit `_doing_it_wrong()` at a site owner.
		 */
		if ( '' === $provider ) {
			return Availability::unmet(
				RequirementGroup::all( self::missing_provider( $sources ) )
			);
		}

		return self::for_provider( $provider, $sources );
	}

	/**
	 * Bool-only form of the check, for callers whose contract is a bare bool.
	 *
	 * The ideation assistants expose `is_available(): bool` and are not abilities,
	 * so they have no `availability_callback` to return the structured shape
	 * through. Delegating keeps one implementation rather than a second, drifting
	 * copy of the same three conditions.
	 *
	 * @since 0.0.1
	 *
	 * @param  string|null $provider Provider id, or null for the selected one.
	 * @return bool
	 */
	public static function is_configured( ?string $provider = null ): bool {
		$availability = null === $provider
			? self::for_selected_provider()
			: self::for_provider( $provider );

		return true === $availability;
	}

	/**
	 * A register-neutral line naming the provider that is not configured.
	 *
	 * For a surface that *persists* its failure — the ideation assistants' result
	 * arrays are written to project meta, which outlives the request and has no
	 * reader at write time. Rendering either message register there would freeze
	 * one audience's wording (see `AvailabilitySerializer::to_persistable()`), so
	 * this names the vendor and stops: no destination, no "ask an administrator".
	 * Which requirement is unmet still travels as structured identity alongside it.
	 *
	 * @since 0.0.1
	 *
	 * @param  string|null $provider Provider id, or null for the selected one.
	 * @return string
	 */
	public static function unconfigured_notice( ?string $provider = null ): string {
		$provider = $provider ?? Credentials::get_instance()->provider();
		$label    = self::PROVIDER_LABELS[ $provider ] ?? '';

		if ( '' === $label ) {
			// Nothing to name, in either of the two ways that happens: no provider
			// resolved at all, or one this plugin does not manage. The vendor-free
			// sentence is the honest answer to both.
			return __( 'AI text generation is not configured.', 'vip-workflows' );
		}

		return sprintf(
			/* translators: %s: AI provider display name, e.g. "Anthropic". */
			__( '%s is not configured.', 'vip-workflows' ),
			$label
		);
	}

	/**
	 * Whether text generation through a named provider is configured.
	 *
	 * Ordered so the reader is never sent somewhere useless: a provider the AI
	 * Client cannot offer is reported first, because adding its key would not make
	 * generation work; then the credential; then the model, which cannot even be
	 * chosen until the first two hold.
	 *
	 * Prefer `for_selected_provider()`. Name a provider explicitly only when the
	 * caller generates through that provider specifically rather than through
	 * `AiInference`.
	 *
	 * @since 0.0.1
	 *
	 * @param  string   $provider Generation provider id (one of Credentials::AI_PROVIDERS).
	 * @param  string[] $sources  Labels of the abilities needing generation.
	 * @return bool|Availability True when generation is configured, otherwise the
	 *                          unmet requirements.
	 */
	public static function for_provider( string $provider, array $sources = array() ): bool|Availability {
		$label = self::PROVIDER_LABELS[ $provider ] ?? '';

		if ( '' === $label ) {
			/*
			 * A caller bug, not a site condition: there is no credential to name
			 * and no destination to offer for a provider this plugin knows nothing
			 * about. Reporting unavailable with no requirement — the same shape a
			 * bare `false` produces — is the only honest answer, and it cannot
			 * produce a false "available" the way returning true would.
			 */
			_doing_it_wrong(
				__METHOD__,
				sprintf(
					'AiAvailability::for_provider() was asked about "%s", which is not one of VIP Workflows\'s generation providers (%s). Reporting the ability as unavailable with no requirement, because there is nothing to name or link to.',
					esc_html( $provider ),
					esc_html( implode( ', ', Credentials::AI_PROVIDERS ) )
				),
				'1.0.0'
			);

			return Availability::unmet();
		}

		if ( ! self::provider_is_registered( $provider ) ) {
			return Availability::unmet(
				RequirementGroup::all(
					RequirementFactory::unsupported_environment(
						self::ENVIRONMENT_ID_PREFIX . $provider,
						sprintf(
							/* translators: %s: AI provider display name, e.g. "OpenAI". */
							__( 'The %s provider is not registered with this site\'s WordPress AI Client, so text generation cannot run through it.', 'vip-workflows' ),
							$label
						),
						__( 'AI text generation is not available on this site.', 'vip-workflows' ),
						$sources
					)
				)
			);
		}

		$credentials = Credentials::get_instance();

		if ( ! $credentials->has_key( $provider ) ) {
			return Availability::unmet(
				RequirementGroup::all(
					RequirementFactory::missing_credential( $provider, $label, $sources )
				)
			);
		}

		/*
		 * Last, because it is the only one of the three the administrator cannot
		 * even attempt first: the provider picker offers only providers from
		 * `Credentials::available_providers()` (registered *and* keyed), and the
		 * model list is built per provider from the same set — so there is no model
		 * to choose until the two checks above pass.
		 *
		 * Checked at all because `AiInference::model()` returns null on an empty
		 * model id, and `Credentials::model()` returns '' for any non-default
		 * provider with nothing stored. Selecting Anthropic without saving a model
		 * is an ordinary way to reach that, and before the OpenAI fallback was
		 * removed it was invisible.
		 */
		if ( '' === self::model_for( $provider ) ) {
			return Availability::unmet(
				RequirementGroup::all( self::missing_model( $provider, $label, $sources ) )
			);
		}

		return true;
	}

	/**
	 * The model configured for a provider.
	 *
	 * `Credentials::model()` answers for the *selected* provider only, so asking
	 * about any other one has to read the same per-provider map it reads.
	 *
	 * @param  string $provider Provider id.
	 * @return string Model id, or '' when none is configured.
	 */
	private static function model_for( string $provider ): string {
		$credentials = Credentials::get_instance();

		if ( $provider === $credentials->provider() ) {
			return $credentials->model();
		}

		$map = get_option( 'vip_workflows_ai_models', array() );

		if ( ! is_array( $map ) || ! isset( $map[ $provider ] ) || ! is_string( $map[ $provider ] ) ) {
			return '';
		}

		return $map[ $provider ];
	}

	/**
	 * The "no provider selected" requirement, pointed at this plugin's own settings.
	 *
	 * Deliberately names no vendor in either register. Every other requirement in
	 * this class can say which provider is short of something; this one is raised
	 * precisely because that question has no answer yet, and filling the gap with
	 * a guess is the bug it replaces.
	 *
	 * Reached in two states, both of which the same sentence describes: a site with
	 * no generation credential at all, and a site holding two, where an
	 * administrator has a real choice to make and nothing may make it for them.
	 *
	 * @param  string[] $sources Labels of the abilities needing generation.
	 * @return Requirement
	 */
	private static function missing_provider( array $sources ): Requirement {
		return new Requirement(
			self::PROVIDER_ID,
			Requirement::KIND_DEPENDENCY,
			__( 'No AI provider is selected.', 'vip-workflows' ),
			__( 'AI text generation has no provider selected. Ask an administrator to finish setting it up.', 'vip-workflows' ),
			Destination::admin_url(
				admin_url( self::SETTINGS_PAGE ),
				__( 'VIP Workflows → Settings', 'vip-workflows' ),
				__( 'Choose an AI provider in VIP Workflows → Settings.', 'vip-workflows' )
			),
			$sources
		);
	}

	/**
	 * The "no model chosen" requirement, pointed at this plugin's own settings.
	 *
	 * Built here rather than through `RequirementFactory` because the destination
	 * is neither a credential screen nor an agent card: it is VIP Workflows' own
	 * settings page, which this plugin always registers, so it is resolved through
	 * `admin_url()` rather than hardcoded and cannot go dead.
	 *
	 * @param  string   $provider Provider id.
	 * @param  string   $label    Provider display name.
	 * @param  string[] $sources  Labels of the abilities needing generation.
	 * @return Requirement
	 */
	private static function missing_model( string $provider, string $label, array $sources ): Requirement {
		return new Requirement(
			self::MODEL_ID_PREFIX . $provider,
			Requirement::KIND_DEPENDENCY,
			sprintf(
				/* translators: %s: AI provider display name, e.g. "Anthropic". */
				__( '%s is connected, but no model is chosen for it.', 'vip-workflows' ),
				$label
			),
			sprintf(
				/* translators: %s: AI provider display name, e.g. "Anthropic". */
				__( '%s has no model chosen. Ask an administrator to finish setting it up.', 'vip-workflows' ),
				$label
			),
			Destination::admin_url(
				admin_url( self::SETTINGS_PAGE ),
				__( 'VIP Workflows → Settings', 'vip-workflows' ),
				sprintf(
					/* translators: %s: AI provider display name, e.g. "Anthropic". */
					__( 'Choose a model for %s in VIP Workflows → Settings.', 'vip-workflows' ),
					$label
				)
			),
			$sources
		);
	}

	/**
	 * Whether the AI Client can offer the provider at all.
	 *
	 * Mirrors the registration test `Plugin::init_ai_client()` applies before it
	 * hands a provider its key: a provider the registry does not have never gets
	 * authenticated, so a key stored for it can never reach a request. Answering
	 * from the registry rather than from `Credentials::available_providers()` is
	 * deliberate — that method treats OpenAI as registered whenever the registry
	 * is unreachable, which is exactly the case where generation cannot run, so
	 * reusing it here would manufacture a false "available".
	 *
	 * @param  string $provider Generation provider id.
	 * @return bool
	 */
	private static function provider_is_registered( string $provider ): bool {
		if ( ! class_exists( 'WordPress\\AiClient\\AiClient' ) ) {
			return false;
		}

		$registry = \WordPress\AiClient\AiClient::defaultRegistry();

		if ( ! is_object( $registry ) || ! method_exists( $registry, 'hasProvider' ) ) {
			return false;
		}

		return (bool) $registry->hasProvider( $provider );
	}
}
