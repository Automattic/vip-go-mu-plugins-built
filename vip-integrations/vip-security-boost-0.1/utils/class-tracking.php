<?php
/**
 * Send Tracks events and stats for VIP Security Boost plugin.
 */

namespace Automattic\VIP\Security\Utils;

use Automattic\VIP\Security\Constants;
use Automattic\VIP\Telemetry\Tracks;

class Tracking {

	/**
	 * Prefix for stats and events.
	 */
	const PREFIX = 'vip_security_boost';

	/**
	 * Tracks instance.
	 */
	private static ?Tracks $tracks = null;

	private Counter $mfa_display_counter;
	private Counter $mfa_filter_click_counter;
	private Counter $mfa_sorting_counter;
	private Counter $blocked_users_view_counter;
	private Counter $user_unblock_counter;
	private Counter $privileged_email_sent_counter;

	/**
	 * Get the Tracks instance.
	 *
	 * @return Tracks|null The Tracks instance or null if not available.
	 */
	private static function get_tracks(): ?Tracks {
		if ( null === self::$tracks && class_exists( '\Automattic\VIP\Telemetry\Tracks' ) ) {
			self::$tracks = new Tracks(
				self::PREFIX . '_',
				[
					'plugin_name' => Constants::LOG_PLUGIN_NAME,
					'site_id'     => defined( 'VIP_GO_APP_ID' ) ? VIP_GO_APP_ID : 0,
				]
			);
		}
		return self::$tracks;
	}

	public function initialize( RegistryInterface $registry ): void {
		$this->mfa_display_counter = $registry->getOrRegisterCounter(
			'vip_security_boost',
			'mfa_display_total',
			'Number of MFA display views',
			[ 'filtered' ]
		);

		$this->mfa_filter_click_counter = $registry->getOrRegisterCounter(
			'vip_security_boost',
			'mfa_filter_click_total',
			'Number of MFA filter clicks',
			[ 'filter_type' ]
		);

		$this->mfa_sorting_counter = $registry->getOrRegisterCounter(
			'vip_security_boost',
			'mfa_sorting_total',
			'Number of MFA sorting actions',
			[ 'sort_column', 'sort_order' ]
		);

		$this->blocked_users_view_counter = $registry->getOrRegisterCounter(
			'vip_security_boost',
			'blocked_users_view_total',
			'Number of blocked users view accesses',
			[]
		);

		$this->user_unblock_counter = $registry->getOrRegisterCounter(
			'vip_security_boost',
			'user_unblock_total',
			'Number of user unblock actions',
			[ 'user_role' ]
		);

		$this->privileged_email_sent_counter = $registry->getOrRegisterCounter(
			'vip_security_boost',
			'privileged_email_sent_total',
			'Number of privileged activity emails sent',
			[ 'email_type', 'recipient_role' ]
		);
	}

	public static function mfa_display( $filter_enabled ) {
		$tracks = self::get_tracks();
		if ( $tracks ) {
			$tracks->record_event( 'mfa_page_view', [ 'filtered' => $filter_enabled ] );
		}
		self::record_stats( 'mfa-display' . ( $filter_enabled ? '-filtered' : '' ) );
	}

	public static function mfa_filter_click( $filter_type ) {
		$tracks = self::get_tracks();
		if ( $tracks ) {
			$tracks->record_event( 'mfa_filter_click', [ 'filter_type' => $filter_type ] );
		}
		self::record_stats( 'mfa-filter-click' );
	}

	public static function mfa_sorting( $sort_column, $sort_order ) {
		$tracks = self::get_tracks();
		if ( $tracks ) {
			$tracks->record_event( 'mfa_sort', [
				'sort_column' => $sort_column,
				'sort_order'  => $sort_order,
			] );
		}
		self::record_stats( 'mfa-sorting' );
	}

	public static function blocked_users_view() {
		$tracks = self::get_tracks();
		if ( $tracks ) {
			$tracks->record_event( 'blocked_users_view' );
		}
		self::record_stats( 'blocked-users-view' );
	}

	public static function user_unblock( $user_id, $user_role ) {
		$tracks = self::get_tracks();
		if ( $tracks ) {
			$tracks->record_event( 'blocked_users_unblock', [
				'user_role'   => $user_role,
				'has_user_id' => ! empty( $user_id ),
			] );
		}
		self::record_stats( 'user-unblock' );
	}

	public static function privileged_email_sent( $email_type, $recipient_role ) {
		$tracks = self::get_tracks();
		if ( $tracks ) {
			$tracks->record_event( 'privileged_activity_email_sent', [
				'email_type'     => $email_type,
				'recipient_role' => $recipient_role,
			] );
		}
		self::record_stats( 'privileged-email-sent' );

		Logger::info( 'vip-security-boost', 'Privileged user email notification sent', [
			'email_type'     => $email_type,
			'recipient_role' => $recipient_role,
		] );
	}


	/**
	 * Record stats using VIP Stats
	 *
	 * @param string $stat_name Stat name.
	 * @param mixed  $value Stat value.
	 */
	private static function record_stats( $stat_name ) {
		// We're tracking the stats in production only
		if ( 'local' === constant( 'VIP_GO_APP_ENVIRONMENT' ) ) {
			Logger::info( 'vip-security-boost', 'Bumping stats for /s/' . self::PREFIX . "/{$stat_name}", [
				'stat_name' => $stat_name,
			] );
			return;
		}

		if ( function_exists( '\Automattic\VIP\Stats\send_pixel' ) ) {
			try {
				\Automattic\VIP\Stats\send_pixel( [ self::PREFIX => $stat_name ] );
			} catch ( \Exception $e ) {
				Logger::error( 'vip-security-boost', 'Stats recording failed', [
					'stat_name' => $stat_name,
					'error'     => $e->getMessage(),
				] );
			}
		} else {
			Logger::warning( 'vip-security-boost', 'VIP Stats send_pixel function not available', [
				'stat_name' => $stat_name,
			] );
		}
	}


	/**
	 * Set up action hooks for tracking events (similar to VIP Auth pattern)
	 */
	public static function setup_action_hooks() {
		add_action( 'vip_security_mfa_display', [ __CLASS__, 'mfa_display' ], 10, 1 );
		add_action( 'vip_security_mfa_filter_click', [ __CLASS__, 'mfa_filter_click' ], 10, 1 );
		add_action( 'vip_security_mfa_sorting', [ __CLASS__, 'mfa_sorting' ], 10, 2 );
		add_action( 'vip_security_blocked_users_view', [ __CLASS__, 'blocked_users_view' ] );
		add_action( 'vip_security_user_unblock', [ __CLASS__, 'user_unblock' ], 10, 2 );
		add_action( 'vip_security_privileged_email_sent', [ __CLASS__, 'privileged_email_sent' ], 10, 2 );
	}
}
