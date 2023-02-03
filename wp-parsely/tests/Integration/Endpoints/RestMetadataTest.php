<?php
/**
 * Integration Tests: REST API Metadata Endpoint
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\Endpoints;

use Parsely\Metadata;
use Parsely\Parsely;
use Parsely\Endpoints\Rest_Metadata;
use Parsely\Tests\Integration\TestCase;


/**
 * Integration Tests for the REST API Metadata Endpoint.
 */
final class RestMetadataTest extends TestCase {
	/**
	 * Internal variable.
	 *
	 * @var Rest_Metadata $rest Holds the Rest object.
	 */
	private static $rest;

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
		self::$rest    = new Rest_Metadata( self::$parsely );
	}

	/**
	 * Verifies that the logic has been enqueued when the `run` method is
	 * called.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::run
	 * @uses \Parsely\Endpoints\Rest_Metadata::register_meta
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_register_enqueued_rest_init(): void {
		global $wp_rest_additional_fields;

		self::set_options( array( 'apikey' => 'testkey' ) );
		self::$rest->run();

		$this->assertParselyRestFieldIsConstructedCorrectly( 'page', $wp_rest_additional_fields );

		// Cleaning up the registered fields.
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
		$wp_rest_additional_fields = array();
	}

	/**
	 * Verifies that the logic has not been enqueued when the `run` method is
	 * called with a filter that disables it.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::run
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 */
	public function test_register_enqueued_rest_init_filter(): void {
		global $wp_rest_additional_fields;

		self::set_options( array( 'apikey' => 'testkey' ) );
		add_filter( 'wp_parsely_enable_rest_api_support', '__return_false' );
		self::$rest->run();

		self::assertEmpty( $wp_rest_additional_fields );
	}

	/**
	 * Verifies that the logic has not been enqueued when the `run` method is
	 * called with no API key.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::run
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_register_enqueued_rest_init_no_api_key(): void {
		global $wp_rest_additional_fields;

		self::$rest->run();

		self::assertEmpty( $wp_rest_additional_fields );
	}

	/**
	 * Verifies that the REST fields are registered to WordPress REST API.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::register_meta
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_register_meta_registers_fields(): void {
		global $wp_rest_additional_fields;

		self::$rest->register_meta();

		$this->assertParselyRestFieldIsConstructedCorrectly( 'page', $wp_rest_additional_fields );

		// Cleaning up the registered fields.
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
		$wp_rest_additional_fields = array();
	}

	/**
	 * Verifies that the REST fields are can be modified using the
	 * `wp_parsely_rest_object_types` filter.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::register_meta
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_register_meta_with_filter(): void {
		global $wp_rest_additional_fields;

		add_filter(
			'wp_parsely_rest_object_types',
			function() {
				return array( 'term' );
			}
		);

		self::$rest->register_meta();

		// Should only be 1, including term. Post and page should be left out by
		// the filter.
		self::assertCount( 1, $wp_rest_additional_fields );

		$this->assertParselyRestFieldIsConstructedCorrectly( 'term', $wp_rest_additional_fields );

		// Cleaning up the registered fields.
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
		$wp_rest_additional_fields = array();
	}

	/**
	 * Verifies that the get_rest_callback method is able to generate the
	 * `parsely` object for the REST API.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::get_callback
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::get_rendered_meta
	 * @uses \Parsely\Metadata::__construct
	 * @uses \Parsely\Metadata::construct_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
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
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_api_key
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::get_tracker_url
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\UI\Metadata_Renderer::__construct
	 * @uses \Parsely\UI\Metadata_Renderer::render_metadata
	 */
	public function test_get_callback(): void {
		self::set_options( array( 'apikey' => 'testkey' ) );
		$post_id = self::factory()->post->create();

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		$meta_object = self::$rest->get_callback( get_post( $post_id, 'ARRAY_A' ) );
		$metadata    = new Metadata( self::$parsely );
		$expected    = array(
			'version'     => '1.1.0',
			'meta'        => $metadata->construct_metadata( get_post( $post_id ) ),
			'rendered'    => self::$rest->get_rendered_meta( 'json_ld' ),
			'tracker_url' => 'https://cdn.parsely.com/keys/testkey/p.js',
		);

		self::assertEquals( $expected, $meta_object );
	}

	/**
	 * Verifies that the get_rest_callback method is able to generate the
	 * `parsely` object for the REST API.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::get_callback
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::get_rendered_meta
	 * @uses \Parsely\Metadata::__construct
	 * @uses \Parsely\Metadata::construct_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
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
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_api_key
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::get_tracker_url
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 */
	public function test_get_callback_with_filter(): void {
		add_filter( 'wp_parsely_enable_rest_rendered_support', '__return_false' );
		self::set_options( array( 'apikey' => 'testkey' ) );
		$post_id = self::factory()->post->create();

		$meta_object = self::$rest->get_callback( get_post( $post_id, 'ARRAY_A' ) );
		$metadata    = new Metadata( self::$parsely );
		$expected    = array(
			'version'     => '1.1.0',
			'meta'        => $metadata->construct_metadata( get_post( $post_id ) ),
			'tracker_url' => 'https://cdn.parsely.com/keys/testkey/p.js',
		);

		self::assertEquals( $expected, $meta_object );
	}

	/**
	 * Verifies that the get_rest_callback method is able to generate the
	 * `parsely` object for the REST API.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::get_callback
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::get_rendered_meta
	 * @uses \Parsely\Metadata::__construct
	 * @uses \Parsely\Metadata::construct_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
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
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\UI\Metadata_Renderer::__construct
	 * @uses \Parsely\UI\Metadata_Renderer::render_metadata
	 */
	public function test_get_callback_with_url_filter(): void {
		add_filter( 'wp_parsely_enable_tracker_url', '__return_false' );
		self::set_options( array( 'apikey' => 'testkey' ) );
		$post_id = self::factory()->post->create();

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		$meta_object = self::$rest->get_callback( get_post( $post_id, 'ARRAY_A' ) );
		$metadata    = new Metadata( self::$parsely );
		$expected    = array(
			'version'  => '1.1.0',
			'meta'     => $metadata->construct_metadata( get_post( $post_id ) ),
			'rendered' => self::$rest->get_rendered_meta( 'json_ld' ),
		);

		self::assertEquals( $expected, $meta_object );
	}

	/**
	 * Verifies that the get_rest_callback method doesn't crash when the post
	 * does not exist.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::get_callback
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::get_rendered_meta
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::get_tracker_url
	 * @uses \Parsely\UI\Metadata_Renderer::__construct
	 * @uses \Parsely\UI\Metadata_Renderer::render_metadata
	 */
	public function test_get_callback_with_non_existent_post(): void {
		$meta_object = self::$rest->get_callback( array() );
		$expected    = array(
			'version'     => '1.1.0',
			'meta'        => '',
			'rendered'    => '',
			'tracker_url' => '',
		);

		self::assertEquals( $expected, $meta_object );
	}

	/**
	 * Verifies that the rendered meta function returns the meta HTML string
	 * with JSON-LD.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::get_callback
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::get_rendered_meta
	 * @uses \Parsely\Metadata::__construct
	 * @uses \Parsely\Metadata::construct_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
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
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\UI\Metadata_Renderer::__construct
	 * @uses \Parsely\UI\Metadata_Renderer::render_metadata
	 */
	public function test_get_rendered_meta_json_ld(): void {
		TestCase::set_options();

		global $post;
		$post_id = self::factory()->post->create(
			array(
				'post_title' => 'My test_get_rendered_meta_json_ld title',
			)
		);

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$post = get_post( $post_id );
		$date = gmdate( 'Y-m-d\TH:i:s\Z', get_post_time( 'U', true, $post ) );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		$meta_string = self::$rest->get_rendered_meta( 'json_ld' );
		$expected    = '<script type="application/ld+json">{"@context":"https:\/\/schema.org","@type":"NewsArticle","headline":"My test_get_rendered_meta_json_ld title","url":"http:\/\/example.org\/?p=' . $post_id . '","mainEntityOfPage":{"@type":"WebPage","@id":"http:\/\/example.org\/?p=' . $post_id . '"},"thumbnailUrl":"","image":{"@type":"ImageObject","url":""},"articleSection":"Uncategorized","author":[],"creator":[],"publisher":{"@type":"Organization","name":"Test Blog","logo":""},"keywords":[],"dateCreated":"' . $date . '","datePublished":"' . $date . '","dateModified":"' . $date . '"}</script>';
		self::assertEquals( $expected, $meta_string );
	}

	/**
	 * Verifies that the rendered meta function returns the meta HTML string
	 * with JSON-LD.
	 *
	 * @covers \Parsely\Endpoints\Rest_Metadata::get_callback
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::__construct
	 * @uses \Parsely\Endpoints\Metadata_Endpoint::get_rendered_meta
	 * @uses \Parsely\Metadata::__construct
	 * @uses \Parsely\Metadata::construct_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
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
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::convert_jsonld_to_parsely_type
	 * @uses \Parsely\UI\Metadata_Renderer::__construct
	 * @uses \Parsely\UI\Metadata_Renderer::render_metadata
	 * @uses \Parsely\UI\Metadata_Renderer::filter_empty_and_not_string_from_array
	 */
	public function test_get_rendered_repeated_metas(): void {
		global $post;

		self::set_options( array( 'apikey' => 'testkey' ) );

		$post_id = self::factory()->post->create(
			array(
				'post_title' => 'My test_get_rendered_repeated_metas title',
			)
		);

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$post = get_post( $post_id );
		$date = gmdate( 'Y-m-d\TH:i:s\Z', get_post_time( 'U', true, $post ) );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		$meta_string = self::$rest->get_rendered_meta( 'repeated_metas' );
		$expected    = '<meta name="parsely-title" content="My test_get_rendered_repeated_metas title" />
<meta name="parsely-link" content="http://example.org/?p=' . $post_id . '" />
<meta name="parsely-type" content="post" />
<meta name="parsely-pub-date" content="' . $date . '" />
<meta name="parsely-section" content="Uncategorized" />';
		self::assertEquals( $expected, $meta_string );
	}

	/**
	 * Asserts that the Parsely REST field is constructed correctly.
	 *
	 * This is a helper function for the tests above.
	 *
	 * @param string $post_type                 Post type.
	 * @param array  $wp_rest_additional_fields Global variable.
	 */
	private function assertParselyRestFieldIsConstructedCorrectly( string $post_type, array $wp_rest_additional_fields ): void {
		self::assertArrayHasKey( $post_type, $wp_rest_additional_fields );
		self::assertArrayHasKey( 'parsely', $wp_rest_additional_fields[ $post_type ] );
		self::assertIsArray( $wp_rest_additional_fields[ $post_type ]['parsely'] );
		self::assertNull( $wp_rest_additional_fields[ $post_type ]['parsely']['update_callback'] );
		self::assertNull( $wp_rest_additional_fields[ $post_type ]['parsely']['schema'] );
	}
}
