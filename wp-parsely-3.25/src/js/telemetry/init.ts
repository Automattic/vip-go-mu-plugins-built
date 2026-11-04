/**
 * WordPress dependencies
 */
import { createElement, Fragment } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import { Telemetry } from './telemetry';
import { BlockChangeMonitor } from './block-change';

// Initialize the telemetry module.
const telemetry = Telemetry.getInstance();

// Set up the events.
if ( telemetry.isTelemetryEnabled() ) {
	/**
	 * The events to be tracked.
	 *
	 * @since 3.12.0
	 */
	const events = [
		BlockChangeMonitor,
	];

	const EventsComponent = createElement(
		Fragment,
		null,
		...events.map( ( EventComponent ) => createElement( EventComponent ) )
	);

	registerPlugin( 'wp-parsely-tracks-js-events', {
		render: () => EventsComponent,
	} );
}

