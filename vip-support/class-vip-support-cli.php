<?php

use \WP_CLI_Command;
use \WP_User_Query;

/**
 * Implements a WP CLI command that converts guid users to meta users
 * Class command
 *
 * @package a8c\vip_support
 */
class WPCOM_VIP_Support_CLI  extends WP_CLI_Command {

	/**
	 * Marks the user with the provided ID as having a verified email.
	 *
	 *
	 * <user-id>
	 * : The WP User ID to mark as having a verified email address
	 *
	 * @subcommand verify
	 *
	 * ## EXAMPLES
	 *
	 *     wp vipsupport verify 99
	 *
	 */
	public function verify( $args, $assoc_args ) {

		$user_id = absint( $args[0] );
		if ( ! $user_id ) {
			\WP_CLI::error( "Please provide the ID of the user to verify" );
		}

		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) {
			\WP_CLI::error( "Could not find a user with ID $user_id" );
		}

		WPCOM_VIP_Support_User::init()->mark_user_email_verified( $user->user_id, $user->user_email );

		// Print a success message
		\WP_CLI::success( "Verified user $user_id with email {$user->user_email}, you can now change their role to VIP Support" );
	}

}

\WP_CLI::add_command( 'vipsupport', 'WPCOM_VIP_Support_CLI' );