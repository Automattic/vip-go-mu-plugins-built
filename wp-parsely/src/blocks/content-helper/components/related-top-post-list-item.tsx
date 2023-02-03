/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { RelatedTopPostData } from '../models/related-top-post-data';
import ViewsIcon from '../icons/views-icon';
import PublishedLinkIcon from '../icons/published-link-icon';

interface RelatedTopPostListItemProps {
	post: RelatedTopPostData;
}

function RelatedTopPostListItem( { post }: RelatedTopPostListItemProps ): JSX.Element {
	return (
		<li className="parsely-top-post" data-testid="parsely-top-post">
			<div className="parsely-top-post-title">
				<a className="parsely-top-post-stats-link" href={ post.statsUrl } target="_blank" rel="noreferrer" title={ __( 'View in Parse.ly (opens new tab)', 'wp-parsely' ) }>
					{ post.title }
				</a>
				<a className="parsely-top-post-link" href={ post.url } target="_blank" rel="noreferrer" title={ __( 'View Published Post (opens new tab)', 'wp-parsely' ) }>
					<PublishedLinkIcon />
				</a>
			</div>
			<p className="parsely-top-post-info">
				<span className="parsely-top-post-date"><span className="screen-reader-text">Date </span>{ post.date }</span>
				<span className="parsely-top-post-author"><span className="screen-reader-text">Author </span>{ post.author }</span>
				<span className="parsely-top-post-views"><span className="screen-reader-text">Number of Views </span><ViewsIcon />{ post.views }</span>
			</p>
		</li>
	);
}

export default RelatedTopPostListItem;
