<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QM_Output_Html_HTTP;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( 'QM_Output_Html' ) ) {
	class RdbHttpRequestOutputHtml extends QM_Output_Html_HTTP {
		public static string $collector_id = 'remote-data-blocks-http';

		public function output(): void {
			/** @var QM_Data_HTTP $data */
			$data = $this->collector->get_data();

			if ( ! empty( $data->http ) ) {
				$cache_statuses = array_unique( array_column( $data->http, 'cache_status' ) );
				$hostnames = array_unique( array_column( $data->http, 'hostname' ) );
				$statuses = array_unique( array_column( $data->http, 'status_code' ) );

				$this->before_tabular_output();

				echo '<thead>';
				echo '<tr>';
				echo '<th scope="col">' . esc_html__( 'Method', 'remote-data-blocks' ) . '</th>';
				echo '<th scope="col" class="qm-filterable-column">';
				echo $this->build_filter( 'type', $statuses, __( 'Status', 'remote-data-blocks' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo '</th>';
				echo '<th scope="col" class="qm-filterable-column">';
				echo $this->build_filter( 'host', $hostnames, __( 'URL', 'remote-data-blocks' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo '</th>';
				echo '<th scope="col" class="qm-filterable-column">';
				echo $this->build_filter( 'result', $cache_statuses, __( 'Cache status', 'remote-data-blocks' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo '</th>';
				echo '<th scope="col">' . esc_html__( 'Caller', 'remote-data-blocks' ) . '</th>';
				echo '</tr>';
				echo '</thead>';

				echo '<tbody>';

				foreach ( $data->http as $row ) {
					$row_attr = [];
					$css = '';

					if ( $row['error'] ) {
						$css = 'qm-warn';
					}

					$uri = self::format_url( $row['uri'] );

					$uri = preg_replace( '|^http:|', '<span class="qm-warn">http</span>:', $uri );

					$stack = array();
					$filtered_trace = $row['trace']->get_filtered_trace();

					foreach ( $filtered_trace as $frame ) {
						$stack[] = self::output_filename( $frame['display'], $frame['calling_file'], $frame['calling_line'] );
					}

					// These tokens are chosen to match the filters that ship in QM core.
					$row_attr['data-qm-host'] = $row['hostname'];
					$row_attr['data-qm-result'] = empty( $row['cache_status'] ) ? 'None' : $row['cache_status'];
					$row_attr['data-qm-type'] = $row['status_code'];

					$attr = '';
					foreach ( $row_attr as $a => $v ) {
						$attr .= ' ' . $a . '="' . esc_attr( (string) $v ) . '"';
					}

					printf(
						'<tr %s class="%s">',
						$attr, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						esc_attr( $css )
					);

					/* Method */
					printf(
						'<td>%s</td>',
						esc_html( $row['method'] )
					);

					/* Status code */
					printf(
						'<td>%s</td>',
						esc_html( $row['status_code'] )
					);

					/* URL */
					printf(
						'<td class="qm-url qm-ltr qm-wrap">%s</td>',
						$uri // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					);

					/* Cache status */
					echo '<td class="qm-has-toggle qm-ltr qm-nowrap">';
					echo self::build_toggler(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					echo '<ol>';
					echo '<li>' . esc_html( $row['cache_status'] ) . '</li>';
					echo '<div class="qm-toggled qm-info qm-supplemental">';

					if ( '' !== $row['cache_age'] ) {
						echo '<li>Age: ' . esc_html( strval( $row['cache_age'] ) ) . '</li>';
					}

					echo '<li>Cache key: ' . esc_html( $row['cache_key'] ) . '</li>';
					echo '<li>Cache group: ' . esc_html( $row['cache_group'] ) . '</li>';
					echo '</div></ol></td>';

					/* Caller / trace */

					$caller = array_shift( $stack );
					echo '<td class="qm-has-toggle qm-nowrap qm-ltr">';

					if ( ! empty( $stack ) ) {
						echo self::build_toggler(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}

					echo '<ol>';
					echo '<li>' . $caller . '</li>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

					if ( ! empty( $stack ) ) {
						echo '<div class="qm-toggled"><li>' . implode( '</li><li>', $stack ) . '</li></div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					}

					echo '</ol></td>';

					echo '</tr>';
				}

				echo '</tbody>';
				echo '<tfoot>';
				echo '<tr>';
				echo '<td colspan="5">See the "HTTP API Calls" Query Monitor panel for additional details on requests that were not resolved from cache.</td>';
				echo '</tr>';
				echo '</tfoot>';

				$this->after_tabular_output();
			} else {
				$this->before_non_tabular_output();

				$notice = __( 'No query executions.', 'remote-data-blocks' );
				echo $this->build_notice( $notice ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

				$this->after_non_tabular_output();
			}
		}

		/**
		 * @param array<string, mixed[]> $menu
		 * @return array<string, mixed[]>
		 */
		public function admin_menu( array $menu ): array {
			/** @var QM_Data_HTTP $data */
			$data = $this->collector->get_data();
			$count = 0;

			if ( ! empty( $data->http ) ) {
				$count = count( $data->http );

				/* translators: %s: Number of logs that are available */
				$label = __( 'Queries (%s)', 'remote-data-blocks' );
			} else {
				$label = __( 'Queries', 'remote-data-blocks' );
			}

			$menu['qm-remote-data-blocks']['children'][ $this->collector->id() ] = $this->menu( [
				'id' => 'remote-data-blocks-validation',
				'title' => esc_html( sprintf(
					$label,
					number_format_i18n( $count )
				) ),

			] );
			return $menu;
		}
	}
}
