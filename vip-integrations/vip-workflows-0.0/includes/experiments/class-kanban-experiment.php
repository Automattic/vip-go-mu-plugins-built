<?php
/**
 * Kanban Experiment — gates the Kanban board admin page and REST endpoint.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Experiments;

/**
 * Experiment declaration for the Kanban board view.
 *
 * The Kanban board has no dedicated modules of its own — it is a page inside
 * the shared Admin module and an endpoint on the shared WorkflowController —
 * so this experiment declares no modules; gating happens at those individual
 * call sites via `Plugin::experiment_enabled( 'kanban' )`.
 *
 * Ships disabled by default. Gating is surfaces-only: disabling hides the
 * admin page and REST endpoint but never deletes workflow data.
 */
class KanbanExperiment extends Experiment {

	/**
	 * Get the experiment ID.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'kanban';
	}

	/**
	 * Get the experiment name.
	 *
	 * @inheritDoc
	 */
	public function get_name(): string {
		return __( 'Kanban Board', 'vip-workflows' );
	}

	/**
	 * Get the experiment description.
	 *
	 * @inheritDoc
	 */
	public function get_description(): string {
		return __( 'Drag-and-drop Kanban board view of workflow posts by stage.', 'vip-workflows' );
	}

	/**
	 * Get modules registered while the Kanban experiment is enabled.
	 *
	 * @inheritDoc
	 */
	public function get_modules(): array {
		return array();
	}
}
