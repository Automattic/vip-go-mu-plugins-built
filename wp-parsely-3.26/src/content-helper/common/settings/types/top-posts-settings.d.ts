import { Metric, Period } from '../../utils/constants';

/**
 * Defines the settings structure for the TopPosts component.
 *
 * @since 3.13.0
 * @since 3.14.0 Moved from `content-helper/dashboard-widget/components/top-posts.tsx`.
 */
export interface TopPostsSettings {
	Metric: Metric;
	Period: Period;
}
