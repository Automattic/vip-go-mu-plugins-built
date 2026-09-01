<?php
/**
 * Settings page for VIP Workflows.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Admin;

/**
 * Handles the workflow settings page.
 */
class Settings {


	/**
	 * Option name for storing settings.
	 */
	private const OPTION_NAME = 'vip_workflows_settings';

	/**
	 * Initialize settings.
	 */
	public function init(): void {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Add settings submenu page.
	 */
	public function add_settings_page(): void {
		add_submenu_page(
			'vip-workflows',
			__( 'Settings', 'vip-workflows' ),
			__( 'Settings', 'vip-workflows' ),
			'manage_options',
			'vip-workflows-settings',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings(): void {
		register_setting(
			'vip_workflows_settings',
			self::OPTION_NAME,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize_settings' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Sanitize settings.
	 *
	 * @param  array $input Raw input.
	 * @return array Sanitized settings.
	 */
	public function sanitize_settings( $input ): array {
		$sanitized = array();

		if ( isset( $input['notifications_enabled'] ) ) {
			$sanitized['notifications_enabled'] = (bool) $input['notifications_enabled'];
		}

		if ( isset( $input['default_sla_hours'] ) ) {
			$sanitized['default_sla_hours'] = absint( $input['default_sla_hours'] );
		}

		// Workflow enforcement setting.
		$sanitized['workflow_enforcement'] = ! empty( $input['workflow_enforcement'] );

		// Enforcement mode: 'require' or 'recommend'.
		if ( isset( $input['workflow_enforcement_mode'] ) && in_array( $input['workflow_enforcement_mode'], array( 'require', 'recommend' ), true ) ) {
			$sanitized['workflow_enforcement_mode'] = $input['workflow_enforcement_mode'];
		} else {
			$sanitized['workflow_enforcement_mode'] = 'require';
		}

		// Allow self-review setting.
		$sanitized['allow_self_review'] = ! empty( $input['allow_self_review'] );

		// Roles that can bypass workflow lock.
		if ( isset( $input['bypass_workflow_roles'] ) && is_array( $input['bypass_workflow_roles'] ) ) {
			$sanitized['bypass_workflow_roles'] = array_map( 'sanitize_text_field', $input['bypass_workflow_roles'] );
		} else {
			$sanitized['bypass_workflow_roles'] = array( 'administrator' ); // Default to admin only.
		}

		// Roles that can bypass tool checks.
		if ( isset( $input['bypass_tool_check_roles'] ) && is_array( $input['bypass_tool_check_roles'] ) ) {
			$sanitized['bypass_tool_check_roles'] = array_map( 'sanitize_text_field', $input['bypass_tool_check_roles'] );
		} else {
			$sanitized['bypass_tool_check_roles'] = array( 'administrator' ); // Default to admin only.
		}

		// Roles that can view audit log.
		if ( isset( $input['audit_log_roles'] ) && is_array( $input['audit_log_roles'] ) ) {
			$sanitized['audit_log_roles'] = array_map( 'sanitize_text_field', $input['audit_log_roles'] );
		} else {
			$sanitized['audit_log_roles'] = array( 'administrator', 'editor' );
		}

		// Roles that can view ALL audit logs (not just their own).
		if ( isset( $input['audit_log_full_access_roles'] ) && is_array( $input['audit_log_full_access_roles'] ) ) {
			$sanitized['audit_log_full_access_roles'] = array_map( 'sanitize_text_field', $input['audit_log_full_access_roles'] );
		} else {
			$sanitized['audit_log_full_access_roles'] = array( 'administrator' );
		}

		return $sanitized;
	}

	/**
	 * Render the settings page.
	 */
	public function render_settings_page(): void {
		// Reuse the shared app-root markup so this render path stays structurally
		// identical to the other core screens (wrapped in `.wrap`) and picks up
		// the same admin-page.css inset resets — from one source of truth.
		Admin::render_app_root();
	}

	/**
	 * Get all settings.
	 *
	 * @return array
	 */
	public static function get_settings(): array {
		return get_option( self::OPTION_NAME, array() );
	}

	/**
	 * Get workflow enforcement mode for new posts.
	 *
	 * @return string|false 'require', 'recommend', or false if disabled.
	 */
	public static function get_workflow_enforcement_mode() {
		$settings = self::get_settings();

		if ( empty( $settings['workflow_enforcement'] ) ) {
			return false;
		}

		return $settings['workflow_enforcement_mode'] ?? 'require';
	}

	/**
	 * Check if self-review is allowed.
	 *
	 * @return bool
	 */
	public static function is_self_review_allowed(): bool {
		$settings = self::get_settings();
		return ! empty( $settings['allow_self_review'] );
	}

	/**
	 * Get roles that can bypass workflow lock.
	 *
	 * @return array Array of role slugs.
	 */
	public static function get_bypass_workflow_roles(): array {
		$settings = self::get_settings();
		return $settings['bypass_workflow_roles'] ?? array( 'administrator' );
	}

	/**
	 * Check if the current user can bypass workflow lock.
	 *
	 * @param  int|null $user_id User ID. Default current user.
	 * @return bool
	 */
	public static function can_user_bypass_workflow( ?int $user_id = null ): bool {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( ! $user_id ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		$bypass_roles = self::get_bypass_workflow_roles();

		foreach ( $user->roles as $role ) {
			if ( in_array( $role, $bypass_roles, true ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get roles that can bypass tool checks.
	 *
	 * @return array Array of role slugs.
	 */
	public static function get_bypass_tool_check_roles(): array {
		$settings = self::get_settings();
		return $settings['bypass_tool_check_roles'] ?? array( 'administrator' );
	}

	/**
	 * Check if the current user can bypass tool checks.
	 *
	 * @param  int|null $user_id User ID. Default current user.
	 * @return bool
	 */
	public static function can_user_bypass_tool_checks( ?int $user_id = null ): bool {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( ! $user_id ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		$bypass_roles = self::get_bypass_tool_check_roles();

		foreach ( $user->roles as $role ) {
			if ( in_array( $role, $bypass_roles, true ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get roles that can view the audit log.
	 *
	 * @return array Array of role slugs.
	 */
	public static function get_audit_log_roles(): array {
		$settings = self::get_settings();
		return $settings['audit_log_roles'] ?? array( 'administrator', 'editor' );
	}

	/**
	 * Check if the current user can view the audit log.
	 *
	 * @param  int|null $user_id User ID. Default current user.
	 * @return bool
	 */
	public static function can_user_view_audit_log( ?int $user_id = null ): bool {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( ! $user_id ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		$allowed_roles = self::get_audit_log_roles();

		foreach ( $user->roles as $role ) {
			if ( in_array( $role, $allowed_roles, true ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if the current user can view all audit logs (not just their own).
	 *
	 * @param  int|null $user_id User ID. Default current user.
	 * @return bool
	 */
	public static function can_user_view_all_audit_logs( ?int $user_id = null ): bool {
		if ( ! $user_id ) {
			$user_id = get_current_user_id();
		}

		if ( ! $user_id ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		// Admins and editors can see all logs.
		$full_access_roles = self::get_settings()['audit_log_full_access_roles'] ?? array( 'administrator', 'editor' );

		foreach ( $user->roles as $role ) {
			if ( in_array( $role, $full_access_roles, true ) ) {
				return true;
			}
		}

		return false;
	}
}
