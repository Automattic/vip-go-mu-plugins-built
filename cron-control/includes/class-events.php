<?php
/**
 * Manage event execution
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control;

/**
 * Events class
 */
class Events extends Singleton {
	/**
	 * PLUGIN SETUP
	 */

	/**
	 * Class constants
	 */
	const LOCK = 'run-events';

	const DISABLE_RUN_OPTION = 'a8c_cron_control_disable_run';

	/**
	 * List of actions whitelisted for concurrent execution
	 *
	 * @var array
	 */
	private $concurrent_action_whitelist = array();

	/**
	 * Name of action currently being executed
	 *
	 * @var mixed
	 */
	private $running_event = null;

	/**
	 * Register hooks
	 */
	protected function class_init() {
		// Prime lock cache if not present.
		Lock::prime_lock( self::LOCK );

		// Prepare environment as early as possible.
		$earliest_action = did_action( 'muplugins_loaded' ) ? 'plugins_loaded' : 'muplugins_loaded';
		add_action( $earliest_action, array( $this, 'prepare_environment' ) );

		// Allow code loaded as late as the theme to modify the whitelist.
		add_action( 'after_setup_theme', array( $this, 'populate_concurrent_action_whitelist' ) );
	}

	/**
	 * Prepare environment to run job
	 *
	 * Must run as early as possible, particularly before any client code is loaded
	 * This also runs before Core has parsed the request and set the \REST_REQUEST constant
	 */
	public function prepare_environment() {
		// Limit to plugin's endpoints.
		$endpoint = get_endpoint_type();
		if ( false === $endpoint ) {
			return;
		}

		// Flag is used in many contexts, so should be set for all of our requests, regardless of the action.
		set_doing_cron();

		// When running events, allow for long-running ones, and non-blocking trigger requests.
		if ( REST_API::ENDPOINT_RUN === $endpoint ) {
			ignore_user_abort( true );
			set_time_limit( JOB_TIMEOUT_IN_MINUTES * MINUTE_IN_SECONDS );
		}
	}

	/**
	 * Allow certain events to be run concurrently
	 *
	 * By default, multiple events of the same action cannot be run concurrently, due to alloptions and other data-corruption issues
	 * Some events, however, are fine to run concurrently, and should be whitelisted for such
	 */
	public function populate_concurrent_action_whitelist() {
		$concurrency_whitelist = apply_filters( 'a8c_cron_control_concurrent_event_whitelist', array() );

		if ( is_array( $concurrency_whitelist ) && ! empty( $concurrency_whitelist ) ) {
			$this->concurrent_action_whitelist = $concurrency_whitelist;
		}
	}

	/**
	 * List events pending for the current period
	 */
	public function get_events() {
		$events = get_option( 'cron' );

		// That was easy.
		if ( ! is_array( $events ) || empty( $events ) ) {
			return array(
				'events' => null,
			);
		}

		// Simplify array format for further processing.
		$events = collapse_events_array( $events );

		// Select only those events to run in the next sixty seconds.
		// Will include missed events as well.
		$current_events  = array();
		$internal_events = array();
		$current_window  = strtotime( sprintf( '+%d seconds', JOB_QUEUE_WINDOW_IN_SECONDS ) );

		foreach ( $events as $event ) {
			// Skip events whose time hasn't come.
			if ( $event['timestamp'] > $current_window ) {
				continue;
			}

			// Skip events that don't have any callbacks hooked to their actions, unless their execution is requested.
			if ( ! $this->action_has_callback_or_should_run_anyway( $event ) ) {
				continue;
			}

			// Necessary data to identify an individual event.
			// `$event['action']` is hashed to avoid information disclosure.
			// Core hashes `$event['instance']` for us.
			$event_data_public = array(
				'timestamp' => $event['timestamp'],
				'action'    => md5( $event['action'] ),
				'instance'  => $event['instance'],
			);

			// Queue internal events separately to avoid them being blocked.
			if ( is_internal_event( $event['action'] ) ) {
				$internal_events[] = $event_data_public;
			} else {
				$current_events[] = $event_data_public;
			}
		}

		// Limit batch size to avoid resource exhaustion.
		if ( count( $current_events ) > JOB_QUEUE_SIZE ) {
			$current_events = $this->reduce_queue( $current_events );
		}

		// Combine with Internal Events.
		// TODO: un-nest array, which is nested for legacy reasons.
		return array(
			'events' => array_merge( $current_events, $internal_events ),
		);
	}

