<?php declare(strict_types = 1);

namespace RemoteDataBlocks\HttpClient;

use DateTime;
use Kevinrob\GuzzleCache\CacheEntry;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Kevinrob\GuzzleCache\KeyValueHttpHeader;
use Kevinrob\GuzzleCache\Storage\CacheStorageInterface;
use Kevinrob\GuzzleCache\Storage\WordPressObjectCacheStorage;
use Kevinrob\GuzzleCache\Strategy\GreedyCacheStrategy;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class RdbCacheStrategy extends GreedyCacheStrategy {
	public const CACHE_AGE_RESPONSE_HEADER = 'Age';
	public const CACHE_STATUS_RESPONSE_HEADER = CacheMiddleware::HEADER_CACHE_INFO;
	public const CACHE_TTL_REQUEST_HEADER = GreedyCacheStrategy::HEADER_TTL;
	public const WP_OBJECT_CACHE_GROUP = 'remote-data-blocks';

	private const CACHE_INVALIDATING_REQUEST_HEADERS = [ 'Authorization', 'Cache-Control' ];
	private const ERROR_CACHE_TTL_IN_SECONDS = 30; // 30 seconds for error responses
	private const FALLBACK_CACHE_TTL_IN_SECONDS = 300; // 5 minutes for success responses

	public function __construct( ?CacheStorageInterface $storage = null ) {
		// Filter this if customization is needed.
		$vary_headers = new KeyValueHttpHeader( self::CACHE_INVALIDATING_REQUEST_HEADERS );

		parent::__construct(
			$storage ?? new WordPressObjectCacheStorage( self::WP_OBJECT_CACHE_GROUP ),
			self::FALLBACK_CACHE_TTL_IN_SECONDS,
			$vary_headers
		);
	}

	public static function get_object_cache_key_from_request( RequestInterface $request ): string {
		$request_body = (string) $request->getBody();
		$request_headers = $request->getHeaders();
		$request_method = $request->getMethod();
		$request_uri = (string) $request->getUri();

		$cache_headers = [];
		foreach ( self::CACHE_INVALIDATING_REQUEST_HEADERS as $header ) {
			if ( isset( $request_headers[ $header ] ) ) {
				$cache_headers[ $header ] = $request_headers[ $header ];
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

	/** @psalm-suppress ParamNameMismatch reason: parent is camelCase, but we want snake_case */
	protected function getCacheKey( RequestInterface $request, ?KeyValueHttpHeader $_vary_headers = null ): string {
		return self::get_object_cache_key_from_request( $request );
	}

	protected function getCacheObject( RequestInterface $request, ResponseInterface $response ): ?CacheEntry {
		// phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$ttl = $this->defaultTtl;
		if ( $request->hasHeader( static::HEADER_TTL ) ) {
			$ttl_header_values = $request->getHeader( static::HEADER_TTL );
			$ttl = (int) reset( $ttl_header_values );
		}

		if ( ! array_key_exists( $response->getStatusCode(), $this->statusAccepted ) ) {
			// Cache it for a short time period to prevent error floods.
			$ttl = self::ERROR_CACHE_TTL_IN_SECONDS;
		}

		// NOTE: We skip the vary headers '*' check from the parent method
		// since our defined vary headers cannot accept a '*' value.

		$response = $response->withoutHeader( 'Etag' )->withoutHeader( 'Last-Modified' );

		return new CacheEntry( $request->withoutHeader( static::HEADER_TTL ), $response, new DateTime( sprintf( '%+d seconds', $ttl ) ) );
	}
}
