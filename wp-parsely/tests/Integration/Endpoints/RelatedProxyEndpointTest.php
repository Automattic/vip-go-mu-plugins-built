<?php
/**
 * Integration Tests: Related API Proxy Endpoint
 *
 * @package Parsely\Tests
 *
 * phpcs:disable Generic.CodeAnalysis.UselessOverridingMethod.Found
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration;

use Parsely\Endpoints\Base_API_Proxy;
use Parsely\Endpoints\Related_API_Proxy;
use Parsely\Parsely;
use Parsely\RemoteAPI\Related_Proxy;
use WP_REST_Request;

/**
 * Integration Tests for the Related API Proxy Endpoint.
 */
final class RelatedProxyEndpointTest extends ProxyEndpointTest {

	/**
	 * Initializes all required values for the test.
	 */
	public static function initialize(): void {
		self::$route      = '/wp-parsely/v1/related';
		self::$filter_key = 'related';
	}

	/**
	 * Returns the endpoint to be used in tests.
	 *
	 * @return Base_API_Proxy
	 */
	public function get_endpoint(): Base_API_Proxy {
		return new Related_API_Proxy(
			new Parsely(),
			new Related_Proxy( new Parsely() )
		);
	}

	/**
	 * Verifies that the route is registered.
	 *
	 * @covers \Parsely\Endpoints\Related_API_Proxy::run
	 * @uses \Parsely\Endpoints\Base_API_Proxy::register_endpoint
	 * @uses \Parsely\Endpoints\Related_API_Proxy::__construct
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 */
	public function test_register_routes_by_default(): void {
		parent::test_register_routes_by_default();
	}

	/**
	 * Verifies that the route is not registered when the
	 * wp_parsely_enable_related_api_proxy filter is set to false.
	 *
	 * @covers \Parsely\Endpoints\Related_API_Proxy::run
	 * @uses \Parsely\Endpoints\Base_API_Proxy::register_endpoint
	 * @uses \Parsely\Endpoints\Related_API_Proxy::__construct
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 */
	public function test_do_not_register_route_when_proxy_is_disabled(): void {
		parent::test_do_not_register_route_when_proxy_is_disabled();
	}

	/**
	 * Verifies that calling `GET /wp-parsely/v1/related` returns an error and
	 * does not perform a remote call when the apikey is not populated
	 * in site options.
	 *
	 * @covers \Parsely\Endpoints\Related_API_Proxy::get_items
	 * @uses \Parsely\Endpoints\Base_API_Proxy::get_data
	 * @uses \Parsely\Endpoints\Base_API_Proxy::register_endpoint
	 * @uses \Parsely\Endpoints\Related_API_Proxy::__construct
	 * @uses \Parsely\Endpoints\Related_API_Proxy::permission_callback
	 * @uses \Parsely\Endpoints\Related_API_Proxy::run
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 */
	public function test_get_items_fails_without_apikey_set() {
		parent::test_get_items_fails_without_apikey_set();
	}

	/**
	 * Verifies that calls to `GET /wp-parsely/v1/related` return
	 * results in the expected format.
	 *
	 * @covers \Parsely\Endpoints\Related_API_Proxy::get_items
	 * @uses \Parsely\Endpoints\Base_API_Proxy::get_data
	 * @uses \Parsely\Endpoints\Base_API_Proxy::register_endpoint
	 * @uses \Parsely\Endpoints\Related_API_Proxy::__construct
	 * @uses \Parsely\Endpoints\Related_API_Proxy::generate_data
	 * @uses \Parsely\Endpoints\Related_API_Proxy::permission_callback
	 * @uses \Parsely\Endpoints\Related_API_Proxy::run
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::api_secret_is_set
	 * @uses \Parsely\Parsely::get_api_key
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 * @uses \Parsely\RemoteAPI\Base_Proxy::get_api_url
	 * @uses \Parsely\RemoteAPI\Base_Proxy::get_items
	 */
	public function test_get_items() {
		TestCase::set_options( array( 'apikey' => 'example.com' ) );

		$dispatched = 0;

		add_filter(
			'pre_http_request',
			function () use ( &$dispatched ) {
				$dispatched++;
				return array(
					'body' => '{"data":[{"image_url":"https:\/\/example.com\/img.png","thumb_url_medium":"https:\/\/example.com\/thumb.png","title":"something","url":"https:\/\/example.com"},{"image_url":"https:\/\/example.com\/img2.png","thumb_url_medium":"https:\/\/example.com\/thumb2.png","title":"something2","url":"https:\/\/example.com\/2"}]}',
				);
			}
		);

		$response = rest_get_server()->dispatch( new WP_REST_Request( 'GET', '/wp-parsely/v1/related' ) );

		self::assertSame( 1, $dispatched );
		self::assertSame( 200, $response->get_status() );
		self::assertEquals(
			(object) array(
				'data' => array(
					(object) array(
						'image_url'        => 'https://example.com/img.png',
						'thumb_url_medium' => 'https://example.com/thumb.png',
						'title'            => 'something',
						'url'              => 'https://example.com',
					),
					(object) array(
						'image_url'        => 'https://example.com/img2.png',
						'thumb_url_medium' => 'https://example.com/thumb2.png',
						'title'            => 'something2',
						'url'              => 'https://example.com/2',
					),
				),
			),
			$response->get_data()
		);
	}
}
