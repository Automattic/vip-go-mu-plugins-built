<?php
/**
 * Integration Tests: Analytics Posts Proxy Endpoint
 *
 * @package Parsely\Tests
 * @since   3.5.0
 *
 * phpcs:disable Generic.CodeAnalysis.UselessOverridingMethod.Found
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration;

use Parsely\Endpoints\Analytics_Posts_API_Proxy;
use Parsely\Endpoints\Base_API_Proxy;
use Parsely\Parsely;
use Parsely\RemoteAPI\Analytics_Posts_Proxy;
use WP_REST_Request;

/**
 * Integration Tests for the Analytics Posts API Proxy Endpoint.
 */
final class AnalyticsPostsProxyEndpointTest extends ProxyEndpointTest {

	/**
	 * Initializes all required values for the test.
	 */
	public static function initialize(): void {
		self::$route      = '/wp-parsely/v1/stats/posts';
		self::$filter_key = 'stats_posts';
	}

	/**
	 * Returns the endpoint to be used in tests.
	 *
	 * @return Base_API_Proxy
	 */
	public function get_endpoint(): Base_API_Proxy {
		return new Analytics_Posts_API_Proxy(
			new Parsely(),
			new Analytics_Posts_Proxy( new Parsely() )
		);
	}

	/**
	 * Verifies that the route is registered.
	 *
	 * @covers \Parsely\Endpoints\Analytics_Posts_API_Proxy::run
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::__construct
	 * @uses \Parsely\Endpoints\Base_API_Proxy::register_endpoint
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 */
	public function test_register_routes_by_default(): void {
		parent::test_register_routes_by_default();
	}

	/**
	 * Verifies that the route is not registered when the
	 * wp_parsely_enable_analytics_posts_api_proxy filter is set to false.
	 *
	 * @covers \Parsely\Endpoints\Analytics_Posts_API_Proxy::run
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::__construct
	 * @uses \Parsely\Endpoints\Base_API_Proxy::register_endpoint
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 */
	public function test_do_not_register_route_when_proxy_is_disabled(): void {
		parent::test_do_not_register_route_when_proxy_is_disabled();
	}

	/**
	 * Verifies that calling `GET /wp-parsely/v1/stats/posts` returns an
	 * error and does not perform a remote call when the apikey is not populated
	 * in site options.
	 *
	 * @covers \Parsely\Endpoints\Analytics_Posts_API_Proxy::get_items
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::__construct
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::permission_callback
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::run
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 * @uses \Parsely\Endpoints\Base_API_Proxy::get_data
	 * @uses \Parsely\Endpoints\Base_API_Proxy::register_endpoint
	 */
	public function test_get_items_fails_without_apikey_set() {
		parent::test_get_items_fails_without_apikey_set();
	}

