export interface AnalyticsApiQueryParams extends AnalyticsApiOptionalQueryParams {
	type: string,
}

export interface AnalyticsApiOptionalQueryParams extends ApiPeriodRange {
	pub_date_start?: string;
	pub_date_end?: string;
	sort?: string;
	limit?: number;
	page?: number;
	author?: string;
	tag?: string;
	section?: string;
	segment?: string;
}

export interface ApiPeriodRange {
	period_start?: string; // Defaults to 3 days ago.
	period_end?: string; // Defaults to current date and time.
}

/**
 * Gets `period_start` and `period_end` params for API.
 *
 * @param {number} days Number of days for which to calculate the period range.
 *
 * @return {ApiPeriodRange} API query params.
 */
export function getApiPeriodParams( days: number ): ApiPeriodRange {
	return {
		period_start: `${ days }d`,
		period_end: '',
	};
}
