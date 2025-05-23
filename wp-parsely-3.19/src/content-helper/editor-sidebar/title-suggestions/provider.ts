/**
 * WordPress dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { getPersonaLabel, PersonaProp } from '../../common/components/persona-selector';
import { getToneLabel, ToneProp } from '../../common/components/tone-selector';
import { BaseProvider } from '../../common/providers/base-provider';

/**
 * Returns data from the `content-suggestions/suggest-headline` WordPress REST API
 * endpoint.
 *
 * @since 3.12.0
 */
export class TitleSuggestionsProvider extends BaseProvider {
	/**
	 * The singleton instance of the TitleSuggestionsProvider.
	 *
	 * @since 3.15.0
	 */
	private static instance: TitleSuggestionsProvider;

	/**
	 * Returns the singleton instance of the TitleSuggestionsProvider.
	 *
	 * @since 3.15.0
	 *
	 * @return {TitleSuggestionsProvider} The singleton instance.
	 */
	public static getInstance(): TitleSuggestionsProvider {
		if ( ! this.instance ) {
			this.instance = new TitleSuggestionsProvider();
		}

		return this.instance;
	}

	/**
	 * Returns a list of suggested titles for the given content.
	 *
	 * @param {string}      content The content to generate titles for.
	 * @param {number}      limit   The number of titles to return. Defaults to 3.
	 * @param {ToneProp}    tone    The tone to use when generating the titles.
	 * @param {PersonaProp} persona The persona to use when generating the titles.
	 *
	 * @return {Promise<string[]>} The resulting list of titles.
	 */
	public async generateTitles( content: string, limit: number = 3, tone: ToneProp, persona: PersonaProp ): Promise<string[]> {
		const response = this.fetch<string[]>( {
			method: 'POST',
			path: addQueryArgs( '/wp-parsely/v2/content-helper/title-suggestions/generate', {
				limit,
				tone: getToneLabel( tone ),
				persona: getPersonaLabel( persona ),
			} ),
			data: {
				text: content,
			},
		} );

		return response ?? [];
	}
}
