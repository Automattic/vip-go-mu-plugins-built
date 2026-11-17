/**
 * WordPress dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ContentHelperError } from '../../../common/content-helper-error';
import { HydratedPost } from '../../../common/providers/base-wordpress-provider';
import { LinkType } from './preview/components/link-counter';
import { TrafficBoostLink } from './provider';

/**
 * Available tab names in the Traffic Boost sidebar.
 *
 * @since 3.19.0
 */
export enum TrafficBoostSidebarTabs {
	SUGGESTIONS = 'suggestions',
	INBOUND_LINKS = 'inbound-links',
	SETTINGS = 'settings',
}

/**
 * The shape of the Traffic Boost settings.
 *
 * @since 3.19.0
 */
type TrafficBoostSettings = {
	maxItems: number;
};

/**
 * The shape of the suggestions tab state.
 *
 * @since 3.19.0
 */
type SuggestionsTabState = {
	suggestions: TrafficBoostLink[];
	suggestionsToGenerate: number;
};

/**
 * The shape of the boost links tab state.
 *
 * @since 3.19.0
 */
type InboundLinksTabState = {
	links: TrafficBoostLink[];
	currentPage: number;
	itemsPerPage: number;
};

/**
 * The shape of the preview state.
 *
 * @since 3.19.0
 */
type PreviewState = {
	selectedLinkType: LinkType | null;
	frontendPreview: boolean;
};

/**
 * The shape of the Traffic Boost store state.
 *
 * @since 3.19.0
 */
type TrafficBoostState = {
	loading: string[];
	error: ContentHelperError | null;
	currentPost: HydratedPost | null;
	selectedTab: TrafficBoostSidebarTabs;
	selectedLink: TrafficBoostLink | null;
	preview: PreviewState;
	suggestionsTab: SuggestionsTabState;
	inboundLinksTab: InboundLinksTabState;
	acceptingLinks: string[];
	removingLinks: string[];
	generatingLinks: string[];
	isGeneratingSuggestions: boolean;
	settings: TrafficBoostSettings;
};

/********** Actions **********/

/**
 * Interface for the SetLoadingAction.
 *
 * @since 3.19.0
 */
interface SetLoadingAction {
	type: 'SET_LOADING';
	isLoading: boolean;
	loadingType: string;
}

/**
 * Interface for the SetErrorAction.
 *
 * @since 3.19.0
 */
interface SetErrorAction {
	type: 'SET_ERROR';
	error: ContentHelperError | null;
}

/**
 * Interface for the SetCurrentHydratedPostAction.
 *
 * @since 3.19.0
 */
interface SetCurrentHydratedPostAction {
	type: 'SET_CURRENT_HYDRATED_POST';
	post: HydratedPost | null;
}

/**
 * Interface for the SetSelectedTabAction.
 *
 * @since 3.19.0
 */
interface SetSelectedTabAction {
	type: 'SET_SELECTED_TAB';
	tab: TrafficBoostSidebarTabs;
}

/**
 * Interface for the SetSuggestionsAction.
 *
 * @since 3.19.0
 */
interface SetSuggestionsAction {
	type: 'SET_SUGGESTIONS';
	suggestions: TrafficBoostLink[];
	discardPrevious?: boolean;
}

/**
 * Interface for the SetInboundLinksAction.
 *
 * @since 3.19.0
 */
interface SetInboundLinksAction {
	type: 'SET_INBOUND_LINKS';
	links: TrafficBoostLink[];
}

/**
 * Interface for the SetInboundLinksPageAction.
 *
 * @since 3.19.0
 */
interface SetInboundLinksPageAction {
	type: 'SET_INBOUND_LINKS_PAGE';
	page: number;
}

/**
 * Interface for the SetInboundLinksItemsPerPageAction.
 *
 * @since 3.19.0
 */
interface SetInboundLinksItemsPerPageAction {
	type: 'SET_INBOUND_LINKS_ITEMS_PER_PAGE';
	itemsPerPage: number;
}

