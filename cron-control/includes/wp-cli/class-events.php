<?php

namespace Automattic\WP\Cron_Control\CLI;

/**
 * Manage Cron Control's data
 */
class Events extends \WP_CLI_Command {
	/**
	 * List cron events
	 *
	 * Intentionally bypasses caching to ensure latest data is shown
	 *
	 * @subcommand list
	 * @synopsis [--status=<pending|completed>] [--page=<page>] [--limit=<limit>] [--format=<format>]
	 */
	public function list_events( $args, $assoc_args ) {
		$events = $this->get_events( $args, $assoc_args );

		// Output in the requested format
		if ( isset( $assoc_args['format'] ) && 'ids' === $assoc_args['format'] ) {
			echo implode( ' ', wp_list_pluck( $events['items'], 'ID' ) );
		} else {
			// Lest someone think the `completed` record should be...complete
			if ( isset( $assoc_args['status'] ) && 'completed' === $assoc_args['status'] ) {
				\WP_CLI::warning( __( 'Entries are purged automatically, so this cannot be relied upon as a record of past event execution.', 'automattic-cron-control' ) );
			}

			// Not much to do
			if ( 0 === $events['total_items'] ) {
				\WP_CLI::success( __( 'No events to display', 'automattic-cron-control' ) );
				return;
			}

			// Prepare events for display
			$events_for_display      = $this->format_events( $events['items'] );
			$total_events_to_display = count( $events_for_display );

			// Count, noting if showing fewer than all
			if ( $events['total_items'] <= $total_events_to_display ) {
				\WP_CLI::line( sprintf( _n( 'Displaying one entry', 'Displaying all %s entries', $total_events_to_display, 'automattic-cron-control' ), number_format_i18n( $total_events_to_display ) ) );
			} else {
				\WP_CLI::line( sprintf( __( 'Displaying %s of %s entries, page %s of %s', 'automattic-cron-control' ), number_format_i18n( $total_events_to_display ), number_format_i18n( $events['total_items'] ), number_format_i18n( $events['page'] ), number_format_i18n( $events['total_pages'] ) ) );
			}

			// And reformat
			$format = 'table';
			if ( isset( $assoc_args['format'] ) ) {
				$format = $assoc_args['format'];
			}

			\WP_CLI\Utils\format_items( $format, $events_for_display, array(
				'ID',
				'action',
				'instance',
				'next_run_gmt',
				'next_run_relative',
				'last_updated_gmt',
				'recurrence',
				'internal_event',
				'schedule_name',
				'event_args',
			) );
		}
	}

	/**
	 * Remove events by ID or action
	 *
	 * @subcommand delete
	 * @synopsis [--event_id=<event_id>] [--action=<action>]
	 */
	public function delete_events( $args, $assoc_args ) {
		// Remove a specific event
		if ( isset( $assoc_args['event_id'] ) ) {
			$this->delete_event_by_id( $args, $assoc_args );
			return;
		}

		// Remove all events with a given action
		if ( isset( $assoc_args['action'] ) ) {
			$this->delete_event_by_action( $args, $assoc_args );
			return;
		}

		\WP_CLI::error( __( 'Specify something to delete, or see the `cron-control-fixers` command to remove all data.', 'automattic-cron-control' ) );
	}

