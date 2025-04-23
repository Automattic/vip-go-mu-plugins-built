/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { BlockInstance, getBlockType } from '@wordpress/blocks';
import {
	Button,
	__experimentalDivider as Divider,
	MenuItem,
	Tooltip, KeyboardShortcuts,
} from '@wordpress/components';
import { select as selectFn, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, arrowLeft, arrowRight, check, closeSmall, page } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../../@types/gutenberg/types';
import { InboundSmartLink, SmartLink, SmartLinkingProvider } from '../provider';
import { SmartLinkingStore } from '../store';
import { trimURLForDisplay } from '../utils';
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
 *
 * @param {{link: SmartLink}} props The component props.
 */
const LinkDetails = ( { link }: { link: SmartLink } ): React.JSX.Element => {
	// Get the post type by the permalink.
	const [ displayUrl, setDisplayUrl ] = useState<string>( link.href );
	const [ postType, setPostType ] = useState<string|undefined>( link.destination?.post_type );
	const linkRef = useRef<HTMLButtonElement>( null );

	const {
		updateSmartLink,
	} = useDispatch( SmartLinkingStore );

	/**
	 * Fetches the post type by the permalink using the SmartLinkingProvider.
	 *
	 * If the post type is not found, it will default to 'External'.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		if ( ! link.destination ) {
			setPostType( __( 'External', 'wp-parsely' ) );
			SmartLinkingProvider.getInstance().getPostTypeByURL( link.href ).then( ( type ) => {
				if ( type ) {
					setPostType( type.post_type );
				}
				link.destination = type;
				updateSmartLink( link );
			} );
		} else {
			setPostType( link.destination.post_type );
		}
	}, [ link, updateSmartLink ] );

	/**
	 * Trims the URL for display based on the container width.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		const calculateTrimSize = () => {
			if ( linkRef.current ) {
				const containerWidth = linkRef.current.offsetWidth;
				const averageCharWidth = 8; // Estimate or adjust based on actual character width.
				const maxLength = Math.floor( containerWidth / averageCharWidth );
				setDisplayUrl( trimURLForDisplay( link.href, maxLength ) );
			}
		};

		calculateTrimSize();

		window.addEventListener( 'resize', calculateTrimSize );
		return () => {
			window.removeEventListener( 'resize', calculateTrimSize );
		};
	}, [ link ] );

	return (
		<MenuItem
			ref={ linkRef }
			info={ displayUrl }
			iconPosition="left"
			icon={ page }
			shortcut={ postType }
			className="block-editor-link-control__search-item wp-parsely-link-suggestion-link-details"
		>
			{ link.title }
		</MenuItem>
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
