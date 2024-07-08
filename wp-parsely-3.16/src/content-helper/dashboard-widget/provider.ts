/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { BaseProvider } from '../common/base-provider';
import {
	ContentHelperError,
	ContentHelperErrorCode,
} from '../common/content-helper-error';
import { getApiPeriodParams } from '../common/utils/api';
import { PostData } from '../common/utils/post';
import { TopPostsSettings } from '../common/settings';

export const TOP_POSTS_DEFAULT_LIMIT = 5;

export class DashboardWidgetProvider extends BaseProvider {
	/**
	 * The singleton instance of the DashboardWidgetProvider.
	 *
	 * @since 3.15.0
	 */
	private static instance: DashboardWidgetProvider;

	/**
	 * Returns the singleton instance of the DashboardWidgetProvider.
	 *
	 * @since 3.15.0
	 *
	 * @return {DashboardWidgetProvider} The singleton instance.
	 */
	public static getInstance(): DashboardWidgetProvider {
		if ( ! this.instance ) {
			this.instance = new DashboardWidgetProvider();
		}

		return this.instance;
	}

	/**
	 * Returns the site's top posts.
	 *
	 * @param {TopPostsSettings} settings The settings to use.
	 * @param {number}           page     The page to fetch, defaults to the first page.
	 *
	 * @return {Promise<Array<PostData>>} Object containing message and posts.
	 */
	public async getTopPosts(
		settings: TopPostsSettings, page: number = 1
	): Promise<PostData[]> {
		let data: PostData[] = [];

		try {
			data = await this.fetchTopPostsFromWpEndpoint( settings, page );
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
	 * @param {TopPostsSettings} settings The settings to use.
	 * @param {number}           page     The page to fetch.
	 *
	 * @return {Promise<Array<PostData>>} Array of fetched posts.
	 */
	private async fetchTopPostsFromWpEndpoint(
		settings: TopPostsSettings, page: number
	): Promise<PostData[]> {
		const response = this.fetch<PostData[]>( {
			path: addQueryArgs( '/wp-parsely/v1/stats/posts/', {
				limit: TOP_POSTS_DEFAULT_LIMIT,
				...getApiPeriodParams( settings.Period ),
				sort: settings.Metric,
				page,
				itm_source: 'wp-parsely-content-helper',
			} ),
		} );

		return response ?? [];
	}
}
