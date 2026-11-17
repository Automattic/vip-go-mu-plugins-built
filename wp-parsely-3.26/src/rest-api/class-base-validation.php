<?php
/**
 * Base Validation class for REST API parameters
 *
 * @package Parsely
 * @since 3.19.0
 */

declare(strict_types=1);

namespace Parsely\REST_API;

use WP_REST_Request;
use WP_Error;

/**
 * Base class for validating REST API parameters.
 *
 * @since 3.19.0
 */
abstract class Base_Validation {
	/**
	 * Validates a parameter.
	 *
	 * @since 3.19.0
	 *
	 * @param mixed           $param   The parameter value.
	 * @param WP_REST_Request $request The request object.
	 * @return true|WP_Error Whether the parameter is valid.
	 */
	abstract public static function validate( $param, WP_REST_Request $request );

	/**
	 * Sanitizes a parameter.
	 *
	 * If a sanitize method is not implemented, it will throw an exception.
	 *
	 * @since 3.19.0
	 *
	 * @throws \Exception The sanitize method is not implemented.
	 *
	 * @param mixed           $value   The value to sanitize.
	 * @param WP_REST_Request $request The request object.
	 * @param string          $param   The parameter name.
	 * @return mixed The sanitized value.
	 */
	public static function sanitize( $value, $request, $param ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		throw new \Exception( 'Trying to sanitize ' . esc_html( $param ) . ' parameter without a sanitize method.' );
	}
}
