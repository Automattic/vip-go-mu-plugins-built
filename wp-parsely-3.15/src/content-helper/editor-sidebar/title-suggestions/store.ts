/**
 * WordPress dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

// Unique identifier for each title in the store.
let titleID = 0;

export interface Title {
	id: number;
	title: string;
	isPinned: boolean;
}
interface TitlesData {
	titles: Title[];
	acceptedTitle?: Title;
	originalTitle?: string;
}
interface TitlesState {
	isLoading: boolean;
	postTitles: TitlesData;
	headings: TitlesData;
}

export enum TitleType {
	PostTitle = 'postTitles',
	Heading = 'headings',
}

interface SetLoadingAction {
	type: 'SET_LOADING';
	isLoading: boolean;
}

interface SetTitlesAction {
	type: 'SET_TITLES';
	titleType: TitleType;
	data: string[];
}

interface SetAcceptedTitleAction {
	type: 'SET_ACCEPTED_TITLE';
	titleType: TitleType;
	title: Title|undefined;
}

interface PinTitleAction {
	type: 'PIN_TITLE';
	titleType: TitleType;
	title: Title;
}

interface UnpinTitleAction {
	type: 'UNPIN_TITLE';
	titleType: TitleType;
	title: Title;
}

interface RemoveTitleAction {
	type: 'REMOVE_TITLE';
	titleType: TitleType;
	title: Title;
}

interface SetOriginalTitleAction {
	type: 'SET_ORIGINAL_TITLE';
	titleType: TitleType;
	title: string|undefined;
}

type ActionTypes = SetLoadingAction | SetTitlesAction |
	RemoveTitleAction | SetAcceptedTitleAction | PinTitleAction | UnpinTitleAction |
	SetOriginalTitleAction;

const defaultState: TitlesState = {
	isLoading: false,
	postTitles: {
		titles: [],
	},
	headings: {
		titles: [],
	},
};

export const TitleStore = createReduxStore( 'wp-parsely/write-titles', {
	initialState: defaultState,
	reducer( state: TitlesState = defaultState, action: ActionTypes ): TitlesState {
		switch ( action.type ) {
			case 'SET_LOADING':
				return {
					...state,
					isLoading: action.isLoading,
				};
			case 'SET_TITLES':
				// Add the new titles to the state but keep the pinned titles
				return {
					...state,
					[ action.titleType ]: {
						...state[ action.titleType ],
						titles: [
							...state[ action.titleType ].titles.filter( ( title ) => title.isPinned ),
							...action.data.map( ( title ) => ( {
								title,
								isPinned: false,
								id: titleID++,
							} ) ),
						],
					},
				};
			case 'REMOVE_TITLE':
				return {
					...state,
					[ action.titleType ]: {
						...state[ action.titleType ],
						titles: state[ action.titleType ].titles.filter(
							( title ) => title.id !== action.title.id
						),
					},
				};
			case 'PIN_TITLE':
				// add title to pinned titles and remove from suggested titles
				return {
					...state,
					[ action.titleType ]: {
						...state[ action.titleType ],
						titles: state[ action.titleType ].titles.map( ( title ) => {
							if ( title.id === action.title.id ) {
								return {
									...title,
									isPinned: true,
								};
							}
							return title;
						} ),
					},
				};
			case 'UNPIN_TITLE':
				return {
					...state,
					[ action.titleType ]: {
						...state[ action.titleType ],
						titles: state[ action.titleType ].titles.map( ( title ) => {
							if ( title.id === action.title.id ) {
								return {
									...title,
									isPinned: false,
								};
							}
							return title;
						} ),
					},
				};
			case 'SET_ACCEPTED_TITLE':
				return {
					...state,
					[ action.titleType ]: {
						...state[ action.titleType ],
						acceptedTitle: action.title,
					},
				};
			case 'SET_ORIGINAL_TITLE':
				return {
					...state,
					[ action.titleType ]: {
						...state[ action.titleType ],
						originalTitle: action.title,
					},
				};
			default:
				return state;
		}
	},
	actions: {
		setLoading( isLoading: boolean ): SetLoadingAction {
			return {
				type: 'SET_LOADING',
				isLoading,
			};
		},
		setTitles( titleType: TitleType, data: string[] ): SetTitlesAction {
			return {
				type: 'SET_TITLES',
				titleType,
				data,
			};
		},
		removeTitle( titleType: TitleType, title: Title ): RemoveTitleAction {
			return {
				type: 'REMOVE_TITLE',
				titleType,
				title,
			};
		},
		setAcceptedTitle( titleType: TitleType, title: Title|undefined ): SetAcceptedTitleAction {
			return {
				type: 'SET_ACCEPTED_TITLE',
				titleType,
				title,
			};
		},
		pinTitle( titleType: TitleType, title: Title ): PinTitleAction {
			return {
				type: 'PIN_TITLE',
				titleType,
				title,
			};
		},
		unpinTitle( titleType: TitleType, title: Title ): UnpinTitleAction {
			return {
				type: 'UNPIN_TITLE',
				titleType,
				title,
			};
		},
		setOriginalTitle( titleType: TitleType, title: string|undefined ): SetOriginalTitleAction {
			return {
				type: 'SET_ORIGINAL_TITLE',
				titleType,
				title,
			};
		},
	},
	selectors: {
		getState( state: TitlesState ): TitlesState {
			return state;
		},
		isLoading( state: TitlesState ): boolean {
			return state.isLoading;
		},
		getTitles( state: TitlesState, titleType: TitleType ): Title[] {
			return state[ titleType ].titles.map( ( title ) => title );
		},
		getPinnedTitles( state: TitlesState, titleType: TitleType ): Title[] {
			return state[ titleType ].titles.filter( ( title ) => title.isPinned );
		},
		isPinned( state: TitlesState, titleType: TitleType, title: Title ): boolean {
			return state[ titleType ].titles.find( ( t ) => t.id === title.id )?.isPinned ?? false;
		},
		getAcceptedTitle( state: TitlesState, titleType: TitleType ): Title | undefined {
			return state[ titleType ].acceptedTitle;
		},
		isAcceptedTitle( state: TitlesState, titleType: TitleType, title: Title ): boolean {
			return state[ titleType ].acceptedTitle?.id === title.id;
		},
		getOriginalTitle( state: TitlesState, titleType: TitleType ): Title | undefined {
			if ( state[ titleType ].originalTitle ) {
				return {
					id: -1,
					title: state[ titleType ].originalTitle ?? '',
					isPinned: false,
				};
			}
			return undefined;
		},
	},
} );

register( TitleStore );
