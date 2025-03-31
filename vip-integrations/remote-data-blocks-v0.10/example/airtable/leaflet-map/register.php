<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Airtable\LeafletMap;

function register_leaflet_map_block(): void {
	// If the access token is not provided via a constant, do not register the block.
	if ( ! defined( 'EXAMPLE_AIRTABLE_LEAFLET_MAP_ACCESS_TOKEN' ) ) {
		return;
	}

	// Register the Leaflet script and stylesheet. The handles are referenced in
	// `block.json` for use in the block editor and the WordPress frontend.
	wp_register_style( 'leaflet-style', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', [], '1.9.4' );
	wp_register_script( 'leaflet-script', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', [], '1.9.4', true );

	// Register the block using the build artifact.
	register_block_type( __DIR__ . '/build/blocks/leaflet-map' );
}
add_action( 'init', __NAMESPACE__ . '\\register_leaflet_map_block' );
