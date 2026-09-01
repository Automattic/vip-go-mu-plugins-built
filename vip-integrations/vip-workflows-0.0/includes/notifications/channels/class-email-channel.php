<?php
/**
 * Email Notification Channel.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Notifications\Channels;

use VIPWorkflows\Notifications\NotificationChannel;
use VIPWorkflows\Notifications\Notification;
use WP_Error;

/**
 * Email notification channel using wp_mail.
 */
class EmailChannel extends NotificationChannel {


	/**
	 * {@inheritdoc}
	 */
	public function get_id(): string {
		return 'email';
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_name(): string {
		return __( 'Email', 'vip-workflows' );
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_description(): string {
		return __( 'Send email notifications to users and administrators.', 'vip-workflows' );
	}

	/**
	 * {@inheritdoc}
	 */
	public function get_icon(): string {
		return 'envelope';
	}

	/**
	 * {@inheritdoc}
	 */
	public function is_configured(): bool {
		$settings = $this->get_settings();

		// If no settings saved yet, consider configured with defaults (author + admins).
		if ( empty( $settings ) ) {
			return true;
		}

		// Configured if at least one recipient type is enabled.
		return ! empty( $settings['notify_author'] )
		|| ! empty( $settings['notify_admins'] )
		|| ! empty( $settings['additional_recipients'] );
	}

	/**
	 * {@inheritdoc}
	 *
	 * @param Notification $notification Notification to send.
	 */
	public function send( Notification $notification ): bool {
		$recipients = $this->get_recipients( $notification );
		if ( empty( $recipients ) ) {
			return false;
		}

		$subject = sprintf(
			'[%s] %s: %s',
			get_bloginfo( 'name' ),
			$notification->title,
			$notification->get( 'post_title', '' )
		);

		$body    = $this->format_body( $notification );
		$headers = array( 'Content-Type: text/html; charset=UTF-8' );

		$success = true;
		foreach ( $recipients as $email ) {
			if ( ! wp_mail( $email, $subject, $body, $headers ) ) {
				$success = false;
			}
		}

		return $success;
	}

	/**
	 * {@inheritdoc}
	 */
	public function test_connection() {
		$admin_email = get_option( 'admin_email' );
		if ( empty( $admin_email ) ) {
			return new WP_Error( 'no_email', __( 'No admin email configured.', 'vip-workflows' ) );
		}

		$subject = sprintf( '[%s] %s', get_bloginfo( 'name' ), __( 'Test Email', 'vip-workflows' ) );
		$body    = '<p>' . esc_html__( 'VIP Workflows email notifications are working!', 'vip-workflows' ) . '</p>';
		$headers = array( 'Content-Type: text/html; charset=UTF-8' );

		$success = wp_mail( $admin_email, $subject, $body, $headers );

		return $success ? true : new WP_Error( 'send_failed', __( 'Failed to send test email.', 'vip-workflows' ) );
	}

	/**
	 * {@inheritdoc}
	 *
	 * @param array $input Input data.
	 */
	public function sanitize_settings( array $input ): array {
		$sanitized                   = array();
		$sanitized['notify_author']  = ! empty( $input['notify_author'] );
		$sanitized['notify_admins']  = ! empty( $input['notify_admins'] );

		if ( ! empty( $input['additional_recipients'] ) ) {
			$lines  = explode( "\n", $input['additional_recipients'] );
			$emails = array_filter(
				array_map(
					function ( $line ) {
							$email = sanitize_email( trim( $line ) );
							return is_email( $email ) ? $email : null;
					},
					$lines
				)
			);
			$sanitized['additional_recipients'] = implode( "\n", $emails );
		}

		return $sanitized;
	}

	/**
	 * Get recipients for a notification.
	 *
	 * @param  Notification $notification Notification.
	 * @return array Email addresses.
	 */
	private function get_recipients( Notification $notification ): array {
		$settings   = $this->get_settings();
		$recipients = array();

		if ( ! empty( $settings['notify_author'] ) ) {
			$author_id = $notification->get( 'author_id' );
			if ( $author_id ) {
				$author = get_userdata( $author_id );
				if ( $author && $author->user_email ) {
					$recipients[] = $author->user_email;
				}
			}
		}

		if ( ! empty( $settings['notify_admins'] ) ) {
			$admins = get_users(
				array(
					'role' => 'administrator',
					'fields' => array( 'user_email' ),
				)
			);
			foreach ( $admins as $admin ) {
				$recipients[] = $admin->user_email;
			}
		}

		if ( ! empty( $settings['additional_recipients'] ) ) {
			$additional = explode( "\n", $settings['additional_recipients'] );
			$recipients = array_merge( $recipients, array_map( 'trim', $additional ) );
		}

		return array_unique( array_filter( $recipients ) );
	}

	/**
	 * Format notification as HTML email body.
	 *
	 * @param  Notification $notification Notification.
	 * @return string HTML body.
	 */
	private function format_body( Notification $notification ): string {
		$fields = $notification->get_fields();

		ob_start();
		?>
		<!DOCTYPE html>
		<html>
		<head><meta charset="UTF-8"></head>
		<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #1e1e1e;">
			<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
				<div style="border-left: 4px solid <?php echo esc_attr( $notification->color ); ?>; padding-left: 16px; margin-bottom: 20px;">
					<h2 style="margin: 0 0 8px; color: <?php echo esc_attr( $notification->color ); ?>;">
		<?php echo esc_html( $notification->icon . ' ' . $notification->title ); ?>
					</h2>
					<p style="margin: 0; font-size: 16px;"><?php echo esc_html( $notification->message ); ?></p>
				</div>

		<?php if ( ! empty( $fields ) ) : ?>
					<table style="width: 100%; border-collapse: collapse;">
			<?php foreach ( $fields as $field ) : ?>
							<tr>
								<td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; width: 30%;">
				<?php echo esc_html( $field['title'] ); ?>
								</td>
								<td style="padding: 8px 0; border-bottom: 1px solid #eee;">
				<?php
				$value = $field['value'];
				if ( preg_match( '/<([^|]+)\|([^>]+)>/', $value, $matches ) ) {
					echo '<a href="' . esc_url( $matches[1] ) . '">' . esc_html( $matches[2] ) . '</a>';
				} else {
					echo esc_html( $value );
				}
				?>
								</td>
							</tr>
			<?php endforeach; ?>
					</table>
		<?php endif; ?>

				<p style="margin-top: 20px; font-size: 12px; color: #666;">
		<?php
		printf(
		 /* translators: %s: site name */
			esc_html__( 'Sent by VIP Workflows on %s', 'vip-workflows' ),
			esc_html( get_bloginfo( 'name' ) )
		);
		?>
				</p>
			</div>
		</body>
		</html>
		<?php
		return ob_get_clean();
	}
}
