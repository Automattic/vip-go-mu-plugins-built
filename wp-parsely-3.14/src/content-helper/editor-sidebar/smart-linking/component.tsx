/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/named
import { BlockInstance, getSaveContent } from '@wordpress/blocks';
import { Button, Notice, PanelRow } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { dispatch, select, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, external } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { SidebarSettings, useSettings } from '../../common/settings';
import { SmartLinkingSettings } from './component-settings';
import { LinkSuggestion, SmartLinkingProvider } from './provider';
import { SmartLinkingSettingsProps, SmartLinkingStore } from './store';
import { escapeRegExp, findTextNodesNotInAnchor } from './utils';

/**
 * Defines the props structure for SmartLinkingPanel.
 *
 * @since 3.14.0
 */
type SmartLinkingPanelProps = {
	className?: string;
	selectedBlockClientId?: string;
	context?: SmartLinkingPanelContext;
}

/**
 * Defines the possible contexts in which the Smart Linking panel can be used.
 *
 * @since 3.14.0
 */
export enum SmartLinkingPanelContext {
	Unknown = 'unknown',
	ContentHelperSidebar = 'content_helper_sidebar',
	BlockInspector = 'block_inspector',
}

/**
 * Smart Linking Panel.
 *
 * @since 3.14.0
 *
 * @param { Readonly<SmartLinkingPanelProps> } props The component's props.
 *
 * @return { JSX.Element } The JSX Element.
 */
