<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\Query;

use RemoteDataBlocks\Validation\ConfigSchemas;

defined( 'ABSPATH' ) || exit();

/**
 * GraphqlQuery class
 *
 * This class can be used to implement most GraphQL queries. It extends the
 * HttpQuery class to modify its behavior.
 *
 */
class GraphqlQuery extends HttpQuery {
	public function get_request_method(): string {
		return $this->config['request_method'] ?? 'POST';
	}

	/**
	 * Assemble the GraphQL query and variables into a GraphQL request body.
	 */
	public function get_request_body( array $input_variables ): array {
		return [
			'query' => $this->config['graphql_query'],
			'variables' => empty( $input_variables ) ? [] : $input_variables,
		];
	}

	/**
	 * @inheritDoc
	 */
	public static function get_config_schema(): array {
		return ConfigSchemas::get_graphql_query_config_schema();
	}
}
