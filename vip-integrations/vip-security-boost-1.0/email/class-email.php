<?php

namespace Automattic\VIP\Security\Email;

use Automattic\VIP\Security\Constants;
use Automattic\VIP\Security\Utils\Logger;
use function Automattic\VIP\Security\Utils\is_production_env;

class Email {
	/**
	 * Stores the arguments of the last call to the send() method for testing.
	 *
	 * @var array|null
	 */
	public static $last_call_args_for_test;

	const LOG_FEATURE_NAME    = 'sb_email';
	const SUBJECT_SUFFIX      = ' - WordPress VIP';
	const EMAIL_FROM          = 'donotreply@wpvip.com';
	const EMAIL_REPLY_TO      = 'support@wpvip.com';
	const CONTACT_SUPPORT_URL = 'mailto:support@wpvip.com';
	const DOCS_URL            = 'https://docs.wpvip.com/';

	/**
	 * Send an email.
	 *
	 * @param int $user_id The user ID
	 * @param string $subject The email subject
	 * @param string $template_id The email template ID
	 * @param array $template_data The data to replace in the email template
	 */
	public static function send( $user_id, $email_address, $subject, $template_id = 'generic', $template_data = [] ) {
		self::$last_call_args_for_test = compact( 'user_id', 'email_address', 'subject', 'template_id', 'template_data' );

		$user = get_user_by( 'id', $user_id );

		if ( ! is_email( $email_address ) ) {
			// Fall back to account email if billing email not set.
			$email_address = $user->user_email;
		}

		// Send email.
		$headers = [
			'from: WordPress VIP <' . self::EMAIL_FROM . '>',
			// Let's not set the reply-to header for now. Bouncing emails can cause too much noise for support.
			// 'reply-to: WordPress VIP <' . self::EMAIL_REPLY_TO . '>',
			'content-type: text/html; charset=UTF-8',
		];

		// Remove VIP filters that prevent emails from address being set.
		$email_from = self::EMAIL_FROM;

		$email_from_filter = function () use ( $email_from ) {
			return $email_from;
		};
		add_filter( 'wp_mail_from', $email_from_filter, 15 );

		// User name
		$user_name = get_user_meta( $user_id, 'user_name', true );

		// Prefix subject with environment so we can easily identify test emails.
		if ( ! is_production_env() ) {
			$subject = constant( 'VIP_GO_APP_ENVIRONMENT' ) . ' - ' . $subject;
		}

		// Fetch email template and replace variables.
		$template_data['subject'] = $subject;
		// If email_title is empty, use subject as default.
		if ( empty( $template_data['email_title'] ) ) {
			$template_data['email_title'] = $subject;
		}
		$template_data['site_url']          = home_url();
		$template_data['site_name']         = get_bloginfo( 'name' );
		$template_data['display_name']      = $user_name ?: $user->display_name;
		$template_data['date']              = gmdate( 'F j, Y' );
		$template_data['utc_time']          = gmdate( 'H:i \U\T\C' );
		$template_data['contactSupportUrl'] = self::CONTACT_SUPPORT_URL;
		$template_data['docsUrl']           = self::DOCS_URL;

		$email_content = self::parse_email_template( $template_id, $template_data );

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_mail_wp_mail
		$sent = wp_mail( $email_address, $subject, $email_content, $headers );

		if ( $sent ) {
			Logger::info(
				self::LOG_FEATURE_NAME,
				'Email sent to ' . $email_address
			);
		} else {
			Logger::error(
				self::LOG_FEATURE_NAME,
				'Email not sent to ' . $email_address
			);
		}
	}

	/**
	 * Get the email template.
	 *
	 * @return string The email template
	 */
	public static function get_email_template( $template_id ) {
		$template_path = plugin_dir_path( __FILE__ ) . '/templates/' . $template_id . '.html';

		// Check if the template exists.
		if ( ! file_exists( $template_path ) ) {
			Logger::error(
				self::LOG_FEATURE_NAME,
				'Email template not found',
				[
					'template_id' => $template_id,
				]
			);

			throw new \Exception( 'Email template not found' );
		}

		// phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
		return file_get_contents( $template_path );
	}

	/**
	 * Parse the email template.
	 *
	 * @param string $template_id The email template ID
	 * @param array $template_data The data to replace in the email template
	 *
	 * @return string The parsed email template
	 */
	public static function parse_email_template( $template_id, $template_data ) {
		$email_content = self::get_email_template( $template_id );

		foreach ( $template_data as $key => $value ) {
			// Add a prefix to the subject.
			if ( 'subject' === $key ) {
				$value = $value . self::SUBJECT_SUFFIX;
			}

			$email_content = self::replace_email_var( $key, $value, $email_content );
		}

		return $email_content;
	}

	/**
	 * Replace a variable in the email template.
	 *
	 * @param string $var The variable to replace
	 * @param string $value The value to replace with
	 * @param string $email The email template
	 *
	 * @return string The email template with the variable replaced
	 */
	public static function replace_email_var( string $var, string $value, string $email ) {
		return str_replace( '{{%=' . $var . '%}}', $value, $email );
	}

	/**
	 * Resets the last call arguments for testing purposes.
	 *
	 * @since NEXT_RELEASE
	 */
	public static function reset_last_call_args_for_test() {
		self::$last_call_args_for_test = null;
	}
}
