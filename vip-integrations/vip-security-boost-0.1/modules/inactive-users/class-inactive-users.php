<?php
namespace Automattic\VIP\Security\InactiveUsers;

use Automattic\VIP\Utils\Context;
use Automattic\VIP\Security\Constants;
use Automattic\VIP\Security\Utils\Logger;
use Automattic\VIP\Security\Utils\Configs;

class Inactive_Users {
	private static $considered_inactive_after_days;
	private static $elevated_roles;
	private static $mode;
	public static $release_date;

	const LOG_FEATURE_NAME = 'sb_inactive_users';

	const LAST_SEEN_META_KEY                               = 'wpvip_last_seen';
	const LAST_SEEN_IGNORE_INACTIVITY_CHECK_UNTIL_META_KEY = 'wpvip_last_seen_ignore_inactivity_check_until';
	const LAST_SEEN_CACHE_GROUP                            = 'wpvip_last_seen';
	const LAST_SEEN_UPDATE_USER_META_CACHE_TTL             = MINUTE_IN_SECONDS * 5; // Store last seen once every five minute to avoid too many write DB operations
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

		// Use a global cache group since users are shared among network sites.
		wp_cache_add_global_groups( array( self::LAST_SEEN_CACHE_GROUP ) );

		add_filter( 'determine_current_user', [ __CLASS__, 'record_activity' ], 30, 1 );

		add_action( 'admin_init', [ __CLASS__, 'register_release_date' ] );
		add_action( 'set_user_role', [ __CLASS__, 'user_promoted' ] );
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
			add_filter( 'authenticate', [ __CLASS__, 'authenticate' ], 20, 1 );
			add_filter( 'wp_is_application_passwords_available_for_user', [ __CLASS__, 'application_password_authentication' ], PHP_INT_MAX, 2 );
			add_filter( 'rest_authentication_errors', [ __CLASS__, 'rest_authentication_errors' ], PHP_INT_MAX, 1 );

			add_filter( 'views_users', [ __CLASS__, 'add_blocked_users_filter' ] );
			add_filter( 'views_users-network', [ __CLASS__, 'add_blocked_users_filter' ] );
			add_filter( 'users_list_table_query_args', [ __CLASS__, 'last_seen_blocked_users_filter_query_args' ] );

