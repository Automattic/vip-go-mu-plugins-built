/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import {
	ContentHelperError,
	ContentHelperErrorCode,
} from '../common/content-helper-error';
import { getApiPeriodParams } from '../common/utils/api';
import { Metric, Period } from '../common/utils/constants';
import { PostData } from '../common/utils/post';

/**
 * The form of the response returned by the /stats/posts WordPress REST API
 * endpoint.
 */
interface TopPostsApiResponse {
	error?: Error;
	data?: PostData[];
}

export const TOP_POSTS_DEFAULT_LIMIT = 5;

export class DashboardWidgetProvider {
	/**
	 * Returns the site's top posts.
	 *
	 * @param {Period} period The period to fetch data for.
	 * @param {Metric} metric The metric to sort by.
	 * @param {number} page   The page to fetch, defaults to the first page.
	 *
	 * @return {Promise<Array<PostData>>} Object containing message and posts.
	 */
	public async getTopPosts( period: Period, metric: Metric, page: number = 1 ): Promise<PostData[]> {
		let data: PostData[] = [];

		try {
			data = await this.fetchTopPostsFromWpEndpoint( period, metric, page );
		} catch ( contentHelperError ) {
			return Promise.reject( contentHelperError );
		}

		if ( 0 === data.length ) {
			return Promise.reject( new ContentHelperError(
				__( 'No Top Posts data is available.', 'wp-parsely' ),
				ContentHelperErrorCode.ParselyApiReturnedNoData,
				''
			) );
		}

		return data;
	}

	/**
	 * Fetches the site's top posts data from the WordPress REST API.
	 *
	 * @param {Period} period The period to fetch data for.
	 * @param {Metric} metric The metric to sort by.
	 * @param {number} page   The page to fetch.
	 *
	 * @return {Promise<Array<PostData>>} Array of fetched posts.
	 */
	private async fetchTopPostsFromWpEndpoint( period: Period, metric: Metric, page: number ): Promise<PostData[]> {
		let response;

		try {
			response = await apiFetch( {
				path: addQueryArgs( '/wp-parsely/v1/stats/posts/', {
					limit: TOP_POSTS_DEFAULT_LIMIT,
					...getApiPeriodParams( period ),
					sort: metric,
					page,
					itm_source: 'wp-parsely-content-helper',
				} ),
			} ) as TopPostsApiResponse;
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
