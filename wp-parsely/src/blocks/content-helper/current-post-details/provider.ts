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
	PostPerformanceData,
	PostPerformanceReferrerData,
} from './post-performance-data';

/**
 * Specifies the form of the response returned by the `/stats/post/detail`
 * WordPress REST API endpoint.
 */
 interface AnalyticsApiResponse {
	error?: Error;
	data: PostPerformanceData[];
}

/**
 * Specifies the form of the response returned by the `/referrers/post/detail`
 * WordPress REST API endpoint.
 */
interface ReferrersApiResponse {
	error?: Error;
	data: PostPerformanceReferrerData;
}

/**
 * Provides current post details data for use in other components.
 */
class CurrentPostDetailsProvider {
	private dataPeriodDays: number;
	private dataPeriodStart: string;
	private dataPeriodEnd: string;

	/**
	 * Constructor.
	 */
	constructor() {
		// Return data for the last 7 days (today included).
		this.setDataPeriod( 7 );
	}

	/**
	 * Returns details about the post that is currently being edited within the
	 * WordPress Block Editor.
	 *
	 * @return {Promise<PostPerformanceData>} The current post's details.
	 */
	public async getCurrentPostDetails(): Promise<PostPerformanceData> {
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
	 * @return {Promise<PostPerformanceData> } The current post's details.
	 */
	private async fetchPerformanceDataFromWpEndpoint( postUrl: string ): Promise<PostPerformanceData> {
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
		} catch ( wpError ) {
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
					__( 'The post %s has 0 views or no data was returned for it by the Parse.ly API.',
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
	 * @return {Promise<PostPerformanceReferrerData>} The post's referrer data.
	 */
	private async fetchReferrerDataFromWpEndpoint(
		postUrl: string, totalViews: string
	): Promise<PostPerformanceReferrerData> {
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
		} catch ( wpError ) {
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

	/**
	 * Sets the period for which to fetch the data.
	 *
	 * @param {number} days Number of last days to get the data for.
	 */
	private setDataPeriod( days: number ) {
		this.dataPeriodDays = days;
		this.dataPeriodEnd = this.convertDateToString( new Date() ) + 'T23:59';
		this.dataPeriodStart = this.removeDaysFromDate( this.dataPeriodEnd, this.dataPeriodDays - 1 ) + 'T00:00';
	}

	/**
	 * Removes the given number of days from a "YYYY-MM-DD" string, and returns
	 * the result in the same format.
	 *
	 * @param {string} date The date in "YYYY-MM-DD" format.
	 * @param {number} days The number of days to remove from the date.
	 * @return {string} The resulting date in "YYYY-MM-DD" format.
	 */
	private removeDaysFromDate( date: string, days: number ): string {
		const pastDate = new Date( date );
		pastDate.setDate( pastDate.getDate() - days );

		return this.convertDateToString( pastDate );
	}

	/**
	 * Converts a date to a string in "YYYY-MM-DD" format.
	 *
	 * @param {Date} date The  date to format.
	 * @return {string} The date in "YYYY-MM-DD" format.
	 */
	private convertDateToString( date: Date ): string {
		return date.toISOString().substring( 0, 10 );
	}
}

export default CurrentPostDetailsProvider;
