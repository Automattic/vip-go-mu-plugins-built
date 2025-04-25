<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Output_Html_Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Output_Html_Logger' ) ) {
	class RdbValidationOutputHtml extends QM_Output_Html_Logger {
		public static string $collector_id = 'remote-data-blocks-validation';

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

			paremt::output();
		}


		public function admin_menu( array $menu ): array {
			/** @var QM_Data_Logger $data */
			$data = $this->collector->get_data();
			$count = 0;

			if ( ! empty( $data->logs ) ) {
				$count = count( $data->logs );

				/* translators: %s: Number of logs that are available */
				$label = __( 'Validation (%s)', 'query-monitor' );
			} else {
				$label = __( 'Validation', 'query-monitor' );
			}

			$menu['qm-remote-data-blocks']['children'][ $this->collector->id() ] = $this->menu( array(
				'id' => 'qm-remote-data-blocks-validation',
				'title' => esc_html( sprintf(
					$label,
					number_format_i18n( $count )
				) ),
			) );

			return $menu;
		}
	}
}
