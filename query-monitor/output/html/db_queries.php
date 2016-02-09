<?php
/*
Copyright 2009-2015 John Blackbourn

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

*/

class QM_Output_Html_DB_Queries extends QM_Output_Html {

	public $query_row = 0;

	public function __construct( QM_Collector $collector ) {
		parent::__construct( $collector );
		add_filter( 'qm/output/menus', array( $this, 'admin_menu' ), 20 );
		add_filter( 'qm/output/title', array( $this, 'admin_title' ), 20 );
		add_filter( 'qm/output/menu_class', array( $this, 'admin_class' ) );
	}

	public function output() {

		$data = $this->collector->get_data();

		if ( empty( $data['dbs'] ) ) {
			$this->output_empty_queries();
			return;
		}

		if ( !empty( $data['errors'] ) ) {
			$this->output_error_queries( $data['errors'] );
		}

		if ( !empty( $data['expensive'] ) ) {
			$this->output_expensive_queries( $data['expensive'] );
		}

		foreach ( $data['dbs'] as $name => $db ) {
			$this->output_queries( $name, $db, $data );
		}

	}

	protected function output_empty_queries() {

		echo '<div class="qm qm-queries" id="' . esc_attr( $this->collector->id() ) . '-wpdb">';
		echo '<table cellspacing="0">';
		echo '<thead>';
		echo '<tr>';
		echo '<th>' . esc_html__( 'Database Queries', 'query-monitor' ) . '</th>';
		echo '</tr>';
		echo '</thead>';
		echo '<tbody>';
		echo '<tr>';
		echo '<td class="qm-warn">';
		printf( esc_html__( 'No database queries were logged because the %s constant is set to %s', 'query-monitor' ),
			'<code>SAVEQUERIES</code>',
			'<code>false</code>'
		);
		echo '</td>';
		echo '</tr>';
		echo '</tbody>';
		echo '</table>';
		echo '</div>';

	}

	protected function output_error_queries( array $errors ) {

		echo '<div class="qm qm-queries" id="qm-query-errors">';
		echo '<table cellspacing="0">';
		echo '<thead>';
		echo '<tr>';
		echo '<th colspan="4">' . esc_html__( 'Database Errors', 'query-monitor' ) . '</th>';
		echo '</tr>';
		echo '<tr>';
		echo '<th>' . esc_html__( 'Query', 'query-monitor' ) . '</th>';
		echo '<th>' . esc_html__( 'Call Stack', 'query-monitor' ) . '</th>';
		echo '<th>' . esc_html__( 'Component', 'query-monitor' ) . '</th>';
		echo '<th>' . esc_html__( 'Error', 'query-monitor' ) . '</th>';
		echo '</tr>';
		echo '</thead>';
		echo '<tbody>';

		foreach ( $errors as $row ) {
			$this->output_query_row( $row, array( 'sql', 'stack', 'component', 'result' ) );
		}

		echo '</tbody>';
		echo '</table>';
		echo '</div>';

	}

	protected function output_expensive_queries( array $expensive ) {

		$dp = strlen( substr( strrchr( QM_DB_EXPENSIVE, '.' ), 1 ) );

		echo '<div class="qm qm-queries" id="qm-query-expensive">';
		echo '<table cellspacing="0">';
		echo '<thead>';
		echo '<tr>';
		echo '<th colspan="5" class="qm-expensive">';
		printf( esc_html__( 'Slow Database Queries (above %ss)', 'query-monitor' ),
			'<span class="qm-expensive">' . esc_html( number_format_i18n( QM_DB_EXPENSIVE, $dp ) ) . '</span>'
		);
		echo '</th>';
		echo '</tr>';
		echo '<tr>';
		echo '<th scope="col">' . esc_html__( 'Query', 'query-monitor' ) . '</th>';
		echo '<th scope="col">' . esc_html__( 'Caller', 'query-monitor' ) . '</th>';

		if ( isset( $expensive[0]['component'] ) ) {
			echo '<th scope="col">' . esc_html__( 'Component', 'query-monitor' ) . '</th>';
		}

		if ( isset( $expensive[0]['result'] ) ) {
			echo '<th scope="col" class="qm-num">' . esc_html__( 'Affected Rows', 'query-monitor' ) . '</th>';
		}

		echo '<th class="qm-num">' . esc_html__( 'Time', 'query-monitor' ) . '</th>';
		echo '</tr>';
		echo '</thead>';
		echo '<tbody>';

		foreach ( $expensive as $row ) {
			$this->output_query_row( $row, array( 'sql', 'caller', 'component', 'result', 'time' ) );
		}

		echo '</tbody>';
		echo '</table>';
		echo '</div>';

	}

