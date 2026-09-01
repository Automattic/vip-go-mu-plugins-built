<?php
/**
 * Ideation Experiment — declares the research/ideation + discovery modules
 * for the experiment system.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Experiments;

use VIPWorkflows\Admin\IdeationAdmin;
use VIPWorkflows\Database\Seeder;
use VIPWorkflows\Discovery\DiscoveryModule;
use VIPWorkflows\Ideation\Research\IdeationPostTypes;
use VIPWorkflows\Ideation\Research\SourceProcessingJob;

/**
 * Experiment declaration for the Ideation system.
 *
 * Ships disabled by default. Gating is surfaces-only:
 * disabling hides modules, REST routes, menus, and UI but never deletes
 * `vip_ideation` data.
 */
class IdeationExperiment extends Experiment {

	/**
	 * Get the experiment ID.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'ideation';
	}

	/**
	 * Get the experiment name.
	 *
	 * @inheritDoc
	 */
	public function get_name(): string {
		return __( 'Ideation', 'vip-workflows' );
	}

	/**
	 * Get the experiment description.
	 *
	 * @inheritDoc
	 */
	public function get_description(): string {
		return __( 'Research, discovery, and source management for ideation projects.', 'vip-workflows' );
	}

	/**
	 * Get the experiment icon.
	 *
	 * @inheritDoc
	 */
	public function get_icon(): string {
		return 'star-filled';
	}

	/**
	 * Get modules registered while ideation is enabled.
	 *
	 * @inheritDoc
	 */
	public function get_modules(): array {
		return array(
			new IdeationPostTypes(),
			new SourceProcessingJob(),
			new DiscoveryModule(),
		);
	}

	/**
	 * Get admin modules registered while ideation is enabled.
	 *
	 * @inheritDoc
	 */
	public function get_admin_modules(): array {
		return array(
			new IdeationAdmin(),
		);
	}

	/**
	 * Activate the ideation experiment.
	 *
	 * @inheritDoc
	 *
	 * Phase sequences only have a job while ideation is active (their sole
	 * remaining transition is ideation → editorial), so the default phase
	 * sequence is seeded here rather than on plugin activation.
	 */
	public function activate(): void {
		( new Seeder() )->seed_phase_sequence();
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules -- Experiment toggle changes rewrite-visible CPTs.
		flush_rewrite_rules();
	}

	/**
	 * Deactivate the ideation experiment.
	 *
	 * @inheritDoc
	 *
	 * Queued source-processing actions would have no handler on the next
	 * request, so drop them. Cancel by hook only: the jobs are enqueued
	 * with [ $project_id, $source_id ] args, and Action Scheduler treats
	 * an empty-args + group filter as "match empty-args actions only".
	 * Ideation data itself is never deleted.
	 */
	public function deactivate(): void {
		if ( function_exists( 'as_unschedule_all_actions' ) ) {
			as_unschedule_all_actions( 'vip_workflows_process_source' );
		}

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules -- Experiment toggle changes rewrite-visible CPTs.
		flush_rewrite_rules();
	}
}
