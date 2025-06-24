<?php
namespace Automattic\VIP\Security\MFAUsers;

use Automattic\VIP\Security\Utils\Configs;

class Highlight_MFA_Users {
	const MFA_SKIP_USER_IDS_OPTION_KEY    = 'vip_security_mfa_skip_user_ids';
	const ROLE_COLUMN_KEY                 = 'role';
	const DEFAULT_ADMIN_EDITOR_ROLE_SLUGS = [ 'administrator', 'editor' ];

	/**
	 * The roles used to highlight users without MFA.
	 *
	 * @var array An array of role slugs.
	 */
	private static $roles;

	public static function init() {
		// Feature is always active unless specific users are skipped via option.
		$highlight_mfa_configs = Configs::get_module_configs( 'highlight-mfa-users' );
		self::$roles           = $highlight_mfa_configs['roles'] ?? self::DEFAULT_ADMIN_EDITOR_ROLE_SLUGS; // Default to administrator and editor if not configured

		if ( ! is_array( self::$roles ) ) {
			self::$roles = [ self::$roles ];
		}
		self::$roles = array_filter( self::$roles );
		// If after filtering, the array is empty, default back to administrator and editor
		if ( empty( self::$roles ) ) {
			self::$roles = self::DEFAULT_ADMIN_EDITOR_ROLE_SLUGS;
		}

		add_action( 'admin_notices', [ __CLASS__, 'display_mfa_disabled_notice' ] );
		add_action( 'pre_get_users', [ __CLASS__, 'filter_users_by_mfa_status' ] );
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
	}

	/**
		* Display an admin notice on the Users page showing the count of users with MFA disabled.
		*/
	public static function display_mfa_disabled_notice() {
		if ( ! class_exists( '\Two_Factor_Core' ) ) {
			return;
		}

		// Only show the notice to admins
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Only show on the main users list table
		$screen = get_current_screen();
		if ( ! $screen || 'users' !== $screen->id ) {
			return;
		}

		// Determine notice text based on role configuration
		// self::$roles is already an array and populated from init().
		$configured_roles_for_comparison = self::$roles;
		\sort( $configured_roles_for_comparison ); // Use global sort

		// unordered array check with ==
		$is_default_config = ( self::DEFAULT_ADMIN_EDITOR_ROLE_SLUGS === $configured_roles_for_comparison || empty( $configured_roles_for_comparison ) );

		$skipped_user_ids = get_option( self::MFA_SKIP_USER_IDS_OPTION_KEY, [] );
		if ( ! is_array( $skipped_user_ids ) ) {
			$skipped_user_ids = [];
		}

		// Exclude the wpcomvip user from the list
		$wpcomvip = get_user_by( 'login', 'wpcomvip' );
		if ( false !== $wpcomvip ) {
			$skipped_user_ids[] = $wpcomvip->ID;
		}
		// Query for user IDs with the configured roles, excluding skipped ones
		$args       = [
			'role__in' => self::$roles,
			'fields'   => 'ID',
			// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude -- Excluding a potentially small, known set of users (skipped + ID 1)
			'exclude'  => $skipped_user_ids,
			'number'   => -1, // Get all relevant users
		];
		$user_query = new \WP_User_Query( $args );
		$user_ids   = $user_query->get_results();

		$mfa_disabled_count = 0;
		foreach ( $user_ids as $user_id ) {
			if ( ! \Two_Factor_Core::is_user_using_two_factor( $user_id ) ) {
				++$mfa_disabled_count;
			}
		}

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
				/* Translators: %d is the number of users with Administrator or Editor roles without 2FA enabled being shown. */
				_n(
					'Showing %d user with Administrator or Editor roles without Two-Factor Authentication enabled.',
					'Showing %d users with Administrator or Editor roles without Two-Factor Authentication enabled.',
					$mfa_disabled_count,
					'wpvip'
				),
				number_format_i18n( $mfa_disabled_count )
			);
		} else {
			// Custom roles
			$notice_message_text = sprintf(
				/* Translators: %d is the number of users with high-privileges without 2FA enabled being shown. */
				_n(
					'Showing %d user with high-privileges without Two-Factor Authentication enabled.',
					'Showing %d users with high-privileges without Two-Factor Authentication enabled.',
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
				/* Translators: %d is the number of users with Administrator or Editor roles and 2FA disabled. */
				_n(
					'There is %d user with Administrator or Editor roles with Two-Factor Authentication disabled.',
					'There are %d users with Administrator or Editor roles with Two-Factor Authentication disabled.',
					$mfa_disabled_count,
					'wpvip'
				),
				number_format_i18n( $mfa_disabled_count )
			);
		} else {
			$notice_message_text = sprintf(
				/* Translators: %d is the number of high-privilege users with 2FA disabled. */
				_n(
					'There is %d user with high-privileges with Two-Factor Authentication disabled.',
					'There are %d users with high-privileges with Two-Factor Authentication disabled.',
					$mfa_disabled_count,
					'wpvip'
				),
				number_format_i18n( $mfa_disabled_count )
			);
		}
		return $notice_message_text;
	}

	/**
		* Modify the user query on the Users page to filter by MFA status if requested.
		* @param \WP_User_Query $query The WP_User_Query instance (passed by reference).
		*/
	public static function filter_users_by_mfa_status( $query ) {
		global $pagenow;
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce is not required for this check
		if ( is_admin() && 'users.php' === $pagenow && isset( $_GET['filter_mfa_disabled'] ) && '1' === $_GET['filter_mfa_disabled'] ) {
			// Ensure we don't break other meta queries
			$meta_query = $query->get( 'meta_query' );
			if ( ! is_array( $meta_query ) ) {
				$meta_query = [];
			}

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

			$query->set( 'role__in', self::$roles ); // Set the configured roles
			$query->set( 'meta_query', $meta_query );

			// Exclude skipped users AND always exclude User wpcomvip
			$skipped_user_ids = \get_option( self::MFA_SKIP_USER_IDS_OPTION_KEY, [] );
			if ( ! is_array( $skipped_user_ids ) ) {
				$skipped_user_ids = [];
			}

			// Exclude the wpcomvip user from the list
			$wpcomvip = get_user_by( 'login', 'wpcomvip' );
			if ( false !== $wpcomvip ) {
				$skipped_user_ids[] = $wpcomvip->ID;
			}

			// Get any existing exclusions from the query
			$exclude_ids = $query->get( 'exclude' );
			if ( ! is_array( $exclude_ids ) ) {
				$exclude_ids = [];
			}
			// Merge existing exclusions, skipped IDs from option
			$final_exclude_ids = array_unique( array_merge( $exclude_ids, $skipped_user_ids ) );

			// Set the final list of excluded IDs
			$query->set( 'exclude', $final_exclude_ids );
		}
	}

	/**
	 * Add Role column to the users table.
	 *
	 * @param array $columns The existing columns.
	 * @return array The modified columns.
	 */
	public static function add_columns( $columns ) {
		$new_columns = [];

		foreach ( $columns as $key => $title ) {
			// Add role column if it doesn't exist
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
