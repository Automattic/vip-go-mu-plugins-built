<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Backtrace;
use QM_Collector_Logger;
use RemoteDataBlocks\Config\ArraySerializable;
use RemoteDataBlocks\Validation\Validator;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Collector_Logger' ) ) {
	/**
	 * @extends QM_Collector_Logger<QM_Data_Logger>
	 */
	class RdbValidationCollector extends QM_Collector_Logger {
		/**
		 * @var string
		 */
		public $id = 'remote-data-blocks-validation';

		/**
		 * Intentionally do not call parent
		 */
		public function set_up(): void {
			// We intentionally do not call parent::set_up() here since that
			// constructor adds actions that we don't want to hook into.
			add_action( Validator::ACTION_NAME, [ $this, 'log_validation_issue' ], 90, 1 );

			$this->data->counts = array_fill_keys( $this->get_levels(), 0 );
		}

		public function tear_down(): void {
			remove_action( Validator::ACTION_NAME, [ $this, 'error' ], 90, 1 );
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

		public function log_validation_issue( WP_Error $error ): void {
			$error_data = $error->get_error_data();
			$context = $error_data['context'] ?? null;
			$level = $error_data['level'] ?? 'error';

			$this->log( $level, $error->get_error_message(), $context );
		}

		/**
		 * This method must match the implementation of the parent class,
		 * including the missing type hints.
		 *
		 * @param string $level Log level (e.g., 'error', 'warning', 'info')
		 * @param string $message Log message
		 * @param array<string, mixed> $context Context
		 * @param string|null $prefix Log message prefix
		 * @return void
		 */
		// phpcs:ignore SlevomatCodingStandard.TypeHints.ParameterTypeHint.MissingNativeTypeHint,SlevomatCodingStandard.TypeHints.ReturnTypeHint.MissingNativeTypeHint
		protected function store( $level, $message, array $context = array(), ?string $prefix = null ) {
			$trace = new QM_Backtrace( [
				'ignore_class' => [
					self::class => true,
					ArraySerializable::class => true,
					Validator::class => true,
				],
				'ignore_hook' => array(
					current_filter() => true,
				),
			] );

			$this->data->counts[ $level ] = ( $this->data->counts[ $level ] ?? 0 ) + 1;
			$this->data->logs[] = [
				'message' => self::interpolate( $message, $context, $prefix ),
				'filtered_trace' => $trace->get_filtered_trace(),
				'component' => $trace->get_component(),
				'level' => $level,
			];
		}
	}
}
