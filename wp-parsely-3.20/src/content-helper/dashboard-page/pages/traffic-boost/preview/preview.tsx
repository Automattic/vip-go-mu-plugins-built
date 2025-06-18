/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { error, link as linkIcon, linkOff } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { ContentHelperError, ContentHelperErrorCode } from '../../../../common/content-helper-error';
import { HydratedPost } from '../../../../common/providers/base-wordpress-provider';
import { TrafficBoostLink } from '../provider';
import { TrafficBoostSidebarTabs, TrafficBoostStore } from '../store';
import { PreviewFooter } from './components/preview-footer';
import { PreviewHeader } from './components/preview-header';
import { PreviewIframe } from './components/preview-iframe';
import './preview.scss';

/**
 * Structure of a text selection.
 *
 * @since 3.19.0
 */
export interface TextSelection {
	text: string;
	offset: number;
}

/**
 * Props for the TrafficBoostPreview component.
 *
 * @since 3.19.0
 */
interface TrafficBoostPreviewProps {
	activeLink: TrafficBoostLink;
	onAccept: ( link: TrafficBoostLink, selectedText: TextSelection | null ) => Promise<boolean>;
	onDiscard: ( link: TrafficBoostLink ) => Promise<void>;
	onRemoveInboundLink: ( link: TrafficBoostLink, restoreOriginal: boolean ) => Promise<boolean>;
	onUpdateInboundLink: ( link: TrafficBoostLink, text: string, offset: number, restoreOriginal: boolean ) => Promise<boolean>;
}

/**
 * Component that renders the Traffic Boost preview.
 *
 * @since 3.19.0
 *
 * @param {TrafficBoostPreviewProps} props The component's props.
 */
