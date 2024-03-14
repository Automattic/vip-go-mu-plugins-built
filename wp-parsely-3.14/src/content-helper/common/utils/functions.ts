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
