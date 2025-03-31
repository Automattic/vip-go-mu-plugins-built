<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Airtable\Events;

use RemoteDataBlocks\Integrations\Airtable\AirtableDataSource;
use RemoteDataBlocks\Integrations\Airtable\AirtableIntegration;

function register_airtable_events_block(): void {
	if ( ! defined( 'EXAMPLE_AIRTABLE_EVENTS_ACCESS_TOKEN' ) ) {
		return;
	}

	$access_token = constant( 'EXAMPLE_AIRTABLE_EVENTS_ACCESS_TOKEN' );
	$base_id = 'appVQ2PAl95wQSo9S'; // Airtable base ID
	$table_id = 'tblyGtuxblLtmoqMI'; // Airtable table ID

	// Define the data source
	$airtable_data_source = AirtableDataSource::from_array( [
		'service_config' => [
			'__version' => 1,
			'access_token' => $access_token,
			'base' => [
				'id' => $base_id,
				'name' => 'Conference Events',
			],
			'display_name' => 'Conference Events',
			'tables' => [
				[
					'id' => $table_id,
					'name' => 'Conference Events',
					'output_query_mappings' => [
						[
							'key' => 'record_id',
							'name' => 'ID',
							'path' => '$.id',
							'type' => 'id',
						],
						[
							'key' => 'title',
							'name' => 'Title',
							'path' => '$.fields.Activity',
							'type' => 'string',
						],
						[
							'key' => 'type',
							'name' => 'Type',
							'path' => '$.fields.Type',
							'type' => 'string',
						],
						[
							'key' => 'location',
							'name' => 'Location',
							'path' => '$.fields.Location',
							'type' => 'string',
						],
						[
							'key' => 'notes',
							'name' => 'Notes',
							'path' => '$.fields.Notes',
							'type' => 'string',
						],
					],
				],
			],
		],
	] );

	AirtableIntegration::register_blocks_for_airtable_data_source( $airtable_data_source );
	AirtableIntegration::register_loop_blocks_for_airtable_data_source( $airtable_data_source );
}

add_action( 'init', __NAMESPACE__ . '\\register_airtable_events_block' );