/**
 * Interface for the SetSelectedLinkAction.
 *
 * @since 3.19.0
 */
interface SetSelectedLinkAction {
	type: 'SET_SELECTED_LINK';
	link: TrafficBoostLink | null;
}

/**
 * Interface for the SetPreviewLinkTypeAction.
 *
 * @since 3.19.0
 */
interface SetPreviewLinkTypeAction {
	type: 'SET_PREVIEW_LINK_TYPE';
	linkType: LinkType | null;
}

/**
 * Interface for the SetFrontendPreviewAction.
 *
 * @since 3.19.0
 */
interface SetFrontendPreviewAction {
	type: 'SET_FRONTEND_PREVIEW';
	enabled: boolean;
}

/**
 * Interface for the AddSuggestionAction.
 *
 * @since 3.19.0
 */
interface AddSuggestionAction {
	type: 'ADD_SUGGESTION';
	suggestion: TrafficBoostLink;
	select: boolean;
}

/**
 * Interface for the RemoveSuggestionAction.
 *
 * @since 3.19.0
 */
interface RemoveSuggestionAction {
	type: 'REMOVE_SUGGESTION';
	suggestion: TrafficBoostLink;
	updateSelectedLink: boolean;
}

/**
 * Interface for the AddInboundLinkAction.
 *
 * @since 3.19.0
 */
interface AddInboundLinkAction {
	type: 'ADD_INBOUND_LINK';
	link: TrafficBoostLink;
	select: boolean;
}

/**
 * Interface for the RemoveInboundLinkAction.
 *
 * @since 3.19.0
 */
interface RemoveInboundLinkAction {
	type: 'REMOVE_INBOUND_LINK';
	link: TrafficBoostLink;
	updateSelectedLink: boolean;
}

/**
 * Interface for the UpdateSuggestionAction.
 *
 * @since 3.19.0
 */
interface UpdateSuggestionAction {
	type: 'UPDATE_SUGGESTION';
	suggestion: TrafficBoostLink;
	uid?: string;
}

/**
 * Interface for the SetIsAcceptingAction.
 *
 * @since 3.19.0
 */
interface SetIsAcceptingAction {
	type: 'SET_IS_ACCEPTING';
	link: TrafficBoostLink;
	value: boolean;
}

/**
 * Interface for the SetIsRemovingAction.
 *
 * @since 3.19.0
 */
interface SetIsRemovingAction {
	type: 'SET_IS_REMOVING';
	link: TrafficBoostLink;
	value: boolean;
}

/**
 * Interface for the SetIsGeneratingSuggestionsAction.
 *
 * @since 3.19.0
 */
interface SetIsGeneratingSuggestionsAction {
	type: 'SET_IS_GENERATING_SUGGESTIONS';
	value: boolean;
}

/**
 * Interface for the SetIsGeneratingAction.
 *
 * @since 3.19.0
 */
interface SetIsGeneratingAction {
	type: 'SET_IS_GENERATING';
	link: TrafficBoostLink;
	value: boolean;
}

/**
 * Interface for the UpdateInboundLinkAction.
 *
 * @since 3.19.0
 */
interface UpdateInboundLinkAction {
	type: 'UPDATE_INBOUND_LINK';
	link: TrafficBoostLink;
	uid?: string;
}

/**
 * Interface for the SetSettingsAction.
 *
 * @since 3.19.0
 */
interface SetSettingsAction {
	type: 'SET_SETTINGS';
	settings: Partial<TrafficBoostSettings>;
}

/**
 * Interface for the SetSuggestionsToGenerateAction.
 *
 * @since 3.19.0
 */
interface SetSuggestionsToGenerateAction {
	type: 'SET_SUGGESTIONS_TO_GENERATE';
	count: number | ( ( prevCount: number ) => number );
}

/**
 * Union type for all possible action types.
 *
 * @since 3.19.0
 */
