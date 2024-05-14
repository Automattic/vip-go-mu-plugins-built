/**
 * WordPress dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';

export const DASHBOARD_BASE_URL = 'https://dash.parsely.com';
export const PUBLIC_API_BASE_URL = 'https://api.parsely.com/v2';

/**
 * Periods that are available in the Content Helper.
 *
 * @since 3.10.0
 * @since 3.11.0 Moved to constants.ts.
 */
export enum Period {
	Minutes10 = '10m',
	Hour = '1h',
	Hours2 = '2h',
	Hours4 = '4h',
	Hours24 = '24h',
	Days7 = '7d',
	Days30 = '30d'
}

/**
 * Metrics that are available in the Content Helper.
 *
 * @since 3.10.0
 * @since 3.11.0 Moved to constants.ts.
 */
export enum Metric {
	Views = 'views',
	AvgEngaged = 'avg_engaged'
}

/**
 * Post filter types that are available in the Content Helper.
 *
 * @since 3.11.0
 */
export enum PostFilterType {
	Author = 'author',
	Section = 'section',
	Tag = 'tag',
	Unavailable = 'unavailable'
}

/**
 * Defines the structure of Post filters.
 *
 * @since 3.11.0
 */
export interface PostFilter {
	type: PostFilterType;
	value: string;
}

/**
 * Returns whether the passed value is present in the given enum.
 *
 * @since 3.11.0
 *
 * @param {string|number} value      The value to check for.
 * @param {Object}        enumObject The enum to check against.
 */
export const isInEnum = <T extends object>(
	value: string|number, enumObject: T
): boolean => {
	return Object.values( enumObject ).includes( value );
};

/**
 * Returns a text description representing the passed period.
 *
 * @since 3.11.0
 *
 * @param {Period}  period    The period for which to create the description.
 * @param {boolean} lowercase Whether to return the description in lowercase.
 *
 * @return {string} The period description.
 */
export function getPeriodDescription(
	period: Period, lowercase: boolean = false
): string {
	const timeValue = parseInt( period, 10 );
	const timeUnit = period.charAt( period.length - 1 );

	let description = __( 'Unknown Period', 'wp-parsely' );

	/* eslint-disable @wordpress/valid-sprintf */
	switch ( timeUnit ) {
		case 'm':
			if ( 1 === timeValue ) {
				description = __( 'Last Minute', 'wp-parsely' );
				break;
			}
			description = sprintf( /* translators: 1: Number of minutes */
				_n( 'Last %1$d Minute', 'Last %1$d Minutes', timeValue, 'wp-parsely' ),
				timeValue
			);
			break;
		case 'h':
			if ( 1 === timeValue ) {
				description = __( 'Last Hour', 'wp-parsely' );
				break;
			}
			description = sprintf( /* translators: 1: Number of hours */
				_n( 'Last %1$d Hour', 'Last %1$d Hours', timeValue, 'wp-parsely' ),
				timeValue
			);
			break;
		case 'd':
			if ( 1 === timeValue ) {
				description = __( 'Last Day', 'wp-parsely' );
				break;
			}
			description = sprintf( /* translators: 1: Number of days */
				_n( 'Last %1$d Day', 'Last %1$d Days', timeValue, 'wp-parsely' ),
				timeValue
			);
			break;
	}
	/* eslint-enable @wordpress/valid-sprintf */

	if ( lowercase ) {
		return description.toLocaleLowerCase();
	}

	return description;
}

/**
 * Returns a text description representing the passed metric.
 *
 * @since 3.11.0
 *
 * @param {Metric} metric The metric for which to create the description.
 *
 * @return {string} The metric description.
 */
export function getMetricDescription( metric: Metric ): string {
	switch ( metric ) {
		case Metric.Views:
			return __( 'Page Views', 'wp-parsely' );
		case Metric.AvgEngaged:
			return __( 'Avg. Time', 'wp-parsely' );
		default:
			return __( 'Unknown Metric', 'wp-parsely' );
	}
}
