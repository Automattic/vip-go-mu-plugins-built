<?php
/**
 * Plugin Name: Rewrite Rules Inspector
 * Plugin URI: http://wordpress.org/extend/plugins/rewrite-rules-inspector/
 * Description: Simple WordPress Admin view for inspecting your rewrite rules
 * Author: Daniel Bachhuber, Automattic
 * Version: 1.2.1
 * Author URI: http://automattic.com/
 */

define( 'REWRITE_RULES_INSPECTOR_VERSION', '1.2.1' );
define( 'REWRITE_RULES_INSPECTOR_ROOT', dirname( __FILE__ ) );
define( 'REWRITE_RULES_INSPECTOR_FILE_PATH' , REWRITE_RULES_INSPECTOR_ROOT . '/' . basename( __FILE__ ) );

class Rewrite_Rules_Inspector
{

	var $parent_slug = 'tools.php';
	var $page_slug = 'rewrite-rules-inspector';
	var $view_cap = 'manage_options';
	var $flushing_enabled = true;
	var $sources = array();

	/**
	 * Construct the plugin
	 */
	function __construct() {

		// This plugin only runs in the admin, but we need it initialized on init
		add_action( 'init', array( $this, 'action_init' ) );

	}

	/**
	 * Initialize the plugin
	 */
	function action_init() {

		if ( !is_admin() )
			return;

		add_action( 'admin_menu', array( $this, 'action_admin_menu' ) );

		// Allow the view to be placed elsewhere than tools.php
		$this->parent_slug = apply_filters( 'rri_parent_slug', $this->parent_slug );

		// Whether or not users can flush the rewrite rules from this tool
		$this->flushing_enabled = apply_filters( 'rri_flushing_enabled', $this->flushing_enabled );

		// User actions available for the rewrite rules page
		if ( isset( $_GET['page'], $_GET['action'] ) && $_GET['page'] == $this->page_slug && $_GET['action'] == 'download-rules' )
			add_action( 'admin_init', array( $this, 'download_rules' ) );
		elseif ( isset( $_GET['page'], $_GET['action'] ) && $_GET['page'] == $this->page_slug && $_GET['action'] == 'flush-rules' )
			add_action( 'admin_init', array( $this, 'flush_rules' ) );
		elseif ( isset( $_GET['page'], $_GET['message'] ) && $_GET['page'] == $this->page_slug && $_GET['message'] == 'flush-success' )
			add_action( 'admin_notices', array( $this, 'action_admin_notices' ) );

	}

	/**
	 * Add our sub-menu page to the VIP dashboard navigation
	 */
	function action_admin_menu() {

		add_submenu_page( $this->parent_slug, __( 'Rewrite Rules Inspector', 'rewrite-rules-inspector' ), __( 'Rewrite Rules', 'rewrite-rules-inspector' ), $this->view_cap, $this->page_slug, array( $this, 'view_rules' ) );

	}

	/**
	 * Show a message when you've successfully flushed your rewrite rules
	 */
	function action_admin_notices() {
		echo '<div class="message updated"><p>' . __( 'Rewrite rules flushed.', 'rewrite-rules-inspector' ) . '</p></div>';
	}

