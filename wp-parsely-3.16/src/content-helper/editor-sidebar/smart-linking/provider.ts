/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { BaseProvider } from '../../common/base-provider';
import { ContentHelperError, ContentHelperErrorCode } from '../../common/content-helper-error';
import { DEFAULT_MAX_LINKS } from './smart-linking';

/**
 * Structure of a link suggestion returned by the
 * 'content-suggestions/suggest-linked-reference' endpoint.
 *
 * @since 3.14.0
 * @since 3.16.0 Added the `applied`, `match`, `source` and `destination` properties.
 */
export type SmartLink = {
	uid: string;
	href: string;
	text: string;
	title: string;
	offset: number;
	applied: boolean;
	match?: SmartLinkMatch;
	source?: LinkedPost;
	destination?: LinkedPost;
};

/**
 * Structure of an inbound smart link, which is a smart link in a different post,
 * that links to the current post.
 *
 * @since 3.16.0
 */
export type InboundSmartLink = SmartLink & {
	post_data?: {
		id: number;
		title: string;
		type: string;
		paragraph: string;
		is_first_paragraph: boolean;
		is_last_paragraph: boolean;
		permalink: string;
		edit_link: string;
		author: string,
		date: string,
		image: string|false,
	};
}

/**
 * Structure of a link suggestion match, that is filled in by the
 * processing of the smart links.
 *
 * @since 3.16.0
 */
export type SmartLinkMatch = {
	blockId: string;
	blockPosition: number;
	blockOffset: number;
	blockLinkPosition: number;
}

/**
 * Structure of a linked post object. To be used with source and destination
 * properties of the SmartLink object.
 *
 * @since 3.16.0
 */
type LinkedPost = {
	post_id: number;
	post_type: string;
}

/**
 * Structure of the response from the 'smart-linking/[post-id]/add-multiple' endpoint.
 *
 * @since 3.16.0
 */
type AddMultipleSmartLinksResponse = {
	added: SmartLink[],
	failed: SmartLink[],
}

/**
 * Structure of the response from the 'smart-linking/[post-id]/get' endpoint.
 *
 * @since 3.16.0
 */
type GetSmartLinksResponse = {
	outbound: SmartLink[],
	inbound: InboundSmartLink[],
}

/**
 * Returns data from the 'content-suggestions/suggest-linked-reference'
 * WordPress REST API endpoint.
 *
 * @since 3.14.0
 */
export class SmartLinkingProvider extends BaseProvider {
	/**
	 * The singleton instance of the SmartLinkingProvider.
	 *
	 * @since 3.15.0
	 */
	private static instance: SmartLinkingProvider;

	/**
	 * Returns the singleton instance of the SmartLinkingProvider.
	 *
	 * @since 3.15.0
	 *
	 * @return {SmartLinkingProvider} The singleton instance.
	 */
	public static getInstance(): SmartLinkingProvider {
		if ( ! SmartLinkingProvider.instance ) {
			SmartLinkingProvider.instance = new SmartLinkingProvider();
		}
		return SmartLinkingProvider.instance;
	}

	/**
	 * Returns a list of suggested links for the given content.
	 *
	 * @param {string}   content          The content to generate links for.
	 * @param {number}   maxLinksPerPost  The maximum number of links to return.
	 * @param {string[]} urlExclusionList A list of URLs to exclude from the suggestions.
	 *
	 * @return {Promise<SmartLink[]>} The resulting list of links.
	 */
	public async generateSmartLinks(
		content: string,
		maxLinksPerPost: number = DEFAULT_MAX_LINKS,
		urlExclusionList: string[] = [],
	): Promise<SmartLink[]> {
		const response = await this.fetch<SmartLink[]>( {
			method: 'POST',
			path: addQueryArgs( '/wp-parsely/v1/content-suggestions/suggest-linked-reference', {
				max_links: maxLinksPerPost,
			} ),
			data: {
				url_exclusion_list: urlExclusionList,
				text: content,
			},
		} );

		return response ?? [];
	}

