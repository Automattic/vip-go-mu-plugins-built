/**
 * WordPress imports
 */
import { Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal imports
 */
import { usePrevious } from '@wordpress/compose';
import { Loading } from '../../../../../common/components/loading';
import { ErrorIcon } from '../../../../../common/icons/error-icon';
import { TRAFFIC_BOOST_LOADING_MESSAGES, TrafficBoostLink } from '../../provider';
import { TrafficBoostStore } from '../../store';
import { useIframeHighlight } from '../hooks/use-iframe-highlight';
import { TextSelection } from '../preview';
import { getContentArea, isExternalURL } from '../utils';
import { TextSelectionTooltip } from './text-selection-tooltip';

/**
 * Props structure for PreviewIframe.
 *
 * @since 3.19.0
 */
interface PreviewIframeProps {
	activeLink?: TrafficBoostLink | null;
	selectedText?: TextSelection | null;
	previewUrl: string;
	isLoading: boolean;
	onTextSelected: ( text: string, offset: number ) => void;
	isFrontendPreview: boolean;
	onLoadingChange: ( isLoading: boolean ) => void;
	onRestoreOriginal: () => void;
}

/**
 * Preview iframe component for the Traffic Boost feature.
 * Displays preview iframe for a selected post.
 *
 * @since 3.19.0
 *
 * @param {PreviewIframeProps} props The component's props.
 */
export const PreviewIframe = ( {
	previewUrl,
	isLoading,
	onTextSelected,
	isFrontendPreview,
	activeLink,
	selectedText,
	onLoadingChange,
	onRestoreOriginal,
}: PreviewIframeProps ): React.JSX.Element => {
	const contentAreaRef = useRef<Element | null>( null );

	const iframeRef = useRef<HTMLIFrameElement>( null );
	const isInboundLink = ! activeLink?.isSuggestion;

	const { selectedLinkType, isGenerating } = useSelect( ( select ) => ( {
		selectedLinkType: select( TrafficBoostStore ).getPreviewLinkType(),
		isGenerating: activeLink ? select( TrafficBoostStore ).isGenerating( activeLink ) : false,
	} ), [ activeLink ] );

	const previousIsGenerating = usePrevious( isGenerating );

	/**
	 * Adds a random UUID to the iframe src. This triggers the WordPress Customizer to load
	 * and prevents potential undesired scripts from being loaded.
	 *
	 * @since 3.19.0
	 */
	const iFrameSrc = useMemo( () => {
		if ( ! previewUrl ) {
			return previewUrl;
		}

		const url = new URL( previewUrl );
		url.searchParams.set( 'customize_changeset_uuid', crypto.randomUUID() );

		return url.toString();
	}, [ previewUrl ] );

	/**
	 * Highlights the smart link in the iframe.
	 *
	 * @since 3.19.0
	 */
	const {
		injectHighlightStyles,
		highlightSmartLink,
		highlightLinkType,
		removeSmartLinkHighlights,
	} = useIframeHighlight( {
		iframeRef,
		contentAreaRef,
		activeLink,
		selectedText,
		isInboundLink,
		onRestoreOriginal,
	} );

	/**
	 * Hides the admin bar from the iframe if the preview is in frontend mode.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe The iframe element to hide the admin bar in.
	 */
	const hideAdminBar = useCallback( ( iframe: HTMLIFrameElement ) => {
		if ( ! isFrontendPreview ) {
			return;
		}

		const adminBar = iframe.contentWindow?.document.getElementById( 'wpadminbar' );
		if ( adminBar ) {
			adminBar.style.display = 'none';
		}

		const html = iframe.contentWindow?.document.documentElement;
		if ( html ) {
			html.style.setProperty( 'margin-top', '0', 'important' );
		}
	}, [ isFrontendPreview ] );

	/**
	 * Disables all navigation within the iframe.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe The iframe element to disable navigation in.
	 */
	const disableNavigation = useCallback( ( iframe: HTMLIFrameElement ) => {
		const iframeDocument = iframe?.contentDocument ?? iframe.contentWindow?.document;
		if ( ! iframeDocument ) {
			return;
		}

		// Prevent clicks on all links and handle link selection.
		iframeDocument.addEventListener( 'click', ( event ) => {
			const target = event.target as HTMLElement;

			// If the link is outside the content area, don't handle it.
			if ( ! contentAreaRef.current?.contains( target ) ) {
				event.preventDefault();
				event.stopPropagation();
				return;
			}

			const link = target.tagName === 'A' ? target : target.closest( 'a' );
			if ( link ) {
				event.preventDefault();
				event.stopPropagation();

				// If the parent is not a paragraph or an anchor, skip.
				const allowedParentTagNamesToBeClicked = [ 'P', 'A' ];
				if ( ! allowedParentTagNamesToBeClicked.includes( target.parentElement?.tagName ?? '' ) ) {
					return;
				}

				// Remove focus from the link.
				link.blur();

				// Select the link text so it can be highlighted.
				link.ownerDocument.defaultView?.getSelection()?.selectAllChildren( link );
			}
		}, true );

		// Disable form submissions.
		iframeDocument.addEventListener( 'submit', ( event ) => {
			event.preventDefault();
			event.stopPropagation();
		}, true );

		// Override window.open.
		if ( iframe.contentWindow ) {
			Object.defineProperty( iframe.contentWindow, 'open', {
				value: () => null,
				writable: false,
			} );
		}

		// Disable right click.
		iframeDocument.addEventListener( 'contextmenu', ( event ) => {
			event.preventDefault();
			event.stopPropagation();
		}, true );

		try {
			// Attempt to disable history navigation.
			if ( iframe.contentWindow?.history ) {
				iframe.contentWindow.history.pushState = () => undefined;
				iframe.contentWindow.history.replaceState = () => undefined;
			}
		} catch ( error ) {
			// Silently fail if we can't override history methods.
		}

		// Prevent navigation via history.
		iframe.contentWindow?.addEventListener( 'popstate', ( event ) => {
			event.preventDefault();
			event.stopPropagation();
		}, true );
	}, [ contentAreaRef ] );

	/**
	 * Jumps to the smart link text in the iframe.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe The iframe element containing the smart link to scroll to.
	 */
	const jumpToSmartLink = useCallback( ( iframe: HTMLIFrameElement ) => {
		const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document;
		if ( ! iframeDocument ) {
			return;
		}

		const scrollToHighlightedElement = async () => {
			const highlightedElement = iframeDocument.querySelector( '.smart-link-highlight:not(.previous-suggestion)' );
			if ( highlightedElement ) {
				// Wait 100ms to ensure the highlighted element is visible.
				await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );

				highlightedElement.scrollIntoView( {
					behavior: 'smooth',
					block: 'center',
				} );
			}
		};

		// The highlighted element might not be visible immediately after the iframe loads, due to
		// the iframe content not being fully loaded yet (e.g. a custom block still being loaded).
		// So we use a MutationObserver to watch for DOM changes and scroll to the highlighted
		// element once it's visible.
		const watchForHighlightedElement = () => {
			const highlightedElement = iframeDocument.querySelector( '.smart-link-highlight:not(.previous-suggestion)' );
			if ( highlightedElement ) {
				scrollToHighlightedElement();
			}
		};

		const observer = new MutationObserver( watchForHighlightedElement );
		const contentArea = getContentArea( iframeDocument );

		if ( contentArea ) {
			observer.observe( contentArea, {
				childList: true,
				subtree: true,
			} );

			// Try to scroll to the highlighted element immediately.
			scrollToHighlightedElement();

			// Disconnect the observer after a short delay to prevent infinite observation.
			setTimeout( () => observer.disconnect(), 1000 );
		}
	}, [] );

	/**
	 * Handles the iframe load event.
	 *
	 * @since 3.19.0
	 *
	 * @param {HTMLIFrameElement} iframe The iframe element to handle the load event for.
	 */
	const handleIframeLoad = useCallback( ( iframe: HTMLIFrameElement ) => {
		if ( ! iframe?.contentDocument ) {
			return;
		}

		injectHighlightStyles( iframe );

		// Updates the content area ref to the iframe's content area.
		const contentArea = getContentArea( iframe.contentDocument );
		if ( contentArea ) {
			contentAreaRef.current = contentArea;
		}

		hideAdminBar( iframe );
		highlightLinkType( iframe, selectedLinkType );
		disableNavigation( iframe );

		onLoadingChange( false );
		jumpToSmartLink( iframe );
	}, [ contentAreaRef,
		disableNavigation,
		hideAdminBar,
		highlightLinkType,
		injectHighlightStyles,
		jumpToSmartLink,
		onLoadingChange,
		selectedLinkType,
	] );

	/**
	 * Handles iframe initialization and cleanup.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		// If we're generating placement, don't try to set up the iframe yet.
		if ( isGenerating ) {
			return;
		}

		const iframe = iframeRef.current;
		if ( ! iframe ) {
			return;
		}

		/**
		 * Handles the iframe load event.
		 *
		 * @since 3.19.0
		 */
		const handleLoadCallback = () => {
			handleIframeLoad( iframe );
		};

		// Only set loading state if the URL has changed.
		if ( iframe.src !== iFrameSrc ) {
			onLoadingChange( true );
		}

		iframe.addEventListener( 'load', handleLoadCallback );

		return () => {
			iframe.removeEventListener( 'load', handleLoadCallback );
		};
	}, [ isGenerating, iFrameSrc, handleIframeLoad, onLoadingChange ] );

	/**
	 * Resets content area ref when active link changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		contentAreaRef.current = null;
	}, [ activeLink, contentAreaRef ] );

	/**
	 * Re-highlights smart link when selection changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		const iframe = iframeRef.current;
		if ( ! iframe?.contentDocument || contentAreaRef.current === null || isLoading ) {
			return;
		}

		removeSmartLinkHighlights( iframe );
		highlightSmartLink( iframe );
		jumpToSmartLink( iframe );
	}, [ contentAreaRef, highlightSmartLink, isLoading, jumpToSmartLink, removeSmartLinkHighlights, selectedText ] );

	/**
	 * Highlights the link type in the iframe.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		const iframe = iframeRef.current;
		if ( ! iframe?.contentDocument || contentAreaRef.current === null || isLoading ) {
			return;
		}

		highlightLinkType( iframe, selectedLinkType );
	}, [ contentAreaRef, highlightLinkType, isLoading, selectedLinkType ] );

	return (
		<div className="wp-parsely-preview">
			<div className="preview-iframe-wrapper">
				<div className={ `wp-parsely-preview-loading ${ isLoading ? 'is-loading' : '' }` }>
					{ isFrontendPreview && activeLink && isExternalURL( activeLink ) ? (
						<>
							<ErrorIcon />
							{ __( 'This link is not available in the preview.', 'wp-parsely' ) }
						</>
					) : (
						<>
							{ isLoading && (
								<>
									<Spinner />
									{ ( isGenerating || previousIsGenerating ) && (
										<>
											<Loading
												showSpinner={ false }
												messages={ TRAFFIC_BOOST_LOADING_MESSAGES }
												typewriter={ true }
												randomOrder={ false }
											/>
										</>
									) }
								</>
							) }
						</>
					) }
				</div>

				{ activeLink && ! isGenerating && ( ! isFrontendPreview || ! isExternalURL( activeLink ) ) && (
					<>
						<iframe
							ref={ iframeRef }
							src={ iFrameSrc }
							title={ __( 'Post Preview', 'wp-parsely' ) }
							className={ `wp-parsely-preview-iframe ${ isLoading ? 'is-loading' : '' }` }
							sandbox="allow-same-origin allow-scripts"
						/>
						<TextSelectionTooltip
							iframeRef={ iframeRef }
							onTextSelected={ ( text, offset ) => {
								onTextSelected( text, offset );
							} }
						/>
					</>

				) }
			</div>
		</div>
	);
};
