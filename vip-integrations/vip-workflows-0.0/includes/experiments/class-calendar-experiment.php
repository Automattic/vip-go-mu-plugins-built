<?php
/**
 * Calendar Experiment — gates the Calendar admin page and REST endpoint.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Experiments;

/**
 * Experiment declaration for the Calendar view.
 *
 * The Calendar view has no dedicated modules of its own — it is a page inside
 * the shared Admin module and an endpoint on the shared WorkflowController —
 * so this experiment declares no modules; gating happens at those individual
 * call sites via `Plugin::experiment_enabled( 'calendar' )`.
 *
 * Ships disabled by default. Gating is surfaces-only: disabling hides the
 * admin page and REST endpoint but never deletes workflow data.
 */
class CalendarExperiment extends Experiment {

	/**
	 * Get the experiment ID.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'calendar';
	}

	/**
	 * Get the experiment name.
	 *
	 * @inheritDoc
	 */
	public function get_name(): string {
		return __( 'Calendar', 'vip-workflows' );
	}

	/**
	 * Get the experiment description.
	 *
	 * @inheritDoc
	 */
	public function get_description(): string {
		return __( 'Scheduled and published posts by date.', 'vip-workflows' );
	}

	/**
	 * Get the experiment icon.
	 *
	 * @inheritDoc
	 */
	public function get_icon(): string {
		return 'calendar';
	}

	/**
	 * Get modules registered while the Calendar experiment is enabled.
	 *
	 * @inheritDoc
	 */
	public function get_modules(): array {
		return array();
	}
}