	protected function output_queries( $name, stdClass $db, array $data ) {

		$span = 4;

		if ( $db->has_result ) {
			$span++;
		}
		if ( $db->has_trace ) {
			$span++;
		}

		echo '<div class="qm qm-queries" id="' . esc_attr( $this->collector->id() . '-' . sanitize_title_with_dashes( $name ) ) . '">';
		echo '<table cellspacing="0" class="qm-sortable">';
		echo '<thead>';
		echo '<tr>';
		echo '<th colspan="' . absint( $span ) . '">' . esc_html( sprintf( __( '%s Queries', 'query-monitor' ), $name ) ) . '</th>';
		echo '</tr>';

		if ( !empty( $db->rows ) ) {

			if ( ! $db->has_trace && ( '$wpdb' === $name ) ) {
				echo '<tr>';
				echo '<td colspan="' . absint( $span ) . '" class="qm-warn">';
				echo wp_kses( sprintf(
					__( 'Extended query information such as the component and affected rows is not available. Query Monitor was unable to symlink its %1$s file into place. <a href="%2$s" target="_blank">See this wiki page for more information.</a>', 'query-monitor' ),
					'<code>db.php</code>',
					'https://github.com/johnbillion/query-monitor/wiki/db.php-Symlink'
				), array(
					'a' => array(
						'href'   => array(),
						'target' => array(),
					),
				) );
				echo '</td>';
				echo '</tr>';
			}

			echo '<tr>';
			echo '<th scope="col" class="qm-sorted-asc">&nbsp;';
			echo $this->build_sorter(); // WPCS: XSS ok;
			echo '</th>';
			echo '<th scope="col">';
			esc_html_e( 'Query', 'query-monitor' );
			echo $this->build_filter( 'type', array_keys( $db->types ) ); // WPCS: XSS ok;
			echo '</th>';
			echo '<th scope="col">';
			esc_html_e( 'Caller', 'query-monitor' );
			echo $this->build_filter( 'caller', wp_list_pluck( $data['times'], 'caller' ) ); // WPCS: XSS ok;
			echo '</th>';

			if ( $db->has_trace ) {
				echo '<th scope="col">';
				esc_html_e( 'Component', 'query-monitor' );
				echo $this->build_filter( 'component', wp_list_pluck( $data['component_times'], 'component' ) ); // WPCS: XSS ok.
				echo '</th>';
			}

			if ( $db->has_result ) {
				if ( empty( $data['errors'] ) ) {
					$class = 'qm-num';
				} else {
					$class = '';
				}
				echo '<th scope="col" class="' . esc_attr( $class ) . '">';
				esc_html_e( 'Rows', 'query-monitor' );
				echo $this->build_sorter(); // WPCS: XSS ok.
				echo '</th>';
			}

			echo '<th scope="col" class="qm-num">';
			esc_html_e( 'Time', 'query-monitor' );
			echo $this->build_sorter(); // WPCS: XSS ok.
			echo '</th>';
			echo '</tr>';

		}

		echo '</thead>';

		if ( !empty( $db->rows ) ) {

			echo '<tbody>';

			foreach ( $db->rows as $row ) {
				$this->output_query_row( $row, array( 'row', 'sql', 'caller', 'component', 'result', 'time' ) );
			}

			echo '</tbody>';
			echo '<tfoot>';

			$total_stime = number_format_i18n( $db->total_time, 4 );

			echo '<tr class="qm-items-shown qm-hide">';
			echo '<td colspan="' . absint( $span - 1 ) . '">';
			printf(
				esc_html__( 'Queries in filter: %s', 'query-monitor' ),
				'<span class="qm-items-number">' . esc_html( number_format_i18n( $db->total_qs ) ) . '</span>'
			);
			echo '</td>';
			echo '<td class="qm-items-time qm-num">' . esc_html( $total_stime ) . '</td>';
			echo '</tr>';

			echo '<tr>';
			echo '<td colspan="' . absint( $span - 1 ) . '">';
			echo esc_html( sprintf(
				__( 'Total Queries: %s', 'query-monitor' ),
				number_format_i18n( $db->total_qs )
			) );
			echo '</td>';
			echo '<td class="qm-num">' . esc_html( $total_stime ) . '</td>';
			echo '</tr>';
			echo '</tfoot>';

		} else {

			echo '<tbody>';
			echo '<tr>';
			echo '<td colspan="' . absint( $span ) . '" style="text-align:center !important"><em>' . esc_html__( 'none', 'query-monitor' ) . '</em></td>';
			echo '</tr>';
			echo '</tbody>';

		}

		echo '</table>';
		echo '</div>';

	}

