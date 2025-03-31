<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Airtable\LeafletMap;

use RemoteDataBlocks\Integrations\Airtable\AirtableDataSource;
use RemoteDataBlocks\Integrations\Airtable\AirtableIntegration;

$access_token = constant( 'EXAMPLE_AIRTABLE_LEAFLET_MAP_ACCESS_TOKEN' );
$base_id = 'appqI3sJ9R2NcML8Y';
$table_id = 'tblc82R9msH4Yh6ZX';

$table = [
	'id' => $table_id,
	'name' => 'Map locations',
	'output_query_mappings' => [
		[
			'key' => 'id',
			'name' => 'ID',
			'path' => '$.id',
			'type' => 'id',
		],
		[
			'key' => 'name',
			'name' => 'Location name',
			'path' => '$.fields.Name',
			'type' => 'string',
		],
		[
			'key' => 'x',
			'name' => 'Latitude',
			'path' => '$.fields.x',
			'type' => 'number',
		],
		[
			'key' => 'y',
			'name' => 'Longitude',
			'path' => '$.fields.y',
			'type' => 'number',
		],
	],
];

$map_data_source = AirtableDataSource::from_array( [
	'service_config' => [
		'__version' => 1,
		'access_token' => $access_token,
		'base' => [
			'id' => $base_id,
			'name' => 'Map locations',
		],
		'display_name' => 'Map locations',
		'tables' => [ $table ],
	],
] );

$get_locations_query = AirtableIntegration::get_list_query( $map_data_source, $table );
$response = $get_locations_query->execute( [] );
$coordinates = [];

if ( ! is_wp_error( $response ) ) {
	$coordinates = array_map( function ( $value ) {
		$result = $value['result'];
		return [
			'name' => $result['name']['value'],
			'x' => $result['x']['value'],
			'y' => $result['y']['value'],
		];
	}, $response['results'] );
}

?>
<div
	<?php echo get_block_wrapper_attributes(); ?>
	data-map-coordinates="<?php echo( esc_attr( wp_json_encode( $coordinates ) ) ); ?>"
	style="height: 400px;"
>
</div>
