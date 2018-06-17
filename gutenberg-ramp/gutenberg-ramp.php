<?php
/**
 * Gutenberg Ramp
 *
 * Plugin Name: Gutenberg Ramp
 * Description: Allows theme authors to control the circumstances under which the Gutenberg editor loads. Options include "load" (1 loads all the time, 0 loads never) "post_ids" (load for particular posts) "post_types" (load for particular posts types.)
 * Version:     1.0.0
 * Author:      Automattic, Inc.
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Text Domain: gutenberg-ramp
 */

/*
* This program is free software; you can redistribute it and/or modify it under the terms of the GNU
* General Public License version 2, as published by the Free Software Foundation.  You may NOT assume
* that you can use any other version of the GPL.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
* even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
*
*/

include __DIR__ . '/inc/class-gutenberg-ramp.php';
include __DIR__ . '/inc/admin/class-gutenberg-ramp-post-type-settings-ui.php';

/**
 * This function allows themes to specify Gutenberg loading critera.
 * In and of itself it doesn't cause any change to Gutenberg's loading behavior.
 * However, it governs the option which stores the criteria under which Gutenberg will load
 *
 * `gutenberg_ramp_load_gutenberg` must be called in the theme before `admin_init`, normally from functions.php or the like
 *
 * @param bool|array $criteria The criteria used to determine whether Gutenberg should be loaded
 */
function gutenberg_ramp_load_gutenberg( $criteria = true ) {

	// only admin requests should refresh loading behavior
	if ( ! is_admin() ) {
		return;
	}
	$gutenberg_ramp = Gutenberg_Ramp::get_instance();

	/**
	 * Transform `load` values from booleans to integers
	 * because they're stored as integers eventually
	 */
	if ( is_bool( $criteria ) ) {
		$criteria = [ 'load' => (int) $criteria ];
	} else if ( isset( $criteria['load'] ) && is_bool( $criteria['load'] ) ) {
		$criteria['load'] = (int) $criteria['load'];
	}

	$stored_criteria = $gutenberg_ramp->get_criteria();

	if ( $criteria !== $stored_criteria ) {
		// the criteria specified in code have changed -- update them
		$gutenberg_ramp->set_criteria( $criteria );
	}
	// indicate that we've loaded the plugin. 
	$gutenberg_ramp->active = true;
}

/**
 * Remove split new post links and Gutenberg menu h/t Ozz
 * see https://github.com/azaozz/classic-editor/blob/master/classic-editor.php#L108
 */
function gutenberg_ramp_remove_dashboard_links() {

	remove_action( 'admin_menu', 'gutenberg_menu' );
	remove_filter( 'admin_url', 'gutenberg_modify_add_new_button_url' );
	remove_action( 'admin_print_scripts-edit.php', 'gutenberg_replace_default_add_new_button' );

}

add_action( 'plugins_loaded', 'gutenberg_ramp_remove_dashboard_links', 10, 0 );

/**
 * Initialize Admin UI
 */
function gutenberg_ramp_initialize_admin_ui() {

	new Gutenberg_Ramp_Post_Type_Settings_UI();
}

add_action( 'admin_init', 'gutenberg_ramp_initialize_admin_ui' );

/**
 * Fallback function for people who tried Gutenberg Ramp before version 0.3
 *
 * @param bool $criteria
 *
 * @deprecated  0.3.0
 */
function ramp_for_gutenberg_load_gutenberg( $criteria = false ) {

	_deprecated_function( 'ramp_for_gutenberg_load_gutenberg', '0.3', 'gutenberg_ramp_load_gutenberg' );
	gutenberg_ramp_load_gutenberg( $criteria );
}


/**
 * Initialize Gutenberg Ramp instantly
 */
Gutenberg_Ramp::get_instance();
