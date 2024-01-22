/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { ContentHelperError, ContentHelperErrorCode } from '../common/content-helper-error';

/**
 * Specifies the form of the response returned by the
 * `/content-suggestions/suggest-meta-description` WordPress REST API endpoint.
 *
 * @since 3.13.0
 */
interface ExcerptGeneratorApiResponse {
 error?: Error;
 data: string;
}

/**
 * Provides the generate excerpt functionality to be used in other components.
 *
 * @since 3.13.0
 */
export class ExcerptGeneratorProvider {
	/**
	 * Generates an excerpt for a given post.
	 *
	 * @param {string} title   The title of the post.
	 * @param {string} content The content of the post.
	 *
	 * @return {Promise<string>} The generated excerpt.
	 */
	public async generateExcerpt( title: string, content: string ): Promise<string> {
		let response;
		try {
			response = await apiFetch<ExcerptGeneratorApiResponse>( {
				path: addQueryArgs( '/wp-parsely/v1/content-suggestions/suggest-meta-description', {
					title,
					content,
				} ),
			} );
		} catch ( wpError: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			return Promise.reject( new ContentHelperError( wpError.message, wpError.code ) );
		}

		if ( response?.error ) {
			return Promise.reject( new ContentHelperError(
				response.error.message,
				ContentHelperErrorCode.ParselyApiResponseContainsError
			) );
		}

		return response?.data ?? '';
	}
}
