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
import { TopPostData } from './model';

interface TopPostListItemProps {
	post: TopPostData;
}

/**
 * Returns a single list item depicting a post.
 *
 * @param {TopPostData} post The Post to be shown.
 */
export function TopPostListItem( { post }: TopPostListItemProps ): JSX.Element {
	return (
		<li className="parsely-top-post">
			<div className="parsely-top-post-content">

				{ getPostThumbnailElement( { post } ) }

				<div className="parsely-top-post-data">

					<span className="parsely-top-post-views">
						<span className="screen-reader-text">
							{ __( 'Number of Views', 'wp-parsely' ) }
						</span>
						{ formatToImpreciseNumber( post.views.toString() ) }
					</span>

					{ getPostTitleElement( { post } ) }

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
function getPostThumbnailElement( { post }: TopPostListItemProps ): JSX.Element {
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
 * Returns the Post title as a link (for editing the Post) or a div if the Post
 * has no valid ID.
 *
 * @param {TopPostData} post The Post from which to get the data.
 */
function getPostTitleElement( { post }: TopPostListItemProps ): JSX.Element {
	return (
		<a className="parsely-top-post-title" href={ post.dashUrl } target="_blank" rel="noreferrer">
			<span className="screen-reader-text">
				{ __( 'View in Parse.ly (opens in new tab)', 'wp-parsely' ) }
			</span>
			{ post.title }
		</a>
	);
}