	protected function output_query_row( array $row, array $cols ) {

		$cols = array_flip( $cols );

		if ( !isset( $row['component'] ) ) {
			unset( $cols['component'] );
		}
		if ( !isset( $row['result'] ) ) {
			unset( $cols['result'] );
		}
		if ( !isset( $row['stack'] ) ) {
			unset( $cols['stack'] );
		}

		$stime = number_format_i18n( $row['ltime'], 4 );
		$td = $this->collector->is_expensive( $row ) ? ' qm-expensive' : '';

		$sql = self::format_sql( $row['sql'] );

		if ( 'SELECT' != $row['type'] ) {
			$sql = "<span class='qm-nonselectsql'>{$sql}</span>";
		}

		if ( isset( $row['trace'] ) ) {

			$caller         = $row['trace']->get_caller();
			$caller_name    = self::output_filename( $row['caller'], $caller['calling_file'], $caller['calling_line'] );
			$stack          = array();
			$filtered_trace = $row['trace']->get_filtered_trace();
			array_shift( $filtered_trace );

			foreach ( $filtered_trace as $item ) {
				$stack[] = self::output_filename( $item['display'], $item['calling_file'], $item['calling_line'] );
			}

		} else {

			$caller_name = esc_html( $row['caller'] );
			$stack       = explode( ', ', $row['stack'] );
			$stack       = array_reverse( $stack );
			array_shift( $stack );
			$stack       = array_map( 'esc_html', $stack );

		}

		$row_attr = array();

		if ( is_wp_error( $row['result'] ) ) {
			$row_attr['class'] = 'qm-warn';
		}
		if ( isset( $cols['sql'] ) ) {
			$row_attr['data-qm-type'] = $row['type'];
		}
		if ( isset( $cols['component'] ) ) {
			$row_attr['data-qm-component'] = $row['component']->name;
		}
		if ( isset( $cols['caller'] ) ) {
			$row_attr['data-qm-caller'] = $row['caller_name'];
		}
		if ( isset( $cols['time'] ) ) {
			$row_attr['data-qm-time'] = $row['ltime'];
		}

		$attr = '';

		foreach ( $row_attr as $a => $v ) {
			$attr .= ' ' . $a . '="' . esc_attr( $v ) . '"';
		}

		echo "<tr{$attr}>"; // WPCS: XSS ok.

		if ( isset( $cols['row'] ) ) {
			echo '<td class="qm-row-num qm-num">' . absint( ++$this->query_row ) . '</td>';
		}

		if ( isset( $cols['sql'] ) ) {
			printf( '<td class="qm-row-sql qm-ltr qm-wrap">%s</td>',
				$sql
			); // WPCS: XSS ok.
		}

		if ( isset( $cols['caller'] ) ) {
			echo "<td class='qm-row-caller qm-ltr qm-has-toggle qm-nowrap'><div class='qm-toggler'>";

			echo $caller_name; // WPCS: XSS ok.

			if ( ! empty( $stack ) ) {
				echo '<a href="#" class="qm-toggle" data-on="+" data-off="-">+</a>';
				echo '<div class="qm-toggled">' . implode( '<br>', $stack ) . '</div>'; // WPCS: XSS ok.
			}

			echo '</div></td>';
		}

		if ( isset( $cols['stack'] ) ) {
			echo '<td class="qm-row-caller qm-row-stack qm-nowrap qm-ltr">';
			echo $caller_name; // WPCS: XSS ok.
			echo '<br>' . implode( '<br>', $stack ) . '</td>'; // WPCS: XSS ok.
		}

		if ( isset( $cols['component'] ) ) {
			echo "<td class='qm-row-component qm-nowrap'>" . esc_html( $row['component']->name ) . "</td>\n";
		}

		if ( isset( $cols['result'] ) ) {
			if ( is_wp_error( $row['result'] ) ) {
				echo "<td class='qm-row-result qm-row-error'>" . esc_html( $row['result']->get_error_message() ) . "</td>\n";
			} else {
				echo "<td class='qm-row-result qm-num'>" . esc_html( $row['result'] ) . "</td>\n";
			}

		}

		if ( isset( $cols['time'] ) ) {
			echo '<td class="qm-num qm-row-time' . esc_attr( $td ) . '">'. esc_html( $stime ) . "</td>\n";
		}

		echo '</tr>';

	}