	/**
	 * Get the rewrite rules for the current view
	 */
	function get_rules() {
		global $wp_rewrite;

		$rewrite_rules_array = array();
		$rewrite_rules = get_option( 'rewrite_rules' );
		if ( !$rewrite_rules )
			$rewrite_rules = array();
		// Track down which rewrite rules are associated with which methods by breaking it down
		$rewrite_rules_by_source = array();
		$rewrite_rules_by_source['post'] = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->permalink_structure, EP_PERMALINK );
		$rewrite_rules_by_source['date'] = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->get_date_permastruct(), EP_DATE );
		$rewrite_rules_by_source['root'] = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->root . '/', EP_ROOT );
		$rewrite_rules_by_source['comments'] = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->root . $wp_rewrite->comments_base, EP_COMMENTS, true, true, true, false );
		$rewrite_rules_by_source['search'] = $wp_rewrite->generate_rewrite_rules( $wp_rewrite->get_search_permastruct(), EP_SEARCH );
		$rewrite_rules_by_source['author'] = $wp_rewrite->generate_rewrite_rules($wp_rewrite->get_author_permastruct(), EP_AUTHORS );
		$rewrite_rules_by_source['page'] = $wp_rewrite->page_rewrite_rules();

		// Extra permastructs including tags, categories, etc.
		foreach ( $wp_rewrite->extra_permastructs as $permastructname => $permastruct ) {
			if ( is_array( $permastruct ) ) {
				// Pre 3.4 compat
				if ( count( $permastruct ) == 2 )
					$rewrite_rules_by_source[$permastructname] = $wp_rewrite->generate_rewrite_rules( $permastruct[0], $permastruct[1] );
				else
					$rewrite_rules_by_source[$permastructname] = $wp_rewrite->generate_rewrite_rules( $permastruct['struct'], $permastruct['ep_mask'], $permastruct['paged'], $permastruct['feed'], $permastruct['forcomments'], $permastruct['walk_dirs'], $permastruct['endpoints'] );
			} else {
				$rewrite_rules_by_source[$permastructname] = $wp_rewrite->generate_rewrite_rules( $permastruct, EP_NONE );
			}
		}

		// Apply the filters used in core just in case
		foreach( $rewrite_rules_by_source as $source => $rules ) {
			$rewrite_rules_by_source[$source] = apply_filters( $source . '_rewrite_rules', $rules );
			if ( 'post_tag' == $source )
				$rewrite_rules_by_source[$source] = apply_filters( 'tag_rewrite_rules', $rules );
		}

		foreach( $rewrite_rules as $rule => $rewrite ) {
			$rewrite_rules_array[$rule]['rewrite'] = $rewrite;
			foreach( $rewrite_rules_by_source as $source => $rules ) {
				if ( array_key_exists( $rule, $rules ) ) {
					$rewrite_rules_array[$rule]['source'] = $source;
				}
			}
			if ( !isset( $rewrite_rules_array[$rule]['source'] ) )
				$rewrite_rules_array[$rule]['source'] = apply_filters( 'rewrite_rules_inspector_source', 'other', $rule, $rewrite );
		}

		// Find any rewrite rules that should've been generated but weren't
		$maybe_missing = $wp_rewrite->rewrite_rules();
		$missing_rules = array();
		$rewrite_rules_array = array_reverse( $rewrite_rules_array, true );
		foreach( $maybe_missing as $rule => $rewrite ) {
			if ( !array_key_exists( $rule, $rewrite_rules_array ) ) {
				$rewrite_rules_array[$rule] = array(
					'rewrite' => $rewrite,
					'source' => 'missing',
				);
			}
		}
		// Prepend rules so it's obvious
		$rewrite_rules_array = array_reverse( $rewrite_rules_array, true );

		// Allow static sources of rewrite rules to override, etc.
		$rewrite_rules_array = apply_filters( 'rri_rewrite_rules', $rewrite_rules_array );
		// Set the sources used in our filtering
		$sources = array( 'all' );
		foreach( $rewrite_rules_array as $rule => $data ) {
			$sources[] = $data['source'];
		}
		$this->sources = array_unique( $sources );

		if ( ! empty( $_GET['s'] ) ) {
			$match_path = parse_url( esc_url( $_GET['s'] ), PHP_URL_PATH );
			$wordpress_subdir_for_site = parse_url( home_url(), PHP_URL_PATH );
			if ( ! empty( $wordpress_subdir_for_site ) ) {
				$match_path = str_replace( $wordpress_subdir_for_site, '', $match_path );
			}
			$match_path = ltrim( $match_path, '/' );
		}

		$should_filter_by_source = ! empty( $_GET['source'] ) && 'all' !== $_GET[ 'source' ] && in_array( $_GET['source'], $this->sources );

		// Filter based on match or source if necessary
		foreach( $rewrite_rules_array as $rule => $data ) {
			// If we're searching rules based on URL and there's no match, don't return it
			if ( ! empty( $match_path ) && ! preg_match( "!^$rule!", $match_path ) ) {
				unset( $rewrite_rules_array[$rule] );
			} elseif ( $should_filter_by_source && $data['source'] != $_GET['source'] ) {
				unset( $rewrite_rules_array[$rule] );
			}
		}

		// Return our array of rewrite rules to be used
		return $rewrite_rules_array;

	}

	/**
	 * View the rewrite rules for the site
	 */
	function view_rules() {

		// Bump view stats or do something else on page load
		do_action( 'rri_view_rewrite_rules' );

		$wp_list_table = new Rewrite_Rules_Inspector_List_Table();
		$wp_list_table->prepare_items();

		?>
		<style>
			#the-list tr.type-sunrise,
			#the-list tr.type-custom {
				background-color: #EEC7F0;
			}
			#the-list tr.type-sunrise td,
			#the-list tr.type-custom td {
				border-top-color: #F4E6F5;
				border-bottom-color: #EFBBF2;
			}
			#the-list tr.source-missing {
				background-color: #f7a8a9;
			}
			#the-list tr.type-missing td {
				border-top-color: #FECFD0;
				border-bottom-color: #f99b9d;
			}
		</style>
		<div class="wrap">
		<?php screen_icon( 'tools' ); ?>
		<h2><?php _e( 'Rewrite Rules Inspector', 'rewrite-rules-inspector' ); ?></h2>

		<?php
		$rules = $this->get_rules();
		if ( empty( $rules ) ) {
			$error_message = apply_filters( 'rri_message_no_rules', __( 'No rewrite rules yet, try flushing.', 'rewrite-rules-inspector' ) );
			echo '<div class="message error"><p>' . $error_message . '</p></div>';
		} else if ( in_array( 'missing', $this->sources ) ) {
			$error_message = apply_filters( 'rri_message_missing_rules', __( 'Some rewrite rules may be missing, try flushing.', 'rewrite-rules-inspector' ) );
			echo '<div class="message error"><p>' . $error_message . '</p></div>';
		}
		?>

		<?php if ( ! empty( $_GET['s'] ) ): ?>
		<p><?php printf( __( 'A listing of all %1$s rewrite rules for this site that match "<a target="_blank" href="%2$s">%3$s</a>"' ), count( $wp_list_table->items ), esc_url( $_GET['s'] ), esc_url( $_GET['s'] ) ); ?></p>
		<?php else: ?>
		<p><?php printf( __( 'A listing of all %1$s rewrite rules for this site.' ), count( $wp_list_table->items ) ); ?></p>
		<?php endif; ?>

		<?php $wp_list_table->display(); ?>

		</div>

	<?php

	}

	/**
	 * Process a user's request to download a set of the rewrite rules
	 * Prompts a download of the current set of rules as a text file by
	 * setting the header. Respects current filter rules.
	 */
	function download_rules() {

		// Check nonce and permissions
		check_admin_referer( 'download-rules' );
		if ( !current_user_can( $this->view_cap ) )
			wp_die( __( 'You do not have permissions to perform this action.' ) );

		// Get the rewrite rules and prompt the user to download them
		// File is saved as YYYYMMDD.themename.rewriterules.txt
		$theme_name = sanitize_key( get_option( 'stylesheet' ) );
		$filename = date( 'Ymd' ) . '.' . $theme_name . '.rewriterules.txt';
		header( 'Content-Type: text/plain' );
		header( 'Content-Disposition: attachment; filename="' . $filename . '"' );

		$rewrite_rules = $this->get_rules();
		$rules_to_export = array();
		foreach( $rewrite_rules as $rule => $data ) {
			$rules_to_export[$rule] = $data['rewrite'];
		}
		echo var_export( $rules_to_export, true );
		exit;
	}

	/**
	 * Allow a user to flush rewrite rules for their site
	 */
	function flush_rules() {
		global $plugin_page;

		// Check nonce and permissions
		check_admin_referer( 'flush-rules' );
		if ( !current_user_can( $this->view_cap ) || !$this->flushing_enabled )
			wp_die( __( 'You do not have permissions to perform this action.' ) );

		flush_rewrite_rules( false );
		do_action( 'rri_flush_rules' );

		// Woo hoo!
		$args = array(
				'message' => 'flush-success',
			);
		wp_safe_redirect( add_query_arg( $args, menu_page_url( $plugin_page, false ) ) );
		exit;
	}

}

