<?php
/**
 * Offload cron event storage to a custom table
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control;

/**
 * Events Store class
 */
class Events_Store extends Singleton {
	/**
	 * PLUGIN SETUP
	 */

	/**
	 * Class constants
	 */
	const TABLE_SUFFIX = 'a8c_cron_control_jobs';

	const DB_VERSION        = 1;
	const DB_VERSION_OPTION = 'a8c_cron_control_db_version';
	const TABLE_CREATE_LOCK = 'a8c_cron_control_creating_table';

	const STATUS_PENDING   = 'pending';
	const STATUS_RUNNING   = 'running';
	const STATUS_COMPLETED = 'complete';
	const ALLOWED_STATUSES = array(
		self::STATUS_PENDING,
		self::STATUS_RUNNING,
		self::STATUS_COMPLETED,
	);

	const CACHE_KEY = 'a8c_cron_ctrl_option';

	/**
	 * Whether or not event creation is temporarily blocked
	 *
	 * @var bool
	 */
	private $job_creation_suspended = false;

	/**
	 * Register hooks
	 */
	protected function class_init() {
		// Create tables during installation.
		add_action( 'wp_install', array( $this, 'create_table_during_install' ) );
		add_action( 'wpmu_new_blog', array( $this, 'create_tables_during_multisite_install' ) );

		// Remove table when a multisite subsite is deleted.
		add_filter( 'wpmu_drop_tables', array( $this, 'remove_multisite_table' ) );

		// Enable plugin when conditions support it, otherwise limit errors as much as possible.
		if ( self::is_installed() ) {
			// Option interception.
			add_filter( 'pre_option_cron', array( $this, 'get_option' ) );
			add_filter( 'pre_update_option_cron', array( $this, 'update_option' ), 10, 2 );

			// Disallow duplicates.
			add_filter( 'schedule_event', array( $this, 'block_creation_if_job_exists' ) );
		} else {
			// Can't create events since there's no table to hold them.
			$this->suspend_event_creation();

			// Prime plugin's options when the options table exists.
			if ( ! defined( 'WP_INSTALLING' ) || ! WP_INSTALLING ) {
				$this->prime_options();
			}

			// Don't schedule events that won't be run.
			add_filter( 'schedule_event', '__return_false' );

			// In limited circumstances, try creating the table.
			add_action( 'shutdown', array( $this, 'maybe_create_table_on_shutdown' ) );
		}
	}

	/**
	 * Check if events store is ready
	 *
	 * Plugin breaks spectacularly if events store isn't available
	 *
	 * @return bool
	 */
	public static function is_installed() {
		$db_version = (int) get_option( self::DB_VERSION_OPTION );

		return version_compare( $db_version, 0, '>' );
	}

	/**
	 * Build appropriate table name for this install
	 */
	public function get_table_name() {
		global $wpdb;

		return $wpdb->prefix . self::TABLE_SUFFIX;
	}

	/**
	 * Set initial options that control plugin's behaviour
	 */
	protected function prime_options() {
		// Prime DB option.
		add_option( self::DB_VERSION_OPTION, 0, null, false );
	}

	/**
	 * Create table during initial install
	 */
	public function create_table_during_install() {
		if ( 'wp_install' !== current_action() ) {
			return;
		}

		$this->_prepare_table();
	}

	/**
	 * Create table when new subsite is added to a multisite
	 *
	 * @param int $bid Blog ID.
	 */
	public function create_tables_during_multisite_install( $bid ) {
		switch_to_blog( $bid );

		if ( ! self::is_installed() ) {
			$this->_prepare_table();
		}

		restore_current_blog();
	}

	/**
	 * For certain requests, create the table on shutdown
	 * Does not include front-end requests
	 */
	public function maybe_create_table_on_shutdown() {
		if ( ! is_admin() && ! is_rest_endpoint_request( REST_API::ENDPOINT_LIST ) ) {
			return;
		}

		$this->prepare_table();
	}

	/**
	 * Create table in non-setup contexts, with some protections
	 */
	public function prepare_table() {
		// Table installed.
		if ( self::is_installed() ) {
			return;
		}

		// Nothing to do.
		$current_version = (int) get_option( self::DB_VERSION_OPTION );
		if ( version_compare( $current_version, self::DB_VERSION, '>=' ) ) {
			return;
		}

		// Limit chance of race conditions when creating table.
		$create_lock_set = wp_cache_add( self::TABLE_CREATE_LOCK, 1, null, 1 * \MINUTE_IN_SECONDS );
		if ( false === $create_lock_set ) {
			return;
		}

		$this->_prepare_table();
	}

