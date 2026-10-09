<?php
/**
 * Local wp-env only.
 *
 * The wp-env container has no working mail transport, so anything the plugin
 * tries to email (e.g. a reviewer's verification code) would vanish. This
 * mu-plugin short-circuits wp_mail() and writes the message to the debug log
 * instead, so a code can be read back with:
 *
 *     npx wp-env run cli tail /var/www/html/wp-content/debug.log
 *
 * It is never shipped or activated in production.
 *
 * @package shareadraft-wp-env
 */

add_filter(
	'pre_wp_mail',
	static function ( $short_circuit, array $atts ) {
		$to = is_array( $atts['to'] ?? '' ) ? implode( ', ', $atts['to'] ) : (string) ( $atts['to'] ?? '' );

		error_log(
			sprintf(
				"[mail-catcher] To: %s | Subject: %s | Body: %s",
				$to,
				(string) ( $atts['subject'] ?? '' ),
				str_replace( "\n", ' / ', (string) ( $atts['message'] ?? '' ) )
			)
		);

		// Report success so callers behave as if the mail was handed off.
		return true;
	},
	10,
	2
);
