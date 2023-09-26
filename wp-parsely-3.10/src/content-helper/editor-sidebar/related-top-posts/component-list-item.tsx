/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { EditIcon } from '../../common/icons/edit-icon';
import { OpenLinkIcon } from '../../common/icons/open-link-icon';
import { ViewsIcon } from '../../common/icons/views-icon';
import { getSmartShortDate } from '../../common/utils/date';
import { getPostEditUrl } from '../../common/utils/post';
import { RelatedTopPostData } from './model';

interface RelatedTopPostListItemProps {
	post: RelatedTopPostData;
}

export function RelatedTopPostListItem( { post }: RelatedTopPostListItemProps ): JSX.Element {
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
