export interface PerformanceData {
	author: string;
	avgEngaged: string;
	date: string;
	id: number;
	referrers: PerformanceReferrerData;
	dashUrl: string;
	title: string;
	url: string;
	views: string;
	visitors: string;
}

export interface PerformanceReferrerData {
	top: {
		views: string;
		viewsPercentage: string;
		datasetViewsPercentage: string;
	}[];
	types: {
		views: string;
		viewsPercentage: string;
	}[];
}