global $rewrite_rules_inspector;
$rewrite_rules_inspector = new Rewrite_Rules_Inspector();

// Load the WP_List_Table class if it doesn't yet exist
if ( !class_exists( 'WP_List_Table' ) )
	require_once ABSPATH . '/wp-admin/includes/class-wp-list-table.php';

/**
 * Display the rewrite rules in an easy to digest list table
 */
class Rewrite_Rules_Inspector_List_Table extends WP_List_Table {

	/**
	 * Construct the list table
	 */
	function __construct() {

		$screen = get_current_screen();

		parent::__construct( array(
			'plural' => 'Rewrite Rules',
		) );
	}

	/**
	 * Load all of the matching rewrite rules into our list table
	 */
	function prepare_items() {
		global $rewrite_rules_inspector;

		$columns = $this->get_columns();
		$hidden = array();
		$sortable = array();
		$this->_column_headers = array( $columns, $hidden, $sortable );

		$this->items = $rewrite_rules_inspector->get_rules();
	}

	/**
	 * What to print when no items were found
	 */
	function no_items() {
		_e( 'No rewrite rules were found.', 'rewrite-rules-inspector' );
	}

	/**
	 * Display the navigation for the list table
	 */
	function display_tablenav( $which ) {
		global $plugin_page, $rewrite_rules_inspector;

		$search = ! empty( $_GET['s'] ) ? esc_url( $_GET['s'] ) : '';

		if ( $which == 'bottom' )
			return false;
		?>
		<div class="custom-tablenav-top" style="padding-top:5px;padding-bottom:10px;">
		<div style="float:right;">
			<?php
			// Only show the flush button if enabled
			if ( $rewrite_rules_inspector->flushing_enabled ):
			?>
			<?php
				// Flush the current set of rewrite rules
				$args = array(
						'action' => 'flush-rules',
						'_wpnonce' => wp_create_nonce( 'flush-rules' ),
					);
				$flush_url = add_query_arg( $args, menu_page_url( $plugin_page, false ) );
			?>
			<a title="<?php _e( 'Flush your rewrite rules to regenerate them', 'rewrite-rules-inspector' ); ?>" class="button-secondary" href="<?php echo esc_url( $flush_url ); ?>"><?php _e( 'Flush Rules', 'rewrite-rules-inspector' ); ?></a>
			<?php endif; ?>
			<?php
				// Prepare the link to download a set of rules
				// Link is contingent on the current filter state
				$args = array(
					'action' => 'download-rules',
					'_wpnonce' => wp_create_nonce( 'download-rules' ),
				);
				if ( isset( $_GET['source'] ) && in_array( $_GET['source'], $rewrite_rules_inspector->sources ) )
					$args['source'] = sanitize_key( $_GET['source'] );
				else
					$args['source'] = 'all';
				$args['s'] = !empty( $_GET['s'] ) ? $_GET['s'] : '';

				$download_url = add_query_arg( $args, menu_page_url( $plugin_page, false ) );
			?>
			<a title="<?php _e( 'Download current list of rules as a .txt file', 'rewrite-rules-inspector' ); ?>" class="button-secondary" href="<?php echo esc_url( $download_url ); ?>"><?php _e( 'Download', 'rewrite-rules-inspector' ); ?></a>
		</div>
		<form method="GET">
			<label for="s"><?php _e( 'Match URL:', 'rewrite-rules-inspector' ); ?></label>
			<input type="text" id="s" name="s" value="<?php echo esc_attr( $search ); ?>" size="50"/>
			<input type="hidden" id="page" name="page" value="<?php echo esc_attr( $plugin_page ); ?>" />
			<label for="source"><?php _e( 'Rule Source:', 'rewrite-rules-inspector' ); ?></label>
			<select id="source" name="source">
			<?php
				if (isset( $_GET['source'] ) && in_array( $_GET['source'], $rewrite_rules_inspector->sources ) )
					$filter_source = sanitize_key( $_GET['source'] );
				else
					$filter_source = 'all';
				foreach( $rewrite_rules_inspector->sources as $value ) {
					echo '<option value="' . esc_attr( $value ) . '" ';
					selected( $filter_source, $value );
					echo '>' . esc_attr( $value ) . '</option>';
				}
			?>
			</select>
			<?php submit_button( __( 'Filter', 'rewrite-rules-inspector' ), 'primary', null, false ); ?>
			<?php if ( $search || !empty( $_GET['source'] ) ): ?>
				<a href="<?php menu_page_url( $plugin_page ); ?>" class="button-secondary"><?php _e( 'Reset', 'rewrite-rules-inspector' ); ?></a>
			<?php endif; ?>
		</form>
		</div>
		<?php
	}

