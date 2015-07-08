<?php
/**
 * VIP plugins list table class for the VIP admin screen
 */
class WPCOM_VIP_Plugins_UI_List_Table extends WP_List_Table {

	/**
	 * Constructor. Sets up the list table.
	 */
	function __construct() {
		parent::__construct( array(
			'plural' => 'plugins',
		) );
	}

	public function get_columns() {
		return array(
			'name' 			=> __( 'Shared Plugins' ),
			'description' 	=> ''
		);
	}

	/**
	 * Fetch the list of VIP plugins to display in the list table.
	 */
	public function prepare_items() {
		$active = $inactive = array();

		$vip_plugins = WPCOM_VIP_Plugins_UI::instance();

		$shared_plugins = $vip_plugins->get_shared_plugins();

		// The path has to be
		foreach ( $shared_plugins as $plugin_file => $plugin_data ) {
			$plugin_folder = basename( dirname( $plugin_file ) );

			// FPP is listed separately
			if ( isset( WPCOM_VIP_Plugins_UI()->fpp_plugins[ $plugin_folder ] ) )
				continue;

			$plugin_file = WPCOM_VIP_Plugins_UI::SHARED_PLUGINS_RELATIVE_PATH . '/' . $plugin_file;

			$status = WPCOM_VIP_Plugins_UI()->is_plugin_active( $plugin_folder ) ? 'active' : 'inactive';

			// Don't want some plugins showing up in the list
			if ( 'inactive' == $status && in_array( $plugin_folder, WPCOM_VIP_Plugins_UI()->hidden_plugins ) )
				continue;

			// Translate, Don't Apply Markup, Sanitize HTML
			${$status}[$plugin_file] = _get_plugin_data_markup_translate( $plugin_file, $plugin_data, false, true );
		}

		$this->items = array_merge( $active, $inactive );
	}

	/**
	 * Output an error message if no VIP plugins were found to show in the list table.
	 */
	public function no_items() {
		echo 'There was an error listing out plugins. Please try again in a bit.';
	}

	/**
	 * Return an array of CSS classes to apply to the list table.
	 *
	 * @return array
	 */
	public function get_table_classes() {
		return array( 'widefat', $this->_args['plural'] );
	}

	/**
	 * Handles outputting the markup for each row of the list table.
	 */
	public function display_rows() {
		foreach ( $this->items as $plugin_file => $plugin_data )
			$this->single_row( $plugin_file, $plugin_data );
	}

	/**
	 * Handles outputting the markup for a single row of the list table.
	 *
	 * @param string $plugin_file The filename of the plugin being handled
	 * @param array $plugin_data Data from {@link https://core.trac.wordpress.org/browser/trunk/wp-admin/includes/plugin.php#L108}) for the plugin
	 */
	public function single_row( $plugin_file ) {
		$plugin = basename( dirname( $plugin_file ) );
		$plugin_data = get_plugin_data( WP_PLUGIN_DIR . '/' . $plugin_file );

		$is_active = WPCOM_VIP_Plugins_UI()->is_plugin_active( $plugin );

		$class = $is_active ? 'active' : 'inactive';
		if ( $is_active )
			$class .= ' active-' . $is_active;

		$actions = array();
		$actions = WPCOM_VIP_Plugins_UI()->add_activate_or_deactive_action_link( $actions, $plugin );

		$plugin_name = $plugin_data['Name'];
		$description = '<p>' . ( $plugin_data['Description'] ? $plugin_data['Description'] : '&nbsp;' ) . '</p>';

		echo '<tr class="' . esc_attr( $class ) . '">';

		list( $columns, $hidden ) = $this->get_column_info();

		foreach ( $columns as $column_name => $column_display_name ) {
			$style = '';
			if ( in_array( $column_name, $hidden ) )
				$style = ' style="display:none;"';

			switch ( $column_name ) {
				case 'name':
					echo "<td class='plugin-title'$style><strong>$plugin_name</strong>";
					echo $this->row_actions( $actions, true );
					echo "</td>";
					break;
				case 'description':
					echo "<td class='column-description desc'$style>
						<div class='plugin-description'>$description</div>
						<div class='$class second plugin-version-author-uri'>";

					$plugin_meta = array();

					$plugin_meta[] = '<a href="' . esc_url( '//vip.wordpress.com/plugins/' . $plugin . '/' ) . '" title="' . esc_attr__( 'Visit our VIP Plugins Directory to learn more' ) . '" target="_blank">' . __( 'Learn More' ) . '</a>';

					if ( ! empty( $plugin_data['Author'] ) ) {
						$author = $plugin_data['Author'];
						if ( ! empty( $plugin_data['AuthorURI'] ) )
							$author = '<a href="' . $plugin_data['AuthorURI'] . '" title="' . esc_attr__( 'Visit author homepage' ) . '">' . $plugin_data['Author'] . '</a>';
						$plugin_meta[] = sprintf( __( 'By %s' ), $author );
					}

					echo implode( ' | ', $plugin_meta );

					echo '</div></td>';
					break;
			}
		}

		echo "</tr>";
	}
}
