/**
 * WordPress dependencies
 */
import { Button, Spinner } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { next, previous } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { TrafficBoostLink } from '../../../provider';
import './links-list.scss';
import { SingleLink } from './single-link';

/**
 * Defines the props structure for LinksList.
 *
 * @since 3.19.0
 */
interface LinksListProps {
	isLoading: boolean;
	useScrollbar?: boolean;
	children?: React.ReactNode;
	links: TrafficBoostLink[];
	activeLink: TrafficBoostLink | null;
	minItemsPerPage?: number;
	currentPage?: number;
	itemsPerPage?: number;
	onClick?: ( link: TrafficBoostLink ) => void;
	onPageChange?: ( page: number ) => void;
	onItemsPerPageChange?: ( itemsPerPage: number ) => void;
	renderEmptyState?: () => React.JSX.Element;
	showPagination?: boolean;
}

/**
 * Displays a list of Traffic Boost links.
 *
 * @since 3.19.0
 *
 * @param {LinksListProps} props The component's props.
 */
export const LinksList = ( {
	isLoading: isLoadingProp,
	useScrollbar = false,
	children,
	links,
	onClick,
	activeLink,
	minItemsPerPage = 3,
	currentPage = 1,
	itemsPerPage = 3,
	onPageChange,
	onItemsPerPageChange,
	renderEmptyState,
	showPagination = true,
}: LinksListProps ): React.JSX.Element => {
	const [ isLoading, setIsLoading ] = useState( isLoadingProp );
	const [ visibleLinks, setVisibleLinks ] = useState<TrafficBoostLink[]>( [] );
	const [ totalPages, setTotalPages ] = useState<number>( 1 );
	const [ activeLinkPostId, setActiveLinkPostId ] = useState<string | null>( activeLink?.uid ?? null );

	const containerRef = useRef<HTMLDivElement>( null );
	const lastContainerHeight = useRef<number>( 0 );
	const itemRefs = useRef<( HTMLDivElement | null )[]>( [] );

	/**
	 * Calculates the number of items that can fit in the container.
	 *
	 * @since 3.19.0
	 */
	const calculateItemsPerPage = useCallback( () => {
		if ( isLoading || useScrollbar ) {
			return;
		}

		if ( ! containerRef.current ) {
			onItemsPerPageChange?.( minItemsPerPage );
			return;
		}

		const containerHeight = containerRef.current.clientHeight;

		if ( containerHeight === lastContainerHeight.current ) {
			return;
		}
		lastContainerHeight.current = containerHeight;

		const itemHeight = 85;
		const paginationHeight = 60;
		const availableHeight = containerHeight - paginationHeight;
		const calculatedItems = Math.floor( availableHeight / itemHeight );
		const newItemsPerPage = Math.max( minItemsPerPage, calculatedItems );

		onItemsPerPageChange?.( newItemsPerPage );
		setIsLoading( false );
	}, [ isLoading, minItemsPerPage, onItemsPerPageChange, useScrollbar ] );

	useEffect( () => {
		setIsLoading( isLoadingProp );
	}, [ isLoadingProp ] );

	/**
	 * Sets the active link post ID when the active link changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		setActiveLinkPostId( activeLink?.uid ?? null );
	}, [ activeLink ] );

	/**
	 * Handles the scroll of the container to the active link when useScrollbar is true.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( ! useScrollbar || ! activeLink || ! containerRef.current ) {
			return;
		}

		const activeIndex = links.findIndex( ( link ) => link.uid === activeLink.uid );

		if ( -1 !== activeIndex && itemRefs.current[ activeIndex ] ) {
			const container = containerRef.current;
			const activeItem = itemRefs.current[ activeIndex ];

			if ( activeItem ) {
				if ( 0 === activeIndex ) {
					container.scrollTop = 0;
					return;
				}

				const containerRect = container.getBoundingClientRect();
				const activeItemRect = activeItem.getBoundingClientRect();

				// Check if the active item is out of view.
				if ( activeItemRect.top < containerRect.top || activeItemRect.bottom > containerRect.bottom ) {
					activeItem.scrollIntoView( { behavior: 'smooth', block: 'start' } );
				}
			}
		}
	}, [ activeLink, links, useScrollbar ] );

	/**
	 * Sets up the resize observer to recalculate items per page when container size changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( useScrollbar ) {
			return;
		}

		calculateItemsPerPage();

		const resizeObserver = new ResizeObserver( calculateItemsPerPage );

		if ( containerRef.current ) {
			resizeObserver.observe( containerRef.current );
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [ calculateItemsPerPage, useScrollbar ] );

	/**
	 * Updates visible links when page, itemsPerPage, or links change.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( 0 === itemsPerPage || useScrollbar ) {
			return;
		}

		const calculatedTotalPages = Math.max( 1, Math.ceil( links.length / itemsPerPage ) );

		// calculatedTotalPages can return NaN if links.length is 0. If so, set it to 1.
		setTotalPages( calculatedTotalPages || 1 );

		const startIndex = ( currentPage - 1 ) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		setVisibleLinks( links.slice( startIndex, endIndex ) );

		// Adjust current page if it exceeds total pages.
		if ( calculatedTotalPages < currentPage && calculatedTotalPages > 0 ) {
			onPageChange?.( calculatedTotalPages );
		}
	}, [ currentPage, itemsPerPage, links, onPageChange, useScrollbar ] );

	/**
	 * Sets the active link page when the active link changes.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		if ( useScrollbar ) {
			return;
		}

		if ( activeLink && links ) {
			// Find the index of the active link in the full list.
			const activeIndex = links.findIndex( ( link ) =>
				link.uid === activeLink.uid
			);

			if ( -1 !== activeIndex ) {
				// Calculate the correct page number based on the link's position.
				const pageNumber = Math.floor( activeIndex / itemsPerPage ) + 1;
				onPageChange?.( pageNumber );
			}
		}
	}, [ activeLink, links, itemsPerPage, onPageChange, useScrollbar ] );

	/**
	 * Handles navigation to the previous page of suggestions.
	 *
	 * @since 3.19.0
	 */
	const handlePrevious = () => {
		if ( useScrollbar ) {
			return;
		}

		onPageChange?.( Math.max( currentPage - 1, 1 ) );
	};

	/**
	 * Handles navigation to the next page of suggestions.
	 *
	 * @since 3.19.0
	 */
	const handleNext = () => {
		if ( useScrollbar ) {
			return;
		}

		onPageChange?.( Math.min( currentPage + 1, totalPages ) );
	};

	/**
	 * Handles the click event for the single link.
	 *
	 * @since 3.19.0
	 *
	 * @param {TrafficBoostLink} suggestion The suggestion to click.
	 */
	const onSuggestionClickHandler = ( suggestion: TrafficBoostLink ) => {
		setActiveLinkPostId( suggestion.uid );
		onClick?.( suggestion );
	};

	/**
	 * Renders the suggestions list and handles loading and empty state.
	 *
	 * @since 3.19.0
	 */
	const renderLinksList = (): React.JSX.Element | null => {
		if ( isLoading && 0 === visibleLinks.length ) {
			return (
				<div className="traffic-boost-links-list-loading">
					<Spinner />
				</div>
			);
		}

		let linksToRender = visibleLinks;

		// If using the scrollbar, show all links.
		if ( useScrollbar ) {
			linksToRender = links;
		}

		// If we have links data but nothing is visible yet, don't show the "no posts" message.
		const isInitialState = links.length > 0 && 0 === linksToRender.length;
		if ( isInitialState && ! useScrollbar ) {
			return null;
		}

		// If there are no visible links, show the empty state.
		if ( 0 === linksToRender.length ) {
			if ( renderEmptyState ) {
				return renderEmptyState();
			}
			return <p>{ __( 'No posts found.', 'wp-parsely' ) }</p>;
		}

		return (
			<div className="traffic-boost-links-list">
				{ linksToRender.map( ( link: TrafficBoostLink, index ) => {
					return (
						<SingleLink
							key={ link.targetPost.id + ( link.uid ?? '' ) }
							suggestion={ link }
							isActive={ link.uid === activeLinkPostId }
							onClick={ onSuggestionClickHandler }
							ref={ ( el ) => {
								itemRefs.current[ index ] = el;
							} }
						/>
					);
				} ) }
			</div>
		);
	};

	/**
	 * Handles the page change event.
	 *
	 * @since 3.19.0
	 *
	 * @param {string} value The value of the page change.
	 */
	const handlePageChange = ( value?: string ) => {
		if ( ! useScrollbar ) {
			return;
		}

		if ( ! value ) {
			return;
		}

		let selectedPage = parseInt( value, 10 );
		if ( selectedPage > totalPages ) {
			selectedPage = totalPages;
		} else if ( selectedPage < 1 ) {
			selectedPage = 1;
		}
		onPageChange?.( selectedPage );
	};

	return (
		<div
			ref={ containerRef }
			className={ `traffic-boost-links${ useScrollbar ? ' scrollbar' : '' }` }
		>
			{ renderLinksList() }
			<div className="links-pagination">
				<div className="links-pagination-children">
					{ children }
				</div>
				{ ! useScrollbar && ! isLoading && links.length > itemsPerPage && totalPages > 0 && (
					<>
						{ showPagination && (
							<div className="page-selector">
								<span>{ __( 'Page', 'wp-parsely' ) }</span>
								<select
									value={ currentPage }
									onChange={ ( e ) => handlePageChange( e.target.value ) }
								>
									{ Array.from( { length: Math.max( 1, totalPages ) }, ( _, i ) => i + 1 ).map( ( page ) => (
										<option key={ page } value={ page }>
											{ page }
										</option>
									) ) }
								</select>
								<span>
									{ __( 'of', 'wp-parsely' ) } { totalPages }
								</span>
							</div>
						) }
						<div className="page-navigation">
							<Button
								icon={ previous }
								onClick={ handlePrevious }
								disabled={ currentPage <= 1 }
							/>
							<Button
								icon={ next }
								onClick={ handleNext }
								disabled={ currentPage >= totalPages }
							/>
						</div>
					</>
				) }
			</div>
		</div>
	);
};
