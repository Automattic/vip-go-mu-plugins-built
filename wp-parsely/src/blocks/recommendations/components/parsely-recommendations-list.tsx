/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Recommendation } from '../models/Recommendation';
import { ParselyRecommendationsListItem } from './parsely-recommendations-list-item';

interface ParselyRecommendationsListProps {
	imagestyle: string;
	openlinksinnewtab: boolean;
	recommendations: Recommendation[];
	showimages: boolean;
}

export const ParselyRecommendationsList = ( { imagestyle, recommendations, showimages, openlinksinnewtab }: ParselyRecommendationsListProps ) => (
	<ul className="parsely-recommendations-list">
		{ recommendations.map( ( recommendation ) => (
			<ParselyRecommendationsListItem
				imageAlt={ __( 'Image for link', 'wp-parsely' ) }
				imagestyle={ imagestyle }
				key={ recommendation.url + ' ' + recommendation.title }
				openlinksinnewtab={ openlinksinnewtab }
				recommendation={ recommendation }
				showimages={ showimages }
			/>
		) ) }
	</ul>
);
