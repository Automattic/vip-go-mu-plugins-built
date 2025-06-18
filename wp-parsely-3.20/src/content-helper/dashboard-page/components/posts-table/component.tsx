/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalNumberControl as NumberControl,
	Spinner,
} from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	chevronLeft,
	chevronRight,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	ContentHelperError, ContentHelperErrorCode,
} from '../../../common/content-helper-error';
import { HydratedPost, QueryParams } from '../../../common/providers/base-wordpress-provider';
import { PostStats, StatsProvider } from '../../../common/providers/stats-provider';
import { DashboardProvider } from '../../provider';
import { SinglePostRow } from './components/single-post-row';

/**
 * TablePagination component.
 *
 * Represents the pagination controls for the PostsTable.
 *
 * @since 3.19.0
 *
 * @param {Object}   props                The component's props.
 * @param {boolean}  props.isLoading      Whether the posts are loading.
 * @param {number}   props.currentPage    The current page.
 * @param {Function} props.setCurrentPage The function to set the current page.
 * @param {number}   props.totalPages     The total number of pages.
 * @param {Function} props.onPrevious     The function to handle the previous button click.
 * @param {Function} props.onNext         The function to handle the next button click.
 */
const TablePagination = ( {
	isLoading,
	currentPage,
	setCurrentPage,
	totalPages,
	onPrevious,
	onNext,
}: {
	isLoading: boolean;
	currentPage: number;
	setCurrentPage: ( value: number ) => void;
	totalPages: number;
	onPrevious: () => void;
	onNext: () => void;
} ): React.JSX.Element => {
	return (
		<div className="posts-table-pagination-controls">
			{ isLoading && <Spinner /> }
			<div className="page-selector">
				<span>{ __( 'Page', 'wp-parsely' ) }</span>
				<NumberControl
					disabled={ isLoading }
					value={ currentPage }
					onChange={ ( value ) => {
						let selectedPage = parseInt( value ?? '1', 10 );
						if ( selectedPage > totalPages ) {
							selectedPage = totalPages;
						} else if ( selectedPage < 1 ) {
							selectedPage = 1;
						}

						setCurrentPage( selectedPage );
					} }
					min={ 1 }
					max={ totalPages }
					dragDirection="e"
				/>
				<span>{ __( 'of', 'wp-parsely' ) } { totalPages }</span>
			</div>
			<div className="page-navigation">
				<Button icon={ chevronLeft } onClick={ onPrevious } disabled={ currentPage === 1 || isLoading } />
				<Button icon={ chevronRight } onClick={ onNext } disabled={ currentPage >= totalPages || isLoading } />
			</div>
		</div>
	);
};

/**
 * Type definition for the PostsTable component.
 *
 * @since 3.19.0
 */
type PostsTableType = {
	query?: QueryParams;
	currentPage: number;
	setCurrentPage: ( value: number | ( ( prev: number ) => number ) ) => void;
	hideHeader?: boolean;
	hidePagination?: boolean;
	hideLoading?: boolean;
	hideStats?: boolean;
	hideActions?: boolean;
	compact?: boolean;
	noResultsMessage?: React.ReactNode;
	className?: string;
	onPostClick?: ( post: HydratedPost ) => void;
};

/**
 * PostsTable component.
 *
 * Represents a table of posts, that support custom queries and pagination.
 *
 * @since 3.19.0
 *
 * @param {PostsTableType} props The component's props.
 */
