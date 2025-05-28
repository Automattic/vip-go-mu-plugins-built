<?php
namespace Automattic\VIP\Security\PrivilegedActivityNotifier;

use Automattic\VIP\Security\Email\Email;

class Notify_Privileged_Activity {
	public static function init() {
		add_action( 'user_register', [ __CLASS__, 'notify_admin_user_creation' ] );
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
			$admin_email = get_option( 'admin_email' );

			if ( empty( $admin_email ) || ! is_email( $admin_email ) ) {
				return;
			}

			/* Translators: %s: Site name. */
			$subject = sprintf( __( '[%s] New Administrator User Created', 'wpvip' ),
				get_bloginfo( 'name' )
			);

			$message = sprintf(
				/* Translators: %1$s is the username, %2$s is the user email. */
				__( 'A new user with administrator privileges has been created:\nUsername: %1$s\nEmail: %2$s', 'wpvip' ),
				$user->user_login,
				$user->user_email
			);

			Email::send( $user_id, $admin_email, $subject, 'privileged-user-created', [
				'user_login' => $user->user_login,
				'user_email' => $user->user_email,
				'user_role'  => 'Administrator',
				'admin_url'  => admin_url(),
			] );
		}
	}
}


Notify_Privileged_Activity::init();
