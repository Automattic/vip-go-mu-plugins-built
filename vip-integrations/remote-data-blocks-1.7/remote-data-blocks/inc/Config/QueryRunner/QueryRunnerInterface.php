<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\QueryRunner;

use RemoteDataBlocks\Config\Query\HttpQueryInterface;
use WP_Error;

interface QueryRunnerInterface {
	/**
	 * Execute the query and return processed results.
	 *
	 * @param HttpQueryInterface $query The query to execute.
	 * @param array<string, mixed> $input_variables The input variables for the current request.
	 * @return WP_Error|array{
	 *   metadata: array<string, array{
	 *     name: string,
	 *     type: string,
	 *     value: string|int|null,
	 *   }>,
	 *   results: null|array<int, array{
	 *     result: array{
	 *       name: string,
	 *       type: string,
	 *       value: string,
	 *     },
	 *   }>,
	 * }
	 */
	public function execute( HttpQueryInterface $query, array $input_variables ): array|WP_Error;

	/**
	 * Execute the query multiple times and return processed and merged results.
	 *
	 * @param HttpQueryInterface $query The query to execute.
	 * @param array<string, mixed> $array_of_input_variables An array of input variables for each request.
	 * @return WP_Error|array{
	 *   metadata: array<string, array{
	 *     name: string,
	 *     type: string,
	 *     value: string|int|null,
	 *   }>,
	 *   results: null|array<int, array{
	 *     result: array{
	 *       name: string,
	 *       type: string,
	 *       value: string,
	 *     },
	 *   }>,
	 * }
	 */
	public function execute_batch( HttpQueryInterface $query, array $array_of_input_variables ): array|WP_Error;
}
