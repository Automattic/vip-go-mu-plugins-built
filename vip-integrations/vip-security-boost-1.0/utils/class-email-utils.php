<?php
namespace Automattic\VIP\Security\Utils;

use Automattic\VIP\Security\Constants;

class Email_Utils {
	/** Extract lowercase domain from a valid email; null if invalid */
	public static function domain( $email ): ?string {
		if ( ! is_string( $email ) ) {
			return null;
		}
		$normalized = strtolower( trim( $email ) );
		if ( ! is_email( $normalized ) ) {
			return null;
		}
		// phpcs:ignore Squiz.PHP.CommentedOutCode.Found
		$part = strrchr( $normalized, '@' ); // "@domain" or false
		if ( false === $part ) {
			return null;
		}
		return substr( $part, 1 ); // strip leading "@"
	}
}
