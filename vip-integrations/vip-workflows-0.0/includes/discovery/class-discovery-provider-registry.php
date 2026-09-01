<?php
/**
 * Discovery Provider Registry.
 *
 * Singleton registry for story discovery providers. Providers register
 * via the `vip_workflows_register_discovery_providers` action.
 *
 * @package VIPWorkflows\Discovery
 */

declare( strict_types=1 );

namespace VIPWorkflows\Discovery;

use VIPWorkflows\Abilities\Availability;

/**
 * Discovery Provider Registry.
 */
class DiscoveryProviderRegistry {

	/**
	 * Singleton instance.
	 *
	 * @var mixed
	 */
	private static ?self $instance = null;

	/**
	 * Registered providers keyed by slug.
	 *
	 * @var array<string, array>
	 */
	private array $providers = array();

	/**
	 * Initialized.
	 *
	 * @var bool
	 */
	private bool $initialized = false;

	/**
	 * Construct the DiscoveryProviderRegistry instance.
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
	 * Ensure providers have been collected from extensions.
	 */
	private function maybe_init(): void {
		if ( $this->initialized ) {
			return;
		}

		$this->initialized = true;

		/**
		 * Fires to let plugins register discovery providers.
		 *
		 * @param DiscoveryProviderRegistry $registry The registry instance.
		 */
		do_action( 'vip_workflows_register_discovery_providers', $this );
	}

	/**
	 * Register a discovery provider.
	 *
	 * @param string $slug   Unique provider slug (e.g. 'foresight-news').
	 * @param array  $args {
	 *     Provider configuration.
	 *
	 *     @type string   $label                 Human-readable name.
	 *     @type string   $description           Short description.
	 *     @type string   $icon                  Dashicon name or emoji.
	 *     @type string[] $features              Supported features: 'recommend', 'search'.
	 *     @type array    $callbacks              {
	 *         @type callable $recommend          Returns prompts for the landing page.
	 *         @type callable $search             Returns prompts matching a query.
	 *         @type callable $filters            Returns search filter definitions.
	 *         @type callable $seed               Composes a seed string from a prompt.
	 *     }
	 *     @type callable  $availability_callback Returns bool for whether provider is configured, or a
	 *                                            `VIPWorkflows\Abilities\Availability` naming the unmet
	 *                                            requirements so the Agents card can say what is missing.
	 * }
	 * @return bool True if registered, false if slug already taken.
	 */
	public function register( string $slug, array $args ): bool {
		if ( isset( $this->providers[ $slug ] ) ) {
			return false;
		}

		$required = array( 'label', 'features', 'callbacks' );
		foreach ( $required as $key ) {
			if ( empty( $args[ $key ] ) ) {
				_doing_it_wrong(
					__METHOD__,
					sprintf( 'Discovery provider "%s" is missing required key "%s".', esc_html( $slug ), esc_html( $key ) ),
					'1.0.0'
				);
				return false;
			}
		}

		$features = (array) $args['features'];
		$callbacks = (array) $args['callbacks'];

		if ( in_array( 'recommend', $features, true ) && ! is_callable( $callbacks['recommend'] ?? null ) ) {
			_doing_it_wrong( __METHOD__, sprintf( 'Provider "%s" declares "recommend" but has no callable recommend callback.', esc_html( $slug ) ), '1.0.0' );
			return false;
		}

		if ( in_array( 'search', $features, true ) && ! is_callable( $callbacks['search'] ?? null ) ) {
			_doing_it_wrong( __METHOD__, sprintf( 'Provider "%s" declares "search" but has no callable search callback.', esc_html( $slug ) ), '1.0.0' );
			return false;
		}

		if ( in_array( 'search', $features, true ) && ! is_callable( $callbacks['filters'] ?? null ) ) {
			_doing_it_wrong( __METHOD__, sprintf( 'Provider "%s" declares "search" but has no callable filters callback.', esc_html( $slug ) ), '1.0.0' );
			return false;
		}

		if ( ! is_callable( $callbacks['seed'] ?? null ) ) {
			_doing_it_wrong( __METHOD__, sprintf( 'Provider "%s" is missing a callable seed callback.', esc_html( $slug ) ), '1.0.0' );
			return false;
		}

		$this->providers[ $slug ] = array(
			'slug'                  => $slug,
			'label'                 => (string) $args['label'],
			'description'           => (string) ( $args['description'] ?? '' ),
			'icon'                  => (string) ( $args['icon'] ?? '' ),
			'features'              => $features,
			'callbacks'             => $callbacks,
			'availability_callback' => $args['availability_callback'] ?? null,
		);

		return true;
	}

