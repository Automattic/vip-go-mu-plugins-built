<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Output_Raw_Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Output_Raw_Logger' ) ) {
	class RdbLogOutputRaw extends QM_Output_Raw_Logger {
		public static string $collector_id = 'remote-data-blocks-logs';

		public function get_output(): array {
			/** @var QM_Data_Logger $data */
			$data = $this->collector->get_data();

			return $data->logs ?? [];
		}
	}
}
