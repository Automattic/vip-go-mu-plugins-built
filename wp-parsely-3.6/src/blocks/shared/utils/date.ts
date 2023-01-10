export const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

export function getDateInUserLang( date: Date, options: Intl.DateTimeFormatOptions ): string {
	return Intl.DateTimeFormat(
		document.documentElement.lang || 'en',
		options
	).format( date );
}
