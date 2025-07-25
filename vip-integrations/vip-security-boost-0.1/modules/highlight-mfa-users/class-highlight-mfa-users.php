<?php
namespace Automattic\VIP\Security\MFAUsers;

use Automattic\VIP\Security\Utils\Configs;
use Automattic\VIP\Security\Utils\Capability_Utils;

class Highlight_MFA_Users {
	const MFA_SKIP_USER_IDS_OPTION_KEY    = 'vip_security_mfa_skip_user_ids';
	const ROLE_COLUMN_KEY                 = 'role';
	const DEFAULT_ADMIN_EDITOR_ROLE_SLUGS = [ 'administrator', 'editor' ];
	const MFA_COUNT_CACHE_GROUP           = 'vip_security_mfa_count';
	const MFA_COUNT_CACHE_KEY_PREFIX      = 'mfa_disabled_count';
	const MFA_COUNT_CACHE_TTL             = HOUR_IN_SECONDS; // Cache for 1 hour

	/**
	 * The roles used to highlight users without MFA.
	 *
	 * @var array An array of role slugs.
	 */
	private static $roles;

	/**
	 * The capabilities used to highlight users without MFA.
	 *
	 * @var array An array of capability slugs.
	 */
	private static $capabilities;

	public static function init() {
		// If plugins_loaded has already fired (e.g., in tests), register hooks immediately
		if ( did_action( 'plugins_loaded' ) ) {
			self::register_hooks();
		} else {
			add_action( 'plugins_loaded', [ __CLASS__, 'register_hooks' ] );
		}
	}

	public static function register_hooks() {
		// Ensure the Two Factor plugin is active
		if ( ! class_exists( '\Two_Factor_Core' ) ) {
			return;
		}

		// Feature is always active unless specific users are skipped via option.
		$highlight_mfa_configs = Configs::get_module_configs( 'highlight-mfa-users' );
		
		// Normalize capabilities and roles configuration
		self::$capabilities = Capability_Utils::normalize_capabilities_input( $highlight_mfa_configs['capabilities'] ?? [] );
		self::$roles        = Capability_Utils::normalize_roles_input( $highlight_mfa_configs['roles'] ?? self::DEFAULT_ADMIN_EDITOR_ROLE_SLUGS );

		add_action( 'admin_notices', [ __CLASS__, 'display_mfa_disabled_notice' ] );
		add_filter( 'users_list_table_query_args', [ __CLASS__, 'filter_users_by_mfa_status_args' ] );
		add_action( 'admin_enqueue_scripts', [ __CLASS__, 'enqueue_tracking_scripts' ] );

		// Add column for role
		// Single site or main site admin users page
		add_filter( 'manage_users_columns', [ __CLASS__, 'add_columns' ] );
		// Network admin users page
		add_filter( 'wpmu_users_columns', [ __CLASS__, 'add_columns' ] );
		// Add content to the role column
		add_filter( 'manage_users_custom_column', [ __CLASS__, 'manage_columns' ], 10, 3 );

		// Make columns sortable
		add_filter( 'manage_users_sortable_columns', [ __CLASS__, 'make_columns_sortable' ] );
		add_filter( 'manage_users-network_sortable_columns', [ __CLASS__, 'make_columns_sortable' ] );

		// Handle sorting
		add_filter( 'users_list_table_query_args', [ __CLASS__, 'sort_columns' ] );

		// Hook into found_users_query to fix the count query for pagination
		add_filter( 'found_users_query', [ __CLASS__, 'fix_found_users_query' ], 10, 2 );

		// Clear cache when users are created or deleted
		add_action( 'user_register', [ __CLASS__, 'clear_mfa_count_cache' ] );
		add_action( 'delete_user', [ __CLASS__, 'clear_mfa_count_cache' ] );

		// Multisite-specific hooks for user deletion/removal
		if ( is_multisite() ) {
			add_action( 'wpmu_delete_user', [ __CLASS__, 'clear_mfa_count_cache_for_user_sites' ] );
			add_action( 'remove_user_from_blog', [ __CLASS__, 'clear_mfa_count_cache' ] );
			add_action( 'add_user_to_blog', [ __CLASS__, 'clear_mfa_count_cache' ] );
		}

		// Clear cache when users or MFA settings change
		add_action( 'updated_user_meta', [ __CLASS__, 'clear_mfa_count_cache_on_meta_update' ], 10, 3 );
		add_action( 'added_user_meta', [ __CLASS__, 'clear_mfa_count_cache_on_meta_update' ], 10, 3 );
		add_action( 'deleted_user_meta', [ __CLASS__, 'clear_mfa_count_cache_on_meta_update' ], 10, 3 );

		// Clear cache when user roles change
		add_action( 'set_user_role', [ __CLASS__, 'clear_mfa_count_cache_for_user_role_change' ], 10, 1 );
		add_action( 'add_user_role', [ __CLASS__, 'clear_mfa_count_cache_for_user_role_change' ], 10, 1 );
		add_action( 'remove_user_role', [ __CLASS__, 'clear_mfa_count_cache_for_user_role_change' ], 10, 1 );
	}

