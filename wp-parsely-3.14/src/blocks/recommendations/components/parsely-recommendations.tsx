/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useRecommendationsStore } from '../recommendations-store';
import { ParselyRecommendationsFetcher } from './parsely-recommendations-fetcher';
import { ParselyRecommendationsList } from './parsely-recommendations-list';
import { ParselyRecommendationsTitle } from './parsely-recommendations-title';

interface ParselyRecommendationsProps {
	imagestyle: string;
	isEditMode: boolean;
	limit: number;
	openlinksinnewtab: boolean;
	showimages: boolean;
	sort: string;
	title: string;
}

export function ParselyRecommendations( {
	imagestyle,
	isEditMode,
	limit,
	openlinksinnewtab,
	showimages,
	sort,
	title,
} : Readonly<ParselyRecommendationsProps> ): JSX.Element {
	const {
		state: { error, isLoaded, recommendations },
	} = useRecommendationsStore();

	function getErrorMessage() {
		let message = `${ __( 'Error:', 'wp-parsely' ) } ${ JSON.stringify( error ) }`;
		const httpError = message.includes( '"errors":{"http_request_failed"' ) ||
		( typeof error === 'object' && error?.code === 'fetch_error' );

		if ( httpError ) {
			message = __( 'The Parse.ly Recommendations API is not accessible. You may be offline.', 'wp-parsely' );
		} else if ( message.includes( 'Error: {"code":403,"message":"Forbidden","data":null}' ) ) {
			message = __( 'Access denied. Please verify that your Site ID is valid.', 'wp-parsely' );
		} else if ( typeof error === 'object' && error?.code === 'rest_no_route' ) {
			message = __( 'The REST route is unavailable. To use it, wp_parsely_enable_related_api_proxy should be true.', 'wp-parsely' );
		}

		return message;
	}

	// Show error messages within the WordPress Block Editor when needed.
	let errorMessage;
	if ( isLoaded && isEditMode ) {
		if ( error ) {
			errorMessage = getErrorMessage();
		} else if ( Array.isArray( recommendations ) && ! recommendations?.length ) {
			errorMessage = __( 'No recommendations found.', 'wp-parsely' );
		}
	}

	return (
		<>
			<ParselyRecommendationsFetcher
				limit={ limit }
				sort={ sort }
				isEditMode={ isEditMode }
			/>
			{ ! isLoaded && (
				<span className="parsely-recommendations-loading">{ __( 'Loading…', 'wp-parsely' ) }</span>
			) }
			{ errorMessage && (
				<span className="parsely-recommendations-error">{ errorMessage }</span>
			) }
			{ isLoaded && !! recommendations?.length && (
				<>
					<ParselyRecommendationsTitle title={ title } />
					<ParselyRecommendationsList
						imagestyle={ imagestyle }
						openlinksinnewtab={ openlinksinnewtab }
						recommendations={ recommendations }
						showimages={ showimages }
					/>
				</>
			) }
		</>
	);
}
