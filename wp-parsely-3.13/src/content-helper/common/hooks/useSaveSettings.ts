/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { TopPostsSettings } from '../../dashboard-widget/components/top-posts';
import { SidebarSettings } from '../../editor-sidebar/editor-sidebar';

/**
 * Custom types for brevity and for avoiding a "type React is undefined" error.
 */
type Settings = SidebarSettings | TopPostsSettings;
type ReactDeps = React.DependencyList | undefined;

/**
 * Saves the settings into the WordPress database whenever a dependency update
 * occurs.
 *
 * @since 3.13.0
 *
 * @param {string}    endpoint The settings endpoint to send the data to.
 * @param {Settings}  data     The data to send.
 * @param {ReactDeps} deps     The deps array that triggers saving.
 */
export const useSaveSettings = (
	endpoint: string,
	data: Settings,
	deps: ReactDeps = undefined
) => {
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
	}, deps ?? Object.values( data ) ); // eslint-disable-line react-hooks/exhaustive-deps
};
