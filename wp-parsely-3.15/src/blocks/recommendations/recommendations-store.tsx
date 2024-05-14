/**
 * WordPress dependencies
 */
import { createContext, useContext, useMemo, useReducer } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { RecommendationsAction } from './constants';
import { Recommendation } from './models/Recommendation';

interface RecommendationState {
	isLoaded: boolean;
	recommendations: Recommendation[];
	uuid: string | null;
	clientId: string | null;
	error: Error | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RecommendationsContext = createContext( {} as any );

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reducer = ( state: RecommendationState, action: any ): RecommendationState => {
	switch ( action.type ) {
		case RecommendationsAction.Error:
			return { ...state, isLoaded: true, error: action.error, recommendations: [] };
		case RecommendationsAction.Loaded:
			return { ...state, isLoaded: true };
		case RecommendationsAction.Recommendations: {
			const { recommendations } = action;
			if ( ! Array.isArray( recommendations ) ) {
				return { ...state, recommendations: [] };
			}
			const validRecommendations = recommendations.map(
				// eslint-disable-next-line camelcase
				( { title, url, image_url, thumb_url_medium } ) => ( {
					title,
					url,
					image_url, // eslint-disable-line camelcase
					thumb_url_medium, // eslint-disable-line camelcase
				} )
			);
			return { ...state, isLoaded: true, error: null, recommendations: validRecommendations };
		}
		default:
			return { ...state };
	}
};

interface RecommendationStore {
	clientId?: string;
	children: React.ReactNode;
}

export const RecommendationsStore = ( props: RecommendationStore ) => {
	const defaultState: RecommendationState = {
		isLoaded: false,
		recommendations: [],
		uuid: window.PARSELY?.config?.uuid ?? null,
		clientId: props?.clientId ?? null,
		error: null,
	};

	const [ state, dispatch ] = useReducer( reducer, defaultState );
	return useMemo( () => {
		return <RecommendationsContext.Provider value={ { state, dispatch } } { ...props } />;
	}, [ props, state ] );
};

export const useRecommendationsStore = () => useContext( RecommendationsContext );
