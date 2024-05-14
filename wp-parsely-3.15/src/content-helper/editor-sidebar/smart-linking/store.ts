/**
 * WordPress dependencies
 */
import { createReduxStore, register } from '@wordpress/data';
import { ContentHelperError } from '../../common/content-helper-error';
import { DEFAULT_MAX_LINKS, DEFAULT_MAX_LINK_WORDS } from './smart-linking';

/**
 * Internal dependencies
 */
import { LinkSuggestion } from './provider';

/**
 * Defines the props structure for SmartLinkingSettings.
 *
 * @since 3.14.0
 */
export type SmartLinkingSettingsProps = {
	maxLinkWords?: number;
	maxLinksPerPost?: number;
};

/**
 * Enum for the applyTo setting.
 *
 * @since 3.14.3
 */
export enum ApplyToOptions {
	All = 'all',
	Selected = 'selected',
}

/**
 * The shape of the SmartLinking store state.
 *
 * @since 3.14.0
 */
type SmartLinkingState = {
	isLoading: boolean;
	applyTo: ApplyToOptions|null;
	fullContent: boolean;
	error: ContentHelperError | null;
	settings: SmartLinkingSettingsProps;
	suggestedLinks: LinkSuggestion[] | null;
	overlayBlocks: string[];
	wasAlreadyClicked: boolean;
	isRetrying: boolean;
	retryAttempt: number;
};

/********** Actions ********** /

/**
 * Interface for the SetLoadingAction.
 *
 * @since 3.14.0
 */
interface SetLoadingAction {
	type: 'SET_LOADING';
	isLoading: boolean;
}

/**
 * Interface for the SetErrorAction.
 *
 * @since 3.14.0
 */
interface SetErrorAction {
	type: 'SET_ERROR';
	error: ContentHelperError | null;
}

/**
 * Interface for the SetOverlayBlocksAction.
 *
 * @since 3.14.0
 */
interface SetOverlayBlocksAction {
	type: 'SET_OVERLAY_BLOCKS';
	overlayBlocks: string[];
}

/**
 * Interface for the AddOverlayBlockAction.
 *
 * @since 3.14.0
 */
interface AddOverlayBlockAction {
	type: 'ADD_OVERLAY_BLOCK';
	block: string;
}

/**
 * Interface for the RemoveOverlayBlockAction.
 *
 * @since 3.14.0
 */
interface RemoveOverlayBlockAction {
	type: 'REMOVE_OVERLAY_BLOCK';
	block: string;
}

/**
 * Interface for the SetFullContentAction.
 *
 * @since 3.14.0
 */
interface SetFullContentAction {
	type: 'SET_FULL_CONTENT';
	fullContent: boolean;
}

/**
 * Interface for the SetSettingsAction.
 *
 * @since 3.14.0
 */
interface SetSettingsAction {
	type: 'SET_SETTINGS';
	settings: SmartLinkingSettingsProps;
}

/**
 * Interface for the SetSuggestedLinksAction.
 *
 * @since 3.14.0
 */
interface SetSuggestedLinksAction {
	type: 'SET_SUGGESTED_LINKS';
	suggestedLinks: LinkSuggestion[] | null;
}

/**
 * Interface for the SetWasAlreadyClickedAction.
 *
 * @since 3.14.0
 */
interface SetWasAlreadyClickedAction {
	type: 'SET_WAS_ALREADY_CLICKED';
	wasAlreadyClicked: boolean;
}

/**
 * Interface for the SetApplyToAction.
 *
 * @since 3.14.3
 */
interface SetApplyToAction {
	type: 'SET_APPLY_TO';
	applyTo: ApplyToOptions|null;
}

/**
 * Interface for the SetIsRetryingAction.
 *
 * @since 3.15.0
 */
interface SetIsRetryingAction {
	type: 'SET_IS_RETRYING';
	isRetrying: boolean;
}

/**
 * Interface for the IncrementRetryAttemptAction.
 *
 * @since 3.15.0
 */
interface IncrementRetryAttemptAction {
	type: 'INCREMENT_RETRY_ATTEMPT';
}

type ActionTypes = SetLoadingAction | SetOverlayBlocksAction | SetSettingsAction |
	AddOverlayBlockAction | RemoveOverlayBlockAction |SetFullContentAction |
	SetSuggestedLinksAction | SetErrorAction| SetWasAlreadyClickedAction | SetApplyToAction |
	IncrementRetryAttemptAction | SetIsRetryingAction;

const defaultState: SmartLinkingState = {
	isLoading: false,
	applyTo: null,
	fullContent: false,
	suggestedLinks: null,
	error: null,
	settings: { },
	overlayBlocks: [],
	wasAlreadyClicked: false,
	isRetrying: false,
	retryAttempt: 0,
};

/**
 * The SmartLinking store.
 *
 * @since 3.14.0
 */
