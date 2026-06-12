<?php
/**
 * Ingestion Prometheus metrics helpers.
 *
 * @package vip-agentforce
 */

namespace Automattic\VIP\Salesforce\Agentforce\Utils;

use Automattic\VIP\Salesforce\Agentforce\Ingestion\Ingestion_Queue;
use Automattic\VIP\Salesforce\Agentforce\Ingestion\Ingestion_Sync_Progress;
use Prometheus\RegistryInterface;

class Ingestion_Metrics {
	private const NAMESPACE = 'vip_agentforce';

	/** @var \Prometheus\Gauge|null */
	private static $queue_pending_gauge;

	/** @var \Prometheus\Gauge|null */
	private static $bulk_status_gauge;

	/** @var \Prometheus\Gauge|null */
	private static $bulk_posts_gauge;

	/** @var \Prometheus\Gauge|null */
	private static $bulk_updated_age_gauge;

	/** @var \Prometheus\Counter|null */
	private static $api_errors_counter;

	/** @var \Prometheus\Counter|null */
	private static $posts_counter;

	/** @var \Prometheus\Counter|null */
	private static $api_requests_counter;

	public static function initialize( RegistryInterface $registry ): void {
		self::$queue_pending_gauge = $registry->getOrRegisterGauge(
			self::NAMESPACE,
			'ingestion_queue_pending',
			'Current pending ingestion queue items by type.',
			[ 'type' ]
		);

		self::$bulk_status_gauge = $registry->getOrRegisterGauge(
			self::NAMESPACE,
			'ingestion_bulk_sync_status',
			'Current bulk sync status as one-hot gauges.',
			[ 'status' ]
		);

		self::$bulk_posts_gauge = $registry->getOrRegisterGauge(
			self::NAMESPACE,
			'ingestion_bulk_sync_posts',
			'Current bulk sync post counts by result.',
			[ 'result' ]
		);

		self::$bulk_updated_age_gauge = $registry->getOrRegisterGauge(
			self::NAMESPACE,
			'ingestion_bulk_sync_updated_age_seconds',
			'Seconds since the current bulk sync progress was last updated.',
			[]
		);

		self::$api_errors_counter = $registry->getOrRegisterCounter(
			self::NAMESPACE,
			'ingestion_api_errors_total',
			'Total ingestion API errors by class.',
			[ 'class' ]
		);

		self::$posts_counter = $registry->getOrRegisterCounter(
			self::NAMESPACE,
			'ingestion_posts_total',
			'Total terminal ingestion post outcomes by result and mode.',
			[ 'result', 'mode' ]
		);

		self::$api_requests_counter = $registry->getOrRegisterCounter(
			self::NAMESPACE,
			'ingestion_api_requests_total',
			'Total ingestion API requests by method, status code, and outcome.',
			[ 'method', 'status_code', 'outcome' ]
		);
	}

	public static function collect_gauges(): void {
		if ( null === self::$queue_pending_gauge ) {
			return;
		}

		$queue_counts = Ingestion_Queue::get_queue_counts();
		self::$queue_pending_gauge->set( $queue_counts['sync'], [ 'sync' ] );
		self::$queue_pending_gauge->set( $queue_counts['delete'], [ 'delete' ] );

		$progress = Ingestion_Sync_Progress::get();
		$status   = is_array( $progress ) ? (string) ( $progress['status'] ?? 'idle' ) : 'idle';

		foreach ( [ 'idle', 'running', 'completed', 'failed' ] as $known_status ) {
			self::$bulk_status_gauge->set( $known_status === $status ? 1 : 0, [ $known_status ] );
		}

		$counts = [
			'total'     => 0,
			'processed' => 0,
			'synced'    => 0,
			'skipped'   => 0,
			'failed'    => 0,
			'deleted'   => 0,
		];

		if ( is_array( $progress ) ) {
			$current = Ingestion_Sync_Progress::get_status_response( $progress );
			foreach ( $counts as $key => $value ) {
				$counts[ $key ] = (int) ( $current[ $key ] ?? $value );
			}
		}

		foreach ( $counts as $result => $count ) {
			self::$bulk_posts_gauge->set( $count, [ $result ] );
		}

		$updated_at = is_array( $progress ) ? (int) ( $progress['updated_at'] ?? 0 ) : 0;
		self::$bulk_updated_age_gauge->set( $updated_at > 0 ? max( 0, time() - $updated_at ) : 0 );
	}

	public static function record_api_error( string $error_class ): void {
		if ( null === self::$api_errors_counter ) {
			return;
		}

		self::$api_errors_counter->inc( [ self::normalize_api_error_class( $error_class ) ] );
	}

	public static function record_post_result( string $result, string $mode ): void {
		$normalized_result = self::normalize_post_result( $result );
		$normalized_mode   = self::normalize_post_mode( $mode );

		self::record_post_result_stats( $normalized_result );

		if ( null === self::$posts_counter ) {
			return;
		}

		self::$posts_counter->inc(
			[
				$normalized_result,
				$normalized_mode,
			]
		);
	}

	private static function record_post_result_stats( string $result ): void {
		if ( ! in_array( $result, [ 'ingested', 'failed' ], true ) ) {
			return;
		}

		do_action( 'vip_agentforce_track_stat', self::get_site_stats_bucket(), 'posts_' . $result );
	}

	public static function record_api_request( string $method, string $status_code, string $outcome ): void {
		if ( null === self::$api_requests_counter ) {
			return;
		}

		self::$api_requests_counter->inc(
			[
				self::normalize_method( $method ),
				$status_code,
				self::normalize_request_outcome( $outcome ),
			]
		);
	}

	private static function normalize_api_error_class( string $error_class ): string {
		return in_array( $error_class, [ 'config', 'auth', 'rate_limit', 'server', 'network', 'client', 'unexpected' ], true )
			? $error_class
			: 'unexpected';
	}

	private static function normalize_post_result( string $result ): string {
		return in_array( $result, [ 'ingested', 'deleted', 'skipped', 'failed' ], true )
			? $result
			: 'failed';
	}

	private static function normalize_post_mode( string $mode ): string {
		return in_array( $mode, [ 'queue', 'bulk', 'sync' ], true )
			? $mode
			: 'sync';
	}

	private static function get_site_stats_bucket(): string {
		return 'env_' . self::get_app_id() . '_' . get_current_blog_id();
	}

	private static function get_app_id(): string {
		$app_id = defined( 'VIP_GO_APP_ID' ) ? (string) constant( 'VIP_GO_APP_ID' ) : '0';
		$app_id = strtolower( $app_id );
		$app_id = (string) preg_replace( '/[^a-z0-9_]+/', '_', $app_id );
		$app_id = trim( $app_id, '_' );

		return '' !== $app_id ? $app_id : 'unknown';
	}

	private static function normalize_method( string $method ): string {
		return in_array( $method, [ 'POST', 'DELETE' ], true )
			? $method
			: 'POST';
	}

	private static function normalize_request_outcome( string $outcome ): string {
		return in_array( $outcome, [ 'success', 'rate_limit', 'server_error', 'auth_error', 'client_error', 'network_error', 'unexpected' ], true )
			? $outcome
			: 'unexpected';
	}
}
