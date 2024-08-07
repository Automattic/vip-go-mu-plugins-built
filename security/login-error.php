<?php
namespace Automattic\VIP\Security;

use WP_Error;

/**
 * Use a login message that does not reveal the type of login error in an attempted brute-force.
 *
 * @param string $error Login error message.
 *
 * @return string $error Login error message.
 *
 * @since 1.1
 */
function use_ambiguous_login_error( $error ): string {
	global $errors;

	if ( ! is_wp_error( $errors ) ) {
		return (string) $error;
	}

	$err_codes = $errors->get_error_codes();

	$err_types = [
		'invalid_username',
		'invalid_email',
		'incorrect_password',
		'invalidcombo',
	];

	foreach ( $err_types as $err ) {
		if ( in_array( $err, $err_codes, true ) ) {
			$error = '<strong>' . esc_html__( 'Error', 'vip' ) . '</strong>: ' .
			esc_html__( 'The username/email address or password is incorrect. Please try again.', 'vip' );
			break;
		}
	}

	return (string) $error;
}
add_filter( 'login_errors', __NAMESPACE__ . '\use_ambiguous_login_error', 99, 1 );

function use_ambiguous_password_reset_confirmation( $errors ) {
	if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'POST' === $_SERVER['REQUEST_METHOD'] && is_wp_error( $errors ) && $errors->has_errors() && ! headers_sent() ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$redirect_to = ! empty( $_REQUEST['redirect_to'] ) ? $_REQUEST['redirect_to'] : 'wp-login.php?checkemail=confirm';
		wp_safe_redirect( $redirect_to );
		exit();
	}
}

add_action( 'lost_password', __NAMESPACE__ . '\\use_ambiguous_password_reset_confirmation', 0 );

/**
 * Use a message that does not reveal the type of login error in an attempted brute-force on forget password.
 *
 * @param WP_Error $errors WP Error object.
 *
 * @return WP_Error $errors WP Error object.
 *
 * @since 1.1
 */
function use_ambiguous_confirmation( $errors ): WP_Error {
	if ( isset( $_GET['checkemail'] ) && 'confirm' === $_GET['checkemail'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$messages = $errors->get_error_messages( 'confirm' );
		if ( ! empty( $messages ) ) {
			$errors->remove( 'confirm' );
			$errors->add(
				'confirm',
				esc_html__( 'If there is an account associated with the username/email address, you will receive an email with a link to reset your password.', 'vip' ),
				'message'
			);
		}
	}

	return $errors;
}
add_filter( 'wp_login_errors', __NAMESPACE__ . '\use_ambiguous_confirmation', 99 );
