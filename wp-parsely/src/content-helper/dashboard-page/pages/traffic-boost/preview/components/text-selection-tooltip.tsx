/**
 * WordPress imports
 */
import { Button } from '@wordpress/components';
import { debounce } from '@wordpress/compose';
import { createRoot, useCallback, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { link, warning } from '@wordpress/icons';
import { getContentArea } from '../utils';

/**
 * Custom hook to inject styles into the iframe.
 *
 * @since 3.19.0
 *
 * @param {Document} iframeDocument The iframe's document object.
 */
const useIframeStyles = ( iframeDocument: Document ) => {
	useEffect( () => {
		// Get computed styles from parent window.
		const adminColor = window.getComputedStyle( document.documentElement )
			.getPropertyValue( '--wp-admin-theme-color' ).trim();

		// Inject WordPress components styles.
		const wpComponentsLink = iframeDocument.createElement( 'link' );
		wpComponentsLink.rel = 'stylesheet';
		wpComponentsLink.href = '/wp-includes/css/dist/components/style.css';
		iframeDocument.head.appendChild( wpComponentsLink );

		// Create and inject custom styles into the iframe.
		const style = iframeDocument.createElement( 'style' );
		style.textContent = `
			/* Highlight styles */
			.parsely-traffic-boost-highlight {
				position: absolute;
				pointer-events: none;
				z-index: 1000;
				transition: all 0.15s ease-out;
			}

			/* Popover container styles */
			.parsely-traffic-boost-popover-container {
				position: absolute;
				left: 50%;
				bottom: 100%;
				transform: translateX(-50%);
				margin-bottom: 12px;
				z-index: 1001;
				opacity: 0;
				animation: slideUp 0.2s ease-out forwards;
			}

			.parsely-traffic-boost-popover-container .components-button.is-primary:focus:not(:disabled) {
				box-shadow:none;
			}

			.parsely-traffic-boost-popover-container.closing {
				animation: slideDown 0.2s ease-out forwards;
			}

			.parsely-traffic-boost-iframe-popover {
				padding: 0;
				pointer-events: auto;
				white-space: nowrap;
			}

			.parsely-traffic-boost-iframe-popover-button {
				box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.05),
					0px 4px 5px 0px rgba(0, 0, 0, 0.04),
					0px 4px 5px 0px rgba(0, 0, 0, 0.03),
					0px 16px 16px 0px rgba(0, 0, 0, 0.02);
				padding: 6px 12px;
				background: var(--wp-admin-theme-color, ${ adminColor });
				border-radius: 2px;
			}

			.parsely-traffic-boost-iframe-popover-error {
				background: #000 !important;
				color: #fff !important;
			}

			/* Animation styles */
			@keyframes slideUp {
				from {
					opacity: 0;
					transform: translate(-50%, 10px);
				}
				to {
					opacity: 1;
					transform: translate(-50%, 0);
				}
			}

			@keyframes slideDown {
				from {
					opacity: 1;
					transform: translate(-50%, 0);
				}
				to {
					opacity: 0;
					transform: translate(-50%, 10px);
				}
			}
		`;
		iframeDocument.head.appendChild( style );

		// Cleanup function to remove styles when component unmounts.
		return () => {
			wpComponentsLink.remove();
			style.remove();
		};
	}, [ iframeDocument ] );
};

/**
 * Props structure for TextSelectionPopover.
 *
 * @since 3.19.0
 */
interface TextSelectionPopoverProps {
	onSelect: () => void;
	selection: Selection;
	iframeDocument: Document;
	onErrorClick: () => void;
}

/**
 * Component that renders the popover content for text selection.
 *
 * @since 3.19.0
 *
 * @param {TextSelectionPopoverProps} props The component's props.
 */
const TextSelectionPopover = ( { onSelect, iframeDocument, selection, onErrorClick }: TextSelectionPopoverProps ): JSX.Element => {
	useIframeStyles( iframeDocument );
	const [ error, setError ] = useState<string | null>( null );
	const [ isReplacingLink, setIsReplacingLink ] = useState<boolean>( false );

	/**
	 * Checks if the given node or its children contain an anchor.
	 *
	 * @since 3.19.0
	 *
	 * @param {Node} node The node to check.
	 *
	 * @return {boolean} True if the node or its children contain an anchor, false otherwise.
	 */
	const containsAnchor = useCallback( ( range: Range ): boolean => {
		let currentNode: Node | null = range.startContainer;
		const endNode = range.endContainer;

		while ( currentNode !== null ) {
			if ( currentNode.nodeType === Node.ELEMENT_NODE ) {
				const element = currentNode as Element;
				if ( element.tagName === 'A' ) {
					// There is an anchor present in the selection.
					return true;
				}
			}

			currentNode = getNextNode( currentNode, false, endNode );
		}

		// No nodes matched, no anchor present in the selection.
		return false;
	}, [] );

	/**
	 * Checks if the selection is the entire link text.
	 *
	 * @since 3.19.0
	 *
	 * @return {boolean} True if the selection is the entire link text, false otherwise.
	 */
	const isAllLinkTextSelected = useCallback( (): boolean => {
		const range = selection.getRangeAt( 0 );
		const container = range.commonAncestorContainer as Element;

		// Find the closest link element.
		const linkNode = container.nodeType === Node.ELEMENT_NODE
			? container.closest( 'a' )
			: container.parentElement?.closest( 'a' );

		// If there's no link or no selection, return false.
		if ( ! linkNode || selection.isCollapsed ) {
			return false;
		}

		// Compare the selected text with the link's text content.
		return selection.toString().trim() === linkNode.textContent?.trim();
	}, [ selection ] );

	/**
	 * Checks if the selection is within a link and sets an error message if it is.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( isAllLinkTextSelected() ) {
			setIsReplacingLink( true );
			return;
		}

		const range = selection.getRangeAt( 0 );

		if ( containsAnchor( range ) ) {
			setError( __( 'Select text without existing links.', 'wp-parsely' ) );
			return;
		}

		setError( null );
	}, [ containsAnchor, isAllLinkTextSelected, selection ] );

	if ( error ) {
		return <div className="parsely-traffic-boost-iframe-popover">
			<Button
				variant="primary"
				className="parsely-traffic-boost-iframe-popover-error"
				icon={ warning }
				onClick={ onErrorClick }
			>
				{ error }
			</Button>
		</div>;
	}

	return (
		<div className="parsely-traffic-boost-iframe-popover">
			<Button
				variant="primary"
				icon={ link }
				className="parsely-traffic-boost-iframe-popover-button"
				onClick={ onSelect }
			>
				{ isReplacingLink
					? __( 'Replace Link', 'wp-parsely' )
					: __( 'Use as Link Text', 'wp-parsely' ) }
			</Button>
		</div>
	);
};

/**
 * Props structure for TextSelectionTooltip.
 *
 * @since 3.19.0
 */
interface TextSelectionTooltipProps {
	iframeRef: React.RefObject<HTMLIFrameElement>;
	onTextSelected: ( text: string, offset: number ) => void;
}

/**
 * A tooltip component that appears over selected text, offering to use that
 * text as link text.
 *
 * @since 3.19.0
 *
 * @param {TextSelectionTooltipProps} props The component's props.
 */
export const TextSelectionTooltip = ( {
	iframeRef,
	onTextSelected,
}: TextSelectionTooltipProps ): null => {
	/**
	 * Expands the current selection to word boundaries.
	 *
	 * @since 3.19.0
	 *
	 * @param {Selection} docSelection The document's current selection.
	 * @param {Range}     range        The current selection range.
	 */
	const expandToWordBoundary = ( docSelection: Selection, range: Range ) => {
		const startNode = range.startContainer as Text;
		const endNode = range.endContainer as Text;
		const startText = startNode.textContent ?? '';
		const endText = endNode.textContent ?? '';

		// Get initial selection boundaries before expanding.
		const initialStart = range.startOffset;
		const initialEnd = range.endOffset;

		// Find word boundary at start.
		let startOffset = range.startOffset;
		while ( startOffset > 0 && /[^\s.,!?;:'")\]}]/g.test( startText[ startOffset - 1 ] ) ) {
			startOffset--;
		}

		// Find word boundary at end.
		let endOffset = range.endOffset;
		while ( endOffset < endText.length && /[^\s.,!?;:'"([{]/g.test( endText[ endOffset ] ) ) {
			endOffset++;
		}

		// Only update if boundaries have changed.
		if ( startOffset !== initialStart || endOffset !== initialEnd ) {
			range.setStart( startNode, startOffset );
			range.setEnd( endNode, endOffset );
			docSelection.removeAllRanges();
			docSelection.addRange( range );
		}
	};

	/**
	 * Expands the current selection to encompass the entire link node if
	 * selection is within a link.
	 *
	 * @since 3.19.0
	 *
	 * @param {Selection} docSelection The document's current selection.
	 * @param {Range}     range        The current selection range.
	 *
	 * @return {boolean} True if selection was expanded to a link, false otherwise.
	 */
	const expandToLinkNode = ( docSelection: Selection, range: Range ): boolean => {
		// Find if selection is within an anchor tag.
		const container = range.commonAncestorContainer as Element;
		const linkNode = container.nodeType === Node.ELEMENT_NODE
			? container.closest( 'a' )
			: container.parentElement?.closest( 'a' );

		// If the selection is already the full link, return true.
		if ( docSelection.toString() === linkNode?.textContent ) {
			return true;
		}

		if ( linkNode ) {
			// Create a new range that encompasses the entire link.
			const newRange = range.cloneRange();
			newRange.selectNodeContents( linkNode );

			// Update the selection.
			docSelection.removeAllRanges();
			docSelection.addRange( newRange );
			return true;
		}

		return false;
	};

	/**
	 * Calculates the offset of the selected text by counting previous occurrences.
	 *
	 * @since 3.19.0
	 *
	 * @param {Document}  iframeDocument The iframe's document object.
	 * @param {Selection} docSelection   The document's current selection.
	 * @param {Element}   previewWrapper The preview wrapper element.
	 */
	const calculateOffset = (
		iframeDocument: Document,
		docSelection: Selection,
		previewWrapper: Element
	): number => {
		const selectedText = docSelection.toString().trim();
		if ( ! selectedText ) {
			return 0;
		}

		// Get all text content up to the selection.
		const currentRange = docSelection.getRangeAt( 0 );
		const tempRange = iframeDocument.createRange();
		tempRange.setStart( previewWrapper, 0 );
		tempRange.setEnd( currentRange.startContainer, currentRange.startOffset );

		const textBeforeSelection = tempRange.toString();

		// Count occurrences before the selection.
		const regex = new RegExp( selectedText.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ), 'g' );
		const matches = textBeforeSelection.match( regex );

		return matches ? matches.length : 0;
	};

	/**
	 * Handles the selection of text in the iframe.
	 *
	 * @since 3.19.0
	 */
	const handleSelection = useCallback( () => {
		const iframeDocument = iframeRef.current?.contentDocument;
		if ( ! iframeDocument ) {
			return;
		}

		// Get the selection.
		const docSelection = iframeDocument.getSelection();

		// Clean up existing highlight with animation if selection is collapsed.
		const existingHighlight = iframeDocument.querySelector( '.parsely-traffic-boost-highlight' );
		if ( existingHighlight ) {
			if ( ! docSelection || docSelection.isCollapsed ) {
				const existingPopover = existingHighlight.querySelector( '.parsely-traffic-boost-popover-container' );
				if ( existingPopover ) {
					existingPopover.classList.add( 'closing' );
					setTimeout( () => {
						existingHighlight.remove();
					}, 200 );
				} else {
					existingHighlight.remove();
				}
				return;
			}

			// If we have a new selection, remove old highlight immediately without animation.
			existingHighlight.remove();
		}

		if ( ! docSelection || docSelection.isCollapsed ) {
			return;
		}

		// Get the content area.
		const contentArea = getContentArea( iframeDocument );
		if ( ! contentArea ) {
			return;
		}

		const range = docSelection.getRangeAt( 0 );

		// Check if selection is within content area.
		if ( ! contentArea.contains( range.commonAncestorContainer ) ) {
			return;
		}

		// Check if selection spans multiple paragraphs.
		const startParagraph = range.startContainer.parentElement?.closest( 'p, li' );
		const endParagraph = range.endContainer.parentElement?.closest( 'p, li' );

		if ( ! startParagraph || ! endParagraph || startParagraph !== endParagraph ) {
			return;
		}

		// If selection is inside a link, expand to encompass the entire link.
		if ( ! expandToLinkNode( docSelection, range ) ) {
			// Only expand to word boundary if we didn't expand to a link.
			expandToWordBoundary( docSelection, range );
		}

		// Create highlight overlay.
		const highlight = iframeDocument.createElement( 'div' );
		highlight.className = 'parsely-traffic-boost-highlight';

		// Create popover container.
		const popoverContainer = iframeDocument.createElement( 'div' );
		popoverContainer.className = 'parsely-traffic-boost-popover-container';
		highlight.appendChild( popoverContainer );

		// Create popover content.
		const root = createRoot( popoverContainer );
		root.render(
			<TextSelectionPopover
				iframeDocument={ iframeDocument }
				selection={ docSelection }
				onErrorClick={ () => {
					popoverContainer.classList.add( 'closing' );
					docSelection.removeAllRanges();

					// Wait for animation to complete before cleanup.
					setTimeout( () => {
						cleanup();
					}, 200 );
				} }
				onSelect={ () => {
					popoverContainer.classList.add( 'closing' );

					const offset = calculateOffset( iframeDocument, docSelection, contentArea );
					onTextSelected( docSelection.toString().trim(), offset );
					docSelection.removeAllRanges();

					// Wait for animation to complete before cleanup.
					setTimeout( () => {
						cleanup();
					}, 200 );
				} }
			/>
		);

		/**
		 * Updates the position of the highlight.
		 *
		 * @since 3.19.0
		 */
		const updatePosition = () => {
			const rect = range.getBoundingClientRect();
			const scrollY = iframeDocument.defaultView?.scrollY ?? 0;

			highlight.style.top = `${ rect.top + scrollY }px`;
			highlight.style.left = `${ rect.left }px`;
			highlight.style.width = `${ rect.width }px`;
			highlight.style.height = `${ rect.height }px`;
		};

		updatePosition();
		contentArea.appendChild( highlight );

		// Add scroll event listener.
		const scrollHandler = () => {
			requestAnimationFrame( updatePosition );
		};

		iframeDocument.addEventListener( 'scroll', scrollHandler, { passive: true } );
		window.addEventListener( 'scroll', scrollHandler, { passive: true } );

		/**
		 * Cleans up the highlight and event listeners.
		 *
		 * @since 3.19.0
		 */
		const cleanup = () => {
			iframeDocument.removeEventListener( 'scroll', scrollHandler );
			window.removeEventListener( 'scroll', scrollHandler );
			root.unmount();
			highlight.remove();
		};
	}, [ iframeRef, onTextSelected ] );

	/**
	 * Injects styles and adds event listeners when the component mounts.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		const iframeDocument = iframeRef.current?.contentDocument;
		if ( ! iframeDocument ) {
			return;
		}

		// Add selection event listener.
		const handleSelectionChange = debounce( () => {
			handleSelection();
		}, 300, {
			leading: true,
			trailing: true,
		} );

		iframeDocument.addEventListener( 'selectionchange', handleSelectionChange );

		return () => {
			iframeDocument.removeEventListener( 'selectionchange', handleSelectionChange );
		};
	}, [ handleSelection, iframeRef ] );

	return null;
};

/**
 * Traverses the DOM tree to find the next node in document order.
 *
 * @since 3.19.0
 *
 * @param {Node}    node         The current node to start traversal from.
 * @param {boolean} skipChildren Whether to skip the current node's children and move to its next sibling.
 * @param {Node}    endNode      The node at which to stop traversal. If reached, returns null.
 *
 * @return {Node|null} The next node in document order, or null if no next node exists
 *                     or if the endNode is reached.
 */
const getNextNode = function( node: Node, skipChildren: boolean, endNode: Node ): Node | null {
	if ( endNode === node ) {
		return null;
	}

	if ( node.firstChild && ! skipChildren ) {
		return node.firstChild;
	}

	if ( ! node.parentNode ) {
		return null;
	}

	return node.nextSibling ? node.nextSibling : getNextNode( node.parentNode, true, endNode );
};
