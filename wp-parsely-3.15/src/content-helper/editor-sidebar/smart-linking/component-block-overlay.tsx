/**
 * WordPress dependencies
 */
import { Button, Spinner } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { dispatch, useSelect } from '@wordpress/data';
import { createPortal, useEffect, useState } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { SmartLinkingProvider } from './provider';
import { SmartLinkingStore } from './store';

/**
 * Defines the props structure for BlockOverlay.
 *
 * @since 3.14.0
 */
type BlockOverlayProps = {
	selectedBlockClientId: string;
	label: string;
};

/**
 * Draws an overlay over the selected block.
 *
 * @since 3.14.0
 *
 * @param {BlockOverlayProps} props The component's props.
 *
 * @return {JSX.Element} The JSX Element.
 */
export const BlockOverlay = ( {
	selectedBlockClientId,
	label,
}: Readonly<BlockOverlayProps> ): JSX.Element => {
	const {
		retrying,
	} = useSelect( ( select ) => {
		const { isRetrying } = select( SmartLinkingStore );

		return {
			retrying: isRetrying(),
		};
	}, [] );

	// Create a container element for the overlay.
	const [ container ] = useState<HTMLDivElement>( document.createElement( 'div' ) );
	container.className = 'wp-parsely-block-overlay';
	if ( selectedBlockClientId === 'all' ) {
		container.className += ' full-content-overlay';
	}

	// When clicking the overlay, we want the underlying block to be selected.
	container.onclick = ( e ) => {
		// Allow the cancel button to be clicked.
		const cancelButton = document.querySelector( '.wp-parsely-block-overlay-cancel' );
		if ( cancelButton && e.target === cancelButton ) {
			e.stopPropagation();
			return;
		}

		e.stopPropagation();
		e.stopImmediatePropagation();

		if ( selectedBlockClientId === 'all' ) {
			return;
		}

		dispatch( 'core/block-editor' ).selectBlock( selectedBlockClientId, -1 );

		// When nested blocks are selected, the block editor will focus the outermost block.
		// We need to blur the focused element to avoid this.
		const activeElement = container.ownerDocument.activeElement;
		( activeElement as HTMLElement ).blur();
	};

	useEffect( () => {
		if ( ! selectedBlockClientId ) {
			return;
		}

		/**
		 * If the selected block is the "All content" block, we need to append the overlay
		 * to the editor element instead of the block element.
		 */
		if ( selectedBlockClientId === 'all' ) {
			const editorElement = document.querySelector( '.interface-navigable-region.interface-interface-skeleton__content' );
			editorElement?.appendChild( container );

			// Set overflow to hidden.
			editorElement?.setAttribute( 'style', 'overflow: hidden' );
			container.style.top = editorElement?.scrollTop + 'px';

			return () => {
				if ( editorElement?.contains( container ) ) {
					editorElement.removeChild( container );
				}
				// Restore overflow.
				editorElement?.setAttribute( 'style', '' );
				container.style.top = '';
			};
		}

		const blockElement = document.querySelector( `[data-block="${ selectedBlockClientId }"]` );

		// Disable changes on the block element.
		blockElement?.setAttribute( 'contenteditable', 'false' );
		blockElement?.setAttribute( 'aria-disabled', 'true' );

		// Insert the container in the block element.
		blockElement?.appendChild( container );

		// Remove the container on component unload.
		return () => {
			// Enable changes on the block element.
			blockElement?.setAttribute( 'contenteditable', 'true' );
			blockElement?.removeAttribute( 'aria-disabled' );

			if ( blockElement?.contains( container ) ) {
				blockElement.removeChild( container );
			}
		};
	} );

	return createPortal(
		<div className="wp-parsely-block-overlay-label">
			<Spinner />
			{ ! retrying && <span>{ label }</span> }
			{ retrying && (
				<>
					<span>
						{ __( 'Retrying to Generate Smart Links…', 'wp-parsely' ) }
						&nbsp;
						<Button
							className={ 'wp-parsely-block-overlay-cancel' }
							variant="link"
							onClick={ () => {
								SmartLinkingProvider.getInstance().cancelRequest();
							} }
						>
							{ __( 'Cancel', 'wp-parsely' ) }
						</Button>
					</span>
				</>
			) }
		</div>,
		container
	);
};

/**
 * Draws an overlay over the full block editor, when the "All content" is selected.
 *
 * @since 3.14.0
 *
 * @return {JSX.Element} The JSX Element.
 */
const BlockOverlayFullContent = ( ): JSX.Element => {
	const { overlayBlocks } = useSelect( ( select ) => {
		const { getOverlayBlocks } = select( SmartLinkingStore );

		return {
			overlayBlocks: getOverlayBlocks(),
		};
	}, [] );

	if ( overlayBlocks.includes( 'all' ) ) {
		return (
			<BlockOverlay
				label={ __( 'Generating Smart Links…', 'wp-parsely' ) }
				selectedBlockClientId={ 'all' }
			/>
		);
	}

	return <></>;
};

/**
 * A higher-order component that adds a block overlay over a specific block, flagged by the Smart Linking store.
 *
 * @since 3.14.0
 */
export const withBlockOverlay = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { overlayBlocks } = useSelect( ( select ) => {
			const { getOverlayBlocks } = select( SmartLinkingStore );

			return {
				overlayBlocks: getOverlayBlocks(),
			};
		}, [] );

		// If the block ID is currently on the overlayBlocks array, we should render the overlay.
		if ( ! overlayBlocks.includes( props.clientId ) ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<>
				<BlockOverlay
					label={ __( 'Generating Smart Links…', 'wp-parsely' ) }
					selectedBlockClientId={ props.clientId }
				/>
				<BlockEdit { ...props } />
			</>
		);
	};
}, 'withBlockOverlay' );

/**
 * Initializes the block overlay, by adding the filter for individual blocks and
 * registering a plugin for the full content overlay.
 *
 * @since 3.14.0
 */
export const initBlockOverlay = (): void => {
	addFilter(
		'editor.BlockEdit',
		'wpparsely/block-overlay',
		withBlockOverlay
	);

	registerPlugin( 'wp-parsely-block-overlay', {
		render: BlockOverlayFullContent,
	} );
};
