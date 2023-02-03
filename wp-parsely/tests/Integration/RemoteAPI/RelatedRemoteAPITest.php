<?php
/**
 * Integration Tests: Parsely `/related` Remote API
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration;

use Parsely\Parsely;
use Parsely\RemoteAPI\Related_Proxy;

/**
 * Integration Tests for the Parsely `/related` Remote API.
 */
final class RelatedRemoteAPITest extends RemoteAPITest {

	/**
	 * Initializes all required values for the test.
	 */
	public static function initialize(): void {
		self::$proxy = new Related_Proxy( new Parsely() );
	}

	/**
	 * Provides data for test_api_url().
	 *
	 * @return iterable
	 */
	public function data_api_url(): iterable {
		yield 'Basic (Expected data)' => array(
			array(
				'apikey'         => 'my-key',
				'pub_date_start' => '7d',
				'sort'           => 'score',
				'boost'          => 'views',
				'limit'          => 5,
			),
			'https://api.parsely.com/v2/related?apikey=my-key&boost=views&limit=5&pub_date_start=7d&sort=score',
		);

		yield 'published_within value of 0' => array(
			array(
				'apikey' => 'my-key',
				'sort'   => 'score',
				'boost'  => 'views',
				'limit'  => 5,
			),
			'https://api.parsely.com/v2/related?apikey=my-key&boost=views&limit=5&sort=score',
		);

		yield 'Sort on publish date (no boost param)' => array(
			array(
				'apikey' => 'my-key',
				'sort'   => 'pub_date',
				'limit'  => 5,
			),
			'https://api.parsely.com/v2/related?apikey=my-key&limit=5&sort=pub_date',
		);

		yield 'Rank by relevance only (no boost param)' => array(
			array(
				'apikey' => 'my-key',
				'sort'   => 'score',
				'limit'  => 5,
			),
			'https://api.parsely.com/v2/related?apikey=my-key&limit=5&sort=score',
		);
	}
}
