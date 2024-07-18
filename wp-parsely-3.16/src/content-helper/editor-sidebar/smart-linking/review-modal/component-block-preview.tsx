/**
 * WordPress dependencies
 */
import { BlockEditorProvider, BlockList } from '@wordpress/block-editor';
// eslint-disable-next-line import/named
import { BlockInstance, cloneBlock, getBlockContent } from '@wordpress/blocks';
import { Disabled } from '@wordpress/components';
import { select } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { SmartLink } from '../provider';
import { applyNodeToBlock } from '../utils';

/**
 * The style object, a derivative from Gutenberg's `Style` type.
 *
 * @since 3.16.1
 */
type Style = {
	css?: string,
	assets?: string,
	__unstableType?: string,
};

/**
 * The props for the Styles component.
 *
 * @since 3.16.0
 * @since 3.16.1 Extracted the styles prop to a new `Style` type.
 */
type StylesProps = {
	styles: Style[],
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
	/**
	 * Prefixes the selectors in the CSS with the given prefix.
	 *
	 * It also replaces the `body` selector with the prefix itself.
	 *
	 * @since 3.16.1
	 *
	 * @param {string} css    The CSS to prefix.
	 * @param {string} prefix The prefix to use.
	 */
	const prefixSelectors = ( css: string, prefix: string ): string => {
		// Split the CSS into individual rules.
		const cssRules = css.split( '}' );

		const prefixedRules = cssRules.map( ( rule ) => {
			// If the rule is empty, skip it.
			if ( ! rule.trim() ) {
				return '';
			}

			// eslint-disable-next-line @wordpress/no-unused-vars-before-return
			const [ selectors, properties ] = rule.split( '{' );

			// If there are no properties, return the rule as is.
			if ( ! properties ) {
				return rule;
			}

			// Add the prefix to each selector.
			const prefixedSelectors = selectors
				.split( ',' )
				.map( ( selector ) => {
					const trimmedSelector = selector.trim();
					if ( ! trimmedSelector ) {
						return '';
					}
					// Replace the `body` selector with the prefix.
					if ( trimmedSelector === 'body' ) {
						return prefix;
					}
					return `${ prefix } ${ trimmedSelector }`;
				} ).join( ', ' );

			return `${ prefixedSelectors } {${ properties }}`;
		} );

		return prefixedRules.join( ' ' );
	};

	const [ processedStyles, setProcessedStyles ] = useState<Style[]>( [] );

	/**
	 * Processes the styles to prefix all the Editor styles selectors with the Preview Editor wrapper class.
	 *
	 * @since 3.16.1
	 */
	useEffect( () => {
		const processStyles = () => {
			const filteredStyles = styles.filter( ( style ) => {
				return (
					( style.__unstableType === 'theme' || style.__unstableType === 'user' ) && style.css
				);
			} );

			const processed = filteredStyles.map( ( style ) => {
				const prefixedCss = prefixSelectors( style.css ?? '', '.wp-parsely-preview-editor' );
				return { ...style, css: prefixedCss };
			} );

			setProcessedStyles( processed );
		};

		processStyles();
	}, [ styles ] );

	return (
		<>
			{ processedStyles.map( ( style, index ) => (
				<style key={ index }>{ style.css }</style>
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
		<div className="wp-parsely-preview-editor">
			<Disabled className="wp-block-post-content editor-styles-wrapper" >
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
		</div>
	);
};
