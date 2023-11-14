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
			statsElement.innerHTML += `<span class="parsely-post-page-views">${ stats.page_views }</span><br/>`;
		}

		if ( stats.visitors ) {
			statsElement.innerHTML += `<span class="parsely-post-visitors">${ stats.visitors }</span><br/>`;
		}

		if ( stats.avg_time ) {
			statsElement.innerHTML += `<span class="parsely-post-avg-time">${ stats.avg_time }</span><br/>`;
		}
	} );
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