	/**
	 * Check that an event has a callback to run, and allow the check to be overridden
	 * Empty events are, by default, skipped and removed/rescheduled
	 *
	 * @param array $event Event data.
	 * @return bool
	 */
	private function action_has_callback_or_should_run_anyway( $event ) {
		// Event has a callback, so let's get on with it.
		if ( false !== has_action( $event['action'] ) ) {
			return true;
		}

		// Run the event anyway, perhaps because callbacks are added using the `all` action.
		if ( apply_filters( 'a8c_cron_control_run_event_with_no_callbacks', false, $event ) ) {
			return true;
		}

		// Remove or reschedule the empty event.
		if ( false === $event['args']['schedule'] ) {
			wp_unschedule_event( $event['timestamp'], $event['action'], $event['args']['args'] );
		} else {
			$timestamp = $event['timestamp'] + ( isset( $event['args']['interval'] ) ? $event['args']['interval'] : 0 );
			wp_reschedule_event( $timestamp, $event['args']['schedule'], $event['action'], $event['args']['args'] );
			unset( $timestamp );
		}

		return false;
	}

	/**
	 * Trim events queue down to the limit set by JOB_QUEUE_SIZE
	 *
	 * @param array $events List of events to be run in the current period.
	 *
	 * @return array
	 */
	private function reduce_queue( $events ) {
		// Loop through events, adding one of each action during each iteration.
		$reduced_queue = array();
		$action_counts = array();

		$i = 1; // Intentionally not zero-indexed to facilitate comparisons against $action_counts members.

		do {
			// Each time the events array is iterated over, move one instance of an action to the current queue.
			foreach ( $events as $key => $event ) {
				$action = $event['action'];

				// Prime the count.
				if ( ! isset( $action_counts[ $action ] ) ) {
					$action_counts[ $action ] = 0;
				}

				// Check and do the move.
				if ( $action_counts[ $action ] < $i ) {
					$reduced_queue[] = $event;
					$action_counts[ $action ]++;
					unset( $events[ $key ] );
				}
			}

			// When done with an iteration and events remain, start again from the beginning of the $events array.
			if ( empty( $events ) ) {
				break;
			} else {
				$i++;
				reset( $events );

				continue;
			}
		} while ( $i <= 15 && count( $reduced_queue ) < JOB_QUEUE_SIZE && ! empty( $events ) );

		/**
		 * IMPORTANT: DO NOT re-sort the $reduced_queue array from this point forward.
		 * Doing so defeats the preceding effort.
		 *
		 * While the events are now out of order with respect to timestamp, they're ordered
		 * such that one of each action is run before another of an already-run action.
		 * The timestamp mis-ordering is trivial given that we're only dealing with events
		 * for the current JOB_QUEUE_WINDOW_IN_SECONDS.
		 */

		// Finally, ensure that we don't have more than we need.
		if ( count( $reduced_queue ) > JOB_QUEUE_SIZE ) {
			$reduced_queue = array_slice( $reduced_queue, 0, JOB_QUEUE_SIZE );
		}

		return $reduced_queue;
	}

