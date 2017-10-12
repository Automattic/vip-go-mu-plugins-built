<?php
/**
 * Internal events to manage plugin and common WP cron complaints
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control;

/**
 * Internal Events class
 */
class Internal_Events extends Singleton {
	/**
	 * PLUGIN SETUP
	 */

	/**
	 * List of registered internal events
	 *
	 * @var array
	 */
	private $internal_events = array();

	/**
	 * Schedules for internal events
	 *
	 * Provides for intervals shorter than Core does by default
	 *
	 * @var array
	 */
	private $internal_events_schedules = array();

	/**
	 * Register hooks
	 */
	protected function class_init() {
		// Prepare events and their schedules, allowing for additions.
		$this->prepare_internal_events();
		$this->prepare_internal_events_schedules();

		// Register hooks.
		if ( defined( 'WP_CLI' ) && \WP_CLI ) {
			add_action( 'wp_loaded', array( $this, 'schedule_internal_events' ) );
		} else {
			add_action( 'admin_init',    array( $this, 'schedule_internal_events' ) );
			add_action( 'rest_api_init', array( $this, 'schedule_internal_events' ) );
		}

		add_filter( 'cron_schedules', array( $this, 'register_internal_events_schedules' ) );

		foreach ( $this->internal_events as $internal_event ) {
			add_action( $internal_event['action'], $internal_event['callback'] );
		}
	}

	/**
	 * Populate internal events, allowing for additions
	 */
	private function prepare_internal_events() {
		$internal_events = array(
			array(
				'schedule' => 'a8c_cron_control_minute',
				'action'   => 'a8c_cron_control_force_publish_missed_schedules',
				'callback' => array( $this, 'force_publish_missed_schedules' ),
			),
			array(
				'schedule' => 'a8c_cron_control_ten_minutes',
				'action'   => 'a8c_cron_control_confirm_scheduled_posts',
				'callback' => array( $this, 'confirm_scheduled_posts' ),
			),
			array(
				'schedule' => 'daily',
				'action'   => 'a8c_cron_control_clean_legacy_data',
				'callback' => array( $this, 'clean_legacy_data' ),
			),
			array(
				'schedule' => 'hourly',
				'action'   => 'a8c_cron_control_purge_completed_events',
				'callback' => array( $this, 'purge_completed_events' ),
			),
		);

		// Allow additional internal events to be specified, ensuring the above cannot be overwritten.
		if ( defined( 'CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS' ) && is_array( \CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS ) ) {
			$internal_actions = wp_list_pluck( $internal_events, 'action' );

			foreach ( \CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS as $additional ) {
				if ( in_array( $additional['action'], $internal_actions, true ) ) {
					continue;
				}

				if ( ! array_key_exists( 'schedule', $additional ) || ! array_key_exists( 'action', $additional ) || ! array_key_exists( 'callback', $additional ) ) {
					continue;
				}

				$internal_events[] = $additional;
			}
		}

		$this->internal_events = $internal_events;
	}

	/**
	 * Allow custom internal events to provide their own schedules
	 */
	private function prepare_internal_events_schedules() {
		$internal_events_schedules = array(
			'a8c_cron_control_minute' => array(
				'interval' => 1 * MINUTE_IN_SECONDS,
				'display' => __( 'Cron Control internal job - every minute', 'automattic-cron-control' ),
			),
			'a8c_cron_control_ten_minutes' => array(
				'interval' => 10 * MINUTE_IN_SECONDS,
				'display' => __( 'Cron Control internal job - every 10 minutes', 'automattic-cron-control' ),
			),
		);

		// Allow additional schedules for custom events, ensuring the above cannot be overwritten.
		if ( defined( 'CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS_SCHEDULES' ) && is_array( \CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS_SCHEDULES ) ) {
			foreach ( \CRON_CONTROL_ADDITIONAL_INTERNAL_EVENTS_SCHEDULES as $name => $attrs ) {
				if ( array_key_exists( $name, $internal_events_schedules ) ) {
					continue;
				}

				if ( ! array_key_exists( 'interval', $attrs ) || ! array_key_exists( 'display', $attrs ) ) {
					continue;
				}

				$internal_events_schedules[ $name ] = $attrs;
			}
		}

		$this->internal_events_schedules = $internal_events_schedules;
	}

	/**
	 * Include custom schedules used for internal events
	 *
	 * @param array $schedules List of registered event intervals.
	 * @return array
	 */
	public function register_internal_events_schedules( $schedules ) {
		return array_merge( $schedules, $this->internal_events_schedules );
	}

