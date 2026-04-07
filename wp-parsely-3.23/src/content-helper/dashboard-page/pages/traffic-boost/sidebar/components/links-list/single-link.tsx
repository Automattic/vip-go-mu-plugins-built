/**
 * External Dependencies
 */
import type { ForwardedRef, KeyboardEvent } from 'react';

/**
 * WordPress Dependencies
 */
import { forwardRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal Dependencies
 */
import { Thumbnail } from '../../../../../../common/components/thumbnail';
import { TrafficBoostLink } from '../../../provider';

/**
 * Defines the props structure for SingleLink.
 *
 * @since 3.19.0
 */
type SingleLinkProps = {
    suggestion: TrafficBoostLink;
	isActive: boolean;
	onClick?: ( suggestion: TrafficBoostLink ) => void;
};

/**
 * The SingleLink component, before being forwarded.
 *
 * @since 3.19.0
 *
 * @param {SingleLinkProps}              props The component's props.
 * @param {ForwardedRef<HTMLDivElement>} ref   The forwarded ref.
 */
export const SingleLinkComponent = (
	{ suggestion, isActive, onClick }: SingleLinkProps,
	ref: ForwardedRef<HTMLDivElement>
): JSX.Element => {
	const suggestedPost = suggestion.targetPost;

	/**
	 * Handles the click event for the single link.
	 *
	 * @since 3.19.0
	 */
	const onClickHandler = () => {
		onClick?.( suggestion );
	};

	/**
	 * Handles the keydown event for the single link.
	 *
	 * @since 3.19.0
	 *
	 * @param {KeyboardEvent<HTMLDivElement>} e The keyboard event.
	 */
	const handleKeyDown = ( e: KeyboardEvent<HTMLDivElement> ) => {
		if ( e.key === 'Enter' || e.key === ' ' ) {
			e.preventDefault();
			onClickHandler();
		}
	};

	return (
		<div
			className={ `traffic-boost-single-link ${ isActive ? 'active' : '' }` }
			ref={ ref }
			onClick={ ( e ) => {
				e.preventDefault();
				onClickHandler();
			} }
			onKeyDown={ handleKeyDown }
			role="button"
			tabIndex={ 0 }
			aria-label={ sprintf(
				/* translators: %s: Post title */
				__( 'Engagement boost link for %s', 'wp-parsely' ),
				suggestedPost.title.rendered
			) }
			aria-pressed={ isActive }
		>
			<div className="single-link-thumbnail">
				<Thumbnail
					post={ suggestedPost }
					size={ 52 }
					className="traffic-boost-preview-thumbnail"
				/>
			</div>
			<div className="single-link-details">
				<div
					className="single-link-title"
					dangerouslySetInnerHTML={ { __html: suggestedPost.title.rendered } }
				/>
			</div>
		</div>
	);
};

/**
 * Displays a single Traffic Boost link.
 *
 * @since 3.19.0
 *
 * @param {SingleLinkProps}              props The component's props.
 * @param {ForwardedRef<HTMLDivElement>} ref   The forwarded ref.
 */
export const SingleLink = forwardRef<HTMLDivElement, SingleLinkProps>( SingleLinkComponent );