	/**
	 * Get the site-specific cache key for MFA count.
	 * Includes a hash of the configured roles to ensure cache invalidation when roles change.
	 *
	 * @return string The cache key for the current site.
	 */
	private static function get_mfa_count_cache_key( $blog_id = null ) {
		$blog_id = $blog_id ?? get_current_blog_id();

		// Include a hash of the roles configuration to invalidate cache when roles change
		$roles_hash        = md5( wp_json_encode( self::$roles ) );
		$capabilities_hash = md5( wp_json_encode( self::$capabilities ) );

		return self::MFA_COUNT_CACHE_KEY_PREFIX . '_' . $blog_id . '_' . $roles_hash . '_' . $capabilities_hash;
	}

	/**
	 * Get the count of users with MFA disabled, with caching.
	 *
	 * @return int The number of users with MFA disabled.
	 */
	private static function get_mfa_disabled_count() {
		// Try to get from cache first
		$cached_count = wp_cache_get( self::get_mfa_count_cache_key(), self::MFA_COUNT_CACHE_GROUP );
		if ( false !== $cached_count ) {
			return (int) $cached_count;
		}

		// Cache miss - calculate the count
		$skipped_user_ids = \get_option( self::MFA_SKIP_USER_IDS_OPTION_KEY, [] );
		if ( ! is_array( $skipped_user_ids ) ) {
			$skipped_user_ids = [];
		}

		// Exclude the wpcomvip user from the list
		$wpcomvip = get_user_by( 'login', Configs::get_bot_login() );
		if ( false !== $wpcomvip ) {
			$skipped_user_ids[] = $wpcomvip->ID;
		}
		$skipped_user_ids = array_unique( array_filter( array_map( 'intval', $skipped_user_ids ) ) );

		// Build query args - use capabilities if configured, otherwise fall back to roles
		$args = [
			'fields'  => 'ID',
			// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude -- Excluding a potentially small, known set of users (skipped + ID 1)
			'exclude' => $skipped_user_ids,
			'number'  => -1, // Get all relevant users
		];
		
		// Use native capability filtering if capabilities are configured
		if ( Capability_Utils::are_capabilities_configured( self::$capabilities ) ) {
			$args['capability__in'] = self::$capabilities;
		} else {
			$args['role__in'] = self::$roles;
		}
		
		$user_query = new \WP_User_Query( $args );
		$user_ids   = $user_query->get_results();

		$mfa_disabled_count = 0;
		foreach ( $user_ids as $user_id ) {
			if ( ! \Two_Factor_Core::is_user_using_two_factor( $user_id ) ) {
				++$mfa_disabled_count;
			}
		}

		// Cache the result
		// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined
		wp_cache_set( self::get_mfa_count_cache_key(), $mfa_disabled_count, self::MFA_COUNT_CACHE_GROUP, self::MFA_COUNT_CACHE_TTL );

		return $mfa_disabled_count;
	}

	/**
	 * Clear the MFA disabled count cache.
	 * Called when user MFA settings or roles change.
	 */
	public static function clear_mfa_count_cache() {
		wp_cache_delete( self::get_mfa_count_cache_key(), self::MFA_COUNT_CACHE_GROUP );
	}

	/**
	 * Clear the MFA count cache for all sites where a user has roles.
	 * This is used when user meta is updated to ensure cache consistency across the network.
	 *
	 * @param int $user_id The user ID whose sites should have cache cleared.
	 */
	public static function clear_mfa_count_cache_for_user_sites( $user_id ) {
		if ( ! is_multisite() ) {
			// Single site - just clear the current cache
			self::clear_mfa_count_cache();
			return;
		}

		// Get all sites where this user has roles
		$user_blogs = get_blogs_of_user( $user_id );

		if ( empty( $user_blogs ) ) {
			return;
		}

		// Clear cache for each site where the user has roles
		foreach ( $user_blogs as $blog ) {
			$cache_key = self::get_mfa_count_cache_key( $blog->userblog_id );
			wp_cache_delete( $cache_key, self::MFA_COUNT_CACHE_GROUP );
		}
	}