	/**
	 * Define the columns for our list table
	 */
	function get_columns() {

		$columns = array(
				'rule'          => __( 'Rule', 'rewrite-rules-inspector' ),
				'rewrite'       => __( 'Rewrite', 'rewrite-rules-inspector' ),
				'source'        => __( 'Source', 'rewrite-rules-inspector' ),
			);
		return $columns;

	}

	/**
	 * Display each row of rewrite rule data
	 */
	function display_rows() {
		foreach ( $this->items as $rewrite_rule => $rewrite_data ) {
			$rewrite_data['rule'] = $rewrite_rule;
			$this->single_row( $rewrite_data );
		}
	}

	/**
	 * Display a single row of rewrite rule data
	 */
	function single_row( $item ) {

		$rule = $item['rule'];
		$source = $item['source'];
		$rewrite = $item['rewrite'];

		$class = 'source-' . $source;

		echo "<tr class='$class'>";

		list( $columns, $hidden ) = $this->get_column_info();

		foreach ( $columns as $column_name => $column_display_name ) {

			switch ( $column_name ) {
				case 'rule':
					echo "<td class='column-rule'><strong>" . esc_html( $rule ) . "</strong></td>";
					break;
				case 'rewrite':
					echo "<td class='column-rewrite'>" . esc_html( $rewrite ) . "</td>";
					break;
				case 'source':
					echo "<td class='column-source'>" . esc_html( $source ) . "</td>";
					break;
			}
		}

		echo "</tr>";
	}
}
