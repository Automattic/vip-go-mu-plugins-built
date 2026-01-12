/**
 * WordPress dependencies
 */
import { dispatch } from '@wordpress/data';
import { PostTypeSupportCheck } from '@wordpress/editor';
import { addFilter, removeFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { dispatchCoreEditPost } from '../../../@types/gutenberg/types';
import { PluginDocumentSettingPanel } from '../../../@types/gutenberg/wrapper';
import { SettingsProvider } from '../../common/settings';
import { getContentHelperPermissions } from '../../common/utils/permissions';
import { getSettingsFromJson, PARSELY_SIDEBAR_PLUGIN_ID } from '../editor-sidebar';
import './excerpt-suggestions.scss';
import { PostExcerptSuggestions } from './component-panel';

/**
 * The ExcerptDocumentSettingPanel component verifies that the current post type supports excerpts,
 * and then renders the PostExcerptSuggestions component.
 *
 * @since 3.17.0
 */
export const ExcerptDocumentSettingPanel = () => {
	return (
		<PostTypeSupportCheck supportKeys="excerpt">
			<PluginDocumentSettingPanel
				name="parsely-post-excerpt"
				title={ __( 'Excerpt', 'wp-parsely' ) }
			>
				<SettingsProvider
					endpoint="editor-sidebar"
					defaultSettings={ getSettingsFromJson(
						window.wpParselyContentHelperSettings
					) }
				>
					<PostExcerptSuggestions
						isDocumentSettingPanel={ true }
					/>
				</SettingsProvider>
			</PluginDocumentSettingPanel>
		</PostTypeSupportCheck>
	);
};

/**
 * The ExcerptSuggestions function registers the custom excerpt panel and removes
 * the default excerpt panel.
 *
 * @since 3.13.0
 *
 * @param {never}  settings Settings from the plugins.registerPlugin filter. Not used.
 * @param {string} name     The plugin name.
 */
const ExcerptSuggestions = ( settings: never, name: string ) => {
	if ( name !== PARSELY_SIDEBAR_PLUGIN_ID ) {
		return settings;
	}

	// Check if the user has the necessary permissions to use the ExcerptSuggestions feature.
	const permissions = getContentHelperPermissions();
	if ( ! permissions.ExcerptSuggestions ) {
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
	registerPlugin( 'wp-parsely-excerpt-suggestions', {
		render: () => (
			<ExcerptDocumentSettingPanel />
		),
	} );

	/* Remove the excerpt panel by dispatching an action. */ // @ts-ignore
	if ( dispatch( 'core/editor' )?.removeEditorPanel ) { // @ts-ignore
		dispatch( 'core/editor' )?.removeEditorPanel( 'post-excerpt' );
	} else {
		// Deprecated in WordPress 6.5.
		dispatchCoreEditPost?.removeEditorPanel( 'post-excerpt' );
	}

	return settings;
};

export function initExcerptSuggestions() {
	// Add the ExcerptSuggestions function to the plugins.registerPlugin filter.
	// Priority is set to 1000 to ensure that the function runs as late as possible.
	addFilter( 'plugins.registerPlugin', 'wp-parsely-excerpt-suggestions', ExcerptSuggestions, 1000 );
}
