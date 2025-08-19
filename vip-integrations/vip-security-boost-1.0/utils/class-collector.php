<?php
/**
 * Prometheus metrics collector for VIP Security Boost plugin.
 */

namespace Automattic\VIP\Security\Utils;

use Prometheus\Counter;
use Prometheus\Gauge;
use Prometheus\RegistryInterface;

/**
 * @codeCoverageIgnore
 */
class Collector implements \Automattic\VIP\Prometheus\CollectorInterface {
	private Counter $mfa_display_counter;
	private Counter $mfa_filter_click_counter;
	private Counter $mfa_sorting_counter;
	private Counter $blocked_users_view_counter;
	private Counter $user_unblock_counter;
	private Counter $privileged_email_sent_counter;
	private Gauge $inactive_users_query_time;

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

		$this->inactive_users_query_time = $registry->getOrRegisterGauge(
			'vip_security_boost',
			'inactive_users_query_time',
			'Query time for inactive users count in milliseconds',
			[]
		);

		// Set up action hooks for automatic metric collection
		add_action( 'vip_security_mfa_display', [ $this, 'mfa_display' ], 10, 1 );
		add_action( 'vip_security_mfa_filter_click', [ $this, 'mfa_filter_click' ], 10, 1 );
		add_action( 'vip_security_mfa_sorting', [ $this, 'mfa_sorting' ], 10, 2 );
		add_action( 'vip_security_blocked_users_view', [ $this, 'blocked_users_view' ] );
		add_action( 'vip_security_user_unblock', [ $this, 'user_unblock' ], 10, 2 );
		add_action( 'vip_security_privileged_email_sent', [ $this, 'privileged_email_sent' ], 10, 2 );
		add_action( 'vip_security_inactive_users_query_time', [ $this, 'set_inactive_users_query_time' ], 10, 1 );
	}

	public function mfa_display( bool $filter_enabled ): void {
		$this->mfa_display_counter->inc( [ $filter_enabled ? 'true' : 'false' ] );
	}

	public function mfa_filter_click( string $filter_type ): void {
		$this->mfa_filter_click_counter->inc( [ $filter_type ] );
	}

	public function mfa_sorting( string $sort_column, string $sort_order ): void {
		$this->mfa_sorting_counter->inc( [ $sort_column, $sort_order ] );
	}

	public function blocked_users_view(): void {
		$this->blocked_users_view_counter->inc();
	}

	public function user_unblock( int $user_id, string $user_role ): void {
		$this->user_unblock_counter->inc( [ $user_role ] );
	}

	public function privileged_email_sent( string $email_type, string $recipient_role ): void {
		$this->privileged_email_sent_counter->inc( [ $email_type, $recipient_role ] );
	}

	public function set_inactive_users_query_time( float $query_time ): void {
		$this->inactive_users_query_time->set( $query_time );
	}

	public function collect_metrics(): void {
		/* Do nothing */
	}

	public function process_metrics(): void {
		/* Do nothing */
	}
}
