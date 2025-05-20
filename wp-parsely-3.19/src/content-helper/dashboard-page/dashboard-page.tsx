/**
 * External dependencies
 */
import {
	Navigate,
	Route,
	HashRouter as Router,
	Routes,
} from 'react-router';

/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { SettingsPage, TrafficBoostPage } from './pages';
import { TrafficBoostPostPage } from './pages/traffic-boost/single-post-component';

domReady( () => {
	// Highlight the Traffic Boost menu item under the Parse.ly menu.
	document.querySelector(
		'#toplevel_page_parsely-dashboard-page .wp-submenu li.wp-first-item'
	)?.classList.add( 'current' );

	const root = createRoot(
		document.getElementById( 'parsely-dashboard-page' ) as Element
	);

	root.render(
		<Router>
			<ParselyDashboard />
		</Router>
	);
} );

/**
 * Main component for the Parse.ly dashboard.
 *
 * @since 3.19.0
 *
 * @class
 */
const ParselyDashboard = () => {
	return (
		<Routes>
			<Route path="/" element={ <Navigate to="/traffic-boost" replace /> } />
			<Route path="/traffic-boost" element={ <TrafficBoostPage /> } />
			<Route path="/traffic-boost/:postId" element={ <TrafficBoostPostPage /> } />
			<Route path="/settings" element={ <SettingsPage /> } />
		</Routes>
	);
};

