/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { VerifyCredentials } from '../common/verify-credentials';
import { TopPosts } from './components/top-posts';

window.addEventListener(
	'load',
	function() {
		render(
			<VerifyCredentials>
				<TopPosts />
			</VerifyCredentials>,
			document.querySelector( '#wp-parsely-dashboard-widget > .inside' )
		);
	},
	false
);
