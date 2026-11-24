/**
 * WordPress dependencies
 */
import { SearchControl } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../../../js/telemetry/telemetry';
import { PageBody, PageContainer, PageHeader, PostsTable } from '../../components';
import { PageChangeMethod } from '../../components/posts-table/component';
import './traffic-boost.scss';

/**
 * Tracks a page change made through the posts table pagination.
 *
 * @since 3.26.1
 *
 * @param {PageChangeMethod} method How the user changed the page.
 */
const trackPageChange = ( method: PageChangeMethod ): void => {
	Telemetry.trackEvent( 'traffic_boost_page_changed', { method } );
};

/**
 * Tracks a page change made through the page number input.
 *
 * @since 3.26.1
 */
const trackPageInput = (): void => trackPageChange( 'input' );

/**
 * Traffic Boost page component.
 *
 * @since 3.19.0
 */
export const TrafficBoostPage = (): React.JSX.Element => {
	const [ searchQuery, setSearchQuery ] = useState<string>( '' );
	// SearchControl doesn't report edits that match its value, so it gets the
	// typed text rather than the debounced query.
	const [ searchValue, setSearchValue ] = useState<string>( '' );
	const [ currentPage, setCurrentPage ] = useState<number>( 1 );

	const lastTrackedSearch = useRef<string>( '' );
	const appliedSearch = useRef<string>( '' );

	// Stable, so a re-render (a page change, say) doesn't cancel a pending search.
	const applySearch = useCallback( ( value: string ) => {
		// A new query starts a new search, even if it repeats the last tracked
		// one (a search cleared and typed again, say).
		if ( value.trim() !== appliedSearch.current ) {
			appliedSearch.current = value.trim();
			lastTrackedSearch.current = '';
		}

		setSearchQuery( value );
		setCurrentPage( 1 );
	}, [] );
	const debouncedSetSearchQuery = useDebounce( applySearch, 300 );

	// Results load 300 ms after typing stops, even mid-word, so a search is
	// tracked once its results stay up for a second (or the page is left), and
	// not again until the query changes. The query itself is never sent.
	const trackSearch = useCallback( ( search: string, resultCount: number ) => {
		const query = search.trim();

		if ( '' === query || query === lastTrackedSearch.current ) {
			lastTrackedSearch.current = query;
			return;
		}

		lastTrackedSearch.current = query;
		Telemetry.trackEvent( 'traffic_boost_searched', {
			query_length: query.length,
			result_count: resultCount,
		} );
	}, [] );

	// A plain timer rather than useDebounce, which cancels on unmount: a search
	// still pending when the user leaves (clicking a result, say) is sent then.
	const searchInput = useRef<string>( '' );
	const pendingSearch = useRef<{ search: string; resultCount: number } | null>( null );
	const searchTimer = useRef<ReturnType<typeof setTimeout>>();

	const cancelSearchTracking = useCallback( (): void => {
		clearTimeout( searchTimer.current );
		pendingSearch.current = null;
	}, [] );

	const flushSearchTracking = useCallback( (): void => {
		const pending = pendingSearch.current;
		cancelSearchTracking();

		if ( pending ) {
			trackSearch( pending.search, pending.resultCount );
		}
	}, [ cancelSearchTracking, trackSearch ] );

	useEffect( () => flushSearchTracking, [ flushSearchTracking ] );

	const handlePostsLoaded = useCallback( ( search: string, resultCount: number ): void => {
		// A response for a search the user has since typed over.
		if ( search !== searchInput.current ) {
			return;
		}

		clearTimeout( searchTimer.current );
		pendingSearch.current = { search, resultCount };
		searchTimer.current = setTimeout( flushSearchTracking, 1000 );
	}, [ flushSearchTracking ] );

	// Typing again means the search on screen wasn't the one the user wanted,
	// so its pending tracking is dropped. If they type back to that same query,
	// the list doesn't reload and that search goes untracked; that's rarer than
	// counting a pause as a search.
	const handleSearchChange = useCallback( ( value: string ) => {
		setSearchValue( value );
		searchInput.current = value;
		cancelSearchTracking();
		debouncedSetSearchQuery( value );
	}, [ cancelSearchTracking, debouncedSetSearchQuery ] );

	// The page input changes on every keystroke, so only track it once the user
	// pauses. The callback must be stable, or each re-render cancels the debounce.
	const debouncedTrackPageInput = useDebounce( trackPageInput, 1000 );

	const handlePageChange = useCallback( ( method: PageChangeMethod ) => {
		if ( 'input' === method ) {
			debouncedTrackPageInput();
			return;
		}

		trackPageChange( method );
	}, [ debouncedTrackPageInput ] );

	// Memoized, so the re-render on each keystroke doesn't refetch the posts.
	const postsQuery = useMemo( () => ( {
		status: 'publish',
		per_page: 10,
		search: searchQuery,
		search_columns: [ 'post_title', 'post_excerpt' ],
	} ), [ searchQuery ] );

	return (
		<PageContainer name="traffic-boost">
			<PageHeader>
				<h1>{ __( 'Manage Engagement Boost (beta)', 'wp-parsely' ) }</h1>
			</PageHeader>
			<PageBody>
				<div className="traffic-boost-search-container">
					<SearchControl
						value={ searchValue }
						onChange={ handleSearchChange }
						label={ __( 'Search', 'wp-parsely' ) }
						placeholder={ __( 'Search', 'wp-parsely' ) }
						__nextHasNoMarginBottom
					/>
				</div>
				<PostsTable
					currentPage={ currentPage }
					setCurrentPage={ setCurrentPage }
					onPageChange={ handlePageChange }
					onPostsLoaded={ handlePostsLoaded }
					query={ postsQuery }
				/>
			</PageBody>
		</PageContainer>
	);
};
