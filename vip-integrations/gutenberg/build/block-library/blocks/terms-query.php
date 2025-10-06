<?php
/**
 * Server-side rendering of the `core/terms-query` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/terms-query` block on the server.
 *
 * @since 6.9.0
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 *
 * @return string Returns the output of the query, structured using the layout defined by the block's inner blocks.
 */
function gutenberg_render_block_core_terms_query( $attributes, $content ) {
	$tag_name           = ! empty( $attributes['tagName'] ) ? $attributes['tagName'] : 'div';
	$wrapper_attributes = get_block_wrapper_attributes();

	return sprintf(
		'<%1$s %2$s>%3$s</%1$s>',
		$tag_name,
		$wrapper_attributes,
		$content
	);
}


/**
 * Registers the `core/terms-query` block on the server.
 *
 * @since 6.9.0
 */
function gutenberg_register_block_core_terms_query() {
	register_block_type_from_metadata(
		__DIR__ . '/terms-query',
		array(
			'render_callback' => 'gutenberg_render_block_core_terms_query',
		)
	);
}
add_action( 'init', 'gutenberg_register_block_core_terms_query', 20 );
