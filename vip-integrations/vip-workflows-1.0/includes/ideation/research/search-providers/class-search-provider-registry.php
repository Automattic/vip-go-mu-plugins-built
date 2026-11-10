<?php
/**
 * Search Provider Registry.
 *
 * Manages available search providers and selection.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Ideation\Research\SearchProviders;

/**
 * Registry for search providers.
 */
class SearchProviderRegistry {


	/**
	 * Option name for storing the selected provider.
	 */
	private const OPTION_NAME = 'vip_workflows_search_provider';

	/**
	 * Default provider ID.
	 */
	private const DEFAULT_PROVIDER = 'tavily';

	/**
	 * Singleton instance.
	 *
	 * @var SearchProviderRegistry|null
	 */
	private static ?SearchProviderRegistry $instance = null;

	/**
	 * Registered providers.
	 *
	 * @var array<string, SearchProviderInterface>
	 */
	private array $providers = array();

	/**
	 * Get singleton instance.
	 *
	 * @return SearchProviderRegistry
	 */
	public static function get_instance(): SearchProviderRegistry {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Private constructor.
	 */
	private function __construct() {
		$this->register_default_providers();
	}

	/**
	 * Register default providers.
	 */
	private function register_default_providers(): void {
		$this->register( new TavilyProvider() );

		/**
		 * Fires when search providers should be registered.
		 *
		 * @param SearchProviderRegistry $registry The provider registry.
		 */
		do_action( 'vip_workflows_register_search_providers', $this );
	}

	/**
	 * Register a search provider.
	 *
	 * @param SearchProviderInterface $provider The provider to register.
	 * @return bool True if registered, false if ID already exists.
	 */
	public function register( SearchProviderInterface $provider ): bool {
		$id = $provider->get_id();

		if ( isset( $this->providers[ $id ] ) ) {
			return false;
		}

		$this->providers[ $id ] = $provider;
		return true;
	}

	/**
	 * Get a provider by ID.
	 *
	 * @param string $id Provider ID.
	 * @return SearchProviderInterface|null Provider or null if not found.
	 */
	public function get( string $id ): ?SearchProviderInterface {
		return $this->providers[ $id ] ?? null;
	}

	/**
	 * Get all registered providers.
	 *
	 * @return array<string, SearchProviderInterface>
	 */
	public function get_all(): array {
		return $this->providers;
	}

	/**
	 * Get the currently selected provider ID.
	 *
	 * @return string Provider ID.
	 */
	public function get_selected_id(): string {
		$selected = get_option( self::OPTION_NAME, self::DEFAULT_PROVIDER );

		if ( ! isset( $this->providers[ $selected ] ) ) {
			return self::DEFAULT_PROVIDER;
		}

		return $selected;
	}

	/**
	 * Get the currently selected provider.
	 *
	 * @return SearchProviderInterface|null Provider or null if none available.
	 */
	public function get_selected(): ?SearchProviderInterface {
		$id = $this->get_selected_id();
		return $this->get( $id );
	}

	/**
	 * Set the selected provider.
	 *
	 * @param string $id Provider ID.
	 * @return bool True if set, false if provider doesn't exist.
	 */
	public function set_selected( string $id ): bool {
		if ( ! isset( $this->providers[ $id ] ) ) {
			return false;
		}

		update_option( self::OPTION_NAME, $id, false );
		return true;
	}

	/**
	 * Get the option name for the selected provider setting.
	 *
	 * @return string
	 */
	public static function get_option_name(): string {
		return self::OPTION_NAME;
	}
}
