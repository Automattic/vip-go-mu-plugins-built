/**
 * External dependencies
 */
import {
	Navigate,
	Route,
	HashRouter as Router,
	Routes,
	useParams,
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
			<Route path="/" element={ <Navigate to="/engagement-boost" replace /> } />
			<Route path="/engagement-boost" element={ <TrafficBoostPage /> } />
			<Route path="/engagement-boost/:postId" element={ <TrafficBoostPostPage /> } />
			<Route path="/settings" element={ <SettingsPage /> } />

			<Route path="/traffic-boost" element={ <Navigate to="/engagement-boost" replace /> } />
			<Route path="/traffic-boost/:postId" element={ <EngagementBoostRedirect /> } />
		</Routes>
	);
};

/**
 * Redirect component for "traffic-boost/:postId" to "engagement-boost/:postId" URLs.
 *
 * @since 3.20.2
 */
const EngagementBoostRedirect = () => {
	const { postId } = useParams();
	return <Navigate to={ `/engagement-boost/${ postId }` } replace />;
};