	/**
	 * Run an event given an ID
	 *
	 * @subcommand run
	 * @synopsis <event_id>
	 */
	public function run_event( $args, $assoc_args ) {
		// Validate ID
		if ( ! is_numeric( $args[0] ) ) {
			\WP_CLI::error( __( 'Specify the ID of an event to run', 'automattic-cron-control' ) );
		}

		// Validate event ID and get the information needed to execute it
		global $wpdb;

		$event = $wpdb->get_var( $wpdb->prepare( "SELECT post_title FROM {$wpdb->posts} WHERE ID = %d AND post_type = %s AND post_status = %s LIMIT 1", $args[0], \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_TYPE, \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_STATUS_PENDING ) );

		if ( empty( $event ) ) {
			\WP_CLI::error( sprintf( __( 'Failed to locate event %d. Please confirm that the entry exists and that the ID is that of an event.', 'automattic-cron-control' ), $args[0] ) );
		}

		// Event data
		$event_data = $this->get_event_details_from_post_title( $event );

		\WP_CLI::line( sprintf( __( 'Found event %d with action `%s` and instance identifier `%s`', 'automattic-cron-control' ), $args[0], $event_data['action'], $event_data['instance'] ) );

		// Proceed?
		$now = time();
		if ( $event_data['timestamp'] > $now ) {
			\WP_CLI::warning( sprintf( __( 'This event is not scheduled to run until %1$s GMT (%2$s)', 'automattic-cron-control' ), date( TIME_FORMAT, $event_data['timestamp'] ), $this->calculate_interval( $event_data['timestamp'] - $now ) ) );
		}

		\WP_CLI::confirm( sprintf( __( 'Run this event?', 'automattic-cron-control' ) ) );

		// Environment preparation
		if ( ! defined( 'DOING_CRON' ) ) {
			define( 'DOING_CRON', true );
		}

		// Run the event
		$run = \Automattic\WP\Cron_Control\Events::instance()->run_event( $event_data['timestamp'], md5( $event_data['action'] ), $event_data['instance'], true );

		// Output based on run attempt
		if ( is_array( $run ) ) {
			\WP_CLI::success( $run['message'] );
		} elseif ( is_wp_error( $run ) ) {
			\WP_CLI::error( $run->get_error_message() );
		} else {
			\WP_CLI::error( __( 'Failed to run event', 'automattic-cron-control' ) );
		}
	}

	/**
	 * Retrieve list of events, and related data, for a given request
	 */
	private function get_events( $args, $assoc_args ) {
		global $wpdb;

		// Validate status, with a default
		$status = 'pending';
		if ( isset( $assoc_args['status'] ) ) {
			$status = $assoc_args['status'];
		}

		if ( 'pending' !== $status && 'completed' !== $status ) {
			\WP_CLI::error( __( 'Invalid status requested', 'automattic-cron-control' ) );
		}

		// Convert to post status
		$post_status = null;
		switch ( $status ) {
			case 'pending' :
				$post_status = \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_STATUS_PENDING;
				break;

			case 'completed' :
				$post_status = \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_STATUS_COMPLETED;
				break;
		}

		// Total to show
		$limit = 25;
		if ( isset( $assoc_args['limit'] ) && is_numeric( $assoc_args['limit'] ) ) {
			$limit = max( 1, min( absint( $assoc_args['limit'] ), 500 ) );
		}

		// Pagination
		$page = 1;
		if ( isset( $assoc_args['page'] ) && is_numeric( $assoc_args['page'] ) ) {
			$page = absint( $assoc_args['page'] );
		}

		$offset = absint( ( $page - 1 ) * $limit );

		// Query
		$items = $wpdb->get_results( $wpdb->prepare( "SELECT SQL_CALC_FOUND_ROWS ID, post_title, post_content_filtered, post_date_gmt, post_modified_gmt FROM {$wpdb->posts} WHERE post_type = %s AND post_status = %s ORDER BY post_date ASC LIMIT %d,%d", \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_TYPE, $post_status, $offset, $limit ) );

		// Bail if we don't get results
		if ( ! is_array( $items ) ) {
			\WP_CLI::error( __( 'Problem retrieving events', 'automattic-cron-control' ) );
		}

		// Include totals for pagination etc
		$total_items = (int) $wpdb->get_var( 'SELECT FOUND_ROWS()' );
		$total_pages = ceil( $total_items / $limit );

		return compact( 'status', 'limit', 'page', 'offset', 'items', 'total_items', 'total_pages' );
	}