export const SmartLinkingPanel = ( {
	className,
	selectedBlockClientId,
	context = SmartLinkingPanelContext.Unknown,
}: Readonly<SmartLinkingPanelProps> ): JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();
	const setSettingsDebounced = useDebounce( setSettings, 500 );

	const [ hint, setHint ] = useState<string | null>( null );

	const { createNotice } = useDispatch( 'core/notices' );

	/**
	 * Loads the Smart Linking store.
	 *
	 * @since 3.14.0
	 */
	const {
		loading,
		isFullContent,
		overlayBlocks,
		error,
		suggestedLinks,
		maxLinks,
		maxLinkWords,
		smartLinkingSettings,
	} = useSelect( ( selectFn ) => {
		const {
			isLoading,
			getOverlayBlocks,
			getSuggestedLinks,
			getError,
			// eslint-disable-next-line @typescript-eslint/no-shadow
			isFullContent,
			getMaxLinks,
			getMaxLinkWords,
			getSmartLinkingSettings,
		} = selectFn( SmartLinkingStore );
		return {
			loading: isLoading(),
			error: getError(),
			maxLinks: getMaxLinks(),
			maxLinkWords: getMaxLinkWords(),
			isFullContent: isFullContent(),
			overlayBlocks: getOverlayBlocks(),
			suggestedLinks: getSuggestedLinks(),
			smartLinkingSettings: getSmartLinkingSettings(),
		};
	}, [] );

	/**
	 * Loads the Smart Linking store actions.
	 *
	 * @since 3.14.0
	 */
	const {
		setLoading,
		setError,
		setSuggestedLinks,
		addOverlayBlock,
		removeOverlayBlock,
		setSmartLinkingSettings,
	} = useDispatch( SmartLinkingStore );

	/**
	 * Handles the change of a setting.
	 *
	 * Updates the settings in the Smart Linking store and the Settings Context.
	 *
	 * @since 3.14.0
	 *
	 * @param { keyof SidebarSettings }     setting The setting to change.
	 * @param { string | boolean | number } value   The new value of the setting.
	 */
	const onSettingChange = (
		setting: keyof SidebarSettings,
		value: string | boolean | number,
	): void => {
		setSettingsDebounced( { [ setting ]: value } );
		setSmartLinkingSettings( { [ setting ]: value } );
	};

	/**
	 * Loads and prepares the Smart Linking settings from the Settings Context,
	 * if they are not already loaded.
	 *
	 * @since 3.14.0
	 */
	useEffect( () => {
		// If the smartLinkingSettings are not empty object, return early.
		if ( Object.keys( smartLinkingSettings ).length > 0 ) {
			return;
		}

		// Load the settings from the WordPress database and store them in the Smart Linking store.
		const newSmartLinkingSettings: SmartLinkingSettingsProps = {
			maxLinksPerPost: settings.SmartLinkingMaxLinks,
			maxLinkWords: settings.SmartLinkingMaxLinkWords,
		};
		setSmartLinkingSettings( newSmartLinkingSettings );
	}, [ setSmartLinkingSettings, settings ] ); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Loads the selected block and post content.
	 *
	 * @since 3.14.0
	 */
	const { selectedBlock, postContent, allBlocks } = useSelect(
		( selectFn ) => {
			const { getSelectedBlock, getBlock, getBlocks } = selectFn(
				'core/block-editor',
			) as GutenbergFunction;
			const { getEditedPostContent } = selectFn( 'core/editor' ) as GutenbergFunction;

			return {
				allBlocks: getBlocks(),
				selectedBlock: selectedBlockClientId ? getBlock( selectedBlockClientId ) : getSelectedBlock(),
				postContent: getEditedPostContent(),
			};
		},
		[ selectedBlockClientId ],
	);

	/**
	 * Resets the hint when the selected block changes.
	 */
	useEffect( () => {
		setHint( null );
	}, [ selectedBlock ] );

	/**
	 * Generates smart links for the selected block or the entire post content.
	 *
	 * @since 3.14.0
	 */
	const generateSmartLinks = () => async (): Promise<void> => {
		await setLoading( true );
		await setSuggestedLinks( null );
		await setError( null );
		Telemetry.trackEvent( 'smart_linking_generate_pressed', {
			is_full_content: isFullContent,
			selected_block: selectedBlock?.name ?? 'none',
			context,
		} );

		// If selected block is not set, the overlay will be applied to the entire content.
		await applyOverlay( isFullContent ? 'all' : selectedBlock?.clientId );

		// After 60 seconds without a response, timeout and remove any overlay.
		const timeout = setTimeout( () => {
			setLoading( false );
			Telemetry.trackEvent( 'smart_linking_generate_timeout', {
				is_full_content: isFullContent,
				selected_block: selectedBlock?.name ?? 'none',
				context,
			} );

			// If selected block is not set, the overlay will be removed from the entire content.
			removeOverlay( isFullContent ? 'all' : selectedBlock?.clientId );
		}, 60000 );

		try {
			const generatingFullContent = isFullContent || ! selectedBlock;
			let generatedLinks = [];
			if ( selectedBlock?.originalContent && ! generatingFullContent ) {
				generatedLinks = await SmartLinkingProvider.generateSmartLinks(
					selectedBlock?.originalContent,
					maxLinkWords,
					maxLinks,
				);
			} else {
				generatedLinks = await SmartLinkingProvider.generateSmartLinks(
					postContent,
					maxLinkWords,
					maxLinks,
				);
			}
			await setSuggestedLinks( generatedLinks );
			applySmartLinks( generatedLinks );
		} catch ( e: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			setError( e );
			createNotice( 'error', __( 'There was a problem applying smart links.', 'wp-parsely' ), {
				type: 'snackbar',
				isDismissible: true,
			} );
		} finally {
			await setLoading( false );
			await removeOverlay( isFullContent ? 'all' : selectedBlock?.clientId );
			clearTimeout( timeout );
		}
	};

	/**
	 * Represents the counts of occurrences and applications of links within text content.
	 *
	 * - `encountered`: The number of times a specific link text is encountered in the content.
	 * - `linked`: The number of times a link has been successfully applied for a specific link text.
	 *
	 * @since 3.14.1
	 */
	type LinkOccurrenceCounts = {
		[key: string]: {
			encountered: number;
			linked: number;
		};
	};

	/**
	 * Applies the smart links to the selected block or the entire post content.
	 *
	 * @since 3.14.0
	 * @since 3.14.1 Moved applyLinksToBlocks to a separate function.
	 *
	 * @param {LinkSuggestion[]} links The smart links to apply.
	 */
	const applySmartLinks = ( links: LinkSuggestion[] ): void => {
		Telemetry.trackEvent( 'smart_linking_applied', {
			is_full_content: isFullContent || ! selectedBlock,
			selected_block: selectedBlock?.name ?? 'none',
			links_count: links.length,
			context,
		} );

		let blocks;
		if ( selectedBlock && ! isFullContent ) {
			blocks = [ selectedBlock ];
		} else {
			blocks = allBlocks;
		}

		// An object to keep track of the number of times each link text has been found across all blocks.
		const occurrenceCounts: LinkOccurrenceCounts = {};

		// Apply the smart links to the content.
		applyLinksToBlocks( blocks, links, occurrenceCounts );

		// Update the content of each block.
		blocks.forEach( ( block ) => {
			updateBlockContent( block );
		} );

		createNotice( 'success', `${ links.length } smart links successfully applied.`, {
			type: 'snackbar',
			isDismissible: true,
		} );
	};

	/**
	 * Iterates through blocks of content to apply smart link suggestions.
	 *
	 * This function parses the content of each block, looking for text nodes that match the provided link suggestions.
	 * When a match is found, it creates an anchor element (`<a>`) around the matching text with the specified href and
	 * title from the link suggestion.
	 * It carefully avoids inserting links within existing anchor elements and handles various inline HTML elements gracefully.
	 *
	 * @since 3.14.1
	 *
	 * @param {BlockInstance[]}  blocks           The blocks of content where links should be applied.
	 *                                            This array is modified in place and will contain the updated
	 *                                            content after the function is called.
	 * @param {LinkSuggestion[]} links            An array of link suggestions to apply to the content.
	 * @param {Object}           occurrenceCounts An object to keep track of the number of times each link text has
	 *                                            been applied across all blocks.
	 */
	const applyLinksToBlocks = (
		blocks: BlockInstance[],
		links: LinkSuggestion[],
		occurrenceCounts: LinkOccurrenceCounts
	): void => {
		blocks.forEach( ( block ) => {
			if ( block.originalContent ) {
				const blockContent: string = block.originalContent;
				const doc = new DOMParser().parseFromString( blockContent, 'text/html' );

				const contentElement = doc.body.firstChild;
				if ( contentElement && contentElement instanceof HTMLElement ) {
					links.forEach( ( link ) => {
						const textNodes = findTextNodesNotInAnchor( contentElement, link.text );

						textNodes.forEach( ( node ) => {
							if ( node.textContent ) {
								const regex = new RegExp( escapeRegExp( link.text ), 'g' );
								let match;

								while ( ( match = regex.exec( node.textContent ) ) !== null ) {
									if ( ! occurrenceCounts[ link.text ] ) {
										occurrenceCounts[ link.text ] = { encountered: 0, linked: 0 };
									}

									// Increment the encountered count every time the text is found.
									occurrenceCounts[ link.text ].encountered++;

									// Check if the encountered count minus linked count matches the link's offset.
									if ( occurrenceCounts[ link.text ].encountered - occurrenceCounts[ link.text ].linked - 1 === link.offset ) {
										// Create a new anchor element for the link.
										const anchor = document.createElement( 'a' );
										anchor.href = link.href;
										anchor.title = link.title;
										anchor.textContent = match[ 0 ];

										// Replace the matched text with the new anchor element.
										const range = document.createRange();
										range.setStart( node, match.index );
										range.setEnd( node, match.index + match[ 0 ].length );
										range.deleteContents();
										range.insertNode( anchor );

										// Adjust the text node if there's text remaining after the link.
										if ( node.textContent && match.index + match[ 0 ].length < node.textContent.length ) {
											const remainingText = document.createTextNode(
												node.textContent.slice( match.index + match[ 0 ].length )
											);
											node.parentNode?.insertBefore( remainingText, anchor.nextSibling );
										}

										// Increment the linked count only when a link is applied.
										occurrenceCounts[ link.text ].linked++;
									}
								}
							}
						} );
					} );

					// Update the block content with the modified HTML.
					if ( contentElement && block.attributes.content ) {
						block.attributes.content = contentElement.innerHTML;
					}
				}
			}

			// Recursively apply links to any inner blocks.
			if ( block.innerBlocks && block.innerBlocks.length ) {
				applyLinksToBlocks( block.innerBlocks, links, occurrenceCounts );
			}
		} );
	};

	/**
	 * Updates the content of a block with the modified HTML.
	 *
	 * This function updates the originalContent attribute of the block with the modified HTML.
	 * It also recursively updates the content of any inner blocks.
	 *
	 * @since 3.14.1
	 *
	 * @param {BlockInstance} block The block to update.
	 */
	const updateBlockContent = ( block: BlockInstance ) => {
		const { updateBlock } = dispatch( 'core/block-editor' );

		// Update the top-level block.
		if ( block.attributes.content ) {
			updateBlock( block.clientId, {
				attributes: {
					content: block.attributes.content,
				},
				originalContent: getSaveContent( block.name, block.attributes, block.innerBlocks ),
			} );
		}

		// Recursively update nested blocks if any.
		if ( block.innerBlocks ) {
			block.innerBlocks.forEach( ( innerBlock ) => {
				updateBlockContent( innerBlock );
			} );
		}
	};

	/**
	 * Applies the overlay to the selected block or the entire post content.
	 *
	 * @since 3.14.0
	 *
	 * @param {string} clientId The client ID of the block to apply the overlay to.\
	 *                          If set to 'all', the overlay will be applied to the entire post content.
	 */
	const applyOverlay = async ( clientId: string = 'all' ): Promise<void> => {
		await addOverlayBlock( clientId );
		disableSave();
	};

	/**
	 * Removes the overlay from the selected block or the entire post content.
	 *
	 * @since 3.14.0
	 *
	 * @param {string} clientId The client ID of the block to remove the overlay from.
	 *                          If set to 'all', the overlay will be removed from the entire post content.
	 */
	const removeOverlay = async ( clientId: string = 'all' ): Promise<void> => {
		await removeOverlayBlock( clientId );

		// Select a block after removing the overlay, only if we're using the block inspector.
		if ( context === SmartLinkingPanelContext.BlockInspector ) {
			if ( 'all' !== clientId && ! isFullContent ) {
				dispatch( 'core/block-editor' ).selectBlock( clientId );
			} else {
				const firstBlock = select( 'core/block-editor' ).getBlockOrder()[ 0 ];
				// Select the first block in the post.
				dispatch( 'core/block-editor' ).selectBlock( firstBlock );
			}
		}

		// If there are no more overlay blocks, enable save.
		if ( overlayBlocks.length === 0 ) {
			enableSave();
		}
	};

	/**
	 * Disables the save button and locks post auto-saving.
	 *
	 * @since 3.14.0
	 */
	const disableSave = (): void => {
		// Lock post saving.
		dispatch( 'core/editor' ).lockPostSaving( 'wp-parsely-block-overlay' );

		// Disable save buttons.
		const saveButtons = document.querySelectorAll( '.edit-post-header__settings>[type="button"]' );
		saveButtons.forEach( ( button ) => {
			button.setAttribute( 'disabled', 'disabled' );
		} );
	};

	/**
	 * Enables the save button and unlocks post auto-saving.
	 *
	 * @since 3.14.0
	 */
	const enableSave = (): void => {
		// Enable save buttons.
		const saveButtons = document.querySelectorAll( '.edit-post-header__settings>[type="button"]' );
		saveButtons.forEach( ( button ) => {
			button.removeAttribute( 'disabled' );
		} );

		// Unlock post saving.
		dispatch( 'core/editor' ).unlockPostSaving( 'wp-parsely-block-overlay' );
	};

	return (
		<div className="wp-parsely-smart-linking">
			<PanelRow className={ className }>
				<div className="smart-linking-text">
					{ __(
						'Automatically insert links to your most relevant, top performing content.',
						'wp-parsely',
					) }
					<Button
						href="https://docs.parse.ly/plugin-content-helper/#h-smart-linking-beta"
						target="_blank"
						variant="link"
					>
						{ __( 'Learn more about Parse.ly AI', 'wp-parsely' ) }
						<Icon icon={ external } size={ 18 } className="parsely-external-link-icon" />
					</Button>
				</div>
				{ error && (
					<Notice status="info" isDismissible={ false } className="wp-parsely-content-helper-error">
						{ error.Message() }
					</Notice>
				) }
				{ suggestedLinks !== null && (
					<Notice
						status="success"
						isDismissible={ false }
						className="wp-parsely-smart-linking-suggested-links"
					>
						{
							/* translators: 1 - number of smart links generated */
							sprintf( __( 'Successfully added %s smart links.', 'wp-parsely' ), suggestedLinks.length )
						}
					</Notice>
				) }
				<SmartLinkingSettings
					disabled={ loading }
					selectedBlock={ selectedBlock?.clientId }
					onSettingChange={ onSettingChange }
				/>
				<div className="smart-linking-generate">
					<Button
						onClick={ generateSmartLinks() }
						variant="primary"
						isBusy={ loading }
						disabled={ loading }
					>
						{ loading
							? __( 'Adding Smart Links…', 'wp-parsely' )
							: __( 'Add Smart Links', 'wp-parsely' ) }
					</Button>
					{ hint && (
						<Notice
							status="warning"
							isDismissible={ true }
							onRemove={ () => setHint( null ) }
							className="wp-parsely-smart-linking-hint"
						>
							<strong>{ __( 'Hint:', 'wp-parsely' ) }</strong> { hint }
						</Notice>
					) }
				</div>
			</PanelRow>
		</div>
	);
};
