/**
 * Internal dependencies
 */
import { BaseProvider } from '../../common/providers/base-provider';
import { DEFAULT_EXCERPT_LENGTH } from './constants';

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
	 * @since 3.16.0
	 * @since 3.24.0 Added the `maxCharacters` parameter.
	 *
	 * @param {string} title         The title of the post.
	 * @param {string} content       The content of the post.
	 * @param {string} persona       The persona to use for the suggestion.
	 * @param {string} tone          The tone to use for the suggestion.
	 * @param {number} maxCharacters The desired excerpt length, in characters.
	 *
	 * @return {Promise<string>} The generated excerpt.
	 */
	public async generateExcerpt(
		title: string,
		content: string,
		persona: string,
		tone: string,
		maxCharacters: number = DEFAULT_EXCERPT_LENGTH
	): Promise<string> {
		if ( '' === title ) {
			title = 'Untitled';
		}

		return await this.fetch<string>( {
			method: 'POST',
			path: '/wp-parsely/v2/content-helper/excerpt-generator/generate',
			data: {
				text: content,
				title,
				persona,
				style: tone,
				max_characters: maxCharacters,
			},
		} );
	}
}