	/**
	 * Clear the MFA count cache when Two Factor user meta is updated.
	 *
	 * @param int    $meta_id  ID of updated metadata entry.
	 * @param int    $user_id  User ID.
	 * @param string $meta_key Metadata key.
	 */
	public static function clear_mfa_count_cache_on_meta_update( $meta_id, $user_id, $meta_key ) {
		if ( \Two_Factor_Core::ENABLED_PROVIDERS_USER_META_KEY === $meta_key ) {
			self::clear_mfa_count_cache_for_user_sites( $user_id );
		}
	}

	/**
	 * Clear the MFA count cache when user roles change.
	 * This handles set_user_role, add_user_role, and remove_user_role hooks.
	 *
	 * @param int    $user_id The user ID whose roles changed.
	 */
	public static function clear_mfa_count_cache_for_user_role_change( $user_id ) {
		self::clear_mfa_count_cache_for_user_sites( $user_id );
	}

	/**
	* Display an admin notice on the Users page showing the count of users with MFA disabled.
	*/
	public static function display_mfa_disabled_notice() {
		// Only show the notice to admins
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Only show on the main users list table
		$screen = get_current_screen();
		if ( ! $screen || 'users' !== $screen->id ) {
			return;
		}

		// Check if capabilities are configured or using default roles
		$has_capabilities  = Capability_Utils::are_capabilities_configured( self::$capabilities );
		$is_default_config = ! $has_capabilities && 
								empty( array_diff( self::$roles, self::DEFAULT_ADMIN_EDITOR_ROLE_SLUGS ) );

		// Get the cached MFA disabled count
		$mfa_disabled_count = self::get_mfa_disabled_count();

		if ( $mfa_disabled_count > 0 ) {
			// Check if the filter is currently active
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce is not required for this check
			$is_filtered = isset( $_GET['filter_mfa_disabled'] ) && '1' === $_GET['filter_mfa_disabled'];

			// Track MFA display with filter status
			do_action( 'vip_security_mfa_display', $is_filtered );

			if ( $is_filtered ) {
				// Display info notice for when the list IS filtered
				$show_all_url        = remove_query_arg( 'filter_mfa_disabled', admin_url( 'users.php' ) );
				$notice_message_text = self::get_missing_mfa_notice_message_text( $mfa_disabled_count, $is_default_config );

				printf(
					'<div class="notice notice-info"><p>%s <a href="%s">%s</a></p></div>',
					esc_html( $notice_message_text ),
					esc_url( $show_all_url ),
					esc_html__( 'Show all users.', 'wpvip' )
				);
			} else {
				// Display the original notice when the list is NOT filtered
				$filter_url          = add_query_arg( 'filter_mfa_disabled', '1', admin_url( 'users.php' ) );
				$notice_message_text = self::get_filtering_mfa_info_message_text( $mfa_disabled_count, $is_default_config );

				printf(
					'<div class="notice notice-error"><p>%s <a href="%s">%s</a></p></div>',
					esc_html( $notice_message_text ),
					esc_url( $filter_url ),
					esc_html__( 'Filter list to show these users.', 'wpvip' )
				);
			}
		}
	}

	/**
	 * Get the notice message text for when users with missing MFA are shown.
	 *
	 * @param int $mfa_disabled_count The number of users with missing MFA.
	 * @param bool $is_default_config Whether the default roles are being used.
	 * @return string The notice message text.
	 */
	protected static function get_missing_mfa_notice_message_text( $mfa_disabled_count, $is_default_config ) {
		$notice_message_text = '';
		if ( $is_default_config ) {
			// Default roles: Administrator, Editor
			$notice_message_text = sprintf(
				/* Translators: %s is the number of users with Administrator or Editor roles without 2FA enabled being shown. */
				_n(
					'Showing %s user with Administrator or Editor roles without Two-Factor Authentication enabled.',
					'Showing %s users with Administrator or Editor roles without Two-Factor Authentication enabled.',
					$mfa_disabled_count,
					'wpvip'
				),
				number_format_i18n( $mfa_disabled_count )
			);
		} else {
			// Custom roles
			$notice_message_text = sprintf(
				/* Translators: %s is the number of users with high-privileges without 2FA enabled being shown. */
				_n(
					'Showing %s user with high-privileges without Two-Factor Authentication enabled.',
					'Showing %s users with high-privileges without Two-Factor Authentication enabled.',
					$mfa_disabled_count,
					'wpvip'
				),
				number_format_i18n( $mfa_disabled_count )
			);
		}

		return $notice_message_text;
	}

