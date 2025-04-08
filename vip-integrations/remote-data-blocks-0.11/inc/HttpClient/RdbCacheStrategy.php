<?php declare(strict_types = 1);

namespace RemoteDataBlocks\HttpClient;

use Kevinrob\GuzzleCache\CacheEntry;
use Kevinrob\GuzzleCache\KeyValueHttpHeader;
use Kevinrob\GuzzleCache\Storage\CacheStorageInterface;
use Kevinrob\GuzzleCache\Storage\WordPressObjectCacheStorage;
use Kevinrob\GuzzleCache\Strategy\GreedyCacheStrategy;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use RemoteDataBlocks\Logging\Logger;
use RemoteDataBlocks\Logging\LoggerManager;

class RdbCacheStrategy extends GreedyCacheStrategy {
	private const CACHE_INVALIDATING_REQUEST_HEADERS = [ 'Authorization', 'Cache-Control' ];
	private const FALLBACK_CACHE_TTL_IN_SECONDS = 60;
	private const WP_OBJECT_CACHE_GROUP = 'remote-data-blocks';

	private Logger $logger;

	public function __construct( ?int $default_ttl = null, ?CacheStorageInterface $storage = null ) {
		// Filter this if customization is needed.
		$vary_headers = new KeyValueHttpHeader( self::CACHE_INVALIDATING_REQUEST_HEADERS );

		parent::__construct(
			$storage ?? new WordPressObjectCacheStorage( self::WP_OBJECT_CACHE_GROUP ),
			$default_ttl ?? self::FALLBACK_CACHE_TTL_IN_SECONDS,
			$vary_headers
		);

		$this->logger = LoggerManager::instance( __CLASS__ );
	}

	private function log( RequestInterface $request, string $message, ?CacheEntry $cache_entry = null ): void {
		$uri = $request->getUri();
		$uri_string = $uri->getScheme() . '://' . $uri->getHost() . $uri->getPath();
		$method = $request->getMethod();
		$has_body = (bool) $request->getBody();

		$context = [
			'method' => $method,
			'uri' => $uri_string,
			'has_body' => $has_body,
			'key' => $this->getCacheKey( $request ),
		];

		if ( $cache_entry instanceof CacheEntry ) {
			$context['age'] = $cache_entry->getAge();
			$context['ttl'] = $cache_entry->getTtl();
		}

		ksort( $context );

		$this->logger->debug( $message, $context );
	}

	/** @psalm-suppress ParamNameMismatch reason: parent is camelCase, but we want snake_case */
	protected function getCacheKey( RequestInterface $request, ?KeyValueHttpHeader $vary_headers = null ): string {
		$cache_key = parent::getCacheKey( $request, $vary_headers );

		if ( $request->getMethod() === 'POST' ) {
			$body = $request->getBody();
			if ( empty( $body ) ) {
				return $cache_key;
			}
			$cache_key .= '-' . md5( (string) $body );
		}

		return $cache_key;
	}

	public function fetch( RequestInterface $request ): CacheEntry|null {
		$result = parent::fetch( $request );

		if ( null === $result ) {
			$this->log( $request, 'cache:read:miss' );
			return null;
		}

		$this->log( $request, 'cache:read:hit', $result );
		return $result;
	}

	public function cache( RequestInterface $request, ResponseInterface $response ): bool {
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$cache_ttl = $this->defaultTtl;

		// Negative TTL indicates disabled caching.
		if ( $cache_ttl < 0 ) {
			$this->log( $request, 'cache:write:disabled' );
			return false;
		}

		$result = parent::cache( $request, $response );
		if ( false === $result ) {
			$this->log( $request, 'cache:write:uncacheable' );
			return false;
		}

		$this->log( $request, 'cache:write:success' );
		return $result;
	}
}
