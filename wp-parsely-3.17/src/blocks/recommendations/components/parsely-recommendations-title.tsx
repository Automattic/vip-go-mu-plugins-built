interface ParselyRecommendationsTitleProps {
	title: string;
}

export const ParselyRecommendationsTitle = ( { title }: ParselyRecommendationsTitleProps ) => (
	title ? <p className="parsely-recommendations-list-title">{ title }</p> : <></>
);
