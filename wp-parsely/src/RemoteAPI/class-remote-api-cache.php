<?php
/**
 * Remote API: Caching decorator class
 *
 * @package Parsely
 * @since   3.2.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use WP_Error;

/**
 * Caching Decorator for remote API endpoints.
 */
class Remote_API_Cache implements Remote_API_Interface {
	private const CACHE_GROUP      = 'wp-parsely';
	private const OBJECT_CACHE_TTL = 5 * MINUTE_IN_SECONDS;

	/**
	 * The Remote API instance which we will cache.
	 *
	 * @var Base_Endpoint_Remote
	 */
	private $remote_api;

	/**
	 * A wrapped object that's compatible with the Cache Interface.
	 *
	 * @var Cache
	 */
	private $cache;

	/**
	 * Constructor.
	 *
	 * @param Base_Endpoint_Remote $remote_api The remote api object to cache.
	 * @param Cache                $cache An object cache instance.
	 */
	public function __construct( Base_Endpoint_Remote $remote_api, Cache $cache ) {
		$this->remote_api = $remote_api;
		$this->cache      = $cache;
	}

	/**
	 * Implements caching for the Remote API interface.
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @param bool                 $associative Always `false`, just present to make definition compatible
	 *                             with interface.
	 * @return array<string, mixed>|object|WP_Error The response from the remote API, or false if the
	 *                                              response is empty.
	 */
	public function get_items( array $query, bool $associative = false ) {
		$cache_key = 'parsely_api_' .
			wp_hash( $this->remote_api->get_endpoint() ) . '_' .
			wp_hash( (string) wp_json_encode( $query ) );

		/**
		 * Variable.
		 *
		 * @var array<string, mixed>|false
		 */
		$items = $this->cache->get( $cache_key, self::CACHE_GROUP );

		if ( false === $items ) {
			$items = $this->remote_api->get_items( $query );
			$this->cache->set( $cache_key, $items, self::CACHE_GROUP, self::OBJECT_CACHE_TTL );
		}

		return $items;
	}

	/**
	 * Checks if the current user is allowed to make the API call.
	 *
	 * @since 3.7.0
	 *
	 * @return bool
	 */
	public function is_user_allowed_to_make_api_call(): bool {
		return $this->remote_api->is_user_allowed_to_make_api_call();
	}
}
