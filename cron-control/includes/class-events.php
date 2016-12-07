<?php

namespace Automattic\WP\Cron_Control;

class Events extends Singleton {
	/**
	 * PLUGIN SETUP
	 */

	/**
	 * Class properties
	 */
	const LOCK = 'run-events';

	/**
	 * Register hooks
	 */
	protected function class_init() {
		// Prime lock cache if not present
		Lock::prime_lock( self::LOCK );

		// Prepare environment as early as possible
		$earliest_action = did_action( 'muplugins_loaded' ) ? 'plugins_loaded' : 'muplugins_loaded';
		add_action( $earliest_action, array( $this, 'prepare_environment' ) );
	}

	/**
	 * Prepare environment to run job
	 *
	 * Must run as early as possible, particularly before any client code is loaded
	 * This also runs before Core has parsed the request and set the \REST_REQUEST constant
	 */
	public function prepare_environment() {
		if ( ! is_rest_endpoint_request( 'run' ) ) {
			return;
		}

		ignore_user_abort( true );
		set_time_limit( JOB_TIMEOUT_IN_MINUTES * MINUTE_IN_SECONDS );
		define( 'DOING_CRON', true );
	}

	/**
	 * List events pending for the current period
	 */
	public function get_events() {
		$events = get_option( 'cron' );

		// That was easy
		if ( ! is_array( $events ) || empty( $events ) ) {
			return array( 'events' => null, );
		}

		// Simplify array format for further processing
		$events = collapse_events_array( $events );

		// Select only those events to run in the next sixty seconds
		// Will include missed events as well
		$current_events = $internal_events = array();
		$current_window = strtotime( sprintf( '+%d seconds', JOB_QUEUE_WINDOW_IN_SECONDS ) );

		foreach ( $events as $event ) {
			// Skip events whose time hasn't come
			if ( $event['timestamp'] > $current_window ) {
				continue;
			}

			// Necessary data to identify an individual event
			// `$event['action']` is hashed to avoid information disclosure
			// Core hashes `$event['instance']` for us
			$event = array(
				'timestamp' => $event['timestamp'],
				'action'    => md5( $event['action'] ),
				'instance'  => $event['instance'],
			);

			// Queue internal events separately to avoid them being blocked
			if ( is_internal_event( $event['action'] ) ) {
				$internal_events[] = $event;
			} else {
				$current_events[] = $event;
			}
		}

		// Limit batch size to avoid resource exhaustion
		if ( count( $current_events ) > JOB_QUEUE_SIZE ) {
			$current_events = array_slice( $current_events, 0, JOB_QUEUE_SIZE );
		}

		return array(
			'events'   => array_merge( $current_events, $internal_events ),
			'endpoint' => get_rest_url( null, REST_API::API_NAMESPACE . '/' . REST_API::ENDPOINT_RUN ),
		);
	}

	/**
	 * Find an event's data using its hashed representations
	 *
	 * The `$instance` argument is hashed for us by Core, while we hash the action to avoid information disclosure
	 */
	private function get_event( $timestamp, $action_hashed, $instance ) {
		$events = get_option( 'cron' );
		$event  = false;

		$filtered_events = collapse_events_array( $events, $timestamp );

		foreach ( $filtered_events as $filtered_event ) {
			if ( hash_equals( md5( $filtered_event['action'] ), $action_hashed ) && hash_equals( $filtered_event['instance'], $instance ) ) {
				$event = $filtered_event['args'];
				$event['timestamp'] = $filtered_event['timestamp'];
				$event['action']    = $filtered_event['action'];
				$event['instance']  = $filtered_event['instance'];
				break;
			}
		}

		return $event;
	}