export const PostsTable = ( {
	query = {},
	currentPage,
	setCurrentPage,
	hideHeader = false,
	hidePagination = false,
	hideLoading = false,
	hideStats = false,
	hideActions = false,
	compact = false,
	noResultsMessage = __( 'No posts found.', 'wp-parsely' ),
	className,
	onPostClick,
}: PostsTableType ): React.JSX.Element => {
	// TODO: Add a global state to store the posts for faster loading.
	const [ posts, setPosts ] = useState<HydratedPost[]>( [] );
	const [ stats, setStats ] = useState<PostStats[]>( [] );

	const [ totalPages, setTotalPages ] = useState<number>( 1 );
	const [ itemsPerPage ] = useState<number>( query.per_page ?? 10 );

	const [ isLoading, setIsLoading ] = useState<boolean>( true );
	const [ isLoadingStats, setIsLoadingStats ] = useState<boolean>( true );

	const [ error, setError ] = useState<ContentHelperError>();

	const didFirstSearch = useRef( false );

	/**
	 * Fetches posts from the API, using the query and pagination.
	 *
	 * @since 3.19.0
	 */
	useEffect( () => {
		const fetchPosts = async () => {
			try {
				const fetchedPosts = await DashboardProvider.getInstance().getPosts( {
					context: 'embed',
					...query,
					per_page: itemsPerPage,
					page: currentPage,
				} );

				if ( ! hideStats ) {
					// Fetch the stats for the posts.
					const fetchedStats = await StatsProvider.getInstance().getStatsForPosts( fetchedPosts.data, {
						limit: fetchedPosts.data.length,
						period_start: '30d',
						page: 1,
						campaign_id: 'wp-parsely',
						campaign_medium: 'smart-link',
					} );

					setStats( fetchedStats );
				}

				// Set the posts and total pages after fetching the stats.
				setPosts( fetchedPosts.data );
				setTotalPages( fetchedPosts.total_pages );
				didFirstSearch.current = true;
			} catch ( fetchError: unknown ) {
				console.error( fetchError ); // eslint-disable-line no-console

				if ( fetchError instanceof ContentHelperError ) {
					setError( fetchError );
				}

				if ( fetchError instanceof Error ) {
					setError( new ContentHelperError(
						fetchError.message,
						ContentHelperErrorCode.UnknownError )
					);
				}
			} finally {
				setIsLoading( false );
				setIsLoadingStats( false );
			}
		};

		setIsLoading( true );
		setIsLoadingStats( true );

		fetchPosts();
	}, [ currentPage, itemsPerPage, query, hideStats ] );

	/**
	 * Handles when the initial stats loading fails.
	 *
	 * It tries to fetch the stats again for this URL, but instead try with the WordPress permalink.
	 *
	 * @since 3.19.0
	 *
	 * @param {HydratedPost} post The post to fetch the stats for.
	 */
	const onErrorLoadingStats = useCallback( async ( post: HydratedPost ) => {
		try {
			// Try to fetch the stats again for this URL, but instead try with the WordPress permalink.
			// The API will then try to convert the permalink to a canonical URL, and use
			// both the permalink and the canonical URL to fetch the stats.
			const fetchedStats = await StatsProvider.getInstance().getStatsForPosts( [ post ], {
				limit: 1,
				period_start: '30d',
				page: 1,
				campaign_id: 'wp-parsely',
				campaign_medium: 'smart-link',
				use_wp_permalink: true,
			} );

			setStats( ( prevStats ) => [ ...prevStats, fetchedStats[ 0 ] ] );
		} catch ( fetchError ) {
			console.error( fetchError ); // eslint-disable-line no-console
		}
	}, [] );

	/**
	 * Handles the previous button click.
	 *
	 * @since 3.19.0
	 */
	const handlePrevious = () => {
		setCurrentPage( ( prev ) => Math.max( prev - 1, 1 ) );
	};

	/**
	 * Handles the next button click.
	 *
	 * @since 3.19.0
	 */
	const handleNext = () => {
		setCurrentPage( ( prev ) => prev + 1 );
	};

	/**
	 * Gets the stats for a specific post.
	 *
	 * @since 3.19.0
	 *
	 * @param {HydratedPost} post The post to get the stats for.
	 * @return {PostStats} The stats for the post.
	 */
	const getStatsForPost = useCallback( ( post: HydratedPost ) => {
		return stats.find( ( stat ) => stat.postId === post.id );
	}, [ stats ] );

	const tableClasses: string[] = [ 'parsely-table-container' ];
	if ( className ) {
		tableClasses.push( className );
	}

	// Hide the table if loading and hideLoading is true.
	if ( isLoading && hideLoading && ! didFirstSearch.current ) {
		return <></>;
	}

	// Show a loading spinner if the posts are still loading.
	if ( isLoading && ! hideLoading && posts.length === 0 ) {
		tableClasses.push( 'is-loading' );
		return (
			<div className={ tableClasses.join( ' ' ) }>
				<Spinner />
			</div>
		);
	}

	if ( error && error.code !== ContentHelperErrorCode.ParselyApiReturnedNoData ) {
		return (
			<div className="parsely-table-container no-results">
				{ error.Message() }
			</div>
		);
	}

	// Show a "no results" message if there are no posts.
	if ( posts.length === 0 ) {
		return (
			<div className="parsely-table-container no-results">
				{ noResultsMessage }
			</div>
		);
	}

	if ( hideHeader ) {
		tableClasses.push( 'hide-header' );
	}
	if ( hidePagination ) {
		tableClasses.push( 'hide-pagination' );
	}
	if ( compact ) {
		tableClasses.push( 'compact' );
	}

	return (
		<div className={ tableClasses.join( ' ' ) }>
			<table className={ tableClasses.join( ' ' ) }>
				{ ! hideHeader && (
					<thead>
						<tr>
							<th scope="col" className="post-info-header">{ __( 'POST', 'wp-parsely' ) }</th>
							{ ! compact && (
								<th scope="col" className="views-header">
									{ __( 'VIEWS', 'wp-parsely' ) }
									<span className="views-header-period">{ __( '(30 days)', 'wp-parsely' ) }</span>
								</th>
							) }
						</tr>
					</thead>
				) }
				<tbody>
					{ posts.map( ( post, index ) => (
						<SinglePostRow
							key={ post.id }
							post={ post }
							stats={ getStatsForPost( post ) }
							isLoadingStats={ isLoadingStats }
							index={ index }
							onPostClick={ onPostClick }
							compact={ compact }
							showStats={ ! hideStats }
							showActions={ ! hideActions }
							onErrorLoadingStats={ onErrorLoadingStats }
						/>
					) ) }
				</tbody>
			</table>
			{ ! hidePagination && (
				<TablePagination
					isLoading={ isLoading }
					currentPage={ currentPage }
					setCurrentPage={ setCurrentPage }
					totalPages={ totalPages }
					onPrevious={ handlePrevious }
					onNext={ handleNext }
				/>
			) }
		</div>
	);
};
