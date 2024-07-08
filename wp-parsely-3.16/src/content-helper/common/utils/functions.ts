import { select, subscribe } from '@wordpress/data';

/**
 * Escapes special characters in a string for use in a regular expression.
 *
 * @since 3.14.0
 * @since 3.14.1 Moved from `editor-sidebar/smart-linking/utils.ts` to `common/utils/functions.ts`.
 *
 * @param {string} string The string to be escaped.
 *
 * @return {string} The escaped string.
 */
export function escapeRegExp( string: string ): string {
	return string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ); // $& means the whole matched string.
}

/**
 * Generates both http and https versions of a URL.
 *
 * @since 3.14.3
 *
 * @param {string} url The URL to generate protocol variants for.
 *
 * @return {string[]} An array containing both http and https versions of the URL.
 */
export function generateProtocolVariants( url: string ): string[] {
	const strippedUrl = url.replace( /^https?:\/\//i, '' );

	const httpUrl = 'http://' + strippedUrl;
	const httpsUrl = 'https://' + strippedUrl;

	return [ httpUrl, httpsUrl ];
}

/**
 * Checks if the editor is ready to be interacted with.
 * It waits for the editor to be clean or to have at least one block, and it resolves when it's ready.
 *
 * @since 3.14.0
 * @since 3.16.0 Moved from `editor-sidebar/smart-linking/component-block-change.tsx`
 * 							 to `common/utils/functions.ts`.
 */
export async function isEditorReady(): Promise<void> {
	return new Promise( ( resolve ) => {
		const unsubscribeEditorReady = subscribe( () => {
			if ( select( 'core/editor' ).isCleanNewPost() || select( 'core/block-editor' ).getBlockCount() > 0 ) {
				unsubscribeEditorReady();
				resolve();
			}
		} );
	} );
}