	/**
	 * Execute a specific event
	 *
	 * @param $timestamp  int     Unix timestamp
	 * @param $action     string  md5 hash of the action used when the event is registered
	 * @param $instance   string  md5 hash of the event's arguments array, which Core uses to index the `cron` option
	 *
	 * @return array|\WP_Error
	 */
	public function run_event( $timestamp, $action, $instance ) {
		// Validate input data
		if ( empty( $timestamp ) || empty( $action ) || empty( $instance ) ) {
			return new \WP_Error( 'missing-data', __( 'Invalid or incomplete request data.', 'automattic-cron-control' ), array( 'status' => 400, ) );
		}

		// Ensure we don't run jobs too far ahead
		if ( $timestamp > strtotime( sprintf( '+%d seconds', JOB_EXECUTION_BUFFER_IN_SECONDS ) ) ) {
			return new \WP_Error( 'premature', sprintf( __( 'Job with identifier `%1$s` is not scheduled to run yet.', 'automattic-cron-control' ), "$timestamp-$action-$instance" ), array( 'status' => 403, ) );
		}

		// Find the event to retrieve the full arguments
		$event = $this->get_event( $timestamp, $action, $instance );

		// Nothing to do...
		if ( ! is_array( $event ) ) {
			return new \WP_Error( 'no-event', sprintf( __( 'Job with identifier `%1$s` could not be found.', 'automattic-cron-control' ), "$timestamp-$action-$instance" ), array( 'status' => 404, ) );
		}

		unset( $timestamp, $action, $instance );

		// And we're off!
		$time_start = microtime( true );

		// Limit how many events are processed concurrently
		if ( ! is_internal_event( $event['action'] ) && ! Lock::check_lock( self::LOCK ) ) {
			return new \WP_Error( 'no-free-threads', sprintf( __( 'No resources available to run the job with action action `%1$s` and arguments `%2$s`.', 'automattic-cron-control' ), $event['action'], maybe_serialize( $event['args'] ) ), array( 'status' => 429, ) );
		}

		// Mark the event completed, and reschedule if desired
		// Core does this before running the job, so we respect that
		$this->update_event_record( $event );

		// Run the event
		do_action_ref_array( $event['action'], $event['args'] );

		// Free process for the next event
		if ( ! is_internal_event( $event['action'] ) ) {
			Lock::free_lock( self::LOCK );
		}

		$time_end = microtime( true );

		return array(
			'success' => true,
			'message' => sprintf( __( 'Job with action `%1$s` and arguments `%2$s` completed in %3$d seconds.', 'automattic-cron-control' ), $event['action'], maybe_serialize( $event['args'] ), $time_end - $time_start ),
		);
	}

	/**
	 * Mark an event completed, and reschedule when requested
	 */
	private function update_event_record( $event ) {
		if ( false !== $event['schedule'] ) {
			// Get the existing ID
			$job_id = Cron_Options_CPT::instance()->job_exists( $event['timestamp'], $event['action'], $event['instance'], true );

			// Re-implements much of the logic from `wp_reschedule_event()`
			$schedules = wp_get_schedules();
			$interval  = 0;

			// First, we try to get it from the schedule
			if ( isset( $schedules[ $event['schedule'] ] ) ) {
				$interval = $schedules[ $event['schedule'] ]['interval'];
			}

			// Now we try to get it from the saved interval, in case the schedule disappears
			if ( 0 == $interval ) {
				$interval = $event['interval'];
			}

			// If we have an interval, update the existing event entry
			if ( 0 != $interval ) {
				// Determine new timestamp, according to how `wp_reschedule_event()` does
				$now           = time();
				$new_timestamp = $event['timestamp'];

				if ( $new_timestamp >= $now ) {
					$new_timestamp = $now + $interval;
				} else {
					$new_timestamp = $now + ( $interval - ( ( $now - $new_timestamp ) % $interval ) );
				}

				// Build the expected arguments format
				$event_args = array(
					'schedule' => $event['schedule'],
					'args'     => $event['args'],
					'interval' => $interval,
				);

				// Update CPT store
				Cron_Options_CPT::instance()->create_or_update_job( $new_timestamp, $event['action'], $event_args, $job_id );

				// If the event could be rescheduled, don't then delete it :)
				if ( is_int( $job_id ) && $job_id > 0 ) {
					return;
				}
			}
		}

		// Either event doesn't recur, or the interval couldn't be determined
		Cron_Options_CPT::instance()->mark_job_completed( $event['timestamp'], $event['action'], $event['instance'] );
	}
}

Events::instance();
