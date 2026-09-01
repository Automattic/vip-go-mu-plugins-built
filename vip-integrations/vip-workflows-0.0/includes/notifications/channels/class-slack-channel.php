<?php
/**
 * Slack Notification Channel.
 *
 * Supports multiple Slack webhook destinations.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Notifications\Channels;

use VIPWorkflows\Integrations\SsrfGuard;
use VIPWorkflows\Notifications\NotificationChannel;
use VIPWorkflows\Notifications\Notification;
use WP_Error;

/**
 * Slack webhook notification channel.
 *
 * Each instance represents one Slack destination (webhook).
 */
class SlackChannel extends NotificationChannel {


	/**
	 * Option name for storing Slack destinations.
	 */
	public const DESTINATIONS_OPTION = 'vip_workflows_slack_destinations';

	/**
	 * Allowed hosts for Slack webhook delivery.
	 */
	private const WEBHOOK_ALLOWED_HOSTS = array(
		'hooks.slack.com',
		'hooks.slack-gov.com',
	);

	/**
	 * Unique ID for this destination.
	 *
	 * @var string
	 */
	private string $destination_id;

	/**
	 * Destination configuration.
	 *
	 * @var array
	 */
	private array $destination_config;

	/**
	 * Constructor.
	 *
	 * @param string $destination_id     Unique destination ID (e.g., 'editorial', 'urgent').
	 * @param array  $destination_config Destination config (name, webhook_url, bot_name, bot_icon).
	 */
	public function __construct( string $destination_id = 'default', array $destination_config = array() ) {
		$this->destination_id     = $destination_id;
		$this->destination_config = $destination_config;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_id(): string {
		return 'slack-' . $this->destination_id;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_name(): string {
		$name = $this->destination_config['name'] ?? __( 'Slack', 'vip-workflows' );
		return $name;
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_description(): string {
		return __( 'Send notifications to Slack channels via webhooks.', 'vip-workflows' );
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_icon(): string {
		return 'comment';
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_configured(): bool {
		return ! empty( $this->get_webhook_url() );
	}

	/**
	 * {@inheritdoc}
	 *
	 * @param Notification $notification Notification to send.
	 */
	public function send( Notification $notification ): bool {
		$webhook_url = $this->get_webhook_url();
		if ( empty( $webhook_url ) ) {
			return false;
		}

		$message  = $this->format_message( $notification );
		$response = SsrfGuard::remote_post_allowlisted(
			$webhook_url,
			array(
				// phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout -- Slack webhook fires from async notification dispatch.
				'timeout' => 15,
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $message ),
			),
			'slack-webhook',
			self::WEBHOOK_ALLOWED_HOSTS
		);

		if ( is_wp_error( $response ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- intentional server-side logging of Slack delivery failures.
			error_log( 'VIP Workflows Slack error: ' . $response->get_error_message() );
			return false;
		}

		$code = wp_remote_retrieve_response_code( $response );
		return $code >= 200 && $code < 300;
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$webhook_url = $this->get_webhook_url();
		if ( empty( $webhook_url ) ) {
			return new WP_Error( 'not_configured', __( 'No webhook URL configured.', 'vip-workflows' ) );
		}

		$notification           = new Notification();
		$notification->type     = 'test';
		$notification->severity = 'success';
		$notification->title    = __( 'Test Message', 'vip-workflows' );
		$notification->message  = sprintf(
		/* translators: %s: destination name */
			__( 'VIP Workflows → %s is working!', 'vip-workflows' ),
			$this->get_name()
		);
		$notification->icon     = '✅';
		$notification->color    = '#00a32a';

		$success = $this->send( $notification );

		return $success ? true : new WP_Error( 'send_failed', __( 'Failed to send test message.', 'vip-workflows' ) );
	}

	/**
	 * {@inheritdoc}
	 *
	 * @param array $input Input data.
	 */
	public function sanitize_settings( array $input ): array {
		$output = $input;

		if ( isset( $input['name'] ) ) {
			$output['name'] = sanitize_text_field( (string) $input['name'] );
		}

		if ( isset( $input['webhook_url'] ) ) {
			// Only Slack incoming-webhook URLs are valid destinations; reject
			// anything else so a non-Slack (or non-https) URL can't be stored and
			// later POSTed to.
			$url                   = esc_url_raw( (string) $input['webhook_url'], array( 'https' ) );
			$output['webhook_url'] = ( $url && self::is_allowed_webhook_url( $url ) ) ? $url : '';
		}

		if ( isset( $input['bot_name'] ) ) {
			$output['bot_name'] = sanitize_text_field( (string) $input['bot_name'] );
		}

		if ( isset( $input['bot_icon'] ) ) {
			// Either an emoji shortcode (:name:) or an https URL.
			$icon               = trim( (string) $input['bot_icon'] );
			$output['bot_icon'] = preg_match( '/^:[a-z0-9_+-]+:$/i', $icon )
				? $icon
				: esc_url_raw( $icon, array( 'https' ) );
		}

		return $output;
	}

	/**
	 * Whether an https URL points at one of the allowed Slack incoming-webhook hosts.
	 *
	 * Anchored on `https://{host}/` (trailing slash) so lookalikes such as
	 * `hooks.slack.com.evil.com` or `hooks.slack.com@evil.com` are rejected.
	 * Derived from {@see self::WEBHOOK_ALLOWED_HOSTS} so it stays in sync with the
	 * send-time SsrfGuard allowlist (covers hooks.slack-gov.com).
	 *
	 * @param string $url An https URL already normalized by esc_url_raw().
	 * @return bool
	 */
	private static function is_allowed_webhook_url( string $url ): bool {
		foreach ( self::WEBHOOK_ALLOWED_HOSTS as $host ) {
			if ( str_starts_with( $url, 'https://' . $host . '/' ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * {@inheritdoc}
	 * Override to return destination config instead of reading from option.
	 */
	public function get_settings(): array {
		return $this->destination_config;
	}

	/**
	 * {@inheritdoc}
	 * Override to save to destinations array instead of individual option.
	 *
	 * @param array $settings Settings data.
	 */
	public function update_settings( array $settings ): bool {
		$destinations = self::get_destinations();

		// Find and update this destination.
		$updated = false;
		foreach ( $destinations as &$dest ) {
			if ( $dest['id'] === $this->destination_id ) {
				$dest = array_merge(
					$dest,
					array(
						'name'        => $settings['name'] ?? $dest['name'],
						'webhook_url' => $settings['webhook_url'] ?? $dest['webhook_url'],
						'bot_name'    => $settings['bot_name'] ?? $dest['bot_name'],
						'bot_icon'    => $settings['bot_icon'] ?? $dest['bot_icon'],
					)
				);
				$updated = true;
				break;
			}
		}

		// Also update local config.
		if ( $updated ) {
			$this->destination_config = array_merge( $this->destination_config, $settings );
		}

		return self::save_destinations( $destinations );
	}

	/**
	 * Format a notification as a Slack message.
	 *
	 * @param  Notification $notification Notification to format.
	 * @return array Slack message payload.
	 */
	private function format_message( Notification $notification ): array {
		$message = array(
			'text' => sprintf( '%s *%s*: %s', $notification->icon, $notification->title, $notification->message ),
		);

		$bot_name = $this->destination_config['bot_name'] ?? 'Workflow Bot';
		$bot_icon = $this->destination_config['bot_icon'] ?? ':newspaper:';

		if ( ! empty( $bot_name ) ) {
			$message['username'] = $bot_name;
		}
		if ( ! empty( $bot_icon ) ) {
			$message['icon_emoji'] = $bot_icon;
		}

		$fields = $notification->get_fields();
		if ( ! empty( $fields ) ) {
			$message['attachments'] = array(
				array(
					'color'  => $notification->color,
					'fields' => array_map(
						fn( $field ) => array(
							'title' => $field['title'],
							'value' => $field['value'],
							'short' => $field['short'] ?? true,
						),
						$fields
					),
				),
			);
		}

		return $message;
	}

	/**
	 * Get the webhook URL.
	 *
	 * @return string Webhook URL.
	 */
	private function get_webhook_url(): string {
		// Support legacy constant for default destination.
		if ( 'default' === $this->destination_id && defined( 'VIP_WORKFLOWS_SLACK_WEBHOOK' ) ) {
			return VIP_WORKFLOWS_SLACK_WEBHOOK;
		}

		return $this->destination_config['webhook_url'] ?? '';
	}

	// =========================================================================
	// Static methods for managing destinations
	// =========================================================================

	/**
	 * Get all configured Slack destinations.
	 *
	 * @return array Array of destination configs.
	 */
	public static function get_destinations(): array {
		$destinations = get_option( self::DESTINATIONS_OPTION, array() );

		// Migration: if old single webhook exists, migrate it.
		if ( empty( $destinations ) ) {
			$old_settings = get_option( 'vip_workflows_channel_slack', array() );
			if ( ! empty( $old_settings['webhook_url'] ) ) {
				$destinations = array(
					array(
						'id'          => 'default',
						'name'        => __( 'Slack (Default)', 'vip-workflows' ),
						'webhook_url' => $old_settings['webhook_url'],
						'bot_name'    => $old_settings['bot_name'] ?? 'Workflow Bot',
						'bot_icon'    => $old_settings['bot_icon'] ?? ':newspaper:',
					),
				);
				update_option( self::DESTINATIONS_OPTION, $destinations );
			}
		}

		return $destinations;
	}

	/**
	 * Save Slack destinations.
	 *
	 * @param  array $destinations Array of destination configs.
	 * @return bool
	 */
	public static function save_destinations( array $destinations ): bool {
		// Sanitize each destination.
		$sanitized = array_map(
			function ( $dest ) {
				return array(
					'id'          => sanitize_key( $dest['id'] ?? wp_generate_uuid4() ),
					'name'        => sanitize_text_field( $dest['name'] ?? 'Slack' ),
					'webhook_url' => esc_url_raw( $dest['webhook_url'] ?? '' ),
					'bot_name'    => sanitize_text_field( $dest['bot_name'] ?? 'Workflow Bot' ),
					'bot_icon'    => sanitize_text_field( $dest['bot_icon'] ?? ':newspaper:' ),
				);
			},
			$destinations
		);

		return update_option( self::DESTINATIONS_OPTION, $sanitized );
	}

	/**
	 * Create channel instances for all configured destinations.
	 *
	 * @return SlackChannel[]
	 */
	public static function create_channel_instances(): array {
		$destinations = self::get_destinations();
		$channels     = array();

		foreach ( $destinations as $dest ) {
			$channels[] = new self( $dest['id'], $dest );
		}

		// If no destinations, create one placeholder so the UI can add them.
		if ( empty( $channels ) ) {
			$channels[] = new self(
				'default',
				array(
					'name'        => __( 'Slack (Default)', 'vip-workflows' ),
					'webhook_url' => '',
					'bot_name'    => 'Workflow Bot',
					'bot_icon'    => ':newspaper:',
				)
			);
		}

		return $channels;
	}
}
