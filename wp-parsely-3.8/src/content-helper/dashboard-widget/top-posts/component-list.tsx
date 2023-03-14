/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import DashboardWidgetProvider from '../provider';
import TopPostListItem from './component-list-item';
import { TopPostData } from './model';
import { ContentHelperError } from '../../../blocks/content-helper/content-helper-error';

const FETCH_RETRIES = 3;

/**
 * List of the top posts.
 */
function TopPostList() {
	const [ loading, setLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<ContentHelperError>();
	const [ posts, setPosts ] = useState<TopPostData[]>( [] );

	useEffect( () => {
		const provider = new DashboardWidgetProvider();

		const fetchPosts = async ( retries: number ) => {
			provider.getTopPosts()
				.then( ( result ): void => {
					setPosts( result );
					setLoading( false );
				} )
				.catch( async ( err ) => {
					if ( retries > 0 ) {
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
	}, [] );

	// Show error message.
	if ( error ) {
		return error.ProcessedMessage( 'parsely-top-posts-descr' );
	}

	// Show top posts list.
	const postList: JSX.Element = (
		<ol className="parsely-top-posts">
			{ posts.map( ( post: TopPostData ): JSX.Element => <TopPostListItem key={ post.id } post={ post } /> ) }
		</ol>
	);

	return (
		loading
			?	(
				<div className="parsely-spinner-wrapper">
					<Spinner />
				</div>
			)
			: (
				<div className="parsely-top-posts-wrapper">
					<div className="page-views-title">{ __( 'Page Views', 'wp-parsely' ) }</div>
					{ postList }
				</div>
			)
	);
}

export default TopPostList;
