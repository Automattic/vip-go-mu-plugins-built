/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { ContentHelperError, ContentHelperErrorCode } from '../content-helper-error';
import { BaseProvider } from './base-provider';
import { HydratedPost } from './base-wordpress-provider';

/**
 * Type definition for metrics data.
 *
 * @since 3.19.0
 */
interface PostMetrics {
	views: string;
	visitors: string;
	recirculationRate: string;
	avgEngaged: string;
}

/**
 * Type definition for a post's stats data.
 *
 * @since 3.19.0
 */
export interface PostStats extends Partial<PostMetrics> {
	author?: string;
	date?: string;
	title?: string;
	rawUrl?: string;
	dashUrl?: string;
	id?: string;
	postId?: number;
	url?: string;
	thumbnailUrl?: string;
	campaign?: Partial<PostMetrics>;
}

/**
 * Type definition for the stats request parameters.
 *
 * @since 3.19.0
 */
interface StatsRequestParams {
	urls?: string[];
	period?: string;
	period_start?: string;
	period_end?: string;
	pub_date_start?: string;
	pub_date_end?: string;
	limit?: number;
	sort?: string;
	page?: number;
	author?: string[];
	section?: string[];
	tag?: string[];
	segment?: string;
	campaign_id?: string;
	campaign_medium?: string;
	campaign_source?: string;
	campaign_content?: string;
	campaign_term?: string;
	itm_source?: string;
	use_wp_permalink?: boolean;
}

/**
 * Stats Provider.
 *
 * Allows fetching stats from the Parse.ly API for WordPress posts.
 *
 * @since 3.19.0
 */
export class StatsProvider extends BaseProvider {
	private static instance: StatsProvider;

	/**
	 * Get the singleton instance of the StatsProvider.
	 *
	 * @since 3.19.0
	 *
	 * @return {StatsProvider} The singleton instance of the StatsProvider.
	 */
	public static getInstance(): StatsProvider {
		if ( ! this.instance ) {
			this.instance = new StatsProvider();
		}

		return this.instance;
	}

	/**
	 * Get stats for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param {StatsRequestParams} args The request parameters.
	 *
	 * @return {PostStats[]} The stats for the post.
	 */
	public async getStats( args: StatsRequestParams ): Promise<PostStats[]> {
		let response: PostStats[] = [];

		try {
			response = await this.fetch<PostStats[]>( {
				path: addQueryArgs( '/wp-parsely/v2/stats/posts', {
					...args,
				} ),
			} );
		} catch ( error: unknown ) {
			if ( error instanceof ContentHelperError ) {
				throw error;
			}

			if ( error instanceof Error ) {
				throw new ContentHelperError(
					error.message,
					ContentHelperErrorCode.UnknownError
				);
			}
		}

		if ( 0 === response.length ) {
			throw new ContentHelperError(
				__( 'No data was returned by the Parse.ly API.', 'wp-parsely' ),
				ContentHelperErrorCode.ParselyApiReturnedNoData
			);
		}

		return response;
	}

	/**
	 * Get stats for a list of posts.
	 *
	 * @since 3.19.0
	 *
	 * @param {HydratedPost[]}     posts The posts to get stats for.
	 * @param {StatsRequestParams} args  The request parameters.
	 *
	 * @return {PostStats[]} The stats for the posts.
	 */
	public async getStatsForPosts( posts: HydratedPost[], args: StatsRequestParams ): Promise<PostStats[]> {
		const postURLs = posts.map( ( post ) => {
			if ( args.use_wp_permalink ) {
				return post.link;
			}

			return post.parsely?.canonical_url ?? post.link;
		} );

		return this.getStats( { ...args, urls: postURLs } );
	}
}

