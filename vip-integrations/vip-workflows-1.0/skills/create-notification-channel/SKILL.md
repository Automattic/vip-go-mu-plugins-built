---
name: create-vip-workflows-notification-channel
description: >-
  Scaffold a VIP Workflows notification channel plugin. Use when the user wants
  to add a custom notification destination like Slack, Teams, Discord, SMS,
  or any webhook-based service to VIP Workflows.
---
# Create a VIP Workflows Notification Channel

Notification channels deliver workflow event notifications (status changes, SLA breaches, publishing alerts) to external services. Each channel is a standalone WordPress plugin that extends the `NotificationChannel` base class.

## Requirements

Before starting, gather from the user:
1. **Destination service** -- e.g., Slack, Discord, Teams, Twilio SMS, PagerDuty
2. **Plugin slug** -- e.g., `workflow-channel-slack`
3. **What credentials are needed?** -- webhook URL, API token, phone number, etc.
4. **Does it support a test/ping?** -- most webhook services do

## Plugin Structure

```
workflow-channel-{name}/
  workflow-channel-{name}.php       # Main plugin file (hooks + asset loading)
  includes/
    class-{name}-channel.php        # Channel class extending NotificationChannel
```

The plugin directory lives alongside `vip-workflows/` in the same parent directory.

## Boilerplate

### Main plugin file: `workflow-channel-{name}/workflow-channel-{name}.php`

```php
<?php
/**
 * Plugin Name: Workflow {Display Name} Channel
 * Description: Sends VIP Workflows notifications to {service}.
 * Version: 1.0.0
 * Requires Plugins: vip-workflows
 * Text Domain: workflow-channel-{name}
 *
 * @package WorkflowChannel{PascalName}
 */

declare( strict_types=1 );

namespace WorkflowChannel{PascalName};

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'WORKFLOW_CHANNEL_{UPPER_NAME}_DIR', plugin_dir_path( __FILE__ ) );

add_action( 'vip_workflows_register_notification_channels', function( $dispatcher ) {
    require_once WORKFLOW_CHANNEL_{UPPER_NAME}_DIR . 'includes/class-{name}-channel.php';
    $dispatcher->register_channel( new {PascalName}Channel() );
} );
```

### Channel class: `workflow-channel-{name}/includes/class-{name}-channel.php`

```php
<?php
declare( strict_types=1 );

namespace WorkflowChannel{PascalName};

use VIPWorkflows\Notifications\NotificationChannel;
use VIPWorkflows\Notifications\Notification;
use WP_Error;

class {PascalName}Channel extends NotificationChannel {

    public function get_id(): string {
        return '{name}';
    }

    public function get_name(): string {
        return __( '{Display Name}', 'workflow-channel-{name}' );
    }

    public function get_description(): string {
        return __( 'Send notifications to {service}.', 'workflow-channel-{name}' );
    }

    public function get_icon(): string {
        return 'search';
    }

    /**
     * Check if the channel has the required configuration to send.
     */
    public function is_configured(): bool {
        $settings = $this->get_settings();
        return ! empty( $settings['webhook_url'] );
    }

    /**
     * Define settings fields. Auto-rendered in the admin UI.
     */
    public function get_settings_schema(): array {
        return array(
            'webhook_url' => array(
                'type'        => 'string',
                'label'       => __( 'Webhook URL', 'workflow-channel-{name}' ),
                'description' => __( 'The incoming webhook URL from {service}.', 'workflow-channel-{name}' ),
                'required'    => true,
            ),
            // Add more fields as needed:
            // 'channel' => array(
            //     'type'    => 'string',
            //     'label'   => __( 'Channel', 'workflow-channel-{name}' ),
            //     'default' => '#general',
            // ),
        );
    }

    /**
     * Send a notification to the service.
     *
     * @param Notification $notification Contains ->get_subject(), ->get_body(),
     *                                   ->get_post_id(), ->get_event_type(), etc.
     * @return bool True on success.
     */
    public function send( Notification $notification ): bool {
        $settings    = $this->get_settings();
        $webhook_url = $settings['webhook_url'] ?? '';

        if ( empty( $webhook_url ) ) {
            return false;
        }

        // Build the payload for your service.
        // Adapt this to match the service's expected format.
        $payload = array(
            'text' => sprintf(
                "**%s**\n%s",
                $notification->get_subject(),
                $notification->get_body()
            ),
        );

        $response = wp_remote_post( $webhook_url, array(
            'headers' => array( 'Content-Type' => 'application/json' ),
            'body'    => wp_json_encode( $payload ),
            'timeout' => 10,
        ) );

        if ( is_wp_error( $response ) ) {
            return false;
        }

        $code = wp_remote_retrieve_response_code( $response );
        return $code >= 200 && $code < 300;
    }

    /**
     * Test the channel connection with a sample message.
     *
     * @return true|WP_Error
     */
    public function test_connection() {
        $settings    = $this->get_settings();
        $webhook_url = $settings['webhook_url'] ?? '';

        if ( empty( $webhook_url ) ) {
            return new WP_Error( 'not_configured', __( 'Webhook URL is not set.', 'workflow-channel-{name}' ) );
        }

        $payload = array(
            'text' => 'Test notification from VIP Workflows.',
        );

        $response = wp_remote_post( $webhook_url, array(
            'headers' => array( 'Content-Type' => 'application/json' ),
            'body'    => wp_json_encode( $payload ),
            'timeout' => 10,
        ) );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code( $response );
        if ( $code < 200 || $code >= 300 ) {
            return new WP_Error(
                'send_failed',
                sprintf( __( 'Service returned HTTP %d.', 'workflow-channel-{name}' ), $code )
            );
        }

        return true;
    }

    /**
     * Sanitize settings input.
     *
     * @param array $input Raw form input.
     * @return array Sanitized settings.
     */
    public function sanitize_settings( array $input ): array {
        return array(
            'webhook_url' => esc_url_raw( $input['webhook_url'] ?? '' ),
        );
    }
}
```

## Abstract Methods Reference

The `NotificationChannel` base class requires these abstract methods:

| Method | Returns | Purpose |
|--------|---------|---------|
| `get_id()` | `string` | Unique channel ID (used for storage and API) |
| `get_name()` | `string` | Human-readable display name |
| `get_description()` | `string` | Short description |
| `get_icon()` | `string` | Icon slug from the set in src/admin/components/ideation/assistant-icon.js |
| `is_configured()` | `bool` | Whether the channel is ready to send |
| `send( Notification $notification )` | `bool` | Deliver a notification |
| `test_connection()` | `true\|WP_Error` | Verify the connection works |
| `sanitize_settings( array $input )` | `array` | Sanitize form input |

Settings are declared, not drawn. Override `get_settings_schema()` to return an array of field definitions; the base class puts it on the channel's REST payload via `to_array()`, and the React admin renders the form from it. There is no PHP-rendered settings form — a channel never emits settings markup of its own.

## Built-in Base Class Helpers

These are provided by `NotificationChannel` and should not be overridden:
- `$this->get_settings()` -- reads stored settings from `wp_options`
- `$this->update_settings( $settings )` -- writes settings

## Registration

Channels register via the `vip_workflows_register_notification_channels` action, which receives a `$dispatcher` object. Call `$dispatcher->register_channel( new YourChannel() )`.

## Testing

1. Place the plugin directory alongside `vip-workflows/`
2. Activate it in WordPress admin
3. Go to Integrations > Notification Channels to see the channel
4. Configure the webhook URL and use "Test Connection" to verify
5. Route an event to the channel on the `Routing` tab, then trigger a workflow transition to test delivery
