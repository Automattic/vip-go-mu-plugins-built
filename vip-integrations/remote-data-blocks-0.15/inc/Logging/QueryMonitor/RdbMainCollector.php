<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Collector;
use QM_Data_Fallback;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Collector' ) ) {
	/**
	 * @extends QM_Collector<QM_Data_Fallback>
	 */
	class RdbMainCollector extends QM_Collector {
		/**
		 * @var string
		 */
		public $id = 'remote-data-blocks';

		/**
		 * Intentionally do not call parent
		 */
		public function set_up(): void {
			$this->data->plugin = [
				'version' => defined( 'REMOTE_DATA_BLOCKS__PLUGIN_VERSION' ) ? constant( 'REMOTE_DATA_BLOCKS__PLUGIN_VERSION' ) : 'unknown',
			];
		}

		public function tear_down(): void {}

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
	}
}
