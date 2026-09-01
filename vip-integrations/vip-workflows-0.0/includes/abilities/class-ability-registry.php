<?php
/**
 * Ability registry.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * Registry for internal abilities (fallback when WP Abilities API not available).
 */
class AbilityRegistry {


	/**
	 * Registered abilities.
	 *
	 * @var array<string, Ability>
	 */
	private array $abilities = array();

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Get singleton instance.
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
	 * Register an Ability.
	 *
	 * @param  Ability $ability The ability to register.
	 * @throws \InvalidArgumentException If ability name already registered.
	 */
	public function register_ability( Ability $ability ): void {
		$name = $ability->get_name();

		if ( isset( $this->abilities[ $name ] ) ) {
			throw new \InvalidArgumentException(
				/* translators: %s: ability name. */
				sprintf( esc_html__( 'Ability "%s" is already registered.', 'vip-workflows' ), esc_html( $name ) )
			);
		}

		$this->abilities[ $name ] = $ability;
	}

	/**
	 * Get an ability by name.
	 *
	 * @param  string $name Ability name.
	 * @return Ability|null
	 */
	public function get( string $name ): ?Ability {
		return $this->abilities[ $name ] ?? null;
	}

	/**
	 * Check if ability exists.
	 *
	 * @param  string $name Ability name.
	 * @return bool
	 */
	public function has( string $name ): bool {
		return isset( $this->abilities[ $name ] );
	}

	/**
	 * Get all registered abilities.
	 *
	 * @return array<string, Ability>
	 */
	public function get_all(): array {
		return $this->abilities;
	}

	/**
	 * Get abilities by category.
	 *
	 * @param  string $category Category to filter by.
	 * @return array<string, Ability>
	 */
	public function get_by_category( string $category ): array {
		return array_filter(
			$this->abilities,
			fn( Ability $ability ) => $ability->get_category() === $category
		);
	}

	/**
	 * Get enabled abilities only.
	 *
	 * @return array<string, Ability>
	 */
	public function get_enabled(): array {
		$settings = AbilitySettings::get_instance();
		return array_filter(
			$this->abilities,
			fn( Ability $ability ) => $settings->is_enabled( $ability->get_name() )
		);
	}

	/**
	 * Get all abilities as array for API response.
	 *
	 * @param  bool $enabled_only Only return enabled abilities.
	 * @return array
	 */
	public function to_array( bool $enabled_only = true ): array {
		$settings  = AbilitySettings::get_instance();
		$abilities = $enabled_only ? $this->get_enabled() : $this->abilities;

		return array_map(
			function ( Ability $ability ) use ( $settings ) {
				$data            = $ability->to_array();
				$data['enabled'] = $settings->is_enabled( $ability->get_name() );
				$data['id']      = $data['name'];
				$data['schema']  = $data['input_schema'];
				return $data;
			},
			$abilities
		);
	}

	/**
	 * Unregister an ability.
	 *
	 * @param  string $name Ability name.
	 * @return bool True if unregistered, false if not found.
	 */
	public function unregister( string $name ): bool {
		if ( isset( $this->abilities[ $name ] ) ) {
			unset( $this->abilities[ $name ] );
			return true;
		}
		return false;
	}

	/**
	 * Clear all abilities (primarily for testing).
	 */
	public function clear(): void {
		$this->abilities = array();
	}
}
