<?php
/**
 * Validator class
 *
 * @package Parsely
 * @since   3.9.0
 */

declare(strict_types=1);

namespace Parsely;

/**
 * Contains a variety of validation functions.
 *
 * @since 3.9.0
 */
class Validator {
	/**
	 * Validates the passed Site ID.
	 *
	 * Accepts a www prefix and up to 3 periods.
	 *
	 * Valid examples: 'test.com', 'www.test.com', 'subdomain.test.com',
	 * 'www.subdomain.test.com', 'subdomain.subdomain.test.com'.
	 *
	 * Invalid examples: 'test', 'test.com/', 'http://test.com', 'https://test.com',
	 * 'www.subdomain.subdomain.test.com'.
	 *
	 * @since 3.3.0
	 * @since 3.9.0 Moved to Validator class.
	 *
	 * @param string $site_id The Site ID to be validated.
	 * @return bool
	 */
	public static function validate_site_id( string $site_id ): bool {
		$key_format = '/^((\w+)\.)?(([\w-]+)?)(\.[\w-]+){1,2}$/';

		return 1 === preg_match( $key_format, $site_id );
	}

	/**
	 * Validates the passed API Secret.
	 *
	 * Currently, the API Secret is considered valid if it is longer than 30
	 * characters.
	 *
	 * @since 3.9.0
	 *
	 * @param string $api_secret The API Secret to be validated.
	 * @return bool True if the API Secret is valid, false otherwise.
	 */
	public static function validate_api_secret( string $api_secret ): bool {
		return strlen( $api_secret ) > 30;
	}

	/**
	 * Validates the passed Metadata Secret.
	 *
	 * Currently, the Metadata Secret is considered valid if it is exactly 10
	 * characters.
	 *
	 * @since 3.9.0
	 *
	 * @param string $metadata_secret The Metadata Secret to be validated.
	 * @return bool True if the Metadata Secret is valid, false otherwise.
	 */
	public static function validate_metadata_secret( string $metadata_secret ): bool {
		return strlen( $metadata_secret ) === 10;
	}
}