	/**
	 * Adds a smart link to a post.
	 *
	 * @since 3.16.0
	 *
	 * @param {number}    postID         The ID of the post to add the link to.
	 * @param {SmartLink} linkSuggestion The link suggestion to add.
	 *
	 * @return {Promise<SmartLink>} The added link.
	 */
	public async addSmartLink( postID: number, linkSuggestion: SmartLink ): Promise<SmartLink> {
		return await this.fetch<SmartLink>( {
			method: 'POST',
			path: `/wp-parsely/v1/smart-linking/${ postID }/add`,
			data: {
				link: linkSuggestion,
			},
		} );
	}

	/**
	 * Adds multiple smart links to a post.
	 *
	 * @since 3.16.0
	 *
	 * @param {number}      postID          The ID of the post to add the links to.
	 * @param {SmartLink[]} linkSuggestions The list of link suggestions to add.
	 *
	 * @return {Promise<AddMultipleSmartLinksResponse>} The response from the API.
	 */
	public async addSmartLinks(
		postID: number,
		linkSuggestions: SmartLink[]
	): Promise<AddMultipleSmartLinksResponse> {
		if ( postID === 0 ) {
			throw new ContentHelperError(
				__( 'Invalid post ID.', 'wp-parsely' ),
				ContentHelperErrorCode.PostIsNotPublished,
			);
		}

		return await this.fetch<AddMultipleSmartLinksResponse>( {
			method: 'POST',
			path: `/wp-parsely/v1/smart-linking/${ postID }/add-multiple`,
			data: {
				links: linkSuggestions,
			},
		} );
	}

	/**
	 * Sets the smart links for a post, by saving the list of smart links.
	 *
	 * This method will replace the existing smart links for the post with the new list.
	 *
	 * @since 3.16.0
	 *
	 * @param {number}      postID     The ID of the post to set the links for.
	 * @param {SmartLink[]} smartLinks The list of smart links to set.
	 *
	 * @return {Promise<AddMultipleSmartLinksResponse>} The response from the API.
	 */
	public async setSmartLinks(
		postID: number,
		smartLinks: SmartLink[],
	): Promise<AddMultipleSmartLinksResponse> {
		if ( postID === 0 ) {
			throw new ContentHelperError(
				__( 'Invalid post ID.', 'wp-parsely' ),
				ContentHelperErrorCode.PostIsNotPublished,
			);
		}

		// Filter out any smart links that are not applied yet.
		const appliedSmartLinks = smartLinks.filter( ( link ) => link.applied );

		return await this.fetch<AddMultipleSmartLinksResponse>( {
			method: 'POST',
			path: `/wp-parsely/v1/smart-linking/${ postID }/set`,
			data: {
				links: appliedSmartLinks,
			},
		} );
	}

	/**
	 * Gets the smart links for a post.
	 *
	 * @since 3.16.0
	 *
	 * @param {number} postID The ID of the post to get the links for.
	 *
	 * @return {Promise<SmartLink[]>} The list of smart links for the post.
	 */
	public async getSmartLinks( postID: number ): Promise<GetSmartLinksResponse> {
		return await this.fetch<GetSmartLinksResponse>( {
			method: 'GET',
			path: `/wp-parsely/v1/smart-linking/${ postID }/get`,
		} );
	}

	/**
	 * Get the post type of post by its URL.
	 *
	 * @since 3.16.0
	 *
	 * @param {string} url The URL of the post.
	 *
	 * @return {Promise<string>} The post type of the post.
	 */
	public async getPostTypeByURL( url: string ): Promise<LinkedPost> {
		return await this.fetch<LinkedPost>( {
			method: 'POST',
			path: '/wp-parsely/v1/smart-linking/url-to-post-type',
			data: {
				url,
			},
		} );
	}
}
