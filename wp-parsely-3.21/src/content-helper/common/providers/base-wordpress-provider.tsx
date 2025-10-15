/**
 * WordPress dependencies
 */
/* eslint-disable import/named */
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import { Post as CorePost, Taxonomy as CoreTaxonomy, User } from '@wordpress/core-data';
/* eslint-enable import/named */
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { ContentHelperError, ContentHelperErrorCode } from '../content-helper-error';
import { BaseProvider } from './base-provider';

/**
 * Type definition for a taxonomy term.
 *
 * The core Taxonomy needs to be extended as the core type is missing a few properties.
 *
 * @since 3.18.0
 */
type Taxonomy = CoreTaxonomy & {
	id: number;
	taxonomy: string;
};

/**
 * Extended Post interface to include embedded data.
 *
 * @since 3.18.0
 */
export interface Post extends CorePost {
	_embedded?: {
		author?: User[];
		'wp:term'?: Taxonomy[][];
		'wp:featuredmedia'?: {
			id: number
			type: string,
			title: { rendered: string },
			featured_media: number,
			media_type: string,
			source_url: string,
			media_details: {
				width: number,
				height: number,
				file: string,
				sizes: {
					[ key: string ]: {
						file: string,
						width: number,
						height: number,
						mime_type: string,
						source_url: string,
					}
				}
			},
		}[];
	};
	parsely?: {
		version: string;
		canonical_url: string;
		smart_links: {
			inbound: number;
			outbound: number;
		};
		traffic_boost_suggestions_count: number;
	};
}

/**
 * Type definition for a hydrated post.
 *
 * A hydrated post is a post with additional data, already fetched.
 *
 * @since 3.18.0
 */
export type HydratedPost = Omit<Post, 'author' | 'categories' | 'tags'> & {
	link: string;
	author: User | null;
	categories: Taxonomy[];
	tags: Taxonomy[];
	thumbnail: string;
	parsely_canonical_url?: string;
};

/**
 * Type definition for a fetch response.
 *
 * @since 3.18.0
 *
 * @template T The type of the data to fetch.
 * @property {number}   total_items The total number of items.
 * @property {number}   total_pages The total number of pages.
 * @property {T}        data        The fetched data.
 * @property {Response} response    The raw Response object.
 */
export type FetchResponse<T> = {
	total_items: number;
	total_pages: number;
	data: T;
	response: Response;
};

/**
 * Structure of the response from the 'utils/post/[post-id]/rest-route' endpoint.
 *
 * @since 3.20.5
 */
type PostRestRouteResponse = {
	data: string;
}

/**
 * Type definition for query parameters.
 *
 * @since 3.18.0
 */
export type QueryParams = Record<string, any> & { // eslint-disable-line @typescript-eslint/no-explicit-any
	context?: 'view' | 'edit' | 'embed';
};

/**
 * Base class for all WordPress REST API providers.
 *
 * Provides a common interface for fetching data from the WordPress REST API,
 * with support for cancelling requests.
 *
 * @since 3.18.0
 */
