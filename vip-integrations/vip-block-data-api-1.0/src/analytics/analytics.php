<?php
/**
 * Analytics for the Block Data API.
 * 
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi;

defined( 'ABSPATH' ) || die();

/**
 * Analytics Class that will be used to send data to the WP Pixel.
 */
class Analytics {
	/**
	 * Array of analytics to send to the WP Pixel.
	 * 
	 * @var array
	 */
	private static $analytics_to_send = [];

	/**
	 * Initialize the Analytics class.
	 * 
	 * @access private
	 */
	public static function init() {
		add_action( 'shutdown', [ __CLASS__, 'send_analytics' ] );
	}

	/**
	 * Record the usage of the plugin, for VIP sites only. For non-VIP sites, this is a no-op.
	 * 
	 * This is done based on our sampling algorithm.
	 * 
	 * @return void
	 */
	public static function record_usage() {
		// Record usage on WPVIP sites only, and only when it matches the sampling time.
		if ( self::is_wpvip_site() && self::is_it_sampling_time() ) {
			self::$analytics_to_send[ WPCOMVIP__BLOCK_DATA_API__STAT_NAME__USAGE ] = constant( 'FILES_CLIENT_SITE_ID' );
		}
	}

	/**
	 * Record an error if it's allowed, for VIP sites only. For non-VIP sites, this is a no-op.
	 * 
	 * @param WP_Error $error Error to record.
	 *
	 * @return void
	 */
	public static function record_error( $error ) {
		$error_data    = $error->get_error_data();
		$error_details = isset( $error_data['details'] ) ? sprintf( ' - %s', ( $error_data['details'] ) ) : '';

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		trigger_error( sprintf( 'vip-block-data-api (%s): %s - %s%s', WPCOMVIP__BLOCK_DATA_API__PLUGIN_VERSION, $error->get_error_code(), $error->get_error_message(), $error_details ), E_USER_WARNING );

		$is_skippable_error_for_analytics = in_array( $error->get_error_code(), [
			'vip-block-data-api-no-blocks',
		] );

		if ( self::is_wpvip_site() && ! $is_skippable_error_for_analytics ) {
			// Record error data from WPVIP for follow-up.
			self::$analytics_to_send[ WPCOMVIP__BLOCK_DATA_API__STAT_NAME__ERROR ] = constant( 'FILES_CLIENT_SITE_ID' );
		}
	}

	/**
	 * Send the analytics, if present. If an error is present, then usage analytics are not sent. 
	 * 
	 * @return void
	 */
	public static function send_analytics() {
		if ( empty( self::$analytics_to_send ) ) {
			return;
		}

		$has_usage_analytics = isset( self::$analytics_to_send[ WPCOMVIP__BLOCK_DATA_API__STAT_NAME__USAGE ] );
		$has_error_analytics = isset( self::$analytics_to_send[ WPCOMVIP__BLOCK_DATA_API__STAT_NAME__ERROR ] );

		if ( $has_usage_analytics && $has_error_analytics ) {
			// Do not send usage analytics when errors are present.
			unset( self::$analytics_to_send[ WPCOMVIP__BLOCK_DATA_API__STAT_NAME__USAGE ] );
		}

		// Use built-in VIP mu-plugins method to send analytics to VIP Stats, if present.
		if ( function_exists( '\Automattic\VIP\Stats\send_pixel' ) ) {
			\Automattic\VIP\Stats\send_pixel( self::$analytics_to_send );
		}
	}

	/**
	 * Check if the site is a WPVIP site.
	 * 
	 * @return bool true if it is a WPVIP site, false otherwise
	 */
	private static function is_wpvip_site() {
		return defined( 'WPCOM_IS_VIP_ENV' ) && constant( 'WPCOM_IS_VIP_ENV' ) === true
			&& defined( 'WPCOM_SANDBOXED' ) && constant( 'WPCOM_SANDBOXED' ) === false
			&& defined( 'FILES_CLIENT_SITE_ID' )
			&& function_exists( '\Automattic\VIP\Stats\send_pixel' );
	}

	/**
	 * Check if the current request should be sampled for analytics.
	 * 
	 * Current sampling algorithm is that every 10s, we send analytics.
	 *
	 * @return boolean true, if it should be sampled or false otherwise.
	 */
	private static function is_it_sampling_time() {
		$current_timestamp = current_datetime();

		// Get the seconds from the date.
		$seconds = intval( $current_timestamp->format( 's' ) );

		// Only send analytics every 10 seconds.
		if ( 0 === ( $seconds % WPCOMVIP__BLOCK_DATA_API__STAT_SAMPLING_RATE_SEC ) ) {
			return true;
		}

		return false;
	}
}

Analytics::init();