	/**
	 * Verifies that calls to `GET /wp-parsely/v1/stats/posts` return
	 * results in the expected format.
	 *
	 * @covers \Parsely\Endpoints\Analytics_Posts_API_Proxy::get_items
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::__construct
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::generate_data
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::permission_callback
	 * @uses \Parsely\Endpoints\Analytics_Posts_API_Proxy::run
	 * @uses \Parsely\Endpoints\Base_API_Proxy::get_data
	 * @uses \Parsely\Endpoints\Base_API_Proxy::register_endpoint
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::api_secret_is_set
	 * @uses \Parsely\Parsely::get_api_key
	 * @uses \Parsely\Parsely::get_api_secret
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\RemoteAPI\Base_Proxy::__construct
	 * @uses \Parsely\RemoteAPI\Base_Proxy::get_api_url
	 * @uses \Parsely\RemoteAPI\Base_Proxy::get_items
	 */
	public function test_get_items() {
		TestCase::set_options( array( 'apikey' => 'example.com' ) );
		TestCase::set_options( array( 'api_secret' => 'test' ) );

		$dispatched  = 0;
		$date_format = get_option( 'date_format' );

		add_filter(
			'pre_http_request',
			function () use ( &$dispatched ) {
				$dispatched++;
				return array(
					'body' => '{"data":[{"_hits": 142, "author": "Aakash Shah", "authors": ["Aakash Shah"], "full_content_word_count": 3624, "image_url": "https://blog.parse.ly/wp-content/uploads/2021/06/Web-Analytics-Tool.png?w=150&h=150&crop=1", "link": "https://blog.parse.ly/web-analytics-software-tools/?itm_source=parsely-api", "metadata": "", "metrics": {"views": 142}, "pub_date": "2020-04-06T13:30:58", "section": "Analytics That Matter", "tags": ["animalz", "parsely_smart:entity:Bounce rate", "parsely_smart:entity:Customer analytics", "parsely_smart:entity:Digital marketing", "parsely_smart:entity:Google Analytics", "parsely_smart:entity:Marketing strategy", "parsely_smart:entity:Multivariate testing in marketing", "parsely_smart:entity:Open source", "parsely_smart:entity:Pageview", "parsely_smart:entity:Search engine optimization", "parsely_smart:entity:Social media", "parsely_smart:entity:Social media analytics", "parsely_smart:entity:Usability", "parsely_smart:entity:User experience design", "parsely_smart:entity:Web analytics", "parsely_smart:entity:Web traffic", "parsely_smart:entity:Website", "parsely_smart:entity:World Wide Web", "parsely_smart:iab:Business", "parsely_smart:iab:Graphics", "parsely_smart:iab:Software", "parsely_smart:iab:Technology"], "thumb_url_medium": "https://images.parsely.com/XCmTXuOf8yVbUYTxj2abQ4RSDkM=/85x85/smart/https%3A//blog.parse.ly/wp-content/uploads/2021/06/Web-Analytics-Tool.png%3Fw%3D150%26h%3D150%26crop%3D1", "title": "9 Types of Web Analytics Tools \u2014 And How to Know Which Ones You Really Need", "url": "https://blog.parse.ly/web-analytics-software-tools/?itm_source=parsely-api"}, {"_hits": 40, "author": "Stephanie Schwartz and Andrew Butler", "authors": ["Stephanie Schwartz and Andrew Butler"], "full_content_word_count": 1785, "image_url": "https://blog.parse.ly/wp-content/uploads/2021/05/pexels-brett-jordan-998501-1024x768-2.jpeg?w=150&h=150&crop=1", "link": "https://blog.parse.ly/5-tagging-best-practices-content-strategy/?itm_source=parsely-api", "metadata": "", "metrics": {"views": 40}, "pub_date": "2021-04-30T20:30:24", "section": "Analytics That Matter", "tags": ["parsely_smart:entity:Analytics", "parsely_smart:entity:Best practice", "parsely_smart:entity:Hashtag", "parsely_smart:entity:Metadata", "parsely_smart:entity:Search engine", "parsely_smart:entity:Search engine optimization", "parsely_smart:entity:Tag (metadata)", "parsely_smart:iab:Business", "parsely_smart:iab:Science", "parsely_smart:iab:Software", "parsely_smart:iab:Technology"], "thumb_url_medium": "https://images.parsely.com/ap3YSufqxnLpz6zzQshoks3snXI=/85x85/smart/https%3A//blog.parse.ly/wp-content/uploads/2021/05/pexels-brett-jordan-998501-1024x768-2.jpeg%3Fw%3D150%26h%3D150%26crop%3D1", "title": "5 Tagging Best Practices For Getting the Most Out of Your Content Strategy", "url": "https://blog.parse.ly/5-tagging-best-practices-content-strategy/?itm_source=parsely-api"}]}',
				);
			}
		);

		$response = rest_get_server()->dispatch( new WP_REST_Request( 'GET', '/wp-parsely/v1/stats/posts' ) );

		self::assertSame( 1, $dispatched );
		self::assertSame( 200, $response->get_status() );
		self::assertEquals(
			(object) array(
				'data' => array(
					(object) array(
						'author'   => 'Aakash Shah',
						'date'     => wp_date( $date_format, strtotime( '2020-04-06T13:30:58' ) ),
						'id'       => 'https://blog.parse.ly/web-analytics-software-tools/?itm_source=parsely-api',
						'statsUrl' => PARSELY::DASHBOARD_BASE_URL . '/blog.parsely.com/find?url=https%3A%2F%2Fblog.parse.ly%2Fweb-analytics-software-tools%2F%3Fitm_source%3Dparsely-api',
						'title'    => '9 Types of Web Analytics Tools — And How to Know Which Ones You Really Need',
						'url'      => 'https://blog.parse.ly/web-analytics-software-tools/?itm_source=parsely-api',
						'views'    => 142,
					),
					(object) array(
						'author'   => 'Stephanie Schwartz and Andrew Butler',
						'date'     => wp_date( $date_format, strtotime( '2021-04-30T20:30:24' ) ),
						'id'       => 'https://blog.parse.ly/5-tagging-best-practices-content-strategy/?itm_source=parsely-api',
						'statsUrl' => PARSELY::DASHBOARD_BASE_URL . '/blog.parsely.com/find?url=https%3A%2F%2Fblog.parse.ly%2F5-tagging-best-practices-content-strategy%2F%3Fitm_source%3Dparsely-api',
						'title'    => '5 Tagging Best Practices For Getting the Most Out of Your Content Strategy',
						'url'      => 'https://blog.parse.ly/5-tagging-best-practices-content-strategy/?itm_source=parsely-api',
						'views'    => 40,
					),
				),
			),
			$response->get_data()
		);
	}
}
