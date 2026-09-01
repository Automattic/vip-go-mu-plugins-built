<?php
/**
 * Experiment Registry.
 *
 * Tracks registered experiments, resolves enabled state, and registers
 * modules for enabled experiments.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Experiments;

use VIPWorkflows\Plugin;

/**
 * Manages experiment registration and enabled state.
 */
class ExperimentRegistry {

	/**
	 * Option name for storing enabled experiment IDs.
	 */
	public const OPTION_NAME = 'vip_workflows_experiments';

	/**
	 * Filter name for code-level overrides.
	 */
	public const FILTER_NAME = 'vip_workflows_experiments';

	/**
	 * Registered experiments.
	 *
	 * @var array<string, Experiment>
	 */
	private array $experiments = array();

	/**
	 * Resolved enabled experiment IDs (cached after first resolution).
	 *
	 * @var string[]|null
	 */
	private ?array $resolved_enabled = null;

	/**
	 * Register an experiment.
	 *
	 * @param Experiment $experiment Experiment instance.
	 */
	public function register( Experiment $experiment ): void {
		$id = $experiment->get_id();

		if ( isset( $this->experiments[ $id ] ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error
			trigger_error(
				sprintf( 'Duplicate experiment ID "%s" — skipping registration.', esc_html( $id ) ),
				E_USER_WARNING
			);
			return;
		}

		$this->experiments[ $id ] = $experiment;
		$this->resolved_enabled = null;
	}

	/**
	 * Check if an experiment is enabled.
	 *
	 * Resolution order: filter > option > default (disabled).
	 *
	 * @param  string $experiment_id Experiment identifier.
	 * @return bool
	 */
	public function is_enabled( string $experiment_id ): bool {
		if ( ! isset( $this->experiments[ $experiment_id ] ) ) {
			return false;
		}

		if ( ! $this->experiments[ $experiment_id ]->is_available() ) {
			return false;
		}

		return in_array( $experiment_id, $this->get_enabled_ids(), true );
	}

	/**
	 * Enable an experiment.
	 *
	 * @param  string $experiment_id Experiment identifier.
	 * @return bool True if enabled, false if experiment not found or unavailable.
	 */
	public function enable( string $experiment_id ): bool {
		if ( ! isset( $this->experiments[ $experiment_id ] ) ) {
			return false;
		}

		if ( ! $this->experiments[ $experiment_id ]->is_available() ) {
			return false;
		}

		$enabled = $this->get_option_value();

		if ( in_array( $experiment_id, $enabled, true ) ) {
			return true;
		}

		$enabled[] = $experiment_id;
		update_option( self::OPTION_NAME, $enabled, false );
		$this->resolved_enabled = null;

		$this->experiments[ $experiment_id ]->activate();

		/**
		 * Fires after an experiment is enabled.
		 *
		 * @param string $experiment_id The experiment that was enabled.
		 */
		do_action( 'vip_workflows_experiment_enabled', $experiment_id );

		return true;
	}

	/**
	 * Disable an experiment.
	 *
	 * @param  string $experiment_id Experiment identifier.
	 * @return bool True if disabled, false if experiment not found.
	 */
	public function disable( string $experiment_id ): bool {
		if ( ! isset( $this->experiments[ $experiment_id ] ) ) {
			return false;
		}

		$enabled = $this->get_option_value();
		$enabled = array_values( array_diff( $enabled, array( $experiment_id ) ) );
		update_option( self::OPTION_NAME, $enabled, false );
		$this->resolved_enabled = null;

		$this->experiments[ $experiment_id ]->deactivate();

		/**
		 * Fires after an experiment is disabled.
		 *
		 * @param string $experiment_id The experiment that was disabled.
		 */
		do_action( 'vip_workflows_experiment_disabled', $experiment_id );

		return true;
	}

	/**
	 * Get all registered experiments.
	 *
	 * @return array<string, Experiment>
	 */
	public function get_all(): array {
		return $this->experiments;
	}

	/**
	 * Get an experiment by ID.
	 *
	 * @param  string $experiment_id Experiment identifier.
	 * @return Experiment|null
	 */
	public function get( string $experiment_id ): ?Experiment {
		return $this->experiments[ $experiment_id ] ?? null;
	}

	/**
	 * Get only enabled experiments.
	 *
	 * @return array<string, Experiment>
	 */
	public function get_enabled(): array {
		$enabled = array();
		foreach ( $this->experiments as $id => $experiment ) {
			if ( $this->is_enabled( $id ) ) {
				$enabled[ $id ] = $experiment;
			}
		}
		return $enabled;
	}

	/**
	 * Register modules for all enabled experiments into the Plugin.
	 *
	 * @param Plugin $plugin Plugin instance.
	 */
	public function register_modules( Plugin $plugin ): void {
		foreach ( $this->get_enabled() as $experiment ) {
			foreach ( $experiment->get_modules() as $module ) {
				$plugin->register_module( $module );
			}

			if ( is_admin() ) {
				foreach ( $experiment->get_admin_modules() as $module ) {
					$plugin->register_module( $module );
				}
			}
		}
	}

	/**
	 * Convert all experiments to array for REST API / admin display.
	 *
	 * @return array[]
	 */
	public function to_array(): array {
		$result = array();
		foreach ( $this->experiments as $id => $experiment ) {
			$result[] = array(
				'id'          => $id,
				'name'        => $experiment->get_name(),
				'description' => $experiment->get_description(),
				'icon'        => $experiment->get_icon(),
				'enabled'     => $this->is_enabled( $id ),
				'available'   => $experiment->is_available(),
			);
		}
		return $result;
	}

	/**
	 * Get the resolved list of enabled experiment IDs.
	 *
	 * @return string[]
	 */
	private function get_enabled_ids(): array {
		if ( null !== $this->resolved_enabled ) {
			return $this->resolved_enabled;
		}

		$enabled = $this->get_option_value();

		/**
		 * Filter the list of enabled experiments.
		 *
		 * Code-level override — highest priority. Return an array of
		 * experiment ID strings.
		 *
		 * @param string[] $enabled Currently enabled experiment IDs.
		 */
		$this->resolved_enabled = apply_filters( self::FILTER_NAME, $enabled );

		return $this->resolved_enabled;
	}

	/**
	 * Get the raw option value.
	 *
	 * @return string[]
	 */
	private function get_option_value(): array {
		$value = get_option( self::OPTION_NAME, array() );
		return is_array( $value ) ? $value : array();
	}
}
