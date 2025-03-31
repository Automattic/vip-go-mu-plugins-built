<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Theme;

use function add_action;
use function get_stylesheet_directory_uri;
use function wp_enqueue_style;
use function wp_get_theme;

defined( 'ABSPATH' ) || exit();

/**
 * Enqueue the Remote Data Blocks styles.
 */
function remote_data_blocks_example_theme_enqueue_block_styles(): void {
	wp_enqueue_style(
		'remote-data-blocks-example-theme-style',
		get_stylesheet_directory_uri() . '/style-remote-data-blocks.css',
		[],
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\remote_data_blocks_example_theme_enqueue_block_styles', 15, 0 );
add_action( 'enqueue_block_assets', __NAMESPACE__ . '\\remote_data_blocks_example_theme_enqueue_block_styles', 15, 0 );
