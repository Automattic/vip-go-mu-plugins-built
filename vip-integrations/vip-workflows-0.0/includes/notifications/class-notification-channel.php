<?php
/**
 * Notification Channel Base Class.
 *
 * Extend this class to create custom notification channels.
 * Third-party plugins can register channels via the
 * 'vip_workflows_register_notification_channels' action.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Notifications;

/**
 * Abstract base class for notification channel adapters.
 *
 * @example
 * // In your plugin:
 * class MyChannel extends NotificationChannel {
 *     public function get_id(): string { return 'my-channel'; }
 *     // ... implement other required methods
 * }
 *
 * add_action('vip_workflows_register_notification_channels', function($dispatcher) {
 *     $dispatcher->register_channel(new MyChannel());
 * });
 */
abstract class NotificationChannel {


	/**
	 * Option name prefix for channel settings.
	 */
	private const OPTION_PREFIX = 'vip_workflows_channel_';

	/**
	 * Get the channel ID.
	 * Must be unique. Used for option storage and API endpoints.
	 *
	 * @return string Unique identifier (e.g., 'slack', 'teams', 'email').
	 */
	abstract public function get_id(): string;

	/**
	 * Get the channel display name.
	 *
	 * @return string Human-readable name.
	 */
	abstract public function get_name(): string;

	/**
	 * Get the channel description.
	 *
	 * @return string Short description of the channel.
	 */
	abstract public function get_description(): string;

	/**
	 * Get the channel icon.
	 *
	 * @return string Icon slug from the set in src/admin/components/ideation/assistant-icon.js.
	 */
	abstract public function get_icon(): string;

	/**
	 * Check if the channel is configured and ready to send.
	 * Use $this->get_settings() to check configuration.
	 *
	 * @return bool True if ready to send notifications.
	 */
	abstract public function is_configured(): bool;

	/**
	 * Send a notification.
	 *
	 * @param  Notification $notification The notification to send.
	 * @return bool True on success.
	 */
	abstract public function send( Notification $notification ): bool;

	/**
	 * Test the channel connection.
	 *
	 * @return true|\WP_Error True on success, WP_Error on failure.
	 */
	abstract public function test_connection();

	/**
	 * Sanitize settings input.
	 *
	 * @param  array $input Raw input from form.
	 * @return array Sanitized settings.
	 */
	abstract public function sanitize_settings( array $input ): array;

	/**
	 * Get a schema describing the settings this channel needs.
	 *
	 * Override this to define settings fields that are auto-rendered
	 * in the admin UI without requiring custom React code.
	 *
	 * @return array Associative array of field_key => field definition.
	 */
	public function get_settings_schema(): array {
		return array();
	}

	// =========================================================================
	// Base Class Methods - Don't override unless necessary
	// =========================================================================

	/**
	 * Get the WordPress option name for this channel.
	 *
	 * @return string Option name (e.g., 'vip_workflows_channel_slack').
	 */
	public function get_option_name(): string {
		return self::OPTION_PREFIX . $this->get_id();
	}

	/**
	 * Get stored settings for this channel.
	 *
	 * @return array Channel settings.
	 */
	public function get_settings(): array {
		return get_option( $this->get_option_name(), array() );
	}

	/**
	 * Update settings for this channel.
	 *
	 * @param  array $settings Settings to save.
	 * @return bool True on success.
	 */
	public function update_settings( array $settings ): bool {
		return update_option( $this->get_option_name(), $settings, false );
	}

	/**
	 * Register this channel's WordPress option.
	 * Called automatically by the dispatcher.
	 */
	public function register_option(): void {
		register_setting(
			'vip_workflows_integrations',
			$this->get_option_name(),
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize_settings' ),
				'default'           => array(),
			)
		);
	}

	/**
	 * Get channel info as array (for REST API).
	 *
	 * @return array Channel information.
	 */
	public function to_array(): array {
		$data = array(
			'id'          => $this->get_id(),
			'name'        => $this->get_name(),
			'description' => $this->get_description(),
			'icon'        => $this->get_icon(),
			'configured'  => $this->is_configured(),
		);

		$schema = $this->get_settings_schema();
		if ( ! empty( $schema ) ) {
			$data['settings_schema'] = $schema;
		}

		return $data;
	}
}
