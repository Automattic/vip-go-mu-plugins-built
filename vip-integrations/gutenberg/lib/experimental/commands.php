<?php
/**
 * Bootstraps the Command Palette  in the admin dashboard.
 *
 * @package gutenberg
 */

/**
 * Enqueues the assets required for the Command Palette.
 *
 * @global string $pagenow The name of the current admin page being viewed.
 */
function gutenberg_enqueue_command_palette_assets() {
	// For now, we don't enqueue assets to the frontend. It may be available in the future.
	if ( ! is_admin() ) {
		return;
	}

	global $pagenow, $current_screen;

	// The Site Editor and Post Editor already implement the Command Palette
	// within the app, so do nothing on those pages.
	if ( in_array( $pagenow, array( 'site-editor.php', 'post.php', 'post-new.php' ), true ) && $current_screen->is_block_editor() ) {
		return;
	}

	wp_enqueue_script( 'wp-commands' );
	wp_enqueue_style( 'wp-commands' );
	wp_enqueue_script( 'wp-core-commands' );

	$inline_script = 'wp.coreCommands.initializeCommandPalette();';

	wp_add_inline_script( 'wp-core-commands', $inline_script );
}

add_action( 'admin_enqueue_scripts', 'gutenberg_enqueue_command_palette_assets' );
