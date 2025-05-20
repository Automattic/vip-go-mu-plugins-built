/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Thumbnail } from '../../../../../common/components/thumbnail';
import { HydratedPost } from '../../../../../common/providers/base-wordpress-provider';

/**
 * Defines the props structure for PostDetailsSidebar.
 *
 * @since 3.19.0
 */
interface PostDetailsSidebarProps {
	post?: HydratedPost;
	isLoading: boolean;
}

/**
 * Component that displays post details including thumbnail and meta information.
 *
 * @since 3.19.0
 *
 * @param {PostDetailsSidebarProps} props The component's props.
 */
export const PostDetailsSidebar = ( { post, isLoading }: PostDetailsSidebarProps ): React.JSX.Element => {
	return (
		<div className="traffic-boost-post-details">
			<div className="traffic-boost-post-details-label">
				{ __( 'Target Post:', 'wp-parsely' ) }
			</div>
			<div className="traffic-boost-post-details-content">
				<Thumbnail
					post={ post }
					size={ 52 }
					className="traffic-boost-thumbnail"
				/>
				{ isLoading && <Spinner /> }
				{ ! isLoading && (
					<div className="post-title" dangerouslySetInnerHTML={ { __html: post?.title.rendered ?? __( '(no title)', 'wp-parsely' ) } } />
				) }
			</div>
			<div className="traffic-boost-post-details-divider"></div>
			<div className="traffic-boost-post-details-description">
				{ __( 'Use Parse.ly data to increase your post\'s traffic. ' +
					'Plant links to this post in high-performing related source posts.', 'wp-parsely' ) }
			</div>
		</div>
	);
};
