/**
 * WordPress dependencies
 */
import { Button, CheckboxControl, Icon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check, closeSmall, help, undo } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { VerticalDivider } from '../../../../../common/components/vertical-divider';
import { TrafficBoostLink } from '../../provider';
import { TrafficBoostStore } from '../../store';
import { DRAG_MARGIN_PX, OnDragProps, useDraggable } from '../hooks/use-draggable';
import { TextSelection } from '../preview';

/**
 * Props structure for PreviewActions.
 *
 * @since 3.20.0
 */
interface PreviewActionsProps {
	activeLink?: TrafficBoostLink | null;
	onAccept: ( link: TrafficBoostLink ) => void;
	onRemove: ( link: TrafficBoostLink, restoreOriginal: boolean ) => void;
	onUpdateLink: ( link: TrafficBoostLink, restoreOriginal: boolean ) => void;
	onDiscard: ( link: TrafficBoostLink ) => void;
	onRestoreOriginal: () => void;
	selectedText: TextSelection | null;
	iframeRef: React.RefObject<HTMLIFrameElement>;
}

/**
 * Preview actions component for the Traffic Boost feature.
 * Displays a draggable floating actions bar with link management controls.
 *
 * @since 3.20.0
 *
 * @param {PreviewActionsProps} props The component's props.
 */
