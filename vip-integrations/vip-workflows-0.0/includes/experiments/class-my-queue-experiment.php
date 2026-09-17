<?php
/**
 * My Queue Experiment — gates the My Queue tab and REST endpoint.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Experiments;

/**
 * Experiment declaration for the My Queue tab on My Dashboard.
 *
 * My Queue has no dedicated modules of its own — it is a tab inside the
 * shared Admin module's My Dashboard page and an endpoint on the shared
 * WorkflowController — so this experiment declares no modules; gating
 * happens at those individual call sites via
 * `Plugin::experiment_enabled( 'my_queue' )`.
 *
 * Ships disabled by default. Gating is surfaces-only: disabling hides the
 * tab and REST endpoint but never touches claim/assignment data.
 */
class MyQueueExperiment extends Experiment {

	/**
	 * Get the experiment ID.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'my_queue';
	}

	/**
	 * Get the experiment name.
	 *
	 * @inheritDoc
	 */
	public function get_name(): string {
		return __( 'My Queue', 'vip-workflows' );
	}

	/**
	 * Get the experiment description.
	 *
	 * @inheritDoc
	 */
	public function get_description(): string {
		return __( 'The My Dashboard tab listing posts a reviewer can act on next.', 'vip-workflows' );
	}

	/**
	 * Get the experiment icon.
	 *
	 * @inheritDoc
	 */
	public function get_icon(): string {
		return 'archive';
	}

	/**
	 * Get modules registered while the My Queue experiment is enabled.
	 *
	 * @inheritDoc
	 */
	public function get_modules(): array {
		return array();
	}
}
