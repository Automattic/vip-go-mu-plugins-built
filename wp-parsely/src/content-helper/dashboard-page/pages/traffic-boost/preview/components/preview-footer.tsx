/**
 * WordPress imports
 */
import { Button, CheckboxControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { arrowLeft, arrowRight, check, close, undo } from '@wordpress/icons';

/**
 * Internal imports
 */
import { VerticalDivider } from '../../../../../common/components/vertical-divider';
import { TrafficBoostLink } from '../../provider';
import { TrafficBoostStore } from '../../store';
import { TextSelection } from '../preview';

/**
 * Props structure for PreviewFooter.
 *
 * @since 3.19.0
 */
interface PreviewFooterProps {
	activeLink: TrafficBoostLink | null;
	onAccept: ( link: TrafficBoostLink ) => void;
	onRemove: ( link: TrafficBoostLink, restoreOriginal: boolean ) => void;
	onUpdateLink: ( link: TrafficBoostLink, restoreOriginal: boolean ) => void;
	onDiscard: ( link: TrafficBoostLink ) => void;
	onNext: () => void;
	onPrevious: () => void;
	totalItems: number;
	itemIndex: number;
	onRestoreOriginal: () => void;
	selectedText: TextSelection | null;
}

/**
 * Preview footer component for the Traffic Boost feature.
 * Displays link options for a selected post.
 *
 * @since 3.19.0
 *
 * @param {PreviewFooterProps} props The component's props.
 */
export const PreviewFooter = ( {
	activeLink,
	onAccept,
	onUpdateLink,
	onDiscard,
	onNext,
	onPrevious,
	onRemove,
	totalItems,
	itemIndex,
	onRestoreOriginal,
	selectedText,
}: PreviewFooterProps ): React.JSX.Element => {
	const isInboundLink = ! activeLink?.isSuggestion;
	const hasNext = itemIndex < totalItems;
	const hasPrevious = itemIndex > 1;
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

	if ( ! activeLink ) {
		return <></>;
	}

	return (
		<div className="traffic-boost-preview-footer">
			<div className="traffic-boost-preview-footer-previous">
				{ hasPrevious && (
					<Button
						variant="tertiary"
						onClick={ onPrevious }
						icon={ arrowLeft }
						showTooltip={ true }
						label={ __( 'Previous Suggested Source', 'wp-parsely' ) }
					/>
				) }
			</div>

			{ ! isGenerating && (
				<div className="traffic-boost-preview-footer-actions">
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
								icon={ close }
							>{ __( 'Reject', 'wp-parsely' ) }</Button>
							{ selectedText && (
								<>
									<VerticalDivider size={ 36 } />
									<Button
										variant="tertiary"
										onClick={ onRestoreOriginal }
										icon={ undo }
									>
										{ __( 'Clear changes', 'wp-parsely' ) }
									</Button>
								</>
							) }
						</>
					) }

					{ isInboundLink && (
						<>
							{ selectedText ? (
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
									<VerticalDivider size={ 36 } />
									<Button
										variant="tertiary"
										onClick={ onRestoreOriginal }
										icon={ undo }
									>
										{ __( 'Clear changes', 'wp-parsely' ) }
									</Button>
								</>
							) : (
								<>
									<Button
										variant={ isRemoving ? 'primary' : 'tertiary' }
										icon={ isRemoving ? null : close }
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
						</>
					) }
				</div>
			) }

			<div className="traffic-boost-preview-footer-next">
				{ hasNext && (
					<Button
						variant="tertiary"
						onClick={ onNext }
						icon={ arrowRight }
						showTooltip={ true }
						label={ __( 'Next Suggested Source', 'wp-parsely' ) }
					/>
				) }
			</div>

		</div>
	);
};