	/**
	 * Get the notice message text for when users with missing MFA are filtered.
	 *
	 * @param int $mfa_disabled_count The number of users with missing MFA.
	 * @param bool $is_default_config Whether the default roles are being used.
	 * @return string The notice message text.
	 */
	protected static function get_filtering_mfa_info_message_text( $mfa_disabled_count, $is_default_config ) {
		$notice_message_text = '';
		if ( $is_default_config ) {
			$notice_message_text = sprintf(
				/* Translators: %s is the number of users with Administrator or Editor roles and 2FA disabled. */
				_n(
					'There is %s user with Administrator or Editor roles with Two-Factor Authentication disabled.',
					'There are %s users with Administrator or Editor roles with Two-Factor Authentication disabled.',
					$mfa_disabled_count,
					'wpvip'
				),
				number_format_i18n( $mfa_disabled_count )
			);
		} else {
			$notice_message_text = sprintf(
				/* Translators: %s is the number of high-privilege users with 2FA disabled. */
				_n(
					'There is %s user with high-privileges with Two-Factor Authentication disabled.',
					'There are %s users with high-privileges with Two-Factor Authentication disabled.',
					$mfa_disabled_count,
					'wpvip'
				),
				number_format_i18n( $mfa_disabled_count )
			);
		}
		return $notice_message_text;
	}

	/**
 * Filter users by MFA status using the correct hook for the user list table.
 * @param array $args The query arguments.
 * @return array The modified query arguments.
 */
	public static function filter_users_by_mfa_status_args( $args ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce is not required for this check
		if ( is_admin() && isset( $_GET['filter_mfa_disabled'] ) && '1' === $_GET['filter_mfa_disabled'] ) {
			$meta_query = $args['meta_query'] ?? [];

			$meta_query[] = [
				'relation' => 'OR',
				[
					'key'     => '_two_factor_enabled_providers',
					'compare' => 'NOT EXISTS',
				],
				[
					'key'     => '_two_factor_enabled_providers',
					'value'   => 'a:0:{}',
					'compare' => '=',
				],
				[
					'key'     => '_two_factor_enabled_providers',
					'value'   => '',
					'compare' => '=',
				],
			];

			// Use capability__in if capabilities are configured, otherwise use role__in
			if ( Capability_Utils::are_capabilities_configured( self::$capabilities ) ) {
				$args['capability__in'] = self::$capabilities;
			} else {
				$args['role__in'] = self::$roles;
			}
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
			$args['meta_query'] = $meta_query;

			$skipped_user_ids = \get_option( self::MFA_SKIP_USER_IDS_OPTION_KEY, [] );
			if ( ! is_array( $skipped_user_ids ) ) {
					$skipped_user_ids = [];
			}

			$wpcomvip = get_user_by( 'login', Configs::get_bot_login() );
			if ( false !== $wpcomvip ) {
					$skipped_user_ids[] = $wpcomvip->ID;
			}

			$exclude_ids = $args['exclude'] ?? [];
			// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude
			$args['exclude'] = array_unique( array_merge( $exclude_ids, $skipped_user_ids ) );
		}
		return $args;
	}

	/**
	 * Add Role column to the users table.
	 *
	 * @param array $columns The existing columns.
	 * @return array The modified columns.
	 */
	public static function add_columns( $columns ) {
		// If role column already exists, just return the original columns
		if ( isset( $columns[ self::ROLE_COLUMN_KEY ] ) ) {
			return $columns;
		}

		$new_columns = [];

		foreach ( $columns as $key => $title ) {
			// Add role column after name column
			if ( 'name' === $key ) {
				$new_columns[ $key ]                  = $title;
				$new_columns[ self::ROLE_COLUMN_KEY ] = __( 'Role', 'wpvip' );
			} else {
				$new_columns[ $key ] = $title;
			}
		}

		return $new_columns;
	}

