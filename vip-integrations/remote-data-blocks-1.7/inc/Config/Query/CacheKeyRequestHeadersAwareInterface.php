<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\Query;

/**
 * Implemented by HTTP queries that add request headers to their cache keys.
 */
interface CacheKeyRequestHeadersAwareInterface {
	/**
	 * Get the request header names whose values should be included in cache keys.
	 *
	 * @return array<string> Request header names included in cache keys.
	 */
	public function get_cache_key_request_headers(): array;
}
