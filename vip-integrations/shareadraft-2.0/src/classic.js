/**
 * Share a Draft on the classic edit screen.
 *
 * Mounts the same controls as the block-editor panel into the "Share a Draft"
 * meta box. The server only renders the box for a shareable post, and the
 * classic screen reloads on every status change, so no client-side check is
 * needed here.
 */

import { createRoot } from '@wordpress/element';
import { ShareADraftControls } from './controls';

const container = document.getElementById( 'shareadraft-classic' );

if ( container ) {
	createRoot( container ).render(
		<ShareADraftControls
			postId={ parseInt( container.dataset.postId, 10 ) }
		/>
	);
}
