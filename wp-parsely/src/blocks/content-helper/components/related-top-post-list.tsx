/**
 * External dependencies
 */
import { Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ContentHelperProvider from '../content-helper-provider';
import RelatedTopPostListItem from './related-top-post-list-item';
import { ContentHelperError } from '../content-helper-error';
import { getDateInUserLang, SHORT_DATE_FORMAT } from '../../shared/utils/date';
import { RelatedTopPostData } from '../models/related-top-post-data';

const FETCH_RETRIES = 3;

/**
 * List of the related top posts.
 */
function RelatedTopPostList() {
	const [ loading, setLoading ] = useState<boolean>( true );
	const [ error, setError ] = useState<ContentHelperError>( null );
	const [ message, setMessage ] = useState<string>( null );
	const [ posts, setPosts ] = useState<RelatedTopPostData[]>( [] );

	useEffect( () => {
		const fetchPosts = async ( retries: number ) => {
			ContentHelperProvider.getRelatedTopPosts()
				.then( ( result ): void => {
					const mappedPosts: RelatedTopPostData[] = result.posts.map(
						( post: RelatedTopPostData ): RelatedTopPostData => (
							{
								...post,
								date: getDateInUserLang( new Date( post.date ), SHORT_DATE_FORMAT ),
							}
						)
					);

					setPosts( mappedPosts );
					setMessage( result.message );
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
			setMessage( '' );
			setError( null );
		};
	}, [] );

	// Show error message.
	if ( error ) {
		return error.ProcessedMessage( 'parsely-top-posts-descr' );
	}

	// Show related top posts list.
	const postList: JSX.Element = (
		<ol className="parsely-top-posts">
			{ posts.map( ( post: RelatedTopPostData ): JSX.Element => <RelatedTopPostListItem key={ post.id } post={ post } /> ) }
		</ol>
	);

	return (
		loading
			?	(
				<div className="parsely-spinner-wrapper" data-testid="parsely-spinner-wrapper">
					<Spinner />
				</div>
			)
			: (
				<div className="parsely-top-posts-wrapper">
					<p className="parsely-top-posts-descr" data-testid="parsely-top-posts-descr">{ message }</p>
					{ postList }
				</div>
			)
	);
}

export default RelatedTopPostList;