	/**
	 * Schedule internal events
	 */
	public function schedule_internal_events() {
		$when = strtotime( sprintf( '+%d seconds', JOB_QUEUE_WINDOW_IN_SECONDS ) );

		$schedules = wp_get_schedules();

		foreach ( $this->internal_events as $event_args ) {
			if ( ! wp_next_scheduled( $event_args['action'] ) ) {
				$interval = array_key_exists( $event_args['schedule'], $schedules ) ? $schedules[ $event_args['schedule'] ]['interval'] : 0;

				$args = array(
					'schedule' => $event_args['schedule'],
					'args'     => array(),
					'interval' => $interval,
				);

				schedule_event( $when, $event_args['action'], $args );
			}
		}
	}

	/**
	 * PLUGIN UTILITIES
	 */

	/**
	 * Events that are always run, regardless of how many jobs are queued
	 *
	 * @param string $action Event action.
	 * @return bool
	 */
	public function is_internal_event( $action ) {
		return in_array( $action, wp_list_pluck( $this->internal_events, 'action' ), true );
	}

	/**
	 * EVENT CALLBACKS
	 */

	/**
	 * Publish scheduled posts that miss their schedule
	 */
	public function force_publish_missed_schedules() {
		global $wpdb;

		$missed_posts = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_status = 'future' AND post_date <= %s LIMIT 0,100;", current_time( 'mysql', false ) ) );

		foreach ( $missed_posts as $missed_post ) {
			$missed_post = absint( $missed_post );
			wp_publish_post( $missed_post );
			wp_clear_scheduled_hook( 'publish_future_post', array( $missed_post ) );

			do_action( 'a8c_cron_control_published_post_that_missed_schedule', $missed_post );
		}
	}

	/**
	 * Ensure scheduled posts have a corresponding cron job to publish them
	 */
	public function confirm_scheduled_posts() {
		global $wpdb;

		$page     = 1;
		$quantity = 100;

		do {
			$offset       = max( 0, $page - 1 ) * $quantity;
			$future_posts = $wpdb->get_results( $wpdb->prepare( "SELECT ID, post_date FROM {$wpdb->posts} WHERE post_status = 'future' AND post_date > %s LIMIT %d,%d", current_time( 'mysql', false ), $offset, $quantity ) );

			if ( ! empty( $future_posts ) ) {
				foreach ( $future_posts as $future_post ) {
					$future_post->ID = absint( $future_post->ID );
					$gmt_time        = strtotime( get_gmt_from_date( $future_post->post_date ) . ' GMT' );
					$timestamp       = wp_next_scheduled( 'publish_future_post', array( $future_post->ID ) );

					if ( false === $timestamp ) {
						wp_schedule_single_event( $gmt_time, 'publish_future_post', array( $future_post->ID ) );

						do_action( 'a8c_cron_control_publish_scheduled', $future_post->ID );
					} elseif ( (int) $timestamp !== $gmt_time ) {
						wp_clear_scheduled_hook( 'publish_future_post', array( $future_post->ID ) );
						wp_schedule_single_event( $gmt_time, 'publish_future_post', array( $future_post->ID ) );

						do_action( 'a8c_cron_control_publish_rescheduled', $future_post->ID );
					}
				}
			}

			$page++;

			if ( count( $future_posts ) < $quantity || $page > 5 ) {
				break;
			}
		} while ( ! empty( $future_posts ) );
	}

	/**
	 * Remove unnecessary data and scheduled events
	 *
	 * Some of this data relates to how Core manages Cron when this plugin isn't active
	 */
	public function clean_legacy_data() {
		// Cron option can be very large, so it shouldn't linger.
		delete_option( 'cron' );

		// While this plugin doesn't use this locking mechanism, other code may check the value.
		if ( wp_using_ext_object_cache() ) {
			wp_cache_delete( 'doing_cron', 'transient' );
		} else {
			delete_transient( 'doing_cron' );
		}

		// Confirm internal events are scheduled for when they're expected.
		$schedules = wp_get_schedules();

		foreach ( $this->internal_events as $internal_event ) {
			$timestamp = wp_next_scheduled( $internal_event['action'] );

			// Will reschedule on its own.
			if ( false === $timestamp ) {
				continue;
			}

			$event_details = get_event_by_attributes( array(
				'timestamp' => $timestamp,
				'action'    => $internal_event['action'],
				'instance'  => md5( maybe_serialize( array() ) ),
			) );

			if ( $event_details->schedule !== $internal_event['schedule'] ) {
				if ( $timestamp <= time() ) {
					$timestamp = time() + ( 1 * \MINUTE_IN_SECONDS );
				}

				$args = array(
					'schedule' => $internal_event['schedule'],
					'args'     => $event_details->args,
					'interval' => $schedules[ $internal_event['schedule'] ]['interval'],
				);

				schedule_event( $timestamp, $event_details->action, $args, $event_details->ID );
			}
		}
	}

	/**
	 * Delete event objects for events that have run
	 */
	public function purge_completed_events() {
		Events_Store::instance()->purge_completed_events();
	}
}

Internal_Events::instance();
