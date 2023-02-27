<?php
/**
 * Util Functions.
 *
 * To enforce typing on commonly used functions.
 *
 * @package Parsely
 * @since   3.7.0
 */

declare(strict_types=1);

namespace Parsely\Utils;

use NumberFormatter;
use WP_Post;
use WP_Error;

const DATE_UTC_FORMAT     = 'Y-m-d';
const WP_DATE_TIME_FORMAT = 'Y-m-d H:i:s';

/**
 * Gets UTC Date.
 *
 * @since 3.7.0
 *
 * @param int $days Number of days before or after the current date.
 *
 * @return string
 */
function get_utc_date_format( int $days = 0 ): string {
	if ( 0 === $days ) {
		return gmdate( DATE_UTC_FORMAT );
	}

	return gmdate( DATE_UTC_FORMAT, (int) strtotime( "{$days} days" ) );
}

/**
 * Gets default category.
 *
 * @since 3.7.0
 *
 * @return int
 */
function get_default_category(): int {
	/**
	 * Variable.
	 *
	 * @var string
	 */
	$default_category = get_option( 'default_category' );

	return (int) $default_category;
}

/**
 * Gets option `page_for_posts`.
 *
 * @since 3.7.0
 *
 * @param bool $default Default Value.
 *
 * @return int|WP_Post
 */
function get_page_for_posts( $default = false ) {
	/**
	 * Variable.
	 *
	 * @var int|WP_Post
	 */
	return get_option( 'page_for_posts', $default );
}

/**
 * Gets option `page_on_front`.
 *
 * @since 3.7.0
 *
 * @return bool
 */
function get_page_on_front() {
	/**
	 * Variable.
	 *
	 * @var bool
	 */
	return get_option( 'page_on_front' );
}

/**
 * Gets 'string' query variable from WP_Query class.
 *
 * @since 3.7.0
 *
 * @param string $var Variable key to retrieve.
 *
 * @return string
 */
function get_string_query_var( $var ): string {
	/**
	 * Variable.
	 *
	 * @var string
	 */
	return get_query_var( $var );
}

/**
 * Gets 'int' query variable from WP_Query class.
 *
 * @since 3.7.0
 *
 * @param string $var Variable key to retrieve.
 *
 * @return int
 */
function get_int_query_var( $var ): int {
	/**
	 * Variable.
	 *
	 * @var int
	 */
	return get_query_var( $var );
}

/**
 * Gets site date format.
 *
 * @since 3.7.0
 */
function get_date_format(): string {
	/**
	 * Variable.
	 *
	 * @var string
	 */
	return get_option( 'date_format' );
}

/**
 * Gets site time format.
 *
 * @since 3.7.0
 */
function get_time_format(): string {
	/**
	 * Variable.
	 *
	 * @var string
	 */
	return get_option( 'time_format' );
}

/**
 * Gets number in formatted form i.e. express bigger numbers in form of thousands (K), millions (M), billions (B).
 *
 * Example:
 *   - Represent 10000 as 10K.
 *
 * @since 3.7.0
 *
 * @param int|float $number Number that we have to format.
 *
 * @return string
 */
function get_formatted_number( $number ): string {
	$number_formatter = new NumberFormatter( 'en_US', NumberFormatter::PADDING_POSITION );
	$formatted_number = $number_formatter->format( $number );

	if ( false === $formatted_number ) {
		return '';
	}

	return $formatted_number;
}

/**
 * Gets time in formatted form.
 *
 * Example:
 *   - Input `1000` (seconds) and Output `16:40` which represents "16 minutes, 40 seconds”
 *
 * @since 3.7.0
 *
 * @param int|float $seconds Time in seconds that we have to format.
 *
 * @return string
 */
function get_formatted_time( $seconds ): string {
	$time_formatter = new NumberFormatter( 'en_US', NumberFormatter::DURATION );
	$formatted_time = $time_formatter->format( $seconds );

	if ( false === $formatted_time ) {
		return '';
	}

	return $formatted_time;
}

/**
 * Converts to associate array.
 *
 * @since 3.7.0
 *
 * @param mixed $obj Input object.
 *
 * @return array<string, mixed>|WP_Error
 */
function convert_to_associative_array( $obj ) {
	$encoded = wp_json_encode( $obj );

	if ( false === $encoded ) {
		return new WP_Error( 'parsely_encoding_failed', __( 'Unable to encode API response for associative array', 'wp-parsely' ) );
	}

	/**
	 * Variable.
	 *
	 * @var array<string, mixed>
	 */
	return json_decode( $encoded, true );
}

/**
 * Converts a string to a positive integer, removing any non-numeric
 * characters.
 *
 * @param string $string The string to be converted to an integer.
 * @return int The integer resulting from the conversion.
 */
function convert_to_positive_integer( string $string ): int {
	return (int) preg_replace( '/\D/', '', $string );
}

/**
 * Converts endpoint to filter key by replacing `/` with `_`.
 *
 * @param string $endpoint Route of the endpoint.
 *
 * @since 3.7.0
 *
 * @return string
 */
function convert_endpoint_to_filter_key( string $endpoint ): string {
	return trim( str_replace( '/', '_', $endpoint ), '_' );
}
