<?php
/**
 * Ability settings management.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities;

/**
 * Manages ability settings (enabled/disabled, options).
 */
class AbilitySettings {


	/**
	 * Option name for storing settings.
	 */
	private const OPTION_NAME = 'vip_workflows_ability_settings';

	/**
	 * Singleton instance.
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Cached settings.
	 *
	 * @var array|null
	 */
	private ?array $settings = null;

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
	 * Get all settings.
	 *
	 * @return array
	 */
	public function get_all(): array {
		if ( null === $this->settings ) {
			$this->settings = get_option( self::OPTION_NAME, array() );
		}
		return $this->settings;
	}

	/**
	 * Get settings for a specific ability.
	 *
	 * @param  string $ability_id Ability ID.
	 * @return array Settings with 'enabled', 'options', 'check_modes', 'show_in_commands', and 'transition_eligible' keys.
	 */
	public function get( string $ability_id ): array {
		$all = $this->get_all();
		$defaults = array(
			'enabled'             => true,
			'options'             => array(),
			'check_modes'         => array(), // Per-option check modes: 'soft' or 'hard'.
			'show_in_commands'    => null, // null = use ability meta default (false if unset).
			'transition_eligible' => null, // null = use ability meta default (false if unset).
		);
		return array_merge( $defaults, $all[ $ability_id ] ?? array() );
	}

	/**
	 * Get check mode for a specific option within an ability.
	 *
	 * @param  string $ability_id Ability ID.
	 * @param  string $option_key Option key.
	 * @return string 'soft' or 'hard'
	 */
	public function get_check_mode( string $ability_id, string $option_key ): string {
		$settings = $this->get( $ability_id );
		return $settings['check_modes'][ $option_key ] ?? 'soft';
	}

	/**
	 * Check if a specific option is a hard check.
	 *
	 * @param  string $ability_id Ability ID.
	 * @param  string $option_key Option key.
	 * @return bool
	 */
	public function is_hard_check( string $ability_id, string $option_key ): bool {
		return 'hard' === $this->get_check_mode( $ability_id, $option_key );
	}

	/**
	 * Get all hard checks for an ability.
	 *
	 * @param  string $ability_id Ability ID.
	 * @return array List of option keys that are hard checks.
	 */
	public function get_hard_checks( string $ability_id ): array {
		$settings = $this->get( $ability_id );
		$hard_checks = array();
		foreach ( $settings['check_modes'] as $key => $mode ) {
			if ( 'hard' === $mode ) {
				$hard_checks[] = $key;
			}
		}
		return $hard_checks;
	}

	/**
	 * Check if an ability is enabled.
	 *
	 * @param  string $ability_id Ability ID.
	 * @return bool
	 */
	public function is_enabled( string $ability_id ): bool {
		$settings = $this->get( $ability_id );
		return $settings['enabled'] ?? true;
	}

	/**
	 * Check if an ability should show in command palette.
	 *
	 * @param  string $ability_id   Ability ID.
	 * @param  bool   $meta_default Default from ability meta (used when no saved setting exists).
	 * @return bool
	 */
	public function show_in_commands( string $ability_id, bool $meta_default = false ): bool {
		$settings = $this->get( $ability_id );
		return $settings['show_in_commands'] ?? $meta_default;
	}

	/**
	 * Get options for an ability.
	 *
	 * @param  string $ability_id Ability ID.
	 * @return array
	 */
	public function get_options( string $ability_id ): array {
		$settings = $this->get( $ability_id );
		return $settings['options'] ?? array();
	}

	/**
	 * Update settings for an ability.
	 *
	 * @param  string $ability_id Ability ID.
	 * @param  array  $settings   Settings to update.
	 * @return bool
	 */
	public function update( string $ability_id, array $settings ): bool {
		$all = $this->get_all();

		// Merge with existing settings.
		$existing = $all[ $ability_id ] ?? array(
			'enabled'     => true,
			'options'     => array(),
			'check_modes' => array(),
		);

		if ( isset( $settings['enabled'] ) ) {
			$existing['enabled'] = (bool) $settings['enabled'];
		}

		if ( isset( $settings['options'] ) && is_array( $settings['options'] ) ) {
			$existing['options'] = array_merge( $existing['options'] ?? array(), $settings['options'] );
		}

		if ( isset( $settings['check_modes'] ) && is_array( $settings['check_modes'] ) ) {
			foreach ( $settings['check_modes'] as $key => $mode ) {
				$existing['check_modes'][ $key ] = in_array( $mode, array( 'soft', 'hard' ), true ) ? $mode : 'soft';
			}
		}

		if ( array_key_exists( 'show_in_commands', $settings ) ) {
			$existing['show_in_commands'] = (bool) $settings['show_in_commands'];
		}

		if ( array_key_exists( 'transition_eligible', $settings ) ) {
			$existing['transition_eligible'] = (bool) $settings['transition_eligible'];
		}

		$all[ $ability_id ] = $existing;
		$this->settings = $all;

		return update_option( self::OPTION_NAME, $all );
	}

	/**
	 * Update multiple abilities at once.
	 *
	 * @param  array $settings Array of ability_id => settings.
	 * @return bool
	 */
	public function update_bulk( array $settings ): bool {
		$all = $this->get_all();

		foreach ( $settings as $ability_id => $ability_settings ) {
			$existing = $all[ $ability_id ] ?? array(
				'enabled'     => true,
				'options'     => array(),
				'check_modes' => array(),
			);

			if ( isset( $ability_settings['enabled'] ) ) {
				$existing['enabled'] = (bool) $ability_settings['enabled'];
			}

			if ( isset( $ability_settings['options'] ) && is_array( $ability_settings['options'] ) ) {
				$existing['options'] = array_merge( $existing['options'] ?? array(), $ability_settings['options'] );
			}

			if ( isset( $ability_settings['check_modes'] ) && is_array( $ability_settings['check_modes'] ) ) {
				foreach ( $ability_settings['check_modes'] as $key => $mode ) {
					$existing['check_modes'][ $key ] = in_array( $mode, array( 'soft', 'hard' ), true ) ? $mode : 'soft';
				}
			}

			if ( array_key_exists( 'show_in_commands', $ability_settings ) ) {
				$existing['show_in_commands'] = (bool) $ability_settings['show_in_commands'];
			}

			if ( array_key_exists( 'transition_eligible', $ability_settings ) ) {
				$existing['transition_eligible'] = (bool) $ability_settings['transition_eligible'];
			}

			$all[ $ability_id ] = $existing;
		}

		$this->settings = $all;
		return update_option( self::OPTION_NAME, $all );
	}

	/**
	 * Reset settings for an ability to defaults.
	 *
	 * @param  string $ability_id Ability ID.
	 * @return bool
	 */
	public function reset( string $ability_id ): bool {
		$all = $this->get_all();
		unset( $all[ $ability_id ] );
		$this->settings = $all;
		return update_option( self::OPTION_NAME, $all );
	}

	/**
	 * Clear settings cache.
	 */
	public function clear_cache(): void {
		$this->settings = null;
	}
}
