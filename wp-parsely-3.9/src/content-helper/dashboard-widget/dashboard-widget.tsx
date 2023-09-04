/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { VerifyCredentials } from '../common/verify-credentials';
import { TopPostList } from './top-posts/component-list';

window.addEventListener(
	'load',
	function() {
		render(
			<VerifyCredentials>
				<TopPostList />
			</VerifyCredentials>,
			document.querySelector( '#wp-parsely-dashboard-widget > .inside' )
		);
	},
	false
);
