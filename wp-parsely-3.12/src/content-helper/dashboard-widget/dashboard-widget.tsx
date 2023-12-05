/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';

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
			const root = createRoot( container );
			root.render(
				<VerifyCredentials>
					<TopPosts />
				</VerifyCredentials>
			);
		}
	},
	false
);
