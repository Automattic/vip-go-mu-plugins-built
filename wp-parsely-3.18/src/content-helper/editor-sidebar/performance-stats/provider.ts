/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { BaseProvider } from '../../common/base-provider';
import {
	ContentHelperError,
	ContentHelperErrorCode,
} from '../../common/content-helper-error';
import { getApiPeriodParams } from '../../common/utils/api';
import { Period } from '../../common/utils/constants';
import {
	PerformanceData,
	PerformanceReferrerData,
} from './model';

/**
 * Provides current post details data for use in other components.
 */
export class PerformanceStatsProvider extends BaseProvider {
	private itmSource = 'wp-parsely-content-helper';

	/**
	 * The singleton instance of the PerformanceStatsProvider.
	 *
	 * @since 3.15.0
	 */
	private static instance: PerformanceStatsProvider;

	/**
	 * Returns the singleton instance of the PerformanceStatsProvider.
	 *
	 * @since 3.15.0
	 *
	 * @return {PerformanceStatsProvider} The singleton instance.
	 */
	public static getInstance(): PerformanceStatsProvider {
		if ( ! this.instance ) {
			this.instance = new PerformanceStatsProvider();
		}
		return this.instance;
	}

	/**
	 * Returns details about the post that is currently being edited within the
	 * WordPress Block Editor.
	 *
	 * @param {Period} period The period for which to fetch data.
	 *
	 * @return {Promise<PerformanceData>} The current post's details.
	 */
	public async getPerformanceStats( period: Period ): Promise<PerformanceData> {
		const editor = select( 'core/editor' );

		// Get the current post's status.
		const currentPostStatus = editor.getEditedPostAttribute( 'status' ) ?? 'draft';
		const trackableStatuses = window.wpParselyTrackableStatuses ?? [ 'publish' ];

		// We cannot show data for non-published posts that are not in the trackable statuses.
		if ( ! editor.isCurrentPostPublished() && ! trackableStatuses.includes( currentPostStatus ) ) {
			return Promise.reject(
				new ContentHelperError( __(
					'This post is not published, so its details are unavailable.',
					'wp-parsely' ), ContentHelperErrorCode.PostIsNotPublished, ''
				)
			);
		}

		// Get post ID.
		const postID = editor.getCurrentPostId();

		if ( null === postID ) {
			return Promise.reject(
				new ContentHelperError( __(
					"The post's ID returned null.",
					'wp-parsely' ), ContentHelperErrorCode.PostIsNotPublished
				)
			);
		}

		// Fetch all needed results using our WordPress endpoints.
		let performanceData, referrerData;
		try {
			performanceData = await this.fetchPerformanceDataFromWpEndpoint(
				period, postID
			);
			referrerData = await this.fetchReferrerDataFromWpEndpoint(
				period, postID, performanceData.views
			);
		} catch ( contentHelperError ) {
			return Promise.reject( contentHelperError );
		}

		return { ...performanceData, referrers: referrerData };
	}

	/**
	 * Fetches the performance data for the current post from the WordPress REST
	 * API.
	 *
	 * @param {Period} period The period for which to fetch data.
	 * @param {number} postId The post's ID.
	 *
	 * @return {Promise<PerformanceData> } The current post's details.
	 */
	private async fetchPerformanceDataFromWpEndpoint(
		period: Period, postId: number
	): Promise<PerformanceData> {
		const response = await this.fetch<PerformanceData[]>( {
			path: addQueryArgs(
				`/wp-parsely/v2/stats/post/${ postId }/details`, {
					...getApiPeriodParams( period ),
					itm_source: this.itmSource,
				} ),
		} );

		// No data was returned.
		if ( response.length === 0 ) {
			const postTitle = select( 'core/editor' ).getEditedPostAttribute( 'title' ) ?? '';
			return Promise.reject( new ContentHelperError(
				sprintf(
					/* translators: Title of the published post */
					__( '<strong>%s</strong> has 0 views, or the Parse.ly API returned no data.',
						'wp-parsely' ), postTitle
				), ContentHelperErrorCode.ParselyApiReturnedNoData, ''
			) );
		}

		// Data for multiple URLs was returned.
		if ( response.length > 1 ) {
			return Promise.reject( new ContentHelperError(
				sprintf(
					/* translators: URL of the published post */
					__( 'Multiple results were returned for the post %d by the Parse.ly API.',
						'wp-parsely' ), postId
				), ContentHelperErrorCode.ParselyApiReturnedTooManyResults
			) );
		}

		return response[ 0 ];
	}

	/**
	 * Fetches referrer data for the current post from the WordPress REST API.
	 *
	 * @param {Period}        period     The period for which to fetch data.
	 * @param {string|number} postId     The post's ID.
	 * @param {string}        totalViews Total post views (including direct views).
	 *
	 * @return {Promise<PerformanceReferrerData>} The post's referrer data.
	 */
	private async fetchReferrerDataFromWpEndpoint(
		period: Period, postId: string|number, totalViews: string
	): Promise<PerformanceReferrerData> {
		const response = await this.fetch<PerformanceReferrerData>( {
			path: addQueryArgs(
				`/wp-parsely/v2/stats/post/${ postId }/referrers`, {
					...getApiPeriodParams( period ),
					itm_source: this.itmSource,
					total_views: totalViews, // Needed to calculate direct views.
				} ),
		} );

		return response;
	}
}
