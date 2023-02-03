<?php
/**
 * Integration Tests: Metadata Renderer
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\UI;

use Parsely\Parsely;
use Parsely\Tests\Integration\TestCase;
use Parsely\UI\Metadata_Renderer;

/**
 * Integration Tests for the Metadata Renderer.
 *
 * @since 3.4.0
 */
final class MetadataRendererTest extends TestCase {
	/**
	 * Internal variable.
	 *
	 * @var Metadata_Renderer $metadata_renderer Holds the Metadata_Renderer object.
	 */
	private static $metadata_renderer;

	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		self::$metadata_renderer = new Metadata_Renderer( new Parsely() );
	}

	/**
	 * Verifies that the renderer is enqueued on the site's head.
	 *
	 * @since 3.4.0
	 *
	 * @covers \Parsely\UI\Metadata_Renderer::__construct
	 * @covers \Parsely\UI\Metadata_Renderer::run
	 */
	public function test_run_wp_head_action(): void {
		self::$metadata_renderer->run();

		self::assertEquals( 10, has_action( 'wp_head', array( self::$metadata_renderer, 'render_metadata_on_head' ) ) );
	}

	/**
	 * Verifies that the renderer is not enqueued on the site's head when it is
	 * disabled by a filter.
	 *
	 * @since 3.4.0
	 *
	 * @covers \Parsely\UI\Metadata_Renderer::__construct
	 * @covers \Parsely\UI\Metadata_Renderer::run
	 */
	public function test_run_wp_head_action_with_filter(): void {
		add_filter( 'wp_parsely_should_insert_metadata', '__return_false' );

		self::$metadata_renderer->run();

		self::assertFalse( has_action( 'wp_head', array( self::$metadata_renderer, 'render_metadata_on_head' ) ) );
	}

	/**
	 * Verifies that the renderer completes successfully and outputs JSON-LD.
	 *
	 * We're not fully testing the output, since that's not the renderer's
	 * concern.
	 *
	 * @since 3.4.0
	 *
	 * @covers \Parsely\UI\Metadata_Renderer::render_metadata
	 * @uses \Parsely\UI\Metadata_Renderer::__construct
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
	 * @uses \Parsely\Parsely::convert_jsonld_to_parsely_type
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\UI\Metadata_Renderer::filter_empty_and_not_string_from_array
	 */
	public function test_render_metadata_json_ld(): void {
		self::set_options( array( 'apikey' => 'testkey' ) );

		$post_id = self::factory()->post->create();
		$this->go_to( home_url( '/?p=' . $post_id ) );

		ob_start();
		self::$metadata_renderer->render_metadata( 'json_ld' );
		$out = ob_get_clean();

		self::assertStringContainsString( '<script type="application/ld+json">', $out );
		self::assertStringContainsString( '</script>', $out );
	}

	/**
	 * Verifies that the renderer completes successfully and outputs repeated
	 * metas.
	 *
	 * We're not fully testing the output, since that's not the renderer's
	 * concern.
	 *
	 * @since 3.4.0
	 *
	 * @covers \Parsely\UI\Metadata_Renderer::render_metadata
	 * @uses \Parsely\UI\Metadata_Renderer::__construct
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
	 * @uses \Parsely\Parsely::convert_jsonld_to_parsely_type
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\UI\Metadata_Renderer::filter_empty_and_not_string_from_array
	 */
	public function test_render_metadata_repeated_metas(): void {
		self::set_options( array( 'apikey' => 'testkey' ) );

		$post_id = self::factory()->post->create();
		$this->go_to( home_url( '/?p=' . $post_id ) );

		ob_start();
		self::$metadata_renderer->render_metadata( 'repeated_metas' );
		$out = ob_get_clean();

		self::assertStringContainsString( '<meta name="parsely-type" content="post" />', $out );
		self::assertStringContainsString( '<meta name="parsely-section" content="Uncategorized" />', $out );
	}

	/**
	 * Verifies that the renderer completes successfully and outputs repeated
	 * metas when the current post is an integer but not WP_Post object.
	 *
	 * We're not fully testing the output, since that's not the renderer's
	 * concern.
	 *
	 * @since 3.4.0
	 *
	 * @covers \Parsely\UI\Metadata_Renderer::render_metadata
	 * @uses \Parsely\UI\Metadata_Renderer::__construct
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
	 * @uses \Parsely\Parsely::convert_jsonld_to_parsely_type
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\UI\Metadata_Renderer::filter_empty_and_not_string_from_array
	 */
	public function test_render_metadata_int_global_post(): void {
		self::set_options( array( 'apikey' => 'testkey' ) );

		$post_id = self::factory()->post->create();

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		ob_start();
		self::$metadata_renderer->render_metadata( 'repeated_metas' );
		$out = ob_get_clean();

		self::assertStringContainsString( '<meta name="parsely-type" content="post" />', $out );
		self::assertStringContainsString( '<meta name="parsely-section" content="Uncategorized" />', $out );
	}
}
