<?php
namespace Automattic\VIP\Security\MFAUsers;

use Automattic\VIP\Security\Utils\Configs;
use Automattic\VIP\Security\Utils\Capability_Utils;
use Automattic\VIP\Security\Utils\Users_Query_Utils;

class Forced_MFA_Users {
	public const ADDITIONAL_CAPABILITIES_FILTER_NAME = 'vip_wsc_forced_mfa_users_additional_capabilities';
	public const ADDITIONAL_ROLES_FILTER_NAME        = 'vip_wsc_forced_mfa_users_additional_roles';
	const MFA_COUNT_CACHE_GROUP                      = 'vip_security_forced_mfa_count';
	const MFA_COUNT_CACHE_KEY_PREFIX                 = 'forced_mfa_disabled_count';
	const MFA_COUNT_CACHE_TTL                        = HOUR_IN_SECONDS; // Cache for 1 hour
	const MFA_SKIP_USER_IDS_OPTION_KEY               = 'vip_security_mfa_skip_user_ids';
	/**
	 * The roles that should have MFA enforced.
	 *
	 * @var array An array of role slugs.
	 */
	private static $roles = [];

	/**
	 * The capabilities that should have MFA enforced.
	 *
	 * @var array An array of capability slugs.
	 */
	private static $capabilities = [];

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

		$forced_mfa_configs = Configs::get_module_configs( 'forced-mfa-users' );

		// Normalize capabilities and roles configuration
		self::$capabilities = Capability_Utils::normalize_capabilities_input( $forced_mfa_configs['capabilities'] ?? [] );
		self::$roles        = Capability_Utils::normalize_roles_input( $forced_mfa_configs['roles'] ?? [] );

		// If we have configs, set up enforcement
		if ( ! empty( self::$capabilities ) || ! empty( self::$roles ) ) {
			add_action( 'set_current_user', [ __CLASS__, 'maybe_enforce_two_factor' ], 10 );
			add_filter( 'vip_site_details_index_security_boost_data', [ __CLASS__, 'add_custom_enforced_capabilities_to_sds' ] );
		}

		// Always add SDS reporting hook (even without config, to report zero count)
		add_filter( 'vip_site_details_index_security_boost_data', [ __CLASS__, 'add_users_without_2fa_count_to_sds_payload' ] );

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

	public static function add_custom_enforced_capabilities_to_sds( $data ) {
		$has_custom_capabilities_filter = has_filter( self::ADDITIONAL_CAPABILITIES_FILTER_NAME ) !== false;
		$data['custom_capabilities']    = $has_custom_capabilities_filter ? implode( ',', self::get_custom_enforced_capabilities() ) : 'false';
		$has_custom_roles_filter        = has_filter( self::ADDITIONAL_ROLES_FILTER_NAME ) !== false;
		$data['custom_roles']           = $has_custom_roles_filter ? implode( ',', self::get_custom_enforced_roles() ) : 'false';
		return $data;
	}

	public static function get_custom_enforced_capabilities() {
		return Capability_Utils::normalize_capabilities_input( apply_filters( self::ADDITIONAL_CAPABILITIES_FILTER_NAME, [] ) );
	}

	public static function get_custom_enforced_roles() {
		return Capability_Utils::normalize_roles_input( apply_filters( self::ADDITIONAL_ROLES_FILTER_NAME, [] ) );
	}

	/**
	 * Returns the merged array of capabilities from the config and the custom enforced capabilities
	 *
	 * @return array
	 */
	public static function get_capabilities() {
		return array_unique( array_merge( self::$capabilities, self::get_custom_enforced_capabilities() ) );
	}

	/**
	 * Returns the merged array of roles from the config and the custom enforced roles
	 *
	 * @return array
	 */
	public static function get_roles() {
		return array_unique( array_merge( self::$roles, self::get_custom_enforced_roles() ) );
	}

	/**
	 * Require 2FA based on capabilities or roles set in config
	 */
	public static function maybe_enforce_two_factor() {
		if ( ! is_user_logged_in() ) {
			return;
		}
		// don't enforce 2FA if the user is already excluded by VIP mu-plugins logic
		if ( function_exists( 'wpcom_vip_should_force_two_factor' ) && ! wpcom_vip_should_force_two_factor() ) {
			return;
		}

		$user = wp_get_current_user();
		if ( ! $user->exists() ) {
			return;
		}
		// Check if user has elevated permissions based on capabilities or roles
		$user_has_two_factor_enforced = Capability_Utils::user_has_elevated_permissions(
			$user,
			self::get_capabilities(), // we're using the merged array of capabilities
			self::get_roles() // we're using the merged array of roles
		);

		// we're intentionally applying the is_two_factor_forced filter with a default of "true" to check if someone is overriding the value and returning false.
		$is_forced_to_false_via_filter = apply_filters( 'wpcom_vip_is_two_factor_forced', true ) === false;
		if ( $is_forced_to_false_via_filter ) {
			// honor the filter and don't enforce 2FA
			return;
		}

		add_filter( 'wpcom_vip_internal_is_two_factor_forced', function ( $limited ) use ( $user_has_two_factor_enforced ) {
			// we're honoring the $limited value in case it's stricter than ours.
			return $limited || $user_has_two_factor_enforced;
		}, PHP_INT_MAX, 1 );
	}

