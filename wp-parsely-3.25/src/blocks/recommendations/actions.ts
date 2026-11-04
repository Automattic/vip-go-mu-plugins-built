import { RecommendationsAction } from './constants';
import { Recommendation } from './models/Recommendation';

interface SetErrorPayload {
	error: string;
}

interface SetRecommendationsPayload {
	recommendations: Recommendation[];
}

export const setError = ( { error }: SetErrorPayload ) => ( {
	type: RecommendationsAction.Error,
	error,
} );

export const setRecommendations = ( { recommendations }: SetRecommendationsPayload ) => ( {
	type: RecommendationsAction.Recommendations,
	recommendations,
} );

export const setLoaded = () => ( {
	type: RecommendationsAction.Loaded,
} );
