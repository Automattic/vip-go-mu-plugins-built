<?php declare(strict_types = 1);

namespace RemoteDataBlocks\ExampleApi\Queries;

use RemoteDataBlocks\Config\QueryRunner\QueryRunner;
use RemoteDataBlocks\ExampleApi\Data\ExampleApiData;

defined( 'ABSPATH' ) || exit();

/**
 * ExampleApiQueryRunner class
 *
 * Execute the query by making an internal REST API request. This allows the
 * example API to work when running locally (inside a container). Otherwise,
 * there would be a mismatch between the public address (e.g., localhost:8888)
 * and what is reachable inside a container.
 *
 */
class ExampleApiQueryRunner extends QueryRunner {
	protected function get_raw_response_data( array $request_details, array $input_variables ): array {
		if ( isset( $input_variables['record_id'] ) ) {
			return [
				'metadata' => [],
				'response_data' => ExampleApiData::get_item( $input_variables['record_id'] ),
			];
		}

		return [
			'metadata' => [],
			'response_data' => ExampleApiData::get_items(),
		];
	}
}
