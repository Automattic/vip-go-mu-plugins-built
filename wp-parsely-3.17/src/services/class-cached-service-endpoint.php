<?php
/**
 * Cached Service Endpoint class.
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services;

use WP_Error;

/**
 * Cached Service Endpoint class.
 *
 * This class is a wrapper around a service endpoint that caches the response
 * from the API request.
 *
 * @since 3.17.0
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Base_Service_Endpoint
 */
class Cached_Service_Endpoint extends Base_Service_Endpoint {
	/**
	 * The cache group for the API requests.
	 *
	 * @since 3.17.0
	 *
	 * @var string
	 */
	private const CACHE_GROUP = 'wp-parsely';

	/**
	 * The service endpoint object.
	 *
	 * @since 3.17.0
	 *
	 * @var Base_Service_Endpoint
	 */
	private $service_endpoint;

	/**
	 * The cache time-to-live, in milliseconds.
	 *
	 * @since 3.17.0
	 *
	 * @var int
	 */
	private $cache_ttl;

	/**
	 * Constructor.
	 *
	 * @since 3.17.0
	 *
	 * @param Base_Service_Endpoint $service_endpoint The service endpoint object.
	 * @param int                   $cache_ttl The cache time-to-live.
	 */
	public function __construct( Base_Service_Endpoint $service_endpoint, int $cache_ttl ) {
		$this->service_endpoint = $service_endpoint;
		$this->cache_ttl        = $cache_ttl;

		parent::__construct( $service_endpoint->api_service );
	}

	/**
	 * Returns the cache key for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return string The cache key for the API request.
	 */
	private function get_cache_key( array $args ): string {
		$api_service = $this->service_endpoint->api_service;

		$cache_key = 'parsely_api_' .
					wp_hash( $api_service->get_api_url() ) . '_' .
					wp_hash( $this->get_endpoint() ) . '_' .
					wp_hash( (string) wp_json_encode( $args ) );

		return $cache_key;
	}

	/**
	 * Executes the API request, caching the response.
	 *
	 * If the response is already cached, it will be returned from the cache,
	 * otherwise the API request will be made and the response will be cached.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return WP_Error|array<mixed> The response from the API.
	 */
	public function call( array $args = array() ) {
		$cache_key = $this->get_cache_key( $args );
		$cache     = wp_cache_get( $cache_key, self::CACHE_GROUP );

		if ( false !== $cache ) {
			// @phpstan-ignore-next-line
			return $cache;
		}

		$response = $this->service_endpoint->call( $args );

		if ( ! is_wp_error( $response ) ) {
			wp_cache_set( $cache_key, $response, self::CACHE_GROUP, $this->cache_ttl ); // phpcs:ignore
		}

		return $response;
	}

	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return string The endpoint for the API request.
	 */
	public function get_endpoint(): string {
		return $this->service_endpoint->get_endpoint();
	}

	/**
	 * Returns the uncached endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return Base_Service_Endpoint The uncached endpoint for the API request.
	 */
	public function get_uncached_endpoint(): Base_Service_Endpoint {
		return $this->service_endpoint;
	}

	/**
	 * Returns the request options for the remote API request.
	 *
	 * Gets the request options from the uncached service endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @param string $method The HTTP method to use for the request.
	 * @return WP_HTTP_Request_Args The request options for the remote API request.
	 */
	protected function get_request_options( string $method ): array {
		return $this->service_endpoint->get_request_options( $method );
	}

	/**
	 * Returns the common query arguments to send to the remote API.
	 *
	 * Gets the query arguments from the uncached service endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args Additional query arguments to send to the remote API.
	 * @return array<mixed> The query arguments to send to the remote API.
	 */
	protected function get_query_args( array $args = array() ): array {
		return $this->service_endpoint->get_query_args( $args );
	}
}
