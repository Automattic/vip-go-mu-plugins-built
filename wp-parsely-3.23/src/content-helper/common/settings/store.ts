/**
 * WordPress dependencies
 */
import { createReduxStore } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { Settings } from './types';

// Define state type.
interface SettingsState {
	[endpoint: string]: Settings;
}

// Define action types.
interface SetSettingsAction {
	type: 'SET_SETTINGS';
	endpoint: string;
	settings: Settings;
}

interface SetPartialSettingsAction {
	type: 'SET_PARTIAL_SETTINGS';
	endpoint: string;
	partialSettings: Partial<Settings>;
}

// Union of all action types.
type ActionTypes = SetSettingsAction | SetPartialSettingsAction;

// Default state.
const DEFAULT_STATE: SettingsState = {};

// Store name.
export const STORE_NAME = 'wp-parsely/settings';

// Reducer.
const reducer = ( state: SettingsState = DEFAULT_STATE, action: ActionTypes ): SettingsState => {
	switch ( action.type ) {
		case 'SET_SETTINGS': {
			return {
				...state,
				[ action.endpoint ]: action.settings,
			};
		}
		case 'SET_PARTIAL_SETTINGS': {
			const currentSettings = state[ action.endpoint ] || {};
			const updatedSettings = { ...currentSettings, ...action.partialSettings } as Settings;
			return {
				...state,
				[ action.endpoint ]: updatedSettings,
			};
		}
		default:
			return state;
	}
};

// Actions.
const actions = {
	setSettings( endpoint: string, settings: Settings ): SetSettingsAction {
		return { type: 'SET_SETTINGS', endpoint, settings };
	},
	setPartialSettings( endpoint: string, partialSettings: Partial<Settings> ): SetPartialSettingsAction {
		return { type: 'SET_PARTIAL_SETTINGS', endpoint, partialSettings };
	},
};

// Selectors.
const selectors = {
	getSettings( state: SettingsState, endpoint: string ): Settings {
		return state[ endpoint ];
	},
};

// Create and register the store.
export const SettingsStore = createReduxStore( STORE_NAME, {
	initialState: DEFAULT_STATE,
	reducer,
	actions,
	selectors,
} );
