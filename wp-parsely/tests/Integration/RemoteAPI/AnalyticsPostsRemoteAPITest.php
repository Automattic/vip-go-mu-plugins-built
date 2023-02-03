<?php
/**
 * Integration Tests: Parsely `/analytics/posts` Remote API
 *
 * @package Parsely\Tests
 * @since   3.5.0
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration;

use Parsely\Parsely;
use Parsely\RemoteAPI\Analytics_Posts_Proxy;

/**
 * Integration Tests for the Parsely `/analytics/posts` Remote API.
 */
final class AnalyticsPostsRemoteAPITest extends RemoteAPITest {

	/**
	 * Initializes all required values for the test.
	 */
	public static function initialize(): void {
		self::$proxy = new Analytics_Posts_Proxy( new Parsely() );
	}

	/**
	 * Provides data for test_api_url().
	 *
	 * @return iterable
	 */
	public function data_api_url(): iterable {
		yield 'Basic (Expected data)' => array(
			array(
				'apikey' => 'my-key',
				'limit'  => 5,
			),
			'https://api.parsely.com/v2/analytics/posts?apikey=my-key&limit=5',
		);
	}
}
