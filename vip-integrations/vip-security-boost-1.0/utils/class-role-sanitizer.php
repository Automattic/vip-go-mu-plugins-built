<?php

namespace Automattic\VIP\Security\Utils;

class Role_Sanitizer {
	/**
	 * Track which role option filters are registered.
	 *
	 * @var array<string,bool>
	 */
	private static $role_option_filters = [];

	/**
	 * Whether role sanitizers are currently registered.
	 *
	 * @var bool
	 */
	private static $sanitizers_registered = false;

	/**
	 * Register role sanitizers only when corrupted role metadata is detected.
	 *
	 * @return void
	 */
	public static function maybe_register_role_sanitizers() {
		if ( ! self::roles_array_is_broken() ) {
			return;
		}

		self::register_role_sanitizers();
	}

	/**
	 * Register filters that repair the serialized roles option before WordPress reads it.
	 *
	 * @return void
	 */
	public static function register_role_sanitizers() {
		if ( self::$sanitizers_registered ) {
			return;
		}

		self::$sanitizers_registered = true;

		self::register_role_option_filter();
		add_action( 'switch_blog', [ __CLASS__, 'register_role_option_filter' ], 10, 1 );
	}

	/**
	 * Ensure each registered role includes a non-empty name to keep WP_User_Query happy when the roles option is corrupted.
	 *
	 * WordPress expects role definitions to always provide a translated `name`, but in some environments
	 * (for example after direct database edits) the option can lose that key which triggers warnings during query preparation.
	 * We repair the in-memory role definitions with a sensible fallback label so core APIs continue to function.
	 *
	 * @return void
	 */
	public static function ensure_roles_have_names() {
		global $wp_roles;

		if ( ! $wp_roles instanceof \WP_Roles ) {
			// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Initializing $wp_roles if not set, standard WordPress pattern
			$wp_roles = new \WP_Roles();
		}

		$wp_roles->roles = self::repair_roles_array( $wp_roles->roles );

		// Rebuild the role_names index after repair
		$wp_roles->role_names = [];
		foreach ( $wp_roles->roles as $role_key => $role_data ) {
			if ( isset( $role_data['name'] ) ) {
				$wp_roles->role_names[ $role_key ] = $role_data['name'];
			}
		}
	}
	/**
	 * Remove any temporary hooks registered for role sanitization.
	 *
	 * @return void
	 */
	public static function unregister_role_sanitizers() {
		foreach ( self::$role_option_filters as $role_option => $registered ) {
			if ( $registered ) {
				remove_filter(
					"option_{$role_option}",
					[ __CLASS__, 'repair_roles_array' ],
					5
				);
			}
		}

		remove_action( 'switch_blog', [ __CLASS__, 'register_role_option_filter' ], 10 );

		self::$role_option_filters   = [];
		self::$sanitizers_registered = false;
	}

	/**
	 * Ensure our option filter is active for the provided site.
	 *
	 * @param int|null $site_id Site ID the filter should target.
	 * @return void
	 */
	public static function register_role_option_filter( $site_id = null ) {
		$role_option = self::get_role_option_name( $site_id );

		if ( '' === $role_option ) {
			return;
		}

		if ( isset( self::$role_option_filters[ $role_option ] ) ) {
			return;
		}

		add_filter(
			"option_{$role_option}",
			[ __CLASS__, 'repair_roles_array' ],
			5,
			1
		);

		self::$role_option_filters[ $role_option ] = true;
	}

	/**
	 * Normalize role arrays to always contain a human readable name and capabilities array.
	 *
	 * @param mixed $roles Raw roles array.
	 * @return mixed
	 */
	public static function repair_roles_array( $roles ) {
		if ( ! is_array( $roles ) ) {
			return $roles;
		}
		foreach ( $roles as $role_key => &$role_definition ) {
			if ( ! is_array( $role_definition ) ) {
				$role_definition = [];
			}
			// if the capabilities are a string, convert to array
			if ( isset( $role_definition['capabilities'] ) && is_string( $role_definition['capabilities'] ) ) {
				$capability                      = $role_definition['capabilities'];
				$role_definition['capabilities'] = [ $capability => true ]; // TODO: should we hide the capability instead of setting it to true?
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error -- Logging a warning when repairing role capabilities to inform the user
				trigger_error( esc_html( "Repaired capabilities for role '{$role_key}' from string to array. Previous value: {$capability}. Please review your user roles db data as it might be corrupted." ), E_USER_WARNING );
			}
			if ( ! isset( $role_definition['capabilities'] ) || ! is_array( $role_definition['capabilities'] ) ) {
				// Ensure capabilities is an array; default to empty array.
				$role_definition['capabilities'] = [];

			}
			// if the name is missing
			if ( ! isset( $role_definition['name'] ) || ! is_string( $role_definition['name'] ) || '' === trim( $role_definition['name'] ) ) {

				$role_definition['name'] = self::build_fallback_role_label( $role_key );
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_trigger_error -- Logging a warning when repairing role name to inform the user
				trigger_error( esc_html( "Repaired missing name for role '{$role_key}' to '{$role_definition['name']}'. Please review your user roles db data as it might be corrupted." ), E_USER_WARNING );
			}
		}
		return $roles;
	}

	/**
	 * Determine if any role definitions are missing their name key.
	 *
	 * @return bool
	 */
	private static function roles_array_is_broken() {
		global $wp_roles;

		if ( $wp_roles instanceof \WP_Roles && self::roles_array_missing_names_or_wrong_capabilities_types( $wp_roles->roles ) ) {
			return true;
		}

		$role_option = self::get_role_option_name();

		if ( '' === $role_option ) {
			return false;
		}

		$stored_roles = get_option( $role_option );

		return self::roles_array_missing_names_or_wrong_capabilities_types( $stored_roles );
	}

	/**
	 * Helper to inspect a roles array for missing name keys.
	 *
	 * @param mixed $roles Role definitions.
	 * @return bool
	 */
	private static function roles_array_missing_names_or_wrong_capabilities_types( $roles ) {
		if ( ! is_array( $roles ) ) {
			return false;
		}

		foreach ( $roles as $role_definition ) {
			if ( ! is_array( $role_definition ) ) {
				return true;
			}

			if ( ! isset( $role_definition['name'] ) || ! is_string( $role_definition['name'] ) ) {
				return true;
			}

			if ( ! isset( $role_definition['capabilities'] ) || ! is_array( $role_definition['capabilities'] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Build a human readable fallback label from a role key.
	 *
	 * @param string $role_key Role slug.
	 * @return string
	 */
	private static function build_fallback_role_label( $role_key ) {
		$role_key = (string) $role_key;

		if ( '' === $role_key ) {
			return '';
		}

		$label = str_replace( [ '_', '-' ], ' ', $role_key );

		return ucwords( $label );
	}


	/**
	 * Get the option name WordPress uses to load roles for the requested site.
	 *
	 * @param int|null $site_id Optional site ID.
	 * @return string
	 */
	private static function get_role_option_name( $site_id = null ) {
		global $wpdb;

		if ( ! isset( $wpdb ) ) {
			return '';
		}

		if ( null === $site_id ) {
			if ( isset( $wpdb->blogid ) && $wpdb->blogid ) {
				$site_id = (int) $wpdb->blogid;
			} else {
				$site_id = (int) get_current_blog_id();
			}
		}

		$prefix = is_multisite() ? $wpdb->get_blog_prefix( $site_id ) : $wpdb->prefix;

		if ( ! is_string( $prefix ) || '' === $prefix ) {
			return '';
		}

		return $prefix . 'user_roles';
	}
}
