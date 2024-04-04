/**
 * Escapes special characters in a string for use in a regular expression.
 *
 * @since 3.14.0
 * @since 3.14.1 Moved from `editor-sidebar/smart-linking/utils.ts` to `common/utils/functions.ts`.
 *
 * @param { string } string The string to be escaped.
 *
 * @return { string } The escaped string.
 */
export function escapeRegExp( string: string ): string {
	return string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ); // $& means the whole matched string.
}

/**
 * Generates both http and https versions of a URL.
 *
 * @since 3.14.3
 *
 * @param { string } url The URL to generate protocol variants for.
 *
 * @return { string[] } An array containing both http and https versions of the URL.
 */
export function generateProtocolVariants( url: string ): string[] {
	const strippedUrl = url.replace( /^https?:\/\//i, '' );

	const httpUrl = 'http://' + strippedUrl;
	const httpsUrl = 'https://' + strippedUrl;

	return [ httpUrl, httpsUrl ];
}
