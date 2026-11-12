import { escapeHTML } from '@wordpress/escape-html';

/**
 * Escapes the HTML in a translated string, keeping its type so that sprintf()
 * can still check the string's placeholders against its arguments.
 *
 * @since 3.25.1
 *
 * @param {string} text The translated string.
 *
 * @return {string} The escaped string.
 */
export function escapeTranslation<T extends string>( text: T ): T {
	// escapeHTML() only rewrites `&` and `<`, which no placeholder contains.
	return escapeHTML( text ) as T;
}
