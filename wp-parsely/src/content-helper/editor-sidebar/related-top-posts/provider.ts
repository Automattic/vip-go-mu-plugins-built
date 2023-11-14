/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import {
	ContentHelperError,
	ContentHelperErrorCode,
} from '../../common/content-helper-error';
import {
	AnalyticsApiOptionalQueryParams,
	getApiPeriodParams,
} from '../../common/utils/api';
import {
	Metric,
	Period,
	PostFilter,
	PostFilterType,
	getPeriodDescription,
} from '../../common/utils/constants';
import { PostData } from '../../common/utils/post';

/**
 * The form of the query that gets posted to the analytics/posts WordPress REST
 * API endpoint.
 */
interface RelatedTopPostsApiQuery {
	message: string; // Selected filter message to be displayed to the user.
	query: AnalyticsApiOptionalQueryParams
}

/**
 * The form of the response returned by the /stats/posts WordPress REST API
 * endpoint.
 */
interface RelatedTopPostsApiResponse {
	error?: Error;
	data?: PostData[];
}

/**
 * The form of the result returned by the getRelatedTopPosts() function.
 */
export interface GetRelatedTopPostsResult {
	message: string;
	posts: PostData[];
}

export const RELATED_POSTS_DEFAULT_LIMIT = 5;

export class RelatedTopPostsProvider {
	/**
	 * Returns related top posts to the one that is currently being edited
	 * within the WordPress Block Editor.
	 *
	 * The 'related' status is determined by the current post's Author, Category
	 * or tag.
	 *
	 * @param {Period}     period The period for which to fetch data.
	 * @param {Metric}     metric The metric to sort by.
	 * @param {PostFilter} filter The selected filter type and value to use.
	 *
	 * @return {Promise<GetRelatedTopPostsResult>} Object containing message and posts.
	 */
	static async getRelatedTopPosts(
		period: Period, metric: Metric, filter: PostFilter
	): Promise<GetRelatedTopPostsResult> {
		// Create API query.
		let apiQuery;
		try {
			apiQuery = this.buildRelatedTopPostsApiQuery(
				period, metric, filter
			);
		} catch ( contentHelperError ) {
			return Promise.reject( contentHelperError );
		}

		// Fetch results from API and set the message.
		let data;
		try {
			data = await this.fetchRelatedTopPostsFromWpEndpoint( apiQuery );
		} catch ( contentHelperError ) {
			return Promise.reject( contentHelperError );
		}

		const message = this.generateMessage(
			data.length === 0, period, apiQuery.message
		);

		return { message, posts: data };
	}

	/**
	 * Generates the message that will be displayed above the related top posts.
	 *
	 * @since 3.11.0
	 *
	 * @param {boolean} dataIsEmpty     Whether the API returned no data.
	 * @param {Period}  period          The period for which data was fetched.
	 * @param {string}  apiQueryMessage The message within the query.
	 *
	 * @return {string} The generated message.
	 */
	private static generateMessage(
		dataIsEmpty: boolean, period: Period, apiQueryMessage: string
	): string {
		if ( dataIsEmpty ) {
			return sprintf(
				/* translators: 1: message such as "in category Foo" */
				__(
					'No top posts %1$s were found for the specified period and metric.',
					'wp-parsely'
				), apiQueryMessage
			);
		}

		return sprintf(
			/* translators: 1: message such as "in category Foo", 2: period such as "last 7 days"*/
			__( 'Top posts %1$s in the %2$s.', 'wp-parsely' ),
			apiQueryMessage, getPeriodDescription( period, true )
		);
	}

	/**
	 * Fetches the related top posts data from the WordPress REST API.
	 *
	 * @param {RelatedTopPostsApiQuery} query
	 * @return {Promise<Array<PostData>>} Array of fetched posts.
	 */
	private static async fetchRelatedTopPostsFromWpEndpoint( query: RelatedTopPostsApiQuery ): Promise<PostData[]> {
		let response;

		try {
			response = await apiFetch<RelatedTopPostsApiResponse>( {
				path: addQueryArgs( '/wp-parsely/v1/stats/posts', {
					...query.query,
					itm_source: 'wp-parsely-content-helper',
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

	/**
	 * Builds the query object used in the API for performing the related
	 * top posts request.
	 *
	 * @param {Period}     period The period for which to fetch data.
	 * @param {Metric}     metric The metric to sort by.
	 * @param {PostFilter} filter The selected filter type and value to use.
	 *
	 * @return {RelatedTopPostsApiQuery} The query object.
	 */
	private static buildRelatedTopPostsApiQuery(
		period: Period, metric:Metric, filter: PostFilter
	): RelatedTopPostsApiQuery {
		const commonQueryParams = {
			...getApiPeriodParams( period ),
			limit: RELATED_POSTS_DEFAULT_LIMIT,
			sort: metric,
		};

		if ( PostFilterType.Tag === filter.type ) {
			return ( {
				query: { tag: filter.value, ...commonQueryParams },
				/* translators: %s: message such as "with tag Foo" */
				message: sprintf( __( 'with tag "%1$s"', 'wp-parsely' ), filter.value ),
			} );
		}

		if ( PostFilterType.Section === filter.type ) {
			return ( {
				query: { section: filter.value, ...commonQueryParams },
				/* translators: %s: message such as "in category Foo" */
				message: sprintf( __( 'in section "%1$s"', 'wp-parsely' ), filter.value ),
			} );
		}

		if ( PostFilterType.Author === filter.type ) {
			return ( {
				query: { author: filter.value, ...commonQueryParams },
				/* translators: %s: message such as "by author John" */
				message: sprintf( __( 'by author "%1$s"', 'wp-parsely' ), filter.value ),
			} );
		}

		// No filter type has been specified. The query cannot be formulated.
		throw new ContentHelperError(
			__( 'No valid filter type has been specified.', 'wp-parsely' ),
			ContentHelperErrorCode.CannotFormulateApiQuery
		);
	}
}
