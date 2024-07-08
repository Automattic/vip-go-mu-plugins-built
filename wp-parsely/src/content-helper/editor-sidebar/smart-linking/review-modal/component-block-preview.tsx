/**
 * WordPress dependencies
 */
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
// eslint-disable-next-line import/named
import { BlockInstance, cloneBlock, getBlockContent } from '@wordpress/blocks';
import { Disabled } from '@wordpress/components';
import { select } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { SmartLink } from '../provider';
import { applyNodeToBlock } from '../utils';

/**
 * The props for the Styles component.
 *
 * @since 3.16.0
 */
type StylesProps = {
	styles: {
		css?: string,
		assets?: string,
		__unstableType?: string,
	}[],
};

/**
 * The Styles component, which renders the editor styles for the block preview.
 *
 * This component replaces the body selector with the block editor selector.
 *
 * @since 3.16.0
 *
 * @param {StylesProps} props The component props.
 */
const Styles = ( { styles }: StylesProps ): React.JSX.Element => {
	// Get only the theme and user styles.
	const filteredStyles = styles
		.filter( ( style ) => {
			return (
				style.__unstableType === 'theme' ||
				style.__unstableType === 'user'
			) && style.css;
		} );

	// Returns the styles, but replaces the body selector with the block editor selector.
	return (
		<>
			{ filteredStyles.map( ( style, index ) => (
				<style key={ index }>{ style.css?.replace( /body/g, '.wp-parsely-preview-editor' ) }</style>
			) ) }
		</>
	);
};

/**
 * The props for the BlockPreview component.
 *
 * @since 3.16.0
 */
type BlockPreviewProps = {
	block: BlockInstance,
	link: SmartLink,
	useOriginalBlock?: boolean,
}

/**
 * The BlockPreview component, which renders the block preview for the
 * suggestion.
 *
 * @since 3.16.0
 *
 * @param {BlockPreviewProps} props The component props.
 */
export const BlockPreview = ( { block, link, useOriginalBlock }: BlockPreviewProps ) => {
	/**
	 * Clones the block to prevent editing the original block.
	 * The memoized block is used to prevent unnecessary re-renders.
	 *
	 * It updates when the block or link changes.
	 *
	 * @since 3.16.0
	 */
	const clonedBlock = useMemo( () => {
		if ( useOriginalBlock ) {
			return block;
		}
		return cloneBlock( block );
	}, [ link, block, useOriginalBlock ] ); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Highlights the link in the block.
	 *
	 * @since 3.16.0
	 *
	 * @param {BlockInstance} blockInstance  The block instance to highlight the link in.
	 * @param {SmartLink}     linkSuggestion The link suggestion to highlight.
	 */
	const highlightLinkInBlock = useCallback( ( blockInstance: BlockInstance, linkSuggestion: SmartLink ) => {
		// If the link is not applied, add a highlight with a new mark element.
		if ( ! link.applied ) {
			const mark = document.createElement( 'mark' );
			mark.className = 'smart-linking-highlight';
			blockInstance.attributes.content = applyNodeToBlock( blockInstance, linkSuggestion, mark );
			return;
		}

		// Otherwise, if the link is applied, add a highlight class to the
		// link element with the link UID.
		const blockContent: string = getBlockContent( blockInstance );

		const doc = new DOMParser().parseFromString( blockContent, 'text/html' );
		const contentElement = doc.body.firstChild as HTMLElement;
		if ( ! contentElement ) {
			return;
		}

		const anchor = contentElement.querySelector<HTMLAnchorElement>(
			`a[data-smartlink="${ linkSuggestion.uid }"]`
		);
		if ( anchor ) {
			anchor.classList.add( 'smart-linking-highlight' );
		}

		blockInstance.attributes.content = contentElement.innerHTML;
	}, [ link.applied ] );

	/**
	 * Runs when the block is rendered in the DOM.
	 *
	 * It will set the block element to be non-editable and highlight the link
	 * in the block.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		const blockPreviewElement = document.querySelector( '.wp-parsely-preview-editor' );

		if ( ! blockPreviewElement ) {
			return;
		}

		highlightLinkInBlock( clonedBlock, link );

		const observer = new MutationObserver( ( mutations: MutationRecord[] ) => {
			mutations.forEach( ( mutation: MutationRecord ) => {
				if ( mutation.type === 'childList' ) {
					// Temporarily disconnect observer to prevent observing our own changes.
					observer.disconnect();

					mutation.addedNodes.forEach( ( node ) => {
						if ( node instanceof HTMLElement ) {
							const blockElement = document.querySelector<HTMLElement>(
								`.wp-parsely-preview-editor [data-block="${ clonedBlock.clientId }"]`
							);

							if ( blockElement ) {
								// Disable editing on the block element.
								blockElement.setAttribute( 'contenteditable', 'false' );
							}
						}
					} );

					// Reconnect observer after changes.
					observer.observe( document.body, { childList: true, subtree: true } );
				}
			} );
		} );

		observer.observe( blockPreviewElement, {
			childList: true,
			subtree: true,
		} );

		return () => observer.disconnect();
	}, [ clonedBlock, highlightLinkInBlock, link ] );

	if ( ! block ) {
		return <></>;
	}

	const settings = select( 'core/block-editor' ).getSettings();

	return (
		<Disabled className="wp-block-post-content editor-styles-wrapper wp-parsely-preview-editor" >
			<BlockEditorProvider
				value={ [ clonedBlock ] }
				settings={ {
					...settings,
					// @ts-ignore __unstableIsPreviewMode is not in the types.
					__unstableIsPreviewMode: true,
					templateLock: 'all',
				} }
			>
				<Styles styles={ settings.styles } />
				<BlockList />
			</BlockEditorProvider>
		</Disabled>
	);
};
