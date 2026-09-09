<?php declare(strict_types = 1);

namespace RemoteDataBlocks\HttpClient;

use GuzzleHttp\HandlerStack;
use GuzzleHttp\Client;
use GuzzleHttp\Middleware;
use GuzzleHttp\RequestOptions;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\UriInterface;
use RemoteDataBlocks\PluginSettings\PluginSettings;

defined( 'ABSPATH' ) || exit();

class HttpClient {
	protected Client $client;

	/**
	 * Private constructor to enforce singleton pattern.
	 */
	private function __construct() {
		// Initialize a request handler that uses wp_remote_request instead of cURL.
		// PHP cURL bindings are not always available, e.g., in WASM environments
		// like WP Now and WP Playground.
		$request_handler = new WPRemoteRequestHandler();

		$handler_stack = HandlerStack::create( $request_handler );

		$handler_stack->push( new RdbLogMiddleware(), 'remote_data_blocks_logger' );
		$handler_stack->push( new RdbCacheMiddleware( new RdbCacheStrategy() ), 'remote_data_blocks_cache' );

		// Set our User Agent header only if one hasn't been set.
		$handler_stack->push( Middleware::mapRequest( [ $this, 'provide_default_user_agent' ] ), 'remote_data_blocks_user_agent' );

		$this->client = new Client( [ 'handler' => $handler_stack ] );
	}

	/**
	 * Get the singleton instance of HttpClient.
	 *
	 * @return self The singleton instance.
	 */
	public static function instance(): self {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new self();
		}

		return $instance;
	}

	/**
	 * Execute a request.
	 */
	public function request( string $method, string|UriInterface $uri, array $options = [], ?Client $client = null ): ResponseInterface {
		$http_client = $client ?? $this->client;
		$options = array_merge( $options, [
			// Avoid thrown exceptions for HTTP errors.
			RequestOptions::HTTP_ERRORS => false,
		] );

		return $http_client->request( $method, $uri, $options );
	}

	/**
	 * Provide the default User-Agent header.
	 *
	 * @param RequestInterface $request The request to provide the User-Agent header for.
	 * @return RequestInterface The request with the User-Agent header.
	 */
	public function provide_default_user_agent( RequestInterface $request ): RequestInterface {
		// Only set User-Agent if one hasn't already been set
		if ( ! $request->hasHeader( 'User-Agent' ) ) {
			return $request->withHeader( 'User-Agent', self::get_user_agent_string() );
		}
		return $request;
	}

	private function get_user_agent_string(): string {
		return 'WordPress Remote Data Blocks/' . PluginSettings::get_version();
	}
}
