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
import { Metric, Period } from './components/top-posts';
import { TopPostData } from './model';

/**
 * The form of the response returned by the /stats/posts WordPress REST API
 * endpoint.
 */
interface TopPostsApiResponse {
	error?: Error;
	data?: TopPostData[];
}

const TOP_POSTS_DEFAULT_LIMIT = 3;

export class DashboardWidgetProvider {
	/**
	 * Returns the site's top posts.
	 *
	 * @param {string} period The period to fetch data for.
	 * @param {string} metric The metric to sort by.
	 *
	 * @return {Promise<Array<TopPostData>>} Object containing message and posts.
	 */
	public async getTopPosts( period: Period, metric: Metric ): Promise<TopPostData[]> {
		let data: TopPostData[] = [];

		try {
			data = await this.fetchTopPostsFromWpEndpoint( period, metric );
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
	 * @param {string} period The period to fetch data for.
	 * @param {string} metric The metric to sort by.
	 *
	 * @return {Promise<Array<TopPostData>>} Array of fetched posts.
	 */
	private async fetchTopPostsFromWpEndpoint( period: Period, metric: Metric ): Promise<TopPostData[]> {
		let response;

		try {
			response = await apiFetch( {
				path: addQueryArgs( '/wp-parsely/v1/stats/posts/', {
					limit: TOP_POSTS_DEFAULT_LIMIT,
					...getApiPeriodParams( parseInt( period ) ),
					sort: metric,
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