	/**
	 * Manage the content of the custom columns.
	 *
	 * @param string $output      The output for the column.
	 * @param string $column_name The name of the column.
	 * @param int    $user_id     The ID of the user.
	 * @return string The content for the column.
	 */
	public static function manage_columns( $output, $column_name, $user_id ) {
		switch ( $column_name ) {
			case self::ROLE_COLUMN_KEY:
				$user = get_userdata( $user_id );
				if ( $user ) {
					$roles = array_map( function ( $role ) {
						return translate_user_role( wp_roles()->roles[ $role ]['name'] );
					}, $user->roles );
					return esc_html( implode( ', ', $roles ) );
				}
				return '';
		}

		return $output;
	}

	/**
	 * Make the custom columns sortable.
	 *
	 * @param array $columns The sortable columns.
	 * @return array The modified sortable columns.
	 */
	public static function make_columns_sortable( $columns ) {
		$columns[ self::ROLE_COLUMN_KEY ] = self::ROLE_COLUMN_KEY;
		return $columns;
	}

	/**
	 * Handle the sorting of custom columns.
	 *
	 * @param array $args The query arguments.
	 * @return array The modified query arguments.
	 */
	public static function sort_columns( $args ) {
		if ( ! isset( $args['orderby'] ) ) {
			return $args;
		}

		// The 'order' GET parameter is already handled by WP_Users_List_Table
		// and applied to $args['order'] before this filter.
		switch ( $args['orderby'] ) {
			case self::ROLE_COLUMN_KEY:
				// Sort by role using WP_User_Query arguments
				global $wpdb;
				$args['meta_key'] = $wpdb->prefix . 'capabilities';
				$args['orderby']  = 'meta_value';
				// $args['order'] (ASC/DESC) is already set by WP_Users_List_Table
				break;
		}

		return $args;
	}

	/**
	 * This function replaces WordPress's potentially unreliable `SELECT FOUND_ROWS()`
	 * with a direct `SELECT COUNT(DISTINCT ID)` query. It dynamically uses the
	 * exact same `FROM` and `WHERE` clauses that the main `WP_User_Query` is using,
	 * ensuring the total user count is always accurate for pagination.
	 *
	 * @param string         $sql   The original SQL query (usually 'SELECT FOUND_ROWS()').
	 * @param \WP_User_Query $query The WP_User_Query instance.
	 * @return string The corrected SQL query for counting users.
	 */
	public static function fix_found_users_query( $sql, $query ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! is_admin() || ! isset( $_GET['filter_mfa_disabled'] ) || '1' !== $_GET['filter_mfa_disabled'] ) {
			return $sql;
		}

		// The WP_User_Query object ($query) has already prepared its SQL clauses for the main query.
		// We can reuse them to build a reliable COUNT query.
		// These properties are populated by the prepare_query() method.
		if ( empty( $query->query_from ) || empty( $query->query_where ) ) {
			// This is unexpected, but as a fallback, return the original SQL to avoid errors.
			return $sql;
		}

		global $wpdb;

		// Build the reliable count query using the same FROM and WHERE clauses as the main query.
		// phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.user_meta__wpdb__users
		$count_sql = "SELECT COUNT(DISTINCT {$wpdb->users}.ID) {$query->query_from} {$query->query_where}";

		return $count_sql;
	}

	/**
	 * Enqueue tracking scripts for MFA interactions.
	 */
	public static function enqueue_tracking_scripts() {
		$screen = get_current_screen();
		if ( ! $screen || 'users' !== $screen->id ) {
			return;
		}

		// Track filter clicks when the page loads with filter parameter
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce is not required for this check
		if ( isset( $_GET['filter_mfa_disabled'] ) && '1' === $_GET['filter_mfa_disabled'] ) {
			do_action( 'vip_security_mfa_filter_click', 'mfa_disabled' );
		}

		// Track sorting when the page loads with orderby parameter
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce is not required for this check
		if ( isset( $_GET['orderby'] ) && self::ROLE_COLUMN_KEY === $_GET['orderby'] ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce is not required for this check
			$sort_order = isset( $_GET['order'] ) ? sanitize_text_field( wp_unslash( $_GET['order'] ) ) : 'asc';
			do_action( 'vip_security_mfa_sorting', self::ROLE_COLUMN_KEY, $sort_order );
		}
	}
}
Highlight_MFA_Users::init();
