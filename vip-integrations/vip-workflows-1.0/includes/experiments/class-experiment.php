<?php
/**
 * Abstract Experiment class.
 *
 * Base class for toggleable experiments. Each experiment declares its modules,
 * admin modules, and cleanup logic. The ExperimentRegistry checks enabled state
 * before registering modules.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Experiments;

use VIPWorkflows\ModuleInterface;

/**
 * Abstract base class for experiments.
 */
abstract class Experiment {

	/**
	 * Get the unique experiment identifier.
	 *
	 * @return string Slug-style ID (e.g., 'ideation').
	 */
	abstract public function get_id(): string;

	/**
	 * Get the experiment display name.
	 *
	 * @return string Translatable name.
	 */
	abstract public function get_name(): string;

	/**
	 * Get the experiment description.
	 *
	 * @return string Translatable description.
	 */
	abstract public function get_description(): string;

	/**
	 * Get the modules this experiment provides.
	 *
	 * These modules are registered when the experiment is enabled.
	 *
	 * @return ModuleInterface[]
	 */
	abstract public function get_modules(): array;

	/**
	 * Get admin-only modules this experiment provides.
	 *
	 * These modules are registered only when is_admin() is true
	 * and the experiment is enabled.
	 *
	 * @return ModuleInterface[]
	 */
	public function get_admin_modules(): array {
		return array();
	}

	/**
	 * Called when the experiment is toggled OFF.
	 *
	 * Clean up any persistent state: unschedule jobs, flush rewrite rules,
	 * remove options, etc. The experiment's modules will NOT be loaded on
	 * the next request, so this is the only chance to clean up.
	 */
	public function deactivate(): void {
		// Override in subclass.
	}

	/**
	 * Called when the experiment is toggled ON.
	 *
	 * Perform any one-time setup: flush rewrite rules, schedule initial jobs, etc.
	 * Modules will be loaded on the next request.
	 */
	public function activate(): void {
		// Override in subclass.
	}

	/**
	 * Whether this experiment is available to be enabled.
	 *
	 * Override to check for dependencies (e.g., another experiment must be active,
	 * a PHP extension must be installed, etc.).
	 *
	 * @return bool
	 */
	public function is_available(): bool {
		return true;
	}

	/**
	 * Get the experiment icon for admin display.
	 *
	 * @return string Icon slug from the set in src/admin/components/ideation/assistant-icon.js.
	 */
	public function get_icon(): string {
		return 'plugins';
	}
}
