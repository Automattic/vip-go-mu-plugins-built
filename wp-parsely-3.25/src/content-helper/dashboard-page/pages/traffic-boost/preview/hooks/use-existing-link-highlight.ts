/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TrafficBoostLink } from '../../provider';
import { LinkType } from '../components/link-counter';
import { useWordpressComponentStyles } from './use-wordpress-component-styles';

/**
 * Props for the useIframeHighlight hook.
 *
 * @since 3.20.1
 */
interface UseExistingLinkHighlightProps {
	iframeRef: React.RefObject<HTMLIFrameElement>;
	contentAreaRef: React.MutableRefObject<Element | null>;
	activeLink?: TrafficBoostLink | null;
}

/**
 * Custom hook for handling existing link highlighting functionality.
 *
 * @since 3.20.1
 *
 * @param {UseExistingLinkHighlightProps} props The component's props.
 *
 * @return {Object} An object containing the highlight functions.
 */
export const useExistingLinkHighlight = ( {
	iframeRef,
	contentAreaRef,
	activeLink,
}: UseExistingLinkHighlightProps ) => {
	const { injectWordpressComponentStyles } = useWordpressComponentStyles();

	/**
	 * Injects highlight styles into the iframe.
	 *
	 * @since 3.20.1
	 *
	 * @param {HTMLIFrameElement} iframe The iframe element to inject styles into.
	 */
	const injectExistingLinkHighlightStyles = useCallback( ( iframe: HTMLIFrameElement ) => {
		const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
		if ( ! iframeDocument ) {
			return;
		}

		injectWordpressComponentStyles( iframeDocument );

		const style = iframeDocument.createElement( 'style' );
		style.textContent = `
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
	}, [ injectWordpressComponentStyles ] );

	/**
	 * Highlights a range with a specified class.
	 *
	 * @since 3.20.1
	 *
	 * @param {Range}  range          The range to highlight.
	 * @param {string} className      The class name to apply to the highlight span.
	 * @param {string} highlightLabel The label to display with the highlight for screen readers.
	 *
	 * @return {Element|undefined} The highlight span element.
	 */
	const highlightExistingLinkRange = useCallback(
		( range: Range, className: string, highlightLabel: string ): Element | undefined => {
			try {
				const iframeDocument = iframeRef.current?.contentDocument ?? iframeRef.current?.contentWindow?.document;
				if ( ! iframeDocument ) {
					return;
				}

				const fragment = range.cloneContents();
				const highlightSpan = iframeDocument.createElement( 'span' );
				highlightSpan.className = className;

				// Add ARIA attributes for accessibility.
				highlightSpan.setAttribute( 'aria-label', highlightLabel );
				highlightSpan.setAttribute( 'role', 'mark' );

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
	 * @since 3.20.1
	 *
	 * @param {HTMLIFrameElement} iframe        The iframe element to remove highlights from.
	 * @param {string}            querySelector The query selector to find highlight elements.
	 * @param {boolean}           animate       Whether to animate the removal of highlights.
	 */
	const removeExistingLinkHighlights = useCallback( ( iframe: HTMLIFrameElement, querySelector: string, animate = false ) => {
		try {
			const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
			if ( ! iframeDocument ) {
				return;
			}

			/**
			 * Removes a highlight.
			 *
			 * @since 3.20.1
			 *
			 * @param {Element}    highlight The highlight element to remove.
			 * @param {ParentNode} parent    The parent node of the container, e.g. a <p> tag.
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
			 * @since 3.20.1
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
			console.error( 'WP Parsely: Error removing highlights:', error ); // eslint-disable-line no-console
		}
	}, [] );

	/**
	 * Highlights the links of the selected link type in the iframe.
	 *
	 * @since 3.20.1
	 *
	 * @param {HTMLIFrameElement} iframe           The iframe element to highlight the links in.
	 * @param {string}            selectedLinkType The selected link type to highlight.
	 */
	const highlightExistingLinkType = useCallback( ( iframe: HTMLIFrameElement, selectedLinkType: LinkType | null ) => {
		const contentArea = contentAreaRef.current;
		const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
		if ( ! contentArea || ! iframeDocument ) {
			return;
		}

		// Remove any existing highlights.
		removeExistingLinkHighlights( iframe, '.link-type-highlight', true );

		if ( ! activeLink || ! selectedLinkType ) {
			return;
		}

		const siteUrl = new URL( activeLink.targetPost.link ).hostname;
		let links: HTMLAnchorElement[] = Array.from( contentArea.querySelectorAll<HTMLAnchorElement>( 'a' ) );

		// Filter out links that don't have text.
		links = links.filter( ( link ) => link.textContent?.trim() !== '' );
		let linkLabel: string = __( 'Highlighted link', 'wp-parsely' );

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
			highlightExistingLinkRange( selectionRange, 'link-type-highlight', linkLabel );
		} );
	}, [ activeLink, contentAreaRef, highlightExistingLinkRange, removeExistingLinkHighlights ] );

	return {
		injectExistingLinkHighlightStyles,
		highlightExistingLinkType,
	};
};
