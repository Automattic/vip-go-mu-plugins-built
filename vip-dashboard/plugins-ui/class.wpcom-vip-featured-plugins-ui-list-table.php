<?php

/**
 * VIP featured plugins list table class for the VIP admin screen
 */
class WPCOM_VIP_Featured_Plugins_List_Table extends WP_List_Table {

	/**
	 * We are using the backdoor _column_headers, because the columns filter is screen-specific
	 * but this is the second table on that screen and we can't differentiate between both.
	 *
	 * Setting this variable won't run the filter at all
	 */
	public $_column_headers = array( array( 'plugin' => '' ), array(), array() );

	/**
	 * Filter the featured plugin list?
	 * Used to separate new layout
	 *
	 * @var string
	 */
	public $filter = 'inactive';

	/**
	 * Constructor. Sets up the list table.
	 */
	function __construct() {
		parent::__construct( array(
			'plural' => 'Featured Plugins',
		) );
	}

	/**
	 * Return associative array of columns in the table
	 *
	 * Note - this is not used in this custom table of Featured Plugins, but
	 * exists to prevent future breakage if `self::get_columns()` ever ends up being called
	 * due to Core changes
	 *
	 * @return array The array of table columns
	 */
	public function get_columns() {
		return array(
			'name' 			=> __( 'Name' ),
			'description' 	=> __( 'Description' )
		);
	}

	/**
	 * Fetch the list of VIP featured plugins to display in the list table.
	 */
	public function prepare_items() {

		foreach ( WPCOM_VIP_Plugins_UI()->fpp_plugins as $slug => $plugin ) {

			if ( ! WPCOM_VIP_Plugins_UI()->is_plugin_active( $slug ) && in_array( $slug, WPCOM_VIP_Plugins_UI()->hidden_plugins ) )
				continue;

			$this->items[] = $slug;
		}
	}

	/**
	 * Returns the content for a row in the list table.
	 *
	 * @param array $item Plugin slug
	 * @param string $column_name Name of the table column
	 * @return string
	 */
	public function column_default( $slug, $column_name ) {

		if ( ! isset( $slug ) )
			return;

		if ( ! isset( WPCOM_VIP_Plugins_UI()->fpp_plugins[$slug] ) )
			return;

		// only show inactive
		if ( WPCOM_VIP_Plugins_UI()->is_plugin_active( $slug ) && $this->filter == 'inactive' )
			return;

		// only show active
		if ( ! WPCOM_VIP_Plugins_UI()->is_plugin_active( $slug ) && $this->filter == 'active' )
			return;

		$image_src = plugins_url( 'assets/img/featured-plugins/' . $slug . '-2x.png', __DIR__ . '/../vip-dashboard.php' );

		$lobby_url = '//vip.wordpress.com/plugins/' . $slug . '/';

		$is_active = WPCOM_VIP_Plugins_UI()->is_plugin_active( $slug );

		ob_start();
?>
		<div class="plugin <?php if ( $is_active ) { ?>active<?php } ?>">
			<img src="<?php echo esc_url( $image_src ); ?>" width="48" height="48" class="fp-icon" />
			<div class="fp-content">
				<h3 class="fp-title"><?php echo WPCOM_VIP_Plugins_UI()->fpp_plugins[$slug]['name']; ?></h3>
				<p class="fp-description"><?php echo WPCOM_VIP_Plugins_UI()->fpp_plugins[$slug]['description']; ?></p>
			</div>
			<div class="interstitial">
				<div class="interstitial-inner">
					<h3 class="fp-title"><?php echo WPCOM_VIP_Plugins_UI()->fpp_plugins[$slug]['name']; ?></h3>
					<?php
					if ( $is_active ) {
						if ( 'option' == $is_active ) {
							echo '<a href="' . esc_url( WPCOM_VIP_Plugins_UI()->get_plugin_deactivation_link( $slug ) ) . '" class="fp-button" title="' . esc_attr__( 'Deactivate this plugin' ) . '">' . __( 'Deactivate Plugin' ) . '</a>';
							echo '<span class="fp-text">'. __( 'Deactivating Plugin') .'</span>';
						} elseif ( 'manual' == $is_active ) {
							echo '<span title="To deactivate this particular plugin, edit your theme\'s functions.php file" class="fp-text">' . __( "Enabled via your theme's code" ) . '</span>';
						}
					} elseif ( ! $this->activation_disabled ) {
						echo '<a href="' . esc_url( WPCOM_VIP_Plugins_UI()->get_plugin_activation_link( $slug ) ) . '" class="fp-button" title="' . esc_attr__( 'Activate this plugin' ) . '" class="edit">' . __( 'Activate Plugin' ) . '</a>';
						echo '<span class="fp-text">'. __( 'Activating Plugin') .'</span>';

					}
					?>
				</div>
				<div class="more-info">
					<a href="<?php echo esc_url( $lobby_url ); ?>" target="_blank" title="Learn More">
						<div class="icon"></div>
					</a>
				</div>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Output custom display for featured plugins
	 *
	 * @return void
	 */
	public function display() {
		$singular = $this->_args['singular'];


		$this->display_tablenav( 'top' );

	?>
	<main id="plugins" role="main">

		<section id="plugins-fp" class="<?php echo implode( ' ', $this->get_table_classes() ); ?>">

			<nav id="menu">
				<input id="search" type="search" value="" placeholder="<?php _e( 'Filter Plugins' ); ?>">
			</nav>

			<section id="active">

				<h3><?php _e( 'Active Plugins' ); ?></h3>

				<?php $this->filter = 'active'; ?>
				<?php $this->display_rows_or_placeholder(); ?>

			</section>

			<section id="showcase">

				<h3><?php _e( 'VIP Featured Plugins' ); ?></h3>

				<?php $this->filter = 'inactive'; ?>
				<?php $this->display_rows_or_placeholder(); ?>

			</section>

		</section>

	</main>

	<?php
		$this->display_tablenav( 'bottom' );
	}
}
