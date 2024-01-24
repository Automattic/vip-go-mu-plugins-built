/**
 * WordPress dependencies
 */
import { createRoot, render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { VerifyCredentials } from '../common/verify-credentials';
import { TopPosts } from './components/top-posts';

window.addEventListener(
	'load',
	function() {
		const container = document.querySelector( '#wp-parsely-dashboard-widget > .inside' );

		if ( null !== container ) {
			const component = <VerifyCredentials><TopPosts /></VerifyCredentials>;

			if ( createRoot ) {
				createRoot( container ).render( component );
			} else {
				render( component, container );
			}
		}
	},
	false
);
