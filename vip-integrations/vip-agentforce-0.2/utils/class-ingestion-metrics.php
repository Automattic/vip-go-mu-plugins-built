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
	private const NAMESPACE            = 'vip_agentforce';
	private const CACHE_GROUP          = 'vip_agentforce';
	private const COUNTER_SAMPLES_KEY  = 'ingestion_metric_counter_samples';
	private const COUNTER_REPLAY_LOCK  = 'ingestion_metric_counter_replay_lock';
	private const COUNTER_API_ERRORS   = 'api_errors';
	private const COUNTER_POSTS        = 'posts';
	private const COUNTER_API_REQUESTS = 'api_requests';
	private const COUNTER_TYPES        = [ self::COUNTER_API_ERRORS, self::COUNTER_POSTS, self::COUNTER_API_REQUESTS ];
	private const API_ERROR_CLASSES    = [ 'config', 'auth', 'rate_limit', 'server', 'network', 'client', 'unexpected' ];
	private const POST_RESULTS         = [ 'ingested', 'deleted', 'skipped', 'failed' ];
	private const POST_MODES           = [ 'queue', 'bulk', 'sync' ];
	private const REQUEST_METHODS      = [ 'POST', 'DELETE' ];
	private const REQUEST_OUTCOMES     = [ 'success', 'rate_limit', 'server_error', 'auth_error', 'client_error', 'network_error', 'unexpected' ];
	/**
	 * @var array<string, \Prometheus\Gauge>
	 */
	private static array $gauges = [];

	/**
	 * @var array<string, \Prometheus\Counter>
	 */
	private static array $counters = [];

	public static function initialize( RegistryInterface $registry ): void {
		self::$gauges['queue_pending']                = $registry->getOrRegisterGauge( self::NAMESPACE, 'ingestion_queue_pending', 'Current pending ingestion queue items by type.', [ 'type' ] );
		self::$gauges['bulk_status']                  = $registry->getOrRegisterGauge( self::NAMESPACE, 'ingestion_bulk_sync_status', 'Current bulk sync status as one-hot gauges.', [ 'status' ] );
		self::$gauges['bulk_posts']                   = $registry->getOrRegisterGauge( self::NAMESPACE, 'ingestion_bulk_sync_posts', 'Current bulk sync post counts by result.', [ 'result' ] );
		self::$gauges['bulk_updated_age']             = $registry->getOrRegisterGauge( self::NAMESPACE, 'ingestion_bulk_sync_updated_age_seconds', 'Seconds since the current bulk sync progress was last updated.', [] );
		self::$counters[ self::COUNTER_API_ERRORS ]   = $registry->getOrRegisterCounter( self::NAMESPACE, 'ingestion_api_errors_total', 'Total ingestion API errors by class.', [ 'class' ] );
		self::$counters[ self::COUNTER_POSTS ]        = $registry->getOrRegisterCounter( self::NAMESPACE, 'ingestion_posts_total', 'Total terminal ingestion post outcomes by result and mode.', [ 'result', 'mode' ] );
		self::$counters[ self::COUNTER_API_REQUESTS ] = $registry->getOrRegisterCounter( self::NAMESPACE, 'ingestion_api_requests_total', 'Total ingestion API requests by method, status code, and outcome.', [ 'method', 'status_code', 'outcome' ] );
	}

	public static function collect_gauges(): void {
		if ( [] === self::$gauges ) {
			return;
		}

		$queue_counts = Ingestion_Queue::get_queue_counts();
		self::$gauges['queue_pending']->set( $queue_counts['sync'], [ 'sync' ] );
		self::$gauges['queue_pending']->set( $queue_counts['delete'], [ 'delete' ] );

		$progress = Ingestion_Sync_Progress::get();
		$status   = is_array( $progress ) ? (string) ( $progress['status'] ?? 'idle' ) : 'idle';
		foreach ( [ 'idle', 'running', 'completed', 'failed' ] as $known_status ) {
			self::$gauges['bulk_status']->set( $known_status === $status ? 1 : 0, [ $known_status ] );
		}

		$counts = array_fill_keys( [ 'total', 'processed', 'synced', 'skipped', 'failed', 'deleted' ], 0 );
		if ( is_array( $progress ) ) {
			$current = Ingestion_Sync_Progress::get_status_response( $progress );
			foreach ( $counts as $key => $value ) {
				$counts[ $key ] = (int) ( $current[ $key ] ?? $value );
			}
		}

		foreach ( $counts as $result => $count ) {
			self::$gauges['bulk_posts']->set( $count, [ $result ] );
		}

		$updated_at = is_array( $progress ) ? (int) ( $progress['updated_at'] ?? 0 ) : 0;
		self::$gauges['bulk_updated_age']->set( $updated_at > 0 ? max( 0, time() - $updated_at ) : 0 );
	}

	public static function collect_counters(): void {
		$pending_samples   = self::get_pending_counter_samples();
		$remaining_samples = self::valid_counter_samples( $pending_samples );
		if ( [] === $pending_samples || ! self::claim_counter_replay_lock() ) {
			return;
		}

		try {
			foreach ( self::COUNTER_TYPES as $counter_type ) {
				if ( [] === ( $remaining_samples[ $counter_type ] ?? [] ) || ! array_key_exists( $counter_type, self::$counters ) ) {
					continue;
				}

				foreach ( $remaining_samples[ $counter_type ] as $index => $sample ) {
					self::$counters[ $counter_type ]->incBy( $sample['count'], $sample['labels'] );
					unset( $remaining_samples[ $counter_type ][ $index ] );
				}

				if ( [] === $remaining_samples[ $counter_type ] ) {
					unset( $remaining_samples[ $counter_type ] );
				}
			}
			self::save_pending_counter_samples( $remaining_samples );
		} catch ( \Throwable $throwable ) {
			self::save_pending_counter_samples( $remaining_samples );
			throw $throwable;
		} finally {
			wp_cache_delete( self::COUNTER_REPLAY_LOCK, self::CACHE_GROUP );
		}
	}

	public static function record_api_error( string $error_class ): void {
		self::record_counter( self::COUNTER_API_ERRORS, [ self::normalize( $error_class, self::API_ERROR_CLASSES, 'unexpected' ) ] );
	}

	public static function record_post_result( string $result, string $mode ): void {
		$labels = [ self::normalize( $result, self::POST_RESULTS, 'failed' ), self::normalize( $mode, self::POST_MODES, 'sync' ) ];
		self::record_post_result_stats( $labels[0] );
		self::record_counter( self::COUNTER_POSTS, $labels );
	}

	public static function record_api_request( string $method, string $status_code, string $outcome ): void {
		self::record_counter(
			self::COUNTER_API_REQUESTS,
			[ self::normalize( $method, self::REQUEST_METHODS, 'POST' ), self::is_known_status_code_label( $status_code ) ? $status_code : 'none', self::normalize( $outcome, self::REQUEST_OUTCOMES, 'unexpected' ) ]
		);
	}

	private static function record_post_result_stats( string $result ): void {
		if ( in_array( $result, [ 'ingested', 'failed' ], true ) ) {
			do_action( 'vip_agentforce_track_stat', self::get_site_stats_bucket(), 'posts_' . $result );
		}
	}

	/**
	 * @param array<int, string> $labels
	 */
	private static function record_counter( string $counter_type, array $labels ): void {
		if ( ! array_key_exists( $counter_type, self::$counters ) ) {
			self::buffer_counter_sample( $counter_type, $labels );
			return;
		}

		self::$counters[ $counter_type ]->inc( $labels );
	}

	/**
	 * @param array<int, string> $labels
	 */
	private static function buffer_counter_sample( string $counter_type, array $labels ): void {
		if ( ! in_array( $counter_type, self::COUNTER_TYPES, true ) ) {
			return;
		}

		$samples = self::get_pending_counter_samples();
		$key     = (string) wp_json_encode( $labels );
		$count   = $samples[ $counter_type ][ $key ]['count'] ?? 0;

		$samples[ $counter_type ][ $key ] = [
			'labels' => $labels,
			'count'  => is_numeric( $count ) ? (float) $count + 1 : 1,
		];
		wp_cache_set( self::COUNTER_SAMPLES_KEY, $samples, self::CACHE_GROUP );
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	private static function get_pending_counter_samples(): array {
		$found   = false;
		$samples = wp_cache_get( self::COUNTER_SAMPLES_KEY, self::CACHE_GROUP, false, $found );
		return $found && is_array( $samples ) ? $samples : [];
	}

	private static function claim_counter_replay_lock(): bool {
		return wp_cache_add( self::COUNTER_REPLAY_LOCK, true, self::CACHE_GROUP, 300 );
	}

	/**
	 * @param array<string, array<int, array{labels: array<int, string>, count: int|float}>> $samples
	 */
	private static function save_pending_counter_samples( array $samples ): void {
		if ( [] === array_filter( $samples ) ) {
			wp_cache_delete( self::COUNTER_SAMPLES_KEY, self::CACHE_GROUP );
			return;
		}

		$pending_samples = [];
		foreach ( $samples as $counter_type => $counter_samples ) {
			foreach ( $counter_samples as $sample ) {
				$pending_samples[ $counter_type ][ (string) wp_json_encode( $sample['labels'] ) ] = $sample;
			}
		}
		wp_cache_set( self::COUNTER_SAMPLES_KEY, $pending_samples, self::CACHE_GROUP );
	}

	/**
	 * @param array<string, array<string, mixed>> $samples
	 * @return array<string, array<int, array{labels: array<int, string>, count: int|float}>>
	 */
	private static function valid_counter_samples( array $samples ): array {
		$valid_samples = [];
		foreach ( self::COUNTER_TYPES as $counter_type ) {
			$valid_samples[ $counter_type ] = self::filter_counter_samples( $counter_type, $samples[ $counter_type ] ?? [] );
		}
		return array_filter( $valid_samples );
	}

	/**
	 * @return array<int, array{labels: array<int, string>, count: int|float}>
	 */
	private static function filter_counter_samples( string $counter_type, mixed $samples ): array {
		if ( ! is_array( $samples ) ) {
			return [];
		}

		$filtered = [];
		foreach ( $samples as $sample ) {
			if ( ! is_array( $sample ) || ! is_array( $sample['labels'] ?? null ) || ! is_numeric( $sample['count'] ?? null ) ) {
				continue;
			}

			$labels = array_values( $sample['labels'] );
			$count  = (float) $sample['count'];
			if ( 0 >= $count || array_filter( $labels, 'is_string' ) !== $labels || ! self::is_known_counter_label_tuple( $counter_type, $labels ) ) {
				continue;
			}

			$filtered[] = [
				'labels' => $labels,
				'count'  => floor( $count ) === $count ? (int) $count : $count,
			];
		}
		return $filtered;
	}

	/**
	 * @param array<int, string> $labels
	 */
	private static function is_known_counter_label_tuple( string $counter_type, array $labels ): bool {
		return match ( $counter_type ) {
			self::COUNTER_API_ERRORS => 1 === count( $labels ) && in_array( $labels[0], self::API_ERROR_CLASSES, true ),
			self::COUNTER_POSTS => 2 === count( $labels ) && in_array( $labels[0], self::POST_RESULTS, true ) && in_array( $labels[1], self::POST_MODES, true ),
			self::COUNTER_API_REQUESTS => 3 === count( $labels ) && in_array( $labels[0], self::REQUEST_METHODS, true ) && self::is_known_status_code_label( $labels[1] ) && in_array( $labels[2], self::REQUEST_OUTCOMES, true ),
			default => false,
		};
	}

	private static function is_known_status_code_label( string $status_code ): bool {
		return 'none' === $status_code || 1 === preg_match( '/^\d{3}$/', $status_code );
	}

	/**
	 * @param array<int, string> $known_values
	 */
	private static function normalize( string $value, array $known_values, string $fallback ): string {
		return in_array( $value, $known_values, true ) ? $value : $fallback;
	}

	private static function get_site_stats_bucket(): string {
		$app_id = defined( 'VIP_GO_APP_ID' ) ? (string) constant( 'VIP_GO_APP_ID' ) : '0';
		$app_id = trim( (string) preg_replace( '/[^a-z0-9_]+/', '_', strtolower( $app_id ) ), '_' );
		return 'env_' . ( '' !== $app_id ? $app_id : 'unknown' ) . '_' . get_current_blog_id();
	}
}
