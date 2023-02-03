<?php
/**
 * Integration Tests: Homepage metadata
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\StructuredData;

use Parsely\Metadata;
use Parsely\Parsely;

/**
 * Integration Tests for the Homepage's metadata.
 *
 * @see https://www.parse.ly/help/integration/jsonld
 * @covers \Parsely\Metadata::construct_metadata
 */
final class HomePageTest extends NonPostTestCase {
	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		update_option( 'show_on_front', 'posts' );
		delete_option( 'page_for_posts' );
		delete_option( 'page_on_front' );
	}

	/**
	 * Creates a single page, sets it as homepage (blog archive), and tests its
	 * metadata.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @covers \Parsely\Metadata\Paginated_Front_Page_Builder::build_url
	 * @uses \Parsely\Metadata\Front_Page_Builder::build_url
	 * @uses \Parsely\Metadata\Front_Page_Builder::build_headline
	 * @uses \Parsely\Metadata\Front_Page_Builder::get_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_home_page_for_posts(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Insert a single page.
		$page_id = self::factory()->post->create(
			array(
				'post_type'  => 'page',
				'post_title' => 'Page for Posts',
			)
		);
		$page    = get_post( $page_id );

		// Make a request to the root of the site to set the global $wp_query
		// object.
		$this->go_to( '/' );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $page );

		// Check the required properties exist.
		$this->assert_data_has_required_properties( $structured_data );

		// The headline should be the name of the site, not the post_title of
		// the page.
		self::assertEquals( 'Test Blog', $structured_data['headline'] );
		self::assertEquals( home_url(), $structured_data['url'] );
	}

	/**
	 * Creates 2 posts, sets posts per page to 1, navigates to page 2 and tests
	 * its metadata.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @covers \Parsely\Metadata\Paginated_Front_Page_Builder::build_url
	 * @uses \Parsely\Metadata\Front_Page_Builder::build_headline
	 * @uses \Parsely\Metadata\Front_Page_Builder::build_url
	 * @uses \Parsely\Metadata\Front_Page_Builder::get_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_home_page_for_posts_paged(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Insert 2 posts.
		$page_id = self::factory()->post->create();
		self::factory()->post->create();
		$page = get_post( $page_id );

		// Set permalinks, as Parsely currently strips ?page_id=... from the URL
		// property. See https://github.com/Parsely/wp-parsely/issues/151.
		global $wp_rewrite;
		$wp_rewrite->set_permalink_structure( '/%postname%/' );

		// Set the homepage to show 1 post per page.
		update_option( 'posts_per_page', 1 );

		// Go to Page 2 of posts.
		$this->go_to( home_url( '/page/2' ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $page );

		// Check the required properties exist.
		$this->assert_data_has_required_properties( $structured_data );

		// The headline should be the name of the site, not the post_title of
		// the latest post.
		self::assertEquals( 'Test Blog', $structured_data['headline'] );
		// The URL should be the current page, not the home url.
		self::assertEquals( home_url( '/page/2' ), $structured_data['url'] );
	}

	/**
	 * Creates a single page, sets it as homepage (page on front), and tests its
	 * metadata.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Front_Page_Builder::build_headline
	 * @uses \Parsely\Metadata\Front_Page_Builder::build_url
	 * @uses \Parsely\Metadata\Front_Page_Builder::get_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_home_page_on_front(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Insert a single page.
		$page_id = self::factory()->post->create(
			array(
				'post_type'  => 'page',
				'post_title' => 'Home',
			)
		);
		$page    = get_post( $page_id );

		// Set that page as the homepage Page.
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $page_id );

		// Make a request to the root of the site to set the global $wp_query
		// object.
		$this->go_to( '/' );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $page );

		// Check the required properties exist.
		$this->assert_data_has_required_properties( $structured_data );

		// The headline should be the name of the site, not the post_title of
		// the page.
		self::assertEquals( 'Test Blog', $structured_data['headline'] );
		self::assertEquals( home_url(), $structured_data['url'] );
		// The metadata '@type' for the context should be 'WebPage' for the
		// homepage.
		self::assertSame( 'WebPage', $structured_data['@type'] );
	}

	/**
	 * Verifies the case when the show_on_front setting is set to "Page", but no
	 * page has been selected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Front_Page_Builder::build_headline
	 * @uses \Parsely\Metadata\Front_Page_Builder::build_url
	 * @uses \Parsely\Metadata\Front_Page_Builder::get_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_home_for_misconfigured_settings(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Insert a single page.
		$page_id = self::factory()->post->create(
			array(
				'post_type'  => 'page',
				'post_title' => 'Home',
			)
		);
		$page    = get_post( $page_id );

		// Set that page as the homepage Page.
		update_option( 'show_on_front', 'page' );
		delete_option( 'page_on_front' );

		// Make a request to the root of the site to set the global $wp_query
		// object.
		$this->go_to( '/' );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $page );

		// Check the required properties exist.
		$this->assert_data_has_required_properties( $structured_data );

		// The headline should be the name of the site, not the post_title of
		// the page.
		self::assertEquals( 'Test Blog', $structured_data['headline'] );
		self::assertEquals( home_url(), $structured_data['url'] );
	}
}
