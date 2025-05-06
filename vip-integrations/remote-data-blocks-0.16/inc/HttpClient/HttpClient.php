<?php declare(strict_types = 1);

namespace RemoteDataBlocks\HttpClient;

use GuzzleHttp\HandlerStack;
use GuzzleHttp\Client;
use GuzzleHttp\Middleware;
use GuzzleHttp\RequestOptions;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\UriInterface;

defined( 'ABSPATH' ) || exit();

class HttpClient {
	public const USER_AGENT_STRING = 'WordPress Remote Data Blocks/1.0';

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

		// Set our User Agent header.
		$handler_stack->push( Middleware::mapRequest( function ( RequestInterface $request ) {
			return $request->withHeader( 'User-Agent', self::USER_AGENT_STRING );
		} ) );

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
}