	/**
	 * Execute a specific event
	 *
	 * @param int    $timestamp Unix timestamp.
	 * @param string $action md5 hash of the action used when the event is registered.
	 * @param string $instance  md5 hash of the event's arguments array, which Core uses to index the `cron` option.
	 * @param bool   $force Run event regardless of timestamp or lock status? eg, when executing jobs via wp-cli.
	 * @return array|\WP_Error
	 */
	public function run_event( $timestamp, $action, $instance, $force = false ) {
		// Validate input data.
		if ( empty( $timestamp ) || empty( $action ) || empty( $instance ) ) {
			return new \WP_Error( 'missing-data', __( 'Invalid or incomplete request data.', 'automattic-cron-control' ), array(
				'status' => 400,
			) );
		}

		// Ensure we don't run jobs ahead of time.
		if ( ! $force && $timestamp > time() ) {
			/* translators: 1: Job identifier */
			return new \WP_Error( 'premature', sprintf( __( 'Job with identifier `%1$s` is not scheduled to run yet.', 'automattic-cron-control' ), "$timestamp-$action-$instance" ), array(
				'status' => 403,
			) );
		}

		// Find the event to retrieve the full arguments.
		$event = get_event_by_attributes( array(
			'timestamp'     => $timestamp,
			'action_hashed' => $action,
			'instance'      => $instance,
			'status'        => Events_Store::STATUS_PENDING,
		) );

		// Nothing to do...
		if ( ! is_object( $event ) ) {
			/* translators: 1: Job identifier */
			return new \WP_Error( 'no-event', sprintf( __( 'Job with identifier `%1$s` could not be found.', 'automattic-cron-control' ), "$timestamp-$action-$instance" ), array(
				'status' => 404,
			) );
		}

		unset( $timestamp, $action, $instance );

		// Limit how many events are processed concurrently, unless explicitly bypassed.
		if ( ! $force ) {
			// Prepare event-level lock.
			$this->prime_event_action_lock( $event );

			if ( ! $this->can_run_event( $event ) ) {
				/* translators: 1: Event action, 2: Event arguments */
				return new \WP_Error( 'no-free-threads', sprintf( __( 'No resources available to run the job with action `%1$s` and arguments `%2$s`.', 'automattic-cron-control' ), $event->action, maybe_serialize( $event->args ) ), array(
					'status' => 429,
				) );
			}

			// Free locks should event throw uncatchable error.
			$this->running_event = $event;
			add_action( 'shutdown', array( $this, 'do_lock_cleanup_on_shutdown' ) );
		}

		// Mark the event completed, and reschedule if desired.
		// Core does this before running the job, so we respect that.
		$this->update_event_record( $event );

		// Run the event.
		try {
			do_action_ref_array( $event->action, $event->args );
		} catch ( \Throwable $t ) {
			/**
			 * Note that timeouts and memory exhaustion do not invoke this block.
			 * Instead, those locks are freed in `do_lock_cleanup_on_shutdown()`.
			 */

			do_action( 'a8c_cron_control_event_threw_catchable_error', $event, $t );

			$return = array(
				'success' => false,
				/* translators: 1: Event action, 2: Event arguments, 3: Throwable error, 4: Line number that raised Throwable error */
				'message' => sprintf( __( 'Callback for job with action `%1$s` and arguments `%2$s` raised a Throwable - %3$s in %4$s on line %5$d.', 'automattic-cron-control' ), $event->action, maybe_serialize( $event->args ), $t->getMessage(), $t->getFile(), $t->getLine() ),
			);
		}

		// Free locks for the next event, unless they weren't set to begin with.
		if ( ! $force ) {
			// If we got this far, there's no uncaught error to handle.
			$this->running_event = null;
			remove_action( 'shutdown', array( $this, 'do_lock_cleanup_on_shutdown' ) );

			$this->do_lock_cleanup( $event );
		}

		// Callback didn't trigger a Throwable, indicating it succeeded.
		if ( ! isset( $return ) ) {
			$return = array(
				'success' => true,
				/* translators: 1: Event action, 2: Event arguments */
				'message' => sprintf( __( 'Job with action `%1$s` and arguments `%2$s` executed.', 'automattic-cron-control' ), $event->action, maybe_serialize( $event->args ) ),
			);
		}

		return $return;
	}

	/**
	 * Prime the event-specific lock
	 *
	 * Used to ensure only one instance of a particular event, such as `wp_version_check` runs at one time
	 *
	 * @param object $event Event data.
	 */
	private function prime_event_action_lock( $event ) {
		Lock::prime_lock( $this->get_lock_key_for_event_action( $event ), JOB_LOCK_EXPIRY_IN_MINUTES * \MINUTE_IN_SECONDS );
	}

	/**
	 * Are resources available to run this event?
	 *
	 * @param object $event Event data.
	 * @return bool
	 */
	private function can_run_event( $event ) {
		// Limit to one concurrent execution of a specific action by default.
		$limit = 1;

		if ( isset( $this->concurrent_action_whitelist[ $event->action ] ) ) {
			$limit = absint( $this->concurrent_action_whitelist[ $event->action ] );
			$limit = min( $limit, JOB_CONCURRENCY_LIMIT );
		}

		if ( ! Lock::check_lock( $this->get_lock_key_for_event_action( $event ), $limit, JOB_LOCK_EXPIRY_IN_MINUTES * \MINUTE_IN_SECONDS ) ) {
			return false;
		}

		// Internal Events aren't subject to the global lock.
		if ( is_internal_event( $event->action ) ) {
			return true;
		}

		// Check if any resources are available to execute this job.
		// If not, the individual-event lock must be freed, otherwise it's deadlocked until it times out.
		if ( ! Lock::check_lock( self::LOCK, JOB_CONCURRENCY_LIMIT ) ) {
			$this->reset_event_lock( $event );
			return false;
		}

		// Let's go!
		return true;
	}

