<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( __NAMESPACE__ . '\RdbLogOutputHtml' ) ) {
	class RdbValidationOutputHtml extends RdbLogOutputHtml {
		public static string $collector_id = 'remote-data-blocks-validation';
		protected string $menu_title = 'Validation';

		public function output(): void {
			/** @var QM_Data_Logger $data */
			$data = $this->collector->get_data();

			if ( empty( $data->logs ) ) {
				$this->before_non_tabular_output();

				$notice = __( 'No validation issues.', 'remote-data-blocks' );
				echo $this->build_notice( $notice ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

				$this->after_non_tabular_output();

				return;
			}

			parent::output();
		}
	}
}
