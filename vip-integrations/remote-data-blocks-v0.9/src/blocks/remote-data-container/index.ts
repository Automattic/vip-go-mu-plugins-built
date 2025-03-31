import { registerBlockBindingsSource, registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { registerFormatType } from '@wordpress/rich-text';

import { formatTypeSettings } from '@/blocks/remote-data-container/components/field-shortcode';
import { FieldShortcodeButton } from '@/blocks/remote-data-container/components/field-shortcode/FieldShortcodeButton';
import { Edit } from '@/blocks/remote-data-container/edit';
import { addUsesContext } from '@/blocks/remote-data-container/filters/addUsesContext';
import { withBlockBindingShim } from '@/blocks/remote-data-container/filters/withBlockBinding';
import { Save } from '@/blocks/remote-data-container/save';
import { getBlocksConfig } from '@/utils/localized-block-data';
import './style.scss';

// Register a unique block definition for each of the context blocks.
Object.values( getBlocksConfig() ).forEach( blockConfig => {
	registerBlockType< RemoteDataBlockAttributes >( blockConfig.name, {
		...blockConfig.settings,
		attributes: {
			remoteData: {
				type: 'object',
			},
		},
		edit: Edit,
		save: Save,
	} );
} );

// Register the field shortcode format type.
registerFormatType( 'remote-data-blocks/field-shortcode', {
	...formatTypeSettings,
	edit: FieldShortcodeButton,
} );

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

registerBlockBindingsSource( {
	name: 'remote-data/binding',
	label: 'Remote Data Binding',
	usesContext: [ 'remote-data-blocks/remoteData' ],
	getValues() {
		return {};
	},
} );
