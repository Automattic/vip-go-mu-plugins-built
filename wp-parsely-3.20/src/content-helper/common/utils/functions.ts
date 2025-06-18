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

/**
 * Adds ITM parameters to a URL.
 *
 * @since 3.19.0
 *
 * @param {string} url                The URL to add ITM parameters to.
 * @param {Object} itmParams          The ITM parameters to add to the URL.
 * @param {string} itmParams.campaign The campaign parameter.
 * @param {string} itmParams.source   The source parameter.
 * @param {string} itmParams.medium   The medium parameter.
 * @param {string} itmParams.content  The content parameter.
 * @param {string} itmParams.term     The term parameter.
 *
 * @return {string} The URL with ITM parameters added.
 */
export function addITMParamsToURL( url: string, itmParams: {
	campaign: string;
	source?: string;
	medium?: string;
	content?: string;
	term?: string;
} ): string {
	const urlObj = new URL( url );
	urlObj.searchParams.set( 'itm_campaign', itmParams.campaign );

	if ( itmParams.source ) {
		urlObj.searchParams.set( 'itm_source', itmParams.source );
	}
	if ( itmParams.medium ) {
		urlObj.searchParams.set( 'itm_medium', itmParams.medium );
	}
	if ( itmParams.content ) {
		urlObj.searchParams.set( 'itm_content', itmParams.content );
	}
	if ( itmParams.term ) {
		urlObj.searchParams.set( 'itm_term', itmParams.term );
	}

	return urlObj.toString();
}

/**
 * Removes ITM parameters from a URL.
 *
 * @since 3.19.0
 *
 * @param {string} url The URL to remove ITM parameters from.
 *
 * @return {string} The URL with ITM parameters removed.
 */
export function removeITMParamsFromURL( url: string ): string {
	const urlObj = new URL( url );
	urlObj.searchParams.delete( 'itm_campaign' );
	urlObj.searchParams.delete( 'itm_source' );
	urlObj.searchParams.delete( 'itm_medium' );
	urlObj.searchParams.delete( 'itm_content' );
	urlObj.searchParams.delete( 'itm_term' );

	return urlObj.toString();
}