	/**
	 * Format event data into something human-readable
	 */
	private function format_events( $events ) {
		$formatted_events = array();

		// Reformat events
		foreach ( $events as $event ) {
			$row = array(
				'ID'                => $event->ID,
				'action'            => '',
				'instance'          => '',
				'next_run_gmt'      => date( TIME_FORMAT, strtotime( $event->post_date_gmt ) ),
				'next_run_relative' => $this->calculate_interval( strtotime( $event->post_date_gmt ) - time() ),
				'last_updated_gmt'  => date( TIME_FORMAT, strtotime( $event->post_modified_gmt ) ),
				'recurrence'        => __( 'Non-repeating', 'automattic-cron-control' ),
				'internal_event'    => '',
				'schedule_name'     => __( 'n/a', 'automattic-cron-control' ),
				'event_args'        => '',
			);

			// Most data serialized in the post
			$all_args = maybe_unserialize( $event->post_content_filtered );
			if ( is_array( $all_args ) ) {
				// Action
				if ( isset( $all_args['action'] ) ) {
					$row['action']         = $all_args['action'];
					$row['internal_event'] = \Automattic\WP\Cron_Control\is_internal_event( $all_args['action'] ) ? __( 'true', 'automattic-cron-control' ) : '';
				}

				// Instance
				if ( isset( $all_args['instance'] ) ) {
					$row['instance'] = $all_args['instance'];
				}

				// Additional arguments
				if ( isset( $all_args['args'] ) ) {
					$args = $all_args['args'];

					// Event arguments themselves
					if ( isset( $args['args'] ) ) {
						$row['event_args'] = maybe_serialize( $args['args'] );
					}

					// Human-readable version of next run
					if ( isset( $args['interval'] ) && $args['interval'] ) {
						$row['recurrence'] = $this->calculate_interval( $args['interval'] );
					}

					// Named schedule
					if ( isset( $args['schedule'] ) && $args['schedule'] ) {
						$row['schedule_name'] = $args['schedule'];
					}
				}
			}

			$formatted_events[] = $row;
		}

		return $formatted_events;
	}

	/**
	 * Convert a time interval into human-readable format.
	 *
	 * Similar to WordPress' built-in `human_time_diff()` but returns two time period chunks instead of just one.
	 *
	 * Borrowed from WP-CLI
	 *
	 * @param int $since An interval of time in seconds
	 * @return string The interval in human readable format
	 */
	private function calculate_interval( $since ) {
		if ( $since <= 0 ) {
			return 'now';
		}

		$since = absint( $since );

		// array of time period chunks
		$chunks = array(
			array( 60 * 60 * 24 * 365 , \_n_noop( '%s year', '%s years' ) ),
			array( 60 * 60 * 24 * 30 , \_n_noop( '%s month', '%s months' ) ),
			array( 60 * 60 * 24 * 7, \_n_noop( '%s week', '%s weeks' ) ),
			array( 60 * 60 * 24 , \_n_noop( '%s day', '%s days' ) ),
			array( 60 * 60 , \_n_noop( '%s hour', '%s hours' ) ),
			array( 60 , \_n_noop( '%s minute', '%s minutes' ) ),
			array(  1 , \_n_noop( '%s second', '%s seconds' ) ),
		);

		// we only want to output two chunks of time here, eg:
		// x years, xx months
		// x days, xx hours
		// so there's only two bits of calculation below:

		// step one: the first chunk
		for ( $i = 0, $j = count( $chunks ); $i < $j; $i++ ) {
			$seconds = $chunks[$i][0];
			$name = $chunks[$i][1];

			// finding the biggest chunk (if the chunk fits, break)
			if ( ( $count = floor( $since / $seconds ) ) != 0 ){
				break;
			}
		}

		// set output var
		$output = sprintf( \_n( $name[0], $name[1], $count ), $count );

		// step two: the second chunk
		if ( $i + 1 < $j ) {
			$seconds2 = $chunks[$i + 1][0];
			$name2    = $chunks[$i + 1][1];

			if ( ( $count2 = floor( ( $since - ( $seconds * $count ) ) / $seconds2 ) ) != 0 ) {
				// add to output var
				$output .= ' ' . sprintf( \_n( $name2[0], $name2[1], $count2 ), $count2 );
			}
		}

		return $output;
	}

	/**
	 * Delete an event by ID
	 */
	private function delete_event_by_id( $args, $assoc_args ) {
		$jid = absint( $assoc_args['event_id'] );

		// Validate ID
		if ( ! $jid ) {
			\WP_CLI::error( __( 'Invalid event ID', 'automattic-cron-control' ) );
		}

		\WP_CLI::line( __( 'Locating event...', 'automattic-cron-control' ) . "\n" );

		// Look up full object and confirm that the entry belongs to this plugin's CPT
		global $wpdb;

		$event_post = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->posts} WHERE post_type = %s AND ID = %d LIMIT 1", \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_TYPE, $jid ) );

