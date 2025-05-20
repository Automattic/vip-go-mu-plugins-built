<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Data_Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( __NAMESPACE__ . '\RdbLogCollector' ) ) {
	/**
	 * @extends QM_Collector<QM_Data_Logger>
	 */
	class RdbBlockBindingCollector extends RdbLogCollector {
		/**
		 * @var string
		 */
		public $id = 'remote-data-blocks-block-binding';

		/**
		 * @var string
		 */
		public string $log_type = 'block-binding';
	}
}
