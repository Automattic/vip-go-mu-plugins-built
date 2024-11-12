/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { BlockInstance, getBlockContent } from '@wordpress/blocks';
import { Button, Modal } from '@wordpress/components';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { memo, useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { dispatchCoreBlockEditor, dispatchCoreEditor } from '../../../../@types/gutenberg/types';
import { Telemetry } from '../../../../js/telemetry/telemetry';
import { InboundSmartLink, SmartLink } from '../provider';
import { SmartLinkingStore } from '../store';
import { applyNodeToBlock, isInboundSmartLink, selectSmartLink } from '../utils';
import { InboundLinkDetails } from './component-inbound-link';
import { ReviewModalSidebar } from './component-sidebar';
import { ReviewSuggestion } from './component-suggestion';

/**
 * The props for the SmartLinkingReviewModal component.
 *
 * @since 3.16.0
 */
export type SmartLinkingReviewModalProps = {
	onClose: () => void,
	isOpen: boolean,
	onAppliedLink: ( link: SmartLink ) => void,
};

/**
 * The SmartLinkingReviewModal component displays a modal to review and apply smart links.
 *
 * @since 3.16.0
 *
 * @param {SmartLinkingReviewModalProps} props The component props.
 */
const SmartLinkingReviewModalComponent = ( {
	onClose,
	isOpen,
	onAppliedLink,
}: SmartLinkingReviewModalProps ): React.JSX.Element => {
	const [ showCloseDialog, setShowCloseDialog ] = useState<boolean>( false );
	const [ isModalOpen, setIsModalOpen ] = useState<boolean>( isOpen );

	/**
	 * Loads the Smart Linking store selectors.
	 *
	 * @since 3.16.0
	 */
	const {
		allSmartLinks,
		smartLinks,
		inboundSmartLinks,
		getSuggestedLinks,
		getSmartLinks,
		getOutboundSmartLinks,
	} = useSelect(
		( selectFn ) => {
			const {
				getInboundSmartLinks,
				// eslint-disable-next-line @typescript-eslint/no-shadow
				getSuggestedLinks,
				// eslint-disable-next-line @typescript-eslint/no-shadow
				getSmartLinks,
				// eslint-disable-next-line @typescript-eslint/no-shadow
				getOutboundSmartLinks,
			} = selectFn( SmartLinkingStore );
			const outbound = getOutboundSmartLinks();
			const inbound = getInboundSmartLinks();
			return {
				smartLinks: outbound,
				inboundSmartLinks: inbound,
				allSmartLinks: outbound.concat( inbound ),
				getSmartLinks,
				getOutboundSmartLinks,
				getSuggestedLinks,
			};
		},
		[],
	);

	const [ selectedLink, setSelectedLink ] = useState<SmartLink | InboundSmartLink>( smartLinks[ 0 ] );

	/**
	 * Loads the Smart Linking store actions.
	 *
	 * @since 3.16.0
	 */
	const {
		purgeSmartLinksSuggestions,
		updateSmartLink,
		removeSmartLink,
	} =	useDispatch( SmartLinkingStore );

	const showConfirmCloseDialog = () => setShowCloseDialog( true );
	const hideConfirmCloseDialog = () => setShowCloseDialog( false );

	/**
	 * Applies the link to the block.
	 *
	 * @since 3.16.0
	 *
	 * @param {string}    blockId        The block instance to apply the link to.
	 * @param {SmartLink} linkSuggestion The link suggestion to apply.
	 */
	const applyLinkToBlock = async ( blockId: string, linkSuggestion: SmartLink ) => {
		const anchor = document.createElement( 'a' );
		anchor.href = linkSuggestion.href;
		anchor.title = linkSuggestion.title;
		// Add data-smartlink attribute to the anchor tag.
		anchor.setAttribute( 'data-smartlink', linkSuggestion.uid );

		const block = select( 'core/block-editor' ).getBlock( blockId );
		if ( ! block ) {
			return;
		}

		// Apply and updates the block content.
		applyNodeToBlock( block, linkSuggestion, anchor );

		// Update the smart link in the store.
		linkSuggestion.applied = true;
		await updateSmartLink( linkSuggestion );
	};

	/**
	 * Removes a Smart Link from a block, using the unique identifier.
	 *
	 * @since 3.16.0
	 *
	 * @param {BlockInstance} block          The block instance to remove the link from.
	 * @param {SmartLink}     linkSuggestion The link suggestion to remove.
	 */
	const removeLinkFromBlock = async ( block: BlockInstance, linkSuggestion: SmartLink ) => {
		const blockId = block.clientId;
		if ( ! block ) {
			return;
		}

		const blockContent: string = getBlockContent( block );
		const doc = new DOMParser().parseFromString( blockContent, 'text/html' );
		const contentElement = doc.body.firstChild as HTMLElement;

		if ( ! contentElement ) {
			return;
		}

		// Select anchors by 'data-smartlink' attribute matching the UID.
		const anchors = Array.from(
			contentElement.querySelectorAll( `a[data-smartlink="${ linkSuggestion.uid }"]` ),
		);

		// Check if we found the anchor with the specified UID.
		if ( anchors.length > 0 ) {
			const anchorToRemove = anchors[ 0 ];
			const parentNode = anchorToRemove.parentNode;
			if ( parentNode ) {
				// Replace the anchor with its text content.
				const textNode = document.createTextNode( anchorToRemove.textContent ?? '' );
				parentNode.replaceChild( textNode, anchorToRemove );

				// Update the block content.
				dispatchCoreBlockEditor.updateBlockAttributes( blockId, {
					content: contentElement.innerHTML,
				} );
			}
		}

		// Remove the link from the store.
		await removeSmartLink( linkSuggestion.uid );
	};

	/**
	 * Handles the closing of the modal.
	 *
	 * If there are any pending links, a confirmation dialog is shown.
	 * When the modal is closed, any pending suggestions are purged.
	 *
	 * @since 3.16.0
	 */
	const onCloseHandler = useCallback( () => {
		// Hide the modal.
		setIsModalOpen( false );

		const currentSmartLinks = getOutboundSmartLinks();

		const pendingLinks = currentSmartLinks.filter( ( link ) => ! link.applied );
		if ( pendingLinks.length > 0 ) {
			showConfirmCloseDialog();
			return;
		}

		// Re-enable autosave when the modal is closed.
		dispatchCoreEditor.unlockPostAutosaving( 'smart-linking-review-modal' );

		onClose();
	}, [ getOutboundSmartLinks, onClose ] );

	/**
	 * Handles the closing of the closing confirmation dialog.
	 *
	 * If the user confirms the closing, the modal is closed.
	 *
	 * @since 3.16.0
	 *
	 * @param {boolean} shouldClose Whether the modal should be closed.
	 */
	const onCloseConfirmCloseDialog = ( shouldClose: boolean ) => {
		hideConfirmCloseDialog();
		if ( shouldClose ) {
			setIsModalOpen( false );
			purgeSmartLinksSuggestions().then( () => {
				onCloseHandler();
			} );
		} else {
			setIsModalOpen( true );
		}
	};

	/**
	 * Handles the selection of the next smart link.
	 *
	 * @since 3.16.0
	 */
	const handleNext = () => {
		const isInbound = isInboundSmartLink( selectedLink );

		if ( isInbound ) {
			const currentIndex = inboundSmartLinks.indexOf( selectedLink );
			const nextIndex = currentIndex + 1;

			if ( ! inboundSmartLinks[ nextIndex ] ) {
				return;
			}

			setSelectedLink( inboundSmartLinks[ nextIndex ] );
		} else {
			const currentIndex = smartLinks.indexOf( selectedLink );
			const nextIndex = currentIndex + 1;

			if ( ! smartLinks[ nextIndex ] ) {
				return;
			}

			setSelectedLink( smartLinks[ nextIndex ] );
		}
	};

	/**
	 * Handles the selection of the previous smart link.
	 *
	 * @since 3.16.0
	 */
	const handlePrevious = () => {
		const isInbound = isInboundSmartLink( selectedLink );

		if ( isInbound ) {
			const currentIndex = inboundSmartLinks.indexOf( selectedLink );
			const previousIndex = currentIndex - 1;

			if ( ! inboundSmartLinks[ previousIndex ] ) {
				return;
			}

			setSelectedLink( inboundSmartLinks[ previousIndex ] );
		} else {
			const currentIndex = smartLinks.indexOf( selectedLink );
			const previousIndex = currentIndex - 1;

			if ( ! smartLinks[ previousIndex ] ) {
				return;
			}

			setSelectedLink( smartLinks[ previousIndex ] );
		}
	};

	/**
	 * Handles the acceptance of a smart link.
	 *
	 * @since 3.16.0
	 */
	const onAcceptHandler = async () => {
		if ( ! selectedLink.match ) {
			return;
		}

		onAppliedLink( selectedLink );
		await applyLinkToBlock( selectedLink.match.blockId, selectedLink );

		Telemetry.trackEvent( 'smart_linking_link_accepted', {
			link: selectedLink.href,
			title: selectedLink.title,
			text: selectedLink.text,
			uid: selectedLink.uid,
		} );

		// If there are no more suggested links, close the modal.
		if ( getSuggestedLinks().length === 0 ) {
			onCloseHandler();
			return;
		}

		const currentIndex = smartLinks.indexOf( selectedLink );
		const nextIndex = currentIndex + 1;

		// If there is a next link, select it, otherwise select the first link.
		if ( smartLinks[ nextIndex ] ) {
			setSelectedLink( smartLinks[ nextIndex ] );
		} else {
			setSelectedLink( smartLinks[ 0 ] );
		}
	};

	/**
	 * Handles the rejection of a smart link.
	 *
	 * @since 3.16.0
	 */
	const onRejectHandler = async () => {
		// Change to the next link.
		const currentIndex = smartLinks.indexOf( selectedLink );
		const nextIndex = currentIndex + 1;

		// Check if it exists. If not, try to go for the first one on the array.
		// If there isn't any, close the modal.
		if ( ! smartLinks[ nextIndex ] ) {
			if ( smartLinks[ 0 ] ) {
				setSelectedLink( smartLinks[ 0 ] );
			} else {
				onCloseHandler();
			}
		} else {
			setSelectedLink( smartLinks[ nextIndex ] );
		}

		await removeSmartLink( selectedLink.uid );

		Telemetry.trackEvent( 'smart_linking_link_rejected', {
			link: selectedLink.href,
			title: selectedLink.title,
			text: selectedLink.text,
			uid: selectedLink.uid,
		} );
	};

	/**
	 * Handles the removal of a smart link.
	 *
	 * @since 3.16.0
	 */
	const onRemoveHandler = async () => {
		if ( ! selectedLink.match ) {
			return;
		}

		const block = select( 'core/block-editor' ).getBlock( selectedLink.match.blockId );
		if ( block ) {
			let currentSmartLinks = getSmartLinks();

			// Get the selected link index, and set the selected link as the previous one, or the first one if no previous.
			const currentIndex = currentSmartLinks.indexOf( selectedLink );
			const previousIndex = currentIndex - 1;

			await removeLinkFromBlock( block, selectedLink );

			Telemetry.trackEvent( 'smart_linking_link_removed', {
				link: selectedLink.href,
				title: selectedLink.title,
				text: selectedLink.text,
				uid: selectedLink.uid,
			} );

			currentSmartLinks = getSmartLinks();

			// If there are no more smart links, set the first inbound link.
			if ( currentSmartLinks.length === 0 && inboundSmartLinks.length > 0 ) {
				setSelectedLink( inboundSmartLinks[ 0 ] );
				return;
			}

			// If there are no more smart links, close the modal.
			if ( currentSmartLinks.length === 0 && inboundSmartLinks.length === 0 ) {
				onCloseHandler();
				return;
			}

			// If there is a previous link, select it, otherwise select the first link.
			if ( currentSmartLinks[ previousIndex ] ) {
				setSelectedLink( currentSmartLinks[ previousIndex ] );
				return;
			}

			// Otherwise, select the first link.
			setSelectedLink( currentSmartLinks[ 0 ] );
		}
	};

	/**
	 * Selects the link into the block editor.
	 *
	 * @since 3.16.0
	 */
	const onSelectedInEditorHandler = () => {
		if ( ! selectedLink.match ) {
			return;
		}

		const block = select( 'core/block-editor' ).getBlock( selectedLink.match.blockId );
		if ( block ) {
			// Select the block in the editor.
			dispatchCoreBlockEditor.selectBlock( block.clientId );

			// Find the link element within the block.
			const blockContent = document.querySelector( `[data-block="${ block.clientId }"]` );
			if ( blockContent ) {
				selectSmartLink( blockContent as HTMLElement, selectedLink.uid );
			}

			Telemetry.trackEvent( 'smart_linking_select_in_editor_pressed', {
				type: 'outbound',
				uid: selectedLink.uid,
			} );

			// Close the modal.
			onCloseHandler();
		}
	};

	/**
	 * Sets the selected link when the suggested links change.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		// When the modal is open, disable autosave
		if ( isModalOpen ) {
			dispatchCoreEditor.lockPostAutosaving( 'smart-linking-review-modal' );
			return;
		}

		// If the modal is open, but there are no more smart links, close the modal.
		if ( isModalOpen && allSmartLinks.length === 0 ) {
			onCloseHandler();
		}
	}, [ isModalOpen, onClose, allSmartLinks, onCloseHandler ] );

	/**
	 * Updates the modal state when the `isOpen` prop changes.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		setIsModalOpen( isOpen );
	}, [ isOpen ] );

	return (
		<>
			{ isModalOpen && (
				<Modal
					title={ __( 'Review Smart Links', 'wp-parsely' ) }
					className="wp-parsely-smart-linking-review-modal"
					onRequestClose={ onCloseHandler }
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
				>
					<div className="smart-linking-modal-body">
						<ReviewModalSidebar
							outboundLinks={ smartLinks }
							inboundLinks={ inboundSmartLinks }
							activeLink={ selectedLink }
							setSelectedLink={ setSelectedLink }
						/>
						{ selectedLink &&
							( isInboundSmartLink( selectedLink ) ? (
								<InboundLinkDetails
									link={ selectedLink }
									onNext={ handleNext }
									onPrevious={ handlePrevious }
									hasNext={ inboundSmartLinks.indexOf( selectedLink ) < inboundSmartLinks.length - 1 }
									hasPrevious={ inboundSmartLinks.indexOf( selectedLink ) > 0 }
								/>
							) : (
								<ReviewSuggestion
									link={ selectedLink }
									hasNext={ getSmartLinks().indexOf( selectedLink ) < getSmartLinks().length - 1 }
									hasPrevious={ getSmartLinks().indexOf( selectedLink ) > 0 }
									onNext={ handleNext }
									onPrevious={ handlePrevious }
									onAccept={ onAcceptHandler }
									onReject={ onRejectHandler }
									onRemove={ onRemoveHandler }
									onSelectInEditor={ onSelectedInEditorHandler }
								/>
							) ) }
					</div>
				</Modal>
			) }

			{ showCloseDialog && (
				<Modal
					title={ __( 'Review Smart Links', 'wp-parsely' ) }
					onRequestClose={ () => onCloseConfirmCloseDialog( false ) }
					className="wp-parsely-smart-linking-close-dialog"
				>
					{ __(
						'Are you sure you want to close? All un-accepted smart links will not be added.',
						'wp-parsely',
					) }
					<div className="smart-linking-close-dialog-actions">
						<Button variant="secondary" onClick={ () => onCloseConfirmCloseDialog( false ) }>
							{ __( 'Go Back', 'wp-parsely' ) }
						</Button>
						<Button variant="primary" onClick={ () => onCloseConfirmCloseDialog( true ) }>
							{ __( 'Close', 'wp-parsely' ) }
						</Button>
					</div>
				</Modal>
			) }
		</>
	);
};

/**
 * The SmartLinkingReviewModal component, memoized for performance.
 *
 * @since 3.16.0
 */
export const SmartLinkingReviewModal = memo( SmartLinkingReviewModalComponent );