	/**
	 * Get all registered providers.
	 *
	 * @return array<string, array>
	 */
	public function get_all(): array {
		$this->maybe_init();
		return $this->providers;
	}

	/**
	 * Get a single provider by slug.
	 *
	 * @param string $slug Provider slug.
	 * @return array|null Provider data or null.
	 */
	public function get( string $slug ): ?array {
		$this->maybe_init();
		return $this->providers[ $slug ] ?? null;
	}

	/**
	 * Get providers that support a given feature.
	 *
	 * @param string $feature Feature name ('recommend' or 'search').
	 * @return array<string, array> Filtered providers.
	 */
	public function get_by_feature( string $feature ): array {
		return array_filter(
			$this->get_all(),
			function ( array $provider ) use ( $feature ) {
				return in_array( $feature, $provider['features'], true );
			}
		);
	}

	/**
	 * Check if a provider is available (configured and operational).
	 *
	 * @param string $slug Provider slug.
	 * @return bool
	 */
	public function is_available( string $slug ): bool {
		return $this->get_availability( $slug )->is_available();
	}

	/**
	 * Resolve a provider's dependencies, with the reasons any are unmet.
	 *
	 * Mirrors `Ability::get_availability()` so the Agents surface can aggregate
	 * requirements from abilities and discovery providers through one shape. As
	 * there, the callback may return an `Availability` to explain what is
	 * missing, or a plain bool as before; every other return type is coerced to
	 * bool exactly as it always was.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $slug Provider slug.
	 * @return Availability
	 */
	public function get_availability( string $slug ): Availability {
		$provider = $this->get( $slug );
		if ( ! $provider ) {
			return Availability::unmet();
		}

		$callback = $provider['availability_callback'];
		if ( ! is_callable( $callback ) ) {
			return Availability::available();
		}

		return Availability::from_callback_return( call_user_func( $callback ) );
	}

	/**
	 * Get available providers that support a given feature.
	 *
	 * @param string $feature Feature name.
	 * @return array<string, array>
	 */
	public function get_available_by_feature( string $feature ): array {
		return array_filter(
			$this->get_by_feature( $feature ),
			function ( array $provider ) {
				return $this->is_available( $provider['slug'] );
			}
		);
	}

	/**
	 * Execute a provider callback.
	 *
	 * @param string $slug     Provider slug.
	 * @param string $callback Callback name (recommend, search, filters, seed).
	 * @param mixed  ...$args  Arguments to pass.
	 * @return mixed Callback return value.
	 * @throws \InvalidArgumentException If provider or callback not found.
	 */
	public function execute( string $slug, string $callback, mixed ...$args ): mixed {
		$provider = $this->get( $slug );
		if ( ! $provider ) {
			throw new \InvalidArgumentException( sprintf( 'Discovery provider "%s" not found.', esc_html( $slug ) ) );
		}

		$callable = $provider['callbacks'][ $callback ] ?? null;
		if ( ! is_callable( $callable ) ) {
			throw new \InvalidArgumentException( sprintf( 'Discovery provider "%s" has no callable "%s" callback.', esc_html( $slug ), esc_html( $callback ) ) );
		}

		return call_user_func_array( $callable, $args );
	}
}