export const SmartLinkingStore = createReduxStore( 'wp-parsely/smart-linking', {
	initialState: defaultState,
	reducer( state: SmartLinkingState = defaultState, action: ActionTypes ): SmartLinkingState {
		switch ( action.type ) {
			case 'SET_LOADING':
				return {
					...state,
					isLoading: action.isLoading,
				};
			case 'SET_OVERLAY_BLOCKS':
				return {
					...state,
					overlayBlocks: action.overlayBlocks,
				};
			case 'SET_ERROR':
				return {
					...state,
					error: action.error,
				};
			case 'ADD_OVERLAY_BLOCK':
				return {
					...state,
					overlayBlocks: [ ...state.overlayBlocks, action.block ],
				};
			case 'REMOVE_OVERLAY_BLOCK':
				// If the action is 'all', remove all overlay blocks.
				if ( action.block === 'all' ) {
					return {
						...state,
						overlayBlocks: [],
					};
				}
				return {
					...state,
					overlayBlocks: state.overlayBlocks.filter( ( block ) => block !== action.block ),
				};
			case 'SET_FULL_CONTENT':
				return {
					...state,
					fullContent: action.fullContent,
				};
			case 'SET_SETTINGS':
				return {
					...state,
					settings: {
						...state.settings,
						...action.settings,
					},
				};
			case 'SET_SUGGESTED_LINKS':
				return {
					...state,
					suggestedLinks: action.suggestedLinks,
				};
			case 'SET_WAS_ALREADY_CLICKED':
				return {
					...state,
					wasAlreadyClicked: action.wasAlreadyClicked,
				};
			case 'SET_APPLY_TO':
				return {
					...state,
					applyTo: action.applyTo,
				};
			case 'SET_IS_RETRYING':
				return {
					...state,
					isRetrying: action.isRetrying,
					retryAttempt: action.isRetrying === state.isRetrying ? state.retryAttempt : 0,
				};
			case 'INCREMENT_RETRY_ATTEMPT':
				return {
					...state,
					retryAttempt: state.retryAttempt + 1,
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
		setOverlayBlocks( overlayBlocks: string[] ): SetOverlayBlocksAction {
			return {
				type: 'SET_OVERLAY_BLOCKS',
				overlayBlocks,
			};
		},
		setError( error: ContentHelperError | null ): SetErrorAction {
			return {
				type: 'SET_ERROR',
				error,
			};
		},
		addOverlayBlock( block: string ): AddOverlayBlockAction {
			return {
				type: 'ADD_OVERLAY_BLOCK',
				block,
			};
		},
		removeOverlayBlock( block: string ): RemoveOverlayBlockAction {
			return {
				type: 'REMOVE_OVERLAY_BLOCK',
				block,
			};
		},
		setFullContent( fullContent: boolean ): SetFullContentAction {
			return {
				type: 'SET_FULL_CONTENT',
				fullContent,
			};
		},
		setSmartLinkingSettings( settings: SmartLinkingSettingsProps ): SetSettingsAction {
			return {
				type: 'SET_SETTINGS',
				settings,
			};
		},
		setMaxLinkWords( maxLinkWords: number ): SetSettingsAction {
			return {
				type: 'SET_SETTINGS',
				settings: {
					maxLinkWords,
				},
			};
		},
		setMaxLinks( maxLinksPerPost: number ): SetSettingsAction {
			return {
				type: 'SET_SETTINGS',
				settings: {
					maxLinksPerPost,
				},
			};
		},
		setSuggestedLinks( suggestedLinks: LinkSuggestion[] | null ): SetSuggestedLinksAction {
			return {
				type: 'SET_SUGGESTED_LINKS',
				suggestedLinks,
			};
		},
		setAlreadyClicked( wasAlreadyClicked: boolean ): SetWasAlreadyClickedAction {
			return {
				type: 'SET_WAS_ALREADY_CLICKED',
				wasAlreadyClicked,
			};
		},
		setApplyTo( applyTo: ApplyToOptions|null ): SetApplyToAction {
			return {
				type: 'SET_APPLY_TO',
				applyTo,
			};
		},
		setIsRetrying( isRetrying: boolean ): SetIsRetryingAction {
			return {
				type: 'SET_IS_RETRYING',
				isRetrying,
			};
		},
		incrementRetryAttempt(): IncrementRetryAttemptAction {
			return {
				type: 'INCREMENT_RETRY_ATTEMPT',
			};
		},
	},
	selectors: {
		isLoading( state: SmartLinkingState ): boolean {
			return state.isLoading;
		},
		isFullContent( state: SmartLinkingState ): boolean {
			return state.fullContent;
		},
		getApplyTo( state: SmartLinkingState ): ApplyToOptions|null {
			return state.applyTo;
		},
		getError( state: SmartLinkingState ): ContentHelperError | null {
			return state.error;
		},
		getSmartLinkingSettings( state: SmartLinkingState ): SmartLinkingSettingsProps {
			return state.settings;
		},
		getOverlayBlocks( state: SmartLinkingState ): string[] {
			return state.overlayBlocks;
		},
		getMaxLinkWords( state: SmartLinkingState ): number {
			return state.settings.maxLinkWords ?? DEFAULT_MAX_LINK_WORDS;
		},
		getMaxLinks( state: SmartLinkingState ): number {
			return state.settings.maxLinksPerPost ?? DEFAULT_MAX_LINKS;
		},
		getSuggestedLinks( state: SmartLinkingState ): LinkSuggestion[] | null {
			return state.suggestedLinks;
		},
		wasAlreadyClicked( state: SmartLinkingState ): boolean {
			return state.wasAlreadyClicked;
		},
		isRetrying( state: SmartLinkingState ): boolean {
			return state.isRetrying;
		},
		getRetryAttempt( state: SmartLinkingState ): number {
			return state.retryAttempt;
		},
	},
} );

register( SmartLinkingStore );
