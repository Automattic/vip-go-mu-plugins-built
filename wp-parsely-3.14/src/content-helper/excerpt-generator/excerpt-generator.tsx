/**
 * WordPress dependencies
 */
import { addFilter, removeFilter } from '@wordpress/hooks';
import { dispatch } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { ExcerptPanel } from './components/excerpt-panel';

// TODO: Get the plugin ID from the editor sidebar file.
const PARSELY_SIDEBAR_PLUGIN_ID = 'wp-parsely-block-editor-sidebar';

/**
 * The ExcerptGenerator function registers the custom excerpt panel and removes
 * the default excerpt panel.
 *
 * @since 3.13.0
 *
 * @param {never}  settings Settings from the plugins.registerPlugin filter. Not used.
 * @param {string} name     The plugin name.
 */
const ExcerptGenerator = ( settings: never, name: string ) => {
	if ( name !== PARSELY_SIDEBAR_PLUGIN_ID ) {
		return settings;
	}

	const isJetpackAiEnabled =
		window?.Jetpack_Editor_Initial_State?.available_blocks[ 'ai-content-lens' ];

	if ( isJetpackAiEnabled ) {
		// eslint-disable-next-line no-console
		console.log( 'Parse.ly: Jetpack AI is enabled and will be disabled.' );

		// Remove Jetpack AI excerpt block.
		// https://github.com/Automattic/jetpack/blob/trunk/projects/plugins/jetpack/extensions/plugins/ai-content-lens/editor.js#L52-L56
		removeFilter( 'blocks.registerBlockType', 'jetpack/ai-content-lens-features' );
	}

	// Register the custom excerpt panel.
	registerPlugin( 'wp-parsely-excerpt-generator', {
		render: ExcerptPanel,
	} );

	// Remove the excerpt panel by dispatching an action.
	dispatch( 'core/edit-post' )?.removeEditorPanel( 'post-excerpt' );

	return settings;
};

// Add the ExcerptGenerator function to the plugins.registerPlugin filter.
// Priority is set to 1000 to ensure that the function runs as late as possible.
addFilter( 'plugins.registerPlugin', 'wp-parsely-excerpt-generator', ExcerptGenerator, 1000 );
