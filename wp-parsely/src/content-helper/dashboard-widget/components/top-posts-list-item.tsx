/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { EditIcon } from '../../common/icons/edit-icon';
import { OpenLinkIcon } from '../../common/icons/open-link-icon';
import { getSmartShortDate } from '../../common/utils/date';
import { formatToImpreciseNumber } from '../../common/utils/number';
import { getPostEditUrl } from '../../common/utils/post';
import { TopPostData } from '../model';

interface TopPostListItemProps {
	metric: string;
	post: TopPostData;
}

/**
 * Defines the props structure for components receiving only post data.
 *
 * @since 3.10.0
 */
interface TopPostDataProps {
	post: TopPostData;
}

/**
 * Returns a single list item depicting a post.
 *
 * @param {TopPostListItemProps} props The component's props.
 */
export function TopPostListItem( { metric, post }: TopPostListItemProps ): JSX.Element {
	return (
		<li className="parsely-top-post" key={ post.id }>
			<div className="parsely-top-post-content">

				<ListItemThumbnail post={ post } />

				<div className="parsely-top-post-data">

					<PostListItemMetric metric={ metric } post={ post } />
					<PostListItemTitle post={ post } />

					<a className="parsely-top-post-icon-link" href={ post.url } target="_blank" rel="noreferrer">
						<span className="screen-reader-text">
							{ __( 'View Post (opens in new tab)', 'wp-parsely' ) }
						</span>
						<OpenLinkIcon />
					</a>

					{
						0 !== post.postId &&
						<a className="parsely-top-post-icon-link" href={ getPostEditUrl( post.postId ) } target="_blank" rel="noreferrer">
							<span className="screen-reader-text">
								{ __( 'Edit Post (opens in new tab)', 'wp-parsely' ) }
							</span>
							<EditIcon />
						</a>
					}

					<div className="parsely-top-post-metadata">
						<span className="parsely-top-post-date">
							<span className="screen-reader-text">
								{ __( 'Date', 'wp-parsely' ) }
							</span>
							{ getSmartShortDate( new Date( post.date ) ) }
						</span>
						<span className="parsely-top-post-author">
							<span className="screen-reader-text">
								{ __( 'Author', 'wp-parsely' ) }
							</span>
							{ post.author }
						</span>
					</div>

				</div>

			</div>
		</li>
	);
}

/**
 * Returns the Post thumbnail with its div container. Returns an empty div if
 * the post has no thumbnail.
 *
 * @param {TopPostData} post The Post from which to get the data.
 */
function ListItemThumbnail( { post }: TopPostDataProps ): JSX.Element {
	if ( post.thumbnailUrl ) {
		return (
			<div className="parsely-top-post-thumbnail">
				<span className="screen-reader-text">{ __( 'Thumbnail', 'wp-parsely' ) }</span>
				<img src={ post.thumbnailUrl } alt={ __( 'Post thumbnail', 'wp-parsely' ) } />
			</div>
		);
	}

	return (
		<div className="parsely-top-post-thumbnail">
			<span className="screen-reader-text">{
				__( 'Post thumbnail not available', 'wp-parsely' )
			}</span>
		</div>
	);
}

/**
 * Returns a span element with the desired metric data for the Post.
 *
 * Currently, only the `views` and `avg_engaged` metrics are supported.
 *
 * @since 3.10.0
 *
 * @param {TopPostListItemProps} props The component's props.
 *
 * @return {JSX.Element} The resulting JSX Element.
 */
function PostListItemMetric( { metric, post }: TopPostListItemProps ): JSX.Element {
	if ( 'views' === metric ) {
		return (
			<span className="parsely-top-post-metric-data">
				<span className="screen-reader-text">
					{ __( 'Number of Views', 'wp-parsely' ) }
				</span>
				{ formatToImpreciseNumber( post.views.toString() ) }
			</span>
		);
	}

	if ( 'avg_engaged' === metric ) {
		return (
			<span className="parsely-top-post-metric-data">
				<span className="screen-reader-text">
					{ __( 'Average Time', 'wp-parsely' ) }
				</span>
				{ post.avgEngaged }
			</span>
		);
	}

	return (
		<span className="parsely-top-post-metric-data">
			{ __( '-', 'wp-parsely' ) }
		</span>
	);
}

/**
 * Returns the Post title as a link (for editing the Post) or a div if the Post
 * has no valid ID.
 *
 * @param {TopPostDataProps} props The component's props.
 */
function PostListItemTitle( { post }: TopPostDataProps ): JSX.Element {
	return (
		<a className="parsely-top-post-title" href={ post.dashUrl } target="_blank" rel="noreferrer">
			<span className="screen-reader-text">
				{ __( 'View in Parse.ly (opens in new tab)', 'wp-parsely' ) }
			</span>
			{ post.title }
		</a>
	);
}
