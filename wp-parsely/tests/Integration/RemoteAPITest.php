<?php
/**
 * Integration Tests: Parsely Remote API
 *
 * @package Parsely\Tests
 * @since   3.5.0
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration;

use Parsely\RemoteAPI\Cache;
use Parsely\RemoteAPI\Cached_Proxy;

/**
 * Integration Tests for the Parse.ly Remote API.
 */
abstract class RemoteAPITest extends TestCase {

	/**
	 * Internal variable.
	 *
	 * @var string $parsely Holds an instance of the class being tested.
	 */
	protected static $proxy;

	/**
	 * Initializes all required values for the test.
	 */
	abstract public static function initialize(): void;

	/**
	 * Provides data for test_api_url().
	 *
	 * @return iterable
	 */
	abstract public function data_api_url(): iterable;

	/**
	 * Runs once before all tests.
	 */
	public static function set_up_before_class(): void {
		static::initialize();
	}

	/**
	 * Verifies the basic generation of the API URL.
	 *
	 * @dataProvider data_api_url
	 * @covers \Parsely\RemoteAPI\Related_Proxy::get_api_url
	 * @covers \Parsely\RemoteAPI\Analytics_Posts_Proxy::get_api_url
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::api_secret_is_set
	 * @uses \Parsely\Parsely::get_api_key
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 *
	 * @param array  $query Test query arguments.
	 * @param string $url Expected generated URL.
	 */
	public function test_api_url( array $query, string $url ): void {
		self::set_options( array( 'apikey' => 'my-key' ) );
		self::assertEquals( $url, self::$proxy->get_api_url( $query ) );
	}

	/**
	 * Verifies that the cache is used instead of the proxy when there's a cache
	 * hit.
	 *
	 * @covers \Parsely\RemoteAPI\Cached_Proxy::get_items
	 * @covers \Parsely\RemoteAPI\Cached_Proxy::__construct
	 */
	public function test_cached_proxy_returns_cached_value(): void {
		$proxy_mock = $this->getMockBuilder( get_class( self::$proxy ) )
			->disableOriginalConstructor()
			->getMock();

		// If this method is called, that means our cache did not hit as
		// expected.
		$proxy_mock->expects( self::never() )->method( 'get_items' );

		$cache_key = 'parsely_api_' . wp_hash( wp_json_encode( $proxy_mock ) ) . '_' . wp_hash( wp_json_encode( array() ) );

		$object_cache = $this->createMock( Cache::class );
		$object_cache->method( 'get' )
			->willReturn( (object) array( 'cache_hit' => true ) );

		$object_cache->expects( self::once() )
			->method( 'get' )
			->with(
				self::equalTo( $cache_key ),
				self::equalTo( 'wp-parsely' ),
				self::equalTo( false ),
				self::isNull()
			);

		$cached_proxy = $this->getMockBuilder( Cached_Proxy::class )
			->setConstructorArgs( array( $proxy_mock, $object_cache ) )
			->setMethodsExcept( array( 'get_items' ) )
			->getMock();

		self::assertEquals( (object) array( 'cache_hit' => true ), $cached_proxy->get_items( array() ) );
	}

	/**
	 * Verifies that when the cache misses, the proxy is used instead and the
	 * resultant value is cached.
	 *
	 * @covers \Parsely\RemoteAPI\Cached_Proxy::get_items
	 * @covers \Parsely\RemoteAPI\Cached_Proxy::__construct
	 */
	public function test_caching_decorator_returns_uncached_value(): void {
		$proxy_mock = $this->getMockBuilder( get_class( self::$proxy ) )
			->disableOriginalConstructor()
			->getMock();

		$proxy_mock->method( 'get_items' )
			->willReturn( (object) array( 'cache_hit' => false ) );

		// If this method is _NOT_ called, that means our cache did not miss as
		// expected.
		$proxy_mock->expects( self::once() )->method( 'get_items' );

		$cache_key = 'parsely_api_' . wp_hash( wp_json_encode( $proxy_mock ) ) . '_' . wp_hash( wp_json_encode( array() ) );

		$object_cache = $this->createMock( Cache::class );
		$object_cache->method( 'get' )
			->willReturn( false );

		$object_cache->expects( self::once() )
			->method( 'get' )
			->with(
				self::equalTo( $cache_key ),
				self::equalTo( 'wp-parsely' ),
				self::equalTo( false ),
				self::isNull()
			);

		$cached_proxy = $this->getMockBuilder( Cached_Proxy::class )
			->setConstructorArgs( array( $proxy_mock, $object_cache ) )
			->setMethodsExcept( array( 'get_items' ) )
			->getMock();

		self::assertEquals( (object) array( 'cache_hit' => false ), $cached_proxy->get_items( array() ) );
	}
}
