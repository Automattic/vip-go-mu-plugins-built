<?php
/**
 * Server-side rendering of the `core/post-date` block.
 *
 * @package WordPress
 */

/**
 * Renders the `core/post-date` block on the server.
 *
 * @since 5.8.0
 * @since 6.9.0 Added `datetime` attribute and Block Bindings support.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 * @return string Returns the filtered post date for the current post wrapped inside "time" tags.
 */
function gutenberg_render_block_core_post_date( $attributes, $content, $block ) {
	$classes = array();

	if (
		isset( $attributes['metadata']['bindings']['datetime']['source'] ) &&
		isset( $attributes['metadata']['bindings']['datetime']['args'] )
	) {
		/*
		 * We might be running on a version of WordPress that doesn't support binding the block's `datetime` attribute
		 * to a Block Bindings source. In this case, we need to manually set the `datetime` attribute to its correct value.
		 * This branch can be removed once the minimum required WordPress version is 6.9 or newer.
		 */
		$source      = get_block_bindings_source( $attributes['metadata']['bindings']['datetime']['source'] );
		$source_args = $attributes['metadata']['bindings']['datetime']['args'];

		$attributes['datetime'] = $source->get_value( $source_args, $block, 'datetime' );
	} elseif ( ! isset( $attributes['datetime'] ) ) {
		/*
		 * This is the legacy version of the block that didn't have the `datetime` attribute.
		 * This branch needs to be kept for backward compatibility.
		 */
		$source = get_block_bindings_source( 'core/post-data' );
		if ( isset( $attributes['displayType'] ) && 'modified' === $attributes['displayType'] ) {
			$source_args = array(
				'key' => 'modified',
			);
		} else {
			$source_args = array(
				'key' => 'date',
			);
		}
		$attributes['datetime'] = $source->get_value( $source_args, $block, 'datetime' );
	}

	if ( isset( $source_args['key'] ) && 'modified' === $source_args['key'] ) {
		$classes[] = 'wp-block-post-date__modified-date';
	}

	if ( empty( $attributes['datetime'] ) ) {
		// If the `datetime` attribute is set but empty, it could be because Block Bindings
		// set it that way. This can happen e.g. if the block is bound to the
		// post's last modified date, and the latter lies before the publish date.
		// (See https://github.com/WordPress/gutenberg/pull/46839 where this logic was originally
		// implemented.)
		// In this case, we have to respect and return the empty value.
		return $attributes['datetime'];
	}

	$unformatted_date = $attributes['datetime'];
	$post_timestamp   = strtotime( $unformatted_date );

	if ( isset( $attributes['format'] ) && 'human-diff' === $attributes['format'] ) {
		if ( $post_timestamp > time() ) {
			// translators: %s: human-readable time difference.
			$formatted_date = sprintf( __( '%s from now' ), human_time_diff( $post_timestamp ) );
		} else {
			// translators: %s: human-readable time difference.
			$formatted_date = sprintf( __( '%s ago' ), human_time_diff( $post_timestamp ) );
		}
	} else {
		$formatted_date = gmdate( empty( $attributes['format'] ) ? get_option( 'date_format' ) : $attributes['format'], $post_timestamp );
	}

	if ( isset( $attributes['textAlign'] ) ) {
		$classes[] = 'has-text-align-' . $attributes['textAlign'];
	}
	if ( isset( $attributes['style']['elements']['link']['color']['text'] ) ) {
		$classes[] = 'has-link-color';
	}

	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => implode( ' ', $classes ) ) );

	if ( isset( $attributes['isLink'] ) && $attributes['isLink'] && isset( $block->context['postId'] ) ) {
		$formatted_date = sprintf( '<a href="%1s">%2s</a>', get_the_permalink( $block->context['postId'] ), $formatted_date );
	}

	return sprintf(
		'<div %1$s><time datetime="%2$s">%3$s</time></div>',
		$wrapper_attributes,
		$unformatted_date,
		$formatted_date
	);
}

/**
 * Registers the `core/post-date` block on the server.
 *
 * @since 5.8.0
 */
function gutenberg_register_block_core_post_date() {
	register_block_type_from_metadata(
		__DIR__ . '/post-date',
		array(
			'render_callback' => 'gutenberg_render_block_core_post_date',
		)
	);
}
add_action( 'init', 'gutenberg_register_block_core_post_date', 20 );
