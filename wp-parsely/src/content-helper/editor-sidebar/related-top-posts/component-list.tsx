/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Telemetry } from '../../../js/telemetry/telemetry';
import { ContentHelperError } from '../../common/content-helper-error';
import {
	Metric,
	Period,
	PostFilter,
	PostFilterType,
	isInEnum,
} from '../../common/utils/constants';
import { PostData } from '../../common/utils/post';
import { SidebarPostData } from '../editor-sidebar';
import {
	FilterSelectionControls,
} from './component-filter-selection-controls';
import { RelatedTopPostListItem } from './component-list-item';
import { RelatedTopPostsProvider } from './provider';

const FETCH_RETRIES = 1;

/**
 * Defines the props structure for RelatedTopPostList.
 *
 * @since 3.11.0
 */
interface RelatedTopPostListProps {
	initialFilter: PostFilter;
	metric: Metric;
	onFilterChange: ( type: PostFilterType, value: string ) => void;
	period: Period;
	postData: SidebarPostData;
}

/**
 * List of the related top posts.
 *
 * @param {RelatedTopPostListProps} props The component's props.
 */
export function RelatedTopPostList( {
	initialFilter, metric, onFilterChange, period, postData,
} : Readonly<RelatedTopPostListProps> ): JSX.Element {
	const [ loading, setLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<ContentHelperError>();
	const [ message, setMessage ] = useState<string>();
	const [ posts, setPosts ] = useState<PostData[]>( [] );
	const [ filter, setFilter ] = useState<PostFilter>( initialFilter );

	/**
	 * Updates the filter type and sets its default value.
	 *
	 * @param {string} newFilterType The new filter type.
	 *
	 * @since 3.11.0
	 */
	const updateFilterType = ( newFilterType: string ): void => {
		if ( isInEnum( newFilterType, PostFilterType ) ) {
			let value = '';
			const type = newFilterType as PostFilterType;

			if ( PostFilterType.Tag === type ) {
				value = postData.tags[ 0 ];
			}
			if ( PostFilterType.Section === type ) {
				value = postData.categories[ 0 ];
			}
			if ( PostFilterType.Author === type ) {
				value = postData.authors[ 0 ];
			}

			if ( '' !== value ) {
				onFilterChange( type, value );
				setFilter( { type, value } );
				Telemetry.trackEvent( 'related_top_posts_filter_type_changed', { filter_type: type } );
			}
		}
	};

	/**
	 * Updates the filter value.
	 *
	 * @param {string} newFilterValue The new filter value.
	 *
	 * @since 3.11.0
	 */
	const updateFilterValue = (
		newFilterValue: string | null | undefined
	): void => {
		if ( typeof newFilterValue === 'string' ) {
			onFilterChange( filter.type, newFilterValue );
			setFilter( { ...filter, value: newFilterValue } );
		}
	};

	useEffect( () => {
		/**
		 * Returns the initial filter settings.
		 *
		 * The selection is based on whether the Post has tags or categories
		 * assigned to it. Otherwise, the filter is set to the first author.
		 *
		 * @since 3.11.0
		 *
		 * @return {PostFilter} The initial filter settings.
		 */
		const getInitialFilterSettings = (): PostFilter => {
			let value = '';
			let type = PostFilterType.Unavailable;

			if ( postData.tags.length >= 1 ) {
				type = PostFilterType.Tag;
				value = postData.tags[ 0 ];
			} else if ( postData.categories.length >= 1 ) {
				type = PostFilterType.Section;
				value = postData.categories[ 0 ];
			} else {
				type = PostFilterType.Author;
				value = postData.authors[ 0 ];
			}

			return { type, value };
		};

		const fetchPosts = async ( retries: number ) => {
			RelatedTopPostsProvider.getRelatedTopPosts( period, metric, filter )
				.then( ( result ): void => {
					setPosts( result.posts );
					setMessage( result.message );
					setLoading( false );
				} )
				.catch( async ( err ) => {
					if ( retries > 0 && err.retryFetch ) {
						await new Promise( ( r ) => setTimeout( r, 500 ) );
						await fetchPosts( retries - 1 );
					} else {
						setLoading( false );
						setError( err );
					}
				} );
		};

		const filterTypeIsTag = PostFilterType.Tag === filter.type;
		const filterTypeIsUnavailable = PostFilterType.Unavailable === filter.type;
		const noTagsExist = 0 === postData.tags.length;
		const tagIsUnavailable = filterTypeIsTag && ! postData.tags.includes( filter.value );

		setLoading( true );
		if ( filterTypeIsUnavailable || ( filterTypeIsTag && noTagsExist ) ) {
			setFilter( getInitialFilterSettings() );
		} else if ( tagIsUnavailable ) {
			setFilter( { type: PostFilterType.Tag, value: postData.tags[ 0 ] } );
		} else {
			fetchPosts( FETCH_RETRIES );
		}

		return (): void => {
			setLoading( false );
			setPosts( [] );
			setMessage( '' );
			setError( undefined );
		};
	}, [ period, metric, filter, postData ] );

	const spinner: JSX.Element = (
		<div className="parsely-spinner-wrapper" data-testid="parsely-spinner-wrapper">
			<Spinner />
		</div>
	);

	const filterSelectionControls = (
		<FilterSelectionControls
			filter={ filter }
			label={ __( 'Filter by', 'wp-parsely' ) }
			onFilterTypeChange={ updateFilterType }
			onFilterValueChange={ updateFilterValue }
			postData={ postData }
		/>
	);

	// Show error message.
	if ( error ) {
		return (
			<>
				{ filterSelectionControls }
				{ error.Message( { className: 'parsely-top-posts-descr' } ) }
			</>
		);
	}

	return (
		<>
			{ filterSelectionControls }
			{ loading ? ( spinner ) : (
				<div className="parsely-top-posts-wrapper">
					<p className="parsely-top-posts-descr" data-testid="parsely-top-posts-descr">{ message }</p>
					<ol className="parsely-top-posts">
						{ posts.map( ( post: PostData ): JSX.Element =>
							<RelatedTopPostListItem
								key={ post.id } metric={ metric } post={ post }
							/>
						) }
					</ol>
				</div>
			) }
		</>
	);
}
