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
				'schedule_name',
				'event_args',
			) );
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
		$items = $wpdb->get_results( $wpdb->prepare( "SELECT SQL_CALC_FOUND_ROWS ID, post_content_filtered, post_date_gmt, post_modified_gmt FROM {$wpdb->posts} WHERE post_type = %s AND post_status = %s ORDER BY post_date ASC LIMIT %d,%d", \Automattic\WP\Cron_Control\Cron_Options_CPT::POST_TYPE, $post_status, $offset, $limit ) );

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
				'schedule_name'     => __( 'n/a', 'automattic-cron-control' ),
				'event_args'        => '',
			);

			// Most data serialized in the post
			$all_args = maybe_unserialize( $event->post_content_filtered );
			if ( is_array( $all_args ) ) {
				// Action
				if ( isset( $all_args['action'] ) ) {
					$row['action'] = $all_args['action'];
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
}

\WP_CLI::add_command( 'cron-control events', 'Automattic\WP\Cron_Control\CLI\Events' );
