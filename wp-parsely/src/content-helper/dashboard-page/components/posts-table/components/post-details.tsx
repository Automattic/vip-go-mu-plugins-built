/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Thumbnail } from '../../../../common/components/thumbnail';
import { HydratedPost } from '../../../../common/providers/base-wordpress-provider';
import { getSmartShortDate } from '../../../../common/utils/date';

/**
 * Type definition for the PostDetails component.
 *
 * @since 3.19.0
 */
type PostDetailsProps = {
	post: HydratedPost;
};

/**
 * PostDetails component.
 *
 * Represents the post details, the first column in the PostsTable.
 *
 * @since 3.19.0
 *
 * @param {PostDetailsProps} props The component props.
 */
export const PostDetails = ( { post }: PostDetailsProps ): React.JSX.Element => {
	const prettyDate = post.date ? getSmartShortDate( new Date( post.date ) ) : '';

	let postTitle = post.title.rendered;

	// If the title is longer than 80 characters, truncate it and add an ellipsis.
	if ( postTitle !== '' ) {
		if ( postTitle.length > 80 ) {
			postTitle = postTitle.substring( 0, 80 ) + '&hellip;';
		}
	}

	return (
		<div className="posts-table-post-info">
			<Thumbnail
				post={ post }
				size={ 45 }
				className="posts-table-thumbnail"
			/>
			<div className="post-details">
				<div className="post-title">
					{ postTitle !== ''
						? <span title={ post.title.rendered } dangerouslySetInnerHTML={ { __html: postTitle } }	/>
						: __( '(no title)', 'wp-parsely' )
					}
					{ /* Suggestion count bubble: Temporarily disabled for design */ }
					{ /* showSuggestionBubble && numberOfSuggestions > 0 && (
						<SuggestionBubble postId={ post.id } numberOfSuggestions={ numberOfSuggestions } />
					) } */ }
				</div>
				<div className="post-meta">
					<span className="post-date">{ prettyDate }</span>
					{ post.author && <span className="post-author">{ post.author.name }</span> }
					<div className="post-categories">
						{ post.categories && post.categories.length > 0 &&
							post.categories.map( ( category ) => (
								<span key={ category.id }>{ category.name }</span>
							) )
						}
					</div>
				</div>
			</div>
		</div>
	);
};
