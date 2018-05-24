<?php
/**
 * Gutenberg Ramp
 *
 * Plugin Name: Gutenberg Ramp
 * Description: Allows theme authors to control the circumstances under which the Gutenberg editor loads. Options include "load" (1 loads all the time, 0 loads never) "post_ids" (load for particular posts) "post_types" (load for particular posts types.)
 * Version:     0.1
 * Author:      Automattic, Inc.
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Text Domain: ramp-for-gutenberg
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

include __DIR__ . '/inc/class-ramp-for-gutenberg.php';
include __DIR__ . '/inc/admin/class-ramp-for-gutenberg-post-type-settings-ui.php';

/**
*
* This function allows themes to specify Gutenberg loading critera.
* In and of itself it doesn't cause any change to Gutenberg's loading behavior.
* However, it governs the option which stores the criteria under which Gutenberg will load 
*
* `ramp_for_gutenberg_load_gutenberg` must be called in the theme before `admin_init`, normally from functions.php or the like
*
*/
function ramp_for_gutenberg_load_gutenberg( $criteria = false ) {
	// prevent the front-end from interacting with this plugin at all
	if ( !is_admin() ) {
		return;
	}
	$RFG = Ramp_For_Gutenberg::get_instance();
	$criteria = ( !$criteria ) ? [ 'load' => 1 ] : $criteria;
	$stored_criteria = $RFG->get_criteria();
	if ( $criteria !== $stored_criteria ) {
		// the criteria specified in code have changed -- update them
		$criteria = $RFG->set_criteria( $criteria );
	}
	// indicate that we've loaded the plugin. 
	$RFG->active = true;
}

/** grab the plugin **/
$RFG = Ramp_For_Gutenberg::get_instance();

/** off to the races **/
add_action( 'plugins_loaded', [ $RFG, 'load_decision' ], 20, 0 );
// if ramp_for_gutenberg_load_gutenberg() has not been called, perform cleanup
// unfortunately this must be done on every admin pageload to detect the case where
// criteria were previously being set in a theme, but now are not (due to a code change)
add_action( 'admin_init' , [ $RFG, 'cleanup_option' ], 10, 0 );

/**
 * tell Gutenberg when not to load
 * 
 * Gutenberg only calls this filter when checking the primary post
 * @TODO duplicate this for WP5.0 core with the new filter name, it's expected to change
 */
add_filter( 'gutenberg_can_edit_post_type', [ $RFG, 'maybe_allow_gutenberg_to_load' ], 20, 2 );

/**
* remove split new post links and Gutenberg menu h/t Ozz 
* see https://github.com/azaozz/classic-editor/blob/master/classic-editor.php#L108
*/
add_action( 'plugins_loaded', function() {
	remove_action( 'admin_menu', 'gutenberg_menu' );
	remove_filter( 'admin_url', 'gutenberg_modify_add_new_button_url' );
	remove_action( 'admin_print_scripts-edit.php', 'gutenberg_replace_default_add_new_button' );
});


/**
 * Initialize Admin UI
 */
function ramp_for_gutenberg_initialize_admin_ui() {
	new Ramp_For_Gutenberg_Post_Type_Settings_UI();
}
add_action( 'admin_init', 'ramp_for_gutenberg_initialize_admin_ui' );