			add_action( 'admin_init', [ __CLASS__, 'last_seen_unblock_action' ] );
		}
	}

	public static function record_activity( $user_id ) {
		if ( ! $user_id ) {
			return $user_id;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return $user_id;
		}

		if ( self::is_considered_inactive( $user_id ) ) {
			// User needs to be unblocked first
			return $user_id;
		}

		if ( wp_cache_get( $user_id, self::LAST_SEEN_CACHE_GROUP ) ) {
			// Last seen meta was checked recently
			return $user_id;
		}

		// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined
		if ( wp_cache_add( $user_id, true, self::LAST_SEEN_CACHE_GROUP, self::LAST_SEEN_UPDATE_USER_META_CACHE_TTL ) ) {
			update_user_meta( $user_id, self::LAST_SEEN_META_KEY, time() );
		}

		return $user_id;
	}

	public static function authenticate( $user ) {
		if ( is_wp_error( $user ) ) {
			return $user;
		}

		if ( $user->ID && self::is_considered_inactive( $user->ID ) ) {
			Logger::info(
				self::LOG_FEATURE_NAME,
				'User ' . $user->user_login . ' is flagged as inactive, login was blocked.'
			);
			if ( Context::is_xmlrpc_api() ) {
				add_filter('xmlrpc_login_error', function () {
					return new \IXR_Error( 403, __( 'Your account has been flagged as inactive. Please contact your site administrator.', 'wpvip' ) );
				});
			}

			return new \WP_Error( 'inactive_account', __( '<strong>Error</strong>: Your account has been flagged as inactive. Please contact your site administrator.', 'wpvip' ) );
		}

		return $user;
	}

	public static function rest_authentication_errors( $status ) {
		if ( is_wp_error( self::$application_password_authentication_error ) ) {
			return self::$application_password_authentication_error;
		}

		return $status;
	}

	/**
	 * @param bool $available True if application password is available, false otherwise.
	 * @param \WP_User $user The user to check.
	 * @return bool
	 */
	public static function application_password_authentication( $available, $user ) {
		if ( ! $available || ( $user && ! $user->exists() ) ) {
			return false;
		}

		if ( self::is_considered_inactive( $user->ID ) ) {
			Logger::info(
				self::LOG_FEATURE_NAME,
				'User ' . $user->user_login . ' is flagged as inactive, application password authentication was blocked.'
			);
			self::$application_password_authentication_error = new \WP_Error( 'inactive_account', __( 'Your account has been flagged as inactive. Please contact your site administrator.', 'wpvip' ), array( 'status' => 403 ) );

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
		}

		return $vars;
	}


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

			$vars['role__in'] = ! empty( self::$elevated_roles ) ? self::$elevated_roles : array();

			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
			$vars['meta_query'] = [
				'relation' => 'AND',
				[
					'key'     => self::LAST_SEEN_META_KEY,
					'value'   => self::get_inactivity_timestamp(),
					'type'    => 'NUMERIC',
					'compare' => '<',
				],
			];
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

	public static function add_blocked_users_filter( $views ) {
		$blog_id = is_network_admin() ? null : get_current_blog_id();

		$users_query = new \WP_User_Query(
			array(
				'blog_id'      => $blog_id,
				'fields'       => 'ID',
				'meta_key'     => self::LAST_SEEN_META_KEY,
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				'meta_value'   => self::get_inactivity_timestamp(),
				'meta_type'    => 'NUMERIC',
				'meta_compare' => '<',
				'count_total'  => false,
				'number'       => 1, // To minimize the query time, we only need to know if there are any blocked users to show the link
				'role__in'     => ! empty( self::$elevated_roles ) ? self::$elevated_roles : array(),
			),
		);

		$views['blocked_users'] = __( 'Blocked Users', 'wpvip' );

		if ( ! $users_query->get_results() ) {
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

		$ignore_inactivity_check_until = strtotime( '+2 days' );
		if ( ! $error && ! self::ignore_inactivity_check_for_user( $user_id, $ignore_inactivity_check_until ) ) {
			$error = __( 'Unable to unblock user.', 'wpvip' );
		} else {
			// Track successful user unblock
			$user      = get_userdata( $user_id );
			$user_role = $user && ! empty( $user->roles ) ? $user->roles[0] : '';
			do_action( 'vip_security_user_unblock', $user_id, $user_role );
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

		wp_safe_redirect( $url );
		exit();
	}

	public static function ignore_inactivity_check_for_user( $user_id, $until_timestamp = null ) {
		if ( ! $until_timestamp ) {
			$until_timestamp = strtotime( '+2 days' );
		}

		return update_user_meta( $user_id, self::LAST_SEEN_IGNORE_INACTIVITY_CHECK_UNTIL_META_KEY, $until_timestamp );
	}

	public static function user_promoted( $user_id ) {
		$user = get_userdata( $user_id );

		if ( ! $user ) {
			throw new \Exception( 'User not found' );
		}

		if ( ! self::user_with_elevated_roles( $user ) ) {
			return;
		}

		self::ignore_inactivity_check_for_user( $user_id );
	}

	public static function register_release_date() {
		if ( ! wp_doing_ajax() && ! get_option( self::LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY ) ) {
			// Right after the first admin_init, set the release date timestamp
			// to be used as a fallback for users that never logged in before.
			add_option( self::LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY, time(), '', 'no' );
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

		$last_seen_timestamp = get_user_meta( $user_id, self::LAST_SEEN_META_KEY, true );
		if ( $last_seen_timestamp ) {
			return $last_seen_timestamp < self::get_inactivity_timestamp();
		}

		$release_date_timestamp = get_option( self::LAST_SEEN_RELEASE_DATE_TIMESTAMP_OPTION_KEY );
		if ( $release_date_timestamp ) {
			return $release_date_timestamp < self::get_inactivity_timestamp();
		}

		// Release date is not defined yet, so we can't consider the user inactive.
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
			throw new \Exception( sprintf( 'User #%d found', esc_html( $user_id ) ) );
		}

		if ( $user->user_registered && strtotime( $user->user_registered ) > self::get_inactivity_timestamp() ) {
			return false;
		}

		return self::user_with_elevated_roles( $user );
	}

	private static function user_with_elevated_roles( $user ) {
		/**
		 * Filters the last seen elevated roles that are used to determine if the last seen should be checked.
		 *
		 * @param array $elevated_roles The elevated roles.
		 */
		$elevated_roles = apply_filters( 'vip_security_boost_inactive_users_elevated_roles', self::$elevated_roles );

		// Prevent infinite loops inside user_can() due to other security logic.
		if ( is_automattician( $user->ID ) ) {
			return true;
		}

		// Ensure $user->roles is defined and is an array before using it.
		if ( isset( $user->roles ) && is_array( $user->roles ) && array_intersect( $elevated_roles, $user->roles ) ) {
			return true;
		}

		return false;
	}
}

Inactive_Users::init();
