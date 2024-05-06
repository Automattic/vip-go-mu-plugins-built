/**
 * WordPress dependencies
 */
import {
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	SelectControl,
} from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
// eslint-disable-next-line import/named
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { GutenbergFunction } from '../../../@types/gutenberg/types';
import { Telemetry } from '../../../js/telemetry/telemetry';
import { ContentHelperError } from '../../common/content-helper-error';
import { SidebarSettings, useSettings } from '../../common/settings';
import {
	Metric,
	Period,
	PostFilter,
	PostFilterType,
	getMetricDescription,
	getPeriodDescription,
	isInEnum,
} from '../../common/utils/constants';
import { PostData } from '../../common/utils/post';
import { SidebarPostData } from '../editor-sidebar';
import { RelatedPostsFilterSettings } from './component-filter-settings';
import { RelatedPostItem } from './component-item';
import { usePostData } from './hooks';
import { RelatedPostsProvider } from './provider';
import './related-posts.scss';

const FETCH_RETRIES = 1;

/**
 * The Related Posts panel in the Editor Sidebar.
 *
 * @since 3.14.0
 */
export const RelatedPostsPanel = (): JSX.Element => {
	const { settings, setSettings } = useSettings<SidebarSettings>();

	const period = settings.RelatedPosts.Period;
	const metric = settings.RelatedPosts.Metric;

	const [ postData, setPostData ] = useState<SidebarPostData>( {
		authors: [], categories: [], tags: [],
	} );

	/**
	 * Returns the current Post's ID, tags and categories.
	 *
	 * @since 3.11.0
	 * @since 3.14.0 Moved from `editor-sidebar.tsx`.
	 * @since 3.14.3 Moved to a custom usePostData hook in `hooks.ts`.
	 */
	const {
		authors,
		categories,
		tags,
		isReady: isPostDataReady,
	} = usePostData();

	/**
	 * Validates that the passed value is an array of Users or Taxonomies, with
	 * at least one item.
	 *
	 * @since 3.14.4
	 *
	 * @param {unknown} value The value to be validated.
	 *
	 * @return {boolean} Whether validation succeeded.
	 */
	const isArrayOfUsersOrTaxonomies = ( value: unknown ): boolean => {
		if ( ! Array.isArray( value ) || value.length === 0 ) {
			return false;
		}

		// Every array item should have the following required properties.
		return value.every( ( item ) => {
			return 'name' in item && 'id' in item && 'slug' in item &&
				'description' in item && 'link' in item;
		} );
	};

	useEffect( () => {
		if ( ! isPostDataReady ) {
			return;
		}

		/**
		 * Returns the name properties present in the passed value, or an empty
		 * array if any errors occur.
		 *
		 * @since 3.14.4
		 *
		 * @param {unknown} value The value to be processed.
		 *
		 * @return {string[]} The names extracted from the value.
		 */
		const extractNamesAsArray = ( value: unknown ): string[] => {
			if ( ! isArrayOfUsersOrTaxonomies( value ) ) {
				return [];
			}

			const array = value as Array<{ name: string }>;
			return array.map( ( item ) => item.name );
		};

		setPostData( {
			// Pass the data through validation, as `usePostData()` could return
			// unexpected results.
			authors: extractNamesAsArray( authors ),
			categories: extractNamesAsArray( categories ),
			tags: extractNamesAsArray( tags ),
		} );
	}, [ authors, categories, tags, isPostDataReady ] );

	const [ loading, setLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<ContentHelperError>();
	const [ message, setMessage ] = useState<string>();
	const [ posts, setPosts ] = useState<PostData[]>( [] );
	const [ filter, setFilter ] = useState<PostFilter>(
		{
			type: settings.RelatedPosts.FilterBy as PostFilterType,
			value: settings.RelatedPosts.FilterValue,
		}
	);

	const [ postContent, setPostContent ] = useState<string|undefined>( undefined );
	const debouncedSetPostContent = useDebounce( setPostContent, 1000 );
	useSelect( ( select ) => {
		const { getEditedPostContent } = select( 'core/editor' ) as GutenbergFunction;
		debouncedSetPostContent( getEditedPostContent() );
	}, [ debouncedSetPostContent ] );

	/**
	 * Updates all filter settings.
	 *
	 * @since 3.13.0
	 * @since 3.14.0 Renamed from `handleRelatedPostsFilterChange` and
	 * moved from the editor sidebar to the related posts component.
	 *
	 * @param {PostFilterType} filterBy The new filter type.
	 * @param {string}         value    The new filter value.
	 */
	const onFilterChange = ( filterBy: PostFilterType, value: string ): void => {
		setSettings( {
			RelatedPosts: {
				...settings.RelatedPosts,
				FilterBy: filterBy,
				FilterValue: value,
			},
		} );
	};

	/**
	 * Updates the metric setting.
	 *
	 * @since 3.14.0
	 *
	 * @param {string} selection The new metric.
	 */
	const onMetricChange = ( selection: string ) => {
		if ( isInEnum( selection, Metric ) ) {
			setSettings( {
				RelatedPosts: {
					...settings.RelatedPosts,
					Metric: selection as Metric,
				},
			} );
			Telemetry.trackEvent( 'related_posts_metric_changed', { metric: selection } );
		}
	};

	/**
	 * Updates the period setting.
	 *
	 * @since 3.14.0
	 *
	 * @param {string} selection The new period.
	 */
	const onPeriodChange = ( selection: string ) => {
		if ( isInEnum( selection, Period ) ) {
			setSettings( {
				RelatedPosts: {
					...settings.RelatedPosts,
					Period: selection as Period,
				},
			} );
			Telemetry.trackEvent( 'related_posts_period_changed', { period: selection } );
		}
	};

	/**
	 * Updates the filter type and sets its default value.
	 *
	 * @since 3.11.0
	 *
	 * @param {string} newFilterType The new filter type.
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
				Telemetry.trackEvent( 'related_posts_filter_type_changed', { filter_type: type } );
			}
		}
	};

	useEffect( () => {
		/**
		 * Returns whether the post data passed into this component is empty.
		 *
		 * @since 3.14.0
		 *
		 * @return {boolean} Whether the post data is empty.
		 */
		const isPostDataEmpty = (): boolean => {
			return Object.values( postData ).every(
				( value ) => 0 === value.length
			);
		};

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
			} else if ( postData.authors.length >= 1 ) {
				type = PostFilterType.Author;
				value = postData.authors[ 0 ];
			}

			return { type, value };
		};

		const fetchPosts = async ( retries: number ) => {
			RelatedPostsProvider.getRelatedPosts( period, metric, filter )
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

		const filterTypeIsAuthor = PostFilterType.Author === filter.type;
		const filterTypeIsTag = PostFilterType.Tag === filter.type;
		const filterTypeIsSection = PostFilterType.Section === filter.type;
		const filterTypeIsUnavailable = PostFilterType.Unavailable === filter.type;
		const noAuthorsExist = 0 === postData.authors.length;
		const noTagsExist = 0 === postData.tags.length;
		const noCategoriesExist = 0 === postData.categories.length;
		const tagIsUnavailable = filterTypeIsTag && ! postData.tags.includes( filter.value );
		const sectionIsUnavailable = filterTypeIsSection && ! postData.categories.includes( filter.value );

		setLoading( true );
		if ( filterTypeIsUnavailable || ( filterTypeIsTag && noTagsExist ) ||
			( filterTypeIsSection && noCategoriesExist ) || ( filterTypeIsAuthor && noAuthorsExist )
		) {
			if ( ! isPostDataEmpty() ) {
				setFilter( getInitialFilterSettings() );
			}
		} else if ( tagIsUnavailable ) {
			setFilter( { type: PostFilterType.Tag, value: postData.tags[ 0 ] } );
		} else if ( sectionIsUnavailable ) {
			setFilter( { type: PostFilterType.Section, value: postData.categories[ 0 ] } );
		}	else {
			fetchPosts( FETCH_RETRIES );
		}

		return (): void => {
			setLoading( false );
			setPosts( [] );
			setMessage( '' );
			setError( undefined );
		};
	}, [ period, metric, filter, postData ] );

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

	/**
	 * Returns the top related posts message.
	 *
	 * If the filter is by Author: "Top related posts by [post_author] in the [period]."
	 * If the filter is by Section: "Top related posts in the “[section_name]” section in the [period]."
	 * If the filter is by Tag: "Top related posts with the “[wp_term name]” tag in the [period]."
	 *
	 * @since 3.14.0
	 */
	const getTopRelatedPostsMessage = (): string => {
		if ( PostFilterType.Tag === filter.type ) {
			return sprintf(
				/* translators: 1: tag name, 2: period */
				__( 'Top related posts with the “%1$s” tag in the %2$s.', 'wp-parsely' ),
				filter.value, getPeriodDescription( period, true )
			);
		}

		if ( PostFilterType.Section === filter.type ) {
			return sprintf(
				/* translators: 1: section name, 2: period */
				__( 'Top related posts in the “%1$s” section in the %2$s.', 'wp-parsely' ),
				filter.value, getPeriodDescription( period, true )
			);
		}

		if ( PostFilterType.Author === filter.type ) {
			return sprintf(
				/* translators: 1: author name, 2: period */
				__( 'Top related posts by %1$s in the %2$s.', 'wp-parsely' ),
				filter.value, getPeriodDescription( period, true )
			);
		}

		// Fallback to the default message.
		return message ?? '';
	};

	// No filter data could be retrieved. Prevent the component from rendering.
	if ( postData.authors.length === 0 && postData.categories.length === 0 &&
			postData.tags.length === 0
	) {
		return (
			<div className="wp-parsely-related-posts">
				<div className="related-posts-body">
					{ __(
						'Error: No author, section, or tags could be found for this post.',
						'wp-parsely'
					) }
				</div>
			</div>
		);
	}

	return (
		<div className="wp-parsely-related-posts">
			<div className="related-posts-description">
				{ __( 'Find top-performing related posts based on a key metric.', 'wp-parsely' ) }
			</div>
			<div className="related-posts-body">
				<div className="related-posts-settings">
					<SelectControl
						size="__unstable-large"
						onChange={ ( value ) => onMetricChange( value ) }
						prefix={
							<InputControlPrefixWrapper>{ __( 'Metric: ', 'wp-parsely' ) }</InputControlPrefixWrapper>
						}
						value={ metric }
					>
						{ Object.values( Metric ).map( ( value ) => (
							<option key={ value } value={ value }>
								{ getMetricDescription( value ) }
							</option>
						) ) }
					</SelectControl>
					<SelectControl
						size="__unstable-large"
						value={ period }
						prefix={
							<InputControlPrefixWrapper>{ __( 'Period: ', 'wp-parsely' ) } </InputControlPrefixWrapper>
						}
						onChange={ ( selection ) => onPeriodChange( selection ) }
					>
						{ Object.values( Period ).map( ( value ) => (
							<option key={ value } value={ value }>
								{ getPeriodDescription( value ) }
							</option>
						) ) }
					</SelectControl>
				</div>
				{
					<RelatedPostsFilterSettings
						label={ __( 'Filter by', 'wp-parsely' ) }
						filter={ filter }
						onFilterTypeChange={ updateFilterType }
						onFilterValueChange={ updateFilterValue }
						postData={ postData }
					/>
				}

				<div className="related-posts-wrapper">
					<div>
						<p className="related-posts-descr" data-testid="parsely-related-posts-descr">
							{ getTopRelatedPostsMessage() }
						</p>
					</div>
					{ error && (
						error.Message()
					) }
					{ loading && (
						<div
							className="related-posts-loading-message"
							data-testid="parsely-related-posts-loading-message"
						>
							{ __( 'Loading…', 'wp-parsely' ) }
						</div>
					) }
					{ ! loading && ! error && posts.length === 0 && (
						<div className="related-posts-empty" data-testid="parsely-related-posts-empty">
							{ __( 'No related posts found.', 'wp-parsely' ) }
						</div>
					) }
					{ ! loading && posts.length > 0 && (
						<div className="related-posts-list">
							{ posts.map( ( post: PostData ) => (
								<RelatedPostItem
									key={ post.id }
									metric={ metric }
									post={ post }
									postContent={ postContent }
								/>
							) ) }
						</div>
					) }
				</div>
			</div>
		</div>
	);
};