		if ( is_object( $event_post ) && ! is_wp_error( $event_post ) ) {
			// Parse basic event data and output, lest someone delete the wrong thing
			$event_details = $this->get_event_details_from_post_title( $event_post->post_title );

			// Warning about Internal Events
			if ( \Automattic\WP\Cron_Control\is_internal_event( $event_details['action'] ) ) {
				\WP_CLI::warning( __( 'This is an event created by the Cron Control plugin. It will recreated automatically.', 'automattic-cron-control' ) );
			}

			\WP_CLI::line( sprintf( __( 'Execution time: %s GMT', 'automattic-cron-control' ), date( TIME_FORMAT, $event_details['timestamp'] ) ) );
			\WP_CLI::line( sprintf( __( 'Action: %s', 'automattic-cron-control' ), $event_details['action'] ) );
			\WP_CLI::line( sprintf( __( 'Instance identifier: %s', 'automattic-cron-control' ), $event_details['instance'] ) );
			\WP_CLI::line( '' );
			\WP_CLI::confirm( sprintf( __( 'Are you sure you want to delete this event?', 'automattic-cron-control' ) ) );

			// Try to delete the item and provide some relevant output
			$trashed = wp_delete_post( $event_post->ID, true );

			if ( false === $trashed ) {
				\WP_CLI::error( sprintf( __( 'Failed to delete event %d', 'automattic-cron-control' ), $jid ) );
			} else {
				\Automattic\WP\Cron_Control\_flush_internal_caches();
				\WP_CLI::success( sprintf( __( 'Removed event %d', 'automattic-cron-control' ), $jid ) );
				return;
			}
		}

