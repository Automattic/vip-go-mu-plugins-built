<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use GuzzleHttp\Promise\Promise as GuzzlePromise;
use GuzzleHttp\Promise\TaskQueue as GuzzleTaskQueue;
use RemoteDataBlocks\HttpClient\RdbLogMiddleware;
use QM_Backtrace;
use QM_Collector_HTTP;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Collector_HTTP' ) ) {
	/**
	 * @extends QM_Collector_HTTP<QM_Data_HTTP>
	 */
	class RdbHttpRequestCollector extends QM_Collector_HTTP {

		/**
		 * @var string
		 */
		public $id = 'remote-data-blocks-http';

		public function set_up(): void {
			add_action( RdbLogMiddleware::$action_name, [ $this, 'log_http_request' ], 90, 1 );
		}

		public function tear_down(): void {
			remove_action( RdbLogMiddleware::$action_name, [ $this, 'log_http_request' ], 90, 1 );
		}

		/**
		 * @return array<int, string>
		 */
		public function get_concerned_actions(): array {
			return [];
		}

		/**
		 * @return array<int, string>
		 */
		public function get_concerned_filters(): array {
			return [];
		}

		/**
		 * @return array<int, string>
		 */
		public function get_concerned_constants(): array {
			return [];
		}

		public function log_http_request( array $context ): void {
			$trace = new QM_Backtrace( [
				'ignore_class' => [
					self::class => true,
					GuzzlePromise::class => true,
					GuzzleTaskQueue::class => true,
					RdbLogMiddleware::class => true,
				],
				'ignore_hook' => array(
					current_action() => true,
				),
				'ignore_func' => [],
			] );

			$this->data->http[] = array_merge( $context, [ 'trace' => $trace ] );

			if ( $context['error'] ) {
				$this->data->errors[] = $context['error'];
			}
		}

		public function process(): void {}
	}
}
