<?php
/**
 * AI inference resolver.
 *
 * Returns the bundled AI Client model object for the admin-selected provider +
 * model, so general-AI call sites stop hardcoding OpenAiProvider. The provider
 * class is resolved from the AI Client registry by id.
 *
 * An unresolvable selection returns null rather than substituting another
 * vendor. This deliberately replaced an OpenAI fallback: `Plugin::init_ai_client()`
 * authenticates *every* keyed provider, not only the selected one, so on a site
 * holding an OpenAI key the fallback did not fail — it silently sent editorial
 * content to a vendor the administrator had not chosen. It was reachable through
 * ordinary configuration, because the settings endpoint persists provider and
 * model independently: selecting Anthropic without also saving a model left
 * `Credentials::model()` empty, and every generation in the plugin went to
 * OpenAI. Bailing is both the honest answer and the one the availability gate
 * can describe — see `VIPWorkflows\Abilities\AiAvailability`, which reports the
 * same three conditions this resolver requires.
 *
 * @package VIPWorkflows\AI
 */

declare( strict_types=1 );

namespace VIPWorkflows\AI;

/**
 * Resolves the provider+model for general AI generation.
 */
final class AiInference {

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Diagnostics already emitted this request, keyed by message.
	 *
	 * `model()` is called once per generation and several times over one ideation
	 * run, so an unresolvable selection would otherwise report itself in dozens of
	 * copies and bury the one line that matters.
	 *
	 * @var array<string, true>
	 */
	private static array $reported = array();

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
	 * Build the AI Client model object for the selected provider + model.
	 *
	 * @since 0.0.1
	 *
	 * @return mixed The provider model object for usingModel(), or null when the
	 *               selected provider or model is unresolvable (the caller's AI
	 *               call then fails gracefully via its existing try/catch).
	 */
	public function model() {
		$creds    = Credentials::get_instance();
		$provider = $creds->provider();
		$model_id = $creds->model();

		if ( '' === $provider ) {
			self::report(
				'No AI provider is selected, and none could be derived from this site\'s credentials, so no model can be resolved and generation will fail. Choose a provider in VIP Workflows settings.'
			);

			return null;
		}

		$class = $this->provider_class( $provider );

		if ( null === $class ) {
			self::report(
				sprintf(
					'The selected AI provider "%s" is not registered with the WordPress AI Client, so no model can be resolved and generation will fail. Select a registered provider in VIP Workflows settings.',
					$provider
				)
			);

			return null;
		}

		if ( '' === $model_id ) {
			self::report(
				sprintf(
					'No model is configured for the selected AI provider "%s", so no model can be resolved and generation will fail. Choose a model in VIP Workflows settings.',
					$provider
				)
			);

			return null;
		}

		return $class::model( $model_id );
	}

	/**
	 * Report an unresolvable selection once per request.
	 *
	 * @param  string $message Diagnostic text.
	 * @return void
	 */
	private static function report( string $message ): void {
		if ( isset( self::$reported[ $message ] ) ) {
			return;
		}

		self::$reported[ $message ] = true;

		_doing_it_wrong( __CLASS__ . '::model', esc_html( $message ), '1.0.0' );
	}

	/**
	 * Resolve a provider's class name from the AI Client registry.
	 *
	 * @param  string $provider Provider id (e.g. 'openai', 'anthropic').
	 * @return string|null Provider class, or null if not registered/available.
	 */
	private function provider_class( string $provider ): ?string {
		if ( ! class_exists( 'WordPress\\AiClient\\AiClient' ) ) {
			return null;
		}

		$registry = \WordPress\AiClient\AiClient::defaultRegistry();
		if ( ! is_object( $registry ) || ! method_exists( $registry, 'getProviderClassName' ) ) {
			return null;
		}

		/*
		 * The real registry throws on an id it does not hold rather than returning
		 * null, so an unregistered provider has to be asked about before it is
		 * looked up. Callers are documented a null return and fail gracefully
		 * around it; letting an exception out of here instead would surface as an
		 * uncaught fatal on the first generation of an unconfigured site.
		 */
		if ( method_exists( $registry, 'hasProvider' ) && ! $registry->hasProvider( $provider ) ) {
			return null;
		}

		$class = $registry->getProviderClassName( $provider );

		return ( is_string( $class ) && '' !== $class && class_exists( $class ) ) ? $class : null;
	}
}
