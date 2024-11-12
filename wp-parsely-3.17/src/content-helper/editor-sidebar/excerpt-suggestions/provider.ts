/**
 * WordPress dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { BaseProvider } from '../../common/base-provider';

/**
 * Provides the generate excerpt functionality to be used in other components.
 *
 * @since 3.13.0
 */
export class ExcerptSuggestionsProvider extends BaseProvider {
	/**
	 * The singleton instance of the ExcerptSuggestionsProvider.
	 *
	 * @since 3.16.0
	 */
	private static instance: ExcerptSuggestionsProvider;

	/**
	 * Returns the singleton instance of the TitleSuggestionsProvider.
	 *
	 * @since 3.16.0
	 *
	 * @return {ExcerptSuggestionsProvider} The singleton instance.
	 */
	public static getInstance(): ExcerptSuggestionsProvider {
		if ( ! this.instance ) {
			this.instance = new ExcerptSuggestionsProvider();
		}

		return this.instance;
	}

	/**
	 * Generates an excerpt for a given post.
	 *
	 * @param {string} title   The title of the post.
	 * @param {string} content The content of the post.
	 * @param {string} persona The persona to use for the suggestion.
	 * @param {string} tone    The tone to use for the suggestion.
	 *
	 * @return {Promise<string>} The generated excerpt.
	 */
	public async generateExcerpt(
		title: string, content: string, persona: string, tone: string
	): Promise<string> {
		if ( '' === title ) {
			title = 'Untitled';
		}

		return await this.fetch<string>( {
			method: 'POST',
			path: addQueryArgs( '/wp-parsely/v2/content-helper/excerpt-generator/generate', {
				title,
				persona,
				style: tone,
			} ),
			data: {
				text: content,
			},
		} );
	}
}
