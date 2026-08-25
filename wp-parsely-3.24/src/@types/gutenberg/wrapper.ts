/**
 * This file is used to wrap original Gutenberg components to avoid TypeScript errors.
 *
 * The original Gutenberg components are imported conditionally based on the environment.
 * This is needed since these Gutenberg components have changed their location to a different package in WordPress 6.6.
 *
 * @since 3.17.0
 *
 * @see https://make.wordpress.org/core/2024/06/18/editor-unified-extensibility-apis-in-6-6/
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { ComponentType } from 'react';

// Import the original Gutenberg components.
import {
	PluginDocumentSettingPanel as OriginalPluginDocumentSettingPanel,
	PluginSidebar as OriginalPluginSidebar,
} from '@wordpress/edit-post';

// Define the types for the props of the original Gutenberg components.
type PluginDocumentSettingPanelProps = React.ComponentProps<typeof OriginalPluginDocumentSettingPanel>;
type PluginSidebarProps = React.ComponentProps<typeof OriginalPluginSidebar>;

// Define the types for the original Gutenberg components.
let PluginDocumentSettingPanel: ComponentType<PluginDocumentSettingPanelProps>;
let PluginSidebar: ComponentType<PluginSidebarProps>;

// Use the correct Gutenberg components based on the environment.
if ( typeof window.wp !== 'undefined' ) {
	PluginDocumentSettingPanel = window.wp.editor?.PluginDocumentSettingPanel ??
		( window.wp.editPost?.PluginDocumentSettingPanel ?? window.wp.editSite?.PluginDocumentSettingPanel );
	PluginSidebar = window.wp.editor?.PluginSidebar ??
		( window.wp.editPost?.PluginSidebar ?? window.wp.editSite?.PluginSidebar );
}

// Export the wrapped Gutenberg components.
export {
	PluginDocumentSettingPanel,
	PluginSidebar,
};