	/**
	 * Free locks after event completes
	 *
	 * @param object $event Event data.
	 */
	private function do_lock_cleanup( $event ) {
		// Lock isn't set when event is Internal, so we don't want to alter it.
		if ( ! is_internal_event( $event->action ) ) {
			Lock::free_lock( self::LOCK );
		}

		// Reset individual event lock.
		$this->reset_event_lock( $event );
	}

	/**
	 * Frees the lock for an individual event
	 *
	 * @param object $event Event data.
	 * @return bool
	 */
	private function reset_event_lock( $event ) {
		$lock_key = $this->get_lock_key_for_event_action( $event );
		$expires  = JOB_LOCK_EXPIRY_IN_MINUTES * \MINUTE_IN_SECONDS;

		if ( isset( $this->concurrent_action_whitelist[ $event->action ] ) ) {
			return Lock::free_lock( $lock_key, $expires );
		} else {
			return Lock::reset_lock( $lock_key, $expires );
		}
	}

	/**
	 * Turn the event action into a string that can be used with a lock
	 *
	 * @param object $event Event data.
	 * @return string
	 */
	public function get_lock_key_for_event_action( $event ) {
		// Hashed solely to constrain overall length.
		return md5( 'ev-' . $event->action );
	}

	/**
	 * Mark an event completed, and reschedule when requested
	 *
	 * @param object $event Event data.
	 */
	private function update_event_record( $event ) {
		if ( false !== $event->schedule ) {
			// Re-implements much of the logic from `wp_reschedule_event()`.
			$schedules = wp_get_schedules();
			$interval  = 0;

			// First, we try to get it from the schedule.
			if ( isset( $schedules[ $event->schedule ] ) ) {
				$interval = $schedules[ $event->schedule ]['interval'];
			}

			// Now we try to get it from the saved interval, in case the schedule disappears.
			if ( 0 == $interval ) {
				$interval = $event->interval;
			}

			// If we have an interval, update the existing event entry.
			if ( 0 != $interval ) {
				// Determine new timestamp, according to how `wp_reschedule_event()` does.
				$now           = time();
				$new_timestamp = $event->timestamp;

				if ( $new_timestamp >= $now ) {
					$new_timestamp = $now + $interval;
				} else {
					$new_timestamp = $now + ( $interval - ( ( $now - $new_timestamp ) % $interval ) );
				}

				// Build the expected arguments format.
				$event_args = array(
					'schedule' => $event->schedule,
					'args'     => $event->args,
					'interval' => $interval,
				);

				// Update event store.
				schedule_event( $new_timestamp, $event->action, $event_args, $event->ID );

				// If the event could be rescheduled, don't then delete it.
				return;
			}
		}

		// Either event doesn't recur, or the interval couldn't be determined.
		delete_event( $event->timestamp, $event->action, $event->instance );
	}

	/**
	 * If event execution throws uncatchable error, free locks
	 *
	 * Covers situations such as timeouts and memory exhaustion, which aren't \Throwable errors
	 *
	 * Under normal conditions, this callback isn't hooked to `shutdown`
	 */
	public function do_lock_cleanup_on_shutdown() {
		if ( is_null( $this->running_event ) ) {
			return;
		}

		do_action( 'a8c_cron_control_freeing_event_locks_after_uncaught_error', $this->running_event );

		$this->do_lock_cleanup( $this->running_event );
	}

	/**
	 * Return status of automatic event execution
	 *
	 * @return int 0 if run is enabled, 1 if run is disabled indefinitely, otherwise timestamp when execution will resume
	 */
	public function run_disabled() {
		$disabled = (int) get_option( self::DISABLE_RUN_OPTION, 0 );

		if ( $disabled <= 1 || $disabled > time() ) {
			return $disabled;
		}

		$this->update_run_status( 0 );
		return 0;
	}

	/**
	 * Set automatic execution status
	 *
	 * @param int $new_status 0 if run is enabled, 1 if run is disabled indefinitely, otherwise timestamp when execution will resume.
	 * @return bool
	 */
	public function update_run_status( $new_status ) {
		$new_status = absint( $new_status );

		// Don't store a past timestamp.
		if ( $new_status > 1 && $new_status < time() ) {
			return false;
		}

		return update_option( self::DISABLE_RUN_OPTION, $new_status );
	}
}

Events::instance();
