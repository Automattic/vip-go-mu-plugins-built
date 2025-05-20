/**
 * External dependencies
 */
import { useLocation, useNavigate, useParams } from 'react-router';

/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { error as errorIcon, update } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { SnackbarNotices } from '../../../common/components/snackbar-notices';
import { ContentHelperError, ContentHelperErrorCode } from '../../../common/content-helper-error';
import { PageContainer } from '../../components';
import { TextSelection, TrafficBoostPreview } from './preview/preview';
import { TrafficBoostLink, TrafficBoostProvider } from './provider';
import { TrafficBoostSidebar } from './sidebar/sidebar';
import { TrafficBoostSidebarTabs, TrafficBoostStore } from './store';
import './traffic-boost.scss';

/**
 * Traffic Boost Post page component.
 *
 * @since 3.19.0
 */
export const TrafficBoostPostPage = (): React.JSX.Element => {
	const { postId } = useParams();
	// Location state is used to pass the post to the page when navigating from the posts table.
	const { state } = useLocation();
	const navigate = useNavigate();

	const [ backgroundColor, setBackgroundColor ] = useState<string | undefined>();
	const [ sidebarWidth, setSidebarWidth ] = useState<number>( 160 ); // Default sidebar width.
	const [ hasFetchedPost, setHasFetchedPost ] = useState<boolean>( false );

	const {
		isLoadingPost,
		error,
		currentPost: post,
		inboundLinks,
		selectedLink,
		settings,
		suggestions,
	} = useSelect( ( select ) => ( {
		isLoadingPost: select( TrafficBoostStore ).isLoadingPost(),
		error: select( TrafficBoostStore ).getError(),
		inboundLinks: select( TrafficBoostStore ).getInboundLinks(),
		currentPost: state?.post ?? select( TrafficBoostStore ).getCurrentPost(),
		selectedLink: select( TrafficBoostStore ).getSelectedLink(),
		settings: select( TrafficBoostStore ).getSettings(),
		suggestions: select( TrafficBoostStore ).getSuggestions(),
	} ), [ state?.post ] );

	const {
		setError,
		setLoading,
		setCurrentPost,
		setSelectedLink,
		setInboundLinks,
		setSuggestions,
		setIsGeneratingSuggestions,
		setSelectedTab,
		updateInboundLink,
		setSuggestionsToGenerate,
	} = useDispatch( TrafficBoostStore );

	const { createSuccessNotice, createErrorNotice } = useDispatch( 'core/notices' );
	const isHardError = error instanceof ContentHelperError && ! error.retryFetch;

	/**
	 * Sets the background color of the page container to the background color of the admin menu.
	 * It also sets the background color of #wpwrap to the background color of the admin menu and
	 * updates the sidebar width to be calculated with the sidebar width into account.
	 *
	 * When the component unmounts, it cancels all the provider requests and cleans up the store state.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		// Set the background color of the page container to the background color of the admin menu.
		const adminMenuBack = document.getElementById( 'adminmenuback' );
		if ( ! adminMenuBack ) {
			return;
		}

		const computedStyle = window.getComputedStyle( adminMenuBack );
		setBackgroundColor( computedStyle.backgroundColor );

		// Set the background color of #wpwrap to the background color of the admin menu.
		const wpWrap = document.querySelector( '#wpwrap' );
		if ( wpWrap ) {
			( wpWrap as HTMLElement ).style.backgroundColor = computedStyle.backgroundColor;
		}

		/**
		 * Updates the sidebar width.
		 *
		 * @since 3.19.0
		 */
		const updateSidebarWidth = () => {
			const width = adminMenuBack.getBoundingClientRect().width;
			setSidebarWidth( width );
		};

		// Grab the sidebar width so it can be used to calculate the container width.
		updateSidebarWidth();

		// Use a ResizeObserver to watch for width changes.
		const resizeObserver = new ResizeObserver( () => {
			updateSidebarWidth();
		} );

		resizeObserver.observe( adminMenuBack );

		return () => {
			// When the component unmounts, make sure to cancel all the provider requests.
			TrafficBoostProvider.getInstance().cancelAll();
			// Disconnect the resize observer.
			resizeObserver.disconnect();
			// Remove the background color of #wpwrap.
			( wpWrap as HTMLElement ).style.backgroundColor = '';

			// Clean up the store state.
			setIsGeneratingSuggestions( false );
			setLoading( false );
			setError( null );
			setInboundLinks( [] );
			setSuggestions( [] );
			setCurrentPost( null );
			setSelectedLink( null );
			setSelectedTab( TrafficBoostSidebarTabs.SUGGESTIONS );
		};
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	/**
	 * Fetches the current post data from the dashboard provider.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		// If the post is passed in the navigation state, use it.
		if ( state?.post ) {
			setCurrentPost( state.post );
			return;
		}

		const fetchPost = async () => {
			if ( ! postId ) {
				return;
			}

			try {
				const fetchedPost = await TrafficBoostProvider.getInstance().getPost( parseInt( postId ) );

				if ( fetchedPost ) {
					setCurrentPost( fetchedPost );
				} else {
					setCurrentPost( null );
				}
			} catch ( err ) {
				setError( err as ContentHelperError );
				console.error( err ); // eslint-disable-line no-console
			} finally {
				setLoading( false, 'post' );
				setHasFetchedPost( true );
			}
		};

		setLoading( true, 'post' );
		fetchPost();
	}, [ postId, setLoading, setCurrentPost, setError, state ] );

	/**
	 * Clears the post and selected link when the component unmounts.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		return () => {
			setCurrentPost( null );
			setSelectedLink( null );
		};
	}, [ setCurrentPost, setSelectedLink ] );

	/**
	 * Hides the preview if there are no suggestions.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( selectedLink?.isSuggestion && 0 === suggestions.length ) {
			setSelectedLink( null );
		}
	}, [ setSelectedLink, suggestions, selectedLink ] );

	/**
	 * Redirects to the Traffic Boost page if no post is found after fetching.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( hasFetchedPost && ! isLoadingPost && ! post ) {
			navigate( '/traffic-boost' );
		}
	}, [ hasFetchedPost, isLoadingPost, post, navigate ] );

	/**
	 * Handles the click event on a suggestion.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link The link that was clicked.
	 */
	const handleLinkClick = ( link: TrafficBoostLink ) => {
		setSelectedLink( link );
	};

	/**
	 * Displays a snackbar for any occurring soft errors.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( ! error || isHardError ) {
			return;
		}

		const message = __( 'There was an issue while fetching the data.', 'wp-parsely' ) + ( error instanceof ContentHelperError
			? ` ${ error.message }`
			: '' );

		createErrorNotice( message, {
			type: 'snackbar',
			icon: <Icon icon={ errorIcon } />,
		} );

		setError( null );
	}, [ error, createErrorNotice, setError, isHardError ] );

	/**
	 * Handles the accept event on a suggestion.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link         The link that was accepted.
	 * @param {TextSelection}    selectedText The selected text.
	 *
	 * @return {Promise<boolean>} Whether the suggestion was accepted.
	 */
	const handleAccept = async ( link: TrafficBoostLink, selectedText: TextSelection | null ): Promise<boolean> => {
		if ( ! link.smartLink || ! post || 0 === link.smartLink.smart_link_id ) {
			return false;
		}

		const { success, didReplaceLink, postContent } = await TrafficBoostProvider.getInstance().acceptSuggestion(
			post.id,
			link.smartLink.smart_link_id,
			{
				text: selectedText?.text,
				offset: selectedText?.offset,
			},
		);

		// Flag the smart link as a link replacement if the suggestion was accepted.
		if ( didReplaceLink ) {
			link.smartLink.is_link_replacement = true;
		}

		link.targetPost.content.raw = postContent;

		return success;
	};

	/**
	 * Handles the discard event on a suggestion.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link The link that was discarded.
	 */
	const handleDiscard = async ( link: TrafficBoostLink ) => {
		if ( ! link.smartLink || ! post || 0 === link.smartLink.smart_link_id ) {
			return;
		}

		// Discard the suggestion in the backend, if it has been saved.
		// Not using await here because we don't need to wait for the response.
		TrafficBoostProvider.getInstance().discardSuggestion( post.id, link.smartLink.smart_link_id );
	};

	/**
	 * Handles the remove event on an inbound link.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link            The link that was removed.
	 * @param {boolean}          restoreOriginal Whether to restore the original link.
	 *
	 * @return {Promise<boolean>} Whether the inbound link was removed.
	 */
	const handleRemoveInboundLink = async ( link: TrafficBoostLink, restoreOriginal: boolean ): Promise<boolean> => {
		if ( ! link.smartLink || ! post || 0 === link.smartLink.smart_link_id ) {
			return false;
		}

		return await TrafficBoostProvider.getInstance().removeInboundLink( post.id, link.smartLink.smart_link_id, restoreOriginal );
	};

	/**
	 * Handles the update event on an inbound link.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} link            The link that was updated.
	 * @param {string}           text            The text of the link.
	 * @param {number}           offset          The offset of the link.
	 * @param {boolean}          restoreOriginal Whether to restore the original link.
	 *
	 * @return {Promise<boolean>} Whether the inbound link was updated.
	 */
	const handleUpdateInboundLink = async ( link: TrafficBoostLink, text: string, offset: number, restoreOriginal: boolean ): Promise<boolean> => {
		if ( ! link.smartLink || ! post || 0 === link.smartLink.smart_link_id ) {
			return false;
		}

		const updatedLink = await TrafficBoostProvider.getInstance().updateInboundLink( post.id, link.smartLink.smart_link_id, {
			text,
			offset,
			restore_original: restoreOriginal,
		} );

		if ( updatedLink ) {
			link.smartLink = updatedLink.data.smart_link;
			link.targetPost.content.raw = updatedLink.data.post_content;
			updateInboundLink( link, link.smartLink.uid );
		}

		return true;
	};

	/**
	 * Fetches the inbound links for the post.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		const fetchInboundLinks = async () => {
			if ( ! postId ) {
				return;
			}

			try {
				setLoading( true, 'inbound-links' );
				const storedInboundLinks = await TrafficBoostProvider.getInstance().getInboundLinks( parseInt( postId ) );

				// Filter out the current post from the inbound links.
				const filteredInboundLinks = storedInboundLinks.filter( ( link ) => link.targetPost?.id !== parseInt( postId ) );

				setInboundLinks( filteredInboundLinks );
			} catch ( err ) {
				if ( err instanceof ContentHelperError ) {
					setError( err );
				} else {
					setError( new ContentHelperError( __( 'Failed to fetch inbound links', 'wp-parsely' ), ContentHelperErrorCode.FetchError ) );
				}
				console.error( err ); // eslint-disable-line no-console
			} finally {
				setLoading( false, 'inbound-links' );
			}
		};

		fetchInboundLinks();
	}, [ postId, setInboundLinks, setError, setLoading ] );

	/**
	 * Fetches suggestions for Boost Links to the current post.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( ! postId ) {
			return;
		}

		const fetchSuggestions = async () => {
			try {
				setError( null );
				setLoading( true, 'suggestions' );
				const trafficBoostProvider = TrafficBoostProvider.getInstance();
				const fetchedSuggestions = await trafficBoostProvider.getExistingSuggestions( parseInt( postId ) );

				// If there are no suggestions, trigger the generation of suggestions.
				if ( 0 === fetchedSuggestions.length ) {
					setIsGeneratingSuggestions( true );

					// Get the existing inbound links permalinks.
					const existingInboundLinksPermalinks = inboundLinks.map(
						( inboundLink ) => [
							inboundLink.smartLink?.post_data?.parsely_canonical_url,
							inboundLink.smartLink?.post_data?.permalink,
						]
					).flat().filter( ( url ) => url !== undefined );

					// Set the initial count of suggestions to generate
					setSuggestionsToGenerate( settings.maxItems );

					// Generate the suggestions in batches.
					await trafficBoostProvider.generateBatchSuggestions(
						parseInt( postId ),
						settings.maxItems,
						{
							urlExclusionList: existingInboundLinksPermalinks,
							discardPrevious: true,
							save: true,
							onNewSuggestions: ( newSuggestions, isFirstIteration ) => {
								// Since we already have suggestions, we can stop loading.
								if ( isFirstIteration ) {
									setLoading( false, 'suggestions' );
								}

								setSuggestions( newSuggestions, false );

								if ( isFirstIteration ) {
									setSelectedLink( newSuggestions[ 0 ] );
								}

								// Update the remaining suggestions count.
								setSuggestionsToGenerate( ( previousCount ) => Math.max( 0, previousCount - newSuggestions.length ) );
							},
						},
					);

					// Show a snackbar success message.
					createSuccessNotice(
						__( 'Finished generating suggestions.', 'wp-parsely' ),
						{
							type: 'snackbar',
							icon: <Icon icon={ update } />,
						}
					);
				} else {
					// Otherwise, set the fetched suggestions.
					setSuggestions( fetchedSuggestions );

					// If there are suggestions, set the first one as the selected link.
					if ( fetchedSuggestions.length > 0 ) {
						setSelectedLink( fetchedSuggestions[ 0 ] );
					}
				}
			} catch ( err ) {
				if ( err instanceof ContentHelperError ) {
					setError( err );
				}
				console.error( err ); // eslint-disable-line no-console
			} finally {
				setIsGeneratingSuggestions( false );
				setLoading( false, 'suggestions' );
			}
		};

		fetchSuggestions();
	}, [ postId ] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<PageContainer
			name="traffic-boost-single-post"
			backgroundColor={ backgroundColor }
			className="traffic-boost-single-post"
			style={ {
				position: 'fixed',
				left: sidebarWidth,
				width: `calc(100% - calc(${ sidebarWidth }px + var(--grid-unit-20)))`,
				transition: 'left 0.3s ease, width 0.3s ease',
			} }
		>
			<style>
				{ `
					#wpfooter {
						display: none;
					}
					#wpbody-content {
						padding-bottom: 0 !important;
					}
				` }
			</style>
			<TrafficBoostSidebar
				onLinkClick={ handleLinkClick }
				hardError={ isHardError ? error : undefined }
			/>
			{ selectedLink && (
				<TrafficBoostPreview
					activeLink={ selectedLink }
					onAccept={ handleAccept }
					onDiscard={ handleDiscard }
					onRemoveInboundLink={ handleRemoveInboundLink }
					onUpdateInboundLink={ handleUpdateInboundLink }
				/>
			) }
			<SnackbarNotices className={ selectedLink ? 'traffic-boost-snackbar-notices' : '' } />
		</PageContainer>
	);
};
