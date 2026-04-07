/**
 * WordPress dependencies
 */
import { register, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { SettingsStore, STORE_NAME } from './store';

/**
 * Exports
 */
export { SettingsProvider, useSettings } from './provider';
// Export all the settings types.
export * from './types';

/**
 * Initializes the settings store.
 *
 * @since 3.14.0
 */
function initSettings() {
	// Check if the store is already registered.
	const isStoreRegistered = select( STORE_NAME ) !== undefined;

	// Register the store if it's not already registered.
	if ( ! isStoreRegistered ) {
		register( SettingsStore );
	}
}

// Initialize the settings store.
initSettings();