	/**
	 * Create the plugin's DB table when necessary
	 */
	protected function _prepare_table() {
		// Use Core's method of creating/updating tables.
		if ( ! function_exists( 'dbDelta' ) ) {
			require_once ABSPATH . '/wp-admin/includes/upgrade.php';
		}

		global $wpdb;

		$table_name = $this->get_table_name();

		// Define schema and create the table.
		$schema = "CREATE TABLE `{$table_name}` (
			`ID` bigint(20) unsigned NOT NULL AUTO_INCREMENT,

			`timestamp` bigint(20) unsigned NOT NULL,
			`action` varchar(255) NOT NULL,
			`action_hashed` varchar(32) NOT NULL,
			`instance` varchar(32) NOT NULL,

			`args` longtext NOT NULL,
			`schedule` varchar(255) DEFAULT NULL,
			`interval` int unsigned DEFAULT 0,
			`status` varchar(32) NOT NULL DEFAULT 'pending',

			`created` datetime NOT NULL,
			`last_modified` datetime NOT NULL,

			PRIMARY KEY (`ID`),
			UNIQUE KEY `ts_action_instance_status` (`timestamp`, `action` (191), `instance`, `status`),
			KEY `status` (`status`)
		) ENGINE=InnoDB;\n";

		dbDelta( $schema, true );

		// Confirm that the table was created, and set the option to prevent further updates.
		$table_count = count( $wpdb->get_col( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) );

		if ( 1 === $table_count ) {
			update_option( self::DB_VERSION_OPTION, self::DB_VERSION );
		}

