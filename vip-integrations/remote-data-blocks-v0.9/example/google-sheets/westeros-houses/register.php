<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\GoogleSheets\WesterosHouses;

use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Integrations\Google\Sheets\GoogleSheetsDataSource;

function register_google_sheets_westeros_houses_blocks(): void {
	if ( ! defined( 'EXAMPLE_GOOGLE_SHEETS_WESTEROS_HOUSES_ENCODED_CREDENTIALS' ) ) {
		return;
	}

	$encoded_credentials = constant( 'EXAMPLE_GOOGLE_SHEETS_WESTEROS_HOUSES_ENCODED_CREDENTIALS' );
	$spreadsheet_id = '1EHdQg53Doz0B-ImrGz_hTleYeSvkVIk_NSJCOM1FQk0'; // Spreadsheet ID
	$sheet_id = '1'; // Sheet ID / GID
	$sheet_name = 'Houses';
	$credentials = json_decode( base64_decode( $encoded_credentials ), true );

	$westeros_houses_data_source = GoogleSheetsDataSource::from_array( [
		'service_config' => [
			'__version' => 1,
			'credentials' => $credentials,
			'display_name' => 'Westeros Houses',
			'spreadsheet' => [
				'id' => $spreadsheet_id,
			],
			'sheets' => [
				[
					'id' => $sheet_id,
					'name' => $sheet_name,
					'output_query_mappings' => [],
				],
			],
		],
	] );

	$list_westeros_houses_query = HttpQuery::from_array( [
		'data_source' => $westeros_houses_data_source,
		'endpoint' => sprintf( '%s/values/%s', $westeros_houses_data_source->get_endpoint(), $sheet_name ),
		'output_schema' => [
			'is_collection' => true,
			'path' => '$.values[*]',
			'type' => [
				'row_id' => [
					'name' => 'Row ID',
					'path' => '$.RowId',
					'type' => 'id',
				],
				'house' => [
					'name' => 'House',
					'path' => '$.House',
					'type' => 'string',
				],
				'seat' => [
					'name' => 'Seat',
					'path' => '$.Seat',
					'type' => 'string',
				],
				'region' => [
					'name' => 'Region',
					'path' => '$.Region',
					'type' => 'string',
				],
				'words' => [
					'name' => 'Words',
					'path' => '$.Words',
					'type' => 'string',
				],
				'image_url' => [
					'name' => 'Sigil',
					'path' => '$.Sigil',
					'type' => 'image_url',
				],
			],
		],
		'preprocess_response' => function ( mixed $response_data ): array {
			return GoogleSheetsDataSource::preprocess_list_response( $response_data );
		},
	] );

	$get_westeros_houses_query = HttpQuery::from_array( [
		'data_source' => $westeros_houses_data_source,
		'endpoint' => sprintf( '%s/values/%s', $westeros_houses_data_source->get_endpoint(), $sheet_name ),
		'input_schema' => [
			'row_id' => [
				'name' => 'Row ID',
				'type' => 'id',
			],
		],
		'output_schema' => [
			'type' => [
				'row_id' => [
					'name' => 'Row ID',
					'path' => '$.RowId',
					'type' => 'id',
				],
				'house' => [
					'name' => 'House',
					'path' => '$.House',
					'type' => 'string',
				],
				'seat' => [
					'name' => 'Seat',
					'path' => '$.Seat',
					'type' => 'string',
				],
				'region' => [
					'name' => 'Region',
					'path' => '$.Region',
					'type' => 'string',
				],
				'words' => [
					'name' => 'Words',
					'path' => '$.Words',
					'type' => 'string',
				],
				'image_url' => [
					'name' => 'Sigil',
					'path' => '$.Sigil',
					'type' => 'image_url',
				],
			],
		],
		'preprocess_response' => function ( mixed $response_data, array $input_variables ): array {
			return GoogleSheetsDataSource::preprocess_get_response( $response_data, $input_variables );
		},
	] );

	register_remote_data_block( [
		'title' => 'Westeros House',
		'render_query' => [
			'query' => $get_westeros_houses_query,
		],
		'selection_queries' => [
			[
				'query' => $list_westeros_houses_query,
				'type' => 'list',
			],
		],
		'overrides' => [
			[
				'display_name' => 'Use Westeros House from URL',
				'name' => 'westeros_house',
			],
		],
	] );

	register_remote_data_block( [
		'title' => 'Westeros Houses List',
		'render_query' => [
			'loop' => true,
			'query' => $list_westeros_houses_query,
		],
	] );
}
add_action( 'init', __NAMESPACE__ . '\\register_google_sheets_westeros_houses_blocks' );

function handle_westeros_house_override(): void {
	// This rewrite targets a page with the slug "westeros-houses", which must be created.
	add_rewrite_rule( '^westeros-houses/([^/]+)/?', 'index.php?pagename=westeros-houses&row_id=$matches[1]', 'top' );

	// Add the "file_path" query variable to the list of recognized query variables.
	add_filter( 'query_vars', function ( array $query_vars ): array {
		$query_vars[] = 'row_id';
		return $query_vars;
	}, 10, 1 );

	// Filter the query input variables to inject the "row_id" value from the
	// URL. Note that the override must match the override name defined in the
	// block registration above.
	add_filter( 'remote_data_blocks_query_input_variables', function ( array $input_variables, array $enabled_overrides ): array {
		if ( true === in_array( 'westeros_house', $enabled_overrides, true ) ) {
			$row_id = get_query_var( 'row_id' );

			if ( ! empty( $row_id ) ) {
				$input_variables['row_id'] = $row_id;
			}
		}

		return $input_variables;
	}, 10, 2 );
}
add_action( 'init', __NAMESPACE__ . '\\handle_westeros_house_override' );
