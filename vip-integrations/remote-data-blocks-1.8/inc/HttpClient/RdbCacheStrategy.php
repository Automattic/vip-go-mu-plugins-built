<?php declare(strict_types = 1);

namespace RemoteDataBlocks\HttpClient;

use DateTime;
use Kevinrob\GuzzleCache\CacheEntry;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Kevinrob\GuzzleCache\Storage\CacheStorageInterface;
use Kevinrob\GuzzleCache\Storage\WordPressObjectCacheStorage;
use Kevinrob\GuzzleCache\Strategy\CacheStrategyInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use function wp_rand;

class RdbCacheStrategy implements CacheStrategyInterface {
	public const CACHE_AGE_RESPONSE_HEADER = 'Age';
	public const CACHE_STATUS_RESPONSE_HEADER = CacheMiddleware::HEADER_CACHE_INFO;
	public const CACHE_TTL_REQUEST_HEADER = 'X-Remote-Data-Blocks-Cache-TTL';
	public const CACHE_KEY_REQUEST_HEADERS_REQUEST_HEADER = 'X-Remote-Data-Blocks-Cache-Key-Headers';
	public const WP_OBJECT_CACHE_GROUP = 'remote-data-blocks';

	private const ERROR_CACHE_TTL_IN_SECONDS = 30; // 30 seconds for error responses
	private const FALLBACK_CACHE_TTL_IN_SECONDS = 300; // 5 minutes for success responses
	private const CACHE_METADATA_REQUEST_HEADERS = [
		self::CACHE_TTL_REQUEST_HEADER,
		self::CACHE_KEY_REQUEST_HEADERS_REQUEST_HEADER,
	];
	private const STATUS_ACCEPTED = [
		200 => true,
		203 => true,
		204 => true,
		300 => true,
		301 => true,
		404 => true,
		405 => true,
		410 => true,
		414 => true,
		418 => true,
		501 => true,
	];

	private CacheStorageInterface $storage;

	public function __construct( ?CacheStorageInterface $storage = null ) {
		$this->storage = $storage ?? new WordPressObjectCacheStorage( self::WP_OBJECT_CACHE_GROUP );
	}

	public static function without_cache_metadata_headers( RequestInterface $request ): RequestInterface {
		foreach ( self::CACHE_METADATA_REQUEST_HEADERS as $header ) {
			$request = $request->withoutHeader( $header );
		}

		return $request;
	}

	public static function get_object_cache_key_from_request( RequestInterface $request ): string {
		$request_body = (string) $request->getBody();
		$request_method = $request->getMethod();
		$request_uri = (string) $request->getUri();

		$cache_key_request_headers = CacheKeyRequestHeaders::merge(
			$request->getHeader( self::CACHE_KEY_REQUEST_HEADERS_REQUEST_HEADER )
		);

		$cache_headers = [];
		foreach ( $cache_key_request_headers as $header ) {
			if ( $request->hasHeader( $header ) ) {
				$cache_headers[ $header ] = $request->getHeader( $header );
			}
		}

		$input_hash = md5( wp_json_encode( [
			'body' => $request_body,
			'headers' => $cache_headers,
			'method' => $request_method,
			'uri' => (string) $request_uri,
		] ) );

		return sprintf( 'http-client:%s', $input_hash );
	}

	public function fetch( RequestInterface $request ): ?CacheEntry {
		return $this->storage->fetch( self::get_object_cache_key_from_request( $request ) );
	}

	public function cache( RequestInterface $request, ResponseInterface $response ): bool {
		$warning_message = sprintf(
			'%d - "%s" "%s"',
			299,
			'Cached although the response headers indicate not to do it!',
			( new DateTime() )->format( DateTime::RFC1123 )
		);
		$response = $response->withAddedHeader( 'Warning', $warning_message );
		$cache_object = $this->get_cache_object( $request, $response );

		return $this->storage->save(
			self::get_object_cache_key_from_request( $request ),
			$cache_object
		);
	}

	public function update( RequestInterface $request, ResponseInterface $response ): bool {
		return $this->cache( $request, $response );
	}

	public function delete( RequestInterface $request ): bool {
		return $this->storage->delete( self::get_object_cache_key_from_request( $request ) );
	}

	private function get_cache_object( RequestInterface $request, ResponseInterface $response ): CacheEntry {
		$ttl = self::FALLBACK_CACHE_TTL_IN_SECONDS;
		if ( $request->hasHeader( self::CACHE_TTL_REQUEST_HEADER ) ) {
			$ttl_header_values = $request->getHeader( self::CACHE_TTL_REQUEST_HEADER );
			$ttl = (int) reset( $ttl_header_values );
		}

		if ( ! isset( self::STATUS_ACCEPTED[ $response->getStatusCode() ] ) ) {
			// Cache it for a short time period to prevent error floods.
			$ttl = self::ERROR_CACHE_TTL_IN_SECONDS;
		}

		// Add a random jitter to the TTL to avoid simultaneous cache invalidation.
		// The upper bound of the jitter should be 10% of the TTL or 20 seconds,
		// whichever is smaller.
		$jitter = intval( ceil( min( $ttl * 0.1, 20 ) ) );
		$ttl = intval( $ttl ) + wp_rand( 0, $jitter );

		$response = $response->withoutHeader( 'Etag' )->withoutHeader( 'Last-Modified' );

		$cache_request = self::without_cache_metadata_headers( $request );

		return new CacheEntry( $cache_request, $response, new DateTime( sprintf( '%+d seconds', $ttl ) ) );
	}
}
