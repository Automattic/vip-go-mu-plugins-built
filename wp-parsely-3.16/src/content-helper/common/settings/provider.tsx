/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { dispatch, useSelect } from '@wordpress/data';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from '@wordpress/element';
import type { ReactNode } from 'react';

/**
 * Internal dependencies
 */
import { SettingsStore } from './store';
import { Settings } from './types';

/**
 * The context type for the settings context.
 *
 * @since 3.14.0
 */
interface SettingsContextType<T> {
	settings: T;
	setSettings: ( settings: Partial<T> ) => void;
}

/**
 * The Settings context.
 *
 * @since 3.14.0
 */
const SettingsContext = createContext<SettingsContextType<Settings>>( {
	settings: {} as Settings,
	setSettings: () => {
		// eslint-disable-next-line no-console
		console.error( 'WP Parse.ly: setSettings not implemented' );
	},
} );

/**
 * Hook to get the settings from the context.
 * Should only be used within a SettingsProvider.
 *
 * @since 3.14.0
 *
 * @template T - The type of settings to retrieve, defaults to Settings.
 *
 * @return {SettingsContextType<T>} The settings context.
 *
 * @throws {Error} Throws an error if used outside of a SettingsProvider.
 *
 * @example
 * // Using the useSettings hook with a specific type
 * const { settings, setSettings } = useSettings<SidebarSettings>();
 */
export const useSettings = <T = Settings>(): SettingsContextType<T> => {
	const context = useContext( SettingsContext );
	if ( context === undefined ) {
		throw new Error( 'useSettings must be used within a SettingsProvider' );
	}
	return context as unknown as SettingsContextType<T>;
};

/**
 * Custom types for brevity and for avoiding a "type React is undefined" error.
 */
type ReactDeps = React.DependencyList | undefined;

/**
 * Saves the settings into the WordPress database whenever a dependency update
 * occurs.
 *
 * @since 3.13.0
 * @since 3.14.0 Moved from `content-helper/common/hooks/useSaveSettings.ts`.
 *
 * @param {string}    endpoint The settings endpoint to send the data to.
 * @param {Settings}  data     The data to send.
 * @param {ReactDeps} deps     The deps array that triggers saving.
 */
const useSaveSettings = (
	endpoint: string, data: Settings, deps: ReactDeps
): void => {
	const isFirstRender = useRef( true );

	useEffect( () => {
		// Don't save settings on the first render.
		if ( isFirstRender.current ) {
			isFirstRender.current = false;
			return;
		}

		apiFetch( {
			path: '/wp-parsely/v1/user-meta/content-helper/' + endpoint,
			method: 'PUT',
			data,
		} );
	}, deps ); // eslint-disable-line react-hooks/exhaustive-deps
};

/**
 * The SettingsProvider component properties.
 *
 * @since 3.14.0
 */
interface SettingsProviderProps {
	children: ReactNode;
	endpoint: string;
	defaultSettings: Settings;
}

/**
 * The SettingsProvider component.
 *
 * Provides the settings context to its children.
 * It also saves the settings to the WordPress database whenever a setting change occurs.
 * The settings are saved to the WordPress database using the useSaveSettings hook.
 *
 * @since 3.14.0
 *
 * @param {SettingsProviderProps} props The component's props.
 *
 * @return {import('react').JSX.Element} The SettingsProvider component.
 */
export const SettingsProvider = (
	{ children, endpoint, defaultSettings }: Readonly<SettingsProviderProps>
): React.JSX.Element => {
	// Get the current settings from the store.
	const { storedSettings } = useSelect( ( select ) => {
		let settings = select( SettingsStore ).getSettings( endpoint );

		// Set the default settings if empty.
		if ( ! settings ) {
			settings = defaultSettings;
			dispatch( SettingsStore ).setSettings( endpoint, defaultSettings ).then( ()	=> {} );
		}

		return {
			storedSettings: settings,
		};
	}, [ defaultSettings, endpoint ] );

	// Internal state for storing the settings.
	const [ internalSettings, setInternalSettings ] = useState<Settings>( storedSettings );
	const { setPartialSettings } = dispatch( SettingsStore );

	/**
	 * Updates the settings in the internal state and in the store.
	 *
	 * @since 3.14.0
	 *
	 * @param {Partial<Settings>} updatedSettings The updated settings.
	 */
	const updateSettings = useCallback( ( updatedSettings: Partial<Settings> ) => {
		setInternalSettings( ( currentSettings ) => ( { ...currentSettings, ...updatedSettings } ) );
		setPartialSettings( endpoint, updatedSettings );
	}, [ endpoint, setPartialSettings ] );

	/**
	 * Saves the settings into the WordPress database whenever a setting change
	 * occurs.
	 *
	 * internalSettings is the dependency, because we only want to save the settings
	 * when they change, and save it with the value in the store (storedSettings).
	 *
	 * @since 3.14.0
	 */
	useSaveSettings( endpoint, storedSettings, [ internalSettings ] );

	// Memoize the provider value to avoid unnecessary re-renders.
	const providerValue = useMemo( () => (
		{ settings: storedSettings, setSettings: updateSettings }
	), [ storedSettings, updateSettings ] );

	return (
		<SettingsContext.Provider value={ providerValue }>
			{ children }
		</SettingsContext.Provider>
	);
};