type ActionTypes =
	| SetLoadingAction
	| SetErrorAction
	| SetCurrentHydratedPostAction
	| SetSelectedTabAction
	| SetSuggestionsAction
	| SetInboundLinksAction
	| SetInboundLinksPageAction
	| SetInboundLinksItemsPerPageAction
	| SetSelectedLinkAction
	| SetPreviewLinkTypeAction
	| SetFrontendPreviewAction
	| AddSuggestionAction
	| RemoveSuggestionAction
	| AddInboundLinkAction
	| RemoveInboundLinkAction
	| UpdateSuggestionAction
	| UpdateInboundLinkAction
	| SetIsAcceptingAction
	| SetIsRemovingAction
	| SetIsGeneratingSuggestionsAction
	| SetIsGeneratingAction
	| SetSettingsAction
	| SetSuggestionsToGenerateAction;

/**
 * Default state for the Traffic Boost store.
 *
 * @since 3.19.0
 */
const defaultState: TrafficBoostState = {
	loading: [],
	error: null,
	currentPost: null,
	selectedTab: TrafficBoostSidebarTabs.SUGGESTIONS,
	selectedLink: null,
	preview: {
		selectedLinkType: null,
		frontendPreview: false,
	},
	suggestionsTab: {
		suggestions: [],
		suggestionsToGenerate: 0,
	},
	inboundLinksTab: {
		links: [],
		currentPage: 1,
		itemsPerPage: 0,
	},
	acceptingLinks: [],
	removingLinks: [],
	generatingLinks: [],
	isGeneratingSuggestions: false,
	settings: {
		maxItems: 10,
	},
};

/**
 * The Traffic Boost store.
 *
 * @since 3.19.0
 */
