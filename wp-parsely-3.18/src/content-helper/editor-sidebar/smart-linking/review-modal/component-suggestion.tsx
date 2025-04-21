/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { BlockInstance, getBlockType } from '@wordpress/blocks';
import {
	Button,
	Dashicon,
	__experimentalDivider as Divider,
	KeyboardShortcuts,
	Tooltip,
} from '@wordpress/components';
import { select as selectFn, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	arrowLeft,
	arrowRight,
	calendar,
	check,
	closeSmall,
	external,
	Icon,
	page,
	people,
	post,
	postAuthor,
	seen,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../../@types/gutenberg/types';
import { Thumbnail } from '../../../common/components/thumbnail';
import { getSmartShortDate } from '../../../common/utils/date';
import { formatToImpreciseNumber } from '../../../common/utils/number';
import { InboundSmartLink, SmartLink } from '../provider';
import { BlockPreview } from './component-block-preview';
import { InboundLinkDetails } from './component-inbound-link';

/**
 * The props for the SuggestionBreadcrumb component.
 *
 * @since 3.16.0
 */
type SuggestionBreadcrumbProps = {
	link: SmartLink,
};

/**
 * Displays the breadcrumb for the suggestion.
 *
 * It shows the parent blocks of the block where the link is found.
 *
 * @since 3.16.0
 *
 * @param {SuggestionBreadcrumbProps} props The component props.
 */
const SuggestionBreadcrumb = ( { link }: SuggestionBreadcrumbProps ): React.JSX.Element => {
	const blockId = link.match?.blockId;

	// Fetch block details and parent IDs using the blockId.
	const { block, parents } = useSelect(
		( select ) => {
			const { getBlock, getBlockParents } = select( 'core/block-editor' ) as GutenbergFunction;

			if ( ! blockId ) {
				return { block: undefined, parents: [] };
			}

			return {
				block: getBlock( blockId ),
				parents: getBlockParents( blockId )
					.map( ( id ) => getBlock( id ) )
					.filter( ( currBlock ): currBlock is BlockInstance => currBlock !== undefined ),
			};
		},
		[ blockId ],
	);

	if ( ! block ) {
		return <></>;
	}

	return (
		<div className="review-suggestions-breadcrumbs">
			{ parents.map( ( parent: BlockInstance, index: number ) => (
				<span key={ index }>
					<span className="breadcrumbs-parent-block" >
						{ getBlockType( parent.name )?.title }
					</span>
					<span className="breadcrumbs-parent-separator">&nbsp;/&nbsp;</span>
				</span>
			) ) }
			<span className="breadcrumbs-current-block">
				<span className="breadcrumbs-current-block-type">{ getBlockType( block.name )?.title }</span>
				{ block.attributes?.metadata?.name && (
					<span className="breadcrumbs-current-block-name">{ block.attributes.metadata.name }</span>
				) }
			</span>
		</div>
	);
};

/**
 * The LinkDetails component, which renders the details of the link suggestion.
 *
 * @since 3.16.0
 * @since 3.18.0 Added the post type to the link details.
 *
 * @param {{link: SmartLink}} props The component props.
 */
const LinkDetails = ( { link }: { link: SmartLink } ): React.JSX.Element => {
	const author = link.wp_post_meta?.author ?? __( 'N/A', 'wp-parsely' );
	const avgEngaged = link.post_stats?.avg_engaged ?? __( 'N/A', 'wp-parsely' );
	const date = link.wp_post_meta?.date ? getSmartShortDate( new Date( link.wp_post_meta.date ) ) : __( 'N/A', 'wp-parsely' );
	const thumbnail = link.wp_post_meta?.thumbnail ?? false;
	const title = link.wp_post_meta?.title ?? __( 'N/A', 'wp-parsely' );
	const type = link.wp_post_meta?.type ?? __( 'External', 'wp-parsely' );
	const url = link.wp_post_meta?.url; // Used for the link button.
	const views = link.post_stats?.views ? formatToImpreciseNumber( link.post_stats.views ) : __( 'N/A', 'wp-parsely' );
	const visitors = link.post_stats?.visitors ? formatToImpreciseNumber( link.post_stats.visitors ) : __( 'N/A', 'wp-parsely' );

	return (
		<div className="wp-parsely-link-suggestion-link-details">
			<div className="thumbnail-column">
				{ thumbnail ? (
					<Thumbnail imageUrl={ thumbnail } size={ 52 } />
				) : (
					<Thumbnail icon={ page } size={ 52 } />
				) }
			</div>
			<div className="data-column">
				<div className="title-row">
					<Tooltip text={ title }><span>{ title }</span></Tooltip>
					{ url && (
						<Button
							href={ url }
							target="_blank"
							variant="link"
							rel="noopener"
						>
							<Icon icon={ external } size={ 18 } />
						</Button>
					) }
				</div>
				<div className="data-row">
					<div className="data-point">
						<Icon icon={ calendar } size={ 16 } /><span>{ date }</span>
					</div>
					<div className="data-point shrinkable">
						<Icon icon={ postAuthor } size={ 16 } />
						<Tooltip text={ author }><span>{ author }</span></Tooltip>
					</div>
					<div className="data-point shrinkable">
						<Icon icon={ post } size={ 16 } />
						<Tooltip text={ type }><span>{ type }</span></Tooltip>
					</div>
				</div>
				{ link.post_stats && (
					<div className="data-row">
						{ views && (
							<div className="data-point">
								<Icon icon={ seen } size={ 16 } /><span>{ views }</span>
							</div>
						) }
						{ visitors && (
							<div className="data-point">
								<Icon icon={ people } size={ 16 } /><span>{ visitors }</span>
							</div>
						) }
						{ avgEngaged && (
							<div className="data-point">
								<Dashicon icon="clock" size={ 16 } /><span>{ avgEngaged }</span>
							</div>
						) }
					</div>
				) }
			</div>
		</div>
	);
};

/**
 * The props for the ReviewSuggestion component.
 *
 * @since 3.16.0
 */
type ReviewSuggestionProps = {
	link: SmartLink,
	onNext: () => void,
	onPrevious: () => void,
	onAccept: () => void,
	onReject: () => void,
	onRemove: () => void,
	onSelectInEditor: () => void,
	hasPrevious: boolean,
	hasNext: boolean,
};

/**
 * The ReviewSuggestion component, which renders the review suggestion UI.
 *
 * @since 3.16.0
 *
 * @param {ReviewSuggestionProps} props The component props.
 */
export const ReviewSuggestion = ( {
	link,
	onNext,
	onPrevious,
	onAccept,
	onReject,
	onRemove,
	onSelectInEditor,
	hasPrevious,
	hasNext,
}: ReviewSuggestionProps ): React.JSX.Element => {
	// If the link is a Inbound Link, render the InboundLinkDetails component.
	if ( link && ( link as InboundSmartLink ).post_data !== undefined ) {
		return <InboundLinkDetails link={ link as InboundSmartLink } { ...{ onNext, onPrevious, onAccept, onReject, onRemove, onSelectInEditor, hasPrevious, hasNext } } />;
	}

	if ( ! link?.match ) {
		return <>{ __( 'This Smart Link does not have any matches in the current content.', 'wp-parsely' ) }</>;
	}

	const blockId = link.match.blockId;
	// Get the block.
	const block = selectFn( 'core/block-editor' ).getBlock( blockId );
	const isApplied = link.applied;

	if ( ! block ) {
		return <>{ __( 'No block is selected.', 'wp-parsely' ) }</>;
	}

	return (
		<div className="smart-linking-review-suggestion">
			<KeyboardShortcuts
				shortcuts={ {
					left: onPrevious,
					right: onNext,
					up: onPrevious,
					down: onNext,
					a: () => {
						if ( link && ! link.applied ) {
							onAccept();
						}
					},
					r: () => {
						if ( ! link ) {
							return;
						}
						if ( link.applied ) {
							onRemove();
						} else {
							onReject();
						}
					},
				} }
			/>
			<SuggestionBreadcrumb link={ link } />
			<div className="review-suggestion-preview">
				<BlockPreview block={ block } link={ link } />
			</div>
			<Divider />
			<LinkDetails link={ link } />
			<div className="review-controls">
				<Tooltip shortcut="←" text={ __( 'Previous', 'wp-parsely' ) } >
					<Button
						disabled={ ! hasPrevious }
						className="wp-parsely-review-suggestion-previous"
						onClick={ onPrevious }
						icon={ arrowLeft }>
						{ __( 'Previous', 'wp-parsely' ) }
					</Button>
				</Tooltip>
				<div className="reviews-controls-middle">
					{ ! isApplied && (
						<>
							<Tooltip shortcut="R" text={ __( 'Reject', 'wp-parsely' ) } >
								<Button
									className="wp-parsely-review-suggestion-reject"
									icon={ closeSmall }
									onClick={ onReject }
									variant={ 'secondary' }>
									{ __( 'Reject', 'wp-parsely' ) }
								</Button>
							</Tooltip>
							<Tooltip shortcut="A" text={ __( 'Accept', 'wp-parsely' ) } >
								<Button
									className="wp-parsely-review-suggestion-accept"
									icon={ check }
									onClick={ onAccept }
									variant="secondary"
								>
									{ __( 'Accept', 'wp-parsely' ) }
								</Button>
							</Tooltip>
						</>
					) }
					{ isApplied && (
						<>
							<Tooltip shortcut="R" text={ __( 'Remove', 'wp-parsely' ) } >
								<Button
									className="wp-parsely-review-suggestion-reject"
									icon={ closeSmall }
									onClick={ onRemove }
									variant={ 'secondary' }>
									{ __( 'Remove', 'wp-parsely' ) }
								</Button>
							</Tooltip>
							<Button
								className="wp-parsely-review-suggestion-accept"
								onClick={ onSelectInEditor }
								variant="secondary"
							>
								{ __( 'Select in Editor', 'wp-parsely' ) }
							</Button>
						</>
					) }
				</div>
				<Tooltip shortcut="→" text={ __( 'Next', 'wp-parsely' ) } >
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
