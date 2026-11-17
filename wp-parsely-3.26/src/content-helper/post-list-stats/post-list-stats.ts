import { __, sprintf } from '@wordpress/i18n';
import { ParselyAPIError, ParselyAPIErrorInfo } from './common.interface';

export interface ParselyPostsStatsResponse extends ParselyAPIError {
	data: ParselyStatsMap | null;
}

interface ParselyStats {
	page_views?: string;
	visitors?: string;
	avg_time?: string;
}

interface ParselyStatsMap {
	[key: string]: ParselyStats;
}

document.addEventListener( 'DOMContentLoaded', (): void => {
	showParselyPostsStatsResponse();
} );

/**
 * Shows Parse.ly Post Stats or Error depending on response.
 */
export function showParselyPostsStatsResponse(): void {
	updateParselyStatsPlaceholder();

	if ( ! window.wpParselyPostsStatsResponse ) {
		return;
	}

	const response: ParselyPostsStatsResponse = JSON.parse( window.wpParselyPostsStatsResponse );

	if ( response?.error ) {
		showParselyStatsError( response.error );
		return;
	}

	if ( response?.data ) {
		showParselyStats( response.data );
	}
}

/**
 * Replaces Parse.ly Stats placeholder from default to differentiate while the API request
 * is in progress or completed.
 */
function updateParselyStatsPlaceholder(): void {
	getAllPostStatsElements()?.forEach( ( statsElement: Element ): void => {
		statsElement.innerHTML = '—';
	} );
}

/**
 * Shows Parse.ly Stats on available posts.
 *
 * @param {ParselyStatsMap} parselyStatsMap Object contains unique keys and Parse.ly Stats for posts.
 */
function showParselyStats( parselyStatsMap: ParselyStatsMap ): void {
	if ( ! parselyStatsMap ) {
		return;
	}

	getAllPostStatsElements()?.forEach( ( statsElement: Element ): void => {
		const statsKey = statsElement.getAttribute( 'data-stats-key' );

		if ( statsKey === null || parselyStatsMap[ statsKey ] === undefined ) {
			return;
		}

		const stats: ParselyStats = parselyStatsMap[ statsKey ];
		statsElement.innerHTML = '';

		if ( stats.page_views ) {
			statsElement.innerHTML += getStatSpan(
				'parsely-post-page-views', 'visibility',
				/* translators: %s: number of page views */
				sprintf( __( 'Page views: %s', 'wp-parsely' ), stats.page_views ),
				stats.page_views
			);
		}

		if ( stats.visitors ) {
			statsElement.innerHTML += getStatSpan(
				'parsely-post-visitors', 'groups',
				/* translators: %s: number of visitors */
				sprintf( __( 'Visitors: %s', 'wp-parsely' ), stats.visitors ),
				stats.visitors
			);
		}

		if ( stats.avg_time ) {
			statsElement.innerHTML += getStatSpan(
				'parsely-post-avg-time', 'clock',
				/* translators: %s: average time spent on post */
				sprintf( __( 'Avg. time: %s', 'wp-parsely' ), stats.avg_time ),
				stats.avg_time
			);
		}
	} );
}

/**
 * Gets HTML for a single stat metric span with an icon and screen-reader label.
 *
 * @param {string} className CSS class for the outer span.
 * @param {string} dashicon  Dashicon class name (without `dashicons` prefix).
 * @param {string} srText    Full screen reader text (including the value).
 * @param {string} value     The metric value to display visually.
 */
function getStatSpan( className: string, dashicon: string, srText: string, value: string ): string {
	return `<span class="${ className }">` +
		`<span class="dashicons dashicons-${ dashicon }" aria-hidden="true"></span>` +
		`<span class="screen-reader-text">${ srText }</span>` +
		`<span aria-hidden="true">${ value }</span>` +
		`</span>`;
}

/**
 * Shows Parse.ly Stats error as a wp-admin error notice.
 *
 * @param {ParselyAPIErrorInfo} parselyStatsError Object containing info about the error.
 */
function showParselyStatsError( parselyStatsError: ParselyAPIErrorInfo ): void {
	const headerEndElement = document.querySelector( '.wp-header-end' ); // WP has this element before admin notices.
	if ( headerEndElement === null ) {
		return;
	}

	headerEndElement.innerHTML += getWPAdminError( parselyStatsError.htmlMessage );
}

/**
 * Gets all elements inside which we will show Parse.ly Stats.
 */
function getAllPostStatsElements(): NodeListOf<Element> {
	return document.querySelectorAll( '.parsely-post-stats' );
}

/**
 * Gets HTML for showing error message as a wp-admin error notice.
 *
 * @param {string} htmlMessage Message to show inside notice.
 */
function getWPAdminError( htmlMessage = '' ): string {
	return `<div class="error notice error-parsely-stats is-dismissible">${ htmlMessage }</div>`;
}
