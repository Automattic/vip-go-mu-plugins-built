<?php
/**
 * Class for validating the blending weight parameter
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
 * Class for validating the blending weight parameter.
 *
 * @since 3.19.0
 */
class Validate_Blending_Weight extends Base_Validation {
	/**
	 * Validates the blending weight parameter.
	 *
	 * @since 3.19.0
	 *
	 * @param mixed           $param   The parameter value.
	 * @param WP_REST_Request $request The request object.
	 * @return true|WP_Error Whether the parameter is valid.
	 */
	public static function validate( $param, WP_REST_Request $request ) {
		if ( ! is_numeric( $param ) ) {
			return new WP_Error(
				'invalid_blending_weight_type',
				__( 'The blending weight must be a number.', 'wp-parsely' )
			);
		}

		/** @var float $param The blending weight parameter. */
		if ( $param < 0.0 || $param > 1.0 ) {
			return new WP_Error(
				'invalid_blending_weight_range',
				__( 'The blending weight must be between 0 and 1.', 'wp-parsely' )
			);
		}

		return true;
	}
}
