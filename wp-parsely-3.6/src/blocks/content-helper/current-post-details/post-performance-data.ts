export interface PostPerformanceData {
	author: string;
	avgEngaged: string;
	date: string;
	id: number;
	period: {
		start: string;
		end: string;
		days: number;
	};
	referrers: PostPerformanceReferrerData;
	statsUrl: string;
	title: string;
	url: string;
	views: string;
	visitors: string;
}

export interface PostPerformanceReferrerData {
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
