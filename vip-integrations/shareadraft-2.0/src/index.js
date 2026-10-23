/**
 * Share a Draft block-editor integration.
 *
 * Adds a "Share a Draft" panel to the post sidebar with two actions: generate a
 * new shareable preview link (expiration + a viewer cap), and manage the post's
 * existing links (see their usage and time left, and revoke them).
 */

import { registerPlugin } from '@wordpress/plugins';
import {
	PluginDocumentSettingPanel,
	store as editorStore,
} from '@wordpress/editor';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { ShareADraftControls } from './controls';

function ShareADraftPanel() {
	const { postId, status, isViewable } = useSelect( ( select ) => {
		const editor = select( editorStore );
		return {
			postId: editor.getCurrentPostId(),
			status: editor.getEditedPostAttribute( 'status' ),
			isViewable: !! select( coreStore ).getPostType(
				editor.getCurrentPostType()
			)?.viewable,
		};
	}, [] );

	// A published post is already public, a private or trashed one is closed on
	// purpose, and a type with no front-end view would only 404. The classic
	// meta box applies the same rule server-side (ClassicEditorMetaBox).
	const isShareable =
		isViewable && ! [ 'publish', 'private', 'trash' ].includes( status );

	if ( ! isShareable ) {
		return null;
	}

	return (
		<PluginDocumentSettingPanel
			name="shareadraft"
			title={ __( 'Share a Draft', 'shareadraft' ) }
		>
			<ShareADraftControls postId={ postId } />
		</PluginDocumentSettingPanel>
	);
}

registerPlugin( 'shareadraft', { render: ShareADraftPanel } );
