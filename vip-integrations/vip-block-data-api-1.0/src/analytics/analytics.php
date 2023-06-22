<?php

namespace WPCOMVIP\BlockDataApi;

defined( 'ABSPATH' ) || die();

define( 'WPCOMVIP__BLOCK_DATA_API__STAT_NAME__USAGE', 'vip-block-data-api-usage' );
define( 'WPCOMVIP__BLOCK_DATA_API__STAT_NAME__ERROR', 'vip-block-data-api-error' );

class Analytics {
	private static $analytics_to_send = [];

	public static function init() {
		add_action( 'shutdown', [ __CLASS__, 'send_analytics' ] );
	}

	public static function record_usage() {
		self::$analytics_to_send[ WPCOMVIP__BLOCK_DATA_API__STAT_NAME__USAGE ] = self::get_identifier();
	}

	/**
	 * @param WP_Error $error
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

		if ( self::is_wpvip_site() && defined( 'FILES_CLIENT_SITE_ID' ) && ! $is_skippable_error_for_analytics ) {
			// Record error data from WPVIP for follow-up
			self::$analytics_to_send[ WPCOMVIP__BLOCK_DATA_API__STAT_NAME__ERROR ] = constant( 'FILES_CLIENT_SITE_ID' );
		}
	}

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

		self::send_pixel( self::$analytics_to_send );
	}

	private static function send_pixel( $stats ) {
		$query_args = [
			'v' => 'wpcom-no-pv',
		];

		foreach ( $stats as $name => $group ) {
			$query_param = rawurlencode( 'x_' . $name );
			$query_value = rawurlencode( $group );

			$query_args[ $query_param ] = $query_value;
		}

		$pixel = add_query_arg( $query_args, 'http://pixel.wp.com/b.gif' );

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.wp_remote_get_wp_remote_get
		wp_remote_get( $pixel, array(
			'blocking' => false,
			'timeout'  => 1,
		) );
	}

	private static function get_identifier() {
		if ( self::is_wpvip_site() && defined( 'FILES_CLIENT_SITE_ID' ) ) {
			return constant( 'FILES_CLIENT_SITE_ID' );
		} else {
			return 'Unknown';
		}
	}

	private static function is_wpvip_site() {
		return defined( 'WPCOM_IS_VIP_ENV' ) && constant( 'WPCOM_IS_VIP_ENV' ) === true
			&& defined( 'WPCOM_SANDBOXED' ) && constant( 'WPCOM_SANDBOXED' ) === false;
	}
}

Analytics::init();
