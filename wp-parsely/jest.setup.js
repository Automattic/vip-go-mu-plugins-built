// eslint-disable-next-line @typescript-eslint/no-var-requires
globalThis.TextDecoder = require( 'node:util' ).TextDecoder;
// eslint-disable-next-line @typescript-eslint/no-var-requires
globalThis.TextEncoder = require( 'node:util' ).TextEncoder;

// The tones and personas Editor_Sidebar injects, mirroring Suggestion_Defaults.
// The selectors read them at module load, so they must precede every import.
globalThis.wpParselyContentHelperTones = {
	neutral: 'Neutral',
	formal: 'Formal',
	humorous: 'Humorous',
	confident: 'Confident',
	provocative: 'Provocative',
	serious: 'Serious',
	inspirational: 'Inspirational',
	skeptical: 'Skeptical',
	conversational: 'Conversational',
	analytical: 'Analytical',
};
globalThis.wpParselyContentHelperPersonas = {
	journalist: 'Journalist',
	editorialWriter: 'Editorial Writer',
	investigativeReporter: 'Investigative Reporter',
	techAnalyst: 'Tech Analyst',
	businessAnalyst: 'Business Analyst',
	culturalCommentator: 'Cultural Commentator',
	scienceCorrespondent: 'Science Correspondent',
	politicalAnalyst: 'Political Analyst',
	healthWellnessAdvocate: 'Health and Wellness Advocate',
	environmentalJournalist: 'Environmental Journalist',
};
