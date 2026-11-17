/**
 * WordPress dependencies
 */
import { SearchControl } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PageBody, PageContainer, PageHeader, PostsTable } from '../../components';
import './traffic-boost.scss';

/**
 * Traffic Boost page component.
 *
 * @since 3.19.0
 */
export const TrafficBoostPage = (): React.JSX.Element => {
	const [ searchQuery, setSearchQuery ] = useState<string>( '' );
	const debouncedSetSearchQuery = useDebounce( ( value: string ) => {
		setSearchQuery( value );
		setCurrentPage( 1 );
	}, 300 );

	const [ currentPage, setCurrentPage ] = useState<number>( 1 );

	return (
		<PageContainer name="traffic-boost">
			<PageHeader>
				<h1>{ __( 'Manage Engagement Boost (beta)', 'wp-parsely' ) }</h1>
			</PageHeader>
			<PageBody>
				<div className="traffic-boost-search-container">
					<SearchControl
						value={ searchQuery }
						onChange={ debouncedSetSearchQuery }
						label={ __( 'Search', 'wp-parsely' ) }
						placeholder={ __( 'Search', 'wp-parsely' ) }
						__nextHasNoMarginBottom
					/>
				</div>
				<PostsTable
					currentPage={ currentPage }
					setCurrentPage={ setCurrentPage }
					query={ {
						status: 'publish',
						per_page: 10,
						search: searchQuery,
						search_columns: [ 'post_title', 'post_excerpt' ],
					} }
				/>
			</PageBody>
		</PageContainer>
	);
};
