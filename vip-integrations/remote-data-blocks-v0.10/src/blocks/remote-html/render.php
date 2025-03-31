<?php declare(strict_types = 1);

use RemoteDataBlocks\Editor\DataBinding\BlockBindings;

// $attributes (array): The block attributes.
// $content (string): The block default content.
// $block (WP_Block): The block instance.

$source_args = $block->attributes['metadata']['bindings']['content']['args'] ?? [];

?>

<div <?php echo get_block_wrapper_attributes(); ?>>
	<?php
	/**
	 * @psalm-suppress UndefinedGlobalVariable
	 * $block is provided by WordPress for rendering, see header comments
	 */
	$binding_value = BlockBindings::get_value( $source_args, $block, 'content' );

	if ( null === $binding_value ) {
		// Similar to actual data bindings, if the binding value is null,
		// we'll use the default stored in the block markup.

		/**
		 * @psalm-suppress UndefinedGlobalVariable
		 * $content is provided by WordPress for rendering, see header comments
		 */
		$binding_value = $content;
	}

	echo wp_kses_post( $binding_value );
	?>
</div>