		\WP_CLI::error( sprintf( __( 'Failed to delete event %d. Please confirm that the entry exists and that the ID is that of an event.', 'automattic-cron-control' ), $jid ) );
	}

	/**
	 * Delete all events of the same action
	 */
	private function delete_event_by_action( $args, $assoc_args ) {
		$action = $assoc_args['action'];

		// Validate entry
		if ( empty( $action ) ) {
			\WP_CLI::error( __( 'Invalid action', 'automattic-cron-control' ) );
		}

		// Warning about Internal Events
		if ( \Automattic\WP\Cron_Control\is_internal_event( $action ) ) {
			\WP_CLI::warning( __( 'This is an event created by the Cron Control plugin. It will recreated automatically.', 'automattic-cron-control' ) );
		}

		// Set defaults needed to gather all events
		$assoc_args['page']  = 1;
		$assoc_args['limit'] = 50;

		// Gather events
		\WP_CLI::line( __( 'Gathering events...', 'automattic-cron-control' ) );

		$events_to_delete = array();

		$events = $this->get_events( $args, $assoc_args );

		\WP_CLI::line( sprintf( _n( 'Found one event to check', 'Found %s events to check', $events['total_items'], 'automattic-cron-control' ), number_format_i18n( $events['total_items'] ) ) );

		$search_progress = \WP_CLI\Utils\make_progress_bar( sprintf( __( 'Searching events for those with the action `%s`', 'automattic-cron-control' ), $action ), $events['total_items'] );

		// Loop and pull out events to be deleted
		do {
			if ( ! is_array( $events ) || empty( $events['items'] ) ) {
				break;
			}

			// Check events for those that should be deleted
			foreach ( $events['items'] as $single_event ) {
				$event_details = $this->get_event_details_from_post_title( $single_event->post_title );

				if ( $event_details['action'] === $action ) {
					$events_to_delete[] = array_merge( $event_details, array(
						'ID'                => (int) $single_event->ID,
						'post_date_gmt'     => $single_event->post_date_gmt,
						'post_modified_gmt' => $single_event->post_modified_gmt,
					) );
				}

				$search_progress->tick();
			}

			// Proceed to next batch
			$assoc_args['page']++;

			if ( $assoc_args['page'] > $events['total_pages'] ) {
				break;
			}

			$events = $this->get_events( $args, $assoc_args );
		} while( $events['page'] <= $events['total_pages'] );

		$search_progress->finish();

		\WP_CLI::line( '' );

		// Nothing more to do
		if ( empty( $events_to_delete ) ) {
			\WP_CLI::error( sprintf( __( 'No events with action `%s` found', 'automattic-cron-control' ), $action ) );
		}

		// List the items to remove
		$total_to_delete = count( $events_to_delete );

		\WP_CLI::line( sprintf( _n( 'Found one event with action `%2$s`:', 'Found %1$s events with action `%2$s`:', $total_to_delete, 'automattic-cron-control' ), number_format_i18n( $total_to_delete ), $action ) );

		if ( $total_to_delete <= $assoc_args['limit'] ) {
			\WP_CLI\Utils\format_items( 'table', $events_to_delete, array(
				'ID',
				'post_date_gmt',
				'post_modified_gmt',
				'timestamp',
				'instance',
			) );
		} else {
			\WP_CLI::warning( sprintf( __( 'Events are not displayed as there are more than %s to remove', 'automattic-cron-control' ), number_format_i18n( $assoc_args['limit'] ) ) );
		}

		\WP_CLI::line( '' );
		\WP_CLI::confirm( _n( 'Are you sure you want to delete this event?', 'Are you sure you want to delete these events?', $total_to_delete, 'automattic-cron-control' ) );

		// Remove the items
		$delete_progress = \WP_CLI\Utils\make_progress_bar( __( 'Deleting events', 'automattic-cron-control' ), $total_to_delete );

		$events_deleted       = array();
		$events_deleted_count = $events_failed_delete = 0;

		foreach ( $events_to_delete as $event_to_delete ) {
			$deleted = wp_delete_post( $event_to_delete['ID'], true );

			$events_deleted[] = array(
				'ID'      => $event_to_delete['ID'],
				'deleted' => false === $deleted ? 'no' : 'yes',
			);

			if ( $deleted ) {
				$events_deleted_count++;
			} else {
				$events_failed_delete++;
			}

			$delete_progress->tick();
		}

		$delete_progress->finish();

		// When deletes succeed, sync internal caches
		if ( $events_deleted_count > 0 ) {
			\Automattic\WP\Cron_Control\_flush_internal_caches();
		}

		// List the removed items
		\WP_CLI::line( "\n" . __( 'RESULTS:', 'automattic-cron-control' ) );

		if ( 1 === $total_to_delete && 1 === $events_deleted_count ) {
			\WP_CLI::success( sprintf( __( 'Deleted one event: %d', 'automattic-cron-control' ), $events_deleted[0]['ID'] ) );
		} else {
			if ( $events_deleted_count === $total_to_delete ) {
				\WP_CLI::success( sprintf( __( 'Deleted %s events', 'automattic-cron-control' ), number_format_i18n( $events_deleted_count ) ) );
			} else {
				\WP_CLI::warning( sprintf( __( 'Expected to delete %1$s events, but could only delete %2$s events. It\'s likely that some events were executed while this command ran.', 'automattic-cron-control' ), number_format_i18n( $total_to_delete ), number_format_i18n( $events_deleted_count ) ) );
			}

			// Limit just to failed deletes when many events are removed
			if ( count( $events_deleted ) > $assoc_args['limit'] ) {
				$events_deleted_unfiltered = $events_deleted;

				$events_deleted = array_filter( $events_deleted, function( $event ) {
					if ( 'no' === $event['deleted'] ) {
						return $event;
					} else {
						return false;
					}
				} );

				if ( count( $events_deleted ) > 0 ) {
					\WP_CLI::line( "\n" . __( 'Events that couldn\'t be deleted:', 'automattic-cron-control' ) );
				}
			} else {
				\WP_CLI::line( "\n" . __( 'Events deleted:', 'automattic-cron-control' ) );
			}

			// Don't display a table if there's nothing to display
			if ( count( $events_deleted ) > 0 ) {
				\WP_CLI\Utils\format_items( 'table', $events_deleted, array(
					'ID',
					'deleted',
				) );
			}
		}

		return;
	}

	/**
	 * Parse event details stored in an item's post_title
	 */
	private function get_event_details_from_post_title( $title ) {
		$event_details = explode( '|', $title );
		$event_details = array_map( 'trim', $event_details );

		return array(
			'timestamp' => (int) $event_details[0],
			'action'    => $event_details[1],
			'instance'  => $event_details[2],
		);
	}
}

\WP_CLI::add_command( 'cron-control events', 'Automattic\WP\Cron_Control\CLI\Events' );
