<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( __NAMESPACE__ . '\RdbLogCollector' ) ) {
	class RdbValidationCollector extends RdbLogCollector {
		/**
		 * @var string
		 */
		public $id = 'remote-data-blocks-validation';

		/**
		 * @var string
		 */
		public string $log_type = 'validation';
	}
}
