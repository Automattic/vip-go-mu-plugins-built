<?php declare(strict_types = 1);

namespace RemoteDataBlocks\ExampleApi;

use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\ExampleApi\Queries\ExampleApiQueryRunner;

use function register_remote_data_block;

/**
 * This example API is bundled with the plugin to provide a working demonstration
 * of Remote Data Blocks without requiring an external API. It is backed by a
 * flat file bundled with the plugin, so it can be used without an internet
 * connection and without reliance on an external server.
 *
 * It can be disabled with the following code snippet:
 *
 * add_filter( 'remote_data_blocks_register_example_block', '__return_false' );
 */
class ExampleApi {
	private static string $block_title = 'Conference Event';

	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_remote_data_block' ] );
	}

	private static function should_register(): bool {
		/**
		 * Determines whether the example remote data block should be registered.
		 *
		 * @param bool $should_register
		 * @return bool
		 */
		return apply_filters( 'remote_data_blocks_register_example_block', true );
	}

	public static function register_remote_data_block(): void {
		if ( true !== self::should_register() ) {
			return;
		}

		$data_source = HttpDataSource::from_array( [
			'display_name' => 'Example API (Conference Event)',
			'endpoint' => 'https://example.com/api/v1', // dummy URL
		] );

		$get_record_query = HttpQuery::from_array( [
			'data_source' => $data_source,
			'endpoint' => function ( array $input_variables ) use ( $data_source ): string {
				// This is not a real API, but we want to make sure to generate
				// valid cache keys that do not collide with other queries.
				return sprintf( '%s/%s', $data_source->get_endpoint(), $input_variables['record_id'] ?? '' );
			},
			'input_schema' => [
				'record_id' => [
					'name' => 'Record ID',
					'type' => 'id',
				],
			],
			'output_schema' => [
				'type' => [
					'id' => [
						'name' => 'Record ID',
						'path' => '$.id',
						'type' => 'id',
					],
					'title' => [
						'name' => 'Title',
						'path' => '$.fields.Activity',
						'type' => 'string',
					],
					'location' => [
						'name' => 'Location',
						'path' => '$.fields.Location',
						'type' => 'string',
					],
					'event_type' => [
						'name' => 'Event type',
						'path' => '$.fields.Type',
						'type' => 'string',
					],
				],
			],
			'query_runner' => new ExampleApiQueryRunner(),
		] );

		$get_table_query = HttpQuery::from_array( [
			'data_source' => $data_source,
			'input_schema' => [],
			'output_schema' => [
				'is_collection' => true,
				'path' => '$.records[*]',
				'type' => [
					'record_id' => [
						'name' => 'Record ID',
						'path' => '$.id',
						'type' => 'id',
					],
					'title' => [
						'name' => 'Title',
						'path' => '$.fields.Activity',
						'type' => 'string',
					],
					'location' => [
						'name' => 'Location',
						'path' => '$.fields.Location',
						'type' => 'string',
					],
					'event_type' => [
						'name' => 'Event type',
						'path' => '$.fields.Type',
						'type' => 'string',
					],
				],
			],
			'query_runner' => new ExampleApiQueryRunner(),
		] );

		register_remote_data_block( [
			'title' => self::$block_title,
			'render_query' => [
				'query' => $get_record_query,
			],
			'selection_queries' => [
				[
					'query' => $get_table_query,
					'type' => 'list',
				],
			],
		] );
	}
}
