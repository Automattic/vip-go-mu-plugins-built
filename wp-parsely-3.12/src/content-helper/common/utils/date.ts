/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
const SHORT_DATE_FORMAT_WITHOUT_YEAR: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
const DATE_NOT_AVAILABLE_MESSAGE = __( 'Date N/A', 'wp-parsely' );

/**
 * Returns whether the passed date can be processed further.
 *
 * @param {Date} date The date to be examined.
 * @return {boolean} Whether the date can be processed further.
 */
export function canProcessDate( date: Date ): boolean {
	// Return false if the date is not a valid Date object.
	if ( isNaN( +date ) ) {
		return false;
	}

	// Return false if the date is the Unix Epoch time.
	return 0 !== date.getTime();
}

export function getDateInUserLang( date: Date, options: Intl.DateTimeFormatOptions ): string {
	if ( false === canProcessDate( date ) ) {
		return DATE_NOT_AVAILABLE_MESSAGE;
	}

	return Intl.DateTimeFormat(
		document.documentElement.lang || 'en',
		options
	).format( date );
}

/**
 * Returns the passed date in short format or in short format without year (if
 * the passed date is within the current year), respecting the user's language.
 *
 * @param {Date} date The date to be formatted.
 * @return {string} The resulting date in its final format.
 */
export function getSmartShortDate( date: Date ): string {
	if ( false === canProcessDate( date ) ) {
		return DATE_NOT_AVAILABLE_MESSAGE;
	}

	let dateFormat = SHORT_DATE_FORMAT;

	if ( date.getUTCFullYear() === new Date().getUTCFullYear() ) {
		dateFormat = SHORT_DATE_FORMAT_WITHOUT_YEAR;
	}

	return Intl.DateTimeFormat(
		document.documentElement.lang || 'en',
		dateFormat
	).format( date );
}

/**
 * Removes the given number of days from a "YYYY-MM-DD" string, and returns
 * the result in the same format.
 *
 * @param {Date}   date The date to be processed.
 * @param {number} days The number of days to remove from the date.
 * @return {string} The resulting date in "YYYY-MM-DD" format.
 */
export function removeDaysFromDate( date: Date, days: number ): string {
	if ( false === Number.isInteger( days ) ) {
		return __( 'days parameter must be an integer', 'wp-parsely' );
	}

	if ( false === canProcessDate( date ) ) {
		return DATE_NOT_AVAILABLE_MESSAGE;
	}

	const pastDate = new Date( date );
	pastDate.setDate( pastDate.getDate() - days );

	return convertDateToString( pastDate );
}

/**
 * Converts a date to a string in "YYYY-MM-DD" format.
 *
 * @param {Date} date The  date to format.
 * @return {string} The date in "YYYY-MM-DD" format.
 */
export function convertDateToString( date: Date ): string {
	if ( false === canProcessDate( date ) ) {
		return DATE_NOT_AVAILABLE_MESSAGE;
	}

	return date.toISOString().substring( 0, 10 );
}