export const PreviewActions = ( {
	activeLink,
	onAccept,
	onUpdateLink,
	onDiscard,
	onRemove,
	onRestoreOriginal,
	selectedText,
	iframeRef,
}: PreviewActionsProps ): React.JSX.Element => {
	const isInboundLink = ! activeLink?.isSuggestion;
	const [ restoreOriginal, setRestoreOriginal ] = useState<boolean>( true );

	const {
		isAccepting,
		isRemoving,
		isGenerating,
	} = useSelect( ( select ) => ( {
		isAccepting: activeLink ? select( TrafficBoostStore ).isAccepting( activeLink ) : false,
		isRemoving: activeLink ? select( TrafficBoostStore ).isRemoving( activeLink ) : false,
		isGenerating: activeLink ? select( TrafficBoostStore ).isGenerating( activeLink ) : false,
	} ), [ activeLink ] );

	const handleDrag = useCallback(
		( { totalDelta, originalItemRect, iframeRect }: OnDragProps ) => {
			const resultDelta = {
				x: totalDelta.x,
				y: totalDelta.y,
			};

			if ( originalItemRect.x + totalDelta.x < DRAG_MARGIN_PX ) {
				// If the resulting x position is before the left margin on the page, set it to exactly the
				// margin distance from the left edge.
				resultDelta.x = DRAG_MARGIN_PX - originalItemRect.x;
			} else if ( originalItemRect.x + totalDelta.x + originalItemRect.width + DRAG_MARGIN_PX > iframeRect.width ) {
				// If the resulting x position is after the right margin on the page, set it to exactly the
				// margin distance from the right edge.
				resultDelta.x = iframeRect.width - originalItemRect.width - originalItemRect.x - DRAG_MARGIN_PX;
			}

			if ( originalItemRect.y + totalDelta.y < DRAG_MARGIN_PX ) {
				// If the resulting y position is above the top margin on the page, set it to exactly the
				// margin distance from the top edge.
				resultDelta.y = DRAG_MARGIN_PX - originalItemRect.y;
			} else if ( originalItemRect.y + totalDelta.y + originalItemRect.height + DRAG_MARGIN_PX > iframeRect.height ) {
				// If the resulting y position is below the bottom margin on the page, set it to exactly the
				// margin distance from the bottom edge.
				resultDelta.y = iframeRect.height - originalItemRect.height - originalItemRect.y - DRAG_MARGIN_PX;
			}

			return resultDelta;
		}, []
	);

	const [ actionsBarRef, isDragging ] = useDraggable( {
		onDrag: handleDrag,
		dragHandleSelector: '.traffic-boost-preview-actions-drag-handle',
		iframeRef,
	} );

	if ( ! activeLink ) {
		return <></>;
	}

	return (
		<div className="traffic-boost-preview-actions" ref={ actionsBarRef }>
			{ ! isGenerating && (
				<>
					<div
						className={ `traffic-boost-preview-actions-drag-handle ${ isDragging ? 'dragging' : '' }` }
						role="button"
						tabIndex={ 0 }
						aria-label={ __( 'Drag to reposition actions bar', 'wp-parsely' ) }
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
							<path d="M8 7H10V5H8V7ZM8 13H10V11H8V13ZM8 19H10V17H8V19ZM14 5V7H16V5H14ZM14 13H16V11H14V13ZM14 19H16V17H14V19Z" fill="#1E1E1E" />
						</svg>
					</div>
					<div className="traffic-boost-preview-actions-buttons">
						{ ! isInboundLink && (
							<>
								<Button
									variant="primary"
									onClick={ () => onAccept( activeLink ) }
									isBusy={ isAccepting }
									disabled={ isAccepting }
									icon={ isAccepting ? null : check }
								>{ isAccepting ? __( 'Accepting…', 'wp-parsely' ) : __( 'Accept', 'wp-parsely' ) }</Button>
								<Button
									variant="tertiary"
									onClick={ () => onDiscard( activeLink ) }
									icon={ closeSmall }
								>{ __( 'Reject', 'wp-parsely' ) }</Button>
								<VerticalDivider size={ 48 } color="#1e1e1e" />
								{ ! selectedText &&
									<div className="traffic-boost-preview-actions-hint">
										<Icon icon={ help } />
										<div className="traffic-boost-preview-actions-hint-text">
											{ __( 'TIP: Customize by selecting different text.', 'wp-parsely' ) }
										</div>
									</div>
								}
								{ selectedText && (
									<Button
										variant="tertiary"
										onClick={ onRestoreOriginal }
										icon={ undo }
									>
										{ __( 'Revert', 'wp-parsely' ) }
									</Button>
								) }
							</>
						) }

						{ isInboundLink && selectedText && (
							<>
								<Button
									variant="primary"
									onClick={ () => onUpdateLink( activeLink, restoreOriginal ) }
									isBusy={ isAccepting }
									disabled={ isAccepting }
									icon={ isAccepting ? null : check }
								>{ isAccepting ? __( 'Updating…', 'wp-parsely' ) : __( 'Update Link', 'wp-parsely' ) }</Button>
								{ activeLink.smartLink?.is_link_replacement && (
									<CheckboxControl
										__nextHasNoMarginBottom
										label={ __( 'Restore original link?', 'wp-parsely' ) }
										checked={ restoreOriginal }
										onChange={ ( value ) => {
											setRestoreOriginal( value );
										} }
									/>
								) }
								<VerticalDivider size={ 48 } color="#1e1e1e" />
								<Button
									variant="tertiary"
									onClick={ onRestoreOriginal }
									icon={ undo }
								>
									{ __( 'Revert', 'wp-parsely' ) }
								</Button>
							</>
						) }

						{ isInboundLink && ! selectedText && (
							<>
								<Button
									variant={ isRemoving ? 'primary' : 'tertiary' }
									icon={ isRemoving ? null : closeSmall }
									onClick={ () => onRemove( activeLink, restoreOriginal ) }
									isBusy={ isRemoving }
									disabled={ isRemoving }
									isDestructive
								>{ isRemoving ? __( 'Removing…', 'wp-parsely' ) : __( 'Remove Link', 'wp-parsely' ) }</Button>
								{ activeLink.smartLink?.is_link_replacement && (
									<CheckboxControl
										__nextHasNoMarginBottom
										label={ __( 'Restore original link?', 'wp-parsely' ) }
										checked={ restoreOriginal }
										onChange={ ( value ) => {
											setRestoreOriginal( value );
										} }
									/>
								) }
							</>
						) }
					</div>
				</>
			) }
		</div>
	);
};
