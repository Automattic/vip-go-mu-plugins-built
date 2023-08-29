/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { RelatedTopPostData } from './model';
import ViewsIcon from '../icons/views-icon';
import OpenLinkIcon from '../icons/open-link-icon';
import EditIcon from '../icons/edit-icon';
import { getPostEditUrl } from '../../shared/utils/post';
import { getSmartShortDate } from '../../../blocks/shared/utils/date';

interface RelatedTopPostListItemProps {
	post: RelatedTopPostData;
}

function RelatedTopPostListItem( { post }: RelatedTopPostListItemProps ): JSX.Element {
	return (
		<li className="parsely-top-post" data-testid="parsely-top-post">
			<div className="parsely-top-post-title">
				<a className="parsely-top-post-stats-link" href={ post.dashUrl } target="_blank" rel="noreferrer" title={ __( 'View in Parse.ly (opens new tab)', 'wp-parsely' ) }>
					{ post.title }
				</a>

				<a className="parsely-top-post-view-link" href={ post.url } target="_blank" rel="noreferrer" title={ __( 'View Post (opens new tab)', 'wp-parsely' ) }>
					<OpenLinkIcon />
				</a>

				{
					0 !== post.postId &&
					<a className="parsely-top-post-edit-link" href={ getPostEditUrl( post.postId ) } target="_blank" rel="noreferrer" title={ __( 'Edit Post (opens new tab)', 'wp-parsely' ) }>
						<EditIcon />
					</a>
				}
			</div>
			<p className="parsely-top-post-info">
				<span className="parsely-top-post-date"><span className="screen-reader-text">Date </span>{ getSmartShortDate( new Date( post.date ) ) }</span>
				<span className="parsely-top-post-author"><span className="screen-reader-text">Author </span>{ post.author }</span>
				<span className="parsely-top-post-views"><span className="screen-reader-text">Number of Views </span><ViewsIcon />{ post.views }</span>
			</p>
		</li>
	);
}

export default RelatedTopPostListItem;
