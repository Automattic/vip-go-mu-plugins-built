/**
 * Internal dependencies
 */
import { Metric } from './constants';
import { formatToImpreciseNumber } from './number';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Defines the data structure of Posts.
 *
 * @since 3.7.0
 * @since 3.11.0 Renamed to PostData from TopPostData and moved into post.tsx.
 */
export interface PostData {
	author: string;
	avgEngaged: string;
	dashUrl: string;
	date: string;
	id: number;
	postId: number;
	thumbnailUrl: string;
	title: string;
	url: string;
	views: number;
}

/**
 * Defines a generic props structure for post list items.
 *
 * @since 3.11.0
 */
export interface PostListItemProps {
	metric: Metric;
	post: PostData;
}

/**
 * Defines the props structure for PostListItemMetric.
 *
 * @since 3.10.0
 */
interface PostListItemMetricProps extends PostListItemProps {
	avgEngagedIcon?: JSX.Element;
	viewsIcon?: JSX.Element;
}

/**
 * Returns a span element with the desired metric data for the Post.
 *
 * Currently, only the `views` and `avg_engaged` metrics are supported.
 *
 * @since 3.10.0
 * @since 3.11.0 Moved into to post.tsx.
 *
 * @param {PostListItemMetricProps} props The component's props.
 *
 * @return {JSX.Element} The resulting JSX Element.
 */
export function PostListItemMetric(
	{ metric, post, avgEngagedIcon, viewsIcon }: Readonly<PostListItemMetricProps>
): JSX.Element {
	if ( 'views' === metric ) {
		return (
			<span className="parsely-top-post-metric-data">
				<span className="screen-reader-text">
					{ __( 'Number of Views', 'wp-parsely' ) }
				</span>
				{ viewsIcon }{ formatToImpreciseNumber( post.views.toString() ) }
			</span>
		);
	}

	if ( 'avg_engaged' === metric ) {
		return (
			<span className="parsely-top-post-metric-data">
				<span className="screen-reader-text">
					{ __( 'Average Time', 'wp-parsely' ) }
				</span>
				{ avgEngagedIcon }{ post.avgEngaged }
			</span>
		);
	}

	return (
		<span className="parsely-top-post-metric-data">
			-
		</span>
	);
}

/**
 * Gets edit url of the post.
 *
 * @since 3.7.0
 *
 * @param {number} postId ID of the post.
 *
 * @return {string} Edit url of the post.
 */
export function getPostEditUrl( postId: number ): string {
	return `/wp-admin/post.php?post=${ postId }&action=edit`;
}
