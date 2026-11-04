/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';
import { page } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { HydratedPost } from '../../providers/base-wordpress-provider';

/**
 * Defines the props structure for Thumbnail.
 *
 * @since 3.18.0
 */
interface ThumbnailProps {
    post?: HydratedPost;
    imageUrl?: string;
    icon?: React.JSX.Element;
    size?: number;
    className?: string;
}

/**
 * Thumbnail component that displays either a post's thumbnail, a custom image, or a fallback icon.
 *
 * @since 3.18.0
 *
 * @param {ThumbnailProps} props The component's props.
 */
export const Thumbnail = ( {
	post,
	imageUrl,
	icon = page,
	size = 100,
	className = '',
}: Readonly<ThumbnailProps> ): React.JSX.Element => {
	const thumbnailUrl = post?.thumbnail ?? imageUrl;
	const altText = post?.title.rendered ?? '';

	return (
		<div className={ `parsely-thumbnail ${ className }` } style={ { width: size, height: size } }>
			{ thumbnailUrl ? (
				<img
					src={ thumbnailUrl }
					alt={ altText }
					width={ size }
					height={ size }
					loading="lazy"
					aria-hidden={ altText === '' }
				/>
			) : (
				<div className="parsely-thumbnail-icon-container">
					<Icon icon={ icon } size={ size } />
				</div>
			) }
		</div>
	);
};