	public function admin_title( array $title ) {

		$data = $this->collector->get_data();

		if ( isset( $data['dbs'] ) ) {
			foreach ( $data['dbs'] as $db ) {
				$title[] = sprintf(
					_x( '%s<small>S</small>', 'database query time', 'query-monitor' ),
					number_format_i18n( $db->total_time, 4 )
				);
				$title[] = sprintf(
					_x( '%s<small>Q</small>', 'database query number', 'query-monitor' ),
					number_format_i18n( $db->total_qs )
				);
			}
		}
		return $title;
	}

	public function admin_class( array $class ) {

		if ( $this->collector->get_errors() ) {
			$class[] = 'qm-error';
		}
		if ( $this->collector->get_expensive() ) {
			$class[] = 'qm-expensive';
		}
		return $class;

	}

	public function admin_menu( array $menu ) {

		$data = $this->collector->get_data();

		if ( $errors = $this->collector->get_errors() ) {
			$menu[] = $this->menu( array(
				'id'    => 'query-monitor-errors',
				'href'  => '#qm-query-errors',
				'title' => esc_html( sprintf(
					__( 'Database Errors (%s)', 'query-monitor' ),
					number_format_i18n( count( $errors ) )
				) ),
			) );
		}
		if ( $expensive = $this->collector->get_expensive() ) {
			$menu[] = $this->menu( array(
				'id'    => 'query-monitor-expensive',
				'href'  => '#qm-query-expensive',
				'title' => esc_html( sprintf(
					__( 'Slow Queries (%s)', 'query-monitor' ),
					number_format_i18n( count( $expensive ) )
				) ),
			) );
		}

		if ( isset( $data['dbs'] ) and count( $data['dbs'] ) > 1 ) {
			foreach ( $data['dbs'] as $name => $db ) {
				$menu[] = $this->menu( array(
					'id'    => esc_attr( sprintf( 'query-monitor-%s-db-%s', $this->collector->id(), sanitize_title_with_dashes( $name ) ) ),
					'title' => esc_html( sprintf(
						__( 'Queries - %s', 'query-monitor' ),
						$name
					) ),
					'href'  => esc_attr( sprintf( '#%s-%s', $this->collector->id(), sanitize_title_with_dashes( $name ) ) ),
				) );
			}
		} else {
			$menu[] = $this->menu( array(
				'title' => esc_html__( 'Queries', 'query-monitor' ),
				'href'  => esc_attr( sprintf( '#%s-wpdb', $this->collector->id() ) ),
			) );
		}

		return $menu;

	}

}

function register_qm_output_html_db_queries( array $output, QM_Collectors $collectors ) {
	if ( $collector = QM_Collectors::get( 'db_queries' ) ) {
		$output['db_queries'] = new QM_Output_Html_DB_Queries( $collector );
	}
	return $output;
}

add_filter( 'qm/outputter/html', 'register_qm_output_html_db_queries', 20, 2 );
