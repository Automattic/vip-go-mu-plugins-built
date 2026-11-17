<?php
/**
 * Utils Class.
 *
 * To enforce typing on commonly used functions.
 *
 * @package Parsely
 * @since   3.7.0
 * @since   3.17.0 Refactored to a class.
 */

declare(strict_types=1);

namespace Parsely\Utils;

use WP_Post;
use WP_Error;

use const Parsely\PARSELY_CACHE_GROUP;
use const Parsely\PARSELY_FILE;

/**
 * Utils Class.
 *
 * @since 3.17.0
 *
 * @phpstan-type ItmParams array{
 *     campaign: string,
 *     source?: string,
 *     medium?: string,
 *     content?: string,
 *     term?: string,
 * }
 */
class Utils {
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
	public static function get_utc_date_format( int $days = 0 ): string {
		if ( 0 === $days ) {
			return gmdate( self::DATE_UTC_FORMAT );
		}

		return gmdate( self::DATE_UTC_FORMAT, (int) strtotime( "{$days} days" ) );
	}

	/**
	 * Gets default category.
	 *
	 * @since 3.7.0
	 *
	 * @return int
	 */
	public static function get_default_category(): int {
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
	 * @param bool $default_value Default Value.
	 *
	 * @return int|WP_Post
	 */
	public static function get_page_for_posts( bool $default_value = false ) {
		/**
		 * Variable.
		 *
		 * @var int|WP_Post
		 */
		return get_option( 'page_for_posts', $default_value );
	}

	/**
	 * Gets option `page_on_front`.
	 *
	 * @since 3.7.0
	 *
	 * @return bool
	 */
	public static function get_page_on_front(): bool {
		/**
		 * Variable.
		 *
		 * @var bool
		 */
		return (bool) get_option( 'page_on_front' );
	}

	/**
	 * Gets 'string' query variable from WP_Query class.
	 *
	 * @since 3.7.0
	 *
	 * @param string $key Variable key to retrieve.
	 *
	 * @return string
	 */
	public static function get_string_query_var( string $key ): string {
		/**
		 * Variable.
		 *
		 * @var string
		 */
		return get_query_var( $key );
	}

	/**
	 * Gets site date format.
	 *
	 * @since 3.7.0
	 *
	 * @return string
	 */
	public static function get_date_format(): string {
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
	 *
	 * @return string
	 */
	public static function get_time_format(): string {
		/**
		 * Variable.
		 *
		 * @var string
		 */
		return get_option( 'time_format' );
	}

	/**
	 * Returns the current time's timestamp.
	 *
	 * @since 3.12.0
	 *
	 * @return string
	 */
	public static function get_timestamp(): string {
		$timestamp = round( microtime( true ) * 1000 );
		return number_format( $timestamp, 0, '', '' );
	}

	/**
	 * Gets number in formatted form i.e. express bigger numbers in form of
	 * thousands (k), millions (M), billions (B).
	 *
	 * Note: This function is not made to process float numbers, and it is a PHP
	 * port of our formatToImpreciseNumber() TypeScript function.
	 *
	 * Example:
	 *   - Represent 10000 as 10K.
	 *
	 * @since 3.7.0
	 *
	 * @param string $value           The number to process. It can be formatted.
	 * @param int    $fraction_digits The number of desired fraction digits.
	 * @param string $glue            A string to put between the number and unit.
	 *
	 * @return string The number formatted as an imprecise number.
	 */
	public static function get_formatted_number( string $value, int $fraction_digits = 1, string $glue = '' ): string {
		$number = (int) preg_replace( '/\D/', '', $value );

		if ( $number < 1000 ) {
			return $value;
		} elseif ( $number < 10000 ) {
			$fraction_digits = 1;
		}

		$unit_names               = array(
			'1000'             => 'k',
			'1000000'          => 'M',
			'1000000000'       => 'B',
			'1000000000000'    => 'T',
			'1000000000000000' => 'Q',
		);
		$current_number           = $number;
		$current_number_as_string = (string) $number;
		$unit                     = '';
		$previous_number          = 0;

		foreach ( $unit_names as $thousands => $suffix ) {
			$thousands_int = (int) preg_replace( '/\D/', '', (string) $thousands );

			if ( $number >= $thousands_int ) {
				$current_number = $number / $thousands_int;
				$precision      = $fraction_digits;

				// For over 10 units, we reduce the precision to 1 fraction digit.
				$modulo = (int) fmod( $current_number, 1 );
				if ( 0 !== $previous_number && $modulo > 1 / $previous_number ) {
					$precision = $current_number > 10 ? 1 : 2;
				}

				// Precision override, where we want to show 2 fraction digits.
				$zeroes                   = floatval( number_format( $current_number, 2 ) ) === floatval( number_format( $current_number, 0 ) );
				$precision                = $zeroes ? 0 : $precision;
				$current_number_as_string = number_format( $current_number, $precision, '.', '' );
				$unit                     = $suffix;
			}

			$previous_number = $current_number;
		}

		return $current_number_as_string . $glue . $unit;
	}

	/**
	 * Gets time in formatted form.
	 *
	 * Example:
	 *   - Input `1000` (seconds) and Output `16:40` which represents "16 minutes, 40 seconds”
	 *
	 * @since 3.7.0
	 *
	 * @param float $seconds Time in seconds to be formatted.
	 *
	 * @return string
	 */
	public static function get_formatted_time( $seconds ): string {
		$seconds = round( $seconds );
		$hours   = floor( $seconds / 3600 );

		if ( $hours >= 1 ) {
			$seconds = $seconds - ( $hours * 3600 );
			$minutes = floor( $seconds / 60 );
			$seconds = round( $seconds % 60 );

			return esc_html(
				sprintf(
				/* translators: 1: Number of hours 2: Number of minutes 3: Number of seconds */
					__( '%1$d:%2$02d:%3$02d', 'wp-parsely' ),
					$hours,
					$minutes,
					$seconds
				)
			);
		}

		$minutes = floor( $seconds / 60 );
		$seconds = round( $seconds % 60 );

		if ( $minutes >= 1 ) {
			return esc_html(
				sprintf(
				/* translators: 1: Number of minutes 2: Number of seconds */
					__( '%1$d:%2$02d', 'wp-parsely' ),
					$minutes,
					$seconds
				)
			);
		}

		return esc_html(
			sprintf(
			/* translators: 1: Number of seconds */
				__( '%1$ds', 'wp-parsely' ),
				round( $seconds )
			)
		);
	}

	/**
	 * Returns the passed float as a time duration in m:ss format.
	 *
	 * Examples:
	 *   - $time of 1.005 yields '1:00'.
	 *   - $time of 1.5 yields '1:30'.
	 *   - $time of 1.999 yields '2:00'.
	 *
	 * @since 3.6.0
	 *
	 * @param float $time The time as a float number.
	 *
	 * @return string The resulting formatted time duration.
	 */
	public static function get_formatted_duration( float $time ): string {
		$minutes = absint( $time );
		$seconds = absint( round( fmod( $time, 1 ) * 60 ) );

		if ( 60 === $seconds ) {
			++$minutes;
			$seconds = 0;
		}

		return sprintf( '%d:%02d', $minutes, $seconds );
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
	public static function convert_to_associative_array( $obj ) {
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
	 * @param string $value The string to be converted to an integer.
	 * @return int The integer resulting from the conversion.
	 */
	public static function convert_to_positive_integer( string $value ): int {
		return (int) preg_replace( '/\D/', '', $value );
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
	public static function convert_endpoint_to_filter_key( string $endpoint ): string {
		return trim( str_replace( array( '-', '/' ), '_', $endpoint ), '_' );
	}

	/**
	 * Gets content of asset file.
	 *
	 * @param string $path Path of the asset file.
	 *
	 * @since 3.8.0
	 *
	 * @return Asset_Info
	 */
	public static function get_asset_info( string $path ) {
		return require plugin_dir_path( PARSELY_FILE ) . $path;
	}

	/**
	 * Checks if a string starts with a specific substring.
	 *
	 * This function uses the built-in PHP function `str_starts_with` if it's available (PHP 8.0 and later).
	 * If the function is not available (PHP versions prior to 8.0), it uses the `strpos` function as a fallback.
	 *
	 * @since 3.13.0
	 *
	 * @param string $haystack The string to search in.
	 * @param string $needle The substring to search for at the start of $haystack.
	 * @return bool Returns true if $haystack starts with $needle, false otherwise.
	 */
	public static function str_starts_with( string $haystack, string $needle ): bool {
		if ( function_exists( '\str_starts_with' ) ) {
			return \str_starts_with( $haystack, $needle );
		}
		return 0 === strpos( $haystack, $needle );
	}

	/**
	 * Checks if HTTPS is supported for the site.
	 *
	 * This function checks if the WordPress function 'wp_is_using_https' exists and uses it to determine if
	 * HTTPS is supported.
	 * If the function does not exist, it checks if the home URL scheme is HTTPS.
	 * If neither of the above conditions are met, it checks if the site URL option scheme is HTTPS.
	 *
	 * @since 3.14.1
	 *
	 * @return bool Returns true if HTTPS is supported, false otherwise.
	 */
	public static function parsely_is_https_supported(): bool {
		if ( function_exists( 'wp_is_using_https' ) ) {
			return wp_is_using_https();
		}

		if ( 'https' === wp_parse_url( home_url(), PHP_URL_SCHEME ) ) {
			return true;
		}

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
		$site_url = apply_filters( 'site_url', get_option( 'siteurl' ), '', null, null );
		return 'https' === wp_parse_url( $site_url, PHP_URL_SCHEME );
	}

	/**
	 * Returns the post ID for the passed URL.
	 *
	 * Posts the current user can neither view publicly nor read resolve to 0.
	 *
	 * @since 3.16.0
	 * @since 3.18.0 Moved from `Models/class-smart-link.php`.
	 * @since 3.24.2 Resolves only to posts visible to the current user, and
	 *               matches slugs only of this site's URLs, unambiguously.
	 *
	 * @param string $url The URL to get the post ID for.
	 * @return int The post ID of the URL, 0 if not found.
	 */
	public static function get_post_id_by_url( string $url ): int {
		$cache_key = sprintf( 'url-to-postid-%s', hash( 'sha256', $url ) );
		$cache     = wp_cache_get( $cache_key, PARSELY_CACHE_GROUP );

		if ( false !== $cache && is_numeric( $cache ) ) {
			return self::get_visible_post_id( (int) $cache );
		}

		if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			$post_id = wpcom_vip_url_to_postid( $url );
		} else {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
			$post_id = url_to_postid( $url );
			wp_cache_set( $cache_key, $post_id, PARSELY_CACHE_GROUP, WEEK_IN_SECONDS );
		}

		// A post ID was found, return it.
		if ( 0 !== $post_id ) {
			return self::get_visible_post_id( $post_id );
		}

		// A slug can only identify a post in this site's URLs.
		if ( ! self::is_site_url( $url ) ) {
			return 0;
		}

		// No post ID was found, try to find it from the slug.
		$clean_url = preg_replace( '/\?.*$/', '', $url ); // Remove the query string from the URL.
		if ( null === $clean_url ) {
			$clean_url = $url;
		}
		$post_slug = basename( $clean_url );

		// Public posts take precedence over other posts with the same slug.
		$post_ids = array_values(
			array_filter(
				self::get_top_level_post_ids_by_slug( $post_slug, array( 'publish', 'inherit' ) ),
				'is_post_publicly_viewable'
			)
		);

		// Visibility is checked on return, so the resolution can be cached for all users.
		if ( 0 === count( $post_ids ) ) {
			$post_ids = self::get_top_level_post_ids_by_slug( $post_slug, array( 'any' ) );
		}

		// A slug shared by several posts identifies none of them.
		if ( 1 === count( $post_ids ) ) {
			wp_cache_set( $cache_key, $post_ids[0], PARSELY_CACHE_GROUP, WEEK_IN_SECONDS );
			return self::get_visible_post_id( $post_ids[0] );
		}

		return 0;
	}

	/**
	 * Returns up to 2 IDs of top-level posts of public post types with the
	 * passed slug, enough to tell whether the slug is ambiguous.
	 *
	 * Like get_page_by_path() given a single slug, child posts don't match.
	 *
	 * @since 3.24.2
	 *
	 * @param string        $slug          The post slug.
	 * @param array<string> $post_statuses The post statuses to match.
	 * @return array<int> The post IDs.
	 */
	private static function get_top_level_post_ids_by_slug( string $slug, array $post_statuses ): array {
		$public_post_types = get_post_types(
			array(
				'public'       => true,
				'show_in_rest' => true,
			)
		);

		$query = new \WP_Query(
			array(
				'name'           => $slug,
				'post_type'      => array_keys( $public_post_types ),
				'post_status'    => $post_statuses,
				'post_parent'    => 0,
				'fields'         => 'ids',
				'posts_per_page' => 2,
				'no_found_rows'  => true,
			)
		);

		$post_ids = array();
		foreach ( $query->posts as $post_id ) {
			if ( is_int( $post_id ) ) {
				$post_ids[] = $post_id;
			}
		}

		return $post_ids;
	}

	/**
	 * Returns the passed post ID, or 0 if the current user can neither view
	 * the post publicly nor read it.
	 *
	 * @since 3.24.2
	 *
	 * @param int $post_id The post ID.
	 * @return int The post ID, or 0.
	 */
	private static function get_visible_post_id( int $post_id ): int {
		if ( is_post_publicly_viewable( $post_id ) || current_user_can( 'read_post', $post_id ) ) {
			return $post_id;
		}

		return 0;
	}

	/**
	 * Returns whether the passed URL is relative, or has the host of the home
	 * URL, the site URL, the Site ID or the canonical URL domain.
	 *
	 * A leading `www.` is ignored, as `url_to_postid()` does.
	 *
	 * @since 3.24.2
	 *
	 * @param string $url The URL to check.
	 * @return bool Whether the URL belongs to this site.
	 */
	private static function is_site_url( string $url ): bool {
		$url_host = wp_parse_url( $url, PHP_URL_HOST );

		if ( ! is_string( $url_host ) ) {
			return true;
		}

		$site_addresses = array(
			home_url(),
			site_url(),
			\Parsely\get_parsely()->get_site_id(),
			apply_filters( 'wp_parsely_canonical_url_domain', null ),
		);

		foreach ( $site_addresses as $site_address ) {
			if ( ! is_string( $site_address ) || '' === trim( $site_address ) ) {
				continue;
			}

			// Domain-only addresses need a scheme to be parsed.
			$site_host = wp_parse_url(
				'http://' . preg_replace( '#^https?://#i', '', trim( $site_address ) ),
				PHP_URL_HOST
			);

			if ( is_string( $site_host ) && self::strip_www( $site_host ) === self::strip_www( $url_host ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Lowercases a host and removes its leading `www.`.
	 *
	 * @since 3.24.2
	 *
	 * @param string $host The host.
	 * @return string The host, without its leading `www.`.
	 */
	private static function strip_www( string $host ): string {
		return (string) preg_replace( '/^www\./', '', strtolower( $host ) );
	}

	/**
	 * Appends ITM parameters to a URL.
	 *
	 * @since 3.19.0
	 *
	 * @param string    $url The URL to append the ITM parameters to.
	 * @param ItmParams $params The ITM parameters to append.
	 * @return string The URL with the ITM parameters appended.
	 */
	public static function append_itm_params( string $url, $params ): string {
		// Convert the params array to the correct format.
		$mapping = array(
			'campaign' => 'itm_campaign',
			'source'   => 'itm_source',
			'medium'   => 'itm_medium',
			'content'  => 'itm_content',
			'term'     => 'itm_term',
		);

		$itm_params = array();
		foreach ( $params as $key => $value ) {
			if ( array_key_exists( $key, $mapping ) ) {
				$itm_params[ $mapping[ $key ] ] = $value;
			}
		}

		return add_query_arg( $itm_params, $url );
	}
}