export abstract class BaseWordPressProvider extends BaseProvider {
	/**
	 * Fetches data from the WordPress REST API using apiFetch.
	 *
	 * @since 3.18.0
	 *
	 * @template T The type of the data to fetch.
	 *
	 * @param {APIFetchOptions} options The options to pass to apiFetch.
	 * @param {string?}         id      The (optional) ID of the request.
	 *
	 * @return {Promise<T>} The fetched data.
	 */
	protected async apiFetch<T>( options: APIFetchOptions, id?: string ): Promise<FetchResponse<T>> {
		const { abortController, abortId } = this.getOrCreateController( id );
		options.signal = abortController.signal;

		// Disable parsing of the response body.
		options.parse = false;

		try {
			// Fetch the raw Response object.
			const response = ( await apiFetch( options ) ) as Response;

			// Access headers from the response.
			const totalItemsHeader = response.headers.get( 'X-WP-Total' );
			const totalPagesHeader = response.headers.get( 'X-WP-TotalPages' );

			// Parse headers to integers.
			const totalItems = totalItemsHeader ? parseInt( totalItemsHeader, 10 ) : 0;
			const totalPages = totalPagesHeader ? parseInt( totalPagesHeader, 10 ) : 0;

			// Parse the response body as JSON.
			const data: T = await response.json();

			return {
				total_items: totalItems,
				total_pages: totalPages,
				data,
				response,
			};
		} catch ( wpError: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			if ( wpError.name === 'AbortError' ) {
				return Promise.reject(
					new ContentHelperError(
						__( 'The operation was aborted.', 'wp-parsely' ),
						ContentHelperErrorCode.ParselyAborted,
					),
				);
			}

			const errorData = await wpError.json();
			return Promise.reject( new ContentHelperError( errorData.message ?? '', errorData.code, '' ) );
		} finally {
			// Clean up the AbortController after the request completes.
			this.abortControllers.delete( abortId );
		}
	}

	/**
	 * Fetches data from the API. Either resolves with the data or rejects with
	 * an error.
	 *
	 * This method is a wrapper around apiFetch() that automatically adds the
	 * AbortController signal.
	 *
	 * @since 3.19.0
	 *
	 * @template T The type of the data to fetch.
	 *
	 * @param {APIFetchOptions} options The options to pass to apiFetch.
	 * @param {string?}         id      The (optional) ID of the request.
	 *
	 * @return {Promise<T>} The fetched data.
	 */
	protected async fetch<T>( options: APIFetchOptions, id?: string ): Promise<T> {
		return ( await this.apiFetch<T>( options, id ) ).data;
	}

	/**
	 * Hydrates posts with additional embedded data.
	 *
	 * An HydratedPost is a Post with additional data, already fetched from
	 * the REST API.
	 *
	 * This method extracts the author, categories, tags and thumbnail from the
	 * _embedded property of the Post object.
	 *
	 * @since 3.18.0
	 *
	 * @param {Post[]} posts Array of Post objects to hydrate.
	 *
	 * @return {Promise<HydratedPost[]>} Promise resolving to an array of hydrated Post objects.
	 */
	private async hydratePosts( posts: Post[] ): Promise<HydratedPost[]> {
		// Map over the posts and extract embedded author and categories.
		const hydratedPosts = posts.map( ( post ) => {
			// Initialize empty arrays for the data we want to extract.
			let categories: Taxonomy[] = [];
			let tags: Taxonomy[] = [];
			let thumbnail = '';

			// Extract author data from _embedded.
			const author = post._embedded?.author ? post._embedded.author[ 0 ] : null;

			// Extract categories and tags data from _embedded.
			// The first element in the array is categories, the second is tags.
			if ( post?._embedded?.[ 'wp:term' ] ) {
				[ categories, tags ] = post._embedded[ 'wp:term' ];
			}

			// Get the post thumbnail.
			if ( post?._embedded?.[ 'wp:featuredmedia' ] ) {
				const featuredMedia = post._embedded[ 'wp:featuredmedia' ]?.[ 0 ];
				thumbnail = featuredMedia?.media_details?.sizes?.thumbnail?.source_url;

				if ( ! thumbnail ) {
					thumbnail = featuredMedia?.source_url ?? undefined;
				}
			}

			// Get the canonical URL.
			const canonicalURL = post.parsely?.canonical_url;

			return {
				...post,
				thumbnail,
				author,
				categories,
				tags,
				parsely_canonical_url: canonicalURL,
			};
		} );

		return hydratedPosts;
	}