		// Clear caches now that table exists.
		$this->flush_internal_caches();
	}

	/**
	 * Prepare table on demand via CLI
	 */
	public function cli_create_tables() {
		if ( ! defined( 'WP_CLI' ) || ! \WP_CLI ) {
			return;
		}

		$this->_prepare_table();
	}

	/**
	 * When deleting a subsite from a multisite instance, include the plugin's table
	 *
	 * Core only drops its tables
	 *
	 * @param  array $tables_to_drop Array of prefixed table names to drop.
	 * @return array
	 */
	public function remove_multisite_table( $tables_to_drop ) {
		$tables_to_drop[] = $this->get_table_name();

		return $tables_to_drop;
	}

	/**
	 * PLUGIN FUNCTIONALITY
	 */

	/**
	 * Override cron option requests with data from custom table
	 */
	public function get_option() {
		// Use cached value when available.
		$cached_option = $this->get_cached_option();

		if ( false !== $cached_option ) {
			return $cached_option;
		}

		// Start building a new cron option.
		$cron_array = array(
			'version' => 2, // Core versions the cron array; without this, events will continually requeue.
		);

		// Get events to re-render as the cron option.
		$page     = 1;
		$quantity = 100;

		do {
			$jobs = $this->get_jobs( array(
				'status'   => self::STATUS_PENDING,
				'quantity' => $quantity,
				'page'     => $page++,
			) );

			// Nothing more to add.
			if ( empty( $jobs ) ) {
				break;
			}

			// Loop through results and built output Core expects.
			foreach ( $jobs as $job ) {
				// Alias event timestamp.
				$timestamp = $job->timestamp;

				// If timestamp is invalid, event is removed to let its source fix it.
				if ( $timestamp <= 0 ) {
					$this->mark_job_record_completed( $job->ID );
					continue;
				}

				// Basic arguments to add a job to the array format Core expects.
				$action   = $job->action;
				$instance = $job->instance;

				// Populate remaining job data.
				$cron_array[ $timestamp ][ $action ][ $instance ] = array(
					'schedule' => $job->schedule,
					'args'     => $job->args,
					'interval' => 0,
				);

				if ( isset( $job->interval ) ) {
					$cron_array[ $timestamp ][ $action ][ $instance ]['interval'] = $job->interval;
				}
			}
		} while ( count( $jobs ) >= $quantity );

		// Re-sort the array just as Core does when events are scheduled.
		// Ensures events are sorted chronologically.
		uksort( $cron_array, 'strnatcasecmp' );

		// Cache the results.
		$this->cache_option( $cron_array );

		return $cron_array;
	}

	/**
	 * Handle requests to update the cron option
	 *
	 * By returning $old_value, `cron` option won't be updated
	 *
	 * @param array $new_value New option value.
	 * @param array $old_value Old option value.
	 * @return array
	 */
	public function update_option( $new_value, $old_value ) {
		// Find changes to record.
		$new_events     = $this->find_cron_array_differences( $new_value, $old_value );
		$deleted_events = $this->find_cron_array_differences( $old_value, $new_value );

		// Add/update new events.
		foreach ( $new_events as $new_event ) {
			$job_id = $this->get_job_id( $new_event['timestamp'], $new_event['action'], $new_event['instance'] );

			if ( 0 === $job_id ) {
				$job_id = null;
			}

			$this->create_or_update_job( $new_event['timestamp'], $new_event['action'], $new_event['args'], $job_id, false );
		}

		// Mark deleted entries for removal.
		foreach ( $deleted_events as $deleted_event ) {
			$this->mark_job_completed( $deleted_event['timestamp'], $deleted_event['action'], $deleted_event['instance'], false );
		}

		$this->flush_internal_caches();

		return $old_value;
	}

	/**
	 * When an entry exists, don't try to create it again
	 *
	 * @param object $job Job object.
	 * @return bool|object
	 */
	public function block_creation_if_job_exists( $job ) {
		// Job already disallowed, carry on.
		if ( ! is_object( $job ) ) {
			return $job;
		}

		$instance = md5( maybe_serialize( $job->args ) );
		if ( 0 !== $this->get_job_id( $job->timestamp, $job->hook, $instance ) ) {
			return false;
		}

		return $job;
	}

	/**
	 * PLUGIN UTILITY METHODS
	 */

	/**
	 * Retrieve jobs given a set of parameters
	 *
	 * @param array $args Job arguments to search by.
	 * @return array
	 */
	public function get_jobs( $args ) {
		global $wpdb;

		if ( ! isset( $args['quantity'] ) || ! is_numeric( $args['quantity'] ) ) {
			$args['quantity'] = 100;
		}

		if ( isset( $args['page'] ) ) {
			$page  = max( 0, $args['page'] - 1 );
			$offset = $page * $args['quantity'];
		} else {
			$offset = 0;
		}

		// Avoid sorting whenever possible, otherwise filesort is used.
		// Generally only necessary in CLI commands for pagination, as full list of events is usually required.
		if ( isset( $args['force_sort'] ) && true === $args['force_sort'] ) {
			$query = $wpdb->prepare( "SELECT * FROM {$this->get_table_name()} WHERE status = %s ORDER BY timestamp ASC LIMIT %d,%d;", $args['status'], $offset, $args['quantity'] ); // Cannot prepare table name. @codingStandardsIgnoreLine
		} else {
			$query = $wpdb->prepare( "SELECT * FROM {$this->get_table_name()} WHERE status = %s LIMIT %d,%d;", $args['status'], $offset, $args['quantity'] ); // Cannot prepare table name. @codingStandardsIgnoreLine
		}

		$jobs = $wpdb->get_results( $query, 'OBJECT' ); // Already prepared. @codingStandardsIgnoreLine

		if ( is_array( $jobs ) ) {
			$jobs = array_map( array( $this, 'format_job' ), $jobs );
		} else {
			$jobs = array();
		}

		return $jobs;
	}

	/**
	 * Retrieve a single event by its ID
	 *
	 * @param int $jid Job ID.
	 * @return object|false
	 */
	public function get_job_by_id( $jid ) {
		global $wpdb;

		// Validate ID.
		$jid = absint( $jid );
		if ( ! $jid ) {
			return false;
		}

		$job = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$this->get_table_name()} WHERE ID = %d AND status = %s LIMIT 1", $jid, self::STATUS_PENDING ) ); // Cannot prepare table name. @codingStandardsIgnoreLine

		if ( is_object( $job ) && ! is_wp_error( $job ) ) {
			$job = $this->format_job( $job );
		} else {
			$job = false;
		}

		return $job;
	}

	/**
	 * Retrieve a single event by a combination of its timestamp, instance identifier, and either action or the action's hashed representation
	 *
	 * @param array $attrs Array of event attributes to query by.
	 * @return object|false
	 */
	public function get_job_by_attributes( $attrs ) {
		global $wpdb;

		// Validate basic inputs.
		if ( ! is_array( $attrs ) || empty( $attrs ) ) {
			return false;
		}

		// Validate requested status.
		$allowed_status = self::ALLOWED_STATUSES;
		$allowed_status[] = 'any';

		if ( ! isset( $attrs['status'] ) || ! in_array( $attrs['status'], $allowed_status, true ) ) {
			$attrs['status'] = self::STATUS_PENDING;
		}

		// Need a timestamp, an instance, and either an action or its hashed representation.
		if ( ! isset( $attrs['timestamp'] ) || ! isset( $attrs['instance'] ) ) {
			return false;
		} elseif ( ! isset( $attrs['action'] ) && ! isset( $attrs['action_hashed'] ) ) {
			return false;
		}

		// Build query.
		if ( isset( $attrs['action'] ) ) {
			$action_column = 'action';
			$action_value  = $attrs['action'];
		} else {
			$action_column = 'action_hashed';
			$action_value  = $attrs['action_hashed'];
		}

		// Do not sort, otherwise index isn't used.
		$query = $wpdb->prepare( "SELECT * FROM {$this->get_table_name()} WHERE timestamp = %d AND {$action_column} = %s AND instance = %s", $attrs['timestamp'], $action_value, $attrs['instance'] );  // Cannot prepare table or column names. @codingStandardsIgnoreLine

		// Final query preparations.
		if ( 'any' !== $attrs['status'] ) {
			$query .= $wpdb->prepare( ' AND status = %s', $attrs['status'] );
		}

		$query .= ' LIMIT 1';

		// Query and format results.
		$job = $wpdb->get_row( $query ); // Already prepared. @codingStandardsIgnoreLine

		if ( is_object( $job ) && ! is_wp_error( $job ) ) {
			$job = $this->format_job( $job );
		} else {
			$job = false;
		}

		return $job;
	}

	/**
	 * Get ID for given event details
	 *
	 * Used in situations where performance matters, which is why it exists despite duplicating `get_job_by_attributes()`
	 * Queries outside of this class should use `get_job_by_attributes()`
	 *
	 * @param int    $timestamp    Unix timestamp event executes at.
	 * @param string $action       Name of action used when the event is registered (unhashed).
	 * @param string $instance     md5 hash of the event's arguments array, which Core uses to index the `cron` option.
	 * @return int
	 */
	private function get_job_id( $timestamp, $action, $instance ) {
		global $wpdb;

		$job = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM {$this->get_table_name()} WHERE timestamp = %d AND action = %s AND instance = %s AND status = %s LIMIT 1;", $timestamp, $action, $instance, self::STATUS_PENDING ) ); // Cannot prepare table name. @codingStandardsIgnoreLine

		return empty( $job ) ? 0 : (int) array_shift( $job );
	}

	/**
	 * Standardize formatting and expand serialized data
	 *
	 * @param object $job Job row from DB, in object form.
	 * @return object
	 */
	private function format_job( $job ) {
		if ( ! is_object( $job ) || is_wp_error( $job ) ) {
			return $job;
		}

		$job->ID        = (int) $job->ID;
		$job->timestamp = (int) $job->timestamp;
		$job->interval  = (int) $job->interval;
		$job->args      = maybe_unserialize( $job->args );

		if ( empty( $job->schedule ) ) {
			$job->schedule = false;
		}

		return $job;
	}

	/**
	 * Create or update entry for a given job
	 *
	 * @param int    $timestamp    Unix timestamp event executes at.
	 * @param string $action       Hook event fires.
	 * @param array  $args         Array of event's schedule, arguments, and interval.
	 * @param bool   $update_id    ID of existing entry to update, rather than creating a new entry.
	 * @param bool   $flush_cache  Whether or not to flush internal caches after creating/updating the event.
	 */
	public function create_or_update_job( $timestamp, $action, $args, $update_id = null, $flush_cache = true ) {
		// Don't create new jobs when manipulating jobs via the plugin's CLI commands.
		if ( $this->job_creation_suspended ) {
			return;
		}

		global $wpdb;

		$job_post = array(
			'timestamp'     => $timestamp,
			'action'        => $action,
			'action_hashed' => md5( $action ),
			'instance'      => md5( maybe_serialize( $args['args'] ) ),
			'args'          => maybe_serialize( $args['args'] ),
			'last_modified' => current_time( 'mysql', true ),
		);

		if ( isset( $args['schedule'] ) && ! empty( $args['schedule'] ) ) {
			$job_post['schedule'] = $args['schedule'];
		}

		if ( isset( $args['interval'] ) && ! empty( $args['interval'] ) && is_numeric( $args['interval'] ) ) {
			$job_post['interval'] = (int) $args['interval'];
		}

		// Create the post, or update an existing entry to run again in the future.
		if ( is_int( $update_id ) && $update_id > 0 ) {
			$wpdb->update( $this->get_table_name(), $job_post, array(
				'ID' => $update_id,
			) );
		} else {
			$job_post['created'] = current_time( 'mysql', true );

			$wpdb->insert( $this->get_table_name(), $job_post );
		}

		// Delete internal cache.
		// Should only be skipped during bulk operations.
		if ( $flush_cache ) {
			$this->flush_internal_caches();
		}
	}

	/**
	 * Mark an event's entry as completed
	 *
	 * Completed entries will be cleaned up by an internal job
	 *
	 * @param int    $timestamp    Unix timestamp event executes at.
	 * @param string $action       Name of action used when the event is registered (unhashed).
	 * @param string $instance     md5 hash of the event's arguments array, which Core uses to index the `cron` option.
	 * @param bool   $flush_cache  Whether or not to flush internal caches after creating/updating the event.
	 * @return bool
	 */
	public function mark_job_completed( $timestamp, $action, $instance, $flush_cache = true ) {
		$job_id = $this->get_job_id( $timestamp, $action, $instance );

		if ( ! $job_id ) {
			return false;
		}

		return $this->mark_job_record_completed( $job_id, $flush_cache );
	}

	/**
	 * Set a job post to the "completed" status
	 *
	 * @param int  $job_id       ID of job's record.
	 * @param bool $flush_cache  Whether or not to flush internal caches after creating/updating the event.
	 * @return bool
	 */
	public function mark_job_record_completed( $job_id, $flush_cache = true ) {
		global $wpdb;

		/**
		 * Constraint is broken to accommodate the following situation:
		 * 1. Event with specific timestamp is scheduled.
		 * 2. Event is unscheduled.
		 * 3. Event is rescheduled.
		 * 4. Event runs, or is unscheduled, but unique constraint prevents query from succeeding.
		 * 5. Event retains `pending` status and runs again. Repeat steps 4 and 5 until `a8c_cron_control_purge_completed_events` runs and removes the entry from step 2.
		 */
		$updates = array(
			'status'   => self::STATUS_COMPLETED,
			'instance' => mt_rand( 1000000, 999999999 ), // Breaks unique constraint, and can be recreated from entry's remaining data.
		);

		$success = $wpdb->update( $this->get_table_name(), $updates, array(
			'ID' => $job_id,
		) );

		// Delete internal cache.
		// Should only be skipped during bulk operations.
		if ( $flush_cache ) {
			$this->flush_internal_caches();
		}

		return (bool) $success;
	}

	/**
	 * Compare two arrays and return collapsed representation of the items present in one but not the other
	 *
	 * @param array $changed   Array to identify additional items from.
	 * @param array $reference Array to compare against.
	 * @return array
	 */
	private function find_cron_array_differences( $changed, $reference ) {
		$differences = array();

		$changed = collapse_events_array( $changed );

		foreach ( $changed as $event ) {
			$event = (object) $event;

			if ( ! isset( $reference[ $event->timestamp ][ $event->action ][ $event->instance ] ) ) {
				$differences[] = array(
					'timestamp' => $event->timestamp,
					'action'    => $event->action,
					'instance'  => $event->instance,
					'args'      => $event->args,
				);
			}
		}

		return $differences;
	}

	/**
	 * Retrieve cron option from cache
	 *
	 * @return array|false
	 */
	private function get_cached_option() {
		$cache_details = wp_cache_get( self::CACHE_KEY, null, true );

		if ( ! is_array( $cache_details ) ) {
			return false;
		}

		// Single bucket.
		if ( isset( $cache_details['version'] ) ) {
			return $cache_details;
		}

		// Invalid data!
		if ( ! isset( $cache_details['incrementer'] ) ) {
			return false;
		}

		$option_flat = array();

		// Restore option from cached pieces.
		for ( $i = 1; $i <= $cache_details['buckets']; $i++ ) {
			$cache_key    = $this->get_cache_key_for_slice( $cache_details['incrementer'], $i );
			$cached_slice = wp_cache_get( $cache_key, null, true );

			// Bail if a chunk is missing.
			if ( ! is_array( $cached_slice ) ) {
				return false;
			}

			$option_flat += $cached_slice;
		}

		// Something's missing, likely due to cache eviction.
		if ( empty( $option_flat ) || count( $option_flat ) !== $cache_details['event_count'] ) {
			return false;
		}

		return inflate_collapsed_events_array( $option_flat );
	}

	/**
	 * Cache cron option, accommodating large versions by splitting into chunks
	 *
	 * @param array $option Cron option to cache.
	 * @return bool
	 */
	private function cache_option( $option ) {
		// Determine storage requirements.
		$option_flat        = collapse_events_array( $option );
		$option_flat_string = maybe_serialize( $option_flat );
		$option_size        = strlen( $option_flat_string );
		$buckets            = (int) ceil( $option_size / CACHE_BUCKET_SIZE );

		// Store in single cache key.
		if ( 1 === $buckets ) {
			return wp_cache_set( self::CACHE_KEY, $option, null, 1 * \HOUR_IN_SECONDS );
		}

		// Too large to cache?
		if ( $buckets > MAX_CACHE_BUCKETS ) {
			do_action( 'a8c_cron_control_uncacheable_cron_option', $option_size, $buckets, count( $option_flat ) );

			$this->flush_internal_caches();
			return false;
		}

		$incrementer  = md5( $option_flat_string . time() );
		$event_count  = count( $option_flat );
		$segment_size = (int) ceil( $event_count / $buckets );

		for ( $i = 1; $i <= $buckets; $i++ ) {
			$offset    = ( $i - 1 ) * $segment_size;
			$slice     = array_slice( $option_flat, $offset, $segment_size );
			$cache_key = $this->get_cache_key_for_slice( $incrementer, $i );

			wp_cache_set( $cache_key, $slice, null, 1 * \HOUR_IN_SECONDS );
		}

		$option = array(
			'incrementer' => $incrementer,
			'buckets'     => $buckets,
			'event_count' => count( $option_flat ),
		);

		return wp_cache_set( self::CACHE_KEY, $option, null, 1 * \HOUR_IN_SECONDS );
	}

	/**
	 * Build cache key for a given portion of a large option
	 *
	 * @param string $incrementor Current cache incrementor.
	 * @param int    $slice Slice ID.
	 * @return string
	 */
	private function get_cache_key_for_slice( $incrementor, $slice ) {
		return md5( self::CACHE_KEY . $incrementor . $slice );
	}

	/**
	 * Delete the cached representation of the cron option
	 */
	public function flush_internal_caches() {
		return wp_cache_delete( self::CACHE_KEY );
	}

	/**
	 * Prevent event store from creating new entries
	 *
	 * Should be used sparingly, and followed by a call to resume_event_creation(), during bulk operations
	 */
	public function suspend_event_creation() {
		$this->job_creation_suspended = true;
	}

	/**
	 * Stop discarding events, once again storing them in the table
	 */
	public function resume_event_creation() {
		$this->job_creation_suspended = false;
	}

	/**
	 * Remove entries for non-recurring events that have been run
	 *
	 * @param bool $count_first Should events be counted before they're deleted.
	 */
	public function purge_completed_events( $count_first = true ) {
		global $wpdb;

		// Skip count if already performed.
		if ( $count_first ) {
			if ( property_exists( $wpdb, 'srtm' ) ) {
				$srtm = $wpdb->srtm;
				$wpdb->srtm = true;
			}

			$count = $this->count_events_by_status( self::STATUS_COMPLETED );

			if ( isset( $srtm ) ) {
				$wpdb->srtm = $srtm;
			}
		} else {
			$count = 1;
		}

		if ( $count > 0 ) {
			$wpdb->delete( $this->get_table_name(), array(
				'status' => self::STATUS_COMPLETED,
			) );
		}
	}

	/**
	 * Count number of events with a given status
	 *
	 * @param string $status Event status to count.
	 * @return int|false
	 */
	public function count_events_by_status( $status ) {
		global $wpdb;

		if ( ! in_array( $status, self::ALLOWED_STATUSES, true ) ) {
			return false;
		}

		return (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(ID) FROM {$this->get_table_name()} WHERE status = %s", $status ) ); // Cannot prepare table name. @codingStandardsIgnoreLine
	}
}

Events_Store::instance();
