/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import {
	ContentHelperError,
	ContentHelperErrorCode,
} from '../../blocks/content-helper/content-helper-error';
import { TopPostData } from './top-posts/model';
import {
	convertDateToString,
	removeDaysFromDate,
} from '../../blocks/shared/utils/date';

/**
 * The form of the response returned by the /stats/posts WordPress REST API
 * endpoint.
 */
interface TopPostsApiResponse {
	error?: Error;
	data?: TopPostData[];
}

export const TOP_POSTS_DEFAULT_LIMIT = 3;
export const TOP_POSTS_DEFAULT_TIME_RANGE = 7; // In days.

class DashboardWidgetProvider {
	private dataPeriodStart: string;
	private dataPeriodEnd: string;

	/**
	 * Constructor.
	 */
	constructor() {
		this.dataPeriodEnd = convertDateToString( new Date() ) + 'T23:59';
		this.dataPeriodStart = removeDaysFromDate(
			this.dataPeriodEnd,
			TOP_POSTS_DEFAULT_TIME_RANGE - 1
		) + 'T00:00';
	}

	/**
	 * Returns the site's top posts.
	 *
	 * @return {Promise<Array<TopPostData>>} Object containing message and posts.
	 */
	public async getTopPosts(): Promise<TopPostData[]> {
		let data: TopPostData[] = [];

		try {
			data = await this.fetchTopPostsFromWpEndpoint();
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
	 * @return {Promise<Array<TopPostData>>} Array of fetched posts.
	 */
	private async fetchTopPostsFromWpEndpoint(): Promise<TopPostData[]> {
		let response;

		try {
			response = await apiFetch( {
				path: addQueryArgs( '/wp-parsely/v1/stats/posts', {
					limit: TOP_POSTS_DEFAULT_LIMIT,
					period_start: this.dataPeriodStart,
					period_end: this.dataPeriodEnd,
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

		return response?.data || [];
	}
}

export default DashboardWidgetProvider;