	/**
	 * Fetches a list of posts from the REST API and hydrates them with embedded data.
	 *
	 * @since 3.18.0
	 *
	 * @param {QueryParams?} queryParams Optional query parameters.
	 * @param {string?}      id          The (optional) ID of the request.
	 *
	 * @return {Promise<HydratedPost[]>} The fetched and hydrated posts.
	 */
	public async getPosts(
		queryParams: QueryParams = {},
		id?: string,
	): Promise<FetchResponse<HydratedPost[]>> {
		const restEndpoint = queryParams.rest_endpoint ?? '/wp/v2/posts';
		const context = queryParams.context ?? 'view';

		const posts = await this.apiFetch<Post[]>( {
			path: addQueryArgs( restEndpoint, { ...queryParams, _embed: true, context } ),
			method: 'GET',
		}, id );

		// Hydrate the fetched posts.
		const hydratedPosts = await this.hydratePosts( posts.data );

		return {
			...posts,
			data: hydratedPosts,
		};
	}

	/**
	 * Fetches a list of pages from the REST API and hydrates them with embedded data.
	 *
	 * @since 3.19.0
	 *
	 * @param {QueryParams?} queryParams Optional query parameters.
	 * @param {string?}      id          The (optional) ID of the request.
	 *
	 * @return {Promise<FetchResponse<HydratedPost[]>>} The fetched and hydrated pages.
	 */
	public async getPages(
		queryParams: QueryParams = {},
		id?: string,
	): Promise<FetchResponse<HydratedPost[]>> {
		const context = queryParams.context ?? 'view';

		const pages = await this.apiFetch<Post[]>( {
			path: addQueryArgs( '/wp/v2/pages', { ...queryParams, _embed: true, context } ),
			method: 'GET',
		}, id );

		// Hydrate the fetched pages.
		const hydratedPages = await this.hydratePosts( pages.data );

		return {
			...pages,
			data: hydratedPages,
		};
	}

	/**
	 * Fetches a single post by ID from the REST API and hydrates it with embedded data.
	 *
	 * @since 3.18.0
	 *
	 * @param {number}  postId The ID of the post to fetch.
	 * @param {string?} id     The (optional) ID of the request.
	 *
	 * @return {Promise<HydratedPost>} The fetched and hydrated post.
	 */
	public async getPost(
		postId: number,
		id?: string,
	): Promise<HydratedPost> {
		const context = 'edit';

		let postRestRoute: PostRestRouteResponse;

		try {
			postRestRoute = await this.fetch<PostRestRouteResponse>( {
				method: 'GET',
				path: `/wp-parsely/v2/utils/post/${ postId }/rest-route`,
			}, id );
		} catch ( error ) {
			throw new ContentHelperError(
				__( "The target post's REST route could not be fetched.", 'wp-parsely' ),
				ContentHelperErrorCode.UnknownError,
			);
		}

		if ( ! postRestRoute || ! postRestRoute.data || '' === postRestRoute.data ) {
			throw new ContentHelperError(
				__( "The target post's REST route could not be fetched.", 'wp-parsely' ),
				ContentHelperErrorCode.UnknownError,
			);
		}

		const post = await this.apiFetch<Post>( {
			path: `${ postRestRoute.data }?_embed&context=${ context }`,
			method: 'GET',
		}, id );

		// Hydrate the fetched post.
		const hydratedPost = ( await this.hydratePosts( [ post.data ] ) )[ 0 ];

		return hydratedPost;
	}

	/**
	 * Generic method to fetch any REST API endpoint.
	 *
	 * @since 3.18.0
	 *
	 * @template T The type of the data to fetch.
	 *
	 * @param {string}           path    The REST API path to fetch.
	 * @param {APIFetchOptions?} options Additional options for the request.
	 * @param {string?}          id      The (optional) ID of the request.
	 *
	 * @return {Promise<T>} The fetched data.
	 */
	public async fetchFromRestApi<T>(
		path: string,
		options: Partial<APIFetchOptions> = {},
		id?: string,
	): Promise<FetchResponse<T>> {
		const fetchOptions: APIFetchOptions = {
			path,
			method: 'GET',
			...options,
		};

		return this.apiFetch<T>( fetchOptions, id );
	}
}
