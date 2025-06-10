<?php
namespace Automattic\VIP\Security\PrivilegedActivityNotifier;

use Automattic\VIP\Security\Email\Email;

class Notify_Privileged_Activity {
	public static function init() {
		if ( is_multisite() ) {
			add_action( 'add_user_to_blog', [ __CLASS__, 'notify_admin_user_creation' ] );
		} else {
			add_action( 'user_register', [ __CLASS__, 'notify_admin_user_creation' ] );
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
			$admin_email = get_option( 'admin_email' );

			if ( empty( $admin_email ) || ! is_email( $admin_email ) ) {
				return;
			}

			/* Translators: %s: Site name. */
			$subject = sprintf( __( '[%s] New Administrator User Created', 'wpvip' ),
				get_bloginfo( 'name' )
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
