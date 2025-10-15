<?php

declare(strict_types=1);

namespace Automattic\RewriteRulesInspector\Admin;

// Ensure WP_List_Table is available.
if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . '/wp-admin/includes/class-wp-list-table.php';
}

/**
 * Display the rewrite rules in an easy to digest list table.
 *
 * @package Automattic\RewriteRulesInspector\Admin
 * @since 1.0.0
 */
final class RewriteRulesTable extends \WP_List_Table {

	/**
	 * Available sources for filtering.
	 *
	 * @var array $sources
	 */
	private array $sources = [];

	/**
	 * Whether flushing is enabled.
	 *
	 * @var bool $flushing_enabled
	 */
	private bool $flushing_enabled = true;

	/**
	 * Construct the list table.
	 *
	 * @since 1.0.0
	 *
	 * @param array $rules Rewrite rules.
	 * @param array $sources Available sources for filtering.
	 * @param bool  $flushing_enabled Whether flushing is enabled.
	 */
	public function __construct( array $rules, array $sources = [], bool $flushing_enabled = true ) {
		$this->items = $rules;
		$this->sources = $sources;
		$this->flushing_enabled = $flushing_enabled;

		parent::__construct(
			[
				'plural' => 'Rewrite Rules',
			]
		);
	}

	/**
	 * Load all of the matching rewrite rules into our list table.
	 *
	 * @since 1.0.0
	 */
	public function prepare_items() {
		$columns               = $this->get_columns();
		$hidden                = [];
		$sortable              = [];
		$this->_column_headers = [ $columns, $hidden, $sortable ];
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
	 * Display the list of views available on this table.
	 *
	 * @since 1.0.0
	 */
	public function get_views(): array {
		return [];
	}

	/**
	 * Display the search box.
	 *
	 * @since 1.0.0
	 * @param string $text The 'submit' button label.
	 * @param string $input_id ID attribute value for the search input field.
	 */
	public function search_box( $text, $input_id ) {
		// This is intentionally empty since we have a custom search box.
	}

	/**
	 * Display the pagination.
	 *
	 * @since 1.0.0
	 * @param string $which The location of the pagination: 'top' or 'bottom'.
	 */
	protected function pagination( $which ) {
		// This is intentionally empty since we don't paginate.
	}

	/**
	 * Display a view switcher.
	 *
	 * @since 1.0.0
	 * @param string $current_mode The current view mode.
	 */
	protected function view_switcher( $current_mode ) {
		// This is intentionally empty since we don't have view modes.
	}

	/**
	 * Display the bulk actions dropdown.
	 *
	 * @since 1.0.0
	 * @param string $which The location of the bulk actions: 'top' or 'bottom'.
	 */
	protected function bulk_actions( $which = '' ) {
		// This is intentionally empty since we don't have bulk actions.
	}

	/**
	 * Display the list table.
	 *
	 * @since 1.0.0
	 */
	public function display() {
		$this->display_tablenav( 'top' );
		
		// Only show the table if there are items to display
		if ( $this->has_items() ) {
			?>
			<table class="wp-list-table <?php echo esc_attr( implode( ' ', $this->get_table_classes() ) ); ?>">
				<thead>
					<tr>
						<?php $this->print_column_headers(); ?>
					</tr>
				</thead>

				<tbody id="the-list"<?php echo " data-wp-lists='list:{$this->_args['singular']}'"; ?>>
					<?php $this->display_rows_or_placeholder(); ?>
				</tbody>

				<tfoot>
					<tr>
						<?php $this->print_column_headers( false ); ?>
					</tr>
				</tfoot>
			</table>
			<?php
		}
		
		$this->display_tablenav( 'bottom' );
	}

	/**
	 * Display the table navigation.
	 *
	 * @since 1.0.0
	 * @param string $which The location of the extra table nav markup: 'top' or 'bottom'.
	 */
	protected function display_tablenav( $which ) {
		if ( 'top' !== $which ) {
			return;
		}

		global $plugin_page;
		$search = empty( $_GET['s'] ) ? '' : sanitize_text_field( $_GET['s'] );
		?>
		<div class="custom-tablenav-top">
			<div class="tablenav-actions">
				<?php
				// Show rules count for current selection
				$count = count( $this->items );
				$has_url_filter = ! empty( $_GET['s'] );
				$has_source_filter = isset( $_GET['source'] ) && 'all' !== $_GET['source'];
				
				if ( $has_url_filter || $has_source_filter ) {
					$count_text = sprintf(
						/* translators: %d: Number of rules */
						_n( '%d rule for this selection', '%d rules for this selection', $count, 'rewrite-rules-inspector' ),
						$count
					);
				} else {
					$count_text = sprintf(
						/* translators: %d: Number of rules */
						_n( '%d rule total', '%d rules total', $count, 'rewrite-rules-inspector' ),
						$count
					);
				}
				?>
				<span class="rri-rules-count"><?php echo esc_html( $count_text ); ?></span>
				
				<?php
				// Only show the flush button if enabled.
				if ( $this->flushing_enabled ) :
					?>
					<?php
					// Flush the current set of rewrite rules.
					$args = [
						'action'   => 'flush-rules',
						'_wpnonce' => wp_create_nonce( 'flush-rules' ),
					];

					$args['source'] = 'all';
					if ( isset( $_GET['source'] ) && in_array( $_GET['source'], $this->sources, true ) ) {
						$args['source'] = sanitize_key( $_GET['source'] );
					}

					$args['s'] = empty( $_GET['s'] ) ? '' : sanitize_text_field( $_GET['s'] );

					$flush_url = add_query_arg( $args, menu_page_url( $plugin_page, false ) );
					?>
					<a href="<?php echo esc_url( $flush_url ); ?>" class="button-secondary"><?php esc_html_e( 'Flush Rules', 'rewrite-rules-inspector' ); ?></a>
					<?php
				endif;

				// Download the current set of rewrite rules.
				$args = [
					'action'   => 'download-rules',
					'_wpnonce' => wp_create_nonce( 'download-rules' ),
				];

				$args['source'] = 'all';
				if ( isset( $_GET['source'] ) && in_array( $_GET['source'], $this->sources, true ) ) {
					$args['source'] = sanitize_key( $_GET['source'] );
				}

				$args['s'] = empty( $_GET['s'] ) ? '' : sanitize_text_field( $_GET['s'] );

				$download_url = add_query_arg( $args, menu_page_url( $plugin_page, false ) );
				?>
				<a href="<?php echo esc_url( $download_url ); ?>" class="button-secondary"><?php esc_html_e( 'Download', 'rewrite-rules-inspector' ); ?></a>
			</div>
			<form method="GET" id="rri-filter-form">
				<div class="rri-filter-row">
					<label for="s"><?php esc_html_e( 'Test URL:', 'rewrite-rules-inspector' ); ?></label>
					<input type="text" id="s" name="s" value="<?php echo esc_attr( $search ); ?>" size="50" placeholder="<?php esc_attr_e( 'Enter URL (e.g., /my-page/ or https://example.com/my-page/)', 'rewrite-rules-inspector' ); ?>"/>
					<input type="hidden" id="page" name="page" value="<?php echo esc_attr( $plugin_page ); ?>" />
					<label for="source"><?php esc_html_e( 'Rule Source:', 'rewrite-rules-inspector' ); ?></label>
					<select id="source" name="source">
						<?php
						$filter_source = 'all';
						if ( isset( $_GET['source'] ) && in_array( $_GET['source'], $this->sources, true ) ) {
							$filter_source = sanitize_key( $_GET['source'] );
						}

						foreach ( $this->sources as $value ) {
							echo '<option value="' . esc_attr( $value ) . '" ';
							selected( $filter_source, $value );
							echo '>' . esc_html( $value ) . '</option>';
						}
						?>
					</select>
					<?php submit_button( __( 'Test URL', 'rewrite-rules-inspector' ), 'primary', null, false ); ?>
					<?php if ( $search || ! empty( $_GET['source'] ) ) : ?>
						<a href="<?php echo esc_url( menu_page_url( $plugin_page, false ) ); ?>" class="button-secondary"><?php esc_html_e( 'Reset', 'rewrite-rules-inspector' ); ?></a>
					<?php endif; ?>
				</div>
			</form>
		</div>
		<?php
	}

	/**
	 * Get a list of columns. The format is:
	 * 'internal-name' => 'Title'
	 *
	 * @since 1.0.0
	 * @return array
	 */
	public function get_columns(): array {
		return [
			'priority' => __( 'Priority', 'rewrite-rules-inspector' ),
			'rule'     => __( 'Rule', 'rewrite-rules-inspector' ),
			'rewrite'  => __( 'Rewrite', 'rewrite-rules-inspector' ),
			'source'   => __( 'Source', 'rewrite-rules-inspector' ),
		];
	}

	/**
	 * Display the rows.
	 *
	 * @since 1.0.0
	 */
	public function display_rows() {
		$priority = 1;
		foreach ( $this->items as $rule => $data ) {
			$this->single_row( [ $rule, $data, $priority ] );
			$priority++;
		}
	}

	/**
	 * Display a single row.
	 *
	 * @since 1.0.0
	 * @param array $item The current row's data.
	 */
	public function single_row( $item ) {
		[ $rule, $data, $priority ] = $item;
		?>
		<tr>
			<td class="column-priority">
				<?php echo esc_html( $priority ); ?>
			</td>
			<td class="column-rule">
				<code><?php echo esc_html( $rule ); ?></code>
			</td>
			<td class="column-rewrite">
				<code><?php echo esc_html( $data['rewrite'] ); ?></code>
			</td>
			<td class="column-source">
				<?php
				if ( 'missing' === $data['source'] ) {
					echo '<span style="color: #d63638;">' . esc_html__( 'missing', 'rewrite-rules-inspector' ) . '</span>';
				} else {
					echo esc_html( $data['source'] );
				}
				?>
			</td>
		</tr>
		<?php
	}
}
