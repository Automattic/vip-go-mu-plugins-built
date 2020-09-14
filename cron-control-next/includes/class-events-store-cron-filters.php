<?php
/**
 * Event storage for WP 5.1 and later.
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control;

/**
 * Class Events_Store_Cron_Filters
 */
class Events_Store_Cron_Filters extends Singleton {
	/**
	 * Register hooks to intercept events before storage.
	 */
	protected function class_init() {
		add_filter( 'pre_schedule_event', [ $this, 'filter_pre_schedule_event' ], 10, 2 );
		add_filter( 'pre_reschedule_event', [ $this, 'filter_pre_reschedule_event' ], 10, 2 );
		add_filter( 'pre_unschedule_event', [ $this, 'filter_pre_unschedule_event' ], 10, 4 );
		add_filter( 'pre_clear_scheduled_hook', [ $this, 'filter_pre_clear_scheduled_hook' ], 10, 3 );
		add_filter( 'pre_unschedule_hook', [ $this, 'filter_pre_unschedule_hook' ], 10, 2 );
		add_filter( 'pre_get_scheduled_event', [ $this, 'filter_pre_get_scheduled_event' ], 10, 4 );
	}

	/**
	 * Intercept event scheduling.
	 *
	 * @param bool|null $scheduled Bool if event was already intercepted, null otherwise.
	 * @param \stdClass $event Event object.
	 * @return bool|null
	 */
	public function filter_pre_schedule_event( $scheduled, $event ) {
		if ( null !== $scheduled ) {
			return $scheduled;
		}

		$this->do_schedule_from_filter( $event );

		return true;
	}

	/**
	 * Intercept event rescheduling.
	 *
	 * Largely duplicates timestamp logic from `wp_reschedule_event()`.
	 *
	 * @param bool|null $rescheduled Bool if event was already intercepted, null otherwise.
	 * @param \stdClass $event Event object.
	 * @return bool|null
	 */
	public function filter_pre_reschedule_event( $rescheduled, $event ) {
		if ( null !== $rescheduled ) {
			return $rescheduled;
		}

		$previous_timestamp = $event->timestamp;

		$schedules = wp_get_schedules();
		$interval  = isset( $event->interval ) ? (int) $event->interval : 0;

		// Defer to scheduled interval, if possible.
		if ( isset( $schedules[ $event->schedule ] ) ) {
			$interval = $schedules[ $event->schedule ]['interval'];
		}

		$now = time();

		if ( $event->timestamp >= $now ) {
			$event->timestamp = $now + $interval;
		} else {
			$event->timestamp = $now + ( $interval - ( ( $now - $event->timestamp ) % $interval ) );
		}

		$this->do_schedule_from_filter( $event, $previous_timestamp );
		return true;
	}

	/**
	 * Helper for schedule and reschedule filter callbacks.
	 *
	 * @param \stdClass $event Event object.
	 * @param int|null  $previous_timestamp Previous timestamp, when rescheduling a recurring event.
	 */
	protected function do_schedule_from_filter( $event, $previous_timestamp = null ) {
		$existing = get_event_by_attributes(
			[
				'action'    => $event->hook,
				'timestamp' => ! empty( $previous_timestamp ) ? $previous_timestamp : $event->timestamp,
				'instance'  => Events_Store::instance()->generate_instance_identifier( $event->args ),
			]
		);

		$args = [
			'args'     => $event->args,
			'schedule' => $event->schedule,
		];

		if ( isset( $event->interval ) ) {
			$args['interval'] = $event->interval;
		}

		schedule_event( $event->timestamp, $event->hook, $args, $existing ? $existing->ID : null );
	}

	/**
	 * Intercept event unscheduling.
	 *
	 * @param bool|null $unscheduled Bool if event was already intercepted, null otherwise.
	 * @param int       $timestamp Event timestamp.
	 * @param string    $hook Event action.
	 * @param array     $args Event arguments.
	 * @return bool|null
	 */
	public function filter_pre_unschedule_event( $unscheduled, $timestamp, $hook, $args ) {
		if ( null !== $unscheduled ) {
			return $unscheduled;
		}

		$instance = Events_Store::instance()->generate_instance_identifier( $args );
		Events_Store::instance()->clear_cached_job( $hook, $instance );
		delete_event( $timestamp, $hook, $instance );
		return true;
	}

	/**
	 * Clear all actions for a given hook with given arguments.
	 *
	 * @param bool|null $cleared Bool if hook was already cleared, null otherwise.
	 * @param string    $hook Event action.
	 * @param array     $args Event arguments.
	 * @return bool|int
	 */
	public function filter_pre_clear_scheduled_hook( $cleared, $hook, $args ) {
		if ( null !== $cleared ) {
			return $cleared;
		}

		return $this->do_unschedule_hook( $hook, $args );
	}

	/**
	 * Clear all actions for a given hook, regardless of arguments.
	 *
	 * @param bool|null $cleared Bool if hook was already cleared, null otherwise.
	 * @param string    $hook Event action.
	 * @return bool|int
	 */
	public function filter_pre_unschedule_hook( $cleared, $hook ) {
		if ( null !== $cleared ) {
			return $cleared;
		}

		return $this->do_unschedule_hook( $hook, null );
	}

	/**
	 * Unschedule all events with a given hook and optional arguments.
	 *
	 * @param string     $hook Action to clear.
	 * @param array|null $args Optional job arguments to filter by.
	 * @return bool|int
	 */
	protected function do_unschedule_hook( $hook, $args ) {
		$ids      = [ [] ];
		$page     = 1;
		$quantity = 500;

		do {
			$batch_ids = Events_Store::instance()->get_job_ids_by_hook(
				[
					'page'     => $page,
					'quantity' => $quantity,
				],
				$hook,
				$args
			);

			$ids[] = $batch_ids;
			$page ++;
		} while ( ! empty( $batch_ids ) && count( $batch_ids ) === $quantity );

		$ids = array_merge( ...$ids );

		if ( empty( $ids ) ) {
			return false;
		}

		$results = [];

		foreach ( $ids as $id ) {
			$results[] = delete_event_by_id( $id, false );
		}

		_flush_internal_caches();

		$results = array_filter( $results );
		return empty( $results ) ? false : count( $results );
	}

	/**
	 * Intercept event retrieval.
	 *
	 * @param \stdClass|null $retrieved \stdClass if already retrieved, null otherwise.
	 * @param string         $hook Job action.
	 * @param array          $args Job arguments.
	 * @param int|null       $timestamp Job timestamp.
	 * @return \stdClass|bool|null
	 */
	public function filter_pre_get_scheduled_event( $retrieved, $hook, $args, $timestamp ) {
		if ( null !== $retrieved ) {
			return $retrieved;
		}

		if ( null === $timestamp ) {
			$job = Events_Store::instance()->get_hook_next_scheduled( $hook, $args );
		} else {
			$job = get_event_by_attributes(
				[
					'action'    => $hook,
					'timestamp' => $timestamp,
					'instance'  => Events_Store::instance()->generate_instance_identifier( $args ),
				]
			);
		}

		if ( ! $job ) {
			return false;
		}

		$event = (object) [
			'hook'      => $job->action,
			'timestamp' => $job->timestamp,
			'schedule'  => $job->schedule,
			'args'      => maybe_unserialize( $job->args ),
		];

		if ( ! empty( $job->interval ) ) {
			$event->interval = $job->interval;
		}

		return $event;
	}
}

Events_Store_Cron_Filters::instance();
