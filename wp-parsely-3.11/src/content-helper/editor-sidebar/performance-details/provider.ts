/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
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
 * Specifies the form of the response returned by the `/stats/post/detail`
 * WordPress REST API endpoint.
 */
 interface AnalyticsApiResponse {
	error?: Error;
	data: PerformanceData[];
}

/**
 * Specifies the form of the response returned by the `/referrers/post/detail`
 * WordPress REST API endpoint.
 */
interface ReferrersApiResponse {
	error?: Error;
	data: PerformanceReferrerData;
}

/**
 * Provides current post details data for use in other components.
 */
export class PerformanceDetailsProvider {
	private itmSource = 'wp-parsely-content-helper';

	/**
	 * Returns details about the post that is currently being edited within the
	 * WordPress Block Editor.
	 *
	 * @param {Period} period The period for which to fetch data.
	 *
	 * @return {Promise<PerformanceData>} The current post's details.
	 */
	public async getPerformanceDetails( period: Period ): Promise<PerformanceData> {
		const editor = select( 'core/editor' );

		// We cannot show data for non-published posts.
		if ( false === editor.isCurrentPostPublished() ) {
			return Promise.reject(
				new ContentHelperError( __(
					'This post is not published, so its details are unavailable.',
					'wp-parsely' ), ContentHelperErrorCode.PostIsNotPublished, ''
				)
			);
		}

		// Get post URL.
		const postUrl = editor.getPermalink();

		if ( null === postUrl ) {
			return Promise.reject(
				new ContentHelperError( __(
					"The post's URL returned null.",
					'wp-parsely' ), ContentHelperErrorCode.PostIsNotPublished
				)
			);
		}

		// Fetch all needed results using our WordPress endpoints.
		let performanceData, referrerData;
		try {
			performanceData = await this.fetchPerformanceDataFromWpEndpoint(
				period, postUrl
			);
			referrerData = await this.fetchReferrerDataFromWpEndpoint(
				period, postUrl, performanceData.views
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
	 * @param {Period} period  The period for which to fetch data.
	 * @param {string} postUrl
	 *
	 * @return {Promise<PerformanceData> } The current post's details.
	 */
	private async fetchPerformanceDataFromWpEndpoint(
		period: Period, postUrl: string
	): Promise<PerformanceData> {
		let response;

		try {
			response = await apiFetch<AnalyticsApiResponse>( {
				path: addQueryArgs(
					'/wp-parsely/v1/stats/post/detail', {
						...getApiPeriodParams( period ),
						itm_source: this.itmSource,
						url: postUrl,
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

		// No data was returned.
		if ( response.data.length === 0 ) {
			return Promise.reject( new ContentHelperError(
				sprintf(
					/* translators: URL of the published post */
					__( 'The post %s has 0 views, or the Parse.ly API returned no data.',
						'wp-parsely' ), postUrl
				), ContentHelperErrorCode.ParselyApiReturnedNoData, ''
			) );
		}

		// Data for multiple URLs was returned.
		if ( response.data.length > 1 ) {
			return Promise.reject( new ContentHelperError(
				sprintf(
					/* translators: URL of the published post */
					__( 'Multiple results were returned for the post %s by the Parse.ly API.',
						'wp-parsely' ), postUrl
				), ContentHelperErrorCode.ParselyApiReturnedTooManyResults
			) );
		}

		return response.data[ 0 ];
	}

	/**
	 * Fetches referrer data for the current post from the WordPress REST API.
	 *
	 * @param {Period} period     The period for which to fetch data.
	 * @param {string} postUrl    The post's URL.
	 * @param {string} totalViews Total post views (including direct views).
	 *
	 * @return {Promise<PerformanceReferrerData>} The post's referrer data.
	 */
	private async fetchReferrerDataFromWpEndpoint(
		period: Period, postUrl: string, totalViews: string
	): Promise<PerformanceReferrerData> {
		let response;

		// Query WordPress API endpoint.
		try {
			response = await apiFetch<ReferrersApiResponse>( { path: addQueryArgs(
				'/wp-parsely/v1/referrers/post/detail', {
					...getApiPeriodParams( period ),
					itm_source: this.itmSource,
					total_views: totalViews, // Needed to calculate direct views.
					url: postUrl,
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

		return response.data;
	}
}
