/**
 * WordPress dependencies
 */
import { getBlockContent } from '@wordpress/blocks';
// eslint-disable-next-line import/named
import { Button, Notice, PanelRow } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, external } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { GutenbergFunction, dispatchCoreEditor } from '../../../@types/gutenberg/types';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { ContentHelperError, ContentHelperErrorCode } from '../../common/content-helper-error';
import { SidebarSettings, SmartLinkingSettings, useSettings } from '../../common/settings';
import { generateProtocolVariants } from '../../common/utils/functions';
import { ContentHelperPermissions } from '../../common/utils/permissions';
import { LinkMonitor } from './component-link-monitor';
import { SmartLinkingSettings as SmartLinkingSettingsComponent } from './component-settings';
import { useSaveSmartLinksOnPostSave, useSmartLinksValidation } from './hooks';
import { SmartLink, SmartLinkingProvider } from './provider';
import { SmartLinkingReviewModal } from './review-modal/component-modal';
import { ApplyToOptions, SmartLinkingSettingsProps, SmartLinkingStore } from './store';
import {
	calculateSmartLinkingMatches,
	getAllSmartLinksInPost,
	getAllSmartLinksURLs,
	validateAndFixSmartLinksInBlock,
	validateAndFixSmartLinksInPost,
} from './utils';

/**
 * Defines the props structure for SmartLinkingPanel.
 *
 * @since 3.14.0
 */
