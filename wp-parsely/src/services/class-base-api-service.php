<?php
/**
 * External API Service base class.
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services;

use Parsely\Parsely;

/**
 * The base class for the external API services.
 *
 * An external API service is a service that interacts with an external API,
 * such as the Parse.ly Content API or the Parse.ly Suggestions API.
 *
 * @since 3.17.0
 */
abstract class Base_API_Service {
	/**
	 * The registered endpoints for this service.
	 *
	 * @since 3.17.0
	 *
	 * @var array<string, Base_Service_Endpoint>
	 */
	protected $endpoints;

	/**
	 * The Parsely instance.
	 *
	 * @since 3.17.0
	 *
	 * @var Parsely
	 */
	private $parsely;


	/**
	 * Initializes the class.
	 *
	 * @since 3.17.0
	 *
	 * @param Parsely $parsely The Parsely instance.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;
		$this->register_endpoints();
	}

	/**
	 * Registers an endpoint with the service.
	 *
	 * @since 3.17.0
	 *
	 * @param Base_Service_Endpoint $endpoint The endpoint to register.
	 */
	protected function register_endpoint( Base_Service_Endpoint $endpoint ): void {
		$this->endpoints[ $endpoint->get_endpoint() ] = $endpoint;
	}

	/**
	 * Registers a cached endpoint with the service.
	 *
	 * @since 3.17.0
	 *
	 * @param Base_Service_Endpoint $endpoint The endpoint to register.
	 * @param int                   $ttl The time-to-live for the cache, in seconds.
	 */
	protected function register_cached_endpoint( Base_Service_Endpoint $endpoint, int $ttl ): void {
		$this->endpoints[ $endpoint->get_endpoint() ] = new Cached_Service_Endpoint( $endpoint, $ttl );
	}

	/**
	 * Gets an endpoint by name.
	 *
	 * @since 3.17.0
	 *
	 * @param string $endpoint The name of the endpoint.
	 * @return Base_Service_Endpoint The endpoint.
	 */
	public function get_endpoint( string $endpoint ): Base_Service_Endpoint {
		return $this->endpoints[ $endpoint ];
	}

	/**
	 * Returns the base URL for the API service.
	 *
	 * This method should be overridden in the child class to return the base URL
	 * for the API service.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	abstract public static function get_base_url(): string;

	/**
	 * Registers the endpoints for the service.
	 *
	 * This method should be overridden in the child class to register the
	 * endpoints for the service.
	 *
	 * @since 3.17.0
	 */
	abstract protected function register_endpoints(): void;

	/**
	 * Returns the API URL for the service.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public function get_api_url(): string {
		return static::get_base_url();
	}

	/**
	 * Returns the Parsely instance.
	 *
	 * @since 3.17.0
	 *
	 * @return Parsely
	 */
	public function get_parsely(): Parsely {
		return $this->parsely;
	}
}
