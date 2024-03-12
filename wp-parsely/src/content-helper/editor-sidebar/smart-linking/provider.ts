/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { ContentHelperError, ContentHelperErrorCode } from '../../common/content-helper-error';
import { DEFAULT_MAX_LINK_WORDS, DEFAULT_MAX_LINKS } from './smart-linking';

/**
 * Structure of a link suggestion returned by the
 * `content-suggestions/suggest-linked-reference` endpoint.
 *
 * @since 3.14.0
 */
export type LinkSuggestion = {
	href: string;
	text: string;
	title: string;
	offset: number;
};

/**
 * Specifies the form of the response returned by the
 * `content-suggestions/suggest-linked-reference` WordPress REST API endpoint.
 *
 * @since 3.14.0
 */
interface SmartLinkingApiResponse {
	error?: Error;
	data: LinkSuggestion[];
}

/**
 * Returns data from the `content-suggestions/suggest-linked-reference` WordPress REST API
 * endpoint.
 *
 * @since 3.14.0
 */
export class SmartLinkingProvider {
	/**
	 * Returns a list of suggested links for the given content.
	 *
	 * @param {string} content         The content to generate links for.
	 * @param {number} maxLinkWords    The maximum number of words in links.
	 * @param {number} maxLinksPerPost The maximum number of links to return.
	 *
	 * @return {Promise<LinkSuggestion[]>} The resulting list of links.
	 */
	static async generateSmartLinks(
		content: string,
		maxLinkWords: number = DEFAULT_MAX_LINK_WORDS,
		maxLinksPerPost: number = DEFAULT_MAX_LINKS,
	): Promise<LinkSuggestion[]> {
		let response;

		try {
			response = await apiFetch<SmartLinkingApiResponse>( {
				method: 'POST',
				path: addQueryArgs( '/wp-parsely/v1/content-suggestions/suggest-linked-reference', {
					max_link_words: maxLinkWords,
					max_links: maxLinksPerPost,
				} ),
				data: {
					content,
				},
			} );
		} catch ( wpError: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			return Promise.reject( new ContentHelperError( wpError.message, wpError.code ) );
		}

		if ( response?.error ) {
			return Promise.reject(
				new ContentHelperError(
					response.error.message,
					ContentHelperErrorCode.ParselyApiResponseContainsError,
				),
			);
		}

		return response.data ?? [];
	}
}
