<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Backtrace;
use QM_Collector_Logger;
use QM_Data_Logger;
use RemoteDataBlocks\Editor\DataBinding\BlockBindings;
use RemoteDataBlocks\Logging\Logger;
use function get_post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Collector_Logger' ) ) {
	/**
	 * @extends QM_Collector<QM_Data_Logger>
	 */
	class RdbLogCollector extends QM_Collector_Logger {
		/**
		 * @var string
		 */
		public $id = 'remote-data-blocks-logs';

		/**
		 * @var string
		 */
		public string $log_type = 'generic';

		/**
		 * Intentionally do not call parent
		 */
		public function set_up(): void {
			add_action( Logger::ACTION_NAME, [ $this, 'log_event' ], 90, 4 );

			$this->data->counts = array_fill_keys( $this->get_levels(), 0 );
		}

		public function tear_down(): void {
			remove_action( Logger::ACTION_NAME, [ $this, 'log_event' ], 90, 4 );
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

		public function log_event( string $_namespace, string $level, string $message, array $context ): void {
			$event_type = $context['type'] ?? 'generic';

			if ( $this->log_type !== $event_type ) {
				return;
			}

			$this->log( $level, $message, $context );
		}

		/**
		 * This method must match the implementation of the parent class,
		 * including the missing type hints.
		 *
		 * @param string $level Log level (e.g., 'error', 'warning', 'info')
		 * @param string $message Log message
		 * @param array<string, mixed> $context Context
		 * @param string|null $prefix Optional prefix for the log message
		 * @return void
		 */
		// phpcs:ignore SlevomatCodingStandard.TypeHints.ParameterTypeHint.MissingNativeTypeHint,SlevomatCodingStandard.TypeHints.ReturnTypeHint.MissingNativeTypeHint
		protected function store( $level, $message, array $context = [], ?string $prefix = null ) {
			$trace = new QM_Backtrace( [
				'ignore_class' => [
					self::class => true,
				],
				'ignore_hook' => array(
					current_filter() => true,
				),
				'ignore_method' => [
					BlockBindings::class => [
						'log_error' => true,
						'log_success' => true,
					],
				],
			] );

			$this->data->counts[ $level ] = ( $this->data->counts[ $level ] ?? 0 ) + 1;
			$this->data->logs[] = [
				'block_name' => $context['block_name'] ?? 'unknown',
				'block_info' => $context['block_info'] ?? [],
				'component' => $trace->get_component(),
				'context' => $context,
				'filtered_trace' => $trace->get_filtered_trace(),
				'level' => $level,
				'message' => self::interpolate( $message, $context, $prefix ),
				'post_id' => get_post()->ID ?? '',
				'remote_data_block_name' => $context['remote_data_block_name'] ?? 'unknown',
			];
		}
	}
}
