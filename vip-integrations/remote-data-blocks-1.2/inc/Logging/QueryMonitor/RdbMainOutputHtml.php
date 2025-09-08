<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Output_Html;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Output_Html' ) ) {
	class RdbMainOutputHtml extends QM_Output_Html {
		public static string $collector_id = 'remote-data-blocks';

		public function __construct( RdbMainCollector $collector ) {
			parent::__construct( $collector );
			add_filter( 'qm/output/menus', [ $this, 'admin_menu' ], 5, 1 ); // early
		}
	
		public function name(): string {
			return 'Remote Data Blocks';
		}

		public function output(): void {
			$data = $this->collector->get_data();

			$this->before_non_tabular_output();

			echo '<section>';
			echo '<h3>' . esc_html__( 'Plugin', 'remote-data-blocks' ) . '</h3>';
			echo '<table>';

			foreach ( array(
				'version' => __( 'Version', 'remote-data-blocks' ),
			) as $item => $name ) {
				echo '<tr>';
				echo '<th scope="row">' . esc_html( $name ) . '</td>';
				echo '<td class="qm-ltr qm-wrap">' . esc_html( $data['plugin'][ $item ] ?? 'unknown' ) . '</td>';
				echo '</tr>';
			}

			echo '</table>';
			echo '</section>';

			$this->after_non_tabular_output();
		}
	}
}
