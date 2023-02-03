<?php
/**
 * Integration Tests: Parse.ly Dashboard URL generation
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration;

use Parsely\Parsely;
use Parsely\Dashboard_Link;

/**
 * Integration Tests for Parse.ly Dashboard URL generation.
 */
final class DashboardLinkTest extends TestCase {
	/**
	 * Internal variable.
	 *
	 * @var Parsely $parsely Holds the Parsely object.
	 */
	private static $parsely;

	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		self::$parsely = new Parsely();
	}

	/**
	 * Verifies that generating a Parse.ly Dashboard URL works as expected.
	 *
	 * @covers \Parsely\Dashboard_Link::generate_url
	 */
	public function test_generate_parsely_post_url(): void {
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );
		$apikey  = 'demo-api-key';

		$expected = PARSELY::DASHBOARD_BASE_URL . '/demo-api-key/find?url=http%3A%2F%2Fexample.org%2F%3Fp%3D' . $post_id . '&utm_campaign=wp-admin-posts-list&utm_source=wp-admin&utm_medium=wp-parsely';
		$actual   = Dashboard_Link::generate_url( $post, $apikey, 'wp-admin-posts-list', 'wp-admin' );

		self::assertSame( $expected, $actual );
	}

	/**
	 * Verifies that attempting to generate a Parse.ly Dashboard URL for a post
	 * without a permalink results in an empty string.
	 *
	 * @since 3.1.2
	 *
	 * @covers \Parsely\Dashboard_Link::generate_url
	 */
	public function test_generate_invalid_post_url(): void {
		add_filter( 'post_link', '__return_false' );

		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );
		$apikey  = 'demo-api-key';

		$expected = '';
		$actual   = Dashboard_Link::generate_url( $post, $apikey, 'wp-admin-posts-list', 'wp-admin' );

		self::assertSame( $expected, $actual );
	}

	/**
	 * Verifies that determining whether a link can be shown works as expected.
	 *
	 * @since 2.6.0
	 * @since 3.1.0 Moved to `DashboardLinkTest.php`
	 *
	 * @covers \Parsely\Dashboard_Link::can_show_link
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group ui
	 */
	public function test_can_correctly_determine_if_Parsely_link_can_be_shown(): void {
		$published_post = self::factory()->post->create_and_get();
		self::set_options( array( 'apikey' => 'somekey' ) );

		self::assertTrue( Dashboard_Link::can_show_link( $published_post, self::$parsely ) );
	}

	/**
	 * Verifies that links for untrackable posts aren't being shown.
	 *
	 * Only published posts are tracked by default.
	 *
	 * @since 2.6.0
	 * @since 3.1.0 Moved to `DashboardLinkTest.php`
	 *
	 * @covers \Parsely\Dashboard_Link::can_show_link
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group ui
	 */
	public function test_can_correctly_determine_if_Parsely_link_can_be_shown_when_post_has_not_trackable_status(): void {
		$draft_post = self::factory()->post->create_and_get( array( 'post_status' => 'draft' ) );
		self::set_options( array( 'apikey' => 'somekey' ) );

		self::assertFalse( Dashboard_Link::can_show_link( $draft_post, self::$parsely ) );
	}

	/**
	 * Verifies that links for unviewable posts aren't being shown.
	 *
	 * @since 2.6.0
	 * @since 3.1.0 Moved to `DashboardLinkTest.php`
	 *
	 * @covers \Parsely\Dashboard_Link::can_show_link
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group ui
	 */
	public function test_can_correctly_determine_if_Parsely_link_can_be_shown_when_post_is_viewable(): void {
		$non_publicly_queryable_post = self::factory()->post->create_and_get( array( 'post_type' => 'parsely_tests_pt' ) );
		self::set_options( array( 'apikey' => 'somekey' ) );

		self::assertFalse( Dashboard_Link::can_show_link( $non_publicly_queryable_post, self::$parsely ) );
	}

	/**
	 * Verifies that links for posts aren't being shown when the Site ID is not
	 * set.
	 *
	 * @since 2.6.0
	 * @since 3.1.0 Moved to `DashboardLinkTest.php`
	 *
	 * @covers \Parsely\Dashboard_Link::can_show_link
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group ui
	 */
	public function test_can_correctly_determine_if_Parsely_link_can_be_shown_when_api_key_is_set_or_missing(): void {
		$published_post = self::factory()->post->create_and_get();

		// Site ID is not set.
		self::set_options( array( 'apikey' => '' ) );
		self::assertFalse( Dashboard_Link::can_show_link( $published_post, self::$parsely ) );

		// Site ID is set.
		self::set_options( array( 'apikey' => 'somekey' ) );
		self::assertTrue( Dashboard_Link::can_show_link( $published_post, self::$parsely ) );
	}
}
