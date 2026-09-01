<?php
/**
 * Scheduled data cleanup.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Maintenance;

use VIPWorkflows\Database\Schema;
use VIPWorkflows\ModuleInterface;

/**
 * Prunes the two tables that grow without bound.
 *
 * Ability results and workflow events accumulate one row per tool run and per
 * workflow event forever; nothing else deletes from either. This runs nightly
 * on Action Scheduler and is the only reason the plugin schedules recurring
 * work at all.
 *
 * It reports through the audit log rather than a screen of its own. A run
 * writes one `maintenance.cleanup` event carrying what it deleted, or what
 * went wrong — so "did cleanup run, and did it work" is answered in the same
 * place as every other question about what this plugin did, and by the same
 * filters. There is no job registry, no per-job settings and no Jobs tab: this
 * is one routine, and the abstraction around it described an extension point
 * nothing used.
 */
class Cleanup implements ModuleInterface {


	/**
	 * Action Scheduler hook this runs on.
	 */
	public const HOOK = 'vip_workflows_cleanup';

	/**
	 * Action Scheduler group, so the plugin's actions are identifiable.
	 */
	private const GROUP = 'vip-workflows';

	/**
	 * The event type a run records in the audit log.
	 */
	public const EVENT_TYPE = 'maintenance.cleanup';

	/**
	 * Ability results older than this are deleted.
	 */
	private const ABILITY_RESULT_RETENTION = '-90 days';

	/**
	 * Workflow events older than this are deleted.
	 */
	private const EVENT_RETENTION = '-1 year';

	/**
	 * Get the identifier.
	 *
	 * @inheritDoc
	 */
	public function get_id(): string {
		return 'cleanup';
	}

	/**
	 * Register hooks.
	 */
	public function init(): void {
		add_action( self::HOOK, array( $this, 'run' ) );

		add_action( 'admin_init', array( $this, 'schedule' ) );
		add_action( 'vip_workflows_activated', array( $this, 'schedule' ) );
		add_action( 'vip_workflows_deactivated', array( $this, 'unschedule' ) );
	}

	/**
	 * Schedule the nightly run, unless it is already scheduled.
	 */
	public function schedule(): void {
		if ( ! function_exists( 'as_has_scheduled_action' ) || ! function_exists( 'as_schedule_recurring_action' ) ) {
			return; // Action Scheduler not available.
		}

		if ( as_has_scheduled_action( self::HOOK ) ) {
			return;
		}

		as_schedule_recurring_action( $this->first_run_time(), DAY_IN_SECONDS, self::HOOK, array(), self::GROUP );
	}

	/**
	 * Unschedule the run.
	 */
	public function unschedule(): void {
		if ( ! function_exists( 'as_unschedule_all_actions' ) ) {
			return;
		}

		as_unschedule_all_actions( self::HOOK );
	}

	/**
	 * Delete aged rows and record the outcome.
	 */
	public function run(): void {
		global $wpdb;

		$ability_results = $wpdb->query(
			$wpdb->prepare(
				'DELETE FROM %i WHERE created_at < %s',
				Schema::get_table_name( 'ability_results' ),
				wp_date( 'Y-m-d H:i:s', strtotime( self::ABILITY_RESULT_RETENTION ) )
			)
		);

		// A failed DELETE returns false, which is not zero rows: report it as the
		// error it is rather than letting it read as a clean run that found
		// nothing. $wpdb->last_error is captured before the second query can
		// overwrite it.
		$ability_error = ( false === $ability_results ) ? $wpdb->last_error : '';

		$events = $wpdb->query(
			$wpdb->prepare(
				'DELETE FROM %i WHERE created_at < %s',
				Schema::get_table_name( 'workflows_events' ),
				wp_date( 'Y-m-d H:i:s', strtotime( self::EVENT_RETENTION ) )
			)
		);

		$event_error = ( false === $events ) ? $wpdb->last_error : '';
		$errors      = array_values( array_filter( array( $ability_error, $event_error ) ) );

		$this->record(
			array(
				'ability_results_deleted' => false === $ability_results ? null : (int) $ability_results,
				'events_deleted'          => false === $events ? null : (int) $events,
				'errors'                  => $errors,
			)
		);
	}

	/**
	 * Write the run to the audit log.
	 *
	 * Inserted directly rather than emitted on the event bus: the bus defaults
	 * an absent actor to get_current_user_id(), which on a cron request is
	 * whoever happens to be logged in, and this run belongs to no one. The row
	 * carries no post — the audit log already serves post-less events, which is
	 * how configuration events appear.
	 *
	 * @param array $data What the run deleted, and anything that failed.
	 */
	private function record( array $data ): void {
		global $wpdb;

		$wpdb->insert(
			Schema::get_table_name( 'workflows_events' ),
			array(
				'post_id'    => null,
				'event_type' => self::EVENT_TYPE,
				'event_data' => wp_json_encode( $data ),
				'actor_id'   => 0,
				'actor_type' => 'system',
				'created_at' => current_time( 'mysql' ),
			)
		);
	}

	/**
	 * When the first run should happen: 2am site time, tonight or tomorrow.
	 *
	 * @return int Unix timestamp.
	 */
	private function first_run_time(): int {
		$today = strtotime( wp_date( 'Y-m-d' ) . ' 02:00:00' );

		if ( false === $today ) {
			return time() + HOUR_IN_SECONDS;
		}

		return $today < time() ? strtotime( '+1 day', $today ) : $today;
	}
}
