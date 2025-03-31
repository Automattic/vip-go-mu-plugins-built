import { createContext, useContext, useEffect, useState } from '@wordpress/element';

import { SUPPORTED_SERVICES } from '@/data-sources/constants';
import { DataSourceType } from '@/data-sources/types';

interface DataSourceNavState {
	screen: 'addDataSource' | 'editDataSource' | 'dataSourceList';
	uuid?: string;
	service?: DataSourceType;
}

type SettingsContext = DataSourceNavState & {
	goToMainScreen: () => void;
	pushState: ( newUrl: URL ) => void;
};

export const SettingsContext = createContext< SettingsContext >( {
	screen: 'dataSourceList',
	goToMainScreen: () => {},
	pushState: ( _newUrl: URL ) => {},
} );

export const useSettingsContext = () => useContext( SettingsContext );

/**
 * TODO: This is a placeholder for the actual Navigation implementation.
 * Use: <Navigator> -- https://wordpress.github.io/gutenberg/?path=/docs/components-experimental-navigator--docs
 */
export const useDataSourceRouter = () => {
	const [ navState, setNavState ] = useState< DataSourceNavState >( { screen: 'dataSourceList' } );

	/**
	 * Bump the navigation state timestamp to force a re-render.
	 */
	const bumpNavState = () => setNavState( { ...navState } );

	useEffect( () => {
		window.addEventListener( 'popstate', bumpNavState );
		return () => window.removeEventListener( 'popstate', bumpNavState );
	} );

	useEffect(
		() => {
			const urlParams = new URLSearchParams( window.location.search );

			const addDataSourceType = urlParams.get( 'addDataSource' ) as DataSourceType;

			if ( SUPPORTED_SERVICES.includes( addDataSourceType ) ) {
				setNavState( {
					screen: 'addDataSource',
					service: addDataSourceType,
				} );
				return;
			}

			const editUUID = urlParams.get( 'editDataSource' );
			if ( editUUID ) {
				setNavState( {
					screen: 'editDataSource',
					uuid: editUUID,
				} );
				return;
			}

			setNavState( { screen: 'dataSourceList' } );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- window.location.search makes this go :shrug:
		[ window.location.search, navState.screen, navState.service, navState.uuid ]
	);

	const pushState = function ( newUrl: URL ) {
		window.history.pushState( {}, '', newUrl );
		bumpNavState();
	};

	const goToMainScreen = () => {
		const newUrl = new URL( window.location.href );
		newUrl.searchParams.delete( 'addDataSource' );
		newUrl.searchParams.delete( 'editDataSource' );
		pushState( newUrl );
	};

	return {
		screen: navState.screen,
		service: navState.service,
		uuid: navState.uuid,
		goToMainScreen,
		pushState,
	};
};