export const TrafficBoostStore = createReduxStore( 'wp-parsely/traffic-boost', {
	initialState: defaultState,
	reducer( state: TrafficBoostState = defaultState, action: ActionTypes ): TrafficBoostState {
		switch ( action.type ) {
			case 'SET_LOADING':
				if ( ! action.loadingType ) {
					action.loadingType = 'default';
				}

				return {
					...state,
					loading: action.isLoading
						? [ ...state.loading, action.loadingType ]
						: state.loading.filter( ( type ) => type !== action.loadingType ),
				};
			case 'SET_ERROR':
				return {
					...state,
					error: action.error,
				};
			case 'SET_CURRENT_HYDRATED_POST':
				return {
					...state,
					currentPost: action.post,
				};
			case 'SET_SELECTED_TAB':
				return {
					...state,
					selectedTab: action.tab,
				};
			case 'SET_SUGGESTIONS':
				return {
					...state,
					suggestionsTab: {
						...state.suggestionsTab,
						suggestions: action.discardPrevious
							? action.suggestions
							: [ ...state.suggestionsTab.suggestions, ...action.suggestions ],
					},
				};
			case 'SET_INBOUND_LINKS':
				return {
					...state,
					inboundLinksTab: {
						...state.inboundLinksTab,
						links: action.links,
					},
				};
			case 'SET_INBOUND_LINKS_PAGE':
				return {
					...state,
					inboundLinksTab: {
						...state.inboundLinksTab,
						currentPage: action.page,
					},
				};
			case 'SET_INBOUND_LINKS_ITEMS_PER_PAGE':
				return {
					...state,
					inboundLinksTab: {
						...state.inboundLinksTab,
						itemsPerPage: action.itemsPerPage,
					},
				};
			case 'SET_SELECTED_LINK':
				return {
					...state,
					selectedLink: action.link,
				};
			case 'SET_PREVIEW_LINK_TYPE':
				return {
					...state,
					preview: {
						...state.preview,
						selectedLinkType: action.linkType,
					},
				};
			case 'SET_FRONTEND_PREVIEW':
				return {
					...state,
					preview: {
						...state.preview,
						frontendPreview: action.enabled,
					},
				};
			case 'ADD_SUGGESTION':
				return {
					...state,
					suggestionsTab: {
						...state.suggestionsTab,
						suggestions: [ action.suggestion, ...state.suggestionsTab.suggestions ],
					},
					selectedLink: action.select ? action.suggestion : state.selectedLink,
				};
			case 'REMOVE_SUGGESTION': {
				const remainingSuggestions = state.suggestionsTab.suggestions.filter(
					( suggestion ) => suggestion.uid !== action.suggestion.uid
				);

				return {
					...state,
					suggestionsTab: {
						...state.suggestionsTab,
						suggestions: remainingSuggestions,
					},
					selectedLink: action.updateSelectedLink && state.selectedLink?.uid === action.suggestion.uid
						? remainingSuggestions[ 0 ] ?? null
						: state.selectedLink,
				};
			}
			case 'ADD_INBOUND_LINK': {
				return {
					...state,
					inboundLinksTab: {
						...state.inboundLinksTab,
						links: [ action.link, ...state.inboundLinksTab.links ],
					},
					selectedLink: action.select ? action.link : state.selectedLink,
				};
			}
			case 'REMOVE_INBOUND_LINK': {
				const remainingLinks = state.inboundLinksTab.links.filter(
					( link ) => link.uid !== action.link.uid
				);

				return {
					...state,
					inboundLinksTab: {
						...state.inboundLinksTab,
						links: remainingLinks,
					},
					selectedLink: action.updateSelectedLink && state.selectedLink?.uid === action.link.uid
						? remainingLinks[ 0 ] ?? null
						: state.selectedLink,
				};
			}
			case 'UPDATE_SUGGESTION': {
				const uidToMatch = action.uid ?? action.suggestion.uid;

				const updatedSuggestions = state.suggestionsTab.suggestions.map( ( suggestion ) =>
					suggestion.uid === uidToMatch ? action.suggestion : suggestion
				);

				const shouldUpdateSelectedLink = state.selectedLink?.uid === uidToMatch;
				const newSelectedLink = shouldUpdateSelectedLink ? action.suggestion : state.selectedLink;

				return {
					...state,
					suggestionsTab: {
						...state.suggestionsTab,
						suggestions: updatedSuggestions,
					},
					selectedLink: newSelectedLink,
				};
			}
			case 'UPDATE_INBOUND_LINK': {
				const uidToMatch = action.uid ?? action.link.uid;

				const updatedLinks = state.inboundLinksTab.links.map( ( existingLink ) =>
					existingLink.uid === uidToMatch ? action.link : existingLink
				);

				const shouldUpdateSelectedLink = state.selectedLink?.uid === uidToMatch;
				const newSelectedLink = shouldUpdateSelectedLink ? action.link : state.selectedLink;

				return {
					...state,
					inboundLinksTab: {
						...state.inboundLinksTab,
						links: updatedLinks,
					},
					selectedLink: newSelectedLink,
				};
			}
			case 'SET_IS_ACCEPTING':
				return {
					...state,
					acceptingLinks: action.value
						? [ ...state.acceptingLinks, action.link.uid ]
						: state.acceptingLinks.filter( ( uid ) => uid !== action.link.uid ),
				};
			case 'SET_IS_REMOVING':
				return {
					...state,
					removingLinks: action.value
						? [ ...state.removingLinks, action.link.uid ]
						: state.removingLinks.filter( ( uid ) => uid !== action.link.uid ),
				};
			case 'SET_IS_GENERATING_SUGGESTIONS':
				return {
					...state,
					isGeneratingSuggestions: action.value,
				};
			case 'SET_IS_GENERATING':
				return {
					...state,
					generatingLinks: action.value
						? [ ...state.generatingLinks, action.link.uid ]
						: state.generatingLinks.filter( ( uid ) => uid !== action.link.uid ),
				};
			case 'SET_SETTINGS':
				return {
					...state,
					settings: {
						...state.settings,
						...action.settings,
					},
				};
			case 'SET_SUGGESTIONS_TO_GENERATE':
				return {
					...state,
					suggestionsTab: {
						...state.suggestionsTab,
						suggestionsToGenerate: typeof action.count === 'function'
							? action.count( state.suggestionsTab.suggestionsToGenerate )
							: action.count,
					},
				};
			default:
				return state;
		}
	},
	actions: {
		setLoading( isLoading: boolean, loadingType: string = 'default' ): SetLoadingAction {
			return {
				type: 'SET_LOADING',
				isLoading,
				loadingType,
			};
		},
		setError( error: ContentHelperError | null ): SetErrorAction {
			return {
				type: 'SET_ERROR',
				error,
			};
		},
		setCurrentPost( post: HydratedPost | null ): SetCurrentHydratedPostAction {
			return {
				type: 'SET_CURRENT_HYDRATED_POST',
				post,
			};
		},
		setSelectedTab( tab: TrafficBoostSidebarTabs ): SetSelectedTabAction {
			return {
				type: 'SET_SELECTED_TAB',
				tab,
			};
		},
		setSuggestions( suggestions: TrafficBoostLink[], discardPrevious: boolean = true ): SetSuggestionsAction {
			return { type: 'SET_SUGGESTIONS', suggestions, discardPrevious };
		},
		setInboundLinks( links: TrafficBoostLink[] ): SetInboundLinksAction {
			return {
				type: 'SET_INBOUND_LINKS',
				links,
			};
		},
		setInboundLinksPage( page: number ): SetInboundLinksPageAction {
			return {
				type: 'SET_INBOUND_LINKS_PAGE',
				page,
			};
		},
		setInboundLinksItemsPerPage( itemsPerPage: number ): SetInboundLinksItemsPerPageAction {
			return {
				type: 'SET_INBOUND_LINKS_ITEMS_PER_PAGE',
				itemsPerPage,
			};
		},
		setSelectedLink( link: TrafficBoostLink | null ): SetSelectedLinkAction {
			return {
				type: 'SET_SELECTED_LINK',
				link,
			};
		},
		setPreviewLinkType( linkType: LinkType | null ): SetPreviewLinkTypeAction {
			return {
				type: 'SET_PREVIEW_LINK_TYPE',
				linkType,
			};
		},
		setFrontendPreview( enabled: boolean ): SetFrontendPreviewAction {
			return {
				type: 'SET_FRONTEND_PREVIEW',
				enabled,
			};
		},
		addSuggestion( suggestion: TrafficBoostLink, select: boolean = true ): AddSuggestionAction {
			return {
				type: 'ADD_SUGGESTION',
				suggestion,
				select,
			};
		},
		removeSuggestion( suggestion: TrafficBoostLink, updateSelectedLink: boolean = true ): RemoveSuggestionAction {
			return {
				type: 'REMOVE_SUGGESTION',
				suggestion,
				updateSelectedLink,
			};
		},
		addInboundLink( link: TrafficBoostLink, select: boolean = true ): AddInboundLinkAction {
			return {
				type: 'ADD_INBOUND_LINK',
				link,
				select,
			};
		},
		removeInboundLink( link: TrafficBoostLink, updateSelectedLink: boolean = true ): RemoveInboundLinkAction {
			return {
				type: 'REMOVE_INBOUND_LINK',
				link,
				updateSelectedLink,
			};
		},
		updateSuggestion( suggestion: TrafficBoostLink, uid?: string ): UpdateSuggestionAction {
			return {
				type: 'UPDATE_SUGGESTION',
				suggestion,
				uid,
			};
		},
		updateInboundLink( link: TrafficBoostLink, uid?: string ): UpdateInboundLinkAction {
			return {
				type: 'UPDATE_INBOUND_LINK',
				link,
				uid,
			};
		},
		setIsAccepting( link: TrafficBoostLink, value: boolean ): SetIsAcceptingAction {
			return {
				type: 'SET_IS_ACCEPTING',
				link,
				value,
			};
		},
		setIsRemoving( link: TrafficBoostLink, value: boolean ): SetIsRemovingAction {
			return {
				type: 'SET_IS_REMOVING',
				link,
				value,
			};
		},
		setIsGeneratingSuggestions( value: boolean ): SetIsGeneratingSuggestionsAction {
			return {
				type: 'SET_IS_GENERATING_SUGGESTIONS',
				value,
			};
		},
		setIsGenerating( link: TrafficBoostLink, value: boolean ): SetIsGeneratingAction {
			return {
				type: 'SET_IS_GENERATING',
				link,
				value,
			};
		},
		setSettings( settings: Partial<TrafficBoostSettings> ): SetSettingsAction {
			return { type: 'SET_SETTINGS', settings };
		},
		setSuggestionsToGenerate( count: number | ( ( prevCount: number ) => number ) ): SetSuggestionsToGenerateAction {
			return {
				type: 'SET_SUGGESTIONS_TO_GENERATE',
				count,
			};
		},
	},
	selectors: {
		isLoading( state: TrafficBoostState ): boolean {
			return state.loading.length > 0;
		},
		isLoadingSuggestions( state: TrafficBoostState ): boolean {
			return state.loading.includes( 'suggestions' );
		},
		isLoadingInboundLinks( state: TrafficBoostState ): boolean {
			return state.loading.includes( 'inbound-links' );
		},
		isLoadingPost( state: TrafficBoostState ): boolean {
			return state.loading.includes( 'post' );
		},
		getError( state: TrafficBoostState ): ContentHelperError | null {
			return state.error;
		},
		getCurrentPost( state: TrafficBoostState ): HydratedPost | null {
			return state.currentPost;
		},
		getSelectedTab( state: TrafficBoostState ): TrafficBoostSidebarTabs {
			return state.selectedTab;
		},
		getSuggestions( state: TrafficBoostState ): TrafficBoostLink[] {
			return state.suggestionsTab.suggestions;
		},
		getInboundLinks( state: TrafficBoostState ): TrafficBoostLink[] {
			return state.inboundLinksTab.links;
		},
		getInboundLinksPage( state: TrafficBoostState ): number {
			return state.inboundLinksTab.currentPage;
		},
		getInboundLinksItemsPerPage( state: TrafficBoostState ): number {
			return state.inboundLinksTab.itemsPerPage;
		},
		isSuggestionsLoading( state: TrafficBoostState ): boolean {
			return state.loading.includes( 'suggestions' );
		},
		getSelectedLink( state: TrafficBoostState ): TrafficBoostLink | null {
			return state.selectedLink;
		},
		getPreviewLinkType( state: TrafficBoostState ): LinkType | null {
			return state.preview.selectedLinkType;
		},
		isFrontendPreview( state: TrafficBoostState ): boolean {
			return state.preview.frontendPreview;
		},
		isAccepting( state: TrafficBoostState, link: TrafficBoostLink ): boolean {
			return state.acceptingLinks.includes( link.uid );
		},
		isRemoving( state: TrafficBoostState, link: TrafficBoostLink ): boolean {
			return state.removingLinks.includes( link.uid );
		},
		isGeneratingSuggestions( state: TrafficBoostState ): boolean {
			return state.isGeneratingSuggestions;
		},
		isGenerating( state: TrafficBoostState, link: TrafficBoostLink ): boolean {
			return state.generatingLinks.includes( link.uid );
		},
		getSettings( state: TrafficBoostState ): TrafficBoostSettings {
			return state.settings;
		},
		getSuggestionsToGenerate( state: TrafficBoostState ): number {
			return state.suggestionsTab.suggestionsToGenerate;
		},
		hasSuggestions( state: TrafficBoostState ): boolean {
			return state.suggestionsTab.suggestions.length > 0;
		},
	},
} );

register( TrafficBoostStore );
