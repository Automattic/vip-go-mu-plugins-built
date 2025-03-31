<?php declare(strict_types = 1);

/**
 * Plugin Name: Art Institute RDB Example
 * Description: Creates a custom block to be used with Remote Data Blocks in order to retrieve artwork from the Art Institute of Chicago.
 * Author: WPVIP
 * Author URI: https://remotedatablocks.com/
 * Text Domain: remote-data-blocks
 * Version: 1.0.0
 * Requires Plugins: remote-data-blocks
 */

namespace RemoteDataBlocks\Example\ArtInstituteOfChicago;

use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Config\Query\HttpQuery;
use function add_query_arg;

function register_aic_block(): void {
	$aic_data_source = HttpDataSource::from_array([
		'service_config' => [
			'__version' => 1,
			'display_name' => 'Art Institute of Chicago',
			'endpoint' => 'https://api.artic.edu/api/v1/artworks',
			'request_headers' => [
				'Content-Type' => 'application/json',
			],
		],
	]);

	$get_art_query = HttpQuery::from_array([
		'data_source' => $aic_data_source,
		'endpoint' => function ( array $input_variables ) use ( $aic_data_source ): string {
			return sprintf( '%s/%s', $aic_data_source->get_endpoint(), $input_variables['id'] ?? '' );
		},
		'input_schema' => [
			'id' => [
				'name' => 'Art ID',
				'type' => 'id',
			],
		],
		'output_schema' => [
			'is_collection' => false,
			'path' => '$.data',
			'type' => [
				'id' => [
					'name' => 'Art ID',
					'type' => 'id',
				],
				'title' => [
					'name' => 'Title',
					'type' => 'string',
				],
				'image_id' => [
					'name' => 'Image ID',
					'type' => 'id',
				],
				'image_url' => [
					'name' => 'Image URL',
					'generate' => function ( $data ): string {
						return 'https://www.artic.edu/iiif/2/' . $data['image_id'] . '/full/843,/0/default.jpg';
					},
					'type' => 'image_url',
				],
			],
		],
	]);

	$search_art_query = HttpQuery::from_array([
		'data_source' => $aic_data_source,
		'endpoint' => function ( array $input_variables ) use ( $aic_data_source ): string {
			$endpoint = $aic_data_source->get_endpoint();
			$search_terms = $input_variables['search'] ?? '';

			if ( ! empty( $search_terms ) ) {
				$endpoint = add_query_arg( [ 'q' => $search_terms ], $endpoint . '/search' );
			}

			return add_query_arg( [
				'limit' => $input_variables['limit'],
				'page' => $input_variables['page'],
			], $endpoint );
		},
		'input_schema' => [
			'search' => [
				'name' => 'Search terms',
				'type' => 'ui:search_input',
			],
			'limit' => [
				'default_value' => 10,
				'name' => 'Pagination limit',
				'type' => 'ui:pagination_per_page',
			],
			'page' => [
				'default_value' => 1,
				'name' => 'Pagination page',
				'type' => 'ui:pagination_page',
			],
		],
		'output_schema' => [
			'is_collection' => true,
			'path' => '$.data[*]',
			'type' => [
				'id' => [
					'name' => 'Art ID',
					'type' => 'id',
				],
				'title' => [
					'name' => 'Title',
					'type' => 'string',
				],
			],
		],
		'pagination_schema' => [
			'total_items' => [
				'name' => 'Total items',
				'path' => '$.pagination.total',
				'type' => 'integer',
			],
		],
	]);

	register_remote_data_block([
		'title' => 'Art Institute of Chicago',
		'render_query' => [
			'query' => $get_art_query,
		],
		'selection_queries' => [
			[
				'query' => $search_art_query,
				'type' => 'search',
			],
		],
	]);
}
add_action( 'init', __NAMESPACE__ . '\\register_aic_block' );
