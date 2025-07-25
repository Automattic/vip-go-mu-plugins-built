<?php

namespace Automattic\VIP\Security\Utils;

/**
 * Utility class for handling capability-based user permission checks.
 * 
 * This class provides a centralized way to check user permissions using
 * capabilities with role fallback across all VIP Security Boost modules.
 * 
 * Pattern: Capabilities take priority over roles. If capabilities are configured,
 * roles are ignored. If no capabilities are configured, roles are used as fallback.
 */
class Capability_Utils {
	
	/**
	 * Check if a user has elevated permissions based on capabilities or roles.
	 * 
	 * @param \WP_User|false|null $user The user to check.
	 * @param array $capabilities Array of capabilities to check (OR logic).
	 * @param array $roles Array of roles to check if no capabilities configured.
	 * @return bool True if user has elevated permissions, false otherwise.
	 */
	public static function user_has_elevated_permissions( $user, $capabilities = [], $roles = [] ): bool {
		if ( ! ( $user instanceof \WP_User ) || ! $user->exists() ) {
			return false;
		}
		
		if ( function_exists( 'is_automattician' ) && is_automattician( $user->ID ) ) {
			return true;
		}
		
		$capabilities = self::normalize_capabilities_input( $capabilities );
		$roles        = self::normalize_roles_input( $roles );
		
		if ( ! empty( $capabilities ) ) {
			return self::user_has_any_capability( $user, $capabilities );
		}
		
		return self::user_has_any_role( $user, $roles );
	}
	
	/**
	 * Check if a user has any of the specified capabilities (OR logic).
	 * 
	 * @param \WP_User|false|null $user The user to check.
	 * @param array $capabilities Array of capabilities to check.
	 * @return bool True if user has any of the capabilities, false otherwise.
	 */
	public static function user_has_any_capability( $user, $capabilities ): bool {
		if ( ! ( $user instanceof \WP_User ) || ! $user->exists() || empty( $capabilities ) ) {
			return false;
		}
		
		foreach ( $capabilities as $capability ) {
			// phpcs:ignore WordPress.WP.Capabilities.Undetermined -- Capability is from configuration
			if ( user_can( $user, $capability ) ) {
				return true;
			}
		}
		
		return false;
	}
	
	/**
	 * Check if a user has any of the specified roles (OR logic).
	 * 
	 * @param \WP_User|false|null $user The user to check.
	 * @param array $roles Array of roles to check.
	 * @return bool True if user has any of the roles, false otherwise.
	 */
	public static function user_has_any_role( $user, $roles ): bool {
		if ( ! ( $user instanceof \WP_User ) || ! $user->exists() || empty( $roles ) ) {
			return false;
		}
		
		return ! empty( array_intersect( $roles, $user->roles ) );
	}
	
	/**
	 * Normalize capabilities input to ensure it's a filtered array.
	 * 
	 * @param mixed $capabilities Input capabilities (string, array, or other).
	 * @return array Normalized capabilities array.
	 */
	public static function normalize_capabilities_input( $capabilities ): array {
		if ( empty( $capabilities ) ) {
			return [];
		}
		
		if ( is_string( $capabilities ) ) {
			$capabilities = [ $capabilities ];
		}
		
		if ( ! is_array( $capabilities ) ) {
			return [];
		}
		
		return array_filter( $capabilities, function ( $cap ) {
			return is_string( $cap ) && ! empty( trim( $cap ) );
		} );
	}
	
	/**
	 * Normalize roles input to ensure it's a filtered array.
	 * 
	 * @param mixed $roles Input roles (string, array, or other).
	 * @return array Normalized roles array.
	 */
	public static function normalize_roles_input( $roles ): array {
		if ( empty( $roles ) ) {
			return [];
		}
		
		if ( is_string( $roles ) ) {
			$roles = [ $roles ];
		}
		
		if ( ! is_array( $roles ) ) {
			return [];
		}
		
		return array_filter( $roles, function ( $role ) {
			return is_string( $role ) && ! empty( trim( $role ) );
		} );
	}
	
	/**
	 * Get a user-friendly description of the privilege type being used.
	 * 
	 * @param array $capabilities Configured capabilities.
	 * @param array $roles Configured roles.
	 * @return string Description like "elevated capabilities" or "elevated roles".
	 */
	public static function get_privilege_type_description( $capabilities, $roles ): string {
		$capabilities = self::normalize_capabilities_input( $capabilities );
		$roles        = self::normalize_roles_input( $roles );
		
		if ( ! empty( $capabilities ) ) {
			return count( $capabilities ) === 1 ? 'elevated capability' : 'elevated capabilities';
		}
		
		if ( ! empty( $roles ) ) {
			return count( $roles ) === 1 ? 'elevated role' : 'elevated roles';
		}
		
		return 'elevated permissions';
	}
	
	/**
	 * Get a comma-separated list of the configured capabilities or roles.
	 * 
	 * @param array $capabilities Configured capabilities.
	 * @param array $roles Configured roles.
	 * @return string Comma-separated list of capabilities or roles.
	 */
	public static function get_privilege_list( $capabilities, $roles ): string {
		$capabilities = self::normalize_capabilities_input( $capabilities );
		$roles        = self::normalize_roles_input( $roles );
		
		if ( ! empty( $capabilities ) ) {
			return implode( ', ', $capabilities );
		}
		
		if ( ! empty( $roles ) ) {
			return implode( ', ', $roles );
		}
		
		return '';
	}
	
	/**
	 * Check if capabilities are configured (not empty after normalization).
	 * 
	 * @param mixed $capabilities Input capabilities to check.
	 * @return bool True if capabilities are configured, false otherwise.
	 */
	public static function are_capabilities_configured( $capabilities ): bool {
		return ! empty( self::normalize_capabilities_input( $capabilities ) );
	}
	
	/**
	 * Apply filters to capabilities and roles for a specific module.
	 * 
	 * @param string $module_name The module name (e.g., 'highlight_mfa_users').
	 * @param array $capabilities Default capabilities.
	 * @param array $roles Default roles.
	 * @return array Associative array with 'capabilities' and 'roles' keys.
	 */
	public static function apply_module_filters( $module_name, $capabilities, $roles ): array {
		$capabilities = self::normalize_capabilities_input( $capabilities );
		$roles        = self::normalize_roles_input( $roles );
		
		$capabilities = apply_filters( 
			"vip_security_boost_{$module_name}_elevated_capabilities", 
			$capabilities 
		);
		
		$roles = apply_filters( 
			"vip_security_boost_{$module_name}_elevated_roles", 
			$roles 
		);
		
		return [
			'capabilities' => self::normalize_capabilities_input( $capabilities ),
			'roles'        => self::normalize_roles_input( $roles ),
		];
	}
}
