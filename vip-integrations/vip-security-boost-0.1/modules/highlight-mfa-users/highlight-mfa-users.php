<?php
namespace Automattic\VIP\Security\MFAUsers;

class Highlight_MFA_Users {
	const MFA_SKIP_USER_IDS_OPTION_KEY = 'vip_security_mfa_skip_user_ids';

	public static function init() {
		// Feature is always active unless specific users are skipped via option.
		add_action( 'admin_notices', [ __CLASS__, 'display_mfa_disabled_notice' ] );
		add_action( 'pre_get_users', [ __CLASS__, 'filter_users_by_mfa_status' ] );
	}

	/**
		* Display an admin notice on the Users page showing the count of users with MFA disabled.
		*/
	public static function display_mfa_disabled_notice() {
		if ( ! class_exists( '\Two_Factor_Core' ) ) {
			return;
		}

		// Only show on the main users list table
		$screen = get_current_screen();
		if ( ! $screen || 'users' !== $screen->id ) {
			return;
		}

		$skipped_user_ids = get_option( self::MFA_SKIP_USER_IDS_OPTION_KEY, [] );
		if ( ! is_array( $skipped_user_ids ) ) {
			$skipped_user_ids = [];
		}

		// Query for administrator user IDs, excluding skipped ones
		$args = [
			'role'    => 'administrator',
			'fields'  => 'ID',
			// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude -- Excluding a potentially small, known set of users (skipped + ID 1)
			'exclude' => array_merge( $skipped_user_ids, [1] ),
			'number'  => -1, // Get all relevant users
		];
		$user_query = new \WP_User_Query( $args );
		$user_ids   = $user_query->get_results();

		$mfa_disabled_count = 0;
		foreach ( $user_ids as $user_id ) {
			if ( ! \Two_Factor_Core::is_user_using_two_factor( $user_id ) ) {
				$mfa_disabled_count++;
			}
		}

		if ( $mfa_disabled_count > 0 ) {
			// Check if the filter is currently active
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Nonce is not required for this check
			$is_filtered = isset( $_GET['filter_mfa_disabled'] ) && '1' === $_GET['filter_mfa_disabled'];

			if ( $is_filtered ) {
				// Display notice for when the list IS filtered
				$show_all_url = remove_query_arg( 'filter_mfa_disabled', admin_url( 'users.php' ) );
				printf(
					'<div class="notice notice-info"><p>%s <a href="%s">%s</a></p></div>',
					esc_html( sprintf(
						_n(
							'Showing %d user without MFA enabled.',
							'Showing %d users without MFA enabled.',
							$mfa_disabled_count,
							'wpvip'
						),
						number_format_i18n( $mfa_disabled_count )
					) ),
					esc_url( $show_all_url ),
					esc_html__( 'Show all users.', 'wpvip' )
				);
			} else {
				// Display the original notice when the list is NOT filtered
				$filter_url = add_query_arg( 'filter_mfa_disabled', '1', admin_url( 'users.php' ) );
				printf(
					'<div class="notice notice-error"><p>%s <a href="%s">%s</a></p></div>',
					esc_html( sprintf(
						_n(
							'There is %d user with MFA disabled.',
							'There are %d users with MFA disabled.',
							$mfa_disabled_count,
							'wpvip'
						),
						number_format_i18n( $mfa_disabled_count )
					) ),
					esc_url( $filter_url ),
					esc_html__( 'Filter list to show these users.', 'wpvip' )
				);
			}
		}
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
			$query->set( 'role__in', ['administrator'] );
			$query->set( 'meta_query', $meta_query );

			// Exclude skipped users AND always exclude User ID 1
			$skipped_user_ids = \get_option( self::MFA_SKIP_USER_IDS_OPTION_KEY, [] );
			if ( ! is_array( $skipped_user_ids ) ) {
				$skipped_user_ids = [];
			}

			// Get any existing exclusions from the query
			$exclude_ids = $query->get( 'exclude' );
			if ( ! is_array( $exclude_ids ) ) {
				$exclude_ids = [];
			}

			// Merge existing exclusions, skipped IDs from option, and User ID 1
			$final_exclude_ids = array_unique( array_merge( $exclude_ids, $skipped_user_ids, [1] ) );

			// Set the final list of excluded IDs
			$query->set( 'exclude', $final_exclude_ids );
		}
	}
}
Highlight_MFA_Users::init();