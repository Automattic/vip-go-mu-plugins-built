<?php
namespace Automattic\VIP\Security\InactiveUsers;

use Automattic\VIP\Utils\Context;
use Automattic\VIP\Security\Utils\Logger;
use Automattic\VIP\Security\Utils\Configs;
use Automattic\VIP\Security\Utils\Capability_Utils;
use Automattic\VIP\Security\Utils\Users_Query_Utils;

class Inactive_Users {
	protected static $considered_inactive_after_days;
	protected static $elevated_roles;
	protected static $elevated_capabilities;
	protected static $mode;
	public static $release_date;

	const LOG_FEATURE_NAME = 'sb_inactive_users';

	const LAST_SEEN_META_KEY                               = 'wpvip_last_seen';
	const LAST_SEEN_IGNORE_INACTIVITY_CHECK_UNTIL_META_KEY = 'wpvip_last_seen_ignore_inactivity_check_until';
	const LAST_SEEN_CACHE_GROUP                            = 'wpvip_last_seen';
	const LAST_SEEN_UPDATE_USER_META_CACHE_TTL             = MINUTE_IN_SECONDS * 5; // Store last seen once every five minute to avoid too many write DB operations
	const BLOCKED_USERS_CACHE_KEY                          = 'wpvip_blocked_users_';
	const BLOCKED_USERS_CACHE_TTL                          = MINUTE_IN_SECONDS * 5;
	const INACTIVE_USERS_COUNT_CACHE_KEY                   = 'wpvip_inactive_users_count_';
	const INACTIVE_USERS_COUNT_CACHE_TTL                   = MINUTE_IN_SECONDS * 5;
	const LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY      = 'wpvip_last_seen_release_date_timestamp';

	/**
	 * May store inactive account authentication error for application passwords to be used later in rest_authentication_errors
	 *
	 * @var \WP_Error|null
	 */
	private static $application_password_authentication_error;

	public static function init() {
		$inactive_user_configs = Configs::get_module_configs( 'inactive-users' );

		self::$release_date                   = get_option( self::LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY );
		self::$mode                           = $inactive_user_configs['mode'] ?? 'REPORT';
		self::$considered_inactive_after_days = $inactive_user_configs['considered_inactive_after_days'] ?? 90;
		self::$elevated_roles                 = $inactive_user_configs['roles'] ?? [ 'administrator' ];
		self::$elevated_capabilities          = $inactive_user_configs['capabilities'] ?? [];

		// Use a global cache group since users are shared among network sites.
		wp_cache_add_global_groups( array( self::LAST_SEEN_CACHE_GROUP ) );

		add_action( 'set_current_user', [ __CLASS__, 'record_activity' ], 30 );

		add_action( 'admin_init', [ __CLASS__, 'register_release_date' ] );
		add_action( 'admin_init', [ __CLASS__, 'maybe_fix_found_users_query' ] );

		// skipping inactivity checks for new users
		if ( is_multisite() ) {
			add_action( 'add_user_to_blog', [ __CLASS__, 'maybe_skip_inactivity_check_for_new_user' ] );
		}
		add_action( 'user_register', [ __CLASS__, 'maybe_skip_inactivity_check_for_new_user' ] );

		add_action( 'vip_support_user_added', function ( $user_id ) {
			$ignore_inactivity_check_until = strtotime( '+2 hours' );

			self::ignore_inactivity_check_for_user( $user_id, $ignore_inactivity_check_until );
		} );

		if ( in_array( self::$mode, array( 'REPORT', 'BLOCK' ), true ) ) {
			add_filter( 'wpmu_users_columns', [ __CLASS__, 'add_last_seen_column_head' ] );
			add_filter( 'manage_users_columns', [ __CLASS__, 'add_last_seen_column_head' ] );
			add_filter( 'manage_users_custom_column', [ __CLASS__, 'add_last_seen_column_date' ], 10, 3 );

			add_filter( 'manage_users_sortable_columns', [ __CLASS__, 'add_last_seen_sortable_column' ] );
			add_filter( 'manage_users-network_sortable_columns', [ __CLASS__, 'add_last_seen_sortable_column' ] );
			add_filter( 'users_list_table_query_args', [ __CLASS__, 'last_seen_order_by_query_args' ] );

			// Add badges to username display by modifying the list table items
			add_action( 'admin_head-users.php', [ __CLASS__, 'modify_users_list_table_items' ] );
			add_action( 'admin_head-users.php', [ __CLASS__, 'add_username_badge_styles' ] );
			add_action( 'admin_head-users-network.php', [ __CLASS__, 'modify_users_list_table_items' ] );
			add_action( 'admin_head-users-network.php', [ __CLASS__, 'add_username_badge_styles' ] );
		}

		if ( self::is_block_action_enabled() ) {
			add_filter( 'authenticate', [ __CLASS__, 'maybe_block_inactive_user_on_authenticate' ], 20, 1 );
			add_filter( 'wp_is_application_passwords_available_for_user', [ __CLASS__, 'maybe_block_inactive_user_on_app_password_auth' ], PHP_INT_MAX, 2 );
			add_filter( 'rest_authentication_errors', [ __CLASS__, 'maybe_return_error_on_rest_auth' ], PHP_INT_MAX, 1 );

			add_filter( 'views_users', [ __CLASS__, 'add_blocked_users_filter' ] );
			add_filter( 'views_users-network', [ __CLASS__, 'add_blocked_users_filter' ] );
			add_filter( 'users_list_table_query_args', [ __CLASS__, 'last_seen_blocked_users_filter_query_args' ] );

			add_action( 'admin_init', [ __CLASS__, 'last_seen_unblock_action' ] );
		}

		// Add SDS hook
		add_filter( 'vip_site_details_index_security_boost_data', [ __CLASS__, 'add_inactive_users_count_to_sds_payload' ] );
	}

