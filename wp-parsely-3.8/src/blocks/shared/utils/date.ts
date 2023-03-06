export const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
export const SHORT_DATE_FORMAT_WITHOUT_YEAR: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

export function getDateInUserLang( date: Date, options: Intl.DateTimeFormatOptions ): string {
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
 * @param {string} date The date in "YYYY-MM-DD" format.
 * @param {number} days The number of days to remove from the date.
 * @return {string} The resulting date in "YYYY-MM-DD" format.
 */
export function removeDaysFromDate( date: string, days: number ): string {
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
	return date.toISOString().substring( 0, 10 );
}
