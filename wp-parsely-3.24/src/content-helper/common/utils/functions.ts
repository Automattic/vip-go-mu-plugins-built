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
 * Returns the document holding the Editor canvas.
 *
 * The Post Editor is always iframed as of WordPress 7.1, and conditionally
 * iframed before it. Falls back to the admin document when not iframed.
 *
 * @since 3.23.6
 *
 * @return {Document} The document holding the Editor canvas.
 */
export function getEditorCanvasDocument(): Document {
	// WordPress 6.5 and later name the canvas iframe.
	const namedCanvas = document.querySelector<HTMLIFrameElement>(
		'iframe[name="editor-canvas"]'
	);

	if ( namedCanvas?.contentDocument ) {
		return namedCanvas.contentDocument;
	}

	// WordPress 6.3 and 6.4 iframe the canvas without naming the iframe, so it
	// gets identified by the Editor markup it holds.
	const iframes = Array.from(
		document.querySelectorAll<HTMLIFrameElement>( 'iframe' )
	);

	for ( const iframe of iframes ) {
		// Reading contentDocument returns null for cross-origin iframes.
		const iframeDocument = iframe.contentDocument;

		if ( iframeDocument?.querySelector( '.editor-styles-wrapper, .block-editor-block-list__layout' ) ) {
			return iframeDocument;
		}
	}

	return document;
}

/**
 * Waits for an element to exist in the Editor canvas, which is populated
 * asynchronously after the Editor reports itself as ready.
 *
 * @since 3.23.6
 *
 * @param {string} selector  The selector to wait for.
 * @param {number} timeoutMs How long to wait before giving up, in milliseconds.
 *
 * @return {Promise<HTMLElement|null>} The matched element, or null on timeout.
 */
export function waitForEditorCanvasElement(
	selector: string,
	timeoutMs: number = 5000
): Promise<HTMLElement | null> {
	return new Promise( ( resolve ) => {
		const deadline = Date.now() + timeoutMs;

		const poll = (): void => {
			const element =
				getEditorCanvasDocument().querySelector<HTMLElement>( selector );

			if ( element ) {
				resolve( element );
				return;
			}

			if ( Date.now() >= deadline ) {
				resolve( null );
				return;
			}

			setTimeout( poll, 100 );
		};

		poll();
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
