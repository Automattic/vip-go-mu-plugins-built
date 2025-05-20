/**
 * WordPress imports
 */
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal imports
 */
import { escapeRegExp } from '../../../../../common/utils/functions';
import { TrafficBoostLink } from '../../provider';
import { LinkType } from '../components/link-counter';
import { TextSelection } from '../preview';

/**
 * Props for the useIframeHighlight hook.
 *
 * @since 3.19.0
 */
interface UseIframeHighlightProps {
	iframeRef: React.RefObject<HTMLIFrameElement>;
	contentAreaRef: React.MutableRefObject<Element | null>;
	activeLink?: TrafficBoostLink | null;
	selectedText?: TextSelection | null;
	isInboundLink: boolean;
	onRestoreOriginal: () => void;
}

/**
 * Custom hook for handling iframe highlighting functionality.
 *
 * @since 3.19.0
 *
 * @param {UseIframeHighlightProps} props The component's props.
 *
 * @return {Object} An object containing the highlight functions.
 */
export const useIframeHighlight = ( {
	iframeRef,
	contentAreaRef,
	activeLink,
	selectedText,
	isInboundLink,
	onRestoreOriginal,
}: UseIframeHighlightProps ) => {
	/**
	 * Injects highlight styles into the iframe.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe The iframe element to inject styles into.
	 */
	const injectHighlightStyles = useCallback( ( iframe: HTMLIFrameElement ) => {
		const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
		if ( ! iframeDocument ) {
			return;
		}

		const style = iframeDocument.createElement( 'style' );
		style.textContent = `
			/** Smart link highlight styles. */
			.smart-link-highlight {
				outline: 2px solid #3858E9;
				border-radius: 2px;
				background-color: #3858E9;
				color: #ffffff;
			}

			.smart-link-highlight *:hover,
			.smart-link-highlight *:focus {
				color: #ffffff;
				text-decoration: revert;
			}

			.smart-link-highlight * {
				color: #ffffff;
			}

			.smart-link-highlight.previous-suggestion {
				outline: 2px solid rgba(56, 88, 233, 0.2);
				background-color: rgba(56, 88, 233, 0.2);
				text-decoration: line-through;
				color: inherit;
			}

			.smart-link-highlight.previous-suggestion * {
				color: inherit;
			}

			/** Link type highlight styles. */
			.link-type-highlight {
				border-radius: 2px;
				background-color: transparent;
				outline: 0 solid transparent;
				animation: highlight-fade-in 0.2s ease-in-out forwards;
				outline-width: 0;
			}

			.link-type-highlight * {
				color: white !important;
				mix-blend-mode: difference;
			}

			.link-type-highlight.removing {
				animation: highlight-fade-out 0.2s ease-in-out forwards;
			}

			.link-type-highlight a {
				text-decoration: underline;
				text-decoration-color: currentColor;
				transition: all 0.2s ease-in-out;
			}

			.link-type-highlight:not(.removing) a {
				text-decoration-color: transparent;
			}

			@keyframes highlight-fade-in {
				0% {
					outline-width: 0;
					outline-color: transparent;
					background-color: transparent;
				}
				1% {
					outline-width: 2px;
					outline-color: transparent;
					background-color: transparent;
				}
				100% {
					outline-width: 2px;
					outline-color: currentColor;
					background-color: currentColor;
				}
			}

			@keyframes highlight-fade-out {
				0% {
					outline-width: 2px;
					outline-color: currentColor;
					background-color: currentColor;
				}
				99% {
					outline-width: 2px;
					outline-color: transparent;
					background-color: transparent;
					color: inherit;
				}
				100% {
					outline-width: 0;
					outline-color: transparent;
					background-color: transparent;
					color: inherit;
				}
			}
		`;
		iframeDocument.head.appendChild( style );
	}, [] );

	/**
	 * Finds all ranges containing the text.
	 *
	 * @since 3.19.0
	 *
	 * @param {string}   searchText The text to search for.
	 * @param {Node}     rootNode   The root node to search within.
	 * @param {Document} doc        The document to create ranges with.
	 *
	 * @return {Range[]} An array of ranges containing the text.
	 */
	const findText = useCallback( ( searchText: string, rootNode: Node, doc: Document ): Range[] => {
		const ranges: Range[] = [];
		const treeWalker = doc.createTreeWalker(
			rootNode,
			NodeFilter.SHOW_TEXT,
			null
		);

		let node = treeWalker.nextNode() as Text;
		let fullText = '';
		const nodePositions: {
			node: Text;
			start: number;
			end: number;
			blockParent: Element | null;
		}[] = [];

		// Build full text and track node positions.
		while ( node ) {
			const nodeText = node.textContent ?? '';

			// Find the closest block-level parent.
			const blockParent = node.parentElement?.closest(
				'article, aside, blockquote, details, dialog, dd, div, dl, dt, ' +
				'fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, ' +
				'header, hgroup, hr, li, main, nav, ol, p, pre, section, table, ul'
			);

			nodePositions.push( {
				node,
				start: fullText.length,
				end: fullText.length + nodeText.length,
				blockParent: blockParent ?? null,
			} );
			fullText += nodeText;
			node = treeWalker.nextNode() as Text;
		}

		// Find all matches in the full text.
		let match;
		const regex = new RegExp( escapeRegExp( searchText ), 'g' );
		while ( ( match = regex.exec( fullText ) ) !== null ) {
			const matchStart = match.index;
			const matchEnd = matchStart + searchText.length;

			// Find nodes that contain the match.
			const startNode = nodePositions.find(
				( pos ) => matchStart >= pos.start && matchStart < pos.end
			);
			const endNode = nodePositions.find(
				( pos ) => matchEnd > pos.start && matchEnd <= pos.end
			);

			if ( startNode && endNode ) {
				// Check if both nodes are within the same block-level element.
				if ( startNode.blockParent &&
					endNode.blockParent &&
					startNode.blockParent === endNode.blockParent
				) {
					const range = doc.createRange();
					range.setStart(
						startNode.node,
						matchStart - startNode.start
					);
					range.setEnd(
						endNode.node,
						matchEnd - endNode.start
					);
					ranges.push( range );
				}
			}
		}

		return ranges;
	}, [] );

	/**
	 * Highlights a range with a specified class.
	 *
	 * @since 3.19.0
	 *
	 * @param {Range}   range          The range to highlight.
	 * @param {string}  className      The class name to apply to the highlight span.
	 * @param {string}  highlightLabel The label to display with the highlight for screen readers.
	 * @param {boolean} isPrevious     Whether this is a previous suggestion (optional).
	 *
	 * @return {Element|undefined} The highlight span element.
	 */
	const highlightRange = useCallback(
		( range: Range, className: string, highlightLabel: string, isPrevious: boolean = false ): Element | undefined => {
			try {
				const iframeDocument = iframeRef.current?.contentDocument ?? iframeRef.current?.contentWindow?.document;
				if ( ! iframeDocument ) {
					return;
				}

				const fragment = range.cloneContents();
				const highlightSpan = iframeDocument.createElement( 'span' );
				highlightSpan.className = isPrevious
					? `${ className } previous-suggestion`
					: className;

				// Add ARIA attributes for accessibility.
				highlightSpan.setAttribute( 'aria-label', highlightLabel );
				highlightSpan.setAttribute( 'role', 'mark' );

				if ( isPrevious ) {
					highlightSpan.setAttribute( 'aria-roledescription', __( 'Previous suggestion', 'wp-parsely' ) );
				}

				// Find if the range is within a link and if it encompasses the entire link text.
				const container = range.commonAncestorContainer as Element;
				const linkNode = container.nodeType === Node.ELEMENT_NODE
					? container.closest( 'a' )
					: container.parentElement?.closest( 'a' );

				const isFullLinkSelected = linkNode && range.toString().trim() === linkNode.textContent?.trim();

				if ( isFullLinkSelected && linkNode ) {
					// Create a new span and insert it before the link.
					linkNode.parentNode?.insertBefore( highlightSpan, linkNode );

					// Move the link into the span.
					highlightSpan.appendChild( linkNode );
				} else {
					// Normal case - no links or partial link selection.
					range.deleteContents();
					highlightSpan.appendChild( fragment );
					range.insertNode( highlightSpan );
				}

				return highlightSpan;
			} catch ( e ) {
				// eslint-disable-next-line no-console
				console.error( 'WP Parsely: Error highlighting range', e );
			}
		}, [ iframeRef ] );

	/**
	 * Removes highlight spans from the iframe content.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe        The iframe element to remove highlights from.
	 * @param {string}            querySelector The query selector to find highlight elements.
	 * @param {boolean}           animate       Whether to animate the removal of highlights.
	 */
	const removeHighlights = useCallback( ( iframe: HTMLIFrameElement, querySelector: string, animate = false ) => {
		try {
			const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
			if ( ! iframeDocument ) {
				return;
			}

			/**
			 * Removes a highlight and cleans up the parent node.
			 *
			 * @since 3.19.0
			 *
			 * @param {Element}    highlight The highlight element to remove.
			 * @param {ParentNode} parent    The parent node of the highlight.
			 */
			const removeAndClean = ( highlight: Element, parent: ParentNode ) => {
				// Create a document fragment to temporarily hold the children.
				const fragment = iframeDocument.createDocumentFragment();

				// Move all child nodes to the fragment.
				while ( highlight.firstChild ) {
					fragment.appendChild( highlight.firstChild );
				}

				// Insert the fragment before the highlight span.
				parent.insertBefore( fragment, highlight );
				parent.removeChild( highlight );
				parent.normalize();

				// Remove any anchors without text in the parent node.
				const anchors = Array.from( parent.querySelectorAll( 'a' ) );
				anchors.forEach( ( anchor ) => {
					if ( ! anchor.textContent?.trim() ) {
						parent.removeChild( anchor );
						return;
					}

					// Check if the adjacent anchor has the same href or smartlink attribute.
					const nextAnchor = anchor.nextElementSibling as HTMLAnchorElement;
					if ( nextAnchor && nextAnchor.tagName === 'A' && (
						anchor.href === nextAnchor.href ||
						( anchor.getAttribute( 'data-smartlink' ) === nextAnchor.getAttribute( 'data-smartlink' ) &&
						anchor.getAttribute( 'data-smartlink' ) !== null )
					) ) {
						// Instead of merging, keep them separate.
						// Just ensure there's a space between them if needed.
						if ( ! anchor.nextSibling || anchor.nextSibling.nodeType !== Node.TEXT_NODE ) {
							anchor.parentNode?.insertBefore( iframeDocument.createTextNode( ' ' ), nextAnchor );
						}
					}
				} );
			};

			/**
			 * Recursively unwraps nested highlights.
			 *
			 * @since 3.19.0
			 *
			 * @param {Element} highlight The highlight element to unwrap.
			 */
			const unwrapHighlight = ( highlight: Element ) => {
				// First, recursively process any nested highlights.
				const nestedHighlights = highlight.querySelectorAll( querySelector );
				nestedHighlights.forEach( ( nested ) => unwrapHighlight( nested ) );

				const parent = highlight.parentNode;
				if ( ! parent ) {
					return;
				}

				if ( animate ) {
					highlight.classList.add( 'removing' );

					setTimeout( () => {
						removeAndClean( highlight, parent );
					}, 200 );
				} else {
					removeAndClean( highlight, parent );
				}
			};

			// Get all top-level highlights.
			const highlights = iframeDocument.querySelectorAll( querySelector );
			highlights.forEach( ( highlight ) => {
				// Only process top-level highlights (those that aren't nested
				// inside another highlight).
				if ( ! highlight.parentElement?.closest( querySelector ) ) {
					unwrapHighlight( highlight );
				}
			} );
		} catch ( error ) {
			// Silently fail if there's an error removing highlights.
		}
	}, [] );

	/**
	 * Removes the smart link highlights from the iframe content.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe The iframe element to remove highlights from.
	 */
	const removeSmartLinkHighlights = useCallback( ( iframe: HTMLIFrameElement ) => {
		removeHighlights( iframe, '.smart-link-highlight' );
	}, [ removeHighlights ] );

	/**
	 * Highlights the selection range and the original range.
	 *
	 * @since 3.19.0
	 *
	 * @param {Range}  selectionRange The range of the selected text.
	 * @param {Range}  originalRange  The range of the original text.
	 * @param {string} className      The class name to apply to the highlight span.
	 */
	const highlightSelection = useCallback( ( selectionRange: Range, originalRange: Range, className: string ) => {
		// Check if the selection range overlaps with the original range.
		const doRangesOverlap = ! (
			selectionRange.compareBoundaryPoints( Range.END_TO_START, originalRange ) > 0 ||
			selectionRange.compareBoundaryPoints( Range.START_TO_END, originalRange ) < 0
		);

		let selectionHighlight: Element | undefined;
		const highlightLabel = __( 'Suggested link', 'wp-parsely' );

		// If the ranges overlap, highlight the original suggestion text before
		// and/or after the selected text.
		if ( doRangesOverlap ) {
			// If the original range starts before the selection range.
			if ( originalRange.compareBoundaryPoints( Range.START_TO_START, selectionRange ) < 0 ) {
				const beforeRange = originalRange.cloneRange();
				beforeRange.setEnd( selectionRange.startContainer, selectionRange.startOffset );
				highlightRange( beforeRange, className, highlightLabel, true );

				// Adjust the selection range to start after the before range.
				selectionRange.setStart( beforeRange.endContainer, beforeRange.endOffset );
			}

			// If the original range ends after the selection range.
			if ( originalRange.compareBoundaryPoints( Range.END_TO_END, selectionRange ) > 0 ) {
				const afterRange = originalRange.cloneRange();
				afterRange.setStart( selectionRange.endContainer, selectionRange.endOffset );
				highlightRange( afterRange, className, highlightLabel, true );
			}

			// Highlight the selection range.
			selectionHighlight = highlightRange( selectionRange, className, highlightLabel );
		} else {
			// Handle non-overlapping ranges.
			highlightRange( originalRange, className, highlightLabel, true );
			selectionHighlight = highlightRange( selectionRange, className, highlightLabel );
		}

		return selectionHighlight;
	}, [ highlightRange ] );

	/**
	 * Highlights a link suggestion in the iframe content.
	 *
	 * @since 3.19.0
	 *
	 * @param {Document} iframeDocument The iframe document.
	 * @param {string}   suggestionText The suggestion text to highlight.
	 * @param {number}   offset         The offset of the suggestion text.
	 */
	const highlightLinkSuggestion = useCallback( ( iframeDocument: Document, suggestionText: string, offset: number = 0 ) => {
		if ( ! contentAreaRef.current ) {
			return;
		}

		// Get the original suggestion text range.
		const originalRanges = findText( suggestionText, contentAreaRef.current, iframeDocument );
		const originalRange = originalRanges[ offset ];
		if ( ! originalRange ) {
			return;
		}

		// If there's no selected text, highlight the original suggestion text.
		if ( ! selectedText?.text ) {
			highlightRange( originalRange, 'smart-link-highlight', __( 'Suggested link', 'wp-parsely' ) );
			return;
		}

		// If there's selected text, get its range and handle potential overlap.
		const selectionRanges = findText( selectedText.text, contentAreaRef.current, iframeDocument );
		const selectionRange = selectionRanges[ selectedText.offset ];
		if ( selectionRange ) {
			const selectionHighlight = highlightSelection( selectionRange, originalRange, 'smart-link-highlight' );
			if ( selectionHighlight ) {
				// Add cursor pointer to the selection highlight.
				( selectionHighlight as HTMLElement ).style.cursor = 'pointer';

				// When clicking the selection highlight, remove the highlights.
				selectionHighlight.addEventListener( 'click', () => {
					onRestoreOriginal();
				} );
			}
		}
	}, [ contentAreaRef, findText, highlightSelection, highlightRange, selectedText, onRestoreOriginal ] );

	/**
	 * Highlights an inbound link in the iframe content.
	 *
	 * @since 3.19.0
	 *
	 * @param {Document} iframeDocument The iframe document.
	 * @param {string}   smartLinkId    The smart link ID to highlight.
	 */
	const highlightInboundLink = useCallback( ( iframeDocument: Document, smartLinkId: string ) => {
		// Find the a element with the smart link id.
		const aElement = iframeDocument.querySelector( `a[data-smartlink="${ smartLinkId }"]` );

		if ( aElement ) {
			const originalRange = iframeDocument.createRange();
			originalRange.selectNode( aElement );

			// If there's selected text, handle potential overlap.
			if ( selectedText?.text && contentAreaRef.current ) {
				const selectionRanges = findText( selectedText.text, contentAreaRef.current, iframeDocument );
				if ( selectionRanges[ selectedText.offset ] ) {
					const selectionRange = selectionRanges[ selectedText.offset ];
					highlightSelection( selectionRange, originalRange, 'smart-link-highlight' );
					return;
				}
			}

			// If no selected text or selection range not found, just highlight the link.
			highlightRange( originalRange, 'smart-link-highlight', __( 'Inbound link', 'wp-parsely' ), !! selectedText );
		} else if ( activeLink?.smartLink?.text ) {
			// If we can't find the link with the smart link id, highlight the link with the smart link text.
			highlightLinkSuggestion( iframeDocument, activeLink.smartLink.text, activeLink.smartLink.offset ?? 0 );
		}
	}, [ activeLink, selectedText, contentAreaRef, highlightRange, findText, highlightSelection, highlightLinkSuggestion ] );

	/**
	 * Highlights the smart link text in the iframe content.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe The iframe element to highlight the smart link in.
	 */
	const highlightSmartLink = useCallback( ( iframe: HTMLIFrameElement ) => {
		try {
			const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
			if ( ! iframeDocument || ! activeLink?.smartLink?.text ) {
				return;
			}

			// Handle inbound links and suggestions differently.
			if ( isInboundLink ) {
				highlightInboundLink( iframeDocument, activeLink.smartLink.uid );
			} else {
				highlightLinkSuggestion( iframeDocument, activeLink.smartLink.text, activeLink.smartLink.offset ?? 0 );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'WP Parsely: Error highlighting Smart Link text', error );
		}
	}, [ activeLink, highlightInboundLink, highlightLinkSuggestion, isInboundLink ] );

	/**
	 * Highlights the links of the selected link type in the iframe.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe           The iframe element to highlight the links in.
	 * @param {string}            selectedLinkType The selected link type to highlight.
	 */
	const highlightLinkType = useCallback( ( iframe: HTMLIFrameElement, selectedLinkType: LinkType | null ) => {
		const contentArea = contentAreaRef.current;
		const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
		if ( ! contentArea || ! iframeDocument ) {
			return;
		}

		// Remove any existing highlights.
		removeHighlights( iframe, '.link-type-highlight', true );

		if ( ! activeLink || ! selectedLinkType ) {
			return;
		}

		const siteUrl = new URL( activeLink.targetPost.link ).hostname;
		let links: HTMLAnchorElement[] = Array.from( contentArea.querySelectorAll<HTMLAnchorElement>( 'a' ) );

		// Filter out links that don't have text.
		links = links.filter( ( link ) => link.textContent?.trim() !== '' );
		let linkLabel = __( 'Highlighted link', 'wp-parsely' );

		switch ( selectedLinkType ) {
			case 'external':
				links = links.filter( ( link ) => ! link.href.includes( siteUrl ) );
				linkLabel = __( 'External link', 'wp-parsely' );
				break;
			case 'internal':
				links = links.filter( ( link ) => link.href.includes( siteUrl ) );
				linkLabel = __( 'Internal link', 'wp-parsely' );
				break;
			case 'smart':
				links = links.filter( ( link ) => link.hasAttribute( 'data-smartlink' ) );
				linkLabel = __( 'Smart Link', 'wp-parsely' );
				break;
		}

		if ( ! links?.length ) {
			return;
		}

		links.forEach( ( link ) => {
			const selectionRange = iframeDocument.createRange();
			selectionRange.selectNode( link );
			highlightRange( selectionRange, 'link-type-highlight', linkLabel );
		} );
	}, [ activeLink, contentAreaRef, highlightRange, removeHighlights ] );

	return {
		injectHighlightStyles,
		highlightSmartLink,
		highlightLinkType,
		removeSmartLinkHighlights,
		removeHighlights,
	};
};
