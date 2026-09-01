<?php
/**
 * Experiment WP-CLI commands.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Experiments;

use WP_CLI;
use WP_CLI\Utils;

/**
 * Manage experiments.
 *
 * ## EXAMPLES
 *
 *     wp vip-workflows experiment list
 *     wp vip-workflows experiment enable ideation
 *     wp vip-workflows experiment disable ideation
 */
class ExperimentCLI {

	/**
	 * List all registered experiments.
	 *
	 * ## OPTIONS
	 *
	 * [--format=<format>]
	 * : Output format.
	 * ---
	 * default: table
	 * options:
	 *   - table
	 *   - json
	 *   - csv
	 * ---
	 *
	 * ## EXAMPLES
	 *
	 *     wp vip-workflows experiment list
	 *
	 * @subcommand list
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Named args.
	 */
	public function list_experiments( array $args, array $assoc_args ): void {
		$registry    = $this->get_registry();
		$format      = Utils\get_flag_value( $assoc_args, 'format', 'table' );
		$experiments = $registry->get_all();

		if ( empty( $experiments ) ) {
			WP_CLI::log( 'No experiments registered.' );
			return;
		}

		$items = array();
		foreach ( $experiments as $experiment ) {
			$items[] = array(
				'id'          => $experiment->get_id(),
				'name'        => $experiment->get_name(),
				'enabled'     => $registry->is_enabled( $experiment->get_id() ) ? 'yes' : 'no',
				'available'   => $experiment->is_available() ? 'yes' : 'no',
				'description' => $experiment->get_description(),
			);
		}

		Utils\format_items( $format, $items, array( 'id', 'name', 'enabled', 'available', 'description' ) );
	}

	/**
	 * Enable an experiment.
	 *
	 * ## OPTIONS
	 *
	 * <experiment_id>
	 * : The experiment ID to enable.
	 *
	 * ## EXAMPLES
	 *
	 *     wp vip-workflows experiment enable ideation
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Named args.
	 */
	public function enable( array $args, array $assoc_args ): void {
		$experiment_id = $args[0];
		$registry      = $this->get_registry();

		if ( $registry->is_enabled( $experiment_id ) ) {
			WP_CLI::log( sprintf( 'Experiment "%s" is already enabled.', $experiment_id ) );
			return;
		}

		$result = $registry->enable( $experiment_id );

		if ( ! $result ) {
			WP_CLI::error( sprintf( 'Failed to enable "%s". Experiment may not exist or is unavailable.', $experiment_id ) );
		}

		WP_CLI::success( sprintf( 'Experiment "%s" enabled.', $experiment_id ) );
	}

	/**
	 * Disable an experiment.
	 *
	 * ## OPTIONS
	 *
	 * <experiment_id>
	 * : The experiment ID to disable.
	 *
	 * ## EXAMPLES
	 *
	 *     wp vip-workflows experiment disable ideation
	 *
	 * @param array $args       Positional args.
	 * @param array $assoc_args Named args.
	 */
	public function disable( array $args, array $assoc_args ): void {
		$experiment_id = $args[0];
		$registry      = $this->get_registry();

		if ( ! $registry->is_enabled( $experiment_id ) ) {
			WP_CLI::log( sprintf( 'Experiment "%s" is already disabled.', $experiment_id ) );
			return;
		}

		$result = $registry->disable( $experiment_id );

		if ( ! $result ) {
			WP_CLI::error( sprintf( 'Failed to disable "%s".', $experiment_id ) );
		}

		WP_CLI::success( sprintf( 'Experiment "%s" disabled.', $experiment_id ) );
	}

	/**
	 * Get the experiment registry.
	 *
	 * @return ExperimentRegistry
	 */
	private function get_registry(): ExperimentRegistry {
		$plugin = \VIPWorkflows\Plugin::get_instance();
		return $plugin->get_experiment_registry();
	}
}
