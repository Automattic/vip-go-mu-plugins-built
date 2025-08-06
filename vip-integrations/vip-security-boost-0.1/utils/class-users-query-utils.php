<?php

namespace Automattic\VIP\Security\Utils;

class Users_Query_Utils {
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
	 * Perform a user query with proper capability/role filtering for network-wide queries.
	 *
	 * This method solves the WordPress core issue where WP_User_Query ignores
	 * capability__in and role__in parameters when blog_id=0 is used.
	 *
	 * Similar to fix_found_users_query, this leverages WP_User_Query to build
	 * the base SQL and then modifies the WHERE clause to add network-wide
	 * capability/role filtering.
	 *
	 * @param array $query_args WP_User_Query arguments. Should include capability__in or role__in.
	 * @param int   $blog_id    Blog ID. Use 0 for network-wide queries.
	 * @param bool  $count_only Whether to return only the count (true) or user IDs (false).
	 * @return int|array Returns count (int) if $count_only is true, otherwise array of user IDs.
	 */
	public static function query_users_with_capability_filtering( $query_args, $blog_id = null, $count_only = true ) {
		global $wpdb;

		// Single blog query
		if ( ! is_multisite() || 0 !== $blog_id ) {
			$query_args['blog_id'] = $blog_id;
			if ( $count_only ) {
				$query_args['count_total'] = true;
				$query_args['fields']      = 'ID';
				$query_args['number']      = 1; // We only need the count
			} else {
				$query_args['fields'] = 'ID';
			}

			$user_query = new \WP_User_Query( $query_args );
			return $count_only ? $user_query->get_total() : array_map( 'intval', $user_query->get_results() );
		}

		// Network-wide query
		$capabilities = $query_args['capability__in'] ?? [];
		$roles        = $query_args['role__in'] ?? [];

		// Remove capability/role filters from query args and let WP_User_Query build the base query
		$base_query_args = $query_args;
		unset( $base_query_args['capability__in'], $base_query_args['role__in'] );
		$base_query_args['fields']  = 'ID';
		$base_query_args['blog_id'] = 0;

		// Create WP_User_Query to get the base SQL clauses
		$temp_query = new \WP_User_Query( $base_query_args );

		// Build our network-wide capability filtering clause
		$capability_where = self::build_network_capability_where_clause( $capabilities, $roles );

		if ( empty( $capability_where ) ) {
			// No capability/role filtering needed, use the temp query results
			return $count_only ? $temp_query->get_total() : array_map( 'intval', $temp_query->get_results() );
		}

		// Build the final query using WP_User_Query's SQL with our additional WHERE clause
		if ( $count_only ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- SQL is built by WP_User_Query and internal methods
			// phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.user_meta__wpdb__users -- Required for network-wide user capability filtering
			$sql = "SELECT COUNT(DISTINCT {$wpdb->users}.ID) {$temp_query->query_from} {$temp_query->query_where} AND ({$capability_where})";
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$result = $wpdb->get_var( $sql );
			return (int) $result;
		} else {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- SQL is built by WP_User_Query and internal methods
			// phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.user_meta__wpdb__users -- Required for network-wide user capability filtering
			$sql = "SELECT DISTINCT {$wpdb->users}.ID {$temp_query->query_from} {$temp_query->query_where} AND ({$capability_where})";
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$results = $wpdb->get_col( $sql );
			return array_map( 'intval', $results );
		}
	}

	/**
	 * Build a WHERE clause for network-wide capability/role filtering.
	 *
	 * This creates a subquery that checks if the user has the required
	 * capabilities or roles on any site in the network using pattern matching.
	 *
	 * @param array $capabilities Required capabilities (OR logic).
	 * @param array $roles        Required roles (OR logic).
	 * @return string SQL WHERE clause condition (without WHERE keyword).
	 */
	private static function build_network_capability_where_clause( $capabilities, $roles ) {
		global $wpdb;

		$capabilities = array_filter( (array) $capabilities );
		$roles        = array_filter( (array) $roles );

		if ( empty( $capabilities ) && empty( $roles ) ) {
			return '';
		}

		$capability_checks = [];

		// Build capability conditions - convert capabilities to roles
		if ( ! empty( $capabilities ) ) {
			foreach ( $capabilities as $capability ) {
				$roles_with_capability = self::get_roles_with_capability( $capability );
				foreach ( $roles_with_capability as $role ) {
					$role                = esc_sql( $role );
					$capability_checks[] = "meta_value LIKE '%\"{$role}\";b:1%'";
				}
			}
		}

		// Build role conditions
		if ( ! empty( $roles ) ) {
			foreach ( $roles as $role ) {
				$role                = esc_sql( $role );
				$capability_checks[] = "meta_value LIKE '%\"{$role}\";b:1%'";
			}
		}

		// Remove duplicates to avoid redundant SQL conditions
		$capability_checks = array_unique( $capability_checks );

		if ( empty( $capability_checks ) ) {
			return '';
		}

		// Meta keys follow pattern: {prefix}_capabilities or {prefix}_{site_id}_capabilities
		// phpcs:ignore WordPressVIPMinimum.Variables.RestrictedVariables.user_meta__wpdb__users -- Required for network-wide user capability filtering
		$subquery = "{$wpdb->users}.ID IN (
			SELECT DISTINCT user_id
			FROM {$wpdb->usermeta}
			WHERE meta_key LIKE 'wp%_capabilities'
			AND (" . implode( ' OR ', $capability_checks ) . ')
		)';

		return $subquery;
	}

	/**
	 * Get all roles that have a specific capability.
	 *
	 * @param string $capability The capability to check for.
	 * @return array Array of role names that have the capability.
	 */
	private static function get_roles_with_capability( $capability ) {
		global $wp_roles;

		if ( ! isset( $wp_roles ) ) {
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Initializing $wp_roles if not set, standard WordPress pattern
			$wp_roles = new \WP_Roles();
		}

		$roles_with_capability = [];

		foreach ( $wp_roles->roles as $role_name => $role_info ) {
			if ( isset( $role_info['capabilities'][ $capability ] ) && $role_info['capabilities'][ $capability ] ) {
				$roles_with_capability[] = $role_name;
			}
		}

		return $roles_with_capability;
	}
}
