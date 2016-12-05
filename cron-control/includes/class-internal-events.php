<?php

namespace Automattic\WP\Cron_Control;

class Internal_Events extends Singleton {
	/**
	 * PLUGIN SETUP
	 */

	/**
	 * Class properties
	 */
	private $internal_jobs           = array();
	private $internal_jobs_schedules = array();

	/**
	 * Register hooks
	 */
	protected function class_init() {
		// Internal jobs variables
		$this->internal_jobs = array(
			array(
				'schedule' => 'a8c_cron_control_minute',
				'action'   => 'a8c_cron_control_force_publish_missed_schedules',
				'callback' => 'force_publish_missed_schedules',
			),
			array(
				'schedule' => 'a8c_cron_control_ten_minutes',
				'action'   => 'a8c_cron_control_confirm_scheduled_posts',
				'callback' => 'confirm_scheduled_posts',
			),
			array(
				'schedule' => 'daily',
				'action'   => 'a8c_cron_control_delete_cron_option',
				'callback' => 'delete_cron_option',
			),
			array(
				'schedule' => 'a8c_cron_control_ten_minutes',
				'action'   => 'a8c_cron_control_purge_completed_events',
				'callback' => 'purge_completed_events',
			),
		);

		$this->internal_jobs_schedules = array(
			'a8c_cron_control_minute' => array(
				'interval' => 1 * MINUTE_IN_SECONDS,
				'display' => __( 'Cron Control internal job - every minute', 'automattic-cron-control' ),
			),
			'a8c_cron_control_ten_minutes' => array(
				'interval' => 10 * MINUTE_IN_SECONDS,
				'display' => __( 'Cron Control internal job - every 10 minutes', 'automattic-cron-control' ),
			),
		);

		// Register hooks
		add_action( 'admin_init', array( $this, 'schedule_internal_events' ) );
		add_action( 'rest_api_init', array( $this, 'schedule_internal_events' ) );
		add_filter( 'cron_schedules', array( $this, 'register_internal_events_schedules' ) );

		foreach ( $this->internal_jobs as $internal_job ) {
			add_action( $internal_job['action'], array( $this, $internal_job['callback'] ) );
		}
	}

	/**
	 * Include custom schedules used for internal jobs
	 */
	public function register_internal_events_schedules( $schedules ) {
		return array_merge( $schedules, $this->internal_jobs_schedules );
	}

	/**
	 * Schedule internal jobs
	 */
	public function schedule_internal_events() {
		$when = strtotime( sprintf( '+%d seconds', JOB_QUEUE_WINDOW_IN_SECONDS ) );

		$schedules = wp_get_schedules();

		foreach ( $this->internal_jobs as $job_args ) {
			if ( ! wp_next_scheduled( $job_args['action'] ) ) {
				$interval = array_key_exists( $job_args['schedule'], $schedules ) ? $schedules[ $job_args['schedule'] ]['interval'] : 0;

				$args = array(
					'schedule' => $job_args['schedule'],
					'args'     => array(),
					'interval' => $interval,
				);

				Cron_Options_CPT::instance()->create_or_update_job( $when, $job_args['action'], $args );
			}
		}
	}

	/**
	 * PLUGIN UTILITIES
	 */

	/**
	 * Events that are always run, regardless of how many jobs are queued
	 */
	public function is_internal_event( $action ) {
		return in_array( $action, wp_list_pluck( $this->internal_jobs, 'action' ) );
	}

	/**
	 * EVENT CALLBACKS
	 */

	/**
	 * Published scheduled posts that miss their schedule
	 */
	public function force_publish_missed_schedules() {
		global $wpdb;

		$missed_posts = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_status = 'future' AND post_date <= %s LIMIT 100;", current_time( 'mysql', false ) ) );

		if ( ! empty( $missed_posts ) ) {
			foreach ( $missed_posts as $missed_post ) {
				$missed_post = absint( $missed_post );
				wp_publish_post( $missed_post );
				wp_clear_scheduled_hook( 'publish_future_post', array( $missed_post ) );

				do_action( 'a8c_cron_control_published_post_that_missed_schedule', $missed_post );
			}
		}
	}

	/**
	 * Ensure scheduled posts have a corresponding cron job to publish them
	 */
	public function confirm_scheduled_posts() {
		global $wpdb;

		$future_posts = $wpdb->get_results( $wpdb->prepare( "SELECT ID, post_date FROM {$wpdb->posts} WHERE post_status = 'future' AND post_date > %s LIMIT 100;", current_time( 'mysql', false ) ) );

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
	}

	/**
	 * In case the cron option lingers, purge it
	 */
	public function delete_cron_option() {
		delete_option( 'cron' );
	}

	/**
	 * Delete event objects for events that have run
	 *
	 * Given volume of events that can be created, waiting for `wp_scheduled_delete()`, which defaults to a trailing 30-day delete, is unwise
	 */
	public function purge_completed_events() {
		$trashed_posts = get_posts( array(
			'post_type'        => Cron_Options_CPT::POST_TYPE,
			'post_status'      => Cron_Options_CPT::POST_STATUS_COMPLETED,
			'posts_per_page'   => 100,
			'fields'           => 'ids',
		) );

		if ( is_array( $trashed_posts ) && ! empty( $trashed_posts ) ) {
			foreach ( $trashed_posts as $trashed_post_id ) {
				wp_delete_post( $trashed_post_id, true );

				do_action( 'a8c_cron_control_purged_completed_event', $trashed_post_id );
			}
		}
	}
}

Internal_Events::instance();
