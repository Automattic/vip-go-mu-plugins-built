<?php declare(strict_types = 1);

use RemoteDataBlocks\Editor\DataBinding\BlockBindings;

// Global variables provided by WordPress for block rendering:
// $attributes (array): The block attributes.
// $content (string): The block default content.
// $block (WP_Block): The block instance.

$should_render_fallback_content = BlockBindings::should_render_fallback_content( $block->context, $attributes );

// The fallback content should only be rendered if the query errors out, or if the query returns no results.
if ( ! $should_render_fallback_content ) {
	return null;
}

echo wp_kses_post( $content );
