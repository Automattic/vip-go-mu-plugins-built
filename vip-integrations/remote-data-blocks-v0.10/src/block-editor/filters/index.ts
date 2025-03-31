import { addFilter } from '@wordpress/hooks';

import { addUsesContext } from '@/block-editor/filters/addUsesContext';
import { withBlockBindingShim } from '@/block-editor/filters/withBlockBinding';

/**
 * Use a filter to wrap the block edit component with our block binding HOC.
 * We are intentionally using the `blocks.registerBlockType` filter instead of
 * `editor.BlockEdit` so that we can make sure our HOC is applied after any
 * other HOCs from Core -- specifically this one, which injects the binding label
 * as the attribute value:
 *
 * https://github.com/WordPress/gutenberg/blob/f56dbeb9257c19acf6fbd8b45d87ae8a841624da/packages/block-editor/src/hooks/use-bindings-attributes.js#L159
 */
addFilter(
	'blocks.registerBlockType',
	'remote-data-blocks/withBlockBinding',
	withBlockBindingShim,
	5 // Ensure this runs before core filters
);

/**
 * Use a filter to inject usesContext to core block settings.
 */
addFilter( 'blocks.registerBlockType', 'remote-data-blocks/addUsesContext', addUsesContext, 10 );
