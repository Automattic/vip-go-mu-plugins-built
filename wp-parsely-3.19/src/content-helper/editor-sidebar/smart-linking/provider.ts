/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { ContentHelperError, ContentHelperErrorCode } from '../../common/content-helper-error';
import { BaseProvider } from '../../common/providers/base-provider';
import { getApiPeriodParams } from '../../common/utils/api';
import { Metric, Period } from '../../common/utils/constants';
import { PerformanceData } from '../performance-stats/model';
import { DEFAULT_MAX_LINKS } from './smart-linking';

/**
 * The status of a smart link.
 *
 * @since 3.19.0
 */
type SmartLinkStatus = 'applied' | 'pending';

/**
 * Structure of a link suggestion returned by the
 * 'content-suggestions/suggest-linked-reference' endpoint.
 *
 * @since 3.14.0
 * @since 3.16.0 Added the `applied`, `match`, `source` and `destination` properties.
 * @since 3.18.0 Added the `wp_post_meta` and `post_stats` properties.
 */
export type SmartLink = {
	uid: string;
	smart_link_id: number;
	href: {
		raw: string;
		itm: string;
	};
	text: string;
	title: string;
	offset: number;
	applied: boolean;
	status: SmartLinkStatus;
	match?: SmartLinkMatch;
	source?: LinkedPost;
	destination?: LinkedPost;
	wp_post_meta?: PostMeta;
	post_stats?: {
		avg_engaged?: string;
		views?: string;
		visitors?: string;
	}
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
		type: {
			name: string;
			label: string;
			rest: string;
		};
		paragraph: string;
		is_first_paragraph: boolean;
		is_last_paragraph: boolean;
		permalink: string;
		parsely_canonical_url: string;
		edit_link: string;
		author: string,
		date: string,
		image: string|false,
	};
	validation?: {
		valid: boolean;
		reason?: string;
	};
	is_link_replacement?: boolean;
}

/**
 * Structure of a post meta object, returned by the
 * 'content-helper/smart-linking/get-post-meta-for-urls' endpoint.
 *
 * @since 3.18.0
 */
type PostMeta = {
	author?: string;
	date?: string;
	thumbnail?: string|false;
	title?: string;
	type?: string;
	url?: string;
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
	parsely_canonical_url: string;
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
	 * Fetches the extra data - WordPress post meta and Parse.ly stats - for the
	 * outbound smart links.
	 *
	 * @since 3.18.0
	 *
	 * @param {SmartLink[]} smartLinks The outbound smart links.
	 *
	 * @return {Promise<SmartLink[]>} The outbound smart links with the extra data.
	 */
	private async fetchSmartLinksExtraData( smartLinks: SmartLink[] ): Promise<SmartLink[]> {
		if ( smartLinks.length === 0 ) {
			return [];
		}

		// Fetch the posts stats and meta for the outbound smart links.
		const [ postsStats, postsMetas ] = await Promise.all( [
			this.fetch<PerformanceData[]>( {
				path: addQueryArgs(
					`/wp-parsely/v2/stats/posts`, {
						...getApiPeriodParams( Period.Days30 ),
						limit: smartLinks.length,
						sort: Metric.AvgEngaged, // Force return of visitors and avg_engaged.
						urls: smartLinks.map( ( link ) => link.href.raw ),
					} ),
			} ),
			this.getPostMetaForURLs( smartLinks.map( ( link ) => link.href.raw ) ),
		] );

		// Update the smart links with the extra data.
		const updatedSmartLinks = smartLinks.map( ( link ) => {
			const postMeta = postsMetas.find( ( meta ) => meta.url === link.href.raw );
			const postStats = postsStats.find( ( stat ) => stat.url === link.href.raw );

			// Don't include links for which we didn't find any data, as the URL
			// probably doesn't exist. Include stats data in the check, so most
			// results can still be returned under local development environments.
			if ( undefined === postMeta && undefined === postStats ) {
				// eslint-disable-next-line no-console
				console.warn( `PCH Smart Linking: Skipping potentially nonexistent URL: ${ link.href }` );
				return null;
			}

			const extraData: {
				wp_post_meta?: PostMeta;
				post_stats?: {
					avg_engaged?: string;
					views?: string;
					visitors?: string;
				};
			} = {
				wp_post_meta: {
					// Use WordPress post meta values, as data from the Parse.ly
					// API could be unavailable or outdated. Use stats values as
					// fallbacks to display data under local development environments.
					author: postMeta?.author ?? postStats?.author,
					date: postMeta?.date ?? postStats?.date,
					thumbnail: postMeta?.thumbnail,
					title: postMeta?.title ?? postStats?.title,
					url: postMeta?.url ?? postStats?.url,
					type: postMeta?.type,
				},
			};

			if ( undefined !== postStats ) {
				extraData.post_stats = {
					avg_engaged: postStats?.avgEngaged,
					views: postStats?.views,
					visitors: postStats?.visitors,
				};
			}

			return {
				...link,
				...extraData,
			};
		} ).filter( ( link ) => link !== null );

		return updatedSmartLinks;
	}

	/**
	 * Returns a list of suggested links for the given content.
	 *
	 * @since 3.15.0
	 * @since 3.19.0 Fetches the extra data for the outbound smart links.
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
		// Get the smart links.
		const smartLinks = await this.fetch<SmartLink[]>( {
			method: 'POST',
			path: addQueryArgs( '/wp-parsely/v2/content-helper/smart-linking/generate', {
				max_links: maxLinksPerPost,
			} ),
			data: {
				url_exclusion_list: urlExclusionList,
				text: content,
			},
		} );

		// Create the outbound smart links from all the data.
		const outboundSmartLinks = await this.fetchSmartLinksExtraData( smartLinks );

		return outboundSmartLinks;
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
			path: `/wp-parsely/v2/content-helper/smart-linking/${ postID }/add`,
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
			path: `/wp-parsely/v2/content-helper/smart-linking/${ postID }/add-multiple`,
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
			path: `/wp-parsely/v2/content-helper/smart-linking/${ postID }/set`,
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
		const smartLinks = await this.fetch<GetSmartLinksResponse>( {
			method: 'GET',
			path: `/wp-parsely/v2/content-helper/smart-linking/${ postID }/get`,
		} );

		// Fetch the extra data for the outbound smart links.
		const outboundSmartLinks = await this.fetchSmartLinksExtraData( smartLinks.outbound );

		return {
			outbound: outboundSmartLinks,
			inbound: smartLinks.inbound,
		};
	}

	/**
	 * Returns WordPress post meta for the given URLs.
	 *
	 * @since 3.18.0
	 *
	 * @param {string[]} urls The URLs of the posts.
	 *
	 * @return {Promise<PostMeta[]>} The WordPress meta for the posts.
	 */
	public async getPostMetaForURLs( urls: string[] ): Promise<PostMeta[]> {
		return await this.fetch<PostMeta[]>( {
			method: 'POST',
			path: '/wp-parsely/v2/content-helper/smart-linking/get-post-meta-for-urls',
			data: {
				urls,
			},
		} );
	}
}
