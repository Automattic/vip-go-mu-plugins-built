/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { select } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import {
	ContentHelperError,
	ContentHelperErrorCode,
} from '../content-helper-error';
import {
	PerformanceData,
	PerformanceReferrerData,
} from './model';
import {
	convertDateToString,
	removeDaysFromDate,
} from '../../shared/utils/date';

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
class PerformanceDetailsProvider {
	private dataPeriodDays: number;
	private dataPeriodStart: string;
	private dataPeriodEnd: string;

	/**
	 * Constructor.
	 */
	constructor() {
		// Set period for the last 7 days (today included).
		this.dataPeriodDays = 7;
		this.dataPeriodEnd = convertDateToString( new Date() ) + 'T23:59';
		this.dataPeriodStart = removeDaysFromDate( this.dataPeriodEnd, this.dataPeriodDays - 1 ) + 'T00:00';
	}

	/**
	 * Returns details about the post that is currently being edited within the
	 * WordPress Block Editor.
	 *
	 * @return {Promise<PerformanceData>} The current post's details.
	 */
	public async getPerformanceDetails(): Promise<PerformanceData> {
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

		// Fetch all needed results using our WordPress endpoints.
		let performanceData, referrerData;
		try {
			performanceData = await this.fetchPerformanceDataFromWpEndpoint( postUrl );
			referrerData = await this.fetchReferrerDataFromWpEndpoint( postUrl, performanceData.views );
		} catch ( contentHelperError ) {
			return Promise.reject( contentHelperError );
		}

		const period = { start: this.dataPeriodStart, end: this.dataPeriodEnd, days: this.dataPeriodDays };
		return { ...performanceData, referrers: referrerData, period };
	}

	/**
	 * Fetches the performance data for the current post from the WordPress REST
	 * API.
	 *
	 * @param {string} postUrl
	 * @return {Promise<PerformanceData> } The current post's details.
	 */
	private async fetchPerformanceDataFromWpEndpoint( postUrl: string ): Promise<PerformanceData> {
		let response;

		try {
			response = await apiFetch<AnalyticsApiResponse>( {
				path: addQueryArgs(
					'/wp-parsely/v1/stats/post/detail', {
						url: postUrl,
						period_start: this.dataPeriodStart,
						period_end: this.dataPeriodEnd,
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
	 * @param {string} postUrl    The post's URL.
	 * @param {string} totalViews Total post views (including direct views).
	 * @return {Promise<PerformanceReferrerData>} The post's referrer data.
	 */
	private async fetchReferrerDataFromWpEndpoint(
		postUrl: string, totalViews: string
	): Promise<PerformanceReferrerData> {
		let response;

		// Query WordPress API endpoint.
		try {
			response = await apiFetch<ReferrersApiResponse>( { path: addQueryArgs(
				'/wp-parsely/v1/referrers/post/detail', {
					url: postUrl,
					period_start: this.dataPeriodStart,
					period_end: this.dataPeriodEnd,
					total_views: totalViews, // Needed to calculate direct views.
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

export default PerformanceDetailsProvider;
