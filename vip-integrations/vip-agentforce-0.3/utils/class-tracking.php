<?php
/**
 * Send Tracks events and stats for VIP Agentforce plugin.
 */

namespace Automattic\VIP\Salesforce\Agentforce\Utils;

use Automattic\VIP\Salesforce\Agentforce\Constants;
use Automattic\VIP\Telemetry\Telemetry;
use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;
class Tracking {

	/**
	 * Prefix for events.
	 */
	const PREFIX = 'vip-agentforce';

	/**
	 * Prefix for stats.
	 */
	const STAT_PREFIX = 'vip_agentforce';

	/**
	 * Telemetry instance.
	 */
	private static ?Telemetry $telemetry = null;
	public static function init(): void {
		if ( isset( self::$telemetry ) ) {
			return;
		}

		self::$telemetry = self::get_telemetry();


		self::setup_action_hooks();
	}


	/**
	 * Get the Telemetry instance.
	 *
	 * @return Telemetry|null The Telemetry instance or null if not available.
	 */
	private static function get_telemetry(): ?Telemetry {
		if ( null === self::$telemetry && class_exists( '\Automattic\VIP\Telemetry\Telemetry' ) ) {
			self::$telemetry = new Telemetry(
				self::PREFIX . '_' . self::maybe_get_non_production_prefix(),
				[
					'plugin_name' => Constants::LOG_PLUGIN_NAME,
					'site_id'     => defined( 'VIP_GO_APP_ID' ) ? VIP_GO_APP_ID : 0,
				]
			);
		}
		return self::$telemetry;
	}

	/**
	 * Record an event using Telemetry, only if Telemetry class is available.
	 *
	 * @param string $event_name Event name.
	 * @param array<string, mixed> $event_data Event data.
	 */
	public static function record_event( string $event_name, array $event_data = [] ): void {
		$telemetry = self::get_telemetry();
		if ( $telemetry ) {
			$telemetry->record_event( $event_name, $event_data );
		}
	}

	/**
	 * Get the prefix for stats and events.
	 */
	private static function maybe_get_non_production_prefix( bool $trailing_underscore = true ): string {
		$trailing_underscore = $trailing_underscore ? '_' : '';
		if ( Configs::is_local_env() ) {
			return 'local' . $trailing_underscore;
		}
		if ( ! Configs::is_production_env() ) {
			return 'nonprod' . $trailing_underscore;
		}
		return '';
	}

	/**
	 * Record stats using VIP Stats
	 *
	 * @param string      $stat_name Stat name.
	 * @param string|null $stat_code_suffix Optional stat code suffix. Defaults to the plugin-level stat code.
	 */
	public static function record_stats( string $stat_name, ?string $stat_code_suffix = null ): void {
		$stat_code = self::get_stat_code( $stat_code_suffix );

		// Test/local environments should log the stat path without emitting a pixel.
		if ( Configs::is_local_env() || self::is_test_env() ) {
			Logger::info( 'vip-agentforce', 'Bumping stats for /s/' . $stat_code . '/' . $stat_name, [
				'stat_code' => $stat_code,
				'stat_name' => $stat_name,
			] );
			return;
		}

		if ( function_exists( '\Automattic\VIP\Stats\send_pixel' ) ) {
			try {
				\Automattic\VIP\Stats\send_pixel( [ $stat_code => $stat_name ] );
			} catch ( \Exception $e ) {
				Logger::error( 'vip-agentforce', 'Stats recording failed', [
					'stat_code' => $stat_code,
					'stat_name' => $stat_name,
					'error'     => $e->getMessage(),
				] );
			}
		} else {
			Logger::warning( 'vip-agentforce', 'VIP Stats send_pixel function not available', [
				'stat_code' => $stat_code,
				'stat_name' => $stat_name,
			] );
		}
	}

	private static function get_stat_code( ?string $stat_code_suffix ): string {
		if ( null === $stat_code_suffix ) {
			return self::get_default_stat_code();
		}

		return self::STAT_PREFIX . '_' . $stat_code_suffix;
	}

	private static function get_default_stat_code(): string {
		$env_prefix = self::maybe_get_non_production_prefix( false );
		$stat_code  = self::STAT_PREFIX;

		if ( ! empty( $env_prefix ) ) {
			$stat_code = self::STAT_PREFIX . '_' . $env_prefix;
		}

		return $stat_code;
	}

	private static function is_test_env(): bool {
		return defined( 'VIP_GO_APP_ENVIRONMENT' ) && 'test' === constant( 'VIP_GO_APP_ENVIRONMENT' );
	}

	private static function setup_action_hooks(): void {
		// Custom hook to allow other plugin code to track events
		add_action( 'vip_agentforce_track_event', [ __CLASS__, 'record_event' ], 10, 2 );
		add_action( 'vip_agentforce_track_stat', [ __CLASS__, 'record_stats' ], 10, 2 );
	}
}
