<?php
/**
 * Class for validating the URL exclusion list parameter
 *
 * @package Parsely
 * @since 3.19.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Content_Helper\Validations;

use Parsely\REST_API\Base_Validation;
use WP_REST_Request;
use WP_Error;

/**
 * Class for validating the URL exclusion list parameter.
 *
 * @since 3.19.0
 */
class Validate_Url_Exclusion_List extends Base_Validation {
	/**
	 * Validates the URL exclusion list parameter.
	 *
	 * @since 3.17.0
	 * @since 3.19.0 Refactored to use the Base_Validation class.
	 *
	 * @param mixed           $param   The parameter value.
	 * @param WP_REST_Request $request The request object.
	 * @return true|WP_Error Whether the parameter is valid.
	 */
	public static function validate( $param, WP_REST_Request $request ) {
		if ( ! is_array( $param ) ) {
			return new WP_Error(
				'invalid_url_exclusion_list',
				__( 'The URL exclusion list must be an array.', 'wp-parsely' )
			);
		}

		return true;
	}

	/**
	 * Sanitizes the URL exclusion list parameter.
	 *
	 * @since 3.19.0
	 *
	 * @param mixed           $value   The value to sanitize.
	 * @param WP_REST_Request $request The request object.
	 * @param string          $param   The parameter name.
	 * @return array<string> The sanitized URL exclusion list.
	 */
	public static function sanitize( $value, $request, $param ) {
		if ( ! is_array( $value ) ) {
			return array();
		}

		return array_filter(
			$value,
			function ( $url ) {
				return is_string( $url ) && false !== filter_var( $url, FILTER_VALIDATE_URL );
			}
		);
	}
}