	public static function maybe_fix_found_users_query() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! is_admin() || ! isset( $_GET['last_seen_filter'] ) || 'blocked' !== $_GET['last_seen_filter'] ) {
			// Not in admin or not filtering for blocked users, nothing to do
			return;
		}

		add_filter( 'found_users_query', [ Users_Query_Utils::class, 'fix_found_users_query' ], 10, 2 );
	}

	public static function add_inactive_users_count_to_sds_payload( $data ) {
		$inact_ts = self::get_inactivity_timestamp();
		// Start timer to measure query time
		$timer = microtime( true );

		// Get number of inactive users for current blog
		$inactive_users_count = self::get_inactive_users_count();

		// Add inactive users count for the current blog to the SDS payload
		$data['inactive_users_count'] = $inactive_users_count;

		if ( is_multisite() ) {
			// Get number of inactive users for all blogs (network-wide with blog_id = 0)
			$inactive_users_count_all_blogs = self::get_inactive_users_count( 0 );

			// Add network-wide inactive users count to the SDS payload
			$data['inactive_users_count_all_blogs'] = $inactive_users_count_all_blogs;
		}

		// Stop timer
		$timer = microtime( true ) - $timer;

		// Register query time metric
		do_action( 'vip_security_inactive_users_query_time', $timer );

		return $data;
	}

	public static function record_activity() {
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return;
		}

		if ( wp_cache_get( $user_id, self::LAST_SEEN_CACHE_GROUP ) ) {
			// Last seen meta was checked recently
			return;
		}

		if ( self::is_considered_inactive( $user_id ) ) {
			// User needs to be unblocked first
			return;
		}

	// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined
		if ( wp_cache_add( $user_id, true, self::LAST_SEEN_CACHE_GROUP, self::LAST_SEEN_UPDATE_USER_META_CACHE_TTL ) ) {
			update_user_meta( $user_id, self::LAST_SEEN_META_KEY, time() );
		}
	}

	/**
	 * Block inactive users on authenticate, active only when BLOCK mode is enabled
	 */
	public static function maybe_block_inactive_user_on_authenticate( $user ) {
		if ( is_wp_error( $user ) ) {
			// checking if we have an application password error and if so add an error filter.
			if ( Context::is_xmlrpc_api() && is_wp_error( self::$application_password_authentication_error ) ) {
				add_filter('xmlrpc_login_error', function () {
					return new \IXR_Error( 403, __( 'Your account has been flagged as inactive. Please contact your site Administrator.', 'wpvip' ) );
				});
			}
			return $user;
		}

		if ( $user->ID && self::is_considered_inactive( $user->ID ) ) {
			Logger::info(
				self::LOG_FEATURE_NAME,
				'User ' . $user->user_login . ' is flagged as inactive, login was blocked.'
			);
			if ( Context::is_xmlrpc_api() ) {
				add_filter('xmlrpc_login_error', function () {
					return new \IXR_Error( 403, __( 'Your account has been flagged as inactive. Please contact your site Administrator.', 'wpvip' ) );
				});
			}

			return new \WP_Error( 'inactive_account', __( '<strong>Error</strong>: Your account has been flagged as inactive. Please contact your site Administrator.', 'wpvip' ) );
		}

		return $user;
	}

	/**
	 * Return error on REST authentication, active only when BLOCK mode is enabled
	 *
	 * @param \WP_Error $status The authentication status.
	 */
	public static function maybe_return_error_on_rest_auth( $status ) {
		if ( is_wp_error( self::$application_password_authentication_error ) ) {
			return self::$application_password_authentication_error;
		}

		return $status;
	}

	/**
	 * Block inactive users on application password authentication, active only when BLOCK mode is enabled
	 * WARNING: Do not add log2logstash logs here, because this function is hooked into wp_is_application_passwords_available_for_user
	 * which is called on the get_userdata hook and will trigger a loop.
	 * @param bool $available True if application password is available, false otherwise. Active only when BLOCK mode is enabled
	 * @param \WP_User $user The user to check.
	 * @return bool
	 */
	public static function maybe_block_inactive_user_on_app_password_auth( $available, $user ) {
		if ( ! $available || ( $user && ! $user->exists() ) ) {
			return false;
		}

		if ( self::is_considered_inactive( $user->ID ) ) {
			self::$application_password_authentication_error = new \WP_Error( 'inactive_account', __( 'Your account has been flagged as inactive. Please contact your site Administrator.', 'wpvip' ), array( 'status' => 403 ) );

			return false;
		}

		return $available;
	}

	public static function modify_users_list_table_items() {
		global $wp_list_table;

		// Make sure we have a list table and it's the users list table
		if ( ! $wp_list_table ) {
			return;
		}

		if ( ! ( $wp_list_table instanceof \WP_Users_List_Table ) && ! ( $wp_list_table instanceof \WP_MS_Users_List_Table ) ) {
			return;
		}

		// Get the items from the list table
		$items = $wp_list_table->items;
		if ( empty( $items ) ) {
			return;
		}

		// Modify each user item to add badge to username
		foreach ( $items as $user ) {
			if ( ! self::is_considered_inactive( $user->ID ) ) {
				continue;
			}

			// Create the badge
			$badge_text = self::is_block_action_enabled() ?
			esc_html__( 'Blocked: Inactivity', 'wpvip' ) :
			esc_html__( 'Inactive User', 'wpvip' );

			$badge_class = self::is_block_action_enabled() ? 'blocked' : 'inactive';

			$badge = sprintf(
				'<span class="inactive-user-badge inactive-user-badge--%s">%s</span>',
				$badge_class,
				$badge_text
			);

			// Add the badge to the user_login field (which is what gets displayed in the username column)
			$user->user_login = esc_html( $user->user_login ) . '&nbsp;&nbsp;' . $badge;
		}

		// Update the list table items
		$wp_list_table->items = $items;
	}

	public static function add_username_badge_styles() {
		?>
		<style type="text/css">
		.inactive-user-badge {
			border-radius: 4px;
			display: inline-block;
			font-size: 11px;
			font-weight: 500;
			margin-bottom: 4px;
			margin-top: 4px;
			padding: 2px 8px;
			vertical-align: middle;
		}
		.inactive-user-badge--blocked {
			background: #d63638;
			color: white;
		}
		.inactive-user-badge--inactive {
			background: #f0b849;
			color: #1d2327;
		}
		</style>
		<?php
	}

	public static function add_last_seen_column_head( $columns ) {
		$columns['last_seen'] = __( 'Last seen', 'wpvip' );
		return $columns;
	}

	public static function add_last_seen_sortable_column( $columns ) {
		$columns['last_seen'] = 'last_seen';

		return $columns;
	}

	public static function last_seen_order_by_query_args( $vars ) {
		if ( isset( $vars['orderby'] ) && 'last_seen' === $vars['orderby'] ) {
			$vars['meta_key'] = self::LAST_SEEN_META_KEY;
			$vars['orderby']  = 'meta_value_num';
			// Prevent FOUND_ROWS() error when sorting by last seen
			$vars['count_total'] = false;
		}

		return $vars;
	}

	public static function get_inactive_users_count( $blog_id = null ) {
		$blog_id = $blog_id ?? get_current_blog_id();

		// Use global cache for network-wide queries (blog_id = 0)
		if ( 0 === $blog_id ) {
			$cache_key    = self::get_inactive_users_count_cache_key( $blog_id );
			$cached_count = wp_cache_get( $cache_key, self::LAST_SEEN_CACHE_GROUP );

			if ( false !== $cached_count ) {
				return $cached_count;
			}
		}

		/**
		 * We're doing two separate queries to avoid the query getting too complex and slow since excluding the last_seen meta would add an extra join
		 * multiplying the complexity of the query beneath it
		 */
		// Use our utility method that properly handles network-wide capability filtering
		$inactive_users_with_last_seen_count    = \Automattic\VIP\Security\Utils\Users_Query_Utils::query_users_with_capability_filtering(
			self::get_inactive_users_query_args( 'with_last_seen' ),
			$blog_id,
			true // count only
		);
		$inactive_users_without_last_seen_count = 0;
		if ( self::is_release_date_older_than_cutoff() ) {
			$inactive_users_without_last_seen_count = \Automattic\VIP\Security\Utils\Users_Query_Utils::query_users_with_capability_filtering(
				self::get_inactive_users_query_args( 'without_last_seen' ),
				$blog_id,
				true // count only
			);
		}

		$count = $inactive_users_with_last_seen_count + $inactive_users_without_last_seen_count;

		// Cache the result for global queries (blog_id = 0)
		if ( 0 === $blog_id ) {
			$cache_key = self::get_inactive_users_count_cache_key( $blog_id );
			wp_cache_set( $cache_key, $count, self::LAST_SEEN_CACHE_GROUP, self::INACTIVE_USERS_COUNT_CACHE_TTL ); // phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined
		}

		return $count;
	}

	public static function is_release_date_older_than_cutoff() {
		return static::get_last_seen_release_date_timestamp() < self::get_inactivity_timestamp();
	}

	public static function get_last_seen_release_date_timestamp() {
		$release_ts = get_option( self::LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY );
		if ( false === $release_ts ) {
			$release_ts = static::get_fallback_release_date_timestamp();
		}
		return $release_ts;
	}

	/**
	 * 'full' will do a single query with both last_seen and NOT EXISTS clauses which is more expensive.
	 * 'with_last_seen' will do a single query with only last_seen clause.
	 * 'without_last_seen' will do a single query with only NOT EXISTS clause.
	 *
	 *
	 * @param string $select_type 'full' or 'with_last_seen' or 'without_last_seen'
	 */
	public static function get_inactive_users_query_args( $select_type = 'full' ) {
		$inact_ts   = self::get_inactivity_timestamp();
		$release_ts = static::get_last_seen_release_date_timestamp();

		// Users whose last_seen < inactivity cutoff
		$last_seen_or_clauses = array();
		$last_seen_clause     = array(
			'key'     => self::LAST_SEEN_META_KEY,
			'value'   => $inact_ts,
			'type'    => 'NUMERIC',
			'compare' => '<',
		);

		$last_seen_not_exists_clause = array(
			'key'     => self::LAST_SEEN_META_KEY,
			'compare' => 'NOT EXISTS',
		);
		switch ( $select_type ) {
			case 'full':
				$last_seen_or_clauses = array(
					'relation' => 'OR',
					$last_seen_clause,
				);
				if ( $release_ts < $inact_ts ) {
					$last_seen_or_clauses[] = $last_seen_not_exists_clause;
				}
				break;
			case 'with_last_seen':
				$last_seen_or_clauses = $last_seen_clause;
				break;
			case 'without_last_seen':
				if ( $release_ts < $inact_ts ) {
					$last_seen_or_clauses = $last_seen_not_exists_clause;
				}
				break;
			default:
				break;
		}
		/*
		* we are intentionally not excluding users with LAST_SEEN_IGNORE_INACTIVITY_CHECK_UNTIL_META_KEY to keep the query light.
		* This will result in a possible difference between the count and the actual number of inactive users
		*/
		$vars = array(
			// Only consider users that registered before the inactivity threshold
			'date_query' => array(
				array(
					'before' => gmdate( 'Y-m-d H:i:s', self::get_inactivity_timestamp() ),
				),
			),

			// Only consider users that have not been active since the inactivity threshold
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
			'meta_query' => array(
				[
					'relation' => 'AND',
					$last_seen_or_clauses,
				],
			),
		);
		// Use capability__in if capabilities are configured, otherwise use role__in
		if ( ! empty( self::$elevated_capabilities ) ) {
				$vars['capability__in'] = self::$elevated_capabilities;
		} else {
				$vars['role__in'] = Capability_Utils::normalize_roles_input( self::$elevated_roles );
		}
		return $vars;
	}
	/**
	 * Filter users list table to show only blocked users, active only when BLOCK mode is enabled
	 */
	public static function last_seen_blocked_users_filter_query_args( $vars ) {
		// Only filter when the “blocked” last_seen_filter is set and valid
		if (
		isset( $_GET['last_seen_filter'] ) &&
		'blocked' === $_GET['last_seen_filter'] &&
		isset( $_GET['last_seen_filter_nonce'] ) &&
		wp_verify_nonce( sanitize_text_field( $_GET['last_seen_filter_nonce'] ), 'last_seen_filter' )
		) {
			// Track blocked users view
			do_action( 'vip_security_blocked_users_view' );

			return array_merge( $vars, self::get_inactive_users_query_args() );
		}

		return $vars;
	}


	public static function add_last_seen_column_date( $default_value, $column_name, $user_id ) {
		if ( 'last_seen' !== $column_name ) {
			return $default_value;
		}

		$last_seen_timestamp = get_user_meta( $user_id, self::LAST_SEEN_META_KEY, true );

		$date = self::get_last_seen_date_string( $last_seen_timestamp );

		if ( ! self::is_block_action_enabled() || ! self::is_considered_inactive( $user_id ) ) {
			return sprintf( '<span>%s</span>', esc_html( $date ) );
		}

		$unblock_link = '';
		if ( current_user_can( 'edit_user', $user_id ) ) {
			$url = add_query_arg( array(
				'action'                => 'reset_last_seen',
				'user_id'               => $user_id,
				'reset_last_seen_nonce' => wp_create_nonce( 'reset_last_seen_action' ),
			) );

			$unblock_link = "<div class='row-actions'><span>User blocked due to inactivity. <a class='reset_last_seen_action' href='" . esc_url( $url ) . "'>" . __( 'Unblock', 'wpvip' ) . '</a></span></div>';
		}
		return sprintf( '<span class="wp-ui-text-notification">%s</span>' . $unblock_link, esc_html( $date ) );
	}

	/**
	 * Return a readable “last-seen” string.
	 *
	 * – If the event happened < 1 month ago  → “5 hours ago”.
	 * – Otherwise                            → “12 Mar 2025 at 14:07”.
	 *
	 * @param int      $last_seen_timestamp Unix timestamp (already adjusted for site TZ).
	 * @param int|null $now                 Optional. Timestamp to compare against. Defaults to now.
	 * @return string
	 */
	public static function get_last_seen_date_string( $last_seen_timestamp, $now = null ): string {
		if ( ! $last_seen_timestamp ) {
			return __( 'Unknown', 'wpvip' );
		}

		$now  = $now ?? current_datetime()->getTimestamp();
		$diff = $now - $last_seen_timestamp;

		// If the last-seen date is in the future, return "Unknown".
		if ( $diff < 0 ) {
			return __( 'Unknown', 'wpvip' );
		}

		// If the last-seen date is within the last month, show a human-readable diff.
		if ( $diff < MONTH_IN_SECONDS ) {
			return sprintf(
			/* translators: %s: Human-readable time difference, e.g. "5 hours". */
				__( '%s ago', 'wpvip' ),
				human_time_diff( $last_seen_timestamp, $now )
			);
		}

		return sprintf(
		/* translators: 1: Last-seen date, 2: Last-seen time. */
			__( '%1$s at %2$s', 'wpvip' ),
			date_i18n( get_option( 'date_format' ), $last_seen_timestamp ),
			date_i18n( get_option( 'time_format' ), $last_seen_timestamp )
		);
	}

	public static function get_blocked_users_cache_key() {
		return self::BLOCKED_USERS_CACHE_KEY . ( is_network_admin() ? null : get_current_blog_id() );
	}

	public static function get_inactive_users_count_cache_key( $blog_id ) {
		return self::INACTIVE_USERS_COUNT_CACHE_KEY . $blog_id;
	}

	public static function flush_cache() {
		// Clear blocked users cache
		$cache_key = self::get_blocked_users_cache_key();
		wp_cache_delete( $cache_key, self::LAST_SEEN_CACHE_GROUP );

		// Clear inactive users count cache for current blog
		$inactive_users_cache_key = self::get_inactive_users_count_cache_key( get_current_blog_id() );
		wp_cache_delete( $inactive_users_cache_key, self::LAST_SEEN_CACHE_GROUP );

		// Clear inactive users count cache for global queries
		$inactive_users_cache_key = self::get_inactive_users_count_cache_key( 0 );
		wp_cache_delete( $inactive_users_cache_key, self::LAST_SEEN_CACHE_GROUP );
	}

	/**
	 * Add blocked users filter to users list table, active only when BLOCK mode is enabled
	 *
	 * @param array $views The views array.
	 *
	 * @return array The modified views array.
	 */
	public static function add_blocked_users_filter( $views ) {
		$blog_id = is_network_admin() ? null : get_current_blog_id();

		$cache_key         = self::get_blocked_users_cache_key();
		$has_blocked_users = wp_cache_get( $cache_key, self::LAST_SEEN_CACHE_GROUP );

		if ( false === $has_blocked_users ) {
			// Reuse the same logic we use elsewhere to determine if a user is considered blocked
			// so that the link visibility and the actual list stay in sync.
			$query_args = array_merge(
				[
					'blog_id'     => $blog_id,
					'fields'      => 'ID',
					'count_total' => false,
					'number'      => 1, // we only need to know if at least one match exists
				],
				self::get_inactive_users_query_args()
			);

			$users_query = new \WP_User_Query( $query_args );

			$has_blocked_users = ! empty( $users_query->get_results() ) ? 1 : 0;

			// we're using the same granularity for the cache as for the last seen meta
			wp_cache_set( $cache_key, $has_blocked_users, self::LAST_SEEN_CACHE_GROUP, self::BLOCKED_USERS_CACHE_TTL ); // phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined
		}

		$views['blocked_users'] = __( 'Blocked Users', 'wpvip' );

		if ( ! $has_blocked_users ) {
			return $views;
		}

		$url = add_query_arg( array(
			'last_seen_filter'       => 'blocked',
			'last_seen_filter_nonce' => wp_create_nonce( 'last_seen_filter' ),
		) );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$class = isset( $_GET['last_seen_filter'] ) ? 'current' : '';

		$view = '<a class="' . esc_attr( $class ) . '" href="' . esc_url( $url ) . '">' . esc_html( $views['blocked_users'] ) . '</a>';

		$views['blocked_users'] = $view;

		return $views;
	}

	/**
	 * Unblock user action in the WP Admin user list, active only when BLOCK mode is enabled
	 */
	public static function last_seen_unblock_action() {
		$admin_notices_hook_name = is_network_admin() ? 'network_admin_notices' : 'admin_notices';

		if ( isset( $_GET['reset_last_seen_success'] ) && '1' === $_GET['reset_last_seen_success'] ) {
			add_action( $admin_notices_hook_name, function () {
				$class = 'notice notice-success is-dismissible';
				$error = __( 'User unblocked.', 'wpvip' );

				printf( '<div class="%1$s"><p>%2$s</p></div>', esc_attr( $class ), esc_html( $error ) );
			} );
		}

		if ( ! isset( $_GET['user_id'], $_GET['action'] ) || 'reset_last_seen' !== $_GET['action'] ) {
			return;
		}

		$user_id = absint( $_GET['user_id'] );

		$error = null;
		if ( ! isset( $_GET['reset_last_seen_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( $_GET['reset_last_seen_nonce'] ), 'reset_last_seen_action' ) ) {
			$error = __( 'Unable to verify your request', 'wpvip' );
		}

		if ( ! get_userdata( $user_id ) ) {
			$error = __( 'User not found.', 'wpvip' );
		}

		if ( ! current_user_can( 'edit_user', $user_id ) ) {
			$error = __( 'You do not have permission to unblock this user.', 'wpvip' );
		}

		// Additional multisite security check: ensure user belongs to current site
		if ( ! $error && is_multisite() && ! is_user_member_of_blog( $user_id, get_current_blog_id() ) ) {
			$error = __( 'You can only unblock users who are members of this site.', 'wpvip' );
		}

		$ignore_inactivity_check_until = strtotime( '+2 days' );
		if ( ! $error && ! self::ignore_inactivity_check_for_user( $user_id, $ignore_inactivity_check_until ) ) {
			$error = __( 'Unable to unblock user.', 'wpvip' );
		}

		if ( ! $error ) {
			// Track successful user unblock
			$user      = get_userdata( $user_id );
			$user_role = $user && ! empty( $user->roles ) ? $user->roles[0] : '';
			do_action( 'vip_security_user_unblock', $user_id, $user_role );

			self::flush_cache();
		}

		if ( $error ) {
			add_action( $admin_notices_hook_name, function () use ( $error ) {
				$class = 'notice notice-error is-dismissible';

				printf( '<div class="%1$s"><p>%2$s</p></div>', esc_attr( $class ), esc_html( $error ) );
			} );
			return;
		}

		$url = remove_query_arg( array(
			'action',
			'user_id',
			'reset_last_seen_nonce',
		) );

		$url = add_query_arg( array(
			'reset_last_seen_success' => 1,
		), $url );

		if ( wp_safe_redirect( $url ) ) {
			exit();
		}
	}

	public static function ignore_inactivity_check_for_user( $user_id, $until_timestamp = null ) {
		if ( ! $until_timestamp ) {
			$until_timestamp = strtotime( '+2 days' );
		}
		Logger::info(
			self::LOG_FEATURE_NAME,
			'Ignored inactivity check for user',
			array(
				'user_id'         => $user_id,
				'until_timestamp' => $until_timestamp,
			)
		);

		return update_user_meta( $user_id, self::LAST_SEEN_IGNORE_INACTIVITY_CHECK_UNTIL_META_KEY, $until_timestamp );
	}

	/**
	 * When the inactive user plugin is first enabled, we want to skip the inactivity check for new users because they might end up
	 * being blocked because of LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY
	 */
	public static function maybe_skip_inactivity_check_for_new_user( $user_id ) {
		$user = get_userdata( $user_id );

		if ( ! $user ) {
			// we shouldn't ever get here, but in case we do we're going to log the error
			Logger::error(
				self::LOG_FEATURE_NAME,
				'User not found in ' . __METHOD__,
				array(
					'user_id' => $user_id,
				)
			);
			return;
		}

		if ( ! self::user_has_elevated_permissions( $user ) ) {
			return;
		}

		self::ignore_inactivity_check_for_user( $user_id );
	}


	/**
	 * Provide a dynamic fallback release date.
	 *
	 * Instead of relying on a constant,
	 * return a timestamp that is ( considered_inactive_after_days + 1 ) days in
	 * the past relative to the current time. This ensures the fallback date is
	 * always older than the inactivity window while remaining environment-
	 * agnostic.
	 *
	 */
	public static function get_fallback_release_date_timestamp(): int|false {
		// If the module has not been initialised (e.g. during unit tests) fall
		// back to 90 days which is the default configured value in ::init().
		$days = (int) ( self::$considered_inactive_after_days ?? 90 ) + 1;

		return strtotime( sprintf( '-%d days', $days ) );
	}

	public static function register_release_date() {
		if ( ! wp_doing_ajax() && ! get_option( self::LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY ) ) {
			$time = time();
			// Right after the first admin_init, set the release date timestamp
			// to be used as a fallback for users that never logged in before.
			add_option( self::LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY, $time, '', false );

			Logger::info(
				self::LOG_FEATURE_NAME,
				'Last seen release date registered',
				[
					'timestamp' => $time,
				]
			);
		}
	}

	public static function is_considered_inactive( $user_id ) {
		if ( ! self::should_check_user_last_seen( $user_id ) ) {
			return false;
		}

		$ignore_inactivity_check_until = get_user_meta( $user_id, self::LAST_SEEN_IGNORE_INACTIVITY_CHECK_UNTIL_META_KEY, true );
		if ( $ignore_inactivity_check_until && $ignore_inactivity_check_until > time() ) {
			return false;
		}

		$inactivity_timestamp = self::get_inactivity_timestamp();
		$last_seen_timestamp  = get_user_meta( $user_id, self::LAST_SEEN_META_KEY, true );
		if ( $last_seen_timestamp ) {
			return $last_seen_timestamp < $inactivity_timestamp;
		}

		$release_date_timestamp = get_option( self::LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY );
		if ( $release_date_timestamp ) {
			return $release_date_timestamp < $inactivity_timestamp;
		}

		// hardcoded fallback option, in case the release date option gets deleted, we need to use static:: to ensure the test class can override the function
		if ( static::get_fallback_release_date_timestamp() < $inactivity_timestamp ) {
			return true;
		}

		return false;
	}

	private static function get_inactivity_timestamp() {
		$days = self::$considered_inactive_after_days;

		return strtotime( sprintf( '-%d days', $days ) ) + self::LAST_SEEN_UPDATE_USER_META_CACHE_TTL;
	}

	private static function is_block_action_enabled() {
		return 'BLOCK' === self::$mode;
	}

	private static function should_check_user_last_seen( $user_id ) {
		/**
		 * Filters the users that should be skipped when checking/recording the last seen.
		 *
		 * @param array $skip_users The list of user IDs to skip.
		 */
		$skip_users = apply_filters( 'vip_security_boost_skip_inactive_users', array() );
		if ( in_array( $user_id, $skip_users, true ) ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			Logger::error(
				self::LOG_FEATURE_NAME,
				'User not found in ' . __METHOD__,
				array(
					'user_id' => $user_id,
				)
			);
			return false;
		}

		// Exclude wpcomvip user from inactivity checks
		if ( Configs::get_bot_login() === $user->user_login ) {
			return false;
		}

		if ( $user->user_registered && strtotime( $user->user_registered ) > self::get_inactivity_timestamp() ) {
			return false;
		}

		return self::user_has_elevated_permissions( $user );
	}

	protected static function user_has_elevated_permissions( $user ) {
		/**
		 * Filters the last seen elevated capabilities that are used to determine if the last seen should be checked.
		 *
		 * @param array $elevated_capabilities The elevated capabilities.
		 */
		$elevated_capabilities = apply_filters( 'vip_security_boost_inactive_users_elevated_capabilities', self::$elevated_capabilities );

		/**
		 * Filters the last seen elevated roles that are used to determine if the last seen should be checked.
		 *
		 * @param array $elevated_roles The elevated roles.
		 */
		$elevated_roles = apply_filters( 'vip_security_boost_inactive_users_elevated_roles', self::$elevated_roles );

		return Capability_Utils::user_has_elevated_permissions( $user, $elevated_capabilities, $elevated_roles );
	}
}

Inactive_Users::init();
