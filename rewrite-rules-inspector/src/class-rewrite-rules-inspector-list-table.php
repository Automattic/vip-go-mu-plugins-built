<?php
/**
 * Rewrite Rules Inspector List Table class
 *
 * @package automattic\rewrite-rules-inspector
 * @since 1.3.0
 */

/**
 * Display the rewrite rules in an easy to digest list table.
 *
 * @since 1.0.0
 */
class Rewrite_Rules_Inspector_List_Table extends WP_List_Table {
	/**
	 * Construct the list table.
	 *
	 * @since 1.0.0
	 *
	 * @param array $rules Rewrite rules.
	 */
	public function __construct( $rules ) {
		$this->items = $rules;

		parent::__construct(
			array(
				'plural' => 'Rewrite Rules',
			)
		);
	}

	/**
	 * Load all of the matching rewrite rules into our list table.
	 *
	 * @since 1.0.0
	 */
	public function prepare_items() {
		$columns               = $this->get_columns();
		$hidden                = array();
		$sortable              = array();
		$this->_column_headers = array( $columns, $hidden, $sortable );
	}

	/**
	 * What to print when no items were found.
	 *
	 * @since 1.0.0
	 */
	public function no_items() {
		esc_html_e( 'No rewrite rules were found.', 'rewrite-rules-inspector' );
	}

	/**
	 * Display the navigation for the list table.
	 *
	 * @since 1.0.0
	 *
	 * @param string $which The location of the bulk actions: 'top' or 'bottom'.
	 */
	public function display_tablenav( $which ) {
		global $plugin_page, $rewrite_rules_inspector;

		$search = ! empty( $_GET['s'] ) ? sanitize_text_field( $_GET['s'] ) : '';

		if ( 'bottom' === $which ) {
			return false;
		}
		?>
		<div class="custom-tablenav-top" style="padding-top:5px;padding-bottom:10px;">
			<div style="float:right;">
				<?php
				// Only show the flush button if enabled.
				if ( $rewrite_rules_inspector->flushing_enabled ) :
					?>
					<?php
					// Flush the current set of rewrite rules.
					$args = array(
						'action'   => 'flush-rules',
						'_wpnonce' => wp_create_nonce( 'flush-rules' ),
					);

					$flush_url = add_query_arg( $args, menu_page_url( $plugin_page, false ) );
					?>
					<a title="<?php esc_attr_e( 'Flush your rewrite rules to regenerate them', 'rewrite-rules-inspector' ); ?>" class="button-secondary" href="<?php echo esc_url( $flush_url ); ?>"><?php esc_html_e( 'Flush Rules', 'rewrite-rules-inspector' ); ?></a>
				<?php endif; ?>
				<?php
				// Prepare the link to download a set of rules.
				// Link is contingent on the current filter state.
				$args = array(
					'action'   => 'download-rules',
					'_wpnonce' => wp_create_nonce( 'download-rules' ),
				);

				$args['source'] = 'all';
				if ( isset( $_GET['source'] ) && in_array( $_GET['source'], $rewrite_rules_inspector->sources, true ) ) {
					$args['source'] = sanitize_key( $_GET['source'] );
				}
				$args['s'] = ! empty( $_GET['s'] ) ? sanitize_text_field( $_GET['s'] ) : '';

				$download_url = add_query_arg( $args, menu_page_url( $plugin_page, false ) );
				?>
				<a title="<?php esc_attr_e( 'Download current list of rules as a .txt file', 'rewrite-rules-inspector' ); ?>" class="button-secondary" href="<?php echo esc_url( $download_url ); ?>"><?php esc_html_e( 'Download', 'rewrite-rules-inspector' ); ?></a>
			</div>
			<form method="GET">
				<label for="s"><?php esc_html_e( 'Match URL:', 'rewrite-rules-inspector' ); ?></label>
				<input type="text" id="s" name="s" value="<?php echo esc_attr( $search ); ?>" size="50"/>
				<input type="hidden" id="page" name="page" value="<?php echo esc_attr( $plugin_page ); ?>" />
				<label for="source"><?php esc_html_e( 'Rule Source:', 'rewrite-rules-inspector' ); ?></label>
				<select id="source" name="source">
					<?php
					$filter_source = 'all';
					if ( isset( $_GET['source'] ) && in_array( $_GET['source'], $rewrite_rules_inspector->sources, true ) ) {
						$filter_source = sanitize_key( $_GET['source'] );
					}
					foreach ( $rewrite_rules_inspector->sources as $value ) {
						echo '<option value="' . esc_attr( $value ) . '" ';
						selected( $filter_source, $value );
						echo '>' . esc_html( $value ) . '</option>';
					}
					?>
				</select>
				<?php submit_button( __( 'Filter', 'rewrite-rules-inspector' ), 'primary', null, false ); ?>
				<?php if ( $search || ! empty( $_GET['source'] ) ) : ?>
					<a href="<?php echo esc_url( menu_page_url( $plugin_page, false ) ); ?>" class="button-secondary"><?php esc_html_e( 'Reset', 'rewrite-rules-inspector' ); ?></a>
				<?php endif; ?>
			</form>
		</div>
		<?php
	}

	/**
	 * Define the columns for our list table.
	 *
	 * @since 1.0.0
	 */
	public function get_columns() {
		return array(
			'rule'    => __( 'Rule', 'rewrite-rules-inspector' ),
			'rewrite' => __( 'Rewrite', 'rewrite-rules-inspector' ),
			'source'  => __( 'Source', 'rewrite-rules-inspector' ),
		);
	}

	/**
	 * Display each row of rewrite rule data.
	 *
	 * @since 1.0.0
	 */
	public function display_rows() {
		foreach ( $this->items as $rewrite_rule => $rewrite_data ) {
			$rewrite_data['rule'] = $rewrite_rule;
			$this->single_row( $rewrite_data );
		}
	}

	/**
	 * Display a single row of rewrite rule data.
	 *
	 * @since 1.0.0
	 *
	 * @param array $item Rewrite data.
	 */
	public function single_row( $item ) {
		$rule    = $item['rule'];
		$source  = $item['source'];
		$rewrite = $item['rewrite'];

		$class = 'source-' . $source;

		echo '<tr class="', esc_attr( $class ), '">';

		list( $columns, $hidden ) = $this->get_column_info();

		foreach ( $columns as $column_name => $column_display_name ) {
			switch ( $column_name ) {
				case 'rule':
					echo '<td class="column-rule"><strong>', esc_html( $rule ), '</strong></td>';
					break;
				case 'rewrite':
					echo '<td class="column-rewrite">', esc_html( $rewrite ), '</td>';
					break;
				case 'source':
					echo '<td class="column-source">', esc_html( $source ), '</td>';
					break;
			}
		}

		echo '</tr>';
	}
}
