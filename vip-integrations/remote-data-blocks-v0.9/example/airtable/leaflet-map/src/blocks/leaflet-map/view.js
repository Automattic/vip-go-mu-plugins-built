import domReady from '@wordpress/dom-ready';

/* global document, leaflet */

export function initMaps( mapElements ) {
	mapElements.forEach( element => {
		const data = element?.dataset.mapCoordinates ?? '';

		let coordinates = [];
		try {
			coordinates = JSON.parse( data ) ?? [];
		} catch ( error ) {}

		delete element.dataset.mapCoordinates;

		const map = leaflet.map( element ).setView( [ coordinates[ 0 ].x, coordinates[ 0 ].y ], 25 );
		const layerGroup = leaflet.layerGroup().addTo( map );

		leaflet
			.tileLayer( 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 4 } )
			.addTo( map );

		coordinates
			.filter( location => location.x && location.y )
			.forEach( location => {
				leaflet.marker( [ location.x, location.y ], { title: location.name } ).addTo( layerGroup );
			} );

		map.flyTo( [ coordinates[ 0 ].x, coordinates[ 0 ].y ] );
	} );
}

// When the document is ready, find all maps and initialize them with Leaflet.
domReady( () => {
	initMaps( document.querySelectorAll( '.wp-block-example-leaflet-map[data-map-coordinates]' ) );
} );
