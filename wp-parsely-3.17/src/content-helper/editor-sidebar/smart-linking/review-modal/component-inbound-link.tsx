/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { BlockInstance, parse } from '@wordpress/blocks';
import { __experimentalDivider as Divider, Button, KeyboardShortcuts, Tooltip } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { arrowLeft, arrowRight, Icon, page } from '@wordpress/icons';
import { Telemetry } from '../../../../js/telemetry/telemetry';

/**
 * Internal dependencies
 */
import { InboundSmartLink } from '../provider';
import { BlockPreview } from './component-block-preview';

/**
 * The props for the ThreeDots component.
 *
 * @since 3.16.0
 */
type ThreeDotsProps = {
	topOrBottom: 'top' | 'bottom';
};

/**
 * Displays three dots.
 *
 * @since 3.16.0
 *
 * @param {ThreeDotsProps} props The component props.
 */
const ThreeDots: React.FC<ThreeDotsProps> = ( {
	topOrBottom,
}: ThreeDotsProps ): React.JSX.Element => {
	return (
		<div className={ `three-dots ${ topOrBottom === 'top' ? 'is-top' : 'is-bottom' }` }>
			( &#8230; )
		</div>
	);
};

/**
 * The props for the LinkingPostDetails component.
 *
 * @since 3.16.0
 */
type LinkingPostDetailsProps = {
	link: InboundSmartLink;
};

/**
 * Displays the linking post details.
 *
 * @since 3.16.0
 *
 * @param {LinkingPostDetailsProps} props The component props.
 */
const LinkingPostDetails = ( { link }: LinkingPostDetailsProps ): React.JSX.Element => {
	return (
		<div className="linking-post-details">
			<div className="linking-post-image">
				{ link.post_data?.image ? (
					<img
						className="linking-post-image"
						src={ link.post_data.image }
						alt={ link.post_data.title }
						width={ 64 }
					/>
				) : (
					<div className="icon-container">
						<Icon icon={ page } size={ 24 } />
					</div>
				) }
			</div>
			<div className="linking-post-info">
				<div className="linking-post-title">
					<a href={ link.post_data?.permalink }
						target="_blank"
						rel="noreferrer">
						{ link.post_data?.title }
					</a></div>
				<div className="linking-post-meta">
					{ link.post_data?.date } by { link.post_data?.author }
				</div>
			</div>
			<div className="linking-post-type">{ link.post_data?.type }</div>
		</div>
	);
};

/**
 * The props for the InboundLinkDetails component.
 *
 * @since 3.16.0
 */
type InboundLinkDetailsProps = {
	link: InboundSmartLink;
	onPrevious: () => void;
	onNext: () => void;
	hasPrevious: boolean;
	hasNext: boolean;
};

/**
 * Displays the inbound smart link details.
 *
 * @since 3.16.0
 *
 * @param {InboundLinkDetailsProps} props The component props.
 */
export const InboundLinkDetails = ( {
	link,
	onPrevious,
	onNext,
	hasPrevious,
	hasNext,
}: InboundLinkDetailsProps ): React.JSX.Element => {
	const [ blocks, setBlocks ] = useState<BlockInstance[]>( [] );

	useEffect( () => {
		const paragraph = link.post_data?.paragraph;

		const gutenbergParagraph = `<!-- wp:paragraph -->
${ paragraph ?? '<p></p>' }
<!-- /wp:paragraph -->`;

		if ( ! paragraph ) {
			return;
		}

		setBlocks( parse( gutenbergParagraph ) );
	}, [ link ] );

	return (
		<div className="smart-linking-review-suggestion">
			<KeyboardShortcuts
				shortcuts={ {
					left: onPrevious,
					right: onNext,
					up: onPrevious,
					down: onNext,
				} }
			/>
			<div className="review-suggestion-post-title">{ link.post_data?.title }</div>
			<div className="review-suggestion-preview">
				{ ! link.post_data?.is_first_paragraph && <ThreeDots topOrBottom="top" /> }
				<BlockPreview block={ blocks[ 0 ] } link={ link } useOriginalBlock />
				{ ! link.post_data?.is_last_paragraph && <ThreeDots topOrBottom="bottom" /> }
			</div>
			<Divider />
			<LinkingPostDetails link={ link } />
			<div className="review-controls">
				<Tooltip shortcut="←" text={ __( 'Previous', 'wp-parsely' ) }>
					<Button
						disabled={ ! hasPrevious }
						className="wp-parsely-review-suggestion-previous"
						onClick={ onPrevious }
						icon={ arrowLeft }
					>
						{ __( 'Previous', 'wp-parsely' ) }
					</Button>
				</Tooltip>
				<div className="reviews-controls-middle">
					<Button
						target="_blank"
						href={ link.post_data?.edit_link + '&smart-link=' + link.uid }
						variant="secondary"
						onClick={ () => {
							Telemetry.trackEvent( 'smart_linking_open_in_editor_pressed', {
								type: 'inbound',
								uid: link.uid,
							} );
						} }
					>
						{ __( 'Open in the Editor', 'wp-parsely' ) }
					</Button>
				</div>
				<Tooltip shortcut="→" text={ __( 'Next', 'wp-parsely' ) }>
					<Button
						disabled={ ! hasNext }
						onClick={ onNext }
						className="wp-parsely-review-suggestion-next"
					>
						{ __( 'Next', 'wp-parsely' ) }
						<Icon icon={ arrowRight } />
					</Button>
				</Tooltip>
			</div>
		</div>
	);
};