	/**
	 * Add the users_without_2fa_count to the SDS payload.
	 *
	 * @param array $data The SDS payload data.
	 * @return array The modified SDS payload data.
	 */
	public static function add_users_without_2fa_count_to_sds_payload( $data ) {
		// Add fix for unreliable FOUND_ROWS() query
		add_filter( 'found_users_query', [ Users_Query_Utils::class, 'fix_found_users_query' ], 10, 2 );

		$users_without_2fa_count = self::get_mfa_disabled_count();

		$data['users_without_2fa_count'] = $users_without_2fa_count;

		if ( is_multisite() ) {
			// Get number of users without 2FA for all blogs (network-wide with blog_id = 0)
			$users_without_2fa_count_all_blogs = self::get_mfa_disabled_count( 0 );

			// Add network-wide users without 2FA count to the SDS payload
			$data['users_without_2fa_count_all_blogs'] = $users_without_2fa_count_all_blogs;
		}

		// Remove fix for unreliable FOUND_ROWS() query
		remove_filter( 'found_users_query', [ Users_Query_Utils::class, 'fix_found_users_query' ], 10 );

		return $data;
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
		// Remove duplicates + sort to make the cache key stable regardless of array order
		$roles = array_values( array_unique( self::get_roles() ) );
		$caps  = array_values( array_unique( self::get_capabilities() ) );

		sort( $roles, SORT_STRING );
		sort( $caps, SORT_STRING );

		$roles_hash        = md5( wp_json_encode( $roles ) );
		$capabilities_hash = md5( wp_json_encode( $caps ) );

		return self::MFA_COUNT_CACHE_KEY_PREFIX . '_' . $blog_id . '_' . $roles_hash . '_' . $capabilities_hash;
	}

	/**
	 * Get the count of users with MFA disabled, with caching.
	 *
	 * @return int The number of users with MFA disabled.
	 */
	private static function get_mfa_disabled_count( $blog_id = null ) {
		$blog_id   = $blog_id ?? get_current_blog_id();
		$cache_key = self::get_mfa_count_cache_key( $blog_id );

		// Try to get from cache first
		$cached_count = wp_cache_get( $cache_key, self::MFA_COUNT_CACHE_GROUP );
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
		$capabilities = self::get_capabilities();
		$roles        = self::get_roles();

		// If neither capabilities nor roles are configured, return 0
		if ( empty( $capabilities ) && empty( $roles ) ) {
			// Cache the result
			// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined
			wp_cache_set( $cache_key, 0, self::MFA_COUNT_CACHE_GROUP, self::MFA_COUNT_CACHE_TTL );
			return 0;
		}

		if ( Capability_Utils::are_capabilities_configured( $capabilities ) ) {
			$args['capability__in'] = $capabilities;
		} else {
			$args['role__in'] = $roles;
		}

		// Use our utility method that properly handles network-wide capability filtering
		$user_ids = Users_Query_Utils::query_users_with_capability_filtering(
			$args,
			$blog_id,
			false // return user IDs, not count
		);

		$mfa_disabled_count = 0;
		foreach ( $user_ids as $user_id ) {
			if ( ! \Two_Factor_Core::is_user_using_two_factor( $user_id ) ) {
				++$mfa_disabled_count;
			}
		}

		// Cache the result
		// phpcs:ignore WordPressVIPMinimum.Performance.LowExpiryCacheTime.CacheTimeUndetermined
		wp_cache_set( $cache_key, $mfa_disabled_count, self::MFA_COUNT_CACHE_GROUP, self::MFA_COUNT_CACHE_TTL );

		return $mfa_disabled_count;
	}

	/**
	 * Clear the MFA disabled count cache.
	 * Called when user MFA settings or roles change.
	 */
	public static function clear_mfa_count_cache( $blog_id = null ) {
		$blog_id = $blog_id ?? get_current_blog_id();

		wp_cache_delete( self::get_mfa_count_cache_key( $blog_id ), self::MFA_COUNT_CACHE_GROUP );

		// Clear the network-wide key as well
		wp_cache_delete( self::get_mfa_count_cache_key( 0 ), self::MFA_COUNT_CACHE_GROUP );
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

		// Clear the network-wide key as well
		wp_cache_delete( self::get_mfa_count_cache_key( 0 ), self::MFA_COUNT_CACHE_GROUP );

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
	 * Also clears cache when user capabilities are updated (e.g., via WP-CLI).
	 *
	 * @param int    $meta_id  ID of updated metadata entry.
	 * @param int    $user_id  User ID.
	 * @param string $meta_key Metadata key.
	 */
	public static function clear_mfa_count_cache_on_meta_update( $meta_id, $user_id, $meta_key ) {
		global $wpdb;

		// Clear cache when 2FA settings change
		if ( \Two_Factor_Core::ENABLED_PROVIDERS_USER_META_KEY === $meta_key ) {
			self::clear_mfa_count_cache_for_user_sites( $user_id );
		}

		// Clear cache when capabilities change (handles WP-CLI updates)
		// Check for both single site and multisite capability keys
		if ( $wpdb->prefix . 'capabilities' === $meta_key ||
			strpos( $meta_key, '_capabilities' ) !== false ) {
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
}

Forced_MFA_Users::init();
