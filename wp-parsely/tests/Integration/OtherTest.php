<?php
/**
 * Integration Tests: Other functions
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration;

use Parsely\Metadata;
use Parsely\Parsely;
use WP_Scripts;

/**
 * Integration Tests for other functions.
 */
final class OtherTest extends TestCase {
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
		global $wp_scripts;

		parent::set_up();

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$wp_scripts    = new WP_Scripts();
		self::$parsely = new Parsely();

		TestCase::set_options();
	}

	/**
	 * Verifies that the plugin's version is semver-compliant.
	 *
	 * @see https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
	 * @see https://regex101.com/r/Ly7O1x/3/
	 *
	 * @coversNothing
	 */
	public function test_version_constant_is_a_semantic_version_string(): void {
		self::assertMatchesRegularExpression(
			'/^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)(?:-(?P<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?P<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/',
			Parsely::VERSION
		);
	}

	/**
	 * Verifies that the wp_parsely_metadata filter works as expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 * @group filters
	 */
	public function test_parsely_page_filter(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Create a single post.
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		// Apply page filtering.
		$headline = 'Completely New And Original Filtered Headline';
		add_filter(
			'wp_parsely_metadata',
			function( $args ) use ( $headline ) {
				$args['headline'] = $headline;

				return $args;
			},
			10,
			3
		);

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The structured data should contain the headline from the filter.
		self::assertSame( strpos( $structured_data['headline'], $headline ), 0 );
	}

	/**
	 * Verifies that the wp_parsely_post_type filter works as expected.
	 *
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_name
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 */
	public function test_filter_wp_parsely_post_type(): void {
		$post_id  = $this->go_to_new_post();
		$post_obj = get_post( $post_id );

		// Try to change the post type to a supported value - BlogPosting.
		add_filter(
			'wp_parsely_post_type',
			function() {
				return 'BlogPosting';
			}
		);

		$metadata        = new Metadata( self::$parsely );
		$structured_data = $metadata->construct_metadata( $post_obj );

		self::assertSame( 'BlogPosting', $structured_data['@type'] );

		// Try to change the post type to a non-supported value - Not_Supported.
		add_filter(
			'wp_parsely_post_type',
			function() {
				return 'Not_Supported_Type';
			}
		);

		$this->expectWarning();
		$this->expectWarningMessage( '@type Not_Supported_Type is not supported by Parse.ly. Please use a type mentioned in https://www.parse.ly/help/integration/jsonld#distinguishing-between-posts-and-pages' );
		$metadata->construct_metadata( $post_obj );
	}

	/**
	 * Verifies that api_key_is_set() and api_key_is_missing() work as expected.
	 *
	 * @since 2.6.0
	 *
	 * @covers \Parsely\Parsely::api_key_is_set
	 * @covers \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_checking_API_key_is_set_or_not(): void {
		self::set_options( array( 'apikey' => '' ) );
		self::assertFalse( self::$parsely->api_key_is_set() );
		self::assertTrue( self::$parsely->api_key_is_missing() );

		self::set_options( array( 'apikey' => 'somekey' ) );
		self::assertTrue( self::$parsely->api_key_is_set() );
		self::assertFalse( self::$parsely->api_key_is_missing() );
	}

	/**
	 * Verifies that get_api_key() works as expected.
	 *
	 * @since 2.6.0
	 *
	 * @covers \Parsely\Parsely::get_api_key
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_can_retrieve_API_key(): void {
		self::set_options( array( 'apikey' => 'somekey' ) );
		self::assertSame( 'somekey', self::$parsely->get_api_key() );
		self::set_options( array( 'apikey' => '' ) );
		self::assertSame( '', self::$parsely->get_api_key() );
	}

	/**
	 * Verifies that get_options() can handle a corrupted (non-array) value in
	 * the database.
	 *
	 * @since 3.0.0
	 *
	 * @covers \Parsely\Parsely::get_options
	 */
	public function test_corrupted_options(): void {
		update_option( Parsely::OPTIONS_KEY, 'someinvalidvalue' );

		$options = self::$parsely->get_options();
		self::assertSame( self::EMPTY_DEFAULT_OPTIONS, $options );
	}

	/**
	 * Verifies that posts are not trackable when they are password protected.
	 *
	 * @since 3.0.1
	 *
	 * @covers \Parsely\Parsely::post_has_trackable_status
	 */
	public function test_post_has_trackable_status_password_protected(): void {
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		$post->post_password = 'somepassword';

		$result = Parsely::post_has_trackable_status( $post );
		self::assertFalse( $result );
	}

	/**
	 * Verifies that posts are trackable when they are password protected but
	 * the wp_parsely_skip_post_password_check filter returns true.
	 *
	 * @since 3.0.1
	 *
	 * @covers \Parsely\Parsely::post_has_trackable_status
	 */
	public function test_post_has_trackable_status_password_protected_with_filter(): void {
		add_filter( 'wp_parsely_skip_post_password_check', '__return_true' );

		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		$post->post_password = 'somepassword';

		$result = Parsely::post_has_trackable_status( $post );
		self::assertTrue( $result );
	}

	/**
	 * Verifies that the tracker URL is correctly generated with a set API key.
	 *
	 * @since 3.2.0
	 *
	 * @covers \Parsely\Parsely::get_tracker_url
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_api_key
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_get_tracker_url(): void {
		$expected = 'https://cdn.parsely.com/keys/blog.parsely.com/p.js';
		self::assertEquals( $expected, self::$parsely->get_tracker_url() );
	}

	/**
	 * Verifies that the tracker URL is an empty string when there's no API key
	 * set.
	 *
	 * @since 3.2.0
	 *
	 * @covers \Parsely\Parsely::get_tracker_url
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_get_tracker_no_api_key(): void {
		self::set_options( array( 'apikey' => '' ) );
		$expected = '';
		self::assertEquals( $expected, self::$parsely->get_tracker_url() );
	}
}
