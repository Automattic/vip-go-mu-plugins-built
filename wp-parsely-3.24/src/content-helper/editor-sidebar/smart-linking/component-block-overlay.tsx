/**
 * WordPress dependencies
 */
import { Button, Spinner } from '@wordpress/components';
import { createHigherOrderComponent, useRefEffect } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { createPortal, useState } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { dispatchCoreBlockEditor } from '../../../@types/gutenberg/types';
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
 * The element the full content overlay gets appended to. Lives in the admin
 * document, outside the canvas iframe.
 *
 * @since 3.23.6
 */
const FULL_CONTENT_TARGET_SELECTOR = '.interface-interface-skeleton__content';

/**
 * Draws an overlay over the selected block.
 *
 * The anchor element is rendered by React in the same document as the overlay's
 * target, so its `ownerDocument` resolves to the canvas document for per-block
 * overlays and to the admin document for the full content overlay.
 *
 * @since 3.14.0
 * @since 3.23.6 Resolve the target element against the Editor canvas document.
 *
 * @param {BlockOverlayProps} props The component's props.
 *
 * @return {import('react').JSX.Element} The JSX Element.
 */
export const BlockOverlay = ( {
	selectedBlockClientId,
	label,
}: Readonly<BlockOverlayProps> ): React.JSX.Element => {
	const {
		retrying,
	} = useSelect( ( select ) => {
		const { isRetrying } = select( SmartLinkingStore );

		return {
			retrying: isRetrying(),
		};
	}, [] );

	// The overlay element the label gets rendered into, once attached.
	const [ container, setContainer ] = useState<HTMLDivElement | null>( null );

	const isFullContent = 'all' === selectedBlockClientId;

	const anchorRef = useRefEffect<HTMLDivElement>( ( node ) => {
		if ( ! selectedBlockClientId ) {
			return;
		}

		const { ownerDocument } = node;
		const target = ownerDocument.querySelector<HTMLElement>(
			isFullContent
				? FULL_CONTENT_TARGET_SELECTOR
				: `[data-block="${ selectedBlockClientId }"]`
		);

		if ( ! target ) {
			return;
		}

		const overlay = ownerDocument.createElement( 'div' );
		overlay.className = 'wp-parsely-block-overlay';

		// When clicking the overlay, we want the underlying block to be selected.
		const onOverlayClick = ( event: MouseEvent ): void => {
			// Allow the cancel button to be clicked.
			const eventTarget = event.target as HTMLElement | null;
			if ( eventTarget?.closest( '.wp-parsely-block-overlay-cancel' ) ) {
				event.stopPropagation();
				return;
			}

			event.stopPropagation();
			event.stopImmediatePropagation();

			if ( isFullContent ) {
				return;
			}

			dispatchCoreBlockEditor.selectBlock( selectedBlockClientId, -1 );

			// When nested blocks are selected, the block editor will focus the
			// outermost block. We need to blur the focused element to avoid this.
			const { activeElement } = ownerDocument;
			if ( activeElement instanceof HTMLElement ) {
				activeElement.blur();
			}
		};

		overlay.addEventListener( 'click', onOverlayClick );

		let restoreTarget: () => void;

		if ( isFullContent ) {
			overlay.classList.add( 'full-content-overlay' );

			const previousOverflow = target.style.overflow;
			target.style.overflow = 'hidden';
			overlay.style.top = `${ target.scrollTop }px`;

			restoreTarget = () => {
				target.style.overflow = previousOverflow;
			};
		} else {
			const previousContentEditable = target.getAttribute( 'contenteditable' );
			target.setAttribute( 'contenteditable', 'false' );
			target.setAttribute( 'aria-disabled', 'true' );

			restoreTarget = () => {
				if ( null === previousContentEditable ) {
					target.removeAttribute( 'contenteditable' );
				} else {
					target.setAttribute( 'contenteditable', previousContentEditable );
				}
				target.removeAttribute( 'aria-disabled' );
			};
		}

		target.appendChild( overlay );
		setContainer( overlay );

		return () => {
			overlay.removeEventListener( 'click', onOverlayClick );
			overlay.remove();
			restoreTarget();
			setContainer( null );
		};
	}, [ isFullContent, selectedBlockClientId ] );

	return (
		<>
			<div ref={ anchorRef } style={ { display: 'none' } } />
			{ container && createPortal(
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
									// The overlaid block carries `aria-disabled`, which
									// otherwise applies to this control too.
									aria-disabled={ false }
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
			) }
		</>
	);
};

/**
 * Draws an overlay over the full block editor, when the "All content" is selected.
 *
 * @since 3.14.0
 *
 * @return {import('react').JSX.Element} The JSX Element.
 */
const BlockOverlayFullContent = (): React.JSX.Element => {
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
				<BlockEdit { ...props } />
				<BlockOverlay
					label={ __( 'Generating Smart Links…', 'wp-parsely' ) }
					selectedBlockClientId={ props.clientId }
				/>
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
