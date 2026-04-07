/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft, arrowRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { TrafficBoostLink } from '../../provider';

/**
 * Props structure for PreviewFooter.
 *
 * @since 3.19.0
 */
interface PreviewFooterProps {
	activeLink: TrafficBoostLink | null;
	onNext: () => void;
	onPrevious: () => void;
	totalItems: number;
	itemIndex: number;
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
	onNext,
	onPrevious,
	totalItems,
	itemIndex,
}: PreviewFooterProps ): React.JSX.Element => {
	const hasNext = itemIndex < totalItems;
	const hasPrevious = itemIndex > 1;

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
