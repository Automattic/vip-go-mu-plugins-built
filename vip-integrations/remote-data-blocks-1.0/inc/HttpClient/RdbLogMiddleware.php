<?php declare( strict_types = 1 );

namespace RemoteDataBlocks\HttpClient;

use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Promise\PromiseInterface;
use GuzzleHttp\Promise\Create;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use function do_action;

final class RdbLogMiddleware {
	public static string $action_name = 'remote_data_blocks_log_http_request';

	/**
	 * Creates a callable middleware for logging requests and responses.
	 */
	public function __construct() {}

	/**
	 * Called when the middleware is handled by the client.
	 *
	 * @return callable(RequestInterface, array): PromiseInterface
	 */
	public function __invoke( callable $handler ): callable {
		return function ( RequestInterface $request, array &$options ) use ( $handler ): PromiseInterface {
			return $handler( $request, $options )
				->then(
					$this->handle_success( $request, $options ),
					$this->handle_failure( $request, $options )
				);
		};
	}

	private function log( RequestInterface $request, ?ResponseInterface $response, ?\Exception $reason ): void {
		$response_headers = $response ? $response->getHeaders() : [];
		$uri = $request->getUri();

		$context = [
			'cache_age' => $response_headers[ RdbCacheStrategy::CACHE_AGE_RESPONSE_HEADER ][0] ?? '',
			'cache_group' => RdbCacheStrategy::WP_OBJECT_CACHE_GROUP ?? '',
			'cache_key' => RdbCacheStrategy::get_object_cache_key_from_request( $request ),
			'cache_status' => $response_headers[ CacheMiddleware::HEADER_CACHE_INFO ][0] ?? '',
			'error' => $reason,
			'hostname' => $uri->getHost(),
			'method' => $request->getMethod(),
			'origin' => $uri->getAuthority(),
			'path' => $uri->getPath(),
			'status_code' => $response ? $response->getStatusCode() : null,
			'uri' => (string) $request->getUri(),
		];

		do_action( self::$action_name, $context );
	}

	/**
	 * Returns a function which is handled when a request was rejected.
	 */
	private function handle_failure( RequestInterface $request, array $options ): callable {
		return function ( \Exception $reason ) use ( $request, $options ) {
			$response = ( $reason instanceof RequestException && $reason->hasResponse() === true ) ? $reason->getResponse() : null;
			$this->log( $request, $response, $reason, $options );
			return Create::rejectionFor( $reason );
		};
	}

	/**
	 * Returns a function which is handled when a request was successful.
	 */
	private function handle_success( RequestInterface $request, array $options ): callable {
		return function ( ResponseInterface $response ) use ( $request, $options ) {
			$this->log( $request, $response, null, $options );
			return $response;
		};
	}
}
