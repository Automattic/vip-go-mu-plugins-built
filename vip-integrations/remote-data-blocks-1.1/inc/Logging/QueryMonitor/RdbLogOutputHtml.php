<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Output_Html_Logger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Output_Html_Logger' ) ) {
	class RdbLogOutputHtml extends QM_Output_Html_Logger {
		public static string $collector_id = 'remote-data-blocks-logs';
		protected string $menu_title = 'Logs';

		/**
		 * @param array<string, mixed[]> $menu
		 * @return array<string, mixed[]>
		 */
		public function admin_menu( array $menu ): array {
			/** @var QM_Data_HTTP $data */
			$data = $this->collector->get_data();
			$label = $this->menu_title;

			if ( ! empty( $data->logs ) ) {
				$label = sprintf( '%s (%s)', $this->menu_title, number_format_i18n( count( $data->logs ) ) );
			}

			$menu['qm-remote-data-blocks']['children'][ $this->collector->id() ] = $this->menu( [
				'id' => $this->collector->id(),
				'title' => esc_html( $label ),
			] );

			return $menu;
		}
	}
}
