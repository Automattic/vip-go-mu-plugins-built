<?php
/**
 * Gutenberg Ramp
 *
 * Plugin Name: Gutenberg Ramp
 * Description: Allows theme authors to control the circumstances under which the Gutenberg editor loads. Options include "load" (1 loads all the time, 0 loads never) "post_ids" (load for particular posts) "post_types" (load for particular posts types.)
 * Version:     1.1.0
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
include __DIR__ . '/inc/class-gutenberg-ramp-criteria.php';
include __DIR__ . '/inc/admin/class-gutenberg-ramp-post-type-settings-ui.php';
include __DIR__ . '/inc/admin/class-gutenberg-ramp-compatibility-check.php';

/**
 * This function allows themes to specify Gutenberg loading critera.
 * In and of itself it doesn't cause any change to Gutenberg's loading behavior.
 * However, it governs the option which stores the criteria under which Gutenberg will load
 *
 * `gutenberg_ramp_load_gutenberg` must be called in the theme before `admin_init`, normally from functions.php or the like
 *
 * @param bool|array $criteria The criteria used to determine whether Gutenberg should be loaded
 *                             
 * @link https://github.com/Automattic/gutenberg-ramp#code-examples
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

	$stored_criteria = $gutenberg_ramp->criteria->get();

	if ( $criteria !== $stored_criteria ) {
		// the criteria specified in code have changed -- update them
		$gutenberg_ramp->criteria->set( $criteria );
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
	remove_action( 'admin_print_scripts-edit.php', 'gutenberg_replace_default_add_new_button' );

	/**
	 * Safe to remove when Gutenberg is merged
	 * `gutenberg_modify_add_new_button_url` was removed from Gutenberg a while ago
	 *
	 * Keeping this here for now only just in case someone hasn't updated Gutenberg in a long time.
	 *
	 * @todo: Remove when WordPress 5.0 is released
	 * @link https://github.com/WordPress/gutenberg/pull/4690
	 */
	remove_filter( 'admin_url', 'gutenberg_modify_add_new_button_url' );

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
 * @return bool|string
 */
function gutenberg_ramp_get_validated_gutenberg_load_path() {

	$gutenberg_plugin_path = apply_filters( 'gutenberg_ramp_gutenberg_load_path', WP_PLUGIN_DIR . '/gutenberg/gutenberg.php' );

	if ( empty( $gutenberg_plugin_path )
	     || 0 !== validate_file( $gutenberg_plugin_path )
	     || ! file_exists( $gutenberg_plugin_path )
	) {
		return false;
	}

	return $gutenberg_plugin_path;
}

/**
 * Ramp expects Gutenberg to be active
 * This function is going to load Gutenberg plugin if it's not already active
 *
 * @return bool
 */
function gutenberg_ramp_require_gutenberg() {

	/**
	 * `register_block_type` exists in both Gutenberg and WordPress 5.0
	 * If the function already exists - don't manually include Gutenberg Plugin
	 */
	if ( function_exists( 'register_block_type' ) ) {
		return false;
	}

	// perform any actions required before loading gutenberg
	do_action( 'gutenberg_ramp_before_load_gutenberg' );

	$validated_load_path = gutenberg_ramp_get_validated_gutenberg_load_path();
	if ( false !== $validated_load_path ) {
		include_once $validated_load_path;
	}

	return true;

}

/**
 * Require Gutenberg Plugin
 */
gutenberg_ramp_require_gutenberg();

if ( Gutenberg_Ramp_Compatibility_Check::should_check_compatibility() ) {
	$ramp_compatibility = new Gutenberg_Ramp_Compatibility_Check();
	add_action( 'admin_init', [ $ramp_compatibility, 'maybe_display_notice' ] );
}

/**
 * Initialize Gutenberg Ramp
 */
$gutenberg_ramp = Gutenberg_Ramp::get_instance();

/**
 * Tell Gutenberg when not to load:
 */
// Gutenberg >= 3.5
add_filter( 'gutenberg_can_edit_post', [ $gutenberg_ramp, 'maybe_load_gutenberg' ], 10, 2 );
// WordPress >= 5.0
add_filter( 'use_block_editor_for_post', [ $gutenberg_ramp, 'maybe_load_gutenberg' ], 10, 2 );
