<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Backtrace;
use QM_Collector_Logger;
use QM_Data_Logger;
use RemoteDataBlocks\Editor\DataBinding\BlockBindings;
use WP_Error;
use function get_post;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Collector_Logger' ) ) {
	/**
	 * @extends QM_Collector<QM_Data_Logger>
	 */
	class RdbBlockBindingCollector extends QM_Collector_Logger {
		/**
		 * @var string
		 */
		public $id = 'remote-data-blocks-block-binding';

		/**
		 * Intentionally do not call parent
		 */
		public function set_up(): void {
			add_action( BlockBindings::$log_action_name, [ $this, 'log_event' ], 90, 3 );

			$this->data->counts = array_fill_keys( $this->get_levels(), 0 );
		}

		public function tear_down(): void {
			remove_action( BlockBindings::$log_action_name, [ $this, 'log_event' ], 90, 3 );
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

		public function log_event( string $level, string $message, array $context, ?WP_Error $error = null ): void {
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
				'block_info' => [
					'Source args' => $context['source_args'] ?? [],
				],
				'component' => $trace->get_component(),
				'filtered_trace' => $trace->get_filtered_trace(),
				'level' => $level,
				'message' => $message,
				'post_id' => get_post()->ID ?? '',
				'remote_data_block_name' => $context['remote_data_block_name'] ?? 'unknown',
			];
		}
	}
}
