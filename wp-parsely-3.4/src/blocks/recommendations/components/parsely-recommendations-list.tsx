/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ParselyRecommendationsListItem from './parsely-recommendations-list-item';
import { Recommendation } from '../models/Recommendation';

interface ParselyRecommendationsListProps {
	imagestyle: string;
	recommendations: Recommendation[];
	showimages: boolean;
}

const ParselyRecommendationsList = ( { imagestyle, recommendations, showimages }: ParselyRecommendationsListProps ) => (
	<ul className="parsely-recommendations-list">
		{ recommendations.map( ( recommendation, index ) => (
			<ParselyRecommendationsListItem
				imagestyle={ imagestyle }
				imageAlt={ __( 'Image for link', 'wp-parsely' ) }
				key={ index }
				recommendation={ recommendation }
				showimages={ showimages }
			/>
		) ) }
	</ul>
);

export default ParselyRecommendationsList;
