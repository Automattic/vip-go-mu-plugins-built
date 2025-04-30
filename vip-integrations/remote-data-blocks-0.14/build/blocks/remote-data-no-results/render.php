<?php declare(strict_types = 1);

use RemoteDataBlocks\Editor\DataBinding\BlockBindings;

// Global variables provided by WordPress for block rendering:
// $attributes (array): The block attributes.
// $content (string): The block default content.
// $block (WP_Block): The block instance.

$should_render_empty_result = BlockBindings::should_render_empty_result( $block );

// Skip the rendering if the block's results are not empty.
if ( ! $should_render_empty_result ) {
	return null;
}

echo wp_kses_post( $content );
