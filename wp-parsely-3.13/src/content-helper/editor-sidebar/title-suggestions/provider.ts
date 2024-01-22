/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import {
	ContentHelperError,
	ContentHelperErrorCode,
} from '../../common/content-helper-error';
import { getToneLabel, ToneProp } from '../../common/components/tone-selector';
import { getPersonaLabel, PersonaProp } from '../../common/components/persona-selector';

/**
 * Specifies the form of the response returned by the
 * `content-suggestions/write-title` WordPress REST API endpoint.
 *
 * @since 3.12.0
 */
interface WriteTitleApiResponse {
	error?: Error;
	data: string[],
}

/**
 * Returns data from the `content-suggestions/write-title` WordPress REST API
 * endpoint.
 *
 * @since 3.12.0
 */
export class WriteTitleProvider {
	/**
	 * Returns a list of suggested titles for the given content.
	 *
	 * @param {string }     content The content to generate titles for.
	 * @param {number}      limit   The number of titles to return. Defaults to 3.
	 * @param {ToneProp}    tone    The tone to use when generating the titles.
	 * @param {PersonaProp} persona The persona to use when generating the titles.
	 *
	 * @return { Promise<string[]>} The resulting list of titles.
	 */
	public async generateTitles( content: string, limit: number = 3, tone: ToneProp, persona: PersonaProp ): Promise<string[]> {
		let response;

		try {
			response = await apiFetch<WriteTitleApiResponse>( {
				path: addQueryArgs( '/wp-parsely/v1/content-suggestions/write-title', {
					content,
					limit,
					tone: getToneLabel( tone ),
					persona: getPersonaLabel( persona ),
				} ),
			} );
		} catch ( wpError: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			return Promise.reject( new ContentHelperError(
				wpError.message, wpError.code
			) );
		}

		if ( response?.error ) {
			return Promise.reject( new ContentHelperError(
				response.error.message,
				ContentHelperErrorCode.ParselyApiResponseContainsError
			) );
		}

		return response?.data ?? [];
	}
}
