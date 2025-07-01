<?php
namespace Automattic\VIP\Security\PrivilegedActivityNotifier;

use Automattic\VIP\Security\Email\Email;
use Automattic\VIP\Security\Constants;
use Automattic\VIP\Security\Utils\Logger;
use Automattic\VIP\Support_User\User as Support_User;

class Notify_Privileged_Activity {
	const LOG_FEATURE_NAME = 'sb_notify_privileged_activity';
	public static function init() {
		if ( is_multisite() ) {
			add_action( 'add_user_to_blog', [ __CLASS__, 'notify_admin_user_creation' ] );
		}


		// Also listen for user_register for WP-CLI generated users
		add_action( 'user_register', [ __CLASS__, 'notify_admin_user_creation' ] );

		add_action( 'set_user_role', [ __CLASS__, 'notify_user_promoted_to_admin' ], 10, 3 );

		// Notify when a user is granted Super Admin privileges on a multisite network.
		if ( is_multisite() ) {
			add_action( 'grant_super_admin', [ __CLASS__, 'notify_user_granted_super_admin' ], 10, 1 );
		}
	}

	/**
	 * Handle new user creation.
	 *
	 * @param int $user_id The ID of the newly registered user.
	 */
	public static function notify_admin_user_creation( $user_id ) {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return;
		}

		if ( in_array( 'administrator', (array) $user->roles, true ) ) {
			/* Translators: %s: Site name. */
			$subject = sprintf( __( '[%s] New Administrator Added', 'wpvip' ),
				get_bloginfo( 'name' )
			);
			/* translators: Email title for new admin notification */
			$email_title = __( 'New Administrator Added', 'wpvip' );

			self::send_notification( $user, $subject, $email_title, 'privileged-user-created' );
		}
	}

	/**
	 * Handle user promotion to administrator.
	 *
	 * @param int    $user_id   The user ID.
	 * @param string $new_role  The new role.
	 * @param array  $old_roles An array of the user's previous roles.
	 */
	public static function notify_user_promoted_to_admin( $user_id, $new_role, $old_roles ) {
		// Don't send a notification if the user is being created (empty roles), or if they are already an administrator.
		if ( empty( $old_roles ) || 'administrator' !== $new_role || in_array( 'administrator', $old_roles, true ) ) {
			return;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return;
		}

		/* Translators: %s: Site name. */
		$subject = sprintf( __( '[%s] User Promoted to Administrator', 'wpvip' ),
			get_bloginfo( 'name' )
		);
		/* translators: Email title for admin promotion notification */
		$email_title = __( 'User Promoted to Administrator', 'wpvip' );

		self::send_notification( $user, $subject, $email_title, 'privileged-user-promoted' );
	}

	/**
	 * Handle user being granted Super Administrator privileges (network-wide).
	 *
	 * Fired only on multisite networks.
	 *
	 * @param int $user_id The user ID.
	 */
	public static function notify_user_granted_super_admin( $user_id ) {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return;
		}

		$network_name = get_network()->site_name;
		if ( empty( $network_name ) ) {
			$network_name = get_bloginfo( 'name' );
		}
		/* Translators: %s: Network name. */
		$subject = sprintf( __( '[%s] User Granted Super Admin Privileges', 'wpvip' ), $network_name );
		/* translators: Email title for super admin grant notification */
		$email_title = __( 'User Granted Super Admin Privileges', 'wpvip' );

		self::send_notification( $user, $subject, $email_title, 'privileged-super-admin-granted' );
	}

	/**
	 * Send the notification email.
	 *
	 * @param \WP_User $user    The user object.
	 * @param string   $subject The email subject.
	 */
	private static function send_notification( $user, $subject, $email_title, $template ) {
		// Skip notification for VIP Support users
		if ( class_exists( Support_User::class ) && Support_User::user_has_vip_support_role( $user->ID ) ) {
			Logger::info(
				self::LOG_FEATURE_NAME,
				'Skipping notification for VIP Support user: ' . $user->ID
			);
			return;
		}

		try {
			$admin_email = get_option( 'admin_email' );

			if ( empty( $admin_email ) || ! is_email( $admin_email ) ) {
				return;
			}

			Logger::info(
				self::LOG_FEATURE_NAME,
				'User granted privileged roles (notification type: ' . $template . ') user: ' . $user->user_login
			);
			$params = [
				'user_login'  => $user->user_login,
				'user_email'  => $user->user_email,
				'user_role'   => 'privileged-super-admin-granted' === $template ? 'Super Administrator' : 'Administrator',
				'email_title' => $email_title,
				'admin_url'   => admin_url(),
			];

			if ( is_multisite() ) {
				$params['network_admin_url'] = network_admin_url();
			}
			Email::send( $user->ID, $admin_email, $subject, $template, $params );

			// Track successful email notification
			do_action( 'vip_security_privileged_email_sent', $template, 'administrator' );
		} catch ( \Exception $e ) {
			Logger::error(
				self::LOG_FEATURE_NAME,
				'Failed to notify admin user creation (type: ' . $template . ') user: ' . $user->user_login . ' - error: ' . $e->getMessage()
			);
		}
	}
}


Notify_Privileged_Activity::init();
