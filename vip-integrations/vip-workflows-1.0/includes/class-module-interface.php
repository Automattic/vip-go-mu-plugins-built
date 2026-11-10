<?php
/**
 * Module interface.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows;

/**
 * Contract for plugin subsystems that self-register via hooks.
 *
 * Core services (EventBus, PostTypeManager, StatusManager)
 * are NOT modules — they are explicit dependencies initialized in order
 * by Plugin before the module loop runs.
 */
interface ModuleInterface {

	/**
	 * Unique identifier for this module.
	 *
	 * @return string
	 */
	public function get_id(): string;

	/**
	 * Initialize the module (register hooks, CPTs, etc.).
	 */
	public function init(): void;
}
