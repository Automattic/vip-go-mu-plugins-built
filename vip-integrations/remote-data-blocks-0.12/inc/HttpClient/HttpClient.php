<?php declare(strict_types = 1);

namespace RemoteDataBlocks\HttpClient;

use Exception;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\MessageFormatter;
use GuzzleHttp\Middleware;
use GuzzleHttp\Promise\Utils;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\UriInterface;
use RemoteDataBlocks\HttpClient\RdbCacheStrategy;
use RemoteDataBlocks\HttpClient\RdbCacheMiddleware;
use RemoteDataBlocks\Logging\LoggerManager;

defined( 'ABSPATH' ) || exit();

class HttpClient {
	public Client $client;

	private const MAX_RETRIES = 3;

	public const CACHE_TTL_CLIENT_OPTION_KEY = '__default_cache_ttl';

	private string $base_uri;
	private HandlerStack $handler_stack;
	private static RdbCacheMiddleware $cache_middleware;

	/**
	 * @var array<string, string>
	 */
	private array $headers = [];

	/**
	 * @var array<string, mixed>
	 */
	private array $options = [];

	/**
	 * @var array<string, mixed>
	 */
	private array $default_options = [
		'headers' => [
			'User-Agent' => 'WordPress Remote Data Blocks/1.0',
		],
	];

	/**
	 * @var array<int, array{method: string, uri: string|UriInterface, options: array<string, mixed>}>
	 */
	private array $queued_requests = [];

	/**
	 * Get the cache middleware for the HTTP client.
	 */
	protected static function get_cache_middleware( int|null $default_ttl = null ): callable {
		if ( ! isset( self::$cache_middleware ) ) {
			self::$cache_middleware = new RdbCacheMiddleware( new RdbCacheStrategy( $default_ttl ) );
		}

		return self::$cache_middleware;
	}

	/**
	 * Initialize the HTTP client.
	 */
	public function init( string $base_uri, array $headers = [], array $client_options = [] ): void {
		$this->base_uri = $base_uri;
		$this->headers = $headers;
		$this->options = $client_options;

		// Initialize a request handler that uses wp_remote_request instead of cURL.
		// PHP cURL bindings are not always available, e.g., in WASM environments
		// like WP Now and WP Playground.
		$request_handler = new WPRemoteRequestHandler();

		$this->handler_stack = HandlerStack::create( $request_handler );

		$this->handler_stack->push( Middleware::retry(
			self::class . '::retry_decider',
			self::class . '::retry_delay'
		) );

		$this->handler_stack->push( Middleware::mapRequest( function ( RequestInterface $request ) {
			foreach ( $this->headers as $header => $value ) {
				$request = $request->withHeader( $header, $value );
			}

			return $request;
		} ) );

		$default_ttl = $client_options[ self::CACHE_TTL_CLIENT_OPTION_KEY ] ?? null;
		$cache_middleware = self::get_cache_middleware( $default_ttl );
		$this->handler_stack->push( $cache_middleware, 'remote_data_blocks_cache' );

		$this->handler_stack->push( Middleware::log(
			LoggerManager::instance(),
			new MessageFormatter( '{total_time} {code} {phrase} {method} {url}' )
		) );

		$this->client = new Client( array_merge( $this->default_options, $this->options, [
			'base_uri' => $this->base_uri,
			'handler' => $this->handler_stack,
		] ) );
	}

	/**
	 * Determine if the request request be retried.
	 *
	 * @param int               $retries Number of retries that have been attempted so far.
	 * @param RequestInterface  $request Request that was sent.
	 * @param ResponseInterface $response Response that was received.
	 * @param Exception         $exception Exception that was received (if any).
	 * @return bool Whether the request should be retried.
	 */
	public static function retry_decider( int $retries, RequestInterface $request, ?ResponseInterface $response = null, ?Exception $exception = null ): bool {
		// Exceeding max retries is not overrideable.
		if ( $retries >= self::MAX_RETRIES ) {
			return false;
		}

		$should_retry = false;

		if ( $response && $response->getStatusCode() >= 500 ) {
			$should_retry = true;
		}

		if ( $exception ) {
			$should_retry = $should_retry || $exception instanceof ConnectException;
		}

		return apply_filters( 'remote_data_blocks_http_client_retry_decider', $should_retry, $retries, $request, $response, $exception );
	}

	/**
	 * Calculate the delay before retrying a request.
	 *
	 * @param int               $retries Number of retries that have been attempted so far.
	 * @param ResponseInterface $response Response that was received.
	 * @return int Number of milliseconds to delay.
	 */
	public static function retry_delay( int $retries, ?ResponseInterface $response ): int {
		// Be default, implement a linear backoff strategy.
		$retry_after = $retries;

		if ( $response instanceof ResponseInterface && $response->hasHeader( 'Retry-After' ) ) {
			$retry_after = $response->getHeaderLine( 'Retry-After' );

			if ( ! is_numeric( $retry_after ) ) {
				$retry_after = ( new \DateTime( $retry_after ) )->getTimestamp() - time();
			}
		}

		$retry_after_ms = (int) $retry_after * 1000;
		return apply_filters( 'remote_data_blocks_http_client_retry_delay', $retry_after_ms, $retries, $response );
	}

	/**
	 * Queue a request for later execution.
	 */
	public function queue_request( string $method, string|UriInterface $uri, array $options = [] ): void {
		$this->queued_requests[] = [
			'method' => $method,
			'uri' => $uri,
			'options' => array_merge( $this->options, $options ),
		];
	}

	/**
	 * Execute all queued requests in parallel.
	 */
	public function execute_parallel(): array {
		$promises = [];
		foreach ( $this->queued_requests as $request ) {
			$promises[] = $this->client->requestAsync(
				$request['method'],
				$request['uri'],
				$request['options']
			);
		}

		$results = Utils::settle( $promises )->wait();

		// Clear the queue after execution
		$this->queued_requests = [];

		return $results;
	}

	/**
	 * Execute a request.
	 */
	public function request( string $method, string|UriInterface $uri, array $options = [] ): ResponseInterface {
		return $this->client->request( $method, $uri, array_merge( $this->options, $options ) );
	}

	/**
	 * Execute a GET request.
	 */
	public function get( string|UriInterface $uri, array $options = [] ): ResponseInterface {
		return $this->request( 'GET', $uri, $options );
	}

	/**
	 * Execute a POST request.
	 */
	public function post( string|UriInterface $uri, array $options = [] ): ResponseInterface {
		return $this->request( 'POST', $uri, $options );
	}
}
