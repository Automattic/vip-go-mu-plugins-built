/**
 * WordPress dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { BaseProvider } from '../../common/providers/base-provider';
import { getApiPeriodParams } from '../../common/utils/api';
import {
	Metric,
	Period,
	PostFilters,
} from '../../common/utils/constants';
import { PostData } from '../../common/utils/post';

export const RELATED_POSTS_DEFAULT_LIMIT = 5;

export class RelatedPostsProvider extends BaseProvider {
	/**
	 * The singleton instance of the RelatedPostsProvider.
	 *
	 * @since 3.15.0
	 */
	private static instance: RelatedPostsProvider;

	/**
	 * Returns the singleton instance of the RelatedPostsProvider.
	 *
	 * @since 3.15.0
	 *
	 * @return {RelatedPostsProvider} The singleton instance.
	 */
	public static getInstance(): RelatedPostsProvider {
		if ( ! this.instance ) {
			this.instance = new RelatedPostsProvider();
		}

		return this.instance;
	}

	/**
	 * Returns posts based on the passed period, metric, and filters.
	 *
	 * @param {Period}      period  The period for which to fetch data.
	 * @param {Metric}      metric  The metric to sort by.
	 * @param {PostFilters} filters The filters to use in the request.
	 *
	 * @return {Promise<Array<PostData>>} The array of fetched posts.
	 */
	public async getRelatedPosts(
		period: Period, metric: Metric, filters: PostFilters
	): Promise<PostData[]> {
		let posts: PostData[] = [];

		try {
			posts = await this.fetchRelatedPostsFromWpEndpoint(
				period, metric, filters
			);
		} catch ( contentHelperError ) {
			return Promise.reject( contentHelperError );
		}

		return posts;
	}

	/**
	 * Fetches the related posts data from the WordPress REST API.
	 *
	 * @param {Period}      period  The period for which to fetch data.
	 * @param {Metric}      metric  The metric to sort by.
	 * @param {PostFilters} filters The filters to use in the request.
	 *
	 * @return {Promise<Array<PostData>>} The array of fetched posts.
	 */
	private async fetchRelatedPostsFromWpEndpoint(
		period: Period, metric:Metric, filters: PostFilters
	): Promise<PostData[]> {
		const path = addQueryArgs( '/wp-parsely/v2/stats/posts', {
			author: filters.author,
			section: filters.section,
			tag: filters.tags,
			...getApiPeriodParams( period ),
			limit: RELATED_POSTS_DEFAULT_LIMIT,
			sort: metric,
			itm_source: 'wp-parsely-content-helper',
		} );

		return this.fetch<PostData[]>( { path } ) ?? [];
	}
}
