/**
 * WordPress dependencies
 */
import { Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { ContentHelperError } from '../../common/content-helper-error';
import { Select } from '../../common/select';
import { TopPostData } from '../model';
import { DashboardWidgetProvider } from '../provider';
import { TopPostListItem } from './top-posts-list-item';

const FETCH_RETRIES = 1;

export enum Period {
	Day = '1',
	Week = '7',
	Month = '30',
}

export enum Metric {
	Views = 'views',
	AvgEngaged = 'avg_engaged',
}

/**
 * List of the top posts.
 */
export function TopPosts() {
	const [ loading, setLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<ContentHelperError>();
	const [ posts, setPosts ] = useState<TopPostData[]>( [] );
	const [ period, setPeriodFilter ] = useState<Period>( Period.Week );
	const [ metric, setMetricFilter ] = useState<Metric>( Metric.Views );

	useEffect( () => {
		const provider = new DashboardWidgetProvider();

		const fetchPosts = async ( retries: number ) => {
			provider.getTopPosts( period, metric )
				.then( ( result ): void => {
					setPosts( result );
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

		setLoading( true );
		fetchPosts( FETCH_RETRIES );

		return (): void => {
			setLoading( false );
			setPosts( [] );
			setError( undefined );
		};
	}, [ period, metric ] );

	// Show error message.
	if ( error ) {
		return error.Message( { className: 'parsely-top-posts-descr' } );
	}

	const spinner = (
		<div className="parsely-spinner-wrapper"><Spinner /></div>
	);

	return (
		<div className="parsely-top-posts-wrapper">
			<div className="parsely-top-posts-filters">
				<Select
					defaultValue={ period }
					items={ [
						[ Period.Day, 'Last 24 hours' ],
						[ Period.Week, 'Last 7 days' ],
						[ Period.Month, 'Last 30 days' ],
					] }
					onChange={ ( event ) => {
						if ( Object.values( Period ).includes( event.target.value as Period ) ) {
							setPeriodFilter( event.target.value as Period );
						}
					} }
				/>
				<Select
					defaultValue={ metric }
					items={ [
						[ Metric.Views, 'Page views' ],
						[ Metric.AvgEngaged, 'Avg. Time' ] ] }
					onChange={ ( event ) => {
						if ( Object.values( Metric ).includes( event.target.value as Metric ) ) {
							setMetricFilter( event.target.value as Metric );
						}
					} }
				/>
			</div>
			{
				loading ? ( spinner ) : (
					<ol className="parsely-top-posts">
						{ posts.map( ( post: TopPostData ): JSX.Element =>
							<TopPostListItem key={ post.id } metric={ metric } post={ post } />
						) }
					</ol>
				)
			}
		</div>
	);
}
