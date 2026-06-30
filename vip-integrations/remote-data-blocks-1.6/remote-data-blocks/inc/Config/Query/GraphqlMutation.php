<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\Query;

defined( 'ABSPATH' ) || exit();

/** @psalm-api */
class GraphqlMutation extends GraphqlQuery {
	/**
	 * GraphQL mutations are uncachable by default.
	 */
	public function get_cache_ttl( array $input_variables ): int {
		return -1;
	}
}