export const TrafficBoostPreview = ( {
	activeLink: providedActiveLink,
	onAccept,
	onDiscard,
	onRemoveInboundLink,
	onUpdateInboundLink,
}: TrafficBoostPreviewProps ): React.JSX.Element => {
	const [ isFrontendPreview, setIsFrontendPreview ] = useState<boolean>( false );
	const [ isInboundLink, setIsInboundLink ] = useState<boolean>( false );
	const [ isLoading, setIsLoading ] = useState<boolean>( true );

	const [ activeLink, setActiveLink ] = useState<TrafficBoostLink>( providedActiveLink );
	const [ activePost, setActivePost ] = useState<HydratedPost>( providedActiveLink.targetPost );

	const [ selectedText, setSelectedText ] = useState<TextSelection | null>( null );
	const [ previewUrl, setPreviewUrl ] = useState<string>( '' );
	const [ totalItems, setTotalItems ] = useState<number>( 0 );
	const [ itemIndex, setItemIndex ] = useState<number>( 0 );

	const {
		createSuccessNotice,
		createErrorNotice,
	} = useDispatch( 'core/notices' );

	const {
		post,
		suggestions,
		inboundLinks,
	} = useSelect( ( select ) => {
		return {
			post: select( TrafficBoostStore ).getCurrentPost(),
			suggestions: select( TrafficBoostStore ).getSuggestions(),
			inboundLinks: select( TrafficBoostStore ).getInboundLinks(),
		};
	}, [ ] );

	const {
		setSelectedLink,
		removeSuggestion,
		removeInboundLink,
		addInboundLink,
		setSelectedTab,
		setIsAccepting,
		setIsRemoving,
	} = useDispatch( TrafficBoostStore );

	/**
	 * Sets the active link to the provided active link.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		setActiveLink( providedActiveLink );
	}, [ providedActiveLink ] );

	/**
	 * Sets the active post to the target post of the active link,
	 * and unsets the text selection when the active link changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		setActivePost( activeLink.targetPost );
		setIsInboundLink( ! activeLink.isSuggestion );
		setSelectedText( null );
	}, [ activeLink ] );

	/**
	 * Sets the total items and item index based on the active link.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( activeLink.isSuggestion ) {
			setTotalItems( suggestions?.length ?? 0 );
			setItemIndex( suggestions?.indexOf( activeLink ) + 1 );
		} else {
			setTotalItems( inboundLinks?.length ?? 0 );
			setItemIndex( inboundLinks?.indexOf( activeLink ) + 1 );
		}
	}, [ activeLink, inboundLinks, suggestions ] );

	/**
	 * Sets the preview URL based on the active post and frontend preview setting.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( ! activePost ) {
			return;
		}

		const newUrl = ! isFrontendPreview
			? addQueryArgs( `${ window.location.origin }/wp-admin/admin-ajax.php`, {
				action: 'parsely_post_preview',
				post_id: activePost.id,
				_wpnonce: window._parsely_traffic_boost_preview_nonce ?? '',
				smart_link_id: activeLink.smartLink?.smart_link_id,
			} )
			: addQueryArgs( activePost.link, {
				parsely_preview: 'true',
				_wpnonce: window._parsely_traffic_boost_preview_nonce ?? '',
				smart_link_id: activeLink.smartLink?.smart_link_id,
			} );

		// Only set loading state if URL actually changes.
		if ( newUrl !== previewUrl ) {
			setIsLoading( true );
			setPreviewUrl( newUrl );
		}
	}, [ activePost, isFrontendPreview, previewUrl ] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Use useCallback for onRestoreOriginal to maintain reference stability
	const handleRestoreOriginal = useCallback( () => {
		setSelectedText( null );
	}, [] );

	/**
	 * Opens the post in a new tab.
	 *
	 * @since 3.19.0
	 */
	const openPostInNewTab = () => {
		if ( ! activePost?.link ) {
			return;
		}

		window.open( activePost.link, '_blank', 'noopener' );
	};

	/**
	 * Opens the post editor in a new tab.
	 *
	 * @since 3.19.0
	 */
	const openPostEditor = () => {
		if ( ! activePost?.id ) {
			return;
		}

		window.open( `${ window.location.origin }/wp-admin/post.php?post=${ activePost.id }&action=edit`, '_blank', 'noopener' );
	};

	/**
	 * Opens the Parse.ly dashboard for this post in a new tab.
	 *
	 * @since 3.19.0
	 */
	const openParselyDashboard = () => {
		if ( ! activePost?.link ) {
			return;
		}

		const parselyDashboardUrl = `https://dash.parsely.com/${ window.wpParselySiteId }/find?url=${ encodeURIComponent( activePost.link ) }`;
		window.open( parselyDashboardUrl, '_blank', 'noopener' );
	};

	/**
	 * Handles the next item event.
	 *
	 * @since 3.19.0
	 */
	const handleNext = () => {
		let nextItem: TrafficBoostLink | undefined;

		if ( isInboundLink ) {
			nextItem = inboundLinks?.[ itemIndex ];
		} else {
			nextItem = suggestions?.[ itemIndex ];
		}
		if ( nextItem ) {
			setItemIndex( itemIndex + 1 );
			setSelectedLink( nextItem );
		}
	};

	/**
	 * Handles the previous item event.
	 *
	 * @since 3.19.0
	 */
	const handlePrevious = () => {
		let previousItem: TrafficBoostLink | undefined;

		if ( isInboundLink ) {
			previousItem = inboundLinks?.[ itemIndex - 2 ];
		} else {
			previousItem = suggestions?.[ itemIndex - 2 ];
		}

		if ( previousItem ) {
			setItemIndex( itemIndex - 1 );
			setSelectedLink( previousItem );
		}
	};

	/**
	 * Handles the accept event.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link The link to accept.
	 */
	const handleAccept = async ( link: TrafficBoostLink ) => {
		setIsAccepting( link, true );

		try {
			// Accept the suggestion.
			const accepted = await onAccept( link, selectedText );

			if ( ! accepted ) {
				throw new ContentHelperError(
					__( 'Failed to accept suggestion.', 'wp-parsely' ),
					ContentHelperErrorCode.UnknownError,
					'' // No prefix for this error.
				);
			}
		} catch ( err: unknown ) {
			let errorMessage = __( 'Failed to accept suggestion.', 'wp-parsely' );
			if ( err instanceof ContentHelperError && err.message && err.code !== ContentHelperErrorCode.UnknownError ) {
				errorMessage += ` ${ err.message }`;
			}

			createErrorNotice(
				errorMessage,
				{
					type: 'snackbar',
					icon: <Icon icon={ error } />,
				}
			);
			setIsAccepting( link, false );
			return;
		}

		// Remove suggestion from the list.
		removeSuggestion( link );

		// Flag isSuggestion to false.
		link.isSuggestion = false;

		// Add the link to the inbound links list.
		addInboundLink( link );

		setIsAccepting( link, false );

		// Show a snackbar success message.
		createSuccessNotice(
			__( 'Link planted', 'wp-parsely' ),
			{
				type: 'snackbar',
				icon: <Icon icon={ linkIcon } />,
			}
		);

		// When accepting the only remaining suggestion, switch to inbound links tab.
		if ( itemIndex === totalItems && totalItems === 1 ) {
			setSelectedTab( TrafficBoostSidebarTabs.INBOUND_LINKS );
			setSelectedLink( link );
			// Refresh the iframe.
			setPreviewUrl( previewUrl + '?cache-bust=' + Date.now() );
		} else if ( itemIndex === totalItems ) {
			// Navigate to previous suggestion when accepting the last one.
			handlePrevious();
		} else {
			// Move to next suggestion after accepting current one.
			handleNext();
		}
	};

	/**
	 * Discards a suggestion.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link The link to discard.
	 */
	const handleDiscard = async ( link: TrafficBoostLink ) => {
		await onDiscard( link );

		// Remove the suggestion from the list.
		removeSuggestion( link );

		// When discarding the only remaining suggestion, switch to inbound links tab.
		if ( itemIndex === totalItems && totalItems === 1 ) {
			setSelectedLink( null );
		} else if ( itemIndex === totalItems ) {
			// Navigate to previous suggestion when discarding the last one.
			handlePrevious();
		} else {
			// Move to next suggestion after discarding current one.
			handleNext();
		}
	};

	/**
	 * Removes an inbound link.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link            The link to remove.
	 * @param {boolean}          restoreOriginal Whether to restore the original link.
	 */
	const handleRemove = async ( link: TrafficBoostLink, restoreOriginal: boolean ) => {
		setIsRemoving( link, true );

		try {
			const removed = await onRemoveInboundLink( link, restoreOriginal );

			if ( ! removed ) {
				throw new ContentHelperError(
					__( 'Failed to remove link.', 'wp-parsely' ),
					ContentHelperErrorCode.UnknownError,
					'' // No prefix for this error.
				);
			}
		} catch ( err: unknown ) {
			let errorMessage = __( 'Failed to remove link.', 'wp-parsely' );
			if ( err instanceof ContentHelperError && err.message && err.code !== ContentHelperErrorCode.UnknownError ) {
				errorMessage += ` ${ err.message }`;
			}

			createErrorNotice(
				errorMessage,
				{
					type: 'snackbar',
					icon: <Icon icon={ error } />,
				}
			);
			setIsRemoving( link, false );
			return;
		}

		removeInboundLink( link );
		setIsRemoving( link, false );

		// Show a snackbar success message.
		createSuccessNotice(
			__( 'Link removed', 'wp-parsely' ),
			{
				type: 'snackbar',
				icon: <Icon icon={ linkOff } />,
			}
		);

		// When removing the only remaining inbound link, switch to inbound links tab.
		if ( itemIndex === totalItems && totalItems === 1 ) {
			setSelectedLink( null );
		} else if ( itemIndex === totalItems ) {
			// Navigate to previous inbound link when removing the last one.
			handlePrevious();
		} else {
			// Move to next inbound link after removing current one.
			handleNext();
		}
	};

	/**
	 * Handles the update link event.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link            The link to update.
	 * @param {boolean}          restoreOriginal Whether to restore the original link.
	 */
	const handleUpdateLink = async ( link: TrafficBoostLink, restoreOriginal: boolean ) => {
		if ( ! selectedText ) {
			return;
		}

		setIsAccepting( link, true );

		try {
			const updated = await onUpdateInboundLink( link, selectedText.text, selectedText.offset, restoreOriginal );

			if ( ! updated ) {
				throw new ContentHelperError(
					__( 'Failed to update link.', 'wp-parsely' ),
					ContentHelperErrorCode.UnknownError,
					'' // No prefix for this error.
				);
			}
		} catch ( err: unknown ) {
			let errorMessage = __( 'Failed to update link.', 'wp-parsely' );
			if ( err instanceof ContentHelperError && err.message && err.code !== ContentHelperErrorCode.UnknownError ) {
				errorMessage += ` ${ err.message }`;
			}

			createErrorNotice(
				errorMessage,
				{
					type: 'snackbar',
					icon: <Icon icon={ error } />,
				}
			);
			setIsAccepting( link, false );
			return;
		}

		setIsAccepting( link, false );

		// Show a snackbar success message.
		createSuccessNotice(
			__( 'Link updated', 'wp-parsely' ),
			{
				type: 'snackbar',
				icon: <Icon icon={ linkIcon } />,
			}
		);

		// Refresh the iframe.
		setPreviewUrl( previewUrl + '?cache-bust=' + Date.now() );

		// Clear the selected text.
		setSelectedText( null );
	};

	if ( ! activePost || ! post ) {
		return <></>;
	}

	return (
		<div className="traffic-boost-preview">
			<PreviewHeader
				isLoading={ isLoading }
				activeLink={ activeLink }
				onOpenPostInNewTab={ openPostInNewTab }
				onOpenPostEditor={ openPostEditor }
				onOpenParselyDashboard={ openParselyDashboard }
				isFrontendPreview={ isFrontendPreview }
				setIsFrontendPreview={ setIsFrontendPreview }
			/>

			<PreviewIframe
				activeLink={ activeLink }
				previewUrl={ previewUrl }
				isLoading={ isLoading }
				selectedText={ selectedText }
				onTextSelected={ ( text, offset ) => {
					setSelectedText( { text, offset } );
				} }
				onRestoreOriginal={ handleRestoreOriginal }
				isFrontendPreview={ isFrontendPreview }
				onLoadingChange={ setIsLoading }
				onAccept={ handleAccept }
				onDiscard={ handleDiscard }
				onUpdateLink={ handleUpdateLink }
				onRemove={ handleRemove }
			/>

			<PreviewFooter
				activeLink={ activeLink }
				totalItems={ totalItems }
				itemIndex={ itemIndex }
				onNext={ handleNext }
				onPrevious={ handlePrevious }
			/>
		</div>
	);
};