type SmartLinkingPanelProps = {
	className?: string;
	selectedBlockClientId?: string;
	context?: SmartLinkingPanelContext;
	permissions: ContentHelperPermissions;
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
 * The maximum number of retries for fetching smart links.
 *
 * @since 3.15.0
 */
export const MAX_NUMBER_OF_RETRIES = 3;

/**
 * Smart Linking Panel.
 *
 * @since 3.14.0
 *
 * @param {Readonly<SmartLinkingPanelProps>} props The component's props.
 *
 * @return {import('react').JSX.Element} The JSX Element.
 */
export const SmartLinkingPanel = ( {
	className,
	selectedBlockClientId,
	context = SmartLinkingPanelContext.Unknown,
	permissions,
}: Readonly<SmartLinkingPanelProps> ): React.JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();

	/**
	 * Saving hooks.
	 *
	 * The useSmartLinksValidation hook will validate the smart links before saving the post,
	 * and the useSaveSmartLinksOnPostSave hook will save the smart links when the post is saved,
	 * only after the validation is complete.
	 */
	const [ validationComplete, setValidationComplete ] = useState<boolean>( false );
	useSmartLinksValidation( setValidationComplete );
	useSaveSmartLinksOnPostSave( validationComplete );

	const setSettingsDebounced = useDebounce( setSettings, 500 );

	const [ numAddedLinks, setNumAddedLinks ] = useState<number>( 0 );
	const [ isReviewDone, setIsReviewDone ] = useState<boolean>( false );

	const { createNotice } = useDispatch( 'core/notices' );

	/**
	 * Loads the Smart Linking store.
	 *
	 * @since 3.14.0
	 */
	const {
		ready,
		loading,
		reviewModalIsOpen,
		isFullContent,
		overlayBlocks,
		error,
		suggestedLinks,
		maxLinks,
		smartLinkingSettings,
		applyTo,
		retrying,
		retryAttempt,
		smartLinks,
		inboundSmartLinks,
	} = useSelect( ( selectFn ) => {
		const {
			isReady,
			isLoading,
			isReviewModalOpen,
			getOverlayBlocks,
			getSuggestedLinks,
			getError,
			isFullContent, // eslint-disable-line @typescript-eslint/no-shadow
			getMaxLinks,
			getSmartLinkingSettings,
			getApplyTo,
			isRetrying,
			getRetryAttempt,
			getSmartLinks,
			getInboundSmartLinks,
		} = selectFn( SmartLinkingStore );
		return {
			ready: isReady(),
			loading: isLoading(),
			reviewModalIsOpen: isReviewModalOpen(),
			error: getError(),
			maxLinks: getMaxLinks(),
			isFullContent: isFullContent(),
			overlayBlocks: getOverlayBlocks(),
			suggestedLinks: getSuggestedLinks(),
			smartLinkingSettings: getSmartLinkingSettings(),
			applyTo: getApplyTo(),
			retrying: isRetrying(),
			retryAttempt: getRetryAttempt(),
			smartLinks: getSmartLinks(),
			inboundSmartLinks: getInboundSmartLinks(),
		};
	}, [] );

	/**
	 * The filtered list of smart links that have been applied.
	 *
	 * This list is memoized to prevent unnecessary re-renders.
	 *
	 * @since 3.16.0
	 */
	const appliedLinks = useMemo( () => smartLinks.filter( ( link ) => link.applied ), [ smartLinks ] );

	/**
	 * Loads the Smart Linking store actions.
	 *
	 * @since 3.14.0
	 */
	const {
		setIsReady,
		setLoading,
		setError,
		addSmartLinks,
		addInboundSmartLinks,
		addOverlayBlock,
		removeOverlayBlock,
		setSmartLinkingSettings,
		setApplyTo,
		setMaxLinks,
		setIsRetrying,
		incrementRetryAttempt,
		purgeSmartLinksSuggestions,
		setIsReviewModalOpen,
	} = useDispatch( SmartLinkingStore );

	const { postId } = useSelect( ( selectFn ) => {
		const { getCurrentPostId } = selectFn( 'core/editor' ) as GutenbergFunction;
		return {
			postId: getCurrentPostId(),
		};
	}, [] );

	/**
	 * Handles the initialization of the Smart Linking existing links by getting the
	 * existing smart links from the post content and the database.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		if ( true !== permissions.SmartLinking ) {
			return;
		}

		if ( ready ) {
			// Return early if the Smart Linking store is already initialized.
			return;
		}

		// Get the existing smart links from the post content.
		const existingSmartLinks = getAllSmartLinksInPost();

		// Get the Smart Links from the database and store them in the Smart Linking store.
		if ( postId ) {
			SmartLinkingProvider.getInstance().getSmartLinks( postId ).then( async ( savedSmartLinks ) => {
				let outboundLinks = savedSmartLinks.outbound;
				const inboundLinks = savedSmartLinks.inbound;

				// Calculate the smart links matches for each block.
				const blocks = select( 'core/block-editor' ).getBlocks();
				outboundLinks = calculateSmartLinkingMatches( blocks, outboundLinks );

				// Add the saved smart links to the store.
				await addInboundSmartLinks( inboundLinks );
				return addSmartLinks( outboundLinks );
			} ).then( () => {
				// Add the existing smart links to the store.
				return addSmartLinks( existingSmartLinks );
			} ).then( () => {
				setIsReady( true );
			} );
		} else {
			// If there is no post ID, just add the existing smart links to the store.
			addSmartLinks( existingSmartLinks ).then( () => {
				setIsReady( true );
			} );
		}
	}, [
		addInboundSmartLinks,
		addSmartLinks,
		postId,
		ready,
		setIsReady,
		permissions.SmartLinking,
	] );

	/**
	 * Handles the ending of the review process.
	 * Shows a success notice if the review is done and there are added links.
	 *
	 * @since 3.16.0
	 */
	useEffect( () => {
		if ( ! isReviewDone ) {
			setNumAddedLinks( 0 );
		} else if ( numAddedLinks > 0 ) {
			createNotice(
				'success',
				/* translators: %d: number of smart links applied */
				sprintf( __( '%s smart links successfully applied.', 'wp-parsely' ), numAddedLinks ),
				{
					type: 'snackbar',
				},
			);
		}
	}, [ isReviewDone ] ); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Handles the change of a setting.
	 *
	 * Updates the settings in the Smart Linking store and the Settings Context.
	 *
	 * @since 3.14.0
	 *
	 * @param {keyof SmartLinkingSettingsComponent} setting The setting to change.
	 * @param {string | boolean | number}           value   The new value of the setting.
	 */
	const onSettingChange = (
		setting: keyof SmartLinkingSettings,
		value: string | boolean | number,
	): void => {
		setSettingsDebounced( {
			SmartLinking: {
				...settings.SmartLinking,
				[ setting ]: value,
			},
		} );
		if ( setting === 'MaxLinks' ) {
			setMaxLinks( value as number );
		}
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
			maxLinksPerPost: settings.SmartLinking.MaxLinks,
		};
		setSmartLinkingSettings( newSmartLinkingSettings );
	}, [ setSmartLinkingSettings, settings ] ); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Loads the selected block and post content.
	 *
	 * @since 3.14.0
	 */
	const {
		allBlocks,
		selectedBlock,
		postContent,
		postPermalink,
	} = useSelect(
		( selectFn ) => {
			const { getSelectedBlock, getBlock, getBlocks } = selectFn(
				'core/block-editor',
			) as GutenbergFunction;
			const { getEditedPostContent, getCurrentPostAttribute } = selectFn(
				'core/editor',
			) as GutenbergFunction;

			return {
				allBlocks: getBlocks(),
				selectedBlock: selectedBlockClientId ? getBlock( selectedBlockClientId ) : getSelectedBlock(),
				postContent: getEditedPostContent(),
				postPermalink: getCurrentPostAttribute( 'link' ),
			};
		},
		[ selectedBlockClientId ],
	);

	/**
	 * Processes the smart links generated by the Smart Linking provider.
	 *
	 * The processing step are:
	 * - Exclude the links that have been applied already.
	 * - Strip the protocol and trailing slashes from the post permalink.
	 * - Filter out self-referencing links.
	 * - Calculate the smart links matches for each block.
	 * - Update the stored smart links with the new matches.
	 *
	 * @since 3.16.0
	 *
	 * @param {SmartLink[]} links The smart links to process.
	 */
	const processSmartLinks = async ( links: SmartLink[] ) => {
		// Exclude the links that have been applied already.
		links = links.filter(
			( link ) => ! smartLinks.some( ( sl ) => sl.uid === link.uid && sl.applied )
		);

		// Strip the protocol and trailing slashes from the post permalink.
		const strippedPermalink = postPermalink
			.replace( /^https?:\/\//, '' ).replace( /\/+$/, '' );

		// Filter out self-referencing links.
		links = links.filter( ( link ) => {
			if ( link.href.includes( strippedPermalink ) ) {
				// eslint-disable-next-line no-console
				console.warn( `PCH Smart Linking: Skipping self-reference link: ${ link.href }` );
				return false;
			}
			return true;
		} );

		// Exclude Smart Links text and URLs that are already in the post, to avoid duplicates.
		links = links.filter( ( link ) => {
			return ! smartLinks.some( ( sl ) => {
				if ( sl.href === link.href ) {
					// eslint-disable-next-line no-console
					console.warn( `PCH Smart Linking: Skipping duplicate link: ${ link.href }` );
					return true;
				}
				if ( sl.text === link.text ) {
					// If the offset is the same, we want to keep the link, so it can replace the old smart link.
					if ( sl.offset === link.offset ) {
						// TODO: Flag smart link as updated.
						return false;
					}
					// eslint-disable-next-line no-console
					console.warn( `PCH Smart Linking: Skipping duplicate link text: ${ link.text }` );
					return true;
				}
				return false;
			} );
		} );

		// Depending on the context, we may need to process all blocks or just the selected one.
		const blocksToProcess = isFullContent ? allBlocks : [ selectedBlock! ];

		// Calculate the smart links matches for each block.
		links = calculateSmartLinkingMatches( blocksToProcess, links, {} )
			// Filter out links without a match.
			.filter( ( link ) => link.match );

		// Filter out links without match and smart links being inserted inside another smart link.
		links = links.filter( ( link ) => {
			if ( ! link.match ) {
				return false;
			}
			const linkStart = link.match.blockLinkPosition;
			const linkEnd = linkStart + link.text.length;

			return ! smartLinks.some( ( sl ) => {
				if ( ! sl.match ) {
					return false;
				}

				if ( link.match!.blockId !== sl.match!.blockId ) {
					return false;
				}
				const slStart = sl.match!.blockLinkPosition;
				const slEnd = slStart + sl.text.length;

				return ( linkStart >= slStart && linkEnd <= slEnd );
			} );
		} );

		// Update the link suggestions with the new matches.
		await addSmartLinks( links );
	};

	/**
	 * Generates smart links for the selected block or the entire post content.
	 *
	 * @since 3.14.0
	 */
	const generateSmartLinks = async () => {
		await setLoading( true );
		await purgeSmartLinksSuggestions();
		await setError( null );
		setIsReviewDone( false );

		Telemetry.trackEvent( 'smart_linking_generate_pressed', {
			is_full_content: isFullContent,
			selected_block: selectedBlock?.name ?? 'none',
			context,
		} );

		// When the Freeform block is present, applying Smart Links does not work reliably.
		// If the selected block is a Freeform block or if the Freeform block is present in
		// the content, and the user wants to apply Smart Links to the entire content,
		// show an error message and return early.
		const hasFreeformBlocks = allBlocks.some( ( block ) => block.name === 'core/freeform' );
		if (
			( selectedBlock?.name === 'core/freeform' && ! isFullContent ) ||
			( hasFreeformBlocks && isFullContent )
		) {
			createNotice( 'error', __( 'Smart Linking is not supported for the Freeform block.', 'wp-parsely' ), {
				type: 'snackbar',
			} );
			setLoading( false );
			return;
		}

		// If selected block is not set, the overlay will be applied to the entire content.
		await applyOverlay( isFullContent ? 'all' : selectedBlock?.clientId );

		// After 60 * MAX_NUMBER_OR_RETRIES seconds without a response, timeout and remove any overlay.
		const timeout = setTimeout( () => {
			setLoading( false );
			Telemetry.trackEvent( 'smart_linking_generate_timeout', {
				is_full_content: isFullContent,
				selected_block: selectedBlock?.name ?? 'none',
				context,
			} );

			// If selected block is not set, the overlay will be removed from the entire content.
			removeOverlay( isFullContent ? 'all' : selectedBlock?.clientId );
		}, 60000 * MAX_NUMBER_OF_RETRIES );

		const previousApplyTo = applyTo;
		try {
			const generatedLinks = await generateSmartLinksWithRetry( MAX_NUMBER_OF_RETRIES );
			await processSmartLinks( generatedLinks );
			if ( smartLinks.length === 0 ) {
				const contentHelperError = new ContentHelperError(
					__( 'No smart links were generated.', 'wp-parsely' ),
					ContentHelperErrorCode.ParselyApiReturnedNoData,
					''
				);
				await setError( contentHelperError );
				contentHelperError.createErrorSnackbar();
			} else {
				setIsReviewModalOpen( true );
			}
		} catch ( e: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			const contentHelperError = new ContentHelperError(
				e.message ?? 'An unknown error has occurred.',
				e.code ?? ContentHelperErrorCode.UnknownError
			);

			// Handle the case where the operation was aborted by the user.
			if ( e.code && e.code === ContentHelperErrorCode.ParselyAborted ) {
				contentHelperError.message = sprintf(
					/* translators: %d: number of retry attempts, %s: attempt plural */
					__( 'The Smart Linking process was cancelled after %1$d %2$s.', 'wp-parsely' ),
					e.numRetries,
					_n( 'attempt', 'attempts', e.numRetries, 'wp-parsely' )
				);
			}

			console.error( e ); // eslint-disable-line no-console
			await setError( contentHelperError );
			contentHelperError.createErrorSnackbar();
		} finally {
			await setLoading( false );
			await setApplyTo( previousApplyTo );
			await setIsRetrying( false );
			await removeOverlay( isFullContent ? 'all' : selectedBlock?.clientId );
			clearTimeout( timeout );
		}
	};

	/**
	 * Generates smart links for the selected block or the entire post content,
	 * and retries the fetch if it fails.
	 *
	 * @since 3.15.0
	 *
	 * @param {number} retries The number of retries remaining.
	 *
	 * @return {Promise<SmartLink[]>} The generated smart links.
	 */
	const generateSmartLinksWithRetry = async ( retries: number ): Promise<SmartLink[]> => {
		let generatedLinks: SmartLink[] = [];
		try {
			const generatingFullContent = isFullContent || ! selectedBlock;
			await setApplyTo( generatingFullContent ? ApplyToOptions.All : ApplyToOptions.Selected );

			const urlExclusionList = generateProtocolVariants( postPermalink );

			// Get all the existing smart links URLs to exclude them from the new smart links.
			const existingSmartLinksURLs = getAllSmartLinksURLs( smartLinks );

			urlExclusionList.push( ...existingSmartLinksURLs );

			generatedLinks = await SmartLinkingProvider.getInstance().generateSmartLinks(
				( selectedBlock && ! generatingFullContent )
					? getBlockContent( selectedBlock )
					: postContent,
				maxLinks,
				urlExclusionList
			);
		} catch ( err: any ) { // eslint-disable-line @typescript-eslint/no-explicit-any
			// If the request was aborted, throw the AbortError to be handled elsewhere.
			if ( err.code && err.code === ContentHelperErrorCode.ParselyAborted ) {
				err.numRetries = MAX_NUMBER_OF_RETRIES - retries;
				throw err;
			}

			// If the error is a retryable fetch error, retry the fetch.
			if ( retries > 0 && err.retryFetch ) {
				// Print the error to the console to help with debugging.
				console.error( err ); // eslint-disable-line no-console
				await setIsRetrying( true );
				await incrementRetryAttempt();
				return await generateSmartLinksWithRetry( retries - 1 );
			}

			// Throw the error to be handled elsewhere.
			throw err;
		}

		return generatedLinks;
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
		dispatchCoreEditor.lockPostSaving( 'wp-parsely-block-overlay' );

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
		dispatchCoreEditor.unlockPostSaving( 'wp-parsely-block-overlay' );
	};

	/**
	 * Returns the message for the generate button.
	 *
	 * @since 3.15.0
	 *
	 * @return {string} The message for the generate button.
	 */
	const getGenerateButtonMessage = (): string => {
		if ( retrying ) {
			return sprintf(
				/* translators: %1$d: number of retry attempts, %2$d: maximum number of retries */
				__( 'Retrying… Attempt %1$d of %2$d', 'wp-parsely' ),
				retryAttempt,
				MAX_NUMBER_OF_RETRIES
			);
		}
		if ( loading ) {
			return __( 'Generating Smart Links…', 'wp-parsely' );
		}
		return __( 'Add Smart Links', 'wp-parsely' );
	};

	return (
		<div className="wp-parsely-smart-linking">
			<LinkMonitor
				isDetectingEnabled={ ! reviewModalIsOpen } // Disable link detection when the review modal is open.
				onLinkRemove={ ( changes ) => {
					// When a link is removed, validate and fix any smart-link that got the data-smartlink attribute removed.
					validateAndFixSmartLinksInBlock( changes.block );
				} }
			/>
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
					<Notice
						status="info"
						onRemove={ () => setError( null ) }
						className="wp-parsely-content-helper-error"
					>
						{ error.Message() }
					</Notice>
				) }
				{ ( isReviewDone && numAddedLinks > 0 ) && (
					<Notice
						status="success"
						onRemove={ () => setIsReviewDone( false ) }
						className="wp-parsely-smart-linking-suggested-links"
					>
						{
							sprintf(
								/* translators: 1 - number of smart links generated */
								__( 'Successfully added %s smart links.', 'wp-parsely' ),
								numAddedLinks > 0 ? numAddedLinks : suggestedLinks.length,
							)
						}
					</Notice>
				) }
				<SmartLinkingSettingsComponent
					disabled={ loading }
					selectedBlock={ selectedBlock?.clientId }
					onSettingChange={ onSettingChange }
				/>
				<div className="smart-linking-generate">
					<Button
						onClick={ generateSmartLinks }
						variant="primary"
						isBusy={ loading }
						disabled={ loading }
					>
						{ getGenerateButtonMessage() }
					</Button>
				</div>
				{ ( appliedLinks.length > 0 || inboundSmartLinks.length > 0 ) && (
					<div className="smart-linking-manage">
						<Button
							onClick={ async () => {
								// Update the smart links in the store.
								const fixedSmartLinks = await validateAndFixSmartLinksInPost();
								const existingSmartLinks = getAllSmartLinksInPost();
								await addSmartLinks( existingSmartLinks );
								setIsReviewModalOpen( true );
								Telemetry.trackEvent( 'smart_linking_review_pressed', {
									num_smart_links: smartLinks.length,
									has_fixed_links: fixedSmartLinks,
									context,
								} );
							} }
							variant="secondary"
							disabled={ loading }
						>
							{ __( 'Review Smart Links', 'wp-parsely' ) }
						</Button>
					</div>
				) }
			</PanelRow>

			{ reviewModalIsOpen && (
				<SmartLinkingReviewModal
					isOpen={ reviewModalIsOpen }
					onAppliedLink={ () => {
						setNumAddedLinks( ( num ) => num + 1 );
					}	}
					onClose={ () => {
						setIsReviewDone( true );
						setIsReviewModalOpen( false );
					} }
				/>
			) }
		</div>
	);
};
