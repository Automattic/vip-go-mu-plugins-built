<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Logging\QueryMonitor;

use QueryMonitor as QM;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( class_exists( __NAMESPACE__ . '\RdbLogOutputHtml' ) ) {
	class RdbBlockBindingOutputHtml extends RdbLogOutputHtml {
		public static string $collector_id = 'remote-data-blocks-block-binding';
		protected string $menu_title = 'Block bindings';

		public function output(): void {
			/** @var QM_Data_Logger $data */
			$data = $this->collector->get_data();

			if ( ! empty( $data->logs ) ) {
				$block_names = array_unique( array_column( $data->logs, 'block_name' ) );
				$levels = array_unique( array_column( $data->logs, 'level' ) );
				$remote_data_block_names = array_unique( array_column( $data->logs, 'remote_data_block_name' ) );

				$this->before_tabular_output();

				echo '<thead>';
				echo '<tr>';
				echo '<th scope="col" class="qm-filterable-column">';
				echo $this->build_filter( 'result', $levels, __( 'Level', 'remote-data-blocks' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo '</th>';
				echo '<th scope="col">' . esc_html__( 'Message', 'remote-data-blocks' ) . '</th>';
				echo '<th scope="col" class="qm-filterable-column">';
				echo $this->build_filter( 'component', $remote_data_block_names, __( 'Remote data block', 'remote-data-blocks' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo '</th>';
				echo '<th scope="col" class="qm-filterable-column">';
				echo $this->build_filter( 'type', $block_names, __( 'Block', 'remote-data-blocks' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo '</th>';
				echo '<th scope="col">' . esc_html__( 'Post ID', 'remote-data-blocks' ) . '</th>';
				echo '<th scope="col">' . esc_html__( 'Caller', 'remote-data-blocks' ) . '</th>';
				echo '</tr>';
				echo '</thead>';

				echo '<tbody>';

				foreach ( $data->logs as $row ) {
					$row_attr = [];
					$class = '';

					$is_warning = in_array( $row['level'], $this->collector->get_warning_levels(), true );

					if ( $is_warning ) {
						$class = 'qm-warn';
					}

					$stack = array();

					foreach ( $row['filtered_trace'] as $frame ) {
						$stack[] = self::output_filename( $frame['display'], $frame['calling_file'], $frame['calling_line'] );
					}

					// These tokens are chosen to match the filters that ship in QM core.
					$row_attr['data-qm-component'] = $row['remote_data_block_name'];
					$row_attr['data-qm-result'] = $row['level'];
					$row_attr['data-qm-type'] = $row['block_name'];

					$attr = '';
					foreach ( $row_attr as $a => $v ) {
						$attr .= ' ' . $a . '="' . esc_attr( (string) $v ) . '"';
					}

					printf(
						'<tr %s class="%s">',
						$attr, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						esc_attr( $class )
					);

					/* Level */
					echo '<td class="qm-nowrap">';

					if ( $is_warning ) {
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo QM::icon( 'warning' );
					} else {
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo QM::icon( 'blank' );
					}

					echo esc_html( ucfirst( $row['level'] ) );
					echo '</td>';

					/* Message */
					printf(
						'<td>%s</td>',
						esc_html( $row['message'] )
					);

					/* Remote data block */
					printf(
						'<td>%s</td>',
						esc_html( $row['remote_data_block_name'] )
					);

					/* Block */
					echo '<td class="qm-has-toggle qm-ltr qm-wrap">';
					echo self::build_toggler(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					echo esc_html( $row['block_name'] );
					echo '<div class="qm-toggled qm-info qm-supplemental">';
					echo '<table><tbody>';
					foreach ( $row['block_info'] as $key => $value ) {
						echo '<tr>';
						echo '<td>' . esc_html( $key ) . '</td>';
						echo '<td><pre><code>' . esc_html( wp_json_encode( $value ) ) . '</code></pre></td>';
						echo '</tr>';
					}
					echo '</tbody></table>';
					echo '</div></td>';

					/* Post ID */
					printf(
						'<td>%s</td>',
						esc_html( strval( $row['post_id'] ) )
					);

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

				$this->after_tabular_output();
			} else {
				$this->before_non_tabular_output();

				$notice = __( 'No block bindings.', 'remote-data-blocks' );
				echo $this->build_notice( $notice ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

				$this->after_non_tabular_output();
			}
		}
	}
}
